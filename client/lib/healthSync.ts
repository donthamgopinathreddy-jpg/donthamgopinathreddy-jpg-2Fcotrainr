/**
 * Unified Health Sync Service
 * Handles step data synchronization from both Google Fit (Android) and Apple HealthKit (iOS)
 */

export interface HealthSyncResult {
  steps: number;
  date: string;
  source: "google_fit" | "apple_health" | "manual";
  lastSyncTime: string;
  syncStatus: "success" | "error" | "pending";
}

class HealthSyncService {
  private isAndroid = (): boolean => {
    if (typeof window === "undefined") return false;
    return /android/i.test(navigator.userAgent);
  };

  private isIOS = (): boolean => {
    if (typeof window === "undefined") return false;
    return /iphone|ipad|ipod/i.test(navigator.userAgent);
  };

  private isCapacitorApp = (): boolean => {
    if (typeof window === "undefined") return false;
    return !!(window as any).Capacitor;
  };

  /**
   * Request permissions for health data access
   */
  async requestHealthPermissions(): Promise<boolean> {
    try {
      if (!this.isCapacitorApp()) {
        console.warn(
          "Health sync requires Capacitor. Using manual entry fallback.",
        );
        return false;
      }

      const { Plugins } = (window as any).Capacitor;

      if (this.isAndroid()) {
        return await this.requestGoogleFitPermissions();
      } else if (this.isIOS()) {
        return await this.requestAppleHealthPermissions();
      }

      return false;
    } catch (error) {
      console.error("Error requesting health permissions:", error);
      return false;
    }
  }

  /**
   * Request Google Fit permissions (Android)
   */
  private async requestGoogleFitPermissions(): Promise<boolean> {
    try {
      // Check if Google Fit plugin is available
      const plugin = (window as any).cordova?.plugins?.["google-fit"];
      if (!plugin) {
        console.warn(
          "Google Fit plugin not available. Install cordova-plugin-google-fit",
        );
        return false;
      }

      // Request permissions for steps data
      return new Promise((resolve) => {
        plugin.requestAuthorization(
          {
            scopes: ["https://www.googleapis.com/auth/fitness.activity.read"],
          },
          () => resolve(true),
          () => resolve(false),
        );
      });
    } catch (error) {
      console.error("Error requesting Google Fit permissions:", error);
      return false;
    }
  }

  /**
   * Request Apple HealthKit permissions (iOS)
   */
  private async requestAppleHealthPermissions(): Promise<boolean> {
    try {
      // Check if Apple Health plugin is available
      const plugin =
        (window as any).cordova?.plugins?.["apple-health"] ||
        (window as any).AppleHealth;
      if (!plugin) {
        console.warn(
          "Apple Health plugin not available. Install cordova-plugin-health or capacitor-health",
        );
        return false;
      }

      // Request read permissions for step count
      return new Promise((resolve) => {
        plugin.requestAuthorization(
          {
            permissions: {
              read: ["HKQuantityTypeIdentifierStepCount"],
            },
          },
          () => resolve(true),
          () => resolve(false),
        );
      });
    } catch (error) {
      console.error("Error requesting Apple Health permissions:", error);
      return false;
    }
  }

  /**
   * Get steps from Google Fit (Android)
   */
  private async getGoogleFitSteps(date: string): Promise<number> {
    try {
      const plugin = (window as any).cordova?.plugins?.["google-fit"];
      if (!plugin) return 0;

      const dateObj = new Date(date);
      const startOfDay = new Date(dateObj);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(dateObj);
      endOfDay.setHours(23, 59, 59, 999);

      return new Promise((resolve) => {
        plugin.query(
          {
            bucket: "1m",
            dataType: "com.google.step_count.delta",
            aggregateBy: "com.google.step_count.delta",
            startTime: Math.floor(startOfDay.getTime() / 1000),
            endTime: Math.floor(endOfDay.getTime() / 1000),
          },
          (data: any) => {
            let totalSteps = 0;
            if (data && data.bucket && Array.isArray(data.bucket)) {
              data.bucket.forEach((bucket: any) => {
                if (bucket.dataset && Array.isArray(bucket.dataset)) {
                  bucket.dataset.forEach((dataset: any) => {
                    if (dataset.point && Array.isArray(dataset.point)) {
                      dataset.point.forEach((point: any) => {
                        if (point.value && point.value[0]) {
                          totalSteps += point.value[0].intVal || 0;
                        }
                      });
                    }
                  });
                }
              });
            }
            resolve(totalSteps);
          },
          () => resolve(0),
        );
      });
    } catch (error) {
      console.error("Error fetching Google Fit steps:", error);
      return 0;
    }
  }

  /**
   * Get steps from Apple HealthKit (iOS)
   */
  private async getAppleHealthSteps(date: string): Promise<number> {
    try {
      const plugin =
        (window as any).cordova?.plugins?.["apple-health"] ||
        (window as any).AppleHealth;
      if (!plugin) return 0;

      const dateObj = new Date(date);
      const startOfDay = new Date(dateObj);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(dateObj);
      endOfDay.setHours(23, 59, 59, 999);

      return new Promise((resolve) => {
        plugin.getStepCount(
          {
            startDate: startOfDay,
            endDate: endOfDay,
          },
          (stepsData: any) => {
            resolve(stepsData?.value || 0);
          },
          () => resolve(0),
        );
      });
    } catch (error) {
      console.error("Error fetching Apple Health steps:", error);
      return 0;
    }
  }

  /**
   * Get steps for a specific date
   */
  async getStepsForDate(date: string): Promise<HealthSyncResult> {
    const now = new Date().toISOString();

    // If Capacitor app (mobile native)
    if (this.isCapacitorApp()) {
      try {
        let steps = 0;

        if (this.isAndroid()) {
          steps = await this.getGoogleFitSteps(date);
        } else if (this.isIOS()) {
          steps = await this.getAppleHealthSteps(date);
        }

        return {
          steps,
          date,
          source: this.isAndroid() ? "google_fit" : "apple_health",
          lastSyncTime: now,
          syncStatus: steps > 0 ? "success" : "error",
        };
      } catch (error) {
        console.error("Error syncing health data:", error);
        return {
          steps: 0,
          date,
          source: "manual",
          lastSyncTime: now,
          syncStatus: "error",
        };
      }
    }

    // Web version - no automatic sync available
    return {
      steps: 0,
      date,
      source: "manual",
      lastSyncTime: now,
      syncStatus: "pending",
    };
  }

  /**
   * Get steps for today
   */
  async getTodaySteps(): Promise<HealthSyncResult> {
    const today = new Date().toISOString().split("T")[0];
    return this.getStepsForDate(today);
  }

  /**
   * Sync steps for multiple days
   */
  async syncStepsForRange(
    startDate: string,
    endDate: string,
  ): Promise<HealthSyncResult[]> {
    const results: HealthSyncResult[] = [];
    const current = new Date(startDate);
    const end = new Date(endDate);

    while (current <= end) {
      const dateStr = current.toISOString().split("T")[0];
      const result = await this.getStepsForDate(dateStr);
      results.push(result);
      current.setDate(current.getDate() + 1);
      // Add small delay to prevent rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return results;
  }

  /**
   * Check if health sync is available
   */
  isHealthSyncAvailable(): boolean {
    return this.isCapacitorApp() && (this.isAndroid() || this.isIOS());
  }

  /**
   * Get platform info
   */
  getPlatformInfo(): {
    isAndroid: boolean;
    isIOS: boolean;
    isWeb: boolean;
    isCapacitor: boolean;
  } {
    return {
      isAndroid: this.isAndroid(),
      isIOS: this.isIOS(),
      isWeb: !this.isAndroid() && !this.isIOS(),
      isCapacitor: this.isCapacitorApp(),
    };
  }
}

export const healthSync = new HealthSyncService();
