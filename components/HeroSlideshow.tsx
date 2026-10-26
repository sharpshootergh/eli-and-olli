'use client';

import Image from 'next/image';
import { useEffect, useState, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { SiteMedia } from '@/lib/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SlideItem {
  src: string;
  mobileSrc?: string | null;
  position: string;
  mobilePosition?: string | null;
}

const slides: SlideItem[] = [
  {
    src: '/hero/TBC267-95769264-776e-42ff-8a97-d3d8e19b498f.webp',
    mobileSrc: '/hero/mobile/TBC267.webp',
    position: 'center 25%',
    mobilePosition: 'center 15%',
  },
  {
    src: '/hero/TBC288-8c168739-6060-41c1-b5e3-93b0581aa660.webp',
    mobileSrc: '/hero/mobile/TBC288.webp',
    position: 'center 25%',
    mobilePosition: 'center 12%',
  },
  {
    src: '/hero/TBC17-9734aa80-3a09-4d7e-98d1-3059177cdaa4.webp',
    mobileSrc: '/hero/mobile/TBC17.webp',
    position: '30% 25%',
    mobilePosition: 'center 18%',
  },
  {
    src: '/hero/TBC77-1e1ed5ff-242f-42b1-82ab-3a5b0b0560b1.webp',
    mobileSrc: '/hero/mobile/TBC77.webp',
    position: 'center 25%',
    mobilePosition: 'center 25%',
  },
  {
    src: '/hero/TBC171-5be6d6b0-ceb7-45c3-a0ba-d7bb1c37a0d0.webp',
    mobileSrc: '/hero/mobile/TBC171.webp',
    position: 'center 25%',
    mobilePosition: 'center 15%',
  },
  {
    src: '/hero/TBC244-423318dc-84da-459a-beab-47e134803a4d.webp',
    mobileSrc: '/hero/mobile/TBC244.webp',
    position: 'center 25%',
    mobilePosition: 'center 12%',
  },
  {
    src: '/hero/TBC235-3bba5f4b-b5a2-4db4-bf7a-19d3e72233d4.webp',
    mobileSrc: '/hero/mobile/TBC235.webp',
    position: 'center 25%',
    mobilePosition: 'center 20%',
  },
  {
    src: '/hero/TBC84-49a49f9e-d683-41a7-97f8-a0905f77cd1f.webp',
    mobileSrc: '/hero/mobile/TBC84.webp',
    position: 'center 25%',
    mobilePosition: 'center 25%',
  },
  {
    src: '/hero/TBC140-9c898793-a28e-41bb-a3b2-c0f640100ae9.webp',
    mobileSrc: '/hero/mobile/TBC140.webp',
    position: 'center 25%',
    mobilePosition: '28% 18%',
  },
  {
    src: '/hero/TBC-90ef3dd1-4489-43a6-82e5-0b53e9280206.webp',
    mobileSrc: '/hero/mobile/TBC.webp',
    position: 'center 25%',
    mobilePosition: '35% 18%',
  },
  {
    src: '/hero/TBC5-72377c25-44f5-4487-90a6-32e6285327f6.webp',
    mobileSrc: '/hero/mobile/TBC5.webp',
    position: 'center 25%',
    mobilePosition: 'center 18%',
  },
];

const SLIDE_INTERVAL_MS = 6000;

export default function HeroSlideshow() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [managedSlides, setManagedSlides] = useState<SlideItem[] | null>(null);
  const [isInView, setIsInView] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Touch gesture support for mobile swiping
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

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
              mobilePosition: item.mobile_object_position || item.object_position || 'center 18%',
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
              mobilePosition: item.mobile_object_position || item.object_position || 'center 18%',
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

  // Pause slideshow when out of view (saves mobile battery and data)
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const nextSlide = useCallback(() => {
    setActiveSlide((current) => (current + 1) % visibleSlides.length);
  }, [visibleSlides.length]);

  const prevSlide = useCallback(() => {
    setActiveSlide((current) => (current - 1 + visibleSlides.length) % visibleSlides.length);
  }, [visibleSlides.length]);

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionQuery.matches) return;

    const interval = window.setInterval(() => {
      if (!document.hidden && isInView) {
        nextSlide();
      }
    }, SLIDE_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [nextSlide, isInView]);

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
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      prevSlide();
    }
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 touch-pan-y"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-label="Wedding hero photo slideshow"
    >
      {visibleSlides.map((slide, index) => {
        const isActive = index === activeSlide;
        const hasMobileOverride = Boolean(
          (slide.mobileSrc && slide.mobileSrc !== slide.src) ||
          (slide.mobilePosition && slide.mobilePosition !== slide.position)
        );

        return (
          <div
            key={`${slide.src}-${index}`}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            {/* Desktop / Default Image */}
            <Image
              src={slide.src}
              alt="Elisha & Olivia"
              fill
              priority={index === 0}
              loading={index <= 1 ? 'eager' : 'lazy'}
              sizes="100vw"
              style={{ objectPosition: slide.position }}
              className={`object-cover ${hasMobileOverride ? 'hidden sm:block' : ''}`}
            />

            {/* Mobile Image (with mobile focal point or mobile crop) */}
            {hasMobileOverride && (
              <Image
                src={slide.mobileSrc || slide.src}
                alt="Elisha & Olivia"
                fill
                priority={index === 0}
                loading={index <= 1 ? 'eager' : 'lazy'}
                sizes="100vw"
                style={{ objectPosition: slide.mobilePosition || 'center 18%' }}
                className="object-cover block sm:hidden"
              />
            )}
          </div>
        );
      })}

      {/* Discreet Mobile Photo Navigation Pill & Counter */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-wedding-ink/60 backdrop-blur-md text-white text-[11px] tracking-wider px-2.5 py-1 rounded-full shadow-xs sm:hidden">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            prevSlide();
          }}
          className="p-0.5 hover:text-wedding-gold transition-colors"
          aria-label="Previous photo"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <span className="tabular-nums font-medium">
          {activeSlide + 1}/{visibleSlides.length}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            nextSlide();
          }}
          className="p-0.5 hover:text-wedding-gold transition-colors"
          aria-label="Next photo"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

