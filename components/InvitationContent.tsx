'use client';

import Link from 'next/link';
import { useLanguage } from '@/components/LanguageProvider';
import { siteConfig, formatEventDate, formatEventTime } from '@/lib/site-config';

const invitationCopy = {
  en: {
    withFamilies: 'Together with their families',
    requestPresence: 'request the honour of your presence',
    celebrations: 'at their wedding celebrations',
    respond: 'Kindly respond at your earliest convenience',
    rsvpNote:
      "Even if you can't make it, please RSVP so we can plan accordingly — we'd love to know either way.",
    rsvpNow: 'RSVP now',
    printRsvp: 'Please RSVP via the wedding website',
    timeTbc: 'Time TBC',
    twoCelebrations: 'Two celebrations · One love',
  },
  fr: {
    withFamilies: 'Avec leurs familles',
    requestPresence: 'sollicitent l’honneur de votre présence',
    celebrations: 'à leurs célébrations de mariage',
    respond: 'Merci de répondre dès que possible',
    rsvpNote:
      'Même si vous ne pouvez pas être présent, merci de confirmer votre réponse afin que nous puissions nous organiser.',
    rsvpNow: 'Répondre au RSVP',
    printRsvp: 'Merci de répondre via le site du mariage',
    timeTbc: 'Heure à confirmer',
    twoCelebrations: 'Deux célébrations · Un amour',
  },
} as const;

function eventLabel(eventId: string, language: 'en' | 'fr', fallback: string) {
  if (eventId === 'event-traditional') {
    return language === 'fr' ? 'Mariage traditionnel' : 'Traditional Wedding';
  }
  if (eventId === 'event-white') {
    return language === 'fr' ? 'Mariage blanc' : 'White Wedding';
  }
  return fallback;
}

export default function InvitationContent({ printLanguage }: { printLanguage?: 'en' | 'fr' }) {
  const { events, siteUrl, couple } = siteConfig;
  const { language, setLanguage } = useLanguage();
  const activeLanguage = printLanguage ?? language;
  const text = invitationCopy[activeLanguage];
  const rsvpUrl = `${siteUrl.replace(/\/$/, '')}/#rsvp`;

  return (
    <div className="invite-page relative min-h-screen flex flex-col items-center justify-center px-3 py-7 sm:px-6 sm:py-12 print:py-0 overflow-hidden">
      <div className="invite-atmosphere pointer-events-none absolute inset-0 print:hidden" aria-hidden />

      {!printLanguage && <div className="relative z-10 w-full max-w-2xl flex justify-end mb-3 print:hidden">
        <div
          className="invite-language flex overflow-hidden text-[11px] font-semibold tracking-wider backdrop-blur-sm"
          aria-label="Language"
        >
          {(['en', 'fr'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setLanguage(option)}
              aria-pressed={activeLanguage === option}
              className={`px-3 py-1.5 transition-colors ${
                activeLanguage === option
                  ? 'bg-[#142a50] text-[#fffdf7]'
                  : 'text-[#5e5448] hover:bg-[#e5c270]/20'
              }`}
            >
              {option.toUpperCase()}
            </button>
          ))}
        </div>
      </div>}

      <article className="invite-card relative z-10 w-full max-w-2xl print:shadow-none">
        <div className="invite-pattern invite-pattern-top pointer-events-none" aria-hidden />
        <div className="invite-pattern invite-pattern-bottom pointer-events-none" aria-hidden />
        <div className="invite-side-motif invite-side-motif-left pointer-events-none" aria-hidden>
          <i /><i /><i /><i />
        </div>
        <div className="invite-side-motif invite-side-motif-right pointer-events-none" aria-hidden>
          <i /><i /><i /><i />
        </div>
        <div className="pointer-events-none absolute inset-3 border border-[#b98b2e]/60 print:inset-2" aria-hidden />
        <div className="pointer-events-none absolute inset-[18px] border border-[#142a50]/25 print:hidden" aria-hidden />

        <div className="invite-inner relative px-8 pt-20 pb-24 sm:px-20 sm:pt-24 sm:pb-28 text-center space-y-9">
          <div className="invite-fade space-y-3" style={{ animationDelay: '0ms' }}>
            <p className="text-[10px] tracking-[0.34em] uppercase text-[#142a50]">
              {text.withFamilies}
            </p>
            <p className="text-[10px] tracking-[0.28em] uppercase text-[#88714a]">
              {text.twoCelebrations}
            </p>
          </div>

          <div className="invite-fade flex items-center justify-center gap-3" style={{ animationDelay: '100ms' }} aria-hidden>
            <span className="h-px w-14 bg-[#b98b2e]" />
            <span className="w-2 h-2 rotate-45 bg-[#b98b2e]" />
            <span className="h-px w-14 bg-[#b98b2e]" />
          </div>

          <div className="invite-fade space-y-4" style={{ animationDelay: '180ms' }}>
            <h1 className="font-serif leading-[0.95] text-[#142a50]">
              <span className="block text-4xl sm:text-6xl tracking-tight">
                {couple.partnerTwo.fullName}
              </span>
              <span
                className="block my-3 font-serif text-3xl sm:text-4xl text-[#b98b2e] font-light italic"
                aria-hidden
              >
                &
              </span>
              <span className="block text-4xl sm:text-6xl tracking-tight">
                {couple.partnerOne.fullName}
              </span>
            </h1>
            <p className="text-sm sm:text-[15px] text-[#5e5448] tracking-wide leading-relaxed max-w-md mx-auto font-light">
              {text.requestPresence}
              <br />
              {text.celebrations}
            </p>
          </div>

          <div className="invite-fade space-y-0" style={{ animationDelay: '280ms' }}>
            {events.map((event, index) => (
              <div key={event.id}>
                {index > 0 && (
                  <div className="my-7 flex justify-center" aria-hidden>
                    <span className="h-px w-12 bg-[#c9a866]" />
                  </div>
                )}
                <div className="space-y-2 py-1">
                  <p className="text-[11px] tracking-[0.22em] uppercase text-[#142a50] font-semibold">
                    {eventLabel(event.id, activeLanguage, event.name)}
                  </p>
                  <p className="font-serif text-2xl sm:text-3xl text-[#142a50]">
                    {formatEventDate(event.eventDate, activeLanguage)}
                  </p>
                  <p className="text-sm text-[#403b35]">
                    {formatEventTime(event.eventTime, activeLanguage) ?? text.timeTbc}
                  </p>
                  <p className="text-sm text-[#6b6154] tracking-wide">{event.location}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="invite-fade flex items-center justify-center gap-3 print:hidden" style={{ animationDelay: '380ms' }} aria-hidden>
            <span className="h-px w-10 bg-[#c9a866]" />
            <span className="w-1.5 h-1.5 rotate-45 bg-[#b98b2e]" />
            <span className="h-px w-10 bg-[#c9a866]" />
          </div>

          <div className="invite-fade space-y-5 print:hidden" style={{ animationDelay: '460ms' }}>
            <p className="text-xs tracking-[0.18em] uppercase text-[#6b6154]">{text.respond}</p>
            <p className="text-sm text-[#6b6154] leading-relaxed max-w-md mx-auto font-light">
              {text.rsvpNote}
            </p>
            <Link
              href="/#rsvp"
              className="invite-rsvp inline-flex"
            >
              {text.rsvpNow}
            </Link>
            <p className="text-[10px] text-[#6b6154]/80 break-all px-2 tracking-wide">{rsvpUrl}</p>
          </div>

          <p className="text-[10px] tracking-[0.15em] uppercase text-[#6b6154] print:block hidden">
            {text.printRsvp}
          </p>
        </div>

      </article>
    </div>
  );
}
