import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Ticket, ChevronRight, User, Bus, Calendar, Users, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "../components/ui/input";
import PageShell from "../components/PageShell";
import { authService } from "../services/authService";
import AnimatedBusLogo from "../components/AnimatedBusLogo";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

const HomePage = () => {
  const navigate = useNavigate();
  const [startPoint, setStartPoint] = useState("");
  const [destination, setDestination] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [passengerCount, setPassengerCount] = useState("1");
  const [cityName, setCityName] = useState("Bhubaneswar");
  const [showCitySelector, setShowCitySelector] = useState(false);
  const [showWelcomeSplash, setShowWelcomeSplash] = useState(false);
  const [selectedWelcomeCity, setSelectedWelcomeCity] = useState("");

  const majorCities = [
    { state: "Odisha", cities: ["Bhubaneswar", "Cuttack", "Puri", "Sambalpur"] },
    { state: "Maharashtra", cities: ["Mumbai", "Pune", "Nagpur", "Nasik"] },
    { state: "Karnataka", cities: ["Bengaluru", "Mysuru", "Mangaluru", "Hubballi"] },
    { state: "Delhi", cities: ["New Delhi", "Dwarka", "Rohini", "Saket"] },
    { state: "West Bengal", cities: ["Kolkata", "Howrah", "Siliguri", "Durgapur"] },
    { state: "Tamil Nadu", cities: ["Chennai", "Coimbatore", "Madurai", "Salem"] },
    { state: "Telangana", cities: ["Hyderabad", "Warangal", "Nizamabad", "Khammam"] },
    { state: "Gujarat", cities: ["Ahmedabad", "Surat", "Vadodara", "Rajkot"] },
  ];

  const handleSearch = () => {
    navigate("/route-search", { 
      state: { 
        startPoint, 
        destination,
        date: scheduleDate,
        passengers: passengerCount
      } 
    });
  };

  const handleCitySelect = (city: string) => {
    setSelectedWelcomeCity(city);
    setShowCitySelector(false);
    setShowWelcomeSplash(true);
    
    setTimeout(() => {
      setCityName(city);
      setShowWelcomeSplash(false);
    }, 3000);
  };

  return (
    <PageShell>
      {/* App Header */}
      <motion.div variants={fadeUp} initial="initial" animate="animate" className="flex items-center justify-between mb-8 pt-4 px-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-center overflow-hidden">
             <AnimatedBusLogo />
          </div>
          <h1 className="text-xl font-headline font-black tracking-tighter text-primary italic uppercase">
            BusConnect
          </h1>
        </div>
        <button 
          onClick={() => setShowCitySelector(true)}
          className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-4 py-2 rounded-full shadow-sm active:scale-95 transition-transform"
        >
          <MapPin className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-xs font-bold text-on-surface">{cityName}</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </motion.div>

      {/* Advanced Search Card */}
      <motion.div variants={fadeUp} initial="initial" animate="animate" className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-6 shadow-sm mb-8">
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute left-0 top-6 bottom-6 w-0.5 bg-slate-100 dark:bg-slate-800 ml-2" />
            <div className="space-y-6">
              <div className="relative pl-8">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-primary bg-white dark:bg-slate-900 z-10" />
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">From Station</label>
                <Input
                  value={startPoint}
                  onChange={(e) => setStartPoint(e.target.value)}
                  placeholder="Starting point..."
                  className="border-none p-0 h-auto text-lg font-bold placeholder:text-slate-300 bg-transparent focus-visible:ring-0"
                />
              </div>
              <div className="relative pl-8">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary z-10" />
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">To Destination</label>
                <Input
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Where to?"
                  className="border-none p-0 h-auto text-lg font-bold placeholder:text-slate-300 bg-transparent focus-visible:ring-0"
                />
              </div>
            </div>
            <button className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-primary shadow-sm active:scale-90 transition-transform border border-slate-100 dark:border-slate-800">
               <motion.div whileTap={{ rotate: 180 }}><Search className="w-5 h-5 rotate-90" /></motion.div>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="bg-slate-50/50 dark:bg-slate-800/30 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mb-1">
                <Calendar className="w-3 h-3" /> Date
              </label>
              <input 
                type="date" 
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="w-full bg-transparent border-none text-sm font-bold focus:outline-none" 
              />
            </div>
            <div className="bg-slate-50/50 dark:bg-slate-800/30 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mb-1">
                <Users className="w-3 h-3" /> Passengers
              </label>
              <select 
                value={passengerCount}
                onChange={(e) => setPassengerCount(e.target.value)}
                className="w-full bg-transparent border-none text-sm font-bold focus:outline-none"
              >
                {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} {n===1?'Person':'People'}</option>)}
              </select>
            </div>
          </div>

          <button 
            onClick={handleSearch}
            disabled={!destination}
            className="w-full h-14 bg-slate-300 dark:bg-slate-800 rounded-2xl flex items-center justify-center gap-2 text-slate-500 font-headline font-black text-lg transition-all active:scale-[0.98] disabled:opacity-50 mt-2"
          >
            <Search className="w-5 h-5" /> Find My Bus
          </button>
        </div>
      </motion.div>

      {/* Quick Recent Routes */}
      <motion.div variants={fadeUp} initial="initial" animate="animate" className="flex gap-3 mb-10 overflow-x-auto pb-2 scrollbar-none">
        <button onClick={() => navigate("/route-details", { state: { route: { number: "18", destination: "Nandan Vihar" } } })} className="flex-none bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 rounded-2xl flex items-center gap-3 shadow-sm min-w-[140px] active:scale-95 transition-transform">
          <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl">
             <Bus className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-left">
             <p className="font-headline font-bold text-sm leading-none mb-1">18</p>
             <p className="text-[10px] text-slate-400 font-medium">To Nandan Vihar</p>
          </div>
        </button>
        <button onClick={() => navigate("/route-details", { state: { route: { number: "10", destination: "KIIT Square" } } })} className="flex-none bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 rounded-2xl flex items-center gap-3 shadow-sm min-w-[140px] active:scale-95 transition-transform">
          <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl">
             <Bus className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-left">
             <p className="font-headline font-bold text-sm leading-none mb-1">10</p>
             <p className="text-[10px] text-slate-400 font-medium">To KIIT Square</p>
          </div>
        </button>
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
               <h3 className="font-headline font-bold text-base">Jaydev Vihar Square</h3>
             </div>
             <div className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <User className="w-3 h-3 text-slate-400" />
                <span className="text-xs font-bold text-slate-500">1 min away</span>
             </div>
           </div>

           {/* Bus List */}
           <div className="space-y-4">
             {/* Bus 1 */}
             <div className="flex items-center justify-between group cursor-pointer" onClick={() => navigate("/route-details", { state: { route: { number: "18", destination: "Jagatpur" } } })}>
                <div className="flex items-center gap-3">
                  <Bus className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="font-headline font-bold text-base leading-none mb-1">18</p>
                    <p className="text-xs text-slate-400 font-medium">To Jagatpur</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-primary font-bold text-sm flex items-center gap-1">
                     <span className="relative flex h-2 w-2 mr-1">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                     </span>
                     In 8 min
                  </span>
                  <div className="flex text-green-500">
                     <User className="w-3.5 h-3.5" />
                     <User className="w-3.5 h-3.5" />
                     <User className="w-3.5 h-3.5 text-slate-200 dark:text-slate-700" />
                  </div>
                </div>
             </div>

             {/* Bus 2 */}
             <div className="flex items-center justify-between group cursor-pointer border-t border-slate-50 dark:border-slate-800/50 pt-4" onClick={() => navigate("/route-details", { state: { route: { number: "47", destination: "Settlement Office" } } })}>
                <div className="flex items-center gap-3">
                  <Bus className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="font-headline font-bold text-base leading-none mb-1">47</p>
                    <p className="text-xs text-slate-400 font-medium">To Settlement Office</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-primary font-bold text-sm flex items-center gap-1">
                     <span className="relative flex h-2 w-2 mr-1">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                     </span>
                     In 20 min
                  </span>
                  <div className="flex text-orange-500">
                     <User className="w-3.5 h-3.5" />
                     <User className="w-3.5 h-3.5" />
                     <User className="w-3.5 h-3.5" />
                  </div>
                </div>
             </div>
           </div>
        </div>

        <button className="text-sm font-bold text-orange-500 flex items-center gap-1 hover:opacity-80 transition-opacity mt-5 px-1">
          See all buses <ChevronRight className="w-4 h-4" />
        </button>
      </motion.div>
      {/* Welcome Splash Overlay */}
      <AnimatePresence>
        {showWelcomeSplash && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-primary flex flex-col items-center justify-center text-white"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center mb-6 mx-auto backdrop-blur-xl">
                 <Bus className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-headline font-black tracking-tighter mb-2 italic">WELCOME TO</h2>
              <h3 className="text-5xl font-headline font-black tracking-tighter uppercase mb-8">{selectedWelcomeCity}</h3>
              <div className="flex gap-1 justify-center">
                 {[0,1,2].map(i => (
                   <motion.div 
                     key={i}
                     animate={{ opacity: [0.3, 1, 0.3] }}
                     transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                     className="w-2 h-2 bg-white rounded-full"
                   />
                 ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* City Selector Modal */}
      <AnimatePresence>
        {showCitySelector && (
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-white dark:bg-slate-900 flex flex-col"
          >
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-xl font-headline font-black uppercase tracking-tight">Select City</h2>
              <button onClick={() => setShowCitySelector(false)} className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {majorCities.map((group) => (
                <div key={group.state} className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 ">{group.state}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {group.cities.map((city) => (
                      <button 
                        key={city} 
                        onClick={() => handleCitySelect(city)}
                        className={`p-4 rounded-2xl border ${cityName === city ? 'bg-primary/5 border-primary text-primary' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'} text-left font-bold transition-all active:scale-95`}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  );
};

export default HomePage;
