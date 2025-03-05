
import React, { useState, useEffect } from 'react';
import AnimatedCard from './ui/AnimatedCard';
import AnimatedButton from './ui/AnimatedButton';
import { useUser } from '@/context/UserContext';
import { Dumbbell, Timer, Repeat, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface WorkoutLoggerProps {
  onWorkoutLogged: (points: number) => void;
}

interface ExerciseOption {
  id: string;
  name: string;
  points: number;
  icon: React.ReactNode;
}

const WorkoutLogger = ({ onWorkoutLogged }: WorkoutLoggerProps) => {
  const { character, addPoints, userName } = useUser();
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [duration, setDuration] = useState(30);
  const [reps, setReps] = useState(10);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [checkingCooldown, setCheckingCooldown] = useState(true);

  const COOLDOWN_MINUTES = 30;
  
  useEffect(() => {
    checkWorkoutCooldown();
  }, []);

  const checkWorkoutCooldown = async () => {
    setCheckingCooldown(true);
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const lastWorkoutTime = new Date(data[0].created_at);
        const currentTime = new Date();
        const timeDiff = currentTime.getTime() - lastWorkoutTime.getTime();
        const minutesDiff = Math.floor(timeDiff / (1000 * 60));
        
        if (minutesDiff < COOLDOWN_MINUTES) {
          const remaining = COOLDOWN_MINUTES - minutesDiff;
          setTimeRemaining(remaining);
        } else {
          setTimeRemaining(null);
        }
      } else {
        // No previous workouts
        setTimeRemaining(null);
      }
    } catch (error) {
      console.error('Error checking workout cooldown:', error);
      toast({
        title: 'Error',
        description: 'Failed to check workout cooldown',
        variant: 'destructive',
      });
      setTimeRemaining(null);
    } finally {
      setCheckingCooldown(false);
    }
  };

  const exercises: ExerciseOption[] = [
    { id: 'pushups', name: 'Push-ups', points: 10, icon: <Dumbbell size={18} /> },
    { id: 'situps', name: 'Sit-ups', points: 8, icon: <Dumbbell size={18} /> },
    { id: 'squats', name: 'Squats', points: 12, icon: <Dumbbell size={18} /> },
    { id: 'running', name: 'Running', points: 15, icon: <Timer size={18} /> },
    { id: 'pullups', name: 'Pull-ups', points: 20, icon: <Repeat size={18} /> },
    { id: 'cycling', name: 'Cycling', points: 18, icon: <Timer size={18} /> },
  ];

  const getSelectedExercise = () => {
    return exercises.find(ex => ex.id === selectedExercise);
  };

  const calculatePoints = () => {
    const exercise = getSelectedExercise();
    if (!exercise) return 0;
    
    // Base points from exercise
    let totalPoints = exercise.points;
    
    // Add points based on duration (1 point per 5 minutes)
    totalPoints += Math.floor(duration / 5);
    
    // Add points based on reps (1 point per 5 reps)
    totalPoints += Math.floor(reps / 5);
    
    return totalPoints;
  };

  const handleLogWorkout = async () => {
    if (!selectedExercise || timeRemaining !== null) return;
    
    setLoading(true);
    
    try {
      // Double-check cooldown before proceeding
      const { data, error } = await supabase
        .from('workouts')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const lastWorkoutTime = new Date(data[0].created_at);
        const currentTime = new Date();
        const timeDiff = currentTime.getTime() - lastWorkoutTime.getTime();
        const minutesDiff = Math.floor(timeDiff / (1000 * 60));
        
        if (minutesDiff < COOLDOWN_MINUTES) {
          const remaining = COOLDOWN_MINUTES - minutesDiff;
          setTimeRemaining(remaining);
          toast({
            title: 'Cooldown Active',
            description: `You need to wait ${remaining} more minutes before logging another workout.`,
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }
      }
      
      const pointsEarned = calculatePoints();
      const exercise = getSelectedExercise();
      
      // Insert workout into database
      const { error: insertError } = await supabase
        .from('workouts')
        .insert([
          {
            user_id: (await supabase.auth.getUser()).data.user?.id,
            exercise_type: exercise?.name || 'Unknown',
            duration: duration,
            reps: reps,
            points: pointsEarned,
          },
        ]);
      
      if (insertError) throw insertError;
      
      // Update user points
      addPoints(pointsEarned);
      onWorkoutLogged(pointsEarned);
      
      setSuccess(true);
      toast({
        title: 'Workout Logged',
        description: `You earned ${pointsEarned} points!`,
      });
      
      // Reset after a moment
      setTimeout(() => {
        setSuccess(false);
        setSelectedExercise(null);
        setDuration(30);
        setReps(10);
        checkWorkoutCooldown();
      }, 2000);
    } catch (error) {
      console.error('Error logging workout:', error);
      toast({
        title: 'Error',
        description: 'Failed to log workout. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (checkingCooldown) {
    return (
      <AnimatedCard className="w-full p-6 max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-4">Log Workout</h2>
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white mb-4"></div>
          <p className="text-white/70">Checking workout cooldown...</p>
        </div>
      </AnimatedCard>
    );
  }

  return (
    <AnimatedCard className="w-full p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Log Workout</h2>
      
      {timeRemaining !== null && (
        <div className="mb-6 bg-white/5 p-4 rounded-lg border border-white/20">
          <div className="flex items-center gap-3">
            <Clock size={24} className={`${character ? `text-${character}-primary` : 'text-primary'}`} />
            <div>
              <h3 className="font-medium">Cooldown Active</h3>
              <p className="text-sm text-white/70">
                Please wait {timeRemaining} more minute{timeRemaining !== 1 ? 's' : ''} before logging another workout.
              </p>
            </div>
          </div>
        </div>
      )}
      
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
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-white/80">
              Exercise Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {exercises.map((exercise) => (
                <div
                  key={exercise.id}
                  onClick={() => setSelectedExercise(exercise.id)}
                  className={`px-3 py-2 rounded-lg flex items-center gap-2 cursor-pointer transition-colors ${
                    selectedExercise === exercise.id
                      ? character 
                        ? `bg-${character}-primary/20 border-${character}-primary/40 border` 
                        : 'bg-primary/20 border-primary/40 border'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  } ${timeRemaining !== null ? 'opacity-50 cursor-not-allowed' : ''}`}
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
              className={`w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer ${timeRemaining !== null ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={timeRemaining !== null}
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
              className={`w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer ${timeRemaining !== null ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={timeRemaining !== null}
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
            disabled={!selectedExercise || loading || timeRemaining !== null}
            character={character || undefined}
            className="w-full"
          >
            {timeRemaining !== null 
              ? `Cooldown: ${timeRemaining}m remaining`
              : loading 
                ? 'Logging...' 
                : 'Log Workout'}
          </AnimatedButton>
        </>
      )}
    </AnimatedCard>
  );
};

export default WorkoutLogger;
