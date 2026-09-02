import React, { useState, useEffect } from 'react';
import { Tag, Sparkles, Copy, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { getInstantData, fetchInstantData } from '../../utils/instantCache';

export const OffersDeals = () => {
  const { t } = useLanguage();
  const [offers, setOffers] = useState(() => getInstantData('offers', []));
  const [copiedCode, setCopiedCode] = useState('');

  useEffect(() => {
    fetchInstantData('/api/offers', 'offers', setOffers);
  }, []);

  const safeOffers = Array.isArray(offers) ? offers : [];
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const totalPages = Math.ceil(safeOffers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOffers = safeOffers.slice(indexOfFirstItem, indexOfLastItem);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 3000);
  };

  return (
    <div className="container pt-16 pb-12 space-y-10 animate-fade-in">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-extrabold uppercase tracking-widest text-amber-500 block pt-4">{t('exclusivePromo')}</span>
        <h1 className="text-4xl font-extrabold text-[var(--text-primary)]">{t('offers')} & {t('spotlightTitle')}</h1>
        <p className="text-sm text-[var(--text-secondary)]">{t('spotlightSub')}</p>
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {currentOffers.map(offer => (
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
                    className="flex items-center gap-1 text-[11px] text-[var(--text-primary)] hover:text-amber-500 font-sans font-bold cursor-pointer"
                  >
                    {copiedCode === offer.code ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedCode === offer.code ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>

                <Link to="/hotels" className="w-full btn btn-primary py-2.5 text-xs text-center block">
                  {t('bookNow')}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-[var(--border-light)] text-xs font-bold text-[var(--text-secondary)]">
            <span>
              Showing <strong className="text-[var(--text-primary)]">{indexOfFirstItem + 1}</strong>–<strong className="text-[var(--text-primary)]">{Math.min(indexOfLastItem, safeOffers.length)}</strong> of <strong className="text-[var(--text-primary)]">{safeOffers.length}</strong> Offers
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-xl border border-[var(--border-light)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all font-bold"
              >
                Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center justify-center ${
                    currentPage === pageNum
                      ? 'bg-amber-500 text-white shadow-xs scale-105'
                      : 'bg-[var(--bg-card)] border border-[var(--border-light)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-xl border border-[var(--border-light)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all font-bold"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
