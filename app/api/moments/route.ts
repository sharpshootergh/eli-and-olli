import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { MOCK_MOMENTS } from '@/lib/mockData';
import type { MomentMedia } from '@/lib/types';

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('moments_photos')
      .select('*')
      .order('sort_order', { ascending: true });

    if (!error && data && data.length > 0) {
      const items = data.map((row) => ({
        ...row,
        media_type: row.media_type || 'image',
        thumbnail_url: row.thumbnail_url ?? null,
      }));
      return NextResponse.json({ success: true, moments: items });
    }
  } catch (err) {
    console.error('[Moments GET Error]', err);
  }

  return NextResponse.json({ success: true, moments: MOCK_MOMENTS });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { moment, moments } = body;
    const supabase = createAdminClient();

    const sanitizeMoment = (m: Partial<MomentMedia>) => {
      const { id, image_url, media_type, thumbnail_url, caption, sort_order } = m;
      const validId = id && !id.startsWith('moment-') ? id : undefined;
      return {
        ...(validId ? { id: validId } : {}),
        image_url,
        media_type: media_type || 'image',
        thumbnail_url: thumbnail_url ?? null,
        caption: caption ?? null,
        sort_order: sort_order || 1,
      };
    };

    if (moment) {
      const payload = sanitizeMoment(moment);
      const { error } = await supabase.from('moments_photos').upsert(payload);
      if (error) {
        console.error('[Moments POST error]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else if (Array.isArray(moments)) {
      const payload = moments.map(sanitizeMoment);
      const { error } = await supabase.from('moments_photos').upsert(payload);
      if (error) {
        console.error('[Moments POST items error]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    const { data } = await supabase.from('moments_photos').select('*').order('sort_order', { ascending: true });
    return NextResponse.json({ success: true, moments: data || [] });
  } catch (err) {
    console.error('[Moments API Error]', err);
    return NextResponse.json({ error: 'Failed to update moments in Supabase' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    if (!id.startsWith('moment-')) {
      const { error } = await supabase.from('moments_photos').delete().eq('id', id);
      if (error) {
        console.error('[Moments DELETE error]', error);
      }
    }

    const { data } = await supabase.from('moments_photos').select('*').order('sort_order', { ascending: true });
    return NextResponse.json({ success: true, moments: data || [] });
  } catch (err) {
    console.error('[Moments Delete Error]', err);
    return NextResponse.json({ error: 'Failed to delete moment from Supabase' }, { status: 500 });
  }
}
