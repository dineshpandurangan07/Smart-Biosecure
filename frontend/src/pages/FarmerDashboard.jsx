import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api, { getErrorMessage } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import {
  Activity,
  Users,
  ShieldCheck,
  Flame,
  ClipboardCheck,
  PlusCircle,
  AlertTriangle,
  Cpu,
  RefreshCw,
  Clock,
  CheckCircle,
} from 'lucide-react';

const FarmerDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [iotData, setIotData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [pollingActive, setPollingActive] = useState(true);

  const fetchDashboardStats = async () => {
    try {
      const statsRes = await api.get('/analytics/dashboard');
      setDashboardData(statsRes.data);
      setErrorMsg('');
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
    }
  };

  const fetchIotStream = async () => {
    try {
      const iotRes = await api.get('/analytics/iot-stream');
      setIotData(iotRes.data);
    } catch (err) {
      console.error('IoT stream failed:', getErrorMessage(err));
    }
  };

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await fetchDashboardStats();
      await fetchIotStream();
      setLoading(false);
    };
    initData();
  }, []);

  // Periodic IoT telemetry polling
  useEffect(() => {
    let interval;
    if (pollingActive) {
      interval = setInterval(() => {
        fetchIotStream();
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [pollingActive]);

  const handleRefresh = async () => {
    setLoading(true);
    await fetchDashboardStats();
    await fetchIotStream();
    setLoading(false);
  };

  if (errorMsg && !dashboardData) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="glass-card max-w-md p-8 border border-red-500/20 bg-red-950/10 rounded-2xl flex flex-col items-center gap-4">
          <AlertTriangle className="w-16 h-16 text-red-500 animate-bounce" />
          <h2 className="text-xl font-bold text-white font-sans">Connection Failure</h2>
          <p className="text-sm text-slate-300">
            We encountered an issue fetching biosecurity telemetry from the core server.
          </p>
          <div className="w-full text-xs bg-slate-950/60 p-3 rounded-lg font-mono text-red-400/90 text-left border border-white/5 break-all">
            {errorMsg}
          </div>
          <button
            onClick={handleRefresh}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold rounded-lg shadow-md transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Connection</span>
          </button>
        </div>
      </div>
    );
  }

  if (loading || !dashboardData) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-farm-500 animate-spin"></div>
        </div>
      </div>
    );
  }

  const { summary, recentDiseases } = dashboardData;

  const quickActions = [
    { label: 'Add Livestock Tag', desc: 'Register pig/poultry tags', path: '/animals', icon: Activity, color: 'text-farm-400 border-farm-500/25 bg-farm-950/20' },
    { label: 'Disinfect Visitor', desc: 'Record entry spray compliance', path: '/visitors', icon: Users, color: 'text-sky-400 border-sky-500/25 bg-sky-950/20' },
    { label: 'Report Disease Incident', desc: 'Run symptoms AI analysis', path: '/diseases', icon: AlertTriangle, color: 'text-red-400 border-red-500/25 bg-red-950/20' },
    { label: 'Perform Sanitation Audit', desc: 'Log cleanliness checklists', path: '/sanitation', icon: ClipboardCheck, color: 'text-emerald-400 border-emerald-500/25 bg-emerald-950/20' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight font-sans">
            Operations Hub (Farmer Dashboard)
          </h1>
          <p className="text-xs text-slate-400">
            Enterprise Node: <span className="text-farm-500 font-semibold">{user?.farmName}</span> | Daily Field Audits
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setPollingActive(!pollingActive)}
            className={`status-badge border-slate-800 bg-slate-900 cursor-pointer ${
              pollingActive ? 'text-farm-500' : 'text-slate-500'
            }`}
          >
            <Cpu className={`w-3.5 h-3.5 ${pollingActive ? 'animate-pulse' : ''}`} />
            <span>IoT Sensors: {pollingActive ? 'Active' : 'Paused'}</span>
          </button>

          <button
            onClick={handleRefresh}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4.5 h-4.5 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Quick Stats Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4.5 flex items-center gap-3.5">
          <Activity className="w-5 h-5 text-farm-400" />
          <div>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Total Animals</span>
            <span className="text-lg font-black text-white leading-tight block">{summary.totalAnimals}</span>
          </div>
        </div>
        
        <div className="glass-card p-4.5 flex items-center gap-3.5">
          <Users className="w-5 h-5 text-sky-400" />
          <div>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Visitors Onsite</span>
            <span className="text-lg font-black text-white leading-tight block">{summary.activeVisitors}</span>
          </div>
        </div>

        <div className="glass-card p-4.5 flex items-center gap-3.5">
          <ClipboardCheck className="w-5 h-5 text-emerald-400" />
          <div>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Sanitation Index</span>
            <span className="text-lg font-black text-white leading-tight block">{summary.avgSanitationScore} / 10</span>
          </div>
        </div>

        <div className="glass-card p-4.5 flex items-center gap-3.5">
          <Flame className="w-5 h-5 text-amber-400" />
          <div>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Feed Stocks Total</span>
            <span className="text-lg font-black text-white leading-tight block">{summary.feedStockTotal} kg</span>
          </div>
        </div>
      </div>

      {/* Main Container Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions Console */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-5 space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-slate-800/80 pb-3 flex items-center gap-2">
              <PlusCircle className="w-4.5 h-4.5 text-farm-500" />
              <span>Operations Console</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickActions.map((action) => {
                const ActionIcon = action.icon;
                return (
                  <div
                    key={action.label}
                    onClick={() => navigate(action.path)}
                    className="p-5 rounded-2xl bg-slate-950/45 border border-white/5 shadow-md flex items-start gap-4.5 hover:border-farm-500/35 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer transition-all group"
                  >
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${action.color}`}>
                      <ActionIcon className="w-5 h-5 group-hover:scale-105 transition-transform" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-100 group-hover:text-white leading-tight">
                        {action.label}
                      </h4>
                      <p className="text-[10px] text-slate-400 leading-normal mt-1">{action.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* IoT sensors telemetry */}
          <div className="glass-panel p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Cpu className="w-4.5 h-4.5 text-farm-500" />
                <span>Simulated IoT Telemetry Stream</span>
              </h3>
              <span className="flex items-center gap-1.5 text-[9px] uppercase font-bold text-farm-500">
                <span className="w-2 h-2 rounded-full bg-farm-500 animate-ping"></span>
                <span>Active</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {iotData?.sensors.slice(0, 4).map((sensor) => (
                <div key={sensor.id} className="p-4 rounded-xl bg-slate-950/40 border border-white/5 flex flex-col justify-between">
                  <div className="flex justify-between items-start gap-1">
                    <span className="text-xs text-slate-300 font-semibold">{sensor.name}</span>
                    <span className="text-[8px] status-badge py-0 px-2 rounded-md bg-green-950/30 border-green-500/20 text-green-400">
                      Normal
                    </span>
                  </div>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-white">{sensor.value}</span>
                    <span className="text-xs text-slate-500 font-medium">{sensor.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Recent Diseases & Vaccine Reminders */}
        <div className="space-y-6">
          {/* Recent Disease reports */}
          <div className="glass-panel p-5 space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-slate-800/80 pb-3 flex items-center gap-2">
              <AlertTriangle className="w-4.5 h-4.5 text-red-500" />
              <span>Biosecurity Health Alerts</span>
            </h3>

            <div className="space-y-3">
              {recentDiseases.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">
                  No active sickness alerts reported.
                </div>
              ) : (
                recentDiseases.slice(0, 3).map((disease) => (
                  <div
                    key={disease._id}
                    className="p-3.5 rounded-xl bg-slate-950/40 border border-white/5 flex flex-col justify-between"
                  >
                    <div className="flex justify-between items-start gap-1">
                      <span className="text-xs font-bold text-white uppercase">{disease.species} ({disease.animalTag || 'Shedwide'})</span>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded font-bold border ${
                          disease.severity === 'Critical'
                            ? 'bg-red-950/30 border-red-500/20 text-red-400'
                            : 'bg-amber-950/30 border-amber-500/20 text-amber-400'
                        }`}
                      >
                        {disease.severity}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-400 mt-2 font-medium">
                      Symptoms: <span className="text-slate-300 font-bold">{disease.symptoms.join(', ')}</span>
                    </div>

                    <div className="text-[9px] text-slate-500 mt-2 flex items-center gap-1.5 justify-between border-t border-slate-900 pt-2">
                      <span className="font-semibold text-farm-500">AI Risk Score: {disease.aiRiskScore}%</span>
                      <span>{new Date(disease.reportDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pending Vaccinations Overdue banner */}
          {summary.overdueVaccinations > 0 && (
            <div className="rounded-2xl bg-amber-950/20 border border-amber-500/20 p-5 flex items-start gap-4">
              <Clock className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">Vaccinations Overdue!</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  There are currently **{summary.overdueVaccinations}** animal tags requiring critical vaccinations. Please complete their doses immediately in the Vaccines system.
                </p>
                <button
                  onClick={() => navigate('/vaccinations')}
                  className="mt-3 text-[10px] font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer"
                >
                  Configure Immunizations &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
