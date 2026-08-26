import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQS = [
  { q: "How do I receive my digital stay voucher?", a: "Immediately after completing your booking checkout, your official Digital Stay Voucher with a unique QR code will pop up and remain accessible in your Customer Dashboard." },
  { q: "Can I cancel or modify my luxury suite reservation?", a: "Yes, 95% of our luxury properties offer free cancellation up to 48 hours prior to the check-in date directly from your Customer Dashboard." },
  { q: "How do promo coupon codes work?", a: "Simply enter any valid promo code (e.g. SUMMER20 for 20% off) in the booking checkout modal to instantly recalculate your total." },
  { q: "Are taxes and resort fees included in the nightly price?", a: "All mandatory taxes and estimated resort fees are clearly itemized prior to final payment confirmation." }
];

export const FAQ = () => {
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <div className="container max-w-3xl pt-16 pb-12 space-y-8 animate-fade-in">
      <div className="text-center space-y-3">
        <span className="text-xs font-extrabold uppercase tracking-widest text-amber-500 block pt-4">Help Center</span>
        <h1 className="text-4xl font-extrabold text-[var(--text-primary)]">Frequently Asked Questions</h1>
        <p className="text-sm text-[var(--text-secondary)]">Find answers regarding booking, stay vouchers, and cancellation rules.</p>
      </div>

      <div className="space-y-4">
        {FAQS.map((faq, idx) => (
          <div 
            key={idx} 
            className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-light)] overflow-hidden shadow-sm transition-colors"
          >
            <button 
              onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
              className="w-full p-5 text-left flex items-center justify-between font-bold text-sm text-[var(--text-primary)]"
            >
              <span>{faq.q}</span>
              <ChevronDown className={`w-4 h-4 text-amber-500 transition-transform ${openIdx === idx ? 'rotate-180' : ''}`} />
            </button>
            {openIdx === idx && (
              <div className="px-5 pb-5 text-xs text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-light)] pt-3">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
