"use client";

import { motion } from "framer-motion";
import { Zap, MessageCircle, ShieldCheck, Copy, Check } from "lucide-react";
import { useState, useEffect } from "react";

interface UpgradeCardProps {
  planName: string;
  price: string;
  onClose?: () => void;
}

export default function UpgradeCard({ planName, price, onClose }: UpgradeCardProps) {
  const [copied, setCopied] = useState(false);
  const [upiId, setUpiId] = useState("mayurmahajan3399@oksbi");

  useEffect(() => {
    fetch("/api/admin/config")
      .then(res => res.json())
      .then(data => {
        if (data.upiId) setUpiId(data.upiId);
      })
      .catch(err => console.error("UPI Load Error:", err));
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-1 sm:p-4 md:p-8">
      <div className="relative group">
        {/* Animated Background Glow */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 rounded-[1.5rem] md:rounded-[3.5rem] blur opacity-20 transition duration-1000"></div>
        
        <div className="relative flex flex-col md:flex-row bg-[#050505] border border-white/10 rounded-[1.5rem] md:rounded-[3.5rem] overflow-hidden shadow-2xl">
          
          {/* Left Side: Info */}
          <div className="flex-1 p-5 sm:p-8 md:p-12 flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/5">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-indigo-600/20 rounded-lg sm:rounded-2xl flex items-center justify-center border border-indigo-500/20">
                <Zap className="text-indigo-400 w-4 h-4 sm:w-6 sm:h-6 animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl md:text-4xl font-black tracking-tighter italic uppercase text-white">
                  Instant <span className="text-indigo-500">Upgrade</span>
                </h2>
                <p className="text-[8px] sm:text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-600">Professional Studio Access</p>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-6 mb-6 sm:mb-10">
              <div className="p-3 sm:p-6 rounded-xl sm:rounded-3xl bg-white/[0.02] border border-white/5 relative overflow-hidden group/item">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-600 scale-y-0 group-hover/item:scale-y-100 transition-transform origin-top" />
                <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-gray-700 mb-1">Selected Plan</p>
                <div className="flex items-baseline gap-1.5 sm:gap-2">
                  <span className="text-xl sm:text-3xl md:text-5xl font-black tracking-tighter text-white italic">{planName}</span>
                  <span className="text-indigo-400 font-bold text-xs sm:text-base">₹{price}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-4">
                <div className="flex items-center gap-1.5 sm:gap-3 text-gray-500">
                  <ShieldCheck className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500" />
                  <span className="text-[7px] sm:text-xs font-bold uppercase tracking-wider">Instant</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-3 text-gray-500">
                  <ShieldCheck className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500" />
                  <span className="text-[7px] sm:text-xs font-bold uppercase tracking-wider">24/7 Support</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div className="relative group">
                <input 
                  type="text" 
                  id="txnIdInput"
                  placeholder="Enter Transaction ID (after pay)" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-5 focus:outline-none focus:border-indigo-500 transition-all text-xs font-bold text-white placeholder:text-gray-600"
                />
              </div>

              <button 
                onClick={async () => {
                  const txnId = (document.getElementById('txnIdInput') as HTMLInputElement).value;
                  if (!txnId) { alert("Please enter Transaction ID first"); return; }
                  
                  const userStr = sessionStorage.getItem("snapsaarthi_user");
                  const user = userStr ? JSON.parse(userStr) : null;

                  try {
                    const resp = await fetch("/api/admin/upgrade-request", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ 
                        email: user.email, 
                        txnId, 
                        planName 
                      })
                    });
                    if (resp.ok) {
                       const msg = `Hi SnapSaarthi! My email is ${user.email}. I just paid ₹${price} for ${planName}. Txn ID: ${txnId}. Please activate.`;
                       window.open(`https://wa.me/919209107209?text=${encodeURIComponent(msg)}`, '_blank');
                    }
                  } catch (e) { console.error(e); }
                }}
                className="w-full py-4 bg-white text-black rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-current" /> Request Account Activation
              </button>

              <button 
                onClick={() => {
                  const msg = `Hi SnapSaarthi! I need help with payment for the ${planName} plan.`;
                  window.open(`https://wa.me/919209107209?text=${encodeURIComponent(msg)}`, '_blank');
                }}
                className="w-full py-3 text-[#25D366] font-black text-[8px] sm:text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 border border-[#25D366]/20 rounded-xl hover:bg-[#25D366]/5 transition-all"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-current" /> Chat with Support
              </button>
              {onClose && (
                <button 
                  onClick={onClose}
                  className="w-full py-1 mt-2 text-gray-700 font-bold text-[8px] sm:text-[9px] uppercase tracking-widest hover:text-white transition-colors"
                >
                  Cancel & Go Back
                </button>
              )}
            </div>
          </div>

          {/* Right Side: QR Code */}
          <div className="w-full md:w-[360px] p-6 sm:p-10 md:p-12 bg-white/[0.01] flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-3xl border-t md:border-t-0 md:border-l border-white/5">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:10px_10px]" />
            </div>

            <p className="text-[8px] sm:text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-gray-600 mb-4 sm:mb-8 z-10">Scan To Pay</p>
            
            <div className="relative group/qr">
              <div className="absolute -inset-4 bg-indigo-600/5 blur-2xl rounded-full scale-0 group-hover/qr:scale-100 transition-transform duration-700"></div>
              <div className="bg-white p-2 sm:p-4 md:p-6 rounded-xl sm:rounded-[2.5rem] shadow-2xl relative z-10">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=${upiId}%26pn=SnapSaarthi%26am=${price.replace(/,/g, '')}%26cu=INR`} 
                  alt="Payment QR" 
                  className="w-32 h-32 sm:w-48 sm:h-48 md:w-56 md:h-56 object-contain"
                />
              </div>
            </div>

            <div className="mt-6 sm:mt-10 text-center z-10 w-full">
              <div 
                onClick={handleCopy}
                className="group/upi flex flex-col items-center cursor-pointer"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <p className="text-base sm:text-xl md:text-2xl font-black italic tracking-tighter text-white group-hover/upi:text-indigo-400 transition-colors">
                    {upiId}
                  </p>
                  {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-2.5 h-2.5 sm:w-4 sm:h-4 text-gray-700" />}
                </div>
                <p className="text-[7px] sm:text-[9px] font-black uppercase text-gray-700 tracking-widest leading-none">
                  Verified: Mayur Mahajan
                </p>
              </div>
            </div>

            {/* Hint for mobile */}
            <div className="mt-4 sm:mt-8 flex md:hidden items-center gap-1.5 text-indigo-400/40">
              <div className="w-1 h-1 bg-indigo-500 rounded-full animate-ping" />
              <p className="text-[7px] sm:text-[9px] font-black uppercase tracking-widest">Screenshot & Scan</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
