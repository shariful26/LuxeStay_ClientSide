import React, { useState, useEffect } from 'react';
import { Plus, X, Building2, ShieldCheck, CheckCircle2, DollarSign, ChevronLeft, ChevronRight, CreditCard } from 'lucide-react';
import { PortalLayout } from '../../components/PortalLayout';
import { useCurrency } from '../../context/CurrencyContext';

import { getInstantData } from '../../utils/instantCache';

export const BookingsManagement = () => {
  const [bookings, setBookings] = useState(() => getInstantData('bookings', []));
  const [hotels, setHotels] = useState(() => getInstantData('hotels', []));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const { formatPrice } = useCurrency();

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    hotelId: '',
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    checkIn: todayStr,
    checkOut: tomorrowStr,
    guests: 2,
    mealPlan: 'Room Only (No Meals)',
    paymentMethod: 'Admin Support Booking Override',
    total: 550
  });

  useEffect(() => {
    const fetchAdminBookings = async () => {
      try {
        const [bookingsRes, hotelsRes] = await Promise.all([
          fetch('/api/bookings'),
          fetch('/api/hotels')
        ]);
        const bookingsData = await bookingsRes.json();
        const hotelsData = await hotelsRes.json();

        if (Array.isArray(bookingsData)) {
          setBookings(bookingsData);
          try { localStorage.setItem('luxestay_cache_bookings', JSON.stringify(bookingsData)); } catch (e) {}
        }
        if (Array.isArray(hotelsData)) {
          setHotels(hotelsData);
          try { localStorage.setItem('luxestay_cache_hotels', JSON.stringify(hotelsData)); } catch (e) {}
          if (hotelsData.length > 0) {
            const h = hotelsData[0];
            const diffTime = new Date(tomorrowStr).getTime() - new Date(todayStr).getTime();
            const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
            const rate = Number(h.pricePerNight || 550);
            setFormData(prev => ({
              ...prev,
              hotelId: h.id,
              nights,
              nightlyRate: rate,
              total: nights * rate
            }));
          }
        }
      } catch (e) {}
    };

    fetchAdminBookings();
  }, []);

  const calculateAdminBookingTotal = (hotelId, checkIn, checkOut, mealPlan) => {
    const selectedHotel = hotels.find(h => h.id === hotelId) || hotels[0];
    const nightlyRate = Number(selectedHotel?.pricePerNight || 550);

    let nights = 1;
    if (checkIn && checkOut) {
      const diffTime = new Date(checkOut).getTime() - new Date(checkIn).getTime();
      nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }

    let mealPlanExtra = 0;
    if (mealPlan && mealPlan.includes('All-Inclusive')) {
      mealPlanExtra = 50;
    } else if (mealPlan && mealPlan.includes('Half Board')) {
      mealPlanExtra = 35;
    }

    const total = nights * (nightlyRate + mealPlanExtra);
    return { nights, nightlyRate, total };
  };

  const handleAdminFieldChange = (field, value) => {
    setFormData(prev => {
      let updated = { ...prev, [field]: value };

      if (field === 'checkIn') {
        const inTime = new Date(value).getTime();
        const outTime = new Date(updated.checkOut).getTime();
        if (isNaN(outTime) || inTime >= outTime) {
          const nextDay = new Date(value);
          nextDay.setDate(nextDay.getDate() + 1);
          updated.checkOut = nextDay.toISOString().split('T')[0];
        }
      }

      const { nights, nightlyRate, total } = calculateAdminBookingTotal(
        updated.hotelId,
        updated.checkIn,
        updated.checkOut,
        updated.mealPlan
      );

      return {
        ...updated,
        nights,
        nightlyRate,
        total
      };
    });
  };

  const handleStatusChange = (id, newStatus) => {
    // 1. Optimistic UI update in state & localStorage cache (0ms instant)
    setBookings(prev => {
      const updated = prev.map(b => b.id === id ? { ...b, status: newStatus } : b);
      try { localStorage.setItem('luxestay_cache_bookings', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });

    // 2. Server Persistence to MongoDB Atlas
    fetch(`/api/bookings/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })
      .then(res => res.json())
      .then(updated => {
        if (updated && updated.id) {
          setBookings(prev => {
            const list = prev.map(b => b.id === id ? { ...b, ...updated } : b);
            try { localStorage.setItem('luxestay_cache_bookings', JSON.stringify(list)); } catch (e) {}
            return list;
          });
        }
      })
      .catch(() => {});
  };

  const handleCreateAdminBooking = async (e) => {
    e.preventDefault();
    if (!formData.guestName.trim()) return;
    setLoading(true);

    const selectedHotel = hotels.find(h => h.id === formData.hotelId) || hotels[0] || { name: 'The Grand Azure Resort', pricePerNight: 550 };
    
    // Calculate nights
    const diffTime = new Date(formData.checkOut).getTime() - new Date(formData.checkIn).getTime();
    const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    
    const newBookingData = {
      id: `BK-${Math.floor(10000 + Math.random() * 90000)}`,
      hotelId: selectedHotel.id,
      hotelName: selectedHotel.name,
      roomId: 'r101',
      roomName: 'Executive Luxury Suite',
      guestName: formData.guestName,
      guestEmail: formData.guestEmail || 'vipguest@luxestay.com',
      guestPhone: formData.guestPhone || '+1 555-998877',
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      nights,
      guests: Number(formData.guests),
      nightlyRate: selectedHotel.pricePerNight || 550,
      mealPlan: formData.mealPlan,
      total: Number(formData.total) || (selectedHotel.pricePerNight * nights),
      paymentMethod: formData.paymentMethod,
      status: 'Confirmed',
      createdAt: new Date().toISOString()
    };

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBookingData)
      });

      if (res.ok) {
        const saved = await res.json();
        setBookings([saved, ...bookings]);
        setIsModalOpen(false);
      } else {
        setBookings([newBookingData, ...bookings]);
        setIsModalOpen(false);
      }
    } catch (err) {
      setBookings([newBookingData, ...bookings]);
      setIsModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

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
  const totalPages = Math.ceil(bookings.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBookings = bookings.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <PortalLayout role="admin" title="Master Booking Ledger">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)]">Master Booking Ledger</h1>
          <p className="text-xs text-[var(--text-secondary)]">Platform-wide transaction history, auto checkout tracking & 15% marketplace commission</p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-xs py-3 px-5 shadow-lg shadow-amber-500/25 flex items-center gap-2 font-extrabold cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Create Admin Booking
        </button>
      </div>

      {/* Master Booking Table */}
      <div className="space-y-6">
        <div className="rounded-3xl bg-[var(--bg-card)] border border-[var(--border-light)] overflow-hidden shadow-lg p-2 sm:p-4">
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th className="pl-6">Booking Ref & Guest Details</th>
                  <th>Property & Suite Details</th>
                  <th>Financial Settlement</th>
                  <th className="pr-6 text-right">Status & Override Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-light)]">
                {currentBookings.map(bk => (
                  <tr key={bk.id} className="transition-all hover:bg-[var(--bg-tertiary)]/30">
                    <td className="pl-6">
                      <div className="space-y-1 py-1">
                        <span className="inline-flex px-2.5 py-1 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 font-mono font-bold text-[10px]">
                          {bk.id}
                        </span>
                        <span className="block text-sm font-extrabold text-[var(--text-primary)]">{bk.guestName}</span>
                        <span className="text-[10px] text-[var(--text-muted)] font-bold block">{bk.guestEmail}</span>
                      </div>
                    </td>
                    <td>
                      <div className="space-y-1 font-bold text-[var(--text-secondary)]">
                        <span className="text-sm text-[var(--text-primary)] block">{bk.hotelName}</span>
                        <span className="text-[10px] text-[var(--text-muted)] block">• {bk.roomName}</span>
                      </div>
                    </td>
                    <td>
                      <div className="space-y-1 font-bold">
                        <span className="text-sm font-black text-amber-500 block">{formatPrice(bk.total)}</span>
                        <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold">
                          <span>Comm: {formatPrice(Math.round(bk.total * 0.15))}</span>
                          <span className="text-[9px] text-[var(--text-muted)] font-normal">(15%)</span>
                        </div>
                      </div>
                    </td>
                    <td className="pr-6">
                      <div className="flex flex-col items-end gap-1.5 py-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider mr-1 flex items-center gap-1">
                            <CreditCard className="w-3.5 h-3.5 text-amber-500" />
                            <span>{bk.paymentMethod?.split(' ')[0] || 'Invoice'}</span>
                          </span>
                          {renderStatusBadge(bk.status)}
                        </div>
                        <select 
                          value={bk.status || 'Confirmed'} 
                          onChange={(e) => handleStatusChange(bk.id, e.target.value)}
                          className="px-2.5 py-1.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-[11px] font-bold text-[var(--text-primary)] outline-none cursor-pointer hover:border-amber-500 transition-colors shadow-xs"
                        >
                          <option value="Confirmed" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Confirmed</option>
                          <option value="Checked-In" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Checked-In</option>
                          <option value="Checked-Out" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Checked-Out</option>
                          <option value="Cancelled" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Cancelled</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-[var(--border-light)]">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="btn btn-outline text-xs px-4 py-2 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    currentPage === page 
                      ? 'bg-amber-500 text-white shadow-md' 
                      : 'bg-transparent text-[var(--text-secondary)] border border-[var(--border-light)] hover:border-amber-500/40'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="btn btn-outline text-xs px-4 py-2 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* ADMIN SUPPORT RESERVATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border-light)] rounded-3xl shadow-2xl overflow-hidden">
            
            <div className="px-6 py-4 border-b border-[var(--border-light)] flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Create System Admin Booking</h3>
                  <p className="text-[11px] text-amber-200">Reserve rooms for customer support or VIP corporate clients</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAdminBooking} className="p-6 space-y-4 text-xs font-semibold">
                        <div>
                <label className="block text-[var(--text-secondary)] font-bold mb-1">
                  Select Hotel Property *
                </label>
                <select 
                  value={formData.hotelId}
                  onChange={(e) => handleAdminFieldChange('hotelId', e.target.value)}
                  className="w-full p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-[var(--text-primary)] outline-none font-bold cursor-pointer"
                >
                  {hotels.map(ht => (
                    <option key={ht.id} value={ht.id} className="bg-[var(--bg-card)] text-[var(--text-primary)]">
                      {ht.name} - {ht.destination} (${ht.pricePerNight}/night)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[var(--text-secondary)] font-bold mb-1">
                    Guest Full Name *
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Sir Richard Branson" 
                    value={formData.guestName}
                    onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                    className="w-full p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-[var(--text-primary)] outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[var(--text-secondary)] font-bold mb-1">
                    Guest Email / Contact
                  </label>
                  <input 
                    type="email" 
                    placeholder="vipguest@example.com" 
                    value={formData.guestEmail}
                    onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
                    className="w-full p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-[var(--text-primary)] outline-none font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[var(--text-secondary)] font-bold mb-1">
                    Check-In Date *
                  </label>
                  <input 
                    type="date" 
                    required
                    value={formData.checkIn}
                    onChange={(e) => handleAdminFieldChange('checkIn', e.target.value)}
                    className="w-full p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-[var(--text-primary)] outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[var(--text-secondary)] font-bold mb-1">
                    Check-Out Date *
                  </label>
                  <input 
                    type="date" 
                    required
                    min={formData.checkIn}
                    value={formData.checkOut}
                    onChange={(e) => handleAdminFieldChange('checkOut', e.target.value)}
                    className="w-full p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-[var(--text-primary)] outline-none font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[var(--text-secondary)] font-bold mb-1">
                    Payment Method
                  </label>
                  <select 
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-[var(--text-primary)] outline-none font-bold cursor-pointer"
                  >
                    <option value="Admin Support Booking Override" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Admin Support Override</option>
                    <option value="Corporate Direct Invoice" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Corporate Direct Invoice</option>
                    <option value="VIP Complimentary Pass" className="bg-[var(--bg-card)] text-[var(--text-primary)]">VIP Complimentary Pass</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[var(--text-secondary)] font-bold mb-1">
                    Dining Package
                  </label>
                  <select 
                    value={formData.mealPlan}
                    onChange={(e) => handleAdminFieldChange('mealPlan', e.target.value)}
                    className="w-full p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-[var(--text-primary)] outline-none font-bold cursor-pointer"
                  >
                    <option value="Room Only (No Meals)" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Room Only (No Meals)</option>
                    <option value="All-Inclusive 3 Meals Package (Breakfast, Lunch & Dinner)" className="bg-[var(--bg-card)] text-[var(--text-primary)]">All-Inclusive 3 Meals Full Board (+$50/night)</option>
                    <option value="Half Board Package (Breakfast & Dinner)" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Half Board (Breakfast & Dinner +$35/night)</option>
                    <option value="Gourmet Breakfast Daily" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Breakfast Only</option>
                  </select>
                </div>
              </div>

              {/* Total Summary Price with dynamic rate breakdown */}
              <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/30 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] font-semibold">
                  <span>Stay Duration & Nightly Rate:</span>
                  <span className="font-bold text-[var(--text-primary)]">
                    {Math.max(1, Math.ceil((new Date(formData.checkOut).getTime() - new Date(formData.checkIn).getTime()) / (1000 * 60 * 60 * 24)))} Night(s) × ${(hotels.find(h => h.id === formData.hotelId) || hotels[0])?.pricePerNight || 550}/night
                  </span>
                </div>
                <div className="flex items-center justify-between text-[var(--text-primary)] font-black text-sm pt-2 border-t border-amber-500/20">
                  <span>Calculated Reservation Total:</span>
                  <span className="text-xl font-black text-amber-500">${formData.total}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--border-light)] flex items-center justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-[var(--border-light)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-bold hover:bg-[var(--border-light)] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn btn-primary bg-amber-500 hover:bg-amber-600 px-6 py-2.5 text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-amber-500/25 cursor-pointer"
                >
                  {loading ? 'Creating...' : 'Create Admin Booking'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </PortalLayout>
  );
};
