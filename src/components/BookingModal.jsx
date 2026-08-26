import React, { useState, useEffect } from 'react';
import { X, Calendar, Users, CheckCircle, CreditCard, ShieldCheck, Tag, Sparkles, ArrowRight, DollarSign, Globe, Smartphone, Building2, Check, Lock, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import { useCurrency } from '../context/CurrencyContext';

const MOCK_ADDONS = [
  { id: 'a1', name: 'Airport VIP Shuttle Transfer', price: 80, desc: 'Luxury private chauffeur from/to airport' },
  { id: 'a2', name: 'Gourmet Breakfast Buffet Daily', price: 120, desc: 'Organic farm-to-table breakfast served daily' },
  { id: 'a3', name: 'Couples Sunset Spa Session', price: 180, desc: '60 min hot stone oil massage with champagne' },
  { id: 'a4', name: 'Early Check-in (12:00 PM)', price: 50, desc: 'Guaranteed early room access upon arrival' }
];

export const BookingModal = ({ isOpen, onClose, room, hotel }) => {
  const { user } = useAuth();
  const { bookingDraft, updateBooking, toggleAddOn, applyCoupon, setActiveVoucher, setIsVoucherModalOpen } = useBooking();
  const { formatPrice } = useCurrency();

  const modalCheckInRef = React.useRef(null);
  const modalCheckOutRef = React.useRef(null);

  const formatModalDisplayDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingBookings, setExistingBookings] = useState([]);
  const [dateConflict, setDateConflict] = useState(null);
  const [bookingErrorMsg, setBookingErrorMsg] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponMsg, setCouponMsg] = useState('');
  const [mealPlan, setMealPlan] = useState('none');
  const [guestInfo, setGuestInfo] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  
  // International Payment Gateways State
  const [paymentGateway, setPaymentGateway] = useState('stripe'); // 'stripe', 'paypal', 'razorpay', 'payoneer', 'apple_google_pay', 'pay_at_hotel'
  const [cardInfo, setCardInfo] = useState({ number: '', expiry: '', cvc: '' });
  const [paypalEmail, setPaypalEmail] = useState(user?.email || '');
  const [razorpayUpi, setRazorpayUpi] = useState('');
  const [payoneerEmail, setPayoneerEmail] = useState(user?.email || '');

  // Fetch active bookings for real-time overlap validation
  useEffect(() => {
    if (isOpen && room?.id) {
      fetch('/api/bookings')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setExistingBookings(data);
        })
        .catch(() => {});
    }
  }, [isOpen, room?.id]);

  // Real-time Date Overlap Detection
  useEffect(() => {
    setBookingErrorMsg('');
    if (!room?.id || !bookingDraft.checkIn || !bookingDraft.checkOut) {
      setDateConflict(null);
      return;
    }

    const selIn = new Date(bookingDraft.checkIn).getTime();
    const selOut = new Date(bookingDraft.checkOut).getTime();
    if (isNaN(selIn) || isNaN(selOut)) {
      setDateConflict(null);
      return;
    }

    const targetRoomId = String(room.id);
    const conflict = existingBookings.find(b => {
      if (b.status === 'Cancelled' || b.status === 'Rejected') return false;
      const bRoomId = b.roomId || b.room?.id;
      if (bRoomId && String(bRoomId) === targetRoomId) {
        const bIn = new Date(b.checkIn).getTime();
        const bOut = new Date(b.checkOut).getTime();
        return selIn < bOut && selOut > bIn;
      }
      return false;
    });

    setDateConflict(conflict || null);
  }, [bookingDraft.checkIn, bookingDraft.checkOut, existingBookings, room?.id]);

  useEffect(() => {
    if (user) {
      setGuestInfo({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    } else {
      setGuestInfo({ name: '', email: '', phone: '' });
    }
  }, [user, isOpen]);

  if (!isOpen || !room) return null;

  const nightlyRate = room.price || 450;
  const nights = bookingDraft.nights || 4;
  const guests = bookingDraft.guests || 2;

  let mealPlanRatePerPerson = 0;
  let mealPlanLabel = 'Room Only (No Meals)';

  if (mealPlan === 'full_board') {
    mealPlanRatePerPerson = 55;
    mealPlanLabel = 'All-Inclusive 3 Meals Package (Breakfast, Lunch & Dinner)';
  } else if (mealPlan === 'half_board') {
    mealPlanRatePerPerson = 40;
    mealPlanLabel = 'Half Board Package (Breakfast & Dinner)';
  } else if (mealPlan === 'breakfast') {
    mealPlanRatePerPerson = 25;
    mealPlanLabel = 'Gourmet Breakfast Daily';
  }

  const mealPlanTotal = mealPlanRatePerPerson * guests * nights;
  const roomSubtotal = nightlyRate * nights;
  const subtotal = roomSubtotal + mealPlanTotal;

  const addOnsTotal = bookingDraft.selectedAddOns.reduce((sum, a) => sum + a.price, 0);
  const discount = bookingDraft.discountAmount || 0;
  const tax = Math.round((subtotal + addOnsTotal - discount) * 0.1);
  const grandTotal = Math.max(0, subtotal + addOnsTotal - discount + tax);

  const todayStr = new Date().toISOString().split('T')[0];
  const minCheckOutStr = bookingDraft.checkIn
    ? new Date(new Date(bookingDraft.checkIn).getTime() + 86400000).toISOString().split('T')[0]
    : todayStr;

  const handleCheckInChange = (e) => {
    const newCheckIn = e.target.value;
    if (!newCheckIn) return;

    let newCheckOut = bookingDraft.checkOut;
    if (new Date(newCheckIn) >= new Date(newCheckOut)) {
      const nextDay = new Date(newCheckIn);
      nextDay.setDate(nextDay.getDate() + 1);
      newCheckOut = nextDay.toISOString().split('T')[0];
    }

    const diffTime = new Date(newCheckOut).getTime() - new Date(newCheckIn).getTime();
    const calculatedNights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    updateBooking({
      checkIn: newCheckIn,
      checkOut: newCheckOut,
      nights: calculatedNights
    });
  };

  const handleCheckOutChange = (e) => {
    const newCheckOut = e.target.value;
    if (!newCheckOut) return;

    if (new Date(newCheckOut) <= new Date(bookingDraft.checkIn)) {
      return;
    }

    const diffTime = new Date(newCheckOut).getTime() - new Date(bookingDraft.checkIn).getTime();
    const calculatedNights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    updateBooking({
      checkIn: bookingDraft.checkIn,
      checkOut: newCheckOut,
      nights: calculatedNights
    });
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.toUpperCase() === 'SUMMER20') {
      applyCoupon({ code: 'SUMMER20', discountType: 'percentage', discountValue: 20 });
      setCouponMsg('Success! 20% discount applied');
    } else if (couponCode.toUpperCase() === 'LUXE50') {
      applyCoupon({ code: 'LUXE50', discountType: 'fixed', discountValue: 50 });
      setCouponMsg('Success! $50 flat discount applied');
    } else {
      setCouponMsg('Invalid promo code');
    }
  };

  const handleCompleteBooking = async () => {
    setBookingErrorMsg('');
    
    // Strict Customer Authentication Guard
    if (!user) {
      setBookingErrorMsg('🔒 Customer Account Required: Please log in or register to complete your suite reservation.');
      setTimeout(() => {
        onClose();
        navigate('/login');
      }, 1500);
      return;
    }

    // Strict Payment Gateway Validation
    if (paymentGateway === 'stripe') {
      const cleanCardNum = cardInfo.number.replace(/\s+/g, '');
      if (!cleanCardNum || cleanCardNum.length < 12) {
        setBookingErrorMsg('Please enter a valid Card Number for Stripe payment (e.g. 4242 4242 4242 4242).');
        return;
      }
      if (!cardInfo.expiry || !cardInfo.expiry.includes('/')) {
        setBookingErrorMsg('Please enter a valid Card Expiry Date (MM/YY, e.g. 12/28).');
        return;
      }
      if (!cardInfo.cvc || cardInfo.cvc.trim().length < 3) {
        setBookingErrorMsg('Please enter a valid 3-digit CVC / CVV code (e.g. 123).');
        return;
      }
    } else if (paymentGateway === 'paypal' && !paypalEmail) {
      setBookingErrorMsg('Please enter your PayPal Account Email.');
      return;
    } else if (paymentGateway === 'razorpay' && !razorpayUpi) {
      setBookingErrorMsg('Please enter a valid Razorpay UPI ID or Phone number.');
      return;
    } else if (paymentGateway === 'payoneer' && !payoneerEmail) {
      setBookingErrorMsg('Please enter your Payoneer Account Email.');
      return;
    }

    setIsSubmitting(true);
    let paymentMethodLabel = 'Stripe Credit/Debit Card';
    if (paymentGateway === 'paypal') {
      paymentMethodLabel = `PayPal (${paypalEmail || 'PayPal Express'})`;
    } else if (paymentGateway === 'razorpay') {
      paymentMethodLabel = `Razorpay (${razorpayUpi || 'International UPI'})`;
    } else if (paymentGateway === 'payoneer') {
      paymentMethodLabel = `Payoneer (${payoneerEmail || 'Account Balance'})`;
    } else if (paymentGateway === 'apple_google_pay') {
      paymentMethodLabel = 'Apple / Google Pay (1-Touch Mobile)';
    } else if (paymentGateway === 'pay_at_hotel') {
      paymentMethodLabel = 'Pay at Hotel Reception (Cash/Card on Check-in)';
    } else if (cardInfo.number) {
      paymentMethodLabel = `Stripe Card (•••• ${cardInfo.number.slice(-4)})`;
    }

    const voucherData = {
      id: `BK-${Math.floor(10000 + Math.random() * 90000)}`,
      hotelId: hotel?.id || room?.hotelId || 'h1',
      hotelName: hotel?.name || 'The Grand Azure Resort',
      roomId: room?.id || 'r101',
      roomName: room.name,
      guestName: guestInfo.name || 'Guest Member',
      guestEmail: guestInfo.email || 'guest@domain.com',
      guestPhone: guestInfo.phone || '+1 (555) 000-1122',
      checkIn: bookingDraft.checkIn,
      checkOut: bookingDraft.checkOut,
      nights,
      guests: bookingDraft.guests || 2,
      nightlyRate,
      mealPlan: mealPlanLabel,
      mealPlanTotal,
      subtotal,
      addOns: bookingDraft.selectedAddOns,
      discount,
      tax,
      total: grandTotal,
      currency: 'USD',
      paymentMethod: paymentMethodLabel,
      status: paymentGateway === 'pay_at_hotel' ? 'Confirmed (Pay at Check-in)' : 'Confirmed',
      createdAt: new Date().toISOString(),
      userId: user?.id || 'guest_user'
    };

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(voucherData)
      });
      const data = await res.json();
      if (!res.ok) {
        setIsSubmitting(false);
        setBookingErrorMsg(data.error || 'This room is already reserved for your selected stay dates.');
        return;
      }
      setActiveVoucher(data);
      setIsSubmitting(false);
      onClose();
      setIsVoucherModalOpen(true);
    } catch (err) {
      setIsSubmitting(false);
      setBookingErrorMsg('Unable to process reservation. Please check your connection.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-2xl space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-light)]">
          <div>
            <h3 className="text-xl font-bold text-[var(--text-primary)]">Reserve {room.name}</h3>
            <p className="text-xs text-[var(--text-secondary)]">{hotel?.name} • Step {step} of 3</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Progress Bar */}
        <div className="grid grid-cols-3 gap-2">
          <div className={`h-1.5 rounded-full ${step >= 1 ? 'bg-amber-500' : 'bg-[var(--border-light)]'}`}></div>
          <div className={`h-1.5 rounded-full ${step >= 2 ? 'bg-amber-500' : 'bg-[var(--border-light)]'}`}></div>
          <div className={`h-1.5 rounded-full ${step >= 3 ? 'bg-amber-500' : 'bg-[var(--border-light)]'}`}></div>
        </div>

        {/* RED DATE OVERLAP CONFLICT BANNER */}
        {(dateConflict || bookingErrorMsg) && (
          <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-500 text-xs font-bold flex items-start gap-2.5 animate-fade-in my-3">
            <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
            <div>
              <span className="block font-black uppercase text-[11px] tracking-wider mb-0.5">ROOM RESERVED FOR SELECTED DATES</span>
              <p className="text-[11px] leading-relaxed">
                {bookingErrorMsg || `Sorry! ${room.name} is already booked by another guest from ${dateConflict?.checkIn} to ${dateConflict?.checkOut}. Please select different check-in / check-out dates.`}
              </p>
            </div>
          </div>
        )}

        {/* STEP 1: Dates, Guest Details & Extra Add-ons */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            {/* Stay Dates & Guests Selection */}
            <div className="p-4 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-500" /> Stay Dates & Guests
                </span>
                <span className="badge badge-gold text-[11px] font-bold">
                  {nights} {nights === 1 ? 'Night' : 'Nights'} Stay
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* Check-In Clickable Box */}
                <div 
                  onClick={() => {
                    try { modalCheckInRef.current?.showPicker(); } catch (e) { modalCheckInRef.current?.focus(); }
                  }}
                  className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-light)] hover:border-amber-500 transition-all cursor-pointer relative group flex flex-col justify-center shadow-xs"
                >
                  <span className="block text-[10px] font-black uppercase tracking-wider text-amber-500 mb-0.5">
                    Check-In Date
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-[var(--text-primary)] group-hover:text-amber-500 transition-colors">
                    {formatModalDisplayDate(bookingDraft.checkIn)}
                  </span>
                  <input
                    type="date"
                    ref={modalCheckInRef}
                    value={bookingDraft.checkIn}
                    onChange={handleCheckInChange}
                    min={todayStr}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-20"
                  />
                </div>

                {/* Check-Out Clickable Box */}
                <div 
                  onClick={() => {
                    try { modalCheckOutRef.current?.showPicker(); } catch (e) { modalCheckOutRef.current?.focus(); }
                  }}
                  className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-light)] hover:border-amber-500 transition-all cursor-pointer relative group flex flex-col justify-center shadow-xs"
                >
                  <span className="block text-[10px] font-black uppercase tracking-wider text-amber-500 mb-0.5">
                    Check-Out Date
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-[var(--text-primary)] group-hover:text-amber-500 transition-colors">
                    {formatModalDisplayDate(bookingDraft.checkOut)}
                  </span>
                  <input
                    type="date"
                    ref={modalCheckOutRef}
                    value={bookingDraft.checkOut}
                    onChange={handleCheckOutChange}
                    min={minCheckOutStr}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-20"
                  />
                </div>

                {/* Guests */}
                <div className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-light)] focus-within:border-amber-500 transition-all">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-amber-500" /> Guests
                  </label>
                  <select
                    value={bookingDraft.guests || 2}
                    onChange={(e) => updateBooking({ guests: Number(e.target.value) })}
                    className="w-full bg-transparent text-xs sm:text-sm font-bold text-[var(--text-primary)] outline-none cursor-pointer"
                  >
                    {[...Array(room?.capacity || 6)].map((_, i) => (
                      <option key={i + 1} value={i + 1} className="bg-[var(--bg-card)] text-[var(--text-primary)]">
                        {i + 1} {i === 0 ? 'Guest' : 'Guests'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Dining & Meal Package Options */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500 mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" /> Select Dining & Meal Plan Options
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-semibold">

                  <div
                    onClick={() => setMealPlan('none')}
                    className={`p-3.5 rounded-2xl border cursor-pointer space-y-1 transition-all ${mealPlan === 'none'
                        ? 'border-amber-500 bg-amber-500/10 shadow-sm'
                        : 'border-[var(--border-light)] bg-[var(--bg-tertiary)] hover:border-amber-500/40'
                      }`}
                  >
                    <div className="flex items-center justify-between font-bold text-[var(--text-primary)]">
                      <span>Room Only (No Meals)</span>
                      <span className="text-emerald-500">$0</span>
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] font-normal">Standard suite stay without dining package</p>
                  </div>

                  <div
                    onClick={() => setMealPlan('full_board')}
                    className={`p-3.5 rounded-2xl border cursor-pointer space-y-1 transition-all ${mealPlan === 'full_board'
                        ? 'border-amber-500 bg-amber-500/10 shadow-sm'
                        : 'border-[var(--border-light)] bg-[var(--bg-tertiary)] hover:border-amber-500/40'
                      }`}
                  >
                    <div className="flex items-center justify-between font-bold text-[var(--text-primary)]">
                      <span className="text-amber-500 font-extrabold">🍱 3 Meals Full Board</span>
                      <span className="text-amber-500 font-extrabold">+{formatPrice(55 * guests * nights)}</span>
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] font-normal">Breakfast, Gourmet Lunch & Dinner Daily</p>
                  </div>

                  <div
                    onClick={() => setMealPlan('half_board')}
                    className={`p-3.5 rounded-2xl border cursor-pointer space-y-1 transition-all ${mealPlan === 'half_board'
                        ? 'border-amber-500 bg-amber-500/10 shadow-sm'
                        : 'border-[var(--border-light)] bg-[var(--bg-tertiary)] hover:border-amber-500/40'
                      }`}
                  >
                    <div className="flex items-center justify-between font-bold text-[var(--text-primary)]">
                      <span>🍷 Half Board Package</span>
                      <span className="text-amber-500">+{formatPrice(40 * guests * nights)}</span>
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] font-normal">Organic Breakfast & Fine Dining Dinner</p>
                  </div>

                  <div
                    onClick={() => setMealPlan('breakfast')}
                    className={`p-3.5 rounded-2xl border cursor-pointer space-y-1 transition-all ${mealPlan === 'breakfast'
                        ? 'border-amber-500 bg-amber-500/10 shadow-sm'
                        : 'border-[var(--border-light)] bg-[var(--bg-tertiary)] hover:border-amber-500/40'
                      }`}
                  >
                    <div className="flex items-center justify-between font-bold text-[var(--text-primary)]">
                      <span>🍳 Breakfast Only</span>
                      <span className="text-amber-500">+{formatPrice(25 * guests * nights)}</span>
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] font-normal">Daily farm-to-table breakfast buffet</p>
                  </div>

                </div>
              </div>

              {/* Select Extra Services */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">Enhance Your Stay (Optional Add-ons)</h4>
                <div className="space-y-2.5">
                  {MOCK_ADDONS.map(addon => {
                    const isChecked = bookingDraft.selectedAddOns.some(a => a.name === addon.name);
                    return (
                      <div
                        key={addon.id}
                        onClick={() => toggleAddOn(addon)}
                        className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${isChecked
                            ? 'border-amber-500 bg-amber-500/10'
                            : 'border-[var(--border-light)] bg-[var(--bg-tertiary)] hover:border-amber-500/40'
                          }`}
                      >
                        <div>
                          <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
                            <CheckCircle className={`w-4 h-4 ${isChecked ? 'text-amber-500' : 'text-slate-400'}`} />
                            <span>{addon.name}</span>
                          </div>
                          <p className="text-[11px] text-[var(--text-secondary)] pl-6 mt-0.5">{addon.desc}</p>
                        </div>
                        <span className="text-xs font-bold text-amber-500">+{formatPrice(addon.price)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button 
                onClick={() => setStep(2)} 
                disabled={!!dateConflict}
                className="w-full btn btn-primary py-3 text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {dateConflict ? (
                  <span>ROOM RESERVED FOR THESE DATES</span>
                ) : (
                  <>
                    <span>Continue to Guest Info & Payment</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
        )}

            {/* STEP 2: Guest Details & Coupon Code */}
            {step === 2 && (
              <div className="space-y-5 animate-fade-in">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Guest Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Full Name *</label>
                      <input
                        type="text"
                        value={guestInfo.name}
                        onChange={(e) => setGuestInfo({ ...guestInfo, name: e.target.value })}
                        placeholder="Enter full name"
                        className="w-full p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-[var(--text-primary)] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Email Address *</label>
                      <input
                        type="email"
                        value={guestInfo.email}
                        onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                        placeholder="email@domain.com"
                        className="w-full p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-[var(--text-primary)] outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Promo Code Input */}
                <div className="pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Have a Promo Coupon?</h4>
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter code (e.g. SUMMER20)"
                      className="flex-1 p-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-xs text-[var(--text-primary)] outline-none uppercase font-mono"
                    />
                    <button type="submit" className="btn btn-outline text-xs px-4 py-2.5">Apply</button>
                  </form>
                  {couponMsg && (
                    <p className={`text-[11px] font-bold mt-1.5 ${couponMsg.includes('Success') ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {couponMsg}
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setStep(1)} className="w-1/3 btn btn-secondary text-xs py-3">Back</button>
                  <button onClick={() => setStep(3)} className="w-2/3 btn btn-primary text-xs py-3">Proceed to Checkout</button>
                </div>
              </div>
            )}

            {/* STEP 3: Payment & Order Confirmation Summary */}
            {step === 3 && (
              <div className="space-y-5 animate-fade-in text-xs">
                {/* Price Breakdown */}
                <div className="p-4 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-[var(--border-light)] text-[11px] text-[var(--text-muted)] font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-500" />
                      <span>Check-In: <strong className="text-[var(--text-primary)]">{bookingDraft.checkIn}</strong> &rarr; Check-Out: <strong className="text-[var(--text-primary)]">{bookingDraft.checkOut}</strong></span>
                    </span>
                    <span className="badge badge-gold text-[10px]">{nights} {nights === 1 ? 'Night' : 'Nights'}</span>
                  </div>
                  <div className="flex justify-between text-[var(--text-secondary)] pt-1">
                    <span>{room.name} ({nights} {nights === 1 ? 'night' : 'nights'})</span>
                    <span className="font-bold text-[var(--text-primary)]">{formatPrice(subtotal)}</span>
                  </div>
                  {bookingDraft.selectedAddOns.map((addon, idx) => (
                    <div key={idx} className="flex justify-between text-[var(--text-secondary)]">
                      <span>+ {addon.name}</span>
                      <span className="font-semibold">{formatPrice(addon.price)}</span>
                    </div>
                  ))}
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-500 font-bold">
                      <span>Discount Coupon</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[var(--text-secondary)]">
                    <span>Estimated Taxes & Fees</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                  <div className="flex justify-between text-base font-extrabold text-[var(--text-primary)] pt-3 border-t border-[var(--border-light)]">
                    <span>Total Due</span>
                    <span className="text-amber-500">{formatPrice(grandTotal)}</span>
                  </div>
                </div>

                {/* International Payment Method Selector */}
                <div className="p-4 rounded-2xl border border-[var(--border-light)] bg-[var(--bg-card)] space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-emerald-500" /> Select International Payment Gateway
                    </span>
                    <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      256-Bit SSL Secure
                    </span>
                  </div>

                  {/* 6 Gateway Selection Options Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {/* 1. Stripe / Credit Card */}
                    <button
                      type="button"
                      onClick={() => setPaymentGateway('stripe')}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between space-y-1.5 ${
                        paymentGateway === 'stripe'
                          ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500'
                          : 'border-[var(--border-light)] bg-[var(--bg-tertiary)] hover:border-amber-500/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <CreditCard className={`w-4 h-4 ${paymentGateway === 'stripe' ? 'text-amber-500' : 'text-slate-400'}`} />
                        {paymentGateway === 'stripe' && <Check className="w-3.5 h-3.5 text-amber-500" />}
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-[var(--text-primary)]">Stripe Card</span>
                        <span className="block text-[9px] text-[var(--text-secondary)]">Visa, MC, Amex</span>
                      </div>
                    </button>

                    {/* 2. PayPal */}
                    <button
                      type="button"
                      onClick={() => setPaymentGateway('paypal')}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between space-y-1.5 ${
                        paymentGateway === 'paypal'
                          ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500'
                          : 'border-[var(--border-light)] bg-[var(--bg-tertiary)] hover:border-amber-500/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <DollarSign className={`w-4 h-4 ${paymentGateway === 'paypal' ? 'text-amber-500' : 'text-slate-400'}`} />
                        {paymentGateway === 'paypal' && <Check className="w-3.5 h-3.5 text-amber-500" />}
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-[var(--text-primary)]">PayPal</span>
                        <span className="block text-[9px] text-[var(--text-secondary)]">Express & Pay in 4</span>
                      </div>
                    </button>

                    {/* 3. Razorpay */}
                    <button
                      type="button"
                      onClick={() => setPaymentGateway('razorpay')}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between space-y-1.5 ${
                        paymentGateway === 'razorpay'
                          ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500'
                          : 'border-[var(--border-light)] bg-[var(--bg-tertiary)] hover:border-amber-500/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <ShieldCheck className={`w-4 h-4 ${paymentGateway === 'razorpay' ? 'text-amber-500' : 'text-slate-400'}`} />
                        {paymentGateway === 'razorpay' && <Check className="w-3.5 h-3.5 text-amber-500" />}
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-[var(--text-primary)]">Razorpay</span>
                        <span className="block text-[9px] text-[var(--text-secondary)]">UPI & NetBanking</span>
                      </div>
                    </button>

                    {/* 4. Payoneer */}
                    <button
                      type="button"
                      onClick={() => setPaymentGateway('payoneer')}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between space-y-1.5 ${
                        paymentGateway === 'payoneer'
                          ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500'
                          : 'border-[var(--border-light)] bg-[var(--bg-tertiary)] hover:border-amber-500/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Globe className={`w-4 h-4 ${paymentGateway === 'payoneer' ? 'text-amber-500' : 'text-slate-400'}`} />
                        {paymentGateway === 'payoneer' && <Check className="w-3.5 h-3.5 text-amber-500" />}
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-[var(--text-primary)]">Payoneer</span>
                        <span className="block text-[9px] text-[var(--text-secondary)]">Balance / Cards</span>
                      </div>
                    </button>

                    {/* 5. Apple & Google Pay */}
                    <button
                      type="button"
                      onClick={() => setPaymentGateway('apple_google_pay')}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between space-y-1.5 ${
                        paymentGateway === 'apple_google_pay'
                          ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500'
                          : 'border-[var(--border-light)] bg-[var(--bg-tertiary)] hover:border-amber-500/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Smartphone className={`w-4 h-4 ${paymentGateway === 'apple_google_pay' ? 'text-amber-500' : 'text-slate-400'}`} />
                        {paymentGateway === 'apple_google_pay' && <Check className="w-3.5 h-3.5 text-amber-500" />}
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-[var(--text-primary)]">Apple/GPay</span>
                        <span className="block text-[9px] text-[var(--text-secondary)]">1-Touch Pay</span>
                      </div>
                    </button>

                    {/* 6. Pay at Hotel */}
                    <button
                      type="button"
                      onClick={() => setPaymentGateway('pay_at_hotel')}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between space-y-1.5 ${
                        paymentGateway === 'pay_at_hotel'
                          ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500'
                          : 'border-[var(--border-light)] bg-[var(--bg-tertiary)] hover:border-amber-500/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Building2 className={`w-4 h-4 ${paymentGateway === 'pay_at_hotel' ? 'text-emerald-500' : 'text-slate-400'}`} />
                        {paymentGateway === 'pay_at_hotel' && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-[var(--text-primary)]">Pay at Hotel</span>
                        <span className="block text-[9px] text-emerald-500 font-bold">$0 Deposit Now</span>
                      </div>
                    </button>
                  </div>

                  {/* Gateway Specific Input Fields & Instructions */}
                  <div className="pt-2 border-t border-[var(--border-light)]">
                    {/* Stripe Card Inputs */}
                    {paymentGateway === 'stripe' && (
                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                          Stripe Credit / Debit Card Details
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          <input
                            type="text"
                            value={cardInfo.number}
                            onChange={(e) => setCardInfo({ ...cardInfo, number: e.target.value })}
                            placeholder="Card Number (4242 •••• •••• 4242)"
                            className="col-span-2 p-2.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-[11px] text-[var(--text-primary)] outline-none font-mono"
                          />
                          <input
                            type="text"
                            value={cardInfo.expiry}
                            onChange={(e) => setCardInfo({ ...cardInfo, expiry: e.target.value })}
                            placeholder="MM/YY"
                            className="p-2.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-[11px] text-[var(--text-primary)] outline-none font-mono text-center"
                          />
                          <input
                            type="text"
                            value={cardInfo.cvc}
                            onChange={(e) => setCardInfo({ ...cardInfo, cvc: e.target.value })}
                            placeholder="CVC"
                            className="p-2.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-[11px] text-[var(--text-primary)] outline-none font-mono text-center"
                          />
                        </div>

                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-[var(--text-muted)] font-medium">🧪 Sandbox Test Mode Active</span>
                          <button
                            type="button"
                            onClick={() => setCardInfo({ number: '4242 4242 4242 4242', expiry: '12/28', cvc: '123' })}
                            className="text-amber-500 hover:underline font-bold cursor-pointer"
                          >
                            ⚡ Auto-fill Demo Test Card (4242...)
                          </button>
                        </div>
                      </div>
                    )}

                    {/* PayPal Express */}
                    {paymentGateway === 'paypal' && (
                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                          PayPal Account Email
                        </label>
                        <input
                          type="email"
                          value={paypalEmail}
                          onChange={(e) => setPaypalEmail(e.target.value)}
                          placeholder="your-paypal@domain.com"
                          className="w-full p-2.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-[11px] text-[var(--text-primary)] outline-none font-sans"
                        />
                        <p className="text-[10px] text-amber-500 font-semibold">
                          ⚡ You will be redirected to PayPal Express Checkout to complete your payment securely.
                        </p>
                      </div>
                    )}

                    {/* Razorpay */}
                    {paymentGateway === 'razorpay' && (
                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                          Razorpay UPI ID / Virtual Address
                        </label>
                        <input
                          type="text"
                          value={razorpayUpi}
                          onChange={(e) => setRazorpayUpi(e.target.value)}
                          placeholder="username@upi or Mobile Number"
                          className="w-full p-2.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-[11px] text-[var(--text-primary)] outline-none font-mono"
                        />
                        <p className="text-[10px] text-emerald-500 font-semibold">
                          🛡️ Razorpay 3D-Secure International Gateway enabled for instant confirmation.
                        </p>
                      </div>
                    )}

                    {/* Payoneer */}
                    {paymentGateway === 'payoneer' && (
                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                          Payoneer Account Email / Business ID
                        </label>
                        <input
                          type="email"
                          value={payoneerEmail}
                          onChange={(e) => setPayoneerEmail(e.target.value)}
                          placeholder="payoneer-id@company.com"
                          className="w-full p-2.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-[11px] text-[var(--text-primary)] outline-none font-sans"
                        />
                      </div>
                    )}

                    {/* Apple Pay & Google Pay */}
                    {paymentGateway === 'apple_google_pay' && (
                      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-center space-y-1">
                        <span className="block text-xs font-bold text-amber-500 flex items-center justify-center gap-1">
                          <Smartphone className="w-4 h-4" /> Ready for 1-Touch Express Authorization
                        </span>
                        <p className="text-[11px] text-[var(--text-secondary)]">
                          Authorize instantly using Touch ID, Face ID, or your Device Wallet upon clicking confirm.
                        </p>
                      </div>
                    )}

                    {/* Pay at Hotel Reception */}
                    {paymentGateway === 'pay_at_hotel' && (
                      <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                        <span className="block text-xs font-bold text-emerald-500 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" /> Guaranteed Booking with $0 Deposit Required
                        </span>
                        <p className="text-[11px] text-[var(--text-secondary)]">
                          Your luxury suite will be held for arrival. Full payment of <strong>{formatPrice(grandTotal)}</strong> can be made via Cash or Card at hotel reception upon check-in.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="w-1/3 btn btn-secondary text-xs py-3">Back</button>
                  <button 
                    onClick={handleCompleteBooking} 
                    disabled={isSubmitting || !!dateConflict}
                    className="w-2/3 btn btn-primary py-3 text-xs shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Authorizing Payment...</span>
                      </>
                    ) : dateConflict ? (
                      <span>ROOM RESERVED FOR THESE DATES</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Confirm & Get Stay Voucher</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      );
    };
