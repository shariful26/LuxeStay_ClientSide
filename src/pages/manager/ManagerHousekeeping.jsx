import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle, Clock, Hammer, HelpCircle, Save, Filter, Search, Edit2, Sparkles, Check, UserCheck, AlertTriangle, Play } from 'lucide-react';
import { PortalLayout } from '../../components/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

import { getInstantData } from '../../utils/instantCache';

export const ManagerHousekeeping = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [rooms, setRooms] = useState(() => getInstantData('manager_rooms', []));
  const [bookings, setBookings] = useState(() => getInstantData('manager_bookings', []));
  const [editingNotesId, setEditingNotesId] = useState(null);
  const [noteInput, setNoteInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Filters
  const [roomFilter, setRoomFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    try {
      const [roomsRes, bookingsRes] = await Promise.all([
        fetch('/api/rooms'),
        fetch('/api/bookings?role=manager')
      ]);
      const roomsData = await roomsRes.json();
      const bookingsData = await bookingsRes.json();

      if (Array.isArray(roomsData)) {
        setRooms(roomsData);
        try { localStorage.setItem('luxestay_cache_manager_rooms', JSON.stringify(roomsData)); } catch (e) {}
      }
      if (Array.isArray(bookingsData)) {
        setBookings(bookingsData);
        try { localStorage.setItem('luxestay_cache_manager_bookings', JSON.stringify(bookingsData)); } catch (e) {}
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = (roomId, newStatus) => {
    const room = rooms.find(r => r.id === roomId);
    const roomName = room?.name || 'Suite';

    // 1. Optimistic instant local update (0ms latency)
    setRooms(prev => {
      const updated = prev.map(r => r.id === roomId ? { ...r, housekeepingStatus: newStatus } : r);
      try { localStorage.setItem('luxestay_cache_manager_rooms', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });

    toast.success(`${roomName} housekeeping status updated to ${newStatus}!`, 'Status Updated');

    // 2. Persist to MongoDB Atlas & JSON
    fetch(`/api/rooms/${roomId}/housekeeping`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        housekeepingStatus: newStatus,
        housekeepingPriority: room?.housekeepingPriority || 'Medium',
        housekeepingNotes: room?.housekeepingNotes || ''
      })
    })
      .then(res => res.json())
      .then(updated => {
        if (updated && updated.id) {
          setRooms(prev => {
            const list = prev.map(r => r.id === roomId ? { ...r, ...updated } : r);
            try { localStorage.setItem('luxestay_cache_manager_rooms', JSON.stringify(list)); } catch (e) {}
            return list;
          });
        }
      })
      .catch(() => {});
  };

  const handlePriorityChange = (roomId, newPriority) => {
    // 1. Optimistic instant local update (0ms latency)
    setRooms(prev => {
      const updated = prev.map(r => r.id === roomId ? { ...r, housekeepingPriority: newPriority } : r);
      try { localStorage.setItem('luxestay_cache_manager_rooms', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });

    // 2. Persist to MongoDB Atlas & JSON
    const room = rooms.find(r => r.id === roomId) || {};
    fetch(`/api/rooms/${roomId}/housekeeping`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        housekeepingStatus: room.housekeepingStatus || 'Ready',
        housekeepingPriority: newPriority,
        housekeepingNotes: room.housekeepingNotes || ''
      })
    })
      .then(res => res.json())
      .then(updated => {
        if (updated && updated.id) {
          setRooms(prev => {
            const list = prev.map(r => r.id === roomId ? { ...r, ...updated } : r);
            try { localStorage.setItem('luxestay_cache_manager_rooms', JSON.stringify(list)); } catch (e) {}
            return list;
          });
        }
      })
      .catch(() => {});
  };

  const handleNotesSave = (roomId) => {
    // 1. Optimistic instant local update (0ms latency)
    const savingNote = noteInput;
    setRooms(prev => {
      const updated = prev.map(r => r.id === roomId ? { ...r, housekeepingNotes: savingNote } : r);
      try { localStorage.setItem('luxestay_cache_manager_rooms', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
    setEditingNotesId(null);
    setNoteInput('');

    // 2. Persist to MongoDB Atlas & JSON
    const room = rooms.find(r => r.id === roomId) || {};
    fetch(`/api/rooms/${roomId}/housekeeping`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        housekeepingStatus: room.housekeepingStatus || 'Ready',
        housekeepingPriority: room.housekeepingPriority || 'Medium',
        housekeepingNotes: savingNote
      })
    })
      .then(res => res.json())
      .then(updated => {
        if (updated && updated.id) {
          setRooms(prev => {
            const list = prev.map(r => r.id === roomId ? { ...r, ...updated } : r);
            try { localStorage.setItem('luxestay_cache_manager_rooms', JSON.stringify(list)); } catch (e) {}
            return list;
          });
        }
      })
      .catch(() => {});
  };

  // Get Reservation Status dynamically based on active bookings
  const getReservationStatus = (roomName) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const activeBooking = bookings.find(b => 
      b.roomName === roomName && 
      b.status !== 'Cancelled' &&
      b.checkIn <= todayStr && 
      b.checkOut >= todayStr
    );
    if (activeBooking) return 'Checked-In';

    const upcomingBooking = bookings.find(b => 
      b.roomName === roomName && 
      b.status !== 'Cancelled' &&
      b.checkIn > todayStr
    );
    if (upcomingBooking) return 'Reserved';

    return 'Checked-Out';
  };

  // Filter logic
  const safeRooms = Array.isArray(rooms) ? rooms : [];
  const filteredRooms = safeRooms.filter(r => {
    const rName = r.name || r.type || '';
    const matchesSearch = rName.toLowerCase().includes(searchQuery.toLowerCase()) || (r.id || '').includes(searchQuery);
    
    const matchesRoom = roomFilter === 'All' || r.type === roomFilter;
    const matchesStatus = statusFilter === 'All' || (r.housekeepingStatus || 'Ready') === statusFilter;
    const matchesPriority = priorityFilter === 'All' || (r.housekeepingPriority || 'Medium') === priorityFilter;

    return matchesSearch && matchesRoom && matchesStatus && matchesPriority;
  });

  // Housekeeping Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRooms = filteredRooms.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    setCurrentPage(1);
  }, [roomFilter, statusFilter, priorityFilter, searchQuery]);

  const readyCount = rooms.filter(r => (r.housekeepingStatus || 'Ready') === 'Ready').length;
  const inProgressCount = rooms.filter(r => r.housekeepingStatus === 'Cleaning in Progress').length;
  const needsCleaningCount = rooms.filter(r => r.housekeepingStatus === 'Needs Cleaning').length;
  const inspectionCount = rooms.filter(r => r.housekeepingStatus === 'Needs Inspection').length;

  return (
    <PortalLayout role="manager" title="Housekeeping & Turn-Down Operations">
      <div className="w-full space-y-6 font-sans text-slate-800 animate-fade-in pb-16">
        
        {/* TOP STATUS KPI METRIC CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div 
            onClick={() => setStatusFilter(statusFilter === 'Ready' ? 'All' : 'Ready')}
            className={`p-4 rounded-3xl border transition-all cursor-pointer shadow-xs ${
              statusFilter === 'Ready' ? 'bg-emerald-500/15 border-emerald-500 text-emerald-800 shadow-md ring-2 ring-emerald-400' : 'bg-white border-slate-200/80 hover:border-emerald-500/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Ready & Clean</span>
              <Sparkles className="w-4 h-4 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">{readyCount} Suites</h3>
            <span className="text-[10px] text-slate-400 font-bold block mt-0.5">Guest check-in ready</span>
          </div>

          <div 
            onClick={() => setStatusFilter(statusFilter === 'Cleaning in Progress' ? 'All' : 'Cleaning in Progress')}
            className={`p-4 rounded-3xl border transition-all cursor-pointer shadow-xs ${
              statusFilter === 'Cleaning in Progress' ? 'bg-blue-500/15 border-blue-500 text-blue-800 shadow-md ring-2 ring-blue-400' : 'bg-white border-slate-200/80 hover:border-blue-500/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">In Progress</span>
              <Clock className="w-4 h-4 text-blue-500" />
            </div>
            <h3 className="text-2xl font-black text-blue-600 mt-1">{inProgressCount} Suites</h3>
            <span className="text-[10px] text-slate-400 font-bold block mt-0.5">Housekeepers active</span>
          </div>

          <div 
            onClick={() => setStatusFilter(statusFilter === 'Needs Cleaning' ? 'All' : 'Needs Cleaning')}
            className={`p-4 rounded-3xl border transition-all cursor-pointer shadow-xs ${
              statusFilter === 'Needs Cleaning' ? 'bg-rose-500/15 border-rose-500 text-rose-800 shadow-md ring-2 ring-rose-400' : 'bg-white border-slate-200/80 hover:border-rose-500/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Needs Cleaning</span>
              <ShieldAlert className="w-4 h-4 text-rose-500" />
            </div>
            <h3 className="text-2xl font-black text-rose-600 mt-1">{needsCleaningCount} Suites</h3>
            <span className="text-[10px] text-slate-400 font-bold block mt-0.5">Post-checkout / dirty</span>
          </div>

          <div 
            onClick={() => setStatusFilter(statusFilter === 'Needs Inspection' ? 'All' : 'Needs Inspection')}
            className={`p-4 rounded-3xl border transition-all cursor-pointer shadow-xs ${
              statusFilter === 'Needs Inspection' ? 'bg-amber-500/15 border-amber-500 text-amber-800 shadow-md ring-2 ring-amber-400' : 'bg-white border-slate-200/80 hover:border-amber-500/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Needs Inspection</span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <h3 className="text-2xl font-black text-amber-600 mt-1">{inspectionCount} Suites</h3>
            <span className="text-[10px] text-slate-400 font-bold block mt-0.5">Supervisor sign-off</span>
          </div>
        </div>

        {/* HEADER CONTROLS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Housekeeping Operations</h1>
            <p className="text-xs text-slate-500 font-medium">Real-time room cleanliness, priority queuing, and rapid status actions</p>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search room number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-4 py-2 rounded-2xl border border-slate-200 bg-white text-xs outline-none focus:border-amber-500 w-48 font-medium"
              />
            </div>

            {/* Cleanliness Status filter */}
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3.5 py-2 rounded-2xl border border-slate-200 bg-white text-xs outline-none cursor-pointer font-bold"
            >
              <option value="All">All Statuses</option>
              <option value="Ready">Ready / Clean</option>
              <option value="Cleaning in Progress">Cleaning in Progress</option>
              <option value="Needs Cleaning">Needs Cleaning</option>
              <option value="Needs Inspection">Needs Inspection</option>
            </select>

            {/* Priority filter */}
            <select 
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3.5 py-2 rounded-2xl border border-slate-200 bg-white text-xs outline-none cursor-pointer font-bold"
            >
              <option value="All">All Priority</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        {/* HOUSEKEEPING STATUS TABLE WITH QUICK ACTIONS */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden w-full">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-bold text-slate-700">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/90 text-[10px] uppercase font-black text-slate-500 tracking-wider">
                  <th className="py-4 px-5">Room / Suite</th>
                  <th className="py-4 px-4">Housekeeping Status</th>
                  <th className="py-4 px-4">Priority</th>
                  <th className="py-4 px-4">Reservation</th>
                  <th className="py-4 px-4">Notes & Maid Notes</th>
                  <th className="py-4 px-6 text-right">Quick 1-Click Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentRooms.map((room, idx) => {
                  const roomStatus = room.housekeepingStatus || 'Ready';
                  const roomPriority = room.housekeepingPriority || 'Medium';
                  const resStatus = room.reservationStatus || (room.status === 'Booked' ? 'Checked-In' : room.status || 'Available');

                  return (
                    <tr key={room.id} className="hover:bg-slate-50/40 transition-colors">
                      
                      {/* Room Number & Name */}
                      <td className="py-4 px-5">
                        <div className="text-slate-900 font-extrabold text-xs">{room.name}</div>
                        <div className="text-[10px] text-slate-400 font-bold mt-0.5">
                          Suite ID: {room.id} • {room.type || 'Deluxe'}
                        </div>
                      </td>
                      
                      {/* Housekeeping Status Pill / Select */}
                      <td className="py-4 px-4">
                        <select 
                          value={roomStatus}
                          onChange={(e) => handleStatusChange(room.id, e.target.value)}
                          className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase border cursor-pointer outline-none shadow-2xs ${
                            roomStatus === 'Ready' 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                              : roomStatus === 'Cleaning in Progress' 
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : roomStatus === 'Needs Cleaning'
                              ? 'bg-rose-50 text-rose-800 border-rose-300'
                              : 'bg-amber-50 text-amber-800 border-amber-300'
                          }`}
                        >
                          <option value="Ready">Ready / Clean</option>
                          <option value="Cleaning in Progress">Cleaning in Progress</option>
                          <option value="Needs Cleaning">Needs Cleaning</option>
                          <option value="Needs Inspection">Needs Inspection</option>
                        </select>
                      </td>

                      {/* Priority Select */}
                      <td className="py-4 px-4">
                        <select 
                          value={roomPriority}
                          onChange={(e) => handlePriorityChange(room.id, e.target.value)}
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold border cursor-pointer outline-none ${
                            roomPriority === 'High' 
                              ? 'bg-rose-100 text-rose-800 border-rose-200' 
                              : roomPriority === 'Medium' 
                              ? 'bg-yellow-100 text-amber-800 border-yellow-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          <option value="High">High Priority</option>
                          <option value="Medium">Medium Priority</option>
                          <option value="Low">Low Priority</option>
                        </select>
                      </td>

                      {/* Reservation Status Pill */}
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase ${
                          resStatus === 'Checked-In' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : resStatus === 'Reserved' 
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-50 text-slate-500 border border-slate-200'
                        }`}>
                          {resStatus}
                        </span>
                      </td>

                      {/* Notes / Special Request Editing */}
                      <td className="py-4 px-4">
                        {editingNotesId === room.id ? (
                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <input 
                              type="text" 
                              value={noteInput}
                              onChange={(e) => setNoteInput(e.target.value)}
                              placeholder="e.g. Extra pillows requested"
                              className="p-1.5 px-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs outline-none text-slate-800 w-44"
                              autoFocus
                            />
                            <button 
                              onClick={() => handleNotesSave(room.id)}
                              className="p-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 cursor-pointer"
                              title="Save Note"
                            >
                              <Save className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => setEditingNotesId(null)}
                              className="p-1.5 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-slate-600 cursor-pointer"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div 
                            onClick={() => {
                              setEditingNotesId(room.id);
                              setNoteInput(room.housekeepingNotes || '');
                            }}
                            className="flex items-center justify-between gap-2 group cursor-pointer text-slate-500 font-medium hover:text-slate-900"
                            title="Click to edit notes"
                          >
                            <span className="truncate max-w-[180px] text-[11px]">{room.housekeepingNotes || 'Add turnover note...'}</span>
                            <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 text-amber-600 shrink-0" />
                          </div>
                        )}
                      </td>

                      {/* DIRECT 1-CLICK QUICK ACTION BUTTONS */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {roomStatus !== 'Ready' && (
                            <button
                              onClick={() => handleStatusChange(room.id, 'Ready')}
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 text-[10px] font-black transition-all cursor-pointer flex items-center gap-1 border border-emerald-200 hover:border-emerald-600 shadow-2xs"
                              title="Mark Clean & Ready"
                            >
                              <Check className="w-3 h-3" />
                              <span>Ready</span>
                            </button>
                          )}

                          {roomStatus !== 'Cleaning in Progress' && (
                            <button
                              onClick={() => handleStatusChange(room.id, 'Cleaning in Progress')}
                              className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 text-[10px] font-black transition-all cursor-pointer flex items-center gap-1 border border-blue-200 hover:border-blue-600 shadow-2xs"
                              title="Start Cleaning"
                            >
                              <Clock className="w-3 h-3" />
                              <span>Start Clean</span>
                            </button>
                          )}

                          {roomStatus !== 'Needs Cleaning' && (
                            <button
                              onClick={() => handleStatusChange(room.id, 'Needs Cleaning')}
                              className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 text-[10px] font-black transition-all cursor-pointer flex items-center gap-1 border border-rose-200 hover:border-rose-600 shadow-2xs"
                              title="Mark Dirty"
                            >
                              <ShieldAlert className="w-3 h-3" />
                              <span>Dirty</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredRooms.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-xs text-slate-400">
                      No matching housekeeping records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Housekeeping Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs font-bold text-slate-600">
            <span className="text-[11px] text-slate-400 font-semibold">
              Showing <strong className="text-slate-700">{indexOfFirstItem + 1}</strong>–<strong className="text-slate-700">{Math.min(indexOfLastItem, filteredRooms.length)}</strong> of <strong className="text-slate-700">{filteredRooms.length}</strong> Rooms
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
              >
                Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center justify-center ${
                    currentPage === pageNum
                      ? 'bg-[#e2f896] text-slate-950 border border-[#d4ed83] shadow-xs scale-105'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}

      </div>
    </PortalLayout>
  );
};

export const PartnerHousekeeping = ManagerHousekeeping;
export default ManagerHousekeeping;
