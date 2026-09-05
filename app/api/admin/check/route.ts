import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { isAdminEmail } from '@/lib/admin-guard';

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ allowed: false }, { status: 401 });
  }

  const allowed = await isAdminEmail(user.email);
  return NextResponse.json({ allowed, email: user.email });
}
