import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Star, Heart, ArrowLeft } from "lucide-react";
import { useTrainers } from "@/hooks/useTrainers";

export default function MobileDiscover() {
  const navigate = useNavigate();
  const { trainers, loading } = useTrainers();
  const [category, setCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["Gym", "Yoga", "Boxing", "Zumba", "Nutrition"];

  // Filter trainers by category and search
  const filteredTrainers = trainers.filter((trainer) => {
    const matchesCategory =
      !category ||
      (trainer.specialties &&
        trainer.specialties.some((s) =>
          s.toLowerCase().includes(category.toLowerCase()),
        ));
    const matchesSearch =
      !searchQuery ||
      trainer.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trainer.bio?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-background border-b border-border px-4 py-3 sticky top-0 z-10">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-orange-600 font-semibold mb-4"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <h1 className="text-2xl font-bold text-foreground">Find Trainers</h1>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-4 bg-background border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search trainers..."
            className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="px-4 py-4 bg-background overflow-x-auto">
        <div className="flex gap-2 pb-2">
          <button
            onClick={() => setCategory("")}
            className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap transition-all ${
              category === ""
                ? "bg-orange-500 text-white"
                : "bg-muted text-foreground hover:bg-muted/80"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap capitalize transition-all ${
                category === cat
                  ? "bg-orange-500 text-white"
                  : "bg-muted text-foreground hover:bg-muted/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Trainers List */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
        </div>
      ) : filteredTrainers.length === 0 ? (
        <div className="px-4 py-12 text-center">
          <p className="text-gray-600 text-lg">No trainers found</p>
          <p className="text-gray-500 text-sm mt-2">Try a different category</p>
        </div>
      ) : (
        <div className="px-4 py-4 space-y-3">
          {filteredTrainers.map((trainer) => (
            <div
              key={trainer.id}
              className="bg-card rounded-2xl p-4 shadow-sm hover:shadow-md transition-all border border-border"
            >
              <div className="flex gap-4">
                {/* Avatar */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex-shrink-0 flex items-center justify-center text-2xl">
                  💪
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-foreground">
                        {trainer.users?.username || "Trainer"}
                      </h3>
                      <p className="text-xs text-muted-foreground capitalize">
                        {trainer.categories?.join(", ") || "Fitness"}
                      </p>
                    </div>
                    <button className="text-red-500 hover:text-red-600">
                      <Heart size={20} fill="currentColor" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Star
                        size={16}
                        className="text-yellow-500"
                        fill="currentColor"
                      />
                      <span className="text-sm font-semibold text-foreground">
                        {trainer.rating?.toFixed(1) || "4.5"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin size={16} />
                      <span className="text-sm">
                        {trainer.years_experience || 5}y exp
                      </span>
                    </div>
                  </div>

                  <button className="w-full mt-3 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-semibold text-sm transition-colors">
                    Book Session
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
