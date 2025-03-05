
import React, { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import AnimatedCard from '@/components/ui/AnimatedCard';
import AnimatedButton from '@/components/ui/AnimatedButton';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Timer, Dumbbell, History, Clock, Award, ChevronDown, ChevronUp, RefreshCw, Share2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import Footer from '@/components/ui/Footer';
import { Button } from '@/components/ui/button';
import WorkoutLogger from '@/components/WorkoutLogger';

const ProfileAndWorkoutPage = () => {
  const { userName, character, points, streak, coins, level, xp } = useUser();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [workoutHistory, setWorkoutHistory] = useState([]);

  // Weekly schedule
  const weeklySchedule = [
    { day: "Monday", workout: "Upper Body", completed: false },
    { day: "Tuesday", workout: "Lower Body", completed: false },
    { day: "Wednesday", workout: "Rest Day", completed: true },
    { day: "Thursday", workout: "Cardio", completed: false },
    { day: "Friday", workout: "Full Body", completed: false },
    { day: "Saturday", workout: "Flexible Training", completed: false },
    { day: "Sunday", workout: "Rest Day", completed: true }
  ];

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

  const progress = calculateLevelProgress();

  const fetchWorkoutHistory = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData || !userData.user) return;

      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false })
        .limit(5);

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
  }, []);

  const refreshWorkouts = () => {
    fetchWorkoutHistory();
  };

  return (
    <div className="container mx-auto px-4 py-8 pt-16 md:pt-8">
      <h1 className="text-2xl font-bold mb-6">Profile & Workout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <AnimatedCard className="p-6 col-span-1 h-auto">
          <div className="flex flex-col items-center">
            <Avatar className={`w-24 h-24 border-4 ${getCharacterColor()} mb-4`}>
              <AvatarImage src={characterImages[character || ''] || ''} alt={character || ''} />
              <AvatarFallback>{character?.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            
            <h2 className="text-xl font-bold">{userName}</h2>
            <p className="text-sm opacity-70">Caped Baldy</p>
            
            <div className="w-full mt-4">
              <div className="flex justify-between items-center mb-1">
                <p className="text-sm font-medium">Level {level}</p>
                <p className="text-sm">{xp} / {(level + 1) * 100} XP</p>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            
            <div className="flex justify-between w-full mt-4">
              <div className="text-center">
                <p className="text-lg font-bold">{points}</p>
                <p className="text-xs opacity-70">Total Points</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold">{streak}</p>
                <p className="text-xs opacity-70">Streak</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold">{coins}</p>
                <p className="text-xs opacity-70">Coins</p>
              </div>
            </div>
          </div>
        </AnimatedCard>

        {/* Workout Logger */}
        <AnimatedCard className="p-6 col-span-1 lg:col-span-2 h-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Dumbbell size={20} />
              Workout Logger
            </h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={refreshWorkouts}
              className="flex items-center gap-1"
            >
              <RefreshCw size={14} />
              Refresh
            </Button>
          </div>
          
          <WorkoutLogger />
        </AnimatedCard>

        {/* Workout History */}
        <AnimatedCard className="p-6 col-span-1 h-auto">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <History size={20} />
            Workout History
          </h2>
          
          {workoutHistory && workoutHistory.length > 0 ? (
            <div className="space-y-3">
              {workoutHistory.map((workout: any) => (
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

        {/* Training Schedule */}
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

        {/* Achievements */}
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
