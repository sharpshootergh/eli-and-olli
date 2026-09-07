import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { siteConfig, type WeddingEvent } from '@/lib/site-config';
import { readJson, writeJson } from '@/lib/storage';

const STORAGE_FILE = 'wedding_events_store.json';

function readFallbackEvents(): WeddingEvent[] {
  return readJson<WeddingEvent[]>(STORAGE_FILE, siteConfig.events);
}

function writeFallbackEvents(events: WeddingEvent[]) {
  writeJson(STORAGE_FILE, events);
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

    // 1. Save to persistent disk store
    writeFallbackEvents(events);

    // 2. Try saving to Supabase DB if connected
    try {
      const supabase = createAdminClient();
      await supabase.from('site_events').upsert(events);
    } catch {
      // Handled via persistent fallback store
    }

    return NextResponse.json({ success: true, events });
  } catch (err) {
    console.error('[Events API Error]', err);
    return NextResponse.json({ error: 'Failed to update events' }, { status: 500 });
  }
}
