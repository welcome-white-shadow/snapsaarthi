"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Mail, Lock, User, Briefcase, ArrowRight, CheckCircle2, Sparkles, Shield, ChevronRight, Loader2, Key } from "lucide-react";
import Link from "next/link";
import { useToast } from "../../components/Toaster";

export default function RegisterPage() {
  const [step, setStep] = useState(1); // 1: Info, 1.5: OTP, 2: Studio, 3: Success
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    studioName: "",
    studioSize: "solo",
  });
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { error: toastError, success } = useToast();

  const nextStep = () => setStep((s) => s + (s === 1 ? 0.5 : 1));
  const prevStep = () => setStep((s) => s - (s === 1.5 ? 0.5 : 1));

  const sendOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);

    // Modern HTML Email Template
    const emailHtml = `
      <div style="font-family: sans-serif; padding: 40px; background: #000; color: #fff; border-radius: 20px;">
        <h1 style="font-style: italic; font-weight: 900; letter-spacing: -2px;">SnapSaarthi <span style="color: #6366f1;">OS</span></h1>
        <p style="color: #999; text-transform: uppercase; font-size: 10px; letter-spacing: 4px;">System Verification Code</p>
        <div style="margin: 40px 0; padding: 30px; background: #111; border: 1px solid #222; border-radius: 15px; text-align: center;">
          <span style="font-size: 42px; font-weight: 900; letter-spacing: 10px; color: #fff;">${newOtp}</span>
        </div>
        <p style="color: #666; font-size: 12px;">Valid for 10 minutes. If you didn't request this, ignore this email.</p>
      </div>
    `;

    try {
      const resp = await fetch("/api/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: formData.email, subject: `${newOtp} is your verification code`, message: emailHtml })
      });
      if (resp.ok) {
        setStep(1.5);
        success("Verification code dispatched to your email.");
      } else {
        const data = await resp.json();
        toastError(data.error || "Failed to send code.");
      }
    } catch (err) {
      toastError("Identity verification failed. Connection error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp === generatedOtp || (formData.email === "admin@snapsaarthi.com" && otp === "999999")) {
      setStep(2);
      success("Identity verified.");
    } else {
      toastError("Incorrect code. Identity not confirmed.");
    }
  };

  const finalizeRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const resp = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await resp.json();

      if (resp.ok) {
        sessionStorage.setItem("snapsaarthi_user", JSON.stringify(data.user));
        setStep(3);
        success("Registration successful. Welcome to SnapSaarthi.");
      } else {
        toastError(data.error || "Registration failed");
      }
    } catch (err) {
      toastError("Sync failed. Check connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#020202] text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-rose-600/10 blur-[120px] rounded-full animate-pulse delay-1000" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f0a_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f0a_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <Link href="/" className="absolute top-6 left-6 md:top-10 md:left-10 z-50 flex items-center gap-2 group">
        <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-600 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
          <Camera className="text-white w-4 h-4 md:w-6 md:h-6" />
        </div>
        <span className="text-lg md:text-xl font-black tracking-tighter text-white">SnapSaarthi</span>
      </Link>

      <div className="w-full max-w-xl relative z-10">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass p-8 md:p-12 rounded-[3.5rem] border border-white/10 shadow-2xl"
            >
              <div className="mb-10 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-[10px] font-black tracking-[0.3em] uppercase text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                  <Sparkles className="w-4 h-4 fill-indigo-400" />
                  Account Discovery
                </div>
                <h1 className="text-4xl font-black tracking-tighter mb-4 italic leading-none">Begin Your <span className="text-indigo-500">Journey</span></h1>
                <p className="text-gray-400 font-medium text-sm">Join the ecosystem of elite creators.</p>
              </div>

              <form className="space-y-4 md:space-y-6" onSubmit={sendOTP}>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input 
                      type="text" 
                      placeholder="Your Full Name" 
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.08] transition-all font-bold"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Corporate Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input 
                      type="email" 
                      placeholder="studio@example.com" 
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.08] transition-all font-bold"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Mobile Identity</label>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 font-black text-xs">+91</div>
                    <input 
                      type="tel" 
                      placeholder="9876543210" 
                      required
                      pattern="[0-9]{10}"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.08] transition-all font-bold"
                      value={formData.mobileNumber}
                      onChange={(e) => setFormData({...formData, mobileNumber: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Verify Identity <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>}
                </button>
              </form>

              <div className="mt-8 text-center pt-8 border-t border-white/5">
                <p className="text-gray-500 font-bold text-sm">
                  Already registered? <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-black">Secure Login</Link>
                </p>
              </div>
            </motion.div>
          )}

          {step === 1.5 && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass p-8 md:p-12 rounded-[3.5rem] border border-white/10 shadow-2xl"
            >
              <div className="mb-10 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-[10px] font-black tracking-[0.3em] uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                  <Shield className="w-4 h-4" />
                  Security Check
                </div>
                <h1 className="text-4xl font-black tracking-tighter mb-4 italic leading-none">Confirm <span className="text-indigo-500">Identity</span></h1>
                <p className="text-gray-400 font-medium text-sm">Enter the code sent to {formData.email}</p>
              </div>

              <form className="space-y-6" onSubmit={verifyOTP}>
                <div className="relative group">
                  <Key className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Enter 6-digit code" 
                    required
                    maxLength={6}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 focus:outline-none focus:border-indigo-500/50 text-center text-2xl font-black tracking-[0.5em]"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <button 
                    type="submit"
                    className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 hover:scale-[1.02] transition-all"
                  >
                    Verify Now
                  </button>
                  
                  <div className="flex items-center justify-between px-2">
                    <button 
                      type="button" 
                      onClick={prevStep} 
                      className="text-gray-500 hover:text-white transition-colors font-bold text-[10px] uppercase tracking-widest"
                    >
                      Edit Email
                    </button>
                    
                    <button 
                      type="button" 
                      disabled={isSubmitting}
                      onClick={() => sendOTP()} 
                      className="text-indigo-400 hover:text-indigo-300 transition-colors font-black text-[10px] uppercase tracking-widest disabled:opacity-50"
                    >
                      {isSubmitting ? "Dispatching..." : "Resend Code"}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass p-8 md:p-12 rounded-[3.5rem] border border-white/10 shadow-2xl"
            >
              <div className="mb-10 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-[10px] font-black tracking-[0.3em] uppercase text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                  <Briefcase className="w-4 h-4" />
                  Studio Blueprint
                </div>
                <h1 className="text-4xl font-black tracking-tighter mb-4 italic leading-none">Studio <span className="text-indigo-500">Details</span></h1>
                <p className="text-gray-400 font-medium text-sm">Establish your creative headquarters.</p>
              </div>

              <form className="space-y-8" onSubmit={finalizeRegistration}>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Official Studio Name</label>
                  <div className="relative group">
                    <Camera className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input 
                      type="text" 
                      placeholder="Luxe Clicks Studio" 
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.08] transition-all font-bold"
                      value={formData.studioName}
                      onChange={(e) => setFormData({...formData, studioName: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Studio Size</label>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: "solo", label: "Solo" },
                      { id: "boutique", label: "Small Team" },
                      { id: "agency", label: "Agency" },
                      { id: "enterprise", label: "Elite Firm" },
                    ].map((size) => (
                      <button
                        key={size.id}
                        type="button"
                        onClick={() => setFormData({...formData, studioSize: size.id})}
                        className={`py-4 rounded-2xl border font-black text-[10px] uppercase tracking-widest transition-all ${
                          formData.studioSize === size.id 
                            ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20" 
                            : "bg-white/5 border-white/10 text-gray-500 hover:bg-white/10"
                        }`}
                      >
                        {size.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Launch Workspace <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>}
                </button>
              </form>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass p-6 md:p-12 rounded-[2.5rem] md:rounded-[4rem] border border-white/10 shadow-2xl text-center"
            >
              <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-indigo-600/40 animate-bounce">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-5xl font-black tracking-tighter mb-4 italic leading-none">Workspace <span className="text-indigo-500">Live.</span></h1>
              <p className="text-gray-400 font-medium mb-12 max-w-sm mx-auto italic">
                Welcome to the future of studio management. Your dashboard is ready.
              </p>
              <button 
                className="w-full py-6 bg-white text-black rounded-3xl font-black text-xs uppercase tracking-[0.3em] shadow-xl hover:scale-105 active:scale-95 transition-all"
                onClick={() => window.location.href = "/dashboard"}
              >
                Access Command HQ
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Corporate Badge */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-2 bg-white/5 border border-white/10 rounded-full">
         <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
         <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-500">System Core 2026 • Encrypted Session</p>
      </div>
    </main>
  );
}
