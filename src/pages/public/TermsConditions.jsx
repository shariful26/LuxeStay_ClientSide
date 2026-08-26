import React from 'react';

export const TermsConditions = () => {
  return (
    <div className="container max-w-4xl pt-16 pb-12 space-y-6 animate-fade-in text-sm text-[var(--text-secondary)]">
      <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Terms & Conditions</h1>
      <p className="text-xs text-[var(--text-muted)]">Last updated: August 2026</p>
      
      <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-light)] space-y-4">
        <h3 className="text-base font-bold text-[var(--text-primary)]">1. Acceptance of Terms</h3>
        <p>By accessing or using the LuxeStay platform, you agree to comply with and be bound by these marketplace terms of service.</p>
        
        <h3 className="text-base font-bold text-[var(--text-primary)]">2. Booking Reservations</h3>
        <p>All reservations confirmed through our digital booking checkout engine are legally binding agreements between the guest and the partner property.</p>
      </div>
    </div>
  );
};
