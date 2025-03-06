
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action } = await req.json();
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
