 'use client';

import Image from 'next/image';
import { siteConfig } from '@/lib/site-config';
import { useLanguage } from '@/components/LanguageProvider';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { SiteMedia } from '@/lib/types';

export default function StorySection() {
  const { story, shortNames } = siteConfig;
  const { t } = useLanguage();
  const [media, setMedia] = useState<SiteMedia[]>([]);

  useEffect(() => {
    async function loadStoryMedia() {
      try {
        const res = await fetch('/api/content?section=story');
        const data = await res.json();
        if (data.success && Array.isArray(data.items) && data.items.length > 0) {
          setMedia(data.items as SiteMedia[]);
          return;
        }
        const supabase = createClient();
        const { data: dbData, error } = await supabase
          .from('site_media')
          .select('*')
          .eq('section', 'story')
          .order('sort_order', { ascending: true });
        if (!error && dbData?.length) setMedia(dbData as SiteMedia[]);
      } catch {
        // Fallback
      }
    }
    void loadStoryMedia();
  }, []);

  const storyImages = media.filter((item) => item.media_type === 'image');
  const storyVideo = media.find((item) => item.media_type === 'video');
  const images = storyImages.length
    ? storyImages.map((item) => ({
        src: item.media_url,
        mobileSrc: item.mobile_media_url,
        position: item.object_position || 'left',
        mobilePosition: item.mobile_object_position || item.object_position || 'left',
      }))
    : [
        {
          src: '/hero/TBC288-8c168739-6060-41c1-b5e3-93b0581aa660.webp',
          mobileSrc: '/hero/mobile/TBC288.webp',
          position: 'left',
          mobilePosition: 'center 20%',
        },
        {
          src: '/hero/TBC140-9c898793-a28e-41bb-a3b2-c0f640100ae9.webp',
          mobileSrc: '/hero/mobile/TBC140.webp',
          position: 'left',
          mobilePosition: 'center 20%',
        },
      ];
  const isYoutube = storyVideo ? storyVideo.video_provider === 'youtube' : story.videoType === 'youtube';
  const videoUrl = storyVideo?.media_url ?? (isYoutube ? story.youtubeUrl : story.mp4Url);

  const [activeStoryIdx, setActiveStoryIdx] = useState(0);
  const [startX, setStartX] = useState<number | null>(null);
  const [endX, setEndX] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setEndX(null);
    setStartX(e.targetTouches[0].clientX);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    setEndX(e.targetTouches[0].clientX);
  };
  const handleTouchEnd = () => {
    if (startX === null || endX === null || images.length <= 1) return;
    const distance = startX - endX;
    if (distance > 40) {
      setActiveStoryIdx((prev) => (prev + 1) % images.length);
    } else if (distance < -40) {
      setActiveStoryIdx((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  return (
    <section id="story" className="section-pad scroll-mt-20 max-w-5xl mx-auto">
      <div className="text-center space-y-3 mb-12 md:mb-16">
        <p className="text-[11px] tracking-[0.22em] uppercase text-wedding-blue">{t('ourStory')}</p>
        <h2 className="section-title">{t('storyTitle')}</h2>
        <p className="font-serif text-xl sm:text-2xl text-wedding-muted">{shortNames}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
        {/* Mobile View: Swipeable Touch Photo Frame */}
        <div className="block sm:hidden space-y-2.5">
          <div
            className="relative aspect-[4/5] w-full overflow-hidden border border-wedding-brown touch-pan-y"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {images.map((img, idx) => {
              const isCurrent = idx === activeStoryIdx;
              return (
                <div
                  key={img.src + idx}
                  className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                    isCurrent ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                  }`}
                >
                  <Image
                    src={img.mobileSrc || img.src}
                    alt={`${shortNames} story photo ${idx + 1}`}
                    fill
                    className="object-cover"
                    style={{ objectPosition: img.mobilePosition || 'center 20%' }}
                    sizes="100vw"
                    priority={idx === 0}
                  />
                </div>
              );
            })}

            {/* Mobile Swipe Pagination Dots */}
            {images.length > 1 && (
              <div className="absolute bottom-3 inset-x-0 z-20 flex justify-center items-center gap-2 pointer-events-auto">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveStoryIdx(idx)}
                    aria-label={`Go to story photo ${idx + 1}`}
                    className={`transition-all rounded-full ${
                      idx === activeStoryIdx
                        ? 'w-6 h-2 bg-wedding-blue shadow-xs'
                        : 'w-2 h-2 bg-white/70 hover:bg-white'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {images.length > 1 && (
            <p className="text-center text-[11px] text-wedding-muted tracking-wider uppercase">
              Swipe to view more photos ({activeStoryIdx + 1}/{images.length})
            </p>
          )}
        </div>

        {/* Desktop View: Stacked Photos */}
        <div className="hidden sm:block space-y-6">
          <div className="relative aspect-[4/5] w-full overflow-hidden border border-wedding-brown">
            <Image
              src={images[0].src}
              alt={`${shortNames} — a quiet moment`}
              fill
              className="object-cover"
              style={{ objectPosition: images[0].position }}
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          {images[1] && (
            <div className="relative aspect-[16/10] w-full overflow-hidden border border-wedding-brown">
              <Image
                src={images[1].src}
                alt={`${shortNames} celebrating`}
                fill
                className="object-cover"
                style={{ objectPosition: images[1].position }}
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="prose prose-lg max-w-none">
            {(t('storyProse') || story.prose).split('\n\n').map((para, i) => (
              <p key={i} className="text-wedding-muted font-light leading-relaxed text-base sm:text-lg mb-5">
                {para}
              </p>
            ))}
          </div>

          <div className="space-y-3">
            <p className="text-[11px] tracking-[0.2em] uppercase text-wedding-gold">{t('watchFilm')}</p>
            <div className="relative w-full aspect-video overflow-hidden border border-wedding-brown bg-wedding-ink/5">
              {isYoutube ? (
                <iframe
                  src={videoUrl}
                  title={`${shortNames} story video`}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : videoUrl ? (
                <video
                  src={videoUrl}
                  controls
                  className="absolute inset-0 w-full h-full object-cover"
                  playsInline
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-wedding-muted">
                  {t('videoSoon')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
