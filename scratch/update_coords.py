import requests
import json
import time

SUPABASE_URL = "https://tsjbfuretxybgndkzihf.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzamJmdXJldHh5YmduZGt6aWhmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjkwNDY4OSwiZXhwIjoyMDg4NDgwNjg5fQ.gq3RTY-WRshmLvbxsO6wMpVSGRdZBzrJLw5AD_VJGB8"

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

# Major coordinates for Bhubaneswar for jittering/reference
BBSR_CENTER = (20.2961, 85.8245)
MAJOR_COORDS = {
    "Railway Station": (20.2669, 85.8400),
    "Master Canteen": (20.2669, 85.8430),
    "Baramunda": (20.279, 85.787),
    "Patia": (20.3588, 85.8333),
    "Nandankanan": (20.393, 85.826),
    "Airport": (20.252, 85.817),
    "Vani Vihar": (20.292, 85.843),
    "Acharya Vihar": (20.301, 85.836),
    "Jayadev Vihar": (20.304, 85.827),
    "Unit 9": (20.288, 85.835),
    "Saheed Nagar": (20.287, 85.845),
    "Kalpana": (20.259, 85.841),
    "Raj Mahal": (20.263, 85.839),
    "AG Square": (20.270, 85.837),
    "Governor House": (20.279, 85.823),
    "KIIT": (20.352, 85.818),
    "Infocity": (20.358, 85.812),
    "Cuttack Road": (20.278, 85.858),
    "Samantarapur": (20.237, 85.845),
    "Lingaraj Temple": (20.238, 85.833),
}

def get_stops():
    r = requests.get(f"{SUPABASE_URL}/rest/v1/stops?select=id,name", headers=HEADERS)
    return r.json()

def find_best_coords(name):
    for key, coords in MAJOR_COORDS.items():
        if key.lower() in name.lower():
            return coords
    return None

def main():
    print("Updating stop coordinates...")
    stops = get_stops()
    updated_count = 0
    
    for stop in stops:
        coords = find_best_coords(stop['name'])
        if coords:
            # Add a slight jitter so they don't overlap exactly
            import random
            lat = coords[0] + random.uniform(-0.005, 0.005)
            lon = coords[1] + random.uniform(-0.005, 0.005)
            
            update_data = {"latitude": lat, "longitude": lon}
            r = requests.patch(f"{SUPABASE_URL}/rest/v1/stops?id=eq.{stop['id']}", headers=HEADERS, json=update_data)
            if r.status_code in [200, 204]:
                updated_count += 1
        else:
            # Generic Bhubaneswar jitter
            import random
            lat = BBSR_CENTER[0] + random.uniform(-0.04, 0.04)
            lon = BBSR_CENTER[1] + random.uniform(-0.04, 0.04)
            update_data = {"latitude": lat, "longitude": lon}
            requests.patch(f"{SUPABASE_URL}/rest/v1/stops?id=eq.{stop['id']}", headers=HEADERS, json=update_data)
            updated_count += 1

    print(f"Updated {updated_count} stops.")

if __name__ == "__main__":
    main()
