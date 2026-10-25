'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Printer } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';
import { siteConfig, formatEventDate, formatEventTime, type WeddingEvent } from '@/lib/site-config';

const invitationCopy = {
  en: {
    withFamilies: 'The Sagoe and Tokpa Families',
    andConnector: 'And',
    requestPresence: 'request the honor of your presence',
    celebrations: 'at their wedding celebrations',
    respond: 'Kindly respond at your earliest convenience',
    rsvpNote:
      "Even if you can't make it, please RSVP so we can plan accordingly — we'd love to know either way.",
    rsvpNow: 'RSVP now',
    printRsvp: 'Please RSVP via the wedding website',
    scanToRsvp: 'Scan to RSVP or tap above',
    saveAsPdf: 'Save as PDF',
    timeTbc: 'Time TBC',
    twoCelebrations: 'Two celebrations · One love',
  },
  fr: {
    withFamilies: 'Les familles Sagoe et Tokpa',
    andConnector: 'Et',
    requestPresence: "sollicitent l'honneur de votre présence",
    celebrations: 'à leurs célébrations de mariage',
    respond: 'Merci de répondre dès que possible',
    rsvpNote:
      'Même si vous ne pouvez pas être présent, merci de confirmer votre réponse afin que nous puissions nous organiser.',
    rsvpNow: 'Répondre au RSVP',
    printRsvp: 'Merci de répondre via le site du mariage',
    scanToRsvp: 'Scannez pour répondre ou cliquez ci-dessus',
    saveAsPdf: 'Télécharger en PDF',
    timeTbc: 'Heure à confirmer',
    twoCelebrations: 'Deux célébrations · Un amour',
  },
} as const;

function generateQrSvg(url: string): string {
  let output = '';
  QRCode.toString(
    url,
    {
      type: 'svg',
      margin: 1,
      color: {
        dark: '#142a50',
        light: '#ffffff',
      },
    },
    (_err, svg) => {
      if (svg) output = svg;
    }
  );
  return output;
}

function eventLabel(eventId: string, language: 'en' | 'fr', fallback: string) {
  if (eventId === 'event-traditional') {
    return language === 'fr' ? 'Mariage traditionnel' : 'Traditional Wedding';
  }
  if (eventId === 'event-white') {
    return language === 'fr' ? 'Mariage religieux' : 'White Wedding';
  }
  return fallback;
}

export default function InvitationContent({ printLanguage }: { printLanguage?: 'en' | 'fr' }) {
  const { siteUrl, couple } = siteConfig;
  const { language, setLanguage } = useLanguage();
  const [events, setEvents] = useState<WeddingEvent[]>(siteConfig.events);
  const activeLanguage = printLanguage ?? language;
  const text = invitationCopy[activeLanguage];
  const rsvpUrl = `${siteUrl.replace(/\/$/, '')}/#rsvp`;

  const [qrSvg, setQrSvg] = useState<string>(() => generateQrSvg(rsvpUrl));

  useEffect(() => {
    setQrSvg(generateQrSvg(rsvpUrl));
  }, [rsvpUrl]);

  useEffect(() => {
    async function loadLiveEvents() {
      try {
        const res = await fetch('/api/events');
        const data = await res.json();
        if (data.success && Array.isArray(data.events) && data.events.length > 0) {
          setEvents(data.events);
        }
      } catch {
        // Fallback to siteConfig.events
      }
    }
    void loadLiveEvents();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="invite-page relative min-h-screen flex flex-col items-center justify-center px-3 py-7 sm:px-6 sm:py-12 print:p-0 print:m-0 overflow-hidden">
      <div className="invite-atmosphere pointer-events-none absolute inset-0 print:hidden" aria-hidden />

      {!printLanguage && (
        <div className="relative z-10 w-full max-w-2xl flex justify-between items-center mb-3 print:hidden">
          <button
            type="button"
            onClick={handlePrint}
            className="invite-language flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold tracking-wider backdrop-blur-sm text-[#142a50] hover:bg-[#e5c270]/20 transition-colors border border-[#b98b2e]/40 shadow-xs"
            title={text.saveAsPdf}
          >
            <Printer className="w-3.5 h-3.5 text-[#b98b2e]" />
            <span>{text.saveAsPdf}</span>
          </button>

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
        </div>
      )}

      <article className="invite-card relative z-10 w-full max-w-2xl print:max-w-none print:w-[620px] print:shadow-none print:my-auto">
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

        <div className="invite-inner relative px-8 pt-20 pb-24 sm:px-20 sm:pt-24 sm:pb-28 print:px-10 print:pt-10 print:pb-12 text-center space-y-8 sm:space-y-9 print:space-y-3.5">
          <div className="invite-fade space-y-3 print:space-y-1.5" style={{ animationDelay: '0ms' }}>
            <p className="text-[10px] tracking-[0.34em] uppercase text-[#142a50]">
              {text.withFamilies}
            </p>
            <p className="text-[10px] tracking-[0.28em] uppercase text-[#88714a]">
              {text.twoCelebrations}
            </p>
          </div>

          <div className="invite-fade flex items-center justify-center gap-3 print:gap-2" style={{ animationDelay: '100ms' }} aria-hidden>
            <span className="h-px w-14 bg-[#b98b2e]" />
            <span className="w-2 h-2 rotate-45 bg-[#b98b2e]" />
            <span className="h-px w-14 bg-[#b98b2e]" />
          </div>

          <div className="invite-fade space-y-4 print:space-y-2" style={{ animationDelay: '180ms' }}>
            <h1 className="font-serif leading-[0.95] text-[#142a50]">
              <span className="block text-4xl sm:text-6xl print:text-4xl tracking-tight">
                {couple.partnerTwo.fullName}
              </span>
              <span
                className="block my-3 print:my-1.5 font-serif text-2xl sm:text-3xl print:text-2xl text-[#b98b2e] font-light italic uppercase tracking-wider"
              >
                {text.andConnector}
              </span>
              <span className="block text-4xl sm:text-6xl print:text-4xl tracking-tight">
                {couple.partnerOne.fullName}
              </span>
            </h1>
            <p className="text-sm sm:text-[15px] print:text-xs text-[#5e5448] tracking-wide leading-relaxed max-w-md mx-auto font-light">
              {text.requestPresence}
              <br />
              {text.celebrations}
            </p>
          </div>

          <div className="invite-fade space-y-0" style={{ animationDelay: '280ms' }}>
            {events.map((event, index) => (
              <div key={event.id}>
                {index > 0 && (
                  <div className="my-7 print:my-3 flex justify-center" aria-hidden>
                    <span className="h-px w-12 bg-[#c9a866]" />
                  </div>
                )}
                <div className="space-y-2 print:space-y-0.5 py-1 print:py-0">
                  <p className="text-[11px] print:text-[10px] tracking-[0.22em] uppercase text-[#142a50] font-semibold">
                    {eventLabel(event.id, activeLanguage, event.name)}
                  </p>
                  <p className="font-serif text-2xl sm:text-3xl print:text-2xl text-[#142a50]">
                    {formatEventDate(event.eventDate, activeLanguage)}
                  </p>
                  <p className="text-sm print:text-xs text-[#403b35]">
                    {formatEventTime(event.eventTime, activeLanguage) ?? text.timeTbc}
                  </p>
                  <p className="text-sm print:text-xs text-[#6b6154] tracking-wide">{event.location}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="invite-fade flex items-center justify-center gap-3 print:gap-2 print:my-1" style={{ animationDelay: '380ms' }} aria-hidden>
            <span className="h-px w-12 bg-[#c9a866]" />
            <span className="w-1.5 h-1.5 rotate-45 bg-[#b98b2e]" />
            <span className="h-px w-12 bg-[#c9a866]" />
          </div>

          <div className="invite-fade space-y-4 print:space-y-2" style={{ animationDelay: '460ms' }}>
            <p className="text-xs print:text-[11px] tracking-[0.2em] uppercase text-[#6b6154] font-medium">
              {text.respond}
            </p>
            <p className="text-sm text-[#6b6154] leading-relaxed max-w-md mx-auto font-light print:hidden">
              {text.rsvpNote}
            </p>

            <div className="flex flex-col items-center justify-center gap-3.5 print:gap-2">
              {/* Clickable RSVP button for digital PDF or web view */}
              <a
                href={rsvpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="invite-rsvp inline-flex shadow-sm hover:shadow"
              >
                {text.rsvpNow}
              </a>

              {/* QR Code section (scannable when printed, clickable on desktop/PDF) */}
              {qrSvg && (
                <div className="hidden sm:flex print:flex flex-col items-center pt-1 print:pt-0.5">
                  <a
                    href={rsvpUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block p-2 bg-white border border-[#b98b2e]/60 shadow-xs hover:border-[#142a50] transition-colors"
                    title={text.rsvpNow}
                    aria-label={text.scanToRsvp}
                  >
                    <div
                      className="w-22 h-22 sm:w-24 sm:h-24 print:w-20 print:h-20 [&>svg]:w-full [&>svg]:h-full block"
                      dangerouslySetInnerHTML={{ __html: qrSvg }}
                    />
                  </a>
                  <p className="mt-1.5 print:mt-1 text-[10px] tracking-[0.16em] uppercase text-[#88714a] font-medium">
                    {text.scanToRsvp}
                  </p>
                  <a
                    href={rsvpUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-0.5 text-[10px] sm:text-[11px] text-[#142a50]/80 hover:text-[#142a50] underline tracking-wider font-light"
                  >
                    {rsvpUrl.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
