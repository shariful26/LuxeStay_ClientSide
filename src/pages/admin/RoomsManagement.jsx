import React, { useState, useEffect } from 'react';
import { PortalLayout } from '../../components/PortalLayout';
import { useCurrency } from '../../context/CurrencyContext';
import { Bed, Maximize2, Users, Sparkles, ChevronLeft, ChevronRight, Search, ShieldCheck, Crown, Waves, Home } from 'lucide-react';

import { getInstantData } from '../../utils/instantCache';

export const RoomsManagement = () => {
  const [rooms, setRooms] = useState(() => getInstantData('rooms', []));
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const { formatPrice } = useCurrency();

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, typeFilter]);

  useEffect(() => {
    fetch('/api/rooms')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRooms(data);
          try { localStorage.setItem('luxestay_cache_rooms', JSON.stringify(data)); } catch (e) {}
        }
      })
      .catch(() => {});
  }, []);

  const renderTypeBadge = (type) => {
    const typeLower = String(type).toLowerCase();
    if (typeLower.includes('presidential')) {
      return (
        <span className="px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/25 font-bold uppercase tracking-wider text-[9px] inline-flex items-center gap-1">
          <Crown className="w-3 h-3" /> {type}
        </span>
      );
    } else if (typeLower.includes('suite')) {
      return (
        <span className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 font-bold uppercase tracking-wider text-[9px] inline-flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> {type}
        </span>
      );
    } else if (typeLower.includes('villa')) {
      return (
        <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 font-bold uppercase tracking-wider text-[9px] inline-flex items-center gap-1">
          <Waves className="w-3 h-3" /> {type}
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/25 font-bold uppercase tracking-wider text-[9px] inline-flex items-center gap-1">
        <Bed className="w-3 h-3" /> {type}
      </span>
    );
  };

  const filteredRooms = rooms.filter(r => {
    const matchesSearch = 
      r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.bedType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.view?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = 
      typeFilter === 'all' || 
      (typeFilter === 'presidential' && String(r.type).toLowerCase().includes('presidential')) ||
      (typeFilter === 'suite' && String(r.type).toLowerCase().includes('suite')) ||
      (typeFilter === 'villa' && String(r.type).toLowerCase().includes('villa')) ||
      (typeFilter === 'deluxe' && String(r.type).toLowerCase().includes('deluxe'));

    return matchesSearch && matchesType;
  });

  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRooms = filteredRooms.slice(indexOfFirstItem, indexOfLastItem);

  const presidentialCount = rooms.filter(r => String(r.type).toLowerCase().includes('presidential')).length;
  const suiteCount = rooms.filter(r => String(r.type).toLowerCase().includes('suite')).length;
  const villaCount = rooms.filter(r => String(r.type).toLowerCase().includes('villa')).length;

  return (
    <PortalLayout role="admin" title="Room Master Catalog">
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)]">Platform Room Master Catalog</h1>
        <p className="text-xs text-[var(--text-secondary)]">Master list of suites, specs, and base pricing across all platform properties</p>
      </div>

      {/* KPI Room Filter Boxes */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs font-bold">
        <div 
          onClick={() => setTypeFilter('all')} 
          className={`p-4 rounded-2xl border transition-all cursor-pointer select-none group ${
            typeFilter === 'all' 
              ? 'bg-amber-500/15 border-amber-500 text-amber-500 shadow-md ring-2 ring-amber-500/20' 
              : 'bg-[var(--bg-card)] border-[var(--border-light)] text-[var(--text-secondary)] hover:border-amber-500/40 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="group-hover:text-amber-500 transition-colors">Total Suites & Rooms</span>
            <Bed className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl font-extrabold text-[var(--text-primary)] block mt-1">{rooms.length}</span>
        </div>

        <div 
          onClick={() => setTypeFilter('presidential')} 
          className={`p-4 rounded-2xl border transition-all cursor-pointer select-none group ${
            typeFilter === 'presidential' 
              ? 'bg-purple-500/15 border-purple-500 text-purple-500 shadow-md ring-2 ring-purple-500/20' 
              : 'bg-[var(--bg-card)] border-[var(--border-light)] text-[var(--text-secondary)] hover:border-purple-500/40 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="group-hover:text-purple-500 transition-colors">Presidential & Royal</span>
            <Crown className="w-4 h-4 text-purple-500" />
          </div>
          <span className="text-2xl font-extrabold text-purple-500 block mt-1">{presidentialCount}</span>
        </div>

        <div 
          onClick={() => setTypeFilter('suite')} 
          className={`p-4 rounded-2xl border transition-all cursor-pointer select-none group ${
            typeFilter === 'suite' 
              ? 'bg-amber-500/15 border-amber-500 text-amber-500 shadow-md ring-2 ring-amber-500/20' 
              : 'bg-[var(--bg-card)] border-[var(--border-light)] text-[var(--text-secondary)] hover:border-amber-500/40 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="group-hover:text-amber-500 transition-colors">Executive Suites</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl font-extrabold text-amber-500 block mt-1">{suiteCount}</span>
        </div>

        <div 
          onClick={() => setTypeFilter('villa')} 
          className={`p-4 rounded-2xl border transition-all cursor-pointer select-none group ${
            typeFilter === 'villa' 
              ? 'bg-emerald-500/15 border-emerald-500 text-emerald-500 shadow-md ring-2 ring-emerald-500/20' 
              : 'bg-[var(--bg-card)] border-[var(--border-light)] text-[var(--text-secondary)] hover:border-emerald-500/40 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="group-hover:text-emerald-500 transition-colors">Private Villas</span>
            <Waves className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-2xl font-extrabold text-emerald-500 block mt-1">{villaCount}</span>
        </div>
      </div>

      {/* Search Bar & Type Quick Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative w-full sm:w-80">
            <input 
              type="text" 
              placeholder="Search room name, view, bed type..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-light)] text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-amber-500 transition-colors shadow-xs"
            />
            <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-3" />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'all', label: 'All Rooms', Icon: Home },
              { id: 'presidential', label: 'Presidential', Icon: Crown },
              { id: 'suite', label: 'Suites', Icon: Sparkles },
              { id: 'villa', label: 'Villas', Icon: Waves }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setTypeFilter(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  typeFilter === f.id
                    ? 'bg-slate-900 text-amber-400 shadow-xs border border-slate-800'
                    : 'bg-[var(--bg-card)] border border-[var(--border-light)] text-[var(--text-secondary)] hover:border-amber-500/40'
                }`}
              >
                <f.Icon className="w-3.5 h-3.5" />
                <span>{f.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs font-bold text-[var(--text-muted)] whitespace-nowrap self-end md:self-auto">
          Showing {filteredRooms.length} of {rooms.length} suites
        </div>
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
