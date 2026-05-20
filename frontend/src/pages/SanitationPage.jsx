import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import api, { getErrorMessage } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import {
  ClipboardList,
  Plus,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Award,
  Sparkles,
  Droplet,
  Trash2,
  Calendar,
  User,
  X
} from 'lucide-react';

const SanitationPage = () => {
  const { user } = useContext(AuthContext);
  const [sanitations, setSanitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [scoreFilter, setScoreFilter] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [area, setArea] = useState('Shed A (Gilt & Sow Housing)');
  const [cleanerName, setCleanerName] = useState('');
  const [disinfectantUsed, setDisinfectantUsed] = useState('Virkon S');
  const [concentration, setConcentration] = useState('1%');
  const [cleanlinessScore, setCleanlinessScore] = useState('9');
  const [notes, setNotes] = useState('');

  const fetchSanitations = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/sanitation');
      setSanitations(data);
      setErrorMsg('');
      setLoading(false);
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSanitations();
  }, []);

  const resetForm = () => {
    setArea('Shed A (Gilt & Sow Housing)');
    setCleanerName(user?.name || '');
    setDisinfectantUsed('Virkon S');
    setConcentration('1%');
    setCleanlinessScore('9');
    setNotes('');
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!area || !cleanerName || !disinfectantUsed || !cleanlinessScore) {
      setErrorMsg('Please populate all required fields');
      return;
    }

    try {
      await api.post('/sanitation', {
        area,
        cleanerName,
        disinfectantUsed,
        concentration,
        cleanlinessScore: Number(cleanlinessScore),
        notes,
      });
      setModalOpen(false);
      resetForm();
      fetchSanitations();
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Confirm deletion of this sanitation report? This action is permanent.')) {
      try {
        await api.delete(`/sanitation/${id}`);
        fetchSanitations();
      } catch (err) {
        setErrorMsg(getErrorMessage(err));
      }
    }
  };

  // Filter logs client-side
  const filteredSanitations = sanitations.filter(item => {
    const matchesSearch = item.area.toLowerCase().includes(search.toLowerCase()) || 
                          item.cleanerName.toLowerCase().includes(search.toLowerCase()) ||
                          item.disinfectantUsed.toLowerCase().includes(search.toLowerCase());
    const matchesScore = scoreFilter ? (
      scoreFilter === 'excellent' ? item.cleanlinessScore >= 9 :
      scoreFilter === 'good' ? (item.cleanlinessScore >= 7 && item.cleanlinessScore < 9) :
      item.cleanlinessScore < 7
    ) : true;
    return matchesSearch && matchesScore;
  });

  // Calculate statistics
  const totalAudits = filteredSanitations.length;
  const avgScore = totalAudits > 0 
    ? Number((filteredSanitations.reduce((acc, curr) => acc + curr.cleanlinessScore, 0) / totalAudits).toFixed(1)) 
    : 8.5;
  const excellentAudits = filteredSanitations.filter(s => s.cleanlinessScore >= 9).length;
  const warnings = filteredSanitations.filter(s => s.cleanlinessScore < 7).length;

  const getScoreColor = (score) => {
    if (score >= 9) return 'text-green-400 border-green-500/20 bg-green-950/30';
    if (score >= 7) return 'text-sky-400 border-sky-500/20 bg-sky-950/30';
    return 'text-red-400 border-red-500/20 bg-red-950/30';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Title Block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-5">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight font-sans">
            Sanitation Monitoring & Audits
          </h1>
          <p className="text-xs text-slate-400">
            Log, track, and score biocleanliness routines and chemical concentration compliance
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="glass-btn-primary py-2.5 px-5 text-xs flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Log Sanitation Audit</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4.5 h-4.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Average Cleanliness</span>
            <span className="text-lg font-bold text-white mt-0.5 block">{avgScore} / 10</span>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Excellent Audits (9+)</span>
            <span className="text-lg font-bold text-white mt-0.5 block">{excellentAudits} runs</span>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
            <Droplet className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Disinfection Cycles</span>
            <span className="text-lg font-bold text-white mt-0.5 block">{totalAudits} logged</span>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${warnings > 0 ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-green-500/10 border border-green-500/20 text-green-400'}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Critical Warnings (&lt;7)</span>
            <span className="text-lg font-bold text-white mt-0.5 block">{warnings} alerts</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
        {/* Search */}
        <div className="relative sm:col-span-2">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Area, Disinfectant or Cleaner..."
            className="w-full pl-10 glass-input text-xs"
          />
        </div>

        {/* Cleanliness rating filter */}
        <div className="relative sm:col-span-2">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
            <Filter className="w-4 h-4" />
          </span>
          <select
            value={scoreFilter}
            onChange={(e) => setScoreFilter(e.target.value)}
            className="w-full pl-9 glass-input text-xs"
          >
            <option value="" className="bg-slate-900 text-slate-100">All Cleanliness Ratings</option>
            <option value="excellent" className="bg-slate-900 text-slate-100">Excellent (9 - 10 Score)</option>
            <option value="good" className="bg-slate-900 text-slate-100">Good Compliance (7 - 8 Score)</option>
            <option value="warning" className="bg-slate-900 text-slate-100">Action Required (&lt; 7 Score)</option>
          </select>
        </div>
      </div>

      {/* Grid of Sanitation Logs */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 rounded-full border-2 border-slate-800 border-t-farm-500 animate-spin"></div>
        </div>
      ) : filteredSanitations.length === 0 ? (
        <div className="glass-panel p-10 text-center text-slate-500">
          No sanitation records found matching current query parameters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSanitations.map((audit) => (
            <motion.div
              key={audit._id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`glass-card p-5 space-y-4 hover:border-farm-500/20 ${audit.cleanlinessScore < 7 ? 'border-red-500/20' : ''}`}
            >
              {/* Header */}
              <div className="flex justify-between items-start gap-1">
                <div>
                  <h3 className="text-sm font-extrabold text-white tracking-tight leading-tight">{audit.area}</h3>
                  <span className="text-[9px] text-slate-500 font-semibold uppercase block mt-1">Chemical: {audit.disinfectantUsed} ({audit.concentration})</span>
                </div>
                <span className={`status-badge text-[10px] font-bold ${getScoreColor(audit.cleanlinessScore)}`}>
                  <span>Score: {audit.cleanlinessScore}</span>
                </span>
              </div>

              {/* Clean details info box */}
              <div className="grid grid-cols-2 gap-2 bg-slate-950/20 border border-slate-900 rounded-xl p-3 text-center text-xs">
                <div className="flex items-center justify-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-farm-400" />
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase font-medium text-left">Auditor</span>
                    <span className="text-[11px] font-bold text-slate-200 mt-0.5 block truncate text-left">{audit.cleanerName}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase font-medium">Logged Date</span>
                  <span className="text-[11px] font-bold text-slate-200 mt-0.5 block truncate">
                    {new Date(audit.timestamp || audit.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Description */}
              {audit.notes && (
                <p className="text-[10px] text-slate-400 bg-slate-950/20 p-2.5 rounded-lg border border-slate-900/60 leading-relaxed italic">
                  Observation: "{audit.notes}"
                </p>
              )}

              {/* Delete record */}
              <div className="flex justify-between items-center border-t border-slate-900 pt-3">
                <span className="text-[9px] text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-600" />
                  Reported: {new Date(audit.createdAt).toLocaleDateString()}
                </span>
                {user?.role === 'admin' && (
                  <button
                    onClick={() => handleDelete(audit._id)}
                    className="p-2 rounded-lg bg-red-950/20 border border-red-500/10 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Log Sanitation Audit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg glass-panel p-6 shadow-2xl relative"
          >
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-6 border-b border-slate-800 pb-3">
              Log Sanitation Routine & Audit
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Clean Area */}
                <div className="flex flex-col sm:col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Sanitized Farm Sector *</label>
                  <select
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full glass-input text-xs"
                  >
                    <option value="Shed A (Gilt & Sow Housing)" className="bg-slate-900 text-slate-100">Shed A (Gilt & Sow Housing)</option>
                    <option value="Shed B (Weaner & Finisher Housing)" className="bg-slate-900 text-slate-100">Shed B (Weaner & Finisher Housing)</option>
                    <option value="Shed C (Farrowing Sector)" className="bg-slate-900 text-slate-100">Shed C (Farrowing Sector)</option>
                    <option value="Coop 1 (Broiler Pen)" className="bg-slate-900 text-slate-100">Coop 1 (Broiler Pen)</option>
                    <option value="Coop 2 (Egg Layer Pen)" className="bg-slate-900 text-slate-100">Coop 2 (Egg Layer Pen)</option>
                    <option value="Coop 3 (Turkey Breed Block)" className="bg-slate-900 text-slate-100">Coop 3 (Turkey Breed Block)</option>
                    <option value="Visitor Disinfection Gate" className="bg-slate-900 text-slate-100">Visitor Disinfection Gate</option>
                    <option value="Feed Storage Area" className="bg-slate-900 text-slate-100">Feed Storage Area</option>
                    <option value="Waste & Effluent Management Pit" className="bg-slate-900 text-slate-100">Waste & Effluent Management Pit</option>
                  </select>
                </div>

                {/* Cleaner / Auditor Name */}
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Auditor / Operator *</label>
                  <input
                    type="text"
                    value={cleanerName}
                    onChange={(e) => setCleanerName(e.target.value)}
                    placeholder="e.g. Robert Miller"
                    className="w-full glass-input text-xs"
                    required
                  />
                </div>

                {/* Discleanliness score */}
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Cleanliness Score (1-10) *</label>
                  <select
                    value={cleanlinessScore}
                    onChange={(e) => setCleanlinessScore(e.target.value)}
                    className="w-full glass-input text-xs font-sans"
                  >
                    <option value="10" className="bg-slate-900 text-slate-100">10 - Perfect Biosecure Sterile</option>
                    <option value="9" className="bg-slate-900 text-slate-100">9 - Excellent Cleanliness</option>
                    <option value="8" className="bg-slate-900 text-slate-100">8 - Good Standard</option>
                    <option value="7" className="bg-slate-900 text-slate-100">7 - Satisfactory</option>
                    <option value="6" className="bg-slate-900 text-slate-100">6 - Light Deterioration</option>
                    <option value="5" className="bg-slate-900 text-slate-100">5 - Requires Minor Attention</option>
                    <option value="4" className="bg-slate-900 text-slate-100">4 - Poor Hygiene Warning</option>
                    <option value="3" className="bg-slate-900 text-slate-100">3 - Severe Biological Risk</option>
                    <option value="2" className="bg-slate-900 text-slate-100">2 - Critical Bio-Breach</option>
                    <option value="1" className="bg-slate-900 text-slate-100">1 - Toxic Outbreak Hazard</option>
                  </select>
                </div>

                {/* Disinfectant Chemical */}
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Disinfectant Used *</label>
                  <select
                    value={disinfectantUsed}
                    onChange={(e) => setDisinfectantUsed(e.target.value)}
                    className="w-full glass-input text-xs"
                  >
                    <option value="Virkon S" className="bg-slate-900 text-slate-100">Virkon S (Broad Spectrum)</option>
                    <option value="Glutaraldehyde" className="bg-slate-900 text-slate-100">Glutaraldehyde (Aldehyde-based)</option>
                    <option value="Bleach" className="bg-slate-900 text-slate-100">Bleach (Sodium Hypochlorite)</option>
                    <option value="Formalin" className="bg-slate-900 text-slate-100">Formalin (Gas Fumigant)</option>
                    <option value="Quaternary Ammonium" className="bg-slate-900 text-slate-100">Quaternary Ammonium (QAC)</option>
                  </select>
                </div>

                {/* Dilution Concentration */}
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Dilution Ratio / PPM *</label>
                  <input
                    type="text"
                    value={concentration}
                    onChange={(e) => setConcentration(e.target.value)}
                    placeholder="e.g. 1% or 200ppm"
                    className="w-full glass-input text-xs"
                    required
                  />
                </div>

                {/* Notes */}
                <div className="flex flex-col sm:col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Sanitation Details & Field Observations</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Describe specific cleaning actions, structural status, or rodent/insect trap inspection observations..."
                    className="w-full glass-input text-xs h-20 resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-800 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="glass-btn-secondary px-5 py-2.5 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="glass-btn-primary px-6 py-2.5 text-xs"
                >
                  Log Audit Report
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SanitationPage;
