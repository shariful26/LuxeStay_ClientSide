import React, { useState, useEffect } from 'react';
import { Plus, X, Trash2, Bed, Users, DollarSign, Image as ImageIcon, Sparkles, Building, Eye, Maximize2, Edit3, Save, MapPin, Upload, Search, Check, Info } from 'lucide-react';
import { PortalLayout } from '../../components/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';

export const RoomManagement = () => {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const [rooms, setRooms] = useState([]);
  const [partnerHotels, setPartnerHotels] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Popular');
  const [typeFilter, setTypeFilter] = useState('All Type');

  // Interactive gallery preview states
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'Deluxe Room',
    price: 450,
    capacity: 2,
    bedType: '1 King Bed',
    size: '75 m² / 807 sq ft',
    view: 'Panoramic Sea & Caldera View',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    status: 'Available',
    description: '',
    freeCancellation: true,
    breakfastIncluded: true,
    instantVoucher: true
  });

  const fetchRoomsData = () => {
    fetch('/api/hotels')
      .then(res => res.json())
      .then(hotelsData => {
        if (Array.isArray(hotelsData)) {
          const myHotels = hotelsData.filter(h => {
            if (!user) return false;
            if (h.partnerId && user.id && String(h.partnerId) === String(user.id)) return true;
            if (h.partnerName && user.companyName && h.partnerName.toLowerCase() === user.companyName.toLowerCase()) return true;
            if (h.partnerName && user.name && h.partnerName.toLowerCase() === user.name.toLowerCase()) return true;
            return false;
          });
          setPartnerHotels(myHotels);
          const myHotelIds = myHotels.map(h => h.id);

          fetch('/api/rooms')
            .then(res => res.json())
            .then(roomsData => {
              if (Array.isArray(roomsData)) {
                const myRooms = roomsData.filter(r => myHotelIds.includes(r.hotelId) || (!r.hotelId && user.role === 'partner'));
                setRooms(myRooms);
                if (myRooms.length > 0 && !selectedRoom) {
                  setSelectedRoom(myRooms[0]);
                  setActiveImgIndex(0);
                }
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchRoomsData();
  }, [user]);

  // Reset active image index when selecting a different room
  useEffect(() => {
    setActiveImgIndex(0);
  }, [selectedRoom]);

  const handlePhotoFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image file size is too large. Please select a photo under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const openAddModal = () => {
    setEditingRoom(null);
    setFormData({
      name: '',
      type: 'Deluxe Room',
      price: 450,
      capacity: 2,
      bedType: '1 King Bed',
      size: '75 m² / 807 sq ft',
      view: 'Panoramic Sea & Caldera View',
      location: 'Oia Cliffside Drive 12, Santorini 84702, Greece',
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
      status: 'Available',
      description: '',
      freeCancellation: true,
      breakfastIncluded: true,
      instantVoucher: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (room) => {
    setEditingRoom(room);
    setFormData({
      name: room.name || '',
      type: room.type || 'Deluxe Room',
      price: room.price || 450,
      capacity: room.capacity || 2,
      bedType: room.bedType || '1 King Bed',
      size: room.size || '75 m² / 807 sq ft',
      view: room.view || 'Panoramic Sea & Caldera View',
      location: room.location || '',
      image: room.image || '',
      status: room.status || 'Available',
      description: room.description || '',
      freeCancellation: room.freeCancellation !== undefined ? room.freeCancellation : true,
      breakfastIncluded: room.breakfastIncluded !== undefined ? room.breakfastIncluded : true,
      instantVoucher: room.instantVoucher !== undefined ? room.instantVoucher : true
    });
    setIsModalOpen(true);
  };

  const handleDelete = (roomId) => {
    if (window.confirm("Are you sure you want to permanently delete this room type?")) {
      fetch(`/api/rooms/${roomId}`, { method: 'DELETE' })
        .then(() => {
          setRooms(prev => prev.filter(r => r.id !== roomId));
          if (selectedRoom?.id === roomId) {
            setSelectedRoom(null);
          }
        });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const targetHotelId = partnerHotels[0]?.id || 'h1';

    const payload = {
      ...formData,
      hotelId: targetHotelId,
      images: [formData.image],
    };

    const url = editingRoom ? `/api/rooms/${editingRoom.id}` : '/api/rooms';
    const method = editingRoom ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(saved => {
        setLoading(false);
        setIsModalOpen(false);
        fetchRoomsData();
        setSelectedRoom(saved);
      })
      .catch(() => setLoading(false));
  };

  const filteredRooms = rooms.filter(r => {
    const matchesSearch = r.name?.toLowerCase().includes(searchQuery.toLowerCase()) || r.type?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'All Type' || r.type?.toLowerCase() === typeFilter.toLowerCase();
    return matchesSearch && matchesType;
  });

  // Dynamic gallery images setup for preview
  const roomGallery = selectedRoom ? [
    selectedRoom.image,
    ...(Array.isArray(selectedRoom.images) ? selectedRoom.images.filter(img => img && img !== selectedRoom.image) : []),
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=600&q=80"
  ].filter(Boolean).slice(0, 4) : [];

  return (
    <PortalLayout role="partner" title="LuxStay Room Management">
      <div className="max-w-7xl mx-auto space-y-6 font-sans animate-fade-in text-slate-800 pb-12">
        
        {/* split main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SECTION (7/12 cols) - Rooms Catalog List */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Rooms</h1>
              
              <div className="flex items-center gap-2 flex-wrap">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Search room type, number, etc"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-4 py-2 rounded-full border border-slate-200 bg-white text-xs outline-none focus:border-slate-400 w-44 font-medium"
                  />
                </div>

                {/* Sort dropdown */}
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 rounded-full border border-slate-200 bg-white text-xs outline-none cursor-pointer font-bold"
                >
                  <option value="Popular">Sort by: Popular</option>
                  <option value="Price">Price</option>
                </select>

                {/* Type dropdown */}
                <select 
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 rounded-full border border-slate-200 bg-white text-xs outline-none cursor-pointer font-bold"
                >
                  <option value="All Type">All Type</option>
                  <option value="Standard Room">Standard Room</option>
                  <option value="Deluxe Room">Deluxe Room</option>
                  <option value="Suite Room">Suite Room</option>
                </select>

                {/* Add Room Button */}
                <button 
                  onClick={openAddModal}
                  className="px-4 py-2 rounded-full bg-[#e2f896] hover:bg-[#d4ed83] text-slate-900 text-xs font-black shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Room
                </button>
              </div>
            </div>

            {/* Room List Cards */}
            <div className="space-y-4">
              {filteredRooms.map((room) => {
                const isSelected = selectedRoom?.id === room.id;
                return (
                  <div 
                    key={room.id}
                    onClick={() => setSelectedRoom(room)}
                    className={`p-4 rounded-3xl bg-white border cursor-pointer transition-all flex flex-col sm:flex-row gap-4 items-stretch ${
                      isSelected ? 'border-amber-500 ring-1 ring-amber-500/50 shadow-md' : 'border-slate-200/70 hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    {/* Left image thumb */}
                    <div className="w-full sm:w-44 h-32 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">
                      <img src={room.image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=300&q=80"} alt={room.name} className="w-full h-full object-cover" />
                    </div>

                    {/* Right info */}
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-base font-extrabold text-slate-900 leading-tight">{room.name || room.type}</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-wider">{room.type}</p>
                          </div>
                          
                          {/* Status Pill */}
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${
                            room.status === 'Available' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}>
                            {room.status || 'Available'}
                          </span>
                        </div>

                        {/* Specs Grid */}
                        <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500">
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> {room.size || '35 m²'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Bed className="w-3.5 h-3.5 text-slate-400" /> {room.bedType || '1 King Bed'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-slate-400" /> {room.capacity || 2} guests
                          </span>
                        </div>

                        <p className="text-xs text-slate-400 line-clamp-1 font-medium">{room.description || 'Spacious interior with private bathroom and modern essentials.'}</p>
                      </div>

                      {/* Bottom row */}
                      <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-3">
                        <span className="text-[11px] font-bold text-slate-400">Available: <strong className="text-slate-700">18/25 Rooms</strong></span>
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-base font-black text-slate-900">{formatPrice(room.price || 150)}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">/night</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredRooms.length === 0 && (
                <div className="p-12 text-center text-xs text-slate-400 bg-white border border-slate-200 rounded-3xl">
                  No rooms setup for your hotels. Create one using the "+ Add Room" button.
                </div>
              )}
            </div>

          </div>

          {/* RIGHT SECTION (5/12 cols) - Dynamic Details Pane */}
          <div className="lg:col-span-5">
            {selectedRoom ? (
              <div className="p-6 rounded-3xl bg-white border border-slate-200/70 shadow-md space-y-6">
                
                {/* Header detail */}
                <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Room Detail</span>
                    <h3 className="text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
                      {selectedRoom.name || selectedRoom.type}
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-[10px] font-black text-emerald-700 capitalize">
                        {selectedRoom.status || 'Available'}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">Occupied: 18/25 Rooms</p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => openEditModal(selectedRoom)}
                      className="p-2 rounded-xl bg-[#e2f896] hover:bg-[#d4ed83] text-slate-900 font-extrabold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(selectedRoom.id)}
                      className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Big Preview Image & Gallery */}
                <div className="space-y-3">
                  <div className="h-56 rounded-2xl overflow-hidden bg-slate-100 shadow-2xs">
                    <img 
                      src={roomGallery[activeImgIndex] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80"} 
                      alt={selectedRoom.name} 
                      className="w-full h-full object-cover transition-all duration-300" 
                    />
                  </div>
                  
                  {/* Thumb Gallery (Interactive thumbnails) */}
                  <div className="grid grid-cols-4 gap-2">
                    {roomGallery.slice(0, 3).map((img, idx) => (
                      <div 
                        key={idx}
                        onClick={() => setActiveImgIndex(idx)}
                        className={`h-14 rounded-xl overflow-hidden cursor-pointer transition-all border ${
                          activeImgIndex === idx ? 'border-amber-500 ring-2 ring-amber-500/25' : 'border-slate-100 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={img} className="w-full h-full object-cover" />
                      </div>
                    ))}
                    
                    {/* View All Button */}
                    <div 
                      onClick={() => setIsLightboxOpen(true)}
                      className="h-14 rounded-xl overflow-hidden bg-slate-900 hover:bg-slate-850 flex items-center justify-center text-white text-[10px] font-black cursor-pointer shadow-xs transition-transform hover:scale-102"
                    >
                      View All
                    </div>
                  </div>
                </div>

                {/* Room size & bed capacity detail */}
                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs font-bold text-slate-700">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] text-slate-400 uppercase">Size</span>
                    <span>{selectedRoom.size || '35 m²'}</span>
                  </div>
                  <div className="w-px h-8 bg-slate-200"></div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] text-slate-400 uppercase">Bedding</span>
                    <span>{selectedRoom.bedType || '1 King Bed'}</span>
                  </div>
                  <div className="w-px h-8 bg-slate-200"></div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] text-slate-400 uppercase">Capacity</span>
                    <span>{selectedRoom.capacity || 2} guests</span>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Description</span>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    {selectedRoom.description || 'Upgrade to our Deluxe Rooms for added space and luxury. Featuring comfortable premium queen-size bedding, a spacious private workstation, and modern ensuite washrooms with rainfall shower setup.'}
                  </p>
                </div>

                {/* Features & Inclusions */}
                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-xs font-bold">
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Features</span>
                    <ul className="space-y-1.5 text-slate-600">
                      <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Private balcony (select)</li>
                      <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Work desk & workstation</li>
                      <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Spacious open layout</li>
                      <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Large garden view windows</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Facilities</span>
                    <ul className="space-y-1.5 text-slate-600">
                      <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> High speed Wi-Fi</li>
                      <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> In room safe box</li>
                      <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Mini fridge</li>
                      <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Smart Flat-screen TV</li>
                    </ul>
                  </div>
                </div>

                {/* Full Amenities list */}
                <div className="space-y-2.5 border-t border-slate-100 pt-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Amenities</span>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-600">
                    <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> Complimentary bottled water</div>
                    <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> Luxury toiletries kit</div>
                    <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> Coffee and tea maker</div>
                    <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> Free Wi-Fi connectivity</div>
                    <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> Premium bedding & linens</div>
                    <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> Bathrobe and slippers</div>
                    <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> Ensuite walk-in shower</div>
                    <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> 24-hour room service</div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 bg-white border border-slate-200/70 rounded-3xl text-xs font-semibold flex items-center gap-2 justify-center">
                <Info className="w-4 h-4" /> Select a room from the catalog list to preview detail specifications.
              </div>
            )}
          </div>

        </div>

      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto animate-scale-up text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-black text-slate-950 flex items-center gap-2">
                <Building className="w-5 h-5 text-amber-500" />
                {editingRoom ? 'Modify Suite Configuration' : 'Setup New Suite Category'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold text-slate-700">
              
              {/* Room Name */}
              <div>
                <label className="block mb-1">Room Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Presidential Ocean Suite"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none text-slate-900"
                />
              </div>

              {/* Type & Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Suite Category *</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none cursor-pointer"
                  >
                    <option value="Standard Room">Standard Room</option>
                    <option value="Deluxe Room">Deluxe Room</option>
                    <option value="Suite Room">Suite Room</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1">Nightly Price ($ USD) *</label>
                  <input 
                    type="number" 
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none text-slate-900"
                  />
                </div>
              </div>

              {/* Capacity & Bedding */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Guest Capacity *</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none text-slate-900"
                  />
                </div>

                <div>
                  <label className="block mb-1">Bed Configuration *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. 1 King Bed or 2 Double Beds"
                    value={formData.bedType}
                    onChange={(e) => setFormData({ ...formData, bedType: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none text-slate-900"
                  />
                </div>
              </div>

              {/* Size & View */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Room Area Size</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 50 m² / 538 sq ft"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none text-slate-900"
                  />
                </div>

                <div>
                  <label className="block mb-1">Scenic View</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Ocean View"
                    value={formData.view}
                    onChange={(e) => setFormData({ ...formData, view: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none text-slate-900"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block mb-1">Suite Location / Address *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Room 101, Floor 1 or Street address"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none text-slate-900"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block mb-1">Status</label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none cursor-pointer"
                >
                  <option value="Available">Available</option>
                  <option value="Occupied">Occupied</option>
                </select>
              </div>

              {/* Photo File Upload Zone */}
              <div>
                <label className="block mb-1 flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5 text-amber-500" /> Suite Photo File *
                </label>
                
                {formData.image ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 group h-36 bg-slate-50">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <label className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs cursor-pointer hover:bg-amber-400">
                        Change File
                        <input type="file" accept="image/*" onChange={handlePhotoFileUpload} className="hidden" />
                      </label>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: '' })}
                        className="px-3 py-1.5 rounded-lg bg-rose-500 text-white font-bold text-xs hover:bg-rose-600"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-24 rounded-xl border border-dashed border-slate-300 bg-slate-50 cursor-pointer hover:bg-amber-500/5 transition-all text-center">
                    <Upload className="w-5 h-5 text-slate-400 mb-1" />
                    <span className="text-xs">Click to upload photo file</span>
                    <input type="file" accept="image/*" onChange={handlePhotoFileUpload} className="hidden" />
                  </label>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block mb-1">Description</label>
                <textarea 
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="In-room amenities, butler service details, layout description..."
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none text-slate-900"
                />
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
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-[#e2f896] text-slate-950 hover:bg-[#d4ed83] flex items-center gap-1.5 shadow-md font-black cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Save Suite Configuration
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* STUNNING LIGHTBOX / IMAGE GALLERY MODAL */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-fade-in">
          {/* Close button top right */}
          <button 
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="max-w-4xl w-full space-y-6 text-center text-white">
            <h3 className="text-xl font-black">{selectedRoom.name || selectedRoom.type} Gallery Preview</h3>
            
            {/* Grid of all images */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {roomGallery.map((img, idx) => (
                <div key={idx} className="group relative rounded-2xl overflow-hidden aspect-video bg-slate-800 border border-white/10 shadow-lg">
                  <img src={img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt="" />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      onClick={() => { setActiveImgIndex(idx); setIsLightboxOpen(false); }}
                      className="px-4 py-2 rounded-xl bg-white text-slate-900 font-extrabold text-xs shadow-md"
                    >
                      Set Primary
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <p className="text-xs text-slate-400 font-medium">Click "Set Primary" on any image to view it as the main preview card photo.</p>
          </div>
        </div>
      )}
    </PortalLayout>
  );
};
