"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, User, Phone, Folder, Hash, Image as ImageIcon, Upload } from "lucide-react";
import { useToast } from "./Toaster";

interface CreateAlbumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
}

export default function CreateAlbumModal({ isOpen, onClose, onSuccess, userId }: CreateAlbumModalProps) {
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    clientName: "",
    clientPhone: "",
    category: "Wedding",
    targetCount: ""
  });
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("clientName", formData.clientName);
      data.append("clientPhone", formData.clientPhone);
      data.append("category", formData.category);
      data.append("targetCount", formData.targetCount);
      data.append("userId", userId);
      
      const saved = sessionStorage.getItem("snapsaarthi_user");
      if (saved) {
        const userData = JSON.parse(saved);
        if (userData.email) data.append("email", userData.email);
      }

      if (coverImage) data.append("coverImage", coverImage);

      const resp = await fetch("/api/albums", {
        method: "POST",
        body: data
      });
      if (resp.ok) {
        success("Album created successfully!");
        onSuccess();
        onClose();
        setFormData({ title: "", clientName: "", clientPhone: "", category: "Wedding", targetCount: "50" });
        setCoverImage(null);
        setPreview(null);
      } else {
        const errData = await resp.json().catch(() => ({}));
        error(errData.details || errData.error || "Failed to create album");
      }
    } catch (err: any) {
      error("Connection error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-xl max-h-[90vh] bg-[#0a0a0a] border border-white/10 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden relative flex flex-col"
          >
            <div className="p-6 md:p-10 overflow-y-auto">
              <div className="flex items-center justify-between mb-6 md:mb-8">
                <div>
                  <h2 className="text-xl md:text-2xl font-black tracking-tighter italic">Create New <span className="text-indigo-500">Album</span></h2>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Project Initialization</p>
                </div>
                <button onClick={onClose} className="p-2 border border-white/5 rounded-xl text-gray-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Album Title</label>
                  <div className="relative group">
                    <Folder className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-indigo-500 transition-colors" />
                    <input 
                      required 
                      type="text" 
                      placeholder="Amit & Suman Wedding" 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.08] transition-all font-bold text-white"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Client Name</label>
                    <div className="relative group">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-indigo-500 transition-colors" />
                      <input 
                        required 
                        type="text" 
                        placeholder="Amit Singh" 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.08] transition-all font-bold text-white"
                        value={formData.clientName}
                        onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Client WhatsApp Number</label>
                    <div className="relative group">
                      <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-indigo-500 transition-colors" />
                      <input 
                        type="tel" 
                        placeholder="+91 99999 99999" 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.08] transition-all font-bold text-white"
                        value={formData.clientPhone}
                        onChange={(e) => setFormData({...formData, clientPhone: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Category</label>
                    <div className="relative">
                      <select 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.08] transition-all font-bold text-white appearance-none cursor-pointer"
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                      >
                        <option value="Wedding" className="bg-[#0a0a0a] text-white">Wedding</option>
                        <option value="Event" className="bg-[#0a0a0a] text-white">Event</option>
                        <option value="Fashion" className="bg-[#0a0a0a] text-white">Fashion</option>
                        <option value="Corporate" className="bg-[#0a0a0a] text-white">Corporate</option>
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Folder className="w-4 h-4 text-gray-500" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Selection Limit (Leave empty for Unlimited)</label>
                    <div className="relative group">
                      <Hash className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-indigo-500 transition-colors" />
                      <input 
                        type="number" 
                        placeholder="Unlimited" 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.08] transition-all font-bold text-white"
                        value={formData.targetCount}
                        onChange={(e) => setFormData({...formData, targetCount: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Album Cover Photo</label>
                  <label className="relative group flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-white/10 rounded-[2.5rem] hover:border-indigo-500/30 hover:bg-white/[0.02] transition-all cursor-pointer overflow-hidden">
                    {preview ? (
                      <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <div className="p-4 bg-white/5 rounded-2xl mb-3 group-hover:scale-110 transition-transform">
                          <Upload className="w-6 h-6 text-indigo-500" />
                        </div>
                        <p className="text-sm font-bold text-gray-400">Click or Drag to Upload</p>
                        <p className="text-[10px] text-gray-600 mt-1 uppercase font-black tracking-widest">Supports PNG, JPG (Max 5MB)</p>
                      </>
                    )}
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageChange} />
                  </label>
                </div>

                <button 
                  disabled={loading}
                  type="submit" 
                  className="w-full py-4 md:py-5 bg-indigo-600 rounded-2xl font-black text-xs md:text-sm shadow-xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4"
                >
                  {loading ? "Initializing..." : <>Launch Album Project <Camera className="w-5 h-5" /></>}
                </button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
