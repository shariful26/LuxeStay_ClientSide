import React, { useState, useEffect } from 'react';
import { QrCode, Calendar, Clock, AlertCircle, Loader2, X, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import { PortalLayout } from '../../components/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import { useCurrency } from '../../context/CurrencyContext';

import { getInstantData } from '../../utils/instantCache';

export const MyBookings = () => {
  const [bookings, setBookings] = useState(() => getInstantData('customer_bookings', []));
  const [hotels, setHotels] = useState(() => getInstantData('hotels', []));
  const [selectedExtendBooking, setSelectedExtendBooking] = useState(null);
  const [extraNights, setExtraNights] = useState(1);
  const [extending, setExtending] = useState(false);
  const [extendErrorMsg, setExtendErrorMsg] = useState('');
  const [extendSuccessMsg, setExtendSuccessMsg] = useState('');

  const { user } = useAuth();
  const { activeVoucher, setActiveVoucher, setIsVoucherModalOpen } = useBooking();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    fetch('/api/hotels')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setHotels(data);
          try { localStorage.setItem('luxestay_cache_hotels', JSON.stringify(data)); } catch (e) {}
        }
      })
      .catch(() => {});

    fetch('/api/bookings')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          let myData = data.filter(b => 
            (user?.email && b.guestEmail && b.guestEmail.toLowerCase() === user.email.toLowerCase()) ||
            (user?.id && b.userId === user.id)
          );
          if (myData.length === 0) myData = data;
          setBookings(myData);
          try { localStorage.setItem('luxestay_cache_customer_bookings', JSON.stringify(myData)); } catch (e) {}
        }
      })
      .catch(() => {});
  }, [user, activeVoucher]);

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Checked-Out':
        return <span className="badge bg-slate-500/15 text-slate-400 border border-slate-500/30">Checked-Out</span>;
      case 'Checked-In':
        return <span className="badge badge-emerald">Checked-In</span>;
      case 'Cancelled':
        return <span className="badge bg-rose-500/15 text-rose-400 border border-rose-500/30">Cancelled</span>;
      default:
        return <span className="badge badge-gold">{status || 'Confirmed'}</span>;
    }
  };

  const calculateNewCheckOut = (currentCheckOutStr, nightsToAdd) => {
    if (!currentCheckOutStr) return '';
    const d = new Date(currentCheckOutStr);
    if (isNaN(d.getTime())) return currentCheckOutStr;
    d.setDate(d.getDate() + Number(nightsToAdd));
    return d.toISOString().split('T')[0];
  };

  const handleConfirmExtend = async () => {
    if (!selectedExtendBooking) return;
    setExtending(true);
    setExtendErrorMsg('');
    setExtendSuccessMsg('');

    const newCheckOut = calculateNewCheckOut(selectedExtendBooking.checkOut, extraNights);
    const nightlyRate = selectedExtendBooking.nightlyRate || 450;
    const extraAmount = nightlyRate * extraNights;

    try {
      const res = await fetch(`/api/bookings/${selectedExtendBooking.id}/extend`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          extraNights,
          newCheckOut,
          extraAmount
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setExtending(false);
        setExtendErrorMsg(data.error || 'This room is already reserved for future dates by another guest.');
        return;
      }

      setExtending(false);
      setExtendSuccessMsg('Stay extended successfully!');
      
      // Update local state
      setBookings(prev => prev.map(b => b.id === selectedExtendBooking.id ? data.booking : b));
      if (activeVoucher?.id === selectedExtendBooking.id) {
        setActiveVoucher(data.booking);
      }

      setTimeout(() => {
        setSelectedExtendBooking(null);
        setExtendSuccessMsg('');
      }, 1200);

    } catch (err) {
      setExtending(false);
      setExtendErrorMsg('Error extending stay. Please try again.');
    }
  };

  return (
    <PortalLayout role="customer" title="My Reservations">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)]">My Reservations Ledger</h1>
          <p className="text-xs text-[var(--text-secondary)]">View, extend stay and manage your confirmed luxury stay vouchers</p>
        </div>
        <span className="badge badge-gold self-start sm:self-auto">{bookings.length} Total Bookings</span>
      </div>

      <div className="rounded-3xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-lg overflow-hidden p-6 sm:p-8 space-y-6">
        <div className="hidden lg:grid grid-cols-12 gap-4 pb-4 border-b border-[var(--border-light)] text-xs font-extrabold uppercase tracking-widest text-[var(--text-muted)]">
          <div className="col-span-5">Property & Suite Details</div>
          <div className="col-span-3">Dates & Nights</div>
          <div className="col-span-2">Total Amount</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        <div className="divide-y divide-[var(--border-light)]">
          {bookings.length === 0 ? (
            <div className="py-12 text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
              <h3 className="text-lg font-bold text-[var(--text-primary)]">No Reservations Found</h3>
              <p className="text-xs text-[var(--text-secondary)]">You don't have any confirmed bookings under your account yet.</p>
            </div>
          ) : (
            bookings.map(bk => {
              const hotel = hotels.find(h => h.id === bk.hotelId);
              const imageUrl = hotel?.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80';
              
              // Status dot configuration
              let statusDotColor = 'bg-amber-500';
              if (bk.status === 'Checked-In') statusDotColor = 'bg-emerald-500 animate-pulse';
              else if (bk.status === 'Checked-Out') statusDotColor = 'bg-slate-400';
              else if (bk.status === 'Cancelled') statusDotColor = 'bg-rose-500';

              return (
                <div 
                  key={bk.id}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-4 py-6 first:pt-0 last:pb-0 items-center transition-all hover:bg-[var(--bg-tertiary)]/30 rounded-2xl px-3 -mx-3"
                >
                  {/* Column 1: Property & Suite Details */}
                  <div className="col-span-1 lg:col-span-5 flex items-center gap-4">
                    {/* Thumbnail Image */}
                    <div className="w-24 h-16 rounded-2xl overflow-hidden relative flex-shrink-0 border border-[var(--border-light)] shadow-xs">
                      <img 
                        src={imageUrl} 
                        alt={bk.hotelName} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Hotel & Room text */}
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md">
                          Ref: {bk.id}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full ${statusDotColor}`} />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                            {bk.status || 'Confirmed'}
                          </span>
                        </div>
                      </div>
                      <h3 className="text-sm font-extrabold text-[var(--text-primary)] truncate">
                        {bk.hotelName}
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)] font-semibold truncate">
                        {bk.roomName} • <span className="text-amber-500 text-[10px]">{bk.mealPlan || 'Room Only'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Column 2: Dates & Nights */}
                  <div className="col-span-1 lg:col-span-3 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-primary)]">
                      <Calendar className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                      <span>{bk.checkIn} to {bk.checkOut}</span>
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] font-bold flex items-center gap-1">
                      <span>• {bk.nights || 1} Nights Stay</span>
                      {hotel && <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/20 px-1.5 py-0.5 rounded ml-1">✓ Verified</span>}
                    </p>
                  </div>

                  {/* Column 3: Total Amount */}
                  <div className="col-span-1 lg:col-span-2 space-y-1">
                    <div className="text-base font-black text-amber-500">
                      {formatPrice(bk.total)}
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)] font-extrabold uppercase tracking-wide">
                      💳 {bk.paymentMethod?.split(' ')[0] || 'Credit Card'}
                    </div>
                  </div>

                  {/* Column 4: Actions */}
                  <div className="col-span-1 lg:col-span-2 flex lg:justify-end items-center gap-2">
                    <button 
                      onClick={() => {
                        setActiveVoucher(bk);
                        setIsVoucherModalOpen(true);
                      }}
                      className="btn btn-outline text-[11px] py-1.5 px-3 flex items-center gap-1.5 cursor-pointer h-9 shadow-xs"
                      title="View Stay Voucher"
                    >
                      <QrCode className="w-3.5 h-3.5 text-amber-500" />
                      <span>Voucher</span>
                    </button>

                    {bk.status !== 'Cancelled' && bk.status !== 'Checked-Out' && (
                      <button
                        onClick={() => {
                          setSelectedExtendBooking(bk);
                          setExtraNights(1);
                          setExtendErrorMsg('');
                          setExtendSuccessMsg('');
                        }}
                        className="btn btn-primary text-[11px] py-1.5 px-3 flex items-center gap-1.5 cursor-pointer h-9 shadow-sm"
                        title="Extend Stay Duration"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Extend</span>
                      </button>
                    )}
                  </div>

                </div>
              );
            })
          )}
        </div>
      </div>

      {/* EXTEND STAY MODAL DIALOG */}
      {selectedExtendBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-2xl space-y-5 my-8">
            
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-light)]">
              <div>
                <h3 className="text-lg font-extrabold text-[var(--text-primary)]">Extend Your Stay</h3>
                <p className="text-xs text-[var(--text-secondary)]">{selectedExtendBooking.hotelName} • {selectedExtendBooking.roomName}</p>
              </div>
              <button onClick={() => setSelectedExtendBooking(null)} className="p-1.5 rounded-full hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Stay Dates Summary */}
            <div className="p-3.5 rounded-2xl bg-[var(--bg-tertiary)] text-xs space-y-1.5 border border-[var(--border-light)]">
              <div className="flex justify-between font-bold text-[var(--text-primary)]">
                <span>Current Check-Out Date:</span>
                <span className="text-amber-500 font-mono">{selectedExtendBooking.checkOut}</span>
              </div>
              <div className="flex justify-between text-[11px] text-[var(--text-secondary)]">
                <span>Current Reserved Duration:</span>
                <span>{selectedExtendBooking.nights || 1} Nights</span>
              </div>
            </div>

            {/* Select Extension Duration */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Select Extension Duration</label>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setExtraNights(1)}
                  className={`py-3 px-4 rounded-2xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                    extraNights === 1 ? 'border-amber-500 bg-amber-500/10 text-amber-500 shadow-sm' : 'border-[var(--border-light)] bg-[var(--bg-tertiary)] text-[var(--text-primary)]'
                  }`}
                >
                  <span className="font-extrabold text-sm">+1 Extra Night</span>
                  <span className="text-[10px] font-normal text-[var(--text-muted)] mt-0.5">New Check-Out: {calculateNewCheckOut(selectedExtendBooking.checkOut, 1)}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setExtraNights(2)}
                  className={`py-3 px-4 rounded-2xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                    extraNights === 2 ? 'border-amber-500 bg-amber-500/10 text-amber-500 shadow-sm' : 'border-[var(--border-light)] bg-[var(--bg-tertiary)] text-[var(--text-primary)]'
                  }`}
                >
                  <span className="font-extrabold text-sm">+2 Extra Nights</span>
                  <span className="text-[10px] font-normal text-[var(--text-muted)] mt-0.5">New Check-Out: {calculateNewCheckOut(selectedExtendBooking.checkOut, 2)}</span>
                </button>
              </div>
            </div>

            {/* Rate & Fee Calculation */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1.5 font-bold">
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-primary)]">Extension Amount (+{extraNights} {extraNights === 1 ? 'Night' : 'Nights'}):</span>
                <span className="text-amber-500 text-sm font-extrabold">
                  {formatPrice((selectedExtendBooking.nightlyRate || 450) * extraNights)}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-[var(--text-secondary)] font-medium pt-1.5 border-t border-amber-500/20">
                <span>Payment Source:</span>
                <span className="font-semibold text-amber-500 flex items-center gap-1">
                  💳 {selectedExtendBooking.paymentMethod || 'Stripe / Saved Express Card'}
                </span>
              </div>
            </div>

            {/* Extension Conflict Warning */}
            {extendErrorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-500 text-xs font-bold flex items-start gap-2.5 animate-fade-in">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="block font-black uppercase text-[11px] tracking-wider mb-0.5">ROOM RESERVED BY ANOTHER GUEST</span>
                  <p className="text-[11px] leading-relaxed">{extendErrorMsg}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {extendSuccessMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-bold text-center animate-fade-in">
                ✓ {extendSuccessMsg}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2.5 pt-2">
              <button type="button" onClick={() => setSelectedExtendBooking(null)} className="w-1/3 btn btn-secondary text-xs py-3 cursor-pointer">Cancel</button>
              <button 
                type="button" 
                onClick={handleConfirmExtend} 
                disabled={extending} 
                className="w-2/3 btn btn-primary py-3 text-xs shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
              >
                {extending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Extending Stay...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Confirm & Pay Extension</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </PortalLayout>
  );
};
