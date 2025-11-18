import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function ClearSession() {
  const navigate = useNavigate();

  useEffect(() => {
    try {
      // Clear all localStorage keys
      Object.keys(localStorage).forEach((key) => {
        if (
          key.includes("supabase") ||
          key.includes("sb-") ||
          key.includes("auth")
        ) {
          localStorage.removeItem(key);
        }
      });

      // Also clear sessionStorage
      sessionStorage.clear();

      console.log("Session cleared successfully");
      toast.success("Session cleared! Redirecting to login...");

      // Redirect to login after 1 second
      setTimeout(() => {
        navigate("/login", { replace: true });
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error clearing session:", error);
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="text-center">
        <div className="mb-4">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Clearing Session...</h1>
        <p className="text-gray-400">You'll be redirected to login shortly</p>
      </div>
    </div>
  );
}
