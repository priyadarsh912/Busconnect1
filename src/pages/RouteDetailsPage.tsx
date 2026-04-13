import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, MoreVertical } from "lucide-react";
import { motion } from "framer-motion";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Route stop databases for Bhubaneswar city buses
const ROUTE_STOPS: Record<string, { name: string; lat: number; lng: number }[]> = {
    "18": [
        { name: "Baramunda BSABT", lat: 20.2719, lng: 85.8061 },
        { name: "Khandagiri Square", lat: 20.2577, lng: 85.7790 },
        { name: "Jaydev Vihar Square", lat: 20.2961, lng: 85.8136 },
        { name: "Nalco Square", lat: 20.3011, lng: 85.8240 },
        { name: "Vani Vihar", lat: 20.3046, lng: 85.8396 },
        { name: "Acharya Vihar", lat: 20.3025, lng: 85.8345 },
        { name: "Rasulgarh", lat: 20.3059, lng: 85.8563 },
        { name: "Nandan Vihar", lat: 20.3176, lng: 85.8621 },
        { name: "Jagatpur", lat: 20.3455, lng: 85.8498 },
    ],
    "10": [
        { name: "Master Canteen", lat: 20.2728, lng: 85.8406 },
        { name: "Ram Mandir", lat: 20.2707, lng: 85.8365 },
        { name: "Rajmahal Square", lat: 20.2690, lng: 85.8321 },
        { name: "PMG Square", lat: 20.2671, lng: 85.8282 },
        { name: "AG Square", lat: 20.2729, lng: 85.8244 },
        { name: "Sishu Bhawan", lat: 20.2730, lng: 85.8195 },
        { name: "Saheed Nagar", lat: 20.2920, lng: 85.8412 },
        { name: "KIIT Square", lat: 20.3541, lng: 85.8143 },
    ],
    "47": [
        { name: "Baramunda BSABT", lat: 20.2719, lng: 85.8061 },
        { name: "Rajdhani College", lat: 20.2674, lng: 85.8157 },
        { name: "Fire Station Square", lat: 20.2595, lng: 85.8219 },
        { name: "Gopabandhu Nagar", lat: 20.2521, lng: 85.8288 },
        { name: "CRPF Square", lat: 20.2465, lng: 85.8350 },
        { name: "Nayapalli", lat: 20.2910, lng: 85.8038 },
        { name: "Settlement Office", lat: 20.2802, lng: 85.8426 },
    ],
    "54S": [
        { name: "Patrapada Bus Depot", lat: 20.2340, lng: 85.7850 },
        { name: "K9", lat: 20.2380, lng: 85.7900 },
        { name: "Kalinga Vihar Square", lat: 20.2450, lng: 85.7950 },
        { name: "Patrapada 1", lat: 20.2520, lng: 85.8010 },
        { name: "Alu Godam 1", lat: 20.2590, lng: 85.8070 },
        { name: "Aiginia 1", lat: 20.2660, lng: 85.8130 },
        { name: "Kalpana Square", lat: 20.2710, lng: 85.8190 },
        { name: "NLUO", lat: 20.3800, lng: 85.8300 },
    ],
};

// Fallback stops for any unknown route
const DEFAULT_STOPS = [
    { name: "Start Point", lat: 20.2719, lng: 85.8061 },
    { name: "Midway Stop", lat: 20.2900, lng: 85.8200 },
    { name: "End Point", lat: 20.3100, lng: 85.8400 },
];

const RouteDetailsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const routeData = location.state?.route || { number: "47", destination: "Settlement Office" };
    
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<L.Map | null>(null);
    const [mapReady, setMapReady] = useState(false);

    // Get the stops for this route
    const routeNumber = String(routeData.number || routeData.route_no || "47");
    const stops = ROUTE_STOPS[routeNumber] || DEFAULT_STOPS;
    const destination = routeData.destination || stops[stops.length - 1]?.name || "Destination";

    useEffect(() => {
        if (!mapRef.current) return;

        // Clean up any existing map instance on this container
        const container = mapRef.current as any;
        if (container._leaflet_id !== undefined) {
            container._leaflet_id = null;
        }

        // Calculate center from stops
        const avgLat = stops.reduce((sum, s) => sum + s.lat, 0) / stops.length;
        const avgLng = stops.reduce((sum, s) => sum + s.lng, 0) / stops.length;

        const map = L.map(container, {
            center: [avgLat, avgLng],
            zoom: 12,
            zoomControl: false,
            attributionControl: false,
        });
        mapInstance.current = map;

        // Use a clean tile layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
        }).addTo(map);

        // Fix map sizing and fit bounds after tiles load
        setTimeout(() => {
            map.invalidateSize();
            const b = L.latLngBounds(routeLatLngs);
            map.fitBounds(b, { padding: [50, 50], maxZoom: 14 });
        }, 300);

        // Draw the route line
        const routeLatLngs: L.LatLngExpression[] = stops.map(s => [s.lat, s.lng]);
        
        // Route line — thick dark line
        L.polyline(routeLatLngs, {
            color: "#1a1a2e",
            weight: 6,
            opacity: 0.9,
            lineCap: "round",
            lineJoin: "round",
        }).addTo(map);

        // Stop markers — white circles with dark border
        stops.forEach((stop, i) => {
            const isFirst = i === 0;
            const isLast = i === stops.length - 1;
            const size = (isFirst || isLast) ? 14 : 10;
            
            const icon = L.divIcon({
                className: "custom-stop-marker",
                html: `<div style="
                    width: ${size}px; height: ${size}px;
                    background: white;
                    border: 3px solid #1a1a2e;
                    border-radius: 50%;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                "></div>`,
                iconSize: [size, size],
                iconAnchor: [size / 2, size / 2],
            });

            const marker = L.marker([stop.lat, stop.lng], { icon }).addTo(map);
            
            // Label for first and last stops
            if (isFirst || isLast) {
                marker.bindTooltip(isFirst ? "Start" : "End", {
                    permanent: true,
                    direction: "top",
                    offset: [0, -10],
                    className: "stop-label-tooltip",
                });
            }
        });

        // Fit bounds to show all stops
        const bounds = L.latLngBounds(routeLatLngs);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });

        setMapReady(true);

        return () => {
            map.remove();
            mapInstance.current = null;
        };
    }, [routeNumber]);

    const handleBookTicket = () => {
        navigate("/book-ticket", { 
            state: { 
                route_id: routeNumber,
                origin: stops[0]?.name || "Start",
                destination: destination,
                price: 25,
                operator: "Mo Bus"
            } 
        });
    };

    return (
        <div className="max-w-md mx-auto flex flex-col h-screen bg-white dark:bg-[#0f1522] overflow-hidden">
            {/* Top Half: Map */}
            <div className="relative h-[42vh] w-full shrink-0">
                <div ref={mapRef} className="absolute inset-0 z-0" />
                
                {/* Back Button - Floating over map */}
                <div className="absolute top-4 left-4 z-[1000]">
                    <button 
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 shadow-lg flex items-center justify-center active:scale-95 transition-transform"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-800 dark:text-white" />
                    </button>
                </div>

                {/* Book Ticket Button - Floating on map */}
                <div className="absolute bottom-4 right-4 z-[1000]">
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleBookTicket}
                        className="bg-[#006B7D] hover:bg-[#005a69] text-white px-6 py-3 rounded-full font-bold text-sm shadow-xl shadow-primary/30 flex items-center gap-2 whitespace-nowrap"
                    >
                        Book Ticket
                    </motion.button>
                </div>
            </div>

            {/* Bottom Half: Route Info + Stops */}
            <div className="flex-1 overflow-y-auto bg-white dark:bg-[#0f1522] border-t border-slate-100 dark:border-slate-800/50 pb-20">
                {/* Route Header */}
                <div className="px-5 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-headline font-black text-slate-900 dark:text-white tracking-tight leading-none">
                                {routeNumber}
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
                                To {destination}
                            </p>
                        </div>
                        <button className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                            <MoreVertical className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Stops List */}
                <div className="px-5 py-3">
                    <div className="relative">
                        {/* Vertical connecting line */}
                        <div className="absolute left-[11px] top-4 bottom-4 w-[2px] bg-slate-200 dark:bg-slate-700" />

                        <div className="space-y-0">
                            {stops.map((stop, i) => {
                                const isFirst = i === 0;
                                const isLast = i === stops.length - 1;
                                
                                return (
                                    <div key={stop.name} className="relative flex items-start gap-4 py-4">
                                        {/* Circle indicator */}
                                        <div className="relative z-10 shrink-0 mt-0.5">
                                            <div className={`w-6 h-6 rounded-full border-[2.5px] flex items-center justify-center ${
                                                isFirst
                                                    ? "border-slate-800 dark:border-white bg-white dark:bg-[#0f1522]"
                                                    : isLast
                                                        ? "border-slate-800 dark:border-white bg-white dark:bg-[#0f1522]"
                                                        : "border-slate-300 dark:border-slate-600 bg-white dark:bg-[#0f1522]"
                                            }`}>
                                                {(isFirst || isLast) && (
                                                    <div className="w-2 h-2 rounded-full bg-slate-800 dark:bg-white" />
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Stop name */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className={`font-medium text-[15px] leading-tight ${
                                                isFirst || isLast 
                                                    ? "text-slate-900 dark:text-white font-bold" 
                                                    : "text-slate-700 dark:text-slate-300"
                                            }`}>
                                                {stop.name}
                                            </h3>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Inject custom CSS for map tooltips */}
            <style>{`
                .stop-label-tooltip {
                    background: white !important;
                    border: 1px solid #e2e8f0 !important;
                    border-radius: 6px !important;
                    padding: 2px 8px !important;
                    font-size: 11px !important;
                    font-weight: 700 !important;
                    color: #334155 !important;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.12) !important;
                }
                .stop-label-tooltip::before {
                    border-top-color: #e2e8f0 !important;
                }
                .custom-stop-marker {
                    background: transparent !important;
                    border: none !important;
                }
            `}</style>
        </div>
    );
};

export default RouteDetailsPage;
