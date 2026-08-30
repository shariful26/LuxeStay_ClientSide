import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Building2, ShieldCheck, Award, HeartHandshake, Phone, Mail, MapPin } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';

export const Footer = () => {
  const location = useLocation();
  const { language, setLanguage, languages, t } = useLanguage();
  const { currency, setCurrency, currencies } = useCurrency();
  const isPortal = location.pathname.startsWith('/admin') || location.pathname.startsWith('/partner') || location.pathname.startsWith('/customer');

  if (isPortal) return null;

  return (
    <footer className="bg-slate-950 text-slate-400 pt-16 pb-12 border-t border-slate-800">
      <div className="container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        
        {/* Brand & Intro */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-3.5">
            <img 
              src="/logo.png" 
              alt="LuxeStay" 
              className="h-14 w-auto object-contain drop-shadow-lg" 
            />
            <div>
              <span className="text-2xl font-black text-white tracking-tight block leading-none">LUXESTAY</span>
              <span className="text-[9px] uppercase font-extrabold tracking-widest text-amber-400 block mt-1">Luxury Hospitality</span>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-slate-400 pr-4">
            The world's premier marketplace for luxury overwater bungalows, 5-star cliffside suites, traditional Japanese Ryokans, and high-altitude alpine chalets.
          </p>
          <div className="flex items-center gap-4 pt-2">
            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> {t('verifiedGuest')}
            </span>
            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
              <Award className="w-4 h-4 text-amber-400" /> {t('bestRate')}
            </span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Public Pages</h4>
          <ul className="space-y-2.5 text-xs font-medium">
            <li><Link to="/hotels" className="hover:text-amber-400 transition-colors">{t('hotels')}</Link></li>
            <li><Link to="/destinations" className="hover:text-amber-400 transition-colors">{t('destinations')}</Link></li>
            <li><Link to="/offers" className="hover:text-amber-400 transition-colors">{t('offers')}</Link></li>
            <li><Link to="/about" className="hover:text-amber-400 transition-colors">About Us</Link></li>
            <li><Link to="/blog" className="hover:text-amber-400 transition-colors">Travel Blog</Link></li>
            <li><Link to="/faq" className="hover:text-amber-400 transition-colors">Help & FAQ</Link></li>
            <li><Link to="/contact" className="hover:text-amber-400 transition-colors">{t('contact')}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Customer & Portals</h4>
          <ul className="space-y-2.5 text-xs font-medium">
            <li><Link to="/login" className="hover:text-amber-400 transition-colors">Sign In / Register</Link></li>
            <li><Link to="/customer/dashboard" className="hover:text-amber-400 transition-colors">Customer Dashboard</Link></li>
            <li><Link to="/customer/bookings" className="hover:text-amber-400 transition-colors">My Bookings</Link></li>
            <li><Link to="/customer/wishlist" className="hover:text-amber-400 transition-colors">Saved Wishlist</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Legal & Trust</h4>
          <ul className="space-y-2.5 text-xs font-medium">
            <li><Link to="/terms" className="hover:text-amber-400 transition-colors">Terms of Service</Link></li>
            <li><Link to="/privacy" className="hover:text-amber-400 transition-colors">Privacy Policy</Link></li>
            <li><Link to="/partner/hotels/new" className="hover:text-amber-400 transition-colors flex items-center gap-1 text-amber-400 font-bold">List Your Property</Link></li>
          </ul>
          <div className="mt-6 pt-4 border-t border-slate-800 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-400"><Phone className="w-3.5 h-3.5 text-amber-500" /> +1 (800) 555-LUXE</div>
            <div className="flex items-center gap-2 text-slate-400"><Mail className="w-3.5 h-3.5 text-amber-500" /> support@luxestay.com</div>
          </div>
        </div>

      </div>

      <div className="container mt-12 pt-6 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
        <p>© 2026 LuxeStay. All rights reserved. ThemeForest Commercial License Item.</p>
        <div className="flex items-center gap-6 mt-4 md:mt-0 font-semibold text-slate-400">
          {/* Footer Currency Selector */}
          <select 
            value={currency} 
            onChange={(e) => setCurrency(e.target.value)}
            className="bg-transparent text-slate-400 hover:text-white cursor-pointer outline-none transition-colors py-1"
          >
            {Object.keys(currencies).map(code => (
              <option key={code} value={code} className="bg-slate-900 text-slate-200">
                {code} ({currencies[code].symbol})
              </option>
            ))}
          </select>

          {/* Footer Language Selector */}
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-transparent text-slate-400 hover:text-white cursor-pointer outline-none transition-colors py-1"
          >
            {Object.values(languages).map((lang) => (
              <option key={lang.code} value={lang.code} className="bg-slate-900 text-slate-200">
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>

          <Link to="/terms" className="hover:underline hover:text-white">Terms</Link>
          <Link to="/privacy" className="hover:underline hover:text-white">Privacy</Link>
        </div>
      </div>
    </footer>
  );
};
