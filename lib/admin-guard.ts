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

/** Sync helper for client components — prefer /api/admin/check */
export function isPrimaryAdmin(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === siteConfig.primaryAdminEmail.toLowerCase();
}
