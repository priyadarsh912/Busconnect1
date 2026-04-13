import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, ChevronRight, Send, Camera, MessageSquare, Phone, Clock, Trash2, Plus, HelpCircle, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import PageShell from "../components/PageShell";
import { useState } from "react";
import NotificationsDrawer from "../components/NotificationsDrawer";

const grievances = [
  { id: "GRV-82910", title: "Refund for cancelled trip", date: "24 Oct, 2023", status: "PENDING", statusColor: "bg-orange-50 text-orange-600 border-orange-100", quote: "Our team is reviewing your bank statement..." },
  { id: "GRV-71245", title: "Bus delay (over 2 hours)", date: "15 Oct, 2023", status: "RESOLVED", statusColor: "bg-teal-50 text-teal-600 border-teal-100", quote: "Travel credit of $20 has been added..." },
];

const commonIssues = [
  { icon: Clock, label: "Bus tracking & schedule updates", color: "bg-blue-50 text-blue-600" },
  { icon: ShieldAlert, label: "Refund policy for cancellations", color: "bg-purple-50 text-purple-600" },
  { icon: Trash2, label: "Lost & found items", color: "bg-red-50 text-red-600" },
];

const HelpSupportPage = () => {
  const navigate = useNavigate();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [category, setCategory] = useState("Bus Schedule & Delays");

  return (
    <PageShell>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => navigate(-1)} 
          className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center transition-transform active:scale-95"
        >
          <ArrowLeft className="w-5 h-5 text-primary" />
        </button>
        <h1 className="font-headline font-bold text-xl tracking-tight text-on-surface">Help & Support</h1>
        <button
          onClick={() => setIsNotificationsOpen(true)}
          className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center relative transition-transform active:scale-95"
        >
          <Bell className="w-5 h-5 text-slate-400" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-white dark:border-slate-800" />
        </button>
      </div>

      <NotificationsDrawer
        open={isNotificationsOpen}
        onOpenChange={setIsNotificationsOpen}
      />

      <div className="space-y-8 pb-24">
        {/* Submit Complaint Card */}
        <section>
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-50 dark:border-slate-800 p-8 shadow-sm">
                <div className="flex items-start gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <HelpCircle className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="font-headline font-black text-xl text-on-surface tracking-tight">Submit Feedback</h2>
                        <p className="text-sm font-medium text-slate-400">Share your travel experience or logs</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Category</label>
                        <select 
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-5 text-sm font-bold text-on-surface focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                        >
                        <option>Bus Schedule & Delays</option>
                        <option>Refund Issues</option>
                        <option>Driver Complaint</option>
                        <option>Lost & Found</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Details</label>
                        <Textarea 
                            placeholder="Describe your issue with Ticket ID or Bus Number..." 
                            className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800 border-none p-5 min-h-[120px] text-sm font-medium focus-visible:ring-primary/20 shadow-none" 
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Attachment</label>
                        <button className="w-full border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl p-6 flex flex-col items-center gap-2 group transition-colors hover:border-primary/30">
                            <Camera className="w-6 h-6 text-slate-300 group-hover:text-primary/50 transition-colors" />
                            <p className="text-xs font-bold text-slate-400">Add ticket photo / screenshot</p>
                            <p className="text-[10px] text-slate-300 uppercase tracking-widest">Max size 5MB</p>
                        </button>
                    </div>

                    <Button className="w-full h-16 rounded-[1.5rem] font-headline font-black text-lg shadow-xl shadow-primary/20 transition-transform active:scale-95">
                        <Send className="w-5 h-5 mr-3" /> Submit Grievance
                    </Button>
                </div>
            </div>
        </section>

        {/* My Grievances Tracker */}
        <section className="space-y-4">
            <div className="flex items-center justify-between px-2">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Active Grievances</p>
                <button className="text-[10px] font-black uppercase tracking-widest text-primary">History</button>
            </div>
            
            <div className="grid gap-4">
                {grievances.map((g, idx) => (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + idx * 0.1 }}
                    key={g.id} 
                    className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-6 flex flex-col gap-4 shadow-sm"
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">{g.id}</p>
                            <h3 className="font-headline font-bold text-lg text-on-surface tracking-tight">{g.title}</h3>
                            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-1">Updated {g.date}</p>
                        </div>
                        <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl border ${g.statusColor}`}>{g.status}</span>
                    </div>
                    
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <p className="text-xs font-bold text-slate-500 italic opacity-80 leading-relaxed">"{g.quote}"</p>
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                    </div>
                </motion.div>
                ))}
            </div>
        </section>

        {/* Common Issues (Accordions) */}
        <section className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-2">Frequenty Asked</p>
            <div className="grid gap-3">
                {commonIssues.map((issue, i) => (
                    <button key={i} className="w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-50 dark:border-slate-800 p-5 flex items-center justify-between active:scale-[0.98] transition-all group">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl ${issue.color.split(' ')[0]} flex items-center justify-center transition-transform group-hover:scale-110`}>
                                <issue.icon className="w-5 h-5" />
                            </div>
                            <span className="font-headline font-bold text-sm text-on-surface tracking-tight">{issue.label}</span>
                        </div>
                        <Plus className="w-4 h-4 text-slate-300 group-hover:text-primary" />
                    </button>
                ))}
            </div>
        </section>

        {/* Still need help CTA */}
        <section className="bg-primary/5 dark:bg-primary/10 rounded-[2.5rem] p-10 text-center border border-primary/10">
            <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/30">
                <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-headline font-black text-2xl tracking-tighter text-on-surface mb-2">Still need help?</h3>
            <p className="text-slate-400 font-medium text-sm leading-relaxed mb-8 px-4">
               Our support champions are online 24/7 to solve your transit troubles.
            </p>
            <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-14 rounded-2xl font-bold border-primary text-primary hover:bg-primary/5">
                    Live Chat
                </Button>
                <Button className="h-14 rounded-2xl font-bold shadow-lg shadow-primary/20">
                    <Phone className="w-4 h-4 mr-2" /> Call Now
                </Button>
            </div>
        </section>
      </div>
    </PageShell>
  );
};

export default HelpSupportPage;

