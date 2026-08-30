import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Save, CheckCircle2, Loader2, Camera, Upload, Image as ImageIcon, Sparkles, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { PortalLayout } from '../../components/PortalLayout';
import { useAuth } from '../../context/AuthContext';

const PRESET_AVATARS = [
  { label: 'Executive Gold', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80' },
  { label: 'VIP Platinum', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80' },
  { label: 'Suite Ambassador', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80' },
  { label: 'Luxury Traveler', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80' }
];

export const CustomerProfile = ({ role = 'customer', mode = 'all' }) => {
  const { user, updateProfile } = useAuth();
  const activeRole = user?.role || role;
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [uploadNotice, setUploadNotice] = useState('');
  
  const location = useLocation();
  const profileSectionRef = useRef(null);
  const passwordSectionRef = useRef(null);

  useEffect(() => {
    // Small timeout to allow render paint before scroll
    const timer = setTimeout(() => {
      if (location.hash === '#password' && passwordSectionRef.current) {
        passwordSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (location.hash === '#profile' && profileSectionRef.current) {
        profileSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [location.hash]);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    country: user?.country || 'United States',
    avatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    zip: user?.zip || ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        country: user.country || 'United States',
        avatar: user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        zip: user.zip || ''
      });
    }
  }, [user]);

  // Handle local file select and convert to base64 Data URL
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file (JPG, PNG, WEBP, etc.)');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setFormData(prev => ({ ...prev, avatar: reader.result }));
          setUploadNotice('Photo uploaded! Click "Save Profile Changes" to apply.');
          setTimeout(() => setUploadNotice(''), 5000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await updateProfile(formData);
    setLoading(false);
    if (res?.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    }
  };

  return (
    <PortalLayout role={activeRole === 'manager' ? 'manager' : activeRole === 'admin' ? 'admin' : 'customer'} title={mode === 'password' ? 'Security & Password Reset' : activeRole === 'manager' ? 'Manager Account Settings' : 'Profile Settings'}>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)]">
          {mode === 'password' ? 'Security & Password Reset' : 'Profile Settings'}
        </h1>

        {(mode === 'all' || mode === 'profile') && (
        <div ref={profileSectionRef} className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-xl space-y-6 scroll-mt-6">
          
          {/* Profile Picture Upload Header Area */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-[var(--border-light)]">
            <div className="relative group flex-shrink-0 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <img 
                src={formData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'} 
                alt="Profile Avatar" 
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-amber-500 shadow-xl group-hover:opacity-90 transition-opacity" 
              />
              <button 
                type="button" 
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} 
                className="absolute bottom-0 right-0 p-2 rounded-full bg-amber-500 text-white shadow-lg border-2 border-[var(--bg-card)] hover:bg-amber-600 transition-colors"
                title="Upload Profile Picture"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-center sm:text-left flex-1">
              <h3 className="text-lg font-extrabold text-[var(--text-primary)]">{formData.name || 'Member'}</h3>
              <span className="text-xs text-[var(--text-secondary)] block">Member since {user?.memberSince || '2024'}</span>
              
              {/* File Upload Trigger & Controls */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageFileChange} 
                />
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()} 
                  className="px-3 py-1.5 rounded-xl bg-amber-500/15 text-amber-500 border border-amber-500/30 hover:bg-amber-500 hover:text-white transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" /> Upload Custom Photo
                </button>
              </div>

              {uploadNotice && (
                <span className="text-[11px] font-extrabold text-amber-500 block animate-fade-in">
                  ✨ {uploadNotice}
                </span>
              )}
            </div>
          </div>

          {/* Preset Avatars Bar */}
          <div className="space-y-2 pt-1">
            <span className="text-[10px] uppercase font-extrabold text-[var(--text-muted)] tracking-wider block flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> Choose Preset Luxury Avatar:
            </span>
            <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
              {PRESET_AVATARS.map((av, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, avatar: av.url }))}
                  className={`relative p-0.5 rounded-full border-2 transition-all flex-shrink-0 cursor-pointer ${
                    formData.avatar === av.url ? 'border-amber-500 scale-105 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                  title={av.label}
                >
                  <img src={av.url} alt={av.label} className="w-9 h-9 rounded-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Profile Details Form */}
          <form onSubmit={handleSave} className="space-y-4 text-xs font-bold text-[var(--text-secondary)] pt-2">
            <div>
              <label className="block mb-1">Full Name</label>
              <input 
                type="text" 
                required
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                className="w-full p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-[var(--text-primary)] outline-none focus:border-amber-500 transition-colors" 
              />
            </div>

            <div>
              <label className="block mb-1">Email Address</label>
              <input 
                type="email" 
                required
                value={formData.email} 
                onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                className="w-full p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-[var(--text-primary)] outline-none focus:border-amber-500 transition-colors" 
              />
            </div>

            <div>
              <label className="block mb-1">Phone Number</label>
              <input 
                type="text" 
                required
                value={formData.phone} 
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                className="w-full p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-[var(--text-primary)] outline-none focus:border-amber-500 transition-colors" 
              />
            </div>

            <div>
              <label className="block mb-1">Street Address</label>
              <input 
                type="text" 
                placeholder="e.g. 123 Luxury Ave, Apt 4B"
                value={formData.address} 
                onChange={(e) => setFormData({ ...formData, address: e.target.value })} 
                className="w-full p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-[var(--text-primary)] outline-none focus:border-amber-500 transition-colors" 
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block mb-1">City</label>
                <input 
                  type="text" 
                  placeholder="e.g. New York"
                  value={formData.city} 
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })} 
                  className="w-full p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-[var(--text-primary)] outline-none focus:border-amber-500 transition-colors" 
                />
              </div>

              <div>
                <label className="block mb-1">State / Province</label>
                <input 
                  type="text" 
                  placeholder="e.g. NY"
                  value={formData.state} 
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })} 
                  className="w-full p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-[var(--text-primary)] outline-none focus:border-amber-500 transition-colors" 
                />
              </div>

              <div>
                <label className="block mb-1">Postal / ZIP Code</label>
                <input 
                  type="text" 
                  placeholder="e.g. 10001"
                  value={formData.zip} 
                  onChange={(e) => setFormData({ ...formData, zip: e.target.value })} 
                  className="w-full p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-[var(--text-primary)] outline-none focus:border-amber-500 transition-colors" 
                />
              </div>
            </div>



            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <button 
                type="submit" 
                disabled={loading}
                className="btn btn-primary py-3 px-6 text-xs flex items-center justify-center gap-2 w-full sm:w-auto shadow-md cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{loading ? 'Saving Changes...' : 'Save Profile Changes'}</span>
              </button>

              {saved && (
                <span className="text-emerald-500 text-xs font-bold flex items-center gap-1 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4" /> Profile & Avatar updated successfully!
                </span>
              )}
            </div>
          </form>
        </div>
        )}

        {/* Security & Password Reset Card */}
        {(mode === 'all' || mode === 'password') && (
        <div ref={passwordSectionRef} className="scroll-mt-6">
          <PasswordSecuritySection user={user} />
        </div>
        )}
      </div>
    </PortalLayout>
  );
};

const PasswordSecuritySection = ({ user }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', isError: false });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!newPassword) return;
    setLoading(true);
    setMsg({ text: '', isError: false });

    try {
      const res = await fetch('/api/users/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user?.id,
          email: user?.email,
          currentPassword,
          newPassword
        })
      });
      const data = await res.json();
      setLoading(false);
      if (res.ok && data.success) {
        setMsg({ text: '🔒 Password updated and encrypted with bcrypt successfully!', isError: false });
        setCurrentPassword('');
        setNewPassword('');
        setTimeout(() => setMsg({ text: '', isError: false }), 5000);
      } else {
        setMsg({ text: data.error || 'Failed to update password', isError: true });
      }
    } catch (err) {
      setLoading(false);
      setMsg({ text: 'Server error updating password', isError: true });
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-xl space-y-4 text-xs font-bold">
      <div className="flex items-center gap-3 pb-3 border-b border-[var(--border-light)]">
        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-extrabold text-[var(--text-primary)]">Security & Password Reset</h3>
          <p className="text-[11px] text-[var(--text-secondary)] font-normal">Update and encrypt your password with 256-bit bcrypt hashing</p>
        </div>
      </div>

      {msg.text && (
        <div className={`p-3 rounded-xl border text-xs font-bold animate-fade-in ${
          msg.isError ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
        }`}>
          {msg.text}
        </div>
      )}

      <form onSubmit={handlePasswordChange} className="space-y-4 text-[var(--text-secondary)]">
        <div>
          <label className="block mb-1">Current Password</label>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] relative">
            <input 
              type={showCurrentPass ? "text" : "password"} 
              value={currentPassword} 
              onChange={(e) => setCurrentPassword(e.target.value)} 
              placeholder="Enter current password"
              className="w-full bg-transparent text-xs text-[var(--text-primary)] outline-none pr-8 font-mono" 
            />
            <button
              type="button"
              onClick={() => setShowCurrentPass(!showCurrentPass)}
              className="absolute right-3 text-[var(--text-muted)] hover:text-amber-500 cursor-pointer"
              title={showCurrentPass ? "Hide Password" : "Show Password"}
            >
              {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block mb-1">New Encrypted Password</label>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] relative">
            <input 
              type={showNewPass ? "text" : "password"} 
              required
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              placeholder="Enter new strong password"
              className="w-full bg-transparent text-xs text-[var(--text-primary)] outline-none pr-8 font-mono" 
            />
            <button
              type="button"
              onClick={() => setShowNewPass(!showNewPass)}
              className="absolute right-3 text-[var(--text-muted)] hover:text-amber-500 cursor-pointer"
              title={showNewPass ? "Hide Password" : "Show Password"}
            >
              {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="btn btn-primary py-2.5 px-5 text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
          <span>{loading ? 'Encrypting & Saving...' : 'Update & Encrypt Password'}</span>
        </button>
      </form>
    </div>
  );
};
