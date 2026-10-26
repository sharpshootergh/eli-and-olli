'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
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

  // Touch gesture support for mobile lightbox swiping
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/moments');
        const data = await res.json();
        if (data.success && Array.isArray(data.moments) && data.moments.length > 0) {
          setItems(data.moments);
        } else {
          setItems(MOCK_MOMENTS);
        }
      } catch {
        setItems(MOCK_MOMENTS);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const nextMoment = useCallback(() => {
    setSelectedIndex((current) => {
      if (current === null || items.length === 0) return null;
      return (current + 1) % items.length;
    });
  }, [items.length]);

  const prevMoment = useCallback(() => {
    setSelectedIndex((current) => {
      if (current === null || items.length === 0) return null;
      return current === 0 ? items.length - 1 : current - 1;
    });
  }, [items.length]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (selectedIndex !== null) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [selectedIndex]);

  // Keyboard navigation for desktop
  useEffect(() => {
    if (selectedIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextMoment();
      else if (e.key === 'ArrowLeft') prevMoment();
      else if (e.key === 'Escape') setSelectedIndex(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, nextMoment, prevMoment]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 45;
    if (distance > minSwipeDistance) {
      nextMoment();
    } else if (distance < -minSwipeDistance) {
      prevMoment();
    }
  };

  const selected = selectedIndex !== null ? items[selectedIndex] : null;

  return (
    <section id="moments" className="section-pad scroll-mt-20 max-w-6xl mx-auto">
      <div className="text-center space-y-3 mb-10 md:mb-12 max-w-2xl mx-auto">
        <p className="text-[11px] tracking-[0.22em] uppercase text-wedding-blue">Moments</p>
        <h2 className="section-title">{t('photosFilms')}</h2>
        <p className="text-wedding-muted text-sm sm:text-base font-light">
          {t('momentsIntro')}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="aspect-square sm:aspect-[4/3] bg-wedding-brown/30 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-6">
          {items.map((item, index) => {
            const isVideo = item.media_type === 'video';
            const thumb = item.thumbnail_url || item.image_url;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className="group relative aspect-square sm:aspect-[4/3] overflow-hidden border border-wedding-brown text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-wedding-blue"
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
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
                  />
                )}
                {isVideo && (
                  <span className="absolute inset-0 flex items-center justify-center bg-wedding-ink/25">
                    <span className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-wedding-blue/90 text-white flex items-center justify-center shadow-lg">
                      <Play className="w-4 h-4 sm:w-6 sm:h-6 fill-current ml-0.5" />
                    </span>
                  </span>
                )}
                {item.caption && (
                  <span className="absolute inset-x-0 bottom-0 p-2 sm:p-4 bg-gradient-to-t from-wedding-ink/80 via-wedding-ink/40 to-transparent text-white text-[11px] sm:text-sm line-clamp-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    {item.caption}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {selected && selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-wedding-ink/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 touch-pan-y"
          onClick={() => setSelectedIndex(null)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Close button with large touch target */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedIndex(null);
            }}
            className="absolute top-4 right-4 z-20 text-white/80 hover:text-white p-2.5 bg-black/30 rounded-full"
            aria-label={t('close')}
          >
            <X className="w-6 h-6" />
          </button>

          {/* Previous / Next buttons */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prevMoment();
            }}
            className="absolute left-2 sm:left-4 z-20 text-white/80 hover:text-white p-2.5 bg-black/30 rounded-full"
            aria-label={t('previous')}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              nextMoment();
            }}
            className="absolute right-2 sm:right-4 z-20 text-white/80 hover:text-white p-2.5 bg-black/30 rounded-full"
            aria-label={t('next')}
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div
            className="max-w-4xl w-full max-h-[90vh] flex flex-col items-center gap-3 sm:gap-4 pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-[54vh] sm:h-[65vh]">
              {selected.media_type === 'video' ? (
                <video
                  src={selected.image_url}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                />
              ) : (
                <>
                  <Image
                    src={selected.image_url}
                    alt={selected.caption || 'Moment'}
                    fill
                    className={`object-contain ${selected.thumbnail_url ? 'hidden sm:block' : ''}`}
                    sizes="(max-width: 768px) 100vw, 1200px"
                    priority
                  />
                  {selected.thumbnail_url && (
                    <Image
                      src={selected.thumbnail_url}
                      alt={selected.caption || 'Moment'}
                      fill
                      className="object-contain block sm:hidden"
                      sizes="100vw"
                      priority
                    />
                  )}
                </>
              )}
            </div>

            {selected.caption && (
              <p className="text-white/95 font-serif text-base sm:text-xl text-center px-4 leading-snug">
                {selected.caption}
              </p>
            )}

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-white/60 tracking-widest uppercase">
                {selectedIndex + 1} {t('of')} {items.length}
              </span>
              <span className="text-[10px] text-white/40 tracking-wider hidden sm:inline">
                · Swipe or use arrow keys
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
