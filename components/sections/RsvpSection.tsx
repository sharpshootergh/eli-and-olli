'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import type { Attendance } from '@/lib/types';
import { siteConfig } from '@/lib/site-config';
import { useLanguage } from '@/components/LanguageProvider';

export default function RsvpSection() {
  const { t } = useLanguage();
  const options: { value: Attendance; label: string }[] = [
    { value: 'traditional', label: t('traditionalOnly') }, { value: 'white', label: t('whiteOnly') }, { value: 'both', label: t('both') }, { value: 'none', label: t('unable') },
  ];
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [attendance, setAttendance] = useState<Attendance | ''>('');
  const [submittedAttendance, setSubmittedAttendance] = useState<Attendance | null>(null);
  const [guestCount, setGuestCount] = useState(1);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!attendance) {
      setErrorMsg(t('chooseEvent'));
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guest_name: guestName,
          guest_email: guestEmail,
          attendance,
          guest_count: guestCount,
          notes: notes || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('rsvpError'));

      setSubmittedAttendance(attendance);
      setStatus('success');
      setGuestName('');
      setGuestEmail('');
      setAttendance('');
      setGuestCount(1);
      setNotes('');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : t('rsvpError'));
    }
  };

  return (
    <section id="rsvp" className="section-pad scroll-mt-20 bg-wedding-brown/30">
      <div className="max-w-xl mx-auto">
        <div className="text-center space-y-3 mb-10">
          <p className="text-[11px] tracking-[0.22em] uppercase text-wedding-blue">RSVP</p>
          <h2 className="section-title">{t('willYouJoin')}</h2>
          <p className="text-wedding-muted text-sm sm:text-base font-light">
            {t('rsvpIntro').replace('{names}', siteConfig.shortNames)}
          </p>
        </div>

        {status === 'success' ? (
        <div className="bg-wedding-white border border-wedding-gold p-8 text-center space-y-4">
          {submittedAttendance === 'none' ? (
            <>
              <p className="font-serif text-2xl text-wedding-ink">{t('thankYouNotice')}</p>
              <p className="text-sm text-wedding-muted leading-relaxed">
                {t('declineMessage')}
              </p>
              <Link href="/#registry" className="btn-primary inline-flex">
                {t('visitRegistry')}
              </Link>
              <button
                type="button"
                onClick={() => setStatus('idle')}
                className="text-sm text-wedding-blue underline underline-offset-4"
              >
                {t('anotherResponse')}
              </button>
            </>
          ) : (
            <>
              <p className="font-serif text-2xl text-wedding-ink">{t('thankYou')}</p>
              <p className="text-sm text-wedding-muted">
                {t('received')}
              </p>
              <button
                type="button"
                onClick={() => setStatus('idle')}
                className="text-sm text-wedding-blue underline underline-offset-4"
              >
                {t('anotherResponse')}
              </button>
            </>
          )}
        </div>
        ) : (
          <form onSubmit={onSubmit} className="bg-wedding-white border border-wedding-brown p-6 sm:p-8 space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="rsvp-name" className="text-xs tracking-wide uppercase text-wedding-muted">
                {t('fullName')}
              </label>
              <input
                id="rsvp-name"
                required
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full px-4 py-3 border border-wedding-brown bg-wedding-white text-sm focus:outline-none focus:ring-2 focus:ring-wedding-blue"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="rsvp-email" className="text-xs tracking-wide uppercase text-wedding-muted">
                {t('email')}
              </label>
              <input
                id="rsvp-email"
                type="email"
                required
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="w-full px-4 py-3 border border-wedding-brown bg-wedding-white text-sm focus:outline-none focus:ring-2 focus:ring-wedding-blue"
              />
            </div>

            <fieldset className="space-y-2">
              <legend className="text-xs tracking-wide uppercase text-wedding-muted mb-2">
                {t('attendance')}
              </legend>
              {options.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 px-4 py-3 border cursor-pointer transition-colors ${
                    attendance === opt.value
                      ? 'border-wedding-blue bg-wedding-blue/5'
                      : 'border-wedding-brown hover:border-wedding-blue/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="attendance"
                    value={opt.value}
                    checked={attendance === opt.value}
                    onChange={() => setAttendance(opt.value)}
                    className="accent-wedding-blue"
                  />
                  <span className="text-sm text-wedding-ink">{opt.label}</span>
                </label>
              ))}
            </fieldset>

            <div className="space-y-1.5">
              <label htmlFor="rsvp-count" className="text-xs tracking-wide uppercase text-wedding-muted">
                {t('guestCount')}
              </label>
              <input
                id="rsvp-count"
                type="number"
                min={1}
                max={20}
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value) || 1)}
                className="w-full px-4 py-3 border border-wedding-brown bg-wedding-white text-sm focus:outline-none focus:ring-2 focus:ring-wedding-blue"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="rsvp-notes" className="text-xs tracking-wide uppercase text-wedding-muted">
                {t('notes')}
              </label>
              <textarea
                id="rsvp-notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 border border-wedding-brown bg-wedding-white text-sm focus:outline-none focus:ring-2 focus:ring-wedding-blue resize-none"
              />
            </div>

            {status === 'error' && errorMsg && (
              <p className="text-sm text-red-600">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="btn-primary w-full disabled:opacity-60"
            >
              {status === 'loading' ? t('sending') : t('sendRsvp')}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
