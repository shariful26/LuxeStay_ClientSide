import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, ShieldCheck, HelpCircle, ArrowUp, 
  Phone, Mail, Globe, ExternalLink, Sparkles, Lock, CreditCard, ChevronRight
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';

export const PortalFooter = ({ role = 'customer' }) => {
  const { language, setLanguage, languages } = useLanguage();
  const { currency, setCurrency, currencies } = useCurrency();
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const roleLabel = role === 'admin' 
    ? 'Admin Console' 
    : role === 'manager' 
    ? 'Hotel Manager Hub' 
    : 'Guest Portal';

  return (
    <footer className="relative mt-auto overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-slate-300 border-t border-slate-800/80 shadow-[0_-10px_30px_rgba(0,0,0,0.35)] transition-all duration-300">
      
      {/* 🌟 Dynamic Top Golden Neon Glowing Border */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent shadow-[0_0_12px_rgba(245,158,11,0.6)]" />

      {/* Subtle Background Radial Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-20 bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-1/4 w-96 h-20 bg-indigo-500/10 blur-3xl pointer-events-none rounded-full" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        
        {/* 1. Left: Eye-Catching Gold Brand & Status Node */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 sm:gap-3.5">
          
          <Link to="/" className="flex items-center gap-2 group">
            <img 
              src="/logo.png" 
              alt="LuxeStay" 
              className="h-8 w-auto object-contain drop-shadow-md group-hover:scale-105 transition-transform" 
            />
            <span className="font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-400">
              LUXESTAY
            </span>
          </Link>

          <span className="text-slate-700">•</span>
          
          <span className="text-[11px] font-semibold text-slate-400">
            © {currentYear} LuxeStay Inc.
          </span>

          <span className="hidden sm:inline text-slate-700">•</span>

          {/* Glowing Live System Status Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-[10px] shadow-[0_0_10px_rgba(16,185,129,0.15)]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
            </span>
            <span className="tracking-wide">99.99% Online</span>
          </div>

          {/* Role Badge Pill */}
          <div className="hidden lg:flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-[10px] font-extrabold tracking-wide">
            <Sparkles className="w-2.5 h-2.5" />
            <span>{roleLabel}</span>
          </div>

        </div>

        {/* 2. Center: Interactive Quick Support & Policy Links */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-[11px] font-semibold text-slate-300">
          
          <a 
            href="mailto:support@luxestay.com" 
            className="px-2.5 py-1 rounded-lg bg-slate-900/60 hover:bg-amber-500/15 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-amber-400 transition-all flex items-center gap-1.5 shadow-xs"
            title="Email 24/7 Priority Support"
          >
            <Mail className="w-3 h-3 text-amber-400" />
            <span>support@luxestay.com</span>
          </a>

          <a 
            href="tel:+18005555893" 
            className="hidden sm:flex px-2.5 py-1 rounded-lg bg-slate-900/60 hover:bg-amber-500/15 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-amber-400 transition-all items-center gap-1.5 shadow-xs"
          >
            <Phone className="w-3 h-3 text-amber-400" />
            <span>+1 (800) 555-LUXE</span>
          </a>

          <Link 
            to="/faq" 
            className="px-2 py-1 rounded-lg hover:bg-slate-800/80 hover:text-amber-400 text-slate-400 transition-colors flex items-center gap-1"
          >
            <HelpCircle className="w-3 h-3 text-amber-400/80" />
            <span>Help</span>
          </Link>

          <Link 
            to="/terms" 
            className="px-2 py-1 rounded-lg hover:bg-slate-800/80 hover:text-amber-400 text-slate-400 transition-colors"
          >
            Terms
          </Link>

          <Link 
            to="/privacy" 
            className="px-2 py-1 rounded-lg hover:bg-slate-800/80 hover:text-amber-400 text-slate-400 transition-colors"
          >
            Privacy
          </Link>

        </div>

        {/* 3. Right: Dark Glass Currency & Language Switchers + Gold Scroll Top */}
        <div className="flex items-center gap-2">
          
          {/* Eye-catching Currency Selector */}
          <div className="relative">
            <select 
              value={currency} 
              onChange={(e) => setCurrency(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/50 text-[11px] font-extrabold text-amber-400 cursor-pointer outline-none transition-all shadow-xs"
              aria-label="Currency Selector"
            >
              {Object.keys(currencies).map(code => (
                <option key={code} value={code} className="bg-slate-950 text-slate-200">
                  {code} ({currencies[code].symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Eye-catching Language Selector */}
          <div className="relative">
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/50 text-[11px] font-bold text-slate-200 cursor-pointer outline-none transition-all shadow-xs"
              aria-label="Language Selector"
            >
              {Object.values(languages).map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-slate-950 text-slate-200">
                  {lang.flag} {lang.code}
                </option>
              ))}
            </select>
          </div>

          {/* Glowing Golden Scroll-to-Top Button */}
          <button
            onClick={scrollToTop}
            className="p-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-md shadow-amber-500/30 flex items-center justify-center"
            title="Scroll to Top"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>

        </div>

      </div>
    </footer>
  );
};
