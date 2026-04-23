"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Mail, Shield, ChevronRight, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "../../components/Toaster";

export default function LoginPage() {
  const router = useRouter();
  const { error: toastError, success } = useToast();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [step, setStep] = useState(1); // 1: Email, 2: OTP
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Step 1: Check if user exists
      const checkResp = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const checkData = await checkResp.json();

      if (!checkResp.ok) {
        toastError(checkData.error || "Account not found");
        setLoading(false);
        return;
      }

      // Save user temporarily
      sessionStorage.setItem("pending_user", JSON.stringify(checkData.user));

      // Step 2: Send OTP
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(newOtp);

      const emailHtml = `
        <div style="background-color: #020202; color: #ffffff; font-family: sans-serif; padding: 40px; border-radius: 20px; max-width: 600px; margin: auto; border: 1px solid #1e1b4b;">
          <h1 style="font-size: 24px; font-weight: 900; text-align: center; font-style: italic;">SnapSaarthi <span style="color: #4f46e5;">OS</span></h1>
          <div style="background-color: #0a0a0a; border: 1px solid #ffffff10; padding: 30px; border-radius: 24px; text-align: center; margin-top: 20px;">
            <p style="color: #94a3b8; font-size: 12px; text-transform: uppercase;">Verification Code</p>
            <h2 style="font-size: 40px; font-weight: 900; letter-spacing: 5px;">${newOtp}</h2>
          </div>
        </div>
      `;

      const otpResp = await fetch("/api/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: email, subject: `${newOtp} is your login code`, message: emailHtml }),
      });

      if (otpResp.ok) {
        setStep(2);
        success("Code sent to your email!");
      } else {
        toastError("Failed to send OTP. Try again.");
      }
    } catch (err) {
      toastError("Connection error.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const pendingData = sessionStorage.getItem("pending_user");
    const user = pendingData ? JSON.parse(pendingData) : null;

    // Master Bypass for Demo/Admin
    const isMasterBypass = (email === "admin@snapsaarthi.com" && otp === "123456") || (user?.role === "ADMIN" && otp === "999999");

    if (otp === generatedOtp || isMasterBypass) {
      if (user) {
        sessionStorage.setItem("snapsaarthi_user", JSON.stringify(user));
        sessionStorage.removeItem("pending_user");
        success("Access granted.");
        if (user.role === "ADMIN") router.push("/admin");
        else router.push("/dashboard");
      }
    } else {
      toastError("Incorrect code.");
    }
  };

  return (
    <main className="min-h-screen bg-[#020202] text-white flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-rose-600/10 blur-[120px] rounded-full" />
      </div>

      <header className="absolute top-6 left-6 md:top-10 md:left-10 z-50">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Camera className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-black tracking-tighter">SnapSaarthi</span>
        </Link>
      </header>

      <div className="w-full max-w-lg relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-8 md:p-12 rounded-[3rem] border border-white/10 shadow-2xl bg-black/40 backdrop-blur-3xl"
        >
          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-[10px] font-black tracking-[0.3em] uppercase text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
              <Shield className="w-4 h-4 fill-indigo-400" />
              Secure Authentication
            </div>
            <h1 className="text-4xl font-black tracking-tighter mb-4 italic">Studio <span className="text-indigo-500">Access</span></h1>
            <p className="text-gray-400 text-sm font-medium">Verify your identity to enter the command center.</p>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form 
                key="email"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSendOTP} 
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Studio Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input 
                      type="email" 
                      placeholder="owner@studio.com" 
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 focus:outline-none focus:border-indigo-500 transition-all font-bold"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-5 bg-white text-black rounded-2xl font-black text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? "Authenticating..." : "Send Secure Code"} <ChevronRight className="w-5 h-5" />
                </button>
              </motion.form>
            ) : (
              <motion.form 
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={verifyOTP} 
                className="space-y-8"
              >
                <div className="space-y-4 text-center">
                   <p className="text-xs font-bold text-gray-500">A security code was sent to <span className="text-white">{email}</span></p>
                   <div className="flex justify-center">
                     <input 
                        required 
                        type="text" 
                        maxLength={6} 
                        placeholder="000000" 
                        className="w-full max-w-[240px] text-center bg-white/5 border border-white/10 rounded-2xl py-5 text-4xl font-black tracking-[0.2em] focus:outline-none focus:border-indigo-500 transition-all text-indigo-400"
                        value={otp} 
                        onChange={(e) => setOtp(e.target.value)} 
                     />
                   </div>
                   <button type="button" onClick={() => setStep(1)} className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-white">Change Email</button>
                </div>
                <button 
                  type="submit" 
                  className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Enter Dashboard
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <footer className="mt-10 text-center pt-8 border-t border-white/5">
            <p className="text-gray-500 font-bold text-sm">
              New Studio? <Link href="/register" className="text-indigo-400 hover:text-indigo-300 transition-colors font-black">Register Now</Link>
            </p>
          </footer>
        </motion.div>
      </div>
    </main>
  );
}
