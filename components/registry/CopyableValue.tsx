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
      className={`group inline-flex items-center gap-2 text-left transition-colors hover:text-wedding-blue ${className}`}
    >
      <span className="font-medium tracking-wide tabular-nums">{value}</span>
      <span className="text-wedding-muted group-hover:text-wedding-blue" aria-hidden>
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
      </span>
      <span className="sr-only">{copied ? 'Copied' : 'Copy to clipboard'}</span>
    </button>
  );
}
