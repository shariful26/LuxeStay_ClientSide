import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, Heart, QrCode, CreditCard, Award, ChevronDown, ChevronUp 
} from 'lucide-react';
import { PortalLayout } from '../../components/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { useBooking } from '../../context/BookingContext';
import { useCurrency } from '../../context/CurrencyContext';

import { getInstantData } from '../../utils/instantCache';

export const CustomerDashboard = () => {
  const { user } = useAuth();
  const { wishlist } = useWishlist();
  const { activeVoucher, setActiveVoucher, setIsVoucherModalOpen } = useBooking();
  const { formatPrice } = useCurrency();
  const [bookings, setBookings] = useState(() => getInstantData('customer_bookings', []));
  const [showAllVouchers, setShowAllVouchers] = useState(false);

  useEffect(() => {
    if (!user) return;
    const myId = user.id || user.email || '';
    fetch(`/api/bookings?userId=${encodeURIComponent(myId)}&role=customer`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setBookings(data);
          try { localStorage.setItem('luxestay_cache_customer_bookings', JSON.stringify(data)); } catch (e) {}
        }
      })
      .catch(() => {});
  }, [user, activeVoucher]);

  const totalSpent = bookings.reduce((sum, b) => sum + (b.total || 0), 0);

  return (
    <PortalLayout role="customer" title="Guest Portal">
      {/* Welcome Banner */}
      <div className="p-5 sm:p-8 rounded-2xl bg-slate-900 text-white shadow-md border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <img 
            src={user?.avatar && !user.avatar.includes('photo-1534528741775') ? user.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Member')}&background=0284c7&color=fff&bold=true`} 
            alt="" 
            className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-white object-cover flex-shrink-0" 
          />
          <div className="min-w-0">
            <span className="badge badge-navy bg-white/20 text-white text-[9px] sm:text-[10px]">Elite Guest Rewards</span>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold mt-1 truncate">
              Welcome back, {user?.name || 'Guest'}
            </h1>
            <p className="text-xs text-amber-100 hidden xs:block">
              Manage active reservations, stay vouchers, and favorite suites
            </p>
          </div>
        </div>

        <Link 
          to="/hotels" 
          className="btn bg-white text-slate-950 hover:bg-slate-100 font-extrabold text-xs px-6 py-3 shadow-md w-full md:w-auto text-center flex-shrink-0"
        >
          Book New Suite
        </Link>
      </div>

      {/* 4 KPI Cards - Clean Unified Luxury White Layout */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        
        {/* Active Bookings */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-xs hover:border-amber-500/40 transition-all flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 border border-amber-500/20 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1">Active Bookings</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">{bookings.length} Stays</span>
            <span className="block text-xs text-amber-500 font-bold mt-1">Confirmed Stays</span>
          </div>
        </div>

        {/* Total Spend */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-xs hover:border-amber-500/40 transition-all flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 border border-amber-500/20 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1">Total Spend</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">{formatPrice(totalSpent)}</span>
            <span className="block text-xs text-emerald-500 font-bold mt-1">Lifetime Spent</span>
          </div>
        </div>

        {/* Saved Wishlist */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-xs hover:border-amber-500/40 transition-all flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 border border-amber-500/20 flex items-center justify-center">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1">Saved Wishlist</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">{wishlist.length} Suites</span>
            <span className="block text-xs text-rose-500 font-bold mt-1">Bookmarked Favorites</span>
          </div>
        </div>

        {/* VIP Rewards */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-xs hover:border-amber-500/40 transition-all flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 border border-amber-500/20 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1">VIP Rewards</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">1,450 Pts</span>
            <span className="block text-xs text-indigo-500 font-bold mt-1">Gold Tier Status</span>
          </div>
        </div>

      </div>

      {/* Upcoming Reservations List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-extrabold text-[var(--text-primary)]">
            Upcoming Reservations & Vouchers
          </h3>
          <Link to="/customer/bookings" className="text-xs font-bold text-amber-500 hover:underline">View All</Link>
        </div>

        {(() => {
          const safeBookings = Array.isArray(bookings) ? bookings : [];
          const visibleBookings = showAllVouchers ? safeBookings : safeBookings.slice(0, 4);

          return (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {visibleBookings.map(bk => (
                  <div key={bk.id} className="p-5 sm:p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-md space-y-4 flex flex-col justify-between hover:border-amber-500/40 transition-colors">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="badge badge-emerald">{bk.status}</span>
                        <span className="font-mono text-xs font-bold text-amber-500">{bk.id}</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">{bk.hotelName}</h3>
                      <p className="text-xs font-semibold text-[var(--text-secondary)]">Suite: {bk.roomName}</p>
                      
                      <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 p-3 rounded-xl bg-[var(--bg-tertiary)] text-[11px] font-semibold text-[var(--text-secondary)]">
                        <div>Check-In: <span className="text-[var(--text-primary)] font-bold">{bk.checkIn}</span></div>
                        <div>Check-Out: <span className="text-[var(--text-primary)] font-bold">{bk.checkOut}</span></div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[var(--border-light)] flex flex-wrap items-center justify-between gap-3">
                      <span className="text-sm font-extrabold text-[var(--text-primary)]">{formatPrice(bk.total)}</span>
                      <button 
                        onClick={() => {
                          setActiveVoucher(bk);
                          setIsVoucherModalOpen(true);
                        }}
                        className="btn btn-outline text-xs py-2 px-3 flex items-center gap-1.5"
                      >
                        <QrCode className="w-4 h-4 text-amber-500" /> Printable Voucher
                      </button>
                    </div>
                  </div>
                ))}

                {safeBookings.length === 0 && (
                  <div className="col-span-full py-12 text-center text-xs text-[var(--text-muted)]">
                    No active bookings found.
                  </div>
                )}
              </div>

              {/* See More Vouchers Button */}
              {safeBookings.length > 4 && (
                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => setShowAllVouchers(prev => !prev)}
                    className="btn btn-outline text-xs px-6 py-2.5 rounded-full flex items-center gap-2 border-amber-500/40 text-amber-500 hover:bg-amber-500 hover:text-white transition-all shadow-xs font-bold cursor-pointer hover:scale-105"
                  >
                    {showAllVouchers ? (
                      <>
                        <ChevronUp className="w-4 h-4" /> Show Less Vouchers
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" /> See More Vouchers ({safeBookings.length - 4} More)
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </PortalLayout>
  );
};
