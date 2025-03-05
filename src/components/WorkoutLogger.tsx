
import React, { useState, useEffect } from 'react';
import AnimatedCard from './ui/AnimatedCard';
import AnimatedButton from './ui/AnimatedButton';
import { useUser } from '@/context/UserContext';
import { Dumbbell, Timer, Repeat, CheckCircle2, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
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
  const [cooldownTimeLeft, setCooldownTimeLeft] = useState<number | null>(null);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  
  // Add more exercise options
  const basicExercises: ExerciseOption[] = [
    { id: 'pushups', name: 'Push-ups', points: 10, icon: <Dumbbell size={18} /> },
    { id: 'situps', name: 'Sit-ups', points: 8, icon: <Dumbbell size={18} /> },
    { id: 'squats', name: 'Squats', points: 12, icon: <Dumbbell size={18} /> },
    { id: 'running', name: 'Running', points: 15, icon: <Timer size={18} /> },
  ];
  
  const extraExercises: ExerciseOption[] = [
    { id: 'pullups', name: 'Pull-ups', points: 20, icon: <Repeat size={18} /> },
    { id: 'cycling', name: 'Cycling', points: 18, icon: <Timer size={18} /> },
    { id: 'weightlifting', name: 'Weightlifting', points: 22, icon: <Dumbbell size={18} /> },
    { id: 'swimming', name: 'Swimming', points: 25, icon: <Timer size={18} /> },
    { id: 'yoga', name: 'Yoga', points: 15, icon: <Timer size={18} /> },
    { id: 'hiit', name: 'HIIT', points: 28, icon: <Timer size={18} /> },
  ];
  
  const allExercises = showMoreOptions ? [...basicExercises, ...extraExercises] : basicExercises;

  useEffect(() => {
    // Check workout cooldown on initial load
    const checkInitialCooldown = async () => {
      const canAdd = await checkWorkoutCooldown();
      setCooldownError(!canAdd);
      
      if (!canAdd) {
        startCooldownTimer();
      }
    };
    
    checkInitialCooldown();
  }, []);
  
  const startCooldownTimer = () => {
    const updateTimer = () => {
      const { lastWorkoutTime } = useUser();
      if (!lastWorkoutTime) {
        setCooldownTimeLeft(null);
        return;
      }
      
      const lastTime = new Date(lastWorkoutTime).getTime();
      const currentTime = new Date().getTime();
      const thirtyMinutesInMs = 30 * 60 * 1000;
      const timeElapsed = currentTime - lastTime;
      const timeLeft = thirtyMinutesInMs - timeElapsed;
      
      if (timeLeft <= 0) {
        setCooldownTimeLeft(null);
        setCooldownError(false);
        clearInterval(timerInterval);
      } else {
        const minutesLeft = Math.floor(timeLeft / (60 * 1000));
        const secondsLeft = Math.floor((timeLeft % (60 * 1000)) / 1000);
        setCooldownTimeLeft(minutesLeft * 60 + secondsLeft);
      }
    };
    
    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(timerInterval);
  };
  
  const formatTimeLeft = (seconds: number | null) => {
    if (seconds === null) return '';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getSelectedExercise = () => {
    return allExercises.find(ex => ex.id === selectedExercise);
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
    
    setLoading(true);
    setCooldownError(false);
    
    try {
      const canAdd = await checkWorkoutCooldown();
      if (!canAdd) {
        setCooldownError(true);
        startCooldownTimer();
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
      
      await setLastWorkoutTime(new Date().toISOString());
      
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
      
      // Start cooldown timer
      startCooldownTimer();
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
          {cooldownError && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2">
              <AlertCircle className="text-red-400" size={20} />
              <div>
                <p className="text-sm text-red-200">Workout cooldown active</p>
                <p className="text-xs text-red-300">
                  Next workout available in: {formatTimeLeft(cooldownTimeLeft)}
                </p>
              </div>
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-white/80">
              Exercise Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {basicExercises.map((exercise) => (
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
            
            {showMoreOptions && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {extraExercises.map((exercise) => (
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
            )}
            
            <button
              className="w-full mt-2 text-white/50 hover:text-white text-sm flex items-center justify-center gap-1"
              onClick={() => setShowMoreOptions(!showMoreOptions)}
            >
              {showMoreOptions ? (
                <>
                  <ChevronUp size={16} />
                  Show Fewer Options
                </>
              ) : (
                <>
                  <ChevronDown size={16} />
                  Show More Options
                </>
              )}
            </button>
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
            className={`w-full ${
              character === 'goku' ? 'text-black' :
              character === 'saitama' ? 'text-black' :
              character === 'jin-woo' ? 'text-white' :
              'text-white'
            }`}
          >
            {loading ? 'Logging...' : 'Log Workout'}
          </AnimatedButton>
        </>
      )}
    </AnimatedCard>
  );
};

export default WorkoutLogger;
