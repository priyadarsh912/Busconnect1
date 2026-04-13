import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import { ArrowLeft, Eye, EyeOff, Phone, Mail, Lock, User, Bus } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useToast } from "../components/ui/use-toast";

import { authService } from "../services/authService";
import { analyticsService } from "../services/AnalyticsService";

const LoginPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mode, setMode] = useState<"phone" | "email">("phone");
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [inputValue, setInputValue] = useState(""); // Phone number (without +91) or Email
  const [password, setPassword] = useState("");

  const handleAuthAction = async () => {
    const finalValue = mode === "phone" ? `+91 ${inputValue}` : inputValue;

    if (isSignUp && !name.trim()) {
      toast({ title: "Missing Name", description: "Please enter your full name.", variant: "destructive" });
      return;
    }

    if (!inputValue) {
      toast({ title: "Missing Fields", description: `Please enter your ${mode === "phone" ? "phone number" : "email"}.`, variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      if (mode === "phone") {
        if (!isOtpSent) {
          const checkRes = await authService.checkPhoneStatus(finalValue);
          if (isSignUp && checkRes.exists) {
            toast({ title: "Account Exists", description: "Number registered. Please login.", variant: "destructive" });
            setIsLoading(false);
            return;
          }
          if (!isSignUp && !checkRes.exists) {
             // For a smoother UI, if login fails because user doesn't exist, we could switch to signup
             // but here we follow original logic
            toast({ title: "Account Not Found", description: "Number not registered. Please sign up.", variant: "destructive" });
            setIsLoading(false);
            return;
          }

          const res = await authService.sendPhoneOtp(finalValue);
          if (res.success) {
            setIsOtpSent(true);
            toast({ title: "OTP Sent", description: `Your OTP is: ${res.otp}` });
          } else {
            toast({ title: "Error", description: res.error, variant: "destructive" });
          }
        } else {
          const res = await authService.verifyPhoneOtp(otp, isSignUp ? name : undefined);
          if (res.success) {
            toast({ title: "Success", description: "Verification successful!" });
            analyticsService.logEvent(isSignUp ? 'user_registered' : 'user_logged_in', { method: 'phone' });
            navigate("/");
          } else {
            toast({ title: "Verification Failed", description: res.error, variant: "destructive" });
          }
        }
      } else {
        // Email Flow
        if (!password) {
          toast({ title: "Missing Password", description: "Please enter your password.", variant: "destructive" });
          setIsLoading(false);
          return;
        }

        if (isSignUp) {
          const res = await authService.signup(name, inputValue, password);
          if (res.success) {
            toast({ title: "Verify Email", description: "Verification email sent." });
            navigate("/");
          } else {
            toast({ title: "Signup Failed", description: res.error, variant: "destructive" });
          }
        } else {
          const res = await authService.login(inputValue, password);
          if (res.success) {
            toast({ title: "Welcome!", description: "Logged in successfully." });
            analyticsService.logEvent('user_logged_in', { method: 'email' });
            navigate("/");
          } else {
            toast({ title: "Login Failed", description: res.error, variant: "destructive" });
          }
        }
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-surface flex flex-col font-body text-on-surface">
      {/* Background Micro-Pulses */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[40%] rounded-full bg-tertiary/5 blur-[100px]" />
      </div>

      <header className="p-6">
         <button 
           aria-label="Go back"
           className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-center transition-transform active:scale-90" 
           onClick={() => {
             if (isOtpSent) setIsOtpSent(false);
             else if (mode === "email") setMode("phone");
             else navigate(-1);
           }}
         >
           <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
         </button>
      </header>

      <main className="flex-1 px-8 py-4 flex flex-col">
        {/* Branding */}
        <div className="mb-10 text-center md:text-left">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-primary to-primary-container shadow-lg text-white">
            <Bus className="w-8 h-8" />
          </div>
          <h1 className="font-headline font-extrabold text-4xl text-on-surface tracking-tight mb-3 leading-[1.1]">
            Welcome to <span className="bg-gradient-to-br from-primary to-primary-container bg-clip-text text-transparent italic">BusConnect</span>
          </h1>
          <p className="text-on-surface-variant text-base font-medium leading-relaxed max-w-sm">
            {isSignUp ? "Create an account to start your reimagined daily journey." : "Your daily commute, reimagined with real-time intelligence."}
          </p>
        </div>

        {/* Input Form Card */}
        <div className="glass-panel p-8 rounded-3xl shadow-[0_24px_48px_rgba(0,0,0,0.04)] border border-white/40 bg-white/70 backdrop-blur-xl">
          <AnimatePresence mode="wait">
            {!isOtpSent ? (
               <motion.div
                 key={mode}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 className="space-y-6"
               >
                 {isSignUp && (
                   <div className="space-y-1.5">
                     <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Full Name</label>
                     <div className="relative group">
                       <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                       <Input 
                         placeholder="Enter your name" 
                         className="pl-14 pr-6 py-4 bg-slate-50 border-none rounded-full h-14 text-base focus:ring-4 focus:ring-primary/10 shadow-inner"
                         value={name}
                         onChange={(e) => setName(e.target.value)}
                       />
                     </div>
                   </div>
                 )}

                 {mode === "phone" ? (
                   <div className="space-y-1.5">
                     <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Mobile Number</label>
                     <div className="relative group">
                       <span className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">+91</span>
                       <Input 
                         type="tel"
                         maxLength={10}
                         placeholder="9876543210" 
                         className="pl-16 pr-6 py-4 bg-slate-50 border-none rounded-full h-14 text-lg font-medium focus:ring-4 focus:ring-primary/10 shadow-inner"
                         value={inputValue}
                         onChange={(e) => setInputValue(e.target.value)}
                       />
                     </div>
                   </div>
                 ) : (
                   <div className="space-y-4">
                     <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Email Address</label>
                       <div className="relative group">
                         <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                         <Input 
                           type="email"
                           placeholder="you@example.com" 
                           className="pl-14 pr-6 py-4 bg-slate-50 border-none rounded-full h-14 text-base focus:ring-4 focus:ring-primary/10 shadow-inner"
                           value={inputValue}
                           onChange={(e) => setInputValue(e.target.value)}
                         />
                       </div>
                     </div>
                     <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Password</label>
                       <div className="relative group">
                         <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                         <Input 
                           type={showPassword ? "text" : "password"}
                           placeholder="••••••••" 
                           className="pl-14 pr-14 h-14 bg-slate-50 border-none rounded-full text-base focus:ring-4 focus:ring-primary/10 shadow-inner"
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                         />
                         <button 
                           onClick={() => setShowPassword(!showPassword)}
                           className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400"
                         >
                           {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                         </button>
                       </div>
                     </div>
                   </div>
                 )}

                 <Button 
                   onClick={handleAuthAction}
                   disabled={isLoading}
                   className="w-full py-7 rounded-full bg-gradient-to-br from-primary to-primary-container text-white font-headline font-bold text-lg shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2 group"
                 >
                   {isLoading ? "Processing..." : mode === "phone" ? "Send OTP" : (isSignUp ? "Sign Up" : "Login")}
                   {!isLoading && <ArrowLeft className="w-5 h-5 rotate-180 transition-transform group-hover:translate-x-1" />}
                 </Button>

                 <div className="relative flex items-center py-2">
                   <div className="flex-grow h-[1px] bg-slate-100" />
                   <span className="px-4 text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none">Or continue with</span>
                   <div className="flex-grow h-[1px] bg-slate-100" />
                 </div>

                 <Button 
                   variant="outline"
                   onClick={() => {
                     setMode(mode === "phone" ? "email" : "phone");
                     setInputValue("");
                   }}
                   className="w-full py-6 rounded-full border-slate-100 bg-white text-on-surface font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 active:scale-95 transition-all"
                 >
                   {mode === "phone" ? <Mail className="w-4 h-4 text-primary" /> : <Phone className="w-4 h-4 text-primary" />}
                   {mode === "phone" ? "Email & Password" : "Mobile Number"}
                 </Button>
               </motion.div>
            ) : (
               <motion.div
                 key="otp"
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="space-y-6 text-center"
               >
                 <div className="space-y-2">
                   <h3 className="font-headline font-bold text-xl">Verification Code</h3>
                   <p className="text-sm text-slate-500">Enter the 6-digit code sent to your phone.</p>
                 </div>

                 <Input 
                   placeholder="123456" 
                   maxLength={6} 
                   className="text-center h-16 text-3xl font-black tracking-[0.5em] rounded-2xl bg-slate-50 border-none shadow-inner" 
                   value={otp} 
                   onChange={(e) => setOtp(e.target.value)} 
                 />

                 <Button 
                   onClick={handleAuthAction}
                   disabled={isLoading}
                   className="w-full h-14 rounded-full bg-primary text-white font-bold shadow-lg"
                 >
                   {isLoading ? "Verifying..." : "Verify OTP"}
                 </Button>

                 <button 
                   onClick={() => setIsOtpSent(false)} 
                   className="text-xs font-bold text-primary uppercase tracking-widest"
                 >
                   Edit Phone Number
                 </button>
               </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="mt-10 text-center text-sm font-medium text-slate-500">
          {isSignUp ? "Already have an account?" : "New to the city?"} 
          <button 
            onClick={() => {
              setIsSignUp(!isSignUp);
              setIsOtpSent(false);
            }} 
            className="text-primary font-bold ml-1 hover:underline decoration-2 underline-offset-4"
          >
            {isSignUp ? "Log In" : "Create Account"}
          </button>
        </p>

        {/* Support */}
        <div className="mt-auto pt-10 pb-4 flex justify-center gap-8 text-slate-400">
          <div className="flex items-center gap-1.5 cursor-pointer hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-lg">help_outline</span>
            <span className="text-[10px] font-black uppercase tracking-widest">Support</span>
          </div>
          <div className="flex items-center gap-1.5 cursor-pointer hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-lg">language</span>
            <span className="text-[10px] font-black uppercase tracking-widest">Language</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
