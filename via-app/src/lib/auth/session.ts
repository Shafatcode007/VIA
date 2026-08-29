/**
 * Single source of truth for client-side auth state.
 * Reads the JWT exactly where the login flow stores it.
 * Every guard and API client MUST use this module.
 * Never probe /api/auth/session or read ad-hoc keys elsewhere.
 */

export interface SessionUser {
  id: number;
  email: string;
  role: string;
  full_name?: string;
}

export interface Session {
  token: string;
  user: SessionUser;
}

const TOKEN_KEY = "access_token";
const USER_KEY = "user";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): SessionUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export function getSession(): Session | null {
  const token = getStoredToken();
  if (!token) return null;
  const user = getStoredUser();
  if (!user) return null;
  return { token, user };
}

export function isAuthenticated(): boolean {
  return getSession() !== null;
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function redirectToLogin(currentPath?: string): void {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams();
  if (currentPath) params.set("next", currentPath);
  window.location.href = `/login${params.toString() ? `?${params}` : ""}`;
}

export function storeSession(token: string, user: SessionUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("access_token", token);
  localStorage.setItem("user", JSON.stringify(user));
}
