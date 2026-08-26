import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { QrCode, ArrowLeft, CheckCircle2, Building2 } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';

export const BookingDetail = () => {
  const { id } = useParams();
  const { setIsVoucherModalOpen } = useBooking();

  return (
    <div className="container max-w-3xl py-10 space-y-6 animate-fade-in">
      <Link to="/customer/bookings" className="inline-flex items-center gap-2 text-xs font-bold text-amber-500 hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to My Bookings
      </Link>

      <div className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-2xl space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-[var(--border-light)]">
          <div>
            <span className="badge badge-emerald">Confirmed</span>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mt-2">Reservation #{id || 'BK-98421'}</h1>
          </div>
          <button onClick={() => setIsVoucherModalOpen(true)} className="btn btn-primary text-xs py-2 px-4 flex items-center gap-2">
            <QrCode className="w-4 h-4" /> View Voucher
          </button>
        </div>

        <div className="space-y-2 text-xs font-semibold text-[var(--text-secondary)]">
          <p>Check-In: 2026-09-10 (From 15:00)</p>
          <p>Check-Out: 2026-09-14 (Until 11:00)</p>
          <p>Guests: 2 Adults</p>
        </div>
      </div>
    </div>
  );
};
