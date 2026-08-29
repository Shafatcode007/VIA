// src/components/dashboard/BecomeDriverCard.tsx
"use client";

import { useState } from "react";

import { authApi } from "@/lib/api/auth";
import { storeSession } from "@/lib/auth/session";
import { useToast } from "@/components/ui/Toast";

interface BecomeDriverCardProps {
  onUpgraded: () => void;
}

/**
 * One-click role upgrade for logged-in non-driver, non-admin users.
 * Stores the NEW token + user object (the old resident JWT can never
 * unlock the driver panel because the role claim is inside the token).
 */
export function BecomeDriverCard({ onUpgraded }: BecomeDriverCardProps) {
  const { showToast } = useToast();
  const [busy, setBusy] = useState(false);

  const handleUpgrade = async () => {
    setBusy(true);
    try {
      const session = await authApi.becomeDriver();
      storeSession(session.access_token, session.user);
      showToast("You are now a Driver — Driver Panel unlocked", "success");
      onUpgraded();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Upgrade failed", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900">Drive & Earn with VIA</h3>
      <p className="mt-1 text-sm text-gray-500">
        Switch this account to Driver to unlock the Driver Panel: accept rides, track trips and earnings.
      </p>
      <button
        type="button"
        disabled={busy}
        onClick={handleUpgrade}
        className="mt-4 rounded-xl bg-[#4DBE55] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#3da447] disabled:opacity-60"
      >
        {busy ? "Switching…" : "Become a Driver"}
      </button>
    </div>
  );
}