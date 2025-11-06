import { useState } from "react";
import { ChevronDown, MapPin, Star, Lock, X } from "lucide-react";
import GlassyTile from "@/components/GlassyTile";

type Tab = "trainers" | "nutritionists";
type SortOption = "distance" | "rating" | "price";

interface Filter {
  categories: string[];
  verified: boolean;
  priceRange: [number, number];
  distance: number;
  sort: SortOption;
}

const TRAINER_CATEGORIES = ["Zumba", "CrossFit", "Boxing", "Yoga", "Strength", "Rehab"];
const NUTRITIONIST_CATEGORIES = ["Weight Loss", "Sports Nutrition", "Diabetes", "PCOS", "General"];

const MOCK_TRAINERS = [
  {
    id: 1,
    name: "Priya Singh",
    category: "Zumba",
    distance: 2.5,
    rating: 4.8,
    price: 500,
    verified: true,
    avatar: "PS",
  },
  {
    id: 2,
    name: "Raj Patel",
    category: "CrossFit",
    distance: 1.8,
    rating: 4.9,
    price: 600,
    verified: true,
    avatar: "RP",
  },
  {
    id: 3,
    name: "Anjali Sharma",
    category: "Yoga",
    distance: 3.2,
    rating: 4.7,
    price: 400,
    verified: false,
    avatar: "AS",
  },
];

export default function Discover() {
  const [activeTab, setActiveTab] = useState<Tab>("trainers");
  const [showFilters, setShowFilters] = useState(false);
  const [filter, setFilter] = useState<Filter>({
    categories: [],
    verified: false,
    priceRange: [0, 2000],
    distance: 20,
    sort: "distance",
  });

  const categories = activeTab === "trainers" ? TRAINER_CATEGORIES : NUTRITIONIST_CATEGORIES;
  const hasActiveFilters = filter.categories.length > 0 || filter.verified || filter.distance < 20;

  const toggleCategory = (cat: string) => {
    setFilter({
      ...filter,
      categories: filter.categories.includes(cat)
        ? filter.categories.filter((c) => c !== cat)
        : [...filter.categories, cat],
    });
  };

  const clearFilters = () => {
    setFilter({
      categories: [],
      verified: false,
      priceRange: [0, 2000],
      distance: 20,
      sort: "distance",
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="max-w-md mx-auto">
          {/* Title */}
          <div className="px-4 py-6">
            <h1 className="text-2xl font-bold">Discover</h1>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab("trainers")}
              className={`flex-1 py-4 font-semibold border-b-2 transition-colors ${
                activeTab === "trainers"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground"
              }`}
            >
              Trainers
            </button>
            <button
              onClick={() => setActiveTab("nutritionists")}
              className={`flex-1 py-4 font-semibold border-b-2 transition-colors ${
                activeTab === "nutritionists"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground"
              }`}
            >
              Nutritionists
            </button>
          </div>

          {/* Filter Button and Clear All */}
          <div className="px-4 py-4 flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex-1 flex items-center justify-center gap-2 bg-card border border-border rounded-lg py-2 font-medium text-sm"
            >
              <ChevronDown className="w-4 h-4" />
              Filters
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

          {/* Filters Panel */}
          {showFilters && (
            <div className="px-4 py-4 space-y-4 border-t border-border bg-card/50 backdrop-blur">
              {/* Categories */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        filter.categories.includes(cat)
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground border border-border"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

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
        <div className="max-w-md mx-auto px-4 py-6 space-y-4">
          {MOCK_TRAINERS.map((trainer, idx) => (
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

                    <p className="text-xs text-muted-foreground mb-2">{trainer.category}</p>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {trainer.distance} km
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-primary text-primary" />
                        {trainer.rating}
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
      )}
    </div>
  );
}
