import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Menu, Bell, Heart, Search, MessageSquare, Globe, Home, User, LogOut, CheckCircle2, Building2, Calendar, ShieldCheck, ChevronDown, Check, ArrowRight 
} from 'lucide-react';
import { CustomerSidebar } from './CustomerSidebar';
import { AdminSidebar } from './AdminSidebar';
import { ManagerSidebar } from './ManagerSidebar';
import { PortalFooter } from './PortalFooter';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';

export const PortalLayout = ({ role = 'customer', title = 'Portal', children }) => {
  const navigate = useNavigate();
  const { user, logout, switchRole, authLoading } = useAuth();
  const { wishlist } = useWishlist();
  const safeWishlist = Array.isArray(wishlist) ? wishlist : [];

  // Strict Auth & Role Guard Protection (Waits for session check on refresh)
  useEffect(() => {
    if (authLoading) return; // Wait until initial stored auth is read!
    if (!user) {
      if (role === 'admin') navigate('/admin/login', { replace: true });
      else navigate('/login', { replace: true });
    } else if (role === 'admin' && user.role !== 'admin') {
      navigate('/admin/login', { replace: true });
    } else if (role === 'manager' && user.role !== 'manager' && user.role !== 'admin') {
      navigate('/login', { replace: true });
    } else if (user?.role === 'manager' && role === 'customer') {
      navigate('/manager/dashboard', { replace: true });
    } else if (user?.role === 'admin' && role === 'customer') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, role, authLoading, navigate]);

  // Sidebar Controls
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Topbar Dropdown & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Real-Time Notifications State
  const [notifications, setNotifications] = useState([]);

  // Fetch live notifications from real server database (with small limit to minimize bandwidth)
  useEffect(() => {
    const fetchLiveNotifications = async () => {
      try {
        const [bkRes, revRes] = await Promise.all([
          fetch(`/api/bookings?limit=3${role === 'customer' && user?.id ? `&userId=${encodeURIComponent(user.id)}` : ''}`),
          fetch('/api/reviews?limit=2&scope=all')
        ]);
        const bks = await bkRes.json();
        const revs = await revRes.json();
        const readIds = JSON.parse(localStorage.getItem('luxestay_read_notif_ids') || '[]');
        const isAllRead = localStorage.getItem('luxestay_notifs_read') === 'true';

        const liveNotifs = [];
        if (Array.isArray(bks) && bks.length > 0) {
          bks.slice(0, 3).forEach((b, idx) => {
            const notifId = `bk_${b.id || idx}`;
            liveNotifs.push({
              id: notifId,
              title: `Booking: ${b.guestName || 'VIP Guest'}`,
              desc: `${b.roomName || 'Luxury Suite'} • ${b.hotelName || 'Resort'}`,
              time: b.createdAt ? new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent',
              read: isAllRead || readIds.includes(notifId),
              link: role === 'admin' ? '/admin/bookings' : role === 'manager' ? '/manager/bookings' : '/customer/bookings'
            });
          });
        }
        if (Array.isArray(revs) && revs.length > 0) {
          revs.slice(0, 2).forEach((r, idx) => {
            const notifId = `rev_${r.id || idx}`;
            liveNotifs.push({
              id: notifId,
              title: `New ${r.rating || 5}-Star Review`,
              desc: `${r.guestName || 'Customer'} reviewed ${r.hotelName || 'Property'}`,
              time: r.date || 'Recent',
              read: isAllRead || readIds.includes(notifId),
              link: role === 'admin' ? '/admin/dashboard' : role === 'manager' ? '/manager/reviews' : '/'
            });
          });
        }
        setNotifications(liveNotifs);
      } catch (e) {}
    };
    fetchLiveNotifications();
  }, [role, user?.id]);

  // Hotel Search Preview Results
  const [matchingHotels, setMatchingHotels] = useState([]);

  // Outside click handlers
  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch hotels for live search bar (Debounced 300ms + server-side search query + limit 5)
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setMatchingHotels([]);
      setIsSearchDropdownOpen(false);
      return;
    }

    const timer = setTimeout(() => {
      fetch(`/api/hotels?search=${encodeURIComponent(trimmed)}&limit=5&fields=compact`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setMatchingHotels(data.slice(0, 5));
            setIsSearchDropdownOpen(true);
          }
        })
        .catch(() => setMatchingHotels([]));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/hotels?destination=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchDropdownOpen(false);
    }
  };

  const handleMarkAllRead = (e) => {
    if (e) e.stopPropagation();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    localStorage.setItem('luxestay_notifs_read', 'true');
    localStorage.setItem('luxestay_read_notif_ids', JSON.stringify(['n1', 'n2', 'n3']));
  };

  const handleNotificationClick = (nId) => {
    setNotifications(prev => {
      const updated = prev.map(item => item.id === nId ? { ...item, read: true } : item);
      const readIds = updated.filter(item => item.read).map(item => item.id);
      localStorage.setItem('luxestay_read_notif_ids', JSON.stringify(readIds));
      if (updated.every(item => item.read)) {
        localStorage.setItem('luxestay_notifs_read', 'true');
      }
      return updated;
    });
    setIsNotificationsOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(prev => !prev);
    } else {
      setSidebarCollapsed(prev => !prev);
    }
  };

  const unreadNotifCount = notifications.filter(n => !n.read).length;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
          <span className="text-[11px] font-black text-[var(--text-muted)] tracking-widest uppercase">Loading Session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex animate-fade-in relative overflow-x-hidden">
      
      {/* 1. SIDEBAR SELECTION */}
      {role === 'customer' && (
        <CustomerSidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
          isCollapsed={sidebarCollapsed} 
        />
      )}
      {role === 'admin' && (
        <AdminSidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
          isCollapsed={sidebarCollapsed} 
        />
      )}
      {role === 'manager' && (
        <ManagerSidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
          isCollapsed={sidebarCollapsed} 
        />
      )}

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden w-full">
        
        {/* TOP HEADER BAR */}
        <header className="h-16 sm:h-20 bg-[var(--bg-card)] border-b border-[var(--border-light)] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40 shadow-xs w-full">
          
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <button 
              onClick={toggleSidebar} 
              className="p-2 rounded-xl border border-[var(--border-light)] hover:bg-[var(--bg-tertiary)] flex-shrink-0 transition-colors cursor-pointer"
              aria-label="Toggle Sidebar Menu"
            >
              <Menu className="w-5 h-5 text-[var(--text-primary)]" />
            </button>

            {/* DIRECT MAIN WEBSITE HOME BUTTON */}
            <Link 
              to="/" 
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 text-amber-500 hover:bg-amber-500 hover:text-white border border-amber-500/30 transition-all text-xs font-extrabold shadow-xs flex-shrink-0"
              title="Go to Main Website Home"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>

            <h1 className="font-sans text-base sm:text-xl font-extrabold text-[var(--text-primary)] truncate max-w-[140px] xs:max-w-[220px] sm:max-w-none">
              {title === 'Partner Portal' || title === 'Manager Portal' ? 'Hotel Manager Hub' : title}
            </h1>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 flex-shrink-0">
            
            {/* 1. TOPBAR SEARCH INPUT WITH LIVE DROPDOWN POPUP */}
            <div ref={searchRef} className="relative hidden lg:block">
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] w-56 lg:w-64 text-xs font-semibold focus-within:border-amber-500 transition-all">
                <input 
                  type="text" 
                  placeholder="Search hotels, destinations..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => { if (searchQuery.trim()) setIsSearchDropdownOpen(true); }}
                  className="w-full bg-transparent outline-none text-[var(--text-primary)]" 
                />
                <button type="submit" className="text-amber-500 hover:text-amber-600 cursor-pointer">
                  <Search className="w-4 h-4 flex-shrink-0" />
                </button>
              </form>

              {/* Search Live Autocomplete Popup Dropdown */}
              {isSearchDropdownOpen && (
                <div className="absolute top-12 left-0 right-0 z-50 p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-2xl space-y-2 text-xs animate-fade-in">
                  <div className="text-[10px] font-extrabold uppercase text-[var(--text-muted)] tracking-wider px-2">
                    Matching Luxury Properties ({matchingHotels.length})
                  </div>
                  {matchingHotels.length === 0 ? (
                    <div className="p-3 text-center text-[var(--text-muted)] font-medium">No matching hotels found</div>
                  ) : (
                    <div className="space-y-1">
                      {matchingHotels.map(h => (
                        <Link 
                          key={h.id}
                          to={`/hotels/${h.slug || h.id}`}
                          onClick={() => setIsSearchDropdownOpen(false)}
                          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors"
                        >
                          <img src={h.images?.[0]} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                          <div className="min-w-0">
                            <h4 className="font-bold text-[var(--text-primary)] truncate">{h.name}</h4>
                            <span className="text-[10px] text-amber-500 font-semibold block">{h.destination}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                  <button 
                    onClick={handleSearchSubmit} 
                    className="w-full text-center py-2 text-[11px] font-bold text-amber-500 hover:underline border-t border-[var(--border-light)] pt-2 cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>View All Search Results</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Quick Action Icons */}
            <div className="flex items-center gap-2 sm:gap-3">
              


              {/* 2. NOTIFICATIONS BELL WITH INTERACTIVE DROPDOWN */}
              <div 
                ref={notifRef} 
                className="hidden md:block relative"
              >
                <button 
                  onClick={() => setIsNotificationsOpen(prev => !prev)}
                  className="p-2.5 rounded-xl border border-[var(--border-light)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:border-amber-500 transition-colors relative cursor-pointer flex items-center justify-center !overflow-visible"
                  title="Notifications"
                >
                  <Bell className="w-4.5 h-4.5 text-amber-500" />
                  {unreadNotifCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] px-1 rounded-full bg-rose-600 text-white text-[11px] font-extrabold flex items-center justify-center border-2 border-[var(--bg-card)] shadow-md z-30 pointer-events-none">
                      {unreadNotifCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown Popup */}
                {isNotificationsOpen && (
                  <div className="absolute top-12 right-0 w-80 sm:w-96 z-50 p-4 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-2xl space-y-3 text-xs animate-fade-in">
                    <div className="flex items-center justify-between pb-3 border-b border-[var(--border-light)]">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-amber-500" />
                        <h3 className="font-extrabold text-[var(--text-primary)] text-sm">Notifications</h3>
                      </div>
                      {unreadNotifCount > 0 && (
                        <button 
                          onClick={handleMarkAllRead} 
                          className="text-[10px] font-bold text-amber-500 hover:underline cursor-pointer"
                        >
                          Mark All Read
                        </button>
                      )}
                    </div>

                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {notifications.map(n => (
                        <Link 
                          key={n.id}
                          to={n.link}
                          onClick={() => handleNotificationClick(n.id)}
                          className={`p-3 rounded-2xl border block transition-all ${
                            n.read 
                              ? 'bg-[var(--bg-tertiary)] border-[var(--border-light)] text-[var(--text-secondary)]' 
                              : 'bg-amber-500/10 border-amber-500/30 text-[var(--text-primary)]'
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold mb-0.5">
                            <span>{n.title}</span>
                            <span className="text-[10px] text-[var(--text-muted)] font-normal">{n.time}</span>
                          </div>
                          <p className="text-[11px] leading-relaxed text-[var(--text-secondary)]">{n.desc}</p>
                        </Link>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-[var(--border-light)] text-center">
                      <Link 
                        to={role === 'admin' ? '/admin/bookings' : role === 'manager' ? '/manager/bookings' : '/customer/bookings'}
                        onClick={() => setIsNotificationsOpen(false)}
                        className="text-[11px] font-bold text-amber-500 hover:underline inline-flex items-center gap-1"
                      >
                        <span>View Full Reservations Activity</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Wishlist Link (Available on all dashboards) */}
              <Link 
                to={role === 'manager' || user?.role === 'manager' ? '/manager/wishlist' : role === 'admin' || user?.role === 'admin' ? '/admin/wishlist' : '/customer/wishlist'} 
                className="hidden md:flex p-2 rounded-xl border border-[var(--border-light)] bg-[var(--bg-tertiary)] hover:border-amber-500 text-[var(--text-primary)] transition-colors relative cursor-pointer" 
                title="My Wishlist"
              >
                <Heart className="w-4 h-4 text-rose-500" />
                {safeWishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-extrabold flex items-center justify-center">
                    {safeWishlist.length}
                  </span>
                )}
              </Link>

            </div>

            {/* 3. STATIC USER PROFILE CARD & PREMIUM LOGOUT BUTTON */}
            <div className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-[var(--border-light)]">
              <div className="flex items-center gap-2 sm:gap-3 select-none">
                <img 
                  src={user?.avatar && !user.avatar.includes('photo-1534528741775') ? user.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=0284c7&color=fff&bold=true`} 
                  alt="" 
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-amber-500 flex-shrink-0" 
                />
                <div className="hidden md:block text-left">
                  <h4 className="text-xs font-black text-[var(--text-primary)] leading-tight">
                    {user?.name || 'Portal User'}
                  </h4>
                  <span className="text-[9px] text-emerald-500 font-extrabold block capitalize tracking-wide mt-0.5">
                    {user?.role === 'manager' || role === 'manager' ? 'Hotel Manager / Owner' : `${user?.role || role} Member`}
                  </span>
                </div>
              </div>

              {/* Premium Logout Icon Button next to it */}
              <button 
                onClick={handleLogout}
                className="hidden md:flex p-2.5 rounded-xl border border-[var(--border-light)] bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-rose-600 hover:border-rose-500/30 hover:bg-rose-500/5 transition-all cursor-pointer flex items-center justify-center"
                title="Log Out Account"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </div>

          </div>

        </header>

        {/* BODY CONTAINER */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 w-full max-w-7xl mx-auto flex-1">
          {children}
        </div>

        {/* MINIMAL PREMIUM DASHBOARD FOOTER */}
        <PortalFooter role={role} />

      </div>

    </div>
  );
};
