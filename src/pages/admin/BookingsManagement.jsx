import React, { useState, useEffect } from 'react';
import { Plus, X, Building2, ShieldCheck, CheckCircle2, DollarSign } from 'lucide-react';
import { PortalLayout } from '../../components/PortalLayout';
import { useCurrency } from '../../context/CurrencyContext';

export const BookingsManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
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
    fetch('/api/bookings')
      .then(res => res.json())
      .then(data => setBookings(Array.isArray(data) ? data : []))
      .catch(() => setBookings([]));

    fetch('/api/hotels')
      .then(res => res.json())
      .then(data => {
        const hotelList = Array.isArray(data) ? data : [];
        setHotels(hotelList);
        if (hotelList.length > 0) {
          setFormData(prev => ({ 
            ...prev, 
            hotelId: hotelList[0].id,
            total: hotelList[0].pricePerNight || 550
          }));
        }
      })
      .catch(() => setHotels([]));
  }, []);

  const handleStatusChange = (id, newStatus) => {
    fetch(`/api/bookings/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })
      .then(res => res.json())
      .then(updated => {
        setBookings(prev => prev.map(b => b.id === id ? updated : b));
      });
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
      <div className="rounded-3xl bg-[var(--bg-card)] border border-[var(--border-light)] overflow-hidden shadow-lg">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Ref ID</th>
                <th>Guest Name</th>
                <th>Property</th>
                <th>Total Paid</th>
                <th>Admin Commission (15%)</th>
                <th>Payment Method</th>
                <th>Status</th>
                <th>Quick Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(bk => (
                <tr key={bk.id}>
                  <td className="font-mono font-bold text-amber-500">{bk.id}</td>
                  <td className="font-bold text-[var(--text-primary)]">{bk.guestName}</td>
                  <td className="text-xs">{bk.hotelName}</td>
                  <td className="font-extrabold">{formatPrice(bk.total)}</td>
                  <td className="font-extrabold text-emerald-500">{formatPrice(Math.round(bk.total * 0.15))}</td>
                  <td className="text-xs">{bk.paymentMethod}</td>
                  <td>{renderStatusBadge(bk.status)}</td>
                  <td>
                    <select 
                      value={bk.status || 'Confirmed'} 
                      onChange={(e) => handleStatusChange(bk.id, e.target.value)}
                      className="px-2 py-1 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-[11px] font-bold text-[var(--text-primary)] outline-none cursor-pointer"
                    >
                      <option value="Confirmed" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Confirmed</option>
                      <option value="Checked-In" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Checked-In</option>
                      <option value="Checked-Out" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Checked-Out</option>
                      <option value="Cancelled" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
                  onChange={(e) => {
                    const h = hotels.find(item => item.id === e.target.value);
                    setFormData({ 
                      ...formData, 
                      hotelId: e.target.value,
                      total: h ? h.pricePerNight : formData.total 
                    });
                  }}
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
                    onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
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
                    value={formData.checkOut}
                    onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, mealPlan: e.target.value })}
                    className="w-full p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-[var(--text-primary)] outline-none font-bold cursor-pointer"
                  >
                    <option value="Room Only (No Meals)" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Room Only (No Meals)</option>
                    <option value="All-Inclusive 3 Meals Package (Breakfast, Lunch & Dinner)" className="bg-[var(--bg-card)] text-[var(--text-primary)]">All-Inclusive 3 Meals Full Board</option>
                    <option value="Half Board Package (Breakfast & Dinner)" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Half Board (Breakfast & Dinner)</option>
                    <option value="Gourmet Breakfast Daily" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Breakfast Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-amber-500 font-extrabold uppercase tracking-wider mb-1">
                  Total Reservation Amount ($ USD) *
                </label>
                <input 
                  type="number" 
                  required
                  min="1"
                  value={formData.total}
                  onChange={(e) => setFormData({ ...formData, total: e.target.value })}
                  className="w-full p-3.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-[var(--text-primary)] outline-none font-bold text-lg text-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-[var(--border-light)] flex items-center justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-[var(--border-light)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-bold hover:bg-[var(--border-light)] transition-colors"
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
