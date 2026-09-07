import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { MOCK_CATEGORIES } from '@/lib/mockData';
import type { Category } from '@/lib/types';

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (!error && data && data.length > 0) {
      return NextResponse.json({ success: true, categories: data });
    }
  } catch (err) {
    console.error('[Categories GET Error]', err);
  }

  return NextResponse.json({ success: true, categories: MOCK_CATEGORIES });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { category, categories } = body;
    const supabase = createAdminClient();

    const sanitizeCategory = (c: Partial<Category>) => {
      const { id, name, sort_order } = c;
      const validId = id && !id.startsWith('cat-') ? id : undefined;
      return {
        ...(validId ? { id: validId } : {}),
        name: name || 'Category',
        sort_order: sort_order || 1,
      };
    };

    if (category) {
      const payload = sanitizeCategory(category);
      const { error } = await supabase.from('categories').upsert(payload);
      if (error) {
        console.error('[Categories POST error]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else if (Array.isArray(categories)) {
      const payload = categories.map(sanitizeCategory);
      const { error } = await supabase.from('categories').upsert(payload);
      if (error) {
        console.error('[Categories POST items error]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    const { data } = await supabase.from('categories').select('*').order('sort_order', { ascending: true });
    return NextResponse.json({ success: true, categories: data || [] });
  } catch (err) {
    console.error('[Categories API Error]', err);
    return NextResponse.json({ error: 'Failed to update categories in Supabase' }, { status: 500 });
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
    if (!id.startsWith('cat-')) {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) {
        console.error('[Categories DELETE error]', error);
      }
    }

    const { data } = await supabase.from('categories').select('*').order('sort_order', { ascending: true });
    return NextResponse.json({ success: true, categories: data || [] });
  } catch (err) {
    console.error('[Categories Delete Error]', err);
    return NextResponse.json({ error: 'Failed to delete category from Supabase' }, { status: 500 });
  }
}
