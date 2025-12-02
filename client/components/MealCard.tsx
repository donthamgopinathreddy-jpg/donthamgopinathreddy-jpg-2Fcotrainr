import React from "react";
import { Flame, Zap, Leaf } from "lucide-react";
import VibrancyCard from "./VibrancyCard";

interface MealCardProps {
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  weight: number;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  time?: string;
  onDelete?: () => void;
  onEdit?: () => void;
}

const MEAL_TYPE_COLORS: Record<
  string,
  "orange" | "purple" | "blue" | "green" | "pink"
> = {
  breakfast: "orange",
  lunch: "green",
  dinner: "purple",
  snack: "pink",
};

const MEAL_TYPE_ICONS: Record<string, string> = {
  breakfast: "🍳",
  lunch: "🍽️",
  dinner: "🍴",
  snack: "🍎",
};

export default function MealCard({
  foodName,
  calories,
  protein,
  carbs,
  fat,
  weight,
  mealType,
  time,
  onDelete,
  onEdit,
}: MealCardProps) {
  const gradient = MEAL_TYPE_COLORS[mealType];
  const icon = MEAL_TYPE_ICONS[mealType];

  return (
    <VibrancyCard
      gradient={gradient}
      shadow="medium"
      animate={true}
      className="relative overflow-hidden cursor-pointer hover:shadow-xl"
      onClick={onEdit}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left content */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{icon}</span>
            <div>
              <h3 className="font-bold text-lg">{foodName}</h3>
              {time && <p className="text-xs opacity-75">{time}</p>}
            </div>
          </div>

          <p className="text-sm opacity-90 mb-3">
            {weight}g • {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
          </p>

          {/* Macros */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-white/20 rounded-lg p-2 text-center">
              <Flame size={14} className="mx-auto mb-1" />
              <p className="font-bold">{calories}</p>
              <p className="opacity-75">Cal</p>
            </div>
            <div className="bg-white/20 rounded-lg p-2 text-center">
              <Protein size={14} className="mx-auto mb-1" />
              <p className="font-bold">{protein}g</p>
              <p className="opacity-75">Protein</p>
            </div>
            <div className="bg-white/20 rounded-lg p-2 text-center">
              <Leaf size={14} className="mx-auto mb-1" />
              <p className="font-bold">{carbs}g</p>
              <p className="opacity-75">Carbs</p>
            </div>
          </div>
        </div>

        {/* Delete button */}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-white/60 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-all"
          >
            ✕
          </button>
        )}
      </div>
    </VibrancyCard>
  );
}
