import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface Trainer {
  id: string;
  username: string;
  full_name: string;
  email: string;
  bio?: string;
  profile_picture_url?: string;
  years_of_experience?: number;
  specialties: string[];
  certifications: string[];
  gallery_urls: string[];
  verified: boolean;
  rating: number;
  reviews_count: number;
  hourly_rate?: number;
}

export const useTrainers = () => {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock demo trainers
  const DEMO_TRAINERS: Trainer[] = [
    {
      id: "trainer-1",
      username: "alex_trainer",
      full_name: "Alex Kumar",
      email: "alex@example.com",
      bio: "Certified fitness trainer with 5+ years experience",
      profile_picture_url:
        "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
      years_of_experience: 5,
      specialties: ["Gym", "CrossFit"],
      certifications: ["ACE", "NASM"],
      gallery_urls: [],
      verified: true,
      rating: 4.8,
      reviews_count: 45,
      hourly_rate: 500,
    },
    {
      id: "trainer-2",
      username: "priya_yoga",
      full_name: "Priya Singh",
      email: "priya@example.com",
      bio: "Yoga instructor and wellness coach",
      profile_picture_url:
        "https://api.dicebear.com/7.x/avataaars/svg?seed=priya",
      years_of_experience: 8,
      specialties: ["Yoga", "Meditation"],
      certifications: ["RYT-200"],
      gallery_urls: [],
      verified: true,
      rating: 4.9,
      reviews_count: 62,
      hourly_rate: 400,
    },
    {
      id: "trainer-3",
      username: "raj_boxing",
      full_name: "Raj Patel",
      email: "raj@example.com",
      bio: "Professional boxing coach",
      profile_picture_url:
        "https://api.dicebear.com/7.x/avataaars/svg?seed=raj",
      years_of_experience: 6,
      specialties: ["Boxing", "Cardio"],
      certifications: ["Pro Boxing Coach"],
      gallery_urls: [],
      verified: true,
      rating: 4.7,
      reviews_count: 38,
      hourly_rate: 600,
    },
  ];

  // Fetch all trainers
  const fetchTrainers = async (specialty?: string) => {
    setLoading(true);
    try {
      let query = supabase.from("users").select("*").eq("role", "trainer");

      if (specialty) {
        query = query.contains("specialties", [specialty]);
      }

      const { data, error } = await query;

      if (error) {
        // Fall back to demo trainers
        let demoTrainers = DEMO_TRAINERS;
        if (specialty) {
          demoTrainers = demoTrainers.filter((t) =>
            t.specialties.includes(specialty),
          );
        }
        setTrainers(demoTrainers);
        return;
      }

      // Enrich with trainer details
      if (Array.isArray(data)) {
        const trainerIds = data.map((u) => u.id);
        const { data: trainerDetails, error: trainerError } = await supabase
          .from("trainers")
          .select("*")
          .in("id", trainerIds);

        if (trainerError) throw trainerError;

        const trainersMap = new Map(
          (Array.isArray(trainerDetails) ? trainerDetails : []).map((t) => [
            t.id,
            t,
          ]),
        );

        const enriched = data.map((user) => ({
          ...user,
          ...(trainersMap.get(user.id) || {}),
        })) as Trainer[];

        setTrainers(enriched);
      } else {
        setTrainers([]);
      }
    } catch (error) {
      console.error("Error fetching trainers:", error);
      // Fall back to demo trainers
      let demoTrainers = DEMO_TRAINERS;
      if (specialty) {
        demoTrainers = demoTrainers.filter((t) =>
          t.specialties.includes(specialty),
        );
      }
      setTrainers(demoTrainers);
    } finally {
      setLoading(false);
    }
  };

  // Fetch single trainer
  const fetchTrainer = async (trainerId: string) => {
    setLoading(true);
    try {
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", trainerId)
        .single();

      if (userError) throw userError;

      const { data: trainerData, error: trainerError } = await supabase
        .from("trainers")
        .select("*")
        .eq("id", trainerId)
        .single();

      if (trainerError) throw trainerError;

      return { ...user, ...trainerData } as Trainer;
    } catch (error) {
      console.error("Error fetching trainer:", error);
      // Return demo trainer if available
      return DEMO_TRAINERS.find((t) => t.id === trainerId) || null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainers();
  }, []);

  return {
    trainers,
    loading,
    fetchTrainers,
    fetchTrainer,
  };
};
