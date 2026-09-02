import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

export const LuxurySpinner = ({ 
  size = 'md', 
  label = '', 
  overlay = false, 
  color = 'amber',
  className = '' 
}) => {
  const sizeMap = {
    xs: 'w-3.5 h-3.5 border-2',
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-3',
    xl: 'w-16 h-16 border-4'
  };

  const colorStyles = {
    amber: 'border-amber-500/20 border-t-amber-500 text-amber-500',
    emerald: 'border-emerald-500/20 border-t-emerald-500 text-emerald-500',
    gold: 'border-[#e2f896]/20 border-t-[#c6e45c] text-[#d4ed83]',
    dark: 'border-slate-800/20 border-t-slate-900 text-slate-900'
  };

  const spinner = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className="relative flex items-center justify-center">
        {/* Glowing aura */}
        <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-md animate-pulse"></div>
        
        {/* Outer Ring */}
        <div 
          className={`${sizeMap[size] || sizeMap.md} ${colorStyles[color] || colorStyles.amber} rounded-full animate-spin`}
          style={{ animationDuration: '0.8s' }}
        ></div>

        {/* Inner Sparkle Icon */}
        {(size === 'lg' || size === 'xl') && (
          <Sparkles className="absolute w-5 h-5 text-amber-500 animate-pulse" />
        )}
      </div>

      {label && (
        <span className="text-xs font-black tracking-wider uppercase text-slate-700 dark:text-slate-200 flex items-center gap-1.5 animate-pulse">
          {label}
        </span>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 backdrop-blur-md animate-fade-in">
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-amber-500/30 shadow-2xl flex flex-col items-center gap-4 text-center max-w-xs">
          {spinner}
        </div>
      </div>
    );
  }

  return spinner;
};

export default LuxurySpinner;
