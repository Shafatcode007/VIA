"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser, type SessionUser } from "@/lib/auth/session";
import { Home, ShoppingCart, Car, Heart, Star } from "lucide-react";
import SignOutButton from "@/components/SignOutButton";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { BecomeDriverCard } from "@/components/dashboard/BecomeDriverCard";
import { formatTaka } from "@/lib/money";

function StatCard({
  icon,
  title,
  value,
  trend,
  trendPositive,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  trend: string;
  trendPositive: boolean;
}) {
  return (
    <div className="bg-white p-5 rounded-[16px] shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-gray-50 flex flex-col gap-4 hover:-translate-y-1 transition-transform duration-300">
      <div className="flex justify-between items-start">
        <div className="w-12 h-12 rounded-full bg-[#edf7ee] text-[#4DBE55] flex items-center justify-center">
          {icon}
        </div>
        <span
          className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${
            trendPositive
              ? "bg-[#edf7ee] text-[#4DBE55]"
              : "bg-gray-100 text-[#71776D]"
          }`}
        >
          {trend}
        </span>
      </div>
      <div className="mt-1">
        <p className="text-xs text-[#71776D] font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: "Poppins, sans-serif" }}>
          {value}
        </h3>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = getStoredUser();
    if (!stored) {
      router.replace("/login");
      return;
    }
    setUser(stored);
    setReady(true);
  }, [router]);

  if (!ready || !user) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6 md:py-10 space-y-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-[16px]" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const userName = user.full_name?.split(" ")[0] || user.email?.split("@")[0] || "User";
  const userRole = user.role || "RESIDENT";

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-10 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2 tracking-tight" style={{ fontFamily: "Poppins, sans-serif" }}>
            {greeting}, {userName}
            <span className="text-2xl">{hour < 12 ? "\u2600\uFE0F" : hour < 17 ? "\uD83C\uDF24\uFE0F" : "\uD83C\uDF19"}</span>
          </h1>
          <div className="mt-2 flex items-center">
            <span className="bg-[#edf7ee] text-[#4DBE55] px-3 py-1 rounded-full text-xs font-semibold tracking-wide border border-green-100 flex items-center gap-1.5">
              {userRole}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Heart size={20} />} title="Saved listings" value="7" trend="+2 new" trendPositive={true} />
        <StatCard icon={<ShoppingCart size={20} />} title="Orders this month" value="14" trend={formatTaka(3420) + " spent"} trendPositive={false} />
        <StatCard icon={<Car size={20} />} title="Trips taken" value="23" trend={formatTaka(1840) + " paid"} trendPositive={false} />
        <StatCard icon={<Star size={20} />} title="Avg. rating given" value="4.6" trend="Top 10%" trendPositive={true} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <QuickActions rawRole={userRole} />
        </div>

        <div className="bg-white p-6 rounded-[16px] shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-gray-50">
          <h2 className="text-lg font-bold text-gray-900 mb-5" style={{ fontFamily: "Poppins, sans-serif" }}>
            Your Account
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-[#edf7ee] text-[#4DBE55] flex items-center justify-center font-bold text-lg overflow-hidden shrink-0">
                <span>{userName.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <p className="font-medium text-sm text-gray-900">{user.full_name || "VIA User"}</p>
                <p className="text-xs text-gray-500">{user.email || "No email"}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-xl text-center">
                <p className="text-xs text-gray-500 mb-1">Role</p>
                <p className="font-semibold text-sm text-[#4DBE55]">{userRole}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl text-center">
                <p className="text-xs text-gray-500 mb-1">Status</p>
                <p className="font-semibold text-sm text-green-600">Active</p>
              </div>
            </div>
            <SignOutButton />
          </div>
          {userRole !== "DRIVER" && userRole !== "ADMIN" && (
            <BecomeDriverCard onUpgraded={() => window.location.reload()} />
          )}
        </div>
      </div>
    </div>
  );
}
