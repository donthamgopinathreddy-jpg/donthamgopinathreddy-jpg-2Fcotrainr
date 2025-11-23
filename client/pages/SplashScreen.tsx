import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Logo from "@/components/Logo";

export default function SplashScreen() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Show splash screen for 2 seconds minimum
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(splashTimer);
  }, []);

  // Once splash animation is done and auth is loaded, redirect
  useEffect(() => {
    if (!showSplash && !loading) {
      if (user) {
        navigate("/", { replace: true });
      } else {
        navigate("/login", { replace: true });
      }
    }
  }, [showSplash, loading, user, navigate]);

  if (!showSplash && !loading) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-100/20 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* Logo with fade-in animation */}
        <div className="animate-fade-in">
          <Logo size="2xl" className="drop-shadow-lg" />
        </div>

        {/* Loading spinner */}
        <div className="mt-12 animate-pulse">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
    </div>
  );
}
