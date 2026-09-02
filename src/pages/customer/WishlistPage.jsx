import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { PortalLayout } from '../../components/PortalLayout';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { HotelCard } from '../../components/HotelCard';

export const WishlistPage = () => {
  const { wishlist } = useWishlist();
  const { user } = useAuth();
  const location = useLocation();
  const [hotels, setHotels] = useState([]);

  // Detect which dashboard portal we are currently in
  let portalRole = 'customer';
  if (location.pathname.startsWith('/admin') || user?.role === 'admin') {
    portalRole = 'admin';
  } else if (location.pathname.startsWith('/manager') || location.pathname.startsWith('/partner') || user?.role === 'manager') {
    portalRole = 'manager';
  }

  useEffect(() => {
    fetch('/api/hotels')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setHotels(data.filter(h => wishlist.includes(h.id)));
        }
      })
      .catch(() => {});
  }, [wishlist]);

  const safeHotels = Array.isArray(hotels) ? hotels : [];

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const totalPages = Math.ceil(safeHotels.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentHotels = safeHotels.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    setCurrentPage(1);
  }, [wishlist]);

  return (
    <PortalLayout role={portalRole} title="Saved Wishlist" subtitle="Your favorite luxury sanctuaries saved for future journeys.">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)]">My Saved Wishlist</h1>
          <p className="text-xs text-[var(--text-secondary)]">Bookmark your favorite luxury properties for future trips</p>
        </div>
        <span className="badge badge-gold self-start sm:self-auto">{wishlist.length} Saved</span>
      </div>

      {safeHotels.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-light)] p-6 sm:p-8">
          <Heart className="w-12 h-12 text-rose-500/40 mx-auto" />
          <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">Your wishlist is empty</h3>
          <p className="text-xs text-[var(--text-secondary)]">Click the heart icon on any hotel card to save it here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentHotels.map(h => (
              <HotelCard key={h.id} hotel={h} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-[var(--border-light)] text-xs font-bold text-[var(--text-secondary)]">
              <span>
                Showing <strong className="text-[var(--text-primary)]">{indexOfFirstItem + 1}</strong>–<strong className="text-[var(--text-primary)]">{Math.min(indexOfLastItem, safeHotels.length)}</strong> of <strong className="text-[var(--text-primary)]">{safeHotels.length}</strong> Saved Hotels
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-xl border border-[var(--border-light)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all font-bold"
                >
                  Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center justify-center ${
                      currentPage === pageNum
                        ? 'bg-amber-500 text-white shadow-xs scale-105'
                        : 'bg-[var(--bg-card)] border border-[var(--border-light)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-xl border border-[var(--border-light)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all font-bold"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </PortalLayout>
  );
};
