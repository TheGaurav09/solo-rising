
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get request body
    const body = await req.json();
    const { action, data } = body;

    if (!action) {
      return new Response(
        JSON.stringify({ error: "Missing action parameter" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let result;

    switch (action) {
      case "send_warning":
        // Validate data
        if (!data.user_id || !data.message || !data.admin_email) {
          return new Response(
            JSON.stringify({ error: "Missing required parameters for warning" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        // Insert warning
        const { data: warningData, error: warningError } = await supabase
          .from("warnings")
          .insert({
            user_id: data.user_id,
            message: data.message,
            admin_email: data.admin_email,
            read: false,
          })
          .select();

        if (warningError) throw warningError;
        result = warningData;
        break;

      case "add_hall_of_fame":
        // Validate data
        if (!data.name || !data.amount) {
          return new Response(
            JSON.stringify({ error: "Missing required parameters for Hall of Fame" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        // Insert hall of fame entry
        const { data: hallOfFameData, error: hallOfFameError } = await supabase
          .from("hall_of_fame")
          .insert({
            name: data.name,
            amount: data.amount,
            user_id: data.user_id || null,
          })
          .select();

        if (hallOfFameError) throw hallOfFameError;
        result = hallOfFameData;
        break;

      case "delete_user":
        // Validate data
        if (!data.user_id) {
          return new Response(
            JSON.stringify({ error: "Missing user_id parameter" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        // Delete user
        const { error: deleteUserError } = await supabase.auth.admin.deleteUser(
          data.user_id
        );

        if (deleteUserError) throw deleteUserError;
        result = { success: true, message: "User deleted successfully" };
        break;

      default:
        return new Response(
          JSON.stringify({ error: "Invalid action parameter" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in auth-admin function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
