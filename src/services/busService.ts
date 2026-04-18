import { supabase } from '../lib/supabase';

export interface BusRoute {
  id: string;
  route_number: string;
  origin: string;
  destination: string;
  distance_km: number;
  price_inr: number;
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
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .ilike('origin', `%${origin}%`)
      .ilike('destination', `%${destination}%`);

    if (error) throw error;
    return data as BusRoute[];
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
   * Calculate fare dynamically based on latest pricing from DB
   */
  async calculateFare(routeId: string, distanceKm: number): Promise<number> {
    const { data: route, error } = await supabase
      .from('routes')
      .select('price_inr')
      .eq('id', routeId)
      .single();

    if (error || !route) return 10; // Fallback base fare
    return Number(route.price_inr);
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
    let query = supabase.from('routes').select('*');
    
    if (cityName) {
      // Filter routes where origin or destination includes the city name
      query = query.or(`origin.ilike.%${cityName}%,destination.ilike.%${cityName}%`);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as BusRoute[];
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
