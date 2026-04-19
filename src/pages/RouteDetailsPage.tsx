import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, MoreVertical, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { busService, BusStop, BusRoute } from "../services/busService";
import { routingService } from "../services/routingService";

const RouteDetailsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [routeData, setRouteData] = useState<any>(location.state?.route || { number: "DD1", destination: "Jagannath Ballav Parking" });
    
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<L.Map | null>(null);
    const [mapReady, setMapReady] = useState(false);
    const [stops, setStops] = useState<BusStop[]>([]);
    const [loading, setLoading] = useState(true);
    const [routePath, setRoutePath] = useState<[number, number][]>([]);
    const [pathLoading, setPathLoading] = useState(false);
    const [pathError, setPathError] = useState(false);

    const routeNumber = String(routeData.number || routeData.route_number || "DD1");

    // ── Step 1: Fetch stops from the database ────────────────────
    useEffect(() => {
        const fetchRouteAndStops = async () => {
            setLoading(true);
            try {
                let fullRoute = routeData;
                if (!routeData.id) {
                    const dbRoute = await busService.getRouteByNumber(routeNumber);
                    if (dbRoute) {
                        fullRoute = dbRoute;
                        setRouteData(dbRoute);
                    }
                }

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

    // ── Step 2: Fetch the real road path once stops are loaded ────
    useEffect(() => {
        if (stops.length < 2) {
            setRoutePath([]);
            return;
        }

        let cancelled = false;

        const fetchRoadPath = async () => {
            setPathLoading(true);
            setPathError(false);

            try {
                const waypoints = stops.map(
                    s => [s.latitude, s.longitude] as [number, number]
                );
                const roadCoords = await routingService.getRoutePath(waypoints);

                if (!cancelled) {
                    // Validate: a good road path has many more points than just the stops
                    if (roadCoords.length > waypoints.length) {
                        setRoutePath(roadCoords);
                    } else {
                        // OSRM returned too few points — essentially straight lines
                        console.warn("Road path has too few points, likely failed");
                        setRoutePath([]);
                        setPathError(true);
                    }
                }
            } catch (err) {
                console.error("Road path error:", err);
                if (!cancelled) {
                    setRoutePath([]);
                    setPathError(true);
                }
            } finally {
                if (!cancelled) setPathLoading(false);
            }
        };

        fetchRoadPath();
        return () => { cancelled = true; };
    }, [stops]);

    // ── Step 3: Render the map ───────────────────────────────────
    useEffect(() => {
        if (!mapRef.current || stops.length === 0) return;

        // Destroy previous map instance
        if (mapInstance.current) {
            mapInstance.current.remove();
            mapInstance.current = null;
        }

        // Calculate center
        const avgLat = stops.reduce((s, st) => s + st.latitude, 0) / stops.length;
        const avgLng = stops.reduce((s, st) => s + st.longitude, 0) / stops.length;

        const map = L.map(mapRef.current, {
            center: [avgLat, avgLng],
            zoom: 13,
            zoomControl: false,
            attributionControl: false,
        });
        mapInstance.current = map;

        // High-quality tile layer
        L.tileLayer(
            'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
            { maxZoom: 19 }
        ).addTo(map);

        // ── Draw the route polyline ──────────────────────────────
        // Use road path if available, otherwise fall back to straight stop-to-stop lines
        const pathToRender: L.LatLngExpression[] =
            routePath.length > 0
                ? routePath.map(c => [c[0], c[1]] as L.LatLngExpression)
                : stops.map(s => [s.latitude, s.longitude] as L.LatLngExpression);

        // Outer glow line (wider, semi-transparent)
        L.polyline(pathToRender, {
            color: "#006B7D",
            weight: 10,
            opacity: 0.2,
            lineCap: "round",
            lineJoin: "round",
        }).addTo(map);

        // Main route line
        L.polyline(pathToRender, {
            color: "#006B7D",
            weight: 5,
            opacity: 0.95,
            lineCap: "round",
            lineJoin: "round",
        }).addTo(map);

        // ── Draw stop markers ────────────────────────────────────
        stops.forEach((stop, i) => {
            const isFirst = i === 0;
            const isLast = i === stops.length - 1;
            const isTerminal = isFirst || isLast;
            const size = isTerminal ? 18 : 12;

            const bgColor = isFirst ? "#10b981" : isLast ? "#ef4444" : "#ffffff";
            const borderColor = isTerminal ? "#ffffff" : "#006B7D";
            const shadow = "0 2px 6px rgba(0,0,0,0.3)";

            const icon = L.divIcon({
                className: "custom-stop-marker",
                html: `<div style="
                    width:${size}px; height:${size}px;
                    background:${bgColor};
                    border:${isTerminal ? 2.5 : 2}px solid ${borderColor};
                    border-radius:50%;
                    box-shadow:${shadow};
                    z-index: 1000;
                "></div>`,
                iconSize: [size, size],
                iconAnchor: [size / 2, size / 2],
            });

            const marker = L.marker([stop.latitude, stop.longitude], { 
                icon,
                zIndexOffset: isTerminal ? 1000 : 500
            }).addTo(map);

            // Popup for every stop  
            marker.bindPopup(
                `<div style="font-family:inherit;min-width:140px;padding:2px">
                    <div style="font-weight:800;font-size:14px;color:#0f172a;margin-bottom:4px">
                        ${stop.name}
                    </div>
                    <div style="display:flex;align-items:center;gap:6px">
                        <span style="font-size:10px;color:#64748b;font-weight:700;background:#f1f5f9;padding:2px 6px;border-radius:4px">
                            Stop ${i + 1}
                        </span>
                        ${isTerminal ? `<span style="font-size:10px;color:white;background:${bgColor};padding:2px 6px;border-radius:4px;font-weight:700">${isFirst ? 'START' : 'END'}</span>` : ''}
                    </div>
                </div>`,
                { closeButton: false, className: "route-stop-popup" }
            );

            // Tooltips only for terminals
            if (isTerminal) {
                marker.bindTooltip(stop.name, {
                    permanent: false,
                    direction: "top",
                    offset: [0, -10],
                    className: "stop-label-tooltip",
                });
            }
        });

        // ── Fit bounds ───────────────────────────────────────────
        const allPoints: L.LatLngExpression[] = stops.map(
            s => [s.latitude, s.longitude] as L.LatLngExpression
        );
        const bounds = L.latLngBounds(allPoints);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });

        // Fix mobile rendering
        setTimeout(() => map.invalidateSize(), 300);
        setMapReady(true);

        return () => {
            map.remove();
            mapInstance.current = null;
        };
    }, [stops, routePath]);

    const destination = routeData.destination || routeData.to || stops[stops.length - 1]?.name || "Destination";

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

    // ── Loading screen ───────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-slate-50 dark:bg-[#0f1522]">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="mt-4 text-sm font-bold text-slate-400">Loading route details...</p>
            </div>
        );
    }

    // ── Main render ──────────────────────────────────────────────
    return (
        <div className="max-w-md mx-auto flex flex-col h-screen bg-white dark:bg-[#0f1522] overflow-hidden">
            {/* Top Half: Map */}
            <div className="relative h-[42vh] w-full shrink-0">
                <div ref={mapRef} className="absolute inset-0 z-0" />
                
                {/* Path loading indicator */}
                {pathLoading && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000]">
                        <div className="bg-white/95 backdrop-blur-md rounded-full px-4 py-2 shadow-lg flex items-center gap-2">
                            <Loader2 className="w-4 h-4 text-[#006B7D] animate-spin" />
                            <span className="text-xs font-bold text-slate-600">Loading road path...</span>
                        </div>
                    </div>
                )}

                {/* Back Button */}
                <div className="absolute top-4 left-4 z-[1000]">
                    <button 
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 shadow-lg flex items-center justify-center active:scale-95 transition-transform"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-800 dark:text-white" />
                    </button>
                </div>

                {/* Book Ticket Button */}
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
                .route-stop-popup .leaflet-popup-content-wrapper {
                    border-radius: 10px !important;
                    box-shadow: 0 8px 24px -4px rgba(0,0,0,0.15) !important;
                    border: 1px solid rgba(0,0,0,0.06) !important;
                    padding: 0 !important;
                }
                .route-stop-popup .leaflet-popup-content {
                    margin: 10px 14px !important;
                }
                .route-stop-popup .leaflet-popup-tip {
                    box-shadow: 2px 2px 8px rgba(0,0,0,0.08) !important;
                }
                .route-stop-popup a.leaflet-popup-close-button {
                    display: none !important;
                }
            `}</style>
        </div>
    );
};

export default RouteDetailsPage;
