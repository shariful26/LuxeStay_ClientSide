import React from 'react';
import { X, Printer, CheckCircle2, QrCode, MapPin, Building2, ShieldCheck, User, CreditCard, Clock, FileText, Award } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';

export const VoucherModal = () => {
  const { isVoucherModalOpen, setIsVoucherModalOpen, activeVoucher } = useBooking();
  const { formatPrice } = useCurrency();
  const { user } = useAuth();

  if (!isVoucherModalOpen || !activeVoucher) return null;

  const handlePrint = () => {
    window.print();
  };

  const voucherId = activeVoucher.id || 'BK-10701';
  const hotelName = activeVoucher.hotelName || activeVoucher.hotel?.name || 'Overwater Coral Sanctuary';
  const hotelAddress = activeVoucher.hotel?.address || activeVoucher.hotelAddress || 'Oia Cliffside Drive, Santorini 84702, Greece';
  const roomName = activeVoucher.roomName || activeVoucher.room?.name || 'Overwater Sunset Plunge Pool Villa';
  const guestName = activeVoucher.guestName || user?.name || 'John Doe';
  const guestEmail = activeVoucher.guestEmail || user?.email || 'john@example.com';
  const checkIn = activeVoucher.checkIn || '2026-09-10';
  const checkOut = activeVoucher.checkOut || '2026-09-14';
  const nights = activeVoucher.nights || 4;
  const guests = activeVoucher.guests || 2;
  const subtotal = activeVoucher.subtotal || 3560;
  const addOns = activeVoucher.addOns || [];
  const discount = activeVoucher.discount || 0;
  const total = activeVoucher.total || (subtotal + addOns.reduce((acc, a) => acc + (a.price || 0), 0) - discount);
  const paymentMethod = activeVoucher.paymentMethod || 'Credit Card (Visa)';
  const issueDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="voucher-modal-overlay fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md animate-fade-in p-4 sm:p-6 md:p-8 flex justify-center items-start">
      <div className="voucher-modal-card relative w-full max-w-2xl p-6 sm:p-8 rounded-3xl bg-white text-slate-900 shadow-2xl space-y-6 my-6 sm:my-10">
        
        {/* Modal Close Button (Screen Only) */}
        <button 
          onClick={() => setIsVoucherModalOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors print:hidden"
          title="Close Voucher"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Voucher Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
          <div className="flex items-center gap-3.5">
            <img 
              src="/logo.png" 
              alt="LuxeStay" 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://ui-avatars.com/api/?name=Luxe+Stay&background=0284c7&color=fff&bold=true';
              }}
              className="w-12 h-12 rounded-full object-cover shadow-md ring-2 ring-amber-500/30 flex-shrink-0" 
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">LUXESTAY</h2>
                <span className={`badge text-[9px] px-2 py-0.5 ${
                  activeVoucher.paymentStatus?.includes('Pending') || activeVoucher.paymentGateway === 'pay_at_hotel'
                    ? 'badge-gold' 
                    : 'badge-emerald'
                }`}>
                  {activeVoucher.paymentStatus?.includes('Pending') || activeVoucher.paymentGateway === 'pay_at_hotel'
                    ? 'HOLD GUARANTEED • PAY AT CHECK-IN' 
                    : 'VERIFIED & PAID'}
                </span>
              </div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600 flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Official Stay Voucher & Reservation Receipt
              </span>
            </div>
          </div>

          <div className="flex sm:flex-col justify-between sm:text-right items-start sm:items-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Booking Reference</span>
              <span className="text-lg font-mono font-extrabold text-amber-600 tracking-wide">{voucherId}</span>
            </div>
            <span className="text-[10px] font-medium text-slate-400 mt-0.5">Issued: {issueDate}</span>
          </div>
        </div>

        {/* Guest & Reservation Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Guest Information */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-600" /> Primary Guest Details
            </span>
            <div className="pt-1">
              <h4 className="text-sm font-bold text-slate-900">{guestName}</h4>
              <p className="text-xs text-slate-500">{guestEmail}</p>
            </div>
            <div className="pt-2 border-t border-slate-200/60 flex flex-col gap-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Payment Channel:</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1 text-[11px]">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-600" /> {paymentMethod}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Transaction ID:</span>
                <span className="font-mono font-bold text-amber-600">{activeVoucher.transactionId || activeVoucher.stripeTxId || `TX-${voucherId}`}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Payment Status:</span>
                <span className={`font-bold ${
                  activeVoucher.paymentStatus?.includes('Pending') || activeVoucher.paymentGateway === 'pay_at_hotel'
                    ? 'text-amber-600'
                    : 'text-emerald-600'
                }`}>
                  {activeVoucher.paymentStatus || 'Paid in Full'}
                </span>
              </div>
            </div>
          </div>

          {/* Hotel Information */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-amber-600" /> Accommodation Details
            </span>
            <div className="pt-1">
              <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{hotelName}</h4>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                <span className="line-clamp-1">{hotelAddress}</span>
              </p>
            </div>
            <div className="pt-1 border-t border-slate-200/60 text-xs">
              <span className="text-slate-500">Reserved Suite: </span>
              <span className="font-bold text-slate-900">{roomName}</span>
            </div>
          </div>
        </div>

        {/* Stay Dates & Occupancy Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs">
          <div>
            <span className="text-slate-500 font-semibold block text-[10px] uppercase tracking-wider">Check-In Date</span>
            <span className="font-extrabold text-slate-900 text-sm block mt-0.5">{checkIn}</span>
            <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3 text-amber-600" /> From 15:00 PM
            </span>
          </div>
          <div>
            <span className="text-slate-500 font-semibold block text-[10px] uppercase tracking-wider">Check-Out Date</span>
            <span className="font-extrabold text-slate-900 text-sm block mt-0.5">{checkOut}</span>
            <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3 text-amber-600" /> Until 11:00 AM
            </span>
          </div>
          <div>
            <span className="text-slate-500 font-semibold block text-[10px] uppercase tracking-wider">Stay Duration</span>
            <span className="font-extrabold text-slate-900 text-sm block mt-0.5">{nights} Nights</span>
            <span className="text-[10px] text-emerald-600 font-bold mt-0.5 block">Guaranteed Stay</span>
          </div>
          <div>
            <span className="text-slate-500 font-semibold block text-[10px] uppercase tracking-wider">Occupancy</span>
            <span className="font-extrabold text-slate-900 text-sm block mt-0.5">{guests} Guests</span>
            <span className="text-[10px] text-slate-500 mt-0.5 block">Standard Luxury</span>
          </div>
        </div>

        {/* Itemized Payment Breakdown Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h4 className="font-extrabold text-slate-900 uppercase text-[10px] tracking-wider text-slate-400 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-600" /> Payment & Financial Breakdown
            </h4>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Paid in Full
            </span>
          </div>

          <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
            <div className="bg-slate-100 px-4 py-2 flex justify-between font-bold text-slate-700 uppercase text-[10px] tracking-wider">
              <span>Item Description</span>
              <span>Amount</span>
            </div>

            <div className="divide-y divide-slate-100 bg-white">
              <div className="flex justify-between p-3">
                <div>
                  <span className="font-semibold text-slate-800 block">{roomName} ({nights} Nights)</span>
                  <span className="text-[10px] text-slate-500">Base Nightly Rate: {formatPrice(activeVoucher.nightlyRate || Math.round(subtotal / nights))} / night</span>
                </div>
                <span className="font-semibold text-slate-800">{formatPrice(subtotal)}</span>
              </div>

              {activeVoucher.mealPlan && activeVoucher.mealPlan !== 'Room Only (No Meals)' && (
                <div className="flex justify-between p-3 bg-amber-50/60">
                  <div>
                    <span className="font-bold text-amber-700 block">🍱 Dining Package: {activeVoucher.mealPlan}</span>
                    <span className="text-[10px] text-slate-500">Includes food & dining for {guests} guests across {nights} nights</span>
                  </div>
                  <span className="font-bold text-amber-700">{activeVoucher.mealPlanTotal ? formatPrice(activeVoucher.mealPlanTotal) : 'Included'}</span>
                </div>
              )}

              {addOns.map((addon, idx) => (
                <div key={idx} className="flex justify-between p-3 text-slate-700">
                  <span className="font-medium">+ {addon.name}</span>
                  <span className="font-semibold text-slate-900">{formatPrice(addon.price)}</span>
                </div>
              ))}

              {discount > 0 && (
                <div className="flex justify-between p-3 text-emerald-600 font-bold bg-emerald-50/50">
                  <span>Promotional Discount Voucher</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
            </div>

            {/* Total Paid Container */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 block">
                  {activeVoucher.paymentStatus?.includes('Pending') ? 'Total Amount Payable' : 'Total Amount Paid'}
                </span>
                <span className="text-xs text-slate-300">
                  {activeVoucher.paymentStatus?.includes('Pending')
                    ? `Guaranteed Reservation • Pay upon arrival via ${paymentMethod}`
                    : `Paid in full via ${paymentMethod}`}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xl sm:text-2xl font-black text-amber-400">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Verification QR Code & Official Stamp */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="sm:col-span-2 p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm flex-shrink-0">
              <QrCode className="w-14 h-14 text-slate-800" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-900">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Instant Check-In QR Verification
              </div>
              <p className="text-[10px] text-slate-500 leading-snug">
                Present this physical voucher or digital QR code at the resort front desk upon arrival for priority check-in.
              </p>
              <span className="text-[9px] font-mono font-bold text-slate-400 block pt-0.5">
                VERIFICATION HASH: AUTH-{voucherId}-LUXE
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 flex flex-col justify-center items-center text-center">
            <Award className="w-7 h-7 text-amber-600 mb-1" />
            <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider">LuxeStay Verified</span>
            <span className="text-[9px] text-amber-700 font-medium">100% Guaranteed Booking</span>
          </div>
        </div>

        {/* Fine Print / Help Support */}
        <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Need help? 24/7 Concierge: <strong className="text-slate-800">+1 (800) 555-LUXE</strong> | support@luxestay.com</span>
          <span>© 2026 LuxeStay. All rights reserved.</span>
        </div>

        {/* Modal Actions (Screen Only - Hidden on Print) */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 print:hidden">
          <button
            onClick={() => setIsVoucherModalOpen(false)}
            className="btn btn-secondary text-xs py-2 px-5"
          >
            Close
          </button>
          <button 
            onClick={handlePrint}
            className="btn btn-primary text-xs py-2.5 px-6 flex items-center gap-2 shadow-lg"
          >
            <Printer className="w-4 h-4" /> Print / Save Voucher
          </button>
        </div>

      </div>
    </div>
  );
};

