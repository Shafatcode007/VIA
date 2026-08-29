'use client';

import Link from 'next/link';
import { getQuickActions, UserRole } from '@/lib/access/moduleAccess';

/* NECESSITY: Role-aware dashboard quick actions */
/* LOGIC: Released modules render as links; unreleased/disabled show "Coming Soon" */
/* EDGE-CASE: null role shows Housing + Grocery but as disabled */

interface QuickActionsProps {
  role: UserRole | null | undefined;
}

export function QuickActions({ role }: QuickActionsProps) {
  const actions = getQuickActions(role);

  return (
    <section className="rounded-2xl bg-white p-8 shadow-sm">
      <h2 className="mb-6 text-2xl font-bold text-gray-900">Quick actions</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {actions.map((action) =>
          action.enabled ? (
            <Link
              key={action.key}
              href={action.href}
              className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-6 text-center transition-all hover:border-[#4DBE55] hover:shadow-md"
            >
              <span className="text-lg font-semibold text-gray-900">{action.label}</span>
            </Link>
          ) : (
            <div
              key={action.key}
              aria-disabled="true"
              className="flex cursor-not-allowed flex-col items-center justify-center rounded-xl border border-gray-100 bg-gray-50 p-6 text-center opacity-60"
            >
              <span className="text-lg font-semibold text-gray-400">{action.label}</span>
              <span className="mt-2 text-sm text-gray-400">Coming Soon</span>
            </div>
          ),
        )}
      </div>
    </section>
  );
}
