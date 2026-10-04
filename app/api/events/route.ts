import { NextResponse } from 'next/server';
import { createAdminClient, isSupabaseConfigured } from '@/lib/supabase/admin';
import { siteConfig, type WeddingEvent } from '@/lib/site-config';

interface DbEventRow {
  id: string;
  name: string;
  event_date: string;
  event_time?: string | null;
  location: string;
  venue_name?: string | null;
  gps_url?: string | null;
  notes?: string | null;
  sort_order?: number;
  attendance_key?: string;
}

function dbRowToWeddingEvent(row: DbEventRow): WeddingEvent {
  return {
    id: row.id,
    name: row.name,
    eventDate: row.event_date || '2026-12-12',
    eventTime: row.event_time || null,
    location: row.location || '',
    venueName: row.venue_name || null,
    gpsUrl: row.gps_url || null,
    notes: row.notes || null,
    sortOrder: row.sort_order ?? 1,
    attendanceKey: (row.attendance_key as 'traditional' | 'white') || 'traditional',
  };
}

function weddingEventToDbRow(event: any): DbEventRow {
  return {
    id: event.id,
    name: event.name,
    event_date: event.eventDate ?? event.event_date ?? '2026-12-12',
    event_time: event.eventTime ?? event.event_time ?? null,
    location: event.location || '',
    venue_name: event.venueName ?? event.venue_name ?? null,
    gps_url: event.gpsUrl ?? event.gps_url ?? null,
    notes: event.notes ?? null,
    sort_order: event.sortOrder ?? event.sort_order ?? 1,
    attendance_key: event.attendanceKey ?? event.attendance_key ?? 'traditional',
  };
}

export async function GET() {
  try {
    if (isSupabaseConfigured()) {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('site_events')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) {
        const events = data.map((row) => dbRowToWeddingEvent(row as DbEventRow));
        return NextResponse.json({ success: true, events });
      }

      // Auto-seed initial siteConfig.events into Supabase if empty
      if (!error && data && data.length === 0) {
        const seedRows = siteConfig.events.map(weddingEventToDbRow);
        await supabase.from('site_events').upsert(seedRows);
        const reQuery = await supabase.from('site_events').select('*').order('sort_order', { ascending: true });
        if (reQuery.data && reQuery.data.length > 0) {
          const events = reQuery.data.map((row) => dbRowToWeddingEvent(row as DbEventRow));
          return NextResponse.json({ success: true, events });
        }
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
    const dbRows = events.map(weddingEventToDbRow);
    const { error } = await supabase.from('site_events').upsert(dbRows);

    if (error) {
      console.error('[Events POST Supabase error]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data } = await supabase.from('site_events').select('*').order('sort_order', { ascending: true });
    const formattedEvents =
      data && data.length > 0
        ? data.map((row) => dbRowToWeddingEvent(row as DbEventRow))
        : events;

    return NextResponse.json({ success: true, events: formattedEvents });
  } catch (err) {
    console.error('[Events API Error]', err);
    return NextResponse.json({ error: 'Failed to update events in Supabase' }, { status: 500 });
  }
}
