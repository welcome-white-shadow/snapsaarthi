"use client";

import { useState } from "react";
import { motion as m, AnimatePresence as AP } from "framer-motion";
import { Camera, X, Mail, Lock, User, Briefcase, CheckCircle2, Shield, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "./Toaster";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "register";
}

export default function AuthModal({ isOpen, onClose, initialMode = "register" }: AuthModalProps) {
  const router = useRouter();
  const { success, error } = useToast();
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    studioName: "",
    studioSize: "solo",
  });

  const prevStep = () => {
    if (step === 1.5) setStep(1);
    else if (step === 2) setStep(1.5);
    else if (step === 3) setStep(2);
  };

  const sendOTP = async () => {
    if (!formData.email) return;
    setLoading(true);
    
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);

    const emailHtml = `
      <div style="background-color: #020202; color: #ffffff; font-family: sans-serif; padding: 40px; border-radius: 20px; max-width: 600px; margin: auto; border: 1px solid #1e1b4b;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-size: 28px; font-weight: 900; margin: 0; letter-spacing: -1px; font-style: italic;">SnapSaarthi <span style="color: #4f46e5;">OS</span></h1>
        </div>
        <div style="background-color: #0a0a0a; border: 1px solid #ffffff10; padding: 30px; border-radius: 24px; text-align: center;">
          <p style="color: #94a3b8; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; font-weight: 800; margin-bottom: 10px;">Verification Code</p>
          <h2 style="font-size: 48px; font-weight: 900; color: #ffffff; margin: 0; letter-spacing: 5px;">${newOtp}</h2>
          <p style="color: #64748b; font-size: 14px; margin-top: 20px;">Use this code to verify your identity and access your studio command center.</p>
        </div>
      </div>
    `;

    try {
      if (mode === "login") {
        const loginCheck = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email })
        });
        const loginData = await loginCheck.json();
        if (!loginCheck.ok) {
          error(loginData.error || "Account not found");
          if (loginData.needsRegistration) setMode("register");
          return;
        }
        // Save user data temporarily to use after OTP
        sessionStorage.setItem("pending_user", JSON.stringify(loginData.user));
      } else if (mode === "register") {
        // Pre-check if email already exists before even sending OTP!
        const existCheck = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email })
        });
        if (existCheck.ok) {
           error("This email is already registered! Please log in instead.");
           setMode("login");
           return;
        }
      }

      const resp = await fetch("/api/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: formData.email, subject: `${newOtp} is your Login Code`, message: emailHtml })
      });
      if (resp.ok) {
        setStep(1.5);
        success("OTP sent to your email!");
      }
      else {
        const data = await resp.json().catch(() => ({}));
        error(data.error || "Unable to send verification code. Please try again.");
      }
    } catch (err: unknown) { 
      console.error(err);
      error("Network failure. Check connection."); 
    } finally { setLoading(false); }
  };

  const finalizeRegistration = async () => {
    setLoading(true);

    try {
      const resp = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await resp.json().catch(() => ({ error: "Network error" }));
      if (resp.ok) {
        sessionStorage.setItem("snapsaarthi_user", JSON.stringify(data.user));
        setStep(3);
        success("Profile activated!");
      } else {
        error(data.error || "Failed to create account. Please try again.");
      }
    } catch (err) {
      error("Connection error. Ensure your server is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      sendOTP();
    } 
    else if (step === 1.5) { 
      // Master Bypass for Admin or correctly verified OTP
      const pendingData = sessionStorage.getItem("pending_user");
      const pendingUser = pendingData ? JSON.parse(pendingData) : null;
      
      if (otp === generatedOtp || (pendingUser?.role === "ADMIN" && otp === "999999")) {
        if (mode === "login") {
          const userData = sessionStorage.getItem("pending_user");
          if (userData) {
            sessionStorage.setItem("snapsaarthi_user", userData);
            sessionStorage.removeItem("pending_user");
          }
          success("Welcome back!");
          router.push("/dashboard");
        } else {
          setStep(2);
          success("Email verified!");
        }
      } 
      else error("Incorrect code. Try again."); 
    }
    else if (step === 2) {
      finalizeRegistration();
    }
  };

  return (
    <AP>
      {isOpen && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-start justify-center p-4 overflow-y-auto pt-10 md:pt-24"
        >
          {/* Modal Container */}
          <m.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            onClick={(e) => e.stopPropagation()} 
            className="relative w-full max-w-lg bg-[#050505] border border-white/10 rounded-[2rem] md:rounded-[2.5rem] shadow-[0_40px_120px_rgba(0,0,0,0.8)] z-[210] overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-5 md:p-8 flex items-center justify-between border-b border-white/5 bg-black/50 backdrop-blur-xl">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <Camera className="text-white w-4 h-4" />
                </div>
                <span className="text-lg font-black tracking-tighter">SnapSaarthi</span>
              </div>
              <button 
                onClick={onClose}
                className="p-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
              <AP mode="wait">
                {step === 3 ? (
                  <m.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-10"
                  >
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-600/40">
                      <CheckCircle2 className="w-8 h-8 md:w-10 md:h-10 text-white" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tighter mb-4 italic text-white">Welcome <span className="text-emerald-500">{formData.name || 'Artist'}!</span></h1>
                    <p className="text-gray-400 font-medium mb-10 max-w-xs mx-auto">
                      Your studio identity is activated. Prepare to lead the market.
                    </p>
                    <button 
                      className="w-full py-5 bg-white text-black rounded-2xl font-black text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                      onClick={() => router.push("/dashboard")}
                    >
                      Enter Command Center
                    </button>
                  </m.div>
                ) : (
                  <m.div
                    key={mode + step}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-6"
                  >
                    <div className="text-center mb-8">
                       <h2 className="text-2xl md:text-3xl font-black tracking-tighter italic mb-2 text-white">
                         {mode === "register" ? (step === 1 ? "Start Your Journey" : step === 1.5 ? "Verify Account" : "About Your Studio") : "Studio Access"}
                       </h2>
                       <p className="text-gray-500 text-sm font-medium">
                         {mode === "register" 
                           ? (step === 1 ? "Create your free account in seconds." : step === 1.5 ? "We've sent a code for security." : "Tell us a bit about your studio.") 
                           : "Login to your studio dashboard."}
                       </p>
                    </div>

                    {step === 1 && (
                      <>
                        <button 
                          type="button"
                          onClick={() => error("Google Authentication is currently being optimized for your region. Use Email access for instant login.")}
                          className="w-full py-4 border border-white/10 rounded-2xl font-bold text-sm text-white hover:bg-white/5 transition-all flex items-center justify-center gap-3 mb-6"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                          </svg>
                          Continue with Google
                        </button>

                        <div className="relative flex items-center gap-4 mb-8">
                          <div className="flex-1 h-px bg-white/10" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-700">Or Secure Email</span>
                          <div className="flex-1 h-px bg-white/10" />
                        </div>
                      </>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                      {step === 1 && (
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">{mode === "register" ? "Business Email" : "Studio Email"}</label>
                           <div className="relative group">
                             <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-indigo-500 transition-colors" />
                             <input required type="email" placeholder="owner@studio.com" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.08] transition-all font-bold text-white" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                           </div>
                        </div>
                      )}

                      {step === 1.5 && (
                        <div className="space-y-4 text-center">
                           <div className="flex justify-center">
                             <input 
                                required 
                                type="text" 
                                maxLength={6} 
                                placeholder="000000" 
                                className="w-full max-w-[200px] text-center bg-white/5 border border-white/10 rounded-2xl py-5 text-3xl font-black tracking-[0.2em] focus:outline-none focus:border-indigo-500 transition-all text-indigo-400"
                                value={otp} 
                                onChange={(e) => setOtp(e.target.value)} 
                             />
                           </div>
                           <button type="button" onClick={sendOTP} className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-white">Request new code</button>
                        </div>
                      )}

                      {mode === "register" && step === 2 && (
                        <>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Full Name</label>
                             <div className="relative group">
                               <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-indigo-500 transition-colors" />
                               <input required type="text" placeholder="John Wick" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.08] transition-all font-bold text-white" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                             </div>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Business / Studio Name</label>
                             <div className="relative group">
                               <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-indigo-500 transition-colors" />
                               <input required type="text" placeholder="e.g. Dream Clicks Studio" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.08] transition-all font-bold text-white" value={formData.studioName} onChange={(e) => setFormData({...formData, studioName: e.target.value})} />
                             </div>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">How many people in your team?</label>
                             <div className="grid grid-cols-2 gap-3">
                               {["solo", "small", "medium", "large"].map((s) => (
                                 <button key={s} type="button" onClick={() => setFormData({...formData, studioSize: s})} className={`p-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${formData.studioSize === s ? "bg-indigo-600 border-indigo-500 text-white" : "bg-white/5 border-white/10 text-gray-500 hover:bg-white/10"}`}>
                                   {s === 'solo' ? 'Just Me' : s === 'small' ? '2-5 People' : s === 'medium' ? '6-15 People' : '15+ People'}
                                 </button>
                               ))}
                             </div>
                          </div>
                        </>
                      )}


                      <div className="pt-6 space-y-4">
                        <button 
                          type="submit"
                          disabled={loading}
                          className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                        >
                          {loading ? "Please wait..." : mode === "register" ? (step === 1 ? "Continue" : step === 1.5 ? "Verify Code" : "Create Account") : "Login"}
                          {!loading && <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                        </button>
                        {mode === "register" && step > 1 && (
                          <button type="button" onClick={prevStep} className="w-full text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-white transition-colors">Go Back</button>
                        )}
                        <div className="text-center pt-4">
                          <button 
                            type="button"
                            onClick={() => { setMode(mode === "login" ? "register" : "login"); setStep(1); }}
                            className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
                          >
                            {mode === "login" ? "No account? " : "Authorized before? "}
                            <span className="text-indigo-400 font-black ml-1">{mode === "login" ? "Register" : "Login"}</span>
                          </button>
                        </div>
                      </div>
                    </form>
                  </m.div>
                )}
              </AP>
            </div>

            {/* Footer */}
            <div className="p-6 text-center border-t border-white/5 bg-white/[0.02]">
               <div className="flex items-center justify-center gap-2 text-[8px] font-black uppercase tracking-[0.3em] text-gray-600">
                 <Shield className="w-3 h-3" /> Your Identity is Secured
               </div>
            </div>
          </m.div>
        </m.div>
      )}
    </AP>
  );
}
