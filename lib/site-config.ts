/**
 * Couple / site content — edit here or override via env.
 * Domain via NEXT_PUBLIC_SITE_URL only (never hardcode).
 */

export type AttendanceChoice = 'traditional' | 'white' | 'both' | 'none';

export interface WeddingEvent {
  id: string;
  name: string;
  /** ISO date YYYY-MM-DD */
  eventDate: string;
  /** 24h HH:MM or null */
  eventTime: string | null;
  location: string;
  sortOrder: number;
  /** Key used by RSVP attendance mapping */
  attendanceKey: 'traditional' | 'white';
}

function getValidSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!envUrl) {
    return 'https://seguamour.com';
  }
  if (envUrl.startsWith('http://') || envUrl.startsWith('https://')) {
    return envUrl;
  }
  return `https://${envUrl}`;
}

export const siteConfig = {
  couple: {
    partnerOne: {
      firstName: process.env.NEXT_PUBLIC_PARTNER_ONE_NAME ?? 'Elisha',
      nickname: process.env.NEXT_PUBLIC_PARTNER_ONE_NICKNAME ?? 'Elisha',
      fullName:
        process.env.NEXT_PUBLIC_PARTNER_ONE_FULL_NAME ?? 'Elisha Austin Sagoe',
    },
    partnerTwo: {
      firstName: process.env.NEXT_PUBLIC_PARTNER_TWO_NAME ?? 'Olivia',
      nickname: process.env.NEXT_PUBLIC_PARTNER_TWO_NICKNAME ?? 'Olivia',
      fullName:
        process.env.NEXT_PUBLIC_PARTNER_TWO_FULL_NAME ?? 'Olivia Eunice Tokpa',
    },
  },
  get shortNames() {
    return `${this.couple.partnerOne.nickname} & ${this.couple.partnerTwo.nickname}`;
  },
  get fullNames() {
    return `${this.couple.partnerTwo.fullName} & ${this.couple.partnerOne.fullName}`;
  },
  /** Fallback events when Supabase is not connected */
  events: [
    {
      id: 'event-traditional',
      name: 'Traditional Wedding',
      eventDate: '2026-12-12',
      eventTime: null,
      location: 'Abidjan, Ivory Coast',
      sortOrder: 1,
      attendanceKey: 'traditional' as const,
    },
    {
      id: 'event-white',
      name: 'White Wedding',
      eventDate: '2026-12-19',
      eventTime: '12:00',
      location: 'Cape Coast, Ghana',
      sortOrder: 2,
      attendanceKey: 'white' as const,
    },
  ] satisfies WeddingEvent[],
  siteUrl: getValidSiteUrl(),
  story: {
    videoType: (process.env.NEXT_PUBLIC_STORY_VIDEO_TYPE ?? 'youtube') as 'youtube' | 'mp4',
    youtubeUrl:
      process.env.NEXT_PUBLIC_STORY_YOUTUBE_URL ??
      'https://www.youtube.com/embed/dQw4w9WgXcQ',
    mp4Url: process.env.NEXT_PUBLIC_STORY_MP4_URL ?? '',
    prose:
      process.env.NEXT_PUBLIC_STORY_PROSE ??
      `Ours is a story written across cities and seasons — quiet mornings, shared jokes, and the slow certainty of choosing each other every day. From the first conversations that lasted longer than planned, to the moment we knew our futures belonged together, love has felt both gentle and sure.

Now we invite you to celebrate with us: first in Abidjan for our traditional wedding, then in Cape Coast for our white wedding. Two ceremonies, one promise — and we cannot wait to share both with the people who have shaped our lives.`,
  },
  currency: {
    code: 'GHS' as const,
    locale: 'en-GH',
  },
  primaryAdminEmail: 'elishaatosagoe@gmail.com',
  /** Monetary gift details — shown on the registry instead of online checkout */
  giftPayments: {
    ivoryCoast: {
      country: 'Ivory Coast',
      countryFr: "Côte d'Ivoire",
      accountHolder: 'Olivia Tokpa',
      methods: [
        { label: 'Wave', value: '0503489016' },
        { label: 'MTN Money', value: '0503489016' },
        { label: 'Djamo', value: '0503489016' },
        { label: 'Orange Money', value: '0749428559' },
      ],
    },
    ghana: {
      country: 'Ghana',
      countryFr: 'Ghana',
      accountHolder: 'Elisha Austin Sagoe',
      bank: {
        accountName: 'SAGOE ELISHA AUSTIN',
        bankName: 'Ecobank Ghana',
        accountNumber: '1441002486779',
        swiftCode: 'ECOCGHAC',
        bankAddress: '2 Morocco Lane, Off Independence Ave',
      },
      mobileMoney: {
        label: 'Mobile Money',
        value: '0545826575',
        name: 'Elisha Austin Sagoe',
      },
    },
  },
};

export function formatGhs(amount: number): string {
  return new Intl.NumberFormat(siteConfig.currency.locale, {
    style: 'currency',
    currency: siteConfig.currency.code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatEventDate(isoDate: string, language: 'en' | 'fr' = 'en'): string {
  const d = new Date(`${isoDate}T12:00:00`);
  return d.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatEventTime(time: string | null, language: 'en' | 'fr' = 'en'): string | null {
  if (!time) return null;
  const [h, m] = time.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m ?? 0, 0, 0);
  return d.toLocaleTimeString(language === 'fr' ? 'fr-FR' : 'en-GB', { hour: 'numeric', minute: '2-digit' });
}

/** ISO datetime for countdown timers */
export function eventCountdownIso(event: Pick<WeddingEvent, 'eventDate' | 'eventTime'>): string {
  const time = event.eventTime ?? '12:00';
  return `${event.eventDate}T${time}:00`;
}
