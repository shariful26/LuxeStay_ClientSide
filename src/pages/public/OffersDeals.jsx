import React, { useState, useEffect } from 'react';
import { Tag, Sparkles, Copy, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const OffersDeals = () => {
  const [offers, setOffers] = useState([]);
  const [copiedCode, setCopiedCode] = useState('');

  useEffect(() => {
    fetch('/api/offers')
      .then(res => res.json())
      .then(data => setOffers(data))
      .catch(() => {});
  }, []);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 3000);
  };

  return (
    <div className="container pt-16 pb-12 space-y-10 animate-fade-in">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-extrabold uppercase tracking-widest text-amber-500 block pt-4">Exclusive Promotions</span>
        <h1 className="text-4xl font-extrabold text-[var(--text-primary)]">Offers & Promo Deals</h1>
        <p className="text-sm text-[var(--text-secondary)]">Save big on luxury villas, overwater bungalows, and ski resorts with our promo voucher codes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {offers.map(offer => (
          <div key={offer.id} className="rounded-3xl bg-[var(--bg-card)] border border-[var(--border-light)] overflow-hidden shadow-lg space-y-4 p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="relative h-48 rounded-2xl overflow-hidden">
                <img src={offer.image} alt={offer.title} className="w-full h-full object-cover" />
                <span className="absolute top-3 left-3 badge badge-gold">{offer.category}</span>
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)]">{offer.title}</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{offer.description}</p>
            </div>

            <div className="pt-4 border-t border-[var(--border-light)] space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] font-mono text-xs font-extrabold">
                <span className="text-amber-500">{offer.code}</span>
                <button 
                  onClick={() => handleCopy(offer.code)}
                  className="flex items-center gap-1 text-[11px] text-[var(--text-primary)] hover:text-amber-500 font-sans font-bold"
                >
                  {copiedCode === offer.code ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedCode === offer.code ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>

              <Link to="/hotels" className="w-full btn btn-primary py-2.5 text-xs">
                Book with Discount
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
