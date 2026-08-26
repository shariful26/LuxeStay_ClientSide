import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { PortalLayout } from '../../components/PortalLayout';
import { useWishlist } from '../../context/WishlistContext';
import { HotelCard } from '../../components/HotelCard';

export const WishlistPage = () => {
  const { wishlist } = useWishlist();
  const [hotels, setHotels] = useState([]);

  useEffect(() => {
    fetch('/api/hotels')
      .then(res => res.json())
      .then(data => {
        setHotels(data.filter(h => wishlist.includes(h.id)));
      })
      .catch(() => {});
  }, [wishlist]);

  return (
    <PortalLayout role="customer" title="Saved Wishlist">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)]">My Saved Wishlist</h1>
          <p className="text-xs text-[var(--text-secondary)]">Bookmark your favorite luxury properties for future trips</p>
        </div>
        <span className="badge badge-gold self-start sm:self-auto">{wishlist.length} Saved</span>
      </div>

      {hotels.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-light)] p-6 sm:p-8">
          <Heart className="w-12 h-12 text-rose-500/40 mx-auto" />
          <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">Your wishlist is empty</h3>
          <p className="text-xs text-[var(--text-secondary)]">Click the heart icon on any hotel card to save it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.map(h => (
            <HotelCard key={h.id} hotel={h} />
          ))}
        </div>
      )}
    </PortalLayout>
  );
};
