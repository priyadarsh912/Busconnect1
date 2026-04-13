import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowLeftRight, MapPin, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageShell from "../components/PageShell";
import { Button } from "../components/ui/button";
import { useIntercityRoutes } from "../hooks/useIntercityRoutes";
import { useOutstationRoutes } from "../hooks/useOutstationRoutes";
import { BusRoute } from "../services/busService";

import { RouteHistoryManager } from "../utils/RouteHistoryManager";

const fadeUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
};

const RouteSearchPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const selectedState: string = location.state?.state || localStorage.getItem("selectedState") || "Chandigarh";
    const tripType: "intercity" | "outstation" = location.state?.tripType ?? "intercity";

    // Hooks - Supabase-backed engines
    const intercity = useIntercityRoutes(selectedState);
    const outstation = useOutstationRoutes(selectedState);

    const [allCities, setAllCities] = useState<string[]>([]);
    const [popularRoutes, setPopularRoutes] = useState<BusRoute[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [origin, setOrigin] = useState("");
    const [destination, setDestination] = useState("");
    const [fromSuggestions, setFromSuggestions] = useState<string[]>([]);
    const [toSuggestions, setToSuggestions] = useState<string[]>([]);
    const fromRef = useRef<HTMLInputElement>(null);
    const toRef = useRef<HTMLInputElement>(null);

    // Unified data management
    useEffect(() => {
        const loading = tripType === "intercity" ? intercity.isLoading : outstation.isLoading;
        setIsLoading(loading);

        if (!loading) {
            const routes = tripType === "intercity" ? intercity.routes : outstation.routes;
            const stops = new Set<string>();
            
            routes.forEach(r => {
                // In Supabase schema, source and destination are objects with 'name'
                const src = (r as any).source?.name || (r as any).from_stop;
                const dst = (r as any).destination?.name || (r as any).to_stop;
                if (src) stops.add(src);
                if (dst) stops.add(dst);
            });
            setAllCities(Array.from(stops).sort());

            // Get top 5 unique routes for popular section
            const seen = new Set<string>();
            const popular: BusRoute[] = [];
            for (const r of routes) {
                const src = (r as any).source?.name || (r as any).from_stop;
                const dst = (r as any).destination?.name || (r as any).to_stop;
                const key = `${src}|${dst}`;
                if (seen.has(key)) continue;
                seen.add(key);
                popular.push(r);
                if (popular.length >= 5) break;
            }
            setPopularRoutes(popular);
        }
    }, [tripType, intercity.isLoading, outstation.isLoading, intercity.routes, outstation.routes]);

    const getSuggestions = (input: string): string[] => {
        if (!input.trim()) return [];
        return allCities
            .filter((c) => c.toLowerCase().startsWith(input.toLowerCase()))
            .slice(0, 6);
    };

    const handleFromChange = (val: string) => {
        setOrigin(val);
        setFromSuggestions(getSuggestions(val));
    };

    const handleToChange = (val: string) => {
        setDestination(val);
        setToSuggestions(getSuggestions(val));
    };

    const swap = () => {
        setOrigin(destination);
        setDestination(origin);
        setFromSuggestions([]);
        setToSuggestions([]);
    };

    const handleSearch = () => {
        if (!origin.trim() || !destination.trim()) return;

        // Track interaction
        RouteHistoryManager.trackRoute({
            route_id: `${origin.trim()}-${destination.trim()}`,
            from_stop: origin.trim(),
            to_stop: destination.trim()
        }, tripType);

        if (tripType === "intercity" && selectedState === "Chandigarh") {
            navigate("/connecting-routes", {
                state: { origin: origin.trim(), destination: destination.trim() },
            });
        } else {
            navigate("/routes", {
                state: { state: selectedState, tripType, origin: origin.trim(), destination: destination.trim() },
            });
        }
    };

    const accentColor = tripType === "intercity" ? "#4f46e5" : "#10b981"; // emerald-500
    const tripLabel = tripType === "intercity" ? "Intercity" : "Outstation";
    const accentBg = tripType === "intercity"
        ? "bg-indigo-50 border-indigo-200 dark:bg-indigo-950/30 dark:border-indigo-800"
        : "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800";
    const accentPill = tripType === "intercity"
        ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300";

    const canSearch = origin.trim().length > 0 && destination.trim().length > 0;

    return (
        <PageShell>
            {/* Header */}
            <motion.div variants={fadeUp} className="flex items-center gap-4 mb-8">
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate(-1)}
                    className="w-11 h-11 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center shrink-0"
                >
                    <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                </motion.button>
                <div>
                    <h1 className="text-2xl font-headline font-extrabold tracking-tight">Search Routes</h1>
                    <p className="text-sm text-slate-500 font-medium">
                        {selectedState} &bull; {tripLabel}
                    </p>
                </div>
            </motion.div>

            {/* State + trip type pill */}
            <motion.div variants={fadeUp} className="flex items-center gap-2 mb-8">
                <span className="bg-primary/10 text-primary text-xs font-bold px-4 py-2 rounded-full border border-primary/20 flex items-center gap-2 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    {selectedState}
                </span>
                <span className={`text-xs font-bold px-4 py-2 rounded-full shadow-sm ${accentPill}`}>
                    {tripLabel}
                </span>
            </motion.div>

            {/* Search card */}
            <motion.div
                variants={fadeUp}
                className="bg-white dark:bg-slate-800 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.04)] border border-slate-100 dark:border-slate-700 overflow-visible relative p-2"
            >
                <div className="flex items-stretch">
                    {/* Left: Path Connector Logic matching Stitch assets */}
                    <div className="flex flex-col items-center py-6 pl-5 pr-2 w-10 shrink-0">
                        <div className="w-3.5 h-3.5 rounded-full border-[3px] border-primary bg-white shrink-0 shadow-sm" />
                        <div className="flex-1 w-[2px] my-2 bg-gradient-to-b from-primary/30 via-primary/10 to-transparent" />
                        <div className="w-3.5 h-3.5 rounded-full bg-primary shrink-0 shadow-sm shadow-primary/30" />
                    </div>

                    {/* CENTER: Inputs */}
                    <div className="flex-1 flex flex-col min-w-0 pr-4">
                        {/* FROM */}
                        <div className="relative pt-4 pb-3">
                            <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 block mb-1">From Station</span>
                            <input
                                ref={fromRef}
                                type="text"
                                value={origin}
                                onChange={(e) => handleFromChange(e.target.value)}
                                onFocus={() => setFromSuggestions(getSuggestions(origin))}
                                onBlur={() => setTimeout(() => setFromSuggestions([]), 250)}
                                placeholder="Starting point..."
                                className="w-full font-headline font-bold text-lg outline-none bg-transparent border-none placeholder:text-slate-300 text-on-surface"
                            />
                            <AnimatePresence>
                                {fromSuggestions.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="absolute left-0 right-0 top-full z-50 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden mt-2 p-1"
                                    >
                                        {fromSuggestions.map((s) => (
                                            <button
                                                key={s}
                                                type="button"
                                                onPointerDown={(e) => {
                                                    e.preventDefault();
                                                    setOrigin(s);
                                                    setFromSuggestions([]);
                                                    toRef.current?.focus();
                                                }}
                                                className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center gap-3 text-slate-700 dark:text-slate-200"
                                            >
                                                <MapPin className="w-4 h-4 text-primary shrink-0" />
                                                {s}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="border-t border-slate-50 dark:border-slate-700/50" />

                        {/* TO */}
                        <div className="relative pt-3 pb-4">
                            <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 block mb-1">To Destination</span>
                            <input
                                ref={toRef}
                                type="text"
                                value={destination}
                                onChange={(e) => handleToChange(e.target.value)}
                                onFocus={() => setToSuggestions(getSuggestions(destination))}
                                onBlur={() => setTimeout(() => setToSuggestions([]), 250)}
                                placeholder="Where to?"
                                className="w-full font-headline font-bold text-lg outline-none bg-transparent border-none placeholder:text-slate-300 text-on-surface"
                            />
                            <AnimatePresence>
                                {toSuggestions.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="absolute left-0 right-0 top-full z-50 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden mt-2 p-1"
                                    >
                                        {toSuggestions.map((s) => (
                                            <button
                                                key={s}
                                                type="button"
                                                onPointerDown={(e) => {
                                                    e.preventDefault();
                                                    setDestination(s);
                                                    setToSuggestions([]);
                                                }}
                                                className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center gap-3 text-slate-700 dark:text-slate-200"
                                            >
                                                <MapPin className="w-4 h-4 text-primary shrink-0" />
                                                {s}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Swap button */}
                    <div className="flex items-center pr-6 pl-2 shrink-0">
                        <motion.button
                            whileTap={{ scale: 0.85, rotate: 180 }}
                            transition={{ type: "spring", stiffness: 400, damping: 20 }}
                            onClick={swap}
                            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-600 text-primary active:text-primary-container"
                        >
                            <ArrowLeftRight className="w-5 h-5" />
                        </motion.button>
                    </div>
                </div>
            </motion.div>

            {/* Search button */}
            <motion.div variants={fadeUp} className="mt-8">
                <motion.div
                    whileTap={canSearch ? { scale: 0.98 } : {}}
                    whileHover={canSearch ? { y: -2 } : {}}
                >
                    <Button
                        onClick={handleSearch}
                        disabled={!canSearch}
                        className={`w-full h-14 rounded-3xl font-headline font-extrabold text-lg flex items-center justify-center gap-3 shadow-lg transition-all duration-300 ${
                          canSearch 
                            ? "bg-gradient-to-r from-primary to-primary-container text-white shadow-primary/20" 
                            : "bg-slate-100 text-slate-400"
                        }`}
                        style={{ background: canSearch ? `linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)` : undefined }}
                    >

                        <Search className="w-6 h-6" />
                        Find My Bus
                    </Button>
                </motion.div>
            </motion.div>

            {/* Popular routes hint */}
            <motion.div variants={fadeUp} className="mt-12 pb-24">
                <div className="flex items-center justify-between mb-5">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                        Popular {tripLabel} Routes
                    </p>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                    {isLoading ? (
                        <div className="py-10 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
                             <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
                             <p className="text-sm text-slate-400 font-medium">Finding available routes...</p>
                        </div>
                    ) : popularRoutes.length === 0 ? (
                        <div className="py-12 text-center bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                            <p className="text-sm text-slate-500 font-medium">
                                {tripType === "outstation"
                                    ? "No outstation routes available yet."
                                    : "No intercity routes found."}
                            </p>
                        </div>
                    ) : (
                        popularRoutes.map((route, i) => {
                            const src = (route as any).source?.name || (route as any).from_stop;
                            const dst = (route as any).destination?.name || (route as any).to_stop;
                            
                            return (
                                <motion.button
                                    key={i}
                                    variants={fadeUp}
                                    whileHover={{ x: 6 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        setOrigin(src);
                                        setDestination(dst);
                                        navigate("/routes", {
                                            state: { state: selectedState, tripType, origin: src, destination: dst },
                                        });
                                    }}
                                    className="w-full flex items-center justify-between bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-4 text-left shadow-sm hover:shadow-md transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                           <MapPin className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <span className="text-base font-headline font-bold text-on-surface block leading-tight">
                                                {src}
                                            </span>
                                            <span className="text-xs text-slate-400 font-medium mt-0.5 block">
                                                Travel to {dst}
                                            </span>
                                        </div>
                                    </div>
                                    <ArrowLeft className="w-5 h-5 text-slate-300 group-hover:text-primary transition-all rotate-180" />
                                </motion.button>
                            );
                        })
                    )}
                </div>
            </motion.div>
        </PageShell>
    );
};

export default RouteSearchPage;
