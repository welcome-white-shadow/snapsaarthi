"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, Search, Shield, Filter, MoreVertical, 
  MessageCircle, ExternalLink, Calendar, 
  Activity, ArrowUpRight, Loader2, Camera,
  Briefcase, Phone, Mail, X, Lock, CheckCircle, CreditCard, RefreshCw, Menu
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../../components/Toaster";

export default function AdminPanel() {
  const router = useRouter();
  const [studios, setStudios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudio, setSelectedStudio] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [updatingPlan, setUpdatingPlan] = useState(false);
  const [activeTab, setActiveTab] = useState<"studios" | "settings" | "stats">("studios");
  const [globalUpiId, setGlobalUpiId] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    const saved = sessionStorage.getItem("snapsaarthi_user");
    if (!saved) {
      router.push("/login");
      return;
    }
    const userData = JSON.parse(saved);
    if (userData.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }
    setUser(userData);
    setIsAuthorized(true);
    fetchStudios(userData.email);
    fetchStats(userData.email);
    fetchConfig();
  }, [router]);

  const fetchConfig = async () => {
    try {
      const resp = await fetch("/api/admin/config");
      const data = await resp.json();
      if (data.upiId) setGlobalUpiId(data.upiId);
    } catch (err) { console.error(err); }
  };

  const handleUpdateConfig = async () => {
    if (!user) return;
    setSavingSettings(true);
    try {
      const resp = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          upiId: globalUpiId,
          adminEmail: user.email
        })
      });
      const data = await resp.json();
      if (data.success) {
        success("System settings updated globally!");
      } else {
        error(data.error || "Update failed");
      }
    } catch (err) {
      error("Network error");
    } finally {
      setSavingSettings(false);
    }
  };

  const handlePlanUpdate = async (userId: string, newPlan: string, maxAlbums?: number) => {
    if (!user) return;
    setUpdatingPlan(true);
    try {
      const resp = await fetch("/api/admin/users/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          newPlan,
          adminEmail: user.email,
          maxAlbums
        })
      });
      const data = await resp.json();
      if (data.success) {
        success(`Plan updated successfully!`);
        fetchStudios(user.email);
        if (selectedStudio?.id === userId) {
           setSelectedStudio((prev: any) => ({ 
              ...prev, 
              planType: newPlan, 
              maxAlbums: maxAlbums || prev.maxAlbums,
              isPendingUpgrade: false 
           }));
        }
      } else {
        error(data.error || "Update failed");
      }
    } catch (err) {
      error("Network error. Try again.");
    } finally {
      setUpdatingPlan(false);
    }
  };

  const fetchStats = async (adminEmail: string) => {
    try {
      const resp = await fetch("/api/admin/stats", {
        headers: { "x-admin-email": adminEmail }
      });
      const data = await resp.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) { console.error(err); }
  };

  const fetchStudios = async (adminEmail: string) => {
    try {
      const resp = await fetch("/api/admin/studios", {
        headers: { "x-admin-email": adminEmail }
      });
      const data = await resp.json();
      if (data.success) {
        setStudios(data.studios);
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudios = studios.filter(s => 
    s.studioName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.mobileNumber?.includes(searchQuery)
  );

  if (loading || !isAuthorized) {
    return (
      <div className="min-h-screen bg-[#020202] flex items-center justify-center p-6">
         <div className="flex flex-col items-center gap-6 text-center">
            <div className="relative">
               <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
               <Lock className="absolute inset-0 m-auto w-6 h-6 text-indigo-500" />
            </div>
            <div>
               <p className="text-white font-black italic tracking-tighter uppercase text-xl mb-2">Security Guard Active</p>
               <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">Checking Access Permissions...</p>
            </div>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020202] text-white flex flex-col font-sans overflow-x-hidden">
      <header className="h-[72px] md:h-20 border-b border-white/5 px-4 md:px-8 flex items-center justify-between bg-black/50 backdrop-blur-xl z-[100] sticky top-0">
        <div className="flex items-center gap-3">
           <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2 bg-white/5 rounded-xl">
              <Menu className="w-5 h-5" />
           </button>
           <div className="flex items-center gap-2 md:gap-4">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                 <Shield className="text-white w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div>
                 <h1 className="text-lg md:text-xl font-black italic tracking-tighter uppercase leading-none">Admin <span className="text-indigo-500">HQ</span></h1>
                 <p className="text-[8px] md:text-[10px] text-emerald-400 font-bold uppercase tracking-[0.2em] mt-1 hidden xs:block">Status: Secure</p>
              </div>
           </div>
        </div>

        <div className="flex-1 max-w-sm mx-4 md:mx-12 relative group hidden sm:block">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-indigo-500 transition-colors" />
           <input 
             type="text" 
             placeholder="Search..."
             className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-12 focus:outline-none focus:border-indigo-500 transition-all text-xs font-medium"
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
           />
        </div>

        <div className="flex items-center gap-3">
           <div className="hidden lg:flex items-center bg-white/5 border border-white/10 rounded-xl p-1 mr-4">
              {["studios", "stats", "settings"].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-white'}`}
                >
                  {tab}
                </button>
              ))}
           </div>
           <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-rose-500 border border-white/10 flex items-center justify-center font-black text-xs">
              {user?.email?.[0].toUpperCase()}
           </div>
        </div>
      </header>

      {/* Mobile Tab Navigation */}
      <div className="lg:hidden flex bg-white/[0.02] border-b border-white/5 p-2 sticky top-[72px] z-[90] backdrop-blur-md">
         {["studios", "stats", "settings"].map((tab) => (
           <button 
             key={tab}
             onClick={() => setActiveTab(tab as any)}
             className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500'}`}
           >
             {tab}
           </button>
         ))}
      </div>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
              {activeTab === 'stats' && stats && (
                 <div className="max-w-7xl mx-auto py-6">
                    <div className="mb-10">
                       <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-2">Platform <span className="text-indigo-500">Pulse</span></h2>
                       <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Global Performance</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                       {[
                         { label: "Total Studios", value: stats.totalStudios, sub: `+${stats.newStudios} new`, icon: Users, color: "text-indigo-500" },
                         { label: "Total Albums", value: stats.totalAlbums, sub: "Live Event Portals", icon: Camera, color: "text-rose-500" },
                         { label: "Est. Revenue", value: `₹${stats.estimatedMonthlyRevenue}`, sub: "Monthly Recurring", icon: CreditCard, color: "text-emerald-500" },
                         { label: "Conversion", value: `${Math.round(((stats.plans.MICRO + stats.plans.PRO) / stats.totalStudios) * 100)}%`, sub: "Paid User Ratio", icon: Activity, color: "text-amber-500" }
                       ].map((card, i) => (
                         <div key={i} className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 relative overflow-hidden group">
                             <div className="relative z-10">
                                <card.icon className={`${card.color} w-5 h-5 mb-4`} />
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">{card.label}</p>
                                <p className="text-3xl font-black italic tracking-tighter mb-2">{card.value}</p>
                                <p className="text-[9px] font-bold uppercase text-gray-700">{card.sub}</p>
                             </div>
                             <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                         </div>
                       ))}
                    </div>
                 </div>
              )}

              {activeTab === 'settings' && (
                <div className="max-w-3xl mx-auto py-6">
                   <div className="mb-10 text-center md:text-left">
                      <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-2">Global <span className="text-indigo-500">Settings</span></h2>
                   </div>
                   <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 md:p-12 relative overflow-hidden">
                      <div className="relative z-10 space-y-6">
                         <div className="space-y-3 text-center md:text-left">
                            <label className="text-[10px] font-black uppercase tracking-widest text-indigo-500 md:ml-4">Primary UPI ID</label>
                            <input 
                              type="text" 
                              value={globalUpiId}
                              onChange={(e) => setGlobalUpiId(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 md:py-5 px-6 md:px-8 font-black text-lg md:text-xl uppercase tracking-tighter text-center md:text-left"
                            />
                         </div>
                         <button 
                           onClick={handleUpdateConfig}
                           disabled={savingSettings}
                           className="w-full py-4 md:py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
                         >
                            {savingSettings ? "Saving..." : "Save Settings"}
                         </button>
                      </div>
                   </div>
                </div>
              )}

              {activeTab === 'studios' && (
                 <div className="py-6">
                  <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                     <div>
                        <h2 className="text-2xl font-black italic tracking-tighter uppercase">Studios <span className="text-indigo-500">Active</span></h2>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{filteredStudios.length} entries matching</p>
                     </div>
                     <div className="md:hidden">
                        <input 
                           type="text" 
                           placeholder="Search studios..."
                           className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-6 focus:outline-none focus:border-indigo-500 transition-all text-xs font-medium"
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                        />
                     </div>
                  </div>

                  {/* Desktop Studios Table */}
                  <div className="hidden md:block bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <table className="w-full text-left">
                       <thead className="bg-white/[0.04] text-[10px] font-black uppercase tracking-widest text-gray-600">
                          <tr>
                             <th className="px-8 py-6">Studio</th>
                             <th className="px-8 py-6">Contact</th>
                             <th className="px-8 py-6">Quota</th>
                             <th className="px-8 py-6">Plan</th>
                             <th className="px-8 py-6">Actions</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-white/5">
                          {filteredStudios.map((studio) => (
                             <tr key={studio.id} onClick={() => setSelectedStudio(studio)} className="group hover:bg-white/[0.02] cursor-pointer">
                                <td className="px-8 py-6">
                                   <p className="font-black italic uppercase tracking-tighter">{studio.studioName}</p>
                                   <p className="text-[10px] text-gray-500 uppercase">{studio.name}</p>
                                </td>
                                <td className="px-8 py-6">
                                   <p className="text-[10px] font-bold text-gray-500">{studio.email}</p>
                                   <p className="text-[10px] font-bold text-emerald-500 font-black">+91 {studio.mobileNumber}</p>
                                </td>
                                <td className="px-8 py-6 text-xs font-black">
                                   {studio.totalAlbums} / {studio.maxAlbums || (studio.planType === 'MICRO' ? 5 : studio.planType === 'FREE' ? 1 : '∞')}
                                </td>
                                <td className="px-8 py-6">
                                   <div className="flex flex-col gap-1">
                                      <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase border w-fit ${studio.planType === 'PRO' ? 'border-emerald-500 text-emerald-500' : (studio.planType === 'MICRO' ? 'border-indigo-500 text-indigo-500' : 'border-gray-500 text-gray-500')}`}>
                                         {studio.planType}
                                      </span>
                                      {studio.isPendingUpgrade && <span className="text-[7px] text-rose-500 animate-pulse font-black uppercase tracking-widest">Verify Payment</span>}
                                   </div>
                                </td>
                                <td className="px-8 py-6">
                                    <ArrowUpRight className="w-4 h-4 text-gray-700 group-hover:text-white transition-colors" />
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                  </div>

                  {/* Mobile Studios List */}
                  <div className="md:hidden space-y-4">
                     {filteredStudios.map((studio) => (
                        <div 
                           key={studio.id} 
                           onClick={() => setSelectedStudio(studio)}
                           className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 relative overflow-hidden"
                        >
                           <div className="flex justify-between items-start mb-4">
                              <div className="min-w-0">
                                 <h3 className="text-base font-black italic uppercase tracking-tight truncate">{studio.studioName}</h3>
                                 <p className="text-[10px] text-gray-500 font-black tracking-widest uppercase">{studio.email}</p>
                              </div>
                              <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase border ${studio.planType === 'PRO' ? 'border-emerald-500 text-emerald-500' : (studio.planType === 'MICRO' ? 'border-indigo-500 text-indigo-500' : 'border-gray-500 text-gray-500')}`}>
                                 {studio.planType}
                              </span>
                           </div>
                           <div className="flex justify-between items-end">
                              <div className="space-y-1">
                                 <p className="text-[9px] font-black uppercase text-gray-600">Usage Limit</p>
                                 <p className="text-sm font-black italic">{studio.totalAlbums} / {studio.maxAlbums || (studio.planType === 'MICRO' ? 5 : 1)}</p>
                              </div>
                              {studio.isPendingUpgrade && (
                                 <div className="px-3 py-1 bg-rose-500/10 text-rose-500 rounded-full text-[8px] font-black uppercase animate-pulse border border-rose-500/20">
                                    Verify ID
                                 </div>
                              )}
                           </div>
                        </div>
                     ))}
                  </div>
                 </div>
              )}
          </div>
        </div>

        {/* Selected Studio Sidebar (Responsive Drawer) */}
        <AnimatePresence>
           {selectedStudio && (
              <>
               {/* Mobile Overlay */}
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 onClick={() => setSelectedStudio(null)}
                 className="fixed inset-0 bg-black/90 backdrop-blur-md z-[150] lg:hidden"
               />
               <motion.aside 
                 initial={{ x: "100%", opacity: 0 }}
                 animate={{ x: 0, opacity: 1 }}
                 exit={{ x: "100%", opacity: 0 }}
                 className="fixed right-0 top-0 h-full w-full sm:w-[450px] bg-[#050505] border-l border-white/5 p-6 md:p-10 overflow-y-auto no-scrollbar z-[200] shadow-2xl"
               >
                   <div className="flex items-center justify-between mb-8 md:mb-10">
                      <h3 className="text-xs font-black uppercase tracking-[0.4em] text-indigo-500 italic">Studio Command</h3>
                      <button onClick={() => setSelectedStudio(null)} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                         <X className="w-5 h-5"/>
                      </button>
                   </div>

                   <div className="text-center mb-10">
                      <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] mx-auto mb-6 flex items-center justify-center text-3xl font-black shadow-2xl shadow-indigo-600/20">{selectedStudio.studioName[0]}</div>
                      <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-1">{selectedStudio.studioName}</h2>
                      <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{selectedStudio.email}</p>
                   </div>

                   {selectedStudio.isPendingUpgrade && (
                      <div className="mb-8 p-6 bg-rose-500/10 border border-rose-500/20 rounded-3xl">
                         <div className="flex items-center gap-2 mb-2">
                           <Shield className="w-3 h-3 text-rose-500" />
                           <p className="text-[9px] font-black uppercase text-rose-500">Manual Verification Required</p>
                         </div>
                         <p className="text-xl font-black italic text-white mb-2 tracking-widest select-all">{selectedStudio.lastTxnId}</p>
                         <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Transaction ID provided by user</p>
                      </div>
                   )}

                   <div className="space-y-8">
                      <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
                         <div className="flex items-center gap-2 mb-6">
                            <CreditCard className="w-4 h-4 text-indigo-500" />
                            <h4 className="text-[10px] font-black uppercase tracking-widest">Subscription Engine</h4>
                         </div>
                         <div className="flex flex-col gap-2 mb-6">
                            {['FREE', 'MICRO', 'PRO'].map(p => (
                              <button
                                key={p}
                                disabled={updatingPlan || selectedStudio.planType === p}
                                onClick={() => handlePlanUpdate(selectedStudio.id, p)}
                                className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                  selectedStudio.planType === p 
                                    ? 'bg-indigo-600 text-white shadow-lg' 
                                    : 'bg-white/5 text-gray-500 hover:bg-white/10'
                                }`}
                              >
                                {selectedStudio.planType === p ? `Active: ${p}` : `Upgrade to ${p}`}
                              </button>
                            ))}
                         </div>

                         <div className="space-y-3 pt-6 border-t border-white/5">
                            <p className="text-[9px] font-black uppercase text-gray-600 tracking-wider">Manual Quota Management</p>
                            <div className="flex gap-2">
                               <input 
                                  type="number"
                                  id={`maxAlbums-${selectedStudio.id}`}
                                  placeholder="New Limit"
                                  className="flex-1 bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                               />
                               <button 
                                  disabled={updatingPlan}
                                  onClick={() => {
                                     const val = (document.getElementById(`maxAlbums-${selectedStudio.id}`) as HTMLInputElement).value;
                                     if (val) handlePlanUpdate(selectedStudio.id, selectedStudio.planType, parseInt(val));
                                  }}
                                  className="px-6 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all font-black"
                               >
                                  Set
                                </button>
                            </div>
                            <p className="text-[8px] text-gray-700 font-bold uppercase tracking-widest">Current Limit: {selectedStudio.maxAlbums || 'Plan Default'}</p>
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                         <button 
                            onClick={() => window.open(`https://wa.me/91${selectedStudio.mobileNumber}`, '_blank')}
                            className="py-5 bg-[#25D366] text-black rounded-[2rem] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl hover:scale-105 transition-all"
                         >
                            <MessageCircle className="w-4 h-4 fill-current" /> WhatsApp
                         </button>
                         <button 
                            onClick={() => window.open(`tel:${selectedStudio.mobileNumber}`, '_blank')}
                            className="py-5 bg-white text-black rounded-[2rem] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl hover:scale-105 transition-all"
                         >
                            <Phone className="w-4 h-4" /> Call Studio
                         </button>
                      </div>
                   </div>
               </motion.aside>
              </>
           )}
        </AnimatePresence>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
