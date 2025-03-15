
import React, { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/context/UserContext';
import AnimatedCard from '@/components/ui/AnimatedCard';
import Footer from '@/components/ui/Footer';
import Leaderboard from '@/components/Leaderboard';
import { Trophy } from 'lucide-react';

const LeaderboardPage = () => {
  const { character } = useUser();
  
  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6 gap-3">
        <div className="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center border border-white/10">
          <Trophy size={20} className="text-yellow-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Leaderboard</h1>
          <p className="text-white/60 text-sm">Compete with others and rise through the ranks</p>
        </div>
      </div>
      
      <AnimatedCard className="border border-white/10 backdrop-blur-md">
        <Leaderboard />
      </AnimatedCard>
      
      {/* Add margin between content and footer */}
      <div className="mt-16"></div>
      <Footer />
    </div>
  );
};

export default LeaderboardPage;
