import { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, SlidersHorizontal, MapPin, Clock, Star, Bus, ArrowUpDown, Users, Minus, Plus, X } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import CrowdBadge from "@/components/CrowdBadge";
import { useCrowdPrediction } from "@/hooks/useCrowdPrediction";
import PageShell from "@/components/PageShell";
import { validateStops } from "@/utils/corridorUtils";
import { RouteHistoryManager } from "../utils/RouteHistoryManager";
import { getRoutesForState, UnifiedRoute } from "@/data/stateDatasets";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { authService } from "../services/authService";
import { busService } from "../services/busService";
import { notificationService } from "../services/notificationService";

type BusRoute = {
  id: number;
  route_no: string;
  from_stop: string;
  stop: string;
  to_stop: string;
  distance_km: number;
  price_inr: number;
  crowd: string;
  eta_min: number;
  departure: string;
  arrival: string;
  duration: string;
  status: string;
  bus_number?: string;
};

const mapRoutesToBuses = (routes: UnifiedRoute[], tripType: string): BusRoute[] => {
  return routes.map((r, i) => {
    const from_stop = r.start_stop || 'Unknown';
    const to_stop = r.end_stop || 'Unknown';
    const rawStop = r.stop_1 || 'Unknown';
    const validatedStops = validateStops(from_stop, to_stop, [rawStop]);
    const stop = validatedStops.length > 0 ? validatedStops[0] : rawStop;
    const eta_min = r.eta_min || 60;
    const price_inr = r.price_inr || 100;

    const hash = (from_stop?.charCodeAt(0) || 0) + (to_stop?.charCodeAt(0) || 0) + (r.route_id?.charCodeAt(0) || 0);
    const now = new Date();
    const startOffsetMinutes = hash % 30;
    now.setMinutes(now.getMinutes() + startOffsetMinutes);

    const formatTime = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const departure = formatTime(now);
    const arrivalTime = new Date(now.getTime() + eta_min * 60000);
    const arrival = formatTime(arrivalTime);

    return {
      id: i,
      route_no: r.route_id,
      name: r.route_id,
      from: from_stop,
      to: to_stop,
      from_stop,
      to_stop,
      stop,
      distance_km: r.distance_km,
      price_inr,
      crowd: r.crowd,
      eta_min,
      departure,
      arrival,
      duration: `${eta_min} min`,
      status: hash % 4 === 0 ? "Delayed" : "On time",
    };
  });
};

const BusResultsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialState = location.state || { from: "", to: "" };
  const { predict: predictCrowd } = useCrowdPrediction();

  const [searchFrom, setSearchFrom] = useState(initialState.from || "");
  const [searchTo, setSearchTo] = useState(initialState.to || "");
  const [activeSearch, setActiveSearch] = useState(initialState);
  const [allBuses, setAllBuses] = useState<BusRoute[]>([]);
  const selectedState = initialState.state || localStorage.getItem("selectedState") || "Chandigarh";

  useEffect(() => {
    const load = async () => {
      const data = await getRoutesForState(selectedState, initialState.tripType);
      setAllBuses(mapRoutesToBuses(data, initialState.tripType));
    };
    load();
  }, [initialState.tripType, selectedState]);

  const [passengers, setPassengers] = useState(1);
  const [isPassengerModalOpen, setIsPassengerModalOpen] = useState(false);
  const [selectedBus, setSelectedBus] = useState<BusRoute | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleBookClick = (bus: BusRoute) => {
    const isOutstation = initialState.tripType === "outstation";
    const isLongRoute = bus.distance_km > 35;
    const targetRoute = (isOutstation || isLongRoute) ? "/seat-selection" : "/book-ticket";

    navigate(targetRoute, {
      state: {
        route_id: bus.route_no,
        operator: isOutstation ? "State Transport" : "CTU",
        origin: bus.from_stop,
        destination: bus.to_stop,
        next_stop: bus.stop || bus.to_stop,
        eta: bus.eta_min,
        distance_km: bus.distance_km,
        price: bus.price_inr,
        bus_type: isOutstation ? "Outstation AC" : (isLongRoute ? "Intercity Long-Route" : "Intercity")
      }
    });
  };

  const confirmBooking = async () => {
    setIsDialogOpen(false);
    const currentUser = authService.getCurrentUser();
    if (selectedBus) {
      const newBooking = {
        id: Date.now(),
        from: selectedBus.from_stop,
        to: selectedBus.to_stop,
        time: selectedBus.departure,
        price: selectedBus.price_inr * passengers,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      };
      const existing = JSON.parse(localStorage.getItem("myBookings") || "[]");
      localStorage.setItem("myBookings", JSON.stringify([newBooking, ...existing]));
      if (currentUser) {
        busService.createBooking({
            user_id: currentUser.id,
            bus_id: selectedBus.route_no,
            source_stop_id: selectedBus.from_stop,
            destination_stop_id: selectedBus.to_stop,
            fare: selectedBus.price_inr * passengers
        }).catch(err => console.error("Supabase booking error:", err));
        busService.saveSearchHistory(currentUser.id, selectedBus.from_stop, selectedBus.to_stop, initialState.tripType || 'intercity').catch(err => console.error("Supabase search history error:", err));
      }
    }
    notificationService.showLocalNotification("Booking Confirmed! 🚌", `Your ticket for ${selectedBus?.route_no} has been booked successfully.`);
    navigate("/confirmation", { state: { bus: selectedBus, passengers } });
  };

  const filteredBuses = useMemo(() => {
    const qFrom = (activeSearch.from || "").trim().toLowerCase();
    const qTo = (activeSearch.to || "").trim().toLowerCase();
    if (!qFrom && !qTo) return allBuses.slice(0, 10);
    return allBuses.filter(bus => {
      const busFrom = bus.from_stop.toLowerCase();
      const busTo = bus.to_stop.toLowerCase();
      return ((!qFrom || busFrom.includes(qFrom)) && (!qTo || busTo.includes(qTo))) || ((!qFrom || busTo.includes(qFrom)) && (!qTo || busFrom.includes(qTo)));
    }).slice(0, 50); 
  }, [activeSearch, allBuses]);

  const handleSearch = () => { setActiveSearch({ from: searchFrom, to: searchTo }); };

  return (
    <PageShell>
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center transition-transform active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 text-primary" />
          </button>
          <div className="flex flex-col">
             <h1 className="font-headline font-bold text-xl tracking-tight text-on-surface">{activeSearch.from || 'Select Origin'}</h1>
             <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none">To {activeSearch.to || 'Destination'}</p>
          </div>
        </div>
        <button 
          onClick={() => setIsPassengerModalOpen(true)}
          aria-label="Open filters"
          className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500"
        >
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-[0_12px_40px_rgba(0,0,0,0.06)] border border-slate-100 dark:border-slate-800 p-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center py-1">
            <div className="w-2.5 h-2.5 rounded-full border-2 border-primary" />
            <div className="w-[1px] h-8 border-l border-slate-200 dark:border-slate-700" />
            <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
          </div>
          <div className="flex-1 space-y-3">
             <input
                id="from"
                type="text"
                value={searchFrom}
                onChange={(e) => setSearchFrom(e.target.value)}
                placeholder="From..."
                aria-label="From location"
                className="w-full bg-transparent font-headline font-bold text-base outline-none text-on-surface placeholder:text-slate-300"
              />
              <div className="h-px bg-slate-50 dark:bg-slate-800 w-full" />
              <input
                id="to"
                type="text"
                value={searchTo}
                onChange={(e) => setSearchTo(e.target.value)}
                placeholder="To..."
                aria-label="To location"
                className="w-full bg-transparent font-headline font-bold text-base outline-none text-on-surface placeholder:text-slate-300"
              />
          </div>
          <Button 
            onClick={handleSearch}
            aria-label="Swap departure and destination"
            className="w-12 h-24 rounded-2xl bg-primary text-white p-0 shadow-lg shadow-primary/20"
          >
            <ArrowUpDown className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6 px-2">
        <h3 className="text-on-surface-variant font-black text-[10px] uppercase tracking-[0.2em]">Available Journeys</h3>
        <p className="text-[10px] text-primary font-bold">{filteredBuses.length} Results Found</p>
      </div>

      <div className="space-y-4 pb-20">
        {filteredBuses.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/20 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-700">
            <Bus className="w-16 h-16 mx-auto mb-4 text-slate-200" />
            <p className="font-headline font-bold text-slate-400">No buses available</p>
          </div>
        ) : (
          filteredBuses.map((bus, index) => (
            <motion.div
              key={bus.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-container rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                    <span className="font-headline text-xl font-black">{bus.route_no}</span>
                  </div>
                  <div>
                    <p className="font-headline font-bold text-lg text-on-surface group-hover:text-primary transition-colors">{bus.to_stop}</p>
                    <div className="flex items-center gap-2 mt-1">
                       {(() => {
                        const prediction = predictCrowd(bus.from_stop, bus.to_stop, { distanceKm: bus.distance_km });
                        return <CrowdBadge level={prediction.level} score={prediction.percentage} />;
                      })()}
                      <span className="w-1 h-1 rounded-full bg-slate-200" />
                      <span className="text-[10px] font-bold text-slate-400">{bus.distance_km.toFixed(1)} km</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                   <p className="font-headline text-2xl font-black text-primary leading-none">₹{bus.price_inr}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-8 px-2 relative">
                 <div className="flex flex-col">
                    <p className="text-xl font-headline font-black text-on-surface">{bus.departure}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Depart</p>
                 </div>
                 <div className="flex-1 px-4 flex flex-col items-center">
                    <span className="text-[9px] font-black text-primary bg-primary/5 px-3 py-1 rounded-full mb-3 uppercase tracking-tighter">{bus.duration} Journey</span>
                    <div className="w-full relative flex items-center h-1">
                       <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800 rounded-full" />
                       <div className="absolute left-0 w-2 h-2 rounded-full bg-primary" />
                       <div className="absolute right-0 w-2 h-2 rounded-full bg-primary" />
                    </div>
                 </div>
                 <div className="flex flex-col text-right">
                    <p className="text-xl font-headline font-black text-on-surface">{bus.arrival}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Arrive</p>
                 </div>
              </div>

              <div className="mt-4">
                <Button 
                   className="w-full rounded-2xl bg-primary text-white font-headline font-black text-sm shadow-xl py-6"
                   onClick={() => handleBookClick(bus)}
                >
                   Review & Book Journey
                </Button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to book this ticket?</AlertDialogTitle>
            <AlertDialogDescription>This will confirm your seat on the Route {selectedBus?.route_no}. Total fare is ₹{selectedBus?.price_inr}.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBooking}>Yes, Book it</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isPassengerModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-background/80 backdrop-blur-sm p-4 pb-0">
          <div className="absolute inset-0" onClick={() => setIsPassengerModalOpen(false)} />
          <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} className="relative w-full max-w-md bg-card border-t border-border rounded-t-3xl p-6 pb-8 shadow-2xl z-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2"><Users className="w-5 h-5 text-primary" /> Select Passengers</h2>
              <button onClick={() => setIsPassengerModalOpen(false)} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex items-center justify-between mb-8 bg-secondary/30 p-4 rounded-2xl">
              <div><p className="font-semibold text-base">Passengers</p></div>
              <div className="flex items-center gap-4">
                <button onClick={() => setPassengers(Math.max(1, passengers - 1))} className="w-10 h-10 rounded-full border border-border bg-background flex items-center justify-center text-primary" disabled={passengers <= 1}><Minus className="w-4 h-4" /></button>
                <span className="font-bold text-lg w-4 text-center">{passengers}</span>
                <button onClick={() => setPassengers(Math.min(6, passengers + 1))} className="w-10 h-10 rounded-full border border-border bg-background flex items-center justify-center text-primary" disabled={passengers >= 6}><Plus className="w-4 h-4" /></button>
              </div>
            </div>
            <Button className="w-full h-12 rounded-xl font-bold text-base" onClick={() => setIsPassengerModalOpen(false)}>Confirm Selection</Button>
          </motion.div>
        </div>
      )}
    </PageShell>
  );
};

export default BusResultsPage;
