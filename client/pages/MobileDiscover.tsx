import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Star, Heart, ArrowLeft, Loader, AlertCircle } from "lucide-react";
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
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b border-border px-4 py-3">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-orange-600 font-semibold mb-4"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <h1 className="text-2xl font-bold text-foreground">Discover</h1>
      </div>

      {/* Toggle Tabs */}
      <div className="sticky top-14 z-40 bg-background border-b border-border px-4 py-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => {
              setActiveTab("trainers");
              setSearchQuery("");
              setCategory("");
            }}
            className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap transition-all ${
              activeTab === "trainers"
                ? "bg-orange-500 text-white"
                : "bg-muted text-foreground hover:bg-muted/80"
            }`}
          >
            Trainers
          </button>
          <button
            onClick={() => {
              setActiveTab("nutritionists");
              setSearchQuery("");
            }}
            className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap transition-all ${
              activeTab === "nutritionists"
                ? "bg-orange-500 text-white"
                : "bg-muted text-foreground hover:bg-muted/80"
            }`}
          >
            Nutritionists
          </button>
          <button
            onClick={() => {
              setActiveTab("fitness_centers");
              setSearchQuery("");
              setSelectedFitnessTypes([]);
            }}
            className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap transition-all ${
              activeTab === "fitness_centers"
                ? "bg-orange-500 text-white"
                : "bg-muted text-foreground hover:bg-muted/80"
            }`}
          >
            Fitness Centers
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-4 bg-background border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-muted-foreground" size={20} />
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
            className="w-full pl-10 pr-4 py-2 rounded-full border border-border bg-card text-foreground focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none placeholder-muted-foreground"
          />
        </div>
      </div>

      {/* Category Filters */}
      {activeTab === "trainers" && (
        <div className="px-4 py-3 bg-background border-b border-border overflow-x-auto">
          <div className="flex gap-2 pb-2">
            <button
              onClick={() => setCategory("")}
              className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap text-sm transition-all ${
                category === ""
                  ? "bg-orange-500 text-white"
                  : "bg-muted text-foreground hover:bg-muted/80"
              }`}
            >
              All
            </button>
            {["Gym", "Yoga", "Boxing", "Zumba", "Nutrition"].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap text-sm transition-all ${
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
      )}

      {activeTab === "fitness_centers" && (
        <div className="px-4 py-3 bg-background border-b border-border">
          <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
            Filter by Category
          </p>
          <div className="flex flex-wrap gap-2">
            {fitnessCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => toggleFitnessType(cat.type)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedFitnessTypes.includes(cat.type)
                    ? "bg-orange-500 text-white"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="px-4 py-4">
        {/* Trainers Tab */}
        {activeTab === "trainers" && (
          <>
            {trainersLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
              </div>
            ) : filteredTrainers.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-foreground text-lg font-semibold">No trainers found</p>
                <p className="text-muted-foreground text-sm mt-2">Try a different category or search term</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTrainers.map((trainer) => (
                  <div
                    key={trainer.id}
                    className="bg-card rounded-2xl p-4 shadow-sm hover:shadow-md transition-all border border-border"
                  >
                    <div className="flex gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex-shrink-0 flex items-center justify-center text-2xl">
                        💪
                      </div>
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
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-1">
                            <Star size={16} className="text-yellow-500" fill="currentColor" />
                            <span className="text-sm font-semibold text-foreground">
                              {trainer.rating?.toFixed(1) || "4.5"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin size={16} />
                            <span className="text-sm">{trainer.years_experience || 5}y exp</span>
                          </div>
                        </div>
                        <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-semibold text-sm transition-colors">
                          Book Session
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
          <div className="py-12 text-center">
            <p className="text-foreground text-lg font-semibold">Coming Soon</p>
            <p className="text-muted-foreground text-sm mt-2">Nutritionists directory coming soon</p>
          </div>
        )}

        {/* Fitness Centers Tab */}
        {activeTab === "fitness_centers" && (
          <>
            {locationPermissionDenied && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-3">
                <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0" size={20} />
                <div>
                  <p className="text-sm font-semibold text-red-900 dark:text-red-200">
                    Location access required
                  </p>
                  <p className="text-xs text-red-800 dark:text-red-300 mt-1">
                    Enable location permission to see nearby fitness centers
                  </p>
                  <button
                    onClick={requestUserLocation}
                    className="mt-2 text-sm font-semibold text-red-600 dark:text-red-400 hover:underline"
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}

            {loadingLocations ? (
              <div className="flex flex-col justify-center items-center h-40 gap-3">
                <Loader className="animate-spin text-orange-500" size={32} />
                <p className="text-muted-foreground">Finding nearby centers...</p>
              </div>
            ) : locationError && !userLocation ? (
              <div className="py-12 text-center">
                <p className="text-foreground text-lg font-semibold">Unable to fetch locations</p>
                <p className="text-muted-foreground text-sm mt-2">{locationError}</p>
              </div>
            ) : filteredFitnessLocations.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-foreground text-lg font-semibold">No fitness centers found</p>
                <p className="text-muted-foreground text-sm mt-2">Try a different category or search term</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFitnessLocations.map((location) => (
                  <div
                    key={location.id}
                    onClick={() => openInMaps(location)}
                    className="bg-card rounded-2xl p-4 shadow-sm hover:shadow-md transition-all border border-border cursor-pointer"
                  >
                    <div className="flex gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex-shrink-0 flex items-center justify-center text-3xl">
                        {location.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-foreground leading-tight">
                            {location.name}
                          </h3>
                          <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-1 rounded-full font-semibold flex-shrink-0 ml-2">
                            {location.distance.toFixed(1)} km
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                          {location.address}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Star size={14} className="text-yellow-500" fill="currentColor" />
                            <span className="text-sm font-semibold text-foreground">
                              {location.rating.toFixed(1)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({location.reviews})
                            </span>
                          </div>
                        </div>
                      </div>
                      <button className="text-red-500 hover:text-red-600 flex-shrink-0">
                        <Heart size={20} fill="currentColor" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
