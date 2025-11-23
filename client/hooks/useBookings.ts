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

  // Check if user is in demo mode
  const isDemoMode = () => {
    return user?.id?.startsWith("demo-user") || user?.id?.includes("demo");
  };

  // Fetch bookings for current user (as client or trainer)
  const fetchBookings = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const isDemo = isDemoMode();

      if (isDemo) {
        // Load from localStorage in demo mode
        const demoBookings = localStorage.getItem(`bookings_demo_${user.id}`);
        setBookings(demoBookings ? JSON.parse(demoBookings) : []);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .or(`client_id.eq.${user.id},trainer_id.eq.${user.id}`)
        .order("session_date", { ascending: true });

      if (error) throw error;

      // Enrich with user names
      if (Array.isArray(data)) {
        const bookingsWithNames = await Promise.all(
          data.map(async (booking) => {
            const userIds = [booking.client_id, booking.trainer_id];
            const { data: users } = await supabase
              .from("users")
              .select("id, full_name")
              .in("id", userIds);

            const userMap = new Map(
              (Array.isArray(users) ? users : []).map((u) => [u.id, u.full_name])
            );

            return {
              ...booking,
              client_name: userMap.get(booking.client_id),
              trainer_name: userMap.get(booking.trainer_id),
            };
          })
        );

        setBookings(bookingsWithNames);
      } else {
        setBookings([]);
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
      const isDemo = isDemoMode();
      const createdAt = new Date().toISOString();

      if (isDemo) {
        // Create booking in localStorage in demo mode
        const newBooking: Booking = {
          id: `local-${Date.now()}`,
          client_id: user.id,
          trainer_id: trainerId,
          session_date: sessionDate,
          duration_minutes: durationMinutes,
          status: "pending",
          notes,
          created_at: createdAt,
          updated_at: createdAt,
        };

        const demoBookings = localStorage.getItem(`bookings_demo_${user.id}`);
        const existingBookings = demoBookings ? JSON.parse(demoBookings) : [];
        const updatedBookings = [...existingBookings, newBooking];

        localStorage.setItem(`bookings_demo_${user.id}`, JSON.stringify(updatedBookings));
        setBookings((prev) => [...prev, newBooking]);
        return newBooking;
      }

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
      const isDemo = isDemoMode();
      const updatedAt = new Date().toISOString();

      if (isDemo) {
        // Update booking in localStorage in demo mode
        const demoBookings = localStorage.getItem(`bookings_demo_${user.id}`);
        if (demoBookings) {
          const existingBookings = JSON.parse(demoBookings);
          const updatedBookings = existingBookings.map((b: Booking) =>
            b.id === bookingId ? { ...b, status, updated_at: updatedAt } : b
          );
          localStorage.setItem(`bookings_demo_${user.id}`, JSON.stringify(updatedBookings));
          setBookings(updatedBookings);

          return existingBookings.find((b: Booking) => b.id === bookingId);
        }
        return null;
      }

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
