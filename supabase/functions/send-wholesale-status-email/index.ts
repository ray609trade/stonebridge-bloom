import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function findOrCreateContact(apiKey: string, email: string, name?: string): Promise<string | null> {
  // Try to find existing contact
  const lookupRes = await fetch(`https://rest.gohighlevel.com/v1/contacts/lookup?email=${encodeURIComponent(email)}`, {
    headers: { 'Authorization': `Bearer ${apiKey}` },
  });
  
  if (lookupRes.ok) {
    const data = await lookupRes.json();
    if (data?.contacts?.[0]?.id) {
      return data.contacts[0].id;
    }
  }

  // Create contact if not found
  const createRes = await fetch('https://rest.gohighlevel.com/v1/contacts/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      name: name || email,
      source: 'Stonebridge Bagels Wholesale',
    }),
  });

  if (createRes.ok) {
    const data = await createRes.json();
    return data?.contact?.id || null;
  }

  console.error('Failed to create GHL contact:', await createRes.text());
  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GHL_API_KEY = Deno.env.get('GHL_API_KEY');
    if (!GHL_API_KEY) {
      throw new Error('GoHighLevel API key not configured');
    }

    const { email, contactName, businessName, status } = await req.json();

    if (!email || !status) {
      return new Response(
        JSON.stringify({ error: 'email and status are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Ensure recipient exists as a GHL contact
    const contactId = await findOrCreateContact(GHL_API_KEY, email, contactName || businessName);
    if (!contactId) {
      return new Response(
        JSON.stringify({ success: false, reason: 'contact_not_created', message: 'Could not find or create GHL contact' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const isApproved = status === 'approved';

    const subject = isApproved
      ? 'Your Wholesale Application Has Been Approved! | Stonebridge Bagels'
      : 'Wholesale Application Update | Stonebridge Bagels';

    const emailBody = isApproved
      ? `
Hi ${contactName || 'there'},

Great news! Your wholesale application for ${businessName || 'your business'} has been approved. 🎉

You can now log in to our wholesale portal to browse products and place orders:
https://stonebridgebagels.com/wholesale/login

We're excited to partner with you!

— Stonebridge Bagels
`.trim()
      : `
Hi ${contactName || 'there'},

Thank you for your interest in partnering with Stonebridge Bagels.

Unfortunately, we're unable to approve your wholesale application for ${businessName || 'your business'} at this time.

If you have any questions or would like to discuss further, please don't hesitate to reach out to us.

— Stonebridge Bagels
`.trim();

    const ghlResponse = await fetch('https://rest.gohighlevel.com/v1/conversations/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GHL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'Email',
        contactId,
        subject,
        message: emailBody,
      }),
    });

    const ghlResult = await ghlResponse.json();

    if (!ghlResponse.ok) {
      console.error('GoHighLevel email error:', ghlResult);
      return new Response(
        JSON.stringify({ success: false, reason: 'ghl_error', message: ghlResult.message || 'Failed to send email' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Wholesale ${status} email sent to ${email}`);

    return new Response(
      JSON.stringify({ success: true, to: email }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error sending wholesale status email:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to send status email' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
