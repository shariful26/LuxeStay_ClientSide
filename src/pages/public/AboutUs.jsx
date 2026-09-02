import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Building2, ShieldCheck, Award, Users, Globe, Sparkles, Star, 
  CheckCircle2, Coffee, Compass, HeartHandshake, ArrowRight, Shield, 
  Utensils, Waves, Mountain, Plane, Gem, Clock, MapPin, ArrowLeft 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const AboutUs = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const stats = [
    { number: '150+', label: 'Curated Ultra-Luxury Resorts', sub: 'Across 45+ premier worldwide destinations' },
    { number: '24,000+', label: 'VIP Guests Welcomed', sub: 'With 99.8% five-star verified satisfaction' },
    { number: '50-Point', label: 'Gold Quality Protocol', sub: 'Every suite personally audited and certified' },
    { number: '24/7', label: 'White-Glove Concierge', sub: 'Private yacht, helicopter & bespoke itineraries' },
  ];

  const pillars = [
    {
      icon: <Gem className="w-6 h-6 text-amber-500" />,
      title: 'Architectural & Suite Splendor',
      desc: 'From cantilevered cliffside suites in Santorini to authentic overwater villas in Bora Bora, each property is chosen for timeless aesthetics and panoramic wonder.'
    },
    {
      icon: <Utensils className="w-6 h-6 text-amber-500" />,
      title: 'Michelin-Caliber Gastronomy',
      desc: 'Indulge in organic rooftop farm-to-table cuisine, wine cellars curated by master sommeliers, and private beach dinners prepared by celebrity guest chefs.'
    },
    {
      icon: <Waves className="w-6 h-6 text-amber-500" />,
      title: 'Private Infinity Pools & Spas',
      desc: 'Uncompromised relaxation with private heated saltwater plunge pools, thermal Ayurvedic hammams, and therapeutic wellness retreats nestled in nature.'
    },
    {
      icon: <Plane className="w-6 h-6 text-amber-500" />,
      title: 'VIP Chauffeur & Yacht Transfers',
      desc: 'Experience seamless arrivals with helicopter transfers from international runways directly to your private island helipad or luxury marina.'
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-amber-500" />,
      title: '100% Guaranteed Direct Pricing',
      desc: 'Direct hotelier API integration guarantees absolute rate parity with zero hidden broker markups, accompanied by instant tamper-proof digital stay vouchers.'
    },
    {
      icon: <HeartHandshake className="w-6 h-6 text-amber-500" />,
      title: 'Dedicated 24/7 Concierge Support',
      desc: 'Our multilingual desk attends to bespoke requests, itinerary management, late check-outs, and customized anniversary surprises around the clock.'
    }
  ];

  const leadership = [
    {
      name: 'Alexander Vance',
      role: 'Co-Founder & Chief Executive Officer',
      bio: 'Former Executive Director with over 18 years shaping 5-star hospitality flagships across Europe and Southeast Asia.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
      tag: 'Executive Vision'
    },
    {
      name: 'Elena Rostova',
      role: 'Head of Global Property Curation',
      bio: 'Renowned international architectural critic and luxury travel consultant inspecting hidden boutique gems worldwide.',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
      tag: 'Quality Standard'
    },
    {
      name: 'Kenji Takahashi',
      role: 'VP of VIP Guest Experience',
      bio: 'Master of hospitality concierge traditions, overseeing high-net-worth guest services, private charters, and security.',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
      tag: 'Guest Experience'
    }
  ];

  return (
    <div className="space-y-20 pb-20 animate-fade-in font-sans">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-16 overflow-hidden border-b border-[var(--border-light)] bg-gradient-to-b from-[var(--bg-tertiary)]/40 via-[var(--bg-primary)] to-[var(--bg-primary)]">
        <div className="container relative z-10 max-w-4xl mx-auto space-y-6 px-4">
          
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border-light)] bg-[var(--bg-card)] hover:bg-[var(--bg-tertiary)] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer shadow-xs hover:border-amber-500/40"
          >
            <ArrowLeft className="w-4 h-4 text-amber-500" />
            <span>Back to Previous Page</span>
          </button>

          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-black uppercase tracking-widest shadow-xs animate-scale-up">
              <Sparkles className="w-3.5 h-3.5" />
              <span>The Gold Standard of Hospitality</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[var(--text-primary)] tracking-tight leading-[1.15]">
              Curating Extraordinary Escapes for the World's Discerning Travelers
            </h1>

            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto font-medium">
              LuxeStay is an elite hospitality collective connecting travelers to certified private island retreats, cliffside overwater villas, Michelin culinary sanctuaries, and alpine chalets with uncompromising privacy.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <Link 
              to="/hotels" 
              className="btn btn-primary text-xs py-3.5 px-7 shadow-lg shadow-amber-500/25 flex items-center gap-2 font-black cursor-pointer hover:scale-105 transition-all"
            >
              <span>Explore Curated Hotels</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              to="/contact" 
              className="btn btn-outline text-xs py-3.5 px-6 font-bold cursor-pointer hover:border-amber-500 transition-colors"
            >
              Contact Concierge Desk
            </Link>
          </div>

        </div>
      </section>

      {/* 2. CINEMATIC LUXURY VISUAL SHOWCASE */}
      <section className="container px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6">
          
          <div className="md:col-span-8 relative h-80 sm:h-[450px] rounded-3xl overflow-hidden shadow-2xl group border border-[var(--border-light)]">
            <img 
              src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=85" 
              alt="Presidential Overwater Villa Suite" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-[0.88]" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
              <span className="badge badge-gold text-[10px] font-black uppercase">Maldives Sanctuary</span>
              <h3 className="text-xl sm:text-2xl font-black text-white">Private Lagoon Overwater Pavilions</h3>
              <p className="text-xs text-slate-300 font-medium">Direct ocean access, glass-bottom floor lounges, and dedicated 24-hour butler service.</p>
            </div>
          </div>

          <div className="md:col-span-4 grid grid-cols-1 gap-4 lg:gap-6">
            <div className="relative h-48 sm:h-[213px] rounded-3xl overflow-hidden shadow-lg group border border-[var(--border-light)]">
              <img 
                src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80" 
                alt="Cliffside Resort Infinity Pool" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-[0.88]" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider block">Santorini, Greece</span>
                <h4 className="text-sm font-extrabold text-white">Caldera Sunset Infinity Suites</h4>
              </div>
            </div>

            <div className="relative h-48 sm:h-[213px] rounded-3xl overflow-hidden shadow-lg group border border-[var(--border-light)]">
              <img 
                src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80" 
                alt="Historic Kyoto Luxury Ryokan" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-[0.88]" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider block">Kyoto, Japan</span>
                <h4 className="text-sm font-extrabold text-white">Traditional Onsen & Bamboo Estates</h4>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. BRAND STORY & PHILOSOPHY */}
      <section className="container px-4">
        <div className="p-8 sm:p-12 lg:p-16 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-xl grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-amber-500 block">The LuxeStay Heritage</span>
              <h2 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] leading-tight">
                Born From a Passion for Uncompromising Luxury & Authenticity
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Founded in 2020 by visionary hoteliers and seasoned global travelers, LuxeStay was born out of frustration with impersonal aggregators and cookie-cutter travel agencies. We set out with a singular mission: to handpick only the top 1% of independent boutique hotels, private islands, and historic palaces.
            </p>

            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Every property on LuxeStay is independently verified against our rigorous 50-Point Inspection standard — from acoustic silence and Egyptian cotton linens to private chef credentials and round-the-clock security.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div className="flex items-center gap-2.5 text-xs font-bold text-[var(--text-primary)]">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Zero Broker Commission Markups</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-bold text-[var(--text-primary)]">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Instant Verifiable Digital Vouchers</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-bold text-[var(--text-primary)]">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Complimentary VIP Room Upgrades</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-bold text-[var(--text-primary)]">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Flexible Cancellation & Date Shift</span>
              </div>
            </div>
          </div>

          {/* Right Floating Card Stack */}
          <div className="relative">
            <div className="rounded-3xl overflow-hidden shadow-2xl border border-[var(--border-light)]">
              <img 
                src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1000&q=80" 
                alt="Luxury Hotel Lobby & Butler" 
                className="w-full h-80 sm:h-96 object-cover" 
              />
            </div>
            <div className="absolute -bottom-6 -left-6 sm:bottom-6 sm:-left-6 p-5 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-amber-500/40 text-white shadow-2xl max-w-xs space-y-2">
              <div className="flex items-center gap-1 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-200">The 5-Star Assurance</h4>
              <p className="text-[11px] text-slate-300 font-medium">"Over 98% of our guests rate their stay as the most memorable trip of their lifetime."</p>
            </div>
          </div>

        </div>
      </section>

      {/* 4. KEY STATS & GLOBAL FOOTPRINT */}
      <section className="container px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((st, i) => (
            <div key={i} className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-md hover:border-amber-500/40 transition-all space-y-2 text-center group">
              <span className="text-3xl sm:text-4xl font-black text-amber-500 block group-hover:scale-105 transition-transform">{st.number}</span>
              <h4 className="text-sm font-extrabold text-[var(--text-primary)]">{st.label}</h4>
              <p className="text-xs text-[var(--text-secondary)]">{st.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. CORE PILLARS OF EXCELLENCE */}
      <section className="container px-4 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-black uppercase tracking-widest text-amber-500 block">Why Discerning Guests Choose Us</span>
          <h2 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)]">
            Our Pillars of Ultra-Luxury Service
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            Every booking through LuxeStay is backed by our signature white-glove service standards and private guest protection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pillars.map((pil, idx) => (
            <div key={idx} className="p-7 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-md hover:shadow-xl hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center font-bold">
                  {pil.icon}
                </div>
                <h3 className="text-base font-extrabold text-[var(--text-primary)]">{pil.title}</h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{pil.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. LEADERSHIP & HOSPITALITY CURATORS */}
      <section className="container px-4 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-black uppercase tracking-widest text-amber-500 block">Hospitality Leadership</span>
          <h2 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)]">
            Guided by Seasoned Hoteliers
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            Meet the international hoteliers, architectural curators, and guest experience veterans directing LuxeStay's global vision.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {leadership.map((leader, index) => (
            <div key={index} className="rounded-3xl bg-[var(--bg-card)] border border-[var(--border-light)] overflow-hidden shadow-lg flex flex-col justify-between">
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={leader.image} 
                  alt={leader.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <span className="absolute top-3 right-3 badge badge-gold font-extrabold text-[10px]">{leader.tag}</span>
              </div>
              <div className="p-6 space-y-2">
                <h3 className="text-base font-extrabold text-[var(--text-primary)]">{leader.name}</h3>
                <span className="text-xs font-bold text-amber-500 block">{leader.role}</span>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed pt-1">{leader.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. BOTTOM CTA CALLOUT */}
      <section className="container px-4">
        <div className="relative p-8 sm:p-14 rounded-3xl bg-slate-950 text-white overflow-hidden shadow-2xl border border-amber-500/30 text-center space-y-6">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 blur-3xl pointer-events-none rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 blur-3xl pointer-events-none rounded-full"></div>

          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="badge badge-gold uppercase text-[10px] font-black tracking-wider">Join Elite LuxeStay Circle</span>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              Ready to Experience the World's Finest Private Escapes?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              Browse our master collection of audited luxury villas, overwater bungalows, and historic boutique retreats with guaranteed best rates.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link 
                to="/hotels" 
                className="btn bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs py-3.5 px-8 rounded-xl shadow-lg hover:scale-105 transition-all"
              >
                Browse Suites Catalog
              </Link>
              <Link 
                to="/partner/hotels/new" 
                className="btn btn-outline border-white/30 text-white hover:bg-white/10 font-bold text-xs py-3.5 px-7 rounded-xl transition-all"
              >
                List Your Hotel Property
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default AboutUs;
