import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Building2, Sun, Moon, User, Shield, Briefcase, 
  Heart, Sparkles, LogOut, Menu, X, ChevronDown, Gift, Bell,
  Compass, BookOpen, HelpCircle, FileText, Globe, Calendar, CheckCircle2, Check, ExternalLink
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useLanguage } from '../context/LanguageContext';

export const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const { user, logout, switchRole } = useAuth();
  const { wishlist } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [pagesDropdownOpen, setPagesDropdownOpen] = useState(false);
  const [mobilePagesOpen, setMobilePagesOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const notifRef = useRef(null);
  const mobileNotifRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isPortal = location.pathname.startsWith('/admin') || location.pathname.startsWith('/partner') || location.pathname.startsWith('/customer');
  const isPagesActive = ['/destinations', '/blog', '/faq', '/terms', '/privacy'].some(path => location.pathname.startsWith(path));

  // Notification Data Generator based on user role
  const getInitialNotifications = (role) => {
    const isAllRead = localStorage.getItem('luxestay_notifs_read') === 'true';
    const readIds = JSON.parse(localStorage.getItem('luxestay_read_notif_ids') || '[]');

    let base = [];
    if (role === 'admin') {
      base = [
        {
          id: 'n_adm_1',
          title: 'New Reservation Alert',
          desc: 'Overwater Sunset Plunge Pool Villa (BK-88492) booked',
          time: '10 mins ago',
          icon: Calendar,
          iconColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
          link: '/admin/bookings'
        },
        {
          id: 'n_adm_2',
          title: 'Payout Request ($500)',
          desc: 'Azure Maldives Resort requested wire withdrawal',
          time: '45 mins ago',
          icon: Shield,
          iconColor: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
          link: '/admin/payouts'
        },
        {
          id: 'n_adm_3',
          title: 'System Health Optimal',
          desc: 'Database automated backup completed successfully',
          time: '2 hours ago',
          icon: Sparkles,
          iconColor: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
          link: '/admin/dashboard'
        }
      ];
    } else if (role === 'manager') {
      base = [
        {
          id: 'n_mgr_1',
          title: 'New Booking Confirmed',
          desc: 'Overwater Sunset Plunge Pool Villa (BK-88492) reserved',
          time: '10 mins ago',
          icon: Calendar,
          iconColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
          link: '/manager/bookings'
        },
        {
          id: 'n_mgr_2',
          title: 'Payout Processed',
          desc: '$500 transferred to SWIFT Bank Wire (PO-85552)',
          time: '1 hour ago',
          icon: Shield,
          iconColor: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
          link: '/manager/wallet'
        },
        {
          id: 'n_mgr_3',
          title: 'New 5★ Guest Review',
          desc: 'Lady Genevieve left a 5.0 star review for Grand Azure Resort',
          time: '3 hours ago',
          icon: Sparkles,
          iconColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
          link: '/manager/reviews'
        }
      ];
    } else if (role === 'customer') {
      base = [
        {
          id: 'n_cust_1',
          title: 'Booking Confirmed 🎉',
          desc: 'Your stay at Grand Azure Resort is confirmed!',
          time: '15 mins ago',
          icon: Calendar,
          iconColor: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
          link: '/customer/bookings'
        },
        {
          id: 'n_cust_2',
          title: 'Exclusive 30% Off Offer',
          desc: 'Limited-time luxury voucher available for Maldives villas',
          time: '1 hour ago',
          icon: Gift,
          iconColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
          link: '/offers'
        },
        {
          id: 'n_cust_3',
          title: 'LuxeRewards +500 Pts',
          desc: 'Earned rewards for your recent luxury reservation',
          time: '1 day ago',
          icon: Sparkles,
          iconColor: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
          link: '/customer/dashboard'
        }
      ];
    } else {
      // Guest / Not logged in
      base = [
        {
          id: 'n_gst_1',
          title: 'Welcome to LuxeStay ✨',
          desc: 'Enjoy up to 25% off on your first luxury sanctuary booking',
          time: 'Just now',
          icon: Gift,
          iconColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
          link: '/offers'
        },
        {
          id: 'n_gst_2',
          title: 'Trending Destinations',
          desc: 'Discover private villas in Maldives, Bali & Amalfi Coast',
          time: '2 hours ago',
          icon: Sparkles,
          iconColor: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
          link: '/destinations'
        },
        {
          id: 'n_gst_3',
          title: 'Unlock VIP Member Perks',
          desc: 'Sign in to access exclusive rates and complimentary breakfast',
          time: '1 day ago',
          icon: User,
          iconColor: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
          link: '/login'
        }
      ];
    }

    return base.map(n => ({
      ...n,
      read: isAllRead || readIds.includes(n.id)
    }));
  };

  const [notifications, setNotifications] = useState(() => getInitialNotifications(user?.role));

  useEffect(() => {
    setNotifications(getInitialNotifications(user?.role));
  }, [user?.role]);

  // Close notifications on outside click or ESC
  useEffect(() => {
    const handleClickOutside = (e) => {
      const isOutsideDesktop = notifRef.current && !notifRef.current.contains(e.target);
      const isOutsideMobile = mobileNotifRef.current && !mobileNotifRef.current.contains(e.target);
      if (isOutsideDesktop && isOutsideMobile) {
        setNotifDropdownOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setNotifDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleNotificationClick = (item) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === item.id ? { ...n, read: true } : n);
      const readIds = updated.filter(n => n.read).map(n => n.id);
      localStorage.setItem('luxestay_read_notif_ids', JSON.stringify(readIds));
      if (updated.every(n => n.read)) {
        localStorage.setItem('luxestay_notifs_read', 'true');
      }
      return updated;
    });
    setNotifDropdownOpen(false);
    if (item.link) {
      navigate(item.link);
    }
  };

  const handleMarkAllRead = (e) => {
    if (e) e.stopPropagation();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    localStorage.setItem('luxestay_notifs_read', 'true');
    localStorage.setItem('luxestay_read_notif_ids', JSON.stringify(notifications.map(n => n.id)));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (isPortal) return null;

  const handleGalleryClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/#gallery');
    }
  };

  const navLinks = [
    { label: t('home'), path: '/' },
    { label: t('hotels'), path: '/hotels' },
    { label: t('offers'), path: '/offers', icon: Gift, highlight: true },
  ];

  return (
    <header className="sticky top-0 z-50 transition-colors duration-300">

      <div className="border-b border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-xl shadow-md">
        <div className="container max-w-7xl mx-auto flex items-center justify-between gap-3 xl:gap-6 py-4 sm:py-5 px-3 sm:px-6">
          
          {/* Left Brand Logo */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0 mr-4 xl:mr-8 group">
            <img 
              src="/logo.png" 
              alt="LuxeStay Luxury Hospitality" 
              className="h-12 sm:h-14 w-auto object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300" 
            />
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-[var(--text-primary)] leading-none">
                LUXESTAY
              </span>
              <span className="text-[8px] sm:text-[9px] uppercase font-extrabold tracking-widest text-amber-500 mt-1">
                Luxury Hospitality
              </span>
            </div>
          </Link>

          {/* Center Navigation Links (Clean 3 Core Links + 1 Luxury Dropdown) */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 flex-shrink-0">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              const Icon = link.icon;

              return (
                <Link 
                  key={link.path} 
                  to={link.path} 
                  className={`py-1 text-xs xl:text-sm font-extrabold uppercase tracking-wider whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 border-b-2 ${
                    isActive 
                      ? 'border-amber-600 text-amber-600 dark:border-amber-500 dark:text-amber-500' 
                      : link.highlight 
                        ? 'border-transparent text-amber-600 dark:text-amber-500 hover:border-amber-600 font-black' 
                        : 'border-transparent text-[var(--text-primary)] hover:text-amber-600 dark:hover:text-amber-500 hover:border-amber-600/50'
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {/* Pages Dropdown (Gallery, Destinations, Blog, About, Contact, FAQ, Terms) */}
            <div 
              className="relative group cursor-pointer"
              onMouseEnter={() => setPagesDropdownOpen(true)}
              onMouseLeave={() => setPagesDropdownOpen(false)}
            >
              <button 
                type="button"
                className={`nav-dropdown-btn py-1 text-xs xl:text-sm font-extrabold uppercase tracking-wider whitespace-nowrap flex items-center gap-1 outline-none focus:outline-none cursor-pointer ${
                  isPagesActive || pagesDropdownOpen ? 'active-dropdown' : ''
                }`}
              >
                <span>{t('pages')}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${pagesDropdownOpen ? 'rotate-180 text-amber-600 dark:text-amber-400' : 'text-amber-500'}`} />
              </button>

              {pagesDropdownOpen && (
                <div className="absolute left-0 mt-1 w-60 py-2 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-2xl z-50 animate-fade-in text-xs font-bold space-y-1">
                  <a href="/#gallery" onClick={(e) => { setPagesDropdownOpen(false); handleGalleryClick(e); }} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:text-amber-500 transition-colors cursor-pointer">
                    <Sparkles className="w-4 h-4 text-amber-500" /> {t('ourGallery')}
                  </a>
                  <Link to="/destinations" onClick={() => setPagesDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:text-amber-500 transition-colors">
                    <Compass className="w-4 h-4 text-amber-500" /> {t('destinations')}
                  </Link>
                  <Link to="/blog" onClick={() => setPagesDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:text-amber-500 transition-colors">
                    <BookOpen className="w-4 h-4 text-amber-500" /> {t('blog')}
                  </Link>
                  <Link to="/about" onClick={() => setPagesDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:text-amber-500 transition-colors">
                    <Building2 className="w-4 h-4 text-amber-500" /> {t('about')}
                  </Link>
                  <Link to="/contact" onClick={() => setPagesDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:text-amber-500 transition-colors">
                    <Briefcase className="w-4 h-4 text-amber-500" /> {t('contact')}
                  </Link>
                  <div className="border-t border-[var(--border-light)] my-1"></div>
                  <Link to="/faq" onClick={() => setPagesDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:text-amber-500 transition-colors">
                    <HelpCircle className="w-4 h-4 text-amber-500" /> {t('faq')}
                  </Link>
                  <Link to="/terms" onClick={() => setPagesDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:text-amber-500 transition-colors">
                    <FileText className="w-4 h-4 text-amber-500" /> {t('terms')}
                  </Link>
                </div>
              )}
            </div>
          </nav>

          {/* Right Tools (Clean, Spacious Utility Bar) */}
          <div className="hidden md:flex flex-nowrap items-center gap-2.5 xl:gap-3.5 flex-shrink-0 ml-auto">

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="w-10 h-10 rounded-xl border border-[var(--border-light)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:border-amber-500 transition-colors cursor-pointer flex items-center justify-center flex-shrink-0"
              title="Toggle Dark/Light Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Interactive Notification Bell with Dropdown Popup */}
            <div ref={notifRef} className="relative">
              <button 
                type="button"
                onClick={() => setNotifDropdownOpen(prev => !prev)}
                className={`w-10 h-10 rounded-xl border transition-all duration-200 cursor-pointer relative flex items-center justify-center flex-shrink-0 ${
                  notifDropdownOpen 
                    ? 'border-amber-500 bg-amber-500/10 text-amber-500 shadow-md shadow-amber-500/10' 
                    : 'border-[var(--border-light)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:border-amber-500'
                }`}
                title="Notifications & Alerts"
                aria-label="Toggle notifications"
                aria-expanded={notifDropdownOpen}
              >
                <Bell className={`w-4 h-4 transition-transform duration-200 ${notifDropdownOpen ? 'scale-110 text-amber-500' : 'text-slate-700 dark:text-slate-300'}`} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center shadow-md animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Popup */}
              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-2xl z-50 animate-fade-in overflow-hidden">
                  
                  {/* Header */}
                  <div className="p-4 border-b border-[var(--border-light)] flex items-center justify-between bg-[var(--bg-tertiary)]/50">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-[var(--text-primary)] leading-tight">Notifications</h3>
                        <span className="text-[10px] font-bold text-[var(--text-muted)]">
                          {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
                        </span>
                      </div>
                    </div>
                    {unreadCount > 0 && (
                      <button 
                        onClick={handleMarkAllRead}
                        className="text-[11px] font-bold text-amber-500 hover:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Mark all read</span>
                      </button>
                    )}
                  </div>

                  {/* Notification List */}
                  <div className="p-2 space-y-1.5 max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-8 px-4 text-center">
                        <CheckCircle2 className="w-10 h-10 mx-auto text-amber-500 mb-2 opacity-50" />
                        <p className="text-xs font-bold text-[var(--text-primary)]">No notifications</p>
                        <p className="text-[11px] text-[var(--text-muted)] mt-0.5">You're all caught up for now!</p>
                      </div>
                    ) : (
                      notifications.map((item) => {
                        const ItemIcon = item.icon || Sparkles;
                        return (
                          <div 
                            key={item.id}
                            onClick={() => handleNotificationClick(item)}
                            className={`group p-3 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start gap-3 ${
                              item.read 
                                ? 'bg-transparent border-transparent hover:bg-[var(--bg-tertiary)] opacity-75 hover:opacity-100' 
                                : 'bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10 shadow-xs'
                            }`}
                          >
                            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${item.iconColor || 'text-amber-500 bg-amber-500/10 border-amber-500/20'}`}>
                              <ItemIcon className="w-4 h-4" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1 mb-0.5">
                                <h4 className={`text-xs truncate ${item.read ? 'font-bold text-[var(--text-primary)]' : 'font-extrabold text-amber-600 dark:text-amber-400'}`}>
                                  {item.title}
                                </h4>
                                {!item.read && (
                                  <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-[11px] text-[var(--text-secondary)] leading-snug line-clamp-2">
                                {item.desc}
                              </p>
                              <span className="text-[10px] font-medium text-[var(--text-muted)] mt-1.5 block">
                                {item.time}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Footer */}
                  <div className="p-3 border-t border-[var(--border-light)] bg-[var(--bg-tertiary)]/30 flex items-center justify-between text-[11px] font-bold">
                    <span className="text-[var(--text-muted)] text-[10px]">LuxeStay Alerts</span>
                    <button 
                      onClick={() => {
                        setNotifDropdownOpen(false);
                        if (user?.role === 'admin') navigate('/admin/dashboard');
                        else if (user?.role === 'manager') navigate('/manager/dashboard');
                        else if (user) navigate('/customer/bookings');
                        else navigate('/offers');
                      }}
                      className="text-amber-500 hover:text-amber-400 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>{user ? 'View Dashboard' : 'Explore Offers'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>

                </div>
              )}
            </div>

            {/* User Auth Buttons / Executive Dark Pill CTA Button */}
            {user ? (
              <div className="flex items-center gap-3 flex-shrink-0">
                {/* Premium User Profile Pill */}
                <Link 
                  to={user.role === 'admin' ? '/admin/dashboard' : user.role === 'manager' ? '/manager/dashboard' : '/customer/dashboard'}
                  className="h-10 flex items-center gap-2 pl-1 pr-3.5 rounded-full bg-slate-950 border border-amber-500/30 hover:border-amber-400/60 hover:scale-[1.03] transition-all duration-300 shadow-md group"
                  title="Go to Dashboard"
                >
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="w-7 h-7 rounded-full object-cover border-2 border-amber-500 group-hover:border-amber-400 transition-colors" 
                  />
                  <div className="flex flex-col text-left">
                    <span className="text-[11px] font-black text-amber-500 leading-tight group-hover:text-amber-400 transition-colors">
                      {user.name.split(' ')[0]}
                    </span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">
                      {user.role}
                    </span>
                  </div>
                </Link>

                {/* Premium Eye-Catching Logout Button */}
                <button 
                  onClick={logout} 
                  className="w-10 h-10 flex items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-500 hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all duration-300 shadow-xs cursor-pointer hover:scale-105 active:scale-95" 
                  title="Logout Account"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link 
                to="/login"
                className="h-10 px-5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white border border-amber-400/40 text-xs font-extrabold tracking-wider uppercase flex items-center justify-center text-center shadow-md shadow-amber-600/20 hover:shadow-lg transition-all cursor-pointer flex-shrink-0"
              >
                <span>{t('signIn')}</span>
              </Link>
            )}

          </div>

          {/* Mobile/Tablet Controls */}
          <div className="md:hidden flex items-center gap-2">
            
            {/* Mobile Notification Bell */}
            <div ref={mobileNotifRef} className="relative">
              <button 
                type="button"
                onClick={() => setNotifDropdownOpen(prev => !prev)}
                className={`p-2 rounded-xl border transition-colors cursor-pointer relative flex items-center justify-center ${
                  notifDropdownOpen 
                    ? 'border-amber-500 bg-amber-500/10 text-amber-500' 
                    : 'border-[var(--border-light)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:border-amber-500'
                }`}
                title="Notifications"
                aria-label="Toggle notifications"
              >
                <Bell className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-rose-600 text-white text-[8px] font-black flex items-center justify-center shadow-md">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Mobile Notification Popup */}
              {notifDropdownOpen && (
                <div className="fixed top-18 right-3 left-3 max-w-sm ml-auto rounded-3xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-2xl z-50 animate-fade-in overflow-hidden">
                  {/* Header */}
                  <div className="p-4 border-b border-[var(--border-light)] flex items-center justify-between bg-[var(--bg-tertiary)]/50">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-[var(--text-primary)] leading-tight">Notifications</h3>
                        <span className="text-[10px] font-bold text-[var(--text-muted)]">
                          {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
                        </span>
                      </div>
                    </div>
                    {unreadCount > 0 && (
                      <button 
                        onClick={handleMarkAllRead}
                        className="text-[11px] font-bold text-amber-500 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Mark read</span>
                      </button>
                    )}
                  </div>

                  {/* Notification List */}
                  <div className="p-2 space-y-1.5 max-h-72 overflow-y-auto">
                    {notifications.map((item) => {
                      const ItemIcon = item.icon || Sparkles;
                      return (
                        <div 
                          key={item.id}
                          onClick={() => handleNotificationClick(item)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                            item.read 
                              ? 'bg-transparent border-transparent opacity-75' 
                              : 'bg-amber-500/5 border-amber-500/20'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-xl border flex items-center justify-center flex-shrink-0 ${item.iconColor || 'text-amber-500 bg-amber-500/10 border-amber-500/20'}`}>
                            <ItemIcon className="w-3.5 h-3.5" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <h4 className={`text-xs truncate ${item.read ? 'font-bold text-[var(--text-primary)]' : 'font-extrabold text-amber-600'}`}>
                                {item.title}
                              </h4>
                              {!item.read && (
                                <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-[10px] text-[var(--text-secondary)] leading-snug line-clamp-2">
                              {item.desc}
                            </p>
                            <span className="text-[9px] font-medium text-[var(--text-muted)] mt-1 block">
                              {item.time}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer */}
                  <div className="p-3 border-t border-[var(--border-light)] bg-[var(--bg-tertiary)]/30 flex items-center justify-between text-[11px] font-bold">
                    <span className="text-[var(--text-muted)] text-[10px]">LuxeStay Alerts</span>
                    <button 
                      onClick={() => {
                        setNotifDropdownOpen(false);
                        if (user?.role === 'admin') navigate('/admin/dashboard');
                        else if (user?.role === 'manager') navigate('/manager/dashboard');
                        else if (user) navigate('/customer/bookings');
                        else navigate('/offers');
                      }}
                      className="text-amber-500 hover:text-amber-400 flex items-center gap-1 cursor-pointer"
                    >
                      <span>{user ? 'View Dashboard' : 'Explore Offers'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle Button (Mobile/Tablet Only) */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-[var(--border-light)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:border-amber-500 transition-colors cursor-pointer flex items-center justify-center flex-shrink-0"
              title="Toggle Dark/Light Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border border-[var(--border-light)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-b border-[var(--border-light)] bg-[var(--bg-card)] px-6 py-6 space-y-4 animate-fade-in text-sm font-bold shadow-2xl">
          {navLinks.map(link => (
            <Link 
              key={link.path} 
              to={link.path} 
              onClick={() => setMobileMenuOpen(false)} 
              className={`block py-2 border-b border-[var(--border-light)] ${link.highlight ? 'text-amber-600 font-extrabold' : ''}`}
            >
              {link.label}
            </Link>
          ))}

          {/* Pages Accordion (Mobile Only) */}
          <div className="border-b border-[var(--border-light)] py-2">
            <button
              onClick={() => setMobilePagesOpen(!mobilePagesOpen)}
              className="w-full flex items-center justify-between text-left text-sm font-bold text-[var(--text-primary)] cursor-pointer"
            >
              <span>{t('pages')}</span>
              <ChevronDown className={`w-4 h-4 text-amber-500 transition-transform duration-200 ${mobilePagesOpen ? 'rotate-180' : ''}`} />
            </button>

            {mobilePagesOpen && (
              <div className="pl-4 pt-2 space-y-2.5 text-xs font-semibold text-[var(--text-secondary)] animate-fade-in">
                <a href="/#gallery" onClick={(e) => { setMobileMenuOpen(false); handleGalleryClick(e); }} className="block py-1 hover:text-amber-500 transition-colors">
                  {t('ourGallery')}
                </a>
                <Link to="/destinations" onClick={() => setMobileMenuOpen(false)} className="block py-1 hover:text-amber-500 transition-colors">
                  {t('destinations')}
                </Link>
                <Link to="/blog" onClick={() => setMobileMenuOpen(false)} className="block py-1 hover:text-amber-500 transition-colors">
                  {t('blog')}
                </Link>
                <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="block py-1 hover:text-amber-500 transition-colors">
                  {t('about')}
                </Link>
                <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="block py-1 hover:text-amber-500 transition-colors">
                  {t('contact')}
                </Link>
                <Link to="/faq" onClick={() => setMobileMenuOpen(false)} className="block py-1 hover:text-amber-500 transition-colors">
                  {t('faq')}
                </Link>
                <Link to="/terms" onClick={() => setMobileMenuOpen(false)} className="block py-1 hover:text-amber-500 transition-colors">
                  {t('terms')}
                </Link>
              </div>
            )}
          </div>
          
          {user ? (
            <div className="pt-4 border-t border-[var(--border-light)] space-y-3">
              {/* Active Profile Info Redirect to Dashboard */}
              <Link 
                to={user.role === 'admin' ? '/admin/dashboard' : user.role === 'manager' ? '/manager/dashboard' : '/customer/dashboard'}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--bg-tertiary)] border border-amber-500/20 shadow-xs"
              >
                <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover border-2 border-amber-500" />
                <div className="flex flex-col text-left">
                  <span className="text-xs font-black text-amber-500 leading-tight">{user.name}</span>
                  <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mt-0.5">{user.role} Dashboard</span>
                </div>
              </Link>
              {/* Direct Logout Button */}
              <button 
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-500 text-xs font-extrabold cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out Account</span>
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-[var(--border-light)]">
              <Link 
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full h-11 rounded-xl bg-amber-600 text-white font-extrabold flex items-center justify-center text-xs tracking-wider uppercase shadow-md cursor-pointer"
              >
                <span>{t('signIn')}</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
