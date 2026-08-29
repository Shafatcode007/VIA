'use client';

import Link from 'next/link';
import { getNavbarItems, UserRole } from '@/lib/access/moduleAccess';

/* NECESSITY: Renders module links in the top navbar */
/* LOGIC: Released + allowed modules render as links; unreleased modules render as grey, non-navigating text */
/* EDGE-CASE: null role renders all as disabled */

interface ModuleNavLinksProps {
  role: UserRole | null | undefined;
}

export function ModuleNavLinks({ role }: ModuleNavLinksProps) {
  const items = getNavbarItems(role);

  return (
    <nav aria-label="Modules" className="flex items-center gap-8">
      {items.map((item) =>
        item.enabled ? (
          <Link
            key={item.key}
            href={item.href}
            className="text-sm font-medium text-gray-800 transition-colors hover:text-[#4DBE55]"
          >
            {item.label}
          </Link>
        ) : (
          <span
            key={item.key}
            aria-disabled="true"
            title={item.comingSoon ? 'Coming soon' : 'Not available for your role'}
            className="cursor-not-allowed text-sm font-medium text-gray-300"
          >
            {item.label}
          </span>
        ),
      )}
    </nav>
  );
}
