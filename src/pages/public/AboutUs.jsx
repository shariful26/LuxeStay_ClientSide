import React from 'react';
import { Building2, ShieldCheck, Award, Users, Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const AboutUs = () => {
  const { t } = useLanguage();

  return (
    <div className="container pt-16 pb-16 space-y-16 animate-fade-in">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-extrabold uppercase tracking-widest text-amber-500 block pt-4">{t('about')}</span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--text-primary)]">{t('goldStandard')}</h1>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          {t('footerBrandDesc')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-light)] space-y-3 text-center">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[var(--text-primary)]">{t('verifiedGuest')}</h3>
          <p className="text-xs text-[var(--text-secondary)]">{t('verifiedSub')}</p>
        </div>

        <div className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-light)] space-y-3 text-center">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[var(--text-primary)]">{t('bestRate')}</h3>
          <p className="text-xs text-[var(--text-secondary)]">{t('bestRateSub')}</p>
        </div>

        <div className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-light)] space-y-3 text-center">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
            <Globe className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[var(--text-primary)]">{t('concierge')}</h3>
          <p className="text-xs text-[var(--text-secondary)]">{t('conciergeSub')}</p>
        </div>
      </div>
    </div>
  );
};
