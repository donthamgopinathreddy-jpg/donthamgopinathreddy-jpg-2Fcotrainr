import { useState } from "react";
import { supabase } from "@/lib/supabase";

export const useMealPhotos = () => {
  const [uploading, setUploading] = useState(false);

  const uploadPhoto = async (
    file: File,
    userId: string,
    date: string,
    mealType: string
  ) => {
    if (!file) return null;

    setUploading(true);
    try {
      // Upload to storage
      const fileName = `${userId}/${date}/${mealType}/${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("meal-photos")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from("meal-photos")
        .getPublicUrl(fileName);

      // Save to database
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { data: photoData, error: dbError } = await supabase
        .from("meal_photos")
        .insert([
          {
            user_id: userId,
            date,
            meal_type: mealType,
            photo_url: data.publicUrl,
            expires_at: expiresAt.toISOString(),
          },
        ])
        .select()
        .single();

      if (dbError) throw dbError;

      return photoData;
    } catch (error) {
      console.error("Error uploading photo:", error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const fetchPhotos = async (
    userId: string,
    date: string,
    mealType: string
  ) => {
    try {
      const { data, error } = await supabase
        .from("meal_photos")
        .select("*")
        .eq("user_id", userId)
        .eq("date", date)
        .eq("meal_type", mealType)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching photos:", error);
      return [];
    }
  };

  const deletePhoto = async (photoId: string) => {
    try {
      const { error } = await supabase
        .from("meal_photos")
        .delete()
        .eq("id", photoId);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting photo:", error);
      throw error;
    }
  };

  return {
    uploadPhoto,
    fetchPhotos,
    deletePhoto,
    uploading,
  };
};
