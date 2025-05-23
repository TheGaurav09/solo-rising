import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import AnimatedCard from '@/components/ui/AnimatedCard';
import AnimatedButton from '@/components/ui/AnimatedButton';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Timer, Dumbbell, History, Clock, Award, ChevronDown, ChevronUp, Music, Pause, Play, Check, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Footer from '@/components/ui/Footer';
import WorkoutLogger from '@/components/WorkoutLogger';
import { getTrainingScheduleForCharacter, TrainingDay } from '@/data/trainingSchedules';
import { useAudio } from '@/context/AudioContext';

const ProfileAndWorkoutPage = () => {
  const { id } = useParams();
  const { userName, character, points, streak, coins, level, xp, userId } = useUser();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [profileRank, setProfileRank] = useState<number | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [weeklySchedule, setWeeklySchedule] = useState(getTrainingScheduleForCharacter(character));
  const { isPlaying, togglePlay } = useAudio();

  const characterImages: Record<string, string> = {
    'goku': 'https://avatars.akamai.steamstatic.com/fef49e7fa7e1997a76c7d1039373b5a62359ca63_full.jpg',
    'saitama': 'https://i.pinimg.com/736x/3e/3c/95/3e3c959d20414905a3863f8c1895a958.jpg',
    'jin-woo': 'https://pbs.twimg.com/media/F8ipR0kWwAAjqoz.jpg'
  };

  const getCharacterColor = () => {
    const char = profileData?.character_type || character;
    switch (char) {
      case 'goku': return 'bg-goku-primary/20 text-goku-primary';
      case 'saitama': return 'bg-saitama-primary/20 text-saitama-primary';
      case 'jin-woo': return 'bg-jin-woo-primary/20 text-jin-woo-primary';
      default: return 'bg-primary/20 text-primary';
    }
  };

  const calculateLevelProgress = () => {
    const currentLevel = profileData ? profileData.level : level;
    const currentXp = profileData ? profileData.xp : xp;
    
    const xpForCurrentLevel = currentLevel * 100;
    const xpForNextLevel = (currentLevel + 1) * 100;
    const xpInCurrentLevel = currentXp - xpForCurrentLevel;
    const xpRequiredForNextLevel = xpForNextLevel - xpForCurrentLevel;
    const progress = (xpInCurrentLevel / xpRequiredForNextLevel) * 100;
    return Math.max(0, Math.min(100, progress));
  };

  useEffect(() => {
    const checkIsOwnProfile = () => {
      const profileId = id || userId;
      setIsOwnProfile(profileId === userId);
    };
    
    checkIsOwnProfile();
  }, [id, userId]);

  useEffect(() => {
    if (isOwnProfile) {
      setWeeklySchedule(getTrainingScheduleForCharacter(character));
      loadSavedSchedule();
    }
  }, [character, isOwnProfile]);

  useEffect(() => {
    const fetchProfileData = async () => {
      const profileId = id || userId;
      
      if (!profileId) return;
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', profileId)
        .single();

      if (error) {
        console.error("Error fetching profile data:", error);
        toast({
          title: "Error",
          description: "Could not fetch profile data",
          variant: "destructive",
        });
        return;
      }

      setProfileData(data);
      
      if (data.character_type && !isOwnProfile) {
        setWeeklySchedule(getTrainingScheduleForCharacter(data.character_type));
      }
    };

    fetchProfileData();
  }, [id, userId, isOwnProfile]);

  const getDayNumber = (dayName: string) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days.indexOf(dayName);
  };

  const toggleDayCompletion = async (dayId: string) => {
    if (!isOwnProfile) return;
    
    try {
      const updatedSchedule = weeklySchedule.map(day => {
        if (day.id === dayId) {
          return { ...day, completed: !day.completed };
        }
        return day;
      });
      
      setWeeklySchedule(updatedSchedule);
      
      const day = updatedSchedule.find(d => d.id === dayId);
      if (day) {
        const dayNumber = getDayNumber(day.day);
        const date = new Date();
        date.setDate(date.getDate() - date.getDay() + dayNumber);
        
        const { data: existingTasks } = await supabase
          .from('scheduled_tasks')
          .select('*')
          .eq('user_id', userId)
          .eq('task', day.workout)
          .eq('scheduled_for', date.toISOString().split('T')[0]);
          
        if (existingTasks && existingTasks.length > 0) {
          await supabase
            .from('scheduled_tasks')
            .update({ completed: day.completed })
            .eq('id', existingTasks[0].id);
        } else {
          await supabase
            .from('scheduled_tasks')
            .insert({
              user_id: userId,
              task: day.workout,
              scheduled_for: date.toISOString().split('T')[0],
              completed: day.completed
            });
        }
      }
    } catch (err) {
      console.error("Error toggling completion:", err);
      toast({
        title: "Error",
        description: "Failed to update training schedule",
        variant: "destructive",
      });
    }
  };

  const loadSavedSchedule = async () => {
    try {
      if (!isOwnProfile) return;
      
      const { data, error } = await supabase
        .from('scheduled_tasks')
        .select('*')
        .eq('user_id', userId);
        
      if (error) {
        console.error("Error loading training schedule:", error);
        return;
      }
      
      if (data && data.length > 0) {
        const updatedSchedule = weeklySchedule.map(day => {
          const savedTask = data.find(task => 
            task.task === day.workout && 
            task.scheduled_for && new Date(task.scheduled_for).getDay() === getDayNumber(day.day)
          );
          
          if (savedTask) {
            return { ...day, completed: savedTask.completed };
          }
          return day;
        });
        
        setWeeklySchedule(updatedSchedule);
      }
    } catch (err) {
      console.error("Error in loadSavedSchedule:", err);
    }
  };

  const fetchWorkoutHistory = async () => {
    try {
      const targetId = id || userId;
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', targetId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching workout history:", error);
        return;
      }

      setWorkoutHistory(data || []);
    } catch (error) {
      console.error("Error in fetchWorkoutHistory:", error);
    }
  };

  useEffect(() => {
    fetchWorkoutHistory();
  }, [id, userId]);

  const visibleHistory = showAllHistory ? workoutHistory : workoutHistory.slice(0, 5);

  return (
    <div className="container mx-auto px-4 py-8 pt-16 md:pt-8">
      <h1 className="text-2xl font-bold mb-6">Profile & Workout</h1>
      
      {isOwnProfile && (
        <div className="mb-4 flex justify-end">
          <button 
            onClick={togglePlay}
            className="flex items-center gap-2 bg-black/30 hover:bg-black/50 px-3 py-2 rounded-lg transition-colors"
          >
            {isPlaying ? (
              <>
                <Pause size={16} />
                <span className="text-sm">Pause Music</span>
              </>
            ) : (
              <>
                <Play size={16} />
                <span className="text-sm">Play Music</span>
              </>
            )}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AnimatedCard className="p-6 col-span-1 h-auto">
          <div className="flex flex-col items-center">
            <Avatar className={`w-24 h-24 border-4 ${getCharacterColor()} mb-4`}>
              <AvatarImage 
                src={characterImages[profileData?.character_type || character || '']} 
                alt={profileData?.character_type || character || ''} 
              />
              <AvatarFallback>
                {(profileData?.character_type || character || '').slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <h2 className="text-xl font-bold">{profileData?.warrior_name || userName}</h2>
            <p className="text-sm opacity-70">
              {profileData?.character_type === 'goku' ? 'Saiyan Warrior' :
               profileData?.character_type === 'saitama' ? 'Caped Baldy' :
               profileData?.character_type === 'jin-woo' ? 'Shadow Monarch' : 'Warrior'}
            </p>
            
            {profileRank && (
              <div className="mt-2 px-3 py-1 bg-white/10 rounded-full text-sm">
                Rank #{profileRank}
              </div>
            )}
            
            <div className="w-full mt-4">
              <div className="flex justify-between items-center mb-1">
                <p className="text-sm font-medium">Level {profileData?.level || level}</p>
                <p className="text-sm">{profileData?.xp || xp} / {((profileData?.level || level) + 1) * 100} XP</p>
              </div>
              <Progress value={calculateLevelProgress()} className="h-2" />
            </div>
            
            <div className="flex justify-between w-full mt-4">
              <div className="text-center">
                <p className="text-lg font-bold">{profileData?.points || points}</p>
                <p className="text-xs opacity-70">Total Points</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold">{profileData?.streak || streak}</p>
                <p className="text-xs opacity-70">Streak</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold">{isOwnProfile ? coins : '***'}</p>
                <p className="text-xs opacity-70">Coins</p>
              </div>
            </div>
          </div>
        </AnimatedCard>

        {isOwnProfile ? (
          <AnimatedCard className="p-6 col-span-1 lg:col-span-2 h-auto">
            <WorkoutLogger refreshWorkouts={fetchWorkoutHistory} />
          </AnimatedCard>
        ) : null}

        <AnimatedCard className="p-6 col-span-1 h-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <History size={20} />
              Workout History
            </h2>
            <button 
              onClick={() => setShowAllHistory(!showAllHistory)}
              className="text-sm flex items-center gap-1 text-white/60 hover:text-white"
            >
              {showAllHistory ? (
                <>Show Less <ChevronUp size={14} /></>
              ) : (
                <>Show All <ChevronDown size={14} /></>
              )}
            </button>
          </div>
          
          {workoutHistory && workoutHistory.length > 0 ? (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {visibleHistory.map((workout: any) => (
                <div key={workout.id} className="border border-white/10 rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{workout.exercise_type || 'Workout'}</h3>
                      <p className="text-xs opacity-70">
                        {new Date(workout.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{workout.points} pts</p>
                      <div className="flex items-center text-xs opacity-70 justify-end">
                        <Clock size={12} className="mr-1" />
                        {workout.duration} min
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center opacity-70 py-6">No workouts logged yet.</p>
          )}
        </AnimatedCard>

        <AnimatedCard className="p-6 col-span-1 h-auto">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <CalendarIcon size={20} />
            Training Schedule
          </h2>
          
          <div className="space-y-2">
            {weeklySchedule.map((day) => (
              <div 
                key={day.id} 
                className={`border border-white/10 rounded-lg p-3 flex justify-between items-center ${
                  day.completed ? 'bg-green-950/20 border-green-800/30' : ''
                }`}
              >
                <div>
                  <h3 className="font-medium">{day.day}</h3>
                  <p className="text-xs opacity-70">{day.workout}</p>
                </div>
                {isOwnProfile ? (
                  <button 
                    onClick={() => toggleDayCompletion(day.id)}
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                      day.completed 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    {day.completed ? (
                      <Check size={14} className="text-white" />
                    ) : (
                      <X size={14} className="text-white/70" />
                    )}
                  </button>
                ) : day.completed && (
                  <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center">
                    <Check size={14} className="text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </AnimatedCard>

        <AnimatedCard className="p-6 col-span-1 h-auto">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Award size={20} />
            Achievements
          </h2>
          
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Clock size={32} className="text-white/40" />
            </div>
            <p className="text-center">Complete workouts to earn achievements</p>
          </div>
        </AnimatedCard>
      </div>
      <Footer />
    </div>
  );
};

export default ProfileAndWorkoutPage;
