'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Rsvp, Attendance } from '@/lib/types';
import { Download } from 'lucide-react';

const LABELS: Record<Attendance, string> = {
  traditional: 'Traditional only',
  white: 'White only',
  both: 'Both',
  none: 'Unable to attend',
};

export default function AdminRsvpsPage() {
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Attendance | 'all'>('all');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/rsvp');
        const data = await res.json();
        if (data.success && Array.isArray(data.rsvps)) {
          setRsvps(data.rsvps);
        } else {
          const supabase = createClient();
          const { data: dbData } = await supabase
            .from('rsvps')
            .select('*')
            .order('created_at', { ascending: false });
          setRsvps(dbData ?? []);
        }
      } catch {
        setRsvps([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const summary = useMemo(() => {
    const base = { traditional: 0, white: 0, both: 0, none: 0, guestsTraditional: 0, guestsWhite: 0 };
    for (const r of rsvps) {
      base[r.attendance] += 1;
      if (r.attendance === 'traditional' || r.attendance === 'both') {
        base.guestsTraditional += r.guest_count;
      }
      if (r.attendance === 'white' || r.attendance === 'both') {
        base.guestsWhite += r.guest_count;
      }
    }
    return base;
  }, [rsvps]);

  const filtered = filter === 'all' ? rsvps : rsvps.filter((r) => r.attendance === filter);

  const exportCsv = () => {
    const header = ['guest_name', 'guest_email', 'attendance', 'guest_count', 'notes', 'created_at'];
    const rows = rsvps.map((r) =>
      [r.guest_name, r.guest_email, r.attendance, r.guest_count, r.notes ?? '', r.created_at]
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(',')
    );
    const blob = new Blob([[header.join(','), ...rows].join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rsvps-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-wedding-ink">RSVPs</h2>
          <p className="text-sm text-wedding-muted">Responses and guest counts by event</p>
        </div>
        <button
          type="button"
          onClick={exportCsv}
          disabled={rsvps.length === 0}
          className="btn-primary inline-flex gap-2 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Traditional (headcount)', value: summary.guestsTraditional },
          { label: 'White wedding (headcount)', value: summary.guestsWhite },
          { label: 'Both events (RSVPs)', value: summary.both },
          { label: 'Unable to attend', value: summary.none },
        ].map((card) => (
          <div key={card.label} className="border border-wedding-brown p-4 bg-wedding-white">
            <p className="text-[11px] uppercase tracking-wider text-wedding-muted">{card.label}</p>
            <p className="font-serif text-3xl text-wedding-blue mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {(['all', 'traditional', 'white', 'both', 'none'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs uppercase tracking-wider ${
              filter === f ? 'bg-wedding-blue text-white' : 'bg-wedding-brown/40 text-wedding-muted'
            }`}
          >
            {f === 'all' ? 'All' : LABELS[f]}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-wedding-muted">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-wedding-muted py-8">No RSVPs yet.</p>
      ) : (
        <div className="overflow-x-auto border border-wedding-brown">
          <table className="w-full text-sm text-left">
            <thead className="bg-wedding-brown/40 text-xs uppercase tracking-wider text-wedding-muted">
              <tr>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Attendance</th>
                <th className="py-3 px-4">Guests</th>
                <th className="py-3 px-4">Notes</th>
                <th className="py-3 px-4">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-t border-wedding-brown">
                  <td className="py-3 px-4 font-medium">{r.guest_name}</td>
                  <td className="py-3 px-4 text-wedding-muted">{r.guest_email}</td>
                  <td className="py-3 px-4">{LABELS[r.attendance]}</td>
                  <td className="py-3 px-4">{r.guest_count}</td>
                  <td className="py-3 px-4 text-wedding-muted max-w-xs truncate">
                    {r.notes || '—'}
                  </td>
                  <td className="py-3 px-4 text-wedding-muted whitespace-nowrap">
                    {new Date(r.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
