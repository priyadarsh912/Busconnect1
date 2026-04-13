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
  const handleSearch = () => {
    navigate("/route-search");
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
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-4 py-2 rounded-full shadow-sm">
          <MapPin className="w-3 h-3 text-slate-500" />
          <span className="text-[11px] font-bold text-on-surface">Bhubaneswar</span>
        </div>
      </motion.div>

      {/* Simple Search Bar */}
      <motion.div variants={fadeUp} initial="initial" animate="animate" className="relative group mb-8">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-primary-container/10 rounded-[2rem] blur opacity-25" />
        <div className="relative flex items-center h-14 bg-white dark:bg-slate-900 rounded-2xl px-5 shadow-sm border border-slate-50 dark:border-slate-800" onClick={handleSearch}>
          <Search className="w-5 h-5 text-primary" />
          <span className="text-sm font-bold text-slate-400 ml-3">Find and track your bus</span>
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
    </PageShell>
  );
};

export default HomePage;
