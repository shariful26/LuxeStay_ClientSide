import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const ContactUs = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
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
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-light)] space-y-4">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">{t('contact')}</h3>
            <div className="space-y-3 text-xs text-[var(--text-secondary)] font-semibold">
              <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-amber-500" /> +1 (800) 555-LUXE</div>
              <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-amber-500" /> support@luxestay.com</div>
              <div className="flex items-center gap-3"><MapPin className="w-4 h-4 text-amber-500" /> 750 5th Avenue, New York, NY 10019</div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-xl">
          {submitted ? (
            <div className="py-12 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-xl font-bold text-[var(--text-primary)]">Message Received!</h3>
              <p className="text-xs text-[var(--text-secondary)]">Our luxury concierge team will respond within 2 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Your Name</label>
                  <input type="text" required className="w-full p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-xs text-[var(--text-primary)] outline-none" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">{t('email')}</label>
                  <input type="email" required className="w-full p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-xs text-[var(--text-primary)] outline-none" placeholder="john@example.com" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Subject</label>
                <input type="text" required className="w-full p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-xs text-[var(--text-primary)] outline-none" placeholder="Reservation Inquiry" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Message</label>
                <textarea rows="5" required className="w-full p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-xs text-[var(--text-primary)] outline-none" placeholder="How can we assist your stay?"></textarea>
              </div>
              <button type="submit" className="btn btn-primary py-3 px-8 text-xs flex items-center gap-2 cursor-pointer">
                <Send className="w-4 h-4" /> Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
