'use client';

import { useState } from 'react';
import { Goal } from '@/lib/types';
import { X, ShieldCheck, CreditCard, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ContributeModalProps {
  goal: Goal;
  onClose: () => void;
}

type PaystackCallbackResponse = {
  reference: string;
};

type PaystackHandler = {
  openIframe: () => void;
};

type PaystackSetupOptions = {
  key?: string;
  email: string;
  amount: number;
  currency: string;
  ref: string;
  metadata: Record<string, string | number | null>;
  callback: (response: PaystackCallbackResponse) => void;
  onClose: () => void;
};

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: PaystackSetupOptions) => PaystackHandler;
    };
  }
}

export default function ContributeModal({ goal, onClose }: ContributeModalProps) {
  const isCapped = goal.type === 'capped';
  const target = goal.target_amount || 0;

  // Preset suggestions for capped goals
  const p10 = isCapped && target > 0 ? Math.round(target * 0.1) : 50;
  const p25 = isCapped && target > 0 ? Math.round(target * 0.25) : 100;
  const p50 = isCapped && target > 0 ? Math.round(target * 0.5) : 250;

  const [selectedAmount, setSelectedAmount] = useState<number | string>(p25);
  const [customAmount, setCustomAmount] = useState<string>(String(p25));
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSelectPreset = (amt: number) => {
    setSelectedAmount(amt);
    setCustomAmount(String(amt));
  };

  const handleCustomChange = (val: string) => {
    setCustomAmount(val);
    setSelectedAmount('custom');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const numericAmount = parseFloat(customAmount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMsg('Please enter a valid contribution amount in GHS.');
      return;
    }

    if (!name.trim()) {
      setErrorMsg('Please enter your name.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      // Call Paystack initialization API
      const res = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal_id: goal.id,
          contributor_name: name.trim(),
          contributor_email: email.trim(),
          contributor_phone: phone.trim() || null,
          amount: numericAmount,
          message: message.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Could not initialize payment');
      }

      // Check if running client Paystack inline JS popup or redirecting to authorization URL
      if (typeof window !== 'undefined' && window.PaystackPop && !data.is_mock) {
        const handler = window.PaystackPop.setup({
          key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
          email: email.trim(),
          amount: Math.round(numericAmount * 100),
          currency: 'GHS',
          ref: data.reference,
          metadata: {
            goal_id: goal.id,
            contributor_name: name.trim(),
            contributor_email: email.trim(),
            contributor_phone: phone.trim(),
            message: message.trim(),
          },
          callback: (response) => {
            confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
            alert(`Thank you ${name}! Your payment reference is ${response.reference}.`);
            onClose();
          },
          onClose: () => {
            setLoading(false);
          },
        });
        handler.openIframe();
      } else {
        // Fallback or Mock mode: trigger confetti & redirect to authorization URL / success simulation
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });

        if (data.is_mock) {
          // Send simulated webhook call for dev testing so DB updates atomically!
          await fetch('/api/webhooks/paystack', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: 'charge.success',
              data: {
                reference: data.reference,
                amount: Math.round(numericAmount * 100),
                customer: { email: email.trim() },
                metadata: {
                  goal_id: goal.id,
                  contributor_name: name.trim(),
                  contributor_email: email.trim(),
                  contributor_phone: phone.trim(),
                  message: message.trim(),
                },
              },
            }),
          });

          alert(`[Test Mode Success] Thank you ${name}! Contribution of GHS ${numericAmount} recorded.`);
          window.location.reload();
        } else if (data.authorization_url) {
          window.location.href = data.authorization_url;
        }
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg glass-card bg-[#EDEFEE] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E3D3BC]/40 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-[#5a6a72] hover:text-[#1a2a32] p-2 rounded-full hover:bg-[#F2ECE4] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="space-y-2 text-center pb-4 border-b border-[#E3D3BC]/20">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#06B3F8]">
            <Sparkles className="w-3.5 h-3.5 text-[#06B3F8]" />
            Contribute to Registry
          </span>
          <h2 className="font-serif text-2xl text-[#1a2a32]">
            {goal.title}
          </h2>
          <p className="text-xs text-[#5a6a72]">
            {isCapped
              ? `Target: GHS ${target.toLocaleString('en-GH')}`
              : 'Open Fund — Any amount is deeply appreciated'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* Amount Picker */}
          <div className="space-y-3">
            <label className="block text-xs uppercase tracking-wider font-semibold text-[#06B3F8]">
              Select or Enter Amount (GHS) <span className="text-red-500">*</span>
            </label>

            {/* Capped Preset Percentage Buttons */}
            {isCapped && (
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: '10%', amount: p10 },
                  { label: '25%', amount: p25 },
                  { label: '50%', amount: p50 },
                ].map((preset) => (
                  <button
                    type="button"
                    key={preset.label}
                    onClick={() => handleSelectPreset(preset.amount)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-medium transition-all ${
                      selectedAmount === preset.amount && customAmount === String(preset.amount)
                        ? 'bg-[#06B3F8] text-white border-[#06B3F8] shadow-xs'
                        : 'border-[#E3D3BC] bg-white text-[#1a2a32] hover:border-[#06B3F8]'
                    }`}
                  >
                    <span className="block font-bold">{preset.label}</span>
                    <span className="text-[11px] opacity-80">GHS {preset.amount}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Custom Amount Input */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#06B3F8]">
                GHS
              </span>
              <input
                type="number"
                min="1"
                step="any"
                value={customAmount}
                onChange={(e) => handleCustomChange(e.target.value)}
                placeholder="Enter custom amount"
                className="w-full pl-14 pr-4 py-3 rounded-xl border border-[#E3D3BC] bg-white text-sm text-[#1a2a32] focus:outline-none focus:ring-2 focus:ring-[#06B3F8] shadow-xs font-medium"
                required
              />
            </div>
          </div>

          {/* Contributor Name */}
          <div className="space-y-1.5">
            <label className="block text-xs uppercase tracking-wider font-semibold text-[#06B3F8]">
              Your Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Auntie Mercy Kwakye"
              className="w-full px-4 py-3 rounded-xl border border-[#E3D3BC] bg-white text-sm text-[#1a2a32] focus:outline-none focus:ring-2 focus:ring-[#06B3F8]"
              required
            />
          </div>

          {/* Contributor Email */}
          <div className="space-y-1.5">
            <label className="block text-xs uppercase tracking-wider font-semibold text-[#06B3F8]">
              Your Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. mercy.kwakye@gmail.com"
              className="w-full px-4 py-3 rounded-xl border border-[#E3D3BC] bg-white text-sm text-[#1a2a32] focus:outline-none focus:ring-2 focus:ring-[#06B3F8]"
              required
            />
            <p className="text-[11px] text-[#5a6a72]">We will send your thank-you receipt here.</p>
          </div>

          {/* Contributor Phone (Optional) */}
          <div className="space-y-1.5">
            <label className="block text-xs uppercase tracking-wider font-semibold text-[#06B3F8]">
              Phone Number <span className="text-[#5a6a72] font-normal">(Optional, Mobile Money)</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 024 412 3456"
              className="w-full px-4 py-3 rounded-xl border border-[#E3D3BC] bg-white text-sm text-[#1a2a32] focus:outline-none focus:ring-2 focus:ring-[#06B3F8]"
            />
          </div>

          {/* Message */}
          <div className="space-y-1.5">
            <label className="block text-xs uppercase tracking-wider font-semibold text-[#06B3F8]">
              Personal Message / Blessing <span className="text-[#5a6a72] font-normal">(Optional)</span>
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Leave a note or blessing for Elisha & Olivia..."
              className="w-full px-4 py-3 rounded-xl border border-[#E3D3BC] bg-white text-sm text-[#1a2a32] focus:outline-none focus:ring-2 focus:ring-[#06B3F8] resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-[#06B3F8] hover:bg-[#5C211B] text-white font-medium text-sm tracking-wider uppercase transition-all duration-200 shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Initiating Paystack...</span>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                <span>Proceed to Pay GHS {customAmount || '0'}</span>
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 text-[11px] text-[#5a6a72] pt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Secured in GHS via Paystack (Mobile Money, Cards, Bank)</span>
          </div>
        </form>
      </div>
    </div>
  );
}
