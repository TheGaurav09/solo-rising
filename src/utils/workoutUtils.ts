
import { supabase } from '@/integrations/supabase/client';

/**
 * Updates a user's streak when they log a workout
 * @param userId The ID of the user
 * @param workoutDate Optional date of the workout (defaults to now)
 */
export async function updateUserStreak(userId: string, workoutDate = new Date()) {
  try {
    // First get the user's current data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('streak, last_workout_date')
      .eq('id', userId)
      .single();
      
    if (userError) {
      console.error('Error fetching user data for streak update:', userError);
      return;
    }
    
    // Format dates for comparison - strip time part
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    
    let newStreak = 1; // Default to 1 if no previous streak
    let lastWorkoutDate = user?.last_workout_date ? new Date(user.last_workout_date) : null;
    
    if (lastWorkoutDate) {
      lastWorkoutDate.setUTCHours(0, 0, 0, 0);
      
      // Calculate days between last workout and today
      const timeDiff = today.getTime() - lastWorkoutDate.getTime();
      const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
      
      if (daysDiff === 0) {
        // Workout already logged today, don't change streak
        newStreak = user.streak;
      } else if (daysDiff === 1) {
        // Consecutive day, increment streak
        newStreak = (user.streak || 0) + 1;
      } else {
        // More than one day passed, reset streak to 1
        newStreak = 1;
      }
    }
    
    // Update the user's streak and last workout date
    const { error: updateError } = await supabase
      .from('users')
      .update({
        streak: newStreak,
        last_workout_date: workoutDate.toISOString()
      })
      .eq('id', userId);
      
    if (updateError) {
      console.error('Error updating user streak:', updateError);
    }
    
    return newStreak;
  } catch (error) {
    console.error('Unexpected error updating streak:', error);
    return null;
  }
}

/**
 * Logs a workout and updates user streak
 */
export async function logWorkout(
  userId: string, 
  exerciseType: string, 
  duration: number, 
  reps: number,
  points: number
) {
  try {
    // Insert the workout record
    const { data, error } = await supabase
      .from('workouts')
      .insert({
        user_id: userId,
        exercise_type: exerciseType,
        duration: duration,
        reps: reps,
        points: points
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error logging workout:', error);
      return { success: false, error };
    }
    
    // Update the user's streak
    const newStreak = await updateUserStreak(userId);
    
    // Update user's total points
    const { error: pointsError } = await supabase
      .from('users')
      .update({
        points: supabase.rpc('increment_points', { amount: points })
      })
      .eq('id', userId);
      
    if (pointsError) {
      console.error('Error updating user points:', pointsError);
    }
    
    return { 
      success: true, 
      data, 
      streak: newStreak 
    };
  } catch (error) {
    console.error('Unexpected error logging workout:', error);
    return { success: false, error };
  }
}
