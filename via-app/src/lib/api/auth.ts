// src/lib/api/auth.ts
import { request, hasStoredToken } from "./grocery";
import { getStoredToken } from "@/lib/auth/session";

export { hasStoredToken };

export interface SessionUser {
  id: number;
  email: string;
  role: string;
  full_name?: string;
}

export interface AuthSessionPayload {
  access_token: string;
  token_type: string;
  user: SessionUser;
}

export const authApi = {
  becomeDriver: () =>
    request<AuthSessionPayload>("/auth/become-driver", {
      method: "POST",
    }),
};

export async function syncFastApiToken(email: string, password: string): Promise<boolean> {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  try {
    const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.access_token) {
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));
        return true;
      }
    }
  } catch {
    // FastAPI not reachable
  }
  return false;
}