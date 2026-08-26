import React from 'react';

export const PrivacyPolicy = () => {
  return (
    <div className="container max-w-4xl pt-16 pb-12 space-y-6 animate-fade-in text-sm text-[var(--text-secondary)]">
      <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Privacy Policy</h1>
      <p className="text-xs text-[var(--text-muted)]">Last updated: August 2026</p>
      
      <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-light)] space-y-4">
        <h3 className="text-base font-bold text-[var(--text-primary)]">1. Data Protection</h3>
        <p>LuxeStay employs 256-bit SSL encryption to safeguard all customer booking information, stay vouchers, and payment transaction details.</p>
      </div>
    </div>
  );
};
