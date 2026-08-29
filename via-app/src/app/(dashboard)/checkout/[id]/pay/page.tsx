"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CreditCard, Smartphone, CheckCircle } from "lucide-react";
import {
  paymentsApi,
  hasStoredToken,
  type CheckoutView,
  type PaymentMethod,
} from "@/lib/api/payments";
import { useToast } from "@/components/ui/Toast";
import { formatCents } from "@/lib/money";

const METHODS: { key: PaymentMethod; label: string; color: string; icon: typeof CreditCard }[] = [
  { key: "bkash", label: "bKash", color: "#E2136E", icon: Smartphone },
  { key: "nagad", label: "Nagad", color: "#F6921E", icon: Smartphone },
  { key: "card", label: "Card", color: "#4DBE55", icon: CreditCard },
];

export default function PayPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const orderId = Number(params.id);

  const [order, setOrder] = useState<CheckoutView | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<PaymentMethod>("bkash");
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!hasStoredToken()) {
      setLoading(false);
      return;
    }
    loadOrder();
  }, [orderId]);

  async function loadOrder() {
    setLoading(true);
    try {
      const data = await paymentsApi.getOrder(orderId);
      setOrder(data);
    } catch {
      showToast("Could not load order", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handlePay() {
    setPaying(true);
    try {
      const result = await paymentsApi.pay(orderId, selected);
      if (result.status === "completed") {
        router.push(`/payment/success?order=${orderId}`);
      } else {
        showToast("Payment processing. Please wait.", "success");
      }
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Payment failed",
        "error"
      );
      setPaying(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center text-gray-500">
        Loading order...
      </div>
    );
  }

  if (!hasStoredToken()) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12">
          <p className="text-gray-500 mb-4">Please log in to pay</p>
          <Link
            href={`/login?next=/checkout/${orderId}/pay`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#4DBE55] text-white rounded-xl text-sm font-medium hover:bg-[#3ea846] transition-colors"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500 mb-4">Order not found</p>
        <Link href="/orders" className="text-[#4DBE55] hover:underline text-sm">
          View My Orders
        </Link>
      </div>
    );
  }

  const alreadyPaid = order.payment?.status === "completed";

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-10 space-y-6">
      <Link
        href="/cart"
        className="inline-flex items-center gap-1.5 text-sm text-[#4DBE55] hover:text-[#3ea846] font-medium"
      >
        <ArrowLeft size={16} />
        Back to Cart
      </Link>

      <h1
        className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight"
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        {alreadyPaid ? "Order Confirmed" : "Payment"}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h2 className="font-semibold text-gray-900 text-sm">
              Order #{order.id}
            </h2>
            {order.sub_orders.map((so) => (
              <div key={so.id} className="border border-gray-100 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <CheckCircle size={14} className="text-[#4DBE55]" />
                  {so.seller_name}
                </div>
                {so.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between text-sm text-gray-600 ml-6"
                  >
                    <span>
                      {item.product_name} &times; {item.quantity}
                    </span>
                    <span>{formatCents(item.total_cents)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-medium text-gray-700 ml-6 pt-1 border-t border-gray-50">
                  <span>Subtotal</span>
                  <span>{formatCents(so.subtotal_cents)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <h2 className="font-semibold text-gray-900 text-sm">Total</h2>
            <div className="text-2xl font-bold text-[#4DBE55]">
              {formatCents(order.total_cents)}
            </div>
          </div>

          {!alreadyPaid && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              <h2 className="font-semibold text-gray-900 text-sm">
                Payment Method
              </h2>
              <div className="space-y-2">
                {METHODS.map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.key}
                      onClick={() => setSelected(m.key)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition text-left ${
                        selected === m.key
                          ? "border-[#4DBE55] bg-[#edf7ee]"
                          : "border-gray-100 hover:border-gray-200"
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: m.color + "15" }}
                      >
                        <Icon size={16} style={{ color: m.color }} />
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {m.label}
                      </span>
                      {selected === m.key && (
                        <CheckCircle
                          size={16}
                          className="ml-auto text-[#4DBE55]"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {alreadyPaid ? (
            <Link
              href={`/payment/success?order=${orderId}`}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#4DBE55] text-white rounded-xl text-sm font-semibold hover:bg-[#3ea846] transition text-center"
            >
              View Invoice
            </Link>
          ) : (
            <button
              onClick={handlePay}
              disabled={paying}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#4DBE55] text-white rounded-xl text-sm font-semibold hover:bg-[#3ea846] transition disabled:opacity-50"
            >
              <CreditCard size={16} />
              {paying ? "Processing..." : `Pay ${formatCents(order.total_cents)}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
