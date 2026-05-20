import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, ShieldCheck, Phone, Landmark, Lock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const ProfileSettingsPage = () => {
  const { user, updateProfile, loading, error, setError } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [farmName, setFarmName] = useState('');
  const [farmType, setFarmType] = useState('both');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatar, setAvatar] = useState('');
  
  const [successMsg, setSuccessMsg] = useState('');
  const [validationError, setValidationError] = useState('');

  const avatarsList = [
    'Sarah', 'Robert', 'Alex', 'Jack', 'Mia', 'Oliver'
  ].map(name => `https://api.dicebear.com/7.x/adventurer/svg?seed=${name}`);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setFarmName(user.farmName || '');
      setFarmType(user.farmType || 'both');
      setAvatar(user.avatar || '');
    }
    setError(null);
  }, [user, setError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    setSuccessMsg('');
    setError(null);

    if (password && password.length < 6) {
      setValidationError('New password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setValidationError('New passwords do not match');
      return;
    }

    try {
      const updateData = {
        name,
        phone,
        farmName,
        farmType,
        avatar,
      };

      if (password) {
        updateData.password = password;
      }

      await updateProfile(updateData);
      setSuccessMsg('Profile settings updated successfully!');
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      // Handled by context
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-6 max-w-4xl mx-auto"
    >
      <div className="flex flex-col md:flex-row items-start gap-6">
        {/* Left Side: Avatar selector card */}
        <div className="w-full md:w-80 space-y-6">
          <div className="glass-card p-6 text-center">
            <h3 className="text-sm font-bold text-white mb-4">Enterprise Avatar</h3>
            
            <div className="relative w-28 h-28 mx-auto rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden mb-4 group shadow-glow">
              <img src={avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${name}`} alt={name} className="w-full h-full object-cover" />
            </div>
            
            <h4 className="text-sm font-bold text-white truncate leading-tight">{user?.name}</h4>
            <span className="text-[10px] text-farm-500 font-semibold uppercase tracking-wider mt-1 inline-block capitalize">{user?.role}</span>
            
            <div className="mt-6 border-t border-slate-800/60 pt-5">
              <span className="text-[10px] font-semibold text-slate-400 block mb-3 uppercase tracking-wider">Change Avatar Seed</span>
              <div className="grid grid-cols-3 gap-2">
                {avatarsList.map((av, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatar(av)}
                    className={`w-12 h-12 rounded-xl bg-slate-950 border overflow-hidden p-1 transition-all ${
                      avatar === av ? 'border-farm-500 ring-2 ring-farm-500/20' : 'border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <img src={av} alt="Preset avatar" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Settings inputs form */}
        <div className="flex-1 w-full">
          <div className="glass-panel p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-800/80 pb-4">
              <Landmark className="w-5 h-5 text-farm-500" />
              <h2 className="text-lg font-bold text-white font-sans">Node Configurations</h2>
            </div>

            {/* Notifications */}
            {successMsg && (
              <div className="p-4 mb-6 rounded-xl bg-green-950/20 border border-green-500/20 text-green-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4.5 h-4.5 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}
            
            {(validationError || error) && (
              <div className="p-4 mb-6 rounded-xl bg-red-950/20 border border-red-500/25 text-red-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4.5 h-4.5 flex-shrink-0" />
                <span>{validationError || error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Contact Name */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Operator Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-11 glass-input text-xs"
                      required
                    />
                  </div>
                </div>

                {/* Email (Read Only) */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Email Address (Read Only)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-600">
                      <Landmark className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      value={user?.email || ''}
                      className="w-full pl-11 glass-input text-xs text-slate-500 border-slate-900 bg-slate-950/20"
                      readOnly
                      disabled
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Phone Contact</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                      <Phone className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-11 glass-input text-xs"
                    />
                  </div>
                </div>

                {/* Farm Name */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Farm Complex Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                      <Landmark className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={farmName}
                      onChange={(e) => setFarmName(e.target.value)}
                      className="w-full pl-11 glass-input text-xs"
                      required
                    />
                  </div>
                </div>

                {/* Farm Focus Selector */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Livestock Focus</label>
                  <select
                    value={farmType}
                    onChange={(e) => setFarmType(e.target.value)}
                    className="w-full glass-input text-xs"
                  >
                    <option value="pig" className="bg-slate-900 text-slate-100">Pigs Only</option>
                    <option value="poultry" className="bg-slate-900 text-slate-100">Poultry Only</option>
                    <option value="both" className="bg-slate-900 text-slate-100">Both Operations</option>
                  </select>
                </div>
              </div>

              {/* Password Section */}
              <div className="border-t border-slate-800/60 pt-5 mt-4 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-4 h-4 text-farm-500" />
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Change Password</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* New Password */}
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">New Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full glass-input text-xs"
                    />
                  </div>

                  {/* Confirm New Password */}
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full glass-input text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end border-t border-slate-800/60 pt-5">
                <button
                  type="submit"
                  disabled={loading}
                  className="glass-btn-primary px-8 py-3 text-xs"
                >
                  {loading ? 'Processing...' : 'Save Configuration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileSettingsPage;
