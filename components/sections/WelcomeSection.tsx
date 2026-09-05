 'use client';

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

interface WelcomeSectionProps {
  events?: WeddingEvent[];
}

export default function WelcomeSection({ events = siteConfig.events }: WelcomeSectionProps) {
  const { couple } = siteConfig;
  const { language, t } = useLanguage();

  return (
    <section id="welcome" className="scroll-mt-20">
      <div className="relative min-h-[70vh] w-full overflow-hidden">
        <HeroSlideshow />
        <div className="absolute inset-0 bg-gradient-to-t from-wedding-ink/55 via-wedding-ink/20 to-wedding-ink/10" />

        <div className="absolute inset-0 flex flex-col justify-end px-6 pb-14 md:pb-20">
          <div className="max-w-4xl mx-auto w-full text-center text-white space-y-4 rounded-sm bg-wedding-ink/10 px-5 py-7 sm:px-8 sm:py-9">
            <h1 className="font-serif text-5xl sm:text-7xl md:text-8xl tracking-tight drop-shadow-lg">
              {couple.partnerOne.firstName}{' '}
              <span className="font-light text-wedding-gold">&</span>{' '}
              {couple.partnerTwo.firstName}
            </h1>
            <p className="text-sm sm:text-base tracking-[0.2em] uppercase text-white/95 max-w-lg mx-auto drop-shadow-md">
              {t('heroKicker')}
            </p>
            <p className="max-w-md mx-auto text-base text-white/95 font-light leading-relaxed pt-1 drop-shadow-md">
              {t('heroText')}
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-3">
              <a href="#rsvp" className="btn-primary bg-wedding-blue">
                RSVP
              </a>
              <a
                href="#story"
                className="inline-flex items-center justify-center px-6 py-3 border border-white/70 text-white text-sm tracking-wide hover:bg-white/10 transition-colors"
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
              className="bg-wedding-white border border-wedding-brown shadow-lg p-6 sm:p-8 space-y-4"
            >
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
                {event.location}
              </p>
              <CountdownTimer targetDate={eventCountdownIso(event)} variant="dark" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
