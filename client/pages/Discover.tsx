import { useState, useRef, useEffect } from "react";
import { ChevronDown, MapPin, Star, Lock, Search } from "lucide-react";
import GlassyTile from "@/components/GlassyTile";

type Tab = "trainers" | "nutritionists";
type SortOption = "distance" | "rating" | "price";

interface Filter {
  category: string | null;
  verified: boolean;
  priceRange: [number, number];
  distance: number;
  sort: SortOption;
}

// Categories in exact order per spec
const TRAINER_CATEGORIES = [
  "All",
  "Gym",
  "Yoga",
  "CrossFit",
  "Boxing",
  "Zumba",
  "Swimming",
  "Pilates",
  "HIIT",
  "Aerobics",
  "Dance",
  "Martial Arts",
  "Cycling",
  "Running",
  "Stretching",
];
const NUTRITIONIST_CATEGORIES = ["All", "Weight Loss", "Sports Nutrition", "Diabetes", "PCOS", "General"];

const MOCK_TRAINERS = [
  {
    id: 1,
    name: "Priya Singh",
    category: "Gym",
    yearsOfExperience: 5,
    distance: 2.5,
    rating: 4.8,
    ratingCount: 124,
    price: 500,
    verified: true,
    avatar: "PS",
  },
  {
    id: 2,
    name: "Raj Patel",
    category: "CrossFit",
    yearsOfExperience: 7,
    distance: 1.8,
    rating: 4.9,
    ratingCount: 98,
    price: 600,
    verified: true,
    avatar: "RP",
  },
  {
    id: 3,
    name: "Anjali Sharma",
    category: "Yoga",
    yearsOfExperience: 8,
    distance: 3.2,
    rating: 4.7,
    ratingCount: 156,
    price: 400,
    verified: false,
    avatar: "AS",
  },
  {
    id: 4,
    name: "Kumar Mishra",
    category: "Boxing",
    yearsOfExperience: 6,
    distance: 4.1,
    rating: 4.6,
    ratingCount: 87,
    price: 550,
    verified: true,
    avatar: "KM",
  },
  {
    id: 5,
    name: "Neha Verma",
    category: "Gym",
    yearsOfExperience: 4,
    distance: 2.8,
    rating: 4.9,
    ratingCount: 203,
    price: 650,
    verified: true,
    avatar: "NV",
  },
  {
    id: 6,
    name: "Vikram Singh",
    category: "Zumba",
    yearsOfExperience: 3,
    distance: 5.2,
    rating: 4.5,
    ratingCount: 67,
    price: 450,
    verified: false,
    avatar: "VS",
  },
  {
    id: 7,
    name: "Sarah Johnson",
    category: "Swimming",
    yearsOfExperience: 9,
    distance: 3.5,
    rating: 4.9,
    ratingCount: 178,
    price: 550,
    verified: true,
    avatar: "SJ",
  },
  {
    id: 8,
    name: "Marcus Chen",
    category: "Pilates",
    yearsOfExperience: 6,
    distance: 2.2,
    rating: 4.7,
    ratingCount: 145,
    price: 480,
    verified: true,
    avatar: "MC",
  },
  {
    id: 9,
    name: "Emma Rodriguez",
    category: "HIIT",
    yearsOfExperience: 4,
    distance: 2.9,
    rating: 4.8,
    ratingCount: 112,
    price: 520,
    verified: true,
    avatar: "ER",
  },
  {
    id: 10,
    name: "David Thompson",
    category: "Running",
    yearsOfExperience: 7,
    distance: 4.3,
    rating: 4.6,
    ratingCount: 98,
    price: 450,
    verified: false,
    avatar: "DT",
  },
  {
    id: 11,
    name: "Sophia Patel",
    category: "Dance",
    yearsOfExperience: 5,
    distance: 3.1,
    rating: 4.9,
    ratingCount: 189,
    price: 500,
    verified: true,
    avatar: "SP",
  },
  {
    id: 12,
    name: "Alex Kim",
    category: "Martial Arts",
    yearsOfExperience: 10,
    distance: 2.6,
    rating: 4.8,
    ratingCount: 167,
    price: 600,
    verified: true,
    avatar: "AK",
  },
  {
    id: 13,
    name: "Lisa Wang",
    category: "Cycling",
    yearsOfExperience: 5,
    distance: 5.1,
    rating: 4.7,
    ratingCount: 134,
    price: 480,
    verified: false,
    avatar: "LW",
  },
  {
    id: 14,
    name: "James Murphy",
    category: "Aerobics",
    yearsOfExperience: 6,
    distance: 3.4,
    rating: 4.6,
    ratingCount: 102,
    price: 420,
    verified: true,
    avatar: "JM",
  },
];

export default function Discover() {
  const [activeTab, setActiveTab] = useState<Tab>("trainers");
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<Filter>({
    category: "All",
    verified: false,
    priceRange: [0, 2000],
    distance: 20,
    sort: "distance",
  });
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const categories = activeTab === "trainers" ? TRAINER_CATEGORIES : NUTRITIONIST_CATEGORIES;
  const hasActiveFilters = (filter.category && filter.category !== "All") || filter.verified || filter.distance < 20;

  const selectCategory = (cat: string) => {
    setFilter({
      ...filter,
      category: cat,
    });
  };

  const clearFilters = () => {
    setFilter({
      category: "All",
      verified: false,
      priceRange: [0, 2000],
      distance: 20,
      sort: "distance",
    });
  };

  const filteredTrainers = MOCK_TRAINERS.filter((trainer) => {
    if (filter.category && filter.category !== "All" && trainer.category !== filter.category) {
      return false;
    }
    if (filter.verified && !trainer.verified) {
      return false;
    }
    if (searchQuery && !trainer.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setTouchEnd(e.changedTouches[0].clientX);
    handleSwipe();
  };

  const handleSwipe = () => {
    if (!carouselRef.current) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      carouselRef.current.scrollBy({ left: 150, behavior: "smooth" });
    } else if (isRightSwipe) {
      carouselRef.current.scrollBy({ left: -150, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20 l-shape-bg">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto">
          {/* Title */}
          <div className="px-4 py-6">
            <h1 className="text-2xl font-bold">Discover</h1>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border">
            <button
              onClick={() => {
                setActiveTab("trainers");
                setFilter({ ...filter, category: "All" });
              }}
              className={`flex-1 py-4 font-semibold border-b-2 transition-colors ${
                activeTab === "trainers"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground"
              }`}
            >
              Trainers
            </button>
            <button
              onClick={() => {
                setActiveTab("nutritionists");
                setFilter({ ...filter, category: "All" });
              }}
              className={`flex-1 py-4 font-semibold border-b-2 transition-colors ${
                activeTab === "nutritionists"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground"
              }`}
            >
              Nutritionists
            </button>
          </div>

          {/* Search Bar */}
          <div className="px-4 py-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm text-foreground"
              />
            </div>
          </div>

          {/* Category Carousel */}
          <div className="px-4 py-4">
            <div
              ref={carouselRef}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className="flex gap-2 overflow-x-auto scrollbar-hide pb-2"
            >
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => selectCategory(cat)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                    filter.category === cat
                      ? "bg-gradient-primary text-gray-900 shadow-lg shadow-orange-500/30"
                      : "bg-card border border-border text-foreground hover:border-primary"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Button and Clear All */}
          <div className="px-4 pb-4 flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex-1 flex items-center justify-center gap-2 bg-card border border-border rounded-lg py-2 font-medium text-sm"
            >
              <ChevronDown className="w-4 h-4" />
              More Filters
            </button>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex-1 bg-destructive/20 text-destructive border border-destructive/30 rounded-lg py-2 font-medium text-sm"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Additional Filters Panel */}
          {showFilters && (
            <div className="px-4 py-4 space-y-4 border-t border-border bg-card/50 backdrop-blur">
              {/* Distance Filter */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Distance: {filter.distance} km</h3>
                <input
                  type="range"
                  min="2"
                  max="20"
                  value={filter.distance}
                  onChange={(e) => setFilter({ ...filter, distance: Number(e.target.value) })}
                  className="w-full"
                />
              </div>

              {/* Verified Only */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filter.verified}
                  onChange={(e) => setFilter({ ...filter, verified: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">Verified only</span>
              </label>

              {/* Sort */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Sort by</h3>
                <select
                  value={filter.sort}
                  onChange={(e) => setFilter({ ...filter, sort: e.target.value as SortOption })}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="distance">Distance (nearest)</option>
                  <option value="rating">Rating (highest)</option>
                  <option value="price">Price (lowest)</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nutritionists Premium Gate */}
      {activeTab === "nutritionists" && (
        <div className="max-w-md mx-auto px-4 py-8">
          <div className="bg-gradient-to-br from-orange-500/20 to-yellow-500/20 rounded-2xl p-8 border border-orange-500/30 backdrop-blur text-center">
            <Lock className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Premium Feature</h2>
            <p className="text-muted-foreground mb-6">
              Access nutritionists and meal planning by upgrading to premium
            </p>
            <button className="w-full bg-gradient-primary text-gray-900 font-bold py-3 rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all">
              Upgrade Now ₹199/mo
            </button>
          </div>
        </div>
      )}

      {/* Trainers List */}
      {activeTab === "trainers" && (
        <div className="max-w-md mx-auto px-4 py-6">
          {filteredTrainers.length > 0 ? (
            <div className="space-y-4">
              {filteredTrainers.map((trainer, idx) => (
                <div
                  key={trainer.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <GlassyTile
                    className="p-4"
                    variant={idx % 2 === 0 ? "primary" : "secondary"}
                  >
                    <div className="flex gap-4">
                      {/* Avatar */}
                      <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center font-bold text-gray-900 flex-shrink-0">
                        {trainer.avatar}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-foreground">{trainer.name}</h3>
                          {trainer.verified && (
                            <div className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                              ✓ Verified
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <span className="font-medium">{trainer.category}</span>
                      <span>•</span>
                      <span>{trainer.yearsOfExperience} yrs</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-primary text-primary" />
                        <span className="font-semibold">{trainer.rating}</span>
                        <span className="text-muted-foreground">({trainer.ratingCount})</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {trainer.distance} km
                      </div>
                      <div className="font-semibold text-primary">₹{trainer.price}</div>
                    </div>

                        {/* CTAs */}
                        <div className="flex gap-2">
                          <button className="flex-1 bg-primary text-primary-foreground font-semibold py-2 rounded-lg text-xs hover:opacity-90 transition-opacity">
                            Try 10-min
                          </button>
                          <button className="flex-1 bg-muted text-muted-foreground font-semibold py-2 rounded-lg text-xs hover:opacity-90 transition-opacity">
                            View Profile
                          </button>
                        </div>
                      </div>
                    </div>
                  </GlassyTile>
                </div>
              ))}

              {/* Load More */}
              <button className="w-full py-3 text-primary font-semibold hover:opacity-80 transition-opacity">
                Load more trainers
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 bg-card rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="font-bold text-foreground mb-1">No trainers found</h3>
              <p className="text-muted-foreground text-sm">Try adjusting your filters or category</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
