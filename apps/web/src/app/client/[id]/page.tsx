"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Heart, CheckCircle2, ShieldAlert, DownloadCloud } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../../../components/Toaster";


export default function ClientPortal({ params }: { params: { id: string } }) {
  const [albumId, setAlbumId] = useState("");
  const [album, setAlbum] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [images, setImages] = useState<any[]>([]);
  const [viewerImage, setViewerImage] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);


  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { success, error: toastError } = useToast();
  const isLocked = album?.status === "Submitted";


  const fetchAlbum = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/albums/client/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load album");
      setAlbum(data.album);
      setImages(data.album.photos || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unwrapParams = async () => {
      const resolvedParams = await params;
      setAlbumId(resolvedParams.id);
      await fetchAlbum(resolvedParams.id);
    };
    unwrapParams();
  }, [params, fetchAlbum]);

  useEffect(() => {
    // Basic anti-theft right click prevention if strict mode
    const handleContext = (e: MouseEvent) => {
       if (album?.settings?.watermark || !album?.settings?.allowDownload) {
         e.preventDefault();
       }
    };
    document.addEventListener("contextmenu", handleContext);
    return () => document.removeEventListener("contextmenu", handleContext);
  }, [album]);

  const toggleSelection = async (photoId: string, currentStatus: boolean) => {
    if (isLocked) return;

    // Optimistic UI update for instantaneous feel
    setImages(prev => prev.map(img => img.id === photoId ? { ...img, selected: !currentStatus } : img));
    
    try {
      await fetch(`/api/albums/client/${albumId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId, selected: !currentStatus })
      });
      // triggerFlash("Photo " + (!currentStatus ? "Selected" : "Removed"), "Changes synced automatically.");
    } catch (e) {
      // Revert if failed
      setImages(prev => prev.map(img => img.id === photoId ? { ...img, selected: currentStatus } : img));
      console.error("Selection sync failed");
    }
  };

  const submitSelections = () => {
    setShowConfirmModal(true);
  };

  const executeFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/albums/client/${albumId}/submit`, { method: "POST" });
      if (res.ok) {
         setAlbum((prev: any) => ({ ...prev, status: "Submitted" }));
         setShowConfirmModal(false);
         success("Album selection locked and submitted successfully.");
      }
    } catch (e) {
      console.error("Failed to lock selections", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = (url: string, name: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020202] text-white flex flex-col items-center justify-center p-6 relative">
         <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (error) {
     return (
       <div className="min-h-screen bg-[#020202] text-white flex flex-col items-center justify-center p-6">
         <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6 max-w-sm text-center">
            <ShieldAlert className="w-10 h-10 text-rose-400 mx-auto mb-4" />
            <h1 className="text-xl font-black mb-2">Access Denied</h1>
            <p className="text-sm text-gray-400">{error}</p>
         </div>
       </div>
     );
  }

  const selectedCount = images.filter(i => i.selected).length;
  const targetCount = album?.targetCount || 0;
  const isTargetMet = targetCount > 0 && selectedCount >= targetCount;

  return (
    <div className="min-h-screen bg-[#020202] text-white flex flex-col pb-24">
      {/* Header */}
      <header className="h-auto md:h-20 py-3 md:py-0 border-b border-white/5 px-4 md:px-8 flex items-center justify-between bg-black/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="flex-1 min-w-0">
          <h1 className="text-sm md:text-xl font-black italic tracking-tighter truncate">{album?.title}</h1>
          <p className="text-[8px] md:text-[10px] text-gray-500 font-bold uppercase tracking-widest truncate">{album?.clientName}</p>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
           {isLocked ? (
             <div className="flex items-center gap-1 md:gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 md:px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl">
               <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4" />
               <span className="text-[10px] md:text-sm font-black">Finalized</span>
             </div>
           ) : (
             <button 
               onClick={submitSelections}
               disabled={isSubmitting || selectedCount === 0}
               className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:bg-white/10 px-4 md:px-6 py-2 md:py-2.5 rounded-xl md:rounded-2xl text-[10px] md:text-sm font-black transition-all shadow-xl shadow-indigo-600/20"
             >
               {isSubmitting ? <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" /> : <Heart className="w-3 h-3 md:w-4 md:h-4" />}
               <span className="hidden sm:inline">Finalize</span>
               <span className="sm:hidden">Lock</span>
             </button>
           )}

           <div className="flex items-center gap-1 md:gap-3 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl px-2 md:px-4 py-1.5 md:py-2 text-[10px] md:text-sm font-black">
             <span className={isTargetMet && !isLocked ? 'text-emerald-400' : 'text-white'}>{selectedCount}</span>
             <span className="text-gray-500">/{targetCount > 0 ? targetCount : '∞'}</span>
           </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
         
         {album?.settings?.watermark && !album?.settings?.allowDownload && (
            <div className="mb-8 bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex items-center justify-center gap-3 text-center">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <p className="text-xs font-bold text-rose-300">Protected Workspace. Anti-theft watermarks are active and downloading is blocked.</p>
            </div>
         )}
         
         <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-6">
            <AnimatePresence>
              {images.map((img, index) => (
                <motion.div
                  key={img.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={`group relative aspect-square bg-[#050505] rounded-2xl overflow-hidden border-2 transition-all shadow-xl ${img.selected ? 'border-emerald-500 shadow-emerald-500/20' : 'border-white/10 hover:border-indigo-500/50'}`}
                >
                  <img 
                    src={img.url || img.preview} 
                    alt={img.name} 
                    className={`w-full h-full object-cover transition-transform duration-500 ${!album?.settings?.allowDownload ? 'pointer-events-none' : ''} ${img.selected ? 'opacity-100 scale-105' : 'opacity-80 group-hover:opacity-100 group-hover:scale-105'}`} 
                  />
                  
                  {/* CSS Watermark Overlay if strict mode */}
                  {album?.settings?.watermark && (
                     <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30 select-none">
                        <p className="text-white font-black italic text-lg md:text-xl -rotate-45 mix-blend-overlay">PROTECTED</p>
                     </div>
                  )}
                  
                  <div className={`absolute inset-0 transition-opacity pointer-events-none ${img.selected ? 'bg-emerald-500/10 opacity-100' : 'bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100'}`} />
                  
                  {/* Clean Dedicated Click Overlay placed ABVOE all gradients */}
                  <button 
                    onClick={() => setViewerImage(img)}
                    className="absolute inset-0 w-full h-full z-10 cursor-zoom-in outline-none border-none bg-transparent"
                    title="Click to view full screen"
                  />

                  {/* Selection Indicator */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleSelection(img.id, Boolean(img.selected)); }}
                    disabled={isLocked}
                    className={`absolute top-2 right-2 md:top-3 md:right-3 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all shadow-lg z-20 disabled:opacity-50 hover:scale-110 active:scale-95 ${img.selected ? 'bg-emerald-500 border-emerald-500' : 'bg-black/40 border-white/50 group-hover:border-white group-hover:bg-black/60'}`}
                  >
                    {img.selected && <CheckCircle2 className="w-5 h-5 text-white" />}
                  </button>
                  
                  {/* Download Button (Only if allowed) */}
                  {album?.settings?.allowDownload && (
                     <button 
                       onClick={(e) => { e.stopPropagation(); handleDownload(img.url, img.name); }}
                       className="absolute bottom-2 right-2 md:bottom-3 md:right-3 p-2 bg-black/60 backdrop-blur-md rounded-xl hover:bg-indigo-600 transition-colors opacity-0 group-hover:opacity-100 border border-white/10"
                     >
                       <DownloadCloud className="w-4 h-4 text-white" />
                     </button>
                  )}

                  {!img.selected && !isLocked && (
                    <div className="absolute bottom-2 left-2 right-2 px-2 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
                       <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 truncate">Click to View</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
         </div>

         {/* Mobile Target Counter */}
         {!isLocked && (
           <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-[#050505]/90 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 shadow-2xl z-50">
             <Heart className={`w-5 h-5 ${isTargetMet ? 'text-emerald-400 fill-emerald-400' : 'text-rose-500 fill-rose-500'}`} />
             <div className="text-sm font-black whitespace-nowrap">
               <span className={isTargetMet ? 'text-emerald-400' : 'text-white'}>{selectedCount}</span>
               <span className="text-gray-500"> / {targetCount > 0 ? targetCount : 'Unlimited'}</span>
             </div>
           </div>
         )}
      </main>

      {/* Custom 2026 Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#050505] border border-white/10 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl text-center"
            >
               <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                 <ShieldAlert className="w-8 h-8" />
               </div>
               <h2 className="text-2xl font-black italic tracking-tighter mb-2">Finalize Selection?</h2>
               <p className="text-gray-400 text-sm font-medium mb-8 leading-relaxed">
                 Are you 100% sure you want to lock in your <strong className="text-white">{selectedCount}</strong> selected photos? 
                 <br/><br/>
                 <span className="text-rose-400 font-bold bg-rose-500/10 px-2 py-1 rounded-md">This action is permanent and cannot be undone.</span>
               </p>
               
               <div className="flex gap-3 w-full">
                 <button 
                   disabled={isSubmitting}
                   onClick={() => setShowConfirmModal(false)}
                   className="flex-1 px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black text-sm transition-all"
                 >
                   Cancel
                 </button>
                 <button 
                   disabled={isSubmitting}
                   onClick={executeFinalSubmit}
                   className="flex-1 px-4 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-sm transition-all shadow-xl shadow-rose-600/20 flex items-center justify-center gap-2"
                 >
                   {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                   Yes, Lock It
                 </button>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Lightbox Viewer */}
      <AnimatePresence>
        {viewerImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center overscroll-none"
          >
            {/* Toolbar */}
            <div className="absolute top-0 w-full p-4 md:p-8 flex justify-between items-center z-50 bg-gradient-to-b from-black/80 to-transparent">
               <div className="text-white">
                 <p className="font-bold truncate max-w-[150px] md:max-w-md">{viewerImage.name}</p>
                 <p className="text-xs text-gray-400">{viewerImage.id}</p>
               </div>
               
               <div className="flex items-center gap-3 md:gap-4">
                 {/* Select Button Native to View */}
                 <button 
                   disabled={isLocked}
                   onClick={() => toggleSelection(viewerImage.id, Boolean(images.find(i => i.id === viewerImage.id)?.selected))}
                   className={`flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-xl disabled:opacity-50 font-black text-xs md:text-sm transition-all shadow-xl ${images.find(i => i.id === viewerImage.id)?.selected ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                 >
                   <CheckCircle2 className={`w-4 h-4 md:w-5 md:h-5 ${images.find(i => i.id === viewerImage.id)?.selected ? 'text-white' : 'text-gray-400'}`} />
                   <span className="hidden md:inline">{images.find(i => i.id === viewerImage.id)?.selected ? 'Selected' : 'Select'}</span>
                 </button>

                 {album?.settings?.allowDownload && (
                   <button 
                     onClick={() => handleDownload(viewerImage.url, viewerImage.name)}
                     className="p-3 bg-white/10 rounded-xl hover:bg-indigo-600 transition-colors"
                   >
                     <DownloadCloud className="w-5 h-5 text-white" />
                   </button>
                 )}

                 <button 
                   onClick={() => setViewerImage(null)}
                   className="p-3 bg-black/50 border border-white/10 rounded-xl hover:bg-white/10 transition-colors ml-4"
                 >
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
               </div>
            </div>

            {/* Main Image */}
            <motion.div 
               initial={{ scale: 0.9, y: 20 }}
               animate={{ scale: 1, y: 0 }}
               exit={{ scale: 0.9, y: 20 }}
               className="relative w-full h-full p-4 flex items-center justify-center max-w-7xl mx-auto"
            >
               <img 
                 src={viewerImage.url || viewerImage.preview} 
                 alt={viewerImage.name} 
                 className={`max-w-full max-h-full object-contain drop-shadow-2xl ${!album?.settings?.allowDownload ? 'pointer-events-none' : ''}`}
               />

               {/* Strong Watermark overlay in fullscreen mode */}
               {album?.settings?.watermark && (
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
                    <p className="text-white/20 font-black italic text-4xl md:text-8xl -rotate-45 drop-shadow-2xl">PROTECTED VIEW</p>
                 </div>
               )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
