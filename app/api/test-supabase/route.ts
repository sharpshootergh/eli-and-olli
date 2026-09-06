import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const isConfigured = Boolean(
    url &&
    !url.includes('placeholder') &&
    url.startsWith('https://') &&
    serviceKey &&
    !serviceKey.includes('placeholder')
  );

  if (!isConfigured) {
    return NextResponse.json({
      working: false,
      status: 'UNCONFIGURED',
      message: 'Supabase credentials are missing or set to placeholder values in Vercel Environment Variables.',
      environmentCheck: {
        hasSupabaseUrl: Boolean(url && !url.includes('placeholder')),
        hasAnonKey: Boolean(anonKey && !anonKey.includes('placeholder')),
        hasServiceRoleKey: Boolean(serviceKey && !serviceKey.includes('placeholder')),
        currentUrl: url || 'Not set',
      },
      howToFix: [
        '1. Go to your Supabase project dashboard (https://supabase.com/dashboard).',
        '2. Copy Project URL, anon key, and service_role key from Settings -> API.',
        '3. Add NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY in Vercel Project Settings -> Environment Variables.',
        '4. Redeploy project on Vercel.',
      ],
    });
  }

  try {
    const supabase = createAdminClient();
    
    // Test table queries
    const { data: rsvpsData, error: rsvpsErr } = await supabase.from('rsvps').select('id').limit(1);
    const { data: goalsData, error: goalsErr } = await supabase.from('goals').select('id').limit(1);
    const { data: eventsData, error: eventsErr } = await supabase.from('site_events').select('id').limit(1);

    const isConnected = !rsvpsErr && !goalsErr;

    return NextResponse.json({
      working: isConnected,
      status: isConnected ? 'HEALTHY_AND_CONNECTED' : 'SCHEMA_OR_CONNECTION_ERROR',
      supabaseUrl: url,
      tableStatus: {
        rsvpsTable: rsvpsErr ? `Error: ${rsvpsErr.message}` : 'Accessible',
        goalsTable: goalsErr ? `Error: ${goalsErr.message}` : 'Accessible',
        eventsTable: eventsErr ? `Notice: ${eventsErr.message}` : 'Accessible',
      },
      message: isConnected
        ? '✅ Supabase database is connected, healthy, and working perfectly!'
        : '⚠️ Connected to Supabase URL, but database tables (schema.sql) need to be created in Supabase SQL Editor.',
    });
  } catch (err) {
    return NextResponse.json({
      working: false,
      status: 'CONNECTION_FAILED',
      error: err instanceof Error ? err.message : String(err),
      message: 'Failed to connect to Supabase database instance.',
    });
  }
}
