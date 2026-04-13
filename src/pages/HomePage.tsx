import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Menu, Bell, Bus, Lock, MapPin, Map, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "../components/ui/input";
import PageShell from "../components/PageShell";
import { ThemeToggle } from "../components/ThemeToggle";
import NotificationsDrawer from "../components/NotificationsDrawer";
import chandigarhImg from "../assets/chandigarh.jpg";
import punjabImg from "../assets/punjab.jpg";
import haryanaImg from "../assets/haryana.jpg";
import delhiImg from "../assets/delhi.png";
import upImg from "../assets/uttar-pradesh.png";
import ukImg from "../assets/uttarakhand.png";
import hpImg from "../assets/himachal-pradesh.png";
import rajasthanImg from "../assets/rajasthan.png";
import jkImg from "../assets/jammu-kashmir.png";
import mpImg from "../assets/madhya-pradesh.png";
import { useLanguage } from "../lib/language";
import { RouteHistoryManager } from "../utils/RouteHistoryManager";

const states = [
  { name: "Chandigarh", subtitleKey: "home.state.chandigarh", img: chandigarhImg, status: "ACTIVE" },
  { name: "Punjab", subtitleKey: "home.state.punjab", img: punjabImg, status: "AVAILABLE" },
  { name: "Haryana", subtitleKey: "home.state.haryana", img: haryanaImg, status: "AVAILABLE" },
  { name: "Delhi", subtitleKey: "home.state.delhi", img: delhiImg, status: "AVAILABLE" },
  { name: "Uttar Pradesh", subtitleKey: "home.state.uttarPradesh", img: upImg, status: "AVAILABLE" },
  { name: "Uttarakhand", subtitleKey: "home.state.uttarakhand", img: ukImg, status: "UPCOMING" },
  { name: "Himachal Pradesh", subtitleKey: "home.state.himachalPradesh", img: hpImg, status: "UPCOMING" },
  { name: "Rajasthan", subtitleKey: "home.state.rajasthan", img: rajasthanImg, status: "UPCOMING" },
  { name: "Jammu & Kashmir", subtitleKey: "home.state.jammuKashmir", img: jkImg, status: "UPCOMING" },
  { name: "Madhya Pradesh", subtitleKey: "home.state.madhyaPradesh", img: mpImg, status: "UPCOMING" },
];

const stagger = {
  animate: {
    transition: { staggerChildren: 0.08 },
  },
};

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

const HomePage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    try {
      RouteHistoryManager.syncWithCloud().catch(err => 
        console.warn("HomePage: Cloud sync deferred", err)
      );
    } catch (e) {
      console.warn("HomePage: Sync init failed", e);
    }
  }, []);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    navigate("/route-search", { state: { initialSearch: searchQuery } });
  };

  return (
    <PageShell>
      {/* Dynamic Header */}
      <motion.div variants={fadeUp} initial="initial" animate="animate" className="flex items-center justify-between mb-10 pt-4 px-1">
        <div className="flex flex-col">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary/60 mb-1">Transit Navigator</p>
          <h1 className="text-3xl font-headline font-black tracking-tighter text-on-surface">
            Where to <span className="bg-gradient-to-br from-primary to-primary-container bg-clip-text text-transparent italic">Next?</span>
          </h1>
        </div>
        <div className="flex gap-3">
          <ThemeToggle />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsNotificationsOpen(true)}
            className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-center relative transition-transform"
          >
            <Bell className="w-5 h-5 text-slate-400" />
            <span className="absolute top-3.5 right-3.5 w-2 h-2 bg-primary rounded-full border-2 border-white dark:border-slate-900" />
          </motion.button>
        </div>
      </motion.div>

      <NotificationsDrawer open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen} />

      {/* Modern Search Bar */}
      <motion.div variants={fadeUp} initial="initial" animate="animate" className="relative group mb-10">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-primary-container/10 rounded-[2rem] blur opacity-25 group-focus-within:opacity-100 transition duration-1000 group-hover:duration-200" />
        <div className="relative flex items-center h-16 bg-white dark:bg-slate-900 rounded-[1.5rem] px-5 shadow-sm border border-slate-50 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors" onClick={handleSearch} />
          <Input
            placeholder={t("home.searchPlaceholder") || "Search routes, buses or stops..."}
            className="border-none focus-visible:ring-0 text-base font-bold text-on-surface bg-transparent h-full placeholder:text-slate-300 placeholder:font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
          />
          <div className="flex gap-2">
            <div className="w-[1px] h-6 bg-slate-100 dark:bg-slate-800 mx-2" />
            <Map className="w-5 h-5 text-slate-300 hover:text-primary transition-colors cursor-pointer" />
          </div>
        </div>
      </motion.div>

      {/* Quick Actions Grid */}
      <motion.div variants={stagger} initial="initial" animate="animate" className="grid grid-cols-2 gap-4 mb-12">
        <motion.div
          variants={fadeUp}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/live-radar")}
          className="group bg-gradient-to-br from-primary to-primary-container rounded-[2.5rem] p-6 text-white shadow-xl shadow-primary/20 flex flex-col justify-between h-44 cursor-pointer relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform duration-700" />
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
            <Bus className="w-6 h-6 text-white" />
          </div>
          <div className="relative z-10">
            <h4 className="font-headline font-black text-xl tracking-tight leading-tight">Live Radar</h4>
            <p className="text-white/70 text-[10px] font-black uppercase tracking-widest mt-1">Track nearby buses</p>
          </div>
        </motion.div>

        <motion.div
          variants={fadeUp}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/nearby-buses")}
          className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 text-on-surface shadow-sm border border-slate-50 dark:border-slate-800 flex flex-col justify-between h-44 cursor-pointer"
        >
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
            <MapPin className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h4 className="font-headline font-black text-xl tracking-tight leading-tight">Nearby</h4>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Stops & stations</p>
          </div>
        </motion.div>
      </motion.div>

      {/* States Section Header */}
      <div className="flex items-center justify-between mb-6 px-1">
        <motion.h2 variants={fadeUp} initial="initial" animate="animate" className="font-headline font-black text-xl tracking-tight">Active Regions</motion.h2>
        <button className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2 hover:bg-primary/5 px-3 py-1.5 rounded-full transition-colors">
          Explore All <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Scrollable States Grid */}
      <motion.div variants={stagger} initial="initial" animate="animate" className="grid grid-cols-2 gap-5 mb-12">
        {states.map((state) => (
          <motion.button
            key={state.name}
            variants={fadeUp}
            whileHover={state.status !== "UPCOMING" ? { y: -8, transition: { duration: 0.4 } } : {}}
            whileTap={state.status !== "UPCOMING" ? { scale: 0.98 } : {}}
            onClick={() => {
              if (state.status !== "UPCOMING") {
                localStorage.setItem("selectedState", state.name);
                navigate("/trip-type", { state: { state: state.name } });
              }
            }}
            className={`relative rounded-[2.5rem] overflow-hidden h-52 group bg-slate-100 dark:bg-slate-800 border border-slate-50 dark:border-slate-800 shadow-sm ${state.status === "UPCOMING" ? "cursor-not-allowed opacity-40" : ""}`}
          >
            <img src={state.img} alt={state.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-out" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />

            {state.status === "ACTIVE" && (
              <span className="absolute top-4 right-4 bg-primary text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-lg border border-white/20">
                ACTIVE
              </span>
            )}

            {state.status === "UPCOMING" && (
              <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md text-white text-[9px] font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-white/20 uppercase tracking-widest">
                <Lock className="w-2.5 h-2.5" />
                SOON
              </div>
            )}

            <div className="absolute bottom-6 left-6 text-left">
              <p className="text-white font-headline font-black text-xl tracking-tight leading-none mb-1">{state.name}</p>
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest leading-none">
                {t(state.subtitleKey)}
              </p>
            </div>
          </motion.button>
        ))}
      </motion.div>

      {/* Partnership Banner */}
      <motion.div
        variants={fadeUp}
        initial="initial" animate="animate"
        className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 text-center border border-slate-50 dark:border-slate-800 shadow-sm mb-24 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl opacity-50" />
        <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
          <Bus className="w-8 h-8 text-primary" />
        </div>
        <h3 className="font-headline font-black text-2xl tracking-tight mb-2">Smart Commute Program</h3>
        <p className="text-sm font-medium text-slate-400 max-w-xs mx-auto mb-8">
            Connect your corporate ID for exclusive benefits and real-time transit alerts.
        </p>
        <button className="h-14 px-8 rounded-2xl bg-surface dark:bg-slate-800 font-black text-xs uppercase tracking-widest text-primary border border-primary/20 hover:bg-primary hover:text-white transition-all">
            Link Account
        </button>
      </motion.div>
    </PageShell>
  );
};

export default HomePage;

