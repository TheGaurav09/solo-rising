
import React, { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/context/UserContext';
import AnimatedCard from '@/components/ui/AnimatedCard';
import Footer from '@/components/ui/Footer';
import Leaderboard from '@/components/Leaderboard';

const LeaderboardPage = () => {
  const { character } = useUser();
  
  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Leaderboard</h1>
      
      <Leaderboard />
      
      {/* Add margin between content and footer */}
      <div className="mt-16"></div>
      <Footer />
    </div>
  );
};

export default LeaderboardPage;
