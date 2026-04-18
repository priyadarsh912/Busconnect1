import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const slides = [
  {
    title: "Precision live tracking",
    description: "View real-time bus locations and exact arrival times for every route.",
    image: "/onboarding/onboarding_track.png",
    accent: "bg-primary"
  },
  {
    title: "Seamless ticket booking",
    description: "Skip the queue and book your bus tickets in seconds with secure payments.",
    image: "/onboarding/onboarding_book.png",
    accent: "bg-tertiary"
  },
  {
    title: "Smart alerts & reminders",
    description: "Get notified before your bus arrives and stay updated on delays or route changes.",
    image: "/onboarding/onboarding_alerts.png",
    accent: "bg-secondary"
  }
];

const OnboardingPage = ({ onFinish }: { onFinish: () => void }) => {
  const [current, setCurrent] = useState(0);

  const next = () => {
    if (current === slides.length - 1) {
      localStorage.setItem("hasSeenOnboarding", "true");
      onFinish();
    } else {
      setCurrent(current + 1);
    }
  };

  const skip = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    onFinish();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-background flex flex-col font-body text-foreground select-none">
      {/* Editorial Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[40%] rounded-full bg-tertiary/5 blur-[100px]" />
      </div>

      <header className="flex justify-end p-6">
        <button 
          onClick={skip}
          className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-primary transition-colors"
        >
          Skip
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-sm flex flex-col items-center"
          >
            <div className="relative w-full aspect-square mb-12 flex items-center justify-center">
              {/* Decorative Pulse */}
              <motion.div 
                animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className={`absolute w-64 h-64 rounded-full ${current === 0 ? 'bg-primary' : current === 1 ? 'bg-tertiary' : 'bg-secondary'} blur-3xl`}
              />
              <img 
                src={slides[current].image} 
                alt={slides[current].title}
                className="w-full h-full object-contain relative z-10 drop-shadow-[0_24px_48px_rgba(0,0,0,0.1)]"
              />
            </div>

            <h1 className="font-headline font-extrabold text-4xl tracking-tight text-foreground leading-tight mb-4">
              {slides[current].title}
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed font-normal px-4">
              {slides[current].description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Indicator dots */}
        <div className="flex justify-center gap-2 mt-12">
          {slides.map((_, i) => (
            <div 
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? `w-8 bg-gradient-to-r from-primary to-primary-container` : 'w-4 bg-slate-200 dark:bg-slate-800'
              }`}
            />
          ))}
        </div>
      </main>

      <footer className="p-8 pb-12 w-full max-w-md mx-auto">
        <button 
          onClick={next}
          className="w-full py-5 rounded-full bg-gradient-to-br from-primary to-primary-container text-white font-headline font-bold text-lg shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 group"
        >
          {current === slides.length - 1 ? "Get Started" : "Continue"}
          <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
        </button>
        <p className="text-center mt-6 text-xs text-slate-400 font-bold uppercase tracking-widest">
          Step {current + 1} of 3
        </p>
      </footer>
    </div>
  );
};

export default OnboardingPage;
