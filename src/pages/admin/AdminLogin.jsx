import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight, Eye, EyeOff, KeyRound, Building2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const result = await login(email, password, 'admin');

    if (result?.error) {
      setLoading(false);
      setErrorMsg(result.error);
      return;
    }

    setLoading(false);
    navigate('/admin/dashboard');
  };

  return (
    <div className="relative min-h-[92vh] flex items-center justify-center py-16 px-4 overflow-hidden bg-slate-950">
      
      {/* Dark Security Background Gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"></div>
      </div>

      {/* Secret Super Admin Card */}
      <div className="relative z-10 w-full max-w-md p-8 sm:p-10 rounded-3xl bg-slate-900/95 border border-amber-500/30 shadow-2xl space-y-6 animate-fade-in my-6 overflow-hidden">
        
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-md rounded-3xl animate-fade-in p-6 text-center space-y-4">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin"></div>
              <ShieldCheck className="w-8 h-8 text-amber-400 animate-pulse" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-white tracking-wide">Authenticating Admin Passkey...</p>
              <p className="text-xs text-amber-400 font-medium">Verifying Super Admin Portal Credentials</p>
            </div>
          </div>
        )}

        {/* Header Badge & Title */}
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-1">
            <img 
              src="/logo.png" 
              alt="LuxeStay" 
              className="w-16 h-16 rounded-full object-cover shadow-xl shadow-amber-500/25 ring-2 ring-amber-500/40" 
            />
          </div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-amber-400" /> Super Admin Portal Gateway
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Super Admin Login</h1>
          <p className="text-xs text-slate-400">Restricted Executive Gateway for LuxeStay Management</p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold text-center animate-fade-in">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Admin Access Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@luxestay.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:border-amber-500 focus:outline-none transition-all font-mono"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Security Passkey *
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:border-amber-500 focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/25 cursor-pointer uppercase tracking-wider"
          >
            <span>Authorize Admin Session</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-between pt-1 text-xs">
            <Link 
              to="/forgot-password?role=admin"
              className="text-slate-400 hover:text-amber-400 transition-colors font-bold text-[11px] flex items-center gap-1"
            >
              <KeyRound className="w-3.5 h-3.5" /> Forgot Admin Security Passkey?
            </Link>
          </div>
        </form>

        {/* Real Admin Credentials Helper */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px]">🔐 Real Admin Session</span>
          <button
            type="button"
            onClick={() => { setEmail('sharif@gmail.com'); setPassword('123456'); }}
            className="text-amber-400 hover:underline font-bold text-[11px] flex items-center gap-1 cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5" /> Fill Real Admin Credentials
          </button>
        </div>

        {/* Back Link */}
        <div className="text-center pt-2">
          <Link to="/login" className="text-xs font-bold text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Standard Public Login</span>
          </Link>
        </div>

      </div>
    </div>
  );
};
