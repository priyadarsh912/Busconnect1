import csv
import json
import requests
import math
import re
import os
import time
from datetime import datetime

# Supabase Config
SUPABASE_URL = "https://tsjbfuretxybgndkzihf.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzamJmdXJldHh5YmduZGt6aWhmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjkwNDY4OSwiZXhwIjoyMDg4NDgwNjg5fQ.gq3RTY-WRshmLvbxsO6wMpVSGRdZBzrJLw5AD_VJGB8"

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

CSV_PATH = r'c:\Users\spriy\Downloads\busconnect-main\bhubaneswar routes.csv'

def mercator_to_latlon(x, y):
    lon = x * 180.0 / 20037508.34
    lat = math.atan(math.exp(y * math.pi / 20037508.34)) * 360.0 / math.pi - 90.0
    return lat, lon

def normalize(name):
    if not name: return ""
    n = name.lower()
    n = n.replace("rly. stn.", "railway station")
    n = n.replace("stn.", "station")
    n = n.replace("sq.", "square")
    n = n.replace("isbt", "bsabt")
    for word in ["square", "chowk", "chhak", "chhaka", "stop", "bus stop", "station", "junction", "village", "bqs"]:
        n = n.replace(word, " ").strip()
    n = re.sub(r'\(.*?\)', '', n)
    n = re.sub(r'\d+', '', n)
    return "".join(e for e in n if e.isalnum())

def get_arcgis_stops():
    print("Fetching stop coordinates from ArcGIS...")
    url = "https://urban.bhubaneswarone.in/server/rest/services/Public_Works/BusRouteNetwork/MapServer/12/query?where=1%3D1&outFields=name&f=json&resultRecordCount=2000"
    try:
        r = requests.get(url, timeout=10)
        data = r.json()
        stop_map = {}
        for feature in data.get('features', []):
            attrs = feature.get('attributes', {})
            geom = feature.get('geometry', {})
            name = attrs.get('name')
            if name and 'x' in geom and 'y' in geom:
                lat, lon = mercator_to_latlon(geom['x'], geom['y'])
                norm_name = normalize(name)
                if norm_name:
                    stop_map[norm_name] = (lat, lon)
        return stop_map
    except:
        return {}

def main():
    start_time = time.time()
    print("Starting Optimized BBSR Route Import (Paginated)...")
    
    # 1. Get City ID
    city_name = "Bhubaneswar"
    r = requests.get(f"{SUPABASE_URL}/rest/v1/cities?name=eq.{city_name}", headers=HEADERS)
    cities = r.json()
    if not cities:
        r = requests.post(f"{SUPABASE_URL}/rest/v1/cities", headers=HEADERS, json={"name": city_name, "state": "Odisha"})
        city_id = r.json()[0]['id']
    else:
        city_id = cities[0]['id']
    print(f"City ID: {city_id}")

    # 2. Get Coords
    arcgis_stops = get_arcgis_stops()
    stop_coords = {
        normalize("Bhubaneswar Railway Station"): (20.2669, 85.8400),
        normalize("Master Canteen"): (20.2669, 85.8400),
        normalize("Baramunda BSABT"): (20.279, 85.787),
        normalize("Nandankanan"): (20.393, 85.826),
        normalize("Link Road"): (20.448, 85.874),
        normalize("Badambadi"): (20.457, 85.875),
    }
    stop_coords.update(arcgis_stops)

    # 3. Read CSV
    print("Reading CSV...")
    routes_batch = {} 
    unique_stops_in_csv = set()

    with open(CSV_PATH, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            rn = row['route_number']
            if not rn: continue
            if rn not in routes_batch:
                routes_batch[rn] = {
                    "origin": row['origin'],
                    "destination": row['destination'],
                    "stops": []
                }
            routes_batch[rn]["stops"].append({
                "name": row['stop_name'],
                "seq": int(row['stop_sequence'])
            })
            unique_stops_in_csv.add(row['stop_name'])

    print(f"Routes: {len(routes_batch)}, Stops: {len(unique_stops_in_csv)}")

    # 4. Batch Upsert Stops
    print("Upserting stops...")
    all_stops_data = []
    for stop_name in unique_stops_in_csv:
        norm = normalize(stop_name)
        lat, lon = stop_coords.get(norm, (20.2961, 85.8245))
        all_stops_data.append({"name": stop_name, "latitude": lat, "longitude": lon, "city_id": city_id})

    for i in range(0, len(all_stops_data), 500):
        chunk = all_stops_data[i:i+500]
        r = requests.post(f"{SUPABASE_URL}/rest/v1/stops?on_conflict=name,city_id", headers=HEADERS, json=chunk)

    # Refresh ALL stops mapping using pagination
    stop_name_to_id = {}
    print("Fetching stop IDs...")
    for page in [0, 1, 2]: # Get up to 3000 stops
        fetch_headers = HEADERS.copy()
        fetch_headers["Range"] = f"{page*1000}-{(page+1)*1000 - 1}"
        r = requests.get(f"{SUPABASE_URL}/rest/v1/stops?city_id=eq.{city_id}", headers=fetch_headers)
        data = r.json()
        if not data: break
        for s in data:
            stop_name_to_id[s['name']] = s['id']
    print(f"Stop IDs synced: {len(stop_name_to_id)}")

    # 5. Batch Upsert Routes
    print("Upserting routes...")
    all_routes_data = [
        {"route_number": rn, "origin": d['origin'], "destination": d['destination'], "distance_km": 20.0, "price_inr": 10.0}
        for rn, d in routes_batch.items()
    ]
    requests.post(f"{SUPABASE_URL}/rest/v1/routes?on_conflict=route_number", headers=HEADERS, json=all_routes_data)
    
    r = requests.get(f"{SUPABASE_URL}/rest/v1/routes", headers=HEADERS)
    route_no_to_id = {rt['route_number']: rt['id'] for rt in r.json()}

    # 6. Batch Upsert RouteStops
    print("Upserting sequences...")
    all_rs_data = []
    for rn, data in routes_batch.items():
        rid = route_no_to_id.get(rn)
        if not rid: continue
        for s in data['stops']:
            sid = stop_name_to_id.get(s['name'])
            if sid:
                all_rs_data.append({"route_id": rid, "stop_id": sid, "stop_sequence": s['seq']})

    for i in range(0, len(all_rs_data), 1000):
        chunk = all_rs_data[i:i+1000]
        requests.post(f"{SUPABASE_URL}/rest/v1/route_stops?on_conflict=route_id,stop_sequence", headers=HEADERS, json=chunk)

    duration = time.time() - start_time
    print(f"Done in {duration:.2f}s!")

if __name__ == "__main__":
    main()
