'use client';

import { useEffect, useState } from 'react';
import CountdownTimer from '@/components/CountdownTimer';
import HeroSlideshow from '@/components/HeroSlideshow';
import { useLanguage } from '@/components/LanguageProvider';
import {
  siteConfig,
  formatEventDate,
  formatEventTime,
  eventCountdownIso,
  type WeddingEvent,
} from '@/lib/site-config';
import { MapPin, Calendar } from 'lucide-react';

function getGoogleCalendarUrl(event: WeddingEvent, coupleNames: string): string {
  const title = encodeURIComponent(`${event.name} — ${coupleNames}`);
  const details = encodeURIComponent(`Wedding celebration for ${coupleNames}. For details, visit https://seguamour.com`);
  const location = encodeURIComponent(`${event.venueName ? `${event.venueName}, ` : ''}${event.location}`);
  const dateStr = event.eventDate.replace(/-/g, '');
  const timeStr = event.eventTime ? event.eventTime.replace(':', '') + '00' : '120000';
  const start = `${dateStr}T${timeStr}`;
  const endHour = String(Math.min(23, Number(event.eventTime ? event.eventTime.slice(0, 2) : '12') + 6)).padStart(2, '0');
  const end = `${dateStr}T${endHour}0000`;
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
}

function downloadIcs(event: WeddingEvent, coupleNames: string) {
  const dateStr = event.eventDate.replace(/-/g, '');
  const timeStr = event.eventTime ? event.eventTime.replace(':', '') + '00' : '120000';
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SeguAmour//Wedding//EN',
    'BEGIN:VEVENT',
    `SUMMARY:${event.name} — ${coupleNames}`,
    `DESCRIPTION:Wedding celebration for ${coupleNames}. Visit https://seguamour.com`,
    `LOCATION:${event.venueName ? `${event.venueName}, ` : ''}${event.location}`,
    `DTSTART:${dateStr}T${timeStr}`,
    `DTEND:${dateStr}T200000`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${event.id}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

interface WelcomeSectionProps {
  events?: WeddingEvent[];
}

export default function WelcomeSection({ events: initialEvents = siteConfig.events }: WelcomeSectionProps) {
  const { couple } = siteConfig;
  const { language, t } = useLanguage();
  const [events, setEvents] = useState<WeddingEvent[]>(initialEvents);

  useEffect(() => {
    async function loadLiveEvents() {
      try {
        const res = await fetch('/api/events');
        const data = await res.json();
        if (data.success && Array.isArray(data.events) && data.events.length > 0) {
          setEvents(data.events);
        }
      } catch {
        // Fall back to initialEvents
      }
    }
    void loadLiveEvents();
  }, []);

  return (
    <section id="welcome" className="scroll-mt-20">
      <div className="relative min-h-[78svh] sm:min-h-[70vh] w-full overflow-hidden">
        <HeroSlideshow />
        <div className="absolute inset-0 bg-gradient-to-t from-wedding-ink/75 via-wedding-ink/25 to-transparent sm:from-wedding-ink/55 sm:via-wedding-ink/20 sm:to-wedding-ink/10 pointer-events-none" />

        <div className="absolute inset-0 flex flex-col justify-end px-4 sm:px-6 pb-10 sm:pb-14 md:pb-20 pointer-events-none">
          <div className="max-w-4xl mx-auto w-full text-center text-white space-y-3 sm:space-y-4 rounded-sm bg-wedding-ink/15 backdrop-blur-[2px] sm:backdrop-blur-none px-4 py-5 sm:px-8 sm:py-9 pointer-events-auto">
            <h1 className="font-serif text-4xl sm:text-7xl md:text-8xl tracking-tight drop-shadow-lg">
              {couple.partnerOne.firstName}{' '}
              <span className="font-light text-wedding-gold">&</span>{' '}
              {couple.partnerTwo.firstName}
            </h1>
            <p className="text-xs sm:text-base tracking-[0.2em] uppercase text-white/95 max-w-lg mx-auto drop-shadow-md">
              {t('heroKicker')}
            </p>
            <p className="max-w-md mx-auto text-sm sm:text-base text-white/95 font-light leading-relaxed pt-0.5 sm:pt-1 drop-shadow-md">
              {t('heroText')}
            </p>
            <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3 pt-2 sm:pt-3">
              <a href="#rsvp" className="btn-primary bg-wedding-blue text-xs sm:text-sm px-5 sm:px-6 py-2.5 sm:py-3">
                RSVP
              </a>
              <a
                href="#story"
                className="inline-flex items-center justify-center px-5 sm:px-6 py-2.5 sm:py-3 border border-white/70 text-white text-xs sm:text-sm tracking-wide hover:bg-white/10 transition-colors"
              >
                {t('story')}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Dual event cards */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {events.map((event) => (
            <article
              key={event.id}
              className="bg-wedding-white border border-wedding-brown shadow-lg p-6 sm:p-8 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] tracking-[0.2em] uppercase text-wedding-blue font-medium">
                      {event.id === 'event-traditional' ? t('traditionalWedding') : event.id === 'event-white' ? t('whiteWedding') : event.name}
                    </p>
                    <h2 className="font-serif text-2xl sm:text-3xl text-wedding-ink mt-1">
                      {formatEventDate(event.eventDate, language)}
                    </h2>
                  </div>
                  <span className="shrink-0 w-2 h-2 rounded-full bg-wedding-gold mt-2" aria-hidden />
                </div>
                <p className="text-sm text-wedding-muted">
                  <span className="text-wedding-ink font-medium">
                    {formatEventTime(event.eventTime, language) ?? t('timeTbc')}
                    <span className="mx-2 text-wedding-brown">·</span>
                  </span>
                  {event.venueName ? `${event.venueName}, ` : ''}{event.location}
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
                  {event.gpsUrl && (
                    <a
                      href={event.gpsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-wedding-blue hover:underline font-semibold py-1"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Google Maps</span>
                    </a>
                  )}
                  <span className="text-wedding-brown" aria-hidden>·</span>
                  <a
                    href={getGoogleCalendarUrl(event, siteConfig.shortNames)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-wedding-gold hover:underline font-semibold py-1"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Add to Calendar</span>
                  </a>
                  <span className="text-wedding-brown" aria-hidden>·</span>
                  <button
                    type="button"
                    onClick={() => downloadIcs(event, siteConfig.shortNames)}
                    className="inline-flex items-center gap-1 text-wedding-muted hover:text-wedding-ink hover:underline cursor-pointer py-1"
                  >
                    <span>.ICS (Apple)</span>
                  </button>
                </div>
              </div>

              <CountdownTimer targetDate={eventCountdownIso(event)} variant="dark" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
