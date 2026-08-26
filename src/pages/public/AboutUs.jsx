import React from 'react';
import { Building2, ShieldCheck, Award, Users, Globe } from 'lucide-react';

export const AboutUs = () => {
  return (
    <div className="container pt-16 pb-16 space-y-16 animate-fade-in">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-extrabold uppercase tracking-widest text-amber-500 block pt-4">Our Vision</span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--text-primary)]">Redefining Luxury Travel Hospitality</h1>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          LuxeStay is built to connect discerning travelers with the world's most breathtaking, verified 5-star properties, private overwater bungalows, and high-altitude sanctuaries.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-light)] space-y-3 text-center">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[var(--text-primary)]">100% Verified Stays</h3>
          <p className="text-xs text-[var(--text-secondary)]">Every suite on our platform undergoes rigorous 50-point hospitality quality inspection.</p>
        </div>

        <div className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-light)] space-y-3 text-center">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Best Price Guarantee</h3>
          <p className="text-xs text-[var(--text-secondary)]">Direct partner integration ensures zero hidden markups and guaranteed lowest rates.</p>
        </div>

        <div className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-light)] space-y-3 text-center">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
            <Globe className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Global Partner Network</h3>
          <p className="text-xs text-[var(--text-secondary)]">Representing top luxury hotel chains and independent boutique owners worldwide.</p>
        </div>
      </div>
    </div>
  );
};
