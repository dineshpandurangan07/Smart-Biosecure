import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api, { getErrorMessage } from '../services/api';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title
} from 'chart.js';
import { Doughnut, Line, Bar } from 'react-chartjs-2';
import {
  BarChart3,
  TrendingUp,
  Activity,
  Users,
  Flame,
  Download,
  RefreshCw,
  AlertTriangle,
  Award
} from 'lucide-react';

// Register ChartJS elements
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title
);

const AnalyticsPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [feedData, setFeedData] = useState([]);
  const [visitorData, setVisitorData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const [statsRes, feedRes, visitorRes] = await Promise.all([
        api.get('/analytics/dashboard'),
        api.get('/feed'),
        api.get('/visitors')
      ]);

      setDashboardData(statsRes.data);
      setFeedData(feedRes.data);
      setVisitorData(visitorRes.data);
      setErrorMsg('');
      setLoading(false);
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const handleRefresh = () => {
    fetchAnalyticsData();
  };

  const handleExport = () => {
    if (!dashboardData) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      dashboard: dashboardData,
      feedInventory: feedData,
      visitors: visitorData,
      exportedAt: new Date().toISOString()
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `biosecure_farm_analytics_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-farm-500 animate-spin"></div>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="p-6 space-y-6">
        <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4.5 h-4.5" />
          <span>{errorMsg}</span>
        </div>
        <button onClick={handleRefresh} className="glass-btn-primary flex items-center gap-2 text-xs">
          <RefreshCw className="w-4 h-4" />
          <span>Retry Loading</span>
        </button>
      </div>
    );
  }

  // --- 1. Herd Health Doughnut Configuration ---
  const healthDistribution = dashboardData?.healthDistribution || { healthy: 100, sick: 0, quarantined: 0, treated: 0 };
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
          'rgba(22, 163, 74, 0.85)',  // green-600
          'rgba(239, 68, 68, 0.85)',   // red-500
          'rgba(245, 158, 11, 0.85)',  // amber-500
          'rgba(14, 165, 233, 0.85)',  // sky-500
        ],
        borderColor: 'rgba(15, 23, 42, 0.85)',
        borderWidth: 2,
      },
    ],
  };

  // --- 2. Sanitation Scores Line Configuration ---
  const sanitationTimeline = dashboardData?.sanitationTimeline || [];
  const lineChartData = {
    labels: sanitationTimeline.map(s => new Date(s.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Sanitation Score (1-10)',
        data: sanitationTimeline.map(s => s.cleanlinessScore),
        borderColor: '#10b981', // emerald-500
        backgroundColor: 'rgba(16, 185, 129, 0.08)',
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#22c55e',
        pointBorderColor: '#ffffff',
        pointHoverRadius: 6,
      },
    ],
  };

  // --- 3. Feed Stocks Bar Chart Configuration ---
  // Group feed quantity by species
  const feedBySpecies = feedData.reduce((acc, curr) => {
    if (curr.qualityCheck) {
      acc[curr.species] = (acc[curr.species] || 0) + curr.quantityKg;
    }
    return acc;
  }, { Pig: 0, Poultry: 0, General: 0 });

  const feedChartData = {
    labels: ['Swine (Pigs) Feed', 'Poultry Feed', 'General Purpose'],
    datasets: [
      {
        label: 'Stock Quantity (kg)',
        data: [feedBySpecies.Pig, feedBySpecies.Poultry, feedBySpecies.General],
        backgroundColor: [
          'rgba(245, 158, 11, 0.8)', // amber
          'rgba(14, 165, 233, 0.8)', // sky
          'rgba(16, 185, 129, 0.8)', // emerald
        ],
        borderRadius: 8,
        borderWidth: 0,
      },
    ],
  };

  // --- 4. Visitor Entry Volumes over past 7 days ---
  // Group visitors by date
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const visitorCountsByDate = last7Days.reduce((acc, date) => {
    acc[date] = 0;
    return acc;
  }, {});

  visitorData.forEach(v => {
    const vDate = new Date(v.entryTime).toISOString().split('T')[0];
    if (visitorCountsByDate[vDate] !== undefined) {
      visitorCountsByDate[vDate]++;
    }
  });

  const visitorChartData = {
    labels: last7Days.map(d => new Date(d).toLocaleDateString([], { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Visitor Entries',
        data: last7Days.map(d => visitorCountsByDate[d]),
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        borderColor: '#22c55e',
        borderWidth: 2,
        borderRadius: 4,
      },
    ],
  };

  // Global chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#94a3b8',
          font: { size: 11, family: 'Inter' }
        }
      },
      tooltip: {
        padding: 12,
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#e2e8f0',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1
      }
    },
    scales: {
      y: {
        grid: { color: 'rgba(51, 65, 85, 0.15)' },
        ticks: { color: '#94a3b8', font: { size: 10 } },
      },
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { size: 10 } },
      },
    },
  };

  return (
    <div className="p-6 space-y-6">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-5">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight font-sans flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-farm-500" />
            <span>Farm Analytics & Intelligence Center</span>
          </h1>
          <p className="text-xs text-slate-400">
            Consolidated biosecurity scoreboards, health summaries, and logistics inventory graphs
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className="glass-btn-secondary py-2.5 px-4 text-xs flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Sync Data</span>
          </button>
          
          <button
            onClick={handleExport}
            className="glass-btn-primary py-2.5 px-4 text-xs flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Export Analytics</span>
          </button>
        </div>
      </div>

      {/* Overview summaries */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-card p-4 flex items-center gap-4 border-l-4 border-l-green-500">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Herd Health Ratio</span>
            <span className="text-lg font-bold text-white mt-0.5 block">
              {Math.round((healthDistribution.healthy / Math.max(1, (healthDistribution.healthy + healthDistribution.sick + healthDistribution.quarantined + healthDistribution.treated))) * 100)}% Stable
            </span>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-4 border-l-4 border-l-emerald-500">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Average Cleanliness Index</span>
            <span className="text-lg font-bold text-white mt-0.5 block">{dashboardData?.summary?.avgSanitationScore || 8.5} / 10</span>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-4 border-l-4 border-l-amber-500">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Disinfected Visitors</span>
            <span className="text-lg font-bold text-white mt-0.5 block">{dashboardData?.summary?.disinfectionRate || 100}% Compliance</span>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Graph 1: Animal Health Doughnut */}
        <div className="glass-panel p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800/80 pb-3">
            <Activity className="w-4.5 h-4.5 text-farm-500" />
            <span>Livestock Health Audit Breakdown</span>
          </h3>
          <div className="h-64 flex items-center justify-center relative">
            <div className="w-56 h-56">
              <Doughnut
                data={healthChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  cutout: '72%',
                  plugins: {
                    legend: {
                      display: true,
                      position: 'bottom',
                      labels: { color: '#94a3b8', boxWidth: 12, font: { size: 10 } }
                    }
                  }
                }}
              />
            </div>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-[10px] uppercase font-bold text-slate-500">Total Count</span>
              <span className="text-2xl font-black text-white">
                {healthDistribution.healthy + healthDistribution.sick + healthDistribution.quarantined + healthDistribution.treated}
              </span>
            </div>
          </div>
        </div>

        {/* Graph 2: Sanitation score line chart */}
        <div className="glass-panel p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800/80 pb-3">
            <TrendingUp className="w-4.5 h-4.5 text-farm-500" />
            <span>Biosecurity Cleanliness Scoring Trend</span>
          </h3>
          <div className="h-64 chart-container">
            {sanitationTimeline.length > 0 ? (
              <Line data={lineChartData} options={chartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                No sanitation timelines available. Log reports to render.
              </div>
            )}
          </div>
        </div>

        {/* Graph 3: Feed Stock quantities comparison */}
        <div className="glass-panel p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800/80 pb-3">
            <Flame className="w-4.5 h-4.5 text-farm-500" />
            <span>Remaining Feed Stock by Species</span>
          </h3>
          <div className="h-64 chart-container">
            {feedData.length > 0 ? (
              <Bar data={feedChartData} options={chartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                No feed stock logs available.
              </div>
            )}
          </div>
        </div>

        {/* Graph 4: Visitor checks weekly logs */}
        <div className="glass-panel p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800/80 pb-3">
            <Users className="w-4.5 h-4.5 text-farm-500" />
            <span>7-Day Visitor Volume Logs</span>
          </h3>
          <div className="h-64 chart-container">
            {visitorData.length > 0 ? (
              <Bar
                data={visitorChartData}
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    legend: { display: false }
                  }
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                No visitor data available.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
