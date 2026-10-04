import { NextResponse } from 'next/server';
import { createAdminClient, isSupabaseConfigured } from '@/lib/supabase/admin';
import { checkIsAdminRequest } from '@/lib/admin-guard';
import { MOCK_CONTRIBUTIONS } from '@/lib/mockData';
import type { Contribution } from '@/lib/types';

export async function GET(request: Request) {
  const isAdmin = await checkIsAdminRequest(request);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
  }

  try {
    if (isSupabaseConfigured()) {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('contributions')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return NextResponse.json({ success: true, contributions: data as Contribution[] });
      }
      if (error) {
        console.error('[Admin Contributions GET Error]', error.message);
      }
    }
  } catch (err) {
    console.error('[Admin Contributions Exception]', err);
  }

  return NextResponse.json({ success: true, contributions: MOCK_CONTRIBUTIONS });
}
