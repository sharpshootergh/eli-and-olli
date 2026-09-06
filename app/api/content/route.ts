import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { SiteMedia } from '@/lib/types';
import fs from 'fs';
import path from 'path';

const MEDIA_FILE = path.join('/tmp', 'wedding_media_store.json');

function readFallbackMedia(): SiteMedia[] {
  try {
    if (fs.existsSync(MEDIA_FILE)) {
      const raw = fs.readFileSync(MEDIA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Ignore read errors
  }
  return [];
}

function writeFallbackMedia(items: SiteMedia[]) {
  try {
    fs.writeFileSync(MEDIA_FILE, JSON.stringify(items, null, 2), 'utf-8');
  } catch {
    // Ignore write errors
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const section = searchParams.get('section');

  const fallback = readFallbackMedia();
  let dbItems: SiteMedia[] = [];

  try {
    const supabase = createAdminClient();
    let query = supabase.from('site_media').select('*').order('sort_order', { ascending: true });
    if (section) {
      query = query.eq('section', section);
    }
    const { data, error } = await query;
    if (!error && data) {
      dbItems = data as SiteMedia[];
    }
  } catch {
    // DB unconfigured
  }

  const mergedMap = new Map<string, SiteMedia>();
  [...fallback, ...dbItems].forEach((item) => {
    if (!section || item.section === section) {
      mergedMap.set(item.id, item);
    }
  });

  const items = Array.from(mergedMap.values()).sort((a, b) => a.sort_order - b.sort_order);

  return NextResponse.json({ success: true, items });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { item, items } = body;

    let current = readFallbackMedia();

    if (Array.isArray(items)) {
      current = items;
    } else if (item) {
      const idx = current.findIndex((i) => i.id === item.id);
      if (idx >= 0) {
        current[idx] = { ...current[idx], ...item };
      } else {
        current.push({
          ...item,
          id: item.id || `media-${Date.now()}`,
          sort_order: item.sort_order || current.length + 1,
        });
      }
    }

    writeFallbackMedia(current);

    try {
      const supabase = createAdminClient();
      if (item) {
        await supabase.from('site_media').upsert(item);
      } else if (Array.isArray(items)) {
        await supabase.from('site_media').upsert(items);
      }
    } catch {
      // Supabase unconfigured
    }

    return NextResponse.json({ success: true, items: current });
  } catch (err) {
    console.error('[Content API Error]', err);
    return NextResponse.json({ error: 'Failed to save site media' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID parameter required' }, { status: 400 });
    }

    const current = readFallbackMedia();
    const filtered = current.filter((item) => item.id !== id);
    writeFallbackMedia(filtered);

    try {
      const supabase = createAdminClient();
      await supabase.from('site_media').delete().eq('id', id);
    } catch {
      // Supabase unconfigured
    }

    return NextResponse.json({ success: true, items: filtered });
  } catch (err) {
    console.error('[Content Delete Error]', err);
    return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 });
  }
}
