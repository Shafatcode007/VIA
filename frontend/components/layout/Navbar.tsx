'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ModuleNavLinks } from './ModuleNavLinks';
import { getMe, type User } from '@/lib/api/auth';
import type { UserRole } from '@/lib/access/moduleAccess';

/* NECESSITY: Top navbar with module links and auth state */
/* LOGIC: Fetches user role on mount, passes to ModuleNavLinks */
/* EDGE-CASE: If token invalid/expired, shows as guest (no module links) */

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const me = await getMe();
        setUser(me);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const role = (user?.role as UserRole) || null;

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-bold text-[#4DBE55]">
          VIA
        </Link>

        {!loading && <ModuleNavLinks role={role} />}

        <div className="flex items-center gap-4">
          {loading ? (
            <div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="text-sm font-medium text-gray-700 hover:text-[#4DBE55]"
              >
                Dashboard
              </Link>
              <span className="rounded-full bg-[#edf7ee] px-3 py-1 text-xs font-medium text-[#4DBE55]">
                {user.role}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-gray-700 hover:text-[#4DBE55]"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-[#4DBE55] px-4 py-2 text-sm font-medium text-white hover:bg-green-600 transition"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
