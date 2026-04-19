import { supabase } from '../lib/supabase';
import { calculateOdishaFare, isOdishaRegion } from '../utils/fareUtils';

export interface BusRoute {
  id: string;
  route_number: string;
  origin: string;
  destination: string;
  distance_km: number;
  price_inr: number;
  stops?: { name: string; sequence: number }[];
}

export interface BusStop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  city_id?: string;
}

export const busService = {
  /**
   * Search for routes between two points
   */
  async searchRoutes(origin: string, destination: string): Promise<BusRoute[]> {
    // 1. Find routes that contain the origin stop
    const { data: routeIdsWithOrigin } = await supabase
      .from('route_stops')
      .select('route_id, stop_sequence, stops!inner(name)')
      .ilike('stops.name', `%${origin}%`);

    // 2. Find routes that contain the destination stop
    const { data: routeIdsWithDest } = await supabase
      .from('route_stops')
      .select('route_id, stop_sequence, stops!inner(name)')
      .ilike('stops.name', `%${destination}%`);

    if (!routeIdsWithOrigin || !routeIdsWithDest) return [];

    // 3. Find intersection where origin_seq < dest_seq
    const matchingRouteIds = routeIdsWithOrigin.filter(o => {
      const d = routeIdsWithDest.find(dest => dest.route_id === o.route_id);
      return d && o.stop_sequence < d.stop_sequence;
    }).map(r => r.route_id);

    if (matchingRouteIds.length === 0) return [];

    // 4. Fetch the full route details
    const { data, error } = await supabase
      .from('routes')
      .select('*, route_stops(stop_sequence, stops(name))')
      .in('id', matchingRouteIds);

    if (error) throw error;
    
    return (data || []).map(r => ({
      ...r,
      stops: r.route_stops ? r.route_stops.map((rs: any) => ({
        name: rs.stops.name,
        sequence: rs.stop_sequence
      })).sort((a: any, b: any) => a.sequence - b.sequence) : undefined
    })) as BusRoute[];
  },

  /**
   * Get all stops for a specific route in order
   */
  async getStopsForRoute(routeId: string): Promise<BusStop[]> {
    const { data, error } = await supabase
      .from('route_stops')
      .select(`
        stop_sequence,
        stops (*)
      `)
      .eq('route_id', routeId)
      .order('stop_sequence', { ascending: true });

    if (error) throw error;
    
    // Type checking and mapping to ensure BusStop interface consistency
    return (data || []).map(item => {
      const s = item.stops as any;
      return {
        id: s.id,
        name: s.name,
        latitude: s.latitude,
        longitude: s.longitude,
        city_id: s.city_id,
        stop_sequence: item.stop_sequence
      };
    });
  },


  /**
   * Calculate fare dynamically based on distance and AC status
   */
  calculateFare(distance: number, isAC: boolean = false): number {
    // Mo Bus (Bhubaneswar) style tiered pricing
    if (isAC) {
      if (distance <= 2) return 20;
      if (distance <= 4) return 30;
      if (distance <= 6) return 40;
      if (distance <= 8) return 50;
      return 50 + Math.ceil((distance - 8) / 2) * 5; 
    } else {
      if (distance <= 2) return 5;
      if (distance <= 4) return 10;
      if (distance <= 6) return 15;
      if (distance <= 8) return 20;
      return 20 + Math.ceil((distance - 8) / 2) * 5;
    }
  },

  async getRouteFare(routeId: string, distanceKm: number): Promise<number> {
    const { data: route, error } = await supabase
      .from('routes')
      .select('price_inr, origin, destination, route_number, route_type')
      .eq('id', routeId)
      .single();

    if (error || !route) return 10;
    
    // Check if it's an AC bus
    const isAC = (route.route_number || '').startsWith('A') || 
                 (route.route_type || '').toLowerCase().includes('ac');
    
    return this.calculateFare(distanceKm, isAC);
  },

  /**
   * Create a new booking
   */
  async createBooking(bookingData: {
    user_id: string;
    bus_id: string;
    source_stop_id: string;
    destination_stop_id: string;
    fare: number;
  }) {
    const { data, error } = await supabase
      .from('bookings')
      .insert([bookingData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Fetch available buses for a route with live location
   */
  async getAvailableBuses(routeId: string) {
    const { data, error } = await supabase
      .from('buses')
      .select('*')
      .eq('route_id', routeId);

    if (error) throw error;
    return data;
  },

  /**
   * Sync or create user profile
   */
  async syncUser(uid: string, profile: { name: string; email?: string | null; phone?: string | null; role?: string }) {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: uid,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        role: profile.role || 'customer'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get user profile
   */
  async getUserProfile(uid: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .single();

    if (error) return null;
    return data;
  },

  /**
   * Save search to history
   */
  async saveSearchHistory(userId: string, from: string, to: string, tripType: string = 'intercity') {
    const { error } = await supabase
      .from('search_history')
      .insert([{ user_id: userId, "from": from, "to": to, trip_type: tripType }]);

    if (error) console.error("Search history save error:", error);
  },

  /**
   * Get all bookings for a user
   */
  async getUserBookings(userId: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        routes (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Update pricing (Admin logic)
   */
  async updateRoutePrice(routeId: string, price: number) {
    const { error } = await supabase
      .from('routes')
      .update({ price_inr: price, updated_at: new Date() })
      .eq('id', routeId);

    if (error) throw error;
  },

  /**
   * Get search history for a user
   */
  async getSearchHistory(userId: string) {
    const { data, error } = await supabase
      .from('search_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get all bookings (Admin)
   */
  async getAllBookings() {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get all users (Admin)
   */
  async getAllUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get all routes (Admin/General)
   */
  async getAllRoutes(cityName?: string): Promise<BusRoute[]> {
    let query = supabase.from('routes').select('*, route_stops(stop_sequence, stops(name, city_id))');
    
    if (cityName) {
      // Handle Bhubaneswar specifically and Broad matches
      const searchTerms = [cityName];
      if (cityName.toLowerCase() === 'bhubaneswar') {
        searchTerms.push('bbsr');
        searchTerms.push('odisha');
      }
      
      const orFilter = searchTerms.map(t => `origin.ilike.%${t}%,destination.ilike.%${t}%`).join(',');
      query = query.or(orFilter);
    }

    const { data, error } = await query;

    if (error) throw error;
    
    // If we didn't get enough routes by origin/destination name, 
    // try fetching routes that have stops in this city
    let finalData = data || [];
    if (cityName && finalData.length < 5) {
      const { data: routesByStops } = await supabase
        .from('route_stops')
        .select('route_id, stops!inner(name, city_id)')
        .ilike('stops.name', `%${cityName}%`);
      
      if (routesByStops && routesByStops.length > 0) {
         const additionalRouteIds = routesByStops.map(rs => rs.route_id);
         const { data: moreRoutes } = await supabase
           .from('routes')
           .select('*, route_stops(stop_sequence, stops(name, city_id))')
           .in('id', additionalRouteIds);
         
         if (moreRoutes) {
            // Merge and avoid duplicates
            const existingIds = new Set(finalData.map(r => r.id));
            moreRoutes.forEach(r => {
              if (!existingIds.has(r.id)) finalData.push(r);
            });
         }
      }
    }

    return finalData.map(r => ({
      ...r,
      stops: r.route_stops ? r.route_stops.map((rs: any) => ({
        name: rs.stops.name,
        sequence: rs.stop_sequence
      })).sort((a: any, b: any) => a.sequence - b.sequence) : undefined
    })) as BusRoute[];
  },

  /**
   * Get all stops (Admin/General)
   */
  async getAllStops(): Promise<BusStop[]> {
    const { data, error } = await supabase
      .from('stops')
      .select('*');

    if (error) throw error;
    return data as any[];
  },

  /**
   * Get route details by its number
   */
  async getRouteByNumber(routeNumber: string): Promise<BusRoute | null> {
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .eq('route_number', routeNumber)
      .single();

    if (error) return null;
    return data as BusRoute;
  },

  /**
   * Get stops within a specific city
   */
  async getStopsByCity(cityName: string): Promise<BusStop[]> {
    const { data, error } = await supabase
      .from('stops')
      .select('*')
      .ilike('name', `%${cityName}%`);
    
    // If no direct name match, try fetching all and returning a generic set for now
    // In a real DB, we would have a city_id relationship
    if (error) throw error;
    if (data && data.length > 0) return data as BusStop[];

    // Fallback: Get some random stops if city name doesn't match stop names
    const { data: allStops } = await supabase.from('stops').select('*').limit(5);
    return (allStops || []) as BusStop[];
  }
};
