import React, { useState, useEffect } from 'react';
import { 
  X, Calendar, Users, CheckCircle, CheckCircle2, CreditCard, ShieldCheck, 
  Tag, Sparkles, ArrowRight, DollarSign, Globe, Smartphone, Building2, 
  Check, Lock, Loader2, AlertCircle, QrCode, Fingerprint, Landmark, 
  Zap, Copy, RefreshCw, Wallet, Clock, ChevronRight
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const navigate = useNavigate();
  const location = useLocation();

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
  const [submitGatewayLabel, setSubmitGatewayLabel] = useState('');
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
  
  // ==========================================
  // International Payment Gateways State
  // ==========================================
  const [paymentGateway, setPaymentGateway] = useState('stripe'); // 'stripe', 'paypal', 'razorpay', 'payoneer', 'apple_google_pay', 'pay_at_hotel'
  
  // 1. Stripe Card State
  const [cardInfo, setCardInfo] = useState({ number: '', expiry: '', cvc: '', name: '' });
  const [cardBrand, setCardBrand] = useState('generic'); // 'visa', 'mastercard', 'amex', 'discover', 'generic'

  // 2. PayPal State
  const [paypalEmail, setPaypalEmail] = useState(user?.email || '');
  const [paypalPlan, setPaypalPlan] = useState('full'); // 'full' | 'installments'
  const [paypalLinked, setPaypalLinked] = useState(false);

  // 3. Razorpay State
  const [razorpayMethod, setRazorpayMethod] = useState('upi'); // 'upi' | 'qr' | 'netbanking'
  const [razorpayUpi, setRazorpayUpi] = useState('');
  const [razorpayBank, setRazorpayBank] = useState('HDFC Bank');
  const [qrScanned, setQrScanned] = useState(false);
  const [isScanningQr, setIsScanningQr] = useState(false);

  // 4. Payoneer State
  const [payoneerEmail, setPayoneerEmail] = useState(user?.email || '');
  const [payoneerCurrency, setPayoneerCurrency] = useState('USD');

  // 5. Apple & Google Pay State
  const [biometricAuthorized, setBiometricAuthorized] = useState(false);
  const [isAuthorizingBiometric, setIsAuthorizingBiometric] = useState(false);

  // 6. Pay at Hotel Reception State
  const [hotelArrivalMethod, setHotelArrivalMethod] = useState('card'); // 'card' | 'cash' | 'wire'

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
      if (!paypalEmail) setPaypalEmail(user.email || '');
      if (!payoneerEmail) setPayoneerEmail(user.email || '');
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

  // ==========================================
  // Interactive Gateway Formatters & Helpers
  // ==========================================
  const handleCardNumberChange = (raw) => {
    const digits = raw.replace(/\D/g, '').slice(0, 16);
    let formatted = '';
    for (let i = 0; i < digits.length; i += 4) {
      if (i > 0) formatted += ' ';
      formatted += digits.slice(i, i + 4);
    }

    let brand = 'generic';
    if (digits.startsWith('4')) brand = 'visa';
    else if (/^(5[1-5]|2[2-7])/.test(digits)) brand = 'mastercard';
    else if (/^3[47]/.test(digits)) brand = 'amex';
    else if (/^(6011|65)/.test(digits)) brand = 'discover';

    setCardBrand(brand);
    setCardInfo(prev => ({ ...prev, number: formatted }));
  };

  const handleCardExpiryChange = (raw) => {
    const digits = raw.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 2) {
      setCardInfo(prev => ({ ...prev, expiry: `${digits.slice(0, 2)}/${digits.slice(2)}` }));
    } else {
      setCardInfo(prev => ({ ...prev, expiry: digits }));
    }
  };

  const handleCardCvcChange = (raw) => {
    const digits = raw.replace(/\D/g, '').slice(0, 4);
    setCardInfo(prev => ({ ...prev, cvc: digits }));
  };

  const autoFillStripeCard = () => {
    setCardInfo({
      number: '4242 4242 4242 4242',
      expiry: '12/28',
      cvc: '123',
      name: guestInfo.name || user?.name || 'Alexander Sterling'
    });
    setCardBrand('visa');
    setBookingErrorMsg('');
  };

  const autoFillPayPal = () => {
    setPaypalEmail('vip.buyer@paypal-sandbox.com');
    setPaypalLinked(true);
    setBookingErrorMsg('');
  };

  const autoFillRazorpayUpi = () => {
    setRazorpayUpi('luxestay.vip@okhdfcbank');
    setBookingErrorMsg('');
  };

  const handleSimulateQrScan = () => {
    setIsScanningQr(true);
    setTimeout(() => {
      setIsScanningQr(false);
      setQrScanned(true);
    }, 1200);
  };

  const autoFillPayoneer = () => {
    setPayoneerEmail('merchant.vip@payoneer-client.com');
    setBookingErrorMsg('');
  };

  const handleAuthorizeBiometric = () => {
    setIsAuthorizingBiometric(true);
    setTimeout(() => {
      setIsAuthorizingBiometric(false);
      setBiometricAuthorized(true);
    }, 800);
  };

  // ==========================================
  // Complete Booking & Payment Execution
  // ==========================================
  const handleCompleteBooking = async () => {
    setBookingErrorMsg('');
    
    // Strict Customer Authentication Guard
    if (!user) {
      setBookingErrorMsg('🔒 Customer Account Required: Please log in or register to complete your suite reservation.');
      setTimeout(() => {
        onClose();
        navigate('/login', { state: { from: location.pathname + location.search } });
      }, 1500);
      return;
    }

    // Strict Gateway-Specific Validation
    let paymentMethodLabel = 'Stripe Credit/Debit Card';
    let generatedTxId = '';
    let paymentStatus = 'Paid';

    if (paymentGateway === 'stripe') {
      const cleanCardNum = cardInfo.number.replace(/\s+/g, '');
      if (!cleanCardNum || cleanCardNum.length < 12) {
        setBookingErrorMsg('Please enter a valid 16-digit Card Number for Stripe payment (e.g. 4242 4242 4242 4242).');
        return;
      }
      if (!cardInfo.expiry || !cardInfo.expiry.includes('/')) {
        setBookingErrorMsg('Please enter a valid Card Expiry Date (MM/YY, e.g. 12/28).');
        return;
      }
      if (!cardInfo.cvc || cardInfo.cvc.trim().length < 3) {
        setBookingErrorMsg('Please enter a valid 3-digit CVC / CVV security code (e.g. 123).');
        return;
      }
      paymentMethodLabel = `Stripe ${cardBrand.toUpperCase()} (•••• ${cleanCardNum.slice(-4)})`;
      generatedTxId = `pi_3M${Math.random().toString(36).substring(2, 16)}`;
      setSubmitGatewayLabel('Authorizing Stripe 3D-Secure...');

    } else if (paymentGateway === 'paypal') {
      if (!paypalEmail || !paypalEmail.includes('@')) {
        setBookingErrorMsg('Please enter a valid PayPal Account Email address.');
        return;
      }
      paymentMethodLabel = paypalPlan === 'installments' 
        ? `PayPal (Pay-in-4 Installments: ${paypalEmail})` 
        : `PayPal Express (${paypalEmail})`;
      generatedTxId = `PAYID-M${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      setSubmitGatewayLabel('Connecting to PayPal Express Gateway...');

    } else if (paymentGateway === 'razorpay') {
      if (razorpayMethod === 'upi') {
        if (!razorpayUpi || razorpayUpi.trim().length < 4) {
          setBookingErrorMsg('Please enter a valid Razorpay UPI ID / VPA (e.g. username@upi or mobile@paytm).');
          return;
        }
        paymentMethodLabel = `Razorpay UPI (${razorpayUpi})`;
      } else if (razorpayMethod === 'qr') {
        paymentMethodLabel = 'Razorpay Instant Dynamic UPI QR';
      } else {
        paymentMethodLabel = `Razorpay NetBanking (${razorpayBank})`;
      }
      generatedTxId = `pay_${Math.random().toString(36).substring(2, 16)}`;
      setSubmitGatewayLabel('Authorizing Razorpay Gateway...');

    } else if (paymentGateway === 'payoneer') {
      if (!payoneerEmail || !payoneerEmail.includes('@')) {
        setBookingErrorMsg('Please enter a valid Payoneer Account Email / Merchant ID.');
        return;
      }
      paymentMethodLabel = `Payoneer ${payoneerCurrency} Balance (${payoneerEmail})`;
      generatedTxId = `PAYO-${Math.floor(10000000 + Math.random() * 90000000)}`;
      setSubmitGatewayLabel('Verifying Payoneer B2B Global Escrow...');

    } else if (paymentGateway === 'apple_google_pay') {
      paymentMethodLabel = 'Apple / Google Pay (1-Touch Biometric)';
      generatedTxId = `APL-GPAY-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      setSubmitGatewayLabel('Authorizing Biometric Device Wallet...');

    } else if (paymentGateway === 'pay_at_hotel') {
      paymentMethodLabel = `Pay at Hotel Reception (${hotelArrivalMethod === 'cash' ? 'Cash' : hotelArrivalMethod === 'wire' ? 'Bank Transfer' : 'Credit/Debit Card'})`;
      paymentStatus = 'Pending (Pay at Check-In)';
      generatedTxId = `HOTEL-RECP-${Math.floor(100000 + Math.random() * 900000)}`;
      setSubmitGatewayLabel('Registering Guaranteed Front-Desk Reservation...');
    }

    setIsSubmitting(true);

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
      paymentGateway,
      paymentMethod: paymentMethodLabel,
      paymentStatus,
      transactionId: generatedTxId,
      paidAt: paymentGateway === 'pay_at_hotel' ? null : new Date().toISOString(),
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
      setBookingErrorMsg('Unable to process reservation. Please check your network connection.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md animate-fade-in p-3 sm:p-6 md:p-8 flex justify-center items-start">
      <div className="relative w-full max-w-2xl p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-2xl space-y-6 my-6 sm:my-10">

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-light)]">
          <div>
            <h3 className="text-xl font-bold text-[var(--text-primary)]">Reserve {room.name}</h3>
            <p className="text-xs text-[var(--text-secondary)]">{hotel?.name} • Step {step} of 3</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] cursor-pointer">
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
          <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-500 text-xs font-bold flex items-start gap-2.5 animate-fade-in my-2">
            <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
            <div>
              <span className="block font-black uppercase text-[11px] tracking-wider mb-0.5">RESERVATION ALERT</span>
              <p className="text-[11px] leading-relaxed">
                {bookingErrorMsg || `Sorry! ${room.name} is already booked by another guest from ${dateConflict?.checkIn} to ${dateConflict?.checkOut}. Please select different check-in / check-out dates.`}
              </p>
            </div>
          </div>
        )}

        {/* STEP 1: Dates, Guest Details & Extra Add-ons */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
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
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Check-In Date</label>
                  <div
                    onClick={() => modalCheckInRef.current?.showPicker && modalCheckInRef.current.showPicker()}
                    className="relative flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-light)] text-[var(--text-primary)] cursor-pointer hover:border-amber-500 transition-colors"
                  >
                    <span className="font-bold text-xs">
                      {bookingDraft.checkIn ? formatModalDisplayDate(bookingDraft.checkIn) : 'mm/dd/yyyy'}
                    </span>
                    <Calendar className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <input
                      ref={modalCheckInRef}
                      type="date"
                      value={bookingDraft.checkIn || ''}
                      min={todayStr}
                      onChange={handleCheckInChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Check-Out Date</label>
                  <div
                    onClick={() => modalCheckOutRef.current?.showPicker && modalCheckOutRef.current.showPicker()}
                    className="relative flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-light)] text-[var(--text-primary)] cursor-pointer hover:border-amber-500 transition-colors"
                  >
                    <span className="font-bold text-xs">
                      {bookingDraft.checkOut ? formatModalDisplayDate(bookingDraft.checkOut) : 'mm/dd/yyyy'}
                    </span>
                    <Calendar className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <input
                      ref={modalCheckOutRef}
                      type="date"
                      value={bookingDraft.checkOut || ''}
                      min={minCheckOutStr}
                      onChange={handleCheckOutChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Total Guests</label>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-light)]">
                    <span className="font-bold text-xs pl-2 text-[var(--text-primary)] flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-amber-500" />
                      {guests} {guests === 1 ? 'Guest' : 'Guests'}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => updateBooking({ guests: Math.max(1, guests - 1) })}
                        disabled={guests <= 1}
                        className="w-7 h-7 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-extrabold flex items-center justify-center hover:bg-amber-500 hover:text-white transition-colors disabled:opacity-30 cursor-pointer"
                      >
                        -
                      </button>
                      <button
                        type="button"
                        onClick={() => updateBooking({ guests: Math.min(room.capacity || 6, guests + 1) })}
                        disabled={guests >= (room.capacity || 6)}
                        className="w-7 h-7 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-extrabold flex items-center justify-center hover:bg-amber-500 hover:text-white transition-colors disabled:opacity-30 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Meal Plan Addon */}
            <div className="p-4 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] space-y-3 text-xs">
              <span className="font-bold uppercase tracking-wider text-[var(--text-muted)] block">Dining & Meal Plan Options</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { key: 'none', label: 'Room Only (No Meals)', price: 0 },
                  { key: 'breakfast', label: 'Gourmet Breakfast Daily', price: 25 },
                  { key: 'half_board', label: 'Half Board (Breakfast & Dinner)', price: 40 },
                  { key: 'full_board', label: 'All-Inclusive Full Board (3 Meals)', price: 55 }
                ].map(plan => (
                  <button
                    key={plan.key}
                    type="button"
                    onClick={() => setMealPlan(plan.key)}
                    className={`p-3 rounded-xl border text-left flex justify-between items-center transition-all cursor-pointer ${
                      mealPlan === plan.key 
                        ? 'border-amber-500 bg-amber-500/10 text-[var(--text-primary)] font-bold ring-1 ring-amber-500' 
                        : 'border-[var(--border-light)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-amber-500/40'
                    }`}
                  >
                    <span>{plan.label}</span>
                    <span className="text-amber-500 font-extrabold text-[11px]">
                      {plan.price === 0 ? 'Free' : `+$${plan.price}/p/n`}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Extra Luxury Add-ons */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] block">Curated Luxury Add-Ons</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {MOCK_ADDONS.map(addon => {
                  const isChecked = bookingDraft.selectedAddOns.some(a => a.id === addon.id);
                  return (
                    <div
                      key={addon.id}
                      onClick={() => toggleAddOn(addon)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isChecked 
                          ? 'border-amber-500 bg-amber-500/10 shadow-sm' 
                          : 'border-[var(--border-light)] bg-[var(--bg-tertiary)] hover:border-amber-500/30'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
                          <CheckCircle className={`w-4 h-4 ${isChecked ? 'text-amber-500' : 'text-slate-400'}`} />
                          <span>{addon.name}</span>
                        </div>
                        <p className="text-[11px] text-[var(--text-secondary)] pl-6 mt-0.5">{addon.desc}</p>
                      </div>
                      <span className="text-xs font-bold text-amber-500 shrink-0">+{formatPrice(addon.price)}</span>
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
                <div className="sm:col-span-2">
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    value={guestInfo.phone}
                    onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                    placeholder="+1 (555) 000-1122"
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
                  placeholder="Enter code (e.g. SUMMER20 or LUXE50)"
                  className="flex-1 p-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-xs text-[var(--text-primary)] outline-none uppercase font-mono"
                />
                <button type="submit" className="btn btn-outline text-xs px-4 py-2.5 cursor-pointer">Apply</button>
              </form>
              {couponMsg && (
                <p className={`text-[11px] font-bold mt-1.5 ${couponMsg.includes('Success') ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {couponMsg}
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep(1)} className="w-1/3 btn btn-secondary text-xs py-3 cursor-pointer">Back</button>
              <button onClick={() => setStep(3)} className="w-2/3 btn btn-primary text-xs py-3 cursor-pointer">Proceed to Checkout</button>
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
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between space-y-1.5 cursor-pointer ${
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
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between space-y-1.5 cursor-pointer ${
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
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between space-y-1.5 cursor-pointer ${
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
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between space-y-1.5 cursor-pointer ${
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
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between space-y-1.5 cursor-pointer ${
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
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between space-y-1.5 cursor-pointer ${
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

              {/* Gateway Specific Controls & Live Form Fields */}
              <div className="pt-3 border-t border-[var(--border-light)]">
                
                {/* 1. STRIPE CREDIT / DEBIT CARD */}
                {paymentGateway === 'stripe' && (
                  <div className="space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                        Stripe Credit / Debit Card Details
                      </label>
                      <span className="text-[10px] font-bold text-amber-500 uppercase flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Brand: <strong className="text-[var(--text-primary)]">{cardBrand}</strong></span>
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="relative">
                        <input
                          type="text"
                          value={cardInfo.number}
                          onChange={(e) => handleCardNumberChange(e.target.value)}
                          placeholder="Card Number (4242 •••• •••• 4242)"
                          className="w-full p-2.5 pr-20 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-xs text-[var(--text-primary)] outline-none font-mono tracking-wider"
                        />
                        <div className="absolute right-3 top-2.5 flex items-center gap-1 text-[10px] font-extrabold text-amber-500">
                          {cardBrand.toUpperCase()}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={cardInfo.expiry}
                          onChange={(e) => handleCardExpiryChange(e.target.value)}
                          placeholder="MM/YY"
                          className="p-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-xs text-[var(--text-primary)] outline-none font-mono text-center"
                        />
                        <input
                          type="text"
                          value={cardInfo.cvc}
                          onChange={(e) => handleCardCvcChange(e.target.value)}
                          placeholder="CVC / CVV"
                          className="p-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-xs text-[var(--text-primary)] outline-none font-mono text-center"
                        />
                        <input
                          type="text"
                          value={cardInfo.name || guestInfo.name}
                          onChange={(e) => setCardInfo({ ...cardInfo, name: e.target.value })}
                          placeholder="Name on Card"
                          className="col-span-2 sm:col-span-1 p-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-xs text-[var(--text-primary)] outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] pt-1">
                      <span className="text-[var(--text-muted)] font-medium flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Stripe 3D-Secure Test Sandbox Active
                      </span>
                      <button
                        type="button"
                        onClick={autoFillStripeCard}
                        className="text-amber-500 hover:underline font-bold cursor-pointer flex items-center gap-1"
                      >
                        <Zap className="w-3 h-3" /> Auto-fill Demo Test Card (4242...)
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. PAYPAL EXPRESS & PAY IN 4 */}
                {paymentGateway === 'paypal' && (
                  <div className="space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                        PayPal Account Checkout
                      </label>
                      <button
                        type="button"
                        onClick={autoFillPayPal}
                        className="text-[10px] text-amber-500 hover:underline font-bold cursor-pointer flex items-center gap-1"
                      >
                        <Zap className="w-3 h-3" /> Auto-fill Sandbox Account
                      </button>
                    </div>

                    <input
                      type="email"
                      value={paypalEmail}
                      onChange={(e) => {
                        setPaypalEmail(e.target.value);
                        setPaypalLinked(true);
                      }}
                      placeholder="paypal.account@domain.com"
                      className="w-full p-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-xs text-[var(--text-primary)] outline-none font-sans"
                    />

                    {/* PayPal Payment Option Selector */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaypalPlan('full')}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                          paypalPlan === 'full' 
                            ? 'border-blue-500 bg-blue-500/10 text-[var(--text-primary)] font-bold' 
                            : 'border-[var(--border-light)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
                        }`}
                      >
                        <span className="block text-[11px] font-bold">PayPal Express</span>
                        <span className="block text-[10px] text-blue-500">Pay {formatPrice(grandTotal)} in Full</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaypalPlan('installments')}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                          paypalPlan === 'installments' 
                            ? 'border-blue-500 bg-blue-500/10 text-[var(--text-primary)] font-bold' 
                            : 'border-[var(--border-light)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
                        }`}
                      >
                        <span className="block text-[11px] font-bold">Pay in 4 (Bi-weekly)</span>
                        <span className="block text-[10px] text-emerald-500 font-bold">4 x {formatPrice(Math.round(grandTotal / 4))} / 0% APR</span>
                      </button>
                    </div>

                    <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <span className="text-[11px] text-[var(--text-primary)] font-medium">
                          {paypalLinked ? `Linked: ${paypalEmail}` : 'Instant 1-Click PayPal Checkout Ready'}
                        </span>
                      </div>
                      <span className="badge badge-emerald text-[9px]">Verified</span>
                    </div>
                  </div>
                )}

                {/* 3. RAZORPAY (UPI, QR & NETBANKING) */}
                {paymentGateway === 'razorpay' && (
                  <div className="space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                        Razorpay Payment Channels
                      </label>
                      <div className="flex items-center gap-1 p-1 bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border-light)]">
                        <button
                          type="button"
                          onClick={() => setRazorpayMethod('upi')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${razorpayMethod === 'upi' ? 'bg-amber-500 text-white' : 'text-[var(--text-secondary)]'}`}
                        >
                          UPI ID
                        </button>
                        <button
                          type="button"
                          onClick={() => setRazorpayMethod('qr')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${razorpayMethod === 'qr' ? 'bg-amber-500 text-white' : 'text-[var(--text-secondary)]'}`}
                        >
                          Dynamic QR
                        </button>
                        <button
                          type="button"
                          onClick={() => setRazorpayMethod('netbanking')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${razorpayMethod === 'netbanking' ? 'bg-amber-500 text-white' : 'text-[var(--text-secondary)]'}`}
                        >
                          NetBanking
                        </button>
                      </div>
                    </div>

                    {razorpayMethod === 'upi' && (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={razorpayUpi}
                          onChange={(e) => setRazorpayUpi(e.target.value)}
                          placeholder="username@upi or 9876543210@paytm"
                          className="w-full p-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-xs text-[var(--text-primary)] outline-none font-mono"
                        />
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-[var(--text-muted)]">Supported: Google Pay, PhonePe, Paytm, BHIM UPI</span>
                          <button
                            type="button"
                            onClick={autoFillRazorpayUpi}
                            className="text-amber-500 hover:underline font-bold cursor-pointer flex items-center gap-1"
                          >
                            <Zap className="w-3 h-3" /> Auto-fill Demo VPA
                          </button>
                        </div>
                      </div>
                    )}

                    {razorpayMethod === 'qr' && (
                      <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-center space-y-2">
                        <div className="w-24 h-24 mx-auto p-2 bg-white rounded-xl shadow-md border border-slate-200 flex items-center justify-center">
                          <QrCode className="w-20 h-20 text-slate-900" />
                        </div>
                        <span className="block text-[11px] font-bold text-[var(--text-primary)]">
                          Scan & Pay with Any International UPI App
                        </span>
                        <div className="flex justify-center gap-2">
                          <button
                            type="button"
                            onClick={handleSimulateQrScan}
                            disabled={isScanningQr || qrScanned}
                            className="btn btn-outline text-[10px] py-1 px-3 border-emerald-500 text-emerald-500 cursor-pointer"
                          >
                            {isScanningQr ? 'Scanning...' : qrScanned ? '✅ QR Authorized' : '⚡ Simulate App Approval'}
                          </button>
                        </div>
                      </div>
                    )}

                    {razorpayMethod === 'netbanking' && (
                      <div className="space-y-2">
                        <select
                          value={razorpayBank}
                          onChange={(e) => setRazorpayBank(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-xs text-[var(--text-primary)] outline-none font-bold"
                        >
                          <option value="HDFC Bank">HDFC Bank (Instant Express)</option>
                          <option value="ICICI Bank">ICICI Bank</option>
                          <option value="State Bank of India">State Bank of India (SBI)</option>
                          <option value="Axis Bank">Axis Bank</option>
                          <option value="Citibank International">Citibank International</option>
                          <option value="Standard Chartered">Standard Chartered</option>
                        </select>
                        <span className="text-[10px] text-emerald-500 flex items-center gap-1 font-semibold">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Secure Bank Redirection via Razorpay 256-bit Portal</span>
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* 4. PAYONEER */}
                {paymentGateway === 'payoneer' && (
                  <div className="space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                        Payoneer Commercial Account ID
                      </label>
                      <button
                        type="button"
                        onClick={autoFillPayoneer}
                        className="text-[10px] text-amber-500 hover:underline font-bold cursor-pointer flex items-center gap-1"
                      >
                        <Zap className="w-3 h-3" /> Auto-fill Demo Payoneer ID
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="email"
                        value={payoneerEmail}
                        onChange={(e) => setPayoneerEmail(e.target.value)}
                        placeholder="merchant@payoneer.com"
                        className="col-span-2 p-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-xs text-[var(--text-primary)] outline-none font-sans"
                      />
                      <select
                        value={payoneerCurrency}
                        onChange={(e) => setPayoneerCurrency(e.target.value)}
                        className="p-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-xs text-[var(--text-primary)] outline-none font-bold"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                      </select>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        <span className="text-[11px] text-[var(--text-primary)] font-medium">
                          Payoneer Global B2B Balance: <strong>$14,250.00 {payoneerCurrency}</strong>
                        </span>
                      </div>
                      <span className="badge badge-gold text-[9px]">Escrow Safe</span>
                    </div>
                  </div>
                )}

                {/* 5. APPLE & GOOGLE PAY */}
                {paymentGateway === 'apple_google_pay' && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-3 animate-fade-in">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30">
                      <Fingerprint className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="block text-sm font-extrabold text-[var(--text-primary)]">
                        Apple / Google Pay Express Wallet
                      </span>
                      <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                        Authorize instantly with Face ID, Touch ID, or your Device Master Passcode.
                      </p>
                    </div>

                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={handleAuthorizeBiometric}
                        disabled={isAuthorizingBiometric || biometricAuthorized}
                        className={`w-full py-2.5 px-4 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          biometricAuthorized 
                            ? 'bg-emerald-500 text-white shadow-md' 
                            : 'bg-[var(--text-primary)] text-[var(--bg-card)] hover:opacity-90'
                        }`}
                      >
                        {isAuthorizingBiometric ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Verifying Biometric Scan...</span>
                          </>
                        ) : biometricAuthorized ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Biometric Verified & Ready</span>
                          </>
                        ) : (
                          <>
                            <Fingerprint className="w-4 h-4 text-amber-400" />
                            <span>Tap to Authorize with Device Biometrics</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* 6. PAY AT HOTEL RECEPTION */}
                {paymentGateway === 'pay_at_hotel' && (
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-emerald-500 flex items-center gap-1.5">
                        <Building2 className="w-4 h-4" /> Guaranteed Suite Hold • $0 Deposit Required
                      </span>
                      <span className="badge badge-emerald text-[9px]">Confirmed</span>
                    </div>

                    <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                      Your luxury suite will be officially reserved. Total amount of <strong className="text-[var(--text-primary)]">{formatPrice(grandTotal)}</strong> is payable upon arrival at the hotel front desk.
                    </p>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                        Select Preferred Payment at Front Desk:
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { key: 'card', label: 'Credit/Debit Card' },
                          { key: 'cash', label: 'Cash at Desk' },
                          { key: 'wire', label: 'Bank Wire Transfer' }
                        ].map(opt => (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={() => setHotelArrivalMethod(opt.key)}
                            className={`p-2 rounded-xl text-center text-[10px] font-bold border transition-all cursor-pointer ${
                              hotelArrivalMethod === opt.key 
                                ? 'border-emerald-500 bg-emerald-500/20 text-emerald-600 font-extrabold' 
                                : 'border-[var(--border-light)] bg-[var(--bg-card)] text-[var(--text-secondary)]'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep(2)} className="w-1/3 btn btn-secondary text-xs py-3 cursor-pointer">Back</button>
              <button 
                onClick={handleCompleteBooking} 
                disabled={isSubmitting || !!dateConflict}
                className="w-2/3 btn btn-primary py-3 text-xs shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>{submitGatewayLabel || 'Authorizing Payment...'}</span>
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
