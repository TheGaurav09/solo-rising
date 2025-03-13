
import React from 'react';
import AnimatedCard from './ui/AnimatedCard';
import { Flame, AlertTriangle, Calendar, Trophy } from 'lucide-react';

const StreakRules = () => {
  return (
    <AnimatedCard className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Flame className="text-orange-500" size={20} />
        <h3 className="text-lg font-bold">Streak Rules</h3>
      </div>
      
      <div className="space-y-4">
        <div className="flex gap-3 p-3 bg-white/5 rounded-lg items-start">
          <div className="bg-green-500/10 p-2 rounded-full">
            <Trophy size={18} className="text-green-500" />
          </div>
          <div>
            <p className="font-medium mb-1">Daily Streak Rewards</p>
            <p className="text-sm text-white/70">
              Complete at least one workout every day to increase your streak counter. Higher streaks show your dedication!
            </p>
          </div>
        </div>
        
        <div className="flex gap-3 p-3 bg-white/5 rounded-lg items-start">
          <div className="bg-red-500/10 p-2 rounded-full">
            <AlertTriangle size={18} className="text-red-500" />
          </div>
          <div>
            <p className="font-medium mb-1">Missing a Day</p>
            <p className="text-sm text-white/70">
              If you miss a workout for one day, your streak will reset to 0 and you'll lose 50 points.
            </p>
          </div>
        </div>
        
        <div className="flex gap-3 p-3 bg-white/5 rounded-lg items-start">
          <div className="bg-blue-500/10 p-2 rounded-full">
            <Calendar size={18} className="text-blue-500" />
          </div>
          <div>
            <p className="font-medium mb-1">Public Visibility</p>
            <p className="text-sm text-white/70">
              Your current streak is visible on leaderboards for others to see, so stay consistent to show off your dedication!
            </p>
          </div>
        </div>
      </div>
    </AnimatedCard>
  );
};

export default StreakRules;
