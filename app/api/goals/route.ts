import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { MOCK_GOALS } from '@/lib/mockData';
import type { Goal } from '@/lib/types';
import fs from 'fs';
import path from 'path';

const GOALS_FILE = path.join('/tmp', 'wedding_goals_store.json');

function readFallbackGoals(): Goal[] {
  try {
    if (fs.existsSync(GOALS_FILE)) {
      const raw = fs.readFileSync(GOALS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Fallback
  }
  return MOCK_GOALS;
}

function writeFallbackGoals(goals: Goal[]) {
  try {
    fs.writeFileSync(GOALS_FILE, JSON.stringify(goals, null, 2), 'utf-8');
  } catch {
    // Ignore write error
  }
}

export async function GET() {
  const fallback = readFallbackGoals();
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .order('sort_order', { ascending: true });

    if (!error && data && data.length > 0) {
      return NextResponse.json({ success: true, goals: data });
    }
  } catch {
    // DB unconfigured
  }

  return NextResponse.json({ success: true, goals: fallback });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { goal, goals } = body;

    let updatedList = readFallbackGoals();

    if (Array.isArray(goals)) {
      updatedList = goals;
    } else if (goal) {
      const index = updatedList.findIndex((g) => g.id === goal.id);
      if (index >= 0) {
        updatedList[index] = { ...updatedList[index], ...goal };
      } else {
        updatedList.unshift({
          ...goal,
          id: goal.id || `goal-${Date.now()}`,
          amount_raised: goal.amount_raised || 0,
          contributor_count: goal.contributor_count || 0,
        });
      }
    }

    // 1. Save to persistent fallback file
    writeFallbackGoals(updatedList);

    // 2. Try saving to Supabase if connected
    try {
      const supabase = createAdminClient();
      if (goal) {
        await supabase.from('goals').upsert(goal);
      } else if (Array.isArray(goals)) {
        await supabase.from('goals').upsert(goals);
      }
    } catch {
      // Supabase unconfigured
    }

    return NextResponse.json({ success: true, goals: updatedList });
  } catch (err) {
    console.error('[Goals API Error]', err);
    return NextResponse.json({ error: 'Failed to update registry goals' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Goal id is required' }, { status: 400 });
    }

    const current = readFallbackGoals();
    const filtered = current.filter((g) => g.id !== id);
    writeFallbackGoals(filtered);

    try {
      const supabase = createAdminClient();
      await supabase.from('goals').delete().eq('id', id);
    } catch {
      // Supabase unconfigured
    }

    return NextResponse.json({ success: true, goals: filtered });
  } catch (err) {
    console.error('[Goals Delete Error]', err);
    return NextResponse.json({ error: 'Failed to delete goal' }, { status: 500 });
  }
}
