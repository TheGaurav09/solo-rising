
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/context/UserContext';
import { useNavigate } from 'react-router-dom';
import { Plus, Dumbbell, Trophy, Calendar, XCircle, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import WorkoutConfirmDialog from './modals/WorkoutConfirmDialog';
import { useMediaQuery } from '@/hooks/use-mobile';
import { WorkoutLoggerProps, WorkoutLoggedData } from './WorkoutLoggerProps';

const WorkoutLogger: React.FC<WorkoutLoggerProps> = ({ 
  onWorkoutLogged, 
  buttonStyle, 
  className,
  refreshWorkouts 
}) => {
  const { userId, character } = useUser();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [exerciseList, setExerciseList] = useState<string[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [intensity, setIntensity] = useState<'low' | 'medium' | 'high'>('medium');
  const [duration, setDuration] = useState<5 | 10 | 15 | 20 | 30 | 45 | 60>(30);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    if (dialogOpen) {
      fetchExercises();
    }
  }, [dialogOpen, character]);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      // Hardcoded exercise list (no 'exercises' table in database)
      const exercises = [
        "Push-ups", "Pull-ups", "Squats", "Lunges", "Plank", 
        "Deadlifts", "Bench Press", "Shoulder Press",
        "Bicep Curls", "Tricep Extensions", "Crunches",
        "Jumping Jacks", "Running", "Cycling", "Swimming",
        "Yoga", "Pilates", "HIIT", "Kickboxing"
      ];
      
      setExerciseList(exercises);
      if (exercises.length > 0) {
        setSelectedExercise(exercises[0]);
      }
    } catch (error) {
      console.error('Error in fetchExercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedExercise(null);
    setIntensity('medium');
    setDuration(30);
  };

  const handleConfirm = () => {
    if (selectedExercise) {
      setConfirmDialogOpen(true);
    }
  };

  const calculatePoints = () => {
    const intensityMultiplier = intensity === 'low' ? 1 : intensity === 'medium' ? 1.5 : 2;
    const durationPoints = Math.floor(duration / 5) * 5;
    return Math.round(durationPoints * intensityMultiplier);
  };

  const handleLogWorkout = async () => {
    if (!userId || !selectedExercise) return;

    try {
      setLoading(true);
      
      const points = calculatePoints();
      const now = new Date().toISOString();
      
      // Insert workout with correct field names
      const { error: logError } = await supabase
        .from('workouts')
        .insert({
          user_id: userId,
          exercise_type: selectedExercise,
          duration: duration,
          reps: 0, // Required field with default value
          points: points,
          created_at: now
        });
        
      if (logError) {
        console.error('Error logging workout:', logError);
        throw logError;
      }
      
      // Update user points and streak
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('points, streak, last_workout_date, coins, xp')
        .eq('id', userId)
        .single();
        
      if (userError) {
        console.error('Error fetching user data:', userError);
        throw userError;
      }
      
      const today = new Date().toISOString().split('T')[0];
      const lastWorkoutDate = userData.last_workout_date ? new Date(userData.last_workout_date).toISOString().split('T')[0] : null;
      
      // Calculate streak
      let newStreak = userData.streak || 0;
      if (!lastWorkoutDate) {
        newStreak = 1; // First workout
      } else if (lastWorkoutDate === today) {
        // Already worked out today, streak stays the same
      } else {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        if (lastWorkoutDate === yesterdayStr) {
          newStreak += 1; // Consecutive day
        } else {
          newStreak = 1; // Streak broken, starting new streak
        }
      }
      
      // Update user data
      const { error: updateError } = await supabase
        .from('users')
        .update({
          points: (userData.points || 0) + points,
          streak: newStreak,
          last_workout_date: now,
          coins: (userData.coins || 0) + Math.floor(points / 10),
          xp: (userData.xp || 0) + points,
        })
        .eq('id', userId);
        
      if (updateError) {
        console.error('Error updating user data:', updateError);
        throw updateError;
      }
      
      // Close dialogs and reset form
      setConfirmDialogOpen(false);
      handleCloseDialog();
      
      // Call callback with workout data
      if (onWorkoutLogged) {
        const workoutData: WorkoutLoggedData = {
          exerciseName: selectedExercise,
          duration,
          intensity,
          points,
          completedAt: now
        };
        onWorkoutLogged(workoutData);
      }
      
      // Refresh workouts if callback provided
      if (refreshWorkouts) {
        await refreshWorkouts();
      }
      
    } catch (error) {
      console.error('Error in handleLogWorkout:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleOpenDialog}
        className={cn(
          "flex items-center gap-2 py-2 w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all",
          buttonStyle,
          className
        )}
        size="lg"
      >
        <Plus size={16} />
        <span>Log Workout</span>
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className={cn(
          "bg-black border border-white/10 p-0 overflow-hidden",
          isMobile ? "w-[95vw] max-w-none mx-auto" : "max-w-lg w-full"
        )}>
          <DialogHeader className="bg-gradient-to-r from-blue-900/50 to-indigo-900/50 p-4 border-b border-white/10">
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-white" />
              Log Workout
            </DialogTitle>
          </DialogHeader>
          
          <div className="p-4 bg-black/90">
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">Exercise Type</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                      {exerciseList.map((exercise) => (
                        <button
                          key={exercise}
                          type="button"
                          className={`p-2 rounded text-left border ${
                            selectedExercise === exercise
                              ? 'bg-blue-900/50 border-blue-700 text-white'
                              : 'bg-black border-gray-800 hover:bg-gray-900 text-white/80'
                          } transition-colors`}
                          onClick={() => setSelectedExercise(exercise)}
                        >
                          {exercise}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">Intensity</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        className={`p-2 rounded text-center ${
                          intensity === 'low'
                            ? 'bg-green-900/50 border border-green-700 text-white'
                            : 'bg-black border border-gray-800 hover:bg-gray-900 text-white/80'
                        }`}
                        onClick={() => setIntensity('low')}
                      >
                        Low
                      </button>
                      <button
                        type="button"
                        className={`p-2 rounded text-center ${
                          intensity === 'medium'
                            ? 'bg-yellow-900/50 border border-yellow-700 text-white'
                            : 'bg-black border border-gray-800 hover:bg-gray-900 text-white/80'
                        }`}
                        onClick={() => setIntensity('medium')}
                      >
                        Medium
                      </button>
                      <button
                        type="button"
                        className={`p-2 rounded text-center ${
                          intensity === 'high'
                            ? 'bg-red-900/50 border border-red-700 text-white'
                            : 'bg-black border border-gray-800 hover:bg-gray-900 text-white/80'
                        }`}
                        onClick={() => setIntensity('high')}
                      >
                        High
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">Duration (minutes)</label>
                    <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
                      {[5, 10, 15, 20, 30, 45, 60].map((mins) => (
                        <button
                          key={mins}
                          type="button"
                          className={`p-2 rounded text-center ${
                            duration === mins
                              ? 'bg-blue-900/50 border border-blue-700 text-white'
                              : 'bg-black border border-gray-800 hover:bg-gray-900 text-white/80'
                          }`}
                          onClick={() => setDuration(mins as 5 | 10 | 15 | 20 | 30 | 45 | 60)}
                        >
                          {mins}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-between">
                  <Button
                    variant="outline"
                    className="bg-transparent border border-gray-800 text-white hover:bg-gray-900"
                    onClick={handleCloseDialog}
                  >
                    Cancel
                  </Button>
                  
                  <Button
                    onClick={handleConfirm}
                    className="bg-blue-600 text-white hover:bg-blue-700"
                    disabled={!selectedExercise}
                  >
                    Confirm Workout
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <WorkoutConfirmDialog
        isOpen={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={handleLogWorkout}
        character={character}
        loading={loading}
      />
    </>
  );
};

export default WorkoutLogger;
