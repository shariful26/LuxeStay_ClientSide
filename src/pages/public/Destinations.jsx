import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, Star } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { getInstantData, fetchInstantData } from '../../utils/instantCache';

export const Destinations = () => {
  const { t } = useLanguage();
  const [destinations, setDestinations] = useState(() => getInstantData('destinations', []));

  useEffect(() => {
    fetchInstantData('/api/destinations', 'destinations', setDestinations);
  }, []);

  const safeDestinations = Array.isArray(destinations) ? destinations : [];
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const totalPages = Math.ceil(safeDestinations.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDestinations = safeDestinations.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="container pt-16 pb-12 space-y-10 animate-fade-in">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-extrabold uppercase tracking-widest text-amber-500 block pt-4">{t('globalDestinations') || 'World Travel Guide'}</span>
        <h1 className="text-4xl font-extrabold text-[var(--text-primary)]">{t('exploreWorld') || 'Explore Travel Destinations'}</h1>
        <p className="text-sm text-[var(--text-secondary)]">Discover handpicked luxury resorts and boutique retreats across the world's most breathtaking locations.</p>
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {currentDestinations.map(dest => (
            <Link 
              key={dest.id} 
              to={`/destinations/${dest.slug}`}
              className="group relative h-96 rounded-3xl overflow-hidden shadow-xl border border-[var(--border-light)] flex items-end p-6"
            >
              <img 
                src={dest.image} 
                alt={dest.name} 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 brightness-[0.65]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
              
              <div className="relative z-10 space-y-2 text-white">
                <span className="badge badge-gold text-[10px]">{dest.country}</span>
                <h2 className="text-3xl font-extrabold group-hover:text-amber-400 transition-colors">{dest.name}</h2>
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{dest.description || dest.tagline}</p>
                <div className="pt-2 flex items-center justify-between border-t border-white/20 text-xs font-bold text-amber-400">
                  <span>{dest.hotelCount} {t('properties') || 'Properties'}</span>
                  <span className="flex items-center gap-1">
                    <span>{t('explore') || 'Explore'}</span> <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-[var(--border-light)] text-xs font-bold text-[var(--text-secondary)]">
            <span>
              Showing <strong className="text-[var(--text-primary)]">{indexOfFirstItem + 1}</strong>–<strong className="text-[var(--text-primary)]">{Math.min(indexOfLastItem, safeDestinations.length)}</strong> of <strong className="text-[var(--text-primary)]">{safeDestinations.length}</strong> Destinations
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
