import { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Share2, Download, Bus } from "lucide-react";
import QRCode from "react-qr-code";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Button } from "../components/ui/button";
import { motion } from "framer-motion";
import PageShell from "../components/PageShell";
import { toast } from "sonner";

const ETicketPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const ticketRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [ticketData, setTicketData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"active" | "expired">("active");

  useEffect(() => {
    if (location.state?.bus) {
      setTicketData({ 
        bus: location.state.bus, 
        passengers: location.state.passengers || 1,
        price: location.state.bus.price_inr * (location.state.passengers || 1),
        startTime: location.state.bus.departure || "11:30 AM",
        endTime: location.state.bus.arrival || "12:15 PM",
        duration: location.state.bus.duration || "45 MIN",
        passengerName: "Priyadarshan S.",
        ticketId: `TKT-${Math.floor(Math.random() * 9000) + 1000}-B`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      });
    } else {
      const stored = localStorage.getItem('myBookings');
      if (stored) {
        try {
          const bookings = JSON.parse(stored);
          if (bookings.length > 0) {
            const b = bookings[0];
            setTicketData({ 
              bus: { name: b.route_no || "Route 402", type: "AC METRO", from: b.from, to: b.to }, 
              passengers: 1,
              price: b.price,
              startTime: b.time || "11:30 AM",
              endTime: "12:15 PM",
              duration: "45 MIN",
              passengerName: "Priyadarshan S.",
              ticketId: `TKT-${Math.floor(Math.random() * 9000) + 1000}-B`,
              date: b.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            });
          }
        } catch (e) { console.error("Could not parse bookings", e); }
      }
    }
  }, [location.state]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My BusConnect Ticket',
          text: `Check out my ticket from ${ticketData?.bus?.from} to ${ticketData?.bus?.to}`,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const downloadTicketAsPDF = async () => {
    if (!ticketRef.current || isDownloading) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(ticketRef.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 10, pdfWidth, pdfHeight);
      pdf.save(`BusConnect_Ticket_${ticketData?.ticketId || "402"}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!ticketData) return <PageShell><div className="flex items-center justify-center h-screen">Loading...</div></PageShell>;

  return (
    <PageShell>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center transition-transform active:scale-95">
            <ArrowLeft className="w-5 h-5 text-primary" />
          </button>
          <h1 className="font-headline font-bold text-2xl tracking-tight text-foreground">Digital E-Ticket</h1>
        </div>
        <button onClick={handleShare} className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-500">
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      <main className="max-w-xl mx-auto space-y-8 pb-10">
        <div className="flex gap-4 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-full">
          <button 
             onClick={() => setActiveTab("active")}
             className={`flex-1 font-headline font-bold py-2.5 rounded-full shadow-sm text-sm transition-all ${activeTab === "active" ? "bg-white dark:bg-slate-700 text-primary" : "text-slate-500"}`}
          >
            Active (1)
          </button>
          <button 
             onClick={() => setActiveTab("expired")}
             className={`flex-1 font-headline font-semibold py-2.5 rounded-full text-sm transition-all ${activeTab === "expired" ? "bg-white dark:bg-slate-700 text-primary" : "text-slate-500"}`}
          >
            Expired
          </button>
        </div>

        {activeTab === "active" ? (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} ref={ticketRef} className="relative group">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col relative">
              <div className="bg-gradient-to-br from-primary to-primary-container p-8 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 opacity-10 pointer-events-none"><Bus className="w-48 h-48 -mt-8 -mr-8" /></div>
                  <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-3"><span className="bg-white/20 px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-widest backdrop-blur-md border border-white/10">{ticketData.bus.type}</span></div>
                        <h2 className="text-4xl font-headline font-black tracking-tighter">{ticketData.bus.name}</h2>
                    </div>
                    <div className="text-right">
                        <span className="block text-[10px] uppercase tracking-[0.2em] font-black opacity-60 mb-1">Total Paid</span>
                        <span className="text-3xl font-headline font-black">₹{ticketData.price.toFixed(2)}</span>
                    </div>
                  </div>
              </div>
              <div className="p-8 pt-10 bg-white dark:bg-slate-900 relative">
                  <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">From</p>
                          <p className="font-headline font-bold text-xl leading-snug text-foreground">{ticketData.bus.from}</p>
                          <p className="text-sm font-bold text-primary mt-2">{ticketData.startTime}</p>
                      </div>
                      <div className="flex flex-col items-center justify-center px-6">
                          <span className="text-[10px] font-black text-primary/40 mb-3 tracking-widest">{ticketData.duration}</span>
                          <div className="flex items-center w-full gap-2">
                              <div className="w-2.5 h-2.5 rounded-full bg-primary" /><div className="h-0.5 w-12 bg-slate-100 dark:bg-slate-800" /><Bus className="w-5 h-5 text-primary" /><div className="h-0.5 w-12 bg-slate-100 dark:bg-slate-800" /><div className="w-2.5 h-2.5 rounded-full bg-primary" />
                          </div>
                      </div>
                      <div className="flex-1 text-right">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">To</p>
                          <p className="font-headline font-bold text-xl leading-snug text-foreground">{ticketData.bus.to}</p>
                          <p className="text-sm font-bold text-primary mt-2">{ticketData.endTime}</p>
                      </div>
                  </div>
              </div>
              <div className="relative py-4 flex items-center bg-white dark:bg-slate-900">
                  <div className="absolute -left-5 w-10 h-10 bg-background rounded-full border border-slate-100 dark:border-slate-800" />
                  <div className="w-full border-t-2 border-dashed border-slate-100 dark:border-slate-800 mx-8" />
                  <div className="absolute -right-5 w-10 h-10 bg-background rounded-full border border-slate-100 dark:border-slate-800" />
              </div>
              <div className="p-8 pb-10 flex items-center justify-between bg-white dark:bg-slate-900 rounded-b-[2rem]">
                  <div className="space-y-6">
                      <div className="flex flex-col"><span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Passenger</span><span className="font-headline font-extrabold text-lg text-foreground">{ticketData.passengerName}</span></div>
                      <div className="flex flex-col"><span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Ticket ID</span><span className="font-headline font-extrabold text-lg text-primary">{ticketData.ticketId}</span></div>
                      <div className="flex items-center gap-2"><div className="px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-full border border-slate-100 dark:border-slate-800"><span className="text-[10px] font-bold text-slate-500">{ticketData.date}</span></div></div>
                  </div>
                  <div className="flex flex-col items-center">
                      <div className="w-32 h-32 bg-white p-3 rounded-3xl border border-slate-100 shadow-xl flex items-center justify-center">
                          <QRCode value={window.location.href} size={100} style={{ height: "auto", maxWidth: "100%", width: "100%" }} />
                      </div>
                      <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-4">Scan to Board</span>
                  </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/20 rounded-[2rem] border border-dashed border-slate-200">No expired tickets found.</div>
        )}
        
        <div className="space-y-4">
          <Button onClick={downloadTicketAsPDF} disabled={isDownloading} className="w-full py-7 rounded-3xl bg-slate-900 border-none text-white font-headline font-black text-lg shadow-2xl">
            <Download className="w-6 h-6 mr-3" /> {isDownloading ? "Processing..." : "Download PDF Ticket"}
          </Button>
          <button onClick={() => navigate('/')} className="w-full py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 font-headline font-bold text-sm">Go Back to Home</button>
        </div>
      </main>
    </PageShell>
  );
};

export default ETicketPage;
