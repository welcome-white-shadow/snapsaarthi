"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, Image as ImageIcon, Settings, Loader2, Plus, X, CheckCircle2, Share2, QrCode, Link as LinkIcon, Copy, Shield, Lock, DownloadCloud, Scissors, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AlbumDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [albumId, setAlbumId] = useState("");
  const [album, setAlbum] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [userPlan, setUserPlan] = useState("FREE");
  const [activeTab, setActiveTab] = useState("uploaded");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareStep, setShareStep] = useState(1);
  const [shareSettings, setShareSettings] = useState({ watermark: true, allowDownload: false });
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);
  const [isResultShareModalOpen, setIsResultShareModalOpen] = useState(false);
  const [resultShareType, setResultShareType] = useState<"editor" | "e-album">("editor");

  const fetchData = async (id: string) => {
    try {
      const userStr = sessionStorage.getItem("snapsaarthi_user");
      if (userStr) {
        const user = JSON.parse(userStr);
        const resp = await fetch(`/api/dashboard`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // we use no-cache to guarantee fresh db state when tab switching
          cache: "no-store",
          body: JSON.stringify({ email: user.email })
        });
        const data = await resp.json();
        const targetAlbum = data.albums?.find((a: any) => a.id === id);
        if (targetAlbum) {
          setAlbum(targetAlbum);
          if (targetAlbum.photos) {
             setImages(targetAlbum.photos);
          }
        }
        if (data.user?.planType) {
          setUserPlan(data.user.planType);
        }
      }
    } catch (e) {
      console.error("Failed to load album");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unwrapParams = async () => {
      const resolvedParams = await params;
      setAlbumId(resolvedParams.id);
      await fetchData(resolvedParams.id);
    };
    unwrapParams();
  }, [params]);

  // Sync latest client selections automatically when switching to Selected tab!
  useEffect(() => {
     if (activeTab === "selected" && albumId) {
        fetchData(albumId);
     }
  }, [activeTab, albumId]);

  const getClientLink = () => {
    return `${window.location.origin}/client/${albumId}`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getClientLink());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);
      
      const formData = new FormData();
      formData.append("albumId", albumId);
      
      Array.from(e.target.files).forEach(file => {
        formData.append("images", file);
      });

      try {
        const resp = await fetch("/api/images", {
          method: "POST",
          body: formData
        });

        if (resp.ok) {
          const data = await resp.json();
          // Add the newly saved photos to the grid instantly!
          if (data.photos) {
             setImages(prev => [...prev, ...data.photos]);
          }
        } else {
          console.error("Upload failed");
        }
      } catch (error) {
        console.error("Upload connection error", error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const saveSecuritySettings = async () => {
    setIsSavingSecurity(true);
    try {
      await fetch("/api/albums/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ albumId, settings: shareSettings })
      });
      setShareStep(2);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingSecurity(false);
    }
  };

  const resetShareModal = () => {
    setIsShareModalOpen(false);
    setTimeout(() => setShareStep(1), 300); // reset step after close animation
  };

  if (loading) {
     return (
       <div className="min-h-screen bg-[#020202] flex justify-center items-center">
         <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
       </div>
     );
  }

  const getResultLink = () => {
    return `${window.location.origin}/${resultShareType}/${albumId}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#020202] text-white overflow-x-hidden">
      <input 
        type="file" 
        multiple 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileSelect} 
      />
      {/* Hero Cover Section */}
      <div className="relative w-full h-[35vh] md:h-[45vh] lg:h-[50vh] overflow-hidden flex-shrink-0">
         <img 
           src={album?.cover || "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80"} 
           alt="Cover" 
           className="w-full h-full object-cover opacity-60"
         />
         <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-[#020202]/60 to-transparent" />
         
         <div className="absolute top-0 left-0 w-full p-4 md:p-8 flex justify-between items-center z-20">
           <button 
             onClick={() => router.push('/dashboard')}
             className="w-10 h-10 bg-black/40 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
           >
             <ArrowLeft className="w-5 h-5 text-white" />
           </button>
           <div className="flex items-center gap-3">
             <button onClick={() => setIsShareModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-sm font-black hover:bg-white/20 transition-colors text-white">
               <Share2 className="w-4 h-4" /> Share
             </button>
             <button className="w-10 h-10 bg-black/40 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
               <Settings className="w-5 h-5 text-white" />
             </button>
           </div>
         </div>

         <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-20">
           <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
               <div className="inline-block px-3 py-1 mb-3 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-[10px] font-black uppercase tracking-widest text-indigo-400">
                 {album?.category || "Project"}
               </div>
               <h1 className="text-4xl md:text-6xl lg:text-7xl font-black italic tracking-tighter mb-2">{album?.title || "Album Workspace"}</h1>
               <p className="text-gray-400 font-bold uppercase tracking-widest text-xs md:text-sm">{album?.client || "Client"} • {album?.target ? album.target + " Photos" : "Unlimited"}</p>
             </motion.div>
             
             <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
               <button 
                 onClick={() => fileInputRef.current?.click()} 
                 disabled={isUploading}
                 className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 rounded-2xl text-sm font-black shadow-xl shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
               >
                 {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />} 
                 {isUploading ? "Processing..." : "Upload Photos"}
               </button>
             </motion.div>
           </div>
         </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-12 max-w-7xl mx-auto w-full flex flex-col">
        
        {/* Added Filter Tabs */}
        {images.length > 0 && (
          <div className="flex items-center gap-4 mb-8">
             <button 
               onClick={() => setActiveTab("uploaded")}
               className={`relative px-6 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all ${activeTab === "uploaded" ? "text-white" : "text-gray-500 hover:text-white"}`}
             >
               Uploaded Images
               {activeTab === "uploaded" && (
                 <motion.div layoutId="activeTab" className="absolute inset-0 bg-white/5 border border-white/10 rounded-xl" />
               )}
             </button>
             <button 
               onClick={() => setActiveTab("selected")}
               className={`relative px-6 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all ${activeTab === "selected" ? "text-emerald-400" : "text-gray-500 hover:text-emerald-400/50"}`}
             >
               Selected By Client
               {activeTab === "selected" && (
                 <motion.div layoutId="activeTab" className="absolute inset-0 bg-emerald-500/10 border border-emerald-500/20 rounded-xl" />
               )}
             </button>
          </div>
        )}

        {images.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex-1 flex items-center justify-center"
          >
            <div className="text-center w-full max-w-2xl px-4">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 md:w-32 md:h-32 bg-white/[0.02] border-2 border-dashed border-white/10 rounded-full flex flex-col items-center justify-center mx-auto mb-8 hover:bg-white/[0.05] hover:border-indigo-500/50 transition-colors cursor-pointer group shadow-2xl"
              >
                 <Upload className="w-8 h-8 md:w-10 md:h-10 text-gray-500 group-hover:text-indigo-400 group-hover:-translate-y-2 transition-all mb-1" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 group-hover:text-indigo-500">Select</span>
              </div>
              <h2 className="text-2xl md:text-4xl font-black italic tracking-tighter mb-4">Workspace is Empty</h2>
              <p className="text-gray-500 mb-8 font-medium text-sm md:text-base">Upload your high-resolution shots here. Clients will be able to review and select them instantly.</p>
            </div>
          </motion.div>
        ) : (
          <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-6">
            <AnimatePresence mode="popLayout">
              {images.filter(img => activeTab === "uploaded" || img.selected).length === 0 && activeTab === "selected" && (
                <motion.div 
                  key="empty-state"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="col-span-full col-start-1 lg:col-span-12 py-20 text-center flex flex-col items-center justify-center w-full min-w-full"
                >
                  <CheckCircle2 className="w-16 h-16 text-emerald-500/20 mb-4" />
                  <h3 className="text-xl font-black italic text-gray-400 mb-2">No selections yet</h3>
                  <p className="text-sm font-medium text-gray-600">The client hasn't shortlisted any photos.</p>
                </motion.div>
              )}

              {activeTab === "selected" && images.filter(i => i.selected).length > 0 && (
                <div className="col-span-full flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-indigo-500/5 border border-indigo-500/10 rounded-[2.5rem] p-6 md:p-8">
                   <div>
                     <h3 className="text-xl md:text-2xl font-black italic tracking-tighter">Client Selection Ready</h3>
                     <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">{images.filter(i => i.selected).length} Photos Shortlisted by {album?.client || 'Client'}</p>
                   </div>
                   <div className="flex flex-wrap items-center gap-3">
                      <button 
                        onClick={() => {
                          setResultShareType("editor");
                          setIsResultShareModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                      >
                        <Scissors className="w-4 h-4 text-emerald-400" /> Share with Editor
                      </button>
                      <button 
                        onClick={() => {
                          setResultShareType("e-album");
                          setIsResultShareModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20"
                      >
                         <ExternalLink className="w-4 h-4" /> Share E-Album
                      </button>
                   </div>
                </div>
              )}

              {images.filter(img => activeTab === "uploaded" || img.selected).map((img, index) => (
                <motion.div
                  key={img.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative aspect-square bg-[#050505] rounded-2xl overflow-hidden border border-white/10 hover:border-indigo-500/50 transition-all shadow-xl"
                >
                  <img src={img.url || img.preview} alt={img.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-90 group-hover:opacity-100" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {activeTab === "uploaded" && userPlan !== "FREE" && (
                    <button 
                      onClick={() => removeImage(img.id)}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all z-10"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  
                  <div className="absolute bottom-2 left-2 right-2 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <p className="text-[8px] md:text-[10px] font-bold text-white truncate drop-shadow-md">{img.name}</p>
                     <p className="text-[8px] font-black uppercase tracking-widest text-indigo-400">Uploaded</p>
                  </div>
                </motion.div>
              ))}
              
              {activeTab === "uploaded" && (
                <motion.div 
                  key="add-more"
                  layout
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/[0.02] hover:border-indigo-500/50 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-2 group-hover:bg-indigo-600 transition-colors">
                    <Plus className="w-5 h-5 text-gray-500 group-hover:text-white" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 group-hover:text-white">Add More</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Share Modal */}
      <AnimatePresence>
        {isShareModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={resetShareModal}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md bg-[#050505] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden relative flex flex-col p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black tracking-tighter italic">Share Album</h2>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Client Link & Security</p>
                </div>
                <button onClick={resetShareModal} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {shareStep === 1 ? (
                <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  
                  <div 
                    className={`bg-white/[0.02] border transition-all rounded-2xl p-5 cursor-pointer ${shareSettings.watermark && !shareSettings.allowDownload ? 'border-indigo-500 bg-indigo-500/5' : 'border-white/10 hover:bg-white/[0.04]'}`} 
                    onClick={() => setShareSettings({ watermark: true, allowDownload: false })}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${shareSettings.watermark && !shareSettings.allowDownload ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-gray-500'}`}>
                          <Shield className="w-5 h-5" />
                        </div>
                        <div>
                          <p className={`font-bold text-sm ${shareSettings.watermark && !shareSettings.allowDownload ? 'text-white' : 'text-gray-400'}`}>Security (Selection Mode)</p>
                          <p className="text-xs text-gray-500 mt-1">Apply watermarks and restrict downloads for photo selection.</p>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${shareSettings.watermark && !shareSettings.allowDownload ? 'border-indigo-500 bg-indigo-500' : 'border-white/10'}`}>
                         {shareSettings.watermark && !shareSettings.allowDownload && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </div>
                  </div>

                  <div 
                    className={`bg-white/[0.02] border transition-all rounded-2xl p-5 cursor-pointer ${!shareSettings.watermark && shareSettings.allowDownload ? 'border-emerald-500 bg-emerald-500/5' : 'border-white/10 hover:bg-white/[0.04]'}`} 
                    onClick={() => setShareSettings({ watermark: false, allowDownload: true })}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${!shareSettings.watermark && shareSettings.allowDownload ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-gray-500'}`}>
                          <LinkIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className={`font-bold text-sm ${!shareSettings.watermark && shareSettings.allowDownload ? 'text-white' : 'text-gray-400'}`}>Client Link (Delivery Mode)</p>
                          <p className="text-xs text-gray-500 mt-1">Allow high-quality viewing and direct HD downloads for final delivery.</p>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${!shareSettings.watermark && shareSettings.allowDownload ? 'border-emerald-500 bg-emerald-500' : 'border-white/10'}`}>
                         {!shareSettings.watermark && shareSettings.allowDownload && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={saveSecuritySettings}
                    disabled={isSavingSecurity}
                    className="w-full py-4 mt-4 bg-white text-black font-black text-sm rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSavingSecurity ? <Loader2 className="w-5 h-5 animate-spin" /> : <LinkIcon className="w-4 h-4" />}
                    {isSavingSecurity ? "Applying Security..." : "Lock & Generate Link"}
                  </button>
                  <p className="text-center text-[10px] text-gray-600 uppercase tracking-widest font-black">Anti-Piracy Enabled by SnapSaarthi OS</p>
                </motion.div>
              ) : (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <div className="flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-3xl p-8 mb-6">
                     <div className="bg-white p-4 rounded-2xl shadow-xl mb-4">
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(getClientLink())}&margin=0`} alt="QR Code" className="w-40 h-40" />
                     </div>
                     <p className="text-xs font-medium text-gray-400 text-center">Security policies applied. Scan to instantly open the client portal.</p>
                  </div>

                  <div className="space-y-4 text-center">
                     <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Direct Delivery Link</p>
                     <div className="flex items-center gap-2">
                       <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-sm font-bold text-gray-300 truncate font-mono">
                         {getClientLink()}
                       </div>
                       <button 
                         onClick={copyToClipboard}
                         className="p-4 bg-indigo-600 rounded-2xl hover:scale-105 active:scale-95 transition-all w-14 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/20"
                       >
                         {copied ? <CheckCircle2 className="w-5 h-5 text-emerald-300" /> : <Copy className="w-5 h-5 text-white" />}
                       </button>
                     </div>
                     <button 
                       onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Hi ${album?.client || ''}!\n\nYour album "${album?.title || 'Photos'}" is ready for selection.\n\nPlease click the secure link below to view and shortlist your photos:\n\n${getClientLink()}`)}`, '_blank')}
                       className="w-full flex items-center justify-center gap-2 py-4 bg-[#25D366] text-black font-black text-sm rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-[#25D366]/20"
                     >
                       <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                       Share on WhatsApp
                     </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result Share Modal (Editor / E-Album) */}
      <AnimatePresence>
        {isResultShareModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsResultShareModalOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md bg-[#050505] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden relative flex flex-col p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black tracking-tighter italic capitalize">{resultShareType === "editor" ? "Editor Access" : "E-Album Link"}</h2>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                    {resultShareType === "editor" ? "High-res • No Watermarks" : "Digital Experience • Shareable"}
                  </p>
                </div>
                <button onClick={() => setIsResultShareModalOpen(false)} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-3xl p-8 mb-6">
                 <div className="bg-white p-4 rounded-2xl shadow-xl mb-4">
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(getResultLink())}&margin=0`} alt="QR Code" className="w-40 h-40" />
                 </div>
                 <p className="text-xs font-medium text-gray-400 text-center">
                    {resultShareType === "editor" ? "Scan to open the high-res editor workspace instantly." : "Scan to open the interactive digital e-book."}
                 </p>
              </div>

              <div className="space-y-4 text-center">
                 <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Direct Delivery Link</p>
                 <div className="flex items-center gap-2">
                   <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-sm font-bold text-gray-300 truncate font-mono">
                     {getResultLink()}
                   </div>
                   <button 
                     onClick={() => {
                        navigator.clipboard.writeText(getResultLink());
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                     }}
                     className="p-4 bg-indigo-600 rounded-2xl hover:scale-105 active:scale-95 transition-all w-14 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/20"
                   >
                     {copied ? <CheckCircle2 className="w-5 h-5 text-emerald-300" /> : <Copy className="w-5 h-5 text-white" />}
                   </button>
                 </div>

                 <button 
                   onClick={() => {
                     const text = resultShareType === "editor" 
                       ? `Hi!\n\nThe client selections for "${album?.title}" are ready.\n\nPlease find the watermark-free high-res editor link below:\n\n${getResultLink()}`
                       : `Hi ${album?.client || ''}!\n\nYour interactive E-Album for "${album?.title}" is ready.\n\nExperience your digital album here:\n\n${getResultLink()}`;
                     window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                   }}
                   className="w-full flex items-center justify-center gap-2 py-4 bg-[#25D366] text-black font-black text-sm rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-[#25D366]/20"
                 >
                   <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                   <span>Share on WhatsApp</span>
                 </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
