"use server";

interface RegisterResult {
  success: boolean;
  error?: string;
  user?: {
    id: string;
    email: string | null;
    name: string | null;
  };
}

export async function registerAction(
  prevState: RegisterResult | null,
  formData: FormData
): Promise<RegisterResult> {
  const API_BASE = process.env.BACKEND_URL ?? "http://localhost:8000";
  try {
    const name = formData.get("name") as string | null;
    const email = formData.get("email") as string | null;
    const password = formData.get("password") as string | null;
    const role = (formData.get("role") as string) || "RESIDENT";

    if (!email || !password) {
      return { success: false, error: "Email and password are required." };
    }

    if (password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters." };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, error: "Please enter a valid email address." };
    }

    const res = await fetch(`${API_BASE}/api/v1/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.toLowerCase(),
        password,
        full_name: name || email.split("@")[0],
        role,
      }),
    });

    const body = await res.json().catch(() => null);

    if (res.ok && body?.access_token) {
      return {
        success: true,
        user: {
          id: String(body.user?.id ?? ""),
          email: body.user?.email ?? email,
          name: body.user?.full_name ?? name ?? "",
        },
      };
    }

    const msg =
      res.status === 409
        ? "Email already registered."
        : body?.detail || "Registration failed. Please try again.";
    return { success: false, error: msg };
  } catch {
    return { success: false, error: "An error occurred. Please try again." };
  }
}
