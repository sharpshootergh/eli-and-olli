'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CopyableValueProps {
  value: string;
  label?: string;
  className?: string;
}

export default function CopyableValue({ value, label, className = '' }: CopyableValueProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard may be unavailable */
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={label ? `Copy ${label}` : 'Copy'}
      className={`group inline-flex items-center gap-2 text-left min-h-[44px] px-2.5 py-1.5 -mx-2 -my-1 rounded-xs transition-colors hover:bg-wedding-brown/20 active:bg-wedding-brown/30 cursor-pointer ${className}`}
    >
      <span className="font-medium tracking-wide tabular-nums">{value}</span>
      {copied ? (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-xs animate-in fade-in duration-200">
          <Check className="w-3 h-3 text-emerald-600" />
          <span>Copied!</span>
        </span>
      ) : (
        <span className="text-wedding-muted group-hover:text-wedding-blue transition-colors" aria-hidden>
          <Copy className="w-3.5 h-3.5" />
        </span>
      )}
      <span className="sr-only">{copied ? 'Copied' : 'Copy to clipboard'}</span>
    </button>
  );
}
