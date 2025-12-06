import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  Star,
  Heart,
  ArrowLeft,
  Loader,
  AlertCircle,
  Dumbbell,
  Apple,
  MapPinIcon,
} from "lucide-react";
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
  { id: "gym", label: "Gym", icon: "🏋️", type: "gym" },
  { id: "yoga", label: "Yoga", icon: "🧘", type: "yoga" },
  { id: "swimming", label: "Swimming", icon: "🏊", type: "swimming_pool" },
  { id: "physiotherapy", label: "Physiotherapy", icon: "🤕", type: "physical_therapy" },
  { id: "boxing", label: "Boxing", icon: "🥊", type: "boxing_gym" },
  { id: "wellness", label: "Wellness", icon: "🌿", type: "wellness_center" },
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
      {/* Header with Gradient Background */}
      <div className="sticky top-0 z-50 bg-background border-b border-border/50">
        <div className="px-4 py-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-orange-600 font-semibold mb-4 hover:opacity-80 transition-opacity"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <div className="mb-4">
            <h1 className="text-3xl font-black text-foreground mb-1">Discover</h1>
            <p className="text-sm text-muted-foreground font-medium">
              {activeTab === "trainers"
                ? "Find your perfect fitness coach"
                : activeTab === "nutritionists"
                ? "Connect with nutrition experts"
                : "Explore nearby fitness centers"}
            </p>
          </div>

          {/* Enhanced Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
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
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-card text-foreground focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none placeholder-muted-foreground transition-all font-medium text-sm"
            />
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="px-4 py-3 border-t border-border/50 overflow-x-auto">
          <div className="flex gap-2 pb-1">
            {[
              { id: "trainers", label: "💪 Trainers", value: "trainers" as DiscoverTab },
              { id: "nutritionists", label: "🥗 Nutrition", value: "nutritionists" as DiscoverTab },
              { id: "fitness", label: "📍 Fitness Centers", value: "fitness_centers" as DiscoverTab },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.value);
                  setSearchQuery("");
                  setCategory("");
                  setSelectedFitnessTypes([]);
                }}
                className={`px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-all text-sm ${
                  activeTab === tab.value
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Subcategory Filters */}
      {activeTab === "trainers" && (
        <div className="sticky top-[130px] z-40 bg-background border-b border-border/50 px-4 py-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setCategory("")}
              className={`px-4 py-1.5 rounded-full font-semibold whitespace-nowrap text-sm transition-all ${
                category === ""
                  ? "bg-orange-500 text-white shadow-md"
                  : "bg-muted text-foreground hover:bg-muted/80"
              }`}
            >
              All
            </button>
            {["Gym", "Yoga", "Boxing", "Zumba", "Nutrition"].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-1.5 rounded-full font-semibold whitespace-nowrap text-sm transition-all ${
                  category === cat
                    ? "bg-orange-500 text-white shadow-md"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab === "fitness_centers" && (
        <div className="bg-background border-b border-border/50 px-4 py-4">
          <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-3 opacity-70">
            Select Categories
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {fitnessCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => toggleFitnessType(cat.type)}
                className={`px-3 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  selectedFitnessTypes.includes(cat.type)
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                <span>{cat.icon}</span>
                <span className="hidden sm:inline">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="px-4 py-6">
        {/* Trainers Tab */}
        {activeTab === "trainers" && (
          <>
            {trainersLoading ? (
              <div className="flex flex-col justify-center items-center h-64 gap-3">
                <Loader className="animate-spin text-orange-500" size={40} />
                <p className="text-muted-foreground font-medium">Loading trainers...</p>
              </div>
            ) : filteredTrainers.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Dumbbell className="text-muted-foreground" size={32} />
                </div>
                <p className="text-foreground text-lg font-bold mb-2">No trainers found</p>
                <p className="text-muted-foreground text-sm">
                  Try adjusting your search or category filters
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTrainers.map((trainer) => (
                  <div
                    key={trainer.id}
                    className="bg-card rounded-2xl p-4 border border-border shadow-sm hover:shadow-md hover:border-orange-400/50 transition-all"
                  >
                    <div className="flex gap-3">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex-shrink-0 flex items-center justify-center text-xl font-bold text-white shadow-md">
                        {trainer.users?.username?.charAt(0).toUpperCase() || "T"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <div className="min-w-0">
                            <h3 className="font-bold text-foreground truncate">
                              {trainer.users?.username || "Trainer"}
                            </h3>
                            <p className="text-xs text-muted-foreground font-medium capitalize line-clamp-1">
                              {trainer.categories?.join(", ") || "Fitness"}
                            </p>
                          </div>
                          <button className="text-red-500 hover:text-red-600 flex-shrink-0 transition-colors">
                            <Heart size={18} fill="currentColor" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-semibold mb-2">
                          <div className="flex items-center gap-0.5 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-full">
                            <Star size={12} className="text-yellow-500" fill="currentColor" />
                            <span className="text-foreground">{trainer.rating?.toFixed(1) || "4.5"}</span>
                          </div>
                          <div className="flex items-center gap-0.5 text-muted-foreground">
                            <MapPin size={12} />
                            <span>{trainer.years_experience || 5}y exp</span>
                          </div>
                        </div>
                        <button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-2 rounded-lg font-semibold text-xs transition-all shadow-md hover:shadow-lg">
                          Book Now
                        </button>
                      </div>
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
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Apple className="text-muted-foreground" size={32} />
            </div>
            <p className="text-foreground text-lg font-bold mb-2">Coming Soon</p>
            <p className="text-muted-foreground text-sm">
              Our nutrition experts directory is launching soon
            </p>
          </div>
        )}

        {/* Fitness Centers Tab */}
        {activeTab === "fitness_centers" && (
          <>
            {locationPermissionDenied && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex gap-3">
                <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="text-sm font-bold text-red-900 dark:text-red-200">
                    Location access required
                  </p>
                  <p className="text-xs text-red-800 dark:text-red-300 mt-1">
                    Enable location permission to see nearby fitness centers
                  </p>
                  <button
                    onClick={requestUserLocation}
                    className="mt-2 text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors"
                  >
                    → Enable Location
                  </button>
                </div>
              </div>
            )}

            {loadingLocations ? (
              <div className="flex flex-col justify-center items-center h-64 gap-3">
                <Loader className="animate-spin text-orange-500" size={40} />
                <p className="text-muted-foreground font-medium">Finding nearby centers...</p>
              </div>
            ) : locationError && !userLocation ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPinIcon className="text-muted-foreground" size={32} />
                </div>
                <p className="text-foreground text-lg font-bold mb-2">Unable to fetch locations</p>
                <p className="text-muted-foreground text-sm mb-4">{locationError}</p>
              </div>
            ) : filteredFitnessLocations.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="text-muted-foreground" size={32} />
                </div>
                <p className="text-foreground text-lg font-bold mb-2">No centers found</p>
                <p className="text-muted-foreground text-sm">
                  Try a different category or search term
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFitnessLocations.map((location) => (
                  <button
                    key={location.id}
                    onClick={() => openInMaps(location)}
                    className="w-full text-left bg-card rounded-2xl p-4 border border-border shadow-sm hover:shadow-md hover:border-orange-400/50 transition-all hover:scale-[1.02] active:scale-95"
                  >
                    <div className="flex gap-3">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex-shrink-0 flex items-center justify-center text-2xl shadow-md">
                        {location.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <h3 className="font-bold text-foreground truncate">
                            {location.name}
                          </h3>
                          <span className="text-xs bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 px-2 py-1 rounded-full font-bold flex-shrink-0">
                            {location.distance.toFixed(1)} km
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground font-medium line-clamp-1 mb-2">
                          {location.address}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-0.5 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-full">
                            <Star size={12} className="text-yellow-500" fill="currentColor" />
                            <span className="text-xs font-bold text-foreground">
                              {location.rating.toFixed(1)}
                            </span>
                            <span className="text-xs text-muted-foreground ml-0.5">
                              ({location.reviews})
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        className="text-red-500 hover:text-red-600 flex-shrink-0 transition-colors mt-1"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <Heart size={18} fill="currentColor" />
                      </button>
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
