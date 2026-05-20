import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import api, { getErrorMessage } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import {
  Flame,
  Plus,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Thermometer,
  Trash2,
  Calendar,
  Layers,
  Archive,
  ArrowDownRight,
  TrendingDown,
  X
} from 'lucide-react';

const FeedManagementPage = () => {
  const { user } = useContext(AuthContext);
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Filters & Search
  const [search, setSearch] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('');
  const [qualityFilter, setQualityFilter] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  
  // Form State
  const [feedType, setFeedType] = useState('Starter Mash');
  const [species, setSpecies] = useState('Pig');
  const [quantityKg, setQuantityKg] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().split('T')[0]);
  const [qualityCheck, setQualityCheck] = useState(true);
  const [storageTemp, setStorageTemp] = useState('20');
  const [notes, setNotes] = useState('');

  const fetchFeeds = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/feed');
      setFeeds(data);
      setErrorMsg('');
      setLoading(false);
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeds();
  }, []);

  const resetForm = () => {
    setFeedType('Starter Mash');
    setSpecies('Pig');
    setQuantityKg('');
    setBatchNumber(`BAT-${Math.floor(1000 + Math.random() * 9000)}`);
    setDeliveryDate(new Date().toISOString().split('T')[0]);
    setQualityCheck(true);
    setStorageTemp('20');
    setNotes('');
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!feedType || !quantityKg || !batchNumber || !deliveryDate) {
      setErrorMsg('Please populate all required parameters');
      return;
    }

    try {
      await api.post('/feed', {
        feedType,
        species,
        quantityKg: Number(quantityKg),
        batchNumber,
        deliveryDate,
        qualityCheck,
        storageTemp: Number(storageTemp),
        notes,
      });
      setModalOpen(false);
      resetForm();
      fetchFeeds();
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Confirm deletion of this feed batch? This action is permanent.')) {
      try {
        await api.delete(`/feed/${id}`);
        fetchFeeds();
      } catch (err) {
        setErrorMsg(getErrorMessage(err));
      }
    }
  };

  // Filter feeds client-side (or we can let the backend do it, but client-side is immediate and beautiful)
  const filteredFeeds = feeds.filter(item => {
    const matchesSearch = item.feedType.toLowerCase().includes(search.toLowerCase()) || 
                          item.batchNumber.toLowerCase().includes(search.toLowerCase());
    const matchesSpecies = speciesFilter ? item.species === speciesFilter : true;
    const matchesQuality = qualityFilter ? (qualityFilter === 'Pass' ? item.qualityCheck : !item.qualityCheck) : true;
    return matchesSearch && matchesSpecies && matchesQuality;
  });

  // Analytics for Feed
  const totalStockKg = filteredFeeds.reduce((acc, curr) => curr.qualityCheck ? acc + curr.quantityKg : acc, 0);
  const pigFeedKg = filteredFeeds.filter(f => f.species === 'Pig' && f.qualityCheck).reduce((acc, curr) => acc + curr.quantityKg, 0);
  const poultryFeedKg = filteredFeeds.filter(f => f.species === 'Poultry' && f.qualityCheck).reduce((acc, curr) => acc + curr.quantityKg, 0);
  const rejections = filteredFeeds.filter(f => !f.qualityCheck).length;

  return (
    <div className="p-6 space-y-6">
      {/* Title Block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-5">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight font-sans">
            Feed Inventory & Logistics
          </h1>
          <p className="text-xs text-slate-400">
            Monitor and record dietary feeds stock levels and compliance checks
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="glass-btn-primary py-2.5 px-5 text-xs flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Record Feed Batch</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4.5 h-4.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Analytics KPI widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Archive className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Total Active Stock</span>
            <span className="text-lg font-bold text-white mt-0.5 block">{totalStockKg.toLocaleString()} kg</span>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Pig Feed Stock</span>
            <span className="text-lg font-bold text-white mt-0.5 block">{pigFeedKg.toLocaleString()} kg</span>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Poultry Feed Stock</span>
            <span className="text-lg font-bold text-white mt-0.5 block">{poultryFeedKg.toLocaleString()} kg</span>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${rejections > 0 ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-green-500/10 border border-green-500/20 text-green-400'}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Rejected Batches</span>
            <span className="text-lg font-bold text-white mt-0.5 block">{rejections} batches</span>
          </div>
        </div>
      </div>

      {/* Stock Levels Visualization */}
      <div className="glass-panel p-5 space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Flame className="w-4 h-4 text-farm-500" />
          <span>Real-time Feed Storage Tanks Capacity</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Swine Silo */}
          <div className="bg-slate-950/25 border border-slate-900 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-200">Silo 1: Pig Diet Feeds</span>
              <span className="text-slate-400">{Math.round((pigFeedKg / 5000) * 100)}% ({pigFeedKg} / 5,000 kg)</span>
            </div>
            <div className="w-full bg-slate-950 border border-slate-800 rounded-full h-3.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-amber-600 to-amber-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (pigFeedKg / 5000) * 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500 italic">Recommended restock trigger level is 1,200 kg (24%).</p>
          </div>

          {/* Poultry Silo */}
          <div className="bg-slate-950/25 border border-slate-900 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-200">Silo 2: Poultry Diet Feeds</span>
              <span className="text-slate-400">{Math.round((poultryFeedKg / 4000) * 100)}% ({poultryFeedKg} / 4,000 kg)</span>
            </div>
            <div className="w-full bg-slate-950 border border-slate-800 rounded-full h-3.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-sky-600 to-sky-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (poultryFeedKg / 4000) * 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500 italic">Recommended restock trigger level is 1,000 kg (25%).</p>
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
            placeholder="Search Batch ID or Feed Type..."
            className="w-full pl-10 glass-input text-xs"
          />
        </div>

        {/* Species selector */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
            <Filter className="w-4 h-4" />
          </span>
          <select
            value={speciesFilter}
            onChange={(e) => setSpeciesFilter(e.target.value)}
            className="w-full pl-9 glass-input text-xs"
          >
            <option value="" className="bg-slate-900 text-slate-100">All Species</option>
            <option value="Pig" className="bg-slate-900 text-slate-100">Pigs</option>
            <option value="Poultry" className="bg-slate-900 text-slate-100">Poultry</option>
            <option value="General" className="bg-slate-900 text-slate-100">General</option>
          </select>
        </div>

        {/* Quality status selector */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
            <Filter className="w-4 h-4" />
          </span>
          <select
            value={qualityFilter}
            onChange={(e) => setQualityFilter(e.target.value)}
            className="w-full pl-9 glass-input text-xs"
          >
            <option value="" className="bg-slate-900 text-slate-100">Quality Checks</option>
            <option value="Pass" className="bg-slate-900 text-slate-100">Compliance Passed</option>
            <option value="Fail" className="bg-slate-900 text-slate-100">Compliance Rejected</option>
          </select>
        </div>
      </div>

      {/* Grid of Feed Logs */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 rounded-full border-2 border-slate-800 border-t-farm-500 animate-spin"></div>
        </div>
      ) : filteredFeeds.length === 0 ? (
        <div className="glass-panel p-10 text-center text-slate-500">
          No feed inventory logs match the current query filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredFeeds.map((feed) => (
            <motion.div
              key={feed._id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`glass-card p-5 space-y-4 hover:border-farm-500/20 ${!feed.qualityCheck ? 'border-red-500/10' : ''}`}
            >
              {/* Header block */}
              <div className="flex justify-between items-start gap-1">
                <div>
                  <h3 className="text-base font-extrabold text-white tracking-tight">{feed.feedType}</h3>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">{feed.species} Diet &bull; {feed.batchNumber}</span>
                </div>
                {feed.qualityCheck ? (
                  <span className="status-badge text-[9px] bg-green-950/30 border-green-500/20 text-green-400">
                    <CheckCircle className="w-3 h-3" />
                    <span>Safe</span>
                  </span>
                ) : (
                  <span className="status-badge text-[9px] bg-red-950/30 border-red-500/20 text-red-400">
                    <XCircle className="w-3 h-3" />
                    <span>Rejected</span>
                  </span>
                )}
              </div>

              {/* Feed metrics */}
              <div className="grid grid-cols-3 gap-2 bg-slate-950/20 border border-slate-900 rounded-xl p-3 text-center text-xs">
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase font-medium">Quantity</span>
                  <span className="text-xs font-bold text-slate-200 mt-1 block">{feed.quantityKg.toLocaleString()} kg</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase font-medium">Temp</span>
                  <span className="text-xs font-bold text-slate-200 mt-1 block flex items-center justify-center gap-0.5">
                    <Thermometer className="w-3.5 h-3.5 text-orange-400" />
                    {feed.storageTemp || 20}°C
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase font-medium">Delivered</span>
                  <span className="text-xs font-bold text-slate-200 mt-1 block truncate">
                    {new Date(feed.deliveryDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                  </span>
                </div>
              </div>

              {/* Notes */}
              {feed.notes && (
                <p className="text-[10px] text-slate-400 bg-slate-950/20 p-2.5 rounded-lg border border-slate-900/60 leading-relaxed italic">
                  Note: "{feed.notes}"
                </p>
              )}

              {/* Delete button (Admin only) */}
              <div className="flex justify-between items-center border-t border-slate-900 pt-3">
                <span className="text-[9px] text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-600" />
                  Audit: {new Date(feed.createdAt || new Date()).toLocaleDateString()}
                </span>
                {user?.role === 'admin' && (
                  <button
                    onClick={() => handleDelete(feed._id)}
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

      {/* Record Feed Batch Modal */}
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
              Record Feed Inventory Delivery
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Feed Type */}
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Feed Blend Type *</label>
                  <input
                    type="text"
                    value={feedType}
                    onChange={(e) => setFeedType(e.target.value)}
                    placeholder="e.g. Grower Pellets"
                    className="w-full glass-input text-xs"
                    required
                  />
                </div>

                {/* Target Species */}
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Target Species</label>
                  <select
                    value={species}
                    onChange={(e) => setSpecies(e.target.value)}
                    className="w-full glass-input text-xs"
                  >
                    <option value="Pig" className="bg-slate-900 text-slate-100">Swine (Pig)</option>
                    <option value="Poultry" className="bg-slate-900 text-slate-100">Poultry</option>
                    <option value="General" className="bg-slate-900 text-slate-100">General Purpose</option>
                  </select>
                </div>

                {/* Batch Code */}
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Batch Code *</label>
                  <input
                    type="text"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    placeholder="e.g. BAT-PIG-4412"
                    className="w-full glass-input text-xs"
                    required
                  />
                </div>

                {/* Quantity */}
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Quantity (kg) *</label>
                  <input
                    type="number"
                    value={quantityKg}
                    onChange={(e) => setQuantityKg(e.target.value)}
                    placeholder="e.g. 1500"
                    className="w-full glass-input text-xs"
                    required
                  />
                </div>

                {/* Storage Temperature */}
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Storage Temperature (°C)</label>
                  <input
                    type="number"
                    value={storageTemp}
                    onChange={(e) => setStorageTemp(e.target.value)}
                    placeholder="e.g. 20"
                    className="w-full glass-input text-xs"
                  />
                </div>

                {/* Delivery Date */}
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Delivery Date *</label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full glass-input text-xs text-slate-200"
                    required
                  />
                </div>

                {/* Quality Check Compliance */}
                <div className="flex flex-col sm:col-span-2 space-y-2 py-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Biosecurity & Quality Compliance Checks</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="qualityCheck"
                      checked={qualityCheck}
                      onChange={(e) => setQualityCheck(e.target.checked)}
                      className="w-4.5 h-4.5 accent-farm-500 rounded cursor-pointer"
                    />
                    <label htmlFor="qualityCheck" className="text-xs text-slate-300 font-medium select-none cursor-pointer">
                      Passed moisture and container pest-infestation safety audit.
                    </label>
                  </div>
                </div>

                {/* Notes */}
                <div className="flex flex-col sm:col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Delivery Details & Feed Sourcing Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Log details like supplier brand, transport conditions, or silo destination..."
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
                  Record Delivery
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default FeedManagementPage;
