import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [step, setStep] = useState(0); // 0: logo, 1: quote

  useEffect(() => {
    // Step 0: Show logo for 1.5s
    const timer1 = setTimeout(() => {
      setStep(1);
    }, 1800);

    // Final: Finish after 3.5s
    const timer2 = setTimeout(() => {
      onFinish();
    }, 4000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);


  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-surface overflow-hidden"
    >
      {/* Editorial Background */}
      <div className="absolute inset-0 -z-10 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_0%_0%,#b2ebf2_0%,transparent_50%),radial-gradient(circle_at_100%_100%,#e0f2f1_0%,transparent_50%)]" />
      </div>

      <div className="relative z-10 w-full max-w-lg px-8 flex flex-col items-center text-center">
        <AnimatePresence mode="wait">
          {step === 0 ? (
            <motion.div
              key="logo-step"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-800 shadow-sm mb-12 border border-slate-100 dark:border-slate-800">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(0,107,125,0.4)]" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Live in your city</span>
              </div>

              <div className="relative mb-10 group">
                <motion.div 
                   animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                   }}
                   transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                   className="absolute -inset-8 bg-primary/10 rounded-full blur-3xl"
                />
                <img 
                  src="/bus_app_icon.png" 
                  alt="BusConnect Logo" 
                  className="w-32 h-32 object-contain relative z-10 drop-shadow-[0_20px_50px_rgba(0,107,125,0.2)]"
                />
              </div>

              <h1 className="font-headline font-black text-6xl tracking-tighter leading-tight mb-4 text-on-surface">
                Bus<span className="bg-gradient-to-br from-primary to-primary-container bg-clip-text text-transparent italic">Connect</span>
              </h1>
              
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: 48 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="h-1 bg-primary rounded-full mt-2"
              />
            </motion.div>
          ) : (
            <motion.div
              key="quote-step"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-center"
            >
               <h2 className="font-headline font-extrabold text-4xl md:text-5xl tracking-tight leading-tight text-on-surface text-center mb-6">
                Smarter Routes.<br />
                <span className="bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent">Better Commutes.</span>
              </h2>
              <p className="font-body text-slate-400 font-medium text-lg max-w-xs leading-relaxed">
                Experience the next generation of urban transit at your fingertips.
              </p>

              {/* Progress Tracker */}
              <div className="mt-16 w-24 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                <motion.div 
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-primary to-transparent"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Decorative Footer Elements */}
      <footer className="absolute bottom-12 flex items-center gap-6 text-slate-300 font-black text-[10px] uppercase tracking-[0.3em]">
        <span>Precision</span>
        <div className="w-1.5 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800" />
        <span>Simplicity</span>
        <div className="w-1.5 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800" />
        <span>Efficiency</span>
      </footer>
    </motion.div>
  );
};

export default SplashScreen;

