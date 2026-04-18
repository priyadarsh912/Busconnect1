import { supabase } from '../lib/supabase';

export interface UnifiedRoute {
  route_id: string;
  start_stop: string;
  stop_1: string;
  stop_2: string;
  end_stop: string;
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

/**
 * Migration Bridge: Maps Supabase Route data to a unified format
 * to ensure the UI doesn't break during refactoring.
 */
function mapSupabaseToUnifiedRoute(route: any): UnifiedRoute {
  return {
    route_id: route.route_number || route.id?.toString() || 'unknown',
    start_stop: route.origin || 'Unknown',
    stop_1: '', 
    stop_2: '',
    end_stop: route.destination || 'Unknown',
    distance_km: Number(route.distance_km || 0),
    eta_min: Math.round(Number(route.distance_km || 0) * 2) || 30, 
    price_inr: Number(route.price_inr || 10),
    crowd: 'Low', 
    operator: 'BusConnect Express',
    route_type: route.distance_km > 50 ? 'outstation' : 'intercity',
    start_lat: 0,
    start_lon: 0,
    end_lat: 0,
    end_lon: 0,
    highway: 'Main Road'
  };
}

export const getRoutesForState = async (stateName: string, tripType: "intercity" | "outstation" = "outstation"): Promise<UnifiedRoute[]> => {
    try {
        const query = supabase.from('routes').select('*');
        
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

        // For now, return all routes (or filter by city if we add that logic)
        return data.map(mapSupabaseToUnifiedRoute);
    } catch (err) {
        console.error(`Supabase fetch failed:`, err);
        return [];
    }
};
