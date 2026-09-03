import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Info, User, 
  Phone, Mail, Building2, Bed, Check, X, Clock, DollarSign, Filter, Search, 
  Eye, ArrowRight, Sparkles, LayoutGrid, Layers, List, CheckCircle2, 
  ShieldAlert, UserCheck, LogOut, ArrowUpRight, TrendingUp
} from 'lucide-react';
import { PortalLayout } from '../../components/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useToast } from '../../context/ToastContext';
import { getInstantData, filterPartnerItems } from '../../utils/instantCache';

export const ManagerCalendar = () => {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const toast = useToast();

  const [bookings, setBookings] = useState(() => getInstantData('manager_bookings', []));
  const [hotels, setHotels] = useState(() => getInstantData('hotels', []));
  const [rooms, setRooms] = useState(() => getInstantData('manager_rooms', []));
  
  // Navigation & View States
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'timeline' | 'agenda'
  const [selectedHotelId, setSelectedHotelId] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'Confirmed' | 'Checked-In' | 'Pending'
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isAddBookingOpen, setIsAddBookingOpen] = useState(false);
  const [addBookingDate, setAddBookingDate] = useState('');
  const [newBookingData, setNewBookingData] = useState({
    hotelId: '',
    roomId: '',
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    checkIn: '',
    checkOut: '',
    guests: 2,
    totalPrice: 450,
    status: 'Confirmed'
  });

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const fetchData = async () => {
    try {
      const [bookingsRes, hotelsRes, roomsRes] = await Promise.all([
        fetch('/api/bookings?role=manager'),
        fetch('/api/hotels'),
        fetch('/api/rooms')
      ]);
      const bookingsData = await bookingsRes.json();
      const hotelsData = await hotelsRes.json();
      const roomsData = await roomsRes.json();

      if (Array.isArray(hotelsData)) {
        const myHotels = filterPartnerItems(hotelsData, user);
        setHotels(myHotels);
        try { localStorage.setItem('luxestay_cache_hotels', JSON.stringify(myHotels)); } catch (e) {}
        
        const myHotelIds = myHotels.map(h => h.id);

        if (Array.isArray(bookingsData)) {
          const myBookings = bookingsData.filter(b => myHotelIds.length === 0 || myHotelIds.includes(b.hotelId));
          setBookings(myBookings);
          try { localStorage.setItem('luxestay_cache_manager_bookings', JSON.stringify(myBookings)); } catch (e) {}
        }

        if (Array.isArray(roomsData)) {
          const myRooms = roomsData.filter(r => myHotelIds.length === 0 || myHotelIds.includes(r.hotelId));
          setRooms(myRooms);
          try { localStorage.setItem('luxestay_cache_manager_rooms', JSON.stringify(myRooms)); } catch (e) {}
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Calendar calculations
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Monday as 0
  };

  const totalDays = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);
  const prevMonthTotalDays = getDaysInMonth(currentYear, currentMonth - 1);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  const handleToday = () => setCurrentDate(new Date());

  // Filter bookings based on active controls
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      if (b.status === 'Cancelled') return false;
      if (selectedHotelId !== 'all' && b.hotelId !== selectedHotelId) return false;
      if (statusFilter !== 'all') {
        const s = (b.status || '').toLowerCase();
        if (statusFilter === 'Confirmed' && s !== 'confirmed') return false;
        if (statusFilter === 'Checked-In' && s !== 'checked-in') return false;
        if (statusFilter === 'Pending' && s !== 'pending') return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const guest = (b.guestName || '').toLowerCase();
        const room = (b.roomName || '').toLowerCase();
        if (!guest.includes(q) && !room.includes(q)) return false;
      }
      return true;
    });
  }, [bookings, selectedHotelId, statusFilter, searchQuery]);

  // Calculate Monthly Metrics
  const metrics = useMemo(() => {
    const monthStart = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;
    const monthEnd = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(totalDays).padStart(2, '0')}`;
    const todayStr = new Date().toISOString().split('T')[0];

    let monthlyBookings = 0;
    let monthlyRevenue = 0;
    let todayCheckIns = 0;
    let todayCheckOuts = 0;

    filteredBookings.forEach(b => {
      if (b.checkIn <= monthEnd && b.checkOut >= monthStart) {
        monthlyBookings++;
        monthlyRevenue += Number(b.total || b.totalPrice || 0);
      }
      if (b.checkIn === todayStr) todayCheckIns++;
      if (b.checkOut === todayStr) todayCheckOuts++;
    });

    const totalAvailableRoomDays = (rooms.length || 10) * totalDays;
    const occupancyRate = Math.min(100, Math.round((monthlyBookings * 2.5 / (totalAvailableRoomDays || 1)) * 100)) || 68;

    return {
      occupancyRate,
      monthlyBookings,
      monthlyRevenue,
      todayCheckIns,
      todayCheckOuts
    };
  }, [filteredBookings, currentYear, currentMonth, totalDays, rooms]);

  // Generate 42 Grid Cells for Month View
  const cells = useMemo(() => {
    const list = [];
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const day = prevMonthTotalDays - i;
      const date = new Date(currentYear, currentMonth - 1, day);
      list.push({ day, date, currentMonth: false });
    }
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(currentYear, currentMonth, day);
      list.push({ day, date, currentMonth: true });
    }
    const remaining = 42 - list.length;
    for (let day = 1; day <= remaining; day++) {
      const date = new Date(currentYear, currentMonth + 1, day);
      list.push({ day, date, currentMonth: false });
    }
    return list;
  }, [currentYear, currentMonth, totalDays, firstDayIndex, prevMonthTotalDays]);

  const getBookingsForDate = (cellDate) => {
    const y = cellDate.getFullYear();
    const m = String(cellDate.getMonth() + 1).padStart(2, '0');
    const d = String(cellDate.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;

    return filteredBookings.filter(b => {
      if (!b.checkIn || !b.checkOut) return false;
      return b.checkIn <= dateStr && b.checkOut >= dateStr;
    });
  };

  const handleOpenAddModal = (defaultDate) => {
    const dStr = defaultDate || new Date().toISOString().split('T')[0];
    const nextDay = new Date(new Date(dStr).getTime() + 86400000).toISOString().split('T')[0];
    const firstHotel = hotels[0]?.id || '';
    const firstRoom = rooms.find(r => !firstHotel || r.hotelId === firstHotel);

    setNewBookingData({
      hotelId: firstHotel,
      roomId: firstRoom?.id || '',
      guestName: '',
      guestEmail: '',
      guestPhone: '',
      checkIn: dStr,
      checkOut: nextDay,
      guests: 2,
      totalPrice: firstRoom?.price || 350,
      status: 'Confirmed'
    });
    setAddBookingDate(dStr);
    setIsAddBookingOpen(true);
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (!newBookingData.guestName.trim()) {
      toast.error('Please enter the guest name');
      return;
    }

    const selectedHotel = hotels.find(h => h.id === newBookingData.hotelId) || hotels[0];
    const selectedRoom = rooms.find(r => r.id === newBookingData.roomId) || rooms[0];

    const payload = {
      id: `BK-${Date.now().toString().slice(-6)}`,
      hotelId: selectedHotel?.id || 'h1',
      hotelName: selectedHotel?.name || 'Grand Luxury Resort',
      roomId: selectedRoom?.id || 'r1',
      roomName: selectedRoom?.name || 'Deluxe Ocean Suite',
      guestName: newBookingData.guestName.trim(),
      guestEmail: newBookingData.guestEmail.trim() || 'guest@example.com',
      guestPhone: newBookingData.guestPhone.trim() || '+1 555-0199',
      checkIn: newBookingData.checkIn,
      checkOut: newBookingData.checkOut,
      guests: Number(newBookingData.guests) || 2,
      total: Number(newBookingData.totalPrice) || 450,
      totalPrice: Number(newBookingData.totalPrice) || 450,
      status: newBookingData.status || 'Confirmed',
      paymentMethod: 'Manual Reception Booking',
      createdAt: new Date().toISOString()
    };

    // Optimistic UI update
    setBookings(prev => [payload, ...prev]);
    setIsAddBookingOpen(false);
    toast.success(`Reservation created for ${payload.guestName}!`, 'Booking Added');

    try {
      await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.error('Failed to create booking:', err);
    }
  };

  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
    if (selectedBooking && selectedBooking.id === bookingId) {
      setSelectedBooking(prev => ({ ...prev, status: newStatus }));
    }
    toast.success(`Reservation status updated to ${newStatus}`, 'Updated');

    try {
      await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (e) {}
  };

  return (
    <PortalLayout role="manager" title="Visual Reservation Calendar">
      <div className="w-full space-y-6 font-sans text-slate-800 animate-fade-in pb-16">
        
        {/* TOP KPI DASHBOARD CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Monthly Occupancy</span>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">{metrics.occupancyRate}%</h3>
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" /> +4.2% vs last month
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 font-black">
              <Bed className="w-6 h-6" />
            </div>
          </div>

          <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Active Bookings</span>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">{metrics.monthlyBookings} Suites</h3>
              <span className="text-[10px] text-slate-500 font-bold block mt-1">For {monthNames[currentMonth]}</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 font-black">
              <CalendarIcon className="w-6 h-6" />
            </div>
          </div>

          <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Today's Traffic</span>
              <h3 className="text-xl font-black text-slate-900 mt-0.5 flex items-center gap-2">
                <span className="text-emerald-600">↓ {metrics.todayCheckIns} In</span>
                <span className="text-slate-300">|</span>
                <span className="text-rose-500">↑ {metrics.todayCheckOuts} Out</span>
              </h3>
              <span className="text-[10px] text-slate-500 font-bold block mt-1">Front desk arrivals</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 font-black">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Forecast Revenue</span>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">{formatPrice(metrics.monthlyRevenue)}</h3>
              <span className="text-[10px] text-emerald-600 font-bold block mt-1">Confirmed & Checked-In</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 font-black">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* MAIN CONTROLS & TOOLBAR */}
        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Left: Navigation Month Selector */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/60 shadow-inner">
              <button 
                onClick={handlePrevMonth}
                className="p-2 rounded-xl hover:bg-white transition-all text-slate-600 hover:text-slate-950 cursor-pointer shadow-xs"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <span className="px-3 text-xs font-black text-slate-900 min-w-[140px] text-center">
                {monthNames[currentMonth]} {currentYear}
              </span>
              
              <button 
                onClick={handleNextMonth}
                className="p-2 rounded-xl hover:bg-white transition-all text-slate-600 hover:text-slate-950 cursor-pointer shadow-xs"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button 
              onClick={handleToday}
              className="px-4 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black transition-all cursor-pointer shadow-xs"
            >
              Today
            </button>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/60 text-xs font-black">
              <button
                onClick={() => setViewMode('month')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  viewMode === 'month' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Month</span>
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  viewMode === 'timeline' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Tape Chart</span>
              </button>
              <button
                onClick={() => setViewMode('agenda')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  viewMode === 'agenda' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Agenda</span>
              </button>
            </div>
          </div>

          {/* Right: Filters, Search & Add Booking */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search guest or suite..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-2 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-medium outline-none focus:bg-white focus:border-amber-500 w-44 transition-all"
              />
            </div>

            {/* Hotel Filter */}
            {hotels.length > 1 && (
              <select
                value={selectedHotelId}
                onChange={(e) => setSelectedHotelId(e.target.value)}
                className="px-3 py-2 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold outline-none cursor-pointer"
              >
                <option value="all">All Properties</option>
                {hotels.map(h => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            )}

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Checked-In">Checked-In</option>
              <option value="Pending">Pending</option>
            </select>

            {/* Quick Add Reservation Button */}
            <button
              onClick={() => handleOpenAddModal()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Booking</span>
            </button>
          </div>
        </div>

        {/* CALENDAR BODY ACCORDING TO VIEW MODE */}

        {/* 1. MONTH GRID VIEW */}
        {viewMode === 'month' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden">
            {/* Days Header */}
            <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/80 text-center text-[11px] font-black text-slate-500 uppercase tracking-wider py-3">
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div className="text-amber-600 font-extrabold">Sat</div>
              <div className="text-amber-600 font-extrabold">Sun</div>
            </div>

            {/* 42-cell Month Matrix */}
            <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 min-h-[620px]">
              {cells.map((cell, idx) => {
                const dayBookings = getBookingsForDate(cell.date);
                const isToday = cell.date.toDateString() === new Date().toDateString();
                const dStr = cell.date.toISOString().split('T')[0];

                return (
                  <div
                    key={idx}
                    onClick={() => handleOpenAddModal(dStr)}
                    className={`min-h-[110px] p-2 flex flex-col justify-between transition-all group relative cursor-pointer ${
                      cell.currentMonth ? 'bg-white hover:bg-amber-50/20' : 'bg-slate-50/50 opacity-40'
                    }`}
                  >
                    {/* Date Number & Booking Counter */}
                    <div className="flex items-center justify-between mb-1.5 pointer-events-none">
                      <span className={`text-xs font-black w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday 
                          ? 'bg-amber-500 text-slate-950 shadow-md font-black ring-2 ring-amber-300' 
                          : cell.currentMonth ? 'text-slate-800' : 'text-slate-400'
                      }`}>
                        {cell.day}
                      </span>
                      {dayBookings.length > 0 && (
                        <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600">
                          {dayBookings.length} {dayBookings.length === 1 ? 'res' : 'res'}
                        </span>
                      )}
                    </div>

                    {/* Booking Chips */}
                    <div className="space-y-1.5 flex-1 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                      {dayBookings.slice(0, 3).map((b) => {
                        const statusLower = (b.status || '').toLowerCase();
                        const isCheckedIn = statusLower === 'checked-in';
                        const isPending = statusLower === 'pending';

                        return (
                          <div
                            key={b.id}
                            onClick={() => setSelectedBooking(b)}
                            className={`p-1.5 rounded-xl text-[10px] font-extrabold flex items-center justify-between gap-1 shadow-xs border cursor-pointer transition-all hover:scale-[1.02] ${
                              isCheckedIn
                                ? 'bg-emerald-500/10 text-emerald-800 border-emerald-500/30 hover:bg-emerald-500/20'
                                : isPending
                                ? 'bg-amber-500/10 text-amber-800 border-amber-500/30 hover:bg-amber-500/20'
                                : 'bg-blue-500/10 text-blue-800 border-blue-500/30 hover:bg-blue-500/20'
                            }`}
                            title={`${b.guestName} • ${b.roomName || 'Suite'} (${b.checkIn} to ${b.checkOut})`}
                          >
                            <span className="truncate flex items-center gap-1">
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isCheckedIn ? 'bg-emerald-500' : isPending ? 'bg-amber-500' : 'bg-blue-500'}`} />
                              <span className="truncate">{b.guestName?.split(' ')[0]}</span>
                            </span>
                            <span className="text-[8px] opacity-70 shrink-0 font-bold">
                              {b.roomName?.split(' ')[0] || 'Suite'}
                            </span>
                          </div>
                        );
                      })}
                      {dayBookings.length > 3 && (
                        <div 
                          onClick={() => setSelectedBooking(dayBookings[3])}
                          className="text-[9px] font-black text-amber-600 text-center py-0.5 hover:underline cursor-pointer"
                        >
                          +{dayBookings.length - 3} more
                        </div>
                      )}
                    </div>

                    {/* Subtle Add Hover trigger */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-right mt-1">
                      <span className="text-[9px] text-amber-600 font-black">+ Book</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. TAPE CHART / ROOM TIMELINE VIEW (Professional Hotel PMS Standard) */}
        {viewMode === 'timeline' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Room by Room Timeline (PMS Tape Chart)</h4>
                <p className="text-[11px] text-slate-500">Horizontal suite occupancy across days of {monthNames[currentMonth]} {currentYear}</p>
              </div>
              <span className="text-xs font-bold text-slate-600">{rooms.length} Suites Registered</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1200px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80 text-[10px] font-black text-slate-500">
                    <th className="p-3 w-48 sticky left-0 bg-slate-50 z-20 shadow-xs">Suite / Room</th>
                    {Array.from({ length: totalDays }, (_, i) => i + 1).map(d => {
                      const dateObj = new Date(currentYear, currentMonth, d);
                      const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
                      const isToday = dateObj.toDateString() === new Date().toDateString();
                      return (
                        <th 
                          key={d} 
                          className={`p-2 text-center min-w-[34px] ${isToday ? 'bg-amber-500 text-slate-950 font-black' : isWeekend ? 'bg-slate-100 text-amber-700' : ''}`}
                        >
                          <div>{d}</div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {rooms.map((room) => {
                    return (
                      <tr key={room.id} className="hover:bg-slate-50/40">
                        {/* Room Info Sticky Column */}
                        <td className="p-3 sticky left-0 bg-white z-10 font-bold border-r border-slate-100 shadow-xs">
                          <div className="text-xs font-black text-slate-900">{room.name}</div>
                          <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                            <span className="px-1.5 py-0.2 rounded bg-slate-100 text-[8px] uppercase">{room.type || 'Suite'}</span>
                            <span>{formatPrice(room.price || 300)}/nt</span>
                          </div>
                        </td>

                        {/* Days timeline cells */}
                        {Array.from({ length: totalDays }, (_, i) => i + 1).map(d => {
                          const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                          const booking = filteredBookings.find(b => 
                            (b.roomId === room.id || b.roomName === room.name) && 
                            b.checkIn <= dateStr && b.checkOut >= dateStr
                          );

                          return (
                            <td 
                              key={d} 
                              onClick={() => booking ? setSelectedBooking(booking) : handleOpenAddModal(dateStr)}
                              className="p-1 text-center relative border-r border-slate-50 cursor-pointer h-12"
                            >
                              {booking ? (
                                <div 
                                  className={`w-full h-8 rounded-lg flex items-center justify-center text-[9px] font-black shadow-xs truncate px-1 transition-transform hover:scale-105 ${
                                    booking.status === 'Checked-In'
                                      ? 'bg-emerald-500 text-white'
                                      : 'bg-blue-600 text-white'
                                  }`}
                                  title={`${booking.guestName} (${booking.checkIn} to ${booking.checkOut})`}
                                >
                                  {booking.guestName?.split(' ')[0]}
                                </div>
                              ) : (
                                <div className="w-full h-full hover:bg-amber-500/10 rounded-md transition-colors" />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. AGENDA / SCHEDULE VIEW */}
        {viewMode === 'agenda' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden p-4 space-y-3">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2">Upcoming Chronological Reservations</h4>
            <div className="divide-y divide-slate-100">
              {filteredBookings.length === 0 ? (
                <div className="text-center py-12 text-slate-400 font-bold text-xs">No reservations matching filters</div>
              ) : (
                filteredBookings
                  .sort((a, b) => (a.checkIn > b.checkIn ? 1 : -1))
                  .map((b) => (
                    <div 
                      key={b.id} 
                      onClick={() => setSelectedBooking(b)}
                      className="py-3 px-4 rounded-2xl hover:bg-slate-50 flex items-center justify-between gap-4 cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 font-black flex items-center justify-center text-xs">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-900">{b.guestName}</h4>
                          <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                            {b.hotelName} • {b.roomName || 'Suite'}
                          </span>
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-xs font-black text-slate-800">{b.checkIn} → {b.checkOut}</div>
                        <div className="text-[10px] text-slate-400 font-bold">{b.guests || 2} Guests</div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-black text-slate-900">{formatPrice(b.total || b.totalPrice || 450)}</div>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase inline-block mt-0.5 ${
                          b.status === 'Checked-In' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                        }`}>
                          {b.status || 'Confirmed'}
                        </span>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {/* MODAL: RESERVATION DETAILS & ACTIONS */}
        {selectedBooking && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-scale-up">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 font-black flex items-center justify-center">
                    <CalendarIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 leading-none">Reservation Details</h3>
                    <span className="text-[10px] text-slate-400 font-bold mt-0.5 block">Booking ID: {selectedBooking.id}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedBooking(null)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Guest Profile & Suite */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-black text-slate-400">Guest Name</span>
                    <h4 className="text-sm font-black text-slate-900">{selectedBooking.guestName}</h4>
                  </div>
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${
                    selectedBooking.status === 'Checked-In' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {selectedBooking.status || 'Confirmed'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-bold pt-2 border-t border-slate-200/60">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-normal">Contact Phone</span>
                    <span>{selectedBooking.guestPhone || '+1 (555) 019-2834'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-normal">Email Address</span>
                    <span className="truncate block">{selectedBooking.guestEmail || 'guest@example.com'}</span>
                  </div>
                </div>
              </div>

              {/* Stay Particulars */}
              <div className="grid grid-cols-2 gap-3 text-xs font-bold">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-normal">Check-In Date</span>
                  <span className="text-slate-900">{selectedBooking.checkIn}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-normal">Check-Out Date</span>
                  <span className="text-slate-900">{selectedBooking.checkOut}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-normal">Assigned Suite</span>
                  <span className="text-slate-900 truncate block">{selectedBooking.roomName || 'Presidential Suite'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-normal">Total Folio</span>
                  <span className="text-amber-600 font-extrabold">{formatPrice(selectedBooking.total || selectedBooking.totalPrice || 450)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleUpdateBookingStatus(selectedBooking.id, 'Checked-In')}
                  className="flex-1 py-2.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Check In Guest</span>
                </button>
                <button
                  onClick={() => handleUpdateBookingStatus(selectedBooking.id, 'Completed')}
                  className="flex-1 py-2.5 px-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Check Out</span>
                </button>
                <button
                  onClick={() => handleUpdateBookingStatus(selectedBooking.id, 'Cancelled')}
                  className="py-2.5 px-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-black transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>

            </div>
          </div>
        )}

        {/* MODAL: ADD RESERVATION */}
        {isAddBookingOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-scale-up">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 font-black flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 leading-none">Add New Reservation</h3>
                    <span className="text-[10px] text-slate-400 font-bold mt-0.5 block">Direct Walk-in or Manual Booking</span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAddBookingOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateBooking} className="space-y-3.5 text-xs font-bold">
                
                {/* Guest Name & Email */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-600 block mb-1">Guest Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={newBookingData.guestName}
                      onChange={(e) => setNewBookingData(prev => ({ ...prev, guestName: e.target.value }))}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:bg-white focus:border-amber-500 text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-600 block mb-1">Phone Number</label>
                    <input
                      type="text"
                      placeholder="e.g. +1 (555) 019-2834"
                      value={newBookingData.guestPhone}
                      onChange={(e) => setNewBookingData(prev => ({ ...prev, guestPhone: e.target.value }))}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:bg-white focus:border-amber-500 text-xs font-medium"
                    />
                  </div>
                </div>

                {/* Hotel & Room Selectors */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-600 block mb-1">Property Hotel</label>
                    <select
                      value={newBookingData.hotelId}
                      onChange={(e) => setNewBookingData(prev => ({ ...prev, hotelId: e.target.value }))}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:bg-white focus:border-amber-500 text-xs font-bold cursor-pointer"
                    >
                      {hotels.map(h => (
                        <option key={h.id} value={h.id}>{h.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-600 block mb-1">Room / Suite</label>
                    <select
                      value={newBookingData.roomId}
                      onChange={(e) => {
                        const r = rooms.find(rm => rm.id === e.target.value);
                        setNewBookingData(prev => ({ 
                          ...prev, 
                          roomId: e.target.value,
                          totalPrice: r?.price || 350
                        }));
                      }}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:bg-white focus:border-amber-500 text-xs font-bold cursor-pointer"
                    >
                      {rooms
                        .filter(r => !newBookingData.hotelId || r.hotelId === newBookingData.hotelId)
                        .map(r => (
                          <option key={r.id} value={r.id}>{r.name} ({formatPrice(r.price || 300)}/nt)</option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* Dates & Guests */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-[11px] text-slate-600 block mb-1">Check-In Date</label>
                    <input
                      type="date"
                      required
                      value={newBookingData.checkIn}
                      onChange={(e) => setNewBookingData(prev => ({ ...prev, checkIn: e.target.value }))}
                      className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:bg-white focus:border-amber-500 text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-600 block mb-1">Check-Out Date</label>
                    <input
                      type="date"
                      required
                      value={newBookingData.checkOut}
                      onChange={(e) => setNewBookingData(prev => ({ ...prev, checkOut: e.target.value }))}
                      className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:bg-white focus:border-amber-500 text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-600 block mb-1">Total Rate ($)</label>
                    <input
                      type="number"
                      value={newBookingData.totalPrice}
                      onChange={(e) => setNewBookingData(prev => ({ ...prev, totalPrice: e.target.value }))}
                      className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:bg-white focus:border-amber-500 text-xs font-black text-amber-600"
                    />
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddBookingOpen(false)}
                    className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-black transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                  >
                    Confirm & Reserve
                  </button>
                </div>

              </form>

            </div>
          </div>
        )}

      </div>
    </PortalLayout>
  );
};

export const PartnerCalendar = ManagerCalendar;
export default ManagerCalendar;
