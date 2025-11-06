import "./global.css";

import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Onboarding from "./pages/Onboarding";
import Home from "./pages/Home";
import Discover from "./pages/Discover";
import Messages from "./pages/Messages";
import ChatMessages from "./pages/ChatMessages";
import Meals from "./pages/Meals";
import Profile from "./pages/Profile";
import Feed from "./pages/Feed";
import TrainerProfile from "./pages/TrainerProfile";
import VideoCall from "./pages/VideoCall";
import Subscription from "./pages/Subscription";
import TrainerSignup from "./pages/TrainerSignup";
import ActivityDetail from "./pages/ActivityDetail";
import NotFound from "./pages/NotFound";
import Navigation from "./components/Navigation";

const queryClient = new QueryClient();

const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-background text-foreground">
    <div className="pb-24">
      {children}
    </div>
    <Navigation />
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 text-slate-400 mx-auto mb-4">
            <svg viewBox="0 0 50 50">
              <circle
                className="opacity-30"
                cx="25"
                cy="25"
                r="20"
                stroke="currentColor"
                strokeWidth="5"
                fill="none"
              />
            </svg>
          </div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

const AppContent = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Home />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/discover"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Discover />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/trainer/:id"
        element={
          <ProtectedRoute>
            <AppLayout>
              <TrainerProfile />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Messages />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat/:trainerId"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ChatMessages />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/meals"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Meals />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Profile />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/feed"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Feed />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/video/:trainerId"
        element={
          <ProtectedRoute>
            <VideoCall />
          </ProtectedRoute>
        }
      />
      <Route
        path="/subscription"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Subscription />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/trainer-signup"
        element={
          <ProtectedRoute>
            <AppLayout>
              <TrainerSignup />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/activity/:type"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ActivityDetail />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

const App = () => {
  useEffect(() => {
    // Use light theme (remove dark class if present)
    document.documentElement.classList.remove("dark");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
