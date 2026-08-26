import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import { WishlistProvider } from './context/WishlistContext';

import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { VoucherModal } from './components/VoucherModal';

// Public Pages (1-14)
import { Home } from './pages/public/Home';
import { HotelsCatalog } from './pages/public/HotelsCatalog';
import { HotelDetail } from './pages/public/HotelDetail';
import { RoomDetail } from './pages/public/RoomDetail';
import { Destinations } from './pages/public/Destinations';
import { DestinationDetail } from './pages/public/DestinationDetail';
import { OffersDeals } from './pages/public/OffersDeals';
import { AboutUs } from './pages/public/AboutUs';
import { ContactUs } from './pages/public/ContactUs';
import { BlogList } from './pages/public/BlogList';
import { BlogDetail } from './pages/public/BlogDetail';
import { FAQ } from './pages/public/FAQ';
import { TermsConditions } from './pages/public/TermsConditions';
import { PrivacyPolicy } from './pages/public/PrivacyPolicy';

// Customer Pages (15-22)
import { Login } from './pages/customer/Login';
import { Register } from './pages/customer/Register';
import { ForgotPassword } from './pages/customer/ForgotPassword';
import { CustomerDashboard } from './pages/customer/CustomerDashboard';
import { MyBookings } from './pages/customer/MyBookings';
import { BookingDetail } from './pages/customer/BookingDetail';
import { WishlistPage } from './pages/customer/WishlistPage';
import { CustomerProfile } from './pages/customer/CustomerProfile';

// Partner Pages (23-27)
import { PartnerDashboard } from './pages/partner/PartnerDashboard';
import { MyHotels } from './pages/partner/MyHotels';
import { AddEditHotel } from './pages/partner/AddEditHotel';
import { RoomManagement } from './pages/partner/RoomManagement';
import { PartnerBookings } from './pages/partner/PartnerBookings';
import { PartnerWallet } from './pages/partner/PartnerWallet';
import { PartnerMessages } from './pages/partner/PartnerMessages';
import { PartnerReviews } from './pages/partner/PartnerReviews';
import { PartnerHousekeeping } from './pages/partner/PartnerHousekeeping';
import { PartnerInventory } from './pages/partner/PartnerInventory';
import { PartnerCalendar } from './pages/partner/PartnerCalendar';
import { PartnerConcierge } from './pages/partner/PartnerConcierge';

// Admin Pages (28-32)
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { HotelsManagement } from './pages/admin/HotelsManagement';
import { RoomsManagement } from './pages/admin/RoomsManagement';
import { BookingsManagement } from './pages/admin/BookingsManagement';
import { UsersManagement } from './pages/admin/UsersManagement';
import { AdminPayouts } from './pages/admin/AdminPayouts';
import { AdminPaymentSettings } from './pages/admin/AdminPaymentSettings';
import { AdminLogin } from './pages/admin/AdminLogin';

export function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <CurrencyProvider>
          <AuthProvider>
            <BookingProvider>
              <WishlistProvider>
                <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                  <div className="min-h-screen flex flex-col justify-between">
                    <Navbar />
                    <main className="flex-1">
                      <Routes>
                        {/* Public Pages */}
                        <Route path="/" element={<Home />} />
                        <Route path="/hotels" element={<HotelsCatalog />} />
                        <Route path="/hotels/:id" element={<HotelDetail />} />
                        <Route path="/rooms/:id" element={<RoomDetail />} />
                        <Route path="/destinations" element={<Destinations />} />
                        <Route path="/destinations/:slug" element={<DestinationDetail />} />
                        <Route path="/offers" element={<OffersDeals />} />
                        <Route path="/about" element={<AboutUs />} />
                        <Route path="/contact" element={<ContactUs />} />
                        <Route path="/blog" element={<BlogList />} />
                        <Route path="/blog/:slug" element={<BlogDetail />} />
                        <Route path="/faq" element={<FAQ />} />
                        <Route path="/terms" element={<TermsConditions />} />
                        <Route path="/privacy" element={<PrivacyPolicy />} />

                        {/* Customer Pages */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/customer/dashboard" element={<CustomerDashboard />} />
                        <Route path="/customer/bookings" element={<MyBookings />} />
                        <Route path="/customer/bookings/:id" element={<BookingDetail />} />
                        <Route path="/customer/wishlist" element={<WishlistPage />} />
                        <Route path="/customer/settings" element={<CustomerProfile role="customer" mode="profile" />} />
                        <Route path="/customer/password" element={<CustomerProfile role="customer" mode="password" />} />

                        {/* Partner Pages */}
                        <Route path="/partner/dashboard" element={<PartnerDashboard />} />
                        <Route path="/partner/hotels" element={<MyHotels />} />
                        <Route path="/partner/hotels/new" element={<AddEditHotel />} />
                        <Route path="/partner/hotels/:id/edit" element={<AddEditHotel />} />
                        <Route path="/partner/rooms" element={<RoomManagement />} />
                        <Route path="/partner/bookings" element={<PartnerBookings />} />
                        <Route path="/partner/wallet" element={<PartnerWallet />} />
                        <Route path="/partner/messages" element={<PartnerMessages />} />
                        <Route path="/partner/reviews" element={<PartnerReviews />} />
                        <Route path="/partner/housekeeping" element={<PartnerHousekeeping />} />
                        <Route path="/partner/inventory" element={<PartnerInventory />} />
                        <Route path="/partner/calendar" element={<PartnerCalendar />} />
                        <Route path="/partner/concierge" element={<PartnerConcierge />} />
                        <Route path="/partner/settings" element={<CustomerProfile role="partner" mode="profile" />} />
                        <Route path="/partner/password" element={<CustomerProfile role="partner" mode="password" />} />

                        {/* Admin Pages */}
                        <Route path="/admin/login" element={<AdminLogin />} />
                        <Route path="/admin/dashboard" element={<AdminDashboard />} />
                        <Route path="/admin/hotels" element={<HotelsManagement />} />
                        <Route path="/admin/rooms" element={<RoomsManagement />} />
                        <Route path="/admin/bookings" element={<BookingsManagement />} />
                        <Route path="/admin/users" element={<UsersManagement />} />
                        <Route path="/admin/payouts" element={<AdminPayouts />} />
                        <Route path="/admin/payment-settings" element={<AdminPaymentSettings />} />
                        <Route path="/admin/settings" element={<CustomerProfile role="admin" mode="profile" />} />
                        <Route path="/admin/password" element={<CustomerProfile role="admin" mode="password" />} />
                      </Routes>
                    </main>
                    <Footer />
                    <AuthModal />
                    <VoucherModal />
                  </div>
                </Router>
              </WishlistProvider>
            </BookingProvider>
          </AuthProvider>
        </CurrencyProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
