"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart3,
  ArrowLeft,
  Users,
  ShoppingCart,
  Car,
  TrendingUp,
} from "lucide-react";
import { adminApi, type AdminAnalytics } from "@/lib/api/admin";
import { hasStoredToken } from "@/lib/api/grocery";
import { useToast } from "@/components/ui/Toast";

function formatCents(cents: number): string {
  const taka = cents / 100;
  return `৳${taka.toLocaleString("en-BD", { minimumFractionDigits: 0 })}`;
}

export default function AdminAnalyticsPage() {
  const { showToast } = useToast();
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasStoredToken()) {
      setLoading(false);
      return;
    }
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    setLoading(true);
    try {
      const data = await adminApi.getAnalytics();
      setAnalytics(data);
    } catch {
      showToast("Could not load analytics", "error");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center text-gray-500">
        Loading analytics...
      </div>
    );
  }

  if (!hasStoredToken()) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12">
          <BarChart3 size={56} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 mb-4">Please log in as admin</p>
          <Link
            href="/login?next=/admin/analytics"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#4DBE55] text-white rounded-xl text-sm font-medium hover:bg-[#3ea846] transition-colors"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  const a = analytics!;

  const cards = [
    {
      label: "Total Users",
      value: Object.values(a.users_by_role).reduce((s, v) => s + v, 0),
      icon: Users,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Total Orders",
      value: a.total_orders,
      icon: ShoppingCart,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Grocery Revenue",
      value: formatCents(a.total_revenue_cents),
      icon: TrendingUp,
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "Total Rides",
      value: a.total_rides,
      icon: Car,
      color: "bg-orange-50 text-orange-600",
    },
    {
      label: "Ride Revenue",
      value: formatCents(a.total_ride_revenue_cents),
      icon: TrendingUp,
      color: "bg-teal-50 text-teal-600",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-10 space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-[#4DBE55] hover:text-[#3ea846] font-medium"
      >
        <ArrowLeft size={16} />
        Dashboard
      </Link>

      <h1
        className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight"
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        Analytics
      </h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-2"
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.color}`}
            >
              <card.icon size={18} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-500">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Users by role */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 text-sm">Users by Role</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(a.users_by_role).map(([role, count]) => (
            <div
              key={role}
              className="bg-gray-50 rounded-xl p-3 text-center"
            >
              <p className="text-xl font-bold text-gray-900">{count}</p>
              <p className="text-xs text-gray-500 mt-0.5">{role}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Top sellers */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 text-sm">
          Top 5 Sellers by Revenue
        </h2>
        {a.top_sellers.length === 0 ? (
          <p className="text-sm text-gray-400">No seller revenue yet</p>
        ) : (
          <div className="space-y-3">
            {a.top_sellers.map((seller, i) => (
              <div
                key={seller.name}
                className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-[#4DBE55] text-white text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {seller.name}
                  </span>
                </div>
                <span className="text-sm font-bold text-[#4DBE55]">
                  {formatCents(seller.revenue_cents)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
