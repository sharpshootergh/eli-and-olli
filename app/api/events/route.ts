import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { siteConfig, type WeddingEvent } from '@/lib/site-config';
import fs from 'fs';
import path from 'path';

const EVENTS_FILE = path.join('/tmp', 'wedding_events_store.json');

function readFallbackEvents(): WeddingEvent[] {
  try {
    if (fs.existsSync(EVENTS_FILE)) {
      const raw = fs.readFileSync(EVENTS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Ignore read errors
  }
  return siteConfig.events;
}

function writeFallbackEvents(events: WeddingEvent[]) {
  try {
    fs.writeFileSync(EVENTS_FILE, JSON.stringify(events, null, 2), 'utf-8');
  } catch {
    // Ignore write errors in read-only envs
  }
}

export async function GET() {
  const fallback = readFallbackEvents();
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('site_events')
      .select('*')
      .order('sort_order', { ascending: true });

    if (!error && data && data.length > 0) {
      return NextResponse.json({ success: true, events: data });
    }
  } catch {
    // DB unconfigured
  }

  return NextResponse.json({ success: true, events: fallback });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { events } = body;

    if (!Array.isArray(events) || events.length === 0) {
      return NextResponse.json({ error: 'Valid events array required' }, { status: 400 });
    }

    // 1. Save to persistent disk fallback store
    writeFallbackEvents(events);

    // 2. Try saving to Supabase DB if connected
    try {
      const supabase = createAdminClient();
      await supabase.from('site_events').upsert(events);
    } catch {
      // Handled via fallback store
    }

    return NextResponse.json({ success: true, events });
  } catch (err) {
    console.error('[Events API Error]', err);
    return NextResponse.json({ error: 'Failed to update events' }, { status: 500 });
  }
}
