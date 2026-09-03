import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Lock, Mail, User, Briefcase, Shield, ArrowRight, Eye, EyeOff, Camera, Upload, CheckCircle2, AlertCircle, Loader2, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const AuthModal = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, login, register, loginWithGoogle } = useAuth();
  const { t } = useLanguage();
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState('customer');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '', 
    name: '',
    avatar: null 
  });
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  if (!isAuthModalOpen) return null;

  const toggleAuthMode = (mode) => {
    setIsRegister(mode);
    setErrorMsg('');
    setFormData({ name: '', email: '', password: '', avatar: null });
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setFormData(prev => ({ ...prev, avatar: reader.result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const formatErr = (err) => {
    if (!err) return '';
    if (typeof err === 'string') return err;
    if (typeof err === 'object') return err.message || err.error || JSON.stringify(err);
    return String(err);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    let result;
    if (isRegister) {
      result = await register(formData.name, formData.email, formData.password, role, formData.avatar);
    } else {
      result = await login(formData.email, formData.password, role);
    }

    if (result?.error) {
      setLoading(false);
      setErrorMsg(formatErr(result.error));
      return;
    }

    setIsAuthModalOpen(false);
    const userRole = result?.user?.role || role;
    if (userRole === 'admin') navigate('/admin/dashboard');
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

    setIsAuthModalOpen(false);
    const userRole = result?.user?.role || role;
    if (userRole === 'admin') navigate('/admin/dashboard');
    else if (userRole === 'manager') navigate('/manager/dashboard');
    else navigate('/customer/dashboard');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md animate-fade-in p-4 sm:p-6 flex justify-center items-start">
      
      {/* Background Resort Pool Image */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-45">
        <img 
          src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2000&q=85" 
          alt="Resort Background" 
          className="w-full h-full object-cover brightness-[0.7]" 
        />
        <div className="absolute inset-0 bg-slate-950/60"></div>
      </div>

      <div className="relative z-10 w-full max-w-md p-6 sm:p-8 rounded-3xl bg-slate-900/95 backdrop-blur-xl border border-white/20 shadow-2xl space-y-5 my-6 sm:my-10 overflow-hidden">
        
        {/* PREMIUM GLASSMORPHIC SPINNER OVERLAY */}
        {loading && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md rounded-3xl animate-fade-in p-6 text-center space-y-4">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin"></div>
              <div className="w-10 h-10 rounded-full border-4 border-emerald-500/20 border-b-emerald-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
              <Building2 className="w-6 h-6 text-amber-400 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">Authenticating Account</h4>
              <p className="text-xs text-amber-400 font-semibold animate-pulse">Connecting to Luxury Hospitality Portal...</p>
            </div>
          </div>
        )}
        
        {/* Close Button */}
        <button 
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <img 
            src="/logo.png" 
            alt="LuxeStay" 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://ui-avatars.com/api/?name=Luxe+Stay&background=0284c7&color=fff&bold=true';
            }}
            className="w-14 h-14 mx-auto rounded-full object-cover shadow-xl ring-2 ring-amber-500/40" 
          />
          <h3 className="text-2xl font-extrabold text-white">
            {isRegister ? t('createAccount') : t('welcomeBack')}
          </h3>
        </div>

        {/* Role Selector Tabs (Public modal shows Customer & Partner only) */}
        <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-xs font-extrabold">
          <button 
            type="button" 
            onClick={() => setRole('customer')}
            className={`py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              role === 'customer' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" /> {t('customerAccount')}
          </button>
          <button 
            type="button" 
            onClick={() => setRole('manager')}
            className={`py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              role === 'manager' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" /> Hotel Manager / Owner
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-bold flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{typeof errorMsg === 'object' ? (errorMsg?.message || JSON.stringify(errorMsg)) : String(errorMsg)}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isRegister && (
            <>
              {/* Optional Profile Picture Upload */}
              <div className="p-3 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border border-amber-500/50 flex-shrink-0 bg-amber-500/10 flex items-center justify-center">
                    {formData.avatar ? (
                      <img src={formData.avatar} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-5 h-5 text-amber-500" />
                    )}
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-[var(--text-primary)]">Profile Picture</span>
                    <span className="text-[10px] text-[var(--text-muted)]">Optional photo upload</span>
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
                  className="px-3 py-1.5 rounded-xl bg-amber-500/15 text-amber-500 hover:bg-amber-500 hover:text-white transition-all text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{formData.avatar ? 'Change' : 'Upload'}</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-200 mb-1.5 uppercase tracking-wider">{t('fullNameLabel') || 'FULL NAME *'}</label>
                <div className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl bg-slate-950/80 border border-slate-700/80 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all">
                  <User className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-transparent pl-1 text-sm sm:text-base font-extrabold text-white placeholder-slate-400 outline-none"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-extrabold text-slate-200 mb-1.5 uppercase tracking-wider">{t('emailLabel') || 'EMAIL ADDRESS *'}</label>
            <div className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl bg-slate-950/80 border border-slate-700/80 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all">
              <Mail className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-transparent pl-1 text-sm sm:text-base font-extrabold text-white placeholder-slate-400 outline-none"
                placeholder="john@example.com"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-extrabold text-slate-200 uppercase tracking-wider">{t('passwordLabel') || 'PASSWORD *'}</label>
              {!isRegister && (
                <button
                  type="button"
                  onClick={() => {
                    setIsAuthModalOpen(false);
                    navigate('/forgot-password');
                  }}
                  className="text-[11px] font-extrabold text-amber-400 hover:underline cursor-pointer"
                >
                  {t('forgotPassword') || 'Forgot Password?'}
                </button>
              )}
            </div>
            <div className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl bg-slate-950/80 border border-slate-700/80 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all relative">
              <Lock className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <input 
                type={showPassword ? "text" : "password"} 
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-transparent pl-1 text-sm sm:text-base font-extrabold text-white placeholder-slate-400 outline-none pr-8"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-slate-400 hover:text-amber-400 cursor-pointer"
                title={showPassword ? "Hide Password" : "Show Password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full btn btn-primary py-3 text-xs shadow-lg shadow-amber-500/30 cursor-pointer font-extrabold uppercase tracking-wider">
            <span>{loading ? 'Processing...' : isRegister ? `Register ${role.toUpperCase()} Account` : `Sign In as ${role === 'manager' ? 'HOTEL MANAGER' : role.toUpperCase()}`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-2">
          <div className="border-t border-[var(--border-light)] w-full"></div>
          <span className="bg-[var(--bg-card)] px-3 text-[10px] uppercase font-bold text-[var(--text-muted)] absolute">OR</span>
        </div>

        {/* Google Authentication Button */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-800/90 hover:bg-slate-800 text-white text-xs font-extrabold transition-all shadow-xs cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>{t('continueGoogle')}</span>
        </button>

        {/* Toggle Mode */}
        <div className="text-center pt-2 border-t border-slate-700/80 text-xs text-slate-300">
          {isRegister ? t('haveAccount') : t('noAccount')}{' '}
          <button 
            type="button" 
            onClick={() => toggleAuthMode(!isRegister)} 
            className="font-extrabold text-amber-400 hover:underline ml-1 cursor-pointer uppercase"
          >
            {isRegister ? t('signInNow') : t('registerNow')}
          </button>
        </div>

      </div>
    </div>
  );
};
