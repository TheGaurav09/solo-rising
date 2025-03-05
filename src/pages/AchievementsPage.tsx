
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/context/UserContext';
import AnimatedCard from '@/components/ui/AnimatedCard';
import { Progress } from '@/components/ui/progress';
import { getIconComponent } from '@/lib/iconUtils';
import { Trophy, Award, EyeIcon } from 'lucide-react';
import AchievementDetailModal from '@/components/modals/AchievementDetailModal';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points_required: number;
  unlocked?: boolean;
  unlocked_at?: string;
}

const AchievementsPage = () => {
  const { character, points } = useUser();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    setLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      // First, get all achievements
      const { data: allAchievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .order('points_required', { ascending: true });

      if (achievementsError) throw achievementsError;

      // Then, get user's unlocked achievements
      const { data: userAchievements, error: userAchievementsError } = await supabase
        .from('user_achievements')
        .select('achievement_id, unlocked_at')
        .eq('user_id', user.user.id);

      if (userAchievementsError) throw userAchievementsError;

      // Combine the data
      const userAchievementsMap = new Map();
      userAchievements?.forEach(ua => {
        userAchievementsMap.set(ua.achievement_id, ua.unlocked_at);
      });

      const processedAchievements = allAchievements?.map(achievement => ({
        ...achievement,
        unlocked: userAchievementsMap.has(achievement.id),
        unlocked_at: userAchievementsMap.get(achievement.id) || null
      }));

      setAchievements(processedAchievements || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const progressToNextAchievement = (currentPoints: number, achievements: Achievement[]) => {
    // Filter out already unlocked achievements
    const lockedAchievements = achievements.filter(a => !a.unlocked);
    
    if (lockedAchievements.length === 0) return 100; // All achievements unlocked
    
    // Find the next achievement to unlock
    const nextAchievement = lockedAchievements.reduce((closest, current) => {
      return (!closest || current.points_required < closest.points_required) ? current : closest;
    }, null as Achievement | null);
    
    if (!nextAchievement) return 0;
    
    // Find the previous achievement that was unlocked
    const unlockedAchievements = achievements.filter(a => a.unlocked);
    const previousAchievement = unlockedAchievements.length > 0 
      ? unlockedAchievements.reduce((highest, current) => {
          return (!highest || current.points_required > highest.points_required) ? current : highest;
        }, null as Achievement | null)
      : null;
    
    const basePoints = previousAchievement ? previousAchievement.points_required : 0;
    const targetPoints = nextAchievement.points_required;
    const pointsRange = targetPoints - basePoints;
    const userProgress = currentPoints - basePoints;
    
    if (pointsRange <= 0) return 0;
    
    const progressPercentage = Math.min(100, Math.max(0, (userProgress / pointsRange) * 100));
    return progressPercentage;
  };

  const getNextAchievement = (currentPoints: number, achievements: Achievement[]) => {
    const lockedAchievements = achievements.filter(a => !a.unlocked);
    if (lockedAchievements.length === 0) return null;
    
    return lockedAchievements.reduce((closest, current) => {
      if (!closest) return current;
      if (current.points_required < closest.points_required && current.points_required > currentPoints) {
        return current;
      }
      return closest;
    }, null as Achievement | null);
  };

  const getProgressText = () => {
    const nextAchievement = getNextAchievement(points, achievements);
    if (!nextAchievement) return "All achievements unlocked!";
    
    const pointsNeeded = nextAchievement.points_required - points;
    return `${pointsNeeded} points until "${nextAchievement.name}"`;
  };

  const openAchievementDetails = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Achievements</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AnimatedCard className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Trophy className="mr-2 text-yellow-500" />
              Your Progress
            </h2>
            
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2 text-sm">
                    <span className="text-white/70">Current Points: {points}</span>
                    <span className="text-white/70">{getProgressText()}</span>
                  </div>
                  <Progress 
                    value={progressToNextAchievement(points, achievements)} 
                    className={`h-2 ${character ? `bg-${character}-primary/20` : 'bg-primary/20'}`}
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {achievements.map((achievement) => (
                    <div 
                      key={achievement.id}
                      onClick={() => openAchievementDetails(achievement)}
                      className={`p-4 rounded-lg cursor-pointer transition-all ${
                        achievement.unlocked 
                          ? 'bg-green-500/20 border border-green-500/30 hover:bg-green-500/30' 
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            achievement.unlocked ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/40'
                          }`}>
                            {getIconComponent(achievement.icon)}
                          </div>
                          <h3 className="ml-2 font-medium">
                            {achievement.name}
                          </h3>
                        </div>
                        <EyeIcon size={16} className="text-white/40" />
                      </div>
                      
                      <p className="text-sm text-white/70 mb-2 line-clamp-2">
                        {achievement.description}
                      </p>
                      
                      <div className="flex justify-between text-xs">
                        <span className={`${
                          achievement.unlocked ? 'text-green-400' : 'text-white/40'
                        }`}>
                          {achievement.unlocked ? 'Unlocked' : 'Locked'} 
                        </span>
                        <span className="text-white/40">
                          {achievement.points_required} points
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </AnimatedCard>
        </div>
        
        <div>
          <AnimatedCard className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Award className="mr-2 text-yellow-500" />
              Latest Unlocks
            </h2>
            
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {achievements
                  .filter(a => a.unlocked)
                  .sort((a, b) => new Date(b.unlocked_at || 0).getTime() - new Date(a.unlocked_at || 0).getTime())
                  .slice(0, 5)
                  .map((achievement) => (
                    <div 
                      key={achievement.id}
                      onClick={() => openAchievementDetails(achievement)}
                      className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 cursor-pointer hover:bg-green-500/20 transition-colors"
                    >
                      <div className="flex items-center mb-1">
                        <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mr-2">
                          {getIconComponent(achievement.icon, 14)}
                        </div>
                        <h3 className="font-medium text-sm">
                          {achievement.name}
                        </h3>
                      </div>
                      
                      <p className="text-xs text-white/70 mb-1">
                        {achievement.description}
                      </p>
                      
                      <div className="flex justify-between text-xs text-white/40">
                        <span>{achievement.points_required} points</span>
                        {achievement.unlocked_at && (
                          <span>
                            {new Date(achievement.unlocked_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                
                {achievements.filter(a => a.unlocked).length === 0 && (
                  <div className="text-center py-8 text-white/50">
                    <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No achievements unlocked yet</p>
                    <p className="text-sm mt-2">Keep training to unlock achievements!</p>
                  </div>
                )}
              </div>
            )}
          </AnimatedCard>
        </div>
      </div>

      {selectedAchievement && (
        <AchievementDetailModal
          achievement={selectedAchievement}
          onClose={() => setSelectedAchievement(null)}
        />
      )}
    </div>
  );
};

export default AchievementsPage;
