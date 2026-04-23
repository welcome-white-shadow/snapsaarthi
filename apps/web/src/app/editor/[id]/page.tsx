"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, DownloadCloud, Scissors, ArrowLeft, Image as ImageIcon, ExternalLink, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useToast } from "../../../components/Toaster";

export default function EditorPortal({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [albumId, setAlbumId] = useState("");
  const [album, setAlbum] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [images, setImages] = useState<any[]>([]);

  const fetchAlbum = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/albums/client/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load album");
      setAlbum(data.album);
      // Editors only see selected photos
      setImages((data.album.photos || []).filter((p: any) => p.selected));
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

  const handleDownload = (url: string, name: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const { success: toastSuccess } = useToast();

  const downloadAll = () => {
    toastSuccess("Initializing High-res batch download. Your gallery is being prepared.");
    images.forEach((img, i) => {
      setTimeout(() => handleDownload(img.url, img.name), i * 500);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020202] text-white flex flex-col items-center justify-center p-6 text-center">
         <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
         <p className="mt-4 font-black uppercase tracking-widest text-[10px] text-gray-500">Initializing Editor Workspace</p>
      </div>
    );
  }

  if (error) {
     return (
       <div className="min-h-screen bg-[#020202] text-white flex flex-col items-center justify-center p-6 text-center">
          <h1 className="text-2xl font-black italic mb-2">Invalid Link</h1>
          <p className="text-gray-500">{error}</p>
       </div>
     );
  }

  return (
    <div className="min-h-screen bg-[#020202] text-white flex flex-col font-sans">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-black/60 backdrop-blur-2xl border-b border-white/5 px-4 md:px-8 py-3 md:py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 md:gap-4 shrink-0">
           <div className="w-10 h-10 md:w-12 md:h-12 bg-white/5 rounded-xl md:rounded-2xl flex items-center justify-center border border-white/10">
              <Scissors className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" />
           </div>
           <div>
             <h1 className="text-sm md:text-lg font-black italic tracking-tighter">Editor Portal</h1>
             <p className="text-[8px] md:text-[10px] text-gray-500 font-bold uppercase tracking-widest truncate max-w-[120px] md:max-w-none">
                {album?.title} • {images.length} Photos
             </p>
           </div>
        </div>

        <button 
          onClick={downloadAll}
          className="flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-emerald-600 rounded-xl md:rounded-2xl text-[10px] md:text-sm font-black hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-900/20"
        >
          <DownloadCloud className="w-4 h-4" />
          <span className="hidden sm:inline">Download All (HD)</span>
          <span className="sm:hidden">All HD</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-24 md:pt-32 p-4 md:p-12 max-w-7xl mx-auto w-full">
         <div className="mb-6 md:mb-8 flex items-start md:items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl md:rounded-2xl p-4">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5 md:mt-0" />
            <p className="text-[10px] md:text-xs font-bold text-emerald-300 leading-relaxed">
               Editor Access Granted. High-res originals available. No watermarks applied.
            </p>
         </div>

         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
            {images.map((img, idx) => (
              <motion.div 
                key={img.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group relative aspect-[3/4] bg-[#050505] rounded-2xl md:rounded-[2rem] overflow-hidden border border-white/10 hover:border-emerald-500/50 transition-all shadow-lg"
              >
                <img src={img.url} alt={img.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all" />
                
                {/* Mobile Friendly Dark Overlay always present slightly */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent md:opacity-0 md:group-hover:opacity-100 transition-all" />
                
                <div className="absolute bottom-3 left-3 right-3 md:bottom-4 md:left-4 md:right-4">
                   <p className="text-white text-[9px] md:text-xs font-bold truncate mb-2 md:mb-3 drop-shadow-md">{img.name}</p>
                   <button 
                     onClick={() => handleDownload(img.url, img.name)}
                     className="w-full py-2 md:py-2.5 bg-white/10 backdrop-blur-md border border-white/5 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                   >
                     Download HD
                   </button>
                </div>
              </motion.div>
            ))}
         </div>

         {images.length === 0 && (
            <div className="text-center py-20 flex flex-col items-center">
               <ImageIcon className="w-12 h-12 md:w-16 md:h-16 text-gray-800 mb-4" />
               <p className="text-gray-500 font-bold text-sm">No selected photos found for this album.</p>
            </div>
         )}
      </main>

      <footer className="p-6 md:p-8 text-center border-t border-white/5 mt-10">
         <p className="text-[8px] md:text-[10px] text-gray-600 font-black uppercase tracking-widest">Powered by SnapSaarthi OS • Secure Workspace</p>
      </footer>
    </div>
  );
}
