
import React, { useState, useEffect } from 'react';
import AnimatedCard from './ui/AnimatedCard';
import AnimatedButton from './ui/AnimatedButton';
import { useUser } from '@/context/UserContext';
import { Dumbbell, Timer, Repeat, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface WorkoutLoggerProps {
  refreshWorkouts?: () => Promise<void>;
  onWorkoutLogged?: (points: number) => void;
}

interface ExerciseOption {
  id: string;
  name: string;
  points: number;
  icon: React.ReactNode;
}

const WorkoutLogger = ({ refreshWorkouts, onWorkoutLogged }: WorkoutLoggerProps) => {
  const { character, addPoints, checkWorkoutCooldown, setLastWorkoutTime, canAddWorkout } = useUser();
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [duration, setDuration] = useState(30);
  const [reps, setReps] = useState(10);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cooldownError, setCooldownError] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  const [showAllExercises, setShowAllExercises] = useState(false);

  const exercises: ExerciseOption[] = [
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

  useEffect(() => {
    // Check if there's a cooldown remaining
    const checkInitialCooldown = async () => {
      const lastWorkout = localStorage.getItem('lastWorkoutTime');
      
      if (lastWorkout) {
        const lastWorkoutTime = new Date(lastWorkout);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - lastWorkoutTime.getTime()) / (1000 * 60));
        
        if (diffInMinutes < 30) {
          setCooldownRemaining(30 - diffInMinutes);
          
          // Set up interval to update remaining time
          const interval = setInterval(() => {
            setCooldownRemaining(prev => {
              if (prev <= 1) {
                clearInterval(interval);
                return 0;
              }
              return prev - 1;
            });
          }, 60000); // Update every minute
          
          return () => clearInterval(interval);
        }
      }
    };
    
    checkInitialCooldown();
  }, []);

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

  const handleLogWorkout = async () => {
    if (!selectedExercise) return;
    
    if (cooldownRemaining > 0) {
      toast({
        title: "Workout Cooldown",
        description: `Please wait ${cooldownRemaining} minute${cooldownRemaining > 1 ? 's' : ''} before adding another workout.`,
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    setCooldownError(false);
    
    try {
      const canAdd = await checkWorkoutCooldown();
      if (!canAdd) {
        setCooldownError(true);
        setLoading(false);
        return;
      }
      
      const pointsEarned = calculatePoints();
      const exercise = getSelectedExercise();
      
      const { data: authData } = await supabase.auth.getUser();
      if (authData.user) {
        const { error } = await supabase
          .from('workouts')
          .insert({
            user_id: authData.user.id,
            exercise_type: exercise?.name,
            duration: duration,
            reps: reps,
            points: pointsEarned
          });
          
        if (error) {
          console.error("Error logging workout:", error);
          toast({
            title: "Error",
            description: "Failed to log workout. Please try again.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
      }
      
      // Store the last workout time in localStorage
      const now = new Date();
      localStorage.setItem('lastWorkoutTime', now.toISOString());
      await setLastWorkoutTime(now.toISOString());
      
      // Set cooldown
      setCooldownRemaining(30);
      
      // Start cooldown timer
      const interval = setInterval(() => {
        setCooldownRemaining(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 60000); // Update every minute
      
      addPoints(pointsEarned);
      
      if (onWorkoutLogged) {
        onWorkoutLogged(pointsEarned);
      }
      
      if (refreshWorkouts) {
        await refreshWorkouts();
      }
      
      setSuccess(true);
      
      setTimeout(() => {
        setSuccess(false);
        setSelectedExercise(null);
        setDuration(30);
        setReps(10);
      }, 2000);
    } catch (error) {
      console.error("Error in handleLogWorkout:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedCard className="w-full p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Log Workout</h2>
      
      {success ? (
        <div className="text-center py-8 animate-fade-in">
          <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-500" />
          <p className="text-lg font-medium mb-2">Workout Logged Successfully!</p>
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
            onClick={handleLogWorkout}
            disabled={!selectedExercise || loading || cooldownRemaining > 0}
            character={character || undefined}
            className="w-full"
          >
            {loading ? 'Logging...' : cooldownRemaining > 0 ? `Cooldown (${cooldownRemaining}m)` : 'Log Workout'}
          </AnimatedButton>
        </>
      )}
    </AnimatedCard>
  );
};

export default WorkoutLogger;
