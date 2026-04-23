"use client";

import { motion } from "framer-motion";
import { Camera, ArrowLeft, Search, Rocket, Clock, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const BLOG_POSTS = [
  {
    id: 1,
    title: "How to Scale Your Wedding Photography Business in 2026",
    category: "Business Growth",
    readTime: "8 min read",
    date: "April 15, 2026",
    image: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&q=80&w=800",
    desc: "Discover the 5 automated systems every high-end studio needs to double their revenue without adding more staff. Learn how to transition from a solo photographer to a studio empire."
  },
  {
    id: 2,
    title: "The Art of Client Communication: Beyond Screenshots",
    category: "Workflow",
    readTime: "5 min read",
    date: "April 12, 2026",
    image: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=800",
    desc: "Why traditional selection methods are killing your client's experience and how to fix it with elite digital portals. Build trust through professional delivery."
  },
  {
    id: 3,
    title: "Mastering the Digital Album: 3D Flipbooks and Beyond",
    category: "Innovation",
    readTime: "6 min read",
    date: "April 10, 2026",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800",
    desc: "How delivering interactive digital memories can help you charge 30% more for your wedding packages. The future of photography isn't just photos, it's the experience."
  },
  {
    id: 4,
    title: "SEO for Photographers: Dominating Local Search Results",
    category: "Marketing",
    readTime: "10 min read",
    date: "April 05, 2026",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
    desc: "A comprehensive guide to ranking your photography studio on the first page of Google. Attract high-intent clients without spending on ads."
  }
];

export default function BlogPage() {
  const [search, setSearch] = useState("");

  const filteredPosts = BLOG_POSTS.filter(post => 
    post.title.toLowerCase().includes(search.toLowerCase()) || 
    post.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#020202] text-white selection:bg-indigo-500/30">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-rose-600/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f05_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f05_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <nav className="fixed top-0 w-full z-50 glass border-b border-white/5 py-4 px-6 md:px-12 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Camera className="text-white w-4 h-4" />
          </div>
          <span className="text-xl font-black tracking-tighter text-white">SnapSaarthi</span>
        </Link>
        <Link href="/" className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </nav>

      <section className="relative pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto z-10">
        <div className="text-center mb-16 px-4">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="inline-flex items-center gap-3 px-6 py-2 mb-8 text-[10px] font-black tracking-[0.4em] uppercase text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-full"
           >
             <Sparkles className="w-4 h-4" />
             The Knowledge Base
           </motion.div>
           <motion.h1 
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1 }}
             className="text-4xl md:text-7xl font-black tracking-tighter italic mb-8"
           >
             Studio <span className="text-indigo-500">Insights.</span>
           </motion.h1>
           <motion.p 
             initial={{ opacity: 0, y: 40 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2 }}
             className="max-w-xl mx-auto text-gray-500 font-medium text-lg italic"
           >
             Deep dives into the tech, marketing, and workflows that separate elite studios from the rest.
           </motion.p>
        </div>

        {/* Search & Filter */}
        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: 0.3 }}
           className="relative max-w-2xl mx-auto mb-20 group"
        >
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search insights (e.g. 'growth', 'workflow')..." 
            className="w-full bg-white/[0.03] border border-white/10 rounded-[2rem] py-6 pl-16 pr-8 focus:outline-none focus:border-indigo-500/50 focus:bg-white/5 transition-all text-white font-bold"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </motion.div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {filteredPosts.map((post, i) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group"
            >
              <div className="relative aspect-[16/9] rounded-[3rem] overflow-hidden mb-8 border border-white/10 group-hover:border-indigo-500/50 transition-all shadow-2xl">
                 <img 
                   src={post.image} 
                   alt={post.title} 
                   className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 opacity-60 group-hover:opacity-100"
                 />
                 <div className="absolute top-8 left-8">
                    <span className="px-5 py-2 rounded-full bg-white text-black text-[10px] font-black uppercase tracking-widest shadow-xl">
                      {post.category}
                    </span>
                 </div>
              </div>
              <div className="px-4">
                 <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 mb-4">
                    <span>{post.readTime}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-800" />
                    <span>{post.date}</span>
                 </div>
                 <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-white mb-6 group-hover:text-indigo-400 transition-colors leading-tight italic">
                   {post.title}
                 </h2>
                 <p className="text-gray-500 text-lg leading-relaxed mb-8 line-clamp-3">
                   {post.desc}
                 </p>
                 <button className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-white group-hover:text-indigo-400 transition-colors">
                   Continue Reading <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                 </button>
              </div>
            </motion.article>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-20">
             <Rocket className="w-16 h-16 text-gray-800 mx-auto mb-6" />
             <p className="text-gray-500 font-bold text-xl">No insights matching your search.</p>
          </div>
        )}
      </section>

      {/* Newsletter / CTA */}
      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto glass rounded-[3rem] p-12 md:p-20 text-center border-white/5 relative overflow-hidden">
           <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px]" />
           <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-6 italic">Stay <span className="text-indigo-500">Ahead.</span></h2>
              <p className="text-gray-400 mb-10 max-w-sm mx-auto font-medium">Join 5,000+ photographers receiving our weekly studio growth playbook.</p>
              <div className="flex flex-col md:flex-row gap-4 max-w-md mx-auto">
                 <input type="email" placeholder="your@email.com" className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-indigo-500 transition-all font-bold" />
                 <button className="px-8 py-4 bg-white text-black rounded-2xl font-black text-sm hover:scale-105 active:scale-95 transition-all">Subscribe</button>
              </div>
           </div>
        </div>
      </section>

      <footer className="py-12 border-t border-white/5 text-center">
         <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-700">© 2026 SnapSaarthi Knowledge Academy</p>
      </footer>
    </main>
  );
}
