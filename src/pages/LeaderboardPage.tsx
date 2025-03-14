
import React, { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import Leaderboard from '@/components/Leaderboard';
import { Skeleton } from '@/components/ui/skeleton';

const LeaderboardPage = () => {
  const { userId } = useUser();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for better UX
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Leaderboard</h1>
        <p className="text-white/70">
          See how you stack up against other warriors on their fitness journey!
        </p>
      </div>
      
      {loading ? (
        <div className="space-y-4">
          <div className="flex justify-between mb-6">
            <Skeleton className="h-10 w-[200px]" />
            <Skeleton className="h-10 w-[120px]" />
          </div>
          
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          
          <div className="flex justify-center mt-6 gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      ) : (
        <Leaderboard />
      )}
      
      <div className="mt-12 bg-black/30 border border-white/10 p-6 rounded-lg">
        <h2 className="text-xl font-bold text-white mb-4">Streak Rules</h2>
        <div className="space-y-3 text-white/80">
          <p className="flex items-start gap-2">
            <span className="text-yellow-500 font-bold">•</span>
            <span>Complete at least one workout each day to maintain your streak</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-yellow-500 font-bold">•</span>
            <span>If you miss a day, your streak will reset to 0</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-yellow-500 font-bold">•</span>
            <span>Missing a workout will also result in a deduction of 50 points</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-yellow-500 font-bold">•</span>
            <span>Streaks are visible to everyone on the leaderboard - keep yours going!</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
