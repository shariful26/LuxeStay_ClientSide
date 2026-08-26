import React, { useState, useEffect } from 'react';
import { QrCode, Calendar, Clock, AlertCircle, Loader2, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { PortalLayout } from '../../components/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import { useCurrency } from '../../context/CurrencyContext';

export const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedExtendBooking, setSelectedExtendBooking] = useState(null);
  const [extraNights, setExtraNights] = useState(1);
  const [extending, setExtending] = useState(false);
  const [extendErrorMsg, setExtendErrorMsg] = useState('');
  const [extendSuccessMsg, setExtendSuccessMsg] = useState('');

  const { user } = useAuth();
  const { activeVoucher, setActiveVoucher, setIsVoucherModalOpen } = useBooking();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    fetch('/api/bookings')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const myData = data.filter(b => 
            (user?.email && b.guestEmail && b.guestEmail.toLowerCase() === user.email.toLowerCase()) ||
            (user?.id && b.userId === user.id)
          );
          setBookings(myData);
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

      <div className="rounded-3xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-lg overflow-hidden">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Booking Ref</th>
                <th>Property</th>
                <th>Suite & Dining Plan</th>
                <th>Stay Dates</th>
                <th>Total Paid</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(bk => (
                <tr key={bk.id}>
                  <td className="font-mono font-bold text-amber-500">{bk.id}</td>
                  <td className="font-bold text-[var(--text-primary)]">{bk.hotelName}</td>
                  <td className="text-xs">
                    <div className="font-bold text-[var(--text-primary)]">{bk.roomName}</div>
                    <div className="text-[11px] text-amber-500 font-semibold">{bk.mealPlan || 'Room Only'}</div>
                  </td>
                  <td className="text-xs">
                    <div className="font-bold">{bk.checkIn} to {bk.checkOut}</div>
                    <div className="text-[10px] text-[var(--text-muted)] font-normal">{bk.nights || 1} Nights Stay</div>
                  </td>
                  <td className="font-extrabold">{formatPrice(bk.total)}</td>
                  <td>{renderStatusBadge(bk.status)}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          setActiveVoucher(bk);
                          setIsVoucherModalOpen(true);
                        }}
                        className="btn btn-outline text-xs py-1.5 px-3 flex items-center gap-1 cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5 text-amber-500" /> Voucher
                      </button>

                      {bk.status !== 'Cancelled' && bk.status !== 'Checked-Out' && (
                        <button
                          onClick={() => {
                            setSelectedExtendBooking(bk);
                            setExtraNights(1);
                            setExtendErrorMsg('');
                            setExtendSuccessMsg('');
                          }}
                          className="btn btn-primary text-xs py-1.5 px-3 flex items-center gap-1 cursor-pointer shadow-xs"
                        >
                          <Clock className="w-3.5 h-3.5" /> Extend Stay
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
