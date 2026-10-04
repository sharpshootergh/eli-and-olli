import { NextResponse } from 'next/server';
import { createAdminClient, isSupabaseConfigured } from '@/lib/supabase/admin';
import { MOCK_GOALS } from '@/lib/mockData';
import type { Goal } from '@/lib/types';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isUuid(id?: string | null): boolean {
  return Boolean(id && UUID_REGEX.test(id));
}

export async function GET() {
  try {
    if (isSupabaseConfigured()) {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!error && data) {
        return NextResponse.json({ success: true, goals: data });
      }
    }
  } catch (err) {
    console.error('[Goals GET Error]', err);
  }

  return NextResponse.json({ success: true, goals: MOCK_GOALS });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { goal, goals } = body;
    const supabase = createAdminClient();

    const sanitizeGoal = (g: Partial<Goal>) => {
      const { id, category_id, title, description, image_url, type, target_amount, amount_raised, contributor_count, sort_order } = g;
      const validId = isUuid(id) ? id : undefined;
      const validCatId = isUuid(category_id) ? category_id : '11111111-1111-4111-a111-111111111101';
      return {
        ...(validId ? { id: validId } : {}),
        category_id: validCatId,
        title: title || 'Registry Item',
        description: description ?? null,
        image_url: image_url ?? null,
        type: type || 'open',
        target_amount: target_amount ?? null,
        amount_raised: amount_raised || 0,
        contributor_count: contributor_count || 0,
        sort_order: sort_order || 1,
      };
    };

    if (goal) {
      const payload = sanitizeGoal(goal);
      const { error } = await supabase.from('goals').upsert(payload);
      if (error) {
        console.error('[Goals POST error]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else if (Array.isArray(goals)) {
      const payload = goals.map(sanitizeGoal);
      const { error } = await supabase.from('goals').upsert(payload);
      if (error) {
        console.error('[Goals POST items error]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    const { data } = await supabase.from('goals').select('*').order('sort_order', { ascending: true });
    return NextResponse.json({ success: true, goals: data || [] });
  } catch (err) {
    console.error('[Goals API Error]', err);
    return NextResponse.json({ error: 'Failed to update registry goals in Supabase' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Goal id is required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    if (isUuid(id)) {
      const { error } = await supabase.from('goals').delete().eq('id', id);
      if (error) {
        console.error('[Goals DELETE error]', error);
      }
    }

    const { data } = await supabase.from('goals').select('*').order('sort_order', { ascending: true });
    return NextResponse.json({ success: true, goals: data || [] });
  } catch (err) {
    console.error('[Goals Delete Error]', err);
    return NextResponse.json({ error: 'Failed to delete goal from Supabase' }, { status: 500 });
  }
}
