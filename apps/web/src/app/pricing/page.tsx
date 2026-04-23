"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Camera, Check, X, Zap, Award, Infinity, Aperture, Heart, Layers, ChevronRight, Info, Clock, MessageCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import UpgradeCard from "../../components/UpgradeCard";
import AuthModal from "../../components/AuthModal";

export default function PricingPage() {
  const router = useRouter();
  const [isYearly, setIsYearly] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("register");

  const handleUpgradeClick = (plan: any) => {
    if (plan.price === "0") {
      const user = sessionStorage.getItem("snapsaarthi_user");
      if (user) {
        router.push("/dashboard");
      } else {
        setAuthMode("register");
        setIsAuthModalOpen(true);
      }
      return;
    }
    setSelectedPlan(plan);
    setIsPaymentModalOpen(true);
  };

  const plans = [
    {
      name: "Free Forever",
      tagline: "For New Artists",
      price: "0",
      description: "Perfect for starting your studio journey.",
      features: [
        "1 Active Event Portal",
        "Mobile Selection UI",
        "WhatsApp Sharing",
        "Basic Mini-CRM",
      ],
      notIncluded: [
        "3D E-Album (Flipbook)",
        "Custom Logo Branding",
        "Priority Support"
      ],
      cta: "Start Free",
      popular: false,
      color: "border-white/10"
    },
    {
      name: "Micro Plan",
      tagline: "Best for Freelancers",
      price: isYearly ? "499" : "49",
      period: isYearly ? "/year" : "/month",
      description: "Professional tools at the price of a coffee.",
      features: [
        "5 Active Event Portals",
        "3D E-Album (Basic)",
        "Selection Deadlines",
        "WhatsApp Direct Support",
        "Advanced CRM Access"
      ],
      notIncluded: [
        "White-label Branding",
      ],
      cta: "Get Micro Access",
      popular: true,
      color: "border-indigo-500 shadow-indigo-500/20"
    },
    {
      name: "Studio PRO",
      tagline: "Unlimited Growth",
      icon: <Infinity className="w-6 h-6 text-amber-500" />,
      price: isYearly ? "1,499" : "149",
      period: isYearly ? "/year" : "/month",
      description: "Elite power for real studio owners.",
      features: [
        "Unlimited Event Portals",
        "Full 3D E-Albums",
        "Custom Studio Branding",
        "Team Management",
        "High-res Priority Hosting",
        "Enterprise Security",
      ],
      notIncluded: [],
      cta: "Go Pro Now",
      popular: false,
      color: "border-emerald-500/50"
    }
  ];

  return (
    <main className="min-h-screen bg-[#020202] text-white selection:bg-indigo-500/30">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-rose-600/5 blur-[120px] rounded-full" />
      </div>

      <nav className="fixed top-0 w-full z-50 glass border-b border-white/5 py-4 px-6 md:px-12 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Camera className="text-white w-4 h-4" />
          </div>
          <span className="text-xl font-black tracking-tighter text-white">SnapSaarthi</span>
        </Link>
        <Link href="/" className="text-sm font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors">
          Home
        </Link>
      </nav>

      <section className="relative pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto z-10 text-center">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-[10px] font-black tracking-[0.3em] uppercase text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
            <Aperture className="w-4 h-4" />
            Transparent Pricing
          </div>
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter italic mb-8">
            Growth That <span className="text-indigo-500">Pays For Itself.</span>
          </h1>
          <p className="text-gray-500 text-lg md:text-xl font-medium max-w-2xl mx-auto italic mb-12">
            Automate your studio for less than the cost of a luxury coffee. Scale your creative vision without the administrative chaos.
          </p>

          {/* Toggle Button */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm font-bold ${!isYearly ? 'text-white' : 'text-gray-500'}`}>Monthly</span>
            <button 
              onClick={() => setIsYearly(!isYearly)}
              className="w-16 h-8 bg-white/5 border border-white/10 rounded-full relative p-1 transition-all"
            >
              <motion.div 
                animate={{ x: isYearly ? 32 : 0 }}
                className="w-6 h-6 bg-white rounded-full shadow-lg"
              />
            </button>
            <span className={`text-sm font-bold ${isYearly ? 'text-indigo-400' : 'text-gray-500'}`}>
              Yearly 
              <span className="ml-2 text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/20 font-black">Save 25%</span>
            </span>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative flex flex-col p-8 md:p-10 rounded-[3rem] bg-white/[0.02] border backdrop-blur-3xl transition-all hover:scale-[1.02] ${plan.color} ${plan.popular ? 'z-10 bg-indigo-500/[0.03]' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full shadow-xl shadow-indigo-600/40">
                  Most Popular Choice
                </div>
              )}

              <div className="mb-10">
                <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-3">{plan.tagline}</p>
                <h3 className="text-3xl font-black tracking-tighter mb-6">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-gray-500 text-2xl font-bold">₹</span>
                  <span className="text-6xl font-black tracking-tighter">{plan.price}</span>
                  <span className="text-gray-500 font-bold">{plan.period || ''}</span>
                </div>
                <p className="mt-6 text-gray-500 text-sm font-medium">{plan.description}</p>
              </div>

              <div className="space-y-4 mb-10 flex-1">
                {plan.features.map(f => (
                  <div key={f} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-emerald-500/20 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-emerald-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-300">{f}</span>
                  </div>
                ))}
                {plan.notIncluded.map(f => (
                  <div key={f} className="flex items-center gap-3 opacity-30">
                    <div className="w-5 h-5 bg-white/5 rounded-full flex items-center justify-center">
                      <X className="w-3 h-3 text-gray-500" />
                    </div>
                    <span className="text-sm font-medium text-gray-500 line-through">{f}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => handleUpgradeClick(plan)}
                className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${plan.popular ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 hover:bg-indigo-500' : 'bg-white/5 border border-white/10 hover:bg-white/10 text-white'}`}
              >
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Payment Modal */}
        <AnimatePresence>
          {isPaymentModalOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[110] overflow-y-auto custom-scrollbar bg-black/90 backdrop-blur-xl flex items-start justify-center p-4 sm:p-8"
              >
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="w-full max-w-5xl my-auto"
                >
                  <UpgradeCard 
                    planName={selectedPlan?.name} 
                    price={selectedPlan?.price} 
                    onClose={() => setIsPaymentModalOpen(false)} 
                  />
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
        
        {/* Registration/Login Modal */}
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
          initialMode={authMode} 
        />

        {/* Feature Comparison Link */}
        <div className="mt-20 flex flex-col items-center">
           <p className="text-gray-600 text-sm mb-6 max-w-md mx-auto italic font-medium">
             Custom requirements for your massive studio chain? <br />
             <Link href="/contact" className="text-indigo-400 hover:text-indigo-300 transition-colors font-black not-italic underline decoration-indigo-500/30">Connect with Enterprise Support</Link>
           </p>
           
           <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 opacity-40 grayscale">
              <div className="flex items-center gap-2 font-black uppercase text-[10px] tracking-widest"><ShieldCheck className="w-4 h-4" /> Secure SSL</div>
              <div className="flex items-center gap-2 font-black uppercase text-[10px] tracking-widest"><Check className="w-4 h-4" /> No Contracts</div>
              <div className="flex items-center gap-2 font-black uppercase text-[10px] tracking-widest"><Zap className="w-4 h-4" /> Instant Setup</div>
              <div className="flex items-center gap-2 font-black uppercase text-[10px] tracking-widest"><Clock className="w-4 h-4" /> 24/7 Access</div>
           </div>
        </div>
      </section>

      {/* FAQ Sneak Peek */}
      <section className="pb-24 px-6 max-w-3xl mx-auto text-center relative z-10">
         <h2 className="text-2xl font-black tracking-tighter mb-12 italic">Commonly <span className="text-indigo-500">Asked.</span></h2>
         <div className="space-y-4 text-left">
            {[
              { q: "Can I cancel my subscription anytime?", a: "Yes, you can cancel or switch plans at any moment without any cancellation fees. You stay in control." },
              { q: "Do you charge per photo uploaded?", a: "No, we believe in creative freedom. We don't charge per photo. Our plans are based on active event portals." }
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                <h4 className="font-black text-sm text-white mb-2 flex items-center gap-2"><Info className="w-4 h-4 text-indigo-400" /> {item.q}</h4>
                <p className="text-sm text-gray-500 font-medium leading-relaxed">{item.a}</p>
              </div>
            ))}
         </div>
      </section>

      <footer className="py-12 border-t border-white/5 text-center">
         <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-700 italic">Deliver Perfection. Scale Excellence.</p>
      </footer>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>
    </main>
  );
}
