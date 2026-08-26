import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Briefcase, Plus, ChevronDown, LayoutDashboard, BedDouble, Clock, X, Globe, Home, Settings, LogOut, Sun, Moon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const PartnerSidebar = ({ isOpen, onClose, isCollapsed }) => {
  const location = useLocation();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [partnerOpen, setPartnerOpen] = useState(true);
  const [isSidebarSettingsOpen, setIsSidebarSettingsOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/partner/dashboard', icon: LayoutDashboard },
    { label: 'Reservation', path: '/partner/bookings', icon: Clock },
    { label: 'Rooms', path: '/partner/rooms', icon: BedDouble },
    { label: 'Messages', path: '/partner/messages', badge: '7', icon: Briefcase },
    { label: 'Housekeeping', path: '/partner/housekeeping', icon: Home },
    { label: 'Inventory', path: '/partner/inventory', icon: Plus },
    { label: 'Calendar', path: '/partner/calendar', icon: Clock },
    { label: 'Financials', path: '/partner/wallet', icon: Briefcase },
    { label: 'Reviews', path: '/partner/reviews', icon: Globe },
    { label: 'Concierge', path: '/partner/concierge', icon: Home },
    { label: 'Settings', path: '/partner/settings', icon: Settings },
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
            <Link to="/partner/dashboard" onClick={() => onClose && onClose()} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-950 text-white flex items-center justify-center font-black shadow-md flex-shrink-0">
                <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
                  <div className="bg-lime-400 rounded-2xs"></div>
                  <div className="bg-white rounded-2xs"></div>
                  <div className="bg-white rounded-2xs"></div>
                  <div className="bg-lime-400 rounded-2xs"></div>
                </div>
              </div>
              {(!isCollapsed || isOpen) && (
                <span className="text-xl font-extrabold text-[var(--text-primary)] tracking-tight whitespace-nowrap">
                  LuxStay <span className="text-[10px] font-bold text-lime-600 bg-lime-400/30 px-2 py-0.5 rounded-full ml-1 align-middle">v 1.0</span>
                </span>
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
              const isActive = location.pathname === item.path || (item.path === '/partner/dashboard' && location.pathname === '/partner/dashboard');
              const IconComp = item.icon || LayoutDashboard;

              if (item.label === 'Settings') {
                return (
                  <div key={idx} className="space-y-1">
                    <button
                      onClick={() => setIsSidebarSettingsOpen(prev => !prev)}
                      className={`w-full flex items-center justify-between py-2.5 px-3.5 rounded-2xl transition-all duration-200 cursor-pointer ${
                        location.pathname.startsWith('/partner/settings')
                          ? 'bg-slate-100 text-slate-900 font-extrabold'
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
                      <div className="pl-6 space-y-1 border-l border-slate-100 ml-5 px-1 animate-fade-in text-[11px] font-semibold text-slate-500">
                        <Link
                          to="/partner/settings"
                          onClick={() => onClose && onClose()}
                          className="flex items-center gap-2 py-2 px-3 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          <span>Profile Update</span>
                        </Link>
                        <Link
                          to="/partner/password"
                          onClick={() => onClose && onClose()}
                          className="flex items-center gap-2 py-2 px-3 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors border-t border-slate-50"
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
                      ? 'bg-[#e2f896] text-slate-900 font-extrabold shadow-sm' 
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

        {(!isCollapsed || isOpen) && (
          <div className="p-4 border-t border-[var(--border-light)] text-[10px] text-center text-[var(--text-muted)] font-semibold">
            LuxStay Partner Dashboard © 2026
          </div>
        )}
      </aside>
    </>
  );
};
