import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Users, SlidersHorizontal, Bed, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const DESTINATION_OPTIONS = [
  { value: '', label: 'All Destinations' },
  { value: 'santorini', label: 'Santorini, Greece' },
  { value: 'maldives', label: 'Maldives Lagoon' },
  { value: 'new-york', label: 'New York, USA' },
  { value: 'kyoto', label: 'Kyoto, Japan' },
  { value: 'swiss-alps', label: 'Swiss Alps' },
  { value: 'bali', label: 'Bali, Indonesia' }
];

const GUEST_OPTIONS = [
  { value: 1, label: '1 Solo Traveler' },
  { value: 2, label: '2 Guests (Couple Suite)' },
  { value: 4, label: '4 Guests (Family Villa)' },
  { value: 6, label: '6+ Guests (Grand Penthouse)' }
];

const CATEGORY_OPTIONS = [
  { value: '', label: 'All Luxury Types' },
  { value: 'Resort & Spa', label: 'Resort & Spa' },
  { value: 'Overwater Villa', label: 'Overwater Villa' },
  { value: 'City Luxury Hotel', label: 'City Luxury' },
  { value: 'Boutique Ryokan', label: 'Boutique Ryokan' },
  { value: 'Ski Resort', label: 'Ski Resort Chalet' }
];

export const SearchBar = ({ onFilterClick, defaultDestination = '', defaultCategory = '' }) => {
  const { t } = useLanguage();
  const [destination, setDestination] = useState(defaultDestination);

  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const getTomorrowStr = () => new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [dates, setDates] = useState({
    checkIn: getTodayStr(),
    checkOut: getTomorrowStr()
  });
  const [guests, setGuests] = useState(2);
  const [category, setCategory] = useState(defaultCategory);
  const navigate = useNavigate();

  // Refs for Date Pickers
  const checkInRef = useRef(null);
  const checkOutRef = useRef(null);

  // Hover Dropdown States
  const [activeDropdown, setActiveDropdown] = useState(null); // 'dest', 'guests', 'cat'

  const todayStr = getTodayStr();
  const minCheckOutStr = dates.checkIn
    ? new Date(new Date(dates.checkIn).getTime() + 86400000).toISOString().split('T')[0]
    : todayStr;

  const handleCheckInChange = (e) => {
    const newCheckIn = e.target.value;
    if (!newCheckIn) return;

    let newCheckOut = dates.checkOut;
    if (new Date(newCheckIn) >= new Date(newCheckOut)) {
      const nextDay = new Date(newCheckIn);
      nextDay.setDate(nextDay.getDate() + 1);
      newCheckOut = nextDay.toISOString().split('T')[0];
    }

    setDates({ checkIn: newCheckIn, checkOut: newCheckOut });
  };

  const handleCheckOutChange = (e) => {
    const newCheckOut = e.target.value;
    if (!newCheckOut) return;
    if (new Date(newCheckOut) <= new Date(dates.checkIn)) return;

    setDates({ ...dates, checkOut: newCheckOut });
  };

  const calculateNights = () => {
    if (!dates.checkIn || !dates.checkOut) return 1;
    const diff = new Date(dates.checkOut).getTime() - new Date(dates.checkIn).getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (destination) params.append('destination', destination);
    if (category) params.append('category', category);
    navigate(`/hotels?${params.toString()}`);
  };

  const selectedDestLabel = DESTINATION_OPTIONS.find(o => o.value === destination)?.label || 'All Destinations';
  const selectedCatLabel = CATEGORY_OPTIONS.find(o => o.value === category)?.label || 'All Luxury Types';
  const nightsCount = calculateNights();

  return (
    <form 
      onSubmit={handleSearch}
      className="p-3.5 sm:p-5 rounded-3xl bg-[var(--glass-bg)] border border-[var(--glass-border)] backdrop-blur-2xl shadow-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 w-full text-left relative z-30 ring-1 ring-white/10"
    >
      
      {/* 1. Destination Field with Hover Dropdown */}
      <div 
        onMouseEnter={() => setActiveDropdown('dest')}
        onMouseLeave={() => setActiveDropdown(null)}
        className="lg:col-span-3 relative"
      >
        <div 
          onClick={() => setActiveDropdown(prev => prev === 'dest' ? null : 'dest')}
          className="flex items-center gap-3 p-3.5 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] hover:border-amber-500/60 transition-all shadow-xs cursor-pointer h-full"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <label className="block text-[10px] font-extrabold uppercase tracking-widest text-amber-500 mb-0.5 whitespace-nowrap cursor-pointer">
              {t('allDestinations')}
            </label>
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)] truncate">
                {selectedDestLabel}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] flex-shrink-0 ml-1" />
            </div>
          </div>
        </div>

        {/* Hover Dropdown Menu */}
        {activeDropdown === 'dest' && (
          <div className="absolute top-full left-0 right-0 mt-2 z-50 p-2 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-2xl space-y-1 text-xs animate-fade-in">
            {DESTINATION_OPTIONS.map(opt => (
              <div
                key={opt.value}
                onClick={() => {
                  setDestination(opt.value);
                  setActiveDropdown(null);
                }}
                className={`p-2.5 rounded-xl cursor-pointer flex items-center justify-between font-bold transition-all ${
                  destination === opt.value 
                    ? 'bg-amber-500 text-white shadow-md' 
                    : 'text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                }`}
              >
                <span>{opt.value === '' ? t('allDestinations') : opt.label}</span>
                {destination === opt.value && <Check className="w-3.5 h-3.5" />}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Dates Field with Compact Sleek 2-Pill Design */}
      <div className="lg:col-span-4 flex items-center gap-2.5 p-3 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] hover:border-amber-500/60 transition-all shadow-xs h-full min-w-0 relative">
        
        {/* Small Corner Stay Night Badge */}
        <span className="absolute -top-2 right-3 bg-amber-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full shadow-md pointer-events-none border border-amber-300 z-10 flex items-center gap-0.5">
          ✨ {nightsCount} {nightsCount === 1 ? t('perNight') : `${nightsCount} ${t('perNight')}s`}
        </span>

        <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
          <Calendar className="w-4 h-4" />
        </div>
        
        <div className="flex-1 grid grid-cols-2 gap-1.5 min-w-0">
          
          {/* Check-In Clickable Pill */}
          <div 
            onClick={() => {
              try { checkInRef.current?.showPicker(); } catch (e) { checkInRef.current?.focus(); }
            }}
            className="p-1.5 px-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-light)] hover:border-amber-500 transition-all cursor-pointer relative group flex flex-col justify-center min-w-0 shadow-2xs"
          >
            <span className="block text-[8px] font-black uppercase tracking-wider text-amber-500 truncate">
              {t('checkIn')}
            </span>
            <span className="text-xs font-bold text-[var(--text-primary)] group-hover:text-amber-500 transition-colors truncate">
              {formatDisplayDate(dates.checkIn)}
            </span>
            <input 
              type="date" 
              ref={checkInRef} 
              value={dates.checkIn} 
              onChange={handleCheckInChange}
              min={todayStr}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-20"
            />
          </div>

          {/* Check-Out Clickable Pill */}
          <div 
            onClick={() => {
              try { checkOutRef.current?.showPicker(); } catch (e) { checkOutRef.current?.focus(); }
            }}
            className="p-1.5 px-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-light)] hover:border-amber-500 transition-all cursor-pointer relative group flex flex-col justify-center min-w-0 shadow-2xs"
          >
            <span className="block text-[8px] font-black uppercase tracking-wider text-amber-500 truncate">
              {t('checkOut')}
            </span>
            <span className="text-xs font-bold text-[var(--text-primary)] group-hover:text-amber-500 transition-colors truncate">
              {formatDisplayDate(dates.checkOut)}
            </span>
            <input 
              type="date" 
              ref={checkOutRef} 
              value={dates.checkOut} 
              onChange={handleCheckOutChange}
              min={minCheckOutStr}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-20"
            />
          </div>

        </div>
      </div>

      {/* 3. Guests Field with Hover Dropdown */}
      <div 
        onMouseEnter={() => setActiveDropdown('guests')}
        onMouseLeave={() => setActiveDropdown(null)}
        className="lg:col-span-2 relative"
      >
        <div 
          onClick={() => setActiveDropdown(prev => prev === 'guests' ? null : 'guests')}
          className="flex items-center gap-3 p-3.5 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] hover:border-amber-500/60 transition-all shadow-xs cursor-pointer h-full"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <label className="block text-[10px] font-extrabold uppercase tracking-widest text-amber-500 mb-0.5 whitespace-nowrap cursor-pointer">
              {t('guests')}
            </label>
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)] truncate">
                {guests} {t('guests')}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] flex-shrink-0 ml-1" />
            </div>
          </div>
        </div>

        {/* Hover Dropdown Menu */}
        {activeDropdown === 'guests' && (
          <div className="absolute top-full left-0 right-0 mt-2 z-50 p-2 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-2xl space-y-1 text-xs animate-fade-in">
            {GUEST_OPTIONS.map(opt => (
              <div
                key={opt.value}
                onClick={() => {
                  setGuests(opt.value);
                  setActiveDropdown(null);
                }}
                className={`p-2.5 rounded-xl cursor-pointer flex items-center justify-between font-bold transition-all ${
                  guests === opt.value 
                    ? 'bg-amber-500 text-white shadow-md' 
                    : 'text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                }`}
              >
                <span>{opt.label}</span>
                {guests === opt.value && <Check className="w-3.5 h-3.5" />}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Room Property Type with Hover Dropdown */}
      <div 
        onMouseEnter={() => setActiveDropdown('cat')}
        onMouseLeave={() => setActiveDropdown(null)}
        className="lg:col-span-2 relative"
      >
        <div 
          onClick={() => setActiveDropdown(prev => prev === 'cat' ? null : 'cat')}
          className="flex items-center gap-3 p-3.5 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] hover:border-amber-500/60 transition-all shadow-xs cursor-pointer h-full"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
            <Bed className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <label className="block text-[10px] font-extrabold uppercase tracking-widest text-amber-500 mb-0.5 whitespace-nowrap cursor-pointer">
              {t('propertyType')}
            </label>
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)] truncate">
                {category === '' ? t('allTypes') : selectedCatLabel}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] flex-shrink-0 ml-1" />
            </div>
          </div>
        </div>

        {/* Hover Dropdown Menu */}
        {activeDropdown === 'cat' && (
          <div className="absolute top-full left-0 right-0 mt-2 z-50 p-2 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-2xl space-y-1 text-xs animate-fade-in">
            {CATEGORY_OPTIONS.map(opt => (
              <div
                key={opt.value}
                onClick={() => {
                  setCategory(opt.value);
                  setActiveDropdown(null);
                }}
                className={`p-2.5 rounded-xl cursor-pointer flex items-center justify-between font-bold transition-all ${
                  category === opt.value 
                    ? 'bg-amber-500 text-white shadow-md' 
                    : 'text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                }`}
              >
                <span>{opt.label}</span>
                {category === opt.value && <Check className="w-3.5 h-3.5" />}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Submit Search Button / Filters */}
      <div className="sm:col-span-2 lg:col-span-12 flex items-center gap-3 pt-1">
        {onFilterClick && (
          <button 
            type="button" 
            onClick={onFilterClick}
            className="p-3.5 rounded-2xl border border-[var(--border-light)] bg-[var(--bg-tertiary)] hover:border-amber-500 text-[var(--text-primary)] transition-all shadow-xs flex-shrink-0 cursor-pointer"
            title="Advanced Filters"
          >
            <SlidersHorizontal className="w-5 h-5 text-amber-500" />
          </button>
        )}
        <button 
          type="submit" 
          className="flex-1 py-3.5 px-8 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
        >
          <Search className="w-5 h-5" />
          <span>{t('searchButton')}</span>
        </button>
      </div>

    </form>
  );
};
