import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bookmark, Building2, Calendar as CalendarIcon, LogIn, LogOut, 
  MoreVertical, Check, X, Star, Users, ArrowUpRight, Globe, Lock, Trash2, Eye, EyeOff, ShieldCheck, RefreshCw, Filter
} from 'lucide-react';
import { PortalLayout } from '../../components/PortalLayout';
import { CountUp } from '../../components/CountUp';
import { useCurrency } from '../../context/CurrencyContext';
import { getInstantData } from '../../utils/instantCache';

export const AdminDashboard = () => {
  const { formatPrice } = useCurrency();
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [reviews, setReviews] = useState(() => getInstantData('reviews', []));
  const [bookings, setBookings] = useState(() => getInstantData('bookings', []));
  const [hotels, setHotels] = useState(() => getInstantData('hotels', []));
  const [users, setUsers] = useState(() => getInstantData('users', []));
  const [rooms, setRooms] = useState(() => getInstantData('rooms', []));

  // 3-dots interactive menus state
  const [activeReviewMenu, setActiveReviewMenu] = useState(null);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [reviewFilter, setReviewFilter] = useState('all'); // 'all' | 'public' | 'only_me' | 'pending'

  const fetchAdminData = async () => {
    try {
      const [bookingsRes, hotelsRes, usersRes, roomsRes, reviewsRes] = await Promise.all([
        fetch('/api/bookings?role=admin&limit=50'),
        fetch('/api/hotels?fields=compact'),
        fetch('/api/users?limit=50'),
        fetch('/api/rooms'),
        fetch('/api/reviews?role=admin&scope=all&limit=50')
      ]);
      const bookingsData = await bookingsRes.json();
      const hotelsData = await hotelsRes.json();
      const usersData = await usersRes.json();
      const roomsData = await roomsRes.json();
      const reviewsData = await reviewsRes.json();

      if (Array.isArray(bookingsData)) {
        setBookings(bookingsData);
        try { localStorage.setItem('luxestay_cache_bookings', JSON.stringify(bookingsData)); } catch (e) {}
      }
      if (Array.isArray(hotelsData)) {
        setHotels(hotelsData);
        try { localStorage.setItem('luxestay_cache_hotels', JSON.stringify(hotelsData)); } catch (e) {}
      }
      if (Array.isArray(usersData)) {
        setUsers(usersData);
        try { localStorage.setItem('luxestay_cache_users', JSON.stringify(usersData)); } catch (e) {}
      }
      if (Array.isArray(roomsData)) {
        setRooms(roomsData);
        try { localStorage.setItem('luxestay_cache_rooms', JSON.stringify(roomsData)); } catch (e) {}
      }
      if (Array.isArray(reviewsData)) {
        setReviews(reviewsData);
        try { localStorage.setItem('luxestay_cache_reviews', JSON.stringify(reviewsData)); } catch (e) {}
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  useEffect(() => {
    const handleOutsideClick = () => {
      setActiveReviewMenu(null);
      setHeaderMenuOpen(false);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleReviewAction = async (id, action) => {
    setActiveReviewMenu(null);
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status: action } : r));
    try {
      await fetch(`/api/reviews/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action })
      });
    } catch (e) {}
  };

  const handleSetVisibility = async (id, visibility) => {
    setActiveReviewMenu(null);
    setReviews(prev => prev.map(r => r.id === id ? { ...r, visibility } : r));
    try {
      await fetch(`/api/reviews/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visibility })
      });
    } catch (e) {}
  };

  const handleDeleteReview = async (id) => {
    setActiveReviewMenu(null);
    setReviews(prev => prev.filter(r => r.id !== id));
    try {
      await fetch(`/api/reviews/${id}`, {
        method: 'DELETE'
      });
    } catch (e) {}
  };

  const safeBookings = Array.isArray(bookings) ? bookings : [];
  const safeHotels = Array.isArray(hotels) ? hotels : [];
  const safeUsers = Array.isArray(users) ? users : [];
  const safeRooms = Array.isArray(rooms) ? rooms : [];
  const safeReviews = Array.isArray(reviews) ? reviews : [];

  const filteredReviews = safeReviews.filter(r => {
    if (reviewFilter === 'public') return r.visibility === 'public' || (!r.visibility && r.status !== 'rejected');
    if (reviewFilter === 'only_me') return r.visibility === 'only_me' || r.visibility === 'private';
    if (reviewFilter === 'pending') return r.status === 'pending' || !r.status;
    return true;
  });

  const totalGrossRevenue = safeBookings.reduce((sum, b) => sum + (b?.total || 0), 0);
  const adminCommission = Math.round(totalGrossRevenue * 0.15);

  const checkInCount = safeBookings.filter(b => b?.status === 'Checked-In').length;
  const checkOutCount = safeBookings.filter(b => b?.status === 'Checked-Out').length;
  const pendingCount = safeBookings.filter(b => b?.status === 'Confirmed' || !b?.status).length;
  const totalBookings = safeBookings.length;

  const totalRoomsAvailable = Math.max(100, (safeRooms.length || 15) * 45);
  const availableToday = totalRoomsAvailable - checkInCount - pendingCount;

  const totalActiveGuests = (checkInCount + checkOutCount) || 1;
  const checkInPercent = Math.min(100, Math.max(0, Math.round((checkInCount / totalActiveGuests) * 100))) || 65;
  const checkOutPercent = 100 - checkInPercent;

  return (
    <PortalLayout role="admin" title="Admin Dashboard">
      
      {/* 1. ROW 1: 5 DRIBBBLE STYLE PASTEL TINTED KPI SUMMARY CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        
        {/* New Booking Card (Mint/Emerald Tint) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 shadow-xs flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
            <Bookmark className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-0.5">New Booking</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
              <CountUp end={totalBookings} />
            </span>
          </div>
        </div>

        {/* Available Rooms Card (Periwinkle/Indigo Tint) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 shadow-xs flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-0.5">Available Rooms</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
              <CountUp end={availableToday || 127} />
            </span>
          </div>
        </div>

        {/* Reservations Card (Soft Purple Tint) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-purple-50/80 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 shadow-xs flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-0.5">Reservations</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
              <CountUp end={safeRooms.length || 42} />
            </span>
          </div>
        </div>

        {/* Check Ins Card (Peach/Amber Tint) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 shadow-xs flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
            <LogIn className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-0.5">Check Ins</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
              <CountUp end={checkInCount || 28} />
            </span>
          </div>
        </div>

        {/* Check Outs Card (Sky Blue Tint) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-sky-50/80 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/40 shadow-xs flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-xs">
            <LogOut className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-0.5">Check Outs</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
              <CountUp end={checkOutCount || 18} />
            </span>
          </div>
        </div>

      </div>

      {/* 2. ROW 2: MIDDLE ANALYTICS (Available Rooms Donut & Reservation Wave Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Available Room Today Donut */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-xl text-center space-y-6">
          
          <div className="space-y-4">
            <div className="relative w-32 h-32 sm:w-36 sm:h-36 mx-auto flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-[var(--bg-tertiary)]" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-amber-500" strokeDasharray="78, 100" strokeWidth="4" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)]"><CountUp end={availableToday || 312} /></span>
                <span className="text-[9px] font-extrabold uppercase text-[var(--text-muted)]">Available Today</span>
              </div>
            </div>
          </div>

          {/* Booked Room Today Status Bars */}
          <div className="space-y-3 text-xs text-left font-bold border-t border-[var(--border-light)] pt-4">
            <span className="text-[10px] uppercase font-extrabold text-[var(--text-muted)] block">Booked Room Today</span>
            
            <div className="space-y-1">
              <div className="w-full h-2.5 rounded-full bg-amber-400"></div>
            </div>
            <div className="space-y-1">
              <div className="w-full h-2.5 rounded-full bg-emerald-400 w-[60%]"></div>
            </div>
            <div className="space-y-1">
              <div className="w-full h-2.5 rounded-full bg-purple-400 w-[30%]"></div>
            </div>

            <div className="flex flex-wrap justify-between gap-2 pt-2 text-[11px]">
              <span className="text-amber-500 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                <span>Pending: <CountUp end={pendingCount} /></span>
              </span>
              <span className="text-emerald-500 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                <span>Checked In: <CountUp end={checkInCount} /></span>
              </span>
              <span className="text-purple-500 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500 inline-block"></span>
                <span>Checked Out: <CountUp end={checkOutCount} /></span>
              </span>
            </div>
          </div>

        </div>

        {/* Reservation Statistic Dual Wave Chart */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-xl space-y-6 overflow-hidden">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-light)]">
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-[var(--text-primary)]">Reservation Statistic</h3>
              <p className="text-xs text-[var(--text-muted)]">Monthly booking trends</p>
            </div>
            
            <div className="flex items-center gap-2 text-xs font-bold bg-[var(--bg-tertiary)] p-1 rounded-xl">
              <span className="px-2.5 py-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer">Daily</span>
              <span className="px-2.5 py-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer">Weekly</span>
              <span className="px-2.5 py-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer">Monthly</span>
              <span className="px-2.5 py-1 bg-slate-900 text-white rounded-lg shadow-xs cursor-pointer">Yearly</span>
            </div>
          </div>

          {/* SVG Wave Graph Container (Matching Dribbble Ogunya Reference) */}
          <div className="h-52 sm:h-60 relative flex items-end justify-between pt-6 w-full overflow-x-auto">
            <div className="w-full min-w-[320px] h-full relative">
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 500 200">
                <defs>
                  <linearGradient id="greenFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="orangeFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                  </linearGradient>
                </defs>
                
                {/* Orange Wave Curve */}
                <path d="M0,160 Q60,140 120,150 T240,135 T360,155 T500,140 L500,200 L0,200 Z" fill="url(#orangeFill)" />
                <path d="M0,160 Q60,140 120,150 T240,135 T360,155 T500,140" fill="none" stroke="#f97316" strokeWidth="3" />
                
                {/* Green Wave Curve */}
                <path d="M0,110 Q60,60 120,85 T240,35 T360,95 T500,45 L500,200 L0,200 Z" fill="url(#greenFill)" />
                <path d="M0,110 Q60,60 120,85 T240,35 T360,95 T500,45" fill="none" stroke="#10b981" strokeWidth="3.5" />
                
                {/* Highlight Point Indicator */}
                <circle cx="240" cy="35" r="5" fill="#10b981" stroke="#ffffff" strokeWidth="2.5" />
              </svg>

              {/* Tooltip Badge on Highlight Point */}
              <div className="absolute top-1 left-[45%] bg-slate-900 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg shadow-md -translate-x-1/2">
                16,000 guests
              </div>

              <div className="relative z-10 w-full flex justify-between text-[10px] sm:text-[11px] font-extrabold text-[var(--text-muted)] border-t border-[var(--border-light)] pt-3 mt-40">
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                  <span key={i}>{m}</span>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* 3. ROW 3: BOTTOM GRID (Calendar, Newest Bookings, Check-In Donuts & Customer Reviews) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Left Column (2 Spans): Calendar & Newest Bookings Grid */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          
          {/* Calendar Widget */}
          <div className="p-5 sm:p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-xl space-y-4 overflow-x-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-light)] min-w-[280px]">
              <button className="p-1.5 text-[var(--text-muted)] font-bold">«</button>
              <h3 className="text-base font-extrabold text-[var(--text-primary)]">August 2026</h3>
              <button className="p-1.5 text-[var(--text-muted)] font-bold">»</button>
            </div>

            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center text-xs font-bold min-w-[280px]">
              {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
                <span key={day} className="text-[9px] sm:text-[10px] uppercase text-[var(--text-muted)] py-1">{day}</span>
              ))}
              
              {[27, 28, 29, 30, 31].map(d => (
                <span key={`prev-${d}`} className="py-2 rounded-xl text-[var(--text-muted)] opacity-30 text-xs">{d}</span>
              ))}

              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31].map(day => (
                <button 
                  key={day} 
                  onClick={() => setSelectedDate(day)}
                  className={`py-2 rounded-xl transition-all font-extrabold text-xs ${
                    selectedDate === day 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/40 scale-105' 
                      : 'hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)]'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Newest Booking Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-[var(--text-primary)]">Newest Bookings</h3>
                <span className="text-[11px] text-[var(--text-muted)] font-medium">Recent customer reservations from marketplace</span>
              </div>
              <Link to="/admin/bookings" className="text-xs font-bold text-amber-500 hover:text-amber-600 flex items-center gap-1">
                <span>View All</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {safeBookings.slice(0, 6).map((bk, idx) => (
                <div key={bk.id || idx} className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-xs flex items-center gap-3 hover:border-amber-500/40 transition-colors">
                  <img 
                    src={bk.guestAvatar && !bk.guestAvatar.includes('photo-1534528741775') ? bk.guestAvatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(bk.guestName || bk.name || 'Guest')}&background=0284c7&color=fff&bold=true`} 
                    alt={bk.guestName || bk.name} 
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover border-2 border-amber-500 flex-shrink-0" 
                  />
                  <div className="flex-1 overflow-hidden">
                    <h4 className="text-xs font-extrabold text-[var(--text-primary)] truncate">{bk.guestName || bk.name || 'VIP Guest'}</h4>
                    <span className="text-[10px] text-amber-500 font-bold block truncate">{bk.hotelName || 'Luxury Resort'}</span>
                    <span className="text-[10px] text-[var(--text-muted)] font-semibold truncate block">{bk.roomName || 'Executive Suite'} • {bk.guests || 2} Person</span>
                  </div>
                </div>
              ))}

              {safeBookings.length === 0 && (
                <div className="col-span-2 text-center py-8 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-light)] text-xs text-[var(--text-muted)] font-bold">
                  No recent bookings recorded yet.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Check In vs Check Out Donuts & Reviews */}
        <div className="space-y-6 sm:space-y-8">
          
          {/* Check In vs Check Out Radial Donuts */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-xs grid grid-cols-2 gap-4 text-center">
            <div className="space-y-2">
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full border-4 border-amber-500 flex items-center justify-center text-amber-500 font-extrabold text-xs">
                {checkInPercent}%
              </div>
              <span className="text-xs font-extrabold text-[var(--text-primary)] block">Check In</span>
            </div>

            <div className="space-y-2">
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full border-4 border-slate-300 dark:border-slate-700 flex items-center justify-center text-[var(--text-secondary)] font-extrabold text-xs">
                {checkOutPercent}%
              </div>
              <span className="text-xs font-extrabold text-[var(--text-primary)] block">Check Out</span>
            </div>
          </div>

          {/* Latest Customer Review List */}
          <div className="p-5 sm:p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-xl space-y-6 relative">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-light)] relative">
              <div>
                <h3 className="text-base font-extrabold text-[var(--text-primary)]">Latest Customer Reviews</h3>
                <span className="text-[10px] text-[var(--text-muted)] font-bold block">
                  {filteredReviews.length} {reviewFilter !== 'all' ? `(${reviewFilter})` : ''} of {safeReviews.length} total verified ratings
                </span>
              </div>
              
              {/* Header 3-Dots Filter & Actions Menu */}
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setHeaderMenuOpen(prev => !prev);
                  }}
                  title="Review Moderation Options" 
                  className={`p-2 rounded-xl transition-all cursor-pointer ${
                    headerMenuOpen 
                      ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-500/30' 
                      : 'hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {headerMenuOpen && (
                  <div className="absolute right-0 top-10 w-56 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-2xl p-2 z-50 animate-fade-in space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-wider text-[var(--text-muted)] px-3 py-1 block">
                      Filter Visibility
                    </span>
                    
                    <button
                      type="button"
                      onClick={() => { setReviewFilter('all'); setHeaderMenuOpen(false); }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${
                        reviewFilter === 'all' ? 'bg-amber-500/15 text-amber-500 font-black' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                      }`}
                    >
                      <span className="flex items-center gap-2"><Filter className="w-3.5 h-3.5" /> All Reviews</span>
                      {reviewFilter === 'all' && <Check className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => { setReviewFilter('public'); setHeaderMenuOpen(false); }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${
                        reviewFilter === 'public' ? 'bg-emerald-500/15 text-emerald-500 font-black' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                      }`}
                    >
                      <span className="flex items-center gap-2"><Globe className="w-3.5 h-3.5" /> Public Only</span>
                      {reviewFilter === 'public' && <Check className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => { setReviewFilter('only_me'); setHeaderMenuOpen(false); }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${
                        reviewFilter === 'only_me' ? 'bg-purple-500/15 text-purple-500 font-black' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                      }`}
                    >
                      <span className="flex items-center gap-2"><Lock className="w-3.5 h-3.5" /> Only Me (Staff)</span>
                      {reviewFilter === 'only_me' && <Check className="w-3.5 h-3.5" />}
                    </button>

                    <div className="border-t border-[var(--border-light)] my-1"></div>

                    <button
                      type="button"
                      onClick={() => { fetchAdminData(); setHeaderMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-amber-500 hover:bg-amber-500/10 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Refresh Live Reviews
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              {filteredReviews.slice(0, 5).map((rev, idx) => (
                <div key={rev.id || idx} className="space-y-3 pb-4 border-b border-[var(--border-light)] last:border-0 last:pb-0 relative">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <img 
                        src={rev.guestAvatar && !rev.guestAvatar.includes('photo-1534528741775') ? rev.guestAvatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(rev.guestName || rev.name || 'Guest')}&background=0284c7&color=fff&bold=true`} 
                        alt={rev.guestName || rev.name} 
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-amber-500 flex-shrink-0" 
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-[var(--text-primary)] truncate">{rev.guestName || rev.name || 'Verified Customer'}</h4>
                        <span className="text-[9px] sm:text-[10px] text-[var(--text-muted)] block truncate">
                          {rev.hotelName ? `${rev.hotelName} • ` : ''}{rev.date || rev.createdAt?.substring(0, 10) || 'Recently'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <div className="flex items-center text-amber-400">
                        {[...Array(Math.min(5, Math.max(1, Math.round(rev.rating || 5))))].map((_, i) => (
                          <Star key={i} className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
                        ))}
                      </div>

                      {/* Review Card 3-Dots Action Menu */}
                      <div className="relative" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveReviewMenu(activeReviewMenu === rev.id ? null : rev.id);
                          }}
                          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                            activeReviewMenu === rev.id 
                              ? 'bg-amber-500 text-slate-950 shadow-xs' 
                              : 'hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                          }`}
                          title="Manage this review"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>

                        {activeReviewMenu === rev.id && (
                          <div className="absolute right-0 top-8 w-52 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-2xl p-2 z-50 animate-fade-in space-y-1">
                            <span className="text-[9px] font-black uppercase tracking-wider text-[var(--text-muted)] px-3 py-1 block">
                              Review Visibility
                            </span>

                            {/* Option 1: Set to Public */}
                            <button
                              type="button"
                              onClick={() => handleSetVisibility(rev.id, 'public')}
                              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${
                                rev.visibility !== 'only_me' && rev.visibility !== 'private'
                                  ? 'bg-emerald-500/15 text-emerald-500 font-black'
                                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                              }`}
                            >
                              <Globe className="w-3.5 h-3.5" />
                              <span>Public (Visible to all)</span>
                            </button>

                            {/* Option 2: Set to Only Me */}
                            <button
                              type="button"
                              onClick={() => handleSetVisibility(rev.id, 'only_me')}
                              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${
                                rev.visibility === 'only_me' || rev.visibility === 'private'
                                  ? 'bg-purple-500/15 text-purple-500 font-black'
                                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                              }`}
                            >
                              <Lock className="w-3.5 h-3.5" />
                              <span>Only Me (Admin/Manager)</span>
                            </button>

                            <div className="border-t border-[var(--border-light)] my-1"></div>

                            {/* Option 3: Approve */}
                            <button
                              type="button"
                              onClick={() => handleReviewAction(rev.id, 'approved')}
                              className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-emerald-500 hover:bg-emerald-500/10 flex items-center gap-2 transition-colors cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve Review</span>
                            </button>

                            {/* Option 4: Reject */}
                            <button
                              type="button"
                              onClick={() => handleReviewAction(rev.id, 'rejected')}
                              className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-amber-500 hover:bg-amber-500/10 flex items-center gap-2 transition-colors cursor-pointer"
                            >
                              <EyeOff className="w-3.5 h-3.5" />
                              <span>Reject / Hide</span>
                            </button>

                            <div className="border-t border-[var(--border-light)] my-1"></div>

                            {/* Option 5: Delete Permanently */}
                            <button
                              type="button"
                              onClick={() => handleDeleteReview(rev.id)}
                              className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 flex items-center gap-2 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete Review</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium line-clamp-3">
                    {rev.comment || rev.title}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Visibility Pill */}
                      {rev.visibility === 'only_me' || rev.visibility === 'private' ? (
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" /> Only Me
                        </span>
                      ) : (
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 flex items-center gap-1">
                          <Globe className="w-2.5 h-2.5" /> Public
                        </span>
                      )}

                      {/* Status Pill */}
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        rev.status === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : rev.status === 'rejected'
                          ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      }`}>
                        {rev.status || 'Verified Stay'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => handleReviewAction(rev.id, 'approved')}
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-white transition-all cursor-pointer ${
                          rev.status === 'approved' ? 'bg-emerald-600 ring-2 ring-emerald-400' : 'bg-emerald-500 hover:bg-emerald-600'
                        }`}
                        title="Approve Review"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleReviewAction(rev.id, 'rejected')}
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-white transition-all cursor-pointer ${
                          rev.status === 'rejected' ? 'bg-rose-600 ring-2 ring-rose-400' : 'bg-rose-500 hover:bg-rose-600'
                        }`}
                        title="Reject Review"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>
              ))}

              {filteredReviews.length === 0 && (
                <div className="text-center py-8 text-xs text-[var(--text-muted)] font-semibold">
                  No customer reviews found matching filter.
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </PortalLayout>
  );
};
