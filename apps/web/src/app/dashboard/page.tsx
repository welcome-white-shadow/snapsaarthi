"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Camera, LayoutDashboard, Image as ImageIcon, Users, 
  Settings, HelpCircle, Plus, Search, Bell, 
  ChevronRight, MoreVertical, Clock, CheckCircle2, 
  Zap, ArrowUpRight, Filter, Menu, X, Award, Infinity, Aperture, Shield
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CreateAlbumModal from "../../components/CreateAlbumModal";
import UpgradeCard from "../../components/UpgradeCard";

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("albums");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("All");
  const [showAllAlbums, setShowAllAlbums] = useState(false);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [upgradeSelectedPlan, setUpgradeSelectedPlan] = useState<any>(null);

  useEffect(() => {
    const fetchDashboardData = async (email: string) => {
      try {
        const resp = await fetch(`/api/dashboard`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        });
        if (resp.ok) {
          const data = await resp.json();
          setStats(data.stats);
          setAlbums(data.albums);
          setNotifications(data.notifications || []);
          if (data.user) setUser(data.user);
        } else if (resp.status === 401 || resp.status === 404) {
          // If server says unauthorized, clear local and go home
          sessionStorage.removeItem("snapsaarthi_user");
          router.push("/");
        }
      } catch (err) {
        console.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    const saved = sessionStorage.getItem("snapsaarthi_user");
    if (saved) {
      try {
        const userData = JSON.parse(saved);
        if (!userData.email) {
          router.push("/");
          return;
        }
        setUser(userData);
        fetchDashboardData(userData.email);
      } catch (e) {
        router.push("/");
      }
    } else {
      // SECURITY FIX: Redirect if not logged in
      router.push("/");
    }
  }, [router]);

  // Upgrade Prompt Logic: Show a small nudge after 5 seconds if on FREE plan
  useEffect(() => {
    if (user?.plan === 'FREE' || !user?.plan) {
      const timer = setTimeout(() => {
        setShowUpgradePrompt(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const refreshData = () => {
    if (user?.email) {
      const fetchDashboardData = async (email: string) => {
        const resp = await fetch(`/api/dashboard`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        });
        if (resp.ok) {
          const data = await resp.json();
          setStats(data.stats);
          setAlbums(data.albums);
          setNotifications(data.notifications || []);
          if (data.user) setUser(data.user);
        }
      };
      fetchDashboardData(user.email);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020202] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#020202] text-white overflow-hidden">
      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-[#050505] border-r border-white/5 p-6 z-[110] lg:hidden"
            >
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <Camera className="text-white w-5 h-5" />
                  </div>
                  <span className="text-lg font-black tracking-tighter italic">SnapSaarthi</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-white/5 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-2">
                {[
                  { id: "dashboard", label: "Overview", icon: <LayoutDashboard className="w-5 h-5" /> },
                  { id: "albums", label: "Photo Albums", icon: <ImageIcon className="w-5 h-5" /> },
                  { id: "clients", label: "Clients", icon: <Users className="w-5 h-5" /> },
                  { id: "settings", label: "Settings", icon: <Settings className="w-5 h-5" /> },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                      activeTab === item.id 
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                        : "text-gray-500 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
                
                {user?.role === 'ADMIN' && (
                  <button
                    onClick={() => router.push("/admin")}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-xl font-black text-xs uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 mt-4"
                  >
                    <Shield className="w-5 h-5" />
                    Admin Command HQ
                  </button>
                )}
              </nav>


              <div className="mt-auto pt-6 border-t border-white/5">
                <div className="p-4 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Scale Fast</p>
                  <p className="text-sm font-bold text-white mb-4 italic">Get Unlimited Album Creation</p>
                  <button 
                    onClick={() => { setIsUpgradeModalOpen(true); setIsMobileMenuOpen(false); }}
                    className="w-full py-3 bg-indigo-600 text-white text-[10px] font-black rounded-xl hover:scale-105 transition-all uppercase tracking-widest"
                  >
                    Upgrade Now
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="w-72 border-r border-white/5 flex flex-col p-6 hidden lg:flex">
        <Link href="/" className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <Camera className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-black tracking-tighter italic">SnapSaarthi</span>
        </Link>

        <nav className="flex-1 space-y-2">
          {[
            { id: "dashboard", label: "Overview", icon: <LayoutDashboard className="w-5 h-5" /> },
            { id: "albums", label: "Photo Albums", icon: <ImageIcon className="w-5 h-5" /> },
            { id: "clients", label: "Clients", icon: <Users className="w-5 h-5" /> },
            { id: "settings", label: "Settings", icon: <Settings className="w-5 h-5" /> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                activeTab === item.id 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                  : "text-gray-500 hover:text-white hover:bg-white/5"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}

          {user?.role === 'ADMIN' && (
            <button
              onClick={() => router.push("/admin")}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl font-black text-xs uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 mt-4 hover:bg-indigo-500 hover:text-white transition-all shadow-lg shadow-indigo-600/10"
            >
              <Shield className="w-5 h-5" />
              Admin Command HQ
            </button>
          )}
        </nav>


        <div className="pt-6 border-t border-white/5">
          <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl font-bold text-sm text-gray-500 hover:text-white hover:bg-white/5 transition-all">
            <HelpCircle className="w-5 h-5" />
            Support Desk
          </button>
          <div className="mt-8 p-4 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl">
            <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-2">Studio Status</p>
            <p className="text-sm font-bold text-white mb-4 italic">{user?.plan === 'PRO' ? 'Unlimited Storage Active' : 'Upgrade for Unlimited Portals'}</p>
            <button 
              onClick={() => setIsUpgradeModalOpen(true)}
              className="w-full py-2 bg-white text-black text-xs font-black rounded-lg hover:scale-105 transition-transform uppercase tracking-widest"
            >
              {user?.plan === 'PRO' ? 'Manage Plan' : 'Go Pro Now'}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Sticky Upgrade Banner for FREE users */}
        <AnimatePresence>
          {(user?.plan === 'FREE' || !user?.plan) && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-indigo-600/10 border-b border-indigo-500/20 py-2 px-4 flex items-center justify-center gap-3 overflow-hidden z-[110]"
            >
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping" />
                <p className="text-[10px] md:text-sm font-black uppercase tracking-widest text-white italic">
                  Free Plan Active • <span className="text-indigo-400">Upgrade for Unlimited AI Portals</span>
                </p>
              </div>
              <button 
                onClick={() => setIsUpgradeModalOpen(true)}
                className="px-4 py-1 bg-white text-black text-[10px] font-black rounded-full hover:scale-105 transition-transform"
              >
                Go Pro
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <header className="h-20 border-b border-white/5 px-4 md:px-8 flex items-center justify-between bg-black/50 backdrop-blur-xl z-[100] sticky top-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 bg-white/5 border border-white/10 rounded-xl lg:hidden text-gray-400"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="relative flex-1 max-w-xl hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search albums..." 
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-12 focus:outline-none focus:border-indigo-500 transition-all text-sm font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <div className="relative">
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-2 md:p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors relative"
              >
                <Bell className="w-5 h-5 text-gray-400" />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#020202]" />
                )}
              </button>
                           <AnimatePresence>
                {isNotifOpen && (
                   <motion.div 
                     initial={{ opacity: 0, y: 10, scale: 0.95 }}
                     animate={{ opacity: 1, y: 0, scale: 1 }}
                     exit={{ opacity: 0, y: 10, scale: 0.95 }}
                     className="absolute right-0 mt-4 w-72 md:w-80 bg-[#050505] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[200]"
                   >
                      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                         <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Notifications</p>
                         <button className="text-[10px] font-black uppercase text-indigo-400 hover:text-white transition-colors">Clear All</button>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                         {notifications.length === 0 ? (
                            <p className="p-8 text-center text-xs text-gray-500 font-medium italic">No new activities at the moment.</p>
                         ) : (
                            notifications.map((n) => (
                               <div 
                                 key={n.id} 
                                 onClick={() => {
                                   if (n.albumId) router.push(`/dashboard/albums/${n.albumId}`);
                                   setIsNotifOpen(false);
                                 }}
                                 className="p-4 border-b border-white/5 hover:bg-indigo-600/10 cursor-pointer group transition-all flex items-start gap-4"
                               >
                                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                    <ImageIcon className="w-4 h-4 text-indigo-400 group-hover:text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-gray-300 group-hover:text-white leading-snug">{n.message}</p>
                                    <div className="flex items-center justify-between mt-2">
                                      <p className="text-[9px] font-black uppercase text-gray-600 group-hover:text-gray-400">{new Date(n.createdAt).toLocaleTimeString()}</p>
                                      <p className="text-[9px] font-black uppercase text-indigo-400 group-hover:text-white flex items-center gap-1 font-black">View <ArrowUpRight className="w-3 h-3" /></p>
                                    </div>
                                  </div>
                               </div>
                            ))
                         )}
                      </div>
                   </motion.div>
                )}
               </AnimatePresence>
            </div>
            
            <div className="flex items-center gap-2 md:gap-3 pl-3 md:pl-6 border-l border-white/5">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black italic">{user?.studioName || "Your Studio"}</p>
                <div className="flex items-center justify-end gap-2">
                  {user?.isPendingSync && <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" title="Local Cache Only" />}
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{user?.name || "Premium Member"}</p>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-rose-500 border border-white/10 flex items-center justify-center font-black text-xs uppercase shadow-lg shadow-indigo-500/20">
                {user?.name?.[0] || user?.studioName?.[0] || user?.email?.[0] || "S"}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
          <div className="max-w-7xl mx-auto space-y-12">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-4xl font-black tracking-tighter mb-2 italic">Creative <span className="text-indigo-500">Core</span></h1>
                <p className="text-gray-500 font-medium">Welcome back, {user?.name?.split(' ')[0] || "Artist"}. Here's what's happening today.</p>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="px-6 py-4 bg-indigo-600 rounded-2xl font-black text-sm shadow-xl shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
              >
                <Plus className="w-5 h-5" /> Create New Album
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 text-indigo-400">
                      {stat.type === 'albums' ? <ImageIcon className="w-5 h-5"/> : stat.type === 'selections' ? <CheckCircle2 className="w-5 h-5 text-emerald-400"/> : stat.type === 'reviews' ? <Clock className="w-5 h-5 text-rose-400"/> : <Zap className="w-5 h-5 text-yellow-400"/>}
                    </div>
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded-md">
                      {stat.growth}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-500 mb-1">{stat.label}</h3>
                    <p className="text-3xl font-black tracking-tighter italic">{stat.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Content Tabs/Grid */}
            <div className="space-y-6 min-h-[400px]">
              {activeTab === "settings" && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-2xl bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 md:p-12"
                >
                  <h2 className="text-3xl font-black tracking-tighter italic mb-8">Studio Profile</h2>
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Full Name</label>
                        <div className="bg-white/5 border border-white/10 rounded-2xl py-4 px-6 font-bold text-white">
                          {user?.name || "Not set"}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Email Address</label>
                        <div className="bg-white/5 border border-white/10 rounded-2xl py-4 px-6 font-bold text-gray-400">
                          {user?.email}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Studio / Business Name</label>
                      <div className="bg-white/5 border border-white/10 rounded-2xl py-4 px-6 font-bold text-white">
                        {user?.studioName || "Not set"}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Mobile Number</label>
                      <div className="bg-white/5 border border-white/10 rounded-2xl py-4 px-6 font-bold text-white">
                        {user?.mobileNumber || "Not set"}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Team Size</label>
                      <div className="bg-indigo-600/20 border border-indigo-500/30 rounded-2xl py-4 px-6 font-bold text-indigo-400 capitalize">
                        {user?.studioSize === 'solo' ? 'Individual Artist' : user?.studioSize === 'small' ? '2-5 Team Members' : user?.studioSize === 'medium' ? '6-15 Team Members' : '15+ Professional Crew'}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                      <button className="px-8 py-4 bg-white text-black rounded-xl font-black text-sm hover:scale-105 transition-all">
                        Update Profile
                      </button>
                      <button 
                        onClick={() => {
                          sessionStorage.removeItem("snapsaarthi_user");
                          router.push("/");
                        }}
                        className="px-8 py-4 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl font-black text-sm hover:scale-105 active:scale-95 transition-all"
                      >
                        Secure Logout
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

                  {activeTab === "clients" && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                       <h2 className="text-2xl font-black tracking-tighter italic">Client Directory</h2>
                       
                       {/* Desktop Table */}
                       <div className="hidden md:block bg-white/[0.02] border border-white/5 rounded-[2rem] overflow-hidden">
                          <table className="w-full text-left">
                             <thead className="bg-white/[0.05] text-[10px] font-black uppercase tracking-widest text-gray-500">
                                <tr>
                                   <th className="px-8 py-4">Client Name</th>
                                   <th className="px-8 py-4">Associated Album</th>
                                   <th className="px-8 py-4">Status</th>
                                   <th className="px-8 py-4">Actions</th>
                                </tr>
                             </thead>
                             <tbody className="divide-y divide-white/5">
                                {albums.map((album) => (
                                   <tr key={album.id} className="hover:bg-white/[0.02] transition-colors">
                                      <td className="px-8 py-6 font-bold">{album.client}</td>
                                      <td className="px-8 py-6 text-sm text-gray-400">{album.title}</td>
                                      <td className="px-8 py-6">
                                         <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${album.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
                                            {album.status}
                                         </span>
                                      </td>
                                      <td className="px-8 py-6">
                                         <button onClick={() => router.push(`/dashboard/albums/${album.id}`)} className="text-indigo-400 hover:text-white font-black text-xs uppercase tracking-widest transition-colors">Manage</button>
                                      </td>
                                   </tr>
                                ))}
                             </tbody>
                          </table>
                       </div>

                       {/* Mobile Cards */}
                       <div className="grid grid-cols-1 gap-4 md:hidden">
                          {albums.map((album) => (
                             <div key={album.id} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-4">
                                <div className="flex justify-between items-start">
                                   <div>
                                      <p className="text-lg font-black italic uppercase tracking-tight">{album.client}</p>
                                      <p className="text-xs text-gray-500 font-bold">{album.title}</p>
                                   </div>
                                   <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${album.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
                                      {album.status}
                                   </span>
                                </div>
                                <button 
                                  onClick={() => router.push(`/dashboard/albums/${album.id}`)} 
                                  className="w-full py-3 bg-indigo-600/10 text-indigo-400 rounded-xl font-black text-[10px] uppercase tracking-widest border border-indigo-500/20"
                                >
                                  Open Portal
                                </button>
                             </div>
                          ))}
                       </div>

                       {albums.length === 0 && (
                         <div className="p-12 text-center text-gray-500 italic">No clients found. Create an album to add clients.</div>
                       )}
                    </motion.div>
                  )}

              {activeTab === "dashboard" && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8">
                         <h3 className="text-xl font-black italic mb-6">Recent Activity</h3>
                         <div className="space-y-6">
                            {notifications.slice(0, 3).map((n, i) => (
                               <div key={i} className="flex gap-4">
                                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                                  <div>
                                     <p className="text-sm font-bold text-gray-300">{n.message}</p>
                                     <p className="text-[10px] text-gray-600 mt-1 font-black uppercase">{new Date(n.createdAt || Date.now()).toLocaleDateString()}</p>
                                  </div>
                               </div>
                            ))}
                         </div>
                      </div>
                      <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                         <div className="relative z-10">
                            <h3 className="text-2xl font-black italic mb-2 tracking-tighter">Workflow Optimized</h3>
                            <p className="text-sm text-indigo-200 mb-8 max-w-[200px]">You have {albums.filter(a => a.status === 'In Progress').length} albums waiting for client selection.</p>
                            <button onClick={() => setActiveTab("albums")} className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all">Go to Albums</button>
                         </div>
                         <Zap className="absolute -bottom-10 -right-10 w-48 h-48 text-white/10 group-hover:rotate-12 transition-transform" />
                      </div>
                   </div>
                </motion.div>
              )}

              {activeTab === "albums" && (
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black tracking-tighter italic">Photo Albums</h2>
                    <div className="flex items-center gap-3">
                      <div className="relative group">
                         <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-gray-400 hover:text-white transition-all">
                           <Filter className="w-3.5 h-3.5" /> Filter: {filterStatus}
                         </button>
                         <div className="absolute right-0 top-full mt-2 w-48 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[300] overflow-hidden">
                            {["All", "In Progress", "Completed", "Pending"].map((s) => (
                               <button 
                                 key={s} 
                                 onClick={() => setFilterStatus(s)}
                                 className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-white/5 hover:text-white transition-colors"
                               >
                                 {s}
                               </button>
                            ))}
                         </div>
                      </div>
                      <button 
                        onClick={() => setShowAllAlbums(!showAllAlbums)}
                        className="text-xs font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors"
                      >
                        {showAllAlbums ? "Show Recent" : "View All"}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
                    {albums
                      .filter(a => filterStatus === "All" || a.status === filterStatus)
                      .slice(0, showAllAlbums ? albums.length : 6)
                      .map((album, i) => (
                      <motion.div
                        key={album.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 + (i * 0.1) }}
                        onClick={() => router.push(`/dashboard/albums/${album.id}`)}
                        className="group relative bg-white/[0.02] border border-white/5 rounded-2xl md:rounded-[2.5rem] overflow-hidden hover:border-white/10 transition-all shadow-xl cursor-pointer"
                      >
                        <div className="aspect-[4/5] md:aspect-video relative overflow-hidden">
                          <img 
                            src={album.cover} 
                            alt={album.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                          <div className={`absolute top-2 md:top-4 left-2 md:left-4 px-2 md:px-3 py-1 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest ${
                            album.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
                            album.status === 'In Progress' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 
                            'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          }`}>
                            {album.status}
                          </div>
                        </div>

                        <div className="p-4 md:p-8">
                          <div className="mb-4 md:mb-6">
                            <h3 className="text-sm md:text-xl font-black tracking-tighter mb-0.5 md:mb-1 truncate italic group-hover:text-indigo-400 transition-colors uppercase">{album.title}</h3>
                            <p className="text-[10px] md:text-sm font-bold text-gray-500">{album.client}</p>
                          </div>

                          <div className="space-y-4">
                            <div className="flex justify-between items-center text-[8px] md:text-[10px] font-black uppercase tracking-widest">
                              <span className="text-gray-500">Progress</span>
                              <span className="text-white">{album.selected || 0} / {album.target || 0}</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div 
                                style={{ width: `${((album.selected || 0) / (album.target || 1)) * 100}%` }}
                                className={`h-full transition-all duration-1000 ${album.selected >= album.target && album.target > 0 ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                              />
                            </div>
                          </div>

                          <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                              <Clock className="w-3.5 h-3.5" />
                              {album.date}
                            </div>
                            <button className="flex items-center gap-1 text-xs font-black text-indigo-400 hover:text-white transition-colors">
                              Manage <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    <button 
                      onClick={() => setIsCreateModalOpen(true)}
                      className="border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center p-12 hover:border-indigo-500/20 hover:bg-indigo-500/[0.01] transition-all group"
                    >
                       <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                          <Plus className="w-6 h-6 text-gray-500 group-hover:text-white" />
                       </div>
                       <span className="text-sm font-black italic text-gray-500 group-hover:text-white transition-colors">Create New Album</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Create Album Modal */}
        <CreateAlbumModal 
          isOpen={isCreateModalOpen} 
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={refreshData}
          userId={user?.id}
        />

        {/* Upgrade Modal */}
        <AnimatePresence>
          {isUpgradeModalOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[300] overflow-y-auto custom-scrollbar bg-black/95 backdrop-blur-2xl flex items-start justify-center p-4 sm:p-8"
              >
                <div className="w-full max-w-5xl my-auto py-10">
                  {!upgradeSelectedPlan ? (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center"
                    >
                      <h2 className="text-4xl font-black italic tracking-tighter uppercase mb-2">Choose Your <span className="text-indigo-500">Growth</span></h2>
                      <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-12 italic">Select a plan that fits your studio budget</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <div className="glass p-8 rounded-[2.5rem] border border-white/10 hover:border-indigo-500/50 transition-all group flex flex-col">
                          <Zap className="w-10 h-10 text-indigo-500 mb-6 group-hover:scale-110 transition-transform" />
                          <h3 className="text-2xl font-black italic tracking-tighter mb-2">Studio MICRO</h3>
                          <p className="text-3xl font-black italic text-white mb-6">₹49<span className="text-xs text-gray-500 font-bold uppercase tracking-widest"> / month</span></p>
                          <ul className="text-left space-y-3 mb-10 flex-1">
                            {['5 Active Portals', 'Direct WhatsApp Support', 'Selection Deadlines'].map((f, i) => (
                              <li key={i} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {f}
                              </li>
                            ))}
                          </ul>
                          <button 
                            onClick={() => setUpgradeSelectedPlan({ name: 'Studio MICRO', price: '49' })}
                            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all"
                          >
                            Choose Micro
                          </button>
                        </div>

                        <div className="glass p-8 rounded-[2.5rem] border border-indigo-500/30 hover:border-indigo-500 transition-all group flex flex-col relative overflow-hidden">
                          <div className="absolute top-0 right-0 py-1 px-4 bg-indigo-500 text-white text-[8px] font-black uppercase tracking-widest rounded-bl-xl">Most Popular</div>
                          <Award className="w-10 h-10 text-amber-500 mb-6 group-hover:scale-110 transition-transform" />
                          <h3 className="text-2xl font-black italic tracking-tighter mb-2">Studio PRO</h3>
                          <p className="text-3xl font-black italic text-white mb-6">₹149<span className="text-xs text-gray-500 font-bold uppercase tracking-widest"> / month</span></p>
                          <ul className="text-left space-y-3 mb-10 flex-1">
                            {['Unlimited Portals', 'Custom Studio Branding', 'Full 3D E-Albums', 'Priority Activation'].map((f, i) => (
                              <li key={i} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                <Infinity className="w-4 h-4 text-emerald-500" /> {f}
                              </li>
                            ))}
                          </ul>
                          <button 
                            onClick={() => setUpgradeSelectedPlan({ name: 'Studio PRO', price: '149' })}
                            className="w-full py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all"
                          >
                            Go PRO Now
                          </button>
                        </div>
                      </div>
                      <button 
                        onClick={() => setIsUpgradeModalOpen(false)}
                        className="mt-12 text-gray-600 hover:text-white font-black text-[10px] uppercase tracking-widest"
                      >
                        Cancel Upgrade
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    >
                      <UpgradeCard 
                        planName={upgradeSelectedPlan.name} 
                        price={upgradeSelectedPlan.price} 
                        onClose={() => setUpgradeSelectedPlan(null)} 
                      />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Auto Upgrade Nudge Pop-up */}
        <AnimatePresence>
          {showUpgradePrompt && (
            <motion.div 
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              className="fixed bottom-10 right-6 md:right-10 z-[250] max-w-[280px] w-full"
            >
              <div className="glass p-6 rounded-[2rem] border border-indigo-500/30 shadow-2xl relative overflow-hidden group">
                <button 
                  onClick={() => setShowUpgradePrompt(false)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center mb-4">
                  <Aperture className="text-white w-5 h-5 animate-pulse" />
                </div>
                <h4 className="text-lg font-black italic tracking-tighter text-white mb-2 leading-none uppercase">Full Focus?</h4>
                <p className="text-[10px] text-gray-500 font-bold uppercase leading-relaxed mb-4">Go PRO to unlock unlimited AI portals and unlimited client selections.</p>
                <button 
                  onClick={() => { setShowUpgradePrompt(false); setIsUpgradeModalOpen(true); }}
                  className="w-full py-3 bg-white text-black rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all"
                >
                  Boost Now
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
