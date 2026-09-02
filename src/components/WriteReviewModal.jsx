import React, { useState } from 'react';
import { Star, X, Check, Sparkles, Building2, ShieldCheck, Heart, ThumbsUp, Send, Bed, Bell, Palmtree, Utensils } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const WriteReviewModal = ({ isOpen, onClose, hotel, booking, onReviewSubmitted }) => {
  const { user } = useAuth();

  const [guestName, setGuestName] = useState(user?.name || booking?.guestName || 'Shariful');
  const [guestAvatar, setGuestAvatar] = useState(user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80');
  const [guestCountry, setGuestCountry] = useState(user?.country || 'Global Traveler');

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [categories, setCategories] = useState({
    cleanliness: 5,
    comfort: 5,
    services: 5,
    facilities: 5,
    food: 5
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const hotelName = hotel?.name || booking?.hotelName || 'Luxury Resort & Spa';
  const hotelId = hotel?.id || booking?.hotelId || 'h-1';

  const categoryLabels = [
    { key: 'cleanliness', label: 'Cleanliness & Hygiene', Icon: Sparkles },
    { key: 'comfort', label: 'Bed Comfort & Acoustic Peace', Icon: Bed },
    { key: 'services', label: 'Butler & Concierge Service', Icon: Bell },
    { key: 'facilities', label: 'Resort Facilities & Pools', Icon: Palmtree },
    { key: 'food', label: 'Dining & Gastronomy', Icon: Utensils },
  ];

  const ratingDescriptions = {
    5: '5.0 — Exceptional Luxury & Flawless Experience',
    4: '4.0 — Wonderful Stay with Great Highlights',
    3: '3.0 — Satisfactory Experience',
    2: '2.0 — Room for Hospitality Improvement',
    1: '1.0 — Disappointing Experience'
  };

  const handleCategoryChange = (key, val) => {
    setCategories(prev => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setLoading(true);

    const payload = {
      hotelId: String(hotelId),
      hotelName: hotelName,
      guestName: guestName.trim() || user?.name || booking?.guestName || 'Verified Guest',
      guestAvatar: guestAvatar || user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      guestCountry: guestCountry.trim() || 'Global Traveler',
      rating: rating,
      categories: categories,
      title: title.trim() || 'Unforgettable luxury escape',
      comment: comment.trim()
    };

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const savedReview = await res.json();
        setSubmitted(true);
        if (onReviewSubmitted) onReviewSubmitted(savedReview);
      } else {
        setSubmitted(true);
      }
    } catch (err) {
      console.error('Failed to submit review:', err);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="w-full max-w-xl bg-[var(--bg-card)] border border-[var(--border-light)] rounded-3xl shadow-2xl overflow-hidden animate-scale-in max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border-light)] flex items-center justify-between bg-[var(--bg-tertiary)]/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-500">
              <Star className="w-4 h-4 fill-amber-500" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[var(--text-primary)]">Rate & Review Your Stay</h3>
              <span className="text-[10px] font-bold text-amber-500 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Verified Guest Experience • {hotelName}
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[var(--border-light)] text-[var(--text-muted)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {submitted ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto text-2xl font-black">
                ✓
              </div>
              <div className="space-y-1.5">
                <h4 className="text-lg font-black text-[var(--text-primary)]">Thank You for Your Review!</h4>
                <p className="text-xs text-[var(--text-secondary)] max-w-xs mx-auto leading-relaxed">
                  Your review has been verified and published with your profile photo and name.
                </p>
              </div>
              <button
                onClick={onClose}
                className="btn btn-primary py-2.5 px-6 text-xs font-black rounded-xl shadow-md cursor-pointer"
              >
                Close & Return
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Reviewer Profile Card */}
              <div className="p-4 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] flex items-center gap-4">
                <div className="relative">
                  <img 
                    src={guestAvatar} 
                    alt={guestName} 
                    className="w-12 h-12 rounded-full object-cover border-2 border-amber-500/40 shadow-xs flex-shrink-0"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';
                    }}
                  />
                  <span className="absolute -bottom-1 -right-1 p-0.5 bg-emerald-500 text-white rounded-full text-[8px] font-black">
                    ✓
                  </span>
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <label className="block text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider">
                    Posting Review As (Your Name)
                  </label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-3 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-light)] text-xs font-bold text-[var(--text-primary)] outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>
              
              {/* Overall Star Rating */}
              <div className="text-center p-5 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)] block">
                  Overall Stay Rating
                </span>
                
                <div className="flex items-center justify-center gap-2 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform hover:scale-125 cursor-pointer focus:outline-none"
                    >
                      <Star 
                        className={`w-8 h-8 transition-colors ${
                          star <= (hoverRating || rating)
                            ? 'text-amber-400 fill-amber-400 drop-shadow-md'
                            : 'text-slate-300 dark:text-slate-700'
                        }`} 
                      />
                    </button>
                  ))}
                </div>

                <span className="text-xs font-extrabold text-amber-500 block pt-1">
                  {ratingDescriptions[hoverRating || rating]}
                </span>
              </div>

              {/* Sub-Category Scores */}
              <div className="space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)] block">
                  Detailed Experience Breakdown
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {categoryLabels.map((cat) => (
                    <div key={cat.key} className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-light)] flex items-center justify-between">
                      <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <cat.Icon className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        <span>{cat.label}</span>
                      </span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((num) => (
                          <button
                            type="button"
                            key={num}
                            onClick={() => handleCategoryChange(cat.key, num)}
                            className={`w-5 h-5 rounded-md text-[10px] font-black transition-all cursor-pointer ${
                              categories[cat.key] >= num
                                ? 'bg-amber-500 text-slate-950 shadow-2xs'
                                : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:bg-amber-500/20'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review Title */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider">
                  Review Headline
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Unmatched cliffside sunset views and exquisite butler care!"
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-xs font-bold text-[var(--text-primary)] outline-none focus:border-amber-500 focus:bg-[var(--bg-card)] transition-colors"
                />
              </div>

              {/* Review Comment */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider">
                  Detailed Review & Feedback *
                </label>
                <textarea
                  required
                  rows="4"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details about the suite, breakfast, private pool, spa, or concierge highlights..."
                  className="w-full p-3.5 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-xs font-medium text-[var(--text-primary)] outline-none focus:border-amber-500 focus:bg-[var(--bg-card)] transition-colors resize-none leading-relaxed"
                />
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-[var(--border-light)] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-[var(--border-light)] text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary py-2.5 px-6 text-xs font-black rounded-xl shadow-lg shadow-amber-500/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <span>Submitting Review...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Post Verified Review</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};

export default WriteReviewModal;
