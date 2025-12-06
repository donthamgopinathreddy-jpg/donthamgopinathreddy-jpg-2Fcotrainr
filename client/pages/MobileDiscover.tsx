import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Star, Heart, ArrowLeft, Loader, AlertCircle, X, Filter } from "lucide-react";
import { useTrainers } from "@/hooks/useTrainers";

type DiscoverTab = "trainers" | "nutritionists" | "fitness_centers";

interface FitnessLocation {
  id: string;
  name: string;
  type: string;
  address: string;
  rating: number;
  reviews: number;
  distance: number;
  lat: number;
  lng: number;
  icon: string;
}

const fitnessCategories = [
  { id: "gym", label: "Gym", type: "gym" },
  { id: "yoga", label: "Yoga", type: "yoga" },
  { id: "swimming", label: "Swimming", type: "swimming_pool" },
  { id: "physiotherapy", label: "Physiotherapy", type: "physical_therapy" },
  { id: "boxing", label: "Boxing", type: "boxing_gym" },
  { id: "wellness", label: "Wellness", type: "wellness_center" },
];

export default function MobileDiscover() {
  const navigate = useNavigate();
  const { trainers, loading: trainersLoading } = useTrainers();

  const [activeTab, setActiveTab] = useState<DiscoverTab>("trainers");
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("");
  const [selectedFitnessTypes, setSelectedFitnessTypes] = useState<string[]>([]);
  const [fitnessLocations, setFitnessLocations] = useState<FitnessLocation[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showFitnessDropdown, setShowFitnessDropdown] = useState(false);

  useEffect(() => {
    if (activeTab === "fitness_centers" && !userLocation && !locationPermissionDenied) {
      requestUserLocation();
    }
  }, [activeTab]);

  const requestUserLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          fetchNearbyFitnesscenters(latitude, longitude);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLocationPermissionDenied(true);
          setLocationError(
            "Location access denied. Please enable location permissions to see nearby fitness centers."
          );
        }
      );
    }
  };

  const fetchNearbyFitnesscenters = async (lat: number, lng: number) => {
    setLoadingLocations(true);
    setLocationError(null);
    try {
      const mockLocations: FitnessLocation[] = [
        {
          id: "1",
          name: "FitLife Gym",
          type: "gym",
          address: "123 Main St, Your City",
          rating: 4.8,
          reviews: 245,
          distance: 0.5,
          lat: lat + 0.001,
          lng: lng + 0.001,
          icon: "🏋️",
        },
        {
          id: "2",
          name: "Yoga Zen Studio",
          type: "yoga",
          address: "456 Park Ave, Your City",
          rating: 4.9,
          reviews: 189,
          distance: 1.2,
          lat: lat + 0.002,
          lng: lng - 0.001,
          icon: "🧘",
        },
        {
          id: "3",
          name: "Crystal Pool Center",
          type: "swimming",
          address: "789 Water St, Your City",
          rating: 4.6,
          reviews: 156,
          distance: 2.1,
          lat: lat - 0.002,
          lng: lng + 0.002,
          icon: "🏊",
        },
        {
          id: "4",
          name: "PhysioHealth Clinic",
          type: "physiotherapy",
          address: "321 Health Rd, Your City",
          rating: 4.7,
          reviews: 98,
          distance: 1.8,
          lat: lat - 0.001,
          lng: lng - 0.002,
          icon: "🤕",
        },
        {
          id: "5",
          name: "Champion Boxing Ring",
          type: "boxing",
          address: "654 Fight St, Your City",
          rating: 4.5,
          reviews: 73,
          distance: 3.2,
          lat: lat + 0.003,
          lng: lng + 0.003,
          icon: "🥊",
        },
        {
          id: "6",
          name: "Wellness Sanctuary",
          type: "wellness",
          address: "987 Spa Ln, Your City",
          rating: 4.9,
          reviews: 212,
          distance: 2.5,
          lat: lat - 0.003,
          lng: lng - 0.003,
          icon: "🌿",
        },
      ];
      setFitnessLocations(mockLocations);
    } catch (error) {
      console.error("Error fetching fitness centers:", error);
      setLocationError("Failed to fetch nearby fitness centers. Please try again.");
    } finally {
      setLoadingLocations(false);
    }
  };

  const filteredTrainers = trainers.filter((trainer) => {
    const matchesCategory =
      !category ||
      (trainer.specialties &&
        trainer.specialties.some((s) =>
          s.toLowerCase().includes(category.toLowerCase())
        ));
    const matchesSearch =
      !searchQuery ||
      trainer.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trainer.bio?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredFitnessLocations = fitnessLocations.filter((location) => {
    const matchesType =
      selectedFitnessTypes.length === 0 || selectedFitnessTypes.includes(location.type);
    const matchesSearch =
      !searchQuery ||
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const toggleFitnessType = (type: string) => {
    setSelectedFitnessTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const openInMaps = (location: FitnessLocation) => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    if (isIOS) {
      window.open(
        `maps://maps.apple.com/?address=${encodeURIComponent(
          location.address
        )}&q=${encodeURIComponent(location.name)}&ll=${location.lat},${location.lng}`,
        "_blank"
      );
    } else {
      window.open(
        `https://www.google.com/maps/search/${encodeURIComponent(
          location.name
        )}/@${location.lat},${location.lng},15z`,
        "_blank"
      );
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-orange-600 font-semibold hover:opacity-80 transition"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-black text-foreground">Discover</h1>
          <div className="w-6" />
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === "trainers"
                ? "Search trainers..."
                : activeTab === "nutritionists"
                ? "Search nutritionists..."
                : "Search fitness centers..."
            }
            className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-border bg-card text-foreground focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none placeholder-muted-foreground transition font-medium"
          />
        </div>

        {/* Tab Navigation - Underline Style */}
        <div className="flex gap-4 -mx-4 px-4 overflow-x-auto pb-1 border-b border-border">
          {[
            { id: "trainers", label: "Trainers", emoji: "💪" },
            { id: "nutritionists", label: "Nutrition", emoji: "🥗" },
            { id: "fitness_centers", label: "Centers", emoji: "📍" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as DiscoverTab);
                setSearchQuery("");
                setCategory("");
                setSelectedFitnessTypes([]);
              }}
              className={`px-1 py-3 font-bold text-sm whitespace-nowrap transition-all relative ${
                activeTab === tab.id
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {tab.emoji} {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Category/Filter Section - Dropdown */}
      {activeTab === "trainers" && (
        <div className="sticky top-24 z-40 bg-background border-b border-border px-4 py-3">
          <button
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            className="flex items-center gap-2 py-2 hover:opacity-80 transition"
          >
            <Filter size={18} className="text-orange-500" />
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {category || "All Categories"}
            </p>
          </button>

          {/* Dropdown Menu */}
          {showCategoryDropdown && (
            <div className="absolute top-20 left-4 right-4 bg-card border-2 border-border rounded-2xl shadow-lg z-50 p-4 mt-2">
              <div className="grid grid-cols-2 gap-2">
                {[
                  "All",
                  "Gym",
                  "Yoga",
                  "Boxing",
                  "Zumba",
                  "Nutrition",
                ].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setCategory(cat === "All" ? "" : cat);
                      setShowCategoryDropdown(false);
                    }}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                      (cat === "All" && category === "") || category === cat
                        ? "bg-orange-500 text-white"
                        : "bg-muted text-foreground hover:bg-muted/80"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "fitness_centers" && (
        <div className="bg-background border-b border-border px-4 py-3">
          <button
            onClick={() => setShowFitnessDropdown(!showFitnessDropdown)}
            className="flex items-center gap-2 py-2 hover:opacity-80 transition"
          >
            <Filter size={18} className="text-orange-500" />
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {selectedFitnessTypes.length > 0
                ? `${selectedFitnessTypes.length} Selected`
                : "All Categories"}
            </p>
          </button>

          {/* Dropdown Menu */}
          {showFitnessDropdown && (
            <div className="absolute top-20 left-4 right-4 bg-card border-2 border-border rounded-2xl shadow-lg z-50 p-4 mt-2">
              <div className="grid grid-cols-2 gap-2">
                {fitnessCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => toggleFitnessType(cat.type)}
                    className={`px-3 py-3 rounded-lg font-semibold text-sm transition-all ${
                      selectedFitnessTypes.includes(cat.type)
                        ? "bg-orange-500 text-white shadow-lg"
                        : "bg-muted text-foreground hover:bg-muted/80"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="px-4 py-6">
        {/* Trainers Tab */}
        {activeTab === "trainers" && (
          <>
            {trainersLoading ? (
              <div className="flex flex-col justify-center items-center h-64 gap-3">
                <Loader className="animate-spin text-orange-500" size={40} />
                <p className="text-muted-foreground">Loading trainers...</p>
              </div>
            ) : filteredTrainers.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-foreground text-lg font-bold mb-2">No trainers found</p>
                <p className="text-muted-foreground">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredTrainers.map((trainer) => (
                  <div
                    key={trainer.id}
                    className="group bg-card rounded-3xl overflow-hidden border-2 border-border hover:border-orange-400 transition-all"
                  >
                    {/* Trainer Card Header with Gradient */}
                    <div className="h-24 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 flex items-end justify-between p-4 relative">
                      <div className="absolute -bottom-8 left-4 w-16 h-16 rounded-full bg-gradient-to-br from-orange-300 to-orange-600 border-4 border-card flex items-center justify-center text-3xl font-bold text-white">
                        {trainer.users?.username?.charAt(0).toUpperCase() || "T"}
                      </div>
                      <button className="text-white hover:scale-110 transition">
                        <Heart size={24} fill="white" />
                      </button>
                    </div>

                    {/* Trainer Info */}
                    <div className="p-4 pt-10">
                      <h3 className="font-bold text-lg text-foreground mb-1">
                        {trainer.users?.username || "Trainer"}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3 capitalize">
                        {trainer.categories?.join(", ") || "Fitness"}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-1">
                          <Star size={16} className="text-yellow-500" fill="currentColor" />
                          <span className="font-bold text-foreground">
                            {trainer.rating?.toFixed(1) || "4.5"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin size={16} />
                          <span>{trainer.years_experience || 5}y</span>
                        </div>
                      </div>

                      {/* CTA Button */}
                      <button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 rounded-2xl transition-all active:scale-95 shadow-lg">
                        Book Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Nutritionists Tab */}
        {activeTab === "nutritionists" && (
          <div className="py-16 text-center">
            <div className="text-6xl mb-4">🥗</div>
            <p className="text-foreground text-lg font-bold mb-2">Coming Soon</p>
            <p className="text-muted-foreground">Nutrition experts launching soon</p>
          </div>
        )}

        {/* Fitness Centers Tab */}
        {activeTab === "fitness_centers" && (
          <>
            {locationPermissionDenied && (
              <div className="mb-6 bg-red-500/10 border-2 border-red-500 rounded-2xl p-4 flex gap-3">
                <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-sm font-bold text-red-600">Location required</p>
                  <p className="text-xs text-red-600 mt-1">Enable location access to discover nearby centers</p>
                  <button
                    onClick={requestUserLocation}
                    className="mt-2 text-sm font-bold text-orange-600 hover:text-orange-700"
                  >
                    → Enable Location
                  </button>
                </div>
              </div>
            )}

            {loadingLocations ? (
              <div className="flex flex-col justify-center items-center h-64 gap-3">
                <Loader className="animate-spin text-orange-500" size={40} />
                <p className="text-muted-foreground">Finding centers...</p>
              </div>
            ) : locationError && !userLocation ? (
              <div className="py-16 text-center">
                <div className="text-6xl mb-4">📍</div>
                <p className="text-foreground text-lg font-bold mb-2">Unable to fetch locations</p>
              </div>
            ) : filteredFitnessLocations.length === 0 ? (
              <div className="py-16 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-foreground text-lg font-bold mb-2">No centers found</p>
                <p className="text-muted-foreground">Try a different filter</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredFitnessLocations.map((location) => (
                  <button
                    key={location.id}
                    onClick={() => openInMaps(location)}
                    className="text-left bg-card rounded-3xl overflow-hidden border-2 border-border hover:border-orange-400 transition-all group active:scale-95"
                  >
                    {/* Location Card Header */}
                    <div className="h-20 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 flex items-center justify-between p-4 relative">
                      <div className="absolute -bottom-6 left-4 w-12 h-12 rounded-full bg-gradient-to-br from-orange-300 to-orange-600 border-4 border-card flex items-center justify-center text-2xl">
                        {location.icon}
                      </div>
                      <div className="flex-1 ml-16">
                        <p className="text-xs text-white/70 font-semibold">
                          {location.distance.toFixed(1)} km away
                        </p>
                      </div>
                      <div className="bg-white/20 backdrop-blur px-3 py-1 rounded-full">
                        <p className="text-xs font-bold text-white">
                          {location.rating.toFixed(1)} ⭐
                        </p>
                      </div>
                    </div>

                    {/* Location Info */}
                    <div className="p-4 pt-8">
                      <h3 className="font-bold text-lg text-foreground mb-1">
                        {location.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {location.address}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground font-semibold">
                          {location.reviews} reviews
                        </span>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Heart size={20} fill="currentColor" />
                        </button>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
