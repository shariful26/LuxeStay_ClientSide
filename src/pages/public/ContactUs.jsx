import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

export const ContactUs = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="container pt-16 pb-12 space-y-10 animate-fade-in">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-extrabold uppercase tracking-widest text-amber-500 block pt-4">Get in Touch</span>
        <h1 className="text-4xl font-extrabold text-[var(--text-primary)]">24/7 Concierge Support Desk</h1>
        <p className="text-sm text-[var(--text-secondary)]">Have questions about your reservation or interested in joining as a hotel partner?</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-light)] space-y-4">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Contact Details</h3>
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
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Email Address</label>
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
              <button type="submit" className="btn btn-primary py-3 px-8 text-xs flex items-center gap-2">
                <Send className="w-4 h-4" /> Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
