import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { ArrowLeft, Eye, EyeOff, Phone, Mail, Lock, User } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useToast } from "../components/ui/use-toast";
import busHero from "../assets/bus-hero.jpg";

import { authService } from "../services/authService";
import { analyticsService } from "../services/AnalyticsService";

const LoginPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSignUp, setIsSignUp] = useState(true);
  const [tab, setTab] = useState<"phone" | "email">("phone");
  const [showPassword, setShowPassword] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState("");
  const [inputValue, setInputValue] = useState("+91 ");
  const [password, setPassword] = useState("");

  const handleAuthAction = async () => {
    // 1. Validation
    if (isSignUp && !name.trim()) {
      toast({ title: "Missing Name", description: "Please enter your full name.", variant: "destructive" });
      return;
    }

    if (!inputValue) {
      toast({ title: "Missing Fields", description: `Please enter your ${tab === "phone" ? "phone number" : "email"}.`, variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      if (tab === "phone") {
        if (!isOtpSent) {
          // Check existence based on signup vs login
          const checkRes = await authService.checkPhoneStatus(inputValue);
          if (isSignUp && checkRes.exists) {
            toast({ title: "Account Exists", description: "This phone number is already registered. Please login.", variant: "destructive" });
            setIsLoading(false);
            return;
          }
          if (!isSignUp && !checkRes.exists) {
            toast({ title: "Account Not Found", description: "This phone number is not registered. Please sign up.", variant: "destructive" });
            setIsLoading(false);
            return;
          }

          // Step 1: Send OTP
          const res = await authService.sendPhoneOtp(inputValue);
          if (res.success) {
            setIsOtpSent(true);
            toast({ title: "OTP Sent", description: `Your OTP is: ${res.otp} (Check your phone in production)` });
          } else {
            toast({ title: "Error", description: res.error, variant: "destructive" });
          }
        } else {
          // Step 2: Verify OTP
          const res = await authService.verifyPhoneOtp(otp, isSignUp ? name : undefined);
          if (res.success) {
            toast({ title: "Success", description: "Phone number verified!" });
            analyticsService.logEvent(isSignUp ? 'user_registered' : 'user_logged_in', { method: 'phone' });
            navigate("/");
          } else {
            toast({ title: "Verification Failed", description: res.error, variant: "destructive" });
          }
        }
      } else {
        // Email Auth
        if (!password) {
          toast({ title: "Missing Password", description: "Please enter your password.", variant: "destructive" });
          setIsLoading(false);
          return;
        }

        if (isSignUp) {
          const res = await authService.signup(name, inputValue, password);
          if (res.success) {
            toast({ title: "Verify Email", description: "A verification email has been sent to your address." });
            navigate("/");
          } else {
            toast({ title: "Signup Failed", description: res.error, variant: "destructive" });
          }
        } else {
          const res = await authService.login(inputValue, password);
          if (res.success) {
            toast({ title: "Welcome!", description: "You are now logged in." });
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
    <div className="max-w-md mx-auto min-h-screen bg-surface flex flex-col pb-10">
      <div className="flex items-center px-6 pt-6">
        <button className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center transition-transform active:scale-90" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </button>
        <h1 className="flex-1 text-center font-headline font-bold text-xl">{isSignUp ? "Sign Up" : "Login"}</h1>
        <div className="w-10" />
      </div>

      <div className="px-6 pt-6">
        <div className="relative h-48 w-full rounded-2xl overflow-hidden shadow-lg group">
          <img src={busHero} alt="Bus" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-4 left-6">
            <h2 className="font-headline text-3xl font-extrabold text-white">Join the Journey</h2>
            <p className="text-white/80 text-sm font-medium">Safe. Reliable. Smart.</p>
          </div>
        </div>
      </div>

      <div className="px-6 pt-8 flex-1">
        <div className="flex flex-col mb-8">
          <h2 className="text-3xl font-headline font-extrabold tracking-tight text-on-surface">
            {isSignUp ? "Create an account" : "Welcome back"}
          </h2>
          <p className="text-slate-500 font-medium mt-1">
            {tab === "phone" ? (isSignUp ? "Sign up with your mobile number" : "Login with your mobile number") : (isSignUp ? "Sign up with your email" : "Login with your email")}
          </p>
        </div>

        {/* Tabs */}
        {!isOtpSent && (
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-2xl p-1.5 mb-6">
            <button
              onClick={() => { 
                setTab("phone"); 
                setInputValue("+91 ");
              }}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${tab === "phone" ? "bg-white dark:bg-slate-700 text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
            >
              Phone Number
            </button>
            <button
              onClick={() => { 
                setTab("email"); 
                setInputValue("");
              }}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${tab === "email" ? "bg-white dark:bg-slate-700 text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
            >
              Email ID
            </button>
          </div>
        )}

        <div className="space-y-5">
          {isSignUp && !isOtpSent && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Full Name</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <User className="w-5 h-5" />
                </span>
                <Input
                  placeholder="Alice Johnson"
                  className="pl-12 h-14 rounded-2xl bg-white dark:bg-slate-800 border-none shadow-sm text-base"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
          )}

          {!isOtpSent ? (
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">
                {tab === "phone" ? "Phone Number" : "Email Address"}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  {tab === "phone" ? <Phone className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                </span>
                <Input
                  type={tab === "phone" ? "tel" : "email"}
                  autoComplete={tab === "phone" ? "tel" : "email"}
                  placeholder={tab === "phone" ? "9876543210" : "you@example.com"}
                  className="pl-12 h-14 rounded-2xl bg-white dark:bg-slate-800 border-none shadow-sm text-base"
                  value={inputValue}
                  onChange={(e) => {
                    let val = e.target.value;
                    if (tab === "phone") {
                      if (!val.startsWith("+91 ")) {
                        val = "+91 " + val.replace(/^\+91\s?/, "").replace(/\D/g, "");
                      } else {
                        const prefix = "+91 ";
                        const rest = val.slice(prefix.length).replace(/\D/g, "");
                        val = prefix + rest;
                      }
                      if (val.length > 14) val = val.slice(0, 14);
                    }
                    setInputValue(val);
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="animate-in zoom-in duration-300">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Enter 6-digit OTP</label>
              <Input
                placeholder="123456"
                maxLength={6}
                className="text-center h-16 text-2xl font-bold tracking-[1em] rounded-2xl bg-white dark:bg-slate-800 border-none shadow-md"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <button 
                onClick={() => setIsOtpSent(false)} 
                className="mt-3 text-xs text-primary font-bold uppercase tracking-wider"
              >
                Change Phone Number
              </button>
            </div>
          )}

          {tab === "email" && (
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Password</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock className="w-5 h-5" />
                </span>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-12 pr-12 h-14 rounded-2xl bg-white dark:bg-slate-800 border-none shadow-sm text-base"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {!isSignUp && (
                <p className="text-right mt-2">
                  <button className="text-xs text-primary font-bold uppercase tracking-wider">Forgot Password?</button>
                </p>
              )}
            </div>
          )}
        </div>

        <motion.div whileTap={{ scale: 0.98 }} className="mt-8">
          <Button 
            onClick={handleAuthAction} 
            disabled={isLoading}
            className="w-full h-14 text-lg font-headline font-extrabold rounded-2xl bg-gradient-to-br from-primary to-primary-container shadow-lg shadow-primary/20"
          >
            {isLoading ? "Processing..." : (isOtpSent ? "Verify OTP" : (isSignUp ? "Sign Up" : "Login"))}
          </Button>
        </motion.div>

        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Social Login</span>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
        </div>

        <div className="flex gap-4">
          <Button variant="outline" className="w-full h-14 rounded-2xl font-bold bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 shadow-sm" onClick={() => navigate("/admin-login")}>
            Admin Access
          </Button>
        </div>

        <p className="text-center text-sm text-slate-500 font-medium mt-8 mb-10">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setIsOtpSent(false);
            }}
            className="text-primary font-bold"
          >
            {isSignUp ? "Log In" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );

};

export default LoginPage;
