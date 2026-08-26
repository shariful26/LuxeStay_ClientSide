import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, MapPin, Check, ShieldCheck, Heart, Sparkles, Phone, Mail, Building2 } from 'lucide-react';
import { RoomCard } from '../../components/RoomCard';
import { BookingModal } from '../../components/BookingModal';
import { useCurrency } from '../../context/CurrencyContext';

export const HotelDetail = () => {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    fetch(`/api/hotels/${id}`)
      .then(res => res.json())
      .then(data => {
        setHotel(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="py-20 text-center font-bold text-slate-500">Loading suite details...</div>;
  if (!hotel) return <div className="py-20 text-center text-rose-500 font-bold">Property not found.</div>;

  return (
    <div className="container pt-8 sm:pt-10 pb-16 space-y-12 animate-fade-in">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[var(--border-light)]">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="badge badge-gold">{hotel.category}</span>
            <span className="badge badge-emerald flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Managed by {hotel.partnerName}
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[var(--text-primary)]">{hotel.name}</h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] flex items-center gap-1.5 font-semibold">
            <MapPin className="w-4 h-4 text-amber-500" /> {hotel.address}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">From</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-amber-500">{formatPrice(hotel.pricePerNight)}</span>
              <span className="text-xs text-[var(--text-muted)] font-bold">/ night</span>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[420px] rounded-3xl overflow-hidden shadow-2xl">
        <div className="md:col-span-2 h-full">
          <img src={hotel.images[0]} alt={hotel.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 cursor-pointer" />
        </div>
        <div className="hidden md:grid grid-rows-2 gap-4 h-full">
          <img src={hotel.images[1] || hotel.images[0]} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 cursor-pointer" />
          <img src={hotel.images[2] || hotel.images[0]} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 cursor-pointer" />
        </div>
        <div className="hidden md:block h-full relative">
          <img src={hotel.images[3] || hotel.images[0]} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 cursor-pointer" />
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center text-white font-bold text-xs">
            + View Full Gallery
          </div>
        </div>
      </div>

      {/* Description & Key Features */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-[var(--text-primary)]">About Property</h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{hotel.description}</p>
          </div>

          {/* Amenities Grid */}
          <div className="space-y-4 pt-6 border-t border-[var(--border-light)]">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Signature Amenities & Inclusions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {hotel.amenities.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-light)] text-xs font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-500" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Available Rooms Section */}
          <div className="space-y-6 pt-8 border-t border-[var(--border-light)]">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-extrabold text-[var(--text-primary)]">Select Room / Suite</h3>
              <span className="text-xs font-semibold text-[var(--text-muted)]">{hotel.rooms?.length || 0} Suites Available</span>
            </div>

            <div className="space-y-6">
              {hotel.rooms?.map(room => (
                <RoomCard 
                  key={room.id} 
                  room={room} 
                  onBookClick={(r) => {
                    setSelectedRoom(r);
                    setIsBookingOpen(true);
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar Widget */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-xl space-y-6 sticky top-24">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-wider">
              <Sparkles className="w-4 h-4" /> Best Price Guarantee
            </div>
            <div className="space-y-2">
              <span className="text-xs text-[var(--text-muted)] block">Per night starting from</span>
              <span className="text-4xl font-extrabold text-[var(--text-primary)]">{formatPrice(hotel.pricePerNight)}</span>
            </div>

            <button 
              onClick={() => {
                const targetRoom = (hotel.rooms && hotel.rooms.length > 0) ? hotel.rooms[0] : {
                  id: `r_def_${hotel.id}`,
                  hotelId: hotel.id,
                  name: `${hotel.name} Deluxe Suite`,
                  price: hotel.pricePerNight || 450,
                  type: 'Deluxe Suite'
                };
                setSelectedRoom(targetRoom);
                setIsBookingOpen(true);
              }}
              className="w-full btn btn-primary py-3.5 text-xs shadow-lg shadow-amber-500/30 cursor-pointer"
            >
              Instant Suite Booking
            </button>

            <div className="pt-4 border-t border-[var(--border-light)] space-y-3 text-xs text-[var(--text-secondary)]">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" /> Free cancellation up to 48 hours prior
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" /> Instant Stay Voucher generation
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" /> 24/7 Concierge Support
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Checkout Modal */}
      <BookingModal 
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        room={selectedRoom}
        hotel={hotel}
      />

    </div>
  );
};
