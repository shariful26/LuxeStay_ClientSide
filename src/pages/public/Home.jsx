import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, Star, ShieldCheck, Award, MapPin, ArrowRight, Building2,
  CheckCircle2, Flame, HeartHandshake, Utensils, Waves, Bed, Compass,
  ChevronLeft, ChevronRight, Zap, Tag, Gift, Percent, Clock, Plus, X
} from 'lucide-react';
import { SearchBar } from '../../components/SearchBar';
import { HotelCard } from '../../components/HotelCard';
import { useCurrency } from '../../context/CurrencyContext';
import { useLanguage } from '../../context/LanguageContext';

const CATEGORY_TABS = [
  { label: 'All Suites', category: '' },
  { label: 'Overwater Villas', category: 'Overwater Villa' },
  { label: 'Cliffside Resorts', category: 'Resort & Spa' },
  { label: 'City Sky Towers', category: 'City Luxury Hotel' },
  { label: 'Zen Ryokans', category: 'Boutique Ryokan' },
  { label: 'Ski Chalets', category: 'Ski Resort' }
];

const GALLERY_PHOTOS = [
  {
    id: 'g1',
    category: 'HOTEL & GROUNDS',
    title: 'Sunset Infinity Lagoon Deck',
    subtitle: 'Hotel & Grounds',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'g2',
    category: 'ROOMS & SUITES',
    title: 'Overwater Sky Bungalow Villa',
    subtitle: 'Rooms & Suites',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'g3',
    category: 'FINE DINING',
    title: 'Candlelit Champagne & Wine Table',
    subtitle: 'Fine Dining',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'g4',
    category: 'SPA & WELLNESS',
    title: 'Thermal Hot Spring Zen Spa',
    subtitle: 'Spa & Wellness',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'g5',
    category: 'HOTEL & GROUNDS',
    title: 'Beachfront Boardwalk & Loungers',
    subtitle: 'Hotel & Grounds',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'g6',
    category: 'ROOMS & SUITES',
    title: 'Caldera Cliffside Sunset Suite',
    subtitle: 'Rooms & Suites',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'g7',
    category: 'FINE DINING',
    title: 'Michelin Chef Private Tasting',
    subtitle: 'Fine Dining',
    image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'g8',
    category: 'SPA & WELLNESS',
    title: 'Private Open-Air Jacuzzi Bath',
    subtitle: 'Spa & Wellness',
    image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80'
  }
];

const CAROUSEL_SLIDES = [
  {
    id: 'c1',
    hotelId: 'h1',
    title: 'Overwater Sunset Plunge Pool Sanctuary',
    destination: 'Maldives Lagoon, South Atoll',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
    price: 850,
    originalPrice: 1060,
    discountBadge: '20% OFF (SUMMER20)',
    rating: 4.9,
    reviews: 142,
    inclusions: ['Free Gourmet Breakfast', 'Private Butler', 'Instant QR Voucher'],
    tag: 'MALDIVES FLASH SALE'
  },
  {
    id: 'c2',
    hotelId: 'h2',
    title: 'Grand Azure Caldera Infinity Pool Villa',
    destination: 'Oia, Santorini, Greece',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80',
    price: 650,
    originalPrice: 820,
    discountBadge: 'FLAT $50 OFF (LUXE50)',
    rating: 4.95,
    reviews: 218,
    inclusions: ['Caldera Sunset View', 'Private Jacuzzi', 'Airport VIP Shuttle'],
    tag: 'SANTORINI VIP SUITE'
  },
  {
    id: 'c3',
    hotelId: 'h3',
    title: 'Manhattan Sky Presidential Penthouse',
    destination: '5th Avenue, New York, USA',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    price: 950,
    originalPrice: 1200,
    discountBadge: '15% OFF CORPORATE PASS',
    rating: 4.88,
    reviews: 95,
    inclusions: ['Helipad Access', 'Michelin Chef Breakfast', 'Spa Pass'],
    tag: 'NEW YORK SKYLINE'
  },
  {
    id: 'c4',
    hotelId: 'h4',
    title: 'Zen Bamboo Forest Onsen Ryokan Suite',
    destination: 'Arashiyama, Kyoto, Japan',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
    price: 480,
    originalPrice: 600,
    discountBadge: '3 MEALS FULL BOARD INCLUDED',
    rating: 4.92,
    reviews: 184,
    inclusions: ['Private Spring Onsen', 'Kaiseki Dinner', 'Tea Ceremony'],
    tag: 'KYOTO ONSEN EXPERIENCE'
  }
];

const TESTIMONIALS = [
  {
    name: 'Lady Genevieve Sterling',
    role: 'Verified Luxury Traveler',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    text: 'LuxeStay booked us an overwater sunset sanctuary in the Maldives with private butler service. The digital QR stay voucher check-in was completely effortless.',
    rating: 5,
    location: 'Maldives Overwater Sanctuary'
  },
  {
    name: 'Sir Alexander Wright',
    role: 'Executive Platinum Member',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    text: 'Perched high in Oia, Santorini, our caldera infinity pool suite exceeded every expectation. Best rates guaranteed and instant confirmation voucher.',
    rating: 5,
    location: 'Grand Azure Resort, Greece'
  }
];

export const Home = () => {
  const { formatPrice } = useCurrency();
  const { t } = useLanguage();
  const [hotels, setHotels] = useState(() => {
    try {
      const cached = localStorage.getItem('luxestay_cached_featured_hotels');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });
  const [destinations, setDestinations] = useState(() => {
    try {
      const cached = localStorage.getItem('luxestay_cached_destinations');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });
  const [activeCategory, setActiveCategory] = useState('');
  const [homeViewMode, setHomeViewMode] = useState('list');
  const [galleryCategory, setGalleryCategory] = useState('ALL PHOTOS');
  const [selectedLightboxImage, setSelectedLightboxImage] = useState(null);

  // Carousel State
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Rotating Headline State
  const locations = ['Santorini', 'Maldives', 'New York', 'Kyoto', 'Swiss Alps'];
  const [locationIndex, setLocationIndex] = useState(0);

  useEffect(() => {
    fetch('/api/hotels?featured=true')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setHotels(data);
          try {
            localStorage.setItem('luxestay_cached_featured_hotels', JSON.stringify(data));
          } catch (e) {}
        }
      })
      .catch(() => { });

    fetch('/api/destinations')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDestinations(data);
          try {
            localStorage.setItem('luxestay_cached_destinations', JSON.stringify(data));
          } catch (e) {}
        }
      })
      .catch(() => { });
  }, []);

  // Auto-play Carousel Timer
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex(prev => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 3800);
    return () => clearInterval(interval);
  }, [isPaused]);

  // Rotating Headline Timer
  useEffect(() => {
    const locInterval = setInterval(() => {
      setLocationIndex(prev => (prev + 1) % locations.length);
    }, 2500);
    return () => clearInterval(locInterval);
  }, [locations.length]);

  const nextSlide = () => {
    setCurrentSlideIndex((currentSlideIndex + 1) % CAROUSEL_SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentSlideIndex((currentSlideIndex - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length);
  };

  const filteredHotels = activeCategory
    ? hotels.filter(h => h.category === activeCategory)
    : hotels;

  const filteredGalleryPhotos = galleryCategory === 'ALL PHOTOS'
    ? GALLERY_PHOTOS
    : GALLERY_PHOTOS.filter(p => p.category === galleryCategory);

  const activeSlide = CAROUSEL_SLIDES[currentSlideIndex];

  const categoryTabs = [
    { label: t('allSuites'), category: '' },
    { label: t('overwaterVillas'), category: 'Overwater Villa' },
    { label: t('cliffsideResorts'), category: 'Resort & Spa' },
    { label: t('citySkyTowers'), category: 'City Luxury Hotel' },
    { label: t('zenRyokans'), category: 'Boutique Ryokan' },
    { label: t('skiChalets'), category: 'Ski Resort' }
  ];

  return (
    <div className="space-y-20 pb-20">

      {/* 2. HERO SECTION WITH DYNAMIC ROTATING HEADLINE */}
      <section className="relative min-h-[88vh] flex items-center justify-center pt-16 pb-24 px-4 overflow-hidden">
        {/* Background Image & Crisp Luxury Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2000&q=85"
            alt="Luxury Resort"
            className="w-full h-full object-cover brightness-[0.85] scale-100 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/25 to-slate-950/60"></div>
        </div>

        <div className="container relative z-10 max-w-5xl text-center space-y-8 animate-fade-in">

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/40 backdrop-blur-xl text-amber-300 text-xs font-extrabold uppercase tracking-widest shadow-lg">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{t('curatedPortfolio')}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1]">
            Unrivaled Elegance & <br className="hidden sm:inline" />
            <span className="text-gradient-gold">Private Sanctuaries in </span>
            <span className="inline-block min-w-[200px] text-amber-400 underline decoration-amber-500/50 transition-all duration-500 animate-pulse">
              {locations[locationIndex]}
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-200 font-medium leading-relaxed drop-shadow-md">
            {t('heroSub')}
          </p>

          {/* Floating Search Engine Bar */}
          <div className="pt-6 max-w-6xl mx-auto w-full">
            <SearchBar />
          </div>

          {/* Quick Category Tabs */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
            {categoryTabs.map(tab => (
              <button
                key={tab.label}
                onClick={() => setActiveCategory(tab.category)}
                className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all border cursor-pointer ${activeCategory === tab.category
                    ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/30'
                    : 'bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-md'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* 3. LIVE INTERACTIVE AUTO-PLAYING LUXURY CAROUSEL SHOWCASE */}
      <section className="container">
        <div className="p-4 sm:p-8 md:p-10 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-2xl space-y-6">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-light)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-500 block pt-1">{t('exclusivePromo')}</span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)]">{t('spotlightTitle')}</h2>
              </div>
            </div>

            {/* Controls: Prev/Next & Dots */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 mr-2">
                {CAROUSEL_SLIDES.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlideIndex(idx)}
                    className={`h-2 rounded-full transition-all ${currentSlideIndex === idx ? 'w-6 bg-amber-500' : 'w-2 bg-[var(--border-light)]'}`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={prevSlide}
                className="p-2 rounded-full border border-[var(--border-light)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:border-amber-500 transition-colors cursor-pointer"
                title="Previous Slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextSlide}
                className="p-2 rounded-full border border-[var(--border-light)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:border-amber-500 transition-colors cursor-pointer"
                title="Next Slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Active Carousel Card Slide */}
          <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="relative rounded-3xl overflow-hidden border border-[var(--border-light)] shadow-2xl grid grid-cols-1 lg:grid-cols-12 group transition-all animate-fade-in"
          >
            {/* Left Image Column */}
            <div className="lg:col-span-7 relative h-56 sm:h-72 lg:h-auto min-h-[220px] lg:min-h-[380px] overflow-hidden">
              <img
                src={activeSlide.image}
                alt={activeSlide.title}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 brightness-95"
              />
              <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
                <span className="badge badge-gold font-extrabold text-[10px] shadow-lg">{activeSlide.tag}</span>
                <span className="badge bg-emerald-500 text-white font-extrabold text-[10px] shadow-lg">{activeSlide.discountBadge}</span>
              </div>
            </div>

            {/* Right Details Column */}
            <div className="lg:col-span-5 p-5 sm:p-7 md:p-8 bg-[var(--bg-tertiary)] flex flex-col justify-between space-y-5 sm:space-y-6">

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 text-[var(--text-muted)] font-bold">
                    <MapPin className="w-3.5 h-3.5 text-amber-500" /> {activeSlide.destination}
                  </span>
                  <span className="flex items-center gap-1 text-amber-500 font-extrabold">
                    <Star className="w-4 h-4 fill-current" /> {activeSlide.rating} ({activeSlide.reviews})
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] leading-snug">
                  {activeSlide.title}
                </h3>

                <div className="space-y-2 pt-1">
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider block">Inclusions Package:</span>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 text-xs font-semibold">
                    {activeSlide.inclusions.map((inc, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border-light)] text-[var(--text-secondary)] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" /> {inc}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Price & Direct Reservation Action */}
              <div className="pt-4 border-t border-[var(--border-light)] flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-extrabold text-amber-500">{formatPrice(activeSlide.price)}</span>
                    <span className="text-xs text-[var(--text-muted)] line-through font-semibold">{formatPrice(activeSlide.originalPrice)}</span>
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)] font-semibold block">{t('perNight')} • {t('nightlyRate')}</span>
                </div>

                <Link
                  to={`/hotels/${activeSlide.hotelId}`}
                  className="btn btn-primary px-5 py-2.5 sm:px-6 sm:py-3 text-xs font-extrabold shadow-lg shadow-amber-500/30 flex items-center gap-2 shrink-0 whitespace-nowrap cursor-pointer"
                >
                  <span>{t('reserveSuite')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 4. LUXURY TRUST VALUE PROPOSITION */}
      <section className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          <div className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-xl space-y-4 text-center group hover:border-amber-500/50 transition-all">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-extrabold text-[var(--text-primary)]">{t('verifiedGuest')}</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {t('verifiedSub')}
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-xl space-y-4 text-center group hover:border-amber-500/50 transition-all">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <Award className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-extrabold text-[var(--text-primary)]">{t('bestRate')}</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {t('bestRateSub')}
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-xl space-y-4 text-center group hover:border-amber-500/50 transition-all">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <HeartHandshake className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-extrabold text-[var(--text-primary)]">{t('concierge')}</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {t('conciergeSub')}
            </p>
          </div>

        </div>
      </section>

      {/* 5. FEATURED PROPERTIES GRID */}
      <section className="container">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-500 block mb-2 pt-4">{t('curatedPortfolio')}</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)]">{t('featuredSuites')}</h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Grid/List View Switcher */}
            <div className="flex items-center p-1 rounded-xl border border-[var(--border-light)] bg-[var(--bg-card)] shadow-xs">
              <button
                onClick={() => setHomeViewMode('list')}
                className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer ${homeViewMode === 'list' ? 'bg-amber-500 text-white shadow-md' : 'text-[var(--text-muted)]'}`}
              >
                {t('listView')}
              </button>
              <button
                onClick={() => setHomeViewMode('grid')}
                className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer ${homeViewMode === 'grid' ? 'bg-amber-500 text-white shadow-md' : 'text-[var(--text-muted)]'}`}
              >
                {t('gridView')}
              </button>
            </div>

            <Link to="/hotels" className="btn btn-outline text-xs py-2.5 px-5 flex items-center gap-2">
              <span>{t('fullCatalog')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className={homeViewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' : 'space-y-6'}>
          {filteredHotels.map(hotel => (
            <HotelCard key={hotel.id} hotel={hotel} viewMode={homeViewMode} />
          ))}
        </div>
      </section>

      {/* 6. OUR GALLERY SHOWCASE (CONTAINED LUXURY CARD DESIGN) */}
      <section id="gallery" className="container">
        <div className="p-8 sm:p-12 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-2xl space-y-10">

          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-5xl font-serif tracking-wide text-[var(--text-primary)]">
              {t('ourGallery')}
            </h2>
            <div className="flex items-center justify-center gap-3">
              <div className="w-16 h-[1px] bg-gradient-to-r from-transparent to-amber-500"></div>
              <Sparkles className="w-4 h-4 text-amber-500" />
              <div className="w-16 h-[1px] bg-gradient-to-l from-transparent to-amber-500"></div>
            </div>
            <p className="text-xs text-[var(--text-secondary)] uppercase tracking-widest font-extrabold pt-1">
              {t('gallerySub')}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {[
              { key: 'ALL PHOTOS', label: t('allPhotos') },
              { key: 'HOTEL & GROUNDS', label: t('hotelGrounds') },
              { key: 'ROOMS & SUITES', label: t('roomsSuites') },
              { key: 'FINE DINING', label: t('fineDining') },
              { key: 'SPA & WELLNESS', label: t('spaWellness') }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setGalleryCategory(tab.key)}
                className={`px-5 py-2 rounded-xl text-xs font-extrabold tracking-wider transition-all uppercase cursor-pointer border ${galleryCategory === tab.key
                    ? 'bg-amber-600 border-amber-600 text-white shadow-md shadow-amber-600/30'
                    : 'bg-[var(--bg-tertiary)] border-[var(--border-light)] text-[var(--text-secondary)] hover:border-amber-500/50 hover:text-[var(--text-primary)]'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredGalleryPhotos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => setSelectedLightboxImage(photo)}
                className="group relative h-72 rounded-2xl overflow-hidden cursor-pointer shadow-md border border-[var(--border-light)] hover:border-amber-500/50 transition-all"
              >
                <img
                  src={photo.image}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 brightness-[0.92]" />
                <div className="absolute inset-0 bg-slate-950/65 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center space-y-3 p-4 text-center">

                  <div className="w-11 h-11 rounded-full bg-white text-slate-950 flex items-center justify-center font-bold shadow-2xl group-hover:scale-110 transition-transform duration-300">
                    <Plus className="w-5 h-5 stroke-[2.5]" />
                  </div>

                  <span className="px-3 py-1 rounded-full bg-slate-900/90 text-amber-400 text-[10px] font-extrabold uppercase tracking-widest border border-amber-500/30">
                    {photo.subtitle}
                  </span>

                  <h4 className="text-sm font-extrabold text-white">{photo.title}</h4>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-2">
            <button
              onClick={() => setSelectedLightboxImage(filteredGalleryPhotos[0])}
              className="px-8 py-3.5 rounded-xl border-2 border-amber-600 text-amber-600 dark:text-amber-400 hover:bg-amber-600 hover:text-white text-xs font-extrabold tracking-widest uppercase transition-all shadow-sm cursor-pointer"
            >
              {t('viewMore')}
            </button>
          </div>

        </div>

        {/* Lightbox Modal */}
        {selectedLightboxImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md animate-fade-in">
            <button
              onClick={() => setSelectedLightboxImage(null)}
              className="absolute top-6 right-6 p-3 rounded-full bg-white/10 text-white hover:bg-rose-600 transition-colors z-50 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="max-w-4xl w-full max-h-[85vh] space-y-4 text-center animate-fade-in">
              <img
                src={selectedLightboxImage.image}
                alt={selectedLightboxImage.title}
                className="max-h-[70vh] max-w-full mx-auto object-contain rounded-2xl border border-white/20 shadow-2xl"
              />
              <div className="space-y-1">
                <span className="badge badge-gold text-[10px]">{selectedLightboxImage.category}</span>
                <h3 className="text-xl font-extrabold text-white">{selectedLightboxImage.title}</h3>
              </div>
            </div>
          </div>
        )}

      </section>

      {/* 7. DESTINATIONS SHOWCASE */}
      <section className="container">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-amber-500 block pt-4">{t('globalDestinations')}</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)]">{t('exploreWorld')}</h2>
          <p className="text-sm text-[var(--text-secondary)]">From cliffside Greek villages to traditional Japanese hot springs</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map(dest => (
            <Link
              key={dest.id}
              to={`/destinations/${dest.slug}`}
              className="group relative h-80 rounded-3xl overflow-hidden shadow-xl border border-[var(--border-light)] flex items-end p-6"
            >
              <img
                src={dest.image}
                alt={dest.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 brightness-[0.65]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>

              <div className="relative z-10 space-y-1 text-white">
                <span className="badge badge-gold text-[9px]">{dest.country}</span>
                <h3 className="text-2xl font-extrabold group-hover:text-amber-400 transition-colors">{dest.name}</h3>
                <p className="text-xs text-slate-300 line-clamp-1">{dest.description}</p>
                <div className="pt-2 flex items-center justify-between text-xs font-bold text-amber-400 border-t border-white/20">
                  <span>{dest.hotelCount} {t('properties')}</span>
                  <span className="flex items-center gap-1">{t('explore')} <ArrowRight className="w-3.5 h-3.5" /></span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 7. VERIFIED GUEST REVIEWS */}
      <section className="container">
        <div className="p-10 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-2xl space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-500 block pt-4">{t('guestExperiences')}</span>
            <h2 className="text-3xl font-extrabold text-[var(--text-primary)]">{t('lovedByTravelers')}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {TESTIMONIALS.map((tItem, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] space-y-4">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(tItem.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-[var(--text-primary)] leading-relaxed italic">"{tItem.text}"</p>
                <div className="flex items-center gap-3 pt-2 border-t border-[var(--border-light)]">
                  <img src={tItem.avatar} alt={tItem.name} className="w-10 h-10 rounded-full object-cover border-2 border-amber-500" />
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text-primary)]">{tItem.name}</h4>
                    <span className="text-[11px] text-[var(--text-muted)] font-semibold">{tItem.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. PROMO CALLOUT */}
      <section className="container">
        <div className="relative rounded-2xl overflow-hidden p-8 sm:p-14 bg-slate-900 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-8 border border-amber-500/30">
          <div className="space-y-4 max-w-xl">
            <span className="badge badge-navy bg-white/20 text-white">{t('exclusivePromo')}</span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">{t('unlockDiscount')}</h2>
            <p className="text-sm text-slate-200 leading-relaxed">
              Use promo code <span className="font-mono font-bold text-amber-300 bg-white/10 px-2 py-0.5 rounded">SUMMER20</span> at checkout for instant discounts on all luxury overwater bungalows & cliffside villas.
            </p>
          </div>
          <Link to="/offers" className="btn bg-white text-slate-950 hover:bg-slate-100 font-extrabold px-8 py-4 text-sm shadow-xl flex-shrink-0">
            {t('viewPromos')}
          </Link>
        </div>
      </section>

    </div>
  );
};
