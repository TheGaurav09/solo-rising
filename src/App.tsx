import React, { useEffect } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  useNavigate,
} from "react-router-dom";
import { useUser } from "@/context/UserContext";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";

import Index from "@/pages/Index";
import CharacterSelectionPage from "@/pages/CharacterSelectionPage";
import WorkoutPage from "@/pages/WorkoutPage";
import ProfilePage from "@/pages/ProfilePage";
import AIChatPage from "@/pages/AIChatPage";
import LeaderboardPage from "@/pages/LeaderboardPage";
import StorePage from "@/pages/StorePage";
import StoreAndAchievementsPage from "@/pages/StoreAndAchievementsPage";
import AchievementsPage from "@/pages/AchievementsPage";
import HallOfFamePage from "@/pages/HallOfFamePage";
import SettingsPage from "@/pages/SettingsPage";
import ProfileAndWorkoutPage from "@/pages/ProfileAndWorkoutPage";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import ErrorPage from "@/pages/ErrorPage";
import NotFound from "@/pages/NotFound";

const Layout = () => {
  const { hasSelectedCharacter } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!hasSelectedCharacter && window.location.pathname !== '/character-selection') {
      navigate('/character-selection');
    }
  }, [hasSelectedCharacter, navigate]);

  return (
    <>
      <AuthModal />
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "",
        element: <Index />,
      },
      {
        path: "character-selection",
        element: <CharacterSelectionPage />,
      },
      {
        path: "workout",
        element: <WorkoutPage />,
      },
      {
        path: "profile-workout",
        element: <ProfileAndWorkoutPage />,
      },
      {
        path: "profile-workout/:userId",
        element: <ProfileAndWorkoutPage />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
      {
        path: "ai-chat",
        element: <AIChatPage />,
      },
      {
        path: "leaderboard",
        element: <LeaderboardPage />,
      },
      {
        path: "store",
        element: <StorePage />,
      },
      {
        path: "store-achievements",
        element: <StoreAndAchievementsPage />,
      },
      {
        path: "achievements",
        element: <AchievementsPage />,
      },
      {
        path: "hall-of-fame",
        element: <HallOfFamePage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
