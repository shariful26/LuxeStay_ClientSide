import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, ArrowRight, Building2, User, Briefcase, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('customer');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;

  const formatErr = (err) => {
    if (!err) return '';
    if (typeof err === 'string') return err;
    if (typeof err === 'object') return err.message || err.error || JSON.stringify(err);
    return String(err);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    const result = await login(email, password, role);

    if (result?.error) {
      setLoading(false);
      setErrorMsg(formatErr(result.error));
      return;
    }

    const userRole = result?.user?.role || role;
    if (from) navigate(from);
    else if (userRole === 'admin') navigate('/admin/dashboard');
    else if (userRole === 'manager') navigate('/manager/dashboard');
    else navigate('/customer/dashboard');
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setErrorMsg('');
    const result = await loginWithGoogle(role);

    if (result?.error) {
      setLoading(false);
      setErrorMsg(formatErr(result.error));
      return;
    }

    const userRole = result?.user?.role || role;
    if (from) navigate(from);
    else if (userRole === 'admin') navigate('/admin/dashboard');
    else if (userRole === 'manager') navigate('/manager/dashboard');
    else navigate('/customer/dashboard');
  };

  return (
    <div className="relative min-h-[92vh] flex items-center justify-center py-16 px-4 overflow-hidden">

      {/* Background Resort Pool Image & Luxury Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2000&q=85"
          alt="Luxury Resort Background"
          className="w-full h-full object-cover brightness-[0.75] scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/70 to-slate-950/90 backdrop-blur-xs"></div>
      </div>

      {/* Centered High-Contrast Glassmorphic Card */}
      <div className="relative z-10 w-full max-w-lg p-8 sm:p-10 rounded-3xl bg-slate-900/95 border border-white/20 shadow-2xl space-y-6 animate-fade-in my-6 overflow-hidden">

        {/* PREMIUM GLASSMORPHIC SPINNER OVERLAY */}
        {loading && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md rounded-3xl animate-fade-in p-6 text-center space-y-4">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin"></div>
              <div className="w-10 h-10 rounded-full border-4 border-emerald-500/20 border-b-emerald-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
              <Building2 className="w-6 h-6 text-amber-400 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">Verifying Credentials</h4>
              <p className="text-xs text-amber-400 font-semibold animate-pulse">Entering Luxury Hospitality Portal...</p>
            </div>
          </div>
        )}

        {/* Header Title & Subtitle */}
        <div className="text-center space-y-2">
          <img
            src="/logo.png"
            alt="LuxeStay"
            className="w-14 h-14 mx-auto rounded-full object-cover shadow-xl shadow-amber-500/25 ring-2 ring-amber-500/40"
          />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide uppercase">
            SIGN IN FORM
          </h1>
          <p className="text-xs text-slate-300 font-medium max-w-xs mx-auto">
            If you already have an account in LuxeStay Luxury Hotel portal, sign in below
          </p>
        </div>

        {/* Role Selector Tabs (Customer & Partner) */}
        <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-xs font-extrabold">
          <button
            type="button"
            onClick={() => setRole('customer')}
            className={`py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${role === 'customer' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
              }`}
          >
            <User className="w-4 h-4" /> Customer Account
          </button>
          <button
            type="button"
            onClick={() => setRole('manager')}
            className={`py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${role === 'manager' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
              }`}
          >
            <Briefcase className="w-4 h-4" /> Hotel Manager / Owner
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-extrabold text-center">
            {typeof errorMsg === 'object' ? (errorMsg?.message || JSON.stringify(errorMsg)) : String(errorMsg)}
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold text-slate-200 mb-1.5 uppercase tracking-wider">EMAIL ADDRESS *</label>
            <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-slate-950/80 border border-slate-700/80 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all">
              <Mail className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="email@domain.com"
                className="w-full bg-transparent text-sm text-white placeholder:text-slate-400 font-semibold border-none outline-none focus:outline-none focus:ring-0"
                style={{ border: 'none', outline: 'none', boxShadow: 'none' }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-extrabold text-slate-200 uppercase tracking-wider">PASSWORD *</label>
              <Link to="/forgot-password" className="text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-colors">
                Forgot password?
              </Link>
            </div>
            <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-slate-950/80 border border-slate-700/80 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all relative">
              <Lock className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-transparent text-sm text-white placeholder:text-slate-400 font-semibold border-none outline-none focus:outline-none focus:ring-0 pr-8"
                style={{ border: 'none', outline: 'none', boxShadow: 'none' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer flex-shrink-0"
                title={showPassword ? "Hide Password" : "Show Password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-2xl font-extrabold text-sm text-white shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider ${role === 'manager' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500' : 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400'
              }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>AUTHENTICATING...</span>
              </>
            ) : (
              <>
                <span>SIGN IN AS {role === 'manager' ? 'HOTEL MANAGER' : role.toUpperCase()}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-2">
          <div className="border-t border-slate-700/80 w-full"></div>
          <span className="bg-slate-900 px-3 text-[10px] uppercase font-extrabold text-slate-400 absolute">OR</span>
        </div>

        {/* Google Authentication Button */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-700 bg-slate-800/90 hover:bg-slate-800 text-white text-xs font-extrabold transition-all shadow-xs cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Footer Link to Register */}
        <div className="text-center pt-2 border-t border-slate-700/80 text-xs text-slate-300">
          Don't have an account in LuxeStay?{' '}
          <Link to="/register" state={{ from }} className="font-extrabold text-amber-400 hover:underline ml-1 uppercase">
            REGISTER NOW
          </Link>
        </div>

      </div>
    </div>
  );
};
