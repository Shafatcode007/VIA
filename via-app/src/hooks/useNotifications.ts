"use client";

import { useEffect, useRef } from "react";

import { notificationsApi } from "@/lib/api/notifications";
import { getStoredToken } from "@/lib/auth/session";
import { useToast } from "@/components/ui/Toast";

/**
 * Polls in-app notifications every 5s and toasts only NEW unread items.
 * First poll seeds known ids silently so page loads never spam history.
 */
export function useNotifications(enabled: boolean) {
  const { showToast } = useToast();
  const knownIds = useRef<Set<number>>(new Set());
  const firstRun = useRef(true);

  useEffect(() => {
    if (!enabled || !getStoredToken()) return;
    let cancelled = false;

    const poll = async () => {
      try {
        const items = await notificationsApi.list();
        if (cancelled) return;
        if (firstRun.current) {
          items.forEach((item) => knownIds.current.add(item.id));
          firstRun.current = false;
          return;
        }
        const fresh = items.filter((item) => !item.read && !knownIds.current.has(item.id));
        for (const item of fresh) {
          knownIds.current.add(item.id);
          showToast(item.title, "success");
        }
        if (fresh.length > 0) await notificationsApi.markAllRead();
      } catch {
        // Polling failures are silent by design.
      }
    };

    poll();
    const timer = setInterval(poll, 5000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [enabled, showToast]);
}