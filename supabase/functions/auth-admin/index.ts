
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { corsHeaders, handleCors } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "";
const ADMIN_PASSWORD = Deno.env.get("ADMIN_PASSWORD") || "";
const ADMIN_NAME = Deno.env.get("ADMIN_NAME") || "";
const DELETE_USER_PASSWORD = Deno.env.get("DELETE_USER_PASSWORD") || "";

serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Create a Supabase client with admin privileges
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { action, ...params } = await req.json();

    console.log(`Admin function called with action: ${action}`);

    // Get secrets for authentication or other admin tasks
    if (action === "get_secrets") {
      return new Response(
        JSON.stringify({
          ADMIN_EMAIL,
          ADMIN_PASSWORD,
          ADMIN_NAME,
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Delete a user
    else if (action === "delete_user") {
      const { userId, password } = params;

      if (!userId) {
        return new Response(JSON.stringify({ error: "User ID is required" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }

      if (!password) {
        return new Response(JSON.stringify({ error: "Password is required" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }

      if (password !== DELETE_USER_PASSWORD) {
        return new Response(JSON.stringify({ error: "Invalid password" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 403,
        });
      }

      // Delete the user
      const { error: authDeleteError } = await supabase.auth.admin.deleteUser(userId);
      
      if (authDeleteError) {
        console.error("Error deleting user from auth:", authDeleteError);
        return new Response(JSON.stringify({ error: "Failed to delete user from auth: " + authDeleteError.message }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }

      // Additionally, delete from users table (should cascade with RLS)
      const { error: dbDeleteError } = await supabase
        .from("users")
        .delete()
        .eq("id", userId);

      if (dbDeleteError) {
        console.error("Error deleting user from database:", dbDeleteError);
        return new Response(JSON.stringify({ error: "User deleted from auth but failed to delete from database: " + dbDeleteError.message }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }

      return new Response(JSON.stringify({ success: true, message: "User deleted successfully" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Send a warning to a user
    else if (action === "send_warning") {
      const { userId, message } = params;

      if (!userId || !message) {
        return new Response(JSON.stringify({ error: "User ID and message are required" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }

      // Check if the user exists
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("email")
        .eq("id", userId)
        .single();

      if (userError) {
        console.error("Error fetching user:", userError);
        return new Response(JSON.stringify({ error: "User not found" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        });
      }

      // Create the warning
      const { data: warningData, error: warningError } = await supabase
        .from("warnings")
        .insert({
          user_id: userId,
          message,
          admin_email: ADMIN_EMAIL,
        })
        .select();

      if (warningError) {
        console.error("Error creating warning:", warningError);
        return new Response(JSON.stringify({ error: "Failed to create warning" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }

      return new Response(JSON.stringify({ success: true, data: warningData }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Add user to Hall of Fame
    else if (action === "add_to_hall_of_fame") {
      const { userId, name, amount } = params;

      if (!name || !amount) {
        return new Response(JSON.stringify({ error: "Name and amount are required" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }

      // Create the Hall of Fame entry
      const { data: hofData, error: hofError } = await supabase
        .from("hall_of_fame")
        .insert({
          user_id: userId || null,
          name,
          amount,
        })
        .select();

      if (hofError) {
        console.error("Error adding to Hall of Fame:", hofError);
        return new Response(JSON.stringify({ error: "Failed to add to Hall of Fame" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }

      return new Response(JSON.stringify({ success: true, data: hofData }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Delete warning
    else if (action === "delete_warning") {
      const { warningId } = params;

      if (!warningId) {
        return new Response(JSON.stringify({ error: "Warning ID is required" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }

      // Delete the warning
      const { error: deleteError } = await supabase
        .from("warnings")
        .delete()
        .eq("id", warningId);

      if (deleteError) {
        console.error("Error deleting warning:", deleteError);
        return new Response(JSON.stringify({ error: "Failed to delete warning" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }

      return new Response(JSON.stringify({ success: true, message: "Warning deleted successfully" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    else {
      return new Response(JSON.stringify({ error: "Invalid action" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
  } catch (error) {
    console.error("Error in auth-admin function:", error);
    return new Response(JSON.stringify({ error: error.message || "An unexpected error occurred" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
