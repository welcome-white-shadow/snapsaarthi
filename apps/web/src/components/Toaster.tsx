"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertCircle, Info, Sparkles } from "lucide-react";
import { createContext, useContext, useState, useCallback, ReactNode } from "react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  }, [removeToast]);

  const success = (msg: string) => toast(msg, "success");
  const error = (msg: string) => toast(msg, "error");

  return (
    <ToastContext.Provider value={{ toast, success, error }}>
      {children}
      <div className="fixed top-8 left-1/2 -translate-x-1/2 md:left-auto md:right-8 md:translate-x-0 z-[10000] flex flex-col gap-4 pointer-events-none w-full max-w-[90vw] md:max-w-md">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -40, scale: 0.9, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)", transition: { duration: 0.2 } }}
              layout
              className="pointer-events-auto"
            >
              <div className={`
                relative group flex items-center gap-4 px-6 py-5 rounded-[2rem] border backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden
                ${t.type === "success" ? "bg-emerald-500/10 border-emerald-500/20" : 
                  t.type === "error" ? "bg-rose-500/10 border-rose-500/20" : 
                  "bg-indigo-500/10 border-indigo-500/20"}
              `}>
                {/* Animated Inner Glow */}
                <div className={`absolute inset-0 opacity-20 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000`} />
                
                <div className={`
                  shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center
                  ${t.type === "success" ? "bg-emerald-500/20 text-emerald-400" : 
                    t.type === "error" ? "bg-rose-500/20 text-rose-400" : 
                    "bg-indigo-500/20 text-indigo-400"}
                `}>
                  {t.type === "success" && <CheckCircle2 className="w-5 h-5" />}
                  {t.type === "error" && <AlertCircle className="w-5 h-5" />}
                  {t.type === "info" && <Sparkles className="w-5 h-5 animate-pulse" />}
                </div>

                <div className="flex-1">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-1">
                      {t.type === "success" ? "Success Notification" : t.type === "error" ? "System Alert" : "Information"}
                   </p>
                   <p className="text-sm font-black italic tracking-tight text-white/90 leading-tight">
                      {t.message}
                   </p>
                </div>

                <button 
                  onClick={() => removeToast(t.id)}
                  className="shrink-0 p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                >
                  <X className="w-4 h-4 text-white/40" />
                </button>

                {/* Progress Bar Loader */}
                <motion.div 
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: 4, ease: "linear" }}
                  className={`absolute bottom-0 left-0 right-0 h-1 origin-left
                    ${t.type === "success" ? "bg-emerald-500/50" : 
                      t.type === "error" ? "bg-rose-500/50" : 
                      "bg-indigo-500/50"}
                  `}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
}
