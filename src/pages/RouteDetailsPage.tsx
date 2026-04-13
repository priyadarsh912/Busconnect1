import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, MoreVertical, Bus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import PageShell from "../components/PageShell";
import { Button } from "../components/ui/button";

const RouteDetailsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const routeData = location.state?.route || { number: "47", destination: "Settlement Office" };
    
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<L.Map | null>(null);

    const stops = [
        { name: "Baramunda BSABT", active: true },
        { name: "Rajdhani College", active: false },
        { name: "Fire Station Square", active: false },
        { name: "Gopabandhu Nagar", active: false },
        { name: "CRPF Square", active: false },
        { name: "Nayapalli", active: false },
    ];

    useEffect(() => {
        if (!mapRef.current) return;

        // Initialize map
        mapInstance.current = L.map(mapRef.current, {
            center: [20.2961, 85.8245],
            zoom: 13,
            zoomControl: false,
            attributionControl: false
        });

        // Dark-ish tile layer using filter if possible, or just a clean style
        const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 19
        });
        
        tileLayer.addTo(mapInstance.current);

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
            }
        };
    }, []);

    const handleBookTicket = () => {
        navigate("/book-ticket", { 
            state: { 
                route_id: routeData.number,
                origin: "Baramunda BSABT",
                destination: routeData.destination,
                price: 25,
                operator: "Mo Bus"
            } 
        });
    };

    return (
        <PageShell noPadding className="h-screen overflow-hidden">
            {/* Full Screen Map Background */}
            <div className="absolute inset-0 z-0">
                <div ref={mapRef} className="w-full h-full grayscale opacity-60 dark:opacity-40" />
                <div className="absolute inset-0 bg-slate-900/40 pointer-events-none" />
            </div>

            {/* Back Button */}
            <div className="absolute top-6 left-6 z-20">
                <button 
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 rounded-full bg-slate-900/80 backdrop-blur-md flex items-center justify-center text-white shadow-xl"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
            </div>

            {/* Main Content Area - Centered Card */}
            <div className="absolute inset-0 flex items-center justify-center p-6 z-10">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full max-w-sm aspect-[9/16] bg-[#0F172A]/95 dark:bg-slate-950/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/5 flex flex-col overflow-hidden"
                >
                    {/* Card Header */}
                    <div className="p-8 pb-4">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-4xl font-headline font-black italic text-white tracking-tighter">
                                {routeData.number}
                            </h2>
                            <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400">
                                <MoreVertical className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                            TO {routeData.destination}
                        </p>
                    </div>

                    {/* Stops List */}
                    <div className="flex-1 overflow-y-auto px-8 py-4 scrollbar-none">
                        <div className="relative">
                            {/* Connecting Line */}
                            <div className="absolute left-[7px] top-2 bottom-2 w-[1px] bg-white/10" />
                            
                            <div className="space-y-10">
                                {stops.map((stop, i) => (
                                    <div key={stop.name} className="relative pl-8">
                                        <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 ${stop.active ? 'border-primary bg-primary' : 'border-white/20 bg-transparent'} flex items-center justify-center z-10`}>
                                            {stop.active && <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_white]" />}
                                        </div>
                                        
                                        <div className="flex items-center justify-between">
                                            <h3 className={`font-bold text-sm ${stop.active ? 'text-white' : 'text-slate-400'}`}>
                                                {stop.name}
                                            </h3>
                                            {stop.active && (
                                                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-ping" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Floating elements inside card? Or just a footer button */}
                    <div className="p-8 pt-0">
                        {/* Empty space if needed */}
                    </div>
                </motion.div>
            </div>

            {/* Book Ticket Button - Floating Bottom Right (or as per design img) */}
            <div className="absolute top-[45%] right-4 sm:right-10 z-30 translate-y-[-50%]">
                 <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleBookTicket}
                    className="bg-primary hover:bg-primary/90 text-white px-8 h-12 rounded-full font-black text-sm shadow-2xl shadow-primary/40 flex items-center gap-2 whitespace-nowrap"
                 >
                    Book Ticket
                 </motion.button>
            </div>
        </PageShell>
    );
};

export default RouteDetailsPage;
