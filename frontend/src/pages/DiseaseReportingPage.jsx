import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import api, { getErrorMessage } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import {
  AlertTriangle,
  Plus,
  Cpu,
  Brain,
  ShieldCheck,
  ShieldX,
  X,
  Trash2,
  AlertOctagon,
  ClipboardList,
} from 'lucide-react';

const DiseaseReportingPage = () => {
  const { user } = useContext(AuthContext);
  const { fetchNotifications } = useContext(NotificationContext);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [aiPreviewOpen, setAiPreviewOpen] = useState(false);
  const [aiPreviewData, setAiPreviewData] = useState(null);

  // Form State
  const [animalTag, setAnimalTag] = useState('');
  const [species, setSpecies] = useState('Pig');
  const [severity, setSeverity] = useState('High');
  const [symptoms, setSymptoms] = useState([]);

  // Available symptoms list based on species
  const swineSymptoms = [
    'High Fever',
    'Lethargy / Loss of Appetite',
    'Skin Red Spots / Discoloration',
    'Coughing / Labored Breathing',
    'High Mortality Rate',
    'Dung Blood streaks',
  ];

  const poultrySymptoms = [
    'Respiratory Snicking / Coughing',
    'Comb / Wattles Swelling',
    'Greenish-White Diarrhea / Loose Droppings',
    'Neurological Twisting of neck / Paralysis',
    'High Mortality Rate',
    'Subcutaneous Red spots on legs',
  ];

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/diseases');
      setReports(data);
      setErrorMsg('');
      setLoading(false);
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleSymptomToggle = (symptom) => {
    if (symptoms.includes(symptom)) {
      setSymptoms(symptoms.filter((s) => s !== symptom));
    } else {
      setSymptoms([...symptoms, symptom]);
    }
  };

  // Run AI predictor preview in flight
  const handleAIAnalyze = async () => {
    if (symptoms.length === 0) {
      alert('Select at least one symptom to analyze');
      return;
    }

    try {
      const { data } = await api.post('/diseases/ai-predict', {
        species,
        symptoms,
        severity,
      });
      setAiPreviewData(data);
      setAiPreviewOpen(true);
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  const handleCreateReport = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (symptoms.length === 0) {
      setErrorMsg('Please select at least one symptom cluster');
      return;
    }

    try {
      await api.post('/diseases', {
        animalTag: animalTag.toUpperCase(),
        species,
        symptoms,
        severity,
      });

      setModalOpen(false);
      setAiPreviewOpen(false);
      setAnimalTag('');
      setSeverity('High');
      setSymptoms([]);
      setAiPreviewData(null);

      fetchReports();
      fetchNotifications();
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
    }
  };

  const handleToggleQuarantine = async (report) => {
    try {
      await api.put(`/diseases/${report._id}/status`, {
        quarantineEnforced: !report.quarantineEnforced,
        status: report.quarantineEnforced ? 'Resolved' : 'Investigating',
      });
      fetchReports();
      fetchNotifications();
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this disease report log?')) {
      try {
        await api.delete(`/diseases/${id}`);
        fetchReports();
      } catch (err) {
        setErrorMsg(getErrorMessage(err));
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-5">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight font-sans">
            AI Disease & Sickness Reports
          </h1>
          <p className="text-xs text-slate-400">
            Log clinical anomalies and execute rule-based AI diagnoses risk estimates
          </p>
        </div>

        <button
          onClick={() => {
            setSymptoms([]);
            setAnimalTag('');
            setAiPreviewData(null);
            setModalOpen(true);
          }}
          className="glass-btn-primary py-2.5 px-5 text-xs flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Report Sickness Incident</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4.5 h-4.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Grid of sickness logs */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 rounded-full border-2 border-slate-800 border-t-farm-500 animate-spin"></div>
        </div>
      ) : reports.length === 0 ? (
        <div className="glass-panel p-10 text-center text-slate-500">
          No disease reports recorded in active collections.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports.map((report) => (
            <motion.div
              key={report._id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`glass-card p-5.5 space-y-4 hover:border-farm-500/10 ${
                report.quarantineEnforced ? 'border-red-500/20 bg-red-950/5' : ''
              }`}
            >
              {/* Header */}
              <div className="flex justify-between items-start gap-1">
                <div>
                  <h3 className="text-base font-extrabold text-white tracking-tight">
                    {report.species} ({report.animalTag || 'Shedwide'})
                  </h3>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block mt-0.5">
                    Reported By: {report.reportedBy?.name || 'Operator'}
                  </span>
                </div>

                <div className="flex gap-2">
                  <span
                    className={`status-badge text-[9px] ${
                      report.quarantineEnforced
                        ? 'bg-red-950/30 border-red-500/20 text-red-400'
                        : 'bg-green-950/30 border-green-500/20 text-green-400'
                    }`}
                  >
                    {report.quarantineEnforced ? <ShieldX className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                    <span>{report.quarantineEnforced ? 'Quarantined' : 'No Isolation'}</span>
                  </span>

                  <span
                    className={`status-badge text-[9px] ${
                      report.severity === 'Critical'
                        ? 'bg-red-950/30 border-red-500/20 text-red-400 animate-pulse'
                        : report.severity === 'High'
                        ? 'bg-amber-950/30 border-amber-500/20 text-amber-400'
                        : 'bg-slate-950/30 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span>{report.severity}</span>
                  </span>
                </div>
              </div>

              {/* Symptoms array list */}
              <div className="text-xs">
                <span className="text-[9px] text-slate-500 uppercase font-medium block">Symptom Cluster</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {report.symptoms.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-slate-950/40 border border-slate-900 text-slate-300 font-medium text-[10px]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* AI Risk Score Diagnosis details */}
              <div className="p-4 bg-slate-950/35 border border-slate-900 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs border-b border-slate-900 pb-2">
                  <span className="text-[10px] font-bold text-farm-500 flex items-center gap-1">
                    <Brain className="w-4 h-4" />
                    <span>AI Diagnostics Review</span>
                  </span>
                  <span className="font-mono text-slate-300 font-bold">Risk: {report.aiRiskScore}%</span>
                </div>

                <p className="text-[10px] text-slate-400 leading-relaxed leading-normal">
                  {report.treatmentPlan || 'AI Diagnostics pending confirmation.'}
                </p>
              </div>

              {/* Actions Footer */}
              <div className="flex justify-between items-center border-t border-slate-900 pt-3 text-[10px] text-slate-500">
                <span>Date: {new Date(report.reportDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleQuarantine(report)}
                    className="text-[10px] font-bold text-white bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-lg shadow-sm hover:border-farm-500/35 cursor-pointer"
                  >
                    Toggle Isolation
                  </button>
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => handleDelete(report._id)}
                      className="p-1.5 rounded bg-red-950/20 border border-red-500/10 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Slide Modal: Sickness creation form */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg glass-panel p-6 shadow-2xl relative my-8"
          >
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-6 border-b border-slate-800 pb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
              <span>Report Sickness Incident</span>
            </h3>

            <form onSubmit={handleCreateReport} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Animal Tag */}
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Animal Tag (Optional)</label>
                  <input
                    type="text"
                    value={animalTag}
                    onChange={(e) => setAnimalTag(e.target.value)}
                    placeholder="e.g. PIG-0037"
                    className="w-full glass-input text-xs"
                  />
                </div>

                {/* Species */}
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Livestock Focus</label>
                  <select
                    value={species}
                    onChange={(e) => {
                      setSpecies(e.target.value);
                      setSymptoms([]); // Reset selected symptoms on swap
                    }}
                    className="w-full glass-input text-xs"
                  >
                    <option value="Pig" className="bg-slate-900 text-slate-100">Swine (Pig)</option>
                    <option value="Poultry" className="bg-slate-900 text-slate-100">Poultry</option>
                  </select>
                </div>

                {/* Severity */}
                <div className="flex flex-col sm:col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Observed Sickness Severity</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full glass-input text-xs"
                  >
                    <option value="Low" className="bg-slate-900 text-slate-100">Low Threat</option>
                    <option value="Medium" className="bg-slate-900 text-slate-100">Medium Threat</option>
                    <option value="High" className="bg-slate-900 text-slate-100">High Severity</option>
                    <option value="Critical" className="bg-slate-900 text-slate-100">Critical Outbreak Alert</option>
                  </select>
                </div>

                {/* Symptoms checklist */}
                <div className="flex flex-col sm:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Symptom Checklist (Select All)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-slate-900 bg-slate-950/20 rounded-xl p-3">
                    {(species === 'Pig' ? swineSymptoms : poultrySymptoms).map((sym) => (
                      <div
                        key={sym}
                        onClick={() => handleSymptomToggle(sym)}
                        className={`p-2.5 rounded-lg border text-left cursor-pointer transition-colors text-[10px] flex items-center gap-2 ${
                          symptoms.includes(sym)
                            ? 'border-farm-500 bg-farm-950/20 text-farm-300'
                            : 'border-slate-800 hover:border-slate-700 text-slate-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={symptoms.includes(sym)}
                          onChange={() => {}} // Controlled click handles it
                          className="w-3.5 h-3.5 pointer-events-none"
                        />
                        <span>{sym}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI predictor preview panel */}
              {aiPreviewOpen && aiPreviewData && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-slate-950 border border-farm-500/20 rounded-xl space-y-2"
                >
                  <div className="flex justify-between items-center text-xs border-b border-slate-900 pb-2">
                    <span className="text-farm-400 font-bold flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 animate-spin" />
                      <span>Rule-Based AI Estimation</span>
                    </span>
                    <span className="font-bold text-white font-mono">{aiPreviewData.riskScore}% Threat</span>
                  </div>
                  <div>
                    <h5 className="text-xs font-extrabold text-white">Result: {aiPreviewData.diseaseName}</h5>
                    <p className="text-[10px] text-slate-400 leading-normal mt-1 leading-relaxed">{aiPreviewData.plan}</p>
                  </div>
                </motion.div>
              )}

              <div className="flex justify-between items-center border-t border-slate-800 pt-4 mt-2">
                <button
                  type="button"
                  onClick={handleAIAnalyze}
                  className="glass-btn-secondary px-4 py-2.5 text-xs flex items-center gap-1.5 cursor-pointer text-farm-500 border-farm-500/20 hover:bg-farm-950/25"
                >
                  <Brain className="w-4 h-4" />
                  <span>Execute AI Diagnose</span>
                </button>

                <div className="flex gap-2">
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
                    Submit Report
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default DiseaseReportingPage;
