import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, MapPin, Bus, MoreVertical } from "lucide-react";
import { motion } from "framer-motion";
import PageShell from "../components/PageShell";
import { Button } from "../components/ui/button";

const RouteDetailsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const routeData = location.state?.route || { number: "18", destination: "Jagatpur" };

  const stops = [
    { name: "Baramunda BSABT", active: true },
    { name: "Rajdhani College", active: false },
    { name: "Fire Station Square", active: false },
    { name: "Gopabandhu Nagar", active: false },
    { name: "CRPF Square", active: false },
    { name: "Nayapalli", active: false },
  ];

  return (
    <PageShell>
      <div className="fixed inset-0 z-0 h-[45vh] bg-slate-200">
        {/* Placeholder for real map */}
        <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <div className="relative w-full h-full">
                <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1000" className="w-full h-full object-cover opacity-50 grayscale" alt="Map Placeholder" />
                <div className="absolute inset-0 bg-primary/10" />
            </div>
        </div>
        
        {/* Header Controls */}
        <div className="absolute top-10 left-6 right-6 flex items-center justify-between z-10">
            <button 
                onClick={() => navigate(-1)}
                className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 shadow-xl flex items-center justify-center"
            >
                <ArrowLeft className="w-5 h-5 text-on-surface" />
            </button>
        </div>

        {/* Floating Ticket Button */}
        <div className="absolute bottom-6 right-6 z-10">
            <Button 
                onClick={() => navigate("/book-ticket")}
                className="h-12 px-8 rounded-full bg-orange-500 hover:bg-orange-600 shadow-2xl shadow-orange-500/30 text-white font-bold text-base"
            >
                Pay for ticket
            </Button>
        </div>
      </div>

      <div className="relative mt-[40vh] bg-white dark:bg-slate-900 rounded-t-[3rem] shadow-2xl min-h-[60vh] pb-24 border-t border-slate-100 dark:border-slate-800">
        <div className="p-8 pb-4">
            <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-headline font-black tracking-tighter italic">{routeData.number}</h1>
                <button className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                    <MoreVertical className="w-4 h-4 text-slate-400" />
                </button>
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">To {routeData.destination}</p>
        </div>

        <div className="px-8 mt-6">
            <div className="relative">
                {/* Connecting Line */}
                <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-slate-100 dark:bg-slate-800" />
                
                <div className="space-y-10">
                    {stops.map((stop, i) => (
                        <div key={stop.name} className="relative pl-10">
                            <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 ${stop.active ? 'border-primary bg-white dark:bg-slate-900' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900'} flex items-center justify-center z-10`}>
                                <div className={`w-2 h-2 rounded-full ${stop.active ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`} />
                            </div>
                            
                            {/* If active, show small bus icon nearby */}
                            {stop.active && i === 4 && (
                                <motion.div 
                                    animate={{ y: [0, -3, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    className="absolute -left-2 top-0 bg-primary w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900"
                                >
                                    <Bus className="w-5 h-5 text-white" />
                                </motion.div>
                            )}
                            
                            <h3 className={`font-headline font-bold text-base ${stop.active ? 'text-on-surface' : 'text-slate-400'}`}>
                                {stop.name}
                            </h3>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </PageShell>
  );
};

export default RouteDetailsPage;
