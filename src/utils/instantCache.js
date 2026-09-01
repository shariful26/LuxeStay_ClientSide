// Instant Cache & Hydration Manager for LuxeStay Pro
// Provides instant zero-millisecond rendering for all website pages

const BASELINE_HOTELS = [
  {
    id: "h1",
    name: "The Grand Azure Resort & Spa",
    slug: "grand-azure-resort",
    tagline: "Ultra-Luxury Waterfront Retreat",
    destination: "Santorini, Greece",
    destinationSlug: "santorini",
    address: "Oia Cliffside Drive, Santorini 84702, Greece",
    pricePerNight: 450,
    rating: 4.95,
    reviewCount: 128,
    starRating: 5,
    featured: true,
    category: "Resort & Spa",
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: ["Infinity Pool", "Private Beach", "Luxury Spa", "Michelin Dining", "Free Wi-Fi", "Airport Shuttle"],
    description: "Perched on the dramatic cliffs of Oia overlooking the Aegean Sea, The Grand Azure Resort delivers an unmatched sanctuary of sun-drenched infinity pools, private volcanic-stone hot tubs, and world-class Mediterranean gastronomy.",
    partnerId: "u_1787619856938",
    partnerName: "Aura Hospitality",
    status: "Approved"
  },
  {
    id: "h2",
    name: "Overwater Coral Sanctuary",
    slug: "overwater-coral-sanctuary",
    tagline: "Private Lagoon Overwater Bungalows",
    destination: "Maldives",
    destinationSlug: "maldives",
    address: "Baa Atoll Biosphere Reserve, Maldives",
    pricePerNight: 890,
    rating: 4.98,
    reviewCount: 94,
    starRating: 5,
    featured: true,
    category: "Overwater Villa",
    images: [
      "https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: ["Glass Floor Views", "Private Ocean Deck", "Underwater Restaurant", "Scuba Center", "Spa & Wellness"],
    description: "Step directly into turquoise waters from your private villa deck. Complete with glass-floor viewing portals, private infinity plunge pools, and bespoke marine biologist tours.",
    partnerId: "u_1787619856938",
    partnerName: "Aura Hospitality",
    status: "Approved"
  },
  {
    id: "h3",
    name: "The Ritz Horizon Tower",
    slug: "ritz-horizon-tower",
    tagline: "Skyline Luxury in Downtown Manhattan",
    destination: "New York, USA",
    destinationSlug: "new-york",
    address: "750 5th Avenue, New York, NY 10019",
    pricePerNight: 520,
    rating: 4.88,
    reviewCount: 310,
    starRating: 5,
    featured: true,
    category: "City Luxury Hotel",
    images: [
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: ["Rooftop Lounge", "Fitness Center", "Valet Parking", "Pet Friendly", "Executive Lounge"],
    description: "Towering above Fifth Avenue with breathtaking panoramic views of Central Park, The Ritz Horizon merges timeless Manhattan elegance with state-of-the-art modern amenities.",
    partnerId: "u_1787619856938",
    partnerName: "Aura Hospitality",
    status: "Approved"
  },
  {
    id: "h4",
    name: "Kyoto Bamboo Zen Sanctuary",
    slug: "kyoto-bamboo-zen",
    tagline: "Traditional Ryokan with Private Onsen",
    destination: "Kyoto, Japan",
    destinationSlug: "kyoto",
    address: "Arashiyama Bamboo Grove Walk, Kyoto 616-8385",
    pricePerNight: 380,
    rating: 4.92,
    reviewCount: 165,
    starRating: 5,
    featured: false,
    category: "Boutique Ryokan",
    images: [
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: ["Private Hot Spring (Onsen)", "Kaiseki Tasting Menu", "Zen Garden", "Tea Ceremony Room"],
    description: "Immerse yourself in authentic Japanese hospitality surrounded by whispering bamboo forests.",
    partnerId: "u_1787619856938",
    partnerName: "Aura Hospitality",
    status: "Approved"
  },
  {
    id: "h5",
    name: "Alpine Chalet & Thermal Spa",
    slug: "alpine-chalet-spa",
    tagline: "Mountain Peak Ski-In / Ski-Out Haven",
    destination: "Swiss Alps, Switzerland",
    destinationSlug: "swiss-alps",
    address: "Matterhorn Valley Road 12, Zermatt 3920",
    pricePerNight: 640,
    rating: 4.96,
    reviewCount: 88,
    starRating: 5,
    featured: false,
    category: "Ski Resort",
    images: [
      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: ["Ski-In/Ski-Out", "Heated Outdoor Pool", "Fireplace Lounge", "Sauna & Sauna Master"],
    description: "Nestled under the shadow of the Matterhorn, this luxury wooden chalet features roaring open fireplaces and heated outdoor thermal pools.",
    partnerId: "u_1787619856938",
    partnerName: "Aura Hospitality",
    status: "Approved"
  },
  {
    id: "h6",
    name: "Ubud Rainforest Eco Manor",
    slug: "ubud-rainforest-manor",
    tagline: "Lush Tropical Wellness & Yoga Estate",
    destination: "Bali, Indonesia",
    destinationSlug: "bali",
    address: "Tegallalang Rice Terrace Pass, Ubud 80561",
    pricePerNight: 290,
    rating: 4.89,
    reviewCount: 210,
    starRating: 4,
    featured: true,
    category: "Eco Wellness Resort",
    images: [
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: ["Jungle Infinity Pool", "Daily Yoga Shala", "Organic Farm Restaurant", "Holistic Spa"],
    description: "Wake up to misty green jungle valleys and river cascades. Complete with daily sunrise yoga.",
    partnerId: "u_1787619856938",
    partnerName: "Aura Hospitality",
    status: "Approved"
  }
];

const BASELINE_DESTINATIONS = [
  {
    id: "d1",
    name: "Santorini, Greece",
    slug: "santorini",
    tagline: "Sun-drenched Aegean Cliffs & Caldera Sunsets",
    country: "Greece",
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80",
    hotelCount: 14,
    startingPrice: 320,
    rating: 4.96
  },
  {
    id: "d2",
    name: "Maldives Atolls",
    slug: "maldives",
    tagline: "Overwater Villas & Pristine Turquoise Lagoons",
    country: "Maldives",
    image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800&q=80",
    hotelCount: 9,
    startingPrice: 550,
    rating: 4.99
  },
  {
    id: "d3",
    name: "Swiss Alps",
    slug: "swiss-alps",
    tagline: "Matterhorn Panoramic Peaks & Thermal Spas",
    country: "Switzerland",
    image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80",
    hotelCount: 11,
    startingPrice: 420,
    rating: 4.94
  },
  {
    id: "d4",
    name: "Kyoto, Japan",
    slug: "kyoto",
    tagline: "Zen Bamboo Forests, Ryokans & Tea Houses",
    country: "Japan",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80",
    hotelCount: 8,
    startingPrice: 280,
    rating: 4.92
  },
  {
    id: "d5",
    name: "Bali, Indonesia",
    slug: "bali",
    tagline: "Ubud Jungle Retreats & Coastal Sunsets",
    country: "Indonesia",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80",
    hotelCount: 16,
    startingPrice: 190,
    rating: 4.88
  },
  {
    id: "d6",
    name: "New York City",
    slug: "new-york",
    tagline: "Fifth Avenue Skyline Penthouses & Central Park Views",
    country: "USA",
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
    hotelCount: 12,
    startingPrice: 410,
    rating: 4.91
  }
];

const BASELINES = {
  hotels: BASELINE_HOTELS,
  destinations: BASELINE_DESTINATIONS
};

/**
 * Returns instant cached data or baseline fallback synchronously (0ms delay).
 */
export const getInstantData = (key, fallback = null) => {
  try {
    const cached = localStorage.getItem(`luxestay_cache_${key}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) ? parsed.length > 0 : Boolean(parsed)) {
        return parsed;
      }
    }
  } catch (e) {}

  if (BASELINES[key]) {
    return BASELINES[key];
  }

  return fallback !== null ? fallback : [];
};

/**
 * Fetches fresh server data in background and updates cache & state.
 */
export const fetchInstantData = (url, key, setter, onComplete) => {
  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data && (Array.isArray(data) ? data.length >= 0 : typeof data === 'object')) {
        setter(data);
        try {
          localStorage.setItem(`luxestay_cache_${key}`, JSON.stringify(data));
        } catch (e) {}
      }
      if (onComplete) onComplete(data);
    })
    .catch((err) => {
      if (onComplete) onComplete(null, err);
    });
};
