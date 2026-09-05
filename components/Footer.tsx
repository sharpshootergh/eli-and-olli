 'use client';

import { siteConfig } from '@/lib/site-config';
import { useLanguage } from '@/components/LanguageProvider';

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="border-t border-wedding-brown/60 py-14 px-4 text-center bg-wedding-brown/25">
      <div className="max-w-xl mx-auto space-y-3">
        <p className="font-serif text-2xl text-wedding-ink">{siteConfig.shortNames}</p>
        <p className="text-sm text-wedding-muted leading-relaxed">
          {t('traditionalWedding')} · Abidjan · 12 December 2026
          <br />
          {t('whiteWedding')} · Cape Coast · 19 December 2026
        </p>
      </div>
    </footer>
  );
}
