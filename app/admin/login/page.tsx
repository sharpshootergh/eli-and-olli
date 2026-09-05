'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { siteConfig } from '@/lib/site-config';
import { Lock, ShieldAlert, LogIn } from 'lucide-react';
import { Suspense } from 'react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const error =
    searchParams.get('denied') === '1'
      ? 'Access denied. Your Google account is not on the admin allowlist.'
      : localError;

  useEffect(() => {
    async function checkSession() {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user?.email) {
        const res = await fetch('/api/admin/check');
        const data = await res.json();
        if (data.allowed) router.push('/admin');
      }
    }

    checkSession();
  }, [router, searchParams]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setLocalError('');
    try {
      const supabase = createClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/admin`,
        },
      });
      if (oauthError) throw oauthError;
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to sign in');
      setLoading(false);
    }
  };

  const handleDemoBypass = () => {
    sessionStorage.setItem('admin_demo_authenticated', 'true');
    router.push('/admin');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-wedding-white">
      <div className="max-w-md w-full border border-wedding-brown bg-wedding-white p-8 shadow-lg space-y-6 text-center">
        <div className="w-14 h-14 bg-wedding-blue/10 flex items-center justify-center mx-auto text-wedding-blue">
          <Lock className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h1 className="font-serif text-3xl text-wedding-ink">Admin portal</h1>
          <p className="text-xs text-wedding-muted">
            {siteConfig.shortNames} — manage registry, RSVPs, moments, and admins.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 text-left">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-4 px-6 bg-white hover:bg-wedding-brown/30 text-wedding-ink text-sm border border-wedding-brown flex items-center justify-center gap-3"
        >
          {loading ? 'Redirecting…' : 'Continue with Google'}
        </button>

        <div className="pt-4 border-t border-wedding-brown space-y-2">
          <p className="text-[11px] text-wedding-muted">Local testing without OAuth?</p>
          <button
            type="button"
            onClick={handleDemoBypass}
            className="text-xs text-wedding-blue hover:underline font-semibold inline-flex items-center gap-1"
          >
            <LogIn className="w-3.5 h-3.5" />
            Enter demo mode
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-wedding-white" />}>
      <LoginForm />
    </Suspense>
  );
}
