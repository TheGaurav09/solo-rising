import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/context/UserContext';
import AnimatedCard from '@/components/ui/AnimatedCard';
import AnimatedButton from '@/components/ui/AnimatedButton';
import { toast } from '@/components/ui/use-toast';
import { Dumbbell, Timer, Repeat, CheckCircle2, History, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import WorkoutConfirmModal from '@/components/modals/WorkoutConfirmModal';

const WorkoutPage = () => {
  const { character, userName, addPoints, streak, lastWorkoutDate } = useUser();
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [duration, setDuration] = useState(30);
  const [reps, setReps] = useState(10);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [workoutHistory, setWorkoutHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showAllExercises, setShowAllExercises] = useState(false);

  useEffect(() => {
    fetchWorkoutHistory();
  }, []);

  const fetchWorkoutHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWorkoutHistory(data || []);
    } catch (error) {
      console.error('Error fetching workout history:', error);
      toast({
        title: 'Error',
        description: 'Failed to load workout history',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingHistory(false);
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
    setShowConfirmModal(true);
  };

  const handleAddWorkout = async () => {
    if (!selectedExercise) return;
    
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
      
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({ 
          streak: newStreak,
          last_workout_date: new Date().toISOString(),
          points: supabase.rpc('increment_points', { amount: pointsEarned })
        })
        .eq('id', user.user.id);
      
      if (userUpdateError) throw userUpdateError;
      
      addPoints(pointsEarned);
      
      toast({
        title: 'Workout Added',
        description: `You earned ${pointsEarned} points for this workout!`,
        duration: 3000,
      });
      
      setSuccess(true);
      
      fetchWorkoutHistory();
      
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Workout Center</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <AnimatedCard className="p-6">
            <h2 className="text-xl font-bold mb-4">Add Workout</h2>
            
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
                  disabled={!selectedExercise || loading}
                  character={character || undefined}
                  className="w-full"
                >
                  {loading ? 'Adding...' : 'Add Workout'}
                </AnimatedButton>
              </>
            )}
          </AnimatedCard>
        </div>
        
        <div>
          <AnimatedCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Workout History</h2>
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

export default WorkoutPage;
