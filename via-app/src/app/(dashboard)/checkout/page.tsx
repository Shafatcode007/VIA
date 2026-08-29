"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShoppingCart, Store, Truck } from "lucide-react";
import { groceryApi, hasStoredToken, type CartView } from "@/lib/api/grocery";
import { paymentsApi } from "@/lib/api/payments";
import { useToast } from "@/components/ui/Toast";
import { formatTaka, formatCents } from "@/lib/money";

export default function CheckoutPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [cart, setCart] = useState<CartView | null>(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (!hasStoredToken()) {
      setLoading(false);
      return;
    }
    loadCart();
  }, []);

  async function loadCart() {
    setLoading(true);
    try {
      const data = await groceryApi.getCart();
      setCart(data);
    } catch {
      showToast("Could not load cart", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handlePlaceOrder() {
    if (!address.trim()) {
      showToast("Please enter a delivery address", "error");
      return;
    }
    setPlacing(true);
    try {
      const order = await paymentsApi.checkout(address);
      router.push(`/checkout/${order.id}/pay`);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Checkout failed",
        "error"
      );
      setPlacing(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center text-gray-500">
        Loading checkout...
      </div>
    );
  }

  if (!hasStoredToken()) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12">
          <ShoppingCart size={56} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 mb-4">Please log in to checkout</p>
          <Link
            href="/login?next=/checkout"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#4DBE55] text-white rounded-xl text-sm font-medium hover:bg-[#3ea846] transition-colors"
          >
            Log In
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
        Checkout
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
          <div className="lg:col-span-2 space-y-4">
            {cart!.items.map((item) => (
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
                <span className="text-sm font-bold text-[#4DBE55]">
                  {formatTaka(item.subtotal)}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              <h2 className="font-semibold text-gray-900 text-sm">
                Order Summary
              </h2>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Items ({cart!.item_count})</span>
                <span>{formatCents(cart!.total_cents)}</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between">
                <span className="font-semibold text-gray-900 text-sm">
                  Total
                </span>
                <span className="text-lg font-bold text-[#4DBE55]">
                  {formatCents(cart!.total_cents)}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              <h2 className="font-semibold text-gray-900 text-sm">
                Delivery Address
              </h2>
              <input
                type="text"
                placeholder="Enter delivery address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#4DBE55] focus:border-transparent outline-none"
              />
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={placing || isEmpty}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#4DBE55] text-white rounded-xl text-sm font-semibold hover:bg-[#3ea846] transition disabled:opacity-50"
            >
              <Store size={16} />
              {placing ? "Placing Order..." : "Place Order"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
