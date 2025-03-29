
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.4.0'

Deno.serve(async (req) => {
  try {
    // Create a Supabase client with the project URL and service key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Create a SQL function to schedule our update-streaks function to run daily
    const { error } = await supabase.rpc('setup_streak_cron_job');

    if (error) {
      throw new Error(`Error setting up cron job: ${error.message}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Cron job for streak updates has been set up successfully' 
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in setup-cron function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
