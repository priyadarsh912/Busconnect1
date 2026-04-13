import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Ticket, Calendar, Clock, RefreshCw, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import PageShell from "../components/PageShell";
import { busService } from "../services/busService";
import { authService } from "../services/authService";
import { offlineBusService } from "../services/offline/OfflineBusService";

interface Booking {
    id: string | number;
    from: string;
    to: string;
    time: string;
    price: number;
    date: string;
    userName?: string;
    status?: string;
}

const MyBookingsPage = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            setLoading(true);
            const currentUser = authService.getCurrentUser();
            
            if (currentUser) {
                try {
                    const data = await offlineBusService.getUserBookings(currentUser.id);

                    if (data && data.length > 0) {
                        const mappedBookings: Booking[] = data.map((b: any) => ({
                            id: b.id,
                            from: b.routes?.source?.name || b.from || "Unknown",
                            to: b.routes?.destination?.name || b.to || "Unknown",
                            time: b.time || new Date(b.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            price: b.fare || b.price || 0,
                            date: b.date || new Date(b.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                            userName: b.userName || currentUser.name,
                            status: b.status
                        }));
                        setBookings(mappedBookings);
                    } else {
                        const saved = JSON.parse(localStorage.getItem("myBookings") || "[]");
                        setBookings(saved);
                    }
                } catch (err) {
                    console.error("Supabase fetch error:", err);
                    const saved = JSON.parse(localStorage.getItem("myBookings") || "[]");
                    setBookings(saved);
                }
            } else {
                const saved = JSON.parse(localStorage.getItem("myBookings") || "[]");
                setBookings(saved);
            }
            setLoading(false);
        };

        fetchBookings();
    }, []);

    return (
        <PageShell>
            <div className="flex items-center mb-8">
                <button 
                  onClick={() => navigate(-1)} 
                  className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center transition-transform active:scale-95"
                >
                  <ArrowLeft className="w-5 h-5 text-primary" />
                </button>
                <h1 className="flex-1 text-center font-headline font-bold text-xl tracking-tight">My Bookings</h1>
                <div className="w-10" />
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center pt-20">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4"
                    >
                      <RefreshCw className="w-6 h-6 text-primary" />
                    </motion.div>
                    <p className="font-headline font-bold text-slate-400">Syncing your journey...</p>
                </div>
            ) : bookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center pt-20 text-center px-8">
                    <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-sm">
                        <Ticket className="w-10 h-10 text-slate-300" />
                    </div>
                    <h2 className="text-2xl font-headline font-black mb-3 text-on-surface tracking-tight">No Bookings Found</h2>
                    <p className="text-slate-400 font-medium mb-8">
                      Your travel history will appear here once you book your first ride.
                    </p>
                    <button 
                      onClick={() => navigate("/routes")} 
                      className="px-8 py-4 bg-primary text-white font-headline font-bold rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95"
                    >
                        Browse Routes
                    </button>
                </div>
            ) : (
                <div className="space-y-6 pb-24">
                    {bookings.map((booking, idx) => (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          key={booking.id} 
                          onClick={() => navigate("/e-ticket", { state: { booking } })}
                          className="group relative bg-white dark:bg-[#1a2332] rounded-[2rem] border border-slate-100 dark:border-slate-700/50 p-6 shadow-sm overflow-hidden transition-all active:scale-[0.98] hover:shadow-md cursor-pointer"
                        >
                            {/* Decorative elements */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[3rem] -z-0" />
                            <Ticket className="absolute top-6 right-6 w-5 h-5 text-primary/20 group-hover:text-primary/40 transition-colors" />

                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="flex flex-col items-center">
                                        <div className="w-2 h-2 rounded-full bg-primary" />
                                        <div className="w-[1px] h-4 bg-slate-100 dark:bg-slate-800" />
                                        <div className="w-2 h-2 rounded-full bg-orange-500" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="font-headline font-black text-lg text-slate-900 dark:text-white tracking-tight">{booking.from}</p>
                                        </div>
                                        <div className="flex items-center justify-between mt-1">
                                            <p className="font-headline font-black text-lg text-slate-900 dark:text-white tracking-tight">{booking.to}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-5">
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl flex items-center gap-2.5">
                                        <Calendar className="w-4 h-4 text-primary" />
                                        <span className="text-xs font-bold text-slate-500">{booking.date}</span>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl flex items-center gap-2.5">
                                        <Clock className="w-4 h-4 text-primary" />
                                        <span className="text-xs font-bold text-slate-500">{booking.time}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between border-t border-dashed border-slate-100 dark:border-slate-800 pt-5">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-0.5">Price Paid</p>
                                        <p className="font-headline font-black text-2xl text-primary tracking-tighter">₹{booking.price}</p>
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-xl group-hover:bg-primary/10 transition-colors">
                                        <span className="text-xs font-black text-primary uppercase tracking-widest">View Ticket</span>
                                        <ChevronRight className="w-4 h-4 text-primary" />
                                    </div>
                                </div>

                                {booking.status === 'pending_sync' && (
                                    <div className="mt-4 flex items-center gap-2 py-1.5 px-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg w-fit">
                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                                        <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Syncing Offline Ticket...</span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                    <p className="text-center text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em] pt-4">
                        Tapped for full digital receipt
                    </p>
                </div>
            )}
        </PageShell>
    );
};

export default MyBookingsPage;

