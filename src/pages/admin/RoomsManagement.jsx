import React, { useState, useEffect } from 'react';
import { PortalLayout } from '../../components/PortalLayout';
import { useCurrency } from '../../context/CurrencyContext';
import { Bed, Maximize2, Users, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

export const RoomsManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const { formatPrice } = useCurrency();

  useEffect(() => {
    fetch('/api/rooms')
      .then(res => res.json())
      .then(data => setRooms(data))
      .catch(() => {});
  }, []);

  const renderTypeBadge = (type) => {
    const typeLower = String(type).toLowerCase();
    if (typeLower.includes('presidential')) {
      return (
        <span className="px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/25 font-bold uppercase tracking-wider text-[9px]">
          👑 {type}
        </span>
      );
    } else if (typeLower.includes('suite')) {
      return (
        <span className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 font-bold uppercase tracking-wider text-[9px]">
          ✨ {type}
        </span>
      );
    } else if (typeLower.includes('villa')) {
      return (
        <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 font-bold uppercase tracking-wider text-[9px]">
          🌴 {type}
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/25 font-bold uppercase tracking-wider text-[9px]">
        🛏️ {type}
      </span>
    );
  };

  const totalPages = Math.ceil(rooms.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRooms = rooms.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <PortalLayout role="admin" title="Room Master Catalog">
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)]">Platform Room Master Catalog</h1>
        <p className="text-xs text-[var(--text-secondary)]">Master list of suites, specs, and base pricing across all platform properties</p>
      </div>

      <div className="space-y-6">
        <div className="rounded-3xl bg-[var(--bg-card)] border border-[var(--border-light)] overflow-hidden shadow-lg p-2 sm:p-4">
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th className="pl-6">Suite & View Details</th>
                  <th>Category Type</th>
                  <th>Capacity & Bedding</th>
                  <th>Dimensions</th>
                  <th>Nightly Rate</th>
                  <th className="pr-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-light)]">
                {currentRooms.map(r => {
                  const imageUrl = r.images?.[0] || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=400&q=80';
                  return (
                    <tr key={r.id} className="transition-all hover:bg-[var(--bg-tertiary)]/30">
                      <td className="pl-6 font-bold text-[var(--text-primary)]">
                        <div className="flex items-center gap-3 py-1">
                          <img 
                            src={imageUrl} 
                            alt={r.name} 
                            className="w-16 h-11 rounded-xl object-cover border border-[var(--border-light)] shadow-xs flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="text-sm font-extrabold block text-[var(--text-primary)] truncate">{r.name}</span>
                            <span className="text-[10px] text-[var(--text-muted)] font-bold block truncate">🌅 {r.view || 'Scenic View'}</span>
                          </div>
                        </div>
                      </td>
                      <td>{renderTypeBadge(r.type)}</td>
                      <td className="text-xs">
                        <div className="space-y-1 font-bold text-[var(--text-secondary)]">
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                            <span>{r.capacity} Guests Max</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)]">
                            <Bed className="w-3.5 h-3.5 text-[var(--text-muted)] flex-shrink-0" />
                            <span>{r.bedType}</span>
                          </div>
                        </div>
                      </td>
                      <td className="text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-[var(--text-secondary)]">
                          <Maximize2 className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                          <span>{r.size}</span>
                        </div>
                      </td>
                      <td className="font-extrabold text-amber-500 text-sm">
                        {formatPrice(r.price)}
                        <span className="text-[10px] text-[var(--text-muted)] font-bold block mt-0.5">/ night</span>
                      </td>
                      <td className="pr-6">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Available
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-[var(--border-light)]">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="btn btn-outline text-xs px-4 py-2 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    currentPage === page 
                      ? 'bg-amber-500 text-white shadow-md' 
                      : 'bg-transparent text-[var(--text-secondary)] border border-[var(--border-light)] hover:border-amber-500/40'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="btn btn-outline text-xs px-4 py-2 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </PortalLayout>
  );
};
