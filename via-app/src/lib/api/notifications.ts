/**
 * Notifications API client.
 * Polls in-app notifications and marks them read.
 */
import { request, hasStoredToken } from "./grocery";

export { hasStoredToken };

export interface NotificationItem {
  id: number;
  kind: string;
  title: string;
  body: string | null;
  ride_id: number | null;
  read: boolean;
  created_at: string;
}

export const notificationsApi = {
  list: () =>
    request<NotificationItem[]>("/notifications"),

  markAllRead: () =>
    request<{ status: string }>("/notifications/read-all", {
      method: "POST",
    }),
};