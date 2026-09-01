import React from 'react';
import { Link } from 'react-router-dom';
import { Bed, Users, Maximize, Check, Calendar, ChevronRight } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { useLanguage } from '../context/LanguageContext';

export const RoomCard = ({ room, onBookClick }) => {
  const { formatPrice } = useCurrency();
  const { t } = useLanguage();

  return (
    <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-light)] overflow-hidden shadow-md hover:shadow-xl transition-all flex flex-col md:flex-row">
      <div className="md:w-2/5 relative h-56 md:h-auto overflow-hidden">
        <img 
          src={room.images[0]} 
          alt={room.name} 
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />
        <span className="absolute top-3 left-3 badge badge-gold">
          {room.type}
        </span>
      </div>

      <div className="md:w-3/5 p-6 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-xl font-bold text-[var(--text-primary)]">{room.name}</h3>
          
          <div className="flex flex-wrap gap-4 text-xs font-semibold text-[var(--text-secondary)] mt-3">
            <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-amber-500" /> {t('sleeps')} {room.capacity} {t('guests')}</span>
            <span className="flex items-center gap-1.5"><Bed className="w-4 h-4 text-amber-500" /> {room.bedType}</span>
            <span className="flex items-center gap-1.5"><Maximize className="w-4 h-4 text-amber-500" /> {room.size}</span>
          </div>

          <p className="text-xs text-[var(--text-secondary)] mt-3 leading-relaxed line-clamp-2">
            {room.description}
          </p>

          <div className="grid grid-cols-2 gap-2 mt-4 text-[11px] font-semibold text-[var(--text-secondary)]">
            {room.amenities.slice(0, 4).map((amenity, idx) => (
              <span key={idx} className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500" /> {amenity}
              </span>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-[var(--border-light)] flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">{t('nightlyRate')}</span>
            <div className="flex items-baseline gap-1 flex-wrap">
              <span className="text-2xl font-extrabold text-[var(--text-primary)]">{formatPrice(room.price)}</span>
              <span className="text-xs text-[var(--text-muted)] font-semibold">/ {t('perNight')}</span>
            </div>
          </div>

          <button 
            onClick={() => onBookClick(room)}
            className="btn btn-primary text-xs py-2.5 px-4 sm:px-5 shadow-lg shadow-amber-500/20 shrink-0 whitespace-nowrap flex items-center gap-1.5 cursor-pointer"
          >
            <span>{t('bookNow')}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
