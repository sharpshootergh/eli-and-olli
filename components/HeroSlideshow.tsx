'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { SiteMedia } from '@/lib/types';

interface SlideItem {
  src: string;
  mobileSrc?: string | null;
  position: string;
  mobilePosition?: string | null;
}

const slides: SlideItem[] = [
  {
    src: '/hero/TBC5-72377c25-44f5-4487-90a6-32e6285327f6.jpg',
    position: 'center 25%',
  },
  {
    src: '/hero/TBC140-9c898793-a28e-41bb-a3b2-c0f640100ae9.jpg',
    position: 'center 25%',
  },
  {
    src: '/hero/TBC267-95769264-776e-42ff-8a97-d3d8e19b498f.jpg',
    position: 'center 25%',
  },
  {
    src: '/hero/TBC77-1e1ed5ff-242f-42b1-82ab-3a5b0b0560b1.jpg',
    position: 'center 25%',
  },
  {
    src: '/hero/TBC171-5be6d6b0-ceb7-45c3-a0ba-d7bb1c37a0d0.jpg',
    position: 'center 25%',
  },
  {
    src: '/hero/TBC-90ef3dd1-4489-43a6-82e5-0b53e9280206.jpg',
    position: 'center 25%',
  },
  {
    src: '/hero/TBC288-8c168739-6060-41c1-b5e3-93b0581aa660.jpg',
    position: 'center 25%',
  },
  {
    src: '/hero/TBC84-49a49f9e-d683-41a7-97f8-a0905f77cd1f.jpg',
    position: 'center 25%',
  },
  {
    src: '/hero/TBC244-423318dc-84da-459a-beab-47e134803a4d.jpg',
    position: 'center 25%',
  },
  {
    src: '/hero/TBC17-9734aa80-3a09-4d7e-98d1-3059177cdaa4.jpg',
    position: 'center 25%',
  },
  {
    src: '/hero/TBC235-3bba5f4b-b5a2-4db4-bf7a-19d3e72233d4.jpg',
    position: 'center 25%',
  },
];

const SLIDE_INTERVAL_MS = 6000;

export default function HeroSlideshow() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [managedSlides, setManagedSlides] = useState<SlideItem[] | null>(null);

  useEffect(() => {
    async function loadSlides() {
      try {
        const res = await fetch('/api/content?section=hero');
        const data = await res.json();
        if (data.success && Array.isArray(data.items) && data.items.length > 0) {
          setManagedSlides(
            (data.items as SiteMedia[]).map((item) => ({
              src: item.media_url,
              mobileSrc: item.mobile_media_url,
              position: item.object_position || 'center 25%',
              mobilePosition: item.mobile_object_position || item.object_position || 'center 25%',
            }))
          );
          return;
        }

        const supabase = createClient();
        const { data: dbData, error } = await supabase
          .from('site_media')
          .select('*')
          .eq('section', 'hero')
          .eq('media_type', 'image')
          .order('sort_order', { ascending: true });

        if (!error && dbData?.length) {
          setManagedSlides(
            (dbData as SiteMedia[]).map((item) => ({
              src: item.media_url,
              mobileSrc: item.mobile_media_url,
              position: item.object_position || 'center 25%',
              mobilePosition: item.mobile_object_position || item.object_position || 'center 25%',
            }))
          );
        }
      } catch {
        // Fallback
      }
    }

    void loadSlides();
  }, []);

  const visibleSlides = managedSlides ?? slides;

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionQuery.matches) return;

    const advanceSlide = () => {
      if (!document.hidden) {
        setActiveSlide((currentSlide) => (currentSlide + 1) % visibleSlides.length);
      }
    };
    const interval = window.setInterval(advanceSlide, SLIDE_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [visibleSlides.length]);

  return (
    <div className="absolute inset-0" aria-hidden="true">
      {visibleSlides.map((slide, index) => {
        const isActive = index === activeSlide;
        const hasSeparateMobileImage = Boolean(slide.mobileSrc && slide.mobileSrc !== slide.src);

        return (
          <div
            key={`${slide.src}-${index}`}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Desktop / Default Image */}
            <Image
              src={slide.src}
              alt=""
              fill
              priority={index === 0}
              sizes="100vw"
              style={{ objectPosition: slide.position }}
              className={`object-cover ${hasSeparateMobileImage ? 'hidden sm:block' : ''}`}
            />

            {/* Separate Mobile Image if configured */}
            {hasSeparateMobileImage && slide.mobileSrc && (
              <Image
                src={slide.mobileSrc}
                alt=""
                fill
                priority={index === 0}
                sizes="100vw"
                style={{ objectPosition: slide.mobilePosition || slide.position }}
                className="object-cover block sm:hidden"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

