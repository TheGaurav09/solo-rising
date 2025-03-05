
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./components/Dashboard";
import ProfileAndWorkoutPage from "./pages/ProfileAndWorkoutPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import StoreAndAchievementsPage from "./pages/StoreAndAchievementsPage";
import AIChatPage from "./pages/AIChatPage";
import HallOfFamePage from "./pages/HallOfFamePage";
import SettingsPage from "./pages/SettingsPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize application
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 500);
    
    // Load Supabase data when app initializes
    const loadInitialData = async () => {
      // You can preload initial data here
      // This ensures data is ready when components mount
    };
    
    loadInitialData();
    
    return () => clearTimeout(timer);
  }, []);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-black">
        <div className="flex flex-col items-center">
          <div className="text-3xl font-bold mb-4 text-gradient goku-gradient">SOLO RISING</div>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              
              {/* Protected Dashboard Routes */}
              <Route path="/" element={<Dashboard />}>
                <Route path="profile-workout" element={<ProfileAndWorkoutPage />} />
                <Route path="profile/:userId" element={<ProfileAndWorkoutPage />} />
                <Route path="leaderboard" element={<LeaderboardPage />} />
                <Route path="store-achievements" element={<StoreAndAchievementsPage />} />
                <Route path="ai-chat" element={<AIChatPage />} />
                <Route path="hall-of-fame" element={<HallOfFamePage />} />
                <Route path="settings" element={<SettingsPage />} />
                {/* Redirect missing paths to profile-workout */}
                <Route path="*" element={<Navigate to="/profile-workout" replace />} />
              </Route>
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </UserProvider>
    </QueryClientProvider>
  );
};

export default App;
