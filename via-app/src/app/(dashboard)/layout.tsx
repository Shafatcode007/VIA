"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getStoredToken } from "@/lib/auth/session";
import { Header } from "@/components/Header";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/cart",
  "/checkout",
  "/orders",
  "/payment",
  "/driver",
  "/admin",
  "/seller",
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const isProtected = PROTECTED_PREFIXES.some((prefix) =>
      pathname.startsWith(prefix)
    );
    const hasToken = Boolean(getStoredToken());
    if (isProtected && !hasToken) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [mounted, pathname, router]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#f7faf7]" />
    );
  }

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
  const hasToken = Boolean(getStoredToken());

  if (isProtected && !hasToken) {
    return (
      <div className="min-h-screen bg-[#f7faf7] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-[#4DBE55] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7faf7]">
      <Header />
      <main>{children}</main>
    </div>
  );
}
