import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import api, { getErrorMessage } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import {
  Users,
  Plus,
  Clock,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  LogOut,
  Calendar,
  Phone,
  Truck,
  CheckCircle,
  X,
  Trash2,
} from 'lucide-react';

const VisitorManagementPage = () => {
  const { user } = useContext(AuthContext);
  const { fetchNotifications } = useContext(NotificationContext);
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [purpose, setPurpose] = useState('Vet Visit');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [disinfectionStatus, setDisinfectionStatus] = useState(false);
  const [contactNumber, setContactNumber] = useState('');
  const [allowedAccess, setAllowedAccess] = useState(false);

  const fetchVisitors = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/visitors');
      setVisitors(data);
      setErrorMsg('');
      setLoading(false);
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  const handleCreateVisitor = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName || !contactNumber) {
      setErrorMsg('Please specify Name and Contact details');
      return;
    }

    try {
      await api.post('/visitors', {
        fullName,
        purpose,
        vehicleNumber,
        disinfectionStatus,
        contactNumber,
        allowedAccess,
      });

      setModalOpen(false);
      setFullName('');
      setPurpose('Vet Visit');
      setVehicleNumber('');
      setDisinfectionStatus(false);
      setContactNumber('');
      setAllowedAccess(false);

      fetchVisitors();
      fetchNotifications();
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
    }
  };

  const handleCheckout = async (id) => {
    try {
      await api.put(`/visitors/${id}/exit`);
      fetchVisitors();
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
    }
  };

  const handleToggleApproval = async (visitor) => {
    try {
      // Toggle approval status
      await api.put(`/visitors/${visitor._id}/approve`, {
        disinfectionStatus: !visitor.disinfectionStatus,
        allowedAccess: !visitor.allowedAccess,
      });
      fetchVisitors();
      fetchNotifications();
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this visitor log entry?')) {
      try {
        await api.delete(`/visitors/${id}`);
        fetchVisitors();
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
            Visitor Entry Tracking
          </h1>
          <p className="text-xs text-slate-400">
            Log agricultural audits, vet visits, and enforce disinfection compliance
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="glass-btn-primary py-2.5 px-5 text-xs flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Record Visitor Entry</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4.5 h-4.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* active visitor notification */}
      {visitors.filter(v => !v.exitTime).length > 0 && (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-300">
            <Clock className="w-4.5 h-4.5 text-farm-500 animate-spin" />
            <span>Currently onsite: <span className="font-bold text-white">{visitors.filter(v => !v.exitTime).length} visitors</span> logged inside the fence boundaries.</span>
          </div>
        </div>
      )}

      {/* Grid of Visitors log */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 rounded-full border-2 border-slate-800 border-t-farm-500 animate-spin"></div>
        </div>
      ) : visitors.length === 0 ? (
        <div className="glass-panel p-10 text-center text-slate-500">
          No entries registered in visitor logs.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {visitors.map((visitor) => (
            <motion.div
              key={visitor._id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`glass-card p-5 space-y-4 hover:border-farm-500/10 ${
                !visitor.exitTime ? 'border-farm-500/20 bg-slate-950/20 shadow-glass-active' : ''
              }`}
            >
              {/* Visitor Header */}
              <div className="flex justify-between items-start gap-1">
                <div>
                  <h3 className="text-base font-extrabold text-white tracking-tight">{visitor.fullName}</h3>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block mt-0.5">
                    Purpose: {visitor.purpose}
                  </span>
                </div>

                <div className="flex gap-2">
                  <span
                    className={`status-badge text-[9px] ${
                      visitor.disinfectionStatus
                        ? 'bg-green-950/30 border-green-500/20 text-green-400'
                        : 'bg-red-950/30 border-red-500/20 text-red-400'
                    }`}
                  >
                    {visitor.disinfectionStatus ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                    <span>{visitor.disinfectionStatus ? 'Disinfected' : 'Spraying Failed'}</span>
                  </span>

                  <span
                    className={`status-badge text-[9px] ${
                      visitor.allowedAccess
                        ? 'bg-green-950/30 border-green-500/20 text-green-400'
                        : 'bg-red-950/30 border-red-500/20 text-red-400'
                    }`}
                  >
                    <span>{visitor.allowedAccess ? 'Allowed' : 'Blocked'}</span>
                  </span>
                </div>
              </div>

              {/* Data parameters */}
              <div className="grid grid-cols-2 gap-3 bg-slate-950/20 border border-slate-900 rounded-xl p-3.5 text-xs">
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-500 block uppercase font-medium">Vehicle / Phone</span>
                  <div className="flex items-center gap-1.5 text-slate-300 font-semibold truncate">
                    <Truck className="w-3.5 h-3.5 text-slate-500" />
                    <span>{visitor.vehicleNumber || 'No vehicle'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300 font-semibold truncate mt-1">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{visitor.contactNumber}</span>
                  </div>
                </div>

                <div className="space-y-1 text-right">
                  <span className="text-[9px] text-slate-500 block uppercase font-medium">Entry & Exit Times</span>
                  <div className="text-slate-300 font-semibold flex items-center justify-end gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>In: {new Date(visitor.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="text-slate-300 font-semibold flex items-center justify-end gap-1 mt-1">
                    <LogOut className="w-3.5 h-3.5 text-slate-500" />
                    <span>
                      Out:{' '}
                      {visitor.exitTime
                        ? new Date(visitor.exitTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'Active onsite'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Approval log */}
              {visitor.allowedAccess && visitor.approvedBy && (
                <div className="flex items-center gap-1.5 text-[9px] text-slate-400 bg-slate-950/15 p-2 rounded-lg border border-slate-900/60 leading-none">
                  <ShieldCheck className="w-3.5 h-3.5 text-farm-500" />
                  <span>Approved By: <span className="font-semibold text-slate-300">{visitor.approvedBy.name}</span></span>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-between items-center border-t border-slate-900 pt-3">
                <span className="text-[9px] text-slate-500">
                  Logged: {new Date(visitor.entryTime).toLocaleDateString()}
                </span>

                <div className="flex gap-2">
                  {!visitor.exitTime && (
                    <button
                      onClick={() => handleCheckout(visitor._id)}
                      className="text-[10px] font-bold text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1 border border-slate-700/60 cursor-pointer"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Checkout Visitor</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleToggleApproval(visitor)}
                    className="text-[10px] font-bold text-white bg-farm-600 hover:bg-farm-500 px-3 py-1.5 rounded-lg shadow-sm cursor-pointer"
                  >
                    Audit Clearance
                  </button>

                  {user?.role === 'admin' && (
                    <button
                      onClick={() => handleDelete(visitor._id)}
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

      {/* Slide Modal: Check-In Form */}
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
              <Users className="w-5 h-5 text-farm-500" />
              <span>Record Visitor Check-In</span>
            </h3>

            <form onSubmit={handleCreateVisitor} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Full name */}
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Visitor Name *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Dr. Miller"
                    className="w-full glass-input text-xs"
                    required
                  />
                </div>

                {/* Purpose of visit */}
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Purpose of Visit</label>
                  <select
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="w-full glass-input text-xs"
                  >
                    <option value="Vet Visit" className="bg-slate-900 text-slate-100">Veterinary Visit</option>
                    <option value="Feed Delivery" className="bg-slate-900 text-slate-100">Feed Delivery</option>
                    <option value="Biosecurity Audit" className="bg-slate-900 text-slate-100">Biosecurity Audit</option>
                    <option value="Maintenance" className="bg-slate-900 text-slate-100">General Maintenance</option>
                  </select>
                </div>

                {/* Vehicle number */}
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Vehicle License Plate</label>
                  <input
                    type="text"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    placeholder="e.g. TX-993-APP"
                    className="w-full glass-input text-xs"
                  />
                </div>

                {/* Contact Number */}
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Contact Phone Number *</label>
                  <input
                    type="text"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="e.g. +1 (555) 019-4402"
                    className="w-full glass-input text-xs"
                    required
                  />
                </div>

                {/* Gate disinfection Spray checkbox */}
                <div className="flex items-center gap-2.5 sm:col-span-2 p-3 bg-slate-950/30 border border-slate-900 rounded-xl">
                  <input
                    type="checkbox"
                    id="disinfectionStatus"
                    checked={disinfectionStatus}
                    onChange={(e) => setDisinfectionStatus(e.target.checked)}
                    className="w-4 h-4 text-farm-600 border-slate-800 rounded bg-slate-900 outline-none"
                  />
                  <label htmlFor="disinfectionStatus" className="text-xs text-slate-300 font-semibold cursor-pointer">
                    Vehicle tire and boots disinfection spray completed at gate?
                  </label>
                </div>

                {/* Allowed entry checkbox */}
                <div className="flex items-center gap-2.5 sm:col-span-2 p-3 bg-slate-950/30 border border-slate-900 rounded-xl">
                  <input
                    type="checkbox"
                    id="allowedAccess"
                    checked={allowedAccess}
                    onChange={(e) => setAllowedAccess(e.target.checked)}
                    className="w-4 h-4 text-farm-600 border-slate-800 rounded bg-slate-900 outline-none"
                  />
                  <label htmlFor="allowedAccess" className="text-xs text-slate-300 font-semibold cursor-pointer">
                    Authorize biosecurity gate clearance for entry?
                  </label>
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
                  className="glass-btn-primary px-6 py-2.5 text-xs flex items-center gap-1.5"
                >
                  <span>Register Check-In</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default VisitorManagementPage;
