import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bookmark, Building2, Calendar as CalendarIcon, LogIn, LogOut, 
  MoreVertical, Check, X, Star
} from 'lucide-react';
import { PortalLayout } from '../../components/PortalLayout';
import { CountUp } from '../../components/CountUp';

const INITIAL_REVIEWS = [
  {
    id: 'rev1',
    name: 'Ali Muzair',
    date: 'Posted on 26/04/2020, 12:42 AM',
    rating: 4,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    comment: 'I have been there many times. Rooms, Food and Service are excellent. We did lots of Excursions and all the places are from the Hotel reachable.',
    status: 'pending'
  },
  {
    id: 'rev2',
    name: 'Keanu Repes',
    date: 'Posted on 26/04/2020, 12:42 AM',
    rating: 4,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    comment: 'I have been there many times. Rooms, Food and Service are excellent. We did lots of Excursions and all the places are from the Hotel reachable.',
    status: 'pending'
  },
  {
    id: 'rev3',
    name: 'Chintya Clara',
    date: 'Posted on 26/04/2020, 12:42 AM',
    rating: 4,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    comment: 'I have been there many times. Rooms, Food and Service are excellent. We did lots of Excursions and all the places are from the Hotel reachable.',
    status: 'pending'
  }
];

const NEWEST_BOOKINGS = [
  { id: 'b1', name: 'Samantha Humble', date: 'October 3rd, 2020', room: 'Room A-21', guests: '3-5 Person', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' },
  { id: 'b2', name: 'Louise Marquee', date: 'October 3rd, 2020', room: 'Room A-21', guests: '3-5 Person', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80' },
  { id: 'b3', name: 'Richard Smile', date: 'October 3rd, 2020', room: 'Room A-21', guests: '3-5 Person', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80' },
  { id: 'b4', name: 'Bella Yen', date: 'October 3rd, 2020', room: 'Room A-21', guests: '3-5 Person', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80' },
  { id: 'b5', name: 'Richard Smile', date: 'October 3rd, 2020', room: 'Room A-21', guests: '3-5 Person', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' },
  { id: 'b6', name: 'Samantha Humble', date: 'October 3rd, 2020', room: 'Room A-21', guests: '3-5 Person', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' }
];

import { getInstantData } from '../../utils/instantCache';

export const AdminDashboard = () => {
  const [selectedDate, setSelectedDate] = useState(8);
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [bookings, setBookings] = useState(() => getInstantData('bookings', []));
  const [hotels, setHotels] = useState(() => getInstantData('hotels', []));
  const [users, setUsers] = useState(() => getInstantData('users', []));
  const [rooms, setRooms] = useState(() => getInstantData('rooms', []));

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [bookingsRes, hotelsRes, usersRes, roomsRes] = await Promise.all([
          fetch('/api/bookings'),
          fetch('/api/hotels'),
          fetch('/api/users'),
          fetch('/api/rooms')
        ]);
        const bookingsData = await bookingsRes.json();
        const hotelsData = await hotelsRes.json();
        const usersData = await usersRes.json();
        const roomsData = await roomsRes.json();

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
      } catch (e) {}
    };

    fetchAdminData();
  }, []);

  const handleReviewAction = (id, action) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status: action } : r));
  };

  const safeBookings = Array.isArray(bookings) ? bookings : [];
  const safeHotels = Array.isArray(hotels) ? hotels : [];
  const safeUsers = Array.isArray(users) ? users : [];
  const safeRooms = Array.isArray(rooms) ? rooms : [];

  const totalGrossRevenue = safeBookings.reduce((sum, b) => sum + (b?.total || 0), 0);
  const adminCommission = Math.round(totalGrossRevenue * 0.15);

  const checkInCount = safeBookings.filter(b => b?.status === 'Checked-In').length;
  const checkOutCount = safeBookings.filter(b => b?.status === 'Checked-Out').length;
  const pendingCount = safeBookings.filter(b => b?.status === 'Confirmed' || !b?.status).length;
  const totalBookings = safeBookings.length;

  const totalRoomsAvailable = Math.max(100, (safeRooms.length || 15) * 45);
  const availableToday = totalRoomsAvailable - checkInCount - pendingCount;

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
              <span className="text-amber-500 font-bold">• Pending: <CountUp end={pendingCount} /></span>
              <span className="text-emerald-500 font-bold">• Checked In: <CountUp end={checkInCount} /></span>
              <span className="text-purple-500 font-bold">• Checked Out: <CountUp end={checkOutCount} /></span>
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
              <h3 className="text-base font-extrabold text-[var(--text-primary)]">Newest Booking</h3>
              <Link to="/admin/bookings" className="text-xs font-bold text-blue-600 hover:underline">More</Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {NEWEST_BOOKINGS.map(bk => (
                <div key={bk.id} className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-sm flex items-center gap-3">
                  <img src={bk.avatar} alt={bk.name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover border-2 border-amber-500 flex-shrink-0" />
                  <div className="flex-1 overflow-hidden">
                    <h4 className="text-xs font-extrabold text-[var(--text-primary)] truncate">{bk.name}</h4>
                    <span className="text-[10px] text-blue-600 font-bold block">{bk.date}</span>
                    <span className="text-[10px] text-[var(--text-muted)] font-semibold">{bk.room} • {bk.guests}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Check In vs Check Out Donuts & Reviews */}
        <div className="space-y-6 sm:space-y-8">
          
          {/* Check In vs Check Out Radial Donuts */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-xs grid grid-cols-2 gap-4 text-center">
            <div className="space-y-2">
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full border-4 border-amber-500 flex items-center justify-center text-amber-500 font-extrabold text-xs">
                70%
              </div>
              <span className="text-xs font-extrabold text-[var(--text-primary)] block">Check In</span>
            </div>

            <div className="space-y-2">
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full border-4 border-slate-300 dark:border-slate-700 flex items-center justify-center text-[var(--text-secondary)] font-extrabold text-xs">
                30%
              </div>
              <span className="text-xs font-extrabold text-[var(--text-primary)] block">Check Out</span>
            </div>
          </div>

          {/* Latest Customer Review List */}
          <div className="p-5 sm:p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-light)]">
              <h3 className="text-base font-extrabold text-[var(--text-primary)]">Latest Customer Review</h3>
              <MoreVertical className="w-4 h-4 text-[var(--text-muted)] cursor-pointer" />
            </div>

            <div className="space-y-6">
              {(Array.isArray(reviews) ? reviews : []).map(rev => (
                <div key={rev.id} className="space-y-3 pb-4 border-b border-[var(--border-light)] last:border-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={rev.avatar || rev.guestAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'} alt={rev.name || rev.guestName} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-amber-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-[var(--text-primary)] truncate">{rev.name || rev.guestName}</h4>
                        <span className="text-[9px] sm:text-[10px] text-[var(--text-muted)] block truncate">{rev.date || rev.createdAt?.substring(0, 10)}</span>
                      </div>
                    </div>

                    <div className="flex items-center text-amber-400 flex-shrink-0">
                      {[...Array(Math.min(5, Math.max(1, Math.round(rev.rating || 5))))].map((_, i) => (
                        <Star key={i} className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
                    {rev.comment}
                  </p>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button 
                      onClick={() => handleReviewAction(rev.id, 'approved')}
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-white transition-all ${
                        rev.status === 'approved' ? 'bg-emerald-600 ring-2 ring-emerald-400' : 'bg-emerald-500 hover:bg-emerald-600'
                      }`}
                      title="Approve Review"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleReviewAction(rev.id, 'rejected')}
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-white transition-all ${
                        rev.status === 'rejected' ? 'bg-rose-600 ring-2 ring-rose-400' : 'bg-rose-500 hover:bg-rose-600'
                      }`}
                      title="Reject Review"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              ))}
            </div>

          </div>

        </div>

      </div>
    </PortalLayout>
  );
};
