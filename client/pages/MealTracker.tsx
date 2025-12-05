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
  Edit2,
  Settings,
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

// Horizontal macro bar component
const MacroBar = ({
  current,
  target,
  label,
  gradient,
  size = "normal",
}: {
  current: number;
  target: number;
  label: string;
  gradient: string;
  size?: "large" | "normal";
}) => {
  const percentage = Math.min((current / target) * 100, 100);
  const isLarge = size === "large";

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <p
          className={`${isLarge ? "text-sm" : "text-xs"} font-bold text-muted-foreground`}
        >
          {label}
        </p>
        <p
          className={`${isLarge ? "text-lg" : "text-sm"} font-bold text-foreground`}
        >
          {Math.round(current)}/{target}
        </p>
      </div>
      <div
        className={`w-full bg-muted rounded-full overflow-hidden border border-border/50 ${
          isLarge ? "h-4" : "h-2"
        }`}
      >
        <div
          className={`h-full rounded-full transition-all duration-300 bg-gradient-to-r ${gradient}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
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
  const [selectedMealType, setSelectedMealType] = useState<string>(
    "breakfast"
  );
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
  const [customMeals, setCustomMeals] = useState<Record<string, string>>({});
  const [showNamingModal, setShowNamingModal] = useState(false);
  const [mealNameInput, setMealNameInput] = useState("");
  const [editingMealType, setEditingMealType] = useState<string | null>(null);
  const [showMacroTargetsModal, setShowMacroTargetsModal] = useState(false);
  const [macroTargets, setMacroTargets] = useState({
    protein: 150,
    calories: 2500,
    carbs: 300,
    fats: 75,
  });
  const [editMacroTargets, setEditMacroTargets] = useState({
    protein: 150,
    calories: 2500,
    carbs: 300,
    fats: 75,
  });
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

  // Load macro targets from localStorage
  useEffect(() => {
    if (user?.id) {
      const savedTargets = localStorage.getItem(`macro_targets_${user.id}`);
      if (savedTargets) {
        try {
          const parsed = JSON.parse(savedTargets);
          setMacroTargets(parsed);
          setEditMacroTargets(parsed);
        } catch (err) {
          console.error("Failed to parse saved targets:", err);
        }
      }
    }
  }, [user?.id]);

  // Load photos for all meal types
  useEffect(() => {
    if (!user?.id) return;

    const loadAllPhotos = async () => {
      const allMealTypes = [...mealOrder, ...Object.keys(customMeals)];
      const photos: Record<string, any[]> = {};

      for (const mealType of allMealTypes) {
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
  }, [currentDate, user?.id, mealOrder, customMeals]);

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

  function handleCreateCustomMeal() {
    if (!mealNameInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter a meal name",
        variant: "destructive",
      });
      return;
    }

    if (editingMealType) {
      // Update existing custom meal name
      setCustomMeals((prev) => ({
        ...prev,
        [editingMealType]: mealNameInput,
      }));
      setSelectedMealType(editingMealType);
    } else {
      // Create new custom meal
      const mealId = `custom_${Date.now()}`;
      setCustomMeals((prev) => ({
        ...prev,
        [mealId]: mealNameInput,
      }));
      setSelectedMealType(mealId);
    }

    setShowNamingModal(false);
    setMealNameInput("");
    setEditingMealType(null);
    setShowAddFood(true);
  }

  function handleSaveMacroTargets() {
    if (user?.id) {
      localStorage.setItem(
        `macro_targets_${user.id}`,
        JSON.stringify(editMacroTargets)
      );
    }
    setMacroTargets(editMacroTargets);
    setShowMacroTargetsModal(false);
    toast({
      title: "Success",
      description: "Macro targets updated!",
    });
  }

  const filteredFoods = foods.filter((food) =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const macros = selectedFood
    ? calculateMacros(selectedFood, quantity, selectedUnit)
    : null;

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

  const getMealDisplayName = (mealType: string) => {
    if (customMeals[mealType]) {
      return customMeals[mealType];
    }
    return mealType.charAt(0).toUpperCase() + mealType.slice(1);
  };

  const getMealColor = (mealType: string) => {
    if (mealColors[mealType]) {
      return mealColors[mealType];
    }
    return "from-gray-100 to-slate-100";
  };

  const getMealIcon = (mealType: string) => {
    if (mealIcons[mealType]) {
      return mealIcons[mealType];
    }
    return "🍴";
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

  const allMealTypes = [...mealOrder, ...Object.keys(customMeals)];

  return (
    <div className="w-full h-full bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-md border-b border-border/40 px-4 py-3 sm:py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <button
          onClick={() =>
            setCurrentDate(
              new Date(new Date(currentDate).getTime() - 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
            )
          }
          className="p-2 hover:bg-muted rounded-lg transition text-foreground"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1 text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            {formatDate(currentDate)}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Swipe to browse meals</p>
        </div>
        <button
          onClick={() =>
            setCurrentDate(
              new Date(new Date(currentDate).getTime() + 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
            )
          }
          className="p-2 hover:bg-muted rounded-lg transition text-foreground"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Macro Summary Bar with Horizontal Bars */}
      {dailyMeals && (
        <div className="bg-card/60 backdrop-blur-md border-b border-border/40 p-4 sm:p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h3 className="text-sm font-bold text-muted-foreground">Daily Goals</h3>
            <button
              onClick={() => {
                setEditMacroTargets(macroTargets);
                setShowMacroTargetsModal(true);
              }}
              className="p-2 hover:bg-muted rounded-lg transition text-muted-foreground"
              title="Edit macro targets"
            >
              <Settings size={18} />
            </button>
          </div>

          {/* Large Protein Bar */}
          <div className="mb-5">
            <MacroBar
              current={dailyMeals.totals.protein}
              target={macroTargets.protein}
              label="Protein"
              gradient="from-blue-400 to-blue-600"
              size="large"
            />
          </div>

          {/* 3 Smaller Bars Below */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <MacroBar
              current={dailyMeals.totals.calories}
              target={macroTargets.calories}
              label="Cal"
              gradient="from-orange-400 to-orange-600"
              size="normal"
            />
            <MacroBar
              current={dailyMeals.totals.carbs}
              target={macroTargets.carbs}
              label="Carbs"
              gradient="from-green-400 to-green-600"
              size="normal"
            />
            <MacroBar
              current={dailyMeals.totals.fats}
              target={macroTargets.fats}
              label="Fats"
              gradient="from-red-400 to-red-600"
              size="normal"
            />
          </div>
        </div>
      )}

      {/* Horizontal Swiper */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 sm:px-6 pt-3 sm:pt-4">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">Meals</h2>
          <div className="flex gap-2">
            <button
              onClick={() => scroll("left")}
              className="p-2 hover:bg-muted rounded-full transition text-foreground"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-2 hover:bg-muted rounded-full transition text-foreground"
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
          {allMealTypes.map((mealType) => {
            const mealItems = dailyMeals?.[mealType as keyof typeof dailyMeals] as any[];
            const mealCalories = mealItems
              ? mealItems.reduce((s, m) => s + (m.calories || 0), 0)
              : 0;
            const mealProtein = mealItems
              ? mealItems.reduce((s, m) => s + (m.protein || 0), 0)
              : 0;
            const mealCarbs = mealItems
              ? mealItems.reduce((s, m) => s + (m.carbs || 0), 0)
              : 0;
            const mealFats = mealItems
              ? mealItems.reduce((s, m) => s + (m.fats || 0), 0)
              : 0;
            const photos = mealPhotos[mealType] || [];

            return (
              <div
                key={mealType}
                className="flex-shrink-0 w-80 snap-center cursor-move group"
                draggable={!mealType.startsWith("custom")}
                onDragStart={(e) => {
                  if (!mealType.startsWith("custom")) {
                    setDraggedMeal(mealType);
                    e.dataTransfer.effectAllowed = "move";
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggedMeal && draggedMeal !== mealType && !mealType.startsWith("custom")) {
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
                  className={`bg-card/80 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6 h-full shadow-lg hover:shadow-xl transition-all duration-300 border border-border/40 flex flex-col ${
                    draggedMeal === mealType ? "opacity-50 scale-95" : ""
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-3xl sm:text-4xl flex-shrink-0">{getMealIcon(mealType)}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg sm:text-2xl font-bold text-foreground truncate">
                              {getMealDisplayName(mealType)}
                            </h3>
                            {mealType.startsWith("custom") && (
                              <button
                                onClick={() => {
                                  setEditingMealType(mealType);
                                  setMealNameInput(customMeals[mealType]);
                                  setShowNamingModal(true);
                                }}
                                className="p-1 hover:bg-muted rounded-lg transition text-muted-foreground flex-shrink-0"
                                title="Edit meal name"
                              >
                                <Edit2 size={16} />
                              </button>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground font-semibold">
                            {Math.round(mealCalories)} cal
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedMealType(mealType);
                        setShowAddFood(true);
                      }}
                      className="p-2.5 sm:p-3 bg-primary/10 hover:bg-primary/20 backdrop-blur-sm rounded-full transition text-primary border border-primary/30 flex-shrink-0 ml-2"
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
                              className="w-full h-20 object-cover rounded-lg border border-border/40"
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
                        className="flex-1 p-2 sm:p-2.5 bg-secondary/20 hover:bg-secondary/30 backdrop-blur-sm rounded-lg transition text-secondary border border-secondary/30 font-semibold disabled:opacity-50 active:scale-95"
                        title="Camera"
                      >
                        <Camera size={20} className="mx-auto" />
                      </button>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex-1 p-2 sm:p-2.5 bg-accent/20 hover:bg-accent/30 backdrop-blur-sm rounded-lg transition text-accent border border-accent/30 font-semibold disabled:opacity-50 active:scale-95"
                        title="Photo Gallery"
                      >
                        <Paperclip size={20} className="mx-auto" />
                      </button>
                    </div>
                  </div>

                  {/* Macro Stats - Horizontal Bars */}
                  <div className="bg-muted/40 backdrop-blur-sm rounded-2xl p-3 border border-border/40 mb-4 space-y-2.5">
                    <MacroBar
                      current={mealProtein}
                      target={150}
                      label="P"
                      gradient="from-blue-400 to-blue-600"
                    />
                    <MacroBar
                      current={mealCalories}
                      target={2500}
                      label="Cal"
                      gradient="from-orange-400 to-orange-600"
                    />
                    <MacroBar
                      current={mealCarbs}
                      target={300}
                      label="C"
                      gradient="from-green-400 to-green-600"
                    />
                    <MacroBar
                      current={mealFats}
                      target={75}
                      label="F"
                      gradient="from-red-400 to-red-600"
                    />
                  </div>

                  {/* Food Items */}
                  <div className="flex-1 overflow-y-auto mb-4 space-y-2 scrollbar-hide">
                    {mealItems && mealItems.length > 0 ? (
                      mealItems.map((meal: any) => (
                        <div
                          key={meal.id}
                          className="bg-muted/50 backdrop-blur-sm rounded-lg p-3 flex items-center justify-between group hover:bg-muted transition border border-border/40"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                              {meal.food_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {meal.quantity}
                              {meal.unit} • {meal.calories}cal
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              deleteMealMutation.mutateAsync(meal.id!)
                            }
                            className="p-1.5 hover:bg-destructive/20 rounded-lg transition text-destructive ml-2 flex-shrink-0"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <p className="text-foreground font-semibold">
                          No items yet
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Tap + to add food
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Add Button */}
                  <button
                    onClick={() => {
                      setSelectedMealType(mealType);
                      setShowAddFood(true);
                    }}
                    className="w-full py-3 bg-primary/80 hover:bg-primary text-primary-foreground font-bold rounded-2xl transition shadow-md border border-primary/40 active:scale-95"
                  >
                    + Add Food
                  </button>
                </div>
              </div>
            );
          })}

          {/* Extra Meal Tile - Draggable */}
          <div className="flex-shrink-0 w-80 snap-center">
            <button
              onClick={() => {
                setShowNamingModal(true);
                setEditingMealType(null);
                setMealNameInput("");
              }}
              className="w-full h-full bg-card/60 backdrop-blur-lg rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-dashed border-border hover:border-primary flex flex-col items-center justify-center hover:bg-card/80"
            >
              <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">
                ➕
              </div>
              <h3 className="text-xl font-bold text-foreground text-center mb-1">
                Add Meal
              </h3>
              <p className="text-xs text-muted-foreground text-center">
                Create custom meal
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* Meal Naming Modal */}
      {showNamingModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-card rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-border/40">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              {editingMealType ? "Edit Meal Name" : "Create New Meal"}
            </h2>
            <input
              type="text"
              value={mealNameInput}
              onChange={(e) => setMealNameInput(e.target.value)}
              placeholder="e.g., Snack 2, Pre-workout, Evening meal"
              className="input-modern mb-6"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCreateCustomMeal();
                }
              }}
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowNamingModal(false);
                  setMealNameInput("");
                  setEditingMealType(null);
                }}
                className="flex-1 px-4 py-3 bg-muted text-foreground rounded-xl font-bold hover:bg-muted/80 transition active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCustomMeal}
                className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:shadow-lg transition active:scale-95"
              >
                {editingMealType ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Food Modal - Samsung/Apple Style */}
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
                      : `Add to ${getMealDisplayName(selectedMealType)}`}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Macro Targets Edit Modal */}
      {showMacroTargetsModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-6 shadow-2xl border border-gray-200/40">
            <h2 className="text-2xl font-bold text-gray-900">
              Daily Macro Goals
            </h2>

            <div className="space-y-4">
              {/* Protein */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Protein Target (g)
                </label>
                <input
                  type="number"
                  value={editMacroTargets.protein}
                  onChange={(e) =>
                    setEditMacroTargets({
                      ...editMacroTargets,
                      protein: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-gray-100 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="e.g., 150"
                />
              </div>

              {/* Calories */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Calories Target (kcal)
                </label>
                <input
                  type="number"
                  value={editMacroTargets.calories}
                  onChange={(e) =>
                    setEditMacroTargets({
                      ...editMacroTargets,
                      calories: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-gray-100 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="e.g., 2500"
                />
              </div>

              {/* Carbs */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Carbs Target (g)
                </label>
                <input
                  type="number"
                  value={editMacroTargets.carbs}
                  onChange={(e) =>
                    setEditMacroTargets({
                      ...editMacroTargets,
                      carbs: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-gray-100 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="e.g., 300"
                />
              </div>

              {/* Fats */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Fats Target (g)
                </label>
                <input
                  type="number"
                  value={editMacroTargets.fats}
                  onChange={(e) =>
                    setEditMacroTargets({
                      ...editMacroTargets,
                      fats: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-gray-100 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-400"
                  placeholder="e.g., 75"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowMacroTargetsModal(false)}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-900 rounded-xl font-bold hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMacroTargets}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-bold hover:shadow-lg transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealTracker;
