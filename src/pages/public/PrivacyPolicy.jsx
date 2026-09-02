import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, Lock, Eye, Database, Globe, 
  CheckCircle2, Bell, Sparkles, Mail, FileText, ChevronRight, UserCheck, KeyRound, ArrowLeft, Check 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const PrivacyPolicy = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const sections = [
    {
      id: 'commitment',
      icon: <Lock className="w-5 h-5 text-amber-500" />,
      title: '1. Our Privacy Pledge to VIP Guests',
      content: (
        <div className="space-y-3">
          <p>
            At LuxeStay, protecting the confidentiality, personal itineraries, and financial security of our guests and hotel partners is fundamental to our ultra-luxury ethos.
          </p>
          <p>
            This Privacy Policy explains how LuxeStay collects, protects, processes, and respects your personal information across our web platform and concierge communication channels.
          </p>
        </div>
      )
    },
    {
      id: 'collection',
      icon: <Database className="w-5 h-5 text-amber-500" />,
      title: '2. Information We Collect & Purpose',
      content: (
        <div className="space-y-3">
          <p>
            To deliver an exemplary, bespoke hospitality experience, we collect specific categories of information:
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs text-[var(--text-secondary)] pl-2">
            <li><strong>Personal Identity:</strong> Full legal name, email address, contact phone number, and profile photograph.</li>
            <li><strong>Reservation Specifics:</strong> Check-in/out dates, guest count, chosen suite types, meal plans, and personalized requests (e.g., anniversary arrangements or dietary preferences).</li>
            <li><strong>Check-in Credentials:</strong> Government ID or passport numbers strictly when mandated by destination hospitality laws.</li>
            <li><strong>Financial Tokens:</strong> Cryptographically tokenized payment authorizations processed through PCI-DSS Level 1 certified gateways.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'security-encryption',
      icon: <KeyRound className="w-5 h-5 text-amber-500" />,
      title: '3. 256-Bit SSL Encryption & Payment Vaulting',
      content: (
        <div className="space-y-3">
          <p>
            LuxeStay implements defense-grade 256-bit AES SSL/TLS encryption across all client-to-server data transmissions.
          </p>
          <p>
            We strictly enforce a <strong>Zero Raw Card Storage</strong> policy. Payment details are tokenized securely through Stripe / PCI-compliant payment infrastructure; raw CVV numbers and bank passwords are never retained on our databases.
          </p>
        </div>
      )
    },
    {
      id: 'zero-ad-selling',
      icon: <Eye className="w-5 h-5 text-amber-500" />,
      title: '4. Strict Zero-Data-Selling Policy',
      content: (
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Check className="w-3.5 h-3.5" /> Our Unbreakable Guarantee:
            </span>
            <p className="text-xs text-[var(--text-primary)] font-bold">
              LuxeStay NEVER sells, rents, monetizes, or trades guest personal records or travel habits to commercial ad brokers, telemarketers, or third-party networks.
            </p>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            Information is disclosed exclusively to the confirmed partner hotelier for check-in compliance, key card preparation, and authorized concierge transfer providers.
          </p>
        </div>
      )
    },
    {
      id: 'caching-cookies',
      icon: <Sparkles className="w-5 h-5 text-amber-500" />,
      title: '5. Instant Cache & Performance Storage',
      content: (
        <div className="space-y-3">
          <p>
            To deliver an instantaneous 0ms browsing and dashboard experience, LuxeStay utilizes secure browser LocalStorage caching for your wishlist, currency preferences, and active booking vouchers.
          </p>
          <p>
            We use essential functional cookies solely for authentication state preservation and language selection without intrusive cross-site tracking.
          </p>
        </div>
      )
    },
    {
      id: 'guest-rights',
      icon: <UserCheck className="w-5 h-5 text-amber-500" />,
      title: '6. GDPR, CCPA & International Guest Rights',
      content: (
        <div className="space-y-3">
          <p>
            Regardless of your geographic location, LuxeStay affords all guests full rights under GDPR and CCPA international data regulations:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] space-y-1">
              <span className="text-xs font-black text-[var(--text-primary)] block">Right to Access & Portability</span>
              <p className="text-[11px] text-[var(--text-secondary)]">Request a complete export of your reservations and profile history at any time.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] space-y-1">
              <span className="text-xs font-black text-[var(--text-primary)] block">Right to Erasure ("Forget Me")</span>
              <p className="text-[11px] text-[var(--text-secondary)]">Permanently delete your account, saved preferences, and booking history upon request.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'dpo-contact',
      icon: <Mail className="w-5 h-5 text-amber-500" />,
      title: '7. Data Protection Officer (DPO) Contact',
      content: (
        <div className="space-y-3">
          <p>
            If you have questions regarding this Privacy Policy, wish to exercise your data rights, or request account data removal, please contact our dedicated Privacy & Compliance Officer:
          </p>
          <div className="p-4 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-xs font-semibold space-y-1">
            <div className="font-bold text-[var(--text-primary)]">LuxeStay Global Privacy & Legal Office</div>
            <div className="text-[var(--text-secondary)]">Email: <code>privacy@luxestay.com</code></div>
            <div className="text-[var(--text-muted)]">Response Time: Within 24 business hours</div>
          </div>
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
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Security & Data Privacy</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-[var(--text-primary)] tracking-tight">
            Privacy & Data Protection Policy
          </h1>

          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-medium">
            How LuxeStay safeguards your personal details, reservation records, and payment security with 256-bit encryption and a strict zero-data-selling guarantee.
          </p>

          <span className="text-[11px] font-mono text-[var(--text-muted)] block">
            Last Verified & Effective: August 2026 • GDPR & CCPA Compliant
          </span>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="container px-4 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Navigation Quick Links */}
          <div className="hidden lg:block lg:col-span-4 sticky top-28 space-y-4">
            <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)]">Privacy Sections</h4>
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
                <Link to="/terms" className="text-xs font-bold text-amber-500 hover:underline flex items-center justify-between p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)]">
                  <span>View Terms & Conditions</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
                <Link to="/faq" className="text-xs font-bold text-[var(--text-secondary)] hover:text-amber-500 hover:underline flex items-center justify-between p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)]">
                  <span>Security FAQ</span>
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

            {/* Contact Privacy Box */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white border border-amber-500/30 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="text-sm font-black text-white">Have a Privacy Inquiry or Data Request?</h4>
                <p className="text-xs text-slate-300">Contact our Data Protection Officer directly for assistance.</p>
              </div>
              <div className="flex items-center gap-3">
                <a 
                  href="mailto:privacy@luxestay.com" 
                  className="btn bg-amber-500 text-slate-950 hover:bg-amber-400 font-extrabold text-xs py-2.5 px-5 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" /> privacy@luxestay.com
                </a>
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
};

export default PrivacyPolicy;
