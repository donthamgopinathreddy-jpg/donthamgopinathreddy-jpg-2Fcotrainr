import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export interface Booking {
  id: string;
  client_id: string;
  trainer_id: string;
  session_date: string;
  duration_minutes: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  notes?: string;
  created_at: string;
  updated_at: string;
  trainer_name?: string;
  client_name?: string;
}

export const useBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch bookings for current user (as client or trainer)
  const fetchBookings = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .or(`client_id.eq.${user.id},trainer_id.eq.${user.id}`)
        .order("session_date", { ascending: true });

      if (error) throw error;

      // Enrich with user names
      if (data) {
        const bookingsWithNames = await Promise.all(
          data.map(async (booking) => {
            const userIds = [booking.client_id, booking.trainer_id];
            const { data: users } = await supabase
              .from("users")
              .select("id, full_name")
              .in("id", userIds);

            const userMap = new Map(
              (users || []).map((u) => [u.id, u.full_name])
            );

            return {
              ...booking,
              client_name: userMap.get(booking.client_id),
              trainer_name: userMap.get(booking.trainer_id),
            };
          })
        );

        setBookings(bookingsWithNames);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  // Create a new booking
  const createBooking = async (
    trainerId: string,
    sessionDate: string,
    durationMinutes: number = 60,
    notes?: string
  ) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("bookings")
        .insert({
          client_id: user.id,
          trainer_id: trainerId,
          session_date: sessionDate,
          duration_minutes: durationMinutes,
          notes,
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;
      setBookings((prev) => [...prev, data]);
      return data;
    } catch (error) {
      console.error("Error creating booking:", error);
      throw error;
    }
  };

  // Update booking status
  const updateBookingStatus = async (
    bookingId: string,
    status: "pending" | "confirmed" | "completed" | "cancelled"
  ) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("bookings")
        .update({ status })
        .eq("id", bookingId)
        .select()
        .single();

      if (error) throw error;
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? data : b))
      );
      return data;
    } catch (error) {
      console.error("Error updating booking:", error);
      throw error;
    }
  };

  // Cancel a booking
  const cancelBooking = async (bookingId: string) => {
    return updateBookingStatus(bookingId, "cancelled");
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  return {
    bookings,
    loading,
    fetchBookings,
    createBooking,
    updateBookingStatus,
    cancelBooking,
  };
};
