import "./global.css";

import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const AppContent = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/" element={<AppLayout><Home /></AppLayout>} />
      <Route path="/discover" element={<AppLayout><Discover /></AppLayout>} />
      <Route path="/trainer/:id" element={<AppLayout><TrainerProfile /></AppLayout>} />
      <Route path="/messages" element={<AppLayout><Messages /></AppLayout>} />
      <Route path="/chat/:trainerId" element={<AppLayout><ChatMessages /></AppLayout>} />
      <Route path="/meals" element={<AppLayout><Meals /></AppLayout>} />
      <Route path="/profile" element={<AppLayout><Profile /></AppLayout>} />
      <Route path="/feed" element={<AppLayout><Feed /></AppLayout>} />
      <Route path="/video/:trainerId" element={<VideoCall />} />
      <Route path="/subscription" element={<AppLayout><Subscription /></AppLayout>} />
      <Route path="/trainer-signup" element={<AppLayout><TrainerSignup /></AppLayout>} />
      <Route path="/activity/:type" element={<AppLayout><ActivityDetail /></AppLayout>} />
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
        <Toaster />
        <Sonner />
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
