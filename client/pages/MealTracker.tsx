import { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Search,
  Camera,
  Paperclip,
  X,
} from "lucide-react";
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

// Semi-circle macro visualization component
const MacroSemiCircle = ({
  current,
  target,
  label,
  color,
}: {
  current: number;
  target: number;
  label: string;
  color: string;
}) => {
  const percentage = Math.min((current / target) * 100, 100);
  const circumference = Math.PI * 60; // radius = 60

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-16 flex items-center justify-center">
        <svg width="128" height="64" viewBox="0 0 128 64" className="transform">
          {/* Background semicircle */}
          <path
            d="M 8 64 A 60 60 0 0 1 120 64"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="6"
          />
          {/* Progress semicircle */}
          <path
            d="M 8 64 A 60 60 0 0 1 120 64"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeDasharray={`${(circumference / 2) * (percentage / 100)} ${circumference / 2}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.3s ease" }}
          />
        </svg>
        <div className="absolute text-center">
          <p className="text-2xl font-bold text-gray-900">{Math.round(current)}</p>
          <p className="text-xs text-gray-600">{label}</p>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-2">/ {target}</p>
    </div>
  );
};

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
  const [mealOrder, setMealOrder] = useState([
    "breakfast",
    "lunch",
    "snacks",
    "dinner",
  ]);
  const [draggedMeal, setDraggedMeal] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const { data: dailyMeals, isLoading: loadingDaily } = useDailyMeals(
    currentDate,
    user?.id,
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
    return isToday
      ? "Today"
      : date.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        });
  }

  function calculateMacros(food: Food, qty: number, unit: string) {
    const multiplier =
      unit === "g"
        ? qty / 100
        : unit === "piece"
          ? (qty * 100) / 100
          : qty / 100;
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
      setMealPhotos((prev) => ({
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
    food.name.toLowerCase().includes(searchQuery.toLowerCase()),
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
    custom: "➕",
  };

  const mealColors: Record<string, string> = {
    breakfast: "from-amber-100 to-orange-100",
    lunch: "from-blue-100 to-cyan-100",
    snacks: "from-purple-100 to-pink-100",
    dinner: "from-indigo-100 to-blue-100",
    custom: "from-gray-100 to-slate-100",
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
          onClick={() =>
            setCurrentDate(
              new Date(new Date(currentDate).getTime() - 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
            )
          }
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
          onClick={() =>
            setCurrentDate(
              new Date(new Date(currentDate).getTime() + 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
            )
          }
          className="p-2 hover:bg-gray-100/50 rounded-lg transition text-gray-700"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* New Macro Summary with Semi-Circles */}
      {dailyMeals && (
        <div className="bg-white/50 backdrop-blur-md border-b border-gray-200/50 p-6 shadow-sm">
          <div className="flex flex-col items-center gap-8">
            {/* Central Protein Tile */}
            <div className="flex justify-center">
              <MacroSemiCircle
                current={dailyMeals.totals.protein}
                target={150}
                label="Protein"
                color="#3b82f6"
              />
            </div>

            {/* Other Macros Below */}
            <div className="grid grid-cols-3 gap-6 w-full">
              <div className="flex justify-center">
                <MacroSemiCircle
                  current={dailyMeals.totals.calories}
                  target={2500}
                  label="Calories"
                  color="#f97316"
                />
              </div>
              <div className="flex justify-center">
                <MacroSemiCircle
                  current={dailyMeals.totals.carbs}
                  target={300}
                  label="Carbs"
                  color="#22c55e"
                />
              </div>
              <div className="flex justify-center">
                <MacroSemiCircle
                  current={dailyMeals.totals.fats}
                  target={75}
                  label="Fats"
                  color="#ef4444"
                />
              </div>
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
          {mealOrder.map((mealType) => {
            const mealCalories = dailyMeals
              ? dailyMeals[mealType as keyof typeof dailyMeals].reduce(
                  (s, m) => s + (m.calories || 0),
                  0,
                )
              : 0;
            const mealItems =
              dailyMeals?.[mealType as keyof typeof dailyMeals] || [];
            const photos = mealPhotos[mealType] || [];

            return (
              <div
                key={mealType}
                className="flex-shrink-0 w-80 snap-center cursor-move group"
                draggable
                onDragStart={(e) => {
                  setDraggedMeal(mealType);
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggedMeal && draggedMeal !== mealType) {
                    const newOrder = [...mealOrder];
                    const draggedIndex = newOrder.indexOf(draggedMeal);
                    const targetIndex = newOrder.indexOf(mealType);

                    newOrder.splice(draggedIndex, 1);
                    newOrder.splice(targetIndex, 0, draggedMeal);

                    setMealOrder(newOrder);
                  }
                  setDraggedMeal(null);
                }}
                onDragEnd={() => setDraggedMeal(null)}
              >
                <div
                  className={`bg-gradient-to-br ${mealColors[mealType]} backdrop-blur-lg rounded-3xl p-6 h-full shadow-lg hover:shadow-xl transition-all duration-300 border border-white/40 flex flex-col ${
                    draggedMeal === mealType ? "opacity-50 scale-95" : ""
                  }`}
                >
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
                      <input
                        ref={cameraInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handlePhotoUpload(e.target.files[0], mealType);
                          }
                          e.currentTarget.value = "";
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
                          e.currentTarget.value = "";
                        }}
                        className="hidden"
                      />

                      <button
                        onClick={() => cameraInputRef.current?.click()}
                        disabled={uploading}
                        className="p-2.5 bg-blue-400/60 hover:bg-blue-500/70 backdrop-blur-sm rounded-lg transition text-white border border-blue-400/40 font-semibold disabled:opacity-50 active:scale-95"
                        title="Camera"
                      >
                        <Camera size={20} />
                      </button>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="p-2.5 bg-purple-400/60 hover:bg-purple-500/70 backdrop-blur-sm rounded-lg transition text-white border border-purple-400/40 font-semibold disabled:opacity-50 active:scale-95"
                        title="Photo Gallery"
                      >
                        <Paperclip size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Macro Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4 bg-white/30 backdrop-blur-sm rounded-2xl p-3 border border-white/40">
                    <div className="text-center">
                      <p className="text-xs text-gray-700 font-semibold">P</p>
                      <p className="text-lg font-bold text-gray-900">
                        {Math.round(
                          mealItems.reduce((s, m) => s + (m.protein || 0), 0),
                        )}
                        g
                      </p>
                    </div>
                    <div className="text-center border-l border-r border-white/40">
                      <p className="text-xs text-gray-700 font-semibold">C</p>
                      <p className="text-lg font-bold text-gray-900">
                        {Math.round(
                          mealItems.reduce((s, m) => s + (m.carbs || 0), 0),
                        )}
                        g
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-700 font-semibold">F</p>
                      <p className="text-lg font-bold text-gray-900">
                        {Math.round(
                          mealItems.reduce((s, m) => s + (m.fats || 0), 0),
                        )}
                        g
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
                              {meal.quantity}
                              {meal.unit} • {meal.calories}cal
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              deleteMealMutation.mutateAsync(meal.id!)
                            }
                            className="p-1.5 hover:bg-red-200/70 rounded-lg transition text-red-600 ml-2 flex-shrink-0"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <p className="text-gray-700 font-semibold">
                          No items yet
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Tap + to add food
                        </p>
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

          {/* Extra Meal Tile - Draggable */}
          <div
            className="flex-shrink-0 w-80 snap-center cursor-move group"
            draggable
            onDragStart={(e) => {
              setDraggedMeal("custom");
              e.dataTransfer.effectAllowed = "move";
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (draggedMeal && draggedMeal !== "custom") {
                const newOrder = [...mealOrder];
                const draggedIndex = newOrder.indexOf(draggedMeal);

                // Remove dragged item
                newOrder.splice(draggedIndex, 1);
                // Insert before custom position (which is at the end)
                newOrder.splice(newOrder.length, 0, draggedMeal);

                setMealOrder(newOrder);
              }
              setDraggedMeal(null);
            }}
            onDragEnd={() => setDraggedMeal(null)}
          >
            <button
              onClick={() => {
                setSelectedMealType("breakfast");
                setShowAddFood(true);
              }}
              className={`w-full h-full bg-gradient-to-br from-gray-100 to-slate-100 backdrop-blur-lg rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-dashed border-gray-400 hover:border-gray-500 flex flex-col items-center justify-center ${
                draggedMeal === "custom" ? "opacity-50 scale-95" : ""
              }`}
            >
              <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">
                ➕
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-1">
                Extra Meal
              </h3>
              <p className="text-xs text-gray-600 text-center">
                Hold to reorder
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* Modern Add Food Modal - Samsung/Apple Style */}
      {showAddFood && (
        <div className="fixed inset-0 bg-black/40 flex items-end z-50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full bg-white/95 backdrop-blur-xl rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto shadow-2xl border-t border-white/40">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Add Food</h2>
              <button
                onClick={() => setShowAddFood(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            {!selectedFood ? (
              <>
                {/* Search Bar */}
                <div className="relative mb-6">
                  <Search
                    size={20}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Search foods..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-100/80 backdrop-blur-sm rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 placeholder-gray-500 border border-gray-200/40"
                  />
                </div>

                {/* Food List */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredFoods.slice(0, 30).map((food) => (
                    <button
                      key={food.id}
                      onClick={() => setSelectedFood(food)}
                      className="w-full text-left p-4 bg-gradient-to-r from-gray-50/60 to-gray-100/60 hover:from-blue-50/80 hover:to-blue-100/80 rounded-2xl transition-all duration-200 border border-gray-200/50 hover:border-blue-300/50 hover:shadow-md group"
                    >
                      <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition">
                        {food.name}
                      </p>
                      <p className="text-xs text-gray-600 mt-1.5 font-medium">
                        <span className="text-orange-600">Cal: {food.per_100g.calories}</span> •{" "}
                        <span className="text-blue-600">P: {food.per_100g.protein}g</span> •{" "}
                        <span className="text-green-600">C: {food.per_100g.carbs}g</span> •{" "}
                        <span className="text-red-600">F: {food.per_100g.fats}g</span>
                      </p>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                {/* Food Details */}
                <div className="mb-6">
                  <h3 className="text-3xl font-bold text-gray-900 mb-1">
                    {selectedFood.name}
                  </h3>
                  <p className="text-sm text-gray-600 font-medium">
                    {selectedFood.category}
                  </p>
                </div>

                {/* Quantity Section */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-900 mb-3">
                    Quantity
                  </label>
                  <div className="flex items-center gap-4 bg-gray-100/80 rounded-2xl p-2">
                    <button
                      onClick={() => setQuantity(Math.max(10, quantity - 10))}
                      className="w-12 h-12 bg-white hover:bg-gray-50 rounded-xl font-bold text-xl text-gray-900 transition shadow-sm"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(Number(e.target.value) || 0)
                      }
                      className="flex-1 bg-transparent text-center text-3xl font-bold text-gray-900 focus:outline-none"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 10)}
                      className="w-12 h-12 bg-white hover:bg-gray-50 rounded-xl font-bold text-xl text-gray-900 transition shadow-sm"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Unit Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-900 mb-3">
                    Unit
                  </label>
                  <div className="flex gap-3">
                    {selectedFood.units_available.map((unit) => (
                      <button
                        key={unit}
                        onClick={() => setSelectedUnit(unit)}
                        className={`px-5 py-2.5 rounded-xl font-bold transition-all duration-200 ${
                          selectedUnit === unit
                            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-105"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        }`}
                      >
                        {unit}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Nutritional Info Card */}
                {macros && (
                  <div className="bg-gradient-to-br from-blue-50/80 to-blue-100/80 rounded-2xl p-4 border border-blue-200/40 backdrop-blur-sm mb-6">
                    <p className="text-sm font-bold text-gray-900 mb-4">
                      Nutritional Info (per serving)
                    </p>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-orange-200/40">
                        <p className="text-xl font-bold text-orange-600">
                          {Math.round(macros.calories)}
                        </p>
                        <p className="text-xs text-gray-600 font-semibold mt-1">
                          Cal
                        </p>
                      </div>
                      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-blue-200/40">
                        <p className="text-xl font-bold text-blue-600">
                          {macros.protein.toFixed(1)}
                        </p>
                        <p className="text-xs text-gray-600 font-semibold mt-1">
                          P
                        </p>
                      </div>
                      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-green-200/40">
                        <p className="text-xl font-bold text-green-600">
                          {macros.carbs.toFixed(1)}
                        </p>
                        <p className="text-xs text-gray-600 font-semibold mt-1">
                          C
                        </p>
                      </div>
                      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-red-200/40">
                        <p className="text-xl font-bold text-red-600">
                          {macros.fats.toFixed(1)}
                        </p>
                        <p className="text-xs text-gray-600 font-semibold mt-1">
                          F
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setSelectedFood(null)}
                    className="flex-1 px-4 py-3.5 bg-gray-100 text-gray-900 rounded-2xl font-bold hover:bg-gray-200 transition-all duration-200 active:scale-95"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleAddFood}
                    disabled={addMealMutation.isPending}
                    className="flex-1 px-4 py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl font-bold hover:shadow-lg transition-all duration-200 disabled:opacity-50 active:scale-95"
                  >
                    {addMealMutation.isPending
                      ? "Adding..."
                      : `Add to ${selectedMealType}`}
                  </button>
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
