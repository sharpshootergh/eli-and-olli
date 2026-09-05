'use client';

import { useState, useEffect } from 'react';
import { siteConfig, type WeddingEvent } from '@/lib/site-config';
import { MapPin, Calendar, Clock, Save, CheckCircle2, Navigation, FileText } from 'lucide-react';

export default function AdminEventsPage() {
  const [events, setEvents] = useState<WeddingEvent[]>(siteConfig.events);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function loadEvents() {
      try {
        const res = await fetch('/api/events');
        const data = await res.json();
        if (data.success && Array.isArray(data.events) && data.events.length > 0) {
          setEvents(data.events);
        }
      } catch {
        // Fallback to siteConfig.events
      } finally {
        setLoading(false);
      }
    }
    void loadEvents();
  }, []);

  const handleChange = (id: string, field: keyof WeddingEvent, value: string | null) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Venues & GPS locations saved successfully! Updated in RSVP emails.');
      } else {
        setErrorMsg(data.error || 'Failed to save events');
      }
    } catch {
      setErrorMsg('Failed to connect to server to save changes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-wedding-ink">Venues & Event Locations</h2>
          <p className="text-sm text-wedding-muted">
            Manage exact venue addresses, Google Maps GPS links, dates, and times sent in RSVP confirmation emails.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="btn-primary inline-flex gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs">
          {errorMsg}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-wedding-muted">Loading venue settings…</p>
      ) : (
        <form onSubmit={handleSave} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {events.map((event) => (
              <div
                key={event.id}
                className="border border-wedding-brown bg-wedding-white p-6 sm:p-8 space-y-6 shadow-sm"
              >
                <div className="border-b border-wedding-brown pb-4 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-wedding-blue">
                      Event #{event.sortOrder}
                    </span>
                    <h3 className="font-serif text-2xl text-wedding-ink mt-0.5">{event.name}</h3>
                  </div>
                  <Navigation className="w-5 h-5 text-wedding-gold" />
                </div>

                <div className="space-y-4 text-xs">
                  {/* Event Name */}
                  <div className="space-y-1">
                    <label className="font-semibold uppercase tracking-wider text-wedding-muted">
                      Event Title
                    </label>
                    <input
                      type="text"
                      value={event.name}
                      onChange={(e) => handleChange(event.id, 'name', e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-wedding-brown text-sm"
                      required
                    />
                  </div>

                  {/* Date & Time Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold uppercase tracking-wider text-wedding-muted flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> Date (YYYY-MM-DD)
                      </label>
                      <input
                        type="date"
                        value={event.eventDate}
                        onChange={(e) => handleChange(event.id, 'eventDate', e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-wedding-brown text-sm"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold uppercase tracking-wider text-wedding-muted flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Time (HH:MM)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 12:00 or TBC"
                        value={event.eventTime || ''}
                        onChange={(e) => handleChange(event.id, 'eventTime', e.target.value || null)}
                        className="w-full px-4 py-2.5 bg-white border border-wedding-brown text-sm"
                      />
                    </div>
                  </div>

                  {/* City / Region Location */}
                  <div className="space-y-1">
                    <label className="font-semibold uppercase tracking-wider text-wedding-muted flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> City / Region
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Abidjan, Ivory Coast"
                      value={event.location}
                      onChange={(e) => handleChange(event.id, 'location', e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-wedding-brown text-sm"
                      required
                    />
                  </div>

                  {/* Venue Name */}
                  <div className="space-y-1">
                    <label className="font-semibold uppercase tracking-wider text-wedding-muted">
                      Venue Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sophisticated Garden Resort / Palais de Culture"
                      value={event.venueName || ''}
                      onChange={(e) => handleChange(event.id, 'venueName', e.target.value || null)}
                      className="w-full px-4 py-2.5 bg-white border border-wedding-brown text-sm"
                    />
                  </div>

                  {/* Exact Google Maps / GPS Link */}
                  <div className="space-y-1">
                    <label className="font-semibold uppercase tracking-wider text-wedding-blue flex items-center gap-1">
                      <Navigation className="w-3.5 h-3.5 text-wedding-blue" /> Exact Google Maps / GPS URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://maps.google.com/?q=..."
                      value={event.gpsUrl || ''}
                      onChange={(e) => handleChange(event.id, 'gpsUrl', e.target.value || null)}
                      className="w-full px-4 py-2.5 bg-white border border-wedding-blue/50 text-sm focus:outline-none focus:ring-1 focus:ring-wedding-blue"
                    />
                    <p className="text-[11px] text-wedding-muted">
                      This link will be included as a clickable location button in the guest&apos;s RSVP confirmation email.
                    </p>
                  </div>

                  {/* Special Notes / Directions */}
                  <div className="space-y-1">
                    <label className="font-semibold uppercase tracking-wider text-wedding-muted flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" /> Directions & Notes for Guests
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Gate opens at 11:30 AM. Parking available at the main hall."
                      value={event.notes || ''}
                      onChange={(e) => handleChange(event.id, 'notes', e.target.value || null)}
                      className="w-full px-4 py-2.5 bg-white border border-wedding-brown text-sm resize-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary inline-flex gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
