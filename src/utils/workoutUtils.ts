// Import necessary modules
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface WorkoutData {
  exerciseType: string;
  reps: number;
  duration: number;
}

// Calculate points based on workout data
export const calculatePoints = (workout: WorkoutData): number => {
  const { exerciseType, reps, duration } = workout;
  
  // Base points for different exercise types
  const basePoints = {
    'push-ups': 0.5,
    'pull-ups': 1,
    'squats': 0.5,
    'lunges': 0.5,
    'sit-ups': 0.4,
    'plank': 1.5, // Points per minute for plank
    'running': 10, // Points per kilometer
    'jumping-jacks': 0.2,
    'burpees': 1.5,
    'mountain-climbers': 0.4,
    'cycling': 5, // Points per kilometer
    'swimming': 15, // Points per kilometer
    'weightlifting': 2, // Points per set
    'yoga': 8, // Points per session
    'hiit': 12, // Points per session
    'boxing': 10, // Points per session
    'calisthenics': 1, // Points per exercise
    'other': 5 // Default points
  };
  
  // Get base points for the exercise type, default to 'other' if not found
  const pointsPerUnit = basePoints[exerciseType] || basePoints['other'];
  
  // Calculate total points based on exercise type
  let totalPoints = 0;
  
  switch (exerciseType) {
    case 'plank':
      // For plank, points are based on duration in minutes
      totalPoints = Math.round(pointsPerUnit * (duration / 60));
      break;
    case 'running':
    case 'cycling':
    case 'swimming':
      // For distance-based exercises, assume duration is in kilometers
      totalPoints = Math.round(pointsPerUnit * duration);
      break;
    case 'yoga':
    case 'hiit':
    case 'boxing':
      // For session-based exercises, points are per session
      totalPoints = Math.round(pointsPerUnit);
      break;
    case 'weightlifting':
      // For weightlifting, points are per set
      totalPoints = Math.round(pointsPerUnit * reps);
      break;
    default:
      // For rep-based exercises, points are per rep
      totalPoints = Math.round(pointsPerUnit * reps);
  }
  
  // Add bonus points for longer workouts
  if (duration > 30) {
    totalPoints += Math.floor(duration / 30) * 5;
  }
  
  return totalPoints;
};

// Save workout data to database
export const saveWorkout = async (userId: string, workout: WorkoutData): Promise<boolean> => {
  try {
    const points = calculatePoints(workout);
    
    // Save workout to database
    const { error } = await supabase
      .from('workouts')
      .insert({
        user_id: userId,
        exercise_type: workout.exerciseType,
        reps: workout.reps,
        duration: workout.duration,
        points: points
      });
      
    if (error) {
      console.error('Error saving workout:', error);
      return false;
    }
    
    // Update user's points using the increment_points function
    const { data: newPoints, error: pointsError } = await supabase
      .rpc('increment_points', {
        user_id: userId,
        amount: points
      });
    
    if (pointsError) {
      console.error('Error updating points:', pointsError);
      return false;
    }
    
    // Update user's last workout date
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        last_workout_date: new Date().toISOString(),
        points: newPoints  // Use the returned value from increment_points
      })
      .eq('id', userId);
      
    if (updateError) {
      console.error('Error updating last workout date:', updateError);
      return false;
    }
    
    return true;
    
  } catch (error) {
    console.error('Exception in saveWorkout:', error);
    return false;
  }
};

// Update streak for user
export const updateStreak = async (userId: string): Promise<number> => {
  try {
    // Get user's current streak and last workout date
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('streak, last_workout_date')
      .eq('id', userId)
      .single();
      
    if (userError) {
      console.error('Error fetching user data:', userError);
      return 0;
    }
    
    const currentDate = new Date();
    const lastWorkoutDate = userData.last_workout_date ? new Date(userData.last_workout_date) : null;
    let newStreak = userData.streak || 0;
    
    if (!lastWorkoutDate) {
      // First workout ever
      newStreak = 1;
    } else {
      // Calculate days difference
      const diffTime = Math.abs(currentDate.getTime() - lastWorkoutDate.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        // Already worked out today, keep streak the same
      } else if (diffDays === 1) {
        // Worked out yesterday, increment streak
        newStreak += 1;
      } else {
        // Missed a day, reset streak to 1
        newStreak = 1;
      }
    }
    
    // Update user's streak
    const { error: updateError } = await supabase
      .from('users')
      .update({ streak: newStreak })
      .eq('id', userId);
      
    if (updateError) {
      console.error('Error updating streak:', updateError);
      return 0;
    }
    
    return newStreak;
    
  } catch (error) {
    console.error('Exception in updateStreak:', error);
    return 0;
  }
};
