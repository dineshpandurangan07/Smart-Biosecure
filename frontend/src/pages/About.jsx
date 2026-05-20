import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, BookOpen, Layers, CheckCircle2, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
  const protocols = [
    {
      title: 'Structural Biosecurity',
      desc: 'Physical barriers designed to isolate pigs/poultry from external viral vectors.',
      items: [
        'Secure perimeter fences to exclude wild animals, birds, and rodents.',
        'Clear "Clean" and "Dirty" boundary markings with dedicated changing barriers.',
        'Strict drainage routes to prevent waste sludge flow entering the housing blocks.',
      ],
    },
    {
      title: 'Operational Protocols',
      desc: 'Day-to-day work patterns to minimize infection pathways and log statuses.',
      items: [
        'Vehicle wheel spraying and high-pressure chemical wash at the farm entrance.',
        'Enforcing shower-in/shower-out systems and boots/suits shifts for all personnel.',
        'Strict "all-in, all-out" animal transfer cycles to allow complete pen disinfection.',
      ],
    },
    {
      title: 'Clinical & Health Checks',
      desc: 'Immunology guidelines and quarantine compliance to suppress outbreaks.',
      items: [
        'Routine vaccine checklists targeting Swine Flu, PCV2, and Newcastle Disease.',
        'Enforcing immediate isolation for animals exhibiting cough, lethargy, or skin spots.',
        'Automatic quarantine logs and vet review notifications powered by AI evaluation.',
      ],
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950 py-12 px-6">
      <div className="absolute top-10 left-10 w-80 h-80 rounded-full bg-farm-600/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-emerald-600/5 blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Back Link */}
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors uppercase tracking-wider mb-8">
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Landing</span>
        </Link>

        {/* Title */}
        <div className="text-left mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-farm-500 uppercase tracking-widest bg-farm-950/20 border border-farm-500/15 px-3.5 py-1.5 rounded-full mb-4">
            <BookOpen className="w-4 h-4" />
            <span>Farm Security Guidebook</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-sans tracking-tight">
            Pig & Poultry Biosecurity Measures
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-3 max-w-3xl leading-relaxed">
            Biosecurity is the implementation of measures that reduce the risk of the introduction and spread of disease agents. Pig and poultry operations are highly vulnerable to viral vectors (e.g. African Swine Fever, Newcastle Disease). Enforcing physical and operations checks is paramount.
          </p>
        </div>

        {/* Protocols Grid */}
        <div className="space-y-6">
          {protocols.map((proto, idx) => (
            <motion.div
              key={proto.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="glass-card p-6 sm:p-8"
            >
              <div className="flex flex-col md:flex-row gap-6">
                {/* Visual marker */}
                <div className="md:w-1/3 text-left border-b md:border-b-0 md:border-r border-slate-800 pb-5 md:pb-0 md:pr-6">
                  <div className="w-10 h-10 rounded-lg bg-farm-950/40 border border-farm-500/20 flex items-center justify-center mb-4">
                    <Layers className="w-5 h-5 text-farm-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white font-sans">{proto.title}</h3>
                  <p className="text-slate-400 text-[11px] leading-relaxed mt-2">{proto.desc}</p>
                </div>

                {/* Checklist items */}
                <div className="flex-1 space-y-4">
                  {proto.items.map((item, index) => (
                    <div key={index} className="flex gap-3 items-start">
                      <CheckCircle2 className="w-5 h-5 text-farm-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Emergency block */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 rounded-2xl bg-red-950/20 border border-red-500/20 p-6 flex flex-col sm:flex-row items-start gap-4"
        >
          <div className="w-10 h-10 rounded-lg bg-red-950/40 border border-red-500/20 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-red-200 font-sans">Emergency Quarantine Actions</h4>
            <p className="text-slate-400 text-xs leading-relaxed mt-1.5">
              If an animal exhibits acute lethargy, respiratory issues, red patches, or if flock mortality increases, use the **AI Disease Alert System** on your dashboard immediately. This triggers rule-based clinical quarantine advice and halts visitor gates automatically.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
