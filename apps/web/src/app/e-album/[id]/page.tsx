"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { 
  Loader2, Volume2, VolumeX, ChevronLeft, ChevronRight, Share2, 
  QrCode, Play, X, Maximize, Minimize, Music, LayoutGrid, 
  DownloadCloud, Info, Pause, RotateCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// High-Quality Cinematic Music Options
const MUSIC_LIST = [
  { title: "Wedding Bliss", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" },
  { title: "Romantic Journey", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { title: "Grand Celebration", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" }
];

export default function PremiumEAlbum({ params }: { params: { id: string } }) {
  const [album, setAlbum] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1); // -1 is intro/cover
  const [isPlaying, setIsPlaying] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchAlbum = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/albums/client/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAlbum(data.album);
      // Ensure we have a cover image first, then the photos
      const selection = (data.album.photos || []).filter((p: any) => p.selected);
      setImages(selection);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const resolved = await params;
      fetchAlbum(resolved.id);
    };
    init();
  }, [params, fetchAlbum]);

  // Handle Autoplay logic
  useEffect(() => {
    let interval: any;
    if (autoPlay && !showIntro) {
      interval = setInterval(() => {
        if (currentIndex < images.length - 1) {
          setCurrentIndex(prev => prev + 1);
        } else {
          setAutoPlay(false);
        }
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [autoPlay, currentIndex, images.length, showIntro]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const startAlbum = () => {
    setShowIntro(false);
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
    setCurrentIndex(0);
  };

  const next = () => {
    if (currentIndex < images.length - 1) setCurrentIndex(prev => prev + 1);
    else setAutoPlay(false);
  };

  const prev = () => {
    if (currentIndex > -1) setCurrentIndex(prev => prev - 1);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#020202] flex items-center justify-center">
         <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">Preparing Experience</p>
         </div>
      </div>
    );
  }

  const currentImage = currentIndex === -1 ? { url: album?.cover, name: "Cover" } : images[currentIndex];

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-black text-white flex flex-col font-sans overflow-hidden select-none"
    >
      <audio ref={audioRef} loop src={MUSIC_LIST[0].url} muted={isMuted} />

      {/* Intro / Loading Overlay */}
      <AnimatePresence>
        {showIntro && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.8, ease: "circOut" }}
            className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-8 text-center"
          >
             <div className="absolute inset-0 opacity-40">
                <img src={album?.cover} className="w-full h-full object-cover blur-xl scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
             </div>

             <motion.div 
               initial={{ y: 20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ delay: 0.3 }}
               className="relative z-10 max-w-xl w-full"
             >
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-10 shadow-[0_0_50px_rgba(255,255,255,0.2)] animate-pulse">
                   <Play className="w-10 h-10 text-black fill-current ml-1" />
                </div>
                <h2 className="text-sm font-black text-indigo-500 uppercase tracking-[0.5em] mb-4">You are invited to view</h2>
                <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter mb-4 uppercase drop-shadow-2xl">{album?.title || "Digital E-Album"}</h1>
                <div className="h-px w-32 bg-gradient-to-r from-transparent via-white/40 to-transparent mx-auto mb-8" />
                <p className="text-gray-400 text-sm font-medium tracking-widest mb-12 italic">Capture every moment, forever in your pocket.</p>
                
                <button 
                  onClick={startAlbum}
                  className="group relative px-16 py-6 bg-white text-black font-black text-xs uppercase tracking-[0.3em] rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95"
                >
                  <span className="relative z-10">Start Experience</span>
                  <div className="absolute inset-0 bg-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <span className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 text-white transition-opacity duration-300">Open Album</span>
                </button>
                
                <div className="mt-20 flex items-center justify-center gap-2 text-[8px] font-black uppercase tracking-widest text-white/20">
                   <RotateCw className="w-3 h-3 animate-reverse-spin" /> Powered by SnapSaarthi OS
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Experience Header */}
      {!showIntro && (
        <motion.header 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute top-0 w-full z-50 p-6 md:p-10 flex justify-between items-start pointer-events-none"
        >
           <div className="pointer-events-auto">
              <h2 className="text-xl md:text-2xl font-black italic tracking-tighter uppercase leading-none">{album?.title}</h2>
              <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-[0.4em] mt-2">Moment {currentIndex + 1} of {images.length}</p>
           </div>

           <div className="flex gap-3 pointer-events-auto">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className="w-12 h-12 flex items-center justify-center bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/20 transition-all"
              >
                 {isMuted ? <VolumeX className="w-5 h-5 text-gray-500" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <button 
                onClick={toggleFullscreen}
                className="w-12 h-12 flex items-center justify-center bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/20 transition-all"
              >
                 {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>
              <button 
                onClick={() => setShowThumbnails(!showThumbnails)}
                className={`w-12 h-12 flex items-center justify-center backdrop-blur-xl border border-white/10 rounded-2xl transition-all ${showThumbnails ? 'bg-indigo-600 border-indigo-500' : 'bg-white/10 hover:bg-white/20'}`}
              >
                 <LayoutGrid className="w-5 h-5" />
              </button>
           </div>
        </motion.header>
      )}

      {/* 3D Flipbook Viewer */}
      <main className="flex-1 relative flex items-center justify-center p-4 md:p-20 perspective-[2000px]">
         <div className="relative w-full h-full max-w-6xl flex items-center justify-center">
            
            <AnimatePresence mode="wait">
               <motion.div 
                 key={currentIndex}
                 initial={{ 
                   rotateY: 90, 
                   x: 100, 
                   opacity: 0 
                 }}
                 animate={{ rotateY: 0, x: 0, opacity: 1 }}
                 exit={{ 
                   rotateY: -90, 
                   x: -100, 
                   opacity: 0 
                 }}
                 transition={{ 
                   duration: 0.6, 
                   type: "spring", 
                   damping: 25, 
                   stiffness: 120 
                 }}
                 className="relative w-full h-full bg-[#0a0a0a] rounded-xl md:rounded-[2.5rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.8)] border border-white/5"
               >
                  {/* The Image */}
                  <img 
                    src={currentImage?.url} 
                    className="w-full h-full object-contain" 
                    alt="Page"
                  />
                  
                  {/* Visual Polish: Book effects */}
                  <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black/80 to-transparent pointer-events-none md:opacity-100 opacity-40" />
                  <div className="absolute inset-y-0 right-0 w-4 bg-black/20 pointer-events-none" />
                  <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                  
                  {/* Page Info Overlay */}
                  <div className="absolute bottom-0 inset-x-0 p-8 md:p-12 bg-gradient-to-t from-black via-black/40 to-transparent">
                     <motion.div 
                       initial={{ y: 20, opacity: 0 }}
                       animate={{ y: 0, opacity: 1 }}
                       transition={{ delay: 0.3 }}
                     >
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-500 mb-2">{currentImage?.category || "Highlights"}</p>
                        <h3 className="text-2xl md:text-4xl font-black italic tracking-tighter truncate max-w-2xl">{currentImage?.name || `Moment ${currentIndex + 1}`}</h3>
                     </motion.div>
                  </div>
               </motion.div>
            </AnimatePresence>

            {/* Click Navigation Targets (Invisible Sides) */}
            <div className="absolute inset-0 flex z-30 pointer-events-none">
               <div className="flex-1 cursor-pointer pointer-events-auto group" onClick={prev}>
                  <div className="w-12 h-20 absolute left-4 top-1/2 -translate-y-1/2 bg-white/5 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                     <ChevronLeft className="w-6 h-6" />
                  </div>
               </div>
               <div className="flex-1 cursor-pointer pointer-events-auto group flex justify-end" onClick={next}>
                  <div className="w-12 h-20 absolute right-4 top-1/2 -translate-y-1/2 bg-white/5 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                     <ChevronRight className="w-6 h-6" />
                  </div>
               </div>
            </div>
         </div>
      </main>

      {/* Bottom Thumbnail Strip */}
      <AnimatePresence>
         {showThumbnails && (
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="absolute bottom-28 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-4 z-50 flex gap-3 overflow-x-auto no-scrollbar scroll-smooth"
            >
               <div 
                 onClick={() => { setCurrentIndex(-1); setShowThumbnails(false); }}
                 className={`shrink-0 w-20 aspect-[3/4] rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${currentIndex === -1 ? 'border-indigo-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
               >
                  <img src={album?.cover} className="w-full h-full object-cover" />
               </div>
               {images.map((img, i) => (
                  <div 
                    key={i}
                    onClick={() => { setCurrentIndex(i); setShowThumbnails(false); }}
                    className={`shrink-0 w-20 aspect-[3/4] rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${currentIndex === i ? 'border-indigo-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                     <img src={img.url} className="w-full h-full object-cover" />
                  </div>
               ))}
            </motion.div>
         )}
      </AnimatePresence>

      {/* Main Footer Controls */}
      {!showIntro && (
        <motion.footer 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-t from-black to-transparent"
        >
           {/* Left: Music Info */}
           <div className="hidden md:flex items-center gap-4 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center animate-spin-slow">
                 <Music className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                 <p className="text-[8px] font-black uppercase tracking-widest text-indigo-400">Cinematic</p>
                 <p className="text-xs font-bold truncate w-24 md:w-auto">{MUSIC_LIST[0].title}</p>
              </div>
           </div>

           {/* Center: Playback Controls */}
           <div className="flex items-center gap-4">
              <button 
                onClick={prev}
                disabled={currentIndex === -1}
                className="w-12 h-12 flex items-center justify-center bg-white/5 border border-white/10 rounded-full hover:bg-white/10 disabled:opacity-0 transition-all"
              >
                 <ChevronLeft className="w-6 h-6" />
              </button>
              
              <div className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-full">
                 <div onClick={() => setAutoPlay(!autoPlay)} className="cursor-pointer group flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg transition-all ${autoPlay ? 'bg-indigo-600 text-white' : 'bg-white/10 text-gray-500 group-hover:text-white'}`}>
                       {autoPlay ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{autoPlay ? "Playing" : "Slideshow"}</span>
                 </div>
                 <div className="h-4 w-px bg-white/10 mx-2" />
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                    {currentIndex === -1 ? "Cover" : `${currentIndex + 1} / ${images.length}`}
                 </span>
              </div>

              <button 
                onClick={next}
                disabled={currentIndex === images.length - 1}
                className="w-12 h-12 flex items-center justify-center bg-white/5 border border-white/10 rounded-full hover:bg-white/10 disabled:opacity-0 transition-all"
              >
                 <ChevronRight className="w-6 h-6" />
              </button>
           </div>

           {/* Right: Actions */}
           <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all">
                 <Share2 className="w-4 h-4" /> Share
              </button>
              {album?.settings?.allowDownload && (
                 <button className="w-12 h-12 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/20 transition-all">
                    <DownloadCloud className="w-5 h-5" />
                 </button>
              )}
           </div>
        </motion.footer>
      )}

      {/* Global CSS for custom behaviors */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        @keyframes reverse-spin {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-reverse-spin {
          animation: reverse-spin 4s linear infinite;
        }
      `}</style>
    </div>
  );
}
