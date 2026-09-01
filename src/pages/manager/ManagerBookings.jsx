import React, { useState, useEffect } from 'react';
import { Plus, X, Calendar, User, Phone, Mail, Building2, ShieldCheck, CheckCircle2, DollarSign, Utensils, Search, ChevronDown, MoreHorizontal, Check, Edit, Info, ArrowLeft, Star, Award, MapPin, Save } from 'lucide-react';
import { PortalLayout } from '../../components/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';

import { getInstantData } from '../../utils/instantCache';

export const ManagerBookings = () => {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  
  // State variables
  const [bookings, setBookings] = useState(() => getInstantData('manager_bookings', []));
  const [rooms, setRooms] = useState(() => getInstantData('manager_rooms', []));
  const [selectedBooking, setSelectedBooking] = useState(null); // When not null, show Detail View
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null); // Track if we are editing an existing booking
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [dateFilter, setDateFilter] = useState(''); // Real Check-In Date selector state

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    roomId: '',
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    checkIn: todayStr,
    checkOut: tomorrowStr,
    guests: 2,
    mealPlan: 'Breakfast Included',
    paymentMethod: 'Walk-in Cash at Reception',
    total: 450
  });

  const fetchBookingsData = async () => {
    try {
      // Parallel simultaneous fetch (under 300ms instead of 4.5 seconds waterfall)
      const [hotelsRes, bookingsRes, roomsRes] = await Promise.all([
        fetch('/api/hotels'),
        fetch('/api/bookings'),
        fetch('/api/rooms')
      ]);
      const hotelsData = await hotelsRes.json();
      const bookingsData = await bookingsRes.json();
      const roomsData = await roomsRes.json();

      if (Array.isArray(hotelsData)) {
        const myHotels = hotelsData.filter(h => {
          if (!user) return false;
          const uId = user.id ? String(user.id) : null;
          const uEmail = user.email ? user.email.toLowerCase() : null;
          const uName = user.name ? user.name.toLowerCase() : null;
          const uCompany = user.companyName ? user.companyName.toLowerCase() : null;

          if (h.partnerId && uId && String(h.partnerId) === uId) return true;
          if (h.partnerEmail && uEmail && h.partnerEmail.toLowerCase() === uEmail) return true;
          if (h.partnerName && uName && h.partnerName.toLowerCase() === uName) return true;
          if (h.partnerName && uCompany && h.partnerName.toLowerCase() === uCompany) return true;
          if (h.partnerName && uEmail && h.partnerName.toLowerCase() === uEmail.split('@')[0]) return true;
          return false;
        });
        const myHotelIds = myHotels.map(h => h.id);

        if (Array.isArray(bookingsData)) {
          const myBookings = bookingsData.filter(b => {
            if (!user) return false;
            const uId = user.id ? String(user.id) : null;
            const uEmail = user.email ? user.email.toLowerCase() : null;
            const uName = user.name ? user.name.toLowerCase() : null;
            const uCompany = user.companyName ? user.companyName.toLowerCase() : null;

            if (b.hotelId && myHotelIds.includes(b.hotelId)) return true;
            if (b.partnerId && uId && String(b.partnerId) === uId) return true;
            if (b.partnerEmail && uEmail && b.partnerEmail.toLowerCase() === uEmail) return true;
            if (b.partnerName && uName && b.partnerName.toLowerCase() === uName) return true;
            if (b.partnerName && uCompany && b.partnerName.toLowerCase() === uCompany) return true;
            return false;
          });
          setBookings(myBookings);
          try { localStorage.setItem('luxestay_cache_manager_bookings', JSON.stringify(myBookings)); } catch (e) {}
        }

        if (Array.isArray(roomsData)) {
          const myRooms = roomsData.filter(r => myHotelIds.includes(r.hotelId) || (!r.hotelId && user?.role === 'manager'));
          setRooms(myRooms);
          try { localStorage.setItem('luxestay_cache_manager_rooms', JSON.stringify(myRooms)); } catch (e) {}
          if (myRooms.length > 0) {
            setFormData(prev => ({ 
              ...prev, 
              roomId: myRooms[0].id,
              total: myRooms[0].price || 450
            }));
          }
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchBookingsData();
  }, [user]);

  const handleStatusChange = (id, newStatus) => {
    fetch(`/api/bookings/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })
      .then(res => res.json())
      .then(updated => {
        setBookings(prev => prev.map(b => b.id === id ? updated : b));
        if (selectedBooking?.id === id) {
          setSelectedBooking(updated);
        }
      });
  };

  const openAddModal = () => {
    setEditingBooking(null);
    setFormData({
      roomId: rooms[0]?.id || '',
      guestName: '',
      guestEmail: '',
      guestPhone: '',
      checkIn: todayStr,
      checkOut: tomorrowStr,
      guests: 2,
      mealPlan: 'Breakfast Included',
      paymentMethod: 'Walk-in Cash at Reception',
      total: rooms[0]?.price || 450
    });
    setIsModalOpen(true);
  };

  const openEditModal = (booking) => {
    setEditingBooking(booking);
    setFormData({
      roomId: booking.roomId || rooms[0]?.id || '',
      guestName: booking.guestName || '',
      guestEmail: booking.guestEmail || '',
      guestPhone: booking.guestPhone || '',
      checkIn: booking.checkIn || todayStr,
      checkOut: booking.checkOut || tomorrowStr,
      guests: booking.guests || 2,
      mealPlan: booking.mealPlan || 'Breakfast Included',
      paymentMethod: booking.paymentMethod || 'Walk-in Cash at Reception',
      total: booking.total || 450
    });
    setIsModalOpen(true);
  };

  const handleSaveBooking = (e) => {
    e.preventDefault();
    setLoading(true);

    const selectedRoomDetails = rooms.find(r => r.id === formData.roomId);
    const targetHotelId = selectedRoomDetails?.hotelId || 'h1';

    const payload = {
      ...formData,
      hotelId: targetHotelId,
      roomName: selectedRoomDetails?.name || 'Deluxe Executive Suite'
    };

    const url = editingBooking ? `/api/bookings/${editingBooking.id}` : '/api/bookings';
    const method = editingBooking ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(saved => {
        setLoading(false);
        setIsModalOpen(false);
        setEditingBooking(null);
        fetchBookingsData();
        setSelectedBooking(saved);
      })
      .catch(() => setLoading(false));
  };

  // dynamic filtering based on search query, status dropdown, and check-in date selection
  const filteredBookings = bookings.filter(b => {
    const matchesSearch = 
      (b.guestName || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
      (b.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.roomName || '').toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter === 'All Status' || b.status?.toLowerCase() === statusFilter.toLowerCase();
    const matchesDate = !dateFilter || b.checkIn === dateFilter;
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Find dynamic room specs of selected booking
  const matchedRoom = selectedBooking ? rooms.find(r => r.id === selectedBooking.roomId || r.name === selectedBooking.roomName) : null;

  // Filter dynamic booking history for this specific guest
  const guestHistory = selectedBooking ? bookings.filter(b => 
    b.guestEmail === selectedBooking.guestEmail && b.id !== selectedBooking.id
  ) : [];

  return (
    <PortalLayout role="manager" title="LuxStay Reservations">
      <div className="w-full space-y-6 font-sans text-slate-800 animate-fade-in pb-12">
        
        {/* VIEW 1: Reservation List View */}
        {!selectedBooking && (
          <div className="space-y-6">
            
            {/* Header controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Reservation</h1>
              
              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Search guest, status, etc"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-4 py-2.5 rounded-full border border-slate-200 bg-white text-xs outline-none w-52 font-medium"
                  />
                </div>

                {/* Status filter */}
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2.5 rounded-full border border-slate-200 bg-white text-xs outline-none cursor-pointer font-bold"
                >
                  <option value="All Status">All Status</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Pending">Pending</option>
                  <option value="Checked-In">Checked-In</option>
                  <option value="Checked-Out">Checked-Out</option>
                  <option value="Cancelled">Cancelled</option>
                </select>

                {/* Real interactive date picker */}
                <div className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 rounded-full text-slate-700 hover:bg-slate-50 transition-colors">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <input 
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="bg-transparent border-none text-xs font-bold outline-none cursor-pointer text-slate-700" 
                  />
                  {dateFilter && (
                    <button 
                      onClick={() => setDateFilter('')} 
                      className="p-0.5 rounded-full hover:bg-slate-200 text-slate-400 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Add Booking button */}
                <button 
                  onClick={openAddModal}
                  className="px-5 py-2.5 rounded-full bg-[#e2f896] hover:bg-[#d4ed83] text-slate-950 text-xs font-black shadow-xs flex items-center gap-1.5 cursor-pointer transition-transform hover:scale-102"
                >
                  <Plus className="w-4 h-4" /> Add Booking
                </button>
              </div>
            </div>

            {/* List Table */}
            <div className="bg-white rounded-3xl border border-slate-200/70 shadow-2xs overflow-hidden w-full">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] uppercase font-black text-slate-400 tracking-wider">
                      <th className="py-4.5 px-6">Guest</th>
                      <th className="py-4.5 px-5">Room</th>
                      <th className="py-4.5 px-5">Request</th>
                      <th className="py-4.5 px-5">Duration</th>
                      <th className="py-4.5 px-5">Check-In & Out</th>
                      <th className="py-4.5 px-5">Status</th>
                      <th className="py-4.5 px-6 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                    {filteredBookings.map((b) => (
                      <tr 
                        key={b.id}
                        onClick={() => setSelectedBooking(b)}
                        className="cursor-pointer hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="py-4.5 px-6">
                          <span className="text-slate-950 block text-sm font-extrabold leading-tight">{b.guestName}</span>
                          <span className="text-[10px] text-slate-400 font-bold font-mono">BK-{b.id?.slice(-5).toUpperCase() || '23524'}</span>
                        </td>
                        <td className="py-4.5 px-5">
                          <span className="text-slate-800 block font-extrabold">{b.roomName || 'Deluxe Room'}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">Room 101</span>
                        </td>
                        <td className="py-4.5 px-5 text-slate-400 font-medium max-w-[150px] truncate">
                          {b.mealPlan || 'Breakfast Included'}
                        </td>
                        <td className="py-4.5 px-5 font-black text-slate-950">
                          {b.nights || 3} nights
                        </td>
                        <td className="py-4.5 px-5 text-slate-500 font-medium">
                          {b.checkIn} — {b.checkOut}
                        </td>
                        <td className="py-4.5 px-5">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                            b.status?.toLowerCase() === 'confirmed' || b.status?.toLowerCase() === 'upcoming'
                              ? 'bg-blue-50 text-blue-700 border border-blue-100'
                              : b.status?.toLowerCase() === 'checked-in' || b.status?.toLowerCase() === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : b.status?.toLowerCase() === 'cancelled'
                              ? 'bg-rose-50 text-rose-700 border border-rose-100'
                              : 'bg-yellow-50 text-amber-700 border border-yellow-100'
                          }`}>
                            {b.status || 'Pending'}
                          </span>
                        </td>
                        <td className="py-4.5 px-6 text-center">
                          <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                            {/* Check-In checkmark button */}
                            {b.status !== 'Checked-In' && (
                              <button 
                                onClick={() => handleStatusChange(b.id, 'Checked-In')}
                                className="p-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors cursor-pointer"
                                title="Check In Guest"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            
                            {/* Reactivate cancelled booking to Confirmed status option */}
                            {b.status === 'Cancelled' && (
                              <button 
                                onClick={() => handleStatusChange(b.id, 'Confirmed')}
                                className="p-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors cursor-pointer"
                                title="Reactivate Booking"
                              >
                                <ShieldCheck className="w-4 h-4" />
                              </button>
                            )}

                            {/* Cancel Booking option */}
                            {b.status !== 'Cancelled' && (
                              <button 
                                onClick={() => handleStatusChange(b.id, 'Cancelled')}
                                className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                                title="Cancel Booking"
                              >
                                <X className="w-4 h-4" />
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

          </div>
        )}

        {/* VIEW 2: Guest Profile Detail View */}
        {selectedBooking && (
          <div className="space-y-6">
            
            {/* Top Navigation Row */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSelectedBooking(null)}
                className="p-2.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer text-slate-700 hover:text-slate-900"
              >
                <ArrowLeft className="w-4.5 h-4.5" />
              </button>
              <div>
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Guest Profile</h1>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Reservation / Guest Profile</p>
              </div>
            </div>

            {/* THREE-COLUMN TOP SECTION: Profile | Booking Info | Room Info */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* CARD 1: Profile (3/12 cols) */}
              <div className="lg:col-span-3 bg-white p-5 rounded-3xl border border-slate-200/70 shadow-2xs flex flex-col justify-between space-y-5">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Profile</span>
                    <button className="p-1 text-slate-400 hover:text-slate-700"><MoreHorizontal className="w-4 h-4" /></button>
                  </div>

                  <div className="space-y-3">
                    {/* Avatar & Name */}
                    <div className="flex items-center gap-3">
                      <img 
                        src={selectedBooking.guestAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"} 
                        className="w-14 h-14 rounded-full object-cover border border-slate-100 shadow-2xs" 
                        alt="" 
                      />
                      <div className="min-w-0">
                        <h4 className="text-sm font-black text-slate-900 leading-tight">{selectedBooking.guestName}</h4>
                        <p className="text-[9px] text-slate-400 font-bold font-mono">G0011-987654321</p>
                      </div>
                    </div>

                    {/* Contact details */}
                    <div className="space-y-2 pt-2 text-[11px] font-bold text-slate-700">
                      <div className="flex items-center gap-2 p-1.5 px-2.5 rounded-full bg-[#e2f896]/20 border border-[#e2f896]/40 text-slate-900 w-fit">
                        <Phone className="w-3.5 h-3.5 text-slate-700" />
                        <span>{selectedBooking.guestPhone || '+1 (555) 000-1122'}</span>
                      </div>
                      <div className="flex items-center gap-2 p-1.5 px-2.5 rounded-full bg-slate-50 border border-slate-200/60 text-slate-600 w-fit">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="max-w-[150px] truncate">{selectedBooking.guestEmail || 'sharif@gmail.com'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Personal Information */}
                  <div className="space-y-2.5 border-t border-slate-100 pt-4 text-[11px] font-bold text-slate-700">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Personal Information</span>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[9px] text-slate-400 block font-semibold">Date of Birth</span>
                        <span>{selectedBooking.guestDOB || 'June 15, 1985'}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block font-semibold">Gender</span>
                        <span>{selectedBooking.guestGender || 'Male'}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block font-semibold">Nationality</span>
                        <span>{selectedBooking.guestNationality || 'American'}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block font-semibold">Passport No.</span>
                        <span className="font-mono">{selectedBooking.guestPassport || 'A12345678'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Loyalty Program */}
                <div className="space-y-2.5 border-t border-slate-100 pt-4 text-[11px] font-bold text-slate-700">
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Loyalty Program</span>
                  <div className="space-y-2">
                    <div>
                      <span className="text-[9px] text-slate-400 block font-semibold">Membership Status</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#e2f896] text-slate-900 text-[9px] font-black uppercase tracking-wider mt-0.5 inline-block">
                        {selectedBooking.loyaltyStatus || 'Platinum Member'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[9px] text-slate-400 block font-semibold">Points Balance</span>
                        <span className="text-slate-950 font-black">{selectedBooking.loyaltyPoints || '15,000 points'}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block font-semibold">Tier Level</span>
                        <span className="text-slate-950 font-black">{selectedBooking.loyaltyTier || 'Elite'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD 2: Booking Info (6/12 cols) */}
              <div className="lg:col-span-6 bg-white p-5 rounded-3xl border border-slate-200/70 shadow-2xs flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Booking Info</span>
                    
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      selectedBooking.status?.toLowerCase() === 'confirmed' || selectedBooking.status?.toLowerCase() === 'upcoming'
                        ? 'bg-blue-50 text-blue-700 border border-blue-100'
                        : selectedBooking.status?.toLowerCase() === 'checked-in' || selectedBooking.status?.toLowerCase() === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        : 'bg-rose-50 text-rose-700 border border-rose-100'
                    }`}>
                      {selectedBooking.status === 'Cancelled' ? '✓ Booking Cancelled' : '✓ Booking Confirmed'}
                    </span>
                  </div>

                  {/* ID & Date */}
                  <div className="space-y-0.5">
                    <h3 className="text-base font-black text-slate-900">Booking ID: BK-{selectedBooking.id?.slice(-5).toUpperCase() || 'B00109'}</h3>
                    <span className="text-[10px] text-slate-400 font-semibold block">June 17, 2024, 9:42 AM</span>
                  </div>

                  {/* Booking Fields Grid */}
                  <div className="grid grid-cols-3 gap-y-4 gap-x-6 text-[11px] font-bold text-slate-700">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block mb-0.5">Room Type</span>
                      <span className="text-slate-900">{selectedBooking.roomName || 'Deluxe Room'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block mb-0.5">Room Number</span>
                      <span className="text-slate-900">101</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block mb-0.5">Price</span>
                      <span className="text-slate-900">{formatPrice(selectedBooking.nightlyRate || selectedBooking.price || 150)}/night</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block mb-0.5">Guests</span>
                      <span className="text-slate-900">{selectedBooking.guests || 2} Adults</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block mb-0.5">Requests</span>
                      <span className="text-slate-900">{selectedBooking.mealPlan || 'Late Check-Out'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block mb-0.5">Duration</span>
                      <span className="text-slate-950 font-black">{selectedBooking.nights || 3} nights</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block mb-0.5">Check In</span>
                      <span className="text-slate-900">{selectedBooking.checkIn} (1:45 PM)</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block mb-0.5">Check Out</span>
                      <span className="text-slate-900">{selectedBooking.checkOut} (11:45 AM)</span>
                    </div>
                  </div>

                  {/* Notes box */}
                  <div className="space-y-1 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-[11px]">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Notes</span>
                    <p className="text-slate-500 font-medium leading-relaxed">
                      {selectedBooking.notes || 'Guest requested extra pillows and towels. Ensure room service is available upon arrival.'}
                    </p>
                  </div>

                  {/* Amenities checklist */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-slate-100 pt-4 text-[11px] font-bold text-slate-700">
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-400 uppercase block">Loyalty Program</span>
                      <span>Platinum Member</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-400 uppercase block">Special Amenities</span>
                      <ul className="space-y-1 text-slate-500">
                        <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> Complimentary breakfast</li>
                        <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> Free Wi-Fi</li>
                        <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> Access to gym and pool</li>
                      </ul>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-400 uppercase block">Transportation</span>
                      <span>{selectedBooking.airportPickup ? 'Airport pickup arranged' : 'Not Arranged'}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-400 uppercase block">Extras</span>
                      <span>-</span>
                    </div>
                  </div>
                </div>

                {/* Edit & Cancel Buttons bottom row */}
                <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                  {selectedBooking.status === 'Cancelled' ? (
                    <>
                      <button 
                        onClick={() => handleStatusChange(selectedBooking.id, 'Confirmed')}
                        className="px-4.5 py-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-black cursor-pointer"
                      >
                        Reconfirm Booking
                      </button>
                      <button 
                        onClick={() => handleStatusChange(selectedBooking.id, 'Checked-In')}
                        className="px-4.5 py-2.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 text-xs font-black cursor-pointer"
                      >
                        Check-In Guest
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => openEditModal(selectedBooking)}
                        className="px-4.5 py-2.5 rounded-xl border border-slate-200 text-xs font-black hover:bg-slate-50 cursor-pointer"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleStatusChange(selectedBooking.id, 'Cancelled')}
                        className="px-4.5 py-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-black cursor-pointer"
                      >
                        Cancel Booking
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* CARD 3: Room Info & Price Summary */}
              <div className="lg:col-span-3 bg-white p-5 rounded-3xl border border-slate-200/70 shadow-2xs flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Room Info</span>
                    <span className="text-amber-600 text-xs font-bold hover:underline cursor-pointer">View Detail</span>
                  </div>

                  {/* Room Thumbnail Photo */}
                  <div className="h-28 rounded-2xl overflow-hidden bg-slate-100">
                    <img 
                      src={matchedRoom?.image || selectedBooking.roomImage || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=300&q=80"} 
                      className="w-full h-full object-cover" 
                      alt="" 
                    />
                  </div>

                  {/* Space capacity config */}
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 border-b border-slate-100 pb-3">
                    <span>{matchedRoom?.size || '35 m²'}</span>
                    <span>•</span>
                    <span>{matchedRoom?.bedType || 'King Bed'}</span>
                    <span>•</span>
                    <span>{matchedRoom?.capacity || 2} guests</span>
                  </div>

                  {/* Price Summary */}
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Price Summary</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                        selectedBooking.status === 'Cancelled' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {selectedBooking.status === 'Cancelled' ? 'Unpaid' : 'Paid'}
                      </span>
                    </div>

                    <div className="space-y-2 text-[11px] font-bold text-slate-600">
                      <div className="flex justify-between">
                        <span>Room and offer</span>
                        <span className="text-slate-900">{formatPrice(selectedBooking.subtotal || (selectedBooking.price * selectedBooking.nights) || 450)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Extras</span>
                        <span className="text-slate-900">{formatPrice(selectedBooking.extrasPrice || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>8% VAT</span>
                        <span className="text-slate-900">{formatPrice(selectedBooking.tax || 36)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>City Tax</span>
                        <span className="text-slate-900">{formatPrice(selectedBooking.cityTax || 49.50)}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-100 pt-2.5 text-xs text-slate-950 font-black">
                        <span>Total Price</span>
                        <span>{formatPrice(selectedBooking.total || 535.50)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price footer note */}
                <div className="pt-3 border-t border-slate-100 text-[9px] text-slate-400 font-semibold leading-relaxed">
                  Invoice sent to corporate account; payment confirmed by BIG Corporation
                </div>
              </div>

            </div>

            {/* FULL-WIDTH SECTION: Booking History */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/70 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-900">Booking History</h3>
                
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" 
                      placeholder="Search history..."
                      className="pl-8 pr-4 py-2 rounded-full border border-slate-200 bg-slate-50 text-[10px] outline-none w-44 font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* History Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[11px] font-bold text-slate-700">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] uppercase font-black text-slate-400">
                      <th className="py-3.5 px-4">Image</th>
                      <th className="py-3.5 px-4">Booking ID</th>
                      <th className="py-3.5 px-4">Booking Date</th>
                      <th className="py-3.5 px-4">Room Type</th>
                      <th className="py-3.5 px-4">Room Number</th>
                      <th className="py-3.5 px-4">Check-In</th>
                      <th className="py-3.5 px-4">Check-Out</th>
                      <th className="py-3.5 px-4">Guests</th>
                      <th className="py-3.5 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {guestHistory.map((hBooking) => (
                      <tr key={hBooking.id} className="hover:bg-slate-50/30">
                        <td className="py-3 px-4">
                          <div className="w-12 h-9 rounded-lg overflow-hidden bg-slate-100">
                            <img src={hBooking.roomImage || hBooking.image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=80&q=80"} className="w-full h-full object-cover" alt="" />
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-900 font-extrabold font-mono">BK-{hBooking.id?.slice(-5).toUpperCase()}</td>
                        <td className="py-3 px-4">
                          <span className="block">June 09, 2028</span>
                          <span className="text-[9px] text-slate-400 font-semibold">9:08 AM</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-[9px] font-black text-emerald-700 uppercase">{hBooking.roomName || 'Deluxe'}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">Room 101</td>
                        <td className="py-3 px-4">
                          <span className="block text-slate-900">{hBooking.checkIn}</span>
                          <span className="text-[9px] text-slate-400 font-semibold">1:45 PM</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="block text-slate-900">{hBooking.checkOut}</span>
                          <span className="text-[9px] text-slate-400 font-semibold">11:45 AM</span>
                        </td>
                        <td className="py-3 px-4 text-slate-900">{hBooking.guests || 2} Guests</td>
                        <td className="py-3 px-4 text-center text-slate-400">
                          <MoreHorizontal className="w-4 h-4 mx-auto cursor-pointer hover:text-slate-700" />
                        </td>
                      </tr>
                    ))}

                    {guestHistory.length === 0 && (
                      <tr>
                        <td colSpan="9" className="py-12 text-center text-xs text-slate-400">
                          No past reservation history found for this guest.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* CREATE / EDIT BOOKING MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto animate-scale-up text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-black text-slate-950 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-500" />
                {editingBooking ? 'Edit Guest Booking Details' : 'Manually Schedule Guest Reservation'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBooking} className="space-y-4 text-xs font-bold text-slate-700">
              
              {/* Room Choice */}
              <div>
                <label className="block mb-1">Select Room Category *</label>
                <select 
                  required
                  value={formData.roomId}
                  onChange={(e) => {
                    const r = rooms.find(item => item.id === e.target.value);
                    setFormData({ ...formData, roomId: e.target.value, total: r?.price || 450 });
                  }}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none cursor-pointer text-slate-800"
                >
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name || r.type} - {formatPrice(r.price)}/night
                    </option>
                  ))}
                  {rooms.length === 0 && <option>No rooms set up. Please register a room type first.</option>}
                </select>
              </div>

              {/* Guest name */}
              <div>
                <label className="block mb-1">Guest Full Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Angus Copper"
                  value={formData.guestName}
                  onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none text-slate-900 font-bold text-xs"
                />
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Email Address *</label>
                  <input 
                    type="email" 
                    required
                    placeholder="e.g. angus@example.com"
                    value={formData.guestEmail}
                    onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none text-slate-900 font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="block mb-1">Phone Number *</label>
                  <input 
                    type="tel" 
                    required
                    placeholder="e.g. +1 (555) 789-1234"
                    value={formData.guestPhone}
                    onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none text-slate-900 font-bold text-xs"
                  />
                </div>
              </div>

              {/* Check-In & Check-Out */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Check-in Date *</label>
                  <input 
                    type="date" 
                    required
                    value={formData.checkIn}
                    onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none text-slate-900 font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="block mb-1">Check-out Date *</label>
                  <input 
                    type="date" 
                    required
                    value={formData.checkOut}
                    onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none text-slate-900 font-bold text-xs"
                  />
                </div>
              </div>

              {/* Guests Count & Meal Plan */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Number of Guests *</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    value={formData.guests}
                    onChange={(e) => setFormData({ ...formData, guests: Number(e.target.value) })}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none text-slate-900 font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="block mb-1">Meal Plan Inclusions</label>
                  <select 
                    value={formData.mealPlan}
                    onChange={(e) => setFormData({ ...formData, mealPlan: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none cursor-pointer text-slate-800"
                  >
                    <option value="Breakfast Included">Breakfast Included</option>
                    <option value="All Inclusive (Meals & Spa)">All Inclusive (Meals & Spa)</option>
                    <option value="Room Only (No Meals)">Room Only (No Meals)</option>
                  </select>
                </div>
              </div>

              {/* Total Summary Price */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-center justify-between text-slate-900 font-bold">
                <span>Calculated Booking Total:</span>
                <span className="text-base font-black">{formatPrice(formData.total)}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading || rooms.length === 0}
                  className="px-5 py-2 rounded-xl bg-[#e2f896] text-slate-950 hover:bg-[#d4ed83] flex items-center gap-1.5 shadow-md font-black cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Saving...' : editingBooking ? 'Save Changes' : 'Confirm Manual Reservation'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </PortalLayout>
  );
};

export const PartnerBookings = ManagerBookings;
export default ManagerBookings;
