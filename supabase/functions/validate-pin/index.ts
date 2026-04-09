/**
 * validate-pin — Supabase Edge Function
 * ============================================================================
 * Validates a 4-digit PIN against the buildings table using the service role
 * key (never exposed to the browser). Returns building_id + payee_id on
 * success, or a 401 error on failure.
 *
 * POST /functions/v1/validate-pin
 * Body: { "pin": "1234" }
 *
 * Success response (200):
 *   { "building_id": "uuid", "payee_id": "uuid" }
 *
 * Error responses:
 *   401 { "error": "Invalid PIN" }
 *   400 { "error": "PIN is required" }
 *   405 { "error": "Method not allowed" }
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  let pin: string | undefined;
  try {
    const body = await req.json();
    pin = body?.pin;
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON body' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  if (!pin || typeof pin !== 'string' || pin.trim().length === 0) {
    return new Response(
      JSON.stringify({ error: 'PIN is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  // Only allow exactly 4 digits — reject anything else early
  if (!/^\d{4}$/.test(pin.trim())) {
    return new Response(
      JSON.stringify({ error: 'Invalid PIN' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  // Use the service role key — this runs server-side only, never in the browser
  const supabaseUrl    = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase
    .from('buildings')
    .select('id, payee_id')
    .eq('pin_code', pin.trim())
    .maybeSingle();

  if (error) {
    console.error('[validate-pin] DB error:', error.message);
    return new Response(
      JSON.stringify({ error: 'Server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  if (!data) {
    return new Response(
      JSON.stringify({ error: 'Invalid PIN' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  return new Response(
    JSON.stringify({ building_id: data.id, payee_id: data.payee_id }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  );
});
