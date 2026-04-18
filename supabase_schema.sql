-- ─────────────────────────────────────────────────
-- BUSCONNECT — SUPABASE DATABASE SCHEMA
-- ─────────────────────────────────────────────────
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- ─────────────────────────────────────────────────

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT,
    phone TEXT,
    role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'driver', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    travel_date DATE NOT NULL,
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    price DECIMAL(10, 2),
    passengers INTEGER DEFAULT 1,
    departure_time TEXT,
    seat_numbers TEXT[], -- Array of strings
    user_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. SEARCH HISTORY
CREATE TABLE IF NOT EXISTS public.search_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    trip_type TEXT DEFAULT 'intercity',
    searched_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. USER ROUTES (Frequent Routes)
CREATE TABLE IF NOT EXISTS public.user_routes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    source TEXT NOT NULL,
    destination TEXT NOT NULL,
    frequency INTEGER DEFAULT 1,
    last_used TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, source, destination)
);

-- 5. BUS LOCATIONS
CREATE TABLE IF NOT EXISTS public.bus_locations (
    bus_id TEXT PRIMARY KEY, -- Bus ID is usually a string (e.g. Plate Number)
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    speed DOUBLE PRECISION DEFAULT 0.0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. CITIES
CREATE TABLE IF NOT EXISTS public.cities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    state TEXT DEFAULT 'Odisha',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 7. STOPS
CREATE TABLE IF NOT EXISTS public.stops (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    city_id UUID REFERENCES public.cities(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(name, city_id)
);

-- 8. ROUTES
CREATE TABLE IF NOT EXISTS public.routes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    route_number TEXT UNIQUE NOT NULL,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    distance_km DECIMAL(10, 2) DEFAULT 0.0,
    price_inr DECIMAL(10, 2) DEFAULT 10.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 9. ROUTE STOPS (Junction table with sequence)
CREATE TABLE IF NOT EXISTS public.route_stops (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    route_id UUID REFERENCES public.routes(id) ON DELETE CASCADE,
    stop_id UUID REFERENCES public.stops(id) ON DELETE CASCADE,
    stop_sequence INTEGER NOT NULL,
    UNIQUE(route_id, stop_sequence)
);

-- Row Level Security for new tables
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_stops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view cities" ON public.cities FOR SELECT USING (true);
CREATE POLICY "Anyone can view stops" ON public.stops FOR SELECT USING (true);
CREATE POLICY "Anyone can view routes" ON public.routes FOR SELECT USING (true);
CREATE POLICY "Anyone can view route_stops" ON public.route_stops FOR SELECT USING (true);

