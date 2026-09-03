import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, CheckCircle2, ArrowLeft, MessageSquare, ShieldCheck, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

export const ContactUs = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Forward contact form submission directly into Admin Live Messages
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: user?.id || `guest_${Date.now()}`,
          senderName: formData.name,
          senderRole: user?.role || 'customer',
          senderAvatar: user?.avatar || '',
          recipientId: 'admin',
          recipientName: 'LuxeStay Super Admin',
          recipientRole: 'admin',
          text: `[Contact Request • ${formData.subject}] ${formData.message} (Contact Email: ${formData.email})`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
      });
    } catch (err) {
      console.error('Failed to post contact message to admin:', err);
    } finally {
      setSubmitted(true);
      setSubmitting(false);
    }
  };

  return (
    <div className="container pt-16 pb-12 space-y-10 animate-fade-in font-sans">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border-light)] bg-[var(--bg-card)] hover:bg-[var(--bg-tertiary)] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer shadow-xs hover:border-amber-500/40"
      >
        <ArrowLeft className="w-4 h-4 text-amber-500" />
        <span>Back to Previous Page</span>
      </button>

      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-extrabold uppercase tracking-widest text-amber-500 block pt-4">{t('contact')}</span>
        <h1 className="text-4xl font-extrabold text-[var(--text-primary)]">{t('concierge')}</h1>
        <p className="text-sm text-[var(--text-secondary)]">{t('conciergeSub')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Side: Contact Details & Direct Admin Chat */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-light)] space-y-4 shadow-sm">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">{t('contact')}</h3>
            <div className="space-y-3 text-xs text-[var(--text-secondary)] font-semibold">
              <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-amber-500" /> +1 (800) 555-LUXE</div>
              <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-amber-500" /> support@luxestay.com</div>
              <div className="flex items-center gap-3"><MapPin className="w-4 h-4 text-amber-500" /> 750 5th Avenue, New York, NY 10019</div>
            </div>
          </div>

          {/* Admin Live Messaging Option */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/15 via-[var(--bg-card)] to-[var(--bg-card)] border border-amber-500/30 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-[var(--text-primary)]">Admin Live Chat</h4>
                <span className="text-[10px] text-emerald-500 font-bold block">● Super Admin Active 24/7</span>
              </div>
            </div>
            <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
              Need immediate resolution or platform assistance? Open direct two-way messaging with the LuxeStay Administration.
            </p>
            <button
              type="button"
              onClick={() => {
                if (user?.role === 'admin') navigate('/admin/messages');
                else if (user?.role === 'manager') navigate('/manager/messages');
                else if (user?.role === 'customer') navigate('/customer/messages?recipient=admin');
                else navigate('/login?redirect=/customer/messages');
              }}
              className="w-full py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Launch Admin Live Chat</span>
            </button>
          </div>
        </div>

        {/* Right Side: Direct Contact Form (Submits straight to Admin Messages) */}
        <div className="lg:col-span-2 p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-xl">
          {submitted ? (
            <div className="py-12 text-center space-y-4 animate-fade-in">
              <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-xl font-black text-[var(--text-primary)]">Message Sent to Admin!</h3>
                <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto">
                  Your inquiry has been delivered directly into the <strong>Admin Live Message Box</strong>. A platform administrator will respond shortly.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (user?.role === 'customer') navigate('/customer/messages');
                  else if (user?.role === 'manager') navigate('/manager/messages');
                  else if (user?.role === 'admin') navigate('/admin/messages');
                  else navigate('/');
                }}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-amber-500 text-slate-950 font-black text-xs cursor-pointer shadow-md"
              >
                <MessageSquare className="w-4 h-4" />
                <span>View My Messages</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Your Name</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required 
                    className="w-full p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-xs text-[var(--text-primary)] outline-none focus:border-amber-500" 
                    placeholder="John Doe" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">{t('email')}</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required 
                    className="w-full p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-xs text-[var(--text-primary)] outline-none focus:border-amber-500" 
                    placeholder="john@example.com" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Subject</label>
                <input 
                  type="text" 
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required 
                  className="w-full p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-xs text-[var(--text-primary)] outline-none focus:border-amber-500" 
                  placeholder="Reservation Inquiry or Hotel Partnership" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Message for Admin</label>
                <textarea 
                  rows="5" 
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required 
                  className="w-full p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-xs text-[var(--text-primary)] outline-none focus:border-amber-500" 
                  placeholder="Describe your inquiry in detail. This message will be sent directly to the Admin Dashboard..."
                ></textarea>
              </div>
              <button 
                type="submit" 
                disabled={submitting}
                className="btn btn-primary py-3 px-8 text-xs flex items-center gap-2 cursor-pointer font-black"
              >
                <Send className="w-4 h-4" /> 
                <span>{submitting ? 'Sending to Admin...' : 'Send Message to Admin'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
export default ContactUs;
