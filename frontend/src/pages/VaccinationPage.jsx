import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import api, { getErrorMessage } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import {
  Syringe,
  Plus,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  UserCheck,
  Search,
  Filter,
  X,
  Trash2,
} from 'lucide-react';

const VaccinationPage = () => {
  const { user } = useContext(AuthContext);
  const { fetchNotifications } = useContext(NotificationContext);
  const [vaccinations, setVaccinations] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Search & Filters
  const [searchTag, setSearchTag] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal controls
  const [modalOpen, setModalOpen] = useState(false);
  const [administerModalOpen, setAdministerModalOpen] = useState(false);
  const [selectedVaccine, setSelectedVaccine] = useState(null);

  // Form: Create schedule
  const [animalTag, setAnimalTag] = useState('');
  const [vaccineName, setVaccineName] = useState('');
  const [diseaseTargeted, setDiseaseTargeted] = useState('');
  const [doseNumber, setDoseNumber] = useState('1');
  const [nextDueDate, setNextDueDate] = useState('');

  // Form: Mark administered
  const [administeredBy, setAdministeredBy] = useState('');
  const [dateAdministered, setDateAdministered] = useState('');

  const fetchVaccinations = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/vaccinations', {
        params: {
          status: statusFilter,
          animalTag: searchTag,
        },
      });
      setVaccinations(data);

      // Fetch active reminders
      const reminderRes = await api.get('/vaccinations/reminders');
      setReminders(reminderRes.data);

      setErrorMsg('');
      setLoading(false);
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVaccinations();
  }, [searchTag, statusFilter]);

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!animalTag || !vaccineName || !diseaseTargeted || !nextDueDate) {
      setErrorMsg('Please specify all parameters');
      return;
    }

    try {
      await api.post('/vaccinations', {
        animalTag: animalTag.trim().toUpperCase(),
        vaccineName,
        diseaseTargeted,
        doseNumber,
        nextDueDate,
      });

      setModalOpen(false);
      setAnimalTag('');
      setVaccineName('');
      setDiseaseTargeted('');
      setDoseNumber('1');
      setNextDueDate('');
      
      fetchVaccinations();
      fetchNotifications();
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
    }
  };

  const handleOpenAdminister = (vac) => {
    setSelectedVaccine(vac);
    setAdministeredBy(user.name);
    setDateAdministered(new Date().toISOString().split('T')[0]);
    setAdministerModalOpen(true);
  };

  const handleMarkAdministered = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/vaccinations/${selectedVaccine._id}`, {
        status: 'Administered',
        administeredBy,
        dateAdministered,
      });

      setAdministerModalOpen(false);
      fetchVaccinations();
      fetchNotifications();
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this vaccination log record?')) {
      try {
        await api.delete(`/vaccinations/${id}`);
        fetchVaccinations();
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
            Immunizations & Vaccinations
          </h1>
          <p className="text-xs text-slate-400">
            Enforce immunity routines and track scheduled vaccine lists
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="glass-btn-primary py-2.5 px-5 text-xs flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Vaccination Dose</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4.5 h-4.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Reminder Alerts System banner */}
      {reminders.filter(r => r.status === 'Overdue').length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/20 flex items-start gap-4"
        >
          <Clock className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">Critical Reminders: Vaccine Doses Overdue</h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              The following animal tags are past their scheduled immunization threshold. Complete their doses as soon as possible to preserve herd immunity:
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {reminders.filter(r => r.status === 'Overdue').map(r => (
                <span key={r._id} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-900/35 border border-amber-500/20 text-amber-300">
                  {r.animalTag}: {r.vaccineName} (Due: {new Date(r.nextDueDate).toLocaleDateString()})
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Filter and Search */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
        {/* Search Animal */}
        <div className="relative sm:col-span-2">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchTag}
            onChange={(e) => setSearchTag(e.target.value)}
            placeholder="Search by Animal Tag ID..."
            className="w-full pl-10 glass-input text-xs"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
            <Filter className="w-4 h-4" />
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-9 glass-input text-xs"
          >
            <option value="" className="bg-slate-900 text-slate-100">All Schedules Status</option>
            <option value="Scheduled" className="bg-slate-900 text-slate-100">Scheduled</option>
            <option value="Administered" className="bg-slate-900 text-slate-100">Administered</option>
            <option value="Overdue" className="bg-slate-900 text-slate-100">Overdue</option>
          </select>
        </div>
      </div>

      {/* Grid of vaccinations */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 rounded-full border-2 border-slate-800 border-t-farm-500 animate-spin"></div>
        </div>
      ) : vaccinations.length === 0 ? (
        <div className="glass-panel p-10 text-center text-slate-500">
          No immunization schedules matches criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {vaccinations.map((vac) => (
            <motion.div
              key={vac._id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`glass-card p-5 space-y-4 hover:border-farm-500/10 ${
                vac.status === 'Overdue' ? 'border-amber-500/15 bg-amber-950/5' : ''
              }`}
            >
              <div className="flex justify-between items-start gap-1">
                <div>
                  <h3 className="text-base font-extrabold text-white tracking-tight">{vac.vaccineName}</h3>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block mt-0.5">
                    Target: {vac.diseaseTargeted} &bull; Dose: {vac.doseNumber}
                  </span>
                </div>

                <span
                  className={`status-badge text-[9px] ${
                    vac.status === 'Administered'
                      ? 'bg-green-950/30 border-green-500/20 text-green-400'
                      : vac.status === 'Overdue'
                      ? 'bg-amber-950/30 border-amber-500/20 text-amber-400'
                      : 'bg-slate-950/30 border-slate-800 text-slate-400'
                  }`}
                >
                  {vac.status === 'Administered' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  <span>{vac.status}</span>
                </span>
              </div>

              {/* Tag Details link */}
              <div className="p-3 bg-slate-950/20 border border-slate-900 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase font-medium">Animal Tag</span>
                  <span className="text-xs font-bold text-slate-200 block mt-0.5">{vac.animalTag}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase font-medium">
                    {vac.status === 'Administered' ? 'Administered' : 'Next Due'}
                  </span>
                  <span className="text-xs font-bold text-slate-200 block mt-0.5">
                    {vac.status === 'Administered'
                      ? new Date(vac.dateAdministered).toLocaleDateString()
                      : new Date(vac.nextDueDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Admin details */}
              {vac.status === 'Administered' && (
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 bg-slate-950/15 p-2 rounded-lg border border-slate-900/60 leading-none">
                  <UserCheck className="w-3.5 h-3.5 text-farm-500" />
                  <span>By: <span className="font-semibold text-slate-300">{vac.administeredBy}</span></span>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-between items-center border-t border-slate-900 pt-3">
                <span className="text-[9px] text-slate-500">
                  Logged: {new Date(vac.createdAt).toLocaleDateString()}
                </span>
                
                <div className="flex gap-2">
                  {vac.status !== 'Administered' && (
                    <button
                      onClick={() => handleOpenAdminister(vac)}
                      className="text-[10px] font-bold text-white bg-farm-600 hover:bg-farm-500 px-3.5 py-1.5 rounded-lg shadow-sm cursor-pointer"
                    >
                      Mark Administered
                    </button>
                  )}
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => handleDelete(vac._id)}
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

      {/* Slide Modal: Create Schedule */}
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

            <h3 className="text-base font-bold text-white mb-6 border-b border-slate-800 pb-3 flex items-center gap-2">
              <Syringe className="w-5 h-5 text-farm-500" />
              <span>Schedule Vaccination Dose</span>
            </h3>

            <form onSubmit={handleCreateSchedule} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Animal Tag */}
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Animal Tag ID *</label>
                  <input
                    type="text"
                    value={animalTag}
                    onChange={(e) => setAnimalTag(e.target.value)}
                    placeholder="e.g. PIG-0012"
                    className="w-full glass-input text-xs"
                    required
                  />
                </div>

                {/* Vaccine name */}
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Vaccine Name *</label>
                  <input
                    type="text"
                    value={vaccineName}
                    onChange={(e) => setVaccineName(e.target.value)}
                    placeholder="e.g. Circovirus Shot"
                    className="w-full glass-input text-xs"
                    required
                  />
                </div>

                {/* Target disease */}
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Target Disease *</label>
                  <input
                    type="text"
                    value={diseaseTargeted}
                    onChange={(e) => setDiseaseTargeted(e.target.value)}
                    placeholder="e.g. PCV2"
                    className="w-full glass-input text-xs"
                    required
                  />
                </div>

                {/* Dose number */}
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Dose Number</label>
                  <input
                    type="number"
                    value={doseNumber}
                    onChange={(e) => setDoseNumber(e.target.value)}
                    className="w-full glass-input text-xs"
                  />
                </div>

                {/* Next due date */}
                <div className="flex flex-col sm:col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Next Due Date *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                      <Calendar className="w-4 h-4" />
                    </span>
                    <input
                      type="date"
                      value={nextDueDate}
                      onChange={(e) => setNextDueDate(e.target.value)}
                      className="w-full pl-11 glass-input text-xs"
                      required
                    />
                  </div>
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
                  Schedule Dose
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Slide Modal: Mark Administered */}
      {administerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md glass-panel p-6 shadow-2xl relative"
          >
            <button
              onClick={() => setAdministerModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-6 border-b border-slate-800 pb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-farm-500" />
              <span>Record Vaccine Administration</span>
            </h3>

            <form onSubmit={handleMarkAdministered} className="space-y-4">
              <div className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl text-xs space-y-1">
                <div>Vaccine: <span className="font-bold text-white">{selectedVaccine?.vaccineName}</span></div>
                <div>Animal Tag: <span className="font-bold text-white">{selectedVaccine?.animalTag}</span></div>
              </div>

              {/* Administer Person */}
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Administered By *</label>
                <input
                  type="text"
                  value={administeredBy}
                  onChange={(e) => setAdministeredBy(e.target.value)}
                  className="w-full glass-input text-xs"
                  required
                />
              </div>

              {/* Administer Date */}
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Date Administered *</label>
                <input
                  type="date"
                  value={dateAdministered}
                  onChange={(e) => setDateAdministered(e.target.value)}
                  className="w-full glass-input text-xs"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-800 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setAdministerModalOpen(false)}
                  className="glass-btn-secondary px-5 py-2.5 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="glass-btn-primary px-6 py-2.5 text-xs"
                >
                  Confirm Administration
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default VaccinationPage;
