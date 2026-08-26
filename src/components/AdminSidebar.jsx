import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, UserCheck, ConciergeBell, BedDouble, 
  Star, CheckSquare, Grid, BarChart3, Layers, ChevronDown, ChevronRight, Building2, X, Globe, Home, LogOut, Sun, Moon, Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const AdminSidebar = ({ isOpen, onClose, isCollapsed }) => {
  const location = useLocation();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [dashboardOpen, setDashboardOpen] = useState(true);
  const [isSidebarSettingsOpen, setIsSidebarSettingsOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard Main', path: '/admin/dashboard' },
    { label: 'Guest & Roles', path: '/admin/users' },
    { label: 'Room Catalog', path: '/admin/rooms' },
    { label: 'Hotels Directory', path: '/admin/hotels' },
    { label: 'Task & Bookings', path: '/admin/bookings' },
    { label: 'Owner Wallet Payouts', path: '/admin/payouts' },
    { label: 'Payment Settings', path: '/admin/payment-settings' },
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
        ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
        w-72 flex-shrink-0
      `}>
        <div className="p-4 space-y-5 overflow-y-auto">
          
          {/* Brand Logo & Mobile Close */}
          <div className="flex items-center justify-between pb-4 border-b border-[var(--border-light)]">
            <Link to="/admin/dashboard" onClick={() => onClose && onClose()} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/30 flex-shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              {(!isCollapsed || isOpen) && (
                <span className="text-xl font-extrabold text-[var(--text-primary)] tracking-tight whitespace-nowrap">
                  LUXESTAY
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

          {/* Direct Back to Main Website Button */}
          <Link 
            to="/" 
            onClick={() => onClose && onClose()}
            className="w-full flex items-center gap-3 p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500 hover:text-white border border-amber-500/30 text-amber-500 font-extrabold transition-all text-xs shadow-xs"
            title="Go to Home"
          >
            <Home className="w-4 h-4 flex-shrink-0" />
            {(!isCollapsed || isOpen) && <span>Home</span>}
          </Link>

          {/* Navigation Items */}
          <nav className="space-y-2 text-xs font-bold">
            
            <div>
              <button 
                onClick={() => setDashboardOpen(!dashboardOpen)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/20 font-extrabold"
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                  {(!isCollapsed || isOpen) && <span>Admin Portal</span>}
                </div>
                {(!isCollapsed || isOpen) && (
                  <ChevronDown className={`w-4 h-4 transition-transform ${dashboardOpen ? 'rotate-180' : ''}`} />
                )}
              </button>

              {dashboardOpen && (!isCollapsed || isOpen) && (
                <div className="mt-2 pl-4 space-y-1 border-l-2 border-amber-500/30 ml-4 animate-fade-in text-[11px]">
                  {navItems.map((item, idx) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={idx}
                        to={item.path}
                        onClick={() => onClose && onClose()}
                        className={`block py-2 px-3 rounded-lg transition-colors font-semibold ${
                          isActive 
                            ? 'bg-amber-500/10 text-amber-500 font-extrabold' 
                            : 'text-[var(--text-secondary)] hover:text-amber-500 hover:bg-[var(--bg-tertiary)]'
                        }`}
                      >
                        • {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-2">
              <Link 
                to="/admin/users" 
                onClick={() => onClose && onClose()}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  {(!isCollapsed || isOpen) && <span>User Roles</span>}
                </div>
              </Link>
            </div>

            <div>
              <Link 
                to="/admin/hotels" 
                onClick={() => onClose && onClose()}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
              >
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  {(!isCollapsed || isOpen) && <span>Hotels Catalog</span>}
                </div>
              </Link>
            </div>

            <div>
              <Link 
                to="/admin/bookings" 
                onClick={() => onClose && onClose()}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
              >
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                  {(!isCollapsed || isOpen) && <span>All Bookings</span>}
                </div>
              </Link>
            </div>

            <div>
              <button 
                onClick={() => setIsSidebarSettingsOpen(prev => !prev)}
                className={`w-full flex items-center justify-between p-3 rounded-xl hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] cursor-pointer ${
                  location.pathname.startsWith('/admin/settings') || location.pathname.startsWith('/admin/password')
                    ? 'bg-slate-100 dark:bg-slate-800 text-[var(--text-primary)] font-extrabold'
                    : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                  {(!isCollapsed || isOpen) && <span>Settings</span>}
                </div>
                {(!isCollapsed || isOpen) && (
                  <ChevronDown className={`w-3.5 h-3.5 text-[var(--text-muted)] transition-transform duration-200 ${isSidebarSettingsOpen ? 'rotate-180' : ''}`} />
                )}
              </button>

              {isSidebarSettingsOpen && (!isCollapsed || isOpen) && (
                <div className="pl-6 mt-1 space-y-1 border-l border-amber-500/20 ml-5 animate-fade-in text-[11px] font-semibold">
                  <Link
                    to="/admin/settings"
                    onClick={() => onClose && onClose()}
                    className={`flex items-center gap-2 py-2 px-3 rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors ${
                      location.pathname === '/admin/settings' ? 'text-amber-500 font-extrabold' : 'text-[var(--text-secondary)]'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    <span>Profile Update</span>
                  </Link>
                  <Link
                    to="/admin/password"
                    onClick={() => onClose && onClose()}
                    className={`flex items-center gap-2 py-2 px-3 rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors ${
                      location.pathname === '/admin/password' ? 'text-amber-500 font-extrabold' : 'text-[var(--text-secondary)]'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                    <span>Password Update</span>
                  </Link>
                </div>
              )}
            </div>

          </nav>

          {/* Logout Button */}
          <div className="pt-3 border-t border-[var(--border-light)] mt-2">
            <button
              onClick={() => {
                logout();
                if (onClose) onClose();
              }}
              className="w-full flex items-center gap-3 py-2.5 px-3.5 rounded-xl text-[var(--text-secondary)] hover:bg-rose-500/10 hover:text-rose-600 transition-all font-bold cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              {(!isCollapsed || isOpen) && <span className="text-xs">Log Out</span>}
            </button>
          </div>
        </div>

        {(!isCollapsed || isOpen) && (
          <div className="p-4 border-t border-[var(--border-light)] text-[10px] text-center text-[var(--text-muted)] font-semibold">
            LuxeStay © 2026 Admin Portal
          </div>
        )}
      </aside>
    </>
  );
};
