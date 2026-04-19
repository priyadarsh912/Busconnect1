import { supabase } from '../lib/supabase';

export interface UnifiedRoute {
  route_id: string;
  start_stop: string;
  end_stop: string;
  stops?: { name: string; sequence: number }[];
  distance_km: number;
  eta_min: number;
  price_inr: number;
  crowd: string;
  operator: string;
  route_type: string;
  start_lat: number;
  start_lon: number;
  end_lat: number;
  end_lon: number;
  highway: string;
}

import { calculateOdishaFare, isOdishaRegion } from '../utils/fareUtils';

/**
 * Migration Bridge: Maps Supabase Route data to a unified format
 * to ensure the UI doesn't break during refactoring.
 */
function mapSupabaseToUnifiedRoute(route: any): UnifiedRoute {
  const distance = Number(route.distance_km || 0);
  const isOdisha = isOdishaRegion(route.origin || '') || isOdishaRegion(route.destination || '');
  
  // Heuristic for AC: route_number starting with 'A' or explicit mention in route type
  const isAC = (route.route_number || '').startsWith('A') || 
               (route.route_type || '').toLowerCase().includes('ac') ||
               (route.service_type || '').toLowerCase().includes('ac');
  
  let price_inr = Number(route.price_inr || 10);
  
  if (isOdisha && distance > 0) {
    price_inr = calculateOdishaFare(distance, isAC);
  }

  // Extract stops if joined in query
  const stops = route.route_stops ? route.route_stops.map((rs: any) => ({
    name: rs.stops.name,
    sequence: rs.stop_sequence
  })).sort((a: any, b: any) => a.sequence - b.sequence) : [];

  return {
    route_id: route.route_number || route.id?.toString() || 'unknown',
    start_stop: route.origin || 'Unknown',
    end_stop: route.destination || 'Unknown',
    stops: stops.length > 0 ? stops : undefined,
    distance_km: distance,
    eta_min: Math.round(distance * 2) || 30, 
    price_inr: price_inr,
    crowd: 'Low', 
    operator: isOdisha ? 'CRUT (Mo Bus)' : 'BusConnect Express',
    route_type: distance > 50 ? 'outstation' : 'intercity',
    start_lat: 0,
    start_lon: 0,
    end_lat: 0,
    end_lon: 0,
    highway: 'Main Road'
  };
}

export const getRoutesForState = async (stateName: string, tripType: "intercity" | "outstation" = "outstation"): Promise<UnifiedRoute[]> => {
    try {
        const query = supabase.from('routes').select('*, route_stops(stop_sequence, stops(name))');
        
        if (stateName) {
            query.or(`origin.ilike.%${stateName}%,destination.ilike.%${stateName}%`);
        }

        if (tripType === "intercity") {
            query.lte('distance_km', 50);
        } else {
            query.gt('distance_km', 50);
        }

        const { data, error } = await query;

        if (error) throw error;
        if (!data) return [];

        return data.map(mapSupabaseToUnifiedRoute);
    } catch (err) {
        console.error(`Supabase fetch failed:`, err);
        return [];
    }
};
