'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { siteConfig } from '@/lib/site-config';
import { useLanguage } from '@/components/LanguageProvider';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const navItems = [
    { label: t('welcome'), href: '#welcome' },
    { label: t('story'), href: '#story' },
    { label: t('rsvp'), href: '#rsvp' },
    { label: t('registry'), href: '#registry' },
    { label: t('moments'), href: '#moments' },
  ];

  const handleNav = () => setIsOpen(false);

  // Lock body scroll when mobile menu is active
  useEffect(() => {
    if (isOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isOpen]);

  return (
    <header className="sticky top-0 z-50 glass-nav">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
        <a
          href="#welcome"
          className="font-serif text-2xl md:text-3xl tracking-tight text-wedding-ink hover:text-wedding-blue transition-colors"
        >
          {siteConfig.shortNames}
        </a>

        <nav className="hidden md:flex items-center gap-7">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-xs tracking-[0.18em] uppercase text-wedding-muted hover:text-wedding-blue transition-colors"
            >
              {item.label}
            </a>
          ))}
          <Link
            href="/invitation"
            className="text-xs tracking-[0.18em] uppercase text-wedding-ink border-b border-wedding-gold pb-0.5 hover:text-wedding-blue transition-colors"
          >
            {t('invitation')}
          </Link>
          <div className="flex overflow-hidden border border-wedding-brown/70 text-[11px] font-semibold tracking-wider" aria-label={t('language')}>
            {(['en', 'fr'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setLanguage(option)}
                aria-pressed={language === option}
                className={`px-2 py-1 ${language === option ? 'bg-wedding-blue text-white' : 'text-wedding-muted hover:bg-wedding-brown/30'}`}
              >
                {option.toUpperCase()}
              </button>
            ))}
          </div>
        </nav>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-wedding-ink focus:outline-none"
          aria-label="Toggle navigation"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 top-16 bg-wedding-ink/40 backdrop-blur-xs z-40 md:hidden"
            onClick={handleNav}
            aria-hidden="true"
          />
          <div className="fixed inset-x-0 top-16 z-50 md:hidden border-b border-wedding-brown/80 bg-wedding-white/98 backdrop-blur-xl px-6 py-6 shadow-2xl space-y-5 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={handleNav}
                  className="block py-3 px-3 text-sm tracking-[0.16em] uppercase text-wedding-muted hover:text-wedding-blue active:bg-wedding-brown/20 rounded-xs transition-colors"
                >
                  {item.label}
                </a>
              ))}
              <Link
                href="/invitation"
                onClick={handleNav}
                className="block py-3 px-3 text-sm tracking-[0.16em] uppercase text-wedding-ink font-medium"
              >
                {t('invitation')}
              </Link>
            </nav>

            <div className="pt-3 border-t border-wedding-brown/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-wedding-muted uppercase tracking-wider">{t('language')}:</span>
                <div className="flex rounded-xs border border-wedding-brown/80 overflow-hidden text-xs font-semibold">
                  {(['en', 'fr'] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setLanguage(option);
                        setIsOpen(false);
                      }}
                      className={`px-3 py-1.5 min-w-[38px] min-h-[38px] flex items-center justify-center ${
                        language === option ? 'bg-wedding-blue text-white' : 'text-wedding-muted hover:bg-wedding-brown/30'
                      }`}
                    >
                      {option.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <a
                href="#rsvp"
                onClick={handleNav}
                className="btn-primary text-xs px-5 py-2.5 rounded-full"
              >
                RSVP
              </a>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
