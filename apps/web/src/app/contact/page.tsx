"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MessageSquare, MapPin, Send, Camera, Menu, X, Globe, Twitter, Instagram, Linkedin, ArrowRight, Heart } from "lucide-react";
import Link from "next/link";
import { useScroll, useTransform } from "framer-motion";
import AuthModal from "../../components/AuthModal";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    studio: "",
    message: ""
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const whatsappOpacity = 1;
  const whatsappScale = 1;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    // Simulate API call
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  const contactOptions = [
    {
      title: "Direct Support",
      value: "support@snapsaarthi.com",
      desc: "For technical queries & account issues.",
      icon: <Mail className="w-6 h-6 text-indigo-400" />
    },
    {
      title: "Partnerships",
      value: "studio@snapsaarthi.com",
      desc: "For franchise & enterprise deals.",
      icon: <Globe className="w-6 h-6 text-emerald-400" />
    },
    {
      title: "Talk to Us",
      value: "Live Chat Active",
      desc: "Typical response in < 2 hours.",
      icon: <MessageSquare className="w-6 h-6 text-rose-400" />
    }
  ];

  return (
    <>
      <main className="min-h-screen bg-[#020202] text-white selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-[100] border-b border-white/5 bg-black/50 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto h-20 px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Camera className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-black tracking-tighter text-white">SnapSaarthi</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-400">
            <Link href="/" className="hover:text-white transition-colors text-xs uppercase tracking-widest">Home</Link>
            <Link href="/pricing" className="hover:text-white transition-colors text-xs uppercase tracking-widest">Pricing</Link>
            <Link href="/contact" className="text-white font-black text-xs uppercase tracking-[0.2em] relative">
              Contact
              <span className="absolute -bottom-2 left-0 w-full h-[2px] bg-indigo-500" />
            </Link>
          </div>
          <button onClick={() => setIsAuthModalOpen(true)} className="px-6 py-2.5 bg-white text-black rounded-full font-black text-xs hover:scale-105 transition-transform uppercase tracking-tighter">Get Started</button>
        </div>
      </nav>

      {/* Hero Header */}
      <section className="pt-40 pb-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-6 py-3 mb-8 text-[10px] font-black tracking-[0.4em] uppercase text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-full"
          >
            <Heart className="w-4 h-4 fill-rose-400" />
            Human-first support
          </motion.div>
          <h1 className="text-5xl md:text-8xl font-black mb-6 tracking-tighter italic">
            Let's <span className="text-indigo-500">Connect.</span>
          </h1>
          <p className="text-gray-400 text-xl font-medium max-w-2xl mx-auto italic">
            Whether you're a solo pro or a global franchise, we're here to optimize your workflow.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="pb-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Info Side */}
          <div className="lg:col-span-5 space-y-12">
            <div className="space-y-6">
              <h3 className="text-2xl font-black tracking-tighter italic">Studio HQ</h3>
              <div className="space-y-4">
                {contactOptions.map((opt, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ x: 5 }}
                    className="flex gap-5 p-6 rounded-3xl bg-white/[0.02] border border-white/5"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                      {opt.icon}
                    </div>
                    <div>
                      <h4 className="font-black text-white text-sm uppercase tracking-widest mb-1">{opt.title}</h4>
                      <p className="text-lg font-bold text-gray-300 tracking-tight">{opt.value}</p>
                      <p className="text-xs text-gray-500 font-medium">{opt.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="p-8 rounded-[2.5rem] bg-indigo-600/10 border border-indigo-500/20">
               <h4 className="text-lg font-black italic mb-4">Are you a studio owner with 10k+ photos?</h4>
               <p className="text-gray-400 text-sm leading-relaxed mb-6">We offer white-glove onboarding for high-volume studios. Let's set up a custom pipeline for your enterprise.</p>
               <button className="flex items-center gap-2 text-indigo-400 font-black text-xs uppercase tracking-widest hover:gap-4 transition-all">
                 Request Demo <ArrowRight className="w-4 h-4" />
               </button>
            </div>

            <div className="flex items-center gap-6">
              {[Instagram, Twitter, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-indigo-600 hover:border-indigo-500 transition-all">
                   <Icon className="w-6 h-6" />
                </a>
              ))}
            </div>
          </div>

          {/* Form Side */}
          <div className="lg:col-span-7">
            <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               className="p-8 md:p-12 rounded-[3.5rem] bg-white/[0.02] border border-white/5 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[100px] -z-10" />
              
              <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 ml-2">Full Name</label>
                    <input 
                       required
                       type="text" 
                       placeholder="e.g. Aryan Sharma"
                       className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 transition-colors font-bold"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 ml-2">Studio Name</label>
                    <input 
                       type="text" 
                       placeholder="e.g. Royal Studios"
                       className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 transition-colors font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 ml-2">Business Email</label>
                  <input 
                     required
                     type="email" 
                     placeholder="aryan@studio.com"
                     className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 transition-colors font-bold"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 ml-2">Your Message</label>
                  <textarea 
                     rows={5}
                     placeholder="How can we help you scale?"
                     className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-4 outline-none focus:border-indigo-500 transition-colors font-bold resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitted}
                  className="w-full py-6 bg-indigo-600 rounded-[2rem] font-black text-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/20 active:scale-95 disabled:bg-indigo-600/50"
                >
                  {isSubmitted ? "Message Received" : "Send Studio Inquiry"}
                  {!isSubmitted && <Send className="w-5 h-5" />}
                </button>

                {isSubmitted && (
                  <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-emerald-400 font-bold text-center"
                  >
                    Got it! Our team will reach out within the next 2 hours.
                  </motion.p>
                )}
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5 text-center bg-[#020202]">
         <p className="text-gray-600 text-[10px] uppercase tracking-[0.4em] font-black">
           © MMXXVI SnapSaarthi OS. High Authority Network Active.
         </p>
      </footer>
      {/* Sticky WhatsApp Widget - Scroll Triggered */}
      <motion.a
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        href="https://wa.me/919209107209?text=Hello%20SnapSaarthi%20Team!%20%F0%9F%9A%80%0AI%20am%20interested%20in%20scaling%20my%20photography%20studio.%20Can%20you%20please%20share%20more%20details%20about%20the%20platform%3F"
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-32 right-12 z-[200] w-16 h-16 bg-[#25D366] rounded-full flex items-center justify-center shadow-[0_10px_40px_rgba(37,211,102,0.4)] border-4 border-[#020202] cursor-pointer group"
      >
        <div className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20 pointer-events-none" />
        <svg 
          viewBox="0 0 24 24" 
          className="w-8 h-8 text-white fill-current"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>

        {/* Tooltip on Hover */}
        <div className="absolute right-20 bg-white text-black px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
          Quick Studio Help! 👋
        </div>
      </motion.a>
    </main>
    <AuthModal 
      isOpen={isAuthModalOpen} 
      onClose={() => setIsAuthModalOpen(false)} 
      initialMode="register" 
    />
    </>
  );
}
