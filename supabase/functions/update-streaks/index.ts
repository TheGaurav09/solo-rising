
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.4.0'

// Define types
interface User {
  id: string;
  streak: number;
  last_workout_date: string | null;
}

Deno.serve(async (req) => {
  try {
    // Create a Supabase client with the project URL and service key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, streak, last_workout_date');

    if (usersError) {
      throw new Error(`Error fetching users: ${usersError.message}`);
    }

    console.log(`Processing streaks for ${users.length} users`);

    // Get current date (UTC)
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Process each user
    for (const user of users) {
      await processUserStreak(user, today, supabase);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Processed streaks for ${users.length} users` 
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in update-streaks function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

async function processUserStreak(user: User, today: Date, supabase: any) {
  // If user has no last workout date, nothing to do
  if (!user.last_workout_date) {
    return;
  }

  // Parse the last workout date
  const lastWorkoutDate = new Date(user.last_workout_date);
  lastWorkoutDate.setUTCHours(0, 0, 0, 0);

  // Calculate the difference in days
  const timeDiff = today.getTime() - lastWorkoutDate.getTime();
  const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));

  // If more than 1 day has passed since the last workout, reset streak to 0
  if (daysDiff > 1) {
    console.log(`Resetting streak for user ${user.id} - ${daysDiff} days since last workout`);
    
    const { error } = await supabase
      .from('users')
      .update({ streak: 0 })
      .eq('id', user.id);

    if (error) {
      console.error(`Error updating streak for user ${user.id}:`, error);
    }
  }
}
