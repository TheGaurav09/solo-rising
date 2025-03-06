
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action } = await req.json();

    if (action === 'get_secrets') {
      const secrets = {
        ADMIN_EMAIL: Deno.env.get('ADMIN_EMAIL'),
        ADMIN_PASSWORD: Deno.env.get('ADMIN_PASSWORD'),
        ADMIN_NAME: Deno.env.get('ADMIN_NAME'),
        DELETE_USER_PASSWORD: Deno.env.get('DELETE_USER_PASSWORD'),
      };

      return new Response(JSON.stringify(secrets), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
