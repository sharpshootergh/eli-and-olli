 'use client';

import Image from 'next/image';
import { Goal } from '@/lib/types';
import { Users, Gift } from 'lucide-react';
import { formatGhs } from '@/lib/site-config';
import { useLanguage } from '@/components/LanguageProvider';

interface GoalCardProps {
  goal: Goal;
  contributorCount?: number;
  onContribute: (goal: Goal) => void;
}

export default function GoalCard({ goal, contributorCount, onContribute }: GoalCardProps) {
  const { t } = useLanguage();
  const isCapped = goal.type === 'capped';
  const target = goal.target_amount || 0;
  const raised = goal.amount_raised || 0;
  const percent = target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0;
  const count = contributorCount ?? goal.contributor_count ?? 0;

  return (
    <div className="bg-wedding-white border border-wedding-brown overflow-hidden flex flex-col justify-between group">
      <div>
        <div className="relative w-full h-52 bg-wedding-brown/40 overflow-hidden">
          {goal.image_url ? (
            <Image
              src={goal.image_url}
              alt={goal.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-wedding-blue">
              <Gift className="w-12 h-12" />
            </div>
          )}
        </div>

        <div className="p-6 space-y-4">
          <h3 className="font-serif text-2xl text-wedding-ink group-hover:text-wedding-blue transition-colors">
            {goal.title}
          </h3>

          {goal.description && (
            <p className="text-sm text-wedding-muted font-light leading-relaxed line-clamp-3">
              {goal.description}
            </p>
          )}

          {isCapped ? (
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center text-xs font-medium text-wedding-ink">
                <span>{formatGhs(raised)} {t('raised')}</span>
                <span className="text-wedding-muted">{t('of')} {formatGhs(target)}</span>
              </div>
              <div className="w-full h-2 bg-wedding-brown/50 overflow-hidden">
                <div
                  className="h-full bg-wedding-blue transition-all duration-700"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-wedding-muted">
                <span>{percent}% {t('funded')}</span>
                <span>{count > 0 ? `${count} ${t('contributions')}` : t('beFirst')}</span>
              </div>
            </div>
          ) : (
            <div className="pt-2 text-xs text-wedding-muted flex items-center gap-1.5 font-medium">
              <Users className="w-4 h-4 text-wedding-blue" />
              <span>
                {count > 0 ? `${count} ${t('contributed')}` : t('openContributions')}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 pt-0">
        <button
          type="button"
          onClick={() => onContribute(goal)}
          className="w-full py-3.5 px-6 bg-wedding-blue hover:brightness-95 text-white font-medium text-sm tracking-wider uppercase transition-all flex items-center justify-center gap-2"
        >
          <Gift className="w-4 h-4 text-wedding-gold" />
          {t('contribute')}
        </button>
      </div>
    </div>
  );
}
