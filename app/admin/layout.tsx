'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { siteConfig } from '@/lib/site-config';
import {
  LayoutDashboard,
  FolderTree,
  Target,
  Receipt,
  Camera,
  LogOut,
  Users,
  UserPlus,
  CalendarHeart,
  Printer,
  Clapperboard,
} from 'lucide-react';

const ADMIN_TABS = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'Categories', path: '/admin/categories', icon: FolderTree },
  { label: 'Goals', path: '/admin/goals', icon: Target },
  { label: 'Contributions', path: '/admin/contributions', icon: Receipt },
  { label: 'RSVPs', path: '/admin/rsvps', icon: CalendarHeart },
  { label: 'Moments', path: '/admin/moments', icon: Camera },
  { label: 'Invitation', path: '/admin/invitation', icon: Printer },
  { label: 'Content', path: '/admin/content', icon: Clapperboard },
  { label: 'Admins', path: '/admin/admins', icon: UserPlus },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(() =>
    pathname === '/admin/login' ? true : null
  );
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    if (pathname === '/admin/login') {
      return;
    }

    async function verifyAuth() {
      if (
        typeof window !== 'undefined' &&
        sessionStorage.getItem('admin_demo_authenticated') === 'true'
      ) {
        setUserEmail(siteConfig.primaryAdminEmail);
        setAuthorized(true);
        return;
      }

      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user?.email) {
        router.push('/admin/login');
        return;
      }

      const res = await fetch('/api/admin/check');
      const data = await res.json();

      if (data.allowed) {
        setUserEmail(session.user.email);
        setAuthorized(true);
      } else {
        await supabase.auth.signOut();
        router.push('/admin/login?denied=1');
      }
    }

    verifyAuth();
  }, [pathname, router]);

  const handleSignOut = async () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('admin_demo_authenticated');
    }
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (authorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-wedding-white">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-wedding-blue border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-wedding-muted">Verifying admin access…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-wedding-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-wedding-brown">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-wedding-blue">
              Admin
            </span>
            <h1 className="font-serif text-3xl text-wedding-ink">
              {siteConfig.shortNames}
            </h1>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-xs text-wedding-muted bg-wedding-brown/40 px-3 py-1.5 border border-wedding-brown">
              <Users className="w-3 h-3 inline mr-1" />
              {userEmail}
            </span>
            <button
              type="button"
              onClick={handleSignOut}
              className="text-xs font-medium text-red-600 hover:bg-red-50 px-3 py-1.5 border border-red-200 flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-wedding-brown pb-4">
          {ADMIN_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.path;
            return (
              <Link
                key={tab.path}
                href={tab.path}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all ${
                  isActive
                    ? 'bg-wedding-blue text-white'
                    : 'bg-wedding-brown/40 text-wedding-muted hover:bg-wedding-brown'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </Link>
            );
          })}
        </div>

        <div className="min-h-[400px]">{children}</div>
      </div>
    </div>
  );
}
