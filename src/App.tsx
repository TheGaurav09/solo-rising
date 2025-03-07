
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import { AudioProvider } from "./context/AudioContext";
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
import DashboardPage from "./pages/DashboardPage";
import AdminPage from "./pages/AdminPage";
import { supabase } from "@/integrations/supabase/client";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasCharacter, setHasCharacter] = useState(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      // First, check local storage for faster initial check
      const cachedAuth = localStorage.getItem('sb-auth-token');
      const initialAuth = !!cachedAuth;
      
      setIsAuthenticated(initialAuth);
      
      // Then verify with Supabase (happens in parallel)
      const { data } = await supabase.auth.getUser();
      const isAuth = !!data.user;
      setIsAuthenticated(isAuth);

      // If user is authenticated, check if they have selected a character
      if (isAuth) {
        const { data: userData } = await supabase
          .from('users')
          .select('character_type')
          .eq('id', data.user.id)
          .single();
          
        setHasCharacter(!!userData?.character_type);
      }
      
      // Set initialized after checking auth status
      setIsInitialized(true);
    };

    checkAuth();
    
    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const isAuth = !!session?.user;
      setIsAuthenticated(isAuth);
      
      // If user is authenticated, check if they have selected a character
      if (isAuth) {
        const { data: userData } = await supabase
          .from('users')
          .select('character_type')
          .eq('id', session.user.id)
          .single();
          
        setHasCharacter(!!userData?.character_type);
      } else {
        setHasCharacter(false);
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Show a lightweight loading indicator instead of a blank screen
  // This allows the app to at least render something quickly
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <AudioProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Redirect authenticated users with character directly to dashboard */}
                <Route path="/" element={
                  isAuthenticated && hasCharacter ? 
                    <Navigate to="/dashboard" replace /> : 
                    <Index />
                } />
                
                <Route path="/admin" element={<AdminPage />} />
                
                {/* Protected Dashboard Routes */}
                <Route path="/" element={<Dashboard />}>
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="profile-workout" element={<ProfileAndWorkoutPage />} />
                  <Route path="profile/:userId" element={<ProfileAndWorkoutPage />} />
                  <Route path="leaderboard" element={<LeaderboardPage />} />
                  <Route path="store-achievements" element={<StoreAndAchievementsPage />} />
                  <Route path="ai-chat" element={<AIChatPage />} />
                  <Route path="hall-of-fame" element={<HallOfFamePage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  {/* Redirect missing paths to profile-workout */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Route>
                
                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AudioProvider>
      </UserProvider>
    </QueryClientProvider>
  );
};

export default App;
