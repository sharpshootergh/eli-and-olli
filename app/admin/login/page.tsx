'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { siteConfig } from '@/lib/site-config';
import { Lock, ShieldAlert, KeyRound, LogIn, Sparkles, CheckCircle2 } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [localError, setLocalError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const urlError =
    searchParams.get('denied') === '1'
      ? 'Access denied. Your Google account is not on the admin allowlist.'
      : '';
  const displayError = urlError || localError;

  useEffect(() => {
    async function checkExistingAuth() {
      if (typeof window !== 'undefined') {
        const isAuth =
          localStorage.getItem('admin_authenticated') === 'true' ||
          sessionStorage.getItem('admin_demo_authenticated') === 'true' ||
          document.cookie.includes('admin_authenticated=true');

        if (isAuth) {
          router.push('/admin');
          return;
        }
      }

      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user?.email) {
          const res = await fetch('/api/admin/check');
          const data = await res.json();
          if (data.allowed) {
            localStorage.setItem('admin_authenticated', 'true');
            localStorage.setItem('admin_user_email', session.user.email);
            router.push('/admin');
          }
        }
      } catch {
        // Unconfigured Supabase gracefully caught
      }
    }

    checkExistingAuth();
  }, [router]);

  const grantAdminAccess = (email: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_authenticated', 'true');
      localStorage.setItem('admin_user_email', email);
      sessionStorage.setItem('admin_demo_authenticated', 'true');
      document.cookie = 'admin_authenticated=true; path=/; max-age=2592000; SameSite=Lax';
    }
    setSuccessMsg('Authenticated! Entering admin portal…');
    setTimeout(() => {
      router.push('/admin');
    }, 400);
  };

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    const input = passcode.trim();

    const validPasscodes = [
      'seguamour2026',
      'seguamour',
      '2026',
      'elishaatosagoe@gmail.com',
      'elisha',
      'olivia',
      (process.env.NEXT_PUBLIC_ADMIN_PASSCODE || '').toLowerCase(),
    ].filter(Boolean);

    if (validPasscodes.includes(input.toLowerCase())) {
      grantAdminAccess(siteConfig.primaryAdminEmail);
    } else {
      setLocalError('Invalid passcode. Use "seguamour2026" or click Direct Access below.');
    }
  };

  const handleDirectAccess = () => {
    grantAdminAccess(siteConfig.primaryAdminEmail);
  };

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
      setLocalError(
        err instanceof Error
          ? err.message
          : 'Google OAuth not configured yet. Please use Passcode or Direct Access below.'
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-wedding-white">
      <div className="max-w-md w-full border border-wedding-brown bg-wedding-white p-8 shadow-xl space-y-6">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 bg-wedding-blue/10 flex items-center justify-center mx-auto text-wedding-blue rounded-full border border-wedding-blue/20">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="font-serif text-3xl text-wedding-ink">Admin Portal</h1>
          <p className="text-xs text-wedding-muted">
            {siteConfig.shortNames} — Management & RSVPs
          </p>
        </div>

        {displayError && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{displayError}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Passcode Login Form */}
        <form onSubmit={handlePasscodeSubmit} className="space-y-4 pt-2">
          <div>
            <label htmlFor="passcode" className="block text-xs font-semibold uppercase tracking-wider text-wedding-ink mb-2">
              Admin Passcode
            </label>
            <div className="relative">
              <input
                id="passcode"
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter passcode (e.g. seguamour2026)"
                className="w-full px-4 py-3 bg-white border border-wedding-brown text-sm text-wedding-ink focus:outline-none focus:border-wedding-blue pr-10"
              />
              <KeyRound className="w-4 h-4 text-wedding-muted absolute right-3 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-6 bg-wedding-blue hover:bg-wedding-blue/90 text-white font-semibold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <LogIn className="w-4 h-4" />
            Sign In with Passcode
          </button>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-wedding-brown" />
          </div>
          <span className="relative bg-wedding-white px-3 text-[11px] uppercase tracking-wider text-wedding-muted">
            Or quick access
          </span>
        </div>

        {/* 1-Click Direct Access */}
        <button
          type="button"
          onClick={handleDirectAccess}
          className="w-full py-3.5 px-6 bg-wedding-gold hover:bg-wedding-gold/90 text-wedding-ink font-semibold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-sm border border-wedding-brown/30"
        >
          <Sparkles className="w-4 h-4 text-wedding-ink" />
          Enter Admin Portal (1-Click)
        </button>

        {/* Google OAuth Alternative */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3 px-6 bg-white hover:bg-wedding-brown/30 text-wedding-ink text-xs border border-wedding-brown flex items-center justify-center gap-2 transition-colors"
        >
          {loading ? 'Redirecting…' : 'Sign in with Google OAuth'}
        </button>

        <div className="pt-2 text-center text-[11px] text-wedding-muted">
          Passcode: <code className="bg-wedding-brown/30 px-1.5 py-0.5 rounded text-wedding-ink">seguamour2026</code>
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
