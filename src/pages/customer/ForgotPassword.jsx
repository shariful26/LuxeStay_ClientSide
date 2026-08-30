import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, Lock, Eye, EyeOff, KeyRound, Loader2, ShieldCheck, User, Briefcase, Shield } from 'lucide-react';

export const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password, 3: Success
  const [role, setRole] = useState('customer'); // customer, partner, admin
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [receivedOtp, setReceivedOtp] = useState('');
  const navigate = useNavigate();

  const handleRoleChange = (newRole) => {
    setRole(newRole);
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role })
      });
      const data = await res.json().catch(() => ({ error: 'Server connection error' }));
      setLoading(false);
      if (res.ok && data.success) {
        setReceivedOtp(data.otp);
        setOtp(data.otp); // Pre-fill for instant seamless testing
        setStep(2);
      } else {
        setErrorMsg(data.error || 'Failed to send reset code');
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg('Network error. Please check server status.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role, otp, newPassword })
      });
      const data = await res.json().catch(() => ({ error: 'Server connection error' }));
      setLoading(false);
      if (res.ok && data.success) {
        setStep(3);
        setTimeout(() => {
          navigate('/login');
        }, 2200);
      } else {
        setErrorMsg(data.error || 'Failed to reset password');
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg('Network error. Please check server status.');
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-2xl space-y-6 animate-fade-in my-8">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-500 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-[var(--bg-tertiary)] text-[11px] font-extrabold">
          <button 
            type="button" 
            onClick={() => handleRoleChange('customer')}
            className={`py-2 rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer ${
              role === 'customer' ? 'bg-amber-500 text-white shadow-md' : 'text-[var(--text-secondary)]'
            }`}
          >
            <User className="w-3.5 h-3.5" /> Customer
          </button>
          <button 
            type="button" 
            onClick={() => handleRoleChange('manager')}
            className={`py-2 rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer ${
              role === 'manager' ? 'bg-emerald-500 text-white shadow-md' : 'text-[var(--text-secondary)]'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" /> Manager
          </button>
          <button 
            type="button" 
            onClick={() => handleRoleChange('admin')}
            className={`py-2 rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer ${
              role === 'admin' ? 'bg-indigo-600 text-white shadow-md' : 'text-[var(--text-secondary)]'
            }`}
          >
            <Shield className="w-3.5 h-3.5" /> Admin
          </button>
        </div>

        {step === 3 ? (
          <div className="text-center space-y-4 py-6 animate-fade-in">
            <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto animate-bounce" />
            <h2 className="text-2xl font-extrabold text-[var(--text-primary)]">Password Reset & Encrypted!</h2>
            <p className="text-xs text-[var(--text-secondary)]">New password for <span className="capitalize font-bold text-[var(--text-primary)]">{role}</span> account has been securely hashed with bcrypt.</p>
            <p className="text-[11px] font-bold text-amber-500">Redirecting to login page...</p>
          </div>
        ) : step === 2 ? (
          <form onSubmit={handleResetPassword} className="space-y-4 animate-fade-in">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                <KeyRound className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Enter Code & New Password</h1>
              <p className="text-xs text-[var(--text-secondary)]">
                Resetting password for <span className="capitalize font-bold text-amber-500">{role}</span> (<span className="font-bold text-[var(--text-primary)]">{email}</span>)
              </p>
            </div>

            {receivedOtp && (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs text-center font-extrabold">
                🔑 Security Reset Code: <span className="font-mono text-sm tracking-widest bg-amber-500/20 px-2 py-0.5 rounded">{receivedOtp}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-bold text-center">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">6-Digit Verification Code</label>
              <input 
                type="text" 
                value={otp} 
                onChange={(e) => setOtp(e.target.value)} 
                required 
                className="w-full p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-xs text-[var(--text-primary)] font-mono font-extrabold tracking-widest outline-none focus:border-amber-500" 
                placeholder="123456" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">New Secure Password</label>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] relative">
                <Lock className="w-4 h-4 text-slate-400" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  required 
                  className="w-full bg-transparent text-xs text-[var(--text-primary)] outline-none pr-8" 
                  placeholder="Enter new password" 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-[var(--text-muted)] hover:text-amber-500 cursor-pointer"
                  title={showPassword ? "Hide Password" : "Show Password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full btn btn-primary py-3 text-xs shadow-lg shadow-amber-500/30 cursor-pointer">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : `Reset ${role.toUpperCase()} Password`}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSendCode} className="space-y-4 animate-fade-in">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Forgot Password</h1>
              <p className="text-xs text-[var(--text-secondary)]">
                Enter your registered <span className="capitalize font-bold text-amber-500">{role}</span> email to receive a recovery code.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-bold text-center">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Email Address</label>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)]">
                <Mail className="w-4 h-4 text-slate-400" />
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  className="w-full bg-transparent text-xs text-[var(--text-primary)] outline-none" 
                  placeholder="john@example.com" 
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full btn btn-primary py-3 text-xs shadow-lg shadow-amber-500/30 cursor-pointer">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : `Send Reset Code for ${role.toUpperCase()}`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
