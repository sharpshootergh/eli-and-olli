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
        { src: '/hero/TBC288-8c168739-6060-41c1-b5e3-93b0581aa660.jpg', mobileSrc: null, position: 'left', mobilePosition: 'left' },
        { src: '/hero/TBC140-9c898793-a28e-41bb-a3b2-c0f640100ae9.jpg', mobileSrc: null, position: 'left', mobilePosition: 'left' },
      ];
  const isYoutube = storyVideo ? storyVideo.video_provider === 'youtube' : story.videoType === 'youtube';
  const videoUrl = storyVideo?.media_url ?? (isYoutube ? story.youtubeUrl : story.mp4Url);

  return (
    <section id="story" className="section-pad scroll-mt-20 max-w-5xl mx-auto">
      <div className="text-center space-y-3 mb-12 md:mb-16">
        <p className="text-[11px] tracking-[0.22em] uppercase text-wedding-blue">{t('ourStory')}</p>
        <h2 className="section-title">{t('storyTitle')}</h2>
        <p className="font-serif text-xl sm:text-2xl text-wedding-muted">{shortNames}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
        <div className="space-y-6">
          <div className="relative aspect-[4/5] w-full overflow-hidden border border-wedding-brown">
            <Image
              src={images[0].src}
              alt={`${shortNames} — a quiet moment`}
              fill
              className={`object-cover ${images[0].mobileSrc ? 'hidden sm:block' : ''}`}
              style={{ objectPosition: images[0].position }}
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {images[0].mobileSrc && (
              <Image
                src={images[0].mobileSrc}
                alt={`${shortNames} — a quiet moment`}
                fill
                className="object-cover block sm:hidden"
                style={{ objectPosition: images[0].mobilePosition }}
                sizes="100vw"
              />
            )}
          </div>
          {images[1] && (
            <div className="relative aspect-[16/10] w-full overflow-hidden border border-wedding-brown hidden sm:block">
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
