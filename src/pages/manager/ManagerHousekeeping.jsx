import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle, Clock, Hammer, HelpCircle, Save, Filter, Search, Edit2 } from 'lucide-react';
import { PortalLayout } from '../../components/PortalLayout';
import { useAuth } from '../../context/AuthContext';

import { getInstantData } from '../../utils/instantCache';

export const ManagerHousekeeping = () => {
  const { user } = useAuth();
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
        fetch('/api/bookings')
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
    if (!room) return;

    fetch(`/api/rooms/${roomId}/housekeeping`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        housekeepingStatus: newStatus,
        housekeepingPriority: room.housekeepingPriority || 'Medium',
        housekeepingNotes: room.housekeepingNotes || ''
      })
    })
      .then(res => res.json())
      .then(updated => {
        setRooms(prev => prev.map(r => r.id === roomId ? updated : r));
      });
  };

  const handlePriorityChange = (roomId, newPriority) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;

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
        setRooms(prev => prev.map(r => r.id === roomId ? updated : r));
      });
  };

  const handleNotesSave = (roomId) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;

    setLoading(true);
    fetch(`/api/rooms/${roomId}/housekeeping`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        housekeepingStatus: room.housekeepingStatus || 'Ready',
        housekeepingPriority: room.housekeepingPriority || 'Medium',
        housekeepingNotes: noteInput
      })
    })
      .then(res => res.json())
      .then(updated => {
        setRooms(prev => prev.map(r => r.id === roomId ? updated : r));
        setEditingNotesId(null);
        setNoteInput('');
        setLoading(false);
      })
      .catch(() => setLoading(false));
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
  const filteredRooms = rooms.filter(r => {
    const rName = r.name || r.type || '';
    const matchesSearch = rName.toLowerCase().includes(searchQuery.toLowerCase()) || (r.id || '').includes(searchQuery);
    
    const matchesRoom = roomFilter === 'All' || r.type === roomFilter;
    const matchesStatus = statusFilter === 'All' || (r.housekeepingStatus || 'Ready') === statusFilter;
    const matchesPriority = priorityFilter === 'All' || (r.housekeepingPriority || 'Medium') === priorityFilter;

    return matchesSearch && matchesRoom && matchesStatus && matchesPriority;
  });

  return (
    <PortalLayout role="manager" title="Housekeeping Tracker">
      <div className="w-full space-y-6 font-sans text-slate-800 animate-fade-in pb-12">
        
        {/* HEADER CONTROLS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Housekeeping</h1>
          
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search room number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-4 py-2 rounded-full border border-slate-200 bg-white text-xs outline-none focus:border-slate-400 w-44 font-medium"
              />
            </div>

            {/* Room type filter */}
            <select 
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
              className="px-3.5 py-2 rounded-full border border-slate-200 bg-white text-xs outline-none cursor-pointer font-bold"
            >
              <option value="All">All Rooms</option>
              <option value="Standard Room">Standard Room</option>
              <option value="Deluxe Room">Deluxe Room</option>
              <option value="Suite Room">Suite Room</option>
            </select>

            {/* Cleanliness Status filter */}
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3.5 py-2 rounded-full border border-slate-200 bg-white text-xs outline-none cursor-pointer font-bold"
            >
              <option value="All">All Status</option>
              <option value="Ready">Ready / Clean</option>
              <option value="Cleaning in Progress">Cleaning in Progress</option>
              <option value="Needs Cleaning">Needs Cleaning</option>
              <option value="Needs Inspection">Needs Inspection</option>
            </select>

            {/* Priority filter */}
            <select 
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3.5 py-2 rounded-full border border-slate-200 bg-white text-xs outline-none cursor-pointer font-bold"
            >
              <option value="All">All Priority</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        {/* HOUSEKEEPING STATUS TABLE */}
        <div className="bg-white rounded-xl border border-slate-200/70 shadow-2xs overflow-hidden w-full">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-bold text-slate-700">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] uppercase font-black text-slate-400 tracking-wider">
                  <th className="py-4 px-5">Room Number</th>
                  <th className="py-4 px-4">Room Type</th>
                  <th className="py-4 px-4">Housekeeping Status</th>
                  <th className="py-4 px-4">Priority</th>
                  <th className="py-4 px-4">Floor</th>
                  <th className="py-4 px-4">Reservation Status</th>
                  <th className="py-4 px-5">Notes / Special Requests</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRooms.map((room, idx) => {
                  const resStatus = getReservationStatus(room.name);
                  // Calculate mock floor based on idx or room name
                  const floorText = idx < 2 ? '1st' : idx < 4 ? '2nd' : '3rd';
                  const roomStatus = room.housekeepingStatus || 'Ready';
                  const roomPriority = room.housekeepingPriority || 'Medium';

                  return (
                    <tr key={room.id} className="hover:bg-slate-50/30">
                      
                      {/* Room Number */}
                      <td className="py-4 px-5 text-slate-900 font-extrabold">Room {room.id?.slice(-3) || `10${idx + 1}`}</td>
                      
                      {/* Room Type */}
                      <td className="py-4 px-4 text-slate-500 font-medium">{room.type || 'Deluxe'}</td>
                      
                      {/* Housekeeping Status Select */}
                      <td className="py-4 px-4">
                        <select 
                          value={roomStatus}
                          onChange={(e) => handleStatusChange(room.id, e.target.value)}
                          className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border cursor-pointer outline-none ${
                            roomStatus === 'Ready' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : roomStatus === 'Cleaning in Progress' 
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : roomStatus === 'Needs Cleaning'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-yellow-50 text-amber-700 border-yellow-200'
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
                          className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold border cursor-pointer outline-none ${
                            roomPriority === 'High' 
                              ? 'bg-rose-100 text-rose-800 border-rose-200' 
                              : roomPriority === 'Medium' 
                              ? 'bg-yellow-100 text-amber-800 border-yellow-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          <option value="High">● High</option>
                          <option value="Medium">● Medium</option>
                          <option value="Low">● Low</option>
                        </select>
                      </td>

                      {/* Floor */}
                      <td className="py-4 px-4 text-slate-500">{floorText}</td>

                      {/* Reservation Status Pill */}
                      <td className="py-4 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          resStatus === 'Checked-In' 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : resStatus === 'Reserved' 
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-slate-50 text-slate-500'
                        }`}>
                          {resStatus}
                        </span>
                      </td>

                      {/* Notes / Special Request Editing */}
                      <td className="py-4 px-5">
                        {editingNotesId === room.id ? (
                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <input 
                              type="text" 
                              value={noteInput}
                              onChange={(e) => setNoteInput(e.target.value)}
                              placeholder="e.g. Extra towels requested"
                              className="p-1 px-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] outline-none text-slate-800 w-full"
                            />
                            <button 
                              onClick={() => handleNotesSave(room.id)}
                              className="p-1 rounded-lg bg-slate-900 text-white hover:bg-slate-800 cursor-pointer"
                              title="Save Note"
                            >
                              <Save className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => setEditingNotesId(null)}
                              className="p-1 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-600 cursor-pointer"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-2 group cursor-pointer text-slate-500 font-medium">
                            <span className="truncate max-w-[200px]">{room.housekeepingNotes || 'No special requests noted.'}</span>
                            <button 
                              onClick={() => {
                                setEditingNotesId(room.id);
                                setNoteInput(room.housekeepingNotes || '');
                              }}
                              className="p-1 rounded-md text-slate-400 hover:bg-slate-50 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                              title="Edit Notes"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </td>

                    </tr>
                  );
                })}

                {filteredRooms.length === 0 && (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-xs text-slate-400">
                      No matching rooms found in the directory.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </PortalLayout>
  );
};

export const PartnerHousekeeping = ManagerHousekeeping;
export default ManagerHousekeeping;
