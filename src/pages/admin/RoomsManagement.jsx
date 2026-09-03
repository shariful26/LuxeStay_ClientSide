import React, { useState, useEffect } from 'react';
import { PortalLayout } from '../../components/PortalLayout';
import { useCurrency } from '../../context/CurrencyContext';
import { useToast } from '../../context/ToastContext';
import { 
  Bed, Maximize2, Users, Sparkles, ChevronLeft, ChevronRight, Search, 
  ShieldCheck, Crown, Waves, Home, Plus, X, Edit2, Trash2, Save, Image as ImageIcon 
} from 'lucide-react';
import { getInstantData } from '../../utils/instantCache';

export const RoomsManagement = () => {
  const [rooms, setRooms] = useState(() => getInstantData('rooms', []));
  const [hotels, setHotels] = useState(() => getInstantData('hotels', []));
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const { formatPrice } = useCurrency();
  const toast = useToast();

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    hotelId: '',
    name: '',
    type: 'Deluxe Room',
    price: 450,
    capacity: 2,
    bedType: '1 King Bed',
    size: '75 m² / 807 sq ft',
    view: 'Panoramic Ocean & Skyline View',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    status: 'Available',
    amenities: ['Free High-Speed Wi-Fi', 'Balcony / Terrace', 'Air Conditioning', 'En-suite Luxury Bath']
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, typeFilter]);

  const fetchData = async () => {
    try {
      const [roomsRes, hotelsRes] = await Promise.all([
        fetch('/api/rooms'),
        fetch('/api/hotels')
      ]);
      const roomsData = await roomsRes.json();
      const hotelsData = await hotelsRes.json();

      if (Array.isArray(roomsData)) {
        setRooms(roomsData);
        try { localStorage.setItem('luxestay_cache_rooms', JSON.stringify(roomsData)); } catch (e) {}
      }
      if (Array.isArray(hotelsData)) {
        setHotels(hotelsData);
        try { localStorage.setItem('luxestay_cache_hotels', JSON.stringify(hotelsData)); } catch (e) {}
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingRoom(null);
    setFormData({
      hotelId: hotels[0]?.id || 'h1',
      name: '',
      type: 'Deluxe Room',
      price: 450,
      capacity: 2,
      bedType: '1 King Bed',
      size: '75 m² / 807 sq ft',
      view: 'Panoramic Ocean & Skyline View',
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
      status: 'Available',
      amenities: ['Free High-Speed Wi-Fi', 'Balcony / Terrace', 'Air Conditioning', 'En-suite Luxury Bath']
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (room) => {
    setEditingRoom(room);
    setFormData({
      hotelId: room.hotelId || hotels[0]?.id || 'h1',
      name: room.name || '',
      type: room.type || 'Deluxe Room',
      price: room.price || 450,
      capacity: room.capacity || 2,
      bedType: room.bedType || '1 King Bed',
      size: room.size || '75 m²',
      view: room.view || 'Scenic View',
      image: room.images?.[0] || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
      status: room.status || 'Available',
      amenities: room.amenities || ['Free High-Speed Wi-Fi']
    });
    setIsModalOpen(true);
  };

  const handleSaveRoom = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please enter a room name');
      return;
    }
    setLoading(true);

    const isEdit = !!editingRoom;
    const url = isEdit ? `/api/rooms/${editingRoom.id}` : '/api/rooms';
    const method = isEdit ? 'PUT' : 'POST';

    const payload = {
      ...formData,
      images: [formData.image],
      price: Number(formData.price) || 450,
      capacity: Number(formData.capacity) || 2
    };

    if (!isEdit) {
      payload.id = `r_${Date.now()}`;
    }

    // Optimistic UI update
    if (isEdit) {
      setRooms(prev => prev.map(r => r.id === editingRoom.id ? { ...r, ...payload } : r));
    } else {
      setRooms(prev => [payload, ...prev]);
    }

    setIsModalOpen(false);
    toast.success(`Room "${formData.name}" ${isEdit ? 'updated' : 'added'} successfully!`, 'Catalog Updated');

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data && data.id) {
        setRooms(prev => {
          const list = isEdit ? prev.map(r => r.id === editingRoom.id ? { ...r, ...data } : r) : [data, ...prev.filter(r => r.id !== payload.id)];
          try { localStorage.setItem('luxestay_cache_rooms', JSON.stringify(list)); } catch (e) {}
          return list;
        });
      }
    } catch (err) {
      console.error('Failed to save room:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async (roomId, roomName) => {
    if (!window.confirm(`Are you sure you want to delete "${roomName}" from the platform?`)) return;

    setRooms(prev => prev.filter(r => r.id !== roomId));
    toast.success(`Room "${roomName}" deleted!`, 'Deleted');

    try {
      await fetch(`/api/rooms/${roomId}`, { method: 'DELETE' });
    } catch (e) {
      console.error('Failed to delete room:', e);
    }
  };

  const renderTypeBadge = (type) => {
    const typeLower = String(type).toLowerCase();
    if (typeLower.includes('presidential')) {
      return (
        <span className="px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/25 font-bold uppercase tracking-wider text-[9px] inline-flex items-center gap-1">
          <Crown className="w-3 h-3" /> {type}
        </span>
      );
    } else if (typeLower.includes('suite')) {
      return (
        <span className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 font-bold uppercase tracking-wider text-[9px] inline-flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> {type}
        </span>
      );
    } else if (typeLower.includes('villa')) {
      return (
        <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 font-bold uppercase tracking-wider text-[9px] inline-flex items-center gap-1">
          <Waves className="w-3 h-3" /> {type}
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/25 font-bold uppercase tracking-wider text-[9px] inline-flex items-center gap-1">
        <Bed className="w-3 h-3" /> {type}
      </span>
    );
  };

  const filteredRooms = rooms.filter(r => {
    const matchesSearch = 
      r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.bedType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.view?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = 
      typeFilter === 'all' || 
      (typeFilter === 'presidential' && String(r.type).toLowerCase().includes('presidential')) ||
      (typeFilter === 'suite' && String(r.type).toLowerCase().includes('suite')) ||
      (typeFilter === 'villa' && String(r.type).toLowerCase().includes('villa')) ||
      (typeFilter === 'deluxe' && String(r.type).toLowerCase().includes('deluxe'));

    return matchesSearch && matchesType;
  });

  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRooms = filteredRooms.slice(indexOfFirstItem, indexOfLastItem);

  const presidentialCount = rooms.filter(r => String(r.type).toLowerCase().includes('presidential')).length;
  const suiteCount = rooms.filter(r => String(r.type).toLowerCase().includes('suite')).length;
  const villaCount = rooms.filter(r => String(r.type).toLowerCase().includes('villa')).length;

  return (
    <PortalLayout role="admin" title="Room Master Catalog">
      
      {/* Header Bar with + Add Room */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)]">Platform Room Master Catalog</h1>
          <p className="text-xs text-[var(--text-secondary)]">Master list of suites, specs, inventory, and base pricing across all properties</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="btn btn-primary bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs py-3 px-5 shadow-lg shadow-amber-500/25 flex items-center gap-2 font-black cursor-pointer self-start sm:self-auto rounded-2xl"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Add New Suite / Room
        </button>
      </div>

      {/* KPI Room Filter Boxes */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs font-bold mt-4">
        <div 
          onClick={() => setTypeFilter('all')} 
          className={`p-4 rounded-2xl border transition-all cursor-pointer select-none group ${
            typeFilter === 'all' 
              ? 'bg-amber-500/15 border-amber-500 text-amber-500 shadow-md ring-2 ring-amber-500/20' 
              : 'bg-[var(--bg-card)] border-[var(--border-light)] text-[var(--text-secondary)] hover:border-amber-500/40 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="group-hover:text-amber-500 transition-colors">Total Suites & Rooms</span>
            <Bed className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl font-extrabold text-[var(--text-primary)] block mt-1">{rooms.length}</span>
        </div>

        <div 
          onClick={() => setTypeFilter('presidential')} 
          className={`p-4 rounded-2xl border transition-all cursor-pointer select-none group ${
            typeFilter === 'presidential' 
              ? 'bg-purple-500/15 border-purple-500 text-purple-500 shadow-md ring-2 ring-purple-500/20' 
              : 'bg-[var(--bg-card)] border-[var(--border-light)] text-[var(--text-secondary)] hover:border-purple-500/40 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="group-hover:text-purple-500 transition-colors">Presidential & Royal</span>
            <Crown className="w-4 h-4 text-purple-500" />
          </div>
          <span className="text-2xl font-extrabold text-purple-500 block mt-1">{presidentialCount}</span>
        </div>

        <div 
          onClick={() => setTypeFilter('suite')} 
          className={`p-4 rounded-2xl border transition-all cursor-pointer select-none group ${
            typeFilter === 'suite' 
              ? 'bg-amber-500/15 border-amber-500 text-amber-500 shadow-md ring-2 ring-amber-500/20' 
              : 'bg-[var(--bg-card)] border-[var(--border-light)] text-[var(--text-secondary)] hover:border-amber-500/40 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="group-hover:text-amber-500 transition-colors">Executive Suites</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl font-extrabold text-amber-500 block mt-1">{suiteCount}</span>
        </div>

        <div 
          onClick={() => setTypeFilter('villa')} 
          className={`p-4 rounded-2xl border transition-all cursor-pointer select-none group ${
            typeFilter === 'villa' 
              ? 'bg-emerald-500/15 border-emerald-500 text-emerald-500 shadow-md ring-2 ring-emerald-500/20' 
              : 'bg-[var(--bg-card)] border-[var(--border-light)] text-[var(--text-secondary)] hover:border-emerald-500/40 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="group-hover:text-emerald-500 transition-colors">Overwater & Villas</span>
            <Waves className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-2xl font-extrabold text-emerald-500 block mt-1">{villaCount}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 mt-6">
        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by suite, view, bedding..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-light)] text-xs text-[var(--text-primary)] outline-none focus:border-amber-500 font-medium"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'all', label: 'All Rooms', Icon: Home },
              { id: 'presidential', label: 'Presidential', Icon: Crown },
              { id: 'suite', label: 'Suites', Icon: Sparkles },
              { id: 'villa', label: 'Villas', Icon: Waves }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setTypeFilter(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  typeFilter === f.id
                    ? 'bg-slate-900 text-amber-400 shadow-xs border border-slate-800'
                    : 'bg-[var(--bg-card)] border border-[var(--border-light)] text-[var(--text-secondary)] hover:border-amber-500/40'
                }`}
              >
                <f.Icon className="w-3.5 h-3.5" />
                <span>{f.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs font-bold text-[var(--text-muted)] whitespace-nowrap self-end md:self-auto">
          Showing {filteredRooms.length} of {rooms.length} suites
        </div>
      </div>

      {/* Table Section with Actions */}
      <div className="space-y-6 mt-4">
        <div className="rounded-3xl bg-[var(--bg-card)] border border-[var(--border-light)] overflow-hidden shadow-lg p-2 sm:p-4">
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th className="pl-6">Suite & View Details</th>
                  <th>Category Type</th>
                  <th>Capacity & Bedding</th>
                  <th>Dimensions</th>
                  <th>Nightly Rate</th>
                  <th>Status</th>
                  <th className="pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-light)]">
                {currentRooms.map(r => {
                  const imageUrl = r.images?.[0] || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=400&q=80';
                  return (
                    <tr key={r.id} className="transition-all hover:bg-[var(--bg-tertiary)]/30">
                      <td className="pl-6 font-bold text-[var(--text-primary)]">
                        <div className="flex items-center gap-3 py-1">
                          <img 
                            src={imageUrl} 
                            alt={r.name} 
                            className="w-16 h-11 rounded-xl object-cover border border-[var(--border-light)] shadow-xs flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="text-sm font-extrabold block text-[var(--text-primary)] truncate">{r.name}</span>
                            <span className="text-[10px] text-[var(--text-muted)] font-bold block truncate">🌅 {r.view || 'Scenic View'}</span>
                          </div>
                        </div>
                      </td>
                      <td>{renderTypeBadge(r.type)}</td>
                      <td className="text-xs">
                        <div className="space-y-1 font-bold text-[var(--text-secondary)]">
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                            <span>{r.capacity} Guests Max</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)]">
                            <Bed className="w-3.5 h-3.5 text-[var(--text-muted)] flex-shrink-0" />
                            <span>{r.bedType}</span>
                          </div>
                        </div>
                      </td>
                      <td className="text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-[var(--text-secondary)]">
                          <Maximize2 className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                          <span>{r.size}</span>
                        </div>
                      </td>
                      <td className="font-extrabold text-amber-500 text-sm">
                        {formatPrice(r.price)}
                        <span className="text-[10px] text-[var(--text-muted)] font-bold block mt-0.5">/ night</span>
                      </td>
                      <td>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                          r.status === 'Booked' 
                            ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' 
                            : r.status === 'Maintenance'
                            ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${r.status === 'Maintenance' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                          {r.status || 'Available'}
                        </span>
                      </td>
                      <td className="pr-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(r)}
                            className="p-1.5 rounded-lg bg-[var(--bg-tertiary)] hover:bg-amber-500 hover:text-white text-[var(--text-secondary)] transition-all cursor-pointer"
                            title="Edit Suite"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRoom(r.id, r.name)}
                            className="p-1.5 rounded-lg bg-[var(--bg-tertiary)] hover:bg-rose-500 hover:text-white text-[var(--text-secondary)] transition-all cursor-pointer"
                            title="Delete Suite"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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

      {/* MODAL: ADD / EDIT SUITE & RATES */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[var(--bg-card)] rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[var(--border-light)] space-y-4 animate-scale-up text-xs font-bold text-[var(--text-primary)]">
            
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-light)]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 font-black flex items-center justify-center">
                  <Bed className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[var(--text-primary)] leading-none">
                    {editingRoom ? 'Edit Room & Rates' : 'Add New Room / Suite'}
                  </h3>
                  <span className="text-[10px] text-[var(--text-muted)] font-bold mt-0.5 block">Configure specifications and nightly pricing</span>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRoom} className="space-y-3">
              
              {/* Hotel Property & Room Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-[var(--text-muted)] uppercase block mb-1">Hotel Property</label>
                  <select
                    value={formData.hotelId}
                    onChange={(e) => setFormData({ ...formData, hotelId: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[var(--border-light)] bg-[var(--bg-tertiary)] outline-none text-xs font-bold text-[var(--text-primary)] cursor-pointer"
                  >
                    {hotels.map(h => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-[var(--text-muted)] uppercase block mb-1">Suite / Room Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Penthouse Suite"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[var(--border-light)] bg-[var(--bg-tertiary)] outline-none text-xs font-medium text-[var(--text-primary)]"
                  />
                </div>
              </div>

              {/* Type & Nightly Rate */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-[var(--text-muted)] uppercase block mb-1">Category Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[var(--border-light)] bg-[var(--bg-tertiary)] outline-none text-xs font-bold text-[var(--text-primary)] cursor-pointer"
                  >
                    <option value="Presidential Suite">Presidential Suite</option>
                    <option value="Executive Suite">Executive Suite</option>
                    <option value="Overwater Villa">Overwater Villa</option>
                    <option value="Deluxe Room">Deluxe Room</option>
                    <option value="Family Suite">Family Suite</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-[var(--text-muted)] uppercase block mb-1">Nightly Rate ($ USD) *</label>
                  <input
                    type="number"
                    required
                    min="50"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-[var(--border-light)] bg-[var(--bg-tertiary)] outline-none text-xs font-black text-amber-500"
                  />
                </div>
              </div>

              {/* Bed Type & Capacity */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-[var(--text-muted)] uppercase block mb-1">Bed Configuration</label>
                  <input
                    type="text"
                    placeholder="e.g. 1 King Bed or 2 Queen Beds"
                    value={formData.bedType}
                    onChange={(e) => setFormData({ ...formData, bedType: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[var(--border-light)] bg-[var(--bg-tertiary)] outline-none text-xs font-medium text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[var(--text-muted)] uppercase block mb-1">Max Guests</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-[var(--border-light)] bg-[var(--bg-tertiary)] outline-none text-xs font-medium text-[var(--text-primary)]"
                  />
                </div>
              </div>

              {/* View & Dimensions */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-[var(--text-muted)] uppercase block mb-1">Balcony View</label>
                  <input
                    type="text"
                    placeholder="e.g. Ocean & Sunset View"
                    value={formData.view}
                    onChange={(e) => setFormData({ ...formData, view: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[var(--border-light)] bg-[var(--bg-tertiary)] outline-none text-xs font-medium text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[var(--text-muted)] uppercase block mb-1">Initial Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[var(--border-light)] bg-[var(--bg-tertiary)] outline-none text-xs font-bold text-[var(--text-primary)] cursor-pointer"
                  >
                    <option value="Available">Available</option>
                    <option value="Booked">Booked</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="text-[10px] text-[var(--text-muted)] uppercase block mb-1">Room Photo URL</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[var(--border-light)] bg-[var(--bg-tertiary)] outline-none text-xs font-medium text-[var(--text-primary)]"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[var(--border-light)]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[var(--border-light)] hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-black shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{loading ? 'Saving...' : editingRoom ? 'Save Changes' : 'Create Suite'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </PortalLayout>
  );
};

export default RoomsManagement;
