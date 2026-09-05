import type { Metadata } from 'next';
import { Cormorant_Garamond, Source_Sans_3 } from 'next/font/google';
import './globals.css';
import { siteConfig } from '@/lib/site-config';
import SiteChrome from '@/components/SiteChrome';
import { LanguageProvider } from '@/components/LanguageProvider';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-serif',
  display: 'swap',
});

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

function getMetadataBase(): URL {
  try {
    const rawUrl = siteConfig.siteUrl?.trim();
    if (!rawUrl) return new URL('https://seguamour.com');
    const formatted = rawUrl.startsWith('http://') || rawUrl.startsWith('https://')
      ? rawUrl
      : `https://${rawUrl}`;
    return new URL(formatted);
  } catch {
    return new URL('https://seguamour.com');
  }
}

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: `${siteConfig.shortNames} — Our Wedding`,
  description: `Join Elisha & Olivia for their traditional wedding in Abidjan and white wedding in Cape Coast.`,
  openGraph: {
    title: `${siteConfig.shortNames} — Our Wedding`,
    description: 'Two celebrations · One love story',
    type: 'website',
    url: siteConfig.siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${sourceSans.variable} scroll-smooth`}
    >
      <body className="font-sans text-wedding-ink antialiased selection:bg-wedding-blue/20 flex flex-col min-h-screen">
        <LanguageProvider><SiteChrome>{children}</SiteChrome></LanguageProvider>
      </body>
    </html>
  );
}
