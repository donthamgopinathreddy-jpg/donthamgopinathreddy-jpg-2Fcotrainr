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

  // Fetch all trainers
  const fetchTrainers = async (specialty?: string) => {
    setLoading(true);
    try {
      let query = supabase
        .from("users")
        .select("*")
        .eq("role", "trainer");

      if (specialty) {
        query = query.contains("specialties", [specialty]);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Enrich with trainer details
      if (data) {
        const trainerIds = data.map((u) => u.id);
        const { data: trainerDetails, error: trainerError } = await supabase
          .from("trainers")
          .select("*")
          .in("id", trainerIds);

        if (trainerError) throw trainerError;

        const trainersMap = new Map(
          (trainerDetails || []).map((t) => [t.id, t])
        );

        const enriched = data.map((user) => ({
          ...user,
          ...(trainersMap.get(user.id) || {}),
        })) as Trainer[];

        setTrainers(enriched);
      }
    } catch (error) {
      console.error("Error fetching trainers:", error);
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
      return null;
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
