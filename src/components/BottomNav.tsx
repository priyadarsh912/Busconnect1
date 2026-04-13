import { Home, Bus, Navigation, User, Activity } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/language";

const tabs = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Bus, label: "Routes", path: "/routes" },
  { icon: Navigation, label: "Tracking", path: "/tracking" },
  { icon: Activity, label: "Radar", path: "/radar" },
  { icon: User, label: "Profile", path: "/account" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const tabs = [
    { icon: Home, label: t("bottomNav.home"), path: "/" },
    { icon: Bus, label: t("bottomNav.routes"), path: "/routes" },
    { icon: Navigation, label: t("bottomNav.tracking"), path: "/tracking" },
    { icon: Activity, label: t("bottomNav.radar"), path: "/radar" },
    { icon: User, label: t("bottomNav.profile"), path: "/account" },
  ];

  // Hide on login and admin pages
  if (location.pathname === "/login" || location.pathname.startsWith("/admin"))
    return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 pb-3 pt-2 shadow-2xl">
      <div className="max-w-md mx-auto flex justify-between items-center px-4">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <motion.button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              whileTap={{ scale: 0.9 }}
              className={`flex flex-col items-center justify-center gap-1 w-16 h-[3.25rem] transition-all duration-300 ${
                isActive
                  ? "bg-primary text-white rounded-2xl shadow-md shadow-primary/20"
                  : "text-slate-400 hover:text-primary"
              }`}
            >
              <tab.icon
                className="w-5 h-5"
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={`text-[9px] font-black uppercase tracking-wider ${isActive ? "text-white" : ""}`}
              >
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};


function label(text: string) {
  return text.toUpperCase();
}

export default BottomNav;
