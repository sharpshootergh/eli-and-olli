import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { isAdminEmail } from '@/lib/admin-guard';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/admin';

  if (code) {
    try {
      const supabase = await createServerSupabaseClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error && data?.user?.email) {
        const allowed = await isAdminEmail(data.user.email);
        if (allowed) {
          const response = NextResponse.redirect(`${origin}${next}`);
          response.cookies.set('admin_authenticated', 'true', {
            path: '/',
            maxAge: 2592000,
            sameSite: 'lax',
          });
          return response;
        } else {
          await supabase.auth.signOut();
          return NextResponse.redirect(`${origin}/admin/login?denied=1`);
        }
      }
    } catch (err) {
      console.error('[OAuth Callback Error]', err);
    }
  }

  return NextResponse.redirect(`${origin}/admin/login?error=auth`);
}
