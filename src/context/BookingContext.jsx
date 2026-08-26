import React, { createContext, useContext, useState } from 'react';

const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const getTomorrowStr = () => new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [bookingDraft, setBookingDraft] = useState({
    hotel: null,
    room: null,
    checkIn: getTodayStr(),
    checkOut: getTomorrowStr(),
    nights: 1,
    guests: 2,
    selectedAddOns: [],
    coupon: null,
    discountAmount: 0
  });

  const [activeVoucher, setActiveVoucher] = useState(null);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);

  const updateBooking = (data) => {
    setBookingDraft(prev => ({ ...prev, ...data }));
  };

  const toggleAddOn = (addOn) => {
    setBookingDraft(prev => {
      const exists = prev.selectedAddOns.find(a => a.name === addOn.name);
      const updated = exists
        ? prev.selectedAddOns.filter(a => a.name !== addOn.name)
        : [...prev.selectedAddOns, addOn];
      return { ...prev, selectedAddOns: updated };
    });
  };

  const applyCoupon = (couponObj) => {
    setBookingDraft(prev => {
      let discount = 0;
      const subtotal = (prev.room?.price || 450) * prev.nights;
      if (couponObj.discountType === 'percentage') {
        discount = Math.round((subtotal * couponObj.discountValue) / 100);
      } else {
        discount = couponObj.discountValue;
      }
      return { ...prev, coupon: couponObj, discountAmount: discount };
    });
  };

  return (
    <BookingContext.Provider value={{
      bookingDraft,
      updateBooking,
      toggleAddOn,
      applyCoupon,
      activeVoucher,
      setActiveVoucher,
      isVoucherModalOpen,
      setIsVoucherModalOpen
    }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => useContext(BookingContext);
