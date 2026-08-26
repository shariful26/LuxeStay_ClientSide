import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Bed, Users, Maximize, Check, Calendar, ArrowLeft, ShieldCheck } from 'lucide-react';
import { BookingModal } from '../../components/BookingModal';
import { useCurrency } from '../../context/CurrencyContext';

export const RoomDetail = () => {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    fetch(`/api/rooms/${id}`)
      .then(res => res.json())
      .then(data => {
        setRoom(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="py-20 text-center font-bold text-slate-500">Loading room specs...</div>;
  if (!room) return <div className="py-20 text-center text-rose-500 font-bold">Room not found.</div>;

  return (
    <div className="container pt-8 sm:pt-10 pb-16 space-y-8 animate-fade-in">
      <Link to="/hotels" className="inline-flex items-center gap-2 text-xs font-bold text-amber-500 hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to Hotel Catalog
      </Link>

      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <span className="badge badge-gold">{room.type}</span>
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)] mt-2">{room.name}</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1 font-semibold">{room.hotel?.name || 'Luxury Resort'}</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-[var(--text-muted)] block uppercase font-bold">Nightly Rate</span>
          <span className="text-3xl font-extrabold text-amber-500">{formatPrice(room.price)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="h-96 rounded-2xl overflow-hidden shadow-lg">
            <img src={room.images[0]} alt={room.name} className="w-full h-full object-cover" />
          </div>

          <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-light)] space-y-4">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Suite Features & Amenities</h3>
            <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-[var(--text-secondary)]">
              {room.amenities.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" /> {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Reserve Suite</h3>
            <div className="space-y-2 text-xs font-semibold text-[var(--text-secondary)]">
              <div className="flex items-center gap-2"><Users className="w-4 h-4 text-amber-500" /> Max Capacity: {room.capacity} Guests</div>
              <div className="flex items-center gap-2"><Bed className="w-4 h-4 text-amber-500" /> Bed: {room.bedType}</div>
              <div className="flex items-center gap-2"><Maximize className="w-4 h-4 text-amber-500" /> Size: {room.size}</div>
            </div>

            <button 
              onClick={() => setIsBookingOpen(true)}
              className="w-full btn btn-primary py-3 text-xs"
            >
              Book Room Now
            </button>
          </div>
        </div>
      </div>

      <BookingModal 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
        room={room} 
        hotel={room.hotel} 
      />
    </div>
  );
};
