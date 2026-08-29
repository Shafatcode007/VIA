"use client";

import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { Loader2, User, Building2, Package, Car, Shield, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { registerAction } from "@/app/actions/auth";
import { syncFastApiToken } from "@/lib/api/auth";
import { RoleSelector, PUBLIC_ROLES } from "@/components/auth/RoleSelector";

type Role = "RESIDENT" | "LANDLORD" | "SELLER" | "DRIVER";

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role>("RESIDENT");

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email.trim()) {
      setError("Please enter your email or phone number.");
      return;
    }
    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (activeTab === "register") {
        const formData = new FormData();
        formData.append("email", email);
        formData.append("password", password);
        formData.append("role", selectedRole);

        const result = await registerAction(null, formData);

        if (result.success) {
          setSuccess("Account created! Signing you in...");
          const synced = await syncFastApiToken(email, password);
          if (synced) {
            // Redirect by role: DRIVER → /driver, others → /dashboard
            window.location.href = selectedRole === "DRIVER" ? "/driver" : "/dashboard";
          } else {
            setError("Account created but login failed. Please try logging in.");
            setActiveTab("login");
          }
        } else {
          setError(result.error || "Registration failed. Please try again.");
        }
      } else {
        const synced = await syncFastApiToken(email, password);

        if (synced) {
          window.location.href = callbackUrl;
        } else {
          setError("Invalid email or password. Please try again.");
        }
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = () => {
    setError("Google sign-in is not configured. Please use email/password.");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="p-8">
          <div className="mb-6 flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 transition-colors hover:text-[#4DBE55]"
            >
              ← Back to Home
            </Link>
            <Link href="/" className="flex items-center gap-2 text-lg font-bold text-gray-900" aria-label="VIA home">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4DBE55] text-white">V</span>
              VIA
            </Link>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>
              Welcome to VIA
            </h2>
            <p className="text-gray-500 text-sm">Your all-in-one platform for Dhaka</p>
          </div>

          <div className="flex bg-gray-100 p-1 rounded-xl mb-6 relative">
            <div
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm transition-all duration-300 ease-out ${
                activeTab === "login" ? "left-1" : "left-[calc(50%+2px)]"
              }`}
            />
            <button
              type="button"
              onClick={() => {
                setActiveTab("login");
                setError(null);
                setSuccess(null);
              }}
              className={`flex-1 py-2 text-sm font-medium z-10 transition-colors ${
                activeTab === "login" ? "text-gray-900" : "text-gray-500"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("register");
                setError(null);
                setSuccess(null);
              }}
              className={`flex-1 py-2 text-sm font-medium z-10 transition-colors ${
                activeTab === "register" ? "text-gray-900" : "text-gray-500"
              }`}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-600">
              {success}
            </div>
          )}

          <form onSubmit={handleEmailSubmit}>
            {activeTab === "register" && (
              <div className="mb-6">
                <RoleSelector value={selectedRole} onChange={(r) => setSelectedRole(r as Role)} />
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone or Email
                </label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4DBE55] focus:border-transparent outline-none transition-all text-sm text-gray-900"
                  placeholder="+880 1XXX-XXXXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 pr-10 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4DBE55] focus:border-transparent outline-none transition-all text-sm text-gray-900"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || isSubmitting}
              className="w-full bg-[#4DBE55] text-white py-3 rounded-xl font-medium hover:bg-[#3ea846] transition-colors shadow-sm mb-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {(isLoading || isSubmitting) && <Loader2 size={16} className="animate-spin" />}
              {activeTab === "login" ? "Continue" : "Create Account"}
            </button>
          </form>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500 text-xs">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                className="w-5 h-5"
                alt="Google"
              />
            )}
            {isLoading ? "Redirecting..." : "Continue with Google"}
          </button>

          <button
            type="button"
            disabled
            className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm font-medium text-gray-400 cursor-not-allowed mt-3 opacity-60"
          >
            <img
              src="https://www.svgrepo.com/show/475647/facebook-color.svg"
              className="w-5 h-5 opacity-40"
              alt="Facebook"
            />
            Facebook (Coming Soon)
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center">
          <Loader2 className="animate-spin h-8 w-8 text-[#4DBE55]" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}