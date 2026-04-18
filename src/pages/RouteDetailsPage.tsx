import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, MoreVertical, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { busService, BusStop, BusRoute } from "../services/busService";

const RouteDetailsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [routeData, setRouteData] = useState<any>(location.state?.route || { number: "DD1", destination: "Jagannath Ballav Parking" });
    
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<L.Map | null>(null);
    const [mapReady, setMapReady] = useState(false);
    const [stops, setStops] = useState<BusStop[]>([]);
    const [loading, setLoading] = useState(true);

    const routeNumber = String(routeData.number || routeData.route_number || "DD1");

    // Fetch dynamic stops from database
    useEffect(() => {
        const fetchRouteAndStops = async () => {
            setLoading(true);
            try {
                // 1. Get detailed route info if we only have the number
                let fullRoute = routeData;
                if (!routeData.id) {
                    const dbRoute = await busService.getRouteByNumber(routeNumber);
                    if (dbRoute) {
                        fullRoute = dbRoute;
                        setRouteData(dbRoute);
                    }
                }

                // 2. Get stops for this route
                if (fullRoute.id) {
                    const dbStops = await busService.getStopsForRoute(fullRoute.id);
                    setStops(dbStops);
                } else {
                    console.error("Route ID not found for", routeNumber);
                }
            } catch (err) {
                console.error("Error fetching route data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchRouteAndStops();
    }, [routeNumber]);

    const destination = routeData.destination || stops[stops.length - 1]?.name || "Destination";

    useEffect(() => {
        if (!mapRef.current || stops.length === 0) return;

        // Clean up any existing map instance on this container
        const container = mapRef.current as any;
        if (container._leaflet_id !== undefined) {
            container._leaflet_id = null;
        }

        // Calculate center from stops
        const avgLat = stops.reduce((sum, s) => sum + s.latitude, 0) / stops.length;
        const avgLng = stops.reduce((sum, s) => sum + s.longitude, 0) / stops.length;

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

        // Draw the route line and markers
        const routeLatLngs: L.LatLngExpression[] = stops.map(s => [s.latitude, s.longitude]);
        
        // Route line - thick dark line
        L.polyline(routeLatLngs, {
            color: "#006B7D",
            weight: 6,
            opacity: 0.9,
            lineCap: "round",
            lineJoin: "round",
        }).addTo(map);

        // Stop markers
        stops.forEach((stop, i) => {
            const isFirst = i === 0;
            const isLast = i === stops.length - 1;
            const size = (isFirst || isLast) ? 14 : 10;
            
            const icon = L.divIcon({
                className: "custom-stop-marker",
                html: `<div style="
                    width: ${size}px; height: ${size}px;
                    background: white;
                    border: 3px solid ${isFirst || isLast ? '#006B7D' : '#1a1a2e'};
                    border-radius: 50%;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                "></div>`,
                iconSize: [size, size],
                iconAnchor: [size / 2, size / 2],
            });

            const marker = L.marker([stop.latitude, stop.longitude], { icon }).addTo(map);
            
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

        // Fix map sizing after tiles load
        setTimeout(() => {
            map.invalidateSize();
        }, 300);

        setMapReady(true);

        return () => {
            map.remove();
            mapInstance.current = null;
        };
    }, [stops]);

    const handleBookTicket = () => {
        navigate("/book-ticket", { 
            state: { 
                route_id: routeData.id,
                origin: stops[0]?.name || routeData.origin || "Start",
                destination: destination,
                price: routeData.price_inr || 25,
                operator: "Mo Bus"
            } 
        });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-slate-50 dark:bg-[#0f1522]">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="mt-4 text-sm font-bold text-slate-400">Loading route details...</p>
            </div>
        );
    }

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
                        {stops.length > 0 && (
                            <div className="absolute left-[11px] top-4 bottom-4 w-[2px] bg-slate-200 dark:bg-slate-700" />
                        )}

                        <div className="space-y-0">
                            {stops.map((stop, i) => {
                                const isFirst = i === 0;
                                const isLast = i === stops.length - 1;
                                
                                return (
                                    <div key={stop.id} className="relative flex items-start gap-4 py-4">
                                        {/* Circle indicator */}
                                        <div className="relative z-10 shrink-0 mt-0.5">
                                            <div className={`w-6 h-6 rounded-full border-[2.5px] flex items-center justify-center ${
                                                isFirst || isLast
                                                    ? "border-[#006B7D] dark:border-[#006B7D] bg-white dark:bg-[#0f1522]"
                                                    : "border-slate-300 dark:border-slate-600 bg-white dark:bg-[#0f1522]"
                                            }`}>
                                                {(isFirst || isLast) && (
                                                    <div className="w-2 h-2 rounded-full bg-[#006B7D]" />
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
                            
                            {stops.length === 0 && (
                                <div className="py-10 text-center text-slate-400">
                                    No stops found for this route.
                                </div>
                            )}
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
