import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { siteConfig, type WeddingEvent } from '@/lib/site-config';

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('site_events')
      .select('*')
      .order('sort_order', { ascending: true });

    if (!error && data && data.length > 0) {
      return NextResponse.json({ success: true, events: data });
    }

    // Auto-seed initial siteConfig.events into Supabase if empty
    if (!error && data && data.length === 0) {
      await supabase.from('site_events').upsert(siteConfig.events);
      const reQuery = await supabase.from('site_events').select('*').order('sort_order', { ascending: true });
      if (reQuery.data && reQuery.data.length > 0) {
        return NextResponse.json({ success: true, events: reQuery.data });
      }
    }
  } catch (err) {
    console.error('[Events GET Error]', err);
  }

  return NextResponse.json({ success: true, events: siteConfig.events });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { events } = body;

    if (!Array.isArray(events) || events.length === 0) {
      return NextResponse.json({ error: 'Valid events array required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from('site_events').upsert(events);

    if (error) {
      console.error('[Events POST Supabase error]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data } = await supabase.from('site_events').select('*').order('sort_order', { ascending: true });
    return NextResponse.json({ success: true, events: data || events });
  } catch (err) {
    console.error('[Events API Error]', err);
    return NextResponse.json({ error: 'Failed to update events in Supabase' }, { status: 500 });
  }
}
