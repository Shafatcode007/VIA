// NECESSITY: Role-aware module links for the top navbar
// LOGIC: Released modules are ALWAYS clickable. Logged-in users go to the module;
// guests go to /login?next=... so navigation never dead-ends.
// Only unreleased modules render as inert grey text.

"use client";

import Link from "next/link";
import { getNavbarItems } from "@/lib/access/moduleAccess";

interface ModuleNavLinksProps {
  rawRole: string | null | undefined;
}

export function ModuleNavLinks({ rawRole }: ModuleNavLinksProps) {
  const items = getNavbarItems(rawRole);
  const loggedIn = Boolean(rawRole);

  return (
    <nav aria-label="Modules" className="flex items-center gap-8">
      {items.map((item) =>
        item.comingSoon ? (
          <span key={item.key} aria-disabled="true" className="cursor-not-allowed text-sm font-medium text-gray-300">
            {item.label}
          </span>
        ) : (
          <Link
            key={item.key}
            href={loggedIn || item.publicBrowse ? item.href : item.loginHref}
            className="text-sm font-medium text-gray-800 transition-colors hover:text-[#4DBE55]"
          >
            {item.label}
          </Link>
        ),
      )}
    </nav>
  );
}
