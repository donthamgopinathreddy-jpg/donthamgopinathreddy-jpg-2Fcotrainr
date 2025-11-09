import { useState, useRef } from "react";
import { ChevronDown, MapPin, Star, Lock, Search } from "lucide-react";
import Logo from "@/components/Logo";
import GlassyTile from "@/components/GlassyTile";
import { useTrainers } from "@/hooks/useTrainers";

type Tab = "trainers" | "nutritionists";
type SortOption = "distance" | "rating" | "price";

interface Filter {
  category: string | null;
  verified: boolean;
  priceRange: [number, number];
  distance: number;
  sort: SortOption;
}

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

export default function Discover() {
  const { trainers, loading } = useTrainers();
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

  // Filter trainers based on selected criteria
  const filteredTrainers = trainers.filter((trainer) => {
    // Check if trainer has a specialty matching the category (if category is not "All")
    if (filter.category && filter.category !== "All") {
      const matchesCategory = trainer.specialties && trainer.specialties.length > 0
        ? trainer.specialties.some(spec =>
            spec.toLowerCase().includes(filter.category!.toLowerCase())
          )
        : false;
      if (!matchesCategory) return false;
    }

    // Check verified status
    if (filter.verified && !trainer.verified) {
      return false;
    }

    // Check search query
    if (searchQuery && !trainer.full_name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Check price range
    const price = trainer.hourly_rate || 500;
    if (price < filter.priceRange[0] || price > filter.priceRange[1]) {
      return false;
    }

    return true;
  });

  // Sort trainers
  const sortedTrainers = [...filteredTrainers].sort((a, b) => {
    switch (filter.sort) {
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      case "price":
        return (a.hourly_rate || 500) - (b.hourly_rate || 500);
      case "distance":
      default:
        return 0;
    }
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

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-white pb-24 l-shape-bg">
      {/* Logo Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 flex items-center justify-center py-3">
        <Logo size="sm" />
      </div>

      {/* Header */}
      <div className="sticky top-12 z-40 bg-white border-b border-gray-200">
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
              {/* Price Range Filter */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Price Range: ₹{filter.priceRange[0]} - ₹{filter.priceRange[1]}</h3>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="2000"
                    value={filter.priceRange[1]}
                    onChange={(e) => setFilter({ ...filter, priceRange: [filter.priceRange[0], Number(e.target.value)] })}
                    className="w-full"
                  />
                </div>
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
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 bg-card rounded-full flex items-center justify-center mb-4 animate-spin">
                <span>⏳</span>
              </div>
              <p className="text-muted-foreground">Loading trainers...</p>
            </div>
          ) : sortedTrainers.length > 0 ? (
            <div className="space-y-4">
              {sortedTrainers.map((trainer, idx) => (
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
                        {getInitials(trainer.full_name)}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-foreground">{trainer.full_name}</h3>
                          {trainer.verified && (
                            <div className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                              ✓ Verified
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                          <span className="font-medium">
                            {trainer.specialties && trainer.specialties.length > 0
                              ? trainer.specialties[0]
                              : "Fitness"}
                          </span>
                          <span>•</span>
                          <span>{trainer.years_of_experience || 0} yrs</span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-primary text-primary" />
                            <span className="font-semibold">{trainer.rating || 0}</span>
                            <span className="text-muted-foreground">({trainer.reviews_count || 0})</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>Nearby</span>
                          </div>
                          <div className="font-semibold text-primary">₹{trainer.hourly_rate || 500}/hr</div>
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
