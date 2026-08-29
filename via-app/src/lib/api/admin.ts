import { request } from "./grocery";

export interface AdminUser {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  phone: string | null;
  created_at: string;
}

export interface AdminUserList {
  users: AdminUser[];
  total: number;
}

export interface AdminAnalytics {
  users_by_role: Record<string, number>;
  total_orders: number;
  total_revenue_cents: number;
  total_rides: number;
  total_ride_revenue_cents: number;
  top_sellers: { name: string; revenue_cents: number }[];
}

export const adminApi = {
  listUsers: () => request<AdminUserList>("/admin/users"),

  toggleUserActive: (userId: number) =>
    request<{ id: number; email: string; is_active: boolean }>(
      `/admin/users/${userId}/toggle-active`,
      { method: "PATCH" }
    ),

  getAnalytics: () => request<AdminAnalytics>("/admin/analytics"),
};
