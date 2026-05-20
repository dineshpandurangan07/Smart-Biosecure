import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import { Chrome, UserPlus, Shield, User, X, Mail } from 'lucide-react';

const GoogleSignInButton = ({ defaultRole = 'farmer' }) => {
  const { loginWithGoogle } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const [useCustomAccount, setUseCustomAccount] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [customRole, setCustomRole] = useState(defaultRole);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const mockGoogleAccounts = [
    {
      name: 'Dr. Sarah Jenkins',
      email: 'admin@farm.com',
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Sarah',
      role: 'admin',
      roleLabel: 'System Admin',
    },
    {
      name: 'Robert Miller',
      email: 'farmer@farm.com',
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Robert',
      role: 'farmer',
      roleLabel: 'Field Farmer',
    },
  ];

  const handleAccountSelect = async (account) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await loginWithGoogle({
        email: account.email,
        name: account.name,
        avatar: account.avatar,
        role: account.role,
      });
      setShowModal(false);
      if (data.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/farmer-dashboard');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to authenticate with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    if (!customName || !customEmail) {
      setErrorMsg('Please enter both Name and Google Email.');
      return;
    }
    if (!customEmail.includes('@') || !customEmail.includes('.')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    const customAvatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(customName)}`;
    
    try {
      const data = await loginWithGoogle({
        email: customEmail,
        name: customName,
        avatar: customAvatar,
        role: customRole,
      });
      setShowModal(false);
      if (data.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/farmer-dashboard');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to register with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Official styled Google button */}
      <button
        type="button"
        onClick={() => {
          setShowModal(true);
          setUseCustomAccount(false);
          setErrorMsg('');
        }}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-slate-50 text-slate-800 font-semibold rounded-xl border border-slate-200 shadow-sm transition-all duration-200"
      >
        <Chrome className="w-5 h-5 text-red-500 fill-red-500" />
        <span>Continue with Google</span>
      </button>

      {/* Account Chooser Dialog */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl p-6"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Google Brand Header */}
              <div className="flex flex-col items-center mb-6">
                <div className="p-3 bg-slate-800/50 rounded-full border border-slate-700 mb-2">
                  <Chrome className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold tracking-tight">Sign in with Google</h3>
                <p className="text-xs text-slate-400 mt-1">to continue to Smart BioSecure Farm Portal</p>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 bg-red-950/40 border border-red-800 text-red-200 text-sm rounded-xl text-center">
                  {errorMsg}
                </div>
              )}

              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full border-4 border-slate-800 border-t-emerald-500 animate-spin mb-4"></div>
                  <p className="text-sm text-slate-400">Connecting Google API...</p>
                </div>
              ) : !useCustomAccount ? (
                /* Select seeded Account list */
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Choose an account</p>
                  
                  {mockGoogleAccounts.map((acc, index) => (
                    <button
                      key={index}
                      onClick={() => handleAccountSelect(acc)}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all text-left"
                    >
                      <div className="flex items-center gap-3">
                        <img src={acc.avatar} alt={acc.name} className="w-10 h-10 rounded-full border border-slate-700" />
                        <div>
                          <p className="font-semibold text-slate-200 text-sm">{acc.name}</p>
                          <p className="text-xs text-slate-400">{acc.email}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-950/50 text-emerald-400 border border-emerald-800/50">
                        {acc.roleLabel}
                      </span>
                    </button>
                  ))}

                  <button
                    onClick={() => setUseCustomAccount(true)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-800/10 hover:bg-slate-800/30 border border-dashed border-slate-700 hover:border-slate-600 transition-all text-left text-slate-300 hover:text-white"
                  >
                    <div className="p-2 bg-slate-800 rounded-full">
                      <UserPlus className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Use another Google account</p>
                      <p className="text-xs text-slate-500">Log in or register with any Gmail ID</p>
                    </div>
                  </button>
                </div>
              ) : (
                /* Custom Google Account registration or Login Form */
                <form onSubmit={handleCustomSubmit} className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setUseCustomAccount(false)}
                      className="text-xs text-emerald-400 hover:underline"
                    >
                      &larr; Back to accounts
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Google Profile Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Google Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        placeholder="user@gmail.com"
                        value={customEmail}
                        onChange={(e) => setCustomEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 text-sm"
                        required
                      />
                    </div>
                  </div>

                  {/* Role selection for registration */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2">Configure Portal Role</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setCustomRole('farmer')}
                        className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                          customRole === 'farmer'
                            ? 'bg-emerald-950/30 border-emerald-500 text-emerald-400'
                            : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        <User className="w-4 h-4" />
                        <span>Farmer Role</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomRole('admin')}
                        className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                          customRole === 'admin'
                            ? 'bg-emerald-950/30 border-emerald-500 text-emerald-400'
                            : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        <Shield className="w-4 h-4" />
                        <span>Admin Role</span>
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 mt-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-950/50 transition-all text-sm"
                  >
                    Authorize & Sign In
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GoogleSignInButton;
