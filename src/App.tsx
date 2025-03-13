
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
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
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
      console.log("App: Starting auth check");
      
      // Set a shorter timeout to avoid infinite loading
      const timeoutId = setTimeout(() => {
        console.log("App: Force-breaking initialization due to timeout");
        setIsInitialized(true);
      }, 2000);
      
      try {
        // First check local storage for auth token to speed up the process
        const cachedAuth = localStorage.getItem('sb-auth-token');
        
        if (cachedAuth) {
          console.log("App: Found cached auth token, attempting quick auth");
          setIsAuthenticated(true);
        }
        
        // Do the proper auth check with Supabase
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("App: Auth check error:", error);
          localStorage.removeItem('sb-auth-token');
          localStorage.removeItem('sb-auth-data');
          setIsAuthenticated(false);
          clearTimeout(timeoutId);
          setIsInitialized(true);
          return;
        }
        
        const isAuth = !!data.session;
        console.log("App: User authenticated:", isAuth);
        setIsAuthenticated(isAuth);
        
        if (!isAuth) {
          console.log("App: No auth session found, clearing local storage");
          localStorage.removeItem('sb-auth-token');
          localStorage.removeItem('sb-auth-data');
        }

        // If user is authenticated, check if they have selected a character
        if (isAuth && data.session?.user) {
          try {
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('character_type')
              .eq('id', data.session.user.id)
              .maybeSingle();
              
            if (userError) {
              console.error("App: User data fetch error:", userError);
            } else {
              const hasChar = !!userData?.character_type;
              console.log("App: User has character:", hasChar);
              setHasCharacter(hasChar);
            }
          } catch (fetchError) {
            console.error("App: Error fetching user character data:", fetchError);
          }
        }
      } catch (error) {
        console.error("App: Auth check error:", error);
        localStorage.removeItem('sb-auth-token');
        localStorage.removeItem('sb-auth-data');
      } finally {
        clearTimeout(timeoutId);
        setIsInitialized(true);
        console.log("App: Auth check completed, setting initialized to true");
      }
    };

    checkAuth();
    
    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("App: Auth state changed:", event);
      const isAuth = !!session?.user;
      setIsAuthenticated(isAuth);
      
      if (isAuth) {
        localStorage.setItem('sb-auth-token', 'true');
      } else {
        localStorage.removeItem('sb-auth-token');
        localStorage.removeItem('sb-auth-data');
        setHasCharacter(false);
      }
      
      // If user is authenticated, check if they have selected a character
      if (isAuth && session?.user) {
        try {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('character_type')
            .eq('id', session.user.id)
            .maybeSingle();
            
          if (userError) {
            console.error("App: User data fetch error on auth change:", userError);
          } else {
            setHasCharacter(!!userData?.character_type);
          }
        } catch (fetchError) {
          console.error("App: Error fetching user character data on auth change:", fetchError);
        }
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Function to assign default coins to new users
  useEffect(() => {
    const setupNewUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Check if the user already has a coins record
        const { data: userData, error: fetchError } = await supabase
          .from('users')
          .select('coins')
          .eq('id', session.user.id)
          .maybeSingle();
          
        if (fetchError) {
          console.error("App: Error fetching user coins data:", fetchError);
          return;
        }
        
        // If no coins value or coins are 0, update to give 10 coins
        if (!userData || userData.coins === 0 || userData.coins === null) {
          const { error: updateError } = await supabase
            .from('users')
            .update({ coins: 10 })
            .eq('id', session.user.id);
            
          if (updateError) {
            console.error("App: Error updating user coins:", updateError);
          } else {
            console.log("App: Assigned 10 default coins to user");
          }
        }
      }
    };
    
    if (isAuthenticated) {
      setupNewUser();
    }
  }, [isAuthenticated]);

  // Show a lightweight loading indicator instead of a blank screen
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-black">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
          <p className="text-white/70 text-sm">Loading application...</p>
        </div>
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
                
                {/* Legal pages */}
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                
                <Route path="/admin" element={<AdminPage />} />
                
                {/* Protected Dashboard Routes */}
                <Route path="/" element={<Dashboard />}>
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="profile-workout" element={<ProfileAndWorkoutPage />} />
                  {/* Fixed profile view route to properly pass userId parameter */}
                  <Route path="profile/:userId" element={<ProfileAndWorkoutPage />} />
                  <Route path="leaderboard" element={<LeaderboardPage />} />
                  <Route path="store-achievements" element={<StoreAndAchievementsPage />} />
                  <Route path="ai-chat" element={<AIChatPage />} />
                  <Route path="hall-of-fame" element={<HallOfFamePage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  {/* Redirect missing paths to dashboard */}
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
