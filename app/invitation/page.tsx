import type { Metadata } from 'next';
import InvitationContent from '@/components/InvitationContent';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: `You're invited — ${siteConfig.shortNames}`,
  description: `Invitation to the weddings of ${siteConfig.fullNames}`,
};

export default async function InvitationPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string | string[] }>;
}) {
  const { lang } = await searchParams;
  const printLanguage = lang === 'fr' ? 'fr' : lang === 'en' ? 'en' : undefined;

  return <InvitationContent printLanguage={printLanguage} />;
}
