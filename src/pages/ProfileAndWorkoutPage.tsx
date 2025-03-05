
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/context/UserContext';
import AnimatedCard from '@/components/ui/AnimatedCard';
import AnimatedButton from '@/components/ui/AnimatedButton';
import { User, Award, TrendingUp, Users, Dumbbell, Timer, Repeat, CheckCircle2, History, Calendar, ChevronDown, ChevronUp, Info, Flame, Globe, MapPin, CheckCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { format, differenceInMinutes } from 'date-fns';
import WorkoutConfirmModal from '@/components/modals/WorkoutConfirmModal';
import { useParams, Link } from 'react-router-dom';
import InfoTooltip from '@/components/ui/InfoTooltip';
import CollapsibleSection from '@/components/ui/CollapsibleSection';

const ProfileAndWorkoutPage = () => {
  const { character, userName, addPoints, streak, lastWorkoutDate, country } = useUser();
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [duration, setDuration] = useState(30);
  const [reps, setReps] = useState(10);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [workoutHistory, setWorkoutHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showAllExercises, setShowAllExercises] = useState(false);
  const [lastWorkoutTime, setLastWorkoutTime] = useState<Date | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  const [cooldownInterval, setCooldownInterval] = useState<NodeJS.Timeout | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const { userId } = useParams<{ userId: string }>();
  const [isOwnProfile, setIsOwnProfile] = useState(true);

  useEffect(() => {
    fetchData();
    return () => {
      if (cooldownInterval) clearInterval(cooldownInterval);
    };
  }, []);

  const updateCooldownTime = () => {
    if (!lastWorkoutTime) return;
    
    const now = new Date();
    const diffInMinutes = differenceInMinutes(now, lastWorkoutTime);
    const remaining = Math.max(0, 30 - diffInMinutes);
    
    setCooldownRemaining(remaining);
    
    if (remaining === 0 && cooldownInterval) {
      clearInterval(cooldownInterval);
      setCooldownInterval(null);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        setLoading(false);
        return;
      }

      let targetUserId = currentUser.user.id;
      
      // First, get user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', targetUserId)
        .maybeSingle();

      if (userError) {
        console.error("User data fetch error:", userError);
        toast({
          title: 'Error',
          description: 'Failed to load user data',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }
      
      if (!userData) {
        console.error("No user data found");
        toast({
          title: 'Error',
          description: 'User not found',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }
      
      setUserData(userData);

      // Fetch workouts
      const { data: workoutsData, error: workoutsError } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false });

      if (workoutsError) {
        console.error("Workouts fetch error:", workoutsError);
      } else {
        setWorkouts(workoutsData || []);
        setWorkoutHistory(workoutsData || []);
        
        // Check cooldown from the last workout
        if (workoutsData && workoutsData.length > 0) {
          const lastWorkout = new Date(workoutsData[0].created_at);
          setLastWorkoutTime(lastWorkout);
          
          const now = new Date();
          const diffInMinutes = differenceInMinutes(now, lastWorkout);
          
          if (diffInMinutes < 30) {
            setCooldownRemaining(30 - diffInMinutes);
            
            // Set up interval to update the cooldown remaining time
            const interval = setInterval(updateCooldownTime, 60000); // Update every minute
            setCooldownInterval(interval);
          }
        }
      }

      // Fetch achievements
      const { data: userAchievements, error: achievementsError } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievements:achievement_id(*)
        `)
        .eq('user_id', targetUserId);

      if (achievementsError) {
        console.error("Achievements fetch error:", achievementsError);
      } else {
        setAchievements(userAchievements || []);
      }
      
      setIsLoadingHistory(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const exercises = [
    { id: 'pushups', name: 'Push-ups', points: 10, icon: <Dumbbell size={18} /> },
    { id: 'situps', name: 'Sit-ups', points: 8, icon: <Dumbbell size={18} /> },
    { id: 'squats', name: 'Squats', points: 12, icon: <Dumbbell size={18} /> },
    { id: 'running', name: 'Running', points: 15, icon: <Timer size={18} /> },
    { id: 'pullups', name: 'Pull-ups', points: 20, icon: <Repeat size={18} /> },
    { id: 'cycling', name: 'Cycling', points: 18, icon: <Timer size={18} /> },
    { id: 'jumping_jacks', name: 'Jumping Jacks', points: 8, icon: <Dumbbell size={18} /> },
    { id: 'burpees', name: 'Burpees', points: 22, icon: <Dumbbell size={18} /> },
    { id: 'planks', name: 'Planks', points: 16, icon: <Timer size={18} /> },
    { id: 'lunges', name: 'Lunges', points: 14, icon: <Dumbbell size={18} /> },
    { id: 'mountain_climbers', name: 'Mountain Climbers', points: 18, icon: <Dumbbell size={18} /> },
    { id: 'deadlifts', name: 'Deadlifts', points: 25, icon: <Dumbbell size={18} /> },
  ];

  const visibleExercises = showAllExercises ? exercises : exercises.slice(0, 6);

  const getSelectedExercise = () => {
    return exercises.find(ex => ex.id === selectedExercise);
  };

  const calculatePoints = () => {
    const exercise = getSelectedExercise();
    if (!exercise) return 0;
    
    let totalPoints = exercise.points;
    totalPoints += Math.floor(duration / 5);
    totalPoints += Math.floor(reps / 5);
    
    return totalPoints;
  };

  const handleSubmitWorkout = () => {
    if (!selectedExercise) return;
    
    if (cooldownRemaining > 0) {
      toast({
        title: 'Workout Cooldown',
        description: `Please wait ${cooldownRemaining} minute${cooldownRemaining > 1 ? 's' : ''} before adding another workout.`,
        variant: 'destructive',
      });
      return;
    }
    
    setShowConfirmModal(true);
  };

  const handleAddWorkout = async () => {
    if (!selectedExercise) return;
    
    if (cooldownRemaining > 0) {
      toast({
        title: 'Workout Cooldown',
        description: `Please wait ${cooldownRemaining} minute${cooldownRemaining > 1 ? 's' : ''} before adding another workout.`,
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);
    
    const pointsEarned = calculatePoints();
    const exercise = getSelectedExercise();
    
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const lastWorkoutDay = lastWorkoutDate ? new Date(lastWorkoutDate) : null;
      
      if (lastWorkoutDay) {
        lastWorkoutDay.setHours(0, 0, 0, 0);
      }
      
      let newStreak = streak;
      const isNewDay = !lastWorkoutDay || today.getTime() > lastWorkoutDay.getTime();
      
      if (isNewDay) {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (!lastWorkoutDay || 
            lastWorkoutDay.getTime() === yesterday.getTime()) {
          newStreak = streak + 1;
        } else if (lastWorkoutDay.getTime() < yesterday.getTime()) {
          newStreak = 1;
        }
      }

      const { data, error } = await supabase
        .from('workouts')
        .insert([
          {
            user_id: user.user.id,
            exercise_type: exercise?.name || selectedExercise,
            duration,
            reps,
            points: pointsEarned
          }
        ]);

      if (error) throw error;
      
      // Set cooldown
      const now = new Date();
      setLastWorkoutTime(now);
      setCooldownRemaining(30);
      
      // Start cooldown timer
      if (cooldownInterval) clearInterval(cooldownInterval);
      const interval = setInterval(updateCooldownTime, 60000); // Update every minute
      setCooldownInterval(interval);
      
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('points')
        .eq('id', user.user.id)
        .single();
      
      if (userError) throw userError;
      
      const totalPoints = (userData?.points || 0) + pointsEarned;
      
      const { data: achievementsData, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .lte('points_required', totalPoints)
        .order('points_required', { ascending: false });
      
      if (achievementsError) throw achievementsError;
      
      if (achievementsData && achievementsData.length > 0) {
        const { data: userAchievements, error: userAchievementsError } = await supabase
          .from('user_achievements')
          .select('achievement_id')
          .eq('user_id', user.user.id);
          
        if (userAchievementsError) throw userAchievementsError;
        
        const userAchievementIds = userAchievements?.map(ua => ua.achievement_id) || [];
        const newAchievements = achievementsData.filter(a => !userAchievementIds.includes(a.id));
        
        if (newAchievements.length > 0) {
          const achievementsToInsert = newAchievements.map(achievement => ({
            user_id: user.user.id,
            achievement_id: achievement.id
          }));
          
          const { error: insertError } = await supabase
            .from('user_achievements')
            .insert(achievementsToInsert);
            
          if (insertError) throw insertError;
          
          newAchievements.forEach(achievement => {
            toast({
              title: 'New Achievement Unlocked!',
              description: `${achievement.name}: ${achievement.description}`,
              duration: 5000,
            });
          });
        }
      }
      
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({ 
          streak: newStreak,
          last_workout_date: new Date().toISOString(),
          last_workout_time: new Date().toISOString(),
          points: totalPoints
        } as any) // Type assertion for last_workout_time
        .eq('id', user.user.id);
      
      if (userUpdateError) throw userUpdateError;
      
      addPoints(pointsEarned);
      
      toast({
        title: 'Workout Added',
        description: `You earned ${pointsEarned} points for this workout!`,
        duration: 3000,
      });
      
      setSuccess(true);
      
      fetchData();
      
      setTimeout(() => {
        setSuccess(false);
        setSelectedExercise(null);
        setDuration(30);
        setReps(10);
      }, 2000);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add workout',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getLevel = (userPoints: number) => {
    return Math.floor(userPoints / 100) + 1;
  };

  const getProgressPercentage = (userPoints: number) => {
    const level = getLevel(userPoints);
    const previousLevelPoints = (level - 1) * 100;
    const currentLevelPoints = userPoints - previousLevelPoints;
    return (currentLevelPoints / 100) * 100;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Section */}
      <AnimatedCard className="p-6 mb-8">
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center overflow-hidden ${character ? `bg-${character}-primary/30` : 'bg-primary/30'}`}>
            {userData?.warrior_name ? (
              <span className={`text-2xl font-bold ${
                character === 'goku' ? 'text-goku-primary' :
                character === 'saitama' ? 'text-saitama-primary' :
                character === 'jin-woo' ? 'text-jin-woo-primary' :
                'text-white'
              }`}>
                {userData.warrior_name.charAt(0).toUpperCase()}
              </span>
            ) : (
              <User className="text-primary" size={28} />
            )}
          </div>
          
          <div className="flex-1">
            <h2 className={`text-xl font-bold ${character ? `text-${character}-primary` : 'text-white'}`}>
              {userData?.warrior_name}
            </h2>
            <p className="text-white/70">{character === 'goku' ? 'Saiyan Warrior' : 
              character === 'saitama' ? 'Caped Baldy' : 
              character === 'jin-woo' ? 'Shadow Monarch' : 'Warrior'}</p>
            <div className="flex items-center gap-2 text-white/70 text-sm mt-1">
              <MapPin size={14} />
              <span>{country || 'Global'}</span>
            </div>
          </div>
          
          <div className="text-right flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <div>
                <div className="text-lg font-bold">{userData?.points || 0}</div>
                <div className="text-sm text-white/70">total points</div>
              </div>
            </div>
            
            <div className={`flex items-center gap-1 px-3 py-1 rounded-lg 
              ${character ? `bg-${character}-primary/20` : 'bg-primary/20'}`}
            >
              <Flame size={16} className={`
                ${character ? `text-${character}-primary` : 'text-primary'} 
                ${streak > 0 ? 'animate-pulse' : ''}`} 
              />
              <span className="font-medium">{streak || 0} day streak</span>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2">
            <span>Level {getLevel(userData?.points || 0)}</span>
            <span>{userData?.points || 0} / {(getLevel(userData?.points || 0)) * 100} points</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className={`h-full ${character ? `bg-${character}-primary` : 'bg-primary'}`}
              style={{ width: `${getProgressPercentage(userData?.points || 0)}%` }}
            ></div>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-3 gap-4 text-center">
          <div className="bg-white/5 p-3 rounded-lg border border-white/10">
            <div className="text-2xl font-bold">{workoutHistory.length}</div>
            <div className="text-sm text-white/70">Total Workouts</div>
          </div>
          
          <div className="bg-white/5 p-3 rounded-lg border border-white/10">
            <div className="text-2xl font-bold">{streak || 0}</div>
            <div className="text-sm text-white/70">Day Streak</div>
          </div>
          
          <div className="bg-white/5 p-3 rounded-lg border border-white/10">
            <div className="text-2xl font-bold">{achievements.length}</div>
            <div className="text-sm text-white/70">Achievements</div>
          </div>
        </div>
      </AnimatedCard>
      
      {/* Workout Section */}
      <h2 className="text-2xl font-bold mb-6">Workout Center</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <AnimatedCard className="p-6">
            <h3 className="text-xl font-bold mb-4">Add Workout</h3>
            
            {success ? (
              <div className="text-center py-8 animate-fade-in">
                <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-500" />
                <p className="text-lg font-medium mb-2">Workout Added Successfully!</p>
                <p className="text-white/70">
                  You earned {calculatePoints()} points
                </p>
              </div>
            ) : (
              <>
                {cooldownRemaining > 0 && (
                  <div className="mb-4 p-3 rounded-lg bg-white/10 border border-white/20">
                    <p className="text-center">
                      Cooldown: Wait <span className="font-bold">{cooldownRemaining} minute{cooldownRemaining > 1 ? 's' : ''}</span> before adding another workout
                    </p>
                  </div>
                )}
                
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-white/80">
                      Exercise Type
                    </label>
                    <button 
                      onClick={() => setShowAllExercises(!showAllExercises)}
                      className="text-sm flex items-center gap-1 text-white/60 hover:text-white"
                    >
                      {showAllExercises ? (
                        <>Show Less <ChevronUp size={14} /></>
                      ) : (
                        <>Show All <ChevronDown size={14} /></>
                      )}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {visibleExercises.map((exercise) => (
                      <div
                        key={exercise.id}
                        onClick={() => setSelectedExercise(exercise.id)}
                        className={`px-3 py-2 rounded-lg flex items-center gap-2 cursor-pointer transition-colors ${
                          selectedExercise === exercise.id
                            ? character 
                              ? `bg-${character}-primary/20 border-${character}-primary/40 border` 
                              : 'bg-primary/20 border-primary/40 border'
                            : 'bg-white/5 border border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {exercise.icon}
                        <span className="text-sm">{exercise.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2 text-white/80">
                    Duration (minutes)
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="120"
                    step="5"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between mt-1 text-sm text-white/60">
                    <span>5</span>
                    <span className="font-medium text-white">{duration}</span>
                    <span>120</span>
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2 text-white/80">
                    Reps / Intensity
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={reps}
                    onChange={(e) => setReps(parseInt(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between mt-1 text-sm text-white/60">
                    <span>5</span>
                    <span className="font-medium text-white">{reps}</span>
                    <span>100</span>
                  </div>
                </div>
                
                <div className="mb-6 p-4 rounded-lg bg-white/5 border border-white/10">
                  <h3 className="text-sm font-medium mb-2">Workout Summary</h3>
                  <div className="flex justify-between text-white/70 text-sm">
                    <span>Exercise:</span>
                    <span className="font-medium text-white">
                      {getSelectedExercise()?.name || 'Not selected'}
                    </span>
                  </div>
                  <div className="flex justify-between text-white/70 text-sm">
                    <span>Duration:</span>
                    <span className="font-medium text-white">{duration} minutes</span>
                  </div>
                  <div className="flex justify-between text-white/70 text-sm">
                    <span>Reps/Intensity:</span>
                    <span className="font-medium text-white">{reps}</span>
                  </div>
                  <div className="flex justify-between text-white/70 text-sm mt-2 pt-2 border-t border-white/10">
                    <span>Points to earn:</span>
                    <span className="font-medium text-white">{calculatePoints()}</span>
                  </div>
                </div>
                
                <AnimatedButton
                  onClick={handleSubmitWorkout}
                  disabled={!selectedExercise || loading || cooldownRemaining > 0}
                  character={character || undefined}
                  className="w-full"
                >
                  {loading ? 'Adding...' : cooldownRemaining > 0 ? `Cooldown (${cooldownRemaining}m)` : 'Add Workout'}
                </AnimatedButton>
              </>
            )}
          </AnimatedCard>
        </div>
        
        <div>
          <AnimatedCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Workout History</h3>
              <History size={20} className="text-white/60" />
            </div>
            
            {isLoadingHistory ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
              </div>
            ) : workoutHistory.length === 0 ? (
              <div className="text-center py-12 text-white/60">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No workout history yet</p>
                <p className="text-sm mt-2">Start adding workouts to see your progress!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {workoutHistory.map((workout, index) => (
                  <div key={index} className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="flex justify-between mb-2">
                      <div className="font-medium">{workout.exercise_type}</div>
                      <div className={`px-2 py-0.5 text-xs rounded-full ${character ? `bg-${character}-primary/20 text-${character}-primary` : 'bg-primary/20 text-primary'}`}>
                        +{workout.points} points
                      </div>
                    </div>
                    <div className="flex justify-between text-sm text-white/60">
                      <div>{workout.duration} min • {workout.reps} reps</div>
                      <div>{format(new Date(workout.created_at), 'MMM d, yyyy')}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AnimatedCard>
        </div>
      </div>

      {showConfirmModal && selectedExercise && (
        <WorkoutConfirmModal
          exerciseName={getSelectedExercise()?.name || selectedExercise}
          reps={reps}
          duration={duration}
          onConfirm={() => {
            setShowConfirmModal(false);
            handleAddWorkout();
          }}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}
    </div>
  );
};

export default ProfileAndWorkoutPage;
