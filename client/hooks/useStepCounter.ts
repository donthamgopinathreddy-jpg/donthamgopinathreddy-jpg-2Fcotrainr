import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface AccelerometerData {
  x: number;
  y: number;
  z: number;
}

export const useStepCounter = () => {
  const { userProfile } = useAuth();
  const [steps, setSteps] = useState(0);
  const [totalStepsToday, setTotalStepsToday] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [loading, setLoading] = useState(false);
  const accelerometerDataRef = useRef<number[]>([]);
  const lastStepTimeRef = useRef(0);
  const thresholdRef = useRef(15); // Threshold for detecting a step

  // Calculate magnitude of acceleration
  const calculateMagnitude = (x: number, y: number, z: number): number => {
    return Math.sqrt(x * x + y * y + z * z);
  };

  // Detect step from accelerometer data
  const detectStep = useCallback((magnitude: number): boolean => {
    const currentTime = Date.now();
    const timeSinceLastStep = currentTime - lastStepTimeRef.current;

    // Minimum 300ms between steps to avoid false positives
    if (timeSinceLastStep < 300) {
      return false;
    }

    // Check if magnitude exceeds threshold (indicating a step)
    if (magnitude > thresholdRef.current) {
      lastStepTimeRef.current = currentTime;
      return true;
    }

    return false;
  }, []);

  // Initialize accelerometer if available
  useEffect(() => {
    const initializeAccelerometer = async () => {
      try {
        // Try to use Capacitor's DeviceMotionPlugin for step detection
        if (window.DeviceMotionEvent) {
          window.addEventListener("devicemotion", (event) => {
            const accel = event.acceleration;
            if (accel) {
              const magnitude = calculateMagnitude(
                accel.x || 0,
                accel.y || 0,
                accel.z || 0,
              );

              accelerometerDataRef.current.push(magnitude);

              // Keep only last 10 readings for smoothing
              if (accelerometerDataRef.current.length > 10) {
                accelerometerDataRef.current.shift();
              }

              // Calculate average for more reliable detection
              const avgMagnitude =
                accelerometerDataRef.current.reduce((a, b) => a + b, 0) /
                accelerometerDataRef.current.length;

              if (detectStep(avgMagnitude)) {
                setSteps((prev) => prev + 1);
              }
            }
          });

          setIsTracking(true);
        }
      } catch (error) {
        console.debug("Accelerometer not available:", error);
      }
    };

    if (userProfile && !isTracking) {
      initializeAccelerometer();
    }

    return () => {
      window.removeEventListener("devicemotion", null as any);
    };
  }, [userProfile, isTracking, detectStep]);

  // Fetch today's steps from database
  const fetchTodaySteps = useCallback(async () => {
    if (!userProfile?.id) return;

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from("health_sync_data")
        .select("steps")
        .eq("user_id", userProfile.id)
        .eq("sync_date", today.toISOString().split("T")[0])
        .single();

      if (!error && data) {
        setTotalStepsToday(data.steps || 0);
        return data.steps || 0;
      }

      // Create entry for today if doesn't exist
      const { data: newEntry } = await supabase
        .from("health_sync_data")
        .insert({
          user_id: userProfile.id,
          steps: 0,
          sync_date: today.toISOString().split("T")[0],
          source: "sensor",
        })
        .select()
        .single();

      if (newEntry) {
        setTotalStepsToday(0);
        return 0;
      }
    } catch (error) {
      console.debug("Error fetching today's steps:", error);
    }
  }, [userProfile?.id]);

  // Save steps to database
  const saveSteps = useCallback(
    async (stepCount: number) => {
      if (!userProfile?.id || stepCount === 0) return;

      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dateStr = today.toISOString().split("T")[0];

        // Update or insert today's steps
        const { error } = await supabase
          .from("health_sync_data")
          .update({
            steps: stepCount,
            last_synced: new Date().toISOString(),
          })
          .eq("user_id", userProfile.id)
          .eq("sync_date", dateStr);

        if (error?.code === "PGRST116") {
          // Record doesn't exist, insert it
          await supabase.from("health_sync_data").insert({
            user_id: userProfile.id,
            steps: stepCount,
            sync_date: dateStr,
            source: "sensor",
          });
        }

        setTotalStepsToday(stepCount);
      } catch (error) {
        console.debug("Error saving steps:", error);
      }
    },
    [userProfile?.id],
  );

  // Auto-save steps every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (steps > 0) {
        saveSteps(steps);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [steps, saveSteps]);

  // Initial load of today's steps
  useEffect(() => {
    fetchTodaySteps();
  }, [fetchTodaySteps]);

  const resetSteps = useCallback(() => {
    setSteps(0);
    accelerometerDataRef.current = [];
    lastStepTimeRef.current = 0;
  }, []);

  const manualAddStep = useCallback((count: number = 1) => {
    setSteps((prev) => prev + count);
  }, []);

  return {
    steps: totalStepsToday + steps,
    dailySteps: totalStepsToday,
    detectedSteps: steps,
    isTracking,
    loading,
    saveSteps,
    resetSteps,
    manualAddStep,
    fetchTodaySteps,
  };
};
