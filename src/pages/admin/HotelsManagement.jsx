import React, { useState, useEffect } from 'react';
import { Plus, Sparkles, Search, Trash2, Edit3, Eye, Building2, MapPin, CheckCircle, ShieldCheck, X, Save, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PortalLayout } from '../../components/PortalLayout';
import { useCurrency } from '../../context/CurrencyContext';

import { getInstantData } from '../../utils/instantCache';

export const HotelsManagement = () => {
  const [hotels, setHotels] = useState(() => getInstantData('hotels', []));
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const { formatPrice } = useCurrency();

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter]);

  const renderCategoryBadge = (category) => {
    const catLower = String(category).toLowerCase();
    if (catLower.includes('resort')) {
      return (
        <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase tracking-wider">
          🌴 Resorts
        </span>
      );
    } else if (catLower.includes('villa')) {
      return (
        <span className="px-2.5 py-1 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 text-[9px] font-black uppercase tracking-wider">
          🌊 Villa
        </span>
      );
    } else if (catLower.includes('ryokan')) {
      return (
        <span className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[9px] font-black uppercase tracking-wider">
          ⛩️ Ryokan
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-[9px] font-black uppercase tracking-wider">
        🏛️ {category}
      </span>
    );
  };

  const [formData, setFormData] = useState({
    name: '',
    category: 'Resort & Spa',
    destination: 'Santorini, Greece',
    pricePerNight: 450,
    partnerName: 'Aura Hospitality',
    rating: 4.9,
    status: 'Pending',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    description: '',
    address: 'Caldera Cliffside, Santorini, Greece'
  });

  useEffect(() => {
    fetch('/api/hotels')
      .then(res => res.json())
      .then(data => setHotels(data))
      .catch(() => {});
  }, []);

  const toggleFeatured = async (hotel) => {
    const updatedFeatured = !hotel.featured;
    try {
      const res = await fetch(`/api/hotels/${hotel.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: updatedFeatured })
      });
      if (res.ok) {
        const updated = await res.json();
        setHotels(prev => prev.map(h => h.id === hotel.id ? updated : h));
      } else {
        setHotels(prev => prev.map(h => h.id === hotel.id ? { ...h, featured: updatedFeatured } : h));
      }
    } catch (e) {
      setHotels(prev => prev.map(h => h.id === hotel.id ? { ...h, featured: updatedFeatured } : h));
    }
  };

  const updateHotelStatus = async (hotel, newStatus) => {
    try {
      const res = await fetch(`/api/hotels/${hotel.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setHotels(prev => prev.map(h => h.id === hotel.id ? { ...h, status: newStatus } : h));
      } else {
        setHotels(prev => prev.map(h => h.id === hotel.id ? { ...h, status: newStatus } : h));
      }
    } catch (e) {
      setHotels(prev => prev.map(h => h.id === hotel.id ? { ...h, status: newStatus } : h));
    }
  };

  const getNormalizedStatus = (status) => {
    if (!status) return 'Pending';
    const s = String(status).toLowerCase();
    if (s === 'approved' || s === 'active') return 'Approved';
    if (s === 'rejected') return 'Rejected';
    return 'Pending';
  };

  const openAddModal = () => {
    setEditingHotel(null);
    setFormData({
      name: '',
      category: 'Resort & Spa',
      destination: 'Santorini, Greece',
      pricePerNight: 450,
      partnerName: 'Aura Hospitality',
      rating: 4.9,
      status: 'Pending',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      description: '',
      address: 'Caldera Cliffside, Santorini, Greece'
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (hotel) => {
    setEditingHotel(hotel);
    setFormData({
      name: hotel.name || '',
      category: hotel.category || 'Resort & Spa',
      destination: hotel.destination || 'Santorini, Greece',
      pricePerNight: hotel.pricePerNight || 450,
      partnerName: hotel.partnerName || 'Aura Hospitality',
      rating: hotel.rating || 4.9,
      status: hotel.status || 'Approved',
      image: hotel.images && hotel.images[0] ? hotel.images[0] : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      description: hotel.description || '',
      address: hotel.address || ''
    });
    setIsAddModalOpen(true);
  };

  const handleSaveHotel = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    setLoading(true);

    try {
      if (editingHotel) {
        // UPDATE EXISTING HOTEL (PUT)
        const res = await fetch(`/api/hotels/${editingHotel.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            pricePerNight: Number(formData.pricePerNight),
            images: [formData.image]
          })
        });

        if (res.ok) {
          const updated = await res.json();
          setHotels(prev => prev.map(h => h.id === editingHotel.id ? updated : h));
        } else {
          setHotels(prev => prev.map(h => h.id === editingHotel.id ? { ...h, ...formData, pricePerNight: Number(formData.pricePerNight), images: [formData.image] } : h));
        }
      } else {
        // CREATE NEW HOTEL (POST)
        const res = await fetch('/api/hotels', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            pricePerNight: Number(formData.pricePerNight),
            images: [formData.image]
          })
        });

        if (res.ok) {
          const created = await res.json();
          setHotels([created, ...hotels]);
        } else {
          const fallback = {
            id: `h${Date.now()}`,
            ...formData,
            pricePerNight: Number(formData.pricePerNight),
            images: [formData.image],
            featured: false
          };
          setHotels([fallback, ...hotels]);
        }
      }
    } catch (err) {
      if (editingHotel) {
        setHotels(prev => prev.map(h => h.id === editingHotel.id ? { ...h, ...formData, pricePerNight: Number(formData.pricePerNight), images: [formData.image] } : h));
      } else {
        const fallback = {
          id: `h${Date.now()}`,
          ...formData,
          pricePerNight: Number(formData.pricePerNight),
          images: [formData.image],
          featured: false
        };
        setHotels([fallback, ...hotels]);
      }
    } finally {
      setLoading(false);
      setIsAddModalOpen(false);
      setEditingHotel(null);
    }
  };

  const handleDeleteHotel = async (id) => {
    if (!window.confirm('Are you sure you want to remove this hotel listing from the platform?')) return;
    try {
      await fetch(`/api/hotels/${id}`, { method: 'DELETE' });
    } catch (e) {}
    setHotels(prev => prev.filter(h => h.id !== id));
  };

  const filteredHotels = hotels.filter(h => {
    const matchesSearch = 
      h.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.destination?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.category?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || h.category?.toLowerCase() === categoryFilter.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredHotels.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentHotels = filteredHotels.slice(indexOfFirstItem, indexOfLastItem);

  const featuredCount = hotels.filter(h => h.featured).length;

  return (
    <PortalLayout role="admin" title="Hotels Management">
      {/* Header & Add Hotel CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)]">Platform Hotels Directory</h1>
          <p className="text-xs text-[var(--text-secondary)]">Approve, edit, moderate, or feature partner hotel listings dynamically</p>
        </div>
        <button 
          onClick={openAddModal}
          className="btn btn-primary text-xs py-2.5 px-5 flex items-center gap-2 self-start sm:self-auto shadow-lg shadow-amber-500/25 hover:scale-[1.02] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Add New Property Listing
        </button>
      </div>

      {/* KPI Property Stats Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs font-bold">
        <div 
          onClick={() => setCategoryFilter('all')} 
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            categoryFilter === 'all' 
              ? 'bg-amber-500/15 border-amber-500 text-amber-500 shadow-sm' 
              : 'bg-[var(--bg-card)] border-[var(--border-light)] text-[var(--text-secondary)] hover:border-amber-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span>Total Properties</span>
            <Building2 className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-xl font-extrabold text-[var(--text-primary)] block mt-1">{hotels.length}</span>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-light)] text-[var(--text-secondary)]">
          <div className="flex items-center justify-between">
            <span>Featured Listings</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-xl font-extrabold text-amber-500 block mt-1">{featuredCount}</span>
        </div>

        <div 
          onClick={() => setCategoryFilter('Resort & Spa')} 
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            categoryFilter === 'Resort & Spa' 
              ? 'bg-emerald-500/15 border-emerald-500 text-emerald-500 shadow-sm' 
              : 'bg-[var(--bg-card)] border-[var(--border-light)] text-[var(--text-secondary)] hover:border-emerald-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span>Resorts & Spas</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-xl font-extrabold text-[var(--text-primary)] block mt-1">
            {hotels.filter(h => h.category === 'Resort & Spa').length}
          </span>
        </div>

        <div 
          onClick={() => setCategoryFilter('Overwater Villa')} 
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            categoryFilter === 'Overwater Villa' 
              ? 'bg-indigo-500/15 border-indigo-500 text-indigo-500 shadow-sm' 
              : 'bg-[var(--bg-card)] border-[var(--border-light)] text-[var(--text-secondary)] hover:border-indigo-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span>Overwater Villas</span>
            <MapPin className="w-4 h-4 text-indigo-500" />
          </div>
          <span className="text-xl font-extrabold text-[var(--text-primary)] block mt-1">
            {hotels.filter(h => h.category === 'Overwater Villa').length}
          </span>
        </div>
      </div>

      {/* Search Bar & Category Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <input 
            type="text" 
            placeholder="Search hotel name, destination or category..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-light)] text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-amber-500 transition-colors shadow-xs"
          />
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-3" />
        </div>

        <div className="text-xs font-bold text-[var(--text-muted)]">
          Showing {filteredHotels.length} listed properties
        </div>
      </div>

      {/* Hotels Data Table */}
      <div className="space-y-6">
        <div className="rounded-3xl bg-[var(--bg-card)] border border-[var(--border-light)] overflow-hidden shadow-lg p-2 sm:p-4">
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th className="pl-6">Property & Brand Details</th>
                  <th>Location & Base Rate</th>
                  <th>Listing Authority</th>
                  <th>Approval Status</th>
                  <th className="pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-light)]">
                {currentHotels.map(h => (
                  <tr key={h.id} className="transition-all hover:bg-[var(--bg-tertiary)]/30">
                    <td className="pl-6 font-bold text-[var(--text-primary)]">
                      <div className="flex items-center gap-3.5 py-1">
                        <img 
                          src={h.images && h.images[0] ? h.images[0] : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'} 
                          alt="" 
                          className="w-14 h-10 rounded-xl object-cover border border-[var(--border-light)] flex-shrink-0" 
                        />
                        <div className="min-w-0">
                          <span className="text-sm font-extrabold block text-[var(--text-primary)] truncate">{h.name}</span>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="text-[10px] text-amber-500 font-bold">★ {h.rating || 5.0}</span>
                            <span className="text-[9px] text-[var(--text-muted)] font-semibold">({h.reviewCount || 0} reviews)</span>
                            <span className="text-[9px] text-[var(--text-muted)] font-semibold">• Partner: {h.partnerName || 'Aura'}</span>
                            {renderCategoryBadge(h.category)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-[var(--text-secondary)] flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                          <span>{h.destination}</span>
                        </div>
                        <span className="text-xs font-black text-amber-500 block">
                          {formatPrice(h.pricePerNight)}
                          <span className="text-[9px] text-[var(--text-muted)] font-semibold">/night</span>
                        </span>
                      </div>
                    </td>
                    <td>
                      {/* Featured status toggle */}
                      <button 
                        onClick={() => toggleFeatured(h)}
                        className={`btn text-[10px] py-1.5 px-2.5 rounded-lg flex items-center gap-1 shadow-xs cursor-pointer transition-all ${
                          h.featured 
                            ? 'bg-amber-500 text-white font-extrabold border border-amber-500' 
                            : 'border border-[var(--border-light)] text-[var(--text-secondary)] bg-transparent font-bold hover:border-amber-500/40'
                        }`}
                        title="Click to toggle Featured status"
                      >
                        <Sparkles className="w-3 h-3" /> {h.featured ? 'Featured' : 'Feature'}
                      </button>
                    </td>
                    <td>
                      {/* Interactive Status Changer Dropdown */}
                      <select 
                        value={getNormalizedStatus(h.status)} 
                        onChange={(e) => updateHotelStatus(h, e.target.value)}
                        className={`px-2 py-1 rounded-md text-[10px] font-extrabold outline-none cursor-pointer border transition-colors shadow-xs ${
                          getNormalizedStatus(h.status) === 'Approved' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' :
                          getNormalizedStatus(h.status) === 'Rejected' ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' :
                          'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 animate-pulse'
                        }`}
                      >
                        <option value="Approved" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Approved</option>
                        <option value="Pending" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Pending</option>
                        <option value="Rejected" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Rejected</option>
                      </select>
                    </td>
                    <td className="pr-6">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link 
                          to={`/hotels/${h.slug || h.id}`} 
                          className="p-1.5 rounded-xl border border-[var(--border-light)] hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] transition-colors" 
                          title="Preview Public Listing"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <button 
                          onClick={() => openEditModal(h)}
                          className="p-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white transition-colors cursor-pointer"
                          title="Edit Hotel"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteHotel(h.id)}
                          className="p-1.5 rounded-xl text-red-400 hover:bg-red-500/15 transition-colors cursor-pointer"
                          title="Delete Listing"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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

      {/* ADD / EDIT HOTEL MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-xl bg-[var(--bg-card)] border border-[var(--border-light)] rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            
            <div className="px-6 py-4 border-b border-[var(--border-light)] flex items-center justify-between bg-[var(--bg-tertiary)]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[var(--text-primary)]">
                    {editingHotel ? `Edit Property: ${editingHotel.name}` : 'Add New Property Listing'}
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    {editingHotel ? 'Update hotel details, pricing, and category' : 'Register a new luxury hotel property'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-[var(--border-light)] text-[var(--text-muted)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHotel} className="p-6 overflow-y-auto space-y-4 text-xs font-semibold">
              
              <div>
                <label className="block text-amber-500 font-extrabold uppercase tracking-wider mb-1">
                  Property Name *
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. The Grand Azure Resort & Spa" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-[var(--text-primary)] outline-none font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[var(--text-secondary)] font-bold mb-1">
                    Property Category
                  </label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-[var(--text-primary)] outline-none font-bold cursor-pointer"
                  >
                    <option value="Resort & Spa" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Resort & Spa</option>
                    <option value="Overwater Villa" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Overwater Villa</option>
                    <option value="City Luxury Hotel" className="bg-[var(--bg-card)] text-[var(--text-primary)]">City Luxury Hotel</option>
                    <option value="Boutique Ryokan" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Boutique Ryokan</option>
                    <option value="Ski Resort" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Ski Resort</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[var(--text-secondary)] font-bold mb-1">
                    Base Nightly Rate ($ USD) *
                  </label>
                  <input 
                    type="number" 
                    required
                    min="50"
                    max="10000"
                    value={formData.pricePerNight}
                    onChange={(e) => setFormData({ ...formData, pricePerNight: e.target.value })}
                    className="w-full p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-[var(--text-primary)] outline-none font-bold text-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[var(--text-secondary)] font-bold mb-1">
                    Destination / Location
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. Santorini, Greece" 
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    className="w-full p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-[var(--text-primary)] outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[var(--text-secondary)] font-bold mb-1">
                    Partner / Owner Group
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. Aura Hospitality" 
                    value={formData.partnerName}
                    onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
                    className="w-full p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-[var(--text-primary)] outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] font-bold mb-1">
                  Main Photo Image URL
                </label>
                <input 
                  type="url" 
                  placeholder="https://images.unsplash.com/..." 
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-[var(--text-primary)] outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] font-bold mb-1">
                  Property Description
                </label>
                <textarea 
                  rows="3" 
                  placeholder="Describe the luxury experience, views, private infinity pools..." 
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-[var(--text-primary)] outline-none font-medium"
                />
              </div>

              <div className="pt-3 border-t border-[var(--border-light)] flex items-center justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-[var(--border-light)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-bold hover:bg-[var(--border-light)] transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary px-6 py-2.5 text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-amber-500/25"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Saving...' : editingHotel ? 'Save Property Edits' : '+ Save & List Property'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </PortalLayout>
  );
};
