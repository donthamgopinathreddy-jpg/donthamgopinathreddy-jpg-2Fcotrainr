import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export interface Workout {
  id: string;
  title: string;
  category: "gym" | "yoga" | "boxing" | "zumba" | "stretching" | "warmups";
  level: "beginner" | "intermediate" | "advanced";
  duration_minutes: number;
  calories_burned: number;
  thumbnail_url?: string;
  video_url?: string;
  description?: string;
  created_at: string;
}

const DEMO_WORKOUTS: Workout[] = [
  // ===== GYM - BEGINNER =====
  {
    id: "gym-beginner-wall-pushups-1",
    title: "Wall Pushups",
    category: "gym",
    level: "beginner",
    duration_minutes: 15,
    calories_burned: 50,
    description: "Beginner-friendly pushups against a wall for chest strength",
    created_at: new Date().toISOString(),
  },
  {
    id: "gym-beginner-incline-pushups-2",
    title: "Incline Pushups",
    category: "gym",
    level: "beginner",
    duration_minutes: 15,
    calories_burned: 60,
    description: "Pushups on an inclined surface for progressive training",
    created_at: new Date().toISOString(),
  },
  {
    id: "gym-beginner-squats-3",
    title: "Bodyweight Squats",
    category: "gym",
    level: "beginner",
    duration_minutes: 20,
    calories_burned: 80,
    description: "Basic squats to strengthen legs and glutes",
    created_at: new Date().toISOString(),
  },
  {
    id: "gym-beginner-crunches-4",
    title: "Crunches",
    category: "gym",
    level: "beginner",
    duration_minutes: 10,
    calories_burned: 40,
    description: "Core strengthening exercise for abdominal muscles",
    created_at: new Date().toISOString(),
  },
  {
    id: "gym-beginner-supermans-1",
    title: "Superman Exercise",
    category: "gym",
    level: "beginner",
    duration_minutes: 12,
    calories_burned: 45,
    description: "Back strengthening exercise targeting posterior chain",
    created_at: new Date().toISOString(),
  },
  {
    id: "gym-beginner-arm-circles-2",
    title: "Arm Circles",
    category: "gym",
    level: "beginner",
    duration_minutes: 8,
    calories_burned: 30,
    description: "Shoulder mobility and warm-up exercise",
    created_at: new Date().toISOString(),
  },

  // ===== GYM - INTERMEDIATE =====
  {
    id: "gym-intermediate-decline-pushups-1",
    title: "Decline Pushups",
    category: "gym",
    level: "intermediate",
    duration_minutes: 15,
    calories_burned: 75,
    description: "Advanced pushup variation with increased difficulty",
    created_at: new Date().toISOString(),
  },
  {
    id: "gym-intermediate-jump-squats-2",
    title: "Jump Squats",
    category: "gym",
    level: "intermediate",
    duration_minutes: 20,
    calories_burned: 120,
    description: "Explosive leg exercise combining cardio and strength",
    created_at: new Date().toISOString(),
  },
  {
    id: "gym-intermediate-pike-pushups-3",
    title: "Pike Pushups",
    category: "gym",
    level: "intermediate",
    duration_minutes: 15,
    calories_burned: 70,
    description: "Shoulder-focused pushup variation",
    created_at: new Date().toISOString(),
  },
  {
    id: "gym-intermediate-bulgarian-split-1",
    title: "Bulgarian Split Squats",
    category: "gym",
    level: "intermediate",
    duration_minutes: 20,
    calories_burned: 100,
    description: "Single-leg focused squat variation",
    created_at: new Date().toISOString(),
  },
  {
    id: "gym-intermediate-planks-variation-1",
    title: "Plank Variations",
    category: "gym",
    level: "intermediate",
    duration_minutes: 12,
    calories_burned: 55,
    description: "Core isometric hold with multiple variations",
    created_at: new Date().toISOString(),
  },

  // ===== GYM - ADVANCED =====
  {
    id: "gym-advanced-clap-pushups-1",
    title: "Clap Pushups",
    category: "gym",
    level: "advanced",
    duration_minutes: 15,
    calories_burned: 90,
    description: "Explosive pushup with clap for advanced strength training",
    created_at: new Date().toISOString(),
  },
  {
    id: "gym-advanced-archer-pushups-2",
    title: "Archer Pushups",
    category: "gym",
    level: "advanced",
    duration_minutes: 15,
    calories_burned: 85,
    description: "Unilateral pushup progression toward one-armed pushups",
    created_at: new Date().toISOString(),
  },
  {
    id: "gym-advanced-pistol-squats-3",
    title: "Pistol Squats",
    category: "gym",
    level: "advanced",
    duration_minutes: 20,
    calories_burned: 110,
    description: "Single-leg squat for extreme leg strength",
    created_at: new Date().toISOString(),
  },
  {
    id: "gym-advanced-inverted-rows-4",
    title: "Inverted Rows",
    category: "gym",
    level: "advanced",
    duration_minutes: 15,
    calories_burned: 80,
    description: "Advanced horizontal pulling exercise",
    created_at: new Date().toISOString(),
  },
  {
    id: "gym-advanced-handstand-pushups-1",
    title: "Handstand Pushup Progressions",
    category: "gym",
    level: "advanced",
    duration_minutes: 20,
    calories_burned: 100,
    description: "Advanced shoulder exercise with handstand variation",
    created_at: new Date().toISOString(),
  },

  // ===== BOXING - BEGINNER =====
  {
    id: "boxing-beginner-jab-1",
    title: "Jab",
    category: "boxing",
    level: "beginner",
    duration_minutes: 15,
    calories_burned: 75,
    description: "Basic straight punch from the lead hand",
    created_at: new Date().toISOString(),
  },
  {
    id: "boxing-beginner-cross-2",
    title: "Cross",
    category: "boxing",
    level: "beginner",
    duration_minutes: 15,
    calories_burned: 80,
    description: "Power punch from the rear hand",
    created_at: new Date().toISOString(),
  },
  {
    id: "boxing-beginner-jab-cross-combo-3",
    title: "Jab-Cross Combo",
    category: "boxing",
    level: "beginner",
    duration_minutes: 15,
    calories_burned: 85,
    description: "Basic two-punch combination",
    created_at: new Date().toISOString(),
  },
  {
    id: "boxing-beginner-footwork-4",
    title: "Basic Footwork",
    category: "boxing",
    level: "beginner",
    duration_minutes: 15,
    calories_burned: 70,
    description: "Fundamental stance and foot movement",
    created_at: new Date().toISOString(),
  },

  // ===== BOXING - INTERMEDIATE =====
  {
    id: "boxing-intermediate-hooks-1",
    title: "Hooks",
    category: "boxing",
    level: "intermediate",
    duration_minutes: 15,
    calories_burned: 85,
    description: "Curved punches targeting sides of opponent",
    created_at: new Date().toISOString(),
  },
  {
    id: "boxing-intermediate-uppercuts-2",
    title: "Uppercuts",
    category: "boxing",
    level: "intermediate",
    duration_minutes: 15,
    calories_burned: 85,
    description: "Upward punches from below",
    created_at: new Date().toISOString(),
  },
  {
    id: "boxing-intermediate-slips-3",
    title: "Slips",
    category: "boxing",
    level: "intermediate",
    duration_minutes: 15,
    calories_burned: 70,
    description: "Head movement defense technique",
    created_at: new Date().toISOString(),
  },
  {
    id: "boxing-intermediate-pivots-4",
    title: "Pivots",
    category: "boxing",
    level: "intermediate",
    duration_minutes: 15,
    calories_burned: 75,
    description: "Rotational footwork for positioning",
    created_at: new Date().toISOString(),
  },
  {
    id: "boxing-intermediate-jab-cross-hook-1",
    title: "Jab-Cross-Hook Combo",
    category: "boxing",
    level: "intermediate",
    duration_minutes: 20,
    calories_burned: 100,
    description: "Three-punch combination",
    created_at: new Date().toISOString(),
  },

  // ===== BOXING - ADVANCED =====
  {
    id: "boxing-advanced-complex-combos-1",
    title: "Complex Combos (1-2-3-2)",
    category: "boxing",
    level: "advanced",
    duration_minutes: 20,
    calories_burned: 120,
    description: "Advanced multi-punch combination sequences",
    created_at: new Date().toISOString(),
  },
  {
    id: "boxing-advanced-roll-slip-counter-2",
    title: "Roll-Slip Counter",
    category: "boxing",
    level: "advanced",
    duration_minutes: 20,
    calories_burned: 110,
    description: "Defense with immediate counter-attack",
    created_at: new Date().toISOString(),
  },
  {
    id: "boxing-advanced-shadowboxing-3",
    title: "Fast Shadowboxing",
    category: "boxing",
    level: "advanced",
    duration_minutes: 20,
    calories_burned: 115,
    description: "High-speed boxing practice without opponent",
    created_at: new Date().toISOString(),
  },
  {
    id: "boxing-advanced-power-combos-4",
    title: "Power Combinations",
    category: "boxing",
    level: "advanced",
    duration_minutes: 20,
    calories_burned: 125,
    description: "Heavy, powerful multi-punch sequences",
    created_at: new Date().toISOString(),
  },

  // ===== ZUMBA - BEGINNER =====
  {
    id: "zumba-beginner-salsa-1",
    title: "Basic Salsa",
    category: "zumba",
    level: "beginner",
    duration_minutes: 20,
    calories_burned: 100,
    description: "Fundamental salsa dance steps",
    created_at: new Date().toISOString(),
  },
  {
    id: "zumba-beginner-merengue-2",
    title: "Merengue",
    category: "zumba",
    level: "beginner",
    duration_minutes: 20,
    calories_burned: 95,
    description: "Basic merengue rhythm and steps",
    created_at: new Date().toISOString(),
  },
  {
    id: "zumba-beginner-grapevine-3",
    title: "Grapevine",
    category: "zumba",
    level: "beginner",
    duration_minutes: 15,
    calories_burned: 85,
    description: "Lateral stepping pattern in dance",
    created_at: new Date().toISOString(),
  },
  {
    id: "zumba-beginner-side-steps-4",
    title: "Side Steps",
    category: "zumba",
    level: "beginner",
    duration_minutes: 15,
    calories_burned: 80,
    description: "Basic side-to-side movement",
    created_at: new Date().toISOString(),
  },

  // ===== ZUMBA - INTERMEDIATE =====
  {
    id: "zumba-intermediate-reggaeton-1",
    title: "Reggaeton Steps",
    category: "zumba",
    level: "intermediate",
    duration_minutes: 20,
    calories_burned: 110,
    description: "Hip-hop influenced reggaeton movements",
    created_at: new Date().toISOString(),
  },
  {
    id: "zumba-intermediate-hip-rolls-2",
    title: "Hip Rolls",
    category: "zumba",
    level: "intermediate",
    duration_minutes: 20,
    calories_burned: 100,
    description: "Rhythmic hip isolation movements",
    created_at: new Date().toISOString(),
  },
  {
    id: "zumba-intermediate-fast-synco-3",
    title: "Faster Syncopated Moves",
    category: "zumba",
    level: "intermediate",
    duration_minutes: 25,
    calories_burned: 125,
    description: "Complex rhythmic movement patterns",
    created_at: new Date().toISOString(),
  },

  // ===== ZUMBA - ADVANCED =====
  {
    id: "zumba-advanced-choreography-1",
    title: "Full Choreography",
    category: "zumba",
    level: "advanced",
    duration_minutes: 30,
    calories_burned: 150,
    description: "Complete choreographed dance routine",
    created_at: new Date().toISOString(),
  },

  // ===== YOGA - BEGINNER =====
  {
    id: "yoga-beginner-childs-1",
    title: "Child's Pose",
    category: "yoga",
    level: "beginner",
    duration_minutes: 10,
    calories_burned: 20,
    description: "Restful yoga pose for relaxation",
    created_at: new Date().toISOString(),
  },
  {
    id: "yoga-beginner-cat-cow-2",
    title: "Cat-Cow",
    category: "yoga",
    level: "beginner",
    duration_minutes: 10,
    calories_burned: 25,
    description: "Spinal mobility and warm-up sequence",
    created_at: new Date().toISOString(),
  },
  {
    id: "yoga-beginner-cobra-3",
    title: "Cobra Pose",
    category: "yoga",
    level: "beginner",
    duration_minutes: 12,
    calories_burned: 30,
    description: "Backbend pose for chest and core",
    created_at: new Date().toISOString(),
  },
  {
    id: "yoga-beginner-downward-dog-4",
    title: "Downward Dog",
    category: "yoga",
    level: "beginner",
    duration_minutes: 12,
    calories_burned: 35,
    description: "Fundamental inversion pose",
    created_at: new Date().toISOString(),
  },

  // ===== YOGA - INTERMEDIATE =====
  {
    id: "yoga-intermediate-warrior-1",
    title: "Warrior II",
    category: "yoga",
    level: "intermediate",
    duration_minutes: 15,
    calories_burned: 45,
    description: "Standing strength pose with arm extension",
    created_at: new Date().toISOString(),
  },
  {
    id: "yoga-intermediate-bridge-2",
    title: "Bridge Pose",
    category: "yoga",
    level: "intermediate",
    duration_minutes: 12,
    calories_burned: 40,
    description: "Glute and core strengthening pose",
    created_at: new Date().toISOString(),
  },
  {
    id: "yoga-intermediate-triangle-3",
    title: "Triangle Pose",
    category: "yoga",
    level: "intermediate",
    duration_minutes: 15,
    calories_burned: 40,
    description: "Side stretch and balance pose",
    created_at: new Date().toISOString(),
  },
  {
    id: "yoga-intermediate-plank-flow-4",
    title: "Plank Flow",
    category: "yoga",
    level: "intermediate",
    duration_minutes: 15,
    calories_burned: 50,
    description: "Dynamic core strengthening flow",
    created_at: new Date().toISOString(),
  },

  // ===== YOGA - ADVANCED =====
  {
    id: "yoga-advanced-crow-1",
    title: "Crow Pose",
    category: "yoga",
    level: "advanced",
    duration_minutes: 15,
    calories_burned: 50,
    description: "Advanced arm balance pose",
    created_at: new Date().toISOString(),
  },
  {
    id: "yoga-advanced-handstand-prep-2",
    title: "Handstand Prep",
    category: "yoga",
    level: "advanced",
    duration_minutes: 20,
    calories_burned: 60,
    description: "Progression toward full handstand",
    created_at: new Date().toISOString(),
  },

  // ===== STRETCHING - BEGINNER =====
  {
    id: "stretching-beginner-neck-1",
    title: "Neck Stretch",
    category: "stretching",
    level: "beginner",
    duration_minutes: 5,
    calories_burned: 10,
    description: "Gentle neck mobility exercise",
    created_at: new Date().toISOString(),
  },
  {
    id: "stretching-beginner-quad-2",
    title: "Quad Stretch",
    category: "stretching",
    level: "beginner",
    duration_minutes: 8,
    calories_burned: 15,
    description: "Front thigh flexibility exercise",
    created_at: new Date().toISOString(),
  },
  {
    id: "stretching-beginner-hamstring-3",
    title: "Hamstring Reach",
    category: "stretching",
    level: "beginner",
    duration_minutes: 8,
    calories_burned: 15,
    description: "Back thigh flexibility exercise",
    created_at: new Date().toISOString(),
  },

  // ===== STRETCHING - INTERMEDIATE =====
  {
    id: "stretching-intermediate-deep-lunge-1",
    title: "Deep Lunge Stretch",
    category: "stretching",
    level: "intermediate",
    duration_minutes: 12,
    calories_burned: 25,
    description: "Advanced leg and hip flexor stretch",
    created_at: new Date().toISOString(),
  },
  {
    id: "stretching-intermediate-thoracic-2",
    title: "Thoracic Rotation",
    category: "stretching",
    level: "intermediate",
    duration_minutes: 10,
    calories_burned: 20,
    description: "Upper back mobility and rotation",
    created_at: new Date().toISOString(),
  },

  // ===== STRETCHING - ADVANCED =====
  {
    id: "stretching-advanced-splits-1",
    title: "Splits",
    category: "stretching",
    level: "advanced",
    duration_minutes: 15,
    calories_burned: 35,
    description: "Advanced full-body flexibility",
    created_at: new Date().toISOString(),
  },
  {
    id: "stretching-advanced-backbend-2",
    title: "Deep Backbend",
    category: "stretching",
    level: "advanced",
    duration_minutes: 15,
    calories_burned: 40,
    description: "Advanced back and shoulder flexibility",
    created_at: new Date().toISOString(),
  },

  // ===== WARMUPS - BEGINNER =====
  {
    id: "warmups-beginner-arm-swings-1",
    title: "Arm Swings",
    category: "warmups",
    level: "beginner",
    duration_minutes: 5,
    calories_burned: 15,
    description: "Shoulder mobility warm-up",
    created_at: new Date().toISOString(),
  },
  {
    id: "warmups-beginner-marching-2",
    title: "Marching",
    category: "warmups",
    level: "beginner",
    duration_minutes: 5,
    calories_burned: 20,
    description: "Low-impact cardio warm-up",
    created_at: new Date().toISOString(),
  },

  // ===== WARMUPS - INTERMEDIATE =====
  {
    id: "warmups-intermediate-high-knees-1",
    title: "High Knees",
    category: "warmups",
    level: "intermediate",
    duration_minutes: 8,
    calories_burned: 40,
    description: "Cardio warm-up with leg elevation",
    created_at: new Date().toISOString(),
  },
  {
    id: "warmups-intermediate-jumping-jacks-2",
    title: "Jumping Jacks",
    category: "warmups",
    level: "intermediate",
    duration_minutes: 8,
    calories_burned: 45,
    description: "Classic full-body warm-up",
    created_at: new Date().toISOString(),
  },

  // ===== WARMUPS - ADVANCED =====
  {
    id: "warmups-advanced-skater-hops-1",
    title: "Skater Hops",
    category: "warmups",
    level: "advanced",
    duration_minutes: 10,
    calories_burned: 65,
    description: "High-intensity lateral jumping warm-up",
    created_at: new Date().toISOString(),
  },
  {
    id: "warmups-advanced-burpees-2",
    title: "Burpee Warm-up",
    category: "warmups",
    level: "advanced",
    duration_minutes: 10,
    calories_burned: 75,
    description: "Full-body explosive warm-up",
    created_at: new Date().toISOString(),
  },
];

export const useWorkouts = () => {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);

      // Use demo data
      if (!user?.id) {
        setWorkouts(DEMO_WORKOUTS);
        setError(null);
        return;
      }

      // Try to fetch from Supabase
      const { data, error: fetchError } = await supabase
        .from("workouts")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) {
        console.debug("Workouts fetch error:", fetchError?.code);
        // Fallback to demo data
        setWorkouts(DEMO_WORKOUTS);
        setError(null);
        return;
      }

      setWorkouts((data as Workout[]) || DEMO_WORKOUTS);
      setError(null);
    } catch (err) {
      console.debug(
        "Workouts catch error:",
        err instanceof Error ? err.message : "unknown",
      );
      setWorkouts(DEMO_WORKOUTS);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, [user?.id]);

  const getWorkoutsByLevel = (level: "basic" | "intermediate" | "advanced") => {
    return workouts.filter((w) => w.level === level);
  };

  const getWorkoutsByCategory = (
    category: "gym" | "yoga" | "boxing" | "zumba" | "stretching" | "warmups",
  ) => {
    return workouts.filter((w) => w.category === category);
  };

  const getWorkoutsByCategoryAndLevel = (
    category: "gym" | "yoga" | "boxing" | "zumba" | "stretching" | "warmups",
    level: "basic" | "intermediate" | "advanced",
  ) => {
    return workouts.filter((w) => w.category === category && w.level === level);
  };

  return {
    workouts,
    loading,
    error,
    fetchWorkouts,
    getWorkoutsByLevel,
    getWorkoutsByCategory,
    getWorkoutsByCategoryAndLevel,
  };
};
