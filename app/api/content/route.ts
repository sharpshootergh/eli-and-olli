import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { SiteMedia } from '@/lib/types';
import fs from 'fs';
import path from 'path';

const MEDIA_FILE = path.join('/tmp', 'wedding_media_store.json');

export const DEFAULT_SITE_MEDIA: SiteMedia[] = [
  {
    id: 'hero-1',
    section: 'hero',
    media_url: '/hero/TBC5-72377c25-44f5-4487-90a6-32e6285327f6.jpg',
    mobile_media_url: null,
    media_type: 'image',
    video_provider: 'file',
    caption: 'Hero photo 1',
    object_position: 'center 25%',
    mobile_object_position: 'center 25%',
    sort_order: 1,
  },
  {
    id: 'hero-2',
    section: 'hero',
    media_url: '/hero/TBC140-9c898793-a28e-41bb-a3b2-c0f640100ae9.jpg',
    mobile_media_url: null,
    media_type: 'image',
    video_provider: 'file',
    caption: 'Hero photo 2',
    object_position: 'center 25%',
    mobile_object_position: 'center 25%',
    sort_order: 2,
  },
  {
    id: 'hero-3',
    section: 'hero',
    media_url: '/hero/TBC267-95769264-776e-42ff-8a97-d3d8e19b498f.jpg',
    mobile_media_url: null,
    media_type: 'image',
    video_provider: 'file',
    caption: 'Hero photo 3',
    object_position: 'center 25%',
    mobile_object_position: 'center 25%',
    sort_order: 3,
  },
  {
    id: 'hero-4',
    section: 'hero',
    media_url: '/hero/TBC77-1e1ed5ff-242f-42b1-82ab-3a5b0b0560b1.jpg',
    mobile_media_url: null,
    media_type: 'image',
    video_provider: 'file',
    caption: 'Hero photo 4',
    object_position: 'center 25%',
    mobile_object_position: 'center 25%',
    sort_order: 4,
  },
  {
    id: 'hero-5',
    section: 'hero',
    media_url: '/hero/TBC171-5be6d6b0-ceb7-45c3-a0ba-d7bb1c37a0d0.jpg',
    mobile_media_url: null,
    media_type: 'image',
    video_provider: 'file',
    caption: 'Hero photo 5',
    object_position: 'center 25%',
    mobile_object_position: 'center 25%',
    sort_order: 5,
  },
  {
    id: 'hero-6',
    section: 'hero',
    media_url: '/hero/TBC-90ef3dd1-4489-43a6-82e5-0b53e9280206.jpg',
    mobile_media_url: null,
    media_type: 'image',
    video_provider: 'file',
    caption: 'Hero photo 6',
    object_position: 'center 25%',
    mobile_object_position: 'center 25%',
    sort_order: 6,
  },
  {
    id: 'hero-7',
    section: 'hero',
    media_url: '/hero/TBC288-8c168739-6060-41c1-b5e3-93b0581aa660.jpg',
    mobile_media_url: null,
    media_type: 'image',
    video_provider: 'file',
    caption: 'Hero photo 7',
    object_position: 'center 25%',
    mobile_object_position: 'center 25%',
    sort_order: 7,
  },
  {
    id: 'hero-8',
    section: 'hero',
    media_url: '/hero/TBC84-49a49f9e-d683-41a7-97f8-a0905f77cd1f.jpg',
    mobile_media_url: null,
    media_type: 'image',
    video_provider: 'file',
    caption: 'Hero photo 8',
    object_position: 'center 25%',
    mobile_object_position: 'center 25%',
    sort_order: 8,
  },
  {
    id: 'hero-9',
    section: 'hero',
    media_url: '/hero/TBC244-423318dc-84da-459a-beab-47e134803a4d.jpg',
    mobile_media_url: null,
    media_type: 'image',
    video_provider: 'file',
    caption: 'Hero photo 9',
    object_position: 'center 25%',
    mobile_object_position: 'center 25%',
    sort_order: 9,
  },
  {
    id: 'hero-10',
    section: 'hero',
    media_url: '/hero/TBC17-9734aa80-3a09-4d7e-98d1-3059177cdaa4.jpg',
    mobile_media_url: null,
    media_type: 'image',
    video_provider: 'file',
    caption: 'Hero photo 10',
    object_position: 'center 25%',
    mobile_object_position: 'center 25%',
    sort_order: 10,
  },
  {
    id: 'hero-11',
    section: 'hero',
    media_url: '/hero/TBC235-3bba5f4b-b5a2-4db4-bf7a-19d3e72233d4.jpg',
    mobile_media_url: null,
    media_type: 'image',
    video_provider: 'file',
    caption: 'Hero photo 11',
    object_position: 'center 25%',
    mobile_object_position: 'center 25%',
    sort_order: 11,
  },
  {
    id: 'story-1',
    section: 'story',
    media_url: '/hero/TBC288-8c168739-6060-41c1-b5e3-93b0581aa660.jpg',
    mobile_media_url: null,
    media_type: 'image',
    video_provider: 'file',
    caption: 'Elisha & Ollidia',
    object_position: 'left',
    mobile_object_position: 'center',
    sort_order: 1,
  },
  {
    id: 'story-2',
    section: 'story',
    media_url: '/hero/TBC140-9c898793-a28e-41bb-a3b2-c0f640100ae9.jpg',
    mobile_media_url: null,
    media_type: 'image',
    video_provider: 'file',
    caption: 'Celebrating together',
    object_position: 'left',
    mobile_object_position: 'center',
    sort_order: 2,
  },
];

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
  // Initialize with defaults if empty
  writeFallbackMedia(DEFAULT_SITE_MEDIA);
  return DEFAULT_SITE_MEDIA;
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

  let fallback = readFallbackMedia();
  if (fallback.length === 0) {
    fallback = DEFAULT_SITE_MEDIA;
    writeFallbackMedia(fallback);
  }

  let dbItems: SiteMedia[] = [];

  try {
    const supabase = createAdminClient();
    let query = supabase.from('site_media').select('*').order('sort_order', { ascending: true });
    if (section) {
      query = query.eq('section', section);
    }
    const { data, error } = await query;
    if (!error && data) {
      if (data.length === 0) {
        // Seed default items into DB if database is empty
        try {
          const itemsToInsert = section
            ? DEFAULT_SITE_MEDIA.filter((item) => item.section === section)
            : DEFAULT_SITE_MEDIA;
          await supabase.from('site_media').upsert(itemsToInsert);
          dbItems = itemsToInsert;
        } catch {
          // Ignore seed error
        }
      } else {
        dbItems = data as SiteMedia[];
      }
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

