import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="relative min-h-[92vh] bg-[var(--bg-primary)] flex items-center justify-center py-20 px-6 sm:px-12 lg:px-24 overflow-hidden select-none">
      
      {/* Dynamic Luxury Ambient Glow Spheres (Mesh Gradient) */}
      <div className="absolute top-1/4 left-10 w-80 h-80 rounded-full bg-amber-500/8 dark:bg-amber-500/5 blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-10 right-10 w-[450px] h-[450px] rounded-full bg-sky-500/10 dark:bg-sky-500/5 blur-[150px] pointer-events-none z-0"></div>
      
      <div className="relative z-10 max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        
        {/* Left Side: Elegant Text & Guidance */}
        <div className="lg:col-span-6 space-y-8 text-left order-2 lg:order-1 animate-fade-in">
          
          {/* Compass Icon Container */}
          <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-500 shadow-sm animate-bounce">
            <Compass className="w-6 h-6 stroke-[2]" />
          </div>
          
          {/* Main Typography */}
          <div className="space-y-4">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-amber-500 block">
              Lost in Paradise
            </span>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[var(--text-primary)] leading-[1.1] font-sans">
              Oops! Even explorers <br />
              <span className="text-amber-500 font-serif italic font-normal">take a wrong turn!</span>
            </h1>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-lg">
              Looks like this trail doesn't lead anywhere... let's find you a better path back to luxury comfort.
            </p>
          </div>

          {/* Action Call to Button */}
          <div className="pt-2">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-slate-950 text-white dark:bg-white dark:text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-slate-950/20 dark:shadow-white/5 hover:scale-[1.03] transition-all duration-300 cursor-pointer"
            >
              <span>Guide Me Home</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
          </div>
        </div>

        {/* Right Side: Visual Artwork Frame */}
        <div className="lg:col-span-6 flex justify-center order-1 lg:order-2">
          <div className="relative p-2.5 rounded-[40px] bg-[var(--bg-card)] border border-[var(--border-light)] shadow-2xl backdrop-blur-md max-w-md sm:max-w-lg w-full transform hover:scale-[1.02] hover:-rotate-1 transition-all duration-500 ease-out z-10">
            {/* Inner Frame */}
            <div className="overflow-hidden rounded-[32px] border border-[var(--border-light)]">
              <img 
                src="/images/not_found_swing.jpg" 
                alt="404 page not found illustration" 
                className="w-full h-auto object-cover brightness-[0.98] contrast-[1.02]"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
