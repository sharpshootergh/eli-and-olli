'use client';

import { useRef, useState } from 'react';
import { ExternalLink, FileDown, Printer } from 'lucide-react';

export default function AdminInvitationPage() {
  const previewRef = useRef<HTMLIFrameElement>(null);
  const [language, setLanguage] = useState<'en' | 'fr'>('en');

  const printInvitation = () => {
    previewRef.current?.contentWindow?.focus();
    previewRef.current?.contentWindow?.print();
  };

  return (
    <div className="space-y-7">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
        <div>
          <h2 className="font-serif text-3xl text-wedding-ink">Printable invitation</h2>
          <p className="mt-1 text-sm text-wedding-muted max-w-2xl">
            Choose English or French, then use the print dialog to print it or choose <strong>Save as PDF</strong> to download a print-ready copy.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex overflow-hidden border border-wedding-brown text-[11px] font-semibold tracking-wider" aria-label="Invitation language">
            {(['en', 'fr'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setLanguage(option)}
                aria-pressed={language === option}
                className={`px-3 py-2 transition-colors ${language === option ? 'bg-wedding-ink text-white' : 'bg-white text-wedding-muted hover:bg-wedding-brown/30'}`}
              >
                {option === 'en' ? 'English' : 'Français'}
              </button>
            ))}
          </div>
          <button type="button" onClick={printInvitation} className="btn-primary inline-flex gap-2">
            <Printer className="w-4 h-4" />
            Print / save as PDF
          </button>
          <a
            href={`/invitation?lang=${language}`}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary inline-flex gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Open print view
          </a>
        </div>
      </div>

      <div className="border border-wedding-brown bg-wedding-brown/20 p-3 sm:p-6">
        <div className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-wedding-muted">
          <FileDown className="w-3.5 h-3.5" />
          Print preview
        </div>
        <div className="overflow-hidden border border-wedding-brown bg-white shadow-[0_18px_45px_-32px_rgba(26,42,50,0.7)]">
          <iframe
            ref={previewRef}
            title="Invitation print preview"
            src={`/invitation?lang=${language}`}
            className="block h-[680px] w-full bg-white sm:h-[800px]"
          />
        </div>
      </div>
    </div>
  );
}
