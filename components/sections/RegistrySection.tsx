'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { siteConfig } from '@/lib/site-config';
import { useLanguage } from '@/components/LanguageProvider';
import CopyableValue from '@/components/registry/CopyableValue';
import { createClient } from '@/lib/supabase/client';
import type { Goal } from '@/lib/types';

export default function RegistrySection() {
  const { language, t } = useLanguage();
  const { ivoryCoast, ghana } = siteConfig.giftPayments;
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    async function loadGoals() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('goals')
          .select('*')
          .order('sort_order', { ascending: true });
        if (!error) setGoals((data ?? []) as Goal[]);
      } catch {
        // The payment details remain available if the registry database is not connected.
      }
    }
    void loadGoals();
  }, []);

  return (
    <section id="registry" className="section-pad scroll-mt-20 max-w-5xl mx-auto">
      <div className="text-center space-y-3 mb-14 max-w-2xl mx-auto">
        <p className="text-[11px] tracking-[0.22em] uppercase text-wedding-blue">Registry</p>
        <h2 className="section-title">{t('weddingRegistry')}</h2>
        <p className="text-wedding-muted text-sm sm:text-base font-light leading-relaxed">
          {t('registryIntro')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
        {/* Ivory Coast */}
        <article className="relative overflow-hidden border border-wedding-brown/80 bg-wedding-white/80">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-wedding-blue via-wedding-gold to-wedding-blue" />
          <div className="p-7 sm:p-9 space-y-7">
            <header className="space-y-2">
              <p className="text-[11px] tracking-[0.2em] uppercase text-wedding-blue font-medium">
                {language === 'fr' ? ivoryCoast.countryFr : ivoryCoast.country}
              </p>
              <h3 className="font-serif text-2xl sm:text-3xl text-wedding-ink">
                {ivoryCoast.accountHolder}
              </h3>
              <p className="text-sm text-wedding-muted font-light">{t('mobileTransfers')}</p>
            </header>

            <ul className="space-y-0 divide-y divide-wedding-brown/50">
              {ivoryCoast.methods.map((method) => (
                <li
                  key={`${method.label}-${method.value}`}
                  className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0"
                >
                  <span className="text-sm text-wedding-muted">{method.label}</span>
                  <CopyableValue value={method.value} label={method.label} className="text-sm text-wedding-ink" />
                </li>
              ))}
            </ul>
          </div>
        </article>

        {/* Ghana */}
        <article className="relative overflow-hidden border border-wedding-brown/80 bg-wedding-white/80">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-wedding-gold via-wedding-blue to-wedding-gold" />
          <div className="p-7 sm:p-9 space-y-7">
            <header className="space-y-2">
              <p className="text-[11px] tracking-[0.2em] uppercase text-wedding-blue font-medium">
                {language === 'fr' ? ghana.countryFr : ghana.country}
              </p>
              <h3 className="font-serif text-2xl sm:text-3xl text-wedding-ink">
                {ghana.accountHolder}
              </h3>
              <p className="text-sm text-wedding-muted font-light">{t('bankAndMobile')}</p>
            </header>

            <div className="space-y-5">
              <div className="space-y-3">
                <p className="text-[11px] tracking-[0.18em] uppercase text-wedding-blue font-semibold">
                  {t('bankTransfer')}
                </p>
                <dl className="space-y-3 text-sm">
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4">
                    <dt className="text-wedding-muted shrink-0">{t('accountName')}</dt>
                    <dd className="text-wedding-ink font-medium sm:text-right">{ghana.bank.accountName}</dd>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4">
                    <dt className="text-wedding-muted shrink-0">{t('bankName')}</dt>
                    <dd className="text-wedding-ink font-medium sm:text-right">{ghana.bank.bankName}</dd>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4">
                    <dt className="text-wedding-muted shrink-0">{t('accountNumber')}</dt>
                    <dd className="sm:text-right">
                      <CopyableValue
                        value={ghana.bank.accountNumber}
                        label={t('accountNumber')}
                        className="text-sm text-wedding-ink"
                      />
                    </dd>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4">
                    <dt className="text-wedding-muted shrink-0">{t('swiftCode')}</dt>
                    <dd className="sm:text-right">
                      <CopyableValue
                        value={ghana.bank.swiftCode}
                        label={t('swiftCode')}
                        className="text-sm text-wedding-ink"
                      />
                    </dd>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4">
                    <dt className="text-wedding-muted shrink-0">{t('bankAddress')}</dt>
                    <dd className="text-wedding-ink font-medium sm:text-right leading-snug">
                      {ghana.bank.bankAddress}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="h-px bg-wedding-brown/50" />

              <div className="space-y-3">
                <p className="text-[11px] tracking-[0.18em] uppercase text-wedding-blue font-semibold">
                  {ghana.mobileMoney.label}
                </p>
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <CopyableValue
                      value={ghana.mobileMoney.value}
                      label={ghana.mobileMoney.label}
                      className="text-sm text-wedding-ink"
                    />
                    <p className="text-xs text-wedding-muted">{ghana.mobileMoney.name}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>

      <p className="mt-10 text-center text-xs text-wedding-muted font-light tracking-wide">
        {t('tapToCopy')}
      </p>

      {goals.length > 0 && (
        <div className="mt-18 border-t border-wedding-brown/70 pt-14">
          <div className="text-center mb-8">
            <p className="text-[11px] tracking-[0.22em] uppercase text-wedding-blue">Registry</p>
            <h3 className="font-serif text-3xl sm:text-4xl text-wedding-ink mt-2">{t('registryItems')}</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => (
              <article key={goal.id} className="overflow-hidden border border-wedding-brown bg-wedding-white">
                <div className="relative aspect-[4/3] bg-wedding-brown/30">
                  {goal.image_url ? (
                    <Image src={goal.image_url} alt={goal.title} fill className="object-cover" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-wedding-brown/40 to-wedding-gold/30" />
                  )}
                </div>
                <div className="p-5 space-y-2">
                  <h4 className="font-serif text-xl text-wedding-ink">{goal.title}</h4>
                  {goal.description && <p className="text-sm leading-relaxed text-wedding-muted">{goal.description}</p>}
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
