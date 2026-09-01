import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Heart, Sparkles, ChevronRight, ShieldCheck, Check, Coffee, Zap } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { useWishlist } from '../context/WishlistContext';
import { useLanguage } from '../context/LanguageContext';

export const HotelCard = ({ hotel, viewMode = 'grid' }) => {
  const { formatPrice } = useCurrency();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { t } = useLanguage();
  const isFav = isInWishlist(hotel.id);

  if (viewMode === 'list') {
    // BOOKING.COM STYLE HORIZONTAL ROW CARD (100% UNIFORM HEIGHT & WIDTH)
    return (
      <div className="group rounded-2xl bg-[var(--bg-card)] border border-[var(--border-light)] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row hover:-translate-y-0.5 md:h-[255px] w-full">
        
        {/* Left Thumbnail Image - 100% Uniform Height & Width */}
        <div className="relative w-full md:w-72 lg:w-80 h-56 md:h-full overflow-hidden flex-shrink-0">
          <img 
            src={hotel.images[0]} 
            alt={hotel.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-[0.96]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent md:hidden"></div>
          
          <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 max-w-[calc(100%-54px)] overflow-hidden z-10">
            {hotel.featured && (
              <span className="badge badge-gold shadow-md flex-shrink-0">
                <Sparkles className="w-3 h-3 text-amber-500" /> Featured
              </span>
            )}
            <span className="badge badge-navy glass-card border border-[var(--border-light)] text-[var(--text-primary)] font-bold text-[10px] truncate max-w-[130px]">
              {hotel.category}
            </span>
          </div>

          <button 
            onClick={() => toggleWishlist(hotel.id)}
            className={`absolute top-3.5 right-3.5 p-2 rounded-full backdrop-blur-md transition-all active:scale-90 z-20 flex-shrink-0 ${
              isFav 
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40' 
                : 'bg-slate-900/70 text-white hover:bg-rose-500 hover:shadow-lg'
            }`}
            title="Save to Wishlist"
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Middle & Right Content Row */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
            
            <div className="space-y-1.5 max-w-xl">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-500">
                <MapPin className="w-3.5 h-3.5" />
                <span className="truncate">{hotel.destination}</span>
                <span className="text-[var(--text-muted)] font-normal flex-shrink-0">• 0.5 km from center</span>
              </div>

              <Link to={`/hotels/${hotel.slug || hotel.id}`}>
                <h3 className="text-lg font-extrabold text-[var(--text-primary)] group-hover:text-amber-500 transition-colors line-clamp-1">
                  {hotel.name}
                </h3>
              </Link>

              <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed font-medium h-9 overflow-hidden">
                {hotel.description}
              </p>

              {/* Inclusions Badges (Booking.com style) */}
              <div className="flex flex-wrap gap-1.5 pt-1 text-[10px] font-bold">
                <span className="text-emerald-500 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  <Check className="w-3 h-3" /> {t('freeCancellation')}
                </span>
                <span className="text-amber-500 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                  <Coffee className="w-3 h-3" /> {t('freeBreakfast')}
                </span>
                <span className="text-blue-500 flex items-center gap-1 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                  <Zap className="w-3 h-3" /> {t('qrVoucher')}
                </span>
              </div>
            </div>

            {/* Score Box Right */}
            <div className="flex items-center md:flex-col md:items-end justify-between md:justify-start gap-2 text-right flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="text-right hidden md:block">
                  <span className="text-xs font-extrabold text-[var(--text-primary)] block">{t('superb')}</span>
                  <span className="text-[10px] text-[var(--text-muted)] font-semibold">{hotel.reviewCount || 340} {t('reviews')}</span>
                </div>
                <div className="px-2.5 py-1 rounded-xl bg-amber-500 text-white font-extrabold text-xs shadow-md shadow-amber-500/30 flex items-center gap-1">
                  <span>{hotel.rating || 4.9}</span>
                  <Star className="w-3 h-3 fill-current text-white" />
                </div>
              </div>
            </div>

          </div>

          {/* Pricing & View Suite CTA */}
          <div className="pt-2.5 border-t border-[var(--border-light)] flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[9px] uppercase font-bold tracking-wider text-[var(--text-muted)] block truncate">{t('nightlyRate')}</span>
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-xs text-[var(--text-muted)] line-through">{formatPrice(Math.round(hotel.pricePerNight * 1.2))}</span>
                <span className="text-xl font-extrabold text-amber-500">{formatPrice(hotel.pricePerNight)}</span>
                <span className="text-[11px] text-[var(--text-muted)] font-bold">/ {t('perNight')}</span>
              </div>
            </div>

            <Link 
              to={`/hotels/${hotel.slug || hotel.id}`}
              className="btn btn-primary text-xs py-2 px-3.5 sm:px-4 flex items-center gap-1.5 shadow-md shadow-amber-500/25 h-9 shrink-0 whitespace-nowrap"
            >
              <span>{t('viewSuite')}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

        </div>

      </div>
    );
  }

  // DEFAULT GRID CARD
  return (
    <div className="group rounded-2xl bg-[var(--bg-card)] border border-[var(--border-light)] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col hover:-translate-y-0.5">
      
      {/* Image Banner Container */}
      <div className="relative h-56 overflow-hidden">
        <img 
          src={hotel.images[0]} 
          alt={hotel.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-[0.96]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
        
        {/* Category & Featured Badge */}
        <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 max-w-[calc(100%-54px)] overflow-hidden z-10">
          {hotel.featured && (
            <span className="badge badge-gold shadow-md flex-shrink-0">
              <Sparkles className="w-3 h-3 text-amber-500" /> Featured
            </span>
          )}
          <span className="badge badge-navy glass-card border border-[var(--border-light)] text-[var(--text-primary)] font-bold text-[10px] truncate max-w-[130px]">
            {hotel.category}
          </span>
        </div>

        {/* Wishlist Button */}
        <button 
          onClick={() => toggleWishlist(hotel.id)}
          className={`absolute top-3.5 right-3.5 p-2 rounded-full backdrop-blur-md transition-all active:scale-90 z-20 flex-shrink-0 ${
            isFav 
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40' 
              : 'bg-slate-900/70 text-white hover:bg-rose-500 hover:shadow-lg'
          }`}
          title="Save to Wishlist"
        >
          <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
        </button>

        {/* Rating & Review Overlay */}
        <div className="absolute bottom-4 left-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/80 text-white backdrop-blur-md text-xs font-bold border border-white/10 shadow-md">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{hotel.rating}</span>
          <span className="text-slate-400 font-medium">({hotel.reviewCount})</span>
        </div>

        {/* Managed By Badge */}
        <div className="absolute bottom-4 right-4 text-[10px] font-bold text-emerald-400 bg-slate-950/80 px-2.5 py-1 rounded-full backdrop-blur-md border border-emerald-500/30 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" /> {t('verifiedGuest')}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500 mb-1.5">
            <MapPin className="w-3.5 h-3.5" />
            <span>{hotel.destination}</span>
          </div>

          <Link to={`/hotels/${hotel.slug || hotel.id}`}>
            <h3 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-amber-500 transition-colors line-clamp-1">
              {hotel.name}
            </h3>
          </Link>

          <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mt-2 leading-relaxed font-medium">
            {hotel.description}
          </p>

          {/* Amenities Badges */}
          <div className="flex flex-wrap gap-1.5 mt-4">
            {hotel.amenities.slice(0, 3).map((amenity, idx) => (
              <span key={idx} className="px-2.5 py-1 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-[11px] font-bold border border-[var(--border-light)]">
                {amenity}
              </span>
            ))}
            {hotel.amenities.length > 3 && (
              <span className="px-2 py-1 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-muted)] text-[11px] font-bold border border-[var(--border-light)]">
                +{hotel.amenities.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="pt-4 border-t border-[var(--border-light)] flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] block">{t('nightlyRate')}</span>
            <div className="flex items-baseline gap-1 flex-wrap">
              <span className="text-2xl font-extrabold text-[var(--text-primary)]">{formatPrice(hotel.pricePerNight)}</span>
              <span className="text-xs text-[var(--text-muted)] font-bold">/ {t('perNight')}</span>
            </div>
          </div>

          <Link 
            to={`/hotels/${hotel.slug || hotel.id}`}
            className="btn btn-outline text-xs py-2 px-3 sm:px-3.5 group-hover:bg-amber-500 group-hover:text-white group-hover:border-amber-500 shadow-xs shrink-0 whitespace-nowrap flex items-center gap-1"
          >
            <span>{t('viewSuite')}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
};
