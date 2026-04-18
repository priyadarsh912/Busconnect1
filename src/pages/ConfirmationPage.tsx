import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, CheckCircle2, MapPin, Navigation, Download } from "lucide-react";
import { Button } from "../components/ui/button";
import { motion } from "framer-motion";
import PageShell from "../components/PageShell";



const ConfirmationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { bus, passengers = 1 } = location.state || {};

  return (
    <PageShell>
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate("/")}
          className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center transition-transform active:scale-95"
        >
          <ArrowLeft className="w-5 h-5 text-primary" />
        </button>
        <h1 className="flex-1 text-center font-headline font-bold text-xl tracking-tight">Booking Status</h1>
        <div className="w-10" />
      </div>

      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center pt-6 pb-10"
      >
        <div className="relative mb-8">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center relative z-10">
            <CheckCircle2 className="w-12 h-12 text-primary stroke-[3px]" />
          </div>
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 bg-primary/20 rounded-full blur-xl -z-0"
          />
        </div>
        <h2 className="text-3xl font-headline font-black text-center tracking-tighter leading-tight bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent">
          Booking Confirmed!
        </h2>
        <p className="text-slate-400 font-medium text-center mt-3 max-w-[280px]">
          Your seat is reserved. Get ready for a smooth journey with BusConnect.
        </p>
      </motion.div>

      {/* Trip Details Card */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-[0_12px_40px_rgba(0,0,0,0.06)] border border-slate-100 dark:border-slate-800 p-8 mb-8"
      >
        <div className="flex items-start gap-5 mb-8">
          <div className="flex flex-col items-center py-1">
            <div className="w-3 h-3 rounded-full bg-primary ring-4 ring-primary/10" />
            <div className="w-[1px] h-14 border-l-2 border-dashed border-slate-100 dark:border-slate-800" />
            <div className="w-3 h-3 rounded-full bg-orange-500 ring-4 ring-orange-100 dark:ring-orange-900/20" />
          </div>
          <div className="flex-1 space-y-6">
            <div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1.5">FROM</p>
              <p className="font-headline font-bold text-lg text-on-surface leading-tight">
                {bus?.from || "Sector 17 Bus Terminus"}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1.5">TO</p>
              <p className="font-headline font-bold text-lg text-on-surface leading-tight">
                {bus?.to || "Phase 6 Metro Station"}
              </p>
            </div>
          </div>
        </div>

        <div className="h-px bg-slate-50 dark:bg-slate-800 my-6" />

        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1.5">TIME</p>
            <p className="font-headline font-bold text-base text-primary">
              {bus?.departure || "10:30 AM"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1.5">TICKETS</p>
            <p className="font-headline font-bold text-base text-on-surface">
              {passengers} Member{passengers > 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <div className="space-y-4">
        <Button 
          onClick={() => navigate("/e-ticket", { state: { bus, passengers } })} 
          className="w-full py-7 rounded-3xl bg-primary text-white font-headline font-black text-lg shadow-xl shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
        >
          <Download className="w-6 h-6" /> View E-Ticket
        </Button>

        <button 
          onClick={() => navigate("/")}
          className="w-full py-4 text-slate-400 font-bold text-sm tracking-wide"
        >
          Back to Dashboard
        </button>
      </div>
    </PageShell>
  );
};

export default ConfirmationPage;
