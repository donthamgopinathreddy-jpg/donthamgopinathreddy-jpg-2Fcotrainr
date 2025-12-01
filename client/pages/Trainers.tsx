import { useState, useRef } from "react";
import { ChevronDown, MapPin, Star, Search, ArrowLeft } from "lucide-react";
import GlassyTile from "@/components/GlassyTile";
import { useTheme } from "@/contexts/ThemeContext";
import { useTrainers } from "@/hooks/useTrainers";
import { useNavigate } from "react-router-dom";

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

export default function Trainers() {
  const { trainers, loading } = useTrainers();
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<Filter>({
    category: "All",
    verified: false,
    priceRange: [0, 2000],
    distance: 30,
    sort: "distance",
  });
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const hasActiveFilters =
    (filter.category && filter.category !== "All") ||
    filter.verified ||
    filter.distance < 30;

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
      distance: 30,
      sort: "distance",
    });
  };

  const filteredTrainers = trainers.filter((trainer) => {
    if (filter.category && filter.category !== "All") {
      const matchesCategory =
        trainer.specialties && trainer.specialties.length > 0
          ? trainer.specialties.some((spec) =>
              spec.toLowerCase().includes(filter.category!.toLowerCase()),
            )
          : false;
      if (!matchesCategory) return false;
    }

    if (filter.verified && !trainer.verified) {
      return false;
    }

    if (
      searchQuery &&
      !trainer.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    const price = trainer.hourly_rate || 500;
    if (price < filter.priceRange[0] || price > filter.priceRange[1]) {
      return false;
    }

    return true;
  });

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

  const { theme } = useTheme();

  return (
    <div
      className={`min-h-screen pb-24 ${
        theme === "dark" ? "bg-gray-950" : "bg-white"
      }`}
    >
      {/* Header */}
      <div
        className={`sticky top-0 z-40 border-b ${
          theme === "dark"
            ? "bg-gray-900 border-gray-800"
            : "bg-white border-gray-200"
        }`}
      >
        <div className="max-w-md mx-auto">
          {/* Back Button & Title */}
          <div className="px-4 py-6 flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className={`p-2 rounded-lg transition-colors ${
                theme === "dark"
                  ? "hover:bg-gray-800 text-gray-300"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <ArrowLeft size={24} />
            </button>
            <h1
              className={`text-2xl font-bold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Trainers
            </h1>
          </div>

          {/* Search Bar */}
          <div
            className={`px-4 py-4 border-b ${
              theme === "dark" ? "border-gray-800" : "border-gray-200"
            }`}
          >
            <div className="relative">
              <Search
                className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                  theme === "dark" ? "text-gray-500" : "text-gray-400"
                }`}
              />
              <input
                type="text"
                placeholder="Search trainers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm ${
                  theme === "dark"
                    ? "bg-gray-800 border border-gray-700 text-white placeholder-gray-500"
                    : "bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-400"
                }`}
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
              {TRAINER_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => selectCategory(cat)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                    filter.category === cat
                      ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                      : theme === "dark"
                        ? "bg-gray-800 border border-gray-700 text-gray-300 hover:border-orange-500"
                        : "bg-gray-300 border border-gray-400 text-gray-800 hover:border-orange-500"
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
            <div
              className={`px-4 py-4 space-y-4 border-t border-border bg-card/50 backdrop-blur ${
                theme === "dark" ? "" : ""
              }`}
            >
              <div>
                <h3
                  className={`text-sm font-semibold mb-3 ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  Search Radius: {filter.distance} km
                </h3>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={filter.distance}
                    onChange={(e) =>
                      setFilter({
                        ...filter,
                        distance: Number(e.target.value),
                      })
                    }
                    className="w-full cursor-pointer"
                  />
                  <div
                    className={`flex justify-between text-xs ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    <span>1 km</span>
                    <span>100 km</span>
                  </div>
                </div>
              </div>

              <label
                className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-colors ${
                  filter.verified
                    ? theme === "dark"
                      ? "bg-blue-900/30 border border-blue-800"
                      : "bg-blue-50 border border-blue-200"
                    : theme === "dark"
                      ? "bg-gray-800/30 border border-gray-700"
                      : "bg-gray-50 border border-gray-200"
                }`}
              >
                <input
                  type="checkbox"
                  checked={filter.verified}
                  onChange={(e) =>
                    setFilter({ ...filter, verified: e.target.checked })
                  }
                  className="w-4 h-4 cursor-pointer"
                />
                <div>
                  <p
                    className={`text-sm font-semibold ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Verified Trainers Only
                  </p>
                  <p
                    className={`text-xs ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Show only verified trainers
                  </p>
                </div>
              </label>

              <div>
                <h3
                  className={`text-sm font-semibold mb-3 ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  Sort by
                </h3>
                <select
                  value={filter.sort}
                  onChange={(e) =>
                    setFilter({ ...filter, sort: e.target.value as SortOption })
                  }
                  className={`w-full rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all ${
                    theme === "dark"
                      ? "bg-gray-800 border border-gray-700 text-white"
                      : "bg-white border border-gray-300 text-gray-900"
                  }`}
                >
                  <option value="distance">🌍 Distance (nearest)</option>
                  <option value="rating">⭐ Rating (highest)</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Trainers List */}
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
                    <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center font-bold text-gray-900 flex-shrink-0">
                      {getInitials(trainer.full_name)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-foreground">
                          {trainer.full_name}
                        </h3>
                        {trainer.verified && (
                          <div className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                            ✓ Verified
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <span className="font-medium">
                          {trainer.specialties &&
                          trainer.specialties.length > 0
                            ? trainer.specialties[0]
                            : "Fitness"}
                        </span>
                        <span>•</span>
                        <span>{trainer.years_of_experience || 0} yrs</span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-primary text-primary" />
                          <span className="font-semibold">
                            {trainer.rating || 0}
                          </span>
                          <span className="text-muted-foreground">
                            ({trainer.reviews_count || 0})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>Nearby</span>
                        </div>
                        <div className="font-semibold text-primary">
                          ₹{trainer.hourly_rate || 500}/hr
                        </div>
                      </div>

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

            <button className="w-full py-3 text-primary font-semibold hover:opacity-80 transition-opacity">
              Load more trainers
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                theme === "dark" ? "bg-gray-800" : "bg-orange-100"
              }`}
            >
              <span className="text-2xl">🔍</span>
            </div>
            <h3
              className={`font-bold mb-1 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              No trainers found
            </h3>
            <p
              className={`text-sm ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Try adjusting your filters or category
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
