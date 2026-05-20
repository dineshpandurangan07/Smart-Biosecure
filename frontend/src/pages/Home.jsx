import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, ChevronRight, Activity, ArrowRight, Eye, ClipboardCheck } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col bg-slate-950">
      {/* Background Graphic Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-farm-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] rounded-full bg-emerald-600/10 blur-[150px] pointer-events-none" />

      {/* Landing Navbar */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-farm-600 flex items-center justify-center shadow-glow">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white leading-none">Smart BioSecure</h1>
            <span className="text-[10px] text-farm-500 font-bold uppercase tracking-widest mt-1 inline-block">Farm Portal</span>
          </div>
        </div>

        <nav className="flex items-center gap-6">
          <Link to="/about" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
            Protocols
          </Link>
          <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link
            to="/register"
            className="hidden sm:inline-flex bg-farm-600 hover:bg-farm-500 text-white text-xs font-semibold px-4.5 py-2.5 rounded-lg shadow-glow shadow-farm-600/15 items-center gap-1.5 transition-all"
          >
            <span>Register Farm</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-6 flex flex-col items-center justify-center text-center py-20 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-farm-400 font-semibold tracking-wide uppercase mb-6"
        >
          <ShieldCheck className="w-4.5 h-4.5 text-farm-500" />
          <span>Biosecurity Protection System</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-black text-white max-w-4xl tracking-tight leading-[1.1] font-sans"
        >
          Implementing Smart <span className="text-transparent bg-clip-text bg-gradient-to-r from-farm-400 to-emerald-500">Biosecurity</span> Measures for Pig & Poultry Farms
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-sm sm:text-base text-slate-400 max-w-2xl mt-6 leading-relaxed font-sans"
        >
          Protect your livestock, minimize viral transmission, and enforce visitor disinfection compliance. Driven by IoT telemetry simulator, real-time analytics, and AI disease risk diagnostics.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="flex flex-col sm:flex-row items-center gap-4 mt-10 w-full sm:w-auto"
        >
          <Link
            to="/register"
            className="w-full sm:w-auto text-center bg-farm-600 hover:bg-farm-500 text-white font-medium px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-farm-600/20 hover:shadow-glow hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Launch Smart Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/about"
            className="w-full sm:w-auto text-center bg-slate-900 hover:bg-slate-800 border border-slate-800/80 text-slate-200 font-medium px-8 py-3.5 rounded-xl transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Explore Protocols</span>
          </Link>
        </motion.div>

        {/* Feature Grid */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 w-full text-left"
        >
          {/* Card 1 */}
          <div className="glass-card p-6.5 glass-card-hover">
            <div className="w-12 h-12 rounded-xl bg-farm-950/40 border border-farm-500/20 flex items-center justify-center mb-5">
              <Activity className="w-6 h-6 text-farm-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 font-sans">Livestock Health & AI</h3>
            <p className="text-slate-400 text-xs leading-relaxed font-sans">
              Track pig and poultry weights, age records, and log symptom clusters to trigger rule-based AI diagnoses risk alerts instantly.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-card p-6.5 glass-card-hover">
            <div className="w-12 h-12 rounded-xl bg-farm-950/40 border border-farm-500/20 flex items-center justify-center mb-5">
              <Eye className="w-6 h-6 text-farm-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 font-sans">Disinfection & Visitors</h3>
            <p className="text-slate-400 text-xs leading-relaxed font-sans">
              Log visitor entries with spray audits, gate verification logs, and strict approval workflows to prevent disease entry.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-card p-6.5 glass-card-hover">
            <div className="w-12 h-12 rounded-xl bg-farm-950/40 border border-farm-500/20 flex items-center justify-center mb-5">
              <ClipboardCheck className="w-6 h-6 text-farm-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 font-sans">Telemetry & Sanitation</h3>
            <p className="text-slate-400 text-xs leading-relaxed font-sans">
              Monitor simulated IoT sensors for ammonia gas, humidity levels, temperature shifts, water pressure, and record cleaning scoring audits.
            </p>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900 bg-slate-950/50 py-8 px-6 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            &copy; 2026 Smart BioSecure Farm Portal. All rights reserved. Engineering Main Project.
          </p>
          <div className="flex gap-4">
            <span className="text-[10px] text-slate-600 font-semibold tracking-wide uppercase px-2 py-0.5 rounded bg-slate-900 border border-slate-800">MERN Stack</span>
            <span className="text-[10px] text-slate-600 font-semibold tracking-wide uppercase px-2 py-0.5 rounded bg-slate-900 border border-slate-800">TailwindCSS</span>
            <span className="text-[10px] text-slate-600 font-semibold tracking-wide uppercase px-2 py-0.5 rounded bg-slate-900 border border-slate-800">AI & IoT Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
