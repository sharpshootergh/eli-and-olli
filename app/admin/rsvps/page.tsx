'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Rsvp, Attendance } from '@/lib/types';
import { Download, Plus, Trash2, X, UserPlus, CheckCircle2 } from 'lucide-react';

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

  // Manual RSVP form modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [attendance, setAttendance] = useState<Attendance>('both');
  const [guestCount, setGuestCount] = useState(1);
  const [notes, setNotes] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  const loadRsvps = async () => {
    setLoading(true);
    let apiRsvps: Rsvp[] = [];
    let localRsvps: Rsvp[] = [];

    // 1. Fetch from server API
    try {
      const res = await fetch('/api/rsvp');
      const data = await res.json();
      if (data.success && Array.isArray(data.rsvps)) {
        apiRsvps = data.rsvps;
      }
    } catch {
      // API error
    }

    // 2. Load from client storage fallback
    if (typeof window !== 'undefined') {
      try {
        localRsvps = JSON.parse(localStorage.getItem('wedding_rsvps_client_store') || '[]');
      } catch {
        localRsvps = [];
      }
    }

    // 3. Load from Supabase DB directly if connected
    let dbRsvps: Rsvp[] = [];
    try {
      const supabase = createClient();
      const { data: dbData } = await supabase
        .from('rsvps')
        .select('*')
        .order('created_at', { ascending: false });
      if (dbData) dbRsvps = dbData;
    } catch {
      // Supabase unconfigured
    }

    // Deduplicate by guest_email
    const mergedMap = new Map<string, Rsvp>();
    [...localRsvps, ...apiRsvps, ...dbRsvps].forEach((r) => {
      const key = r.guest_email?.toLowerCase() || r.id;
      mergedMap.set(key, r);
    });

    const all = Array.from(mergedMap.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    setRsvps(all);
    setLoading(false);
  };

  useEffect(() => {
    void loadRsvps();
  }, []);

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestEmail.trim()) return;

    const newRecord: Rsvp = {
      id: `rsvp-${Date.now()}`,
      guest_name: guestName.trim(),
      guest_email: guestEmail.trim().toLowerCase(),
      attendance,
      guest_count: guestCount,
      notes: notes.trim() || null,
      created_at: new Date().toISOString(),
    };

    // Save locally
    const updated = [newRecord, ...rsvps];
    setRsvps(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('wedding_rsvps_client_store', JSON.stringify(updated));
    }

    // Submit to API
    try {
      await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecord),
      });
    } catch {
      // Handled via local state
    }

    setStatusMsg('RSVP added successfully!');
    setGuestName('');
    setGuestEmail('');
    setGuestCount(1);
    setNotes('');
    setShowAddModal(false);
    setTimeout(() => setStatusMsg(''), 3000);
  };

  const handleDelete = (id: string, email: string) => {
    if (!confirm(`Remove RSVP entry for ${email}?`)) return;
    const filteredList = rsvps.filter((r) => r.id !== id && r.guest_email !== email);
    setRsvps(filteredList);
    if (typeof window !== 'undefined') {
      localStorage.setItem('wedding_rsvps_client_store', JSON.stringify(filteredList));
    }
  };

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
          <h2 className="font-serif text-2xl text-wedding-ink">RSVPs ({rsvps.length})</h2>
          <p className="text-sm text-wedding-muted">Guest attendance responses, headcounts, and notes</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-wedding-blue hover:bg-wedding-blue/90 text-white font-medium text-xs uppercase tracking-wider rounded-lg transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Manual RSVP
          </button>

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
      </div>

      {statusMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Headcount Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Traditional (Headcount)', value: summary.guestsTraditional },
          { label: 'White Wedding (Headcount)', value: summary.guestsWhite },
          { label: 'Both Events (RSVPs)', value: summary.both },
          { label: 'Unable to Attend', value: summary.none },
        ].map((card) => (
          <div key={card.label} className="border border-wedding-brown p-4 bg-wedding-white">
            <p className="text-[11px] uppercase tracking-wider text-wedding-muted">{card.label}</p>
            <p className="font-serif text-3xl text-wedding-blue mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
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
        <p className="text-sm text-wedding-muted">Loading RSVPs…</p>
      ) : filtered.length === 0 ? (
        <div className="border border-dashed border-wedding-brown p-12 text-center space-y-3 bg-wedding-white">
          <UserPlus className="w-8 h-8 text-wedding-muted mx-auto" />
          <p className="text-sm text-wedding-muted">No RSVPs recorded yet.</p>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="text-xs text-wedding-blue font-semibold hover:underline"
          >
            + Click here to add a guest RSVP manually
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto border border-wedding-brown bg-wedding-white">
          <table className="w-full text-sm text-left">
            <thead className="bg-wedding-brown/40 text-xs uppercase tracking-wider text-wedding-muted">
              <tr>
                <th className="py-3 px-4">Guest Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Attendance</th>
                <th className="py-3 px-4">Headcount</th>
                <th className="py-3 px-4">Notes</th>
                <th className="py-3 px-4">Submitted</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-t border-wedding-brown hover:bg-wedding-brown/10">
                  <td className="py-3 px-4 font-medium">{r.guest_name}</td>
                  <td className="py-3 px-4 text-wedding-muted">{r.guest_email}</td>
                  <td className="py-3 px-4">
                    <span className="inline-block px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider bg-wedding-blue/10 text-wedding-blue border border-wedding-blue/20">
                      {LABELS[r.attendance]}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-wedding-ink">{r.guest_count}</td>
                  <td className="py-3 px-4 text-wedding-muted max-w-xs truncate">
                    {r.notes || '—'}
                  </td>
                  <td className="py-3 px-4 text-wedding-muted whitespace-nowrap text-xs">
                    {new Date(r.created_at).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(r.id, r.guest_email)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete RSVP"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Manual RSVP Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-wedding-white border border-wedding-brown max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-6 right-6 text-wedding-muted hover:text-wedding-ink"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-2xl text-wedding-ink">Add Guest RSVP</h3>

            <form onSubmit={handleManualAdd} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold uppercase tracking-wider text-wedding-muted">Guest Name *</label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Full Guest Name"
                  className="w-full px-4 py-2.5 bg-white border border-wedding-brown text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold uppercase tracking-wider text-wedding-muted">Email Address *</label>
                <input
                  type="email"
                  required
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="guest@example.com"
                  className="w-full px-4 py-2.5 bg-white border border-wedding-brown text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold uppercase tracking-wider text-wedding-muted">Attendance *</label>
                <select
                  value={attendance}
                  onChange={(e) => setAttendance(e.target.value as Attendance)}
                  className="w-full px-4 py-2.5 bg-white border border-wedding-brown text-sm"
                >
                  <option value="both">Both Events (Traditional & White)</option>
                  <option value="traditional">Traditional Wedding Only</option>
                  <option value="white">White Wedding Only</option>
                  <option value="none">Unable to Attend</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold uppercase tracking-wider text-wedding-muted">Guest Headcount *</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value) || 1)}
                  className="w-full px-4 py-2.5 bg-white border border-wedding-brown text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold uppercase tracking-wider text-wedding-muted">Notes / Dietary Info</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special notes..."
                  className="w-full px-4 py-2.5 bg-white border border-wedding-brown text-sm resize-none"
                />
              </div>

              <button
                type="submit"
                className="btn-primary w-full py-3.5 mt-2"
              >
                Save Guest RSVP
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
