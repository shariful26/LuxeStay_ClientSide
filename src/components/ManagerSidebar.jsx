import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Briefcase, Plus, ChevronDown, LayoutDashboard, BedDouble, Clock, X, Globe, Home, Settings, LogOut, Sun, Moon, Building2, UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useMessages } from '../context/MessageContext';

export const ManagerSidebar = ({ isOpen, onClose, isCollapsed }) => {
  const location = useLocation();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isSidebarSettingsOpen, setIsSidebarSettingsOpen] = useState(false);
  const { unreadCount } = useMessages();

  const navItems = [
    { label: 'Dashboard', path: '/manager/dashboard', icon: LayoutDashboard },
    { label: 'My Hotels', path: '/manager/hotels', icon: Building2 },
    { label: 'Reservations', path: '/manager/bookings', icon: Clock },
    { label: 'Rooms & Rates', path: '/manager/rooms', icon: BedDouble },
    { label: 'Messages', path: '/manager/messages', badge: unreadCount > 0 ? String(unreadCount) : null, icon: Briefcase },
    { label: 'Housekeeping', path: '/manager/housekeeping', icon: Home },
    { label: 'Inventory', path: '/manager/inventory', icon: Plus },
    { label: 'Calendar', path: '/manager/calendar', icon: Clock },
    { label: 'Wallet & Payouts', path: '/manager/wallet', icon: Briefcase },
    { label: 'Guest Reviews', path: '/manager/reviews', icon: Globe },
    { label: 'Concierge Desk', path: '/manager/concierge', icon: UserCheck },
    { label: 'Settings', path: '/manager/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden animate-fade-in"
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 flex flex-col justify-between bg-[var(--bg-card)] border-r border-[var(--border-light)] transition-all duration-300 ease-in-out
        lg:static lg:z-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'lg:w-20' : 'lg:w-60'}
        w-72 flex-shrink-0
      `}>
        <div className="p-5 space-y-6 overflow-y-auto">
          
          {/* Brand Logo & Mobile Close */}
          <div className="flex items-center justify-between pb-2">
            <Link to="/manager/dashboard" onClick={() => onClose && onClose()} className="flex items-center gap-2.5">
              <img 
                src="/logo.png" 
                alt="LuxeStay" 
                className="h-11 w-auto object-contain drop-shadow-md flex-shrink-0" 
              />
              {(!isCollapsed || isOpen) && (
                <div className="flex flex-col">
                  <span className="text-base font-extrabold text-[var(--text-primary)] tracking-tight whitespace-nowrap leading-none">
                    LUXESTAY
                  </span>
                  <span className="text-[8px] uppercase font-extrabold tracking-widest text-emerald-500 mt-0.5">
                    Hotel Manager Hub
                  </span>
                </div>
              )}
            </Link>

            <button 
              onClick={onClose}
              className="lg:hidden p-2 rounded-xl text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Direct Home Link */}
          <Link 
            to="/" 
            onClick={() => onClose && onClose()}
            className="w-full flex items-center gap-3 py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500 hover:text-white border border-amber-500/30 text-amber-500 font-bold transition-all text-xs"
          >
            <Home className="w-4 h-4 flex-shrink-0" />
            {(!isCollapsed || isOpen) && <span>Return to Website</span>}
          </Link>

          {/* Navigation Items */}
          <nav className="space-y-1.5 text-xs font-bold">
            {navItems.map((item, idx) => {
              const isActive = location.pathname === item.path || 
                (item.path === '/manager/dashboard' && (location.pathname === '/manager/dashboard' || location.pathname === '/partner/dashboard')) ||
                (item.path.startsWith('/manager/hotels') && location.pathname.startsWith('/manager/hotels')) ||
                (item.path.startsWith('/manager/rooms') && location.pathname.startsWith('/manager/rooms')) ||
                (item.path.startsWith('/manager/bookings') && location.pathname.startsWith('/manager/bookings'));
              const IconComp = item.icon || LayoutDashboard;

              if (item.label === 'Settings') {
                return (
                  <div key={idx} className="space-y-1">
                    <button
                      onClick={() => setIsSidebarSettingsOpen(prev => !prev)}
                      className={`w-full flex items-center justify-between py-2.5 px-3.5 rounded-2xl transition-all duration-200 cursor-pointer ${
                        location.pathname.startsWith('/manager/settings') || location.pathname.startsWith('/partner/settings')
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-extrabold'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <IconComp className="w-4 h-4 flex-shrink-0 text-[var(--text-muted)]" />
                        {(!isCollapsed || isOpen) && <span className="text-xs">{item.label}</span>}
                      </div>
                      {(!isCollapsed || isOpen) && (
                        <ChevronDown className={`w-3.5 h-3.5 text-[var(--text-muted)] transition-transform duration-200 ${isSidebarSettingsOpen ? 'rotate-180' : ''}`} />
                      )}
                    </button>

                    {isSidebarSettingsOpen && (!isCollapsed || isOpen) && (
                      <div className="pl-6 space-y-1 border-l border-[var(--border-light)] ml-5 px-1 animate-fade-in text-[11px] font-semibold text-slate-500">
                        <Link
                          to="/manager/settings"
                          onClick={() => onClose && onClose()}
                          className="flex items-center gap-2 py-2 px-3 rounded-xl hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          <span>Profile Update</span>
                        </Link>
                        <Link
                          to="/manager/password"
                          onClick={() => onClose && onClose()}
                          className="flex items-center gap-2 py-2 px-3 rounded-xl hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors border-t border-[var(--border-light)]"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                          <span>Password Update</span>
                        </Link>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={idx}
                  to={item.path}
                  onClick={() => onClose && onClose()}
                  className={`flex items-center justify-between py-2.5 px-3.5 rounded-2xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm' 
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] font-medium'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <IconComp className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-slate-950' : 'text-[var(--text-muted)]'}`} />
                    {(!isCollapsed || isOpen) && <span className="text-xs">{item.label}</span>}
                  </div>
                  {item.badge && (!isCollapsed || isOpen) && (
                    <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
          
          {/* Logout Button */}
          <div className="pt-4 border-t border-[var(--border-light)] mt-4">
            <button
              onClick={() => {
                logout();
                if (onClose) onClose();
              }}
              className="w-full flex items-center gap-3 py-2.5 px-3.5 rounded-2xl text-[var(--text-secondary)] hover:bg-rose-500/10 hover:text-rose-600 transition-all font-bold cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              {(!isCollapsed || isOpen) && <span className="text-xs">Log Out</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export const PartnerSidebar = ManagerSidebar;
export default ManagerSidebar;
