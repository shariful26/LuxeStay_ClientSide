import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, CheckCircle2, Loader2, MapPin, Star, Image, CheckSquare, Upload, X, Users, Bed, Shield, Building2, Sparkles, ShieldCheck } from 'lucide-react';
import { PortalLayout } from '../../components/PortalLayout';
import { useAuth } from '../../context/AuthContext';

const HOTEL_AMENITIES_LIST = [
  "Infinity Pool",
  "Private Beach",
  "Luxury Spa",
  "Free Wi-Fi",
  "Butler Service",
  "Fitness Center",
  "Airport VIP Shuttle",
  "Helipad Access"
];

export const AddEditHotel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    destination: 'Santorini, Greece',
    destinationSlug: 'santorini',
    address: 'Oia Cliffside Drive 12, Santorini, Greece',
    pricePerNight: 450,
    category: 'Resort & Spa',
    starRating: 5,
    capacity: 2,
    bedType: '1 King Bed',
    roomType: 'Deluxe Executive Suite',
    status: 'Active / Available',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    amenities: ["Infinity Pool", "Private Beach", "Luxury Spa", "Free Wi-Fi", "Butler Service"],
    description: ''
  });

  const toggleAmenity = (amenity) => {
    setFormData(prev => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter(a => a !== amenity)
          : [...prev.amenities, amenity]
      };
    });
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const hotelPayload = {
      ...formData,
      partnerId: user?.id || `p_${Date.now()}`,
      partnerEmail: user?.email || '',
      partnerName: user?.name || user?.companyName || 'Aura Hospitality',
      status: 'Pending'
    };

    try {
      await fetch('/api/hotels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hotelPayload)
      });
    } catch (err) {
      console.warn('Error saving partner hotel:', err.message);
    }

    setLoading(false);
    setSubmitted(true);
    setTimeout(() => {
      navigate('/manager/hotels');
    }, 600);
  };

  return (
    <PortalLayout role="manager" title="Hotel Property Editor">
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
        
        {/* Header Navigation & Title */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-[var(--border-light)] pb-4">
          <div>
            <Link to="/manager/hotels" className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-500 hover:underline mb-1">
              <ArrowLeft className="w-4 h-4" /> Back to Property Manager
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] flex items-center gap-2">
              <Building2 className="w-7 h-7 text-amber-500" />
              Add / Edit Hotel Property
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-0.5 font-medium">Configure luxury resort credentials, suite specifications, pricing & media assets</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> 5-Star Listing Standard
            </span>
          </div>
        </div>

        {submitted ? (
          <div className="p-12 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-2xl text-center space-y-4 animate-fade-in max-w-xl mx-auto">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
            <h3 className="text-xl font-bold text-[var(--text-primary)]">Hotel Property Submitted Successfully!</h3>
            <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
              Listing Status: <span className="text-amber-500 font-extrabold">Pending Approval</span>. 
              Your new luxury resort has been saved to database and is ready for activation.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 2 Column Widescreen Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* LEFT COLUMN (7 / 12) - Form Specifications */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Section 1: Property Credentials */}
                <div className="p-6 sm:p-7 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-xl space-y-5">
                  <div className="flex items-center gap-2 border-b border-[var(--border-light)] pb-3">
                    <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xs">1</div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">Property Credentials & Base Pricing</h3>
                  </div>

                  {/* Hotel Name */}
                  <div>
                    <label className="block mb-1.5 text-[var(--text-muted)] uppercase tracking-wider text-[10px] font-bold">Hotel Property Name *</label>
                    <input 
                      type="text" 
                      value={formData.name} 
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                      placeholder="e.g. The Grand Azure Resort & Spa"
                      required 
                      className="w-full p-3.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-[var(--text-primary)] text-xs font-bold outline-none focus:border-amber-500 shadow-inner" 
                    />
                  </div>

                  {/* Destination & Price */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1.5 text-[var(--text-muted)] uppercase tracking-wider text-[10px] font-bold">Destination City / Country *</label>
                      <input 
                        type="text" 
                        value={formData.destination} 
                        onChange={(e) => setFormData({ ...formData, destination: e.target.value })} 
                        required 
                        placeholder="e.g. Santorini, Greece"
                        className="w-full p-3.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-[var(--text-primary)] text-xs font-bold outline-none focus:border-amber-500" 
                      />
                    </div>

                    <div>
                      <label className="block mb-1.5 text-[var(--text-muted)] uppercase tracking-wider text-[10px] font-bold">Nightly Base Rate ($ USD) *</label>
                      <input 
                        type="number" 
                        value={formData.pricePerNight} 
                        onChange={(e) => setFormData({ ...formData, pricePerNight: Number(e.target.value) })} 
                        required 
                        className="w-full p-3.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-[var(--text-primary)] text-xs font-bold outline-none focus:border-amber-500" 
                      />
                    </div>
                  </div>

                  {/* Full Address */}
                  <div>
                    <label className="block mb-1.5 text-[var(--text-muted)] uppercase tracking-wider text-[10px] font-bold flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-500" /> Full Street Address *
                    </label>
                    <input 
                      type="text" 
                      value={formData.address} 
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })} 
                      placeholder="Street Address, City, Zip, Country"
                      required 
                      className="w-full p-3.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-[var(--text-primary)] text-xs font-bold outline-none focus:border-amber-500" 
                    />
                  </div>

                  {/* Category & Star Rating */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1.5 text-[var(--text-muted)] uppercase tracking-wider text-[10px] font-bold">Property Category *</label>
                      <select 
                        value={formData.category} 
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })} 
                        className="w-full p-3.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-[var(--text-primary)] text-xs font-bold outline-none cursor-pointer"
                      >
                        <option value="Resort & Spa" className="bg-[var(--bg-card)]">Resort & Spa</option>
                        <option value="Overwater Villa" className="bg-[var(--bg-card)]">Overwater Villa</option>
                        <option value="City Luxury Hotel" className="bg-[var(--bg-card)]">City Luxury Hotel</option>
                        <option value="Boutique Ryokan" className="bg-[var(--bg-card)]">Boutique Ryokan</option>
                        <option value="Ski Resort" className="bg-[var(--bg-card)]">Ski Resort</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1.5 text-[var(--text-muted)] uppercase tracking-wider text-[10px] font-bold flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-500" /> Star Rating Class *
                      </label>
                      <select 
                        value={formData.starRating} 
                        onChange={(e) => setFormData({ ...formData, starRating: Number(e.target.value) })} 
                        className="w-full p-3.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-[var(--text-primary)] text-xs font-bold outline-none cursor-pointer"
                      >
                        <option value={5} className="bg-[var(--bg-card)]">⭐⭐⭐⭐⭐ 5-Star Ultra Luxury</option>
                        <option value={4} className="bg-[var(--bg-card)]">⭐⭐⭐⭐ 4-Star Premium Hotel</option>
                        <option value={3} className="bg-[var(--bg-card)]">⭐⭐⭐ 3-Star Comfort Hotel</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 2: Suite Specifications & Availability */}
                <div className="p-6 sm:p-7 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-xl space-y-5">
                  <div className="flex items-center gap-2 border-b border-[var(--border-light)] pb-3">
                    <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xs">2</div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">Suite Specifications & Availability Status</h3>
                  </div>

                  {/* Guest Capacity & Bed Configuration */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1.5 text-[var(--text-muted)] uppercase tracking-wider text-[10px] font-bold flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-amber-500" /> Guest Capacity (Per Suite) *
                      </label>
                      <input 
                        type="number" 
                        min="1"
                        max="20"
                        value={formData.capacity} 
                        onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })} 
                        placeholder="e.g. 2 Guests"
                        required 
                        className="w-full p-3.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-[var(--text-primary)] text-xs font-bold outline-none" 
                      />
                    </div>

                    <div>
                      <label className="block mb-1.5 text-[var(--text-muted)] uppercase tracking-wider text-[10px] font-bold flex items-center gap-1">
                        <Bed className="w-3.5 h-3.5 text-amber-500" /> Bed Configuration *
                      </label>
                      <input 
                        type="text" 
                        value={formData.bedType} 
                        onChange={(e) => setFormData({ ...formData, bedType: e.target.value })} 
                        placeholder="e.g. 1 King Bed or 2 Double Beds"
                        required 
                        className="w-full p-3.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-[var(--text-primary)] text-xs font-bold outline-none" 
                      />
                    </div>
                  </div>

                  {/* Primary Suite Type & Listing Availability Status */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1.5 text-[var(--text-muted)] uppercase tracking-wider text-[10px] font-bold">Primary Suite Category *</label>
                      <select 
                        value={formData.roomType} 
                        onChange={(e) => setFormData({ ...formData, roomType: e.target.value })} 
                        className="w-full p-3.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-[var(--text-primary)] text-xs font-bold outline-none cursor-pointer"
                      >
                        <option value="Deluxe Executive Suite" className="bg-[var(--bg-card)]">Deluxe Executive Suite</option>
                        <option value="Presidential Lagoon Villa" className="bg-[var(--bg-card)]">Presidential Lagoon Villa</option>
                        <option value="Oceanfront Sunset Pavilion" className="bg-[var(--bg-card)]">Oceanfront Sunset Pavilion</option>
                        <option value="Penthouse Skyline Suite" className="bg-[var(--bg-card)]">Penthouse Skyline Suite</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1.5 text-[var(--text-muted)] uppercase tracking-wider text-[10px] font-bold flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5 text-emerald-500" /> Listing Availability Status *
                      </label>
                      <select 
                        value={formData.status} 
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })} 
                        className="w-full p-3.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-[var(--text-primary)] text-xs font-bold outline-none cursor-pointer"
                      >
                        <option value="Active / Available" className="bg-[var(--bg-card)] text-emerald-500 font-bold">🟢 Active / Instant Booking Enabled</option>
                        <option value="Pending Approval" className="bg-[var(--bg-card)] text-amber-500 font-bold">🟡 Pending Approval</option>
                        <option value="Booked / Maintenance" className="bg-[var(--bg-card)] text-rose-500 font-bold">🔴 Booked / Under Maintenance</option>
                      </select>
                    </div>
                  </div>

                  {/* Property Description */}
                  <div>
                    <label className="block mb-1.5 text-[var(--text-muted)] uppercase tracking-wider text-[10px] font-bold">Property Description & Luxury Amenities Overview</label>
                    <textarea 
                      rows="4" 
                      value={formData.description} 
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                      placeholder="Describe your luxury resort experience, Michelin dining options, location benefits..."
                      className="w-full p-3.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-[var(--text-primary)] text-xs font-medium outline-none focus:border-amber-500"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN (5 / 12) - Media, Amenities & Submit Action */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Section 3: Visual Cover Asset */}
                <div className="p-6 sm:p-7 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-xl space-y-4">
                  <div className="flex items-center gap-2 border-b border-[var(--border-light)] pb-3">
                    <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xs">3</div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">Property Photo Asset</h3>
                  </div>

                  {/* Cover Photo File Upload Dropzone */}
                  <div>
                    <label className="block mb-2 text-[var(--text-muted)] uppercase tracking-wider text-[10px] font-bold flex items-center gap-1">
                      <Upload className="w-3.5 h-3.5 text-amber-500" /> Property Cover Photo File *
                    </label>
                    
                    {formData.image ? (
                      <div className="relative rounded-2xl overflow-hidden border border-[var(--border-light)] group h-56 bg-[var(--bg-tertiary)] shadow-xl">
                        <img src={formData.image} alt="Hotel Cover Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-slate-950/75 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <label className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs cursor-pointer hover:bg-amber-400 flex items-center gap-1.5 shadow-lg transition-transform hover:scale-105">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Change Photo</span>
                            <input type="file" accept="image/*" onChange={handlePhotoFileUpload} className="hidden" />
                          </label>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, image: '' })}
                            className="px-3 py-2 rounded-xl bg-rose-500 text-white font-bold text-xs hover:bg-rose-600 flex items-center gap-1 shadow-lg cursor-pointer transition-transform hover:scale-105"
                          >
                            <X className="w-3.5 h-3.5" /> Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-48 rounded-2xl border-2 border-dashed border-amber-500/40 hover:border-amber-500 bg-[var(--bg-tertiary)] cursor-pointer transition-all hover:bg-amber-500/5 group shadow-inner">
                        <div className="flex flex-col items-center justify-center space-y-2.5 text-center p-4">
                          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                            <Upload className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-xs font-extrabold text-[var(--text-primary)]">Click to Select & Upload Photo File</p>
                            <p className="text-[10px] text-[var(--text-muted)] mt-0.5 font-medium">JPG, PNG, WEBP (Auto-optimized Data URL)</p>
                          </div>
                        </div>
                        <input type="file" accept="image/*" onChange={handlePhotoFileUpload} className="hidden" />
                      </label>
                    )}

                    {/* Fallback URL Input */}
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-[10px] text-[var(--text-muted)] font-mono">Or URL:</span>
                      <input
                        type="text"
                        value={formData.image.startsWith('data:') ? '' : formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                        className="flex-1 p-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-[10px] text-[var(--text-primary)] font-mono outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 4: Signature Amenities & Facilities */}
                <div className="p-6 sm:p-7 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-xl space-y-4">
                  <div className="flex items-center gap-2 border-b border-[var(--border-light)] pb-3">
                    <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xs">4</div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">Signature Amenities & Facilities</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {HOTEL_AMENITIES_LIST.map((item, idx) => {
                      const isChecked = formData.amenities.includes(item);
                      return (
                        <div
                          key={idx}
                          onClick={() => toggleAmenity(item)}
                          className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2 transition-all ${
                            isChecked
                              ? 'border-amber-500 bg-amber-500/10 text-amber-500 font-extrabold shadow-sm'
                              : 'border-[var(--border-light)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:border-amber-500/40'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="accent-amber-500 pointer-events-none"
                          />
                          <span className="text-[11px] font-bold">{item}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Section 5: Save Action Bar */}
                <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-amber-500/30 shadow-2xl space-y-4">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full btn btn-primary py-4 text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 shadow-xl shadow-amber-500/25 transition-transform hover:scale-[1.02]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Saving Hotel Property...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Hotel Property Listing</span>
                      </>
                    )}
                  </button>
                </div>

              </div>

            </div>
          </form>
        )}
      </div>
    </PortalLayout>
  );
};
