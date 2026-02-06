import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Check if admin user already exists
    const { data: existingUser } = await supabase.auth.admin.listUsers();
    const adminExists = existingUser?.users?.some(
      (u) => u.email === "steven@stonebridgebagels.com"
    );

    if (adminExists) {
      // User exists, just ensure they have admin role
      const user = existingUser?.users?.find(
        (u) => u.email === "steven@stonebridgebagels.com"
      );
      
      if (user) {
        // Check if admin role exists
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("*")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .single();

        if (!roleData) {
          await supabase.from("user_roles").insert({
            user_id: user.id,
            role: "admin",
          });
        }
      }

      return new Response(
        JSON.stringify({ message: "Admin user already exists", success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create the admin user
    const { data: newUser, error: createError } =
      await supabase.auth.admin.createUser({
        email: "steven@stonebridgebagels.com",
        password: "makeamericagreat2026",
        email_confirm: true,
      });

    if (createError) {
      throw createError;
    }

    // Add admin role
    const { error: roleError } = await supabase.from("user_roles").insert({
      user_id: newUser.user.id,
      role: "admin",
    });

    if (roleError) {
      throw roleError;
    }

    return new Response(
      JSON.stringify({
        message: "Admin user created successfully",
        success: true,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error creating admin user:", error);
    return new Response(
      JSON.stringify({ error: error.message, success: false }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
