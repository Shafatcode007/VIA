"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Home,
  ArrowLeft,
  Loader2,
  CheckCircle,
  XCircle,
  MapPin,
} from "lucide-react";
import { hasStoredToken } from "@/lib/api/grocery";
import { useToast } from "@/components/ui/Toast";
import {
  adminListRentals,
  adminVerifyRental,
  type PropertyListItem,
} from "@/app/actions/admin-rentals";

export default function AdminRentalsPage() {
  const { showToast } = useToast();
  const [properties, setProperties] = useState<PropertyListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  useEffect(() => {
    if (!hasStoredToken()) {
      setLoading(false);
      return;
    }
    loadRentals();
  }, []);

  async function loadRentals() {
    setLoading(true);
    try {
      const data = await adminListRentals();
      setProperties(data.properties);
    } catch {
      showToast("Could not load rentals", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(id: string, action: "VERIFIED" | "REJECTED") {
    setActing(id);
    try {
      const result = await adminVerifyRental(id, action);
      if (result.success) {
        setProperties((prev) =>
          prev.map((p) =>
            p.id === id
              ? {
                  ...p,
                  status: action === "VERIFIED" ? "AVAILABLE" : "INACTIVE",
                }
              : p
          )
        );
        showToast(
          `Listing ${action === "VERIFIED" ? "verified" : "rejected"}`,
          "success"
        );
      } else {
        showToast(result.error || "Failed", "error");
      }
    } catch {
      showToast("Failed to update listing", "error");
    } finally {
      setActing(null);
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center text-gray-500">
        Loading rentals...
      </div>
    );
  }

  if (!hasStoredToken()) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12">
          <Home size={56} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 mb-4">Please log in as admin</p>
          <Link
            href="/login?next=/admin/rentals"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#4DBE55] text-white rounded-xl text-sm font-medium hover:bg-[#3ea846] transition-colors"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  const STATUS_BADGE: Record<string, string> = {
    AVAILABLE: "bg-green-100 text-green-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    INACTIVE: "bg-red-100 text-red-700",
    RENTED: "bg-blue-100 text-blue-700",
  };

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
        Rental Listings
      </h1>

      {properties.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <Home size={56} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">No rental listings yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {properties.map((prop) => (
            <div
              key={prop.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {prop.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                    <MapPin size={12} />
                    {prop.location}, {prop.city}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    STATUS_BADGE[prop.status] || "bg-gray-100 text-gray-700"
                  }`}
                >
                  {prop.status}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>
                  {prop.occupancyCategory}
                  {prop.bachelorType ? ` · ${prop.bachelorType}` : ""}
                </span>
                <span className="font-semibold text-[#4DBE55]">
                  ৳{prop.price.toLocaleString()}/mo
                </span>
              </div>

              <p className="text-xs text-gray-400">
                Landlord: {prop.landlord?.name || prop.landlord?.email || "—"}
              </p>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => handleVerify(prop.id, "VERIFIED")}
                  disabled={acting === prop.id || prop.status === "AVAILABLE"}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors disabled:opacity-50"
                >
                  {acting === prop.id ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <CheckCircle size={12} />
                  )}
                  Verify
                </button>
                <button
                  onClick={() => handleVerify(prop.id, "REJECTED")}
                  disabled={acting === prop.id || prop.status === "INACTIVE"}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  {acting === prop.id ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <XCircle size={12} />
                  )}
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
