import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, Star } from 'lucide-react';
import { getInstantData, fetchInstantData } from '../../utils/instantCache';

export const Destinations = () => {
  const [destinations, setDestinations] = useState(() => getInstantData('destinations', []));

  useEffect(() => {
    fetchInstantData('/api/destinations', 'destinations', setDestinations);
  }, []);

  return (
    <div className="container pt-16 pb-12 space-y-10 animate-fade-in">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-extrabold uppercase tracking-widest text-amber-500 block pt-4">World Travel Guide</span>
        <h1 className="text-4xl font-extrabold text-[var(--text-primary)]">Explore Travel Destinations</h1>
        <p className="text-sm text-[var(--text-secondary)]">Discover handpicked luxury resorts and boutique retreats across the world's most breathtaking locations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {destinations.map(dest => (
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
              <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{dest.description}</p>
              <div className="pt-2 flex items-center justify-between border-t border-white/20 text-xs font-bold text-amber-400">
                <span>{dest.hotelCount} Properties</span>
                <span className="flex items-center gap-1">
                  <span>Explore</span> <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
