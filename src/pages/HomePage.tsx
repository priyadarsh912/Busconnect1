import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Ticket, ChevronRight, User, Bus, Calendar, Users, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "../components/ui/input";
import PageShell from "../components/PageShell";
import { authService } from "../services/authService";
import { busService, BusRoute } from "../services/busService";
import AnimatedBusLogo from "../components/AnimatedBusLogo";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

const ALL_CITIES = [
  "Bhubaneswar", "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", 
  "Surat", "Pune", "Jaipur", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", 
  "Visakhapatnam", "Pimpri-Chinchwad", "Patna", "Vadodara", "Ghaziabad", "Ludhiana", "Agra", 
  "Nashik", "Faridabad", "Meerut", "Rajkot", "Kalyan-Dombivli", "Vasai-Virar", "Varanasi", 
  "Srinagar", "Aurangabad", "Dhanbad", "Amritsar", "Navi Mumbai", "Prayagraj", "Howrah", 
  "Ranchi", "Jabalpur", "Gwalior", "Coimbatore", "Vijayawada", "Jodhpur", "Madurai", 
  "Raipur", "Kota", "Guwahati", "Chandigarh", "Solapur", "Hubli-Dharwad", "Mysore", 
  "Tiruchirappalli", "Bareilly", "Aligarh", "Tiruppur", "Gurgaon", "Moradabad", "Jalandhar"
].sort();

const HomePage = () => {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState("Bhubaneswar");
  const [showCitySelector, setShowCitySelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showWelcomeSplash, setShowWelcomeSplash] = useState(false);
  const [pendingCity, setPendingCity] = useState("");
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [loadingRoutes, setLoadingRoutes] = useState(true);
  const [nearestStops, setNearestStops] = useState<any[]>([]);
  const [loadingStops, setLoadingStops] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingRoutes(true);
      setLoadingStops(true);
      try {
        const [routesData, stopsData] = await Promise.all([
          busService.getAllRoutes(selectedCity),
          busService.getStopsByCity(selectedCity)
        ]);
        setRoutes(routesData || []);
        setNearestStops(stopsData || []);
      } catch (err) {
        console.error("Error fetching homepage data:", err);
      } finally {
        setLoadingRoutes(false);
        setLoadingStops(false);
      }
    };
    fetchData();
  }, [selectedCity]);

  const handleSearch = () => {
    navigate("/route-search");
  };

  const filteredCities = searchQuery.length > 0 
    ? ALL_CITIES.filter(city => city.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const handleSelectCity = (city: string) => {
    setPendingCity(city);
    setShowCitySelector(false);
    setShowWelcomeSplash(true);
    
    // Auto transition back to home after splash
    setTimeout(() => {
      setSelectedCity(city);
      localStorage.setItem("selectedState", city);
      setShowWelcomeSplash(false);
      setSearchQuery("");
    }, 2500);
  };

  return (
    <PageShell>
      {/* App Header */}
      <motion.div variants={fadeUp} initial="initial" animate="animate" className="flex items-center justify-between mb-8 pt-4 px-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-center overflow-hidden">
             <AnimatedBusLogo />
          </div>
          <h1 className="text-xl font-headline font-black tracking-tighter text-primary italic uppercase leading-none">
            BusConnect
          </h1>
        </div>
        <div 
          onClick={() => setShowCitySelector(true)}
          className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-4 py-2 rounded-full shadow-sm cursor-pointer active:scale-95 transition-transform"
        >
          <MapPin className="w-3 h-3 text-primary" />
          <span className="text-[11px] font-black text-on-surface tracking-tight">{selectedCity}</span>
        </div>
      </motion.div>

      {/* Simple Search Bar */}
      <motion.div variants={fadeUp} initial="initial" animate="animate" className="relative group mb-8">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-primary-container/10 rounded-[2rem] blur opacity-25" />
        <div className="relative flex items-center h-14 bg-white dark:bg-slate-900 rounded-2xl px-5 shadow-sm border border-slate-50 dark:border-slate-800" onClick={handleSearch}>
          <Search className="w-5 h-5 text-primary" />
          <span className="text-sm font-bold text-slate-400 ml-3">Find your bus routes</span>
        </div>
      </motion.div>

      {/* Quick Recent Routes */}
      <motion.div variants={fadeUp} initial="initial" animate="animate" className="flex gap-3 mb-10 overflow-x-auto pb-2 scrollbar-none">
        {loadingRoutes ? (
          <div className="flex items-center gap-2 px-4">
            <Loader2 className="w-4 h-4 text-slate-300 animate-spin" />
            <span className="text-xs font-bold text-slate-300 italic uppercase tracking-wider">Fetching routes...</span>
          </div>
        ) : routes.length > 0 ? (
          routes.map((route) => (
            <button 
              key={route.id}
              onClick={() => navigate("/route-details", { state: { route } })} 
              className="flex-none bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 rounded-2xl flex items-center gap-3 shadow-sm min-w-[140px] active:scale-95 transition-transform"
            >
              <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl">
                 <Bus className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-left">
                 <p className="font-headline font-bold text-sm leading-none mb-1">{route.route_number}</p>
                 <p className="text-[10px] text-slate-400 font-medium truncate max-w-[80px]">To {route.destination}</p>
              </div>
            </button>
          ))
        ) : (
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest px-4 py-2">No routes available</div>
        )}
      </motion.div>

      {/* Quick Payments */}
      <motion.div variants={fadeUp} initial="initial" animate="animate" className="mb-10">
        <div className="flex items-center justify-center gap-4 mb-4">
           <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quick Payments</span>
           <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
        </div>
        <button onClick={() => navigate("/route-search")} className="w-full bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-5 flex items-center gap-5 shadow-sm active:scale-95 transition-transform group">
          <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Ticket className="w-6 h-6 text-orange-500" />
          </div>
          <div className="text-left">
             <h3 className="font-headline font-black text-lg tracking-tight">Buy mobile ticket</h3>
             <p className="text-xs text-slate-400 font-medium mt-0.5">Pay with wallet, UPI or cards</p>
          </div>
        </button>
      </motion.div>

      {/* Nearest bus stop */}
      <motion.div variants={fadeUp} initial="initial" animate="animate" className="mb-24">
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="font-headline font-black text-xl tracking-tight">Nearest bus stop</h2>
          <button className="text-sm font-bold text-orange-500 flex items-center gap-1 hover:opacity-80 transition-opacity">
            See all stops <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
           {/* Stop Header */}
           <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-700">
                  <MapPin className="w-5 h-5 text-on-surface" />
               </div>
               <h3 className="font-headline font-bold text-base">
                 {loadingStops ? "Locating..." : nearestStops[0]?.name || `Main Square, ${selectedCity}`}
               </h3>
             </div>
             <div className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <User className="w-3 h-3 text-slate-400" />
                <span className="text-xs font-bold text-slate-500">1 min away</span>
             </div>
           </div>

           {/* Bus List */}
           <div className="space-y-4">
             {loadingRoutes ? (
               <div className="py-4 text-center">
                 <Loader2 className="w-6 h-6 text-primary animate-spin mx-auto mb-2" />
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Checking departures...</p>
               </div>
             ) : routes.length > 0 ? (
               routes.slice(0, 2).map((route, i) => (
                 <div 
                   key={route.id} 
                   className={`flex items-center justify-between group cursor-pointer ${i > 0 ? "border-t border-slate-50 dark:border-slate-800/50 pt-4" : ""}`} 
                   onClick={() => navigate("/route-details", { state: { route } })}
                 >
                    <div className="flex items-center gap-3">
                      <Bus className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="font-headline font-bold text-base leading-none mb-1">{route.route_number}</p>
                        <p className="text-xs text-slate-400 font-medium">To {route.destination}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-primary font-bold text-sm flex items-center gap-1">
                         <span className="relative flex h-2 w-2 mr-1">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                         </span>
                         In {8 + (i * 12)} min
                      </span>
                      <div className="flex text-green-500">
                         <User className="w-3.5 h-3.5" />
                         <User className="w-3.5 h-3.5" />
                         <User className="w-3.5 h-3.5 text-slate-200 dark:text-slate-700" />
                      </div>
                    </div>
                 </div>
               ))
             ) : (
               <div className="py-4 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                 No active buses found
               </div>
             )}
           </div>
        </div>

        <button className="text-sm font-bold text-orange-500 flex items-center gap-1 hover:opacity-80 transition-opacity mt-5 px-1">
          See all buses <ChevronRight className="w-4 h-4" />
        </button>
      </motion.div>

      {/* City Selector Overlay */}
      <AnimatePresence>
        {showCitySelector && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] bg-white dark:bg-[#0f1522] flex flex-col"
          >
            <div className="p-5 flex flex-col h-full safe-area-inset-top">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-headline font-black tracking-tighter">Select City</h2>
                <button 
                  onClick={() => setShowCitySelector(false)}
                  className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center active:bg-slate-200 dark:active:bg-slate-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  autoFocus
                  placeholder="Where are you going?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 pl-11 rounded-xl bg-slate-50 dark:bg-slate-900/50 border-none text-sm font-bold placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-primary/20"
                />
              </div>

              <div className="flex-1 overflow-y-auto space-y-1.5 pb-10 scrollbar-none">
                {searchQuery.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-slate-400 opacity-60">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                      <MapPin className="w-6 h-6 opacity-30" />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-widest">Type to search cities</p>
                  </div>
                ) : filteredCities.length > 0 ? (
                  filteredCities.map(city => (
                    <button
                      key={city}
                      onClick={() => handleSelectCity(city)}
                      className="w-full text-left px-5 py-4 rounded-2xl border border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center justify-between group active:scale-[0.98] transition-all"
                    >
                      <span className="font-bold text-[15px] text-slate-700 dark:text-slate-200">{city}</span>
                      <div className="w-6 h-6 rounded-full bg-primary/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight className="w-3.5 h-3.5 text-primary" />
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                    <p className="text-sm font-bold">No cities found matching "{searchQuery}"</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Welcome Splash Screen */}
      <AnimatePresence>
        {showWelcomeSplash && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[3000] bg-primary flex flex-col items-center justify-center text-white p-10 text-center overflow-hidden"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full scale-150 transform -translate-y-10" />
              <div className="relative z-10">
                <div className="w-24 h-24 bg-white/10 rounded-3xl backdrop-blur-xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
                   <AnimatedBusLogo />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.5em] mb-3 opacity-80">Welcome to</h3>
                <h1 className="text-4xl xs:text-5xl font-headline font-black tracking-tighter mb-4 italic leading-none px-4">
                  {pendingCity}
                </h1>
                <div className="h-1 w-12 bg-white/40 rounded-full mx-auto mt-6" />
              </div>
            </motion.div>

            {/* Premium background animation elements */}
            <motion.div 
              animate={{ 
                rotate: [0, 360],
                x: [0, 10, -10, 0],
                y: [0, -10, 10, 0]
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" 
            />
            <motion.div 
              animate={{ 
                rotate: [360, 0],
                x: [0, -15, 15, 0],
                y: [0, 15, -15, 0]
              }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  );
};

export default HomePage;
