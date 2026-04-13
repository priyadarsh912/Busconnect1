import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, ChevronRight, Settings, HelpCircle,
  LogOut, BookOpen, MapPin, User, Pencil, X, Save, Mail, Moon, Sun,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";
import PageShell from "../components/PageShell";
import { authService } from "../services/authService";
import { busService } from "../services/busService";
import { useLanguage } from "../lib/language";
import { useTheme } from "../components/theme-provider";

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  password: string;
}

const DEFAULT_PROFILE: UserProfile = {
  name: "Johnathan Smith",
  email: "johnathan.smith@email.com",
  phone: "+91 98765 43210",
  password: "••••••••",
};

const AccountPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { theme, setTheme } = useTheme();

  const travelItems = [
    { icon: BookOpen, label: t("account.myBookings"), path: "/my-bookings", color: "bg-blue-50 text-blue-600" },
    { icon: MapPin, label: t("account.savedRoutes"), path: "/routes", color: "bg-teal-50 text-teal-600" },
  ];

  const appItems = [
    { icon: theme === 'dark' ? Sun : Moon, label: theme === 'dark' ? "Light Mode" : "Dark Mode", action: () => setTheme(theme === 'dark' ? 'light' : 'dark'), color: "bg-indigo-50 text-indigo-600", isToggle: true },
    { icon: Settings, label: t("account.settings"), path: "/settings", color: "bg-slate-50 text-slate-600" },
    { icon: HelpCircle, label: t("account.helpSupport"), path: "/help", color: "bg-orange-50 text-orange-600" },
  ];

  // ─── Profile state ───
  const [profile, setProfile] = useState<UserProfile>(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      const isEmail = currentUser.phoneOrEmail.includes("@");
      return {
        name: currentUser.name || "Traveller",
        email: isEmail ? currentUser.phoneOrEmail : "",
        phone: !isEmail ? currentUser.phoneOrEmail : "",
        password: "••••••••",
      };
    }
    return DEFAULT_PROFILE;
  });

  // Fetch real profile from Supabase on mount
  useEffect(() => {
    const fetchProfile = async () => {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        const supabaseProfile = await busService.getUserProfile(currentUser.id);
        if (supabaseProfile) {
          setProfile(prev => ({
            ...prev,
            name: supabaseProfile.name || prev.name,
            email: supabaseProfile.email || prev.email,
            phone: supabaseProfile.phone || prev.phone,
          }));
        }
      }
    };
    fetchProfile();
  }, []);

  // ─── Edit mode ───
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<UserProfile>(profile);
  const [showPassword, setShowPassword] = useState(false);

  // Persist whenever profile changes
  useEffect(() => {
    localStorage.setItem("userProfile", JSON.stringify(profile));
  }, [profile]);

  const handleStartEdit = () => {
    setDraft(profile);
    setEditing(true);
    setShowPassword(false);
  };

  const handleCancelEdit = () => {
    setEditing(false);
  };

  const handleSave = () => {
    if (!draft.name.trim()) { toast.error(t("account.nameRequired")); return; }
    if (!draft.email.trim() || !draft.email.includes("@")) { toast.error(t("account.validEmailRequired")); return; }
    if (!draft.phone.trim()) { toast.error(t("account.phoneRequired")); return; }

    setProfile(draft);
    setEditing(false);
    toast.success(t("account.profileUpdated"));

    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      busService.syncUser(currentUser.id, {
        name: draft.name,
        email: draft.email,
        phone: draft.phone,
      }).catch(err => console.error("Profile Supabase sync:", err));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userProfile"); 
    authService.logout();
    toast.success(t("account.loggedOut"));
    navigate("/login");
  };

  return (
    <PageShell>
      {/* Header & Hero Section */}
      <div className="relative -mx-6 -mt-6 mb-8 px-6 pt-12 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-container" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
        
        <div className="relative z-10 flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate("/")} 
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-white font-headline font-black text-xl tracking-tighter uppercase">Account</h1>
          <div className="w-10" />
        </div>

        {/* Profile Card Overlay */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute -bottom-6 left-6 right-6 bg-white dark:bg-slate-900 rounded-[2rem] shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-white/20 p-6 flex items-center gap-5"
        >
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border border-primary/10 overflow-hidden">
                <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                    <User className="w-10 h-10 text-primary stroke-[1.5px]" />
                </div>
            </div>
            {!editing && (
                <button
                onClick={handleStartEdit}
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900 transition-transform active:scale-90"
                >
                <Pencil className="w-4 h-4 text-white" />
                </button>
            )}
          </div>
          
          <div className="flex-1">
            <h2 className="font-headline font-black text-2xl text-on-surface tracking-tighter leading-none mb-1">{profile.name}</h2>
            <div className="flex items-center gap-1.5 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                <p className="text-slate-500 dark:text-slate-400 font-bold text-sm tracking-tight">{profile.phone || profile.email}</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-12 space-y-8">
        {/* Edit Form (if active) */}
        {editing && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-8 pt-10 shadow-sm"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-headline font-bold text-xl tracking-tight text-on-surface">{t('account.editProfile')}</h3>
                <button onClick={handleCancelEdit} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">{t('account.fullName')}</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
                    <Input
                      value={draft.name}
                      onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                      className="pl-12 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none shadow-none text-base font-medium focus-visible:ring-primary/20"
                      placeholder="Enter your name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">{t('account.email')}</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
                    <Input
                      type="email"
                      value={draft.email}
                      onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                      className="pl-12 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none shadow-none text-base font-medium focus-visible:ring-primary/20"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                    <Button variant="ghost" onClick={handleCancelEdit} className="h-14 rounded-2xl font-bold text-slate-500">
                        {t('action.cancel')}
                    </Button>
                    <Button onClick={handleSave} className="h-14 rounded-2xl font-headline font-bold text-base shadow-lg shadow-primary/20">
                        <Save className="w-5 h-5 mr-2" /> {t('action.save')}
                    </Button>
                </div>
              </div>
            </motion.div>
        )}

        {/* Travel & App Management Section */}
        <div className="space-y-6">
            <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">{t("account.travelManagement")}</p>
                <div className="grid gap-3">
                    {travelItems.map((item) => (
                        <button 
                            key={item.label} 
                            onClick={() => navigate(item.path)} 
                            className="bg-white dark:bg-slate-900 p-3.5 rounded-3xl border border-slate-50 dark:border-slate-800 flex items-center gap-4 transition-all active:scale-[0.98] hover:shadow-md group"
                        >
                            <div className={`w-10 h-10 rounded-2xl ${item.color.split(' ')[0]} flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm shadow-black/5`}>
                                <item.icon className="w-5 h-5" />
                            </div>
                            <span className="flex-1 font-headline font-bold text-sm text-on-surface tracking-tight text-left">{item.label}</span>
                            <div className="p-1 px-3 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center gap-1">
                                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">{t("account.application")}</p>
                <div className="grid gap-3">
                    {appItems.map((item: any) => (
                        <button 
                            key={item.label} 
                            onClick={() => item.action ? item.action() : navigate(item.path)} 
                            className="bg-white dark:bg-slate-900 p-3.5 rounded-3xl border border-slate-50 dark:border-slate-800 flex items-center gap-4 transition-all active:scale-[0.98] hover:shadow-md group"
                        >
                            <div className={`w-10 h-10 rounded-2xl ${item.color.split(' ')[0]} flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm shadow-black/5`}>
                                <item.icon className="w-5 h-5" />
                            </div>
                            <span className="flex-1 font-headline font-bold text-sm text-on-surface tracking-tight text-left">{item.label}</span>
                            {item.isToggle ? (
                                <div className={`w-10 h-5 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-primary' : 'bg-slate-200'}`}>
                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${theme === 'dark' ? 'left-6' : 'left-1'}`} />
                                </div>
                            ) : (
                                <div className="p-1 px-3 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center gap-1">
                                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* Logout Section */}
        <div className="pt-4 pb-12">
            <button
                onClick={handleLogout}
                className="w-full h-16 rounded-3xl border border-red-100 dark:border-red-900/20 bg-red-50/30 dark:bg-red-900/5 flex items-center justify-center gap-3 text-red-600 font-headline font-black text-lg transition-all active:scale-[0.98] hover:bg-red-50 dark:hover:bg-red-900/10"
            >
                <LogOut className="w-5 h-5" /> {t("account.logOut")}
            </button>
        </div>
      </div>
    </PageShell>
  );
};

export default AccountPage;
