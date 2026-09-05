'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { siteConfig } from '@/lib/site-config';
import { useLanguage } from '@/components/LanguageProvider';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const navItems = [
    { label: t('welcome'), href: '#welcome' }, { label: t('story'), href: '#story' }, { label: t('rsvp'), href: '#rsvp' }, { label: t('registry'), href: '#registry' }, { label: t('moments'), href: '#moments' },
  ];

  const handleNav = () => setIsOpen(false);

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
            {(['en', 'fr'] as const).map((option) => <button key={option} type="button" onClick={() => setLanguage(option)} aria-pressed={language === option} className={`px-2 py-1 ${language === option ? 'bg-wedding-blue text-white' : 'text-wedding-muted hover:bg-wedding-brown/30'}`}>{option.toUpperCase()}</button>)}
          </div>
        </nav>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-wedding-ink"
          aria-label="Toggle navigation"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-wedding-brown/50 px-6 py-4 space-y-1 bg-wedding-white">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={handleNav}
              className="block py-3 text-sm tracking-[0.14em] uppercase text-wedding-muted hover:text-wedding-blue"
            >
              {item.label}
            </a>
          ))}
          <Link
            href="/invitation"
            onClick={handleNav}
            className="block py-3 text-sm tracking-[0.14em] uppercase text-wedding-ink"
          >
            {t('invitation')}
          </Link>
          <div className="flex gap-2 pt-3"><span className="text-xs text-wedding-muted">{t('language')}:</span>{(['en', 'fr'] as const).map((option) => <button key={option} type="button" onClick={() => { setLanguage(option); setIsOpen(false); }} className={`text-xs font-semibold ${language === option ? 'text-wedding-blue' : 'text-wedding-muted'}`}>{option.toUpperCase()}</button>)}</div>
        </div>
      )}
    </header>
  );
}
