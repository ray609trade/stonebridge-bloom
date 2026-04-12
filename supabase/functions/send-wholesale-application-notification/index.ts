import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GHL_API_KEY = Deno.env.get('GHL_API_KEY');
    if (!GHL_API_KEY) {
      throw new Error('GoHighLevel API key not configured');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get admin emails from user_roles + auth.users
    const { data: adminRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin');

    if (rolesError) throw rolesError;

    const adminEmails: string[] = [];
    for (const role of adminRoles || []) {
      const { data: userData } = await supabase.auth.admin.getUserById(role.user_id);
      if (userData?.user?.email) {
        adminEmails.push(userData.user.email);
      }
    }

    if (adminEmails.length === 0) {
      console.log('No admin emails found, skipping notification');
      return new Response(
        JSON.stringify({ success: false, reason: 'no_admins' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { businessName, contactName, email, phone, address } = await req.json();

    const emailBody = `
New Wholesale Application Received! 📋

Business: ${businessName}
Contact: ${contactName}
Email: ${email}
Phone: ${phone || 'Not provided'}
Address: ${address || 'Not provided'}

Log in to the admin dashboard to review and approve or reject this application.

— Stonebridge Bagels System
`.trim();

    // Send to each admin
    const results = [];
    for (const adminEmail of adminEmails) {
      try {
        const ghlResponse = await fetch('https://rest.gohighlevel.com/v1/conversations/messages', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GHL_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'Email',
            email: adminEmail,
            subject: `New Wholesale Application: ${businessName} | Stonebridge Bagels`,
            message: emailBody,
          }),
        });

        const ghlResult = await ghlResponse.json();
        results.push({ email: adminEmail, success: ghlResponse.ok, result: ghlResult });

        if (!ghlResponse.ok) {
          console.error(`Failed to notify admin ${adminEmail}:`, ghlResult);
        }
      } catch (err) {
        console.error(`Error notifying admin ${adminEmail}:`, err);
        results.push({ email: adminEmail, success: false, error: String(err) });
      }
    }

    console.log(`Wholesale application notification sent to ${results.filter(r => r.success).length}/${adminEmails.length} admins`);

    return new Response(
      JSON.stringify({ success: true, notified: results.filter(r => r.success).length }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error sending application notification:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to send notification' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
