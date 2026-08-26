import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Building2, Sun, Moon, User, Shield, Briefcase, 
  Heart, Sparkles, LogOut, Menu, X, ChevronDown, Gift, Bell,
  Compass, BookOpen, HelpCircle, FileText, Globe
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
  const navigate = useNavigate();
  const location = useLocation();

  const isPortal = location.pathname.startsWith('/admin') || location.pathname.startsWith('/partner') || location.pathname.startsWith('/customer');
  const isPagesActive = ['/destinations', '/blog', '/faq', '/terms', '/privacy'].some(path => location.pathname.startsWith(path));

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
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0 mr-4 xl:mr-8">
            <div className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-amber-600 text-white shadow-md hover:scale-105 transition-all">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-extrabold tracking-tight text-[var(--text-primary)] leading-none">
                LUXESTAY
              </span>
              <span className="text-[8px] sm:text-[9px] uppercase font-extrabold tracking-widest text-amber-500/90 mt-0.5">
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

            {/* Notification Bell Icon */}
            <Link 
              to={user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'partner' ? '/partner/dashboard' : '/customer/dashboard'}
              className="w-10 h-10 rounded-xl border border-[var(--border-light)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:border-amber-500 transition-colors relative flex items-center justify-center flex-shrink-0"
              title="Notifications & Alerts"
            >
              <Bell className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              {localStorage.getItem('luxestay_notifs_read') !== 'true' && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center shadow-md">
                  2
                </span>
              )}
            </Link>



            {/* User Auth Buttons / Executive Dark Pill CTA Button */}
            {user ? (
              <div className="flex items-center gap-3 flex-shrink-0">
                {/* Premium User Profile Pill */}
                <Link 
                  to={user.role === 'admin' ? '/admin/dashboard' : user.role === 'partner' ? '/partner/dashboard' : '/customer/dashboard'}
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

          {/* Mobile/Tablet Theme Toggle & Hamburger Button */}
          <div className="xl:hidden flex items-center gap-2">
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
                to={user.role === 'admin' ? '/admin/dashboard' : user.role === 'partner' ? '/partner/dashboard' : '/customer/dashboard'}
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
