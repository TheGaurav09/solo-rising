
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
import WorkoutPage from "./pages/WorkoutPage";
import ProfilePage from "./pages/ProfilePage";
import AchievementsPage from "./pages/AchievementsPage";
import StorePage from "./pages/StorePage";

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

  useEffect(() => {
    // Simple initialization to avoid infinite loading
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

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
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              
              {/* Protected Dashboard Routes */}
              <Route path="/" element={<Dashboard />}>
                <Route path="workout" element={<WorkoutPage />} />
                <Route path="profile/:userId" element={<ProfilePage />} />
                <Route path="achievements" element={<AchievementsPage />} />
                <Route path="store" element={<StorePage />} />
                {/* Redirect missing paths to workout */}
                <Route path="*" element={<Navigate to="/workout" replace />} />
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
