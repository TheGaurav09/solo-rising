import React, { useState } from 'react';
import AnimatedCard from './ui/AnimatedCard';
import AnimatedButton from './ui/AnimatedButton';
import { useUser } from '@/context/UserContext';
import { Dumbbell, Timer, Repeat, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
    if (!selectedExercise) return;
    
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
      
      // Save to Supabase
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
      
      // Update last workout time
      await setLastWorkoutTime(new Date().toISOString());
      
      // Add points
      addPoints(pointsEarned);
      
      if (onWorkoutLogged) {
        onWorkoutLogged(pointsEarned);
      }
      
      // Refresh workouts list if function provided
      if (refreshWorkouts) {
        await refreshWorkouts();
      }
      
      setSuccess(true);
      
      // Reset after a moment
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
            disabled={!selectedExercise || loading || cooldownError}
            character={character || undefined}
            className="w-full"
          >
            {loading ? 'Logging...' : 'Log Workout'}
          </AnimatedButton>
        </>
      )}
    </AnimatedCard>
  );
};

export default WorkoutLogger;
