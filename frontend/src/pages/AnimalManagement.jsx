import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import api, { getErrorMessage } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import {
  Activity,
  Plus,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Trash2,
  Edit2,
  X,
} from 'lucide-react';

const AnimalManagement = () => {
  const { user } = useContext(AuthContext);
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // Form State
  const [tagId, setTagId] = useState('');
  const [species, setSpecies] = useState('Pig');
  const [breed, setBreed] = useState('');
  const [ageWeeks, setAgeWeeks] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [healthStatus, setHealthStatus] = useState('Healthy');
  const [weight, setWeight] = useState('');
  const [statusNotes, setStatusNotes] = useState('');

  // Query Animals
  const fetchAnimals = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/animals', {
        params: {
          search,
          species: speciesFilter,
          healthStatus: statusFilter,
        },
      });
      setAnimals(data);
      setErrorMsg('');
      setLoading(false);
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnimals();
  }, [search, speciesFilter, statusFilter]);

  const resetForm = () => {
    setTagId('');
    setSpecies('Pig');
    setBreed('');
    setAgeWeeks('');
    setHouseNumber('');
    setHealthStatus('Healthy');
    setWeight('');
    setStatusNotes('');
    setSelectedId(null);
    setEditMode(false);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleOpenEditModal = (animal) => {
    setSelectedId(animal._id);
    setTagId(animal.tagId);
    setSpecies(animal.species);
    setBreed(animal.breed);
    setAgeWeeks(animal.ageWeeks);
    setHouseNumber(animal.houseNumber);
    setHealthStatus(animal.healthStatus);
    setWeight(animal.weight);
    setStatusNotes(animal.statusNotes || '');
    setEditMode(true);
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!tagId || !breed || !ageWeeks || !houseNumber || !weight) {
      setErrorMsg('Please populate all required parameters');
      return;
    }

    try {
      if (editMode) {
        // Update
        await api.put(`/animals/${selectedId}`, {
          breed,
          ageWeeks,
          houseNumber,
          healthStatus,
          weight,
          statusNotes,
        });
      } else {
        // Create
        await api.post('/animals', {
          tagId,
          species,
          breed,
          ageWeeks,
          houseNumber,
          healthStatus,
          weight,
          statusNotes,
        });
      }
      setModalOpen(false);
      resetForm();
      fetchAnimals();
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Confirm deletion of this livestock tag? This action removes all records permanently.')) {
      try {
        await api.delete(`/animals/${id}`);
        fetchAnimals();
      } catch (err) {
        setErrorMsg(getErrorMessage(err));
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Healthy':
        return {
          bg: 'bg-green-950/30 border-green-500/20 text-green-400',
          icon: CheckCircle,
        };
      case 'Sick':
        return {
          bg: 'bg-red-950/30 border-red-500/20 text-red-400',
          icon: XCircle,
        };
      case 'Quarantined':
        return {
          bg: 'bg-amber-950/30 border-amber-500/20 text-amber-400',
          icon: AlertTriangle,
        };
      default:
        return {
          bg: 'bg-sky-950/30 border-sky-500/20 text-sky-400',
          icon: HelpCircle,
        };
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-5">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight font-sans">
            Livestock Tracking & Records
          </h1>
          <p className="text-xs text-slate-400">
            Register and monitor pigs and poultry tags
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="glass-btn-primary py-2.5 px-5 text-xs flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Register Livestock Tag</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4.5 h-4.5" />
          <span>{errorMsg}</span>
        </div>
      )}

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
            placeholder="Search Tag ID or Breed..."
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
            <option value="Pig" className="bg-slate-900 text-slate-100">Swine (Pigs)</option>
            <option value="Poultry" className="bg-slate-900 text-slate-100">Poultry</option>
          </select>
        </div>

        {/* Status selector */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
            <Filter className="w-4 h-4" />
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-9 glass-input text-xs"
          >
            <option value="" className="bg-slate-900 text-slate-100">All Clinical Status</option>
            <option value="Healthy" className="bg-slate-900 text-slate-100">Healthy</option>
            <option value="Sick" className="bg-slate-900 text-slate-100">Sick</option>
            <option value="Quarantined" className="bg-slate-900 text-slate-100">Quarantined</option>
            <option value="Treated" className="bg-slate-900 text-slate-100">Treated</option>
          </select>
        </div>
      </div>

      {/* Grid of Animals */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 rounded-full border-2 border-slate-800 border-t-farm-500 animate-spin"></div>
        </div>
      ) : animals.length === 0 ? (
        <div className="glass-panel p-10 text-center text-slate-500">
          No livestock records matching current filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {animals.map((animal) => {
            const badge = getStatusBadge(animal.healthStatus);
            const BadgeIcon = badge.icon;
            return (
              <motion.div
                key={animal._id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="glass-card p-5 space-y-4 hover:border-farm-500/20"
              >
                {/* Header Tag */}
                <div className="flex justify-between items-start gap-1">
                  <div>
                    <h3 className="text-base font-extrabold text-white tracking-tight">{animal.tagId}</h3>
                    <span className="text-[10px] text-slate-500 font-semibold uppercase">{animal.species} &bull; {animal.breed}</span>
                  </div>
                  <span className={`status-badge text-[9px] ${badge.bg}`}>
                    <BadgeIcon className="w-3 h-3" />
                    <span>{animal.healthStatus}</span>
                  </span>
                </div>

                {/* Info block */}
                <div className="grid grid-cols-3 gap-2 bg-slate-950/20 border border-slate-900 rounded-xl p-3.5 text-center text-xs">
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase font-medium">Age</span>
                    <span className="text-xs font-bold text-slate-200 mt-1 block">{animal.ageWeeks} wks</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase font-medium">Weight</span>
                    <span className="text-xs font-bold text-slate-200 mt-1 block">{animal.weight} kg</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase font-medium">Shed / Coop</span>
                    <span className="text-xs font-bold text-slate-200 mt-1 block truncate">{animal.houseNumber}</span>
                  </div>
                </div>

                {/* Description */}
                {animal.statusNotes && (
                  <p className="text-[10px] text-slate-400 bg-slate-950/20 p-2.5 rounded-lg border border-slate-900/60 leading-relaxed italic">
                    Note: "{animal.statusNotes}"
                  </p>
                )}

                {/* Action buttons */}
                <div className="flex justify-between items-center border-t border-slate-900 pt-3">
                  <span className="text-[9px] text-slate-500">
                    Logged: {new Date(animal.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenEditModal(animal)}
                      className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {user?.role === 'admin' && (
                      <button
                        onClick={() => handleDelete(animal._id)}
                        className="p-2 rounded-lg bg-red-950/20 border border-red-500/10 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Slide Modal to add/edit */}
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
              {editMode ? `Edit Livestock Tag [${tagId}]` : 'Register New Livestock Tag'}
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Tag ID */}
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Tag ID *</label>
                  <input
                    type="text"
                    value={tagId}
                    onChange={(e) => setTagId(e.target.value)}
                    placeholder="e.g. PIG-0044"
                    disabled={editMode}
                    className="w-full glass-input text-xs"
                    required
                  />
                </div>

                {/* Species */}
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Species</label>
                  <select
                    value={species}
                    onChange={(e) => setSpecies(e.target.value)}
                    disabled={editMode}
                    className="w-full glass-input text-xs"
                  >
                    <option value="Pig" className="bg-slate-900 text-slate-100">Swine (Pig)</option>
                    <option value="Poultry" className="bg-slate-900 text-slate-100">Poultry</option>
                  </select>
                </div>

                {/* Breed */}
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Breed *</label>
                  <input
                    type="text"
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    placeholder="e.g. Landrace / Cobb 500"
                    className="w-full glass-input text-xs"
                    required
                  />
                </div>

                {/* Age */}
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Age (Weeks) *</label>
                  <input
                    type="number"
                    value={ageWeeks}
                    onChange={(e) => setAgeWeeks(e.target.value)}
                    placeholder="e.g. 12"
                    className="w-full glass-input text-xs"
                    required
                  />
                </div>

                {/* Housing */}
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Shed / Coop Location *</label>
                  <input
                    type="text"
                    value={houseNumber}
                    onChange={(e) => setHouseNumber(e.target.value)}
                    placeholder="e.g. Shed A / Coop 3"
                    className="w-full glass-input text-xs"
                    required
                  />
                </div>

                {/* Weight */}
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Weight (kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="e.g. 45.5"
                    className="w-full glass-input text-xs"
                    required
                  />
                </div>

                {/* Health Status */}
                <div className="flex flex-col sm:col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Clinical Health Status</label>
                  <select
                    value={healthStatus}
                    onChange={(e) => setHealthStatus(e.target.value)}
                    className="w-full glass-input text-xs"
                  >
                    <option value="Healthy" className="bg-slate-900 text-slate-100 font-sans">Healthy</option>
                    <option value="Sick" className="bg-slate-900 text-slate-100 font-sans">Sick</option>
                    <option value="Quarantined" className="bg-slate-900 text-slate-100 font-sans">Quarantined</option>
                    <option value="Treated" className="bg-slate-900 text-slate-100 font-sans">Treated</option>
                  </select>
                </div>

                {/* Notes */}
                <div className="flex flex-col sm:col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Status & Medical Notes</label>
                  <textarea
                    value={statusNotes}
                    onChange={(e) => setStatusNotes(e.target.value)}
                    placeholder="Describe clinical symptoms or treatments logged..."
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
                  {editMode ? 'Update Record' : 'Register Tag'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AnimalManagement;
