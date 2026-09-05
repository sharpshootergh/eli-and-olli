'use client';

import { useSyncExternalStore } from 'react';
import { useLanguage } from '@/components/LanguageProvider';

interface CountdownTimerProps {
  targetDate: string;
  variant?: 'light' | 'dark';
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(targetDate: string, currentTime: number): TimeLeft {
  const target = new Date(targetDate).getTime();
  const diff = target - currentTime;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

export default function CountdownTimer({
  targetDate,
  variant = 'dark',
}: CountdownTimerProps) {
  const { t } = useLanguage();
  const currentTime = useSyncExternalStore(
    (onStoreChange) => {
      const id = setInterval(onStoreChange, 1000);
      return () => clearInterval(id);
    },
    () => Date.now(),
    () => 0
  );
  const timeLeft = getTimeLeft(targetDate, currentTime);

  const light = variant === 'light';

  return (
    <div className="flex justify-center items-center gap-3 sm:gap-5">
      {(
        [
          { label: t('days'), value: timeLeft.days },
          { label: t('hrs'), value: timeLeft.hours },
          { label: t('min'), value: timeLeft.minutes },
          { label: t('sec'), value: timeLeft.seconds },
        ] as const
      ).map((item) => (
        <div key={item.label} className="flex flex-col items-center min-w-[2.75rem]">
          <span
            className={`font-serif text-2xl sm:text-3xl tabular-nums ${
              light ? 'text-white' : 'text-wedding-blue'
            }`}
          >
            {String(item.value).padStart(2, '0')}
          </span>
          <span
            className={`text-[10px] uppercase tracking-[0.18em] mt-0.5 ${
              light ? 'text-white/70' : 'text-wedding-muted'
            }`}
          >
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
