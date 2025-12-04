import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2, Search, Camera, ImageIcon, X } from "lucide-react";
import { useMealTrackerData } from "@/hooks/useMeals";
import { useMealPhotos } from "@/hooks/useMealPhotos";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

interface Food {
  id: string;
  name: string;
  category: string;
  units_available: string[];
  per_100g: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

const MealTracker = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { useDailyMeals, useWeeklyMeals, useAddMeal, useDeleteMeal } =
    useMealTrackerData();
  const { uploadPhoto, fetchPhotos, uploading } = useMealPhotos();

  const [currentDate, setCurrentDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  const [foods, setFoods] = useState<Food[]>([]);
  const [showAddFood, setShowAddFood] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<
    "breakfast" | "lunch" | "snacks" | "dinner"
  >("breakfast");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [quantity, setQuantity] = useState(100);
  const [selectedUnit, setSelectedUnit] = useState("g");
  const [scrollPosition, setScrollPosition] = useState(0);
  const [mealPhotos, setMealPhotos] = useState<Record<string, any[]>>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const { data: dailyMeals, isLoading: loadingDaily } = useDailyMeals(
    currentDate,
    user?.id
  );
  const addMealMutation = useAddMeal();
  const deleteMealMutation = useDeleteMeal();

  useEffect(() => {
    fetch("/foods-database.json")
      .then((res) => res.json())
      .then((data) => setFoods(data.foods))
      .catch((err) => console.error("Failed to load foods:", err));
  }, []);

  // Load photos for all meal types
  useEffect(() => {
    if (!user?.id) return;

    const loadAllPhotos = async () => {
      const mealTypes = ["breakfast", "lunch", "snacks", "dinner"];
      const photos: Record<string, any[]> = {};

      for (const mealType of mealTypes) {
        try {
          const photoList = await fetchPhotos(user.id, currentDate, mealType);
          photos[mealType] = photoList;
        } catch (error) {
          console.error(`Error loading photos for ${mealType}:`, error);
        }
      }

      setMealPhotos(photos);
    };

    loadAllPhotos();
  }, [currentDate, user?.id]);

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    const today = new Date();
    const isToday =
      date.toISOString().split("T")[0] === today.toISOString().split("T")[0];
    return isToday ? "Today" : date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  }

  function calculateMacros(food: Food, qty: number, unit: string) {
    const multiplier = unit === "g" ? qty / 100 : unit === "piece" ? (qty * 100) / 100 : qty / 100;
    return {
      calories: Math.round(food.per_100g.calories * multiplier * 10) / 10,
      protein: Math.round(food.per_100g.protein * multiplier * 10) / 10,
      carbs: Math.round(food.per_100g.carbs * multiplier * 10) / 10,
      fats: Math.round(food.per_100g.fats * multiplier * 10) / 10,
    };
  }

  async function handleAddFood() {
    if (!selectedFood) return;

    const macros = calculateMacros(selectedFood, quantity, selectedUnit);

    try {
      await addMealMutation.mutateAsync({
        date: currentDate,
        meal_type: selectedMealType,
        food_name: selectedFood.name,
        quantity,
        unit: selectedUnit,
        calories: macros.calories,
        protein: macros.protein,
        carbs: macros.carbs,
        fats: macros.fats,
      });

      toast({
        title: "Success",
        description: `${selectedFood.name} added to ${selectedMealType}`,
      });

      setSelectedFood(null);
      setQuantity(100);
      setSelectedUnit("g");
      setShowAddFood(false);
      setSearchQuery("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add meal. Please try again.",
        variant: "destructive",
      });
    }
  }

  async function handlePhotoUpload(file: File, mealType: string) {
    if (!user?.id || !file) return;

    try {
      await uploadPhoto(file, user.id, currentDate, mealType);
      
      // Reload photos
      const photoList = await fetchPhotos(user.id, currentDate, mealType);
      setMealPhotos(prev => ({
        ...prev,
        [mealType]: photoList,
      }));

      toast({
        title: "Success",
        description: "Meal photo added! (Auto-deleted after 7 days)",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
    }
  }

  const filteredFoods = foods.filter((food) =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const macros = selectedFood
    ? calculateMacros(selectedFood, quantity, selectedUnit)
    : null;

  const mealTypes = ["breakfast", "lunch", "snacks", "dinner"];
  const mealIcons: Record<string, string> = {
    breakfast: "🌅",
    lunch: "🍽️",
    snacks: "🥜",
    dinner: "🌙",
  };

  const mealColors: Record<string, string> = {
    breakfast: "from-amber-100 to-orange-100",
    lunch: "from-blue-100 to-cyan-100",
    snacks: "from-purple-100 to-pink-100",
    dinner: "from-indigo-100 to-blue-100",
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 350;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-50 via-white to-slate-100 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-md border-b border-gray-200/50 p-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <button
          onClick={() => setCurrentDate(
            new Date(new Date(currentDate).getTime() - 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0]
          )}
          className="p-2 hover:bg-gray-100/50 rounded-lg transition text-gray-700"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {formatDate(currentDate)}
          </h1>
          <p className="text-xs text-gray-500 mt-1">Swipe to browse meals</p>
        </div>
        <button
          onClick={() => setCurrentDate(
            new Date(new Date(currentDate).getTime() + 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0]
          )}
          className="p-2 hover:bg-gray-100/50 rounded-lg transition text-gray-700"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Macro Summary Bar */}
      {dailyMeals && (
        <div className="bg-white/50 backdrop-blur-md border-b border-gray-200/50 p-4 shadow-sm">
          <div className="flex justify-between gap-2">
            <div className="flex-1 bg-gradient-to-br from-orange-200/60 to-red-200/60 backdrop-blur-sm rounded-2xl p-3 text-gray-900 border border-orange-200/40">
              <p className="text-xs font-semibold opacity-80">Cal</p>
              <p className="text-xl font-bold">{Math.round(dailyMeals.totals.calories)}</p>
              <p className="text-xs opacity-70">/ 2500</p>
            </div>
            <div className="flex-1 bg-gradient-to-br from-blue-200/60 to-cyan-200/60 backdrop-blur-sm rounded-2xl p-3 text-gray-900 border border-blue-200/40">
              <p className="text-xs font-semibold opacity-80">Protein</p>
              <p className="text-xl font-bold">{Math.round(dailyMeals.totals.protein)}g</p>
              <p className="text-xs opacity-70">/ 150g</p>
            </div>
            <div className="flex-1 bg-gradient-to-br from-green-200/60 to-emerald-200/60 backdrop-blur-sm rounded-2xl p-3 text-gray-900 border border-green-200/40">
              <p className="text-xs font-semibold opacity-80">Carbs</p>
              <p className="text-xl font-bold">{Math.round(dailyMeals.totals.carbs)}g</p>
              <p className="text-xs opacity-70">/ 300g</p>
            </div>
            <div className="flex-1 bg-gradient-to-br from-yellow-200/60 to-amber-200/60 backdrop-blur-sm rounded-2xl p-3 text-gray-900 border border-yellow-200/40">
              <p className="text-xs font-semibold opacity-80">Fats</p>
              <p className="text-xl font-bold">{Math.round(dailyMeals.totals.fats)}g</p>
              <p className="text-xs opacity-70">/ 75g</p>
            </div>
          </div>
        </div>
      )}

      {/* Horizontal Swiper */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-3 pt-4">
          <h2 className="text-lg font-bold text-gray-900">Meals</h2>
          <div className="flex gap-2">
            <button
              onClick={() => scroll("left")}
              className="p-2 hover:bg-gray-100/70 rounded-full transition text-gray-700"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-2 hover:bg-gray-100/70 rounded-full transition text-gray-700"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div
          ref={scrollContainerRef}
          className="flex gap-4 p-4 overflow-x-auto snap-x snap-mandatory flex-1 scrollbar-hide"
          style={{ scrollBehavior: "smooth" }}
        >
          {mealTypes.map((mealType) => {
            const mealCalories = dailyMeals
              ? dailyMeals[mealType as keyof typeof dailyMeals].reduce((s, m) => s + (m.calories || 0), 0)
              : 0;
            const mealItems = dailyMeals?.[mealType as keyof typeof dailyMeals] || [];
            const photos = mealPhotos[mealType] || [];

            return (
              <div
                key={mealType}
                className="flex-shrink-0 w-80 snap-center"
              >
                <div className={`bg-gradient-to-br ${mealColors[mealType]} backdrop-blur-lg rounded-3xl p-6 h-full shadow-lg hover:shadow-xl transition-all duration-300 border border-white/40 flex flex-col`}>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-4xl">{mealIcons[mealType]}</span>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 capitalize">
                            {mealType}
                          </h3>
                          <p className="text-sm text-gray-700 font-semibold">
                            {Math.round(mealCalories)} cal
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedMealType(mealType as any);
                        setShowAddFood(true);
                      }}
                      className="p-3 bg-white/40 hover:bg-white/60 backdrop-blur-sm rounded-full transition text-gray-700 border border-white/40"
                    >
                      <Plus size={24} />
                    </button>
                  </div>

                  {/* Photo Section */}
                  <div className="mb-4">
                    {photos.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {photos.map((photo) => (
                          <div key={photo.id} className="relative group">
                            <img
                              src={photo.photo_url}
                              alt="Meal"
                              className="w-full h-20 object-cover rounded-lg border border-white/40"
                            />
                          </div>
                        ))}
                      </div>
                    ) : null}
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => cameraInputRef.current?.click()}
                        disabled={uploading}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/40 hover:bg-white/60 backdrop-blur-sm rounded-lg transition text-gray-700 border border-white/40 font-semibold disabled:opacity-50"
                      >
                        <Camera size={18} />
                        Camera
                      </button>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/40 hover:bg-white/60 backdrop-blur-sm rounded-lg transition text-gray-700 border border-white/40 font-semibold disabled:opacity-50"
                      >
                        <ImageIcon size={18} />
                        Photo
                      </button>
                    </div>

                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handlePhotoUpload(e.target.files[0], mealType);
                        }
                      }}
                      className="hidden"
                    />

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handlePhotoUpload(e.target.files[0], mealType);
                        }
                      }}
                      className="hidden"
                    />
                  </div>

                  {/* Macro Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4 bg-white/30 backdrop-blur-sm rounded-2xl p-3 border border-white/40">
                    <div className="text-center">
                      <p className="text-xs text-gray-700 font-semibold">P</p>
                      <p className="text-lg font-bold text-gray-900">
                        {Math.round(
                          mealItems.reduce((s, m) => s + (m.protein || 0), 0)
                        )}g
                      </p>
                    </div>
                    <div className="text-center border-l border-r border-white/40">
                      <p className="text-xs text-gray-700 font-semibold">C</p>
                      <p className="text-lg font-bold text-gray-900">
                        {Math.round(
                          mealItems.reduce((s, m) => s + (m.carbs || 0), 0)
                        )}g
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-700 font-semibold">F</p>
                      <p className="text-lg font-bold text-gray-900">
                        {Math.round(
                          mealItems.reduce((s, m) => s + (m.fats || 0), 0)
                        )}g
                      </p>
                    </div>
                  </div>

                  {/* Food Items */}
                  <div className="flex-1 overflow-y-auto mb-4 space-y-2">
                    {mealItems.length > 0 ? (
                      mealItems.map((meal) => (
                        <div
                          key={meal.id}
                          className="bg-white/30 backdrop-blur-sm rounded-xl p-3 flex items-center justify-between group hover:bg-white/50 transition border border-white/40"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">
                              {meal.food_name}
                            </p>
                            <p className="text-xs text-gray-700">
                              {meal.quantity}{meal.unit} • {meal.calories}cal
                            </p>
                          </div>
                          <button
                            onClick={() => deleteMealMutation.mutateAsync(meal.id!)}
                            className="p-1.5 hover:bg-red-200/70 rounded-lg transition text-red-600 ml-2 flex-shrink-0"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <p className="text-gray-700 font-semibold">No items yet</p>
                        <p className="text-xs text-gray-600 mt-1">Tap + to add food</p>
                      </div>
                    )}
                  </div>

                  {/* Add Button */}
                  <button
                    onClick={() => {
                      setSelectedMealType(mealType as any);
                      setShowAddFood(true);
                    }}
                    className="w-full py-3 bg-white/70 hover:bg-white text-gray-900 font-bold rounded-2xl transition shadow-md border border-white/40"
                  >
                    + Add Food
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Food Modal */}
      {showAddFood && (
        <div className="fixed inset-0 bg-black/30 flex items-end z-50 backdrop-blur-sm">
          <div className="w-full bg-white rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Add Food</h2>
              <button
                onClick={() => setShowAddFood(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            {!selectedFood ? (
              <>
                <div className="relative mb-4">
                  <Search
                    size={18}
                    className="absolute left-3 top-3 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Search foods..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 placeholder-gray-500"
                  />
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredFoods.slice(0, 30).map((food) => (
                    <button
                      key={food.id}
                      onClick={() => setSelectedFood(food)}
                      className="w-full text-left p-3 bg-gradient-to-r from-gray-100/60 to-gray-50/60 hover:from-orange-100/60 hover:to-yellow-100/60 rounded-2xl transition border border-gray-200/50"
                    >
                      <p className="font-bold text-gray-900">
                        {food.name}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {food.per_100g.calories}cal/100g • P:{food.per_100g.protein}g C:{food.per_100g.carbs}g F:{food.per_100g.fats}g
                      </p>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {selectedFood.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedFood.category}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Quantity
                    </label>
                    <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() =>
                          setQuantity(Math.max(10, quantity - 10))
                        }
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-bold text-lg"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(Number(e.target.value) || 0)
                        }
                        className="flex-1 bg-transparent text-center text-2xl font-bold text-gray-900 focus:outline-none"
                      />
                      <button
                        onClick={() => setQuantity(quantity + 10)}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-bold text-lg"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Unit
                    </label>
                    <div className="flex gap-2">
                      {selectedFood.units_available.map((unit) => (
                        <button
                          key={unit}
                          onClick={() => setSelectedUnit(unit)}
                          className={`px-4 py-2 rounded-lg font-bold transition ${
                            selectedUnit === unit
                              ? "bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-lg"
                              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                          }`}
                        >
                          {unit}
                        </button>
                      ))}
                    </div>
                  </div>

                  {macros && (
                    <div className="bg-gradient-to-br from-orange-100/60 to-yellow-100/60 rounded-2xl p-4 border-2 border-orange-200/40 backdrop-blur-sm">
                      <p className="text-sm font-bold text-gray-900 mb-3">
                        Nutritional Info
                      </p>
                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div className="bg-white/60 rounded-lg p-2">
                          <p className="text-lg font-bold text-orange-600">
                            {macros.calories}
                          </p>
                          <p className="text-xs text-gray-600">Cal</p>
                        </div>
                        <div className="bg-white/60 rounded-lg p-2">
                          <p className="text-lg font-bold text-blue-600">
                            {macros.protein}g
                          </p>
                          <p className="text-xs text-gray-600">P</p>
                        </div>
                        <div className="bg-white/60 rounded-lg p-2">
                          <p className="text-lg font-bold text-green-600">
                            {macros.carbs}g
                          </p>
                          <p className="text-xs text-gray-600">C</p>
                        </div>
                        <div className="bg-white/60 rounded-lg p-2">
                          <p className="text-lg font-bold text-red-600">
                            {macros.fats}g
                          </p>
                          <p className="text-xs text-gray-600">F</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setSelectedFood(null)}
                      className="flex-1 px-4 py-3 bg-gray-200 text-gray-900 rounded-lg font-bold hover:bg-gray-300 transition"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleAddFood}
                      disabled={addMealMutation.isPending}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-lg font-bold hover:shadow-lg transition disabled:opacity-50"
                    >
                      Add to {selectedMealType}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MealTracker;
