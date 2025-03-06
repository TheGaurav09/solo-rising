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
import { CalendarIcon, Timer, Dumbbell, History, Clock, Award, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Footer from '@/components/ui/Footer';
import WorkoutLogger from '@/components/WorkoutLogger';

const ProfileAndWorkoutPage = () => {
  const { id } = useParams();
  const { userName, character, points, streak, coins, level, xp, userId } = useUser();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [profileRank, setProfileRank] = useState<number | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);

  const characterImages: Record<string, string> = {
    'goku': 'https://avatars.akamai.steamstatic.com/fef49e7fa7e1997a76c7d1039373b5a62359ca63_full.jpg',
    'saitama': 'https://i.pinimg.com/736x/3e/3c/95/3e3c959d20414905a3863f8c1895a958.jpg',
    'jin-woo': 'https://pbs.twimg.com/media/F8ipR0kWwAAjqoz.jpg'
  };

  const getCharacterColor = () => {
    switch (character) {
      case 'goku': return 'bg-goku-primary/20 text-goku-primary';
      case 'saitama': return 'bg-saitama-primary/20 text-saitama-primary';
      case 'jin-woo': return 'bg-jin-woo-primary/20 text-jin-woo-primary';
      default: return 'bg-primary/20 text-primary';
    }
  };

  const calculateLevelProgress = () => {
    const xpForCurrentLevel = level * 100;
    const xpForNextLevel = (level + 1) * 100;
    const xpInCurrentLevel = xp - xpForCurrentLevel;
    const xpRequiredForNextLevel = xpForNextLevel - xpForCurrentLevel;
    const progress = (xpInCurrentLevel / xpRequiredForNextLevel) * 100;
    return progress;
  };

  useEffect(() => {
    setIsOwnProfile(!id || id === userId);
  }, [id, userId]);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (id && id !== userId) {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          toast({
            title: "Error",
            description: "Could not fetch profile data",
            variant: "destructive",
          });
          return;
        }

        setProfileData(data);
      } else {
        setProfileData(null);
      }
    };

    fetchProfileData();
  }, [id, userId]);

  useEffect(() => {
    const fetchRank = async () => {
      const targetId = id || userId;
      const { data: users } = await supabase
        .from('users')
        .select('id, points')
        .order('points', { ascending: false });

      if (users) {
        const rank = users.findIndex(user => user.id === targetId) + 1;
        setProfileRank(rank);
      }
    };

    fetchRank();
  }, [id, userId]);

  const weeklySchedule = [
    { day: "Monday", workout: "Upper Body", completed: false },
    { day: "Tuesday", workout: "Lower Body", completed: false },
    { day: "Wednesday", workout: "Rest Day", completed: true },
    { day: "Thursday", workout: "Cardio", completed: false },
    { day: "Friday", workout: "Full Body", completed: false },
    { day: "Saturday", workout: "Flexible Training", completed: false },
    { day: "Sunday", workout: "Rest Day", completed: true }
  ];

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
            <WorkoutLogger />
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
                key={day.day} 
                className={`border border-white/10 rounded-lg p-3 flex justify-between items-center ${
                  day.completed ? 'bg-green-950/20 border-green-800/30' : ''
                }`}
              >
                <div>
                  <h3 className="font-medium">{day.day}</h3>
                  <p className="text-xs opacity-70">{day.workout}</p>
                </div>
                {day.completed && (
                  <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
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
