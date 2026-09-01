import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Info, Award, User, HelpCircle } from 'lucide-react';
import { PortalLayout } from '../../components/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';

import { getInstantData } from '../../utils/instantCache';

export const ManagerCalendar = () => {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const [bookings, setBookings] = useState(() => getInstantData('manager_bookings', []));
  
  // Calendar Navigation states
  const [currentDate, setCurrentDate] = useState(new Date(2028, 5, 1)); // Default to June 2028 matching DB mock entries
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const fetchBookings = () => {
    fetch('/api/bookings')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const filtered = data.filter(b => b.status !== 'Cancelled');
          setBookings(filtered);
          try { localStorage.setItem('luxestay_cache_manager_bookings', JSON.stringify(filtered)); } catch (e) {}
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Calendar calculations
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const totalDays = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);

  // Generate grid cells (including padding days from prev and next month)
  const prevMonthTotalDays = getDaysInMonth(currentYear, currentMonth - 1);
  
  const cells = [];
  // Padding from previous month
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const day = prevMonthTotalDays - i;
    const date = new Date(currentYear, currentMonth - 1, day);
    cells.push({ day, date, currentMonth: false });
  }

  // Current month days
  for (let day = 1; day <= totalDays; day++) {
    const date = new Date(currentYear, currentMonth, day);
    cells.push({ day, date, currentMonth: true });
  }

  // Padding for next month to complete 6 rows (42 cells)
  const remainingCells = 42 - cells.length;
  for (let day = 1; day <= remainingCells; day++) {
    const date = new Date(currentYear, currentMonth + 1, day);
    cells.push({ day, date, currentMonth: false });
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Helper to check if a booking spans across a given cell date
  const getBookingsForDate = (cellDate) => {
    const cellDateStr = cellDate.toISOString().split('T')[0];
    return bookings.filter(b => {
      if (!b.checkIn || !b.checkOut) return false;
      return b.checkIn <= cellDateStr && b.checkOut >= cellDateStr;
    });
  };

  return (
    <PortalLayout role="manager" title="Visual Reservation Calendar">
      <div className="w-full space-y-6 font-sans text-slate-800 animate-fade-in pb-12">
        
        {/* TOP ROW CALENDAR TITLE & MONTH SELECTOR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Calendar</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white border border-slate-200 rounded-full p-1 shadow-2xs">
              <button 
                onClick={handlePrevMonth}
                className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-600 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <span className="px-4 text-xs font-black text-slate-900 w-36 text-center">
                {monthNames[currentMonth]} {currentYear}
              </span>
              
              <button 
                onClick={handleNextMonth}
                className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-600 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button className="px-4 py-2.5 rounded-full bg-[#e2f896] hover:bg-[#d4ed83] text-slate-950 text-xs font-black shadow-xs cursor-pointer">
              Today
            </button>
          </div>
        </div>

        {/* WIDESCREEN GRID: LEFT LEGEND PANEL & RIGHT CALENDAR GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* LEFT PANEL (3/12 cols) - Legend & Categories */}
          <div className="lg:col-span-3 bg-white p-5 rounded-xl border border-slate-200/70 shadow-2xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <CalendarIcon className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-black text-slate-900">Reservations Key</h3>
              </div>

              {/* Status categories list */}
              <div className="space-y-3 text-xs font-bold text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                  <span>Confirmed Bookings</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  <span>Checked-In Guests</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                  <span>Pending Confirmation</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-[10px] text-slate-400 font-semibold leading-relaxed">
              <Info className="w-4 h-4 text-slate-400 mb-1" />
              Bookings loaded dynamically from database. Grid cells represent individual occupancy days for assigned hotel suites.
            </div>
          </div>

          {/* RIGHT PANEL (9/12 cols) - Widescreen Calendar Grid */}
          <div className="lg:col-span-9 bg-white p-5 rounded-xl border border-slate-200/70 shadow-2xs flex flex-col justify-between">
            <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-t-xl overflow-hidden text-center text-[10px] font-black text-slate-400 uppercase py-2.5 bg-slate-50 border-b border-slate-200">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            {/* Dates Grid (6 rows of 7 cells = 42 cells) */}
            <div className="grid grid-cols-7 grid-rows-6 gap-px bg-slate-100 rounded-b-xl overflow-hidden min-h-[450px]">
              {cells.map((cell, idx) => {
                const dayBookings = getBookingsForDate(cell.date);
                const isToday = cell.date.toDateString() === new Date().toDateString();

                return (
                  <div 
                    key={idx}
                    className={`bg-white p-2 flex flex-col justify-between min-h-[80px] transition-colors relative border border-slate-50 ${
                      cell.currentMonth ? 'text-slate-800' : 'text-slate-300 opacity-40 bg-slate-50/20'
                    }`}
                  >
                    {/* Day number */}
                    <span className={`text-[10px] font-bold text-left block ${
                      isToday ? 'w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-black' : ''
                    }`}>
                      {cell.day}
                    </span>

                    {/* Spanning Bookings */}
                    <div className="space-y-1 mt-1 z-10 w-full">
                      {dayBookings.map((b) => {
                        const isCheckedIn = b.status?.toLowerCase() === 'checked-in';
                        return (
                          <div 
                            key={b.id}
                            className={`p-1 rounded-sm text-[8px] font-black leading-none truncate w-full shadow-2xs border ${
                              isCheckedIn 
                                ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' 
                                : 'bg-blue-500/10 text-blue-700 border-blue-500/20'
                            }`}
                            title={`${b.guestName} - ${b.roomName}`}
                          >
                            👤 {b.guestName?.split(' ')[0]}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </PortalLayout>
  );
};

export const PartnerCalendar = ManagerCalendar;
export default ManagerCalendar;
