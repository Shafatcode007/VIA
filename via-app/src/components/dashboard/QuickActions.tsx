// NECESSITY: Role-aware dashboard quick actions
// LOGIC: Released modules render as links; unreleased show "Coming Soon"
// EDGE-CASE: null role shows Housing + Grocery with loginHref redirect
"use client";

import Link from "next/link";
import { Home, ShoppingCart, Car, Heart } from "lucide-react";
import { getQuickActions } from "@/lib/access/moduleAccess";

interface QuickActionsProps {
  rawRole: string | null | undefined;
}

const ICONS: Record<string, React.ReactNode> = {
  HOUSING: <Home size={24} />,
  GROCERY: <ShoppingCart size={24} />,
  TRANSPORT: <Car size={24} />,
  SELLER_HUB: <ShoppingCart size={24} />,
  ADMIN_PANEL: <Heart size={24} />,
};

export function QuickActions({ rawRole }: QuickActionsProps) {
  const actions = getQuickActions(rawRole);
  const loggedIn = Boolean(rawRole);

  return (
    <div className="bg-white p-6 rounded-[16px] shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-gray-50">
      <h2
        className="text-lg font-bold text-gray-900 mb-5"
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        Quick actions
      </h2>
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action) =>
          action.comingSoon ? (
            <div
              key={action.key}
              aria-disabled="true"
              className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border border-gray-100 bg-white shadow-sm opacity-40 cursor-not-allowed"
            >
              <div className="text-gray-400">
                {ICONS[action.key] || <Home size={24} />}
              </div>
              <span className="text-sm font-semibold text-gray-700">
                {action.label}
              </span>
              <span className="text-[10px] text-gray-400 font-medium">
                Coming Soon
              </span>
            </div>
          ) : (
            <Link
              key={action.key}
              href={loggedIn ? action.href : action.loginHref}
              className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-200 group hover:shadow-md hover:bg-[#edf7ee] hover:border-green-200 cursor-pointer"
            >
              <div className="text-gray-400 group-hover:text-[#4DBE55] transition-colors duration-200">
                {ICONS[action.key] || <Home size={24} />}
              </div>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-[#4DBE55] transition-colors">
                {action.label}
              </span>
            </Link>
          ),
        )}
      </div>
    </div>
  );
}
