'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { MOCK_MOMENTS } from '@/lib/mockData';
import { MomentMedia } from '@/lib/types';
import { Play, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { siteConfig } from '@/lib/site-config';
import { useLanguage } from '@/components/LanguageProvider';

export default function MomentsSection() {
  const { t } = useLanguage();
  const [items, setItems] = useState<MomentMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('moments_photos')
          .select('*')
          .order('sort_order', { ascending: true });

        if (error || !data?.length) {
          setItems(MOCK_MOMENTS);
        } else {
          setItems(
            data.map((row) => ({
              ...row,
              media_type: row.media_type || 'image',
              thumbnail_url: row.thumbnail_url ?? null,
            }))
          );
        }
      } catch {
        setItems(MOCK_MOMENTS);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const selected = selectedIndex !== null ? items[selectedIndex] : null;

  return (
    <section id="moments" className="section-pad scroll-mt-20 max-w-6xl mx-auto">
      <div className="text-center space-y-3 mb-12 max-w-2xl mx-auto">
        <p className="text-[11px] tracking-[0.22em] uppercase text-wedding-blue">Moments</p>
        <h2 className="section-title">{t('photosFilms')}</h2>
        <p className="text-wedding-muted text-sm sm:text-base font-light">
          {t('momentsIntro')}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="aspect-[4/3] bg-wedding-brown/30 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {items.map((item, index) => {
            const isVideo = item.media_type === 'video';
            const thumb = item.thumbnail_url || item.image_url;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className="group relative aspect-[4/3] overflow-hidden border border-wedding-brown text-left"
              >
                {isVideo && !item.thumbnail_url ? (
                  <video
                    src={item.image_url}
                    muted
                    playsInline
                    preload="metadata"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <Image
                    src={thumb}
                    alt={item.caption || siteConfig.shortNames}
                    fill
                    loading="lazy"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                )}
                {isVideo && (
                  <span className="absolute inset-0 flex items-center justify-center bg-wedding-ink/25">
                    <span className="w-14 h-14 rounded-full bg-wedding-blue/90 text-white flex items-center justify-center shadow-lg">
                      <Play className="w-6 h-6 fill-current ml-0.5" />
                    </span>
                  </span>
                )}
                {item.caption && (
                  <span className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-wedding-ink/70 to-transparent text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.caption}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {selected && selectedIndex !== null && (
        <div className="fixed inset-0 z-50 bg-wedding-ink/90 backdrop-blur-sm flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setSelectedIndex(null)}
            className="absolute top-6 right-6 text-white/80 hover:text-white p-2"
            aria-label={t('close')}
          >
            <X className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={() =>
              setSelectedIndex(selectedIndex === 0 ? items.length - 1 : selectedIndex - 1)
            }
            className="absolute left-4 text-white/80 hover:text-white p-2"
            aria-label={t('previous')}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={() =>
              setSelectedIndex(selectedIndex === items.length - 1 ? 0 : selectedIndex + 1)
            }
            className="absolute right-4 text-white/80 hover:text-white p-2"
            aria-label={t('next')}
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="max-w-4xl w-full max-h-[85vh] flex flex-col items-center gap-4">
            <div className="relative w-full h-[65vh]">
              {selected.media_type === 'video' ? (
                <video
                  src={selected.image_url}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                />
              ) : (
                <Image
                  src={selected.image_url}
                  alt={selected.caption || 'Moment'}
                  fill
                  className="object-contain"
                  priority
                />
              )}
            </div>
            {selected.caption && (
              <p className="text-white/90 font-serif text-lg text-center">{selected.caption}</p>
            )}
            <span className="text-xs text-white/50 tracking-widest uppercase">
              {selectedIndex + 1} {t('of')} {items.length}
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
