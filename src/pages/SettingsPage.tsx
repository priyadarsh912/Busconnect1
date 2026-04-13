import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Globe, BellRing } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import PageShell from "../components/PageShell";
import { toast } from "sonner";
import { AppLanguage, useLanguage } from "../lib/language";
import { notificationService } from "../services/notificationService";

const languages = [
  { code: "en", name: "English", secondary: "System Default" },
  { code: "hi", name: "Hindi", secondary: "हिन्दी" },
  { code: "pa", name: "Punjabi", secondary: "ਪੰਜਾਬੀ" },
];

const radii = [
  { value: 500, label: "500m", desc: "Walking distance" },
  { value: 1000, label: "1km", desc: "Short commute" },
  { value: 2000, label: "2km", desc: "Mid range" },
  { value: 5000, label: "5km", desc: "Wide area" },
];

const SettingsPage = () => {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const [selected, setSelected] = useState<AppLanguage>(language);
  const [radius, setRadius] = useState<number>(1000);

  const handleApply = async () => {
    try {
        setLanguage(selected);
        await notificationService.updateNotifyRadius(radius);
        toast.success(t("settings.languageUpdated") || "Settings Updated", { 
            description: t("settings.languageUpdatedDescription") || "Your preferences have been saved." ,
            className: "bg-primary text-white font-bold"
        });
        navigate(-1);
    } catch (error: any) {
        toast.error("Update Failed", {
            description: error.message || "Failed to update notification radius."
        });
    }
  };

  return (
    <PageShell>
      <div className="flex items-center mb-10">
        <button 
          onClick={() => navigate(-1)} 
          className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center transition-transform active:scale-95"
        >
          <ArrowLeft className="w-5 h-5 text-primary" />
        </button>
        <h1 className="flex-1 text-center font-headline font-bold text-xl tracking-tight">{t("settings.title")}</h1>
        <div className="w-10" />
      </div>

      <div className="space-y-10 pb-32">
        {/* Language Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-primary" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t("settings.suggestedLanguages")}</p>
          </div>
          
          <div className="grid gap-3">
            {languages.map((lang, idx) => (
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={lang.code}
                onClick={() => setSelected(lang.code as AppLanguage)}
                className={`w-full flex items-center justify-between rounded-3xl border p-5 transition-all active:scale-[0.98] ${
                  selected === lang.code
                    ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-sm shadow-primary/5"
                    : "border-slate-100 dark:border-slate-700/50 bg-white dark:bg-[#1a2332]"
                }`}
              >
                <div className="text-left">
                  <p className={`font-headline font-bold text-base transition-colors ${selected === lang.code ? "text-primary" : "text-slate-900 dark:text-white"}`}>
                    {lang.name}
                  </p>
                  <p className="text-xs font-medium text-slate-400">{lang.secondary}</p>
                </div>
                {selected === lang.code && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-7 h-7 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20"
                  >
                    <Check className="w-4 h-4 text-white" />
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>
        </section>

        {/* Radius Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <BellRing className="w-4 h-4 text-primary" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">NOTIFICATION RADIUS</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {radii.map((r, idx) => (
              <motion.button
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + idx * 0.05 }}
                key={r.value}
                onClick={() => setRadius(r.value)}
                className={`flex flex-col items-center justify-center rounded-3xl border p-5 transition-all active:scale-[0.98] ${
                  radius === r.value
                    ? "border-primary bg-primary shadow-lg shadow-primary/20 text-white"
                    : "border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900"
                }`}
              >
                <span className="font-headline font-black text-xl tracking-tighter mb-0.5">{r.label}</span>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${radius === r.value ? "text-white/70" : "text-slate-400"}`}>
                    {r.desc}
                </span>
              </motion.button>
            ))}
          </div>
          <p className="text-[10px] text-center text-slate-400 font-medium px-6 leading-relaxed">
            Get notified when your bus enters this radius from your current location.
          </p>
        </section>
      </div>

      <div className="fixed bottom-24 left-0 right-0 px-6 max-w-md mx-auto z-50">
        <motion.div
           initial={{ y: 50, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ delay: 0.4 }}
        >
            <Button 
                onClick={handleApply} 
                className="w-full h-16 rounded-3xl text-lg font-headline font-black shadow-2xl shadow-primary/40 transition-transform active:scale-95"
            >
            {t("settings.applyChanges") || "Apply Changes"}
            </Button>
        </motion.div>
      </div>
    </PageShell>
  );
};

export default SettingsPage;

