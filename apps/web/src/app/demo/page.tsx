"use client";

import { Shield, Camera, Users, Zap, Briefcase, Plus, Search, Filter, Bell, ArrowUpRight, Share2, Settings, MessageSquare, CheckCircle2 } from "lucide-react";

export default function DemoSandbox() {
   const sampleAlbums = [
     { id: "demo1", title: "Royal Wedding - Italy", client: "Stefano & Sofia", date: "Present", status: "Ongoing", photos: 120, cover: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1000" },
     { id: "demo2", title: "Fashion Week 2026", client: "Vogue India", date: "Completed", status: "Finalized", photos: 450, cover: "https://images.unsplash.com/photo-1537832816519-689ad163238b?auto=format&fit=crop&q=80&w=1000" },
     { id: "demo3", title: "Corporate Summit", client: "Google HQ", date: "Draft", status: "Draft", photos: 0, cover: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=1000" }
   ];

   return (
     <div className="min-h-screen bg-[#020202] text-white flex flex-col items-center justify-center p-4">
        {/* Banner */}
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] bg-indigo-600 px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest shadow-2xl flex items-center gap-3">
           <Zap className="w-3 h-3 fill-white" /> Live Sandbox Mode: Exploring SnapSaarthi Dashboard
        </div>

        <div className="w-full max-w-[1400px] h-[85vh] bg-[#050505] border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col opacity-100 pointer-events-none select-none relative">
           {/* Mock Header */}
           <header className="h-24 border-b border-white/5 px-12 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                    <Camera className="w-6 h-6" />
                 </div>
                 <h1 className="text-xl font-black italic tracking-tighter uppercase">SnapSaarthi <span className="text-indigo-500">Demo</span></h1>
              </div>
              <div className="flex items-center gap-6">
                 <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-2">
                    <Bell className="w-5 h-5 text-indigo-400" />
                    <span className="text-xs font-black uppercase tracking-widest">2 Notifications</span>
                 </div>
                 <div className="w-12 h-12 bg-white/10 rounded-xl border border-white/10 flex items-center justify-center font-black">JD</div>
              </div>
           </header>

           <div className="flex-1 flex overflow-hidden">
              {/* Mock Sidebar */}
              <aside className="w-64 border-r border-white/5 p-8 flex flex-col gap-6">
                 <div className="p-4 bg-indigo-600 rounded-2xl flex items-center gap-3">
                    <Briefcase className="w-5 h-5" />
                    <span className="text-xs font-black uppercase tracking-widest text-white">Dashboard</span>
                 </div>
                 {[
                   { icon: Camera, label: "Albums" },
                   { icon: Users, label: "Clients" },
                   { icon: Zap, label: "Instant Share" },
                   { icon: Settings, label: "Settings" }
                 ].map((item, i) => (
                   <div key={i} className="p-4 hover:bg-white/5 rounded-2xl flex items-center gap-3 transition-colors text-gray-500 cursor-not-allowed">
                      <item.icon className="w-5 h-5" />
                      <span className="text-xs font-bold uppercase tracking-widest">{item.label}</span>
                   </div>
                 ))}
              </aside>

              {/* Mock Main Content */}
              <main className="flex-1 p-12 overflow-y-auto">
                 <div className="flex items-center justify-between mb-12">
                    <div>
                       <h2 className="text-4xl font-black italic tracking-tighter uppercase">Studio <span className="text-indigo-500">Workspace</span></h2>
                       <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-2">Active Event Portals & Delivery</p>
                    </div>
                    <div className="flex items-center gap-4">
                       <button className="px-8 py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2">
                          <Plus className="w-4 h-4" /> Create New Album
                       </button>
                    </div>
                 </div>

                 <div className="grid grid-cols-3 gap-8">
                    {sampleAlbums.map((album) => (
                       <div key={album.id} className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] overflow-hidden group">
                          <div className="aspect-[16/10] relative">
                             <img src={album.cover} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform" />
                             <div className="absolute top-6 left-6 px-3 py-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest">
                                {album.status}
                             </div>
                          </div>
                          <div className="p-8">
                             <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-2 group-hover:text-indigo-400 transition-colors">{album.title}</h3>
                             <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-6">Client: {album.client}</p>
                             <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400">{album.photos} Photos</div>
                                <ArrowUpRight className="w-5 h-5 text-gray-500" />
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
              </main>
           </div>
           
           {/* Restricted Overlay */}
           <div className="absolute inset-0 z-50 bg-black/0 pointer-events-none" />
        </div>

        {/* Floating CTA */}
        <div className="mt-12 text-center flex flex-col items-center gap-6">
           <div className="flex items-center gap-4 text-gray-500 uppercase font-black text-[10px] tracking-[0.4em]">
              <div className="w-10 h-[1px] bg-white/10" /> Ready to go live? <div className="w-10 h-[1px] bg-white/10" />
           </div>
           <button 
             onClick={() => window.location.href = "/register"}
             className="px-12 py-6 bg-white text-black rounded-[2.5rem] font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center gap-4"
           >
              Create Your Studio OS For Free <ArrowUpRight className="w-6 h-6" />
           </button>
           <p className="text-gray-500 text-sm font-medium">No credit card or setup fee. Join 500+ top photographers.</p>
        </div>
     </div>
   );
}
