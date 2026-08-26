import React, { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight, Building2, Briefcase, Shield, CheckCircle2, Eye, EyeOff, Camera, Upload, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [role, setRole] = useState('customer');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    const result = await register(name, email, password, role, avatar);
    
    if (result?.error) {
      setLoading(false);
      setErrorMsg(result.error);
      return;
    }

    if (result && !result.error) {
      setSuccessMsg('Account created & saved successfully!');
      const targetRole = result?.user?.role || role;
      setTimeout(() => {
        if (from) navigate(from);
        else if (targetRole === 'admin') navigate('/admin/dashboard');
        else if (targetRole === 'partner') navigate('/partner/dashboard');
        else navigate('/customer/dashboard');
      }, 1000);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setErrorMsg('');
    const result = await loginWithGoogle(role);
    if (result?.error) {
      setLoading(false);
      setErrorMsg(result.error);
      return;
    }
    if (result && !result.error) {
      setSuccessMsg('Google Account authenticated & registered!');
      const targetRole = result?.user?.role || role;
      setTimeout(() => {
        if (from) navigate(from);
        else if (targetRole === 'admin') navigate('/admin/dashboard');
        else if (targetRole === 'partner') navigate('/partner/dashboard');
        else navigate('/customer/dashboard');
      }, 1000);
    }
  };

  return (
    <div className="relative min-h-[92vh] flex items-center justify-center py-16 px-4 overflow-hidden">
      
      {/* Background Resort Pool Image & Luxury Vignette Overlay */}
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
              <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">Creating Luxury Account</h4>
              <p className="text-xs text-amber-400 font-semibold animate-pulse">Initializing Portal Access...</p>
            </div>
          </div>
        )}
        
        {/* Header Title & Subtitle */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/50 text-amber-400 flex items-center justify-center font-bold shadow-lg">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide uppercase">
            REGISTER FORM
          </h1>
          <p className="text-xs text-slate-300 font-medium max-w-xs mx-auto">
            If you have no account in LuxeStay Luxury Hotel portal, register and feel the luxury
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-xs font-extrabold">
          <button 
            type="button" 
            onClick={() => setRole('customer')}
            className={`py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              role === 'customer' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" /> Guest Account
          </button>
          <button 
            type="button" 
            onClick={() => setRole('partner')}
            className={`py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              role === 'partner' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Briefcase className="w-4 h-4" /> Hotel Manager / Owner
          </button>
        </div>

        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-extrabold text-center flex items-center justify-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-extrabold text-center">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Optional Profile Picture Upload */}
          <div className="p-3.5 rounded-2xl bg-slate-800/90 border border-slate-700 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-amber-400 flex-shrink-0 bg-amber-500/20 flex items-center justify-center">
                {avatar ? (
                  <img src={avatar} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-5 h-5 text-amber-400" />
                )}
              </div>
              <div>
                <span className="block text-xs font-extrabold text-white">Profile Picture</span>
                <span className="text-[10px] text-slate-300">Optional photo upload</span>
              </div>
            </div>

            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*" 
              className="hidden" 
              onChange={handleAvatarUpload} 
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-white transition-all text-[11px] font-extrabold flex items-center gap-1 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{avatar ? 'Change' : 'Upload'}</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-200 mb-1.5 uppercase tracking-wider">FULL NAME *</label>
            <div className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl bg-slate-950/80 border border-slate-700/80 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all">
              <User className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                className="w-full bg-transparent pl-1 text-sm sm:text-base font-extrabold text-white placeholder-slate-400 outline-none" 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-200 mb-1.5 uppercase tracking-wider">EMAIL ADDRESS *</label>
            <div className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl bg-slate-950/80 border border-slate-700/80 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all">
              <Mail className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@domain.com"
                required
                className="w-full bg-transparent pl-1 text-sm sm:text-base font-extrabold text-white placeholder-slate-400 outline-none" 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-200 mb-1.5 uppercase tracking-wider">PASSWORD *</label>
            <div className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl bg-slate-950/80 border border-slate-700/80 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all relative">
              <Lock className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-transparent pl-1 text-sm sm:text-base font-extrabold text-white placeholder-slate-400 outline-none pr-8" 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-slate-400 hover:text-amber-400 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-amber-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-80"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>REGISTERING ACCOUNT...</span>
              </>
            ) : (
              <>
                <span>REGISTER AS {role === 'partner' ? 'HOTEL MANAGER' : role.toUpperCase()}</span>
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
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Sign Up with Google</span>
        </button>

        {/* Footer Link to Login */}
        <div className="text-center pt-2 border-t border-slate-700/80 text-xs text-slate-300">
          Already have an account in LuxeStay?{' '}
          <Link to="/login" state={{ from }} className="font-extrabold text-amber-400 hover:underline ml-1 uppercase">
            SIGN IN NOW
          </Link>
        </div>

      </div>
    </div>
  );
};

