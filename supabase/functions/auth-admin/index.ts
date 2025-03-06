
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    const { action } = requestData;
    console.log(`Received action: ${action}`);

    if (action === 'get_secrets') {
      console.log('Fetching admin secrets...');
      
      const secrets = {
        ADMIN_EMAIL: Deno.env.get('ADMIN_EMAIL'),
        ADMIN_PASSWORD: Deno.env.get('ADMIN_PASSWORD'),
        ADMIN_NAME: Deno.env.get('ADMIN_NAME'),
        DELETE_USER_PASSWORD: Deno.env.get('DELETE_USER_PASSWORD'),
      };

      // Log securely without exposing actual values
      console.log(`ADMIN_EMAIL present: ${Boolean(secrets.ADMIN_EMAIL)}`);
      console.log(`ADMIN_PASSWORD present: ${Boolean(secrets.ADMIN_PASSWORD)}`);
      console.log(`ADMIN_NAME present: ${Boolean(secrets.ADMIN_NAME)}`);
      console.log(`DELETE_USER_PASSWORD present: ${Boolean(secrets.DELETE_USER_PASSWORD)}`);

      // Validate that all required secrets are present
      if (!secrets.ADMIN_EMAIL || !secrets.ADMIN_PASSWORD || !secrets.ADMIN_NAME) {
        console.error('Missing required admin secrets');
        return new Response(
          JSON.stringify({ 
            error: 'Admin credentials not properly configured', 
            details: 'Please configure ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_NAME environment variables' 
          }), 
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          }
        );
      }

      return new Response(JSON.stringify(secrets), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }
    
    else if (action === 'delete_user') {
      const { userDeleteId, password } = requestData;
      console.log(`Attempting to delete user: ${userDeleteId}`);
      
      // Verify password
      const storedPassword = Deno.env.get('DELETE_USER_PASSWORD');
      if (!storedPassword || password !== storedPassword) {
        console.error('Invalid delete user password provided');
        return new Response(
          JSON.stringify({ error: 'Invalid password' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 401,
          }
        );
      }
      
      // Create a Supabase client with the service role key
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      
      if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Missing Supabase credentials');
        return new Response(
          JSON.stringify({ error: 'Server configuration error' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          }
        );
      }
      
      // Delete the user with the service role
      const response = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userDeleteId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error deleting user:', errorData);
        return new Response(
          JSON.stringify({ error: 'Failed to delete user', details: errorData }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: response.status,
          }
        );
      }
      
      console.log('User deleted successfully');
      return new Response(
        JSON.stringify({ success: true, message: 'User deleted successfully' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }
    
    else if (action === 'send_warning') {
      const { userId, warningMessage } = requestData;
      console.log(`Sending warning to user: ${userId}`);
      console.log(`Warning message: ${warningMessage}`);
      
      if (!userId || !warningMessage) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
      }
      
      // Create a Supabase client with the service role key
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      
      if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Missing Supabase credentials');
        return new Response(
          JSON.stringify({ error: 'Server configuration error' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          }
        );
      }
      
      // Insert warning into database
      const response = await fetch(`${supabaseUrl}/rest/v1/warnings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          user_id: userId,
          message: warningMessage,
          admin_email: Deno.env.get('ADMIN_EMAIL') || 'admin',
          read: false
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error sending warning:', errorData);
        return new Response(
          JSON.stringify({ error: 'Failed to send warning', details: errorData }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: response.status,
          }
        );
      }
      
      console.log('Warning sent successfully');
      return new Response(
        JSON.stringify({ success: true, message: 'Warning sent successfully' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }
    
    else if (action === 'add_to_hall_of_fame') {
      const { name, amount, userId } = requestData;
      console.log(`Adding to Hall of Fame: ${name}, Amount: ${amount}, UserId: ${userId || 'none'}`);
      
      if (!name || amount === undefined) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
      }
      
      // Create a Supabase client with the service role key
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      
      if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Missing Supabase credentials');
        return new Response(
          JSON.stringify({ error: 'Server configuration error' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          }
        );
      }
      
      // Insert into hall_of_fame
      const response = await fetch(`${supabaseUrl}/rest/v1/hall_of_fame`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          name: name,
          amount: amount,
          user_id: userId || null
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error adding to Hall of Fame:', errorData);
        return new Response(
          JSON.stringify({ error: 'Failed to add to Hall of Fame', details: errorData }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: response.status,
          }
        );
      }
      
      console.log('Added to Hall of Fame successfully');
      return new Response(
        JSON.stringify({ success: true, message: 'Added to Hall of Fame successfully' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }
    
    else if (action === 'delete_from_hall_of_fame') {
      const { supporterId } = requestData;
      console.log(`Deleting from Hall of Fame: ${supporterId}`);
      
      if (!supporterId) {
        return new Response(
          JSON.stringify({ error: 'Missing supporter ID' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
      }
      
      // Create a Supabase client with the service role key
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      
      if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Missing Supabase credentials');
        return new Response(
          JSON.stringify({ error: 'Server configuration error' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          }
        );
      }
      
      // Delete from hall_of_fame
      const response = await fetch(`${supabaseUrl}/rest/v1/hall_of_fame?id=eq.${supporterId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error deleting from Hall of Fame:', errorData);
        return new Response(
          JSON.stringify({ error: 'Failed to delete from Hall of Fame', details: errorData }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: response.status,
          }
        );
      }
      
      console.log('Deleted from Hall of Fame successfully');
      return new Response(
        JSON.stringify({ success: true, message: 'Deleted from Hall of Fame successfully' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  } catch (error) {
    console.error('Error in auth-admin function:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
