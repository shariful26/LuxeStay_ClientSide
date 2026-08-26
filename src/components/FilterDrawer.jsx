import React from 'react';
import { X, SlidersHorizontal, RotateCcw, Check, Star } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

export const FilterDrawer = ({ isOpen, onClose, filters, setFilters, onReset }) => {
  const { formatPrice } = useCurrency();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm h-full bg-[var(--bg-card)] border-l border-[var(--border-light)] p-6 overflow-y-auto space-y-6 flex flex-col justify-between shadow-2xl">
        
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[var(--border-light)]">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Filter Stays</h3>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)]">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-[var(--text-primary)]">
              <span>Max Price Per Night</span>
              <span className="text-amber-500 font-extrabold">{formatPrice(filters.maxPrice)}</span>
            </div>
            <input 
              type="range" 
              min="100" 
              max="1500" 
              step="50"
              value={filters.maxPrice} 
              onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
              <span>$100</span>
              <span>$1,500+</span>
            </div>
          </div>

          {/* Star Rating */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Minimum Star Rating</label>
            <div className="flex gap-2">
              {[5, 4, 3].map(stars => (
                <button
                  key={stars}
                  onClick={() => setFilters({ ...filters, rating: stars })}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1 transition-all ${
                    filters.rating === stars 
                      ? 'border-amber-500 bg-amber-500/10 text-amber-500' 
                      : 'border-[var(--border-light)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
                  }`}
                >
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{stars} Stars</span>
                </button>
              ))}
            </div>
          </div>

          {/* Amenities Checkboxes */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Popular Amenities</label>
            {['Infinity Pool', 'Private Beach', 'Luxury Spa', 'Free Wi-Fi', 'Ski-In/Ski-Out', 'Onsen Hot Spring'].map(amenity => {
              const checked = filters.amenities.includes(amenity);
              return (
                <div 
                  key={amenity}
                  onClick={() => {
                    const updated = checked 
                      ? filters.amenities.filter(a => a !== amenity)
                      : [...filters.amenities, amenity];
                    setFilters({ ...filters, amenities: updated });
                  }}
                  className="flex items-center gap-3 cursor-pointer text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    checked ? 'bg-amber-500 border-amber-500 text-white' : 'border-[var(--border-light)] bg-[var(--bg-tertiary)]'
                  }`}>
                    {checked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span>{amenity}</span>
                </div>
              );
            })}
          </div>

        </div>

        {/* Footer buttons */}
        <div className="pt-4 border-t border-[var(--border-light)] flex gap-3">
          <button onClick={onReset} className="w-1/3 btn btn-secondary text-xs py-3 flex items-center justify-center gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
          <button onClick={onClose} className="w-2/3 btn btn-primary text-xs py-3">
            Apply Filters
          </button>
        </div>

      </div>
    </div>
  );
};
