"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Package, ShoppingCart, FileText, ChevronRight } from "lucide-react";
import {
  paymentsApi,
  hasStoredToken,
  type OrderSummary,
} from "@/lib/api/payments";
import { useToast } from "@/components/ui/Toast";
import { formatCents } from "@/lib/money";

export default function OrdersPage() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasStoredToken()) {
      setLoading(false);
      return;
    }
    loadOrders();
  }, []);

  async function loadOrders() {
    setLoading(true);
    try {
      const data = await paymentsApi.listOrders();
      setOrders(data.orders);
    } catch {
      showToast("Could not load orders", "error");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center text-gray-500">
        Loading orders...
      </div>
    );
  }

  if (!hasStoredToken()) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12">
          <Package size={56} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 mb-4">Please log in to view orders</p>
          <Link
            href="/login?next=/orders"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#4DBE55] text-white rounded-xl text-sm font-medium hover:bg-[#3ea846] transition-colors"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-10 space-y-6">
      <h1
        className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight"
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        My Orders
      </h1>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <Package size={56} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 mb-4">No orders yet</p>
          <Link
            href="/grocery"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#4DBE55] text-white rounded-xl text-sm font-medium hover:bg-[#3ea846] transition-colors"
          >
            <ShoppingCart size={16} />
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/payment/success?order=${order.id}`}
              className="block bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#edf7ee] flex items-center justify-center">
                    <FileText size={18} className="text-[#4DBE55]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Order #{order.id}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {order.created_at?.split("T")[0] ?? "—"} &middot;{" "}
                      {order.sub_orders.length} seller
                      {order.sub_orders.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#4DBE55]">
                      {formatCents(order.total_cents)}
                    </p>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold mt-1 ${
                        order.payment_status === "completed"
                          ? "bg-[#edf7ee] text-[#4DBE55]"
                          : order.payment_status === "pending"
                            ? "bg-amber-50 text-amber-600"
                            : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {order.payment_status === "completed"
                        ? "PAID"
                        : order.payment_status === "pending"
                          ? "PENDING"
                          : "NO PAYMENT"}
                    </span>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-gray-300 group-hover:text-[#4DBE55] transition"
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
