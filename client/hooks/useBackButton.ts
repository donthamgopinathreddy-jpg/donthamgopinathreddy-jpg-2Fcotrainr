import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

/**
 * Hook to handle back button behavior for both web and native apps
 * For native apps (Capacitor), uses the native back handler
 * For web, uses React Router navigation
 */
export const useBackButton = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleBackButton = async () => {
      // Check if we're in a Capacitor/native environment
      if (typeof window !== "undefined" && (window as any).Capacitor) {
        try {
          const { App } = (window as any).Capacitor.Plugins;
          if (App) {
            // For native apps, use Capacitor's back button handler
            await App.addListener("backButton", ({ canGoBack }: any) => {
              if (canGoBack) {
                navigate(-1);
              } else {
                // If can't go back, close the app
                App.exitApp();
              }
            });
          }
        } catch (error) {
          console.debug("Capacitor back button not available:", error);
          // Fallback to web navigation
        }
      }
    };

    handleBackButton();
  }, [navigate]);

  return {
    goBack: () => navigate(-1),
  };
};
