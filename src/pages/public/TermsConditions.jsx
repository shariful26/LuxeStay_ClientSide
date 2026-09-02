import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, FileText, CreditCard, RefreshCw, Clock, 
  Sparkles, CheckCircle2, AlertCircle, Phone, Mail, HelpCircle, Award, Scale, ChevronRight, ArrowLeft 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const TermsConditions = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const sections = [
    {
      id: 'acceptance',
      icon: <CheckCircle2 className="w-5 h-5 text-amber-500" />,
      title: '1. Acceptance of Terms & Marketplace Scope',
      content: (
        <div className="space-y-3">
          <p>
            Welcome to LuxeStay ("Platform", "we", "us", or "our"). By browsing, accessing, or booking any luxury resort, overwater bungalow, alpine chalet, or private villa through LuxeStay, you ("Guest", "Customer", or "Partner") agree to be legally bound by these Terms and Conditions.
          </p>
          <p>
            LuxeStay operates as an exclusive, audited luxury hospitality marketplace connecting discerning global travelers directly with certified independent 5-star hotels, luxury boutique resorts, and private villa managers worldwide.
          </p>
        </div>
      )
    },
    {
      id: 'gold-standard',
      icon: <Award className="w-5 h-5 text-amber-500" />,
      title: '2. 50-Point Gold Quality Standard & Room Accuracy',
      content: (
        <div className="space-y-3">
          <p>
            Every property cataloged on LuxeStay must pass our rigorous 50-point inspection protocol prior to listing. We strictly guarantee that:
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs text-[var(--text-secondary)] pl-2">
            <li>Room dimensions, square footage, bed configurations, and private plunge pool amenities match digital voucher specifications.</li>
            <li>High-speed fiber Wi-Fi, acoustic soundproofing, and climate control standards meet five-star hospitality benchmarks.</li>
            <li>If an assigned suite materially deviates from the confirmed listing, LuxeStay Concierge will arrange an immediate complimentary upgrade or alternative five-star relocation.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'pricing-booking',
      icon: <CreditCard className="w-5 h-5 text-amber-500" />,
      title: '3. Guaranteed Best Rates & Digital Stay Vouchers',
      content: (
        <div className="space-y-3">
          <p>
            Direct hotelier integration guarantees transparent, all-inclusive rates with zero hidden broker markups or surprise booking fees at checkout.
          </p>
          <p>
            Upon successful reservation, the platform instantly generates a tamper-proof, cryptographically signed <strong>Digital Stay Voucher</strong> featuring a unique Booking Reference (e.g., <code>BK-XXXXX</code>) and QR verification code for expedited VIP check-in.
          </p>
        </div>
      )
    },
    {
      id: 'cancellation-refunds',
      icon: <RefreshCw className="w-5 h-5 text-amber-500" />,
      title: '4. Flexible Cancellation & Instant Wallet Refunds',
      content: (
        <div className="space-y-3">
          <p>
            We believe luxury travel should be seamless and adaptable. Our standardized platform cancellation guidelines are as follows:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] space-y-1">
              <span className="text-xs font-black text-emerald-500 block">✓ 100% Full Refund</span>
              <p className="text-[11px] text-[var(--text-secondary)]">Cancellations made 48 hours or more prior to scheduled 3:00 PM local property check-in.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] space-y-1">
              <span className="text-xs font-black text-amber-500 block">✓ Flexible Date Shifting</span>
              <p className="text-[11px] text-[var(--text-secondary)]">Shift your stay dates up to 24 hours in advance with zero administrative rebooking penalties.</p>
            </div>
          </div>
          <p className="text-xs text-[var(--text-muted)] pt-1">
            Approved refunds are credited back to the original payment method or instant LuxeStay Guest Wallet within 1–3 business banking days.
          </p>
        </div>
      )
    },
    {
      id: 'checkin-etiquette',
      icon: <Clock className="w-5 h-5 text-amber-500" />,
      title: '5. VIP Check-In, Incidentals & Sanctuary Etiquette',
      content: (
        <div className="space-y-3">
          <p>
            Standard property check-in commences at 3:00 PM local time, with check-out scheduled at 11:00 AM (complimentary late 2:00 PM check-out available for LuxeStay Elite Rewards members, subject to availability).
          </p>
          <p>
            Guests must present a valid government-issued photo ID (or passport for international destinations) along with their digital voucher upon arrival. To maintain peaceful resort sanctuaries, all suites observe designated quiet hours after 10:00 PM.
          </p>
        </div>
      )
    },
    {
      id: 'concierge-transfers',
      icon: <Sparkles className="w-5 h-5 text-amber-500" />,
      title: '6. Bespoke Concierge Desk & Transfer Logistics',
      content: (
        <div className="space-y-3">
          <p>
            LuxeStay provides 24/7 complimentary concierge assistance for coordinating airport limousine chauffeurs, speed-boat reef arrivals, helicopter charter transfers, and Michelin chef reservations.
          </p>
          <p>
            While LuxeStay coordinates third-party luxury transport operators, flight delays and marine weather advisories remain subject to safe navigation regulations and operator safety protocols.
          </p>
        </div>
      )
    },
    {
      id: 'partner-obligations',
      icon: <Scale className="w-5 h-5 text-amber-500" />,
      title: '7. Partner Hotelier Integrity & Commission Structure',
      content: (
        <div className="space-y-3">
          <p>
            Registered hotel managers and property owners maintain legal authorization over their listed suites and agree to honor confirmed reservation rates without on-arrival surcharges.
          </p>
          <p>
            LuxeStay operates on a transparent 15% platform infrastructure and host commission, retaining 85% net payouts directly for the hotelier, settled promptly via digital wallet or international wire transfer.
          </p>
        </div>
      )
    },
    {
      id: 'disputes-jurisdiction',
      icon: <ShieldCheck className="w-5 h-5 text-amber-500" />,
      title: '8. Dispute Resolution & 24/7 Guest Advocate Desk',
      content: (
        <div className="space-y-3">
          <p>
            In the rare event of an unresolved on-property dispute, LuxeStay’s dedicated Guest Advocate team provides immediate real-time mediation to ensure guest satisfaction, room reassignments, or equitable compensation.
          </p>
          <p>
            These terms are governed by international commercial hospitality standards and jurisdiction regulations.
          </p>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-12 pt-16 pb-20 animate-fade-in font-sans">
      
      {/* Page Header */}
      <section className="container px-4 max-w-5xl mx-auto space-y-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border-light)] bg-[var(--bg-card)] hover:bg-[var(--bg-tertiary)] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer shadow-xs hover:border-amber-500/40"
        >
          <ArrowLeft className="w-4 h-4 text-amber-500" />
          <span>Back to Previous Page</span>
        </button>

        <div className="text-center max-w-3xl mx-auto space-y-4 pt-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-500 text-xs font-black uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5" />
            <span>Legal & Transparency</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-[var(--text-primary)] tracking-tight">
            Terms & Conditions of Service
          </h1>

          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-medium">
            Clear, transparent, and guest-centric guidelines governing reservations, 5-star quality standards, flexible cancellations, and partner hotelier policies on the LuxeStay marketplace.
          </p>

          <span className="text-[11px] font-mono text-[var(--text-muted)] block">
            Last Verified & Effective: August 2026 • Version 3.4
          </span>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="container px-4 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Navigation Quick Links (Desktop Sticky) */}
          <div className="hidden lg:block lg:col-span-4 sticky top-28 space-y-4">
            <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)]">Table of Contents</h4>
                <button 
                  onClick={() => navigate(-1)} 
                  className="text-[11px] font-bold text-amber-500 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3 h-3" /> Back
                </button>
              </div>

              <nav className="space-y-1.5 text-xs font-bold">
                {sections.map((sec) => (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    className="flex items-center justify-between p-2 rounded-xl text-[var(--text-secondary)] hover:text-amber-500 hover:bg-[var(--bg-tertiary)] transition-all"
                  >
                    <span className="truncate">{sec.title.split('. ')[1]}</span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-50 flex-shrink-0 ml-1" />
                  </a>
                ))}
              </nav>

              <div className="pt-4 border-t border-[var(--border-light)] space-y-2">
                <Link to="/privacy" className="text-xs font-bold text-amber-500 hover:underline flex items-center justify-between p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)]">
                  <span>View Privacy Policy</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
                <Link to="/faq" className="text-xs font-bold text-[var(--text-secondary)] hover:text-amber-500 hover:underline flex items-center justify-between p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)]">
                  <span>Frequently Asked Questions</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
                <button 
                  onClick={() => navigate(-1)}
                  className="w-full text-left text-xs font-bold text-slate-400 hover:text-amber-500 p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] flex items-center gap-1.5 cursor-pointer pt-2 border-t border-[var(--border-light)]"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-amber-500" />
                  <span>Return to Previous Page</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Structured Content Cards */}
          <div className="lg:col-span-8 space-y-6">
            {sections.map((sec) => (
              <div 
                key={sec.id} 
                id={sec.id} 
                className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-md space-y-4 scroll-mt-28 hover:border-amber-500/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                    {sec.icon}
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-[var(--text-primary)]">
                    {sec.title}
                  </h2>
                </div>

                <div className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  {sec.content}
                </div>
              </div>
            ))}

            {/* Need Legal Assistance Box */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white border border-amber-500/30 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="text-sm font-black text-white">Questions Regarding Our Terms?</h4>
                <p className="text-xs text-slate-300">Our 24/7 legal and guest relations team is available for any clarifications.</p>
              </div>
              <div className="flex items-center gap-3">
                <a 
                  href="mailto:legal@luxestay.com" 
                  className="btn bg-amber-500 text-slate-950 hover:bg-amber-400 font-extrabold text-xs py-2.5 px-5 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" /> legal@luxestay.com
                </a>
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
};

export default TermsConditions;
