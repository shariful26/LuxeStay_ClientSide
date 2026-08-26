import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const userKey = user ? (user.id || user.email) : 'guest';

  const [wishlist, setWishlist] = useState(() => {
    if (!user) return [];
    const saved = localStorage.getItem(`luxestay_wishlist_${userKey}`);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`luxestay_wishlist_${userKey}`);
      setWishlist(saved ? JSON.parse(saved) : []);
    } else {
      setWishlist([]);
    }
  }, [userKey]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`luxestay_wishlist_${userKey}`, JSON.stringify(wishlist));
    }
  }, [wishlist, userKey]);

  const toggleWishlist = (hotelId) => {
    if (!user) {
      alert('Please sign in to save items to your personal wishlist.');
      return;
    }
    setWishlist(prev =>
      prev.includes(hotelId)
        ? prev.filter(id => id !== hotelId)
        : [...prev, hotelId]
    );
  };

  const isInWishlist = (hotelId) => wishlist.includes(hotelId);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
