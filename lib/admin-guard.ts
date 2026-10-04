import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { siteConfig } from '@/lib/site-config';

/**
 * Check whether an email is on the admin_users allowlist.
 * Falls back to the seeded primary admin if the DB is unreachable.
 */
export async function isAdminEmail(email?: string | null): Promise<boolean> {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('admin_users')
      .select('id')
      .ilike('email', normalized)
      .maybeSingle();

    if (!error && data) return true;

    // If table empty / not migrated yet, allow primary seed only
    if (error) {
      console.warn('[admin-guard] admin_users lookup failed:', error.message);
      return normalized === siteConfig.primaryAdminEmail.toLowerCase();
    }

    return false;
  } catch (err) {
    console.warn('[admin-guard] falling back to primary admin', err);
    return normalized === siteConfig.primaryAdminEmail.toLowerCase();
  }
}

/**
 * Check whether a server API request is authorized by an authenticated admin.
 * Accepts either:
 * 1. An admin_authenticated=true cookie set during passcode or SSO login
 * 2. An active Supabase Auth user session matching an email in admin_users allowlist.
 */
export async function checkIsAdminRequest(_request?: Request): Promise<boolean> {
  try {
    // 1. Check admin_authenticated cookie
    const cookieStore = await cookies();
    const adminCookie = cookieStore.get('admin_authenticated');
    if (adminCookie?.value === 'true') {
      return true;
    }

    // 2. Check Supabase Auth user session
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user?.email && (await isAdminEmail(user.email))) {
      return true;
    }
  } catch (err) {
    console.warn('[checkIsAdminRequest] auth check exception:', err);
  }

  return false;
}

/** Sync helper for client components — prefer /api/admin/check */
export function isPrimaryAdmin(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === siteConfig.primaryAdminEmail.toLowerCase();
}
