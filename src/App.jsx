import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import { WishlistProvider } from './context/WishlistContext';
import { MessageProvider } from './context/MessageContext';
import { ToastProvider } from './context/ToastContext';

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
import { NotFound } from './pages/public/NotFound';

// Customer Pages (15-22)
import { Login } from './pages/customer/Login';
import { Register } from './pages/customer/Register';
import { ForgotPassword } from './pages/customer/ForgotPassword';
import { CustomerDashboard } from './pages/customer/CustomerDashboard';
import { MyBookings } from './pages/customer/MyBookings';
import { BookingDetail } from './pages/customer/BookingDetail';
import { WishlistPage } from './pages/customer/WishlistPage';
import { CustomerProfile } from './pages/customer/CustomerProfile';
import { CustomerMessages } from './pages/customer/CustomerMessages';

// Hotel Manager Pages (23-27)
import { ManagerDashboard } from './pages/manager/ManagerDashboard';
import { MyHotels } from './pages/manager/MyHotels';
import { AddEditHotel } from './pages/manager/AddEditHotel';
import { RoomManagement } from './pages/manager/RoomManagement';
import { ManagerBookings } from './pages/manager/ManagerBookings';
import { ManagerWallet } from './pages/manager/ManagerWallet';
import { ManagerMessages } from './pages/manager/ManagerMessages';
import { ManagerReviews } from './pages/manager/ManagerReviews';
import { ManagerHousekeeping } from './pages/manager/ManagerHousekeeping';
import { ManagerInventory } from './pages/manager/ManagerInventory';
import { ManagerCalendar } from './pages/manager/ManagerCalendar';
import { ManagerConcierge } from './pages/manager/ManagerConcierge';

// Admin Pages (28-32)
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { HotelsManagement } from './pages/admin/HotelsManagement';
import { RoomsManagement } from './pages/admin/RoomsManagement';
import { BookingsManagement } from './pages/admin/BookingsManagement';
import { UsersManagement } from './pages/admin/UsersManagement';
import { AdminPayouts } from './pages/admin/AdminPayouts';
import { AdminPaymentSettings } from './pages/admin/AdminPaymentSettings';
import { AdminLogin } from './pages/admin/AdminLogin';

function AppContent() {
  const location = useLocation();
  const isPortalRoute = 
    location.pathname.startsWith('/manager') || 
    location.pathname.startsWith('/partner') || 
    (location.pathname.startsWith('/admin') && location.pathname !== '/admin/login') ||
    location.pathname.startsWith('/customer/dashboard') ||
    location.pathname.startsWith('/customer/bookings') ||
    location.pathname.startsWith('/customer/messages') ||
    location.pathname.startsWith('/customer/wishlist') ||
    location.pathname.startsWith('/customer/settings') ||
    location.pathname.startsWith('/customer/password');

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {!isPortalRoute && <Navbar />}
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
          <Route path="/customer/messages" element={<CustomerMessages />} />
          <Route path="/customer/wishlist" element={<WishlistPage />} />
          <Route path="/customer/settings" element={<CustomerProfile role="customer" mode="profile" />} />
          <Route path="/customer/password" element={<CustomerProfile role="customer" mode="password" />} />

          {/* Hotel Manager Pages */}
          <Route path="/manager/dashboard" element={<ManagerDashboard />} />
          <Route path="/manager/hotels" element={<MyHotels />} />
          <Route path="/manager/hotels/new" element={<AddEditHotel />} />
          <Route path="/manager/hotels/:id/edit" element={<AddEditHotel />} />
          <Route path="/manager/rooms" element={<RoomManagement />} />
          <Route path="/manager/bookings" element={<ManagerBookings />} />
          <Route path="/manager/wallet" element={<ManagerWallet />} />
          <Route path="/manager/messages" element={<ManagerMessages />} />
          <Route path="/manager/reviews" element={<ManagerReviews />} />
          <Route path="/manager/housekeeping" element={<ManagerHousekeeping />} />
          <Route path="/manager/inventory" element={<ManagerInventory />} />
          <Route path="/manager/calendar" element={<ManagerCalendar />} />
          <Route path="/manager/concierge" element={<ManagerConcierge />} />
          <Route path="/manager/wishlist" element={<WishlistPage />} />
          <Route path="/manager/settings" element={<CustomerProfile role="manager" mode="profile" />} />
          <Route path="/manager/password" element={<CustomerProfile role="manager" mode="password" />} />

          {/* Backward Compatibility Aliases */}
          <Route path="/partner/dashboard" element={<ManagerDashboard />} />
          <Route path="/partner/hotels" element={<MyHotels />} />
          <Route path="/partner/hotels/new" element={<AddEditHotel />} />
          <Route path="/partner/hotels/:id/edit" element={<AddEditHotel />} />
          <Route path="/partner/rooms" element={<RoomManagement />} />
          <Route path="/partner/bookings" element={<ManagerBookings />} />
          <Route path="/partner/wallet" element={<ManagerWallet />} />
          <Route path="/partner/messages" element={<ManagerMessages />} />
          <Route path="/partner/reviews" element={<ManagerReviews />} />
          <Route path="/partner/housekeeping" element={<ManagerHousekeeping />} />
          <Route path="/partner/inventory" element={<ManagerInventory />} />
          <Route path="/partner/calendar" element={<ManagerCalendar />} />
          <Route path="/partner/concierge" element={<ManagerConcierge />} />
          <Route path="/partner/wishlist" element={<WishlistPage />} />
          <Route path="/partner/settings" element={<CustomerProfile role="manager" mode="profile" />} />
          <Route path="/partner/password" element={<CustomerProfile role="manager" mode="password" />} />

          {/* Admin Pages */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/hotels" element={<HotelsManagement />} />
          <Route path="/admin/rooms" element={<RoomsManagement />} />
          <Route path="/admin/bookings" element={<BookingsManagement />} />
          <Route path="/admin/users" element={<UsersManagement />} />
          <Route path="/admin/payouts" element={<AdminPayouts />} />
          <Route path="/admin/payment-settings" element={<AdminPaymentSettings />} />
          <Route path="/admin/wishlist" element={<WishlistPage />} />
          <Route path="/admin/settings" element={<CustomerProfile role="admin" mode="profile" />} />
          <Route path="/admin/password" element={<CustomerProfile role="admin" mode="password" />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isPortalRoute && <Footer />}
      <AuthModal />
      <VoucherModal />
    </div>
  );
}
 
export function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <CurrencyProvider>
          <AuthProvider>
            <ToastProvider>
              <BookingProvider>
                <WishlistProvider>
                  <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <MessageProvider>
                      <AppContent />
                    </MessageProvider>
                  </Router>
                </WishlistProvider>
              </BookingProvider>
            </ToastProvider>
          </AuthProvider>
        </CurrencyProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
