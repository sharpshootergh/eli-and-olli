'use client';

import { useEffect, useState, FormEvent } from 'react';
import type { AdminUser } from '@/lib/types';
import { siteConfig } from '@/lib/site-config';
import { Trash2, UserPlus } from 'lucide-react';

export default function AdminUsersPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setAdmins(data.admins ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admins');
      // Demo fallback
      setAdmins([
        {
          id: 'seed',
          email: siteConfig.primaryAdminEmail,
          added_by: 'seed',
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const invite = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to invite');
      setEmail('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invite failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Remove this admin?')) return;
    setError('');
    const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Failed to remove');
      return;
    }
    await load();
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="font-serif text-2xl text-wedding-ink">Invite admins</h2>
        <p className="text-sm text-wedding-muted mt-1">
          Only Google accounts on this allowlist can access the admin panel. Primary admin:{' '}
          <strong>{siteConfig.primaryAdminEmail}</strong>
        </p>
      </div>

      <form onSubmit={invite} className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          required
          placeholder="colleague@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 px-4 py-3 border border-wedding-brown text-sm focus:outline-none focus:ring-2 focus:ring-wedding-blue"
        />
        <button type="submit" disabled={saving} className="btn-primary inline-flex gap-2 disabled:opacity-60">
          <UserPlus className="w-4 h-4" />
          {saving ? 'Adding…' : 'Invite'}
        </button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="text-sm text-wedding-muted">Loading…</p>
      ) : (
        <ul className="border border-wedding-brown divide-y divide-wedding-brown">
          {admins.map((admin) => {
            const isPrimary =
              admin.email.toLowerCase() === siteConfig.primaryAdminEmail.toLowerCase();
            return (
              <li
                key={admin.id}
                className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-wedding-ink">{admin.email}</p>
                  <p className="text-xs text-wedding-muted">
                    {isPrimary
                      ? 'Primary admin'
                      : `Added by ${admin.added_by || 'unknown'} · ${new Date(admin.created_at).toLocaleDateString()}`}
                  </p>
                </div>
                {!isPrimary && admin.id !== 'seed' && (
                  <button
                    type="button"
                    onClick={() => remove(admin.id)}
                    className="text-red-600 hover:bg-red-50 p-2"
                    aria-label="Remove admin"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
