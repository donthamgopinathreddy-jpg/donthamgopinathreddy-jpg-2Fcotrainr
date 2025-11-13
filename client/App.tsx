import "./global.css";

import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Onboarding from "./pages/Onboarding";
import Login from "./pages/Login";
import Home from "./pages/Home";
import TrainerHome from "./pages/TrainerHome";
import Discover from "./pages/Discover";
import Messages from "./pages/Messages";
import ChatMessages from "./pages/ChatMessages";
import Meals from "./pages/Meals";
import Profile from "./pages/Profile";
import Feed from "./pages/Feed";
import TrainerProfile from "./pages/TrainerProfile";
import VideoCall from "./pages/VideoCall";
import VideoMeeting from "./pages/VideoMeeting";
import VideoSessions from "./pages/VideoSessions";
import Subscription from "./pages/Subscription";
import TrainerSignup from "./pages/TrainerSignup";
import TrainerDashboard from "./pages/TrainerDashboard";
import TrainerClientDetail from "./pages/TrainerClientDetail";
import ActivityDetail from "./pages/ActivityDetail";
import NotFound from "./pages/NotFound";
import UserProfile from "./pages/UserProfile";
import Leaderboard from "./pages/Leaderboard";
import Navigation from "./components/Navigation";

const queryClient = new QueryClient();

const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-background text-foreground">
    {children}
    <Navigation />
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="text-center">
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2Fc659d255956c4643b6576a691786eec0%2Fe823f4816a094df5bccc1efcb008e8ff?format=webp&width=800"
            alt="CoTrainr"
            className="h-20 w-auto mx-auto mb-8"
          />
          <div className="animate-spin h-8 w-8 text-orange-500 mx-auto mb-4">
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
              <circle
                className="text-orange-500"
                cx="25"
                cy="25"
                r="20"
                stroke="currentColor"
                strokeWidth="5"
                fill="none"
                strokeDasharray="100"
                strokeDashoffset="75"
              />
            </svg>
          </div>
          <p className="text-slate-600 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const RoleBasedHome = () => {
  const { userProfile } = useAuth();

  if (userProfile?.role === "trainer") {
    return <TrainerHome />;
  }

  return <Home />;
};

const AuthInitializer = ({ children }: { children: React.ReactNode }) => {
  // Just render children immediately - auth check happens in background in AuthProvider
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout>
              <RoleBasedHome />
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
        path="/profile/:userId"
        element={
          <ProtectedRoute>
            <AppLayout>
              <UserProfile />
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
        path="/video-meeting"
        element={
          <ProtectedRoute>
            <VideoMeeting />
          </ProtectedRoute>
        }
      />
      <Route
        path="/video-sessions"
        element={
          <ProtectedRoute>
            <AppLayout>
              <VideoSessions />
            </AppLayout>
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
        path="/trainer-dashboard"
        element={
          <ProtectedRoute>
            <AppLayout>
              <TrainerDashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/trainer/client/:clientId"
        element={
          <ProtectedRoute>
            <AppLayout>
              <TrainerClientDetail />
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
  );
};

const App = () => {
  console.log("App component rendering");

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <BrowserRouter>
                <AuthInitializer>
                  <Toaster />
                  <Sonner />
                  <AppRoutes />
                </AuthInitializer>
              </BrowserRouter>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
