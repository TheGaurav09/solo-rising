
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action } = await req.json();

    if (action === 'get_secrets') {
      console.log('Fetching admin secrets...');
      
      const secrets = {
        ADMIN_EMAIL: Deno.env.get('ADMIN_EMAIL'),
        ADMIN_PASSWORD: Deno.env.get('ADMIN_PASSWORD'),
        ADMIN_NAME: Deno.env.get('ADMIN_NAME'),
        DELETE_USER_PASSWORD: Deno.env.get('DELETE_USER_PASSWORD'),
      };

      // Validate that all required secrets are present
      if (!secrets.ADMIN_EMAIL || !secrets.ADMIN_PASSWORD || !secrets.ADMIN_NAME) {
        console.error('Missing required admin secrets');
        throw new Error('Admin credentials not properly configured');
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
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
