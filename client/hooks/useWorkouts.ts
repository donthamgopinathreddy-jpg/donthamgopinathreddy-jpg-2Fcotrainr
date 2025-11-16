import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export interface Workout {
  id: string;
  title: string;
  category: "gym" | "yoga" | "boxing" | "zumba" | "stretching" | "warmups";
  level: "basic" | "intermediate" | "advanced";
  duration_minutes: number;
  calories_burned: number;
  thumbnail_url?: string;
  video_url?: string;
  description?: string;
  created_at: string;
}

const DEMO_WORKOUTS: Workout[] = [
  {
    id: "workout-1",
    title: "Beginner Push-ups",
    category: "gym",
    level: "basic",
    duration_minutes: 10,
    calories_burned: 50,
    thumbnail_url:
      "https://images.unsplash.com/photo-1584680694062-28dc7ccd49ff?w=400&h=300&fit=crop",
    description: "Learn proper form for push-ups",
    created_at: new Date().toISOString(),
  },
  {
    id: "workout-2",
    title: "Intermediate Circuit Training",
    category: "gym",
    level: "intermediate",
    duration_minutes: 30,
    calories_burned: 250,
    thumbnail_url:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop",
    description: "Full body circuit training",
    created_at: new Date().toISOString(),
  },
  {
    id: "workout-3",
    title: "Advanced HIIT",
    category: "gym",
    level: "advanced",
    duration_minutes: 20,
    calories_burned: 300,
    thumbnail_url:
      "https://images.unsplash.com/photo-1517836357463-d25ddfcbf042?w=400&h=300&fit=crop",
    description: "High intensity interval training",
    created_at: new Date().toISOString(),
  },
  {
    id: "workout-4",
    title: "Beginner Yoga",
    category: "yoga",
    level: "basic",
    duration_minutes: 15,
    calories_burned: 80,
    thumbnail_url:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop",
    description: "Foundational yoga poses",
    created_at: new Date().toISOString(),
  },
  {
    id: "workout-5",
    title: "Vinyasa Flow",
    category: "yoga",
    level: "intermediate",
    duration_minutes: 45,
    calories_burned: 150,
    thumbnail_url:
      "https://images.unsplash.com/photo-1533614533348-7d790cab9e64?w=400&h=300&fit=crop",
    description: "Dynamic yoga flow",
    created_at: new Date().toISOString(),
  },
  {
    id: "workout-6",
    title: "Boxing Basics",
    category: "boxing",
    level: "basic",
    duration_minutes: 20,
    calories_burned: 120,
    thumbnail_url:
      "https://images.unsplash.com/photo-1597622730474-62f3d365f5f5?w=400&h=300&fit=crop",
    description: "Learn boxing stance and jabs",
    created_at: new Date().toISOString(),
  },
  {
    id: "workout-7",
    title: "Zumba Party",
    category: "zumba",
    level: "basic",
    duration_minutes: 30,
    calories_burned: 200,
    thumbnail_url:
      "https://images.unsplash.com/photo-1532394235816-5deb5b6cbe10?w=400&h=300&fit=crop",
    description: "Dance your way to fitness",
    created_at: new Date().toISOString(),
  },
  {
    id: "workout-8",
    title: "Full Body Stretch",
    category: "stretching",
    level: "basic",
    duration_minutes: 15,
    calories_burned: 30,
    thumbnail_url:
      "https://images.unsplash.com/photo-1608889335941-33ac2c274a28?w=400&h=300&fit=crop",
    description: "Recovery stretching routine",
    created_at: new Date().toISOString(),
  },
  {
    id: "workout-9",
    title: "Warm-up Cardio",
    category: "warmups",
    level: "basic",
    duration_minutes: 5,
    calories_burned: 40,
    thumbnail_url:
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=300&fit=crop",
    description: "Quick cardio warm-up",
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
        err instanceof Error ? err.message : "unknown"
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
    category: "gym" | "yoga" | "boxing" | "zumba" | "stretching" | "warmups"
  ) => {
    return workouts.filter((w) => w.category === category);
  };

  const getWorkoutsByCategoryAndLevel = (
    category: "gym" | "yoga" | "boxing" | "zumba" | "stretching" | "warmups",
    level: "basic" | "intermediate" | "advanced"
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
