import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, ArrowLeft } from 'lucide-react';
import { HotelCard } from '../../components/HotelCard';

export const DestinationDetail = () => {
  const { slug } = useParams();
  const [dest, setDest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/destinations/${slug}`)
      .then(res => res.json())
      .then(data => {
        setDest(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="py-20 text-center font-bold text-slate-500">Loading destination properties...</div>;
  if (!dest) return <div className="py-20 text-center text-rose-500 font-bold">Destination not found.</div>;

  return (
    <div className="container pt-16 pb-10 space-y-10 animate-fade-in">
      <Link to="/destinations" className="inline-flex items-center gap-2 text-xs font-bold text-amber-500 hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to All Destinations
      </Link>

      {/* Hero Header */}
      <div className="relative h-80 rounded-3xl overflow-hidden shadow-2xl flex items-end p-8 text-white">
        <img src={dest.image} alt={dest.name} className="absolute inset-0 w-full h-full object-cover brightness-[0.5]" />
        <div className="relative z-10 space-y-2 max-w-2xl">
          <span className="badge badge-gold">{dest.country}</span>
          <h1 className="text-4xl font-extrabold">{dest.name}</h1>
          <p className="text-sm text-slate-200">{dest.description}</p>
        </div>
      </div>

      {/* Properties in destination */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Luxury Resorts & Suites in {dest.name}</h2>
        {dest.hotels && dest.hotels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(dest.hotels || []).map(h => (
              <HotelCard key={h.id} hotel={h} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-[var(--text-muted)] italic">No listings currently added for this location.</p>
        )}
      </div>
    </div>
  );
};
