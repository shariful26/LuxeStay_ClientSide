import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, LayoutGrid, List, Sparkles, MapPin, Search, Star, Check, RotateCcw } from 'lucide-react';
import { HotelCard } from '../../components/HotelCard';
import { SearchBar } from '../../components/SearchBar';
import { useLanguage } from '../../context/LanguageContext';

const CATEGORY_PILLS = [
  { label: 'All Stays', category: '' },
  { label: 'Overwater Villas', category: 'Overwater Villa' },
  { label: 'Resorts & Spas', category: 'Resort & Spa' },
  { label: 'City Sky Towers', category: 'City Luxury Hotel' },
  { label: 'Boutique Ryokans', category: 'Boutique Ryokan' },
  { label: 'Ski Chalets', category: 'Ski Resort' }
];

const ALL_AMENITIES = [
  "Infinity Pool", "Private Beach", "Luxury Spa", "Free Wi-Fi",
  "Butler Service", "Helipad Access", "Michelin Dining", "Ski-In Ski-Out"
];

export const HotelsCatalog = () => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [hotels, setHotels] = useState(() => {
    try {
      const cached = localStorage.getItem('luxestay_cached_hotels');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });
  const [loading, setLoading] = useState(() => {
    try {
      const cached = localStorage.getItem('luxestay_cached_hotels');
      return cached ? false : true;
    } catch (e) {
      return true;
    }
  });
  const [viewMode, setViewMode] = useState('list'); // Default Booking.com list view
  const [sortBy, setSortBy] = useState('rating');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const destQuery = searchParams.get('destination') || '';
  const categoryQuery = searchParams.get('category') || '';

  const [filters, setFilters] = useState({
    maxPrice: 2500,
    rating: 0,
    category: categoryQuery || '',
    amenities: []
  });

  useEffect(() => {
    setFilters(prev => ({ ...prev, category: categoryQuery }));
  }, [categoryQuery]);

  useEffect(() => {
    let url = '/api/hotels?isPublic=true&';
    if (destQuery) url += `destination=${destQuery}&`;
    if (filters.category) url += `category=${filters.category}&`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          try {
            localStorage.setItem('luxestay_cached_hotels', JSON.stringify(data));
          } catch (e) {}
        }
        let filtered = (Array.isArray(data) ? data : []).filter(h => {
          if (!h.status) return true;
          const s = String(h.status).toLowerCase();
          const isApproved = s === 'approved' || s === 'active' || (s !== 'pending approval' && s !== 'pending' && s !== 'rejected');
          return isApproved && (h.pricePerNight || 0) <= filters.maxPrice;
        });

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          filtered = filtered.filter(h =>
            h.name?.toLowerCase().includes(q) ||
            h.destination?.toLowerCase().includes(q) ||
            h.category?.toLowerCase().includes(q)
          );
        }

        if (filters.rating > 0) {
          filtered = filtered.filter(h => (h.rating || 5.0) >= filters.rating);
        }

        if (filters.amenities.length > 0) {
          filtered = filtered.filter(h =>
            filters.amenities.every(a => h.amenities && h.amenities.includes(a))
          );
        }

        // Sorting
        if (sortBy === 'price-low') {
          filtered.sort((a, b) => a.pricePerNight - b.pricePerNight);
        } else if (sortBy === 'price-high') {
          filtered.sort((a, b) => b.pricePerNight - a.pricePerNight);
        } else {
          filtered.sort((a, b) => (b.rating || 5) - (a.rating || 5));
        }

        setHotels(filtered);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [destQuery, filters, sortBy, searchQuery]);

  const toggleAmenity = (amenity) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleCategorySelect = (cat) => {
    setFilters(prev => ({ ...prev, category: cat }));
  };

  const handleResetFilters = () => {
    setFilters({ maxPrice: 2500, rating: 0, category: '', amenities: [] });
    setSearchQuery('');
  };
  useEffect(() => {
    setCurrentPage(1);
  }, [hotels]);

  const safeHotels = Array.isArray(hotels) ? hotels : [];
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentHotels = safeHotels.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(safeHotels.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const categoryPills = [
    { label: t('allSuites'), category: '' },
    { label: t('overwaterVillas'), category: 'Overwater Villa' },
    { label: t('resortSpas'), category: 'Resort & Spa' },
    { label: t('citySkyTowers'), category: 'City Luxury Hotel' },
    { label: t('zenRyokans'), category: 'Boutique Ryokan' },
    { label: t('skiChalets'), category: 'Ski Resort' }
  ];

  const ratingOptions = [
    { label: t('anyRating'), value: 0 },
    { label: t('exceptional'), value: 4.8 },
    { label: t('superbRating'), value: 4.5 },
    { label: t('veryGood'), value: 4.0 }
  ];

  return (
    <div className="container pt-8 sm:pt-10 pb-8 space-y-8 animate-fade-in">

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-amber-500 text-xs font-bold uppercase tracking-wider pt-4">
          <Sparkles className="w-4 h-4" />
          <span>{t('curatedPortfolio')}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)]">{t('featuredSuites')}</h1>
        <p className="text-sm text-[var(--text-secondary)]">{hotels.length} {t('suitesFound')}</p>
      </div>

      {/* Top Search Bar */}
      <SearchBar defaultDestination={destQuery} defaultCategory={categoryQuery} />

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categoryPills.map(pill => (
          <button
            key={pill.label}
            onClick={() => handleCategorySelect(pill.category)}
            className={`px-4 py-2 rounded-full text-xs font-extrabold whitespace-nowrap transition-all border cursor-pointer ${filters.category === pill.category
                ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/30'
                : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-light)] hover:border-amber-500/50'
              }`}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Main 2-Column Booking.com Selection Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* LEFT SIDEBAR FILTER PANEL */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-xl space-y-6 sticky top-24">

            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-light)]">
              <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-amber-500" /> {t('filterTitle')}
              </h3>
              <button
                onClick={handleResetFilters}
                className="text-[11px] text-amber-500 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> {t('resetFilters')}
              </button>
            </div>

            {/* Keyword Search */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-[var(--text-muted)] uppercase tracking-wider block">
                {t('propertyType')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Resort, Villa, Santorini..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-xs font-semibold text-[var(--text-primary)] outline-none"
                />
                <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-3" />
              </div>
            </div>

            {/* Max Price Range Slider */}
            <div className="space-y-3 pt-4 border-t border-[var(--border-light)]">
              <div className="flex justify-between items-center text-xs font-extrabold">
                <span className="text-[var(--text-muted)] uppercase tracking-wider text-[10px]">{t('maxPrice')}</span>
                <span className="text-amber-500">{filters.maxPrice >= 2500 ? t('anyPrice') : `$${filters.maxPrice}`}</span>
              </div>
              <input
                type="range"
                min="100"
                max="2500"
                step="50"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-semibold">
                <span>$100</span>
                <span>$2,500+</span>
              </div>
            </div>

            {/* Minimum Star Rating */}
            <div className="space-y-3 pt-4 border-t border-[var(--border-light)]">
              <label className="text-xs font-extrabold text-[var(--text-muted)] uppercase tracking-wider block">
                {t('guestRating')}
              </label>
              <div className="space-y-2 text-xs font-bold">
                {ratingOptions.map(r => (
                  <label key={r.value} className="flex items-center gap-2 cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                    <input
                      type="radio"
                      name="ratingFilter"
                      checked={filters.rating === r.value}
                      onChange={() => setFilters({ ...filters, rating: r.value })}
                      className="accent-amber-500"
                    />
                    <span>{r.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Popular Amenities Checkboxes */}
            <div className="space-y-3 pt-4 border-t border-[var(--border-light)]">
              <label className="text-xs font-extrabold text-[var(--text-muted)] uppercase tracking-wider block">
                {t('amenities')}
              </label>
              <div className="space-y-2 text-xs font-semibold">
                {ALL_AMENITIES.map(item => {
                  const isChecked = filters.amenities.includes(item);
                  return (
                    <label key={item} className="flex items-center gap-2 cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleAmenity(item)}
                        className="accent-amber-500 rounded"
                      />
                      <span>{item}</span>
                    </label>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT CONTENT COLUMN: CONTROL BAR & LIST/GRID HOTELS */}
        <div className="lg:col-span-3 space-y-6">

          {/* Top Control Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-sm text-xs font-semibold">
            <div className="flex items-center gap-2">
              <span className="text-[var(--text-muted)]">{t('sortBy')}</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[var(--bg-tertiary)] text-[var(--text-primary)] p-2 rounded-xl border border-[var(--border-light)] outline-none cursor-pointer font-bold"
              >
                <option value="rating" className="bg-[var(--bg-card)] text-[var(--text-primary)]">{t('topRated')}</option>
                <option value="price-low" className="bg-[var(--bg-card)] text-[var(--text-primary)]">{t('priceLowHigh')}</option>
                <option value="price-high" className="bg-[var(--bg-card)] text-[var(--text-primary)]">{t('priceHighLow')}</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-[var(--text-muted)] font-bold">{hotels.length} {t('suitesFound')}</span>

              <div className="flex items-center p-1 rounded-xl border border-[var(--border-light)] bg-[var(--bg-tertiary)]">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg flex items-center gap-1 text-xs font-bold cursor-pointer ${viewMode === 'list' ? 'bg-amber-500 text-white shadow-sm' : 'text-[var(--text-muted)]'}`}
                  title="Booking.com Detailed List View"
                >
                  <List className="w-4 h-4" /> List
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg flex items-center gap-1 text-xs font-bold cursor-pointer ${viewMode === 'grid' ? 'bg-amber-500 text-white shadow-sm' : 'text-[var(--text-muted)]'}`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" /> Grid
                </button>
              </div>
            </div>
          </div>

          {/* Hotel Items Rendering */}
          {loading && hotels.length === 0 ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-56 bg-slate-200 dark:bg-slate-800/60 rounded-3xl border border-[var(--border-light)] p-6 flex flex-col justify-between" />
              ))}
            </div>
          ) : hotels.length === 0 ? (
            <div className="py-20 text-center space-y-4 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-light)] p-8">
              <MapPin className="w-12 h-12 mx-auto text-amber-500/40" />
              <h3 className="text-lg font-bold text-[var(--text-primary)]">No properties matching your criteria</h3>
              <p className="text-xs text-[var(--text-secondary)]">Try resetting price sliders or removing selected amenities.</p>
              <button onClick={handleResetFilters} className="btn btn-outline text-xs py-2 px-4 border-amber-500 text-amber-500">
                Clear Filter Selection
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-6'}>
                {currentHotels.map(hotel => (
                  <HotelCard key={hotel.id} hotel={hotel} viewMode={viewMode} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6 border-t border-[var(--border-light)] text-xs font-bold mt-8">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3.5 py-2.5 rounded-xl border border-[var(--border-light)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:border-amber-500 hover:text-amber-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
                  >
                    <span>&larr; Prev</span>
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                        currentPage === pageNum
                          ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20'
                          : 'border-[var(--border-light)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-amber-500 hover:text-amber-500'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3.5 py-2.5 rounded-xl border border-[var(--border-light)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:border-amber-500 hover:text-amber-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Next &rarr;</span>
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
