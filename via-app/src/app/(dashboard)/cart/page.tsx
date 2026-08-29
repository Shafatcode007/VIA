"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ShoppingCart,
  Trash2,
  Zap,
  ArrowRight,
} from "lucide-react";
import {
  groceryApi,
  hasStoredToken,
  type CartView,
  type OptimizationResult,
} from "@/lib/api/grocery";
import { useToast } from "@/components/ui/Toast";
import { formatTaka, formatCents } from "@/lib/money";

export default function CartPage() {
  const { showToast } = useToast();
  const [cart, setCart] = useState<CartView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [optimization, setOptimization] =
    useState<OptimizationResult | null>(null);
  const [optimizing, setOptimizing] = useState(false);

  useEffect(() => {
    if (!hasStoredToken()) {
      setError("Not logged in");
      setLoading(false);
      return;
    }
    loadCart();
  }, []);

  async function loadCart() {
    setLoading(true);
    setError("");
    try {
      const data = await groceryApi.getCart();
      setCart(data);
    } catch {
      setError("Could not load cart. Make sure you are logged in.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(itemId: number, name: string) {
    try {
      const data = await groceryApi.removeCartItem(itemId);
      setCart(data);
      showToast(`Removed ${name} from cart`, "success");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to remove item",
        "error"
      );
    }
  }

  async function handleOptimize() {
    setOptimizing(true);
    try {
      const data = await groceryApi.optimizeCart();
      setOptimization(data);
      showToast("Cart optimized!", "success");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Optimization failed",
        "error"
      );
    } finally {
      setOptimizing(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center text-gray-500">
        Loading cart...
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500 mb-4">{error}</p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/login?next=/cart"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#4DBE55] text-white rounded-xl text-sm font-medium hover:bg-[#3ea846] transition-colors"
          >
            Log In
          </Link>
          <Link
            href="/grocery"
            className="text-[#4DBE55] hover:underline text-sm"
          >
            Back to Grocery
          </Link>
        </div>
      </div>
    );
  }

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-10 space-y-6">
      <Link
        href="/grocery"
        className="inline-flex items-center gap-1.5 text-sm text-[#4DBE55] hover:text-[#3ea846] font-medium"
      >
        <ArrowLeft size={16} />
        Continue Shopping
      </Link>

      <h1
        className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight"
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        Shopping Cart
      </h1>

      {isEmpty ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <ShoppingCart size={56} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 mb-4">Your cart is empty</p>
          <Link
            href="/grocery"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#4DBE55] text-white rounded-xl text-sm font-medium hover:bg-[#3ea846] transition-colors"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {item.product_name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Qty: {item.quantity} &times; {formatTaka(item.product_price)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-[#4DBE55]">
                    {formatTaka(item.subtotal)}
                  </span>
                  <button
                    onClick={() =>
                      handleRemove(item.id, item.product_name)
                    }
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              <h2 className="font-semibold text-gray-900 text-sm">
                Order Summary
              </h2>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Items ({cart.item_count})</span>
                <span>{formatCents(cart.total_cents)}</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between">
                <span className="font-semibold text-gray-900 text-sm">
                  Total
                </span>
                <span className="text-lg font-bold text-[#4DBE55]">
                  {formatCents(cart.total_cents)}
                </span>
              </div>
            </div>

            <button
              onClick={handleOptimize}
              disabled={optimizing}
              className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50"
            >
              <Zap size={16} className="text-[#4DBE55]" />
              {optimizing ? "Optimizing..." : "Optimize Delivery"}
            </button>

            {optimization && (
              <div className="bg-[#edf7ee] rounded-2xl p-4 text-sm space-y-2">
                <p className="font-medium text-gray-900">
                  Savings: {formatCents(optimization.savings)}
                </p>
                <p className="text-gray-600">
                  Using{" "}
                  {optimization.strategies[optimization.recommended]
                    ?.sellers_used || 0}{" "}
                  sellers
                </p>
              </div>
            )}

            <Link
              href="/checkout"
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#4DBE55] text-white rounded-xl text-sm font-semibold hover:bg-[#3ea846] transition text-center"
            >
              Proceed to Checkout
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
