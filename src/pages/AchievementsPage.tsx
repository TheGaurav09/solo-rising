import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/context/UserContext';
import AnimatedCard from '@/components/ui/AnimatedCard';
import { Progress } from '@/components/ui/progress';
import { getIconComponent } from '@/lib/iconUtils';
import { Trophy, Award, EyeIcon, ShieldCheck, Zap, Star, Info } from 'lucide-react';
import AchievementDetailModal from '@/components/modals/AchievementDetailModal';
import { toast } from '@/components/ui/use-toast';
import InfoTooltip from '@/components/ui/InfoTooltip';
import CollapsibleSection from '@/components/ui/CollapsibleSection';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points_required: number;
  unlocked?: boolean;
  unlocked_at?: string;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  image_path: string;
  requirement_type: string;
  requirement_value: number;
  unlocked?: boolean;
  unlocked_at?: string;
}

const AchievementsPage = () => {
  const { character, points, streak, addPoints } = useUser();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAchievementModal, setShowAchievementModal] = useState(false);

  useEffect(() => {
    fetchAchievements();
    fetchBadges();
    checkAchievements();
  }, [points]);

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

  const fetchBadges = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      // First, get all badges (mock data for now, would be from a badges table)
      const mockBadges: Badge[] = [
        {
          id: '1',
          name: 'Workout Beginner',
          description: 'Complete 5 workouts',
          icon: 'shield',
          image_path: '/badges/beginner.png',
          requirement_type: 'workouts',
          requirement_value: 5
        },
        {
          id: '2',
          name: 'Streak Master',
          description: 'Achieve a 7-day workout streak',
          icon: 'zap',
          image_path: '/badges/streak.png',
          requirement_type: 'streak',
          requirement_value: 7
        },
        {
          id: '3',
          name: 'Point Collector',
          description: 'Earn 500 points',
          icon: 'star',
          image_path: '/badges/points.png',
          requirement_type: 'points',
          requirement_value: 500
        },
        {
          id: '4',
          name: 'Elite Warrior',
          description: 'Reach level 10',
          icon: 'award',
          image_path: '/badges/elite.png',
          requirement_type: 'level',
          requirement_value: 10
        },
        {
          id: '5',
          name: 'Dedication Award',
          description: 'Complete 30 days of workouts',
          icon: 'trophy',
          image_path: '/badges/dedication.png',
          requirement_type: 'streak',
          requirement_value: 30
        }
      ];

      // Then, get user's unlocked badges
      const { data: userBadges, error: userBadgesError } = await supabase
        .from('user_badges')
        .select('badge_id, unlocked_at')
        .eq('user_id', user.user.id);

      if (userBadgesError) {
        console.error('Error fetching user badges:', userBadgesError);
      }

      // Combine the data
      const userBadgesMap = new Map();
      userBadges?.forEach(ub => {
        userBadgesMap.set(ub.badge_id, ub.unlocked_at);
      });

      const processedBadges = mockBadges.map(badge => ({
        ...badge,
        unlocked: userBadgesMap.has(badge.id),
        unlocked_at: userBadgesMap.get(badge.id) || null
      }));

      setBadges(processedBadges);
    } catch (error) {
      console.error('Error setting up badges:', error);
    }
  };

  const checkAchievements = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      // Check for achievements that should be unlocked based on points
      const achievementsToUnlock = achievements.filter(
        a => !a.unlocked && a.points_required <= points
      );

      if (achievementsToUnlock.length > 0) {
        for (const achievement of achievementsToUnlock) {
          // Insert into user_achievements
          const { error } = await supabase
            .from('user_achievements')
            .insert({
              user_id: user.user.id,
              achievement_id: achievement.id,
            });

          if (error) {
            if (!error.message.includes('duplicate key value')) {
              console.error('Error unlocking achievement:', error);
            }
          } else {
            // Show a toast notification
            toast({
              title: 'Achievement Unlocked!',
              description: `You've unlocked: ${achievement.name}`,
              duration: 5000,
            });

            // Give bonus points for unlocking achievement
            addPoints(Math.floor(achievement.points_required * 0.05));
          }
        }

        // Refresh achievements list
        fetchAchievements();
      }

      // Check for badges that should be unlocked
      // This would need more complex logic in a real implementation
      const { data: workoutsCount } = await supabase
        .from('workouts')
        .select('id', { count: 'exact' })
        .eq('user_id', user.user.id);

      const totalWorkouts = workoutsCount?.length || 0;
      const currentLevel = Math.floor(points / 100) + 1;
      
      const badgesToUnlock = badges.filter(badge => {
        if (badge.unlocked) return false;
        
        switch (badge.requirement_type) {
          case 'workouts':
            return totalWorkouts >= badge.requirement_value;
          case 'streak':
            return streak >= badge.requirement_value;
          case 'points':
            return points >= badge.requirement_value;
          case 'level':
            return currentLevel >= badge.requirement_value;
          default:
            return false;
        }
      });

      if (badgesToUnlock.length > 0) {
        for (const badge of badgesToUnlock) {
          // Insert into user_badges
          const { error } = await supabase
            .from('user_badges')
            .insert({
              user_id: user.user.id,
              badge_id: badge.id,
            });

          if (error) {
            if (!error.message.includes('duplicate key value')) {
              console.error('Error unlocking badge:', error);
            }
          } else {
            // Show a toast notification
            toast({
              title: 'Badge Earned!',
              description: `You've earned the ${badge.name} badge!`,
              duration: 5000,
            });

            // Give bonus points for earning a badge
            addPoints(50);
          }
        }

        // Refresh badges list
        fetchBadges();
      }
      
    } catch (error) {
      console.error('Error checking achievements:', error);
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

  const openBadgeDetails = (badge: Badge) => {
    setSelectedBadge(badge);
  };

  const getBadgeIcon = (badge: Badge) => {
    switch(badge.icon) {
      case 'shield': return <ShieldCheck size={18} />;
      case 'zap': return <Zap size={18} />;
      case 'star': return <Star size={18} />;
      case 'award': return <Award size={18} />;
      case 'trophy': return <Trophy size={18} />;
      default: return <Award size={18} />;
    }
  };

  const isAchievementUnlocked = (achievementId: string) => {
    return achievements.some(a => a.id === achievementId && a.unlocked);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          Achievements
          <InfoTooltip 
            content={
              <div>
                <p className="mb-2">Complete tasks and earn points to unlock achievements and badges.</p>
                <p>Each achievement and badge gives you bonus points and special status.</p>
              </div>
            }
          />
        </h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AnimatedCard className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center">
                <Trophy className="mr-2 text-yellow-500" />
                Your Progress
                <InfoTooltip
                  content="Your progress towards the next achievement. Keep earning points to unlock more achievements!"
                  position="right"
                  width="w-64"
                />
              </h2>
            </div>
            
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
                
                <CollapsibleSection title="Achievements" defaultOpen={true}>
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
                </CollapsibleSection>
              </>
            )}
          </AnimatedCard>
          
          <AnimatedCard className="p-6 mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center">
                <ShieldCheck className="mr-2 text-blue-400" />
                Badges
                <InfoTooltip
                  content="Badges are special rewards for completing specific milestones in your workout journey."
                  position="right"
                  width="w-64"
                />
              </h2>
            </div>
            
            <CollapsibleSection title="Available Badges" defaultOpen={true}>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {badges.map((badge) => (
                  <div 
                    key={badge.id}
                    onClick={() => openBadgeDetails(badge)}
                    className={`p-4 rounded-lg cursor-pointer transition-all ${
                      badge.unlocked 
                        ? 'bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30' 
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          badge.unlocked ? 'bg-blue-500/20 text-blue-400' : 'bg-white/10 text-white/40'
                        }`}>
                          {getBadgeIcon(badge)}
                        </div>
                        <h3 className="ml-2 font-medium">
                          {badge.name}
                        </h3>
                      </div>
                      <EyeIcon size={16} className="text-white/40" />
                    </div>
                    
                    <p className="text-sm text-white/70 mb-2 line-clamp-2">
                      {badge.description}
                    </p>
                    
                    <div className="flex justify-between text-xs">
                      <span className={`${
                        badge.unlocked ? 'text-blue-400' : 'text-white/40'
                      }`}>
                        {badge.unlocked ? 'Earned' : 'Not Earned'} 
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
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
                
                {badges
                  .filter(b => b.unlocked)
                  .sort((a, b) => new Date(b.unlocked_at || 0).getTime() - new Date(a.unlocked_at || 0).getTime())
                  .slice(0, 3)
                  .map((badge) => (
                    <div 
                      key={badge.id}
                      onClick={() => openBadgeDetails(badge)}
                      className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 cursor-pointer hover:bg-blue-500/20 transition-colors"
                    >
                      <div className="flex items-center mb-1">
                        <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mr-2">
                          {getBadgeIcon({...badge, icon: badge.icon})}
                        </div>
                        <h3 className="font-medium text-sm">
                          {badge.name}
                        </h3>
                      </div>
                      
                      <p className="text-xs text-white/70 mb-1">
                        {badge.description}
                      </p>
                      
                      {badge.unlocked_at && (
                        <div className="text-xs text-white/40 text-right">
                          {new Date(badge.unlocked_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))}
                
                {achievements.filter(a => a.unlocked).length === 0 && badges.filter(b => b.unlocked).length === 0 && (
                  <div className="text-center py-8 text-white/50">
                    <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No achievements or badges unlocked yet</p>
                    <p className="text-sm mt-2">Keep training to unlock achievements!</p>
                  </div>
                )}
              </div>
            )}
          </AnimatedCard>
          
          <AnimatedCard className="p-6 mt-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Zap className="mr-2 text-orange-400" />
              Workout Streak
              <InfoTooltip
                content={
                  <div>
                    <p>Your current workout streak shows how many consecutive days you've worked out.</p>
                    <p className="mt-2">Complete a workout each day to maintain your streak. If you miss a day, your streak will reset to zero.</p>
                  </div>
                }
                position="right"
              />
            </h2>
            
            <div className="text-center py-4">
              <div className="text-4xl font-bold mb-2">{streak}</div>
              <p className="text-white/70">days</p>
            </div>
            
            <div className="bg-white/5 rounded-lg p-4 mt-4">
              <p className="text-sm text-white/70">
                Maintain your streak by working out daily! You'll earn bonus points and special badges for consistent training.
              </p>
            </div>
          </AnimatedCard>
        </div>
      </div>

      {selectedAchievement && (
        <AchievementDetailModal
          achievement={selectedAchievement}
          unlocked={isAchievementUnlocked(selectedAchievement.id)}
          onClose={() => setShowAchievementModal(false)}
        />
      )}
      
      {selectedBadge && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-black/80 border border-white/10 rounded-lg p-6 max-w-md w-full backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">{selectedBadge.name}</h3>
              <button 
                onClick={() => setSelectedBadge(null)}
                className="p-1 rounded-full bg-white/10 hover:bg-white/20"
              >
                <EyeIcon size={18} />
              </button>
            </div>
            
            <div className="flex justify-center my-6">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
                selectedBadge.unlocked ? 'bg-blue-500/20' : 'bg-white/10'
              }`}>
                {getBadgeIcon({...selectedBadge, icon: selectedBadge.icon})}
              </div>
            </div>
            
            <p className="mb-4 text-white/80">{selectedBadge.description}</p>
            
            <div className="bg-white/5 rounded p-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Status:</span>
                <span className={`font-medium ${selectedBadge.unlocked ? 'text-blue-400' : 'text-white/60'}`}>
                  {selectedBadge.unlocked ? 'Earned' : 'Not Earned Yet'}
                </span>
              </div>
              
              {selectedBadge.unlocked && selectedBadge.unlocked_at && (
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-white/60">Earned on:</span>
                  <span className="font-medium">
                    {new Date(selectedBadge.unlocked_at).toLocaleDateString()}
                  </span>
                </div>
              )}
              
              {!selectedBadge.unlocked && (
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-white/60">Requirement:</span>
                  <span className="font-medium">
                    {selectedBadge.requirement_type === 'workouts' && `Complete ${selectedBadge.requirement_value} workouts`}
                    {selectedBadge.requirement_type === 'streak' && `${selectedBadge.requirement_value}-day streak`}
                    {selectedBadge.requirement_type === 'points' && `Earn ${selectedBadge.requirement_value} points`}
                    {selectedBadge.requirement_type === 'level' && `Reach level ${selectedBadge.requirement_value}`}
                  </span>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setSelectedBadge(null)}
              className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AchievementsPage;
