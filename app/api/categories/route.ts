import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { MOCK_CATEGORIES } from '@/lib/mockData';
import type { Category } from '@/lib/types';
import { readJson, writeJson } from '@/lib/storage';

const STORAGE_FILE = 'wedding_categories_store.json';

function readFallbackCategories(): Category[] {
  return readJson<Category[]>(STORAGE_FILE, MOCK_CATEGORIES);
}

function writeFallbackCategories(categories: Category[]) {
  writeJson(STORAGE_FILE, categories);
}

export async function GET() {
  const fallback = readFallbackCategories();
  let dbItems: Category[] = [];

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (!error && data && data.length > 0) {
      dbItems = data as Category[];
    }
  } catch {
    // DB unconfigured
  }

  const items = dbItems.length > 0 ? dbItems : fallback;
  return NextResponse.json({ success: true, categories: items });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { category, categories } = body;

    let current = readFallbackCategories();

    if (Array.isArray(categories)) {
      current = categories;
    } else if (category) {
      const idx = current.findIndex((c) => c.id === category.id);
      if (idx >= 0) {
        current[idx] = { ...current[idx], ...category };
      } else {
        const generatedId = category.id || `cat-${Date.now()}`;
        current.push({ ...category, id: generatedId });
      }
    }

    writeFallbackCategories(current);

    try {
      const supabase = createAdminClient();
      if (category) {
        await supabase.from('categories').upsert(category);
      } else if (Array.isArray(categories)) {
        await supabase.from('categories').upsert(categories);
      }
    } catch {
      // Supabase unconfigured
    }

    return NextResponse.json({ success: true, categories: current });
  } catch (err) {
    console.error('[Categories API Error]', err);
    return NextResponse.json({ error: 'Failed to update categories' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const current = readFallbackCategories();
    const filtered = current.filter((c) => c.id !== id);
    writeFallbackCategories(filtered);

    try {
      const supabase = createAdminClient();
      await supabase.from('categories').delete().eq('id', id);
    } catch {
      // Supabase unconfigured
    }

    return NextResponse.json({ success: true, categories: filtered });
  } catch (err) {
    console.error('[Categories Delete Error]', err);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
