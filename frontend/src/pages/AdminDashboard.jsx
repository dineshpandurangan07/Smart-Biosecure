import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import api, { getErrorMessage } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import {
  Activity,
  Users,
  ShieldAlert,
  Flame,
  ClipboardCheck,
  TrendingUp,
  Cpu,
  RefreshCw,
  AlertOctagon,
  CheckCircle,
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';

// Register Chart.js elements
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title);

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const { fetchNotifications } = useContext(NotificationContext);
  const [dashboardData, setDashboardData] = useState(null);
  const [iotData, setIotData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pollingActive, setPollingActive] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch Dashboard Stats and initial IoT Stream
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

  // Set up periodic IoT telemetry polling (every 4 seconds for simulation)
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
    await fetchNotifications();
    setLoading(false);
  };

  if (errorMsg && !dashboardData) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="glass-card max-w-md p-8 border border-red-500/20 bg-red-950/10 rounded-2xl flex flex-col items-center gap-4">
          <AlertOctagon className="w-16 h-16 text-red-500 animate-bounce" />
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

  const { summary, healthDistribution, sanitationTimeline } = dashboardData;

  // Chart Data: Health distribution
  const healthChartData = {
    labels: ['Healthy', 'Sick', 'Quarantined', 'Treated'],
    datasets: [
      {
        data: [
          healthDistribution.healthy,
          healthDistribution.sick,
          healthDistribution.quarantined,
          healthDistribution.treated,
        ],
        backgroundColor: [
          '#16a34a', // green
          '#ef4444', // red
          '#f59e0b', // amber
          '#0ea5e9', // sky blue
        ],
        borderWidth: 0,
      },
    ],
  };

  // Chart Data: Sanitation scores timeline
  const lineChartData = {
    labels: sanitationTimeline.map(s => new Date(s.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Sanitation Cleanliness Score',
        data: sanitationTimeline.map(s => s.cleanlinessScore),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#94a3b8', font: { size: 10 } },
      },
    },
    scales: {
      y: {
        grid: { color: 'rgba(51, 65, 85, 0.2)' },
        ticks: { color: '#94a3b8' },
      },
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8' },
      },
    },
  };

  return (
    <div className="p-6 space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight font-sans">
            Biosecurity Admin Terminal
          </h1>
          <p className="text-xs text-slate-400">
            Node: <span className="text-farm-500 font-semibold">{user?.farmName}</span> | Operational Audit Panel
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
            <span>IoT Polling: {pollingActive ? 'On' : 'Off'}</span>
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
          <AlertOctagon className="w-4.5 h-4.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Animals */}
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-farm-950/40 border border-farm-500/20 flex items-center justify-center text-farm-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">Animals Logged</span>
            <span className="text-xl font-black text-white mt-0.5 block">{summary.totalAnimals}</span>
          </div>
        </div>

        {/* Card 2: Sanitation */}
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-950/40 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">Cleanliness Score</span>
            <span className="text-xl font-black text-white mt-0.5 block">{summary.avgSanitationScore} / 10</span>
          </div>
        </div>

        {/* Card 3: Disinfection Rate */}
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-sky-950/40 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">Disinfection Rate</span>
            <span className="text-xl font-black text-white mt-0.5 block">{summary.disinfectionRate}%</span>
          </div>
        </div>

        {/* Card 4: Overdue Vaccinations */}
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-950/40 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">Vaccine Overdue</span>
            <span className="text-xl font-black text-amber-500 mt-0.5 block">{summary.overdueVaccinations} Alerts</span>
          </div>
        </div>
      </div>

      {/* Main Grid: IoT Telemetry & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* IoT Live Sensors Stream: Left side span 2 */}
        <div className="glass-panel p-5 lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="w-4.5 h-4.5 text-farm-500" />
              <span>Simulated IoT Telemetry Stream</span>
            </h3>
            <span className="flex items-center gap-1.5 text-[9px] uppercase font-bold text-farm-500">
              <span className="w-2 h-2 rounded-full bg-farm-500 animate-ping"></span>
              <span>Live Feed</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {iotData?.sensors.map((sensor) => (
              <div key={sensor.id} className="p-4 rounded-xl bg-slate-950/40 border border-white/5 flex flex-col justify-between hover:border-farm-500/10 transition-colors">
                <div className="flex justify-between items-start gap-1">
                  <span className="text-xs text-slate-300 font-medium">{sensor.name}</span>
                  <span
                    className={`status-badge text-[9px] py-0.5 px-2 rounded-md ${
                      sensor.status === 'Danger'
                        ? 'bg-red-950/40 border-red-500/20 text-red-400'
                        : sensor.status === 'Warning'
                        ? 'bg-amber-950/40 border-amber-500/20 text-amber-400'
                        : 'bg-green-950/40 border-green-500/20 text-green-400'
                    }`}
                  >
                    {sensor.status}
                  </span>
                </div>

                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-white">{sensor.value}</span>
                  <span className="text-xs text-slate-500 font-medium">{sensor.unit}</span>
                </div>

                <div className="mt-2 flex justify-between items-center text-[9px] text-slate-500">
                  <span>Healthy Range: {sensor.threshold} {sensor.unit}</span>
                  <span className="font-mono text-[8px] uppercase">{sensor.id}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Combined Biosecurity Rating index */}
          {iotData && (
            <div className="mt-2 p-4 rounded-xl bg-slate-950/20 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-farm-950/20 border border-farm-500/30 flex items-center justify-center text-farm-500 font-bold text-sm">
                  {iotData.biosecurityScore}%
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Composite Biosecurity Rating</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Aggregate safety index based on current parameters</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-farm-500 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Excellent
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Circular health chart: Right side span 1 */}
        <div className="glass-panel p-5 space-y-4 flex flex-col">
          <h3 className="text-sm font-bold text-white border-b border-slate-800/80 pb-3 flex items-center gap-2">
            <Activity className="w-4.5 h-4.5 text-farm-500" />
            <span>Livestock Health Audit</span>
          </h3>

          <div className="flex-1 flex items-center justify-center min-h-[220px]">
            <Doughnut data={healthChartData} options={{ responsive: true, cutout: '70%', plugins: { legend: { display: false } } }} />
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4 text-[10px]">
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded bg-green-600 block"></span>
              <span>Healthy ({healthDistribution.healthy})</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded bg-red-500 block"></span>
              <span>Sick ({healthDistribution.sick})</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded bg-amber-500 block"></span>
              <span>Quarantine ({healthDistribution.quarantined})</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded bg-sky-500 block"></span>
              <span>Treated ({healthDistribution.treated})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Line Graph */}
      <div className="grid grid-cols-1 gap-6">
        <div className="glass-panel p-5 space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-800/80 pb-3 flex items-center gap-2">
            <TrendingUp className="w-4.5 h-4.5 text-farm-500" />
            <span>Farm Cleanliness Scoring Trend (Sanitation Audits)</span>
          </h3>
          <div className="h-64 chart-container">
            <Line data={lineChartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
