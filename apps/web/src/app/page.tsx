"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring, useScroll } from "framer-motion";
import { Camera, Zap, Shield, Globe, ArrowRight, Menu, X, Check, Heart, Smile, Users, Star, MessageSquare, Infinity, Layers, ArrowRightCircle, Rocket, Clock, Coins, ShieldCheck, Sparkles, Instagram, Twitter, Linkedin, Facebook, Mail } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const user = sessionStorage.getItem("snapsaarthi_user");
    if (user) setIsLoggedIn(true);
  }, []);
  
  // Interaction Data
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const whatsappOpacity = 1;
  const whatsappScale = 1;

  // Mobile scroll-triggered 3D tilt
  const mobileRotateX = useTransform(scrollYProgress, [0, 0.1], [0, -12]);
  const mobileScale = useTransform(scrollYProgress, [0, 0.1], [1, 0.92]);

  // Desktop mouse tilt logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const desktopRotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const desktopRotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  // Combined Rotation - Optimized for mobile by reducing string concatenation complexity
  const combinedRotateX = useTransform(
    [mobileRotateX, desktopRotateX],
    ([mX, dX]) => {
      if (typeof window !== "undefined" && window.innerWidth < 768) return `${mX}deg`;
      return `calc(${mX}deg + ${dX})`;
    }
  );

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const menuItems = [
    { name: "Home", href: "#" },
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Blog", href: "#blog" },
    { name: "Pricing", href: "/pricing" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <>
      <main 
      className="relative min-h-screen overflow-x-hidden bg-[#020202] text-white selection:bg-indigo-500/30"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      ref={containerRef}
    >
      {/* Background Layer - Fixed to prevent layout shifts and excessive scrolling */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* 3D Background Grid */}
        <div className="absolute inset-0 opacity-[0.15] [mask-image:radial-gradient(ellipse_at_center,black,transparent)]">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:45px_45px] [transform:perspective(1200px)_rotateX(60deg)_translateY(-100px)] animate-grid-travel" />
        </div>

        {/* Dynamic Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[100%] h-[100%] md:w-[60%] md:h-[60%] bg-indigo-600/5 blur-[80px] md:blur-[130px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[100%] h-[100%] md:w-[60%] md:h-[60%] bg-rose-600/5 blur-[80px] md:blur-[130px] rounded-full animate-pulse delay-1000" />
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence mode="wait">
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-[100] lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-[85%] max-w-[340px] bg-[#050505] border-r border-white/10 z-[110] lg:hidden p-8 flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-2">
                   <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                     <Camera className="w-5 h-5 text-white" />
                   </div>
                   <span className="font-bold text-2xl tracking-tighter">SnapSaarthi</span>
                 </div>
                 <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-white/5 rounded-full"><X className="w-6 h-6" /></button>
              </div>
              <nav className="flex flex-col gap-4">
                {menuItems.map((item) => (
                  <a key={item.name} href={item.href} className="text-xl font-black text-gray-400 hover:text-white transition-all hover:translate-x-2" onClick={() => setIsMobileMenuOpen(false)}>{item.name}</a>
                ))}
              </nav>
               <div className="mt-8 space-y-3">
                   {isLoggedIn ? (
                     <Link href="/dashboard" className="w-full block py-4 bg-indigo-600 rounded-2xl font-bold text-center text-base shadow-xl shadow-indigo-600/20">Go to Dashboard</Link>
                   ) : (
                     <>
                       <Link href="/login" className="w-full block py-4 border border-white/10 rounded-2xl font-bold text-center text-base">Login</Link>
                       <Link href="/register" className="w-full block py-4 bg-indigo-600 rounded-2xl font-bold text-center text-base shadow-xl shadow-indigo-600/20">Get Started Free</Link>
                     </>
                   )}
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Sticky Navbar - Increased Z-index for mobile accessibility */}
      <nav className="fixed top-0 w-full z-[100] glass border-b border-white/10 px-6">
        <div className="max-w-7xl mx-auto h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Camera className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-black tracking-tighter text-white">SnapSaarthi</span>
          </div>
          <div className="hidden lg:flex items-center gap-10 text-sm font-bold text-gray-400">
            {menuItems.map((item) => <a key={item.name} href={item.href} className="hover:text-white transition-colors relative group">{item.name}<span className="absolute bottom-[-4px] left-0 w-0 h-[2px] bg-indigo-500 group-hover:w-full transition-all" /></a>)}
          </div>
           <div className="hidden lg:flex items-center gap-6">
            {isLoggedIn ? (
              <Link href="/dashboard" className="px-6 py-3 bg-indigo-600 text-white rounded-full font-black text-sm hover:translate-y-[-2px] transition-transform shadow-lg shadow-indigo-600/20">Dashboard</Link>
            ) : (
              <>
                <Link href="/login" className="text-gray-400 hover:text-white font-bold text-sm transition-colors">Login</Link>
                <Link href="/register" className="px-6 py-3 bg-white text-black rounded-full font-black text-sm hover:translate-y-[-2px] transition-transform">Get Started</Link>
              </>
            )}
          </div>
          <button 
            className="lg:hidden p-3 bg-white/10 border border-white/20 rounded-2xl active:scale-95 transition-transform" 
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Toggle Menu"
          >
            <Menu className="w-6 h-6 text-white" />
          </button>
        </div>
      </nav>

      {/* Responsive Hero */}
      <section className="relative pt-24 md:pt-40 pb-12 md:pb-24 px-6 z-10">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-center relative z-10 mb-8 md:mb-16"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 mb-10 text-[10px] font-black tracking-[0.5em] uppercase text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-full shadow-[0_0_30px_rgba(99,102,241,0.2)]">
              <Star className="w-4 h-4 fill-indigo-400" />
              Studio-First Innovation
            </div>
            
            <h1 className="text-4xl md:text-8xl font-black mb-10 tracking-tighter leading-[0.9] text-white">
              Deliver Perfection. <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-white to-rose-500 [-webkit-background-clip:text]">
                Minus The Chaos.
              </span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-base md:text-xl text-gray-400 mb-14 leading-relaxed tracking-tight px-4">
              The AI-powered OS that turns photo selection into a 
              <span className="text-white font-bold italic"> luxury experience </span> for your clients and a 
              <span className="text-white font-bold"> breeze </span> for your studio.
            </p>
            
            <div className="flex flex-row items-center justify-center gap-2 md:gap-4 w-full max-w-3xl mx-auto px-2">
              {isLoggedIn ? (
                <Link href="/dashboard" className="flex-1 px-3 py-4 md:px-12 md:py-6 bg-white text-black rounded-xl md:rounded-[2.5rem] font-black text-[10px] md:text-xl shadow-2xl hover:scale-105 active:scale-95 transition-all whitespace-nowrap text-center">
                  Open Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/register" className="flex-1 px-3 py-4 md:px-12 md:py-6 bg-white text-black rounded-xl md:rounded-[2.5rem] font-black text-[10px] md:text-xl shadow-2xl hover:scale-105 active:scale-95 transition-all whitespace-nowrap text-center flex items-center justify-center">
                    Get Started
                  </Link>
                  <button 
                    onClick={() => setIsDemoModalOpen(true)}
                    className="flex-1 px-3 py-4 md:px-12 md:py-6 glass border border-white/10 text-white rounded-xl md:rounded-[2.5rem] font-black text-[10px] md:text-xl hover:bg-white/5 transition-all whitespace-nowrap"
                  >
                    View Demo
                  </button>
                </>
              )}
              <a 
                href="https://wa.me/919209107209?text=Hello%20SnapSaarthi%20Team!%20%F0%9F%9A%80%0AI%20am%20interested%20in%20scaling%20my%20photography%20studio.%20Can%20you%20please%20share%20more%20details%20about%20the%20platform%3F"
                target="_blank"
                className="flex-1 px-3 py-4 md:px-8 md:py-6 bg-[#25D366] text-white rounded-xl md:rounded-[2.5rem] font-black text-[10px] md:text-xl hover:bg-[#20bd5c] transition-all flex items-center justify-center gap-1 md:gap-3 shadow-xl shadow-[#25D366]/20 whitespace-nowrap"
              >
                <svg viewBox="0 0 24 24" className="w-3 h-3 md:w-6 md:h-6 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp
              </a>
            </div>
          </motion.div>

          {/* Combined Scroll + Mouse 3D Visual */}
          <motion.div 
            style={{ 
              rotateX: combinedRotateX, 
              rotateY: desktopRotateY, 
              scale: mobileScale,
              transformStyle: "preserve-3d" 
            }}
            className="relative w-full max-w-6xl group will-change-transform"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 1.2 }}
              className="relative aspect-[4/3] md:aspect-[16/10] glass rounded-[2rem] md:rounded-[3rem] p-2 md:p-4 border border-white/20 shadow-[0_40px_100px_rgba(0,0,0,0.7)] overflow-hidden bg-[#050505]"
            >
              <img 
                src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=2070" 
                alt="Dashboard"
                className="w-full h-full object-cover rounded-[1.8rem] md:rounded-[2.5rem] opacity-70 transition-all duration-700 hover:opacity-100"
              />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#020202] via-transparent to-transparent" />
              
              {/* Animated UI Elements */}
              <div className="absolute inset-6 md:inset-12 flex flex-col justify-between pointer-events-none">
                 <div className="flex justify-between items-start">
                    <div className="w-32 md:w-48 h-8 md:h-10 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 flex items-center px-4">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <div className="ml-3 w-16 md:w-24 h-1.5 bg-white/20 rounded-full" />
                    </div>
                    <div className="w-12 md:w-20 h-12 md:h-20 bg-indigo-600/30 backdrop-blur-3xl rounded-2xl border border-white/10 flex items-center justify-center">
                      <Zap className="text-white w-6 md:w-10 h-6 md:h-10" />
                    </div>
                 </div>
                 
                 <div className="flex justify-center gap-6 md:gap-10 mb-6 md:mb-10">
                    <div className="w-16 md:w-24 h-16 md:h-24 rounded-2xl md:rounded-[2rem] bg-indigo-600 flex items-center justify-center shadow-[0_0_50px_rgba(79,70,229,0.5)]">
                      <Check className="w-8 md:w-12 h-8 md:h-12 text-white" />
                    </div>
                    <div className="w-16 md:w-24 h-16 md:h-24 rounded-2xl md:rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-xl">
                      <X className="w-8 md:w-12 h-8 md:h-12 text-white/40" />
                    </div>
                 </div>
              </div>
            </motion.div>

            {/* Floating Layers */}
            <div className="hidden lg:block">
              <motion.div
                style={{ translateZ: 120 }}
                animate={{ y: [0, -30, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[-50px] left-[-100px] p-8 glass rounded-3xl border-white/20 shadow-3xl z-20"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-indigo-500/20 rounded-2xl flex items-center justify-center"><Users className="text-indigo-400 w-8 h-8" /></div>
                  <div>
                    <p className="text-lg font-black tracking-tighter italic">Studio Live</p>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">34 Team Members Active</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                style={{ translateZ: 180 }}
                animate={{ y: [0, 30, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-20 right-[-100px] p-8 glass rounded-3xl border-white/20 shadow-3xl z-20"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-rose-500 rounded-2xl flex items-center justify-center animate-bounce shadow-xl shadow-rose-500/30">
                    <Heart className="w-7 h-7 text-white fill-white" />
                  </div>
                  <div>
                    <p className="text-lg font-black tracking-tighter italic">Client Love</p>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Selections Certified</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Problem Section: Stop Chasing Screenshots */}
      <section id="how-it-works" className="py-16 md:py-24 px-6 relative z-10 bg-[#020202]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 md:mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-7xl font-black mb-6 tracking-tighter"
            >
              Stop Chasing Screenshots. <br />
              <span className="text-gray-500 italic">Start Creating Art.</span>
            </motion.h2>
            <p className="text-gray-500 text-xl max-w-2xl mx-auto">
              Photo selection shouldn't be your biggest nightmare. Yet, every week, it's the same chaos.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {[
              {
                title: "WhatsApp Chaos",
                desc: "No more messy 'Pic 4, Pic 12' texts or blurry shots.",
                icon: <MessageSquare className="text-rose-400 w-4 h-4" />
              },
              {
                title: "No Limits",
                desc: "Clients selecting 200+ photos for a 50-photo album.",
                icon: <Infinity className="text-rose-400 w-4 h-4" />
              },
              {
                title: "Paralysis",
                desc: "Clients overwhelmed by 2,000+ unorganized RAW photos.",
                icon: <Layers className="text-rose-400 w-4 h-4" />
              },
              {
                title: "Sequence",
                desc: "Confusion about the album story and flow.",
                icon: <ArrowRightCircle className="text-rose-400 w-4 h-4" />
              }
            ].map((p, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
                className="p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-rose-500/20 transition-all group flex flex-col items-center text-center"
              >
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-rose-500/10 flex items-center justify-center mb-4">
                  {p.icon}
                </div>
                <h3 className="text-sm md:text-xl font-bold mb-2 text-white group-hover:text-rose-400 transition-colors tracking-tight leading-tight">{p.title}</h3>
                <p className="text-[10px] md:text-sm text-gray-500 leading-relaxed font-medium">
                  {p.desc}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-16 p-12 rounded-[3.5rem] bg-indigo-600/10 border border-indigo-500/20 text-center"
          >
            <p className="text-2xl md:text-3xl font-bold text-indigo-300 italic">
              "Your talent is photography. Your job shouldn't be deciphering messy WhatsApp chats and handling selection math. You're losing hours of billable work every single week."
            </p>
          </motion.div>
        </div>
      </section>

      {/* USP & Stats Break */}
      <section className="py-16 md:py-24 px-6 relative z-10 bg-[#020202]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-5xl md:text-8xl font-black tracking-tighter italic mb-8">
                Built For <br />
                <span className="text-indigo-500">Performance.</span>
              </h2>
              <p className="text-gray-400 text-xl font-medium max-w-md italic">
                We've benchmarked every pixel. SnapSaarthi is engineered to handle the heaviest studio workloads without breaking a sweat.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 md:gap-8">
              {[
                { label: "Photos Managed", value: "2M+", color: "text-indigo-400" },
                { label: "Selection Time", value: "-80%", color: "text-rose-400" },
                { label: "Selection Errors", value: "ZERO", color: "text-emerald-400" },
                { label: "Studio Growth", value: "2.5x", color: "text-yellow-400" }
              ].map((s, i) => (
                <div key={i} className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 flex flex-col justify-center">
                  <div className={`text-3xl md:text-5xl font-black mb-2 tracking-tighter ${s.color}`}>{s.value}</div>
                  <div className="text-gray-500 text-xs md:text-sm font-bold uppercase tracking-widest">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section: The Elite Bento OS */}
      <section id="features" className="py-16 md:py-24 px-6 border-y border-white/5 relative z-10 bg-[#020202]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-24">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-7xl font-black mb-8 tracking-tighter"
            >
              The Studio OS <br /> 
              <span className="text-indigo-500 italic">You've Been Waiting For.</span>
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
            {/* Main Hero Feature */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="md:col-span-8 p-12 rounded-[3.5rem] bg-indigo-600/10 border border-indigo-500/20 flex flex-col md:flex-row items-center gap-12 overflow-hidden group"
            >
              <div className="flex-1 space-y-6">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center">
                  <Heart className="w-8 h-8 text-indigo-400" />
                </div>
                <h3 className="text-4xl font-black tracking-tighter text-white">One-Tap Selection Portal</h3>
                <p className="text-gray-400 text-xl leading-relaxed">
                  Clients heart their favorites in seconds. A beautiful, branded gallery experience that works on any device. No messy lists, no confusion.
                </p>
              </div>
              <div className="flex-1 relative w-full h-[300px] bg-[#050505] rounded-[2rem] border border-white/10 p-4 shadow-2xl group-hover:scale-105 transition-transform overflow-hidden">
                 <div className="flex justify-between items-center mb-6">
                   <div className="w-20 h-2 bg-indigo-500/20 rounded-full" />
                   <div className="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center animate-pulse shadow-[0_0_20px_rgba(244,63,94,0.4)]">
                     <Heart className="w-5 h-5 text-white fill-white" />
                   </div>
                 </div>
                 <div className="grid grid-cols-2 gap-3 pb-10">
                   <div className="h-28 bg-white/5 rounded-xl overflow-hidden relative">
                      <img src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover opacity-60" />
                      <div className="absolute top-2 right-2 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                   </div>
                   <div className="h-28 bg-white/5 rounded-xl overflow-hidden relative">
                      <img src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover opacity-60" />
                   </div>
                   <div className="h-28 bg-white/5 rounded-xl overflow-hidden relative">
                      <img src="https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover opacity-60" />
                   </div>
                   <div className="h-28 bg-white/5 rounded-xl overflow-hidden relative">
                      <img src="https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover opacity-60" />
                   </div>
                 </div>
              </div>
            </motion.div>

            {/* Smart Limits */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="md:col-span-4 p-10 rounded-[3.5rem] bg-white/[0.02] border border-white/5 flex flex-col justify-between group"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-8">
                <Shield className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-2xl font-black mb-4 text-white">Smart Limits</h3>
                <p className="text-gray-500 leading-relaxed">
                  Decide exactly how many photos can be picked. No more extra-photo awkwardness.
                </p>
              </div>
            </motion.div>

            {/* Selection Tracking */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="md:col-span-4 p-10 rounded-[3.5rem] bg-white/[0.02] border border-white/5 flex flex-col justify-between"
            >
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center mb-8">
                <Zap className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <h3 className="text-2xl font-black mb-4 text-white">Real-time Progress</h3>
                <p className="text-gray-500 leading-relaxed font-medium">
                  Watch clients hit their goals (45/100) with live tracking.
                </p>
                <div className="mt-6 w-full h-2 bg-white/5 rounded-full overflow-hidden">
                   <div className="w-[45%] h-full bg-indigo-600" />
                </div>
              </div>
            </motion.div>

            {/* Album-Ready Output */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="md:col-span-8 p-12 rounded-[3.5rem] bg-gradient-to-br from-[#0a0a0a] to-black border border-white/10 flex flex-col md:flex-row items-center gap-12 group"
            >
               <div className="w-20 h-20 rounded-full bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
                  <Star className="w-10 h-10 text-indigo-400" />
               </div>
               <div>
                  <h3 className="text-3xl font-black tracking-tighter text-white mb-4">Album-Ready Deliverables</h3>
                  <p className="text-gray-500 text-lg">One click generates a clean, ready-to-use list. Stop manual data entry and start designing albums immediately.</p>
               </div>
            </motion.div>
          </div>

          <div className="mt-16 text-center">
              <p className="text-3xl md:text-5xl font-black italic tracking-tighter text-white">
                From selection chaos to <span className="text-indigo-500">total studio clarity.</span>
              </p>
           </div>
        </div>
      </section>

      {/* Benefits Section: Why SnapSaarthi? */}
      <section className="py-16 md:py-24 px-6 relative z-10 bg-[#050505]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl md:text-7xl font-black tracking-tighter leading-tight">
                More Than a Tool. <br />
                <span className="text-indigo-500 italic">It's Your Competitive Edge.</span>
              </h2>
              <p className="text-gray-400 text-xl font-medium max-w-xl">
                SnapSaarthi isn't just about selecting photos—it's about reclaiming your studio's time and reputation.
              </p>
              
              <div className="space-y-6">
                {[
                  { 
                    title: "Scale Without Stress", 
                    desc: "Handle 10x more clients with the same team size using our automated workflows.",
                    icon: <Rocket className="w-5 h-5 text-indigo-400" />
                  },
                  { 
                    title: "Ultimate Brand Trust", 
                    desc: "Deliver a premium, branded experience that makes your studio look like a global leader.",
                    icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  }
                ].map((b, i) => (
                  <div key={i} className="flex gap-4 p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
                    <div className="mt-1">{b.icon}</div>
                    <div>
                      <h4 className="text-lg font-bold text-white mb-1">{b.title}</h4>
                      <p className="text-sm text-gray-500 leading-relaxed">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: "Time is Revenue",
                  value: "SAVE 20+ HOURS",
                  desc: "Per wedding project by eliminating manual selection tracking.",
                  icon: <Clock className="w-8 h-8 text-rose-500" />,
                  bg: "bg-rose-500/10",
                  border: "border-rose-500/20"
                },
                {
                  title: "Selection Accuracy",
                  value: "100% ERROR-FREE",
                  desc: "Automated limits ensure you never design for the wrong count again.",
                  icon: <Check className="w-8 h-8 text-indigo-500" />,
                  bg: "bg-indigo-500/10",
                  border: "border-indigo-500/20"
                },
                {
                  title: "Client Satisfaction",
                  value: "5-STAR FEEDBACK",
                  desc: "Clients love the ease of 'hearting' photos on their phones.",
                  icon: <Smile className="w-8 h-8 text-yellow-500" />,
                  bg: "bg-yellow-500/10",
                  border: "border-yellow-500/20"
                },
                {
                  title: "Business Growth",
                  value: "MAXIMIZE ROI",
                  desc: "Deliver faster, get paid sooner, and take on more high-end bookings.",
                  icon: <Coins className="w-8 h-8 text-emerald-500" />,
                  bg: "bg-emerald-500/10",
                  border: "border-emerald-500/20"
                }
              ].map((card, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.02 }}
                  className={`p-8 rounded-[2.5rem] ${card.bg} border ${card.border} flex flex-col justify-between h-full aspect-square md:aspect-auto`}
                >
                  <div>
                    <div className="mb-6">{card.icon}</div>
                    <div className="text-xs font-black tracking-widest text-white/40 uppercase mb-2">{card.title}</div>
                    <div className="text-2xl font-black text-white mb-4 tracking-tighter">{card.value}</div>
                  </div>
                  <p className="text-sm text-gray-400 font-medium leading-relaxed italic">
                    "{card.desc}"
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section: Animated Horizontal Roadmap */}
      <section id="how-it-works" className="py-16 md:py-24 px-6 relative z-10 bg-[#020202]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-4xl md:text-7xl font-black mb-8 tracking-tighter italic">3 Steps. <span className="text-indigo-500">Infinite Time.</span></h2>
            <p className="text-gray-500 text-xl font-medium italic">From raw shots to a flawless final selection in minutes.</p>
          </div>

          <div className="relative">
            {/* The Animated Connecting Line (Horizontal) */}
            <div className="absolute top-[24px] left-0 right-0 h-[2px] bg-white/5 hidden md:block" />
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: "100%" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              viewport={{ once: true }}
              className="absolute top-[24px] left-0 h-[2px] bg-gradient-to-r from-indigo-500 via-rose-500 to-transparent hidden md:block z-10" 
            />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-16 md:gap-8">
              {[
                { 
                  step: "01",
                  title: "Upload Magic", 
                  desc: "Drop RAW photos into our optimized portal instantly.",
                  icon: <Zap className="w-5 h-5 text-white" />
                },
                { 
                  step: "02",
                  title: "Share Link", 
                  desc: "Send a branded gallery link via WhatsApp or Email.",
                  icon: <Globe className="w-5 h-5 text-white" />
                },
                { 
                  step: "03",
                  title: "Client Selects", 
                  desc: "Clients heart their favorites on any device easily.",
                  icon: <Heart className="w-5 h-5 text-white" />
                },
                { 
                  step: "04",
                  title: "Final Export", 
                  desc: "Get an error-free list ready for album design.",
                  icon: <Star className="w-5 h-5 text-white" />
                }
              ].map((s, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + (i * 0.2), duration: 0.8 }}
                  viewport={{ once: true }}
                  className="relative flex flex-col items-center text-center"
                >
                  {/* Number Core with Glow Pulse */}
                  <motion.div 
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: 0.5 + (i * 0.2), type: "spring" }}
                    className="w-12 h-12 rounded-full bg-indigo-600 shadow-[0_0_30px_rgba(79,70,229,0.5)] flex items-center justify-center z-20 border-4 border-[#020202] mb-10 group"
                  >
                    <span className="text-xs font-black text-white">{s.step}</span>
                  </motion.div>

                  {/* Icon with subtle float */}
                  <motion.div 
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6"
                   >
                    {s.icon}
                  </motion.div>

                  {/* Text */}
                  <h3 className="text-2xl font-black mb-4 text-white tracking-tighter italic">{s.title}</h3>
                  <p className="text-gray-500 text-sm font-medium leading-relaxed max-w-[200px]">
                    {s.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SEO Blog Section: Studio Insights */}
      <section id="blog" className="py-16 md:py-24 px-6 relative z-10 bg-[#020202]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">
                <Rocket className="w-3 h-3" /> Growth Academy
              </div>
              <h2 className="text-4xl md:text-7xl font-black tracking-tighter text-white italic">
                Latest <span className="text-indigo-500">Insights.</span>
              </h2>
              <p className="mt-4 text-gray-400 text-lg md:text-xl font-medium">
                Master the business of photography with our expert-led guides and studio success stories.
              </p>
            </div>
            <Link href="/blog" className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-indigo-400 hover:text-white transition-colors group">
              View All Insights <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "How to Scale Your Wedding Photography Business in 2026",
                category: "Business Growth",
                readTime: "8 min read",
                image: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&q=80&w=800",
                desc: "Discover the 5 automated systems every high-end studio needs to double their revenue without adding more staff."
              },
              {
                title: "The Art of Client Communication: Beyond Screenshots",
                category: "Workflow",
                readTime: "5 min read",
                image: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=800",
                desc: "Why traditional selection methods are killing your client's experience and how to fix it with elite digital portals."
              },
              {
                title: "Mastering the Digital Album: 3D Flipbooks and Beyond",
                category: "Innovation",
                readTime: "6 min read",
                image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800",
                desc: "How delivering interactive digital memories can help you charge 30% more for your wedding packages."
              }
            ].map((post, i) => (
              <motion.article 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group cursor-pointer"
              >
                <div className="relative aspect-[16/10] rounded-[2.5rem] overflow-hidden mb-6 border border-white/10 group-hover:border-indigo-500/50 transition-all">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 opacity-60 group-hover:opacity-100"
                  />
                  <div className="absolute top-6 left-6 p-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
                    <div className="px-4 py-1.5 rounded-full bg-white text-black text-[10px] font-black uppercase tracking-widest">
                      {post.category}
                    </div>
                  </div>
                </div>
                <div className="px-2">
                  <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-3">
                    <span>{post.readTime}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-700" />
                    <span>April 2026</span>
                  </div>
                  <h3 className="text-2xl font-black tracking-tighter text-white mb-4 group-hover:text-indigo-400 transition-colors leading-tight italic">
                    {post.title}
                  </h3>
                  <p className="text-gray-500 text-sm font-medium leading-relaxed line-clamp-2">
                    {post.desc}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section: Ready to Transform? */}
      <section className="py-12 md:py-20 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-[3rem] md:rounded-[4rem] bg-gradient-to-br from-indigo-600 via-indigo-700 to-rose-600 p-8 md:p-24 text-center shadow-[0_40px_100px_rgba(79,70,229,0.4)]"
          >
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent)] pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-[80px] pointer-events-none" />
            
            <div className="relative z-10 max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-[10px] font-black tracking-[0.3em] uppercase text-white bg-white/10 backdrop-blur-xl border border-white/20 rounded-full">
                <Sparkles className="w-4 h-4 fill-white animate-pulse" />
                Limited Studio Invites
              </div>
              
              <h2 className="text-4xl md:text-7xl font-black mb-8 tracking-tighter leading-none text-white italic">
                Ready to Deliver <br />
                <span className="text-white/80">Absolute Perfection?</span>
              </h2>
              
              <p className="text-white/70 text-lg md:text-2xl font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
                Join 500+ elite photography studios who have stopped chasing screenshots and started scaling their creative vision.
              </p>
              
              <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                <button 
                  onClick={() => router.push(isLoggedIn ? "/dashboard" : "/register")} 
                  className="w-full md:w-auto px-10 py-6 bg-white text-indigo-700 rounded-[2rem] font-black text-xl shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  {isLoggedIn ? "Go to Dashboard" : "Start Your Free Trial"} <ArrowRight className="w-6 h-6" />
                </button>
                <button 
                  onClick={() => setIsDemoModalOpen(true)}
                  className="w-full md:w-auto px-10 py-6 glass border border-white/20 text-white rounded-[2rem] font-black text-xl hover:bg-white/5 transition-all"
                >
                  Book a Demo
                </button>
              </div>
              
              <div className="mt-12 flex flex-wrap justify-center gap-8 opacity-60">
                <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-widest"><Check className="w-4 h-4" /> No Credit Card Required</div>
                <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-widest"><Check className="w-4 h-4" /> 14-Day Free Access</div>
                <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-widest"><Check className="w-4 h-4" /> Enterprise Support</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Premium Multi-Column Footer */}
      <footer className="py-12 md:py-20 px-6 border-t border-white/5 relative z-10 bg-[#020202]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-8 mb-24">
            {/* Brand Column */}
            <div className="md:col-span-4 space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Camera className="w-7 h-7 text-white" />
                </div>
                <span className="text-3xl font-black tracking-tighter italic">SnapSaarthi</span>
              </div>
              <p className="text-gray-400 text-lg font-medium leading-relaxed max-w-sm italic">
                The ultimate Operating System for modern photography studios. Reclaiming your time, one selection at a time.
              </p>
              <div className="flex items-center gap-5">
                {[Instagram, Twitter, Linkedin, Facebook].map((Icon, i) => (
                  <a key={i} href="#" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-indigo-600/20 hover:border-indigo-500/30 transition-all">
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Product Links */}
            <div className="md:col-span-2 space-y-6">
              <h4 className="text-white font-black uppercase tracking-widest text-xs">Product</h4>
              <ul className="space-y-4 text-sm font-bold text-gray-500">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a></li>
                <li><a href="/pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Portal</a></li>
              </ul>
            </div>

            {/* Resources Links */}
            <div className="md:col-span-2 space-y-6">
              <h4 className="text-white font-black uppercase tracking-widest text-xs">Resources</h4>
              <ul className="space-y-4 text-sm font-bold text-gray-500">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Studio Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Case Studies</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
              </ul>
            </div>

            {/* Company Links */}
            <div className="md:col-span-2 space-y-6">
              <h4 className="text-white font-black uppercase tracking-widest text-xs">Company</h4>
              <ul className="space-y-4 text-sm font-bold text-gray-500">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press Kit</a></li>
              </ul>
            </div>

            {/* Support/News Letter */}
            <div className="md:col-span-2 space-y-6">
              <h4 className="text-white font-black uppercase tracking-widest text-xs">Connect</h4>
              <ul className="space-y-4 text-sm font-bold text-gray-500">
                <li className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer text-xs"><Mail className="w-4 h-4" /> support@snapsaarthi.com</li>
                <li>
                   <button className="mt-4 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold text-xs hover:bg-white hover:text-black transition-all">Support Desk</button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-gray-600 text-[10px] uppercase tracking-[0.4em] font-black">
              © MMXXVI SnapSaarthi OS. All Core Systems Active.
            </p>
            <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-gray-600">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
      {/* FIXED WhatsApp Button - Always Visible & Interactive */}
      <a
        href="https://wa.me/919209107209?text=Hello%20SnapSaarthi%20Team!%20%F0%9F%9A%80%0AI%20am%20interested%20in%20scaling%20my%20photography%20studio.%20Can%20you%20please%20share%20more%20details%20about%20the%20platform%3F"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-24 right-8 z-[9999] w-16 h-16 bg-[#25D366] rounded-full flex items-center justify-center shadow-[0_10px_50px_rgba(37,211,102,0.6)] border-4 border-[#020202] hover:scale-110 active:scale-95 transition-all cursor-pointer group"
      >
        <div className="absolute inset-0 rounded-full bg-[#25D366] animate-pulse opacity-20 pointer-events-none" />
        <svg 
          viewBox="0 0 24 24" 
          className="w-8 h-8 text-white fill-current"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        <div className="absolute right-20 bg-white text-black px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
          Support 👋
        </div>
      </a>
      </main>
       {/* Book Demo Modal */}
       <AnimatePresence>
         {isDemoModalOpen && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-[200] flex items-center justify-center p-4">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-lg bg-[#050505] border border-white/10 rounded-[3rem] p-10 overflow-hidden relative">
                 <button onClick={() => setIsDemoModalOpen(false)} className="absolute top-8 right-8 text-gray-500 hover:text-white"><X className="w-6 h-6"/></button>
                 
                 <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-600/20">
                       <Rocket className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-2">Book Your <span className="text-indigo-500">Demo</span></h2>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Experience the Future of Studio Management</p>
                 </div>

                 <form className="space-y-4" onSubmit={async (e) => {
                    e.preventDefault();
                    setDemoLoading(true);
                    const formData = new FormData(e.target as HTMLFormElement);
                    try {
                      await fetch("/api/demo/request", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(Object.fromEntries(formData))
                      });
                      setIsDemoModalOpen(false);
                      router.push("/demo");
                    } catch (err) { console.error(err); }
                    setDemoLoading(false);
                 }}>
                    <input required name="name" placeholder="Contact Name" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-indigo-500 font-bold" />
                    <input required name="studioName" placeholder="Studio Name" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-indigo-500 font-bold" />
                    <input required name="mobile" placeholder="WhatsApp Number" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-indigo-500 font-bold" />
                    <button disabled={demoLoading} type="submit" className="w-full py-5 bg-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-indigo-600/20 mt-4">
                       {demoLoading ? "Preparing Demo..." : "Enter Live Sandbox"}
                    </button>
                    <p className="text-center text-[8px] text-gray-700 font-bold uppercase tracking-widest mt-4">No credit card required. Instant access.</p>
                 </form>
              </motion.div>
           </motion.div>
         )}
       </AnimatePresence>
    </>
  );
}
