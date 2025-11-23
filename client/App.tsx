import "./global.css";

import { useEffect, useContext, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth, AuthContext } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Onboarding from "./pages/Onboarding";
import Login from "./pages/Login";
import PremiumSignup from "./pages/PremiumSignup";
import ClearSession from "./pages/ClearSession";
import NutritionTracker from "./pages/NutritionTracker";
import ChatMessages from "./pages/ChatMessages";
import DietPlanCreator from "./pages/DietPlanCreator";
import AIWeeklyInsights from "./pages/AIWeeklyInsights";
import Profile from "./pages/Profile";
import Feed from "./pages/Feed";
import TrainerProfile from "./pages/TrainerProfile";
import VideoCall from "./pages/VideoCall";
import VideoMeeting from "./pages/VideoMeeting";
import VideoSessions from "./pages/VideoSessions";
import Subscription from "./pages/Subscription";
import AchievementsPage from "./pages/Achievements";
import DietPlans from "./pages/DietPlans";
import DietPlanDetail from "./pages/DietPlanDetail";
import TrainerSignup from "./pages/TrainerSignup";
import TrainerDashboard from "./pages/TrainerDashboard";
import TrainerClientDetail from "./pages/TrainerClientDetail";
import ActivityDetail from "./pages/ActivityDetail";
import ProxyTest from "./pages/ProxyTest";
import NotFound from "./pages/NotFound";
import UserProfile from "./pages/UserProfile";
import Leaderboard from "./pages/Leaderboard";
import Upgrade from "./pages/Upgrade";
import TrainerBookingPayment from "./pages/TrainerBookingPayment";
import NotificationsPageEnhanced from "./pages/NotificationsPageEnhanced";
import FollowersFollowingPage from "./pages/FollowersFollowingPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminSetup from "./pages/AdminSetup";
import ClientDashboardDemo from "./pages/ClientDashboardDemo";
import TrainerDashboardDemo from "./pages/TrainerDashboardDemo";
import AdminDashboardDemo from "./pages/AdminDashboardDemo";
import MobileLogin from "./pages/MobileLogin";
import MobileSignup from "./pages/MobileSignup";
import MobileDiscover from "./pages/MobileDiscover";
import MobileMeals from "./pages/MobileMeals";
import MobileFeed from "./pages/MobileFeed";
import MobileMessages from "./pages/MobileMessages";
import MobileProfile from "./pages/MobileProfile";
import HomeModern from "./pages/HomeModern";
import Community from "./pages/Community";
import Navigation from "./components/Navigation";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { isUserAdmin } from "@/lib/adminAuth";
import { useNativeAppInit } from "@/hooks/useNativeAppInit";
import SplashScreen from "./pages/SplashScreen";

const queryClient = new QueryClient();

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <div className="min-h-screen">{children}</div>
      <Navigation />
    </div>
  );
};

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
  const { userProfile, loading } = useAuth();

  // Wait for auth to load before redirecting
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

  if (userProfile?.role === "admin") {
    return <AdminDashboard />;
  }

  if (userProfile?.role === "trainer") {
    return <TrainerHome />;
  }

  // Default to client home for "client" role or any other case
  return <ClientHome />;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { userProfile, loading } = useAuth();

  if (loading || !userProfile) {
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

  // If user is not admin, show error message instead of redirecting to avoid loops
  if (!isUserAdmin(userProfile)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="text-center">
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2Fc659d255956c4643b6576a691786eec0%2Fe823f4816a094df5bccc1efcb008e8ff?format=webp&width=800"
            alt="CoTrainr"
            className="h-20 w-auto mx-auto mb-8 opacity-50"
          />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-8">
            You don't have permission to access this page.
          </p>
          <a
            href="/"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Home
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

const AuthInitializer = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

// Separate component to handle permissions that uses useAuth
const PermissionRequester = () => {
  const context = useContext(AuthContext);

  // Initialize native app features
  useNativeAppInit();

  // If context is not available yet, don't try to use useAuth
  if (!context) {
    return null;
  }

  const { user } = context;

  useEffect(() => {
    if (user) {
      // Request permissions on app startup for authenticated users
      const requestInitialPermissions = async () => {
        try {
          // Request notifications (can be called without user interaction in many cases)
          if (
            "Notification" in window &&
            Notification.permission === "default"
          ) {
            await Notification.requestPermission();
          }
        } catch (error) {
          console.debug("Permission request result:", error);
        }
      };

      requestInitialPermissions();
    }
  }, [user]);

  return null;
};

const AppWithSplash = () => {
  const { loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Show splash for at least 2 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Show splash screen for minimum 2 seconds or while auth is loading
  if (showSplash || loading) {
    return <SplashScreen />;
  }

  return <AppRoutes />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<MobileLogin />} />
      <Route path="/signup" element={<MobileSignup />} />
      <Route path="/clear-session" element={<ClearSession />} />
      <Route path="/proxy-test" element={<ProxyTest />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/demo-client" element={<ClientDashboardDemo />} />
      <Route path="/demo-trainer" element={<TrainerDashboardDemo />} />
      <Route path="/demo-admin" element={<AdminDashboardDemo />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomeModern />
          </ProtectedRoute>
        }
      />
      <Route
        path="/community"
        element={
          <ProtectedRoute>
            <Community />
          </ProtectedRoute>
        }
      />
      <Route
        path="/discover"
        element={
          <ProtectedRoute>
            <MobileDiscover />
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
        path="/trainer/:trainerId/payment"
        element={
          <ProtectedRoute>
            <AppLayout>
              <TrainerBookingPayment />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <MobileMessages />
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
            <MobileMeals />
          </ProtectedRoute>
        }
      />
      <Route
        path="/diet-plan-creator"
        element={
          <ProtectedRoute>
            <AppLayout>
              <DietPlanCreator />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai-weekly-insights"
        element={
          <ProtectedRoute>
            <AppLayout>
              <AIWeeklyInsights />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/leaderboard"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Leaderboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <AppLayout>
              <NotificationsPageEnhanced />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/followers-following"
        element={
          <ProtectedRoute>
            <AppLayout>
              <FollowersFollowingPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <MobileProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/nutrition"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ErrorBoundary>
                <NutritionTracker />
              </ErrorBoundary>
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/upgrade"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Upgrade />
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
        path="/user/:username"
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
            <MobileFeed />
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
        path="/achievements"
        element={
          <ProtectedRoute>
            <AppLayout>
              <AchievementsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/diet-plans"
        element={
          <ProtectedRoute>
            <AppLayout>
              <DietPlans />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/diet-plan/:id"
        element={
          <ProtectedRoute>
            <AppLayout>
              <DietPlanDetail />
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
      <Route path="/admin/setup" element={<AdminSetup />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
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
      <BrowserRouter>
        <TooltipProvider>
          <ThemeProvider>
            <LanguageProvider>
              <AuthProvider>
                <ErrorBoundary>
                  <AuthInitializer>
                    <PermissionRequester />
                    <Toaster />
                    <Sonner />
                    <AppWithSplash />
                  </AuthInitializer>
                </ErrorBoundary>
              </AuthProvider>
            </LanguageProvider>
          </ThemeProvider>
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
