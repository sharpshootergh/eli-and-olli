'use client';

import { useState, useEffect } from 'react';
import { Calendar, Gift, Send } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';

export default function MobileFloatingBar() {
  const { language, setLanguage, t } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [inRsvp, setInRsvp] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      // Show floating bar after scrolling past 350px
      setVisible(scrollY > 350);

      // Check if user is currently viewing the RSVP section
      const rsvpEl = document.getElementById('rsvp');
      if (rsvpEl) {
        const rect = rsvpEl.getBoundingClientRect();
        // If RSVP is taking up majority of viewport, hide floating bar
        const isCurrentlyInRsvp = rect.top <= window.innerHeight * 0.4 && rect.bottom >= window.innerHeight * 0.2;
        setInRsvp(isCurrentlyInRsvp);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible || inRsvp) return null;

  return (
    <div className="fixed bottom-4 inset-x-3 sm:inset-x-4 z-40 md:hidden flex items-center justify-between bg-wedding-white/95 backdrop-blur-md border border-wedding-brown shadow-xl px-3 sm:px-4 py-2 rounded-full transition-all duration-300">
      <div className="flex items-center gap-2 sm:gap-3">
        <a
          href="#welcome"
          className="flex items-center gap-1 text-[11px] sm:text-xs text-wedding-muted hover:text-wedding-blue font-medium py-1"
          aria-label="Events and dates"
        >
          <Calendar className="w-3.5 h-3.5 text-wedding-gold shrink-0" />
          <span>Events</span>
        </a>

        <span className="h-3 w-px bg-wedding-brown/60 shrink-0" aria-hidden />

        <a
          href="#registry"
          className="flex items-center gap-1 text-[11px] sm:text-xs text-wedding-muted hover:text-wedding-blue font-medium py-1"
          aria-label="Registry"
        >
          <Gift className="w-3.5 h-3.5 text-wedding-blue shrink-0" />
          <span>{t('registry')}</span>
        </a>

        <span className="h-3 w-px bg-wedding-brown/60 shrink-0" aria-hidden />

        {/* Language switch toggle (EN | FR) */}
        <div
          className="flex items-center rounded-full border border-wedding-brown/80 overflow-hidden text-[10px] font-semibold tracking-wider bg-wedding-white"
          aria-label="Language switch"
        >
          {(['en', 'fr'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setLanguage(option)}
              aria-pressed={language === option}
              className={`px-2 py-0.5 min-w-[28px] transition-colors ${
                language === option
                  ? 'bg-wedding-blue text-white'
                  : 'text-wedding-muted hover:bg-wedding-brown/30'
              }`}
            >
              {option.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <a
        href="#rsvp"
        className="inline-flex items-center gap-1.5 bg-wedding-blue text-white text-[11px] sm:text-xs font-semibold tracking-wider uppercase px-3.5 sm:px-4 py-1.5 rounded-full shadow-xs active:scale-95 transition-transform shrink-0"
      >
        <Send className="w-3 h-3" />
        <span>RSVP</span>
      </a>
    </div>
  );
}
