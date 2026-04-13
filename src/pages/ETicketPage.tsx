import { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Share2, Download, XCircle, ArrowRight, Bus } from "lucide-react";
import QRCode from "react-qr-code";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Button } from "../components/ui/button";
import { motion } from "framer-motion";
import PageShell from "../components/PageShell";



const ETicketPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const ticketRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [ticketData, setTicketData] = useState<any>(null);

  useEffect(() => {
    // If we have state from navigation (ConfirmationPage -> ETicketPage)
    if (location.state?.bus) {
      setTicketData({ bus: location.state.bus, passengers: location.state.passengers || 1 });
    } else {
      // Fallback: Check local storage for the latest booking
      const stored = localStorage.getItem('myBookings');
      if (stored) {
        try {
          const bookings = JSON.parse(stored);
          if (bookings.length > 0) {
            setTicketData({ bus: bookings[0].bus, passengers: bookings[0].passengers || 1 });
          }
        } catch (e) { console.error("Could not parse bookings", e); }
      }
    }
  }, [location.state]);

  const trackingUrl = ticketData?.bus ? `${window.location.origin}/tracking?from=${encodeURIComponent(ticketData.bus.from)}&to=${encodeURIComponent(ticketData.bus.to)}` : `${window.location.origin}/tracking`;

  const downloadTicketAsPDF = async () => {
    if (!ticketRef.current || isDownloading) return;
    setIsDownloading(true);

    try {
      // Temporarily hide any rounded corners or borders that might look weird on a flat PDF
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2, // higher resolution
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");

      // Calculate dimensions maintaining aspect ratio for A4
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 10, pdfWidth, pdfHeight);
      pdf.save("BusConnect_Ticket_402.pdf");

    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <PageShell>
      {/* Premium Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center transition-transform active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 text-primary" />
          </button>
          <h1 className="font-headline font-bold text-2xl tracking-tight text-on-surface">Digital E-Ticket</h1>
        </div>
        <button className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-500">
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      <main className="max-w-xl mx-auto space-y-8 pb-10">
        
        {/* Tabs */}
        <div className="flex gap-4 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-full">
          <button className="flex-1 bg-white dark:bg-slate-700 text-primary font-headline font-bold py-2.5 rounded-full shadow-sm text-sm">Active (1)</button>
          <button className="flex-1 text-slate-500 font-headline font-semibold py-2.5 rounded-full text-sm hover:text-primary transition-colors">Expired</button>
        </div>

        {/* Ticket Card Container */}
        <motion.div
           initial={{ y: 20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           ref={ticketRef} 
           className="relative group"
        >
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col relative">
            
            {/* Ticket Header & Branding */}
            <div className="bg-gradient-to-br from-primary to-primary-container p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                    <Bus className="w-48 h-48 -mt-8 -mr-8" />
                </div>
                <div className="relative z-10 flex justify-between items-start">
                  <div>
                      <div className="flex items-center gap-2 mb-3">
                          <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-widest backdrop-blur-md border border-white/10">
                            {ticketData?.bus?.type || "AC METRO"}
                          </span>
                      </div>
                      <h2 className="text-4xl font-headline font-black tracking-tighter">
                        {ticketData?.bus?.name || "Route 402"}
                      </h2>
                  </div>
                  <div className="text-right">
                      <span className="block text-[10px] uppercase tracking-[0.2em] font-black opacity-60 mb-1">Total Paid</span>
                      <span className="text-3xl font-headline font-black">₹40.00</span>
                  </div>
                </div>
            </div>

            {/* Ticket Content (Journey Details) */}
            <div className="p-8 pt-10 bg-white dark:bg-slate-900 relative">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">From</p>
                        <p className="font-headline font-bold text-xl leading-snug text-on-surface">
                          {ticketData?.bus?.from?.split(' ')[0] || "Majestic"}<br/>
                          <span className="text-slate-400 font-medium text-base">{ticketData?.bus?.from?.split(' ').slice(1).join(' ') || "Terminus"}</span>
                        </p>
                        <p className="text-sm font-bold text-primary mt-2">11:30 AM</p>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center px-6">
                        <span className="text-[10px] font-black text-primary/40 mb-3 tracking-widest">45 MIN</span>
                        <div className="flex items-center w-full gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-primary/10"></div>
                            <div className="h-0.5 w-12 bg-slate-100 dark:bg-slate-800 relative">
                               <div className="absolute inset-0 bg-primary/20 w-1/2"></div>
                            </div>
                            <Bus className="w-5 h-5 text-primary" />
                            <div className="h-0.5 w-12 bg-slate-100 dark:bg-slate-800 relative">
                               <div className="absolute inset-0 bg-primary/20 w-1/2 left-1/2"></div>
                            </div>
                            <div className="w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-primary/10"></div>
                        </div>
                    </div>

                    <div className="flex-1 text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">To</p>
                        <p className="font-headline font-bold text-xl leading-snug text-on-surface">
                          {ticketData?.bus?.to?.split(' ')[0] || "Indiranagar"}<br/>
                          <span className="text-slate-400 font-medium text-base">{ticketData?.bus?.to?.split(' ').slice(1).join(' ') || "Metro"}</span>
                        </p>
                        <p className="text-sm font-bold text-primary mt-2">12:15 PM</p>
                    </div>
                </div>
            </div>

            {/* Premium Divider with Cutouts */}
            <div className="relative py-4 flex items-center bg-white dark:bg-slate-900">
                <div className="absolute -left-5 w-10 h-10 bg-surface dark:bg-background rounded-full border border-slate-100 dark:border-slate-800 z-10" />
                <div className="w-full border-t-2 border-dashed border-slate-100 dark:border-slate-800 mx-8" />
                <div className="absolute -right-5 w-10 h-10 bg-surface dark:bg-background rounded-full border border-slate-100 dark:border-slate-800 z-10" />
            </div>

            {/* Ticket Footnote (QR & Details) */}
            <div className="p-8 pb-10 flex items-center justify-between bg-white dark:bg-slate-900 rounded-b-[2rem]">
                <div className="space-y-6">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Passenger</span>
                        <span className="font-headline font-extrabold text-lg text-on-surface">Priyadarshan S.</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Ticket ID</span>
                        <span className="font-headline font-extrabold text-lg text-primary">TKT-8930-B</span>
                    </div>
                    <div className="flex items-center gap-2">
                         <div className="px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-full border border-slate-100 dark:border-slate-800">
                            <span className="text-[10px] font-bold text-slate-500">OCT 24, 2026</span>
                         </div>
                    </div>
                </div>
                
                {/* Modern QR Code Layout */}
                <div className="flex flex-col items-center">
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="w-32 h-32 bg-white p-3 rounded-3xl border border-slate-100 shadow-xl flex items-center justify-center relative overflow-hidden"
                    >
                        <QRCode
                          value={trackingUrl}
                          size={100}
                          style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                          viewBox={`0 0 100 100`}
                        />
                    </motion.div>
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-4 bg-primary/5 px-4 py-1.5 rounded-full border border-primary/10 animate-pulse">
                      Scan to Board
                    </span>
                </div>
            </div>
          </div>
        </motion.div>
        
        {/* Actions Section */}
        <div className="space-y-4">
          <Button
            onClick={downloadTicketAsPDF}
            disabled={isDownloading}
            className="w-full py-7 rounded-3xl bg-slate-900 border-none text-white font-headline font-black text-lg shadow-2xl hover:bg-slate-800 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
          >
            <Download className={`w-6 h-6 ${isDownloading ? "animate-bounce" : ""}`} />
            {isDownloading ? "Processing..." : "Download PDF Ticket"}
          </Button>
          
          <button 
            onClick={() => navigate('/')}
            className="w-full py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 font-headline font-bold text-sm tracking-wide transition-all active:scale-95"
          >
            Go Back to Home
          </button>
        </div>
      </main>
    </PageShell>
  );
};

export default ETicketPage;
