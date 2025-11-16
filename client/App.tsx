import "./global.css";

import { useEffect } from "react";
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
import AdminTrainerVerification from "./pages/AdminTrainerVerification";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminUserManagement from "./pages/AdminUserManagement";
import AdminTrainerManagement from "./pages/AdminTrainerManagement";
import AdminCommunication from "./pages/AdminCommunication";
import AdminSystemHealth from "./pages/AdminSystemHealth";
import AdminQuickStats from "./pages/AdminQuickStats";
import NotFound from "./pages/NotFound";
import UserProfile from "./pages/UserProfile";
import Leaderboard from "./pages/Leaderboard";
import Upgrade from "./pages/Upgrade";
import TrainerBookingPayment from "./pages/TrainerBookingPayment";
import Notifications from "./pages/Notifications";
import FollowersFollowingPage from "./pages/FollowersFollowingPage";
import NotificationsPageEnhanced from "./pages/NotificationsPageEnhanced";
import Navigation from "./components/Navigation";
import { ErrorBoundary } from "./components/ErrorBoundary";

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
  const { userProfile } = useAuth();

  if (userProfile?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  if (userProfile?.role === "trainer") {
    return <TrainerHome />;
  }

  return <Home />;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { userProfile, loading } = useAuth();

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

  if (!userProfile || userProfile.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AuthInitializer = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

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
            <AppLayout>
              <ErrorBoundary>
                <Profile />
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
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminTrainerVerification />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <ProtectedRoute>
            <AdminAnalytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute>
            <AdminUserManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/trainers"
        element={
          <ProtectedRoute>
            <AdminTrainerManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/communication"
        element={
          <ProtectedRoute>
            <AdminCommunication />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/system"
        element={
          <ProtectedRoute>
            <AdminSystemHealth />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/stats"
        element={
          <ProtectedRoute>
            <AdminQuickStats />
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
                <AuthInitializer>
                  <Toaster />
                  <Sonner />
                  <AppRoutes />
                </AuthInitializer>
              </AuthProvider>
            </LanguageProvider>
          </ThemeProvider>
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
