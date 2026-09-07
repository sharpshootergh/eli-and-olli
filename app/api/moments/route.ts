import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { MOCK_MOMENTS } from '@/lib/mockData';
import type { MomentMedia } from '@/lib/types';
import { readJson, writeJson } from '@/lib/storage';

const STORAGE_FILE = 'wedding_moments_store.json';

function readFallbackMoments(): MomentMedia[] {
  return readJson<MomentMedia[]>(STORAGE_FILE, MOCK_MOMENTS);
}

function writeFallbackMoments(moments: MomentMedia[]) {
  writeJson(STORAGE_FILE, moments);
}

export async function GET() {
  const fallback = readFallbackMoments();
  let dbItems: MomentMedia[] = [];

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('moments_photos')
      .select('*')
      .order('sort_order', { ascending: true });

    if (!error && data && data.length > 0) {
      dbItems = data.map((row) => ({
        ...row,
        media_type: row.media_type || 'image',
        thumbnail_url: row.thumbnail_url ?? null,
      }));
    }
  } catch {
    // DB unconfigured
  }

  const items = dbItems.length > 0 ? dbItems : fallback;
  return NextResponse.json({ success: true, moments: items });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { moment, moments } = body;

    let current = readFallbackMoments();

    if (Array.isArray(moments)) {
      current = moments;
    } else if (moment) {
      const idx = current.findIndex((m) => m.id === moment.id);
      if (idx >= 0) {
        current[idx] = { ...current[idx], ...moment };
      } else {
        const generatedId = moment.id || `moment-${Date.now()}`;
        current.push({ ...moment, id: generatedId });
      }
    }

    writeFallbackMoments(current);

    try {
      const supabase = createAdminClient();
      if (moment) {
        await supabase.from('moments_photos').upsert(moment);
      } else if (Array.isArray(moments)) {
        await supabase.from('moments_photos').upsert(moments);
      }
    } catch {
      // Supabase unconfigured
    }

    return NextResponse.json({ success: true, moments: current });
  } catch (err) {
    console.error('[Moments API Error]', err);
    return NextResponse.json({ error: 'Failed to update moments' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const current = readFallbackMoments();
    const filtered = current.filter((m) => m.id !== id);
    writeFallbackMoments(filtered);

    try {
      const supabase = createAdminClient();
      await supabase.from('moments_photos').delete().eq('id', id);
    } catch {
      // Supabase unconfigured
    }

    return NextResponse.json({ success: true, moments: filtered });
  } catch (err) {
    console.error('[Moments Delete Error]', err);
    return NextResponse.json({ error: 'Failed to delete moment' }, { status: 500 });
  }
}
