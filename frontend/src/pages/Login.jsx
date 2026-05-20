import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShieldAlert, ArrowRight, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import GoogleSignInButton from '../components/GoogleSignInButton';


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const { login, user, error, loading, setError } = useContext(AuthContext);
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

    if (!email || !password) {
      setFormError('Please fill in all credentials fields');
      return;
    }

    try {
      const data = await login(email, password);
      if (data.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/farmer-dashboard');
      }
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
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-panel p-8 sm:p-10 shadow-2xl">
          {/* Logo and Headings */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-farm-600 flex items-center justify-center mx-auto mb-4 shadow-glow">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-black text-white font-sans tracking-tight">Access Secure Terminal</h2>
            <p className="text-slate-400 text-xs mt-1.5 leading-relaxed font-sans">
              Smart BioSecure Farm Portal authentication check
            </p>
          </div>

          {/* Messages block */}
          {(formError || error) && (
            <div className="p-4 mb-6 rounded-xl bg-red-950/20 border border-red-500/25 text-red-400 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{formError || error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@farm.com"
                  className="w-full pl-11 glass-input text-xs"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-300">Password</label>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-11 pr-11 glass-input text-xs"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Quick login guidelines helper */}
            <div className="text-[10px] text-slate-500 bg-slate-950/30 border border-slate-900 rounded-lg p-3 leading-normal">
              💡 **Presentation Tip**: Use default seed accounts:
              <br />• Admin: **admin@farm.com** / **password123**
              <br />• Farmer: **farmer@farm.com** / **password123**
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full glass-btn-primary py-3 rounded-xl text-xs flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-slate-800 border-t-white animate-spin" />
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Google Login Divider */}
          <div className="my-6 flex items-center justify-between text-xs text-slate-500">
            <span className="w-[30%] h-px bg-slate-800"></span>
            <span>OR</span>
            <span className="w-[30%] h-px bg-slate-800"></span>
          </div>

          {/* Google Sign In Component */}
          <GoogleSignInButton defaultRole="farmer" />


          {/* Footer Router link */}
          <div className="text-center mt-6">
            <p className="text-xs text-slate-400">
              New agricultural enterprise?{' '}
              <Link to="/register" className="text-farm-500 hover:text-farm-400 font-semibold transition-colors">
                Register Farm
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
