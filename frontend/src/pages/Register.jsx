import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShieldCheck, ArrowRight, User, Mail, Lock, Phone, Landmark, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import GoogleSignInButton from '../components/GoogleSignInButton';


const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('farmer');
  const [farmName, setFarmName] = useState('');
  const [farmType, setFarmType] = useState('both');
  const [phone, setPhone] = useState('');
  const [formError, setFormError] = useState('');

  const { register, user, error, loading, setError } = useContext(AuthContext);
  const navigate = useNavigate();

  // Clear errors on load
  useEffect(() => {
    setError(null);
    setFormError('');
  }, [setError]);

  // Route if already authenticated
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/farmer-dashboard');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!name || !email || !password || !farmName) {
      setFormError('Please fill in all required fields');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long');
      return;
    }

    try {
      await register({
        name,
        email,
        password,
        role,
        farmName,
        farmType,
        phone,
      });
    } catch (err) {
      // Handled by context state
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 bg-slate-950 overflow-hidden">
      {/* Background Graphic elements */}
      <div className="absolute top-1/4 left-1/3 w-80 h-80 rounded-full bg-farm-600/10 blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 rounded-full bg-emerald-600/10 blur-[130px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl relative z-10"
      >
        <div className="glass-panel p-8 sm:p-10 shadow-2xl">
          {/* Logo and Headings */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-farm-600 flex items-center justify-center mx-auto mb-4 shadow-glow">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-black text-white font-sans tracking-tight">Register Farm Enterprise</h2>
            <p className="text-slate-400 text-xs mt-1.5 leading-relaxed font-sans">
              Deploy a new Smart BioSecure Farm Node
            </p>
          </div>

          {/* Messages block */}
          {(formError || error) && (
            <div className="p-4 mb-6 rounded-xl bg-red-950/20 border border-red-500/25 text-red-400 text-xs flex items-center gap-2">
              <Landmark className="w-4 h-4 flex-shrink-0" />
              <span>{formError || error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Contact Person *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full pl-11 glass-input text-xs"
                    required
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Email Address *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@farm.com"
                    className="w-full pl-11 glass-input text-xs"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Password *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full pl-11 glass-input text-xs"
                    required
                  />
                </div>
              </div>

              {/* Phone number */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Phone Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 012-3456"
                    className="w-full pl-11 glass-input text-xs"
                  />
                </div>
              </div>

              {/* Farm Name */}
              <div className="flex flex-col sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Farm / Enterprise Name *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                    <Landmark className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    placeholder="e.g. BioShield Poultry complex"
                    className="w-full pl-11 glass-input text-xs"
                    required
                  />
                </div>
              </div>

              {/* Role Picker */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">System Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full glass-input text-xs"
                >
                  <option value="farmer" className="bg-slate-900 text-slate-100">Farmer / Operator</option>
                  <option value="admin" className="bg-slate-900 text-slate-100">Security Admin</option>
                </select>
              </div>

              {/* Species focus */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Farm Livestock Focus</label>
                <select
                  value={farmType}
                  onChange={(e) => setFarmType(e.target.value)}
                  className="w-full glass-input text-xs"
                >
                  <option value="pig" className="bg-slate-900 text-slate-100">Pig Farming Only</option>
                  <option value="poultry" className="bg-slate-900 text-slate-100">Poultry Farming Only</option>
                  <option value="both" className="bg-slate-900 text-slate-100">Both (Pig & Poultry)</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full glass-btn-primary py-3 rounded-xl text-xs flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-slate-800 border-t-white animate-spin" />
              ) : (
                <>
                  <span>Create Farm Account</span>
                  <Plus className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Google Divider */}
          <div className="my-6 flex items-center justify-between text-xs text-slate-500">
            <span className="w-[30%] h-px bg-slate-800"></span>
            <span>OR</span>
            <span className="w-[30%] h-px bg-slate-800"></span>
          </div>

          {/* Google Sign In/Register Component */}
          <GoogleSignInButton defaultRole="farmer" />


          {/* Footer Router link */}
          <div className="text-center mt-6">
            <p className="text-xs text-slate-400">
              Already have an agricultural node?{' '}
              <Link to="/login" className="text-farm-500 hover:text-farm-400 font-semibold transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
