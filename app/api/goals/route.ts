import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { MOCK_GOALS } from '@/lib/mockData';

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .order('sort_order', { ascending: true });

    if (!error && data && data.length > 0) {
      return NextResponse.json({ success: true, goals: data });
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

    if (goal) {
      const { error } = await supabase.from('goals').upsert(goal);
      if (error) {
        console.error('[Goals POST error]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else if (Array.isArray(goals)) {
      const { error } = await supabase.from('goals').upsert(goals);
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
    const { error } = await supabase.from('goals').delete().eq('id', id);

    if (error) {
      console.error('[Goals DELETE error]', error);
    }

    const { data } = await supabase.from('goals').select('*').order('sort_order', { ascending: true });
    return NextResponse.json({ success: true, goals: data || [] });
  } catch (err) {
    console.error('[Goals Delete Error]', err);
    return NextResponse.json({ error: 'Failed to delete goal from Supabase' }, { status: 500 });
  }
}
