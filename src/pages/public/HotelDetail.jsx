import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { Star, MapPin, Check, ShieldCheck, Heart, Sparkles, Phone, Mail, Building2, X, ChevronLeft, ChevronRight, Image as ImageIcon, MessageSquare } from 'lucide-react';
import { RoomCard } from '../../components/RoomCard';
import { BookingModal } from '../../components/BookingModal';
import { useCurrency } from '../../context/CurrencyContext';
import { useAuth } from '../../context/AuthContext';

const DEFAULT_FALLBACKS = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80'
];

import { getInstantData, fetchInstantData } from '../../utils/instantCache';

export const HotelDetail = () => {
  const { id } = useParams();
  const [hotel, setHotel] = useState(() => {
    const allHotels = getInstantData('hotels', []);
    const found = allHotels.find(h => h.id === id || h.slug === id);
    return found || null;
  });
  const [loading, setLoading] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);

  useEffect(() => {
    fetchInstantData(`/api/hotels/${id}`, `hotel_${id}`, (data) => {
      if (data && data.id) {
        setHotel(data);
      }
    });
  }, [id]);

  if (!hotel) return <div className="py-20 text-center text-slate-500 font-bold animate-pulse">Loading verified property details...</div>;

  // Build full robust list of gallery images
  const rawImages = (hotel.images && hotel.images.length > 0) ? hotel.images : DEFAULT_FALLBACKS;
  const galleryImages = [...rawImages];
  while (galleryImages.length < 4) {
    galleryImages.push(DEFAULT_FALLBACKS[galleryImages.length % DEFAULT_FALLBACKS.length]);
  }

  const handleImgError = (e, fallbackIdx = 0) => {
    e.target.onerror = null;
    e.target.src = DEFAULT_FALLBACKS[fallbackIdx % DEFAULT_FALLBACKS.length];
  };

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[420px] rounded-3xl overflow-hidden shadow-2xl bg-slate-900/10">
        <div 
          onClick={() => setLightboxIndex(0)}
          className="md:col-span-2 h-full overflow-hidden cursor-pointer group relative"
        >
          <img 
            src={galleryImages[0]} 
            alt={hotel.name} 
            onError={(e) => handleImgError(e, 0)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
          />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
        </div>
        <div className="hidden md:grid grid-rows-2 gap-4 h-full">
          <div 
            onClick={() => setLightboxIndex(1)} 
            className="h-full overflow-hidden cursor-pointer group relative rounded-xl"
          >
            <img 
              src={galleryImages[1]} 
              alt={`${hotel.name} view 2`} 
              onError={(e) => handleImgError(e, 1)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
            />
          </div>
          <div 
            onClick={() => setLightboxIndex(2)} 
            className="h-full overflow-hidden cursor-pointer group relative rounded-xl"
          >
            <img 
              src={galleryImages[2]} 
              alt={`${hotel.name} view 3`} 
              onError={(e) => handleImgError(e, 2)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
            />
          </div>
        </div>
        <div 
          onClick={() => setLightboxIndex(3)}
          className="hidden md:block h-full relative overflow-hidden cursor-pointer group rounded-xl"
        >
          <img 
            src={galleryImages[3]} 
            alt={`${hotel.name} view 4`} 
            onError={(e) => handleImgError(e, 3)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
          />
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center text-white font-bold text-xs gap-2 group-hover:bg-slate-950/40 transition-colors">
            <ImageIcon className="w-4 h-4 text-amber-400" />
            + View Full Gallery ({galleryImages.length})
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
                    if (!user) {
                      navigate('/login', { state: { from: location.pathname + location.search } });
                      return;
                    }
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
                if (!user) {
                  navigate('/login', { state: { from: location.pathname + location.search } });
                  return;
                }
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

            <button 
              onClick={() => {
                if (!user) {
                  navigate('/login', { state: { from: location.pathname + location.search } });
                  return;
                }
                setIsContactModalOpen(true);
              }}
              className="w-full mt-3 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-amber-500/30 hover:border-amber-500 bg-amber-500/5 hover:bg-amber-500/10 text-amber-500 font-extrabold text-xs transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Contact Hotel Manager</span>
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

      {/* Full Screen Lightbox Modal */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <button 
            onClick={() => setLightboxIndex(null)}
            className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close Gallery"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="relative max-w-5xl w-full h-[70vh] flex items-center justify-center">
            <img 
              src={galleryImages[lightboxIndex]} 
              alt={`${hotel.name} showcase ${lightboxIndex + 1}`}
              onError={(e) => handleImgError(e, lightboxIndex)}
              className="max-h-full max-w-full object-contain rounded-2xl shadow-2xl"
            />

            <button 
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1));
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-amber-500 text-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button 
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0));
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-amber-500 text-white transition-colors cursor-pointer"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Thumbnails row */}
          <div className="flex gap-3 mt-6 overflow-x-auto max-w-full py-2 px-4">
            {galleryImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setLightboxIndex(idx)}
                className={`relative w-20 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${lightboxIndex === idx ? 'border-amber-500 scale-105 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
              >
                <img 
                  src={img} 
                  alt="" 
                  onError={(e) => handleImgError(e, idx)} 
                  className="w-full h-full object-cover" 
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Booking Checkout Modal */}
      <BookingModal 
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        room={selectedRoom}
        hotel={hotel}
      />

      {/* Contact Manager Modal */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border-light)] rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
            <div className="px-6 py-4 border-b border-[var(--border-light)] flex items-center justify-between bg-[var(--bg-tertiary)]/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[var(--text-primary)]">Contact Property Host</h3>
                  <span className="text-[10px] font-bold text-[var(--text-muted)]">Inquire about {hotel.name}</span>
                </div>
              </div>
              <button 
                onClick={() => { setIsContactModalOpen(false); setContactSuccess(false); setContactMessage(''); }}
                className="p-1.5 rounded-full hover:bg-[var(--border-light)] text-[var(--text-muted)] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {contactSuccess ? (
              <div className="p-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto text-xl font-bold">✓</div>
                <div className="space-y-1.5">
                  <h4 className="text-sm font-extrabold text-[var(--text-primary)]">Message Transmitted!</h4>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-xs mx-auto">Your query has been sent directly to the hotel manager. You can continue this conversation in your messaging portal.</p>
                </div>
                <div className="pt-3 flex gap-2 justify-center">
                  <button 
                    onClick={() => { setIsContactModalOpen(false); setContactSuccess(false); setContactMessage(''); }}
                    className="px-4 py-2 border border-[var(--border-light)] rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-bold text-xs cursor-pointer hover:bg-[var(--border-light)] transition-all"
                  >
                    Close Window
                  </button>
                  <Link 
                    to="/customer/messages"
                    className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs cursor-pointer shadow-lg shadow-amber-600/20 transition-all"
                  >
                    Open Messages Portal →
                  </Link>
                </div>
              </div>
            ) : (
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!contactMessage.trim()) return;
                  
                  const payload = {
                    senderId: user?.id || 'alice',
                    senderName: user?.name || 'Alice Johnson',
                    senderRole: 'customer',
                    recipientId: hotel.partnerId || 'partner1',
                    recipientName: hotel.partnerName || 'Hotel Concierge',
                    text: contactMessage.trim(),
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  };

                  try {
                    const res = await fetch('/api/messages', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(payload)
                    });
                    if (res.ok) {
                      setContactSuccess(true);
                    }
                  } catch (err) {
                    console.error('Failed to submit message to property manager:', err);
                  }
                }} 
                className="p-6 space-y-4 text-xs font-semibold"
              >
                <div>
                  <label className="block text-[var(--text-secondary)] font-bold mb-1.5 uppercase tracking-wide">Select Quick Inquiry Template</label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "Can I request early check-in or late check-out?",
                      "Are airport pickup/drop-off services available?",
                      "What is the maximum occupancy for the suites?",
                      "Do you support special dietary requirements at your spa?"
                    ].map((tpl, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setContactMessage(tpl)}
                        className="px-2.5 py-1.5 rounded-lg border border-[var(--border-light)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-amber-500 hover:border-amber-500 hover:bg-amber-500/5 transition-all text-left font-medium block max-w-full text-[10px]"
                      >
                        {tpl}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[var(--text-secondary)] font-bold mb-1.5 uppercase tracking-wide">Write your message *</label>
                  <textarea
                    required
                    rows="4"
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Type details about your inquiry, room customization request, or arrival times..."
                    className="w-full p-3 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-[var(--text-primary)] outline-none focus:bg-[var(--bg-card)] focus:border-amber-500 transition-colors font-medium text-xs resize-none"
                  />
                </div>

                <div className="pt-3 border-t border-[var(--border-light)] flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => { setIsContactModalOpen(false); setContactMessage(''); }}
                    className="px-4 py-2 border border-[var(--border-light)] rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-bold hover:bg-[var(--border-light)] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold shadow-lg shadow-amber-600/20 cursor-pointer"
                  >
                    Send Query Message
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

