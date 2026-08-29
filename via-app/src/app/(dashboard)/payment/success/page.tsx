"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle,
  Download,
  ShoppingCart,
  FileText,
} from "lucide-react";
import { paymentsApi, hasStoredToken, type InvoiceView } from "@/lib/api/payments";
import { getStoredUser } from "@/lib/auth/session";
import { useToast } from "@/components/ui/Toast";
import { formatCents } from "@/lib/money";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = Number(searchParams.get("order"));
  const { showToast } = useToast();

  const [invoice, setInvoice] = useState<InvoiceView | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    loadInvoice();
  }, [orderId]);

  async function loadInvoice() {
    setLoading(true);
    try {
      const data = await paymentsApi.getInvoice(orderId);
      setInvoice(data);
    } catch {
      showToast("Could not load invoice", "error");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center text-gray-500">
        Loading invoice...
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500 mb-4">Invoice not found</p>
        <Link href="/orders" className="text-[#4DBE55] hover:underline text-sm">
          View My Orders
        </Link>
      </div>
    );
  }

  const user = getStoredUser();
  const totalSubOrders = invoice.sub_orders.reduce(
    (sum, so) => sum + so.subtotal_cents,
    0
  );
  const totalsMatch = totalSubOrders === (invoice.payment?.amount_cents ?? 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-10 space-y-6 no-print">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#edf7ee]">
          <CheckCircle size={32} className="text-[#4DBE55]" />
        </div>
        <h1
          className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          Payment Successful
        </h1>
        <p className="text-gray-500 text-sm">
          Your order has been confirmed and payment received.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden print-area">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#4DBE55] rounded-lg flex items-center justify-center text-white font-bold text-sm italic">
                V
              </div>
              <div>
                <h2 className="font-bold text-gray-900" style={{ fontFamily: "Poppins, sans-serif" }}>
                  Invoice
                </h2>
                <p className="text-xs text-gray-500">
                  {invoice.invoice_number}
                </p>
              </div>
            </div>
            <div className="text-right text-sm text-gray-500">
              <p>{invoice.created_at?.split("T")[0] ?? "—"}</p>
            </div>
          </div>
        </div>

        <div className="p-6 border-b border-gray-100">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Bill To
          </h3>
          <p className="text-sm font-medium text-gray-900">
            {user?.full_name || user?.email || "Customer"}
          </p>
          {invoice.delivery_address && (
            <p className="text-sm text-gray-500">{invoice.delivery_address}</p>
          )}
        </div>

        <div className="p-6 space-y-4">
          {invoice.sub_orders.map((so) => (
            <div key={so.id} className="border border-gray-100 rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  {so.seller_name}
                </span>
                <span className="text-sm text-gray-500">
                  Subtotal: {formatCents(so.subtotal_cents)}
                </span>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 text-xs border-b border-gray-50">
                    <th className="px-4 py-2 font-medium">Item</th>
                    <th className="px-4 py-2 font-medium text-center">Qty</th>
                    <th className="px-4 py-2 font-medium text-right">Unit Price</th>
                    <th className="px-4 py-2 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {so.items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-50 last:border-0">
                      <td className="px-4 py-2 text-gray-900">{item.product_name}</td>
                      <td className="px-4 py-2 text-center text-gray-600">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="px-4 py-2 text-right text-gray-600">
                        {formatCents(item.unit_price_cents)}
                      </td>
                      <td className="px-4 py-2 text-right font-medium text-gray-900">
                        {formatCents(item.total_cents)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-gray-100 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Items Total</span>
            <span className="font-medium text-gray-900">
              {formatCents(totalSubOrders)}
            </span>
          </div>
          {invoice.payment && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Payment Method</span>
                <span className="font-medium text-gray-900 capitalize">
                  {invoice.payment.method}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Transaction ID</span>
                <span className="font-medium text-gray-900 font-mono text-xs">
                  {invoice.payment.transaction_id ?? "—"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    invoice.payment.status === "completed"
                      ? "bg-[#edf7ee] text-[#4DBE55]"
                      : invoice.payment.status === "pending"
                        ? "bg-amber-50 text-amber-600"
                        : "bg-red-50 text-red-600"
                  }`}
                >
                  {invoice.payment.status.toUpperCase()}
                </span>
              </div>
            </>
          )}
          <div className="border-t border-gray-100 pt-3 flex justify-between">
            <span className="font-semibold text-gray-900">Total Paid</span>
            <span className="text-xl font-bold text-[#4DBE55]">
              {formatCents(invoice.payment?.amount_cents ?? invoice.total_cents)}
            </span>
          </div>

          {!totalsMatch && (
            <div className="bg-amber-50 text-amber-700 text-xs px-3 py-2 rounded-lg">
              Totals mismatch — contact support
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 print-hide">
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-6 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
        >
          <Download size={16} />
          Download / Print
        </button>
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 px-6 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
        >
          <FileText size={16} />
          View My Orders
        </Link>
        <Link
          href="/grocery"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#4DBE55] text-white rounded-xl text-sm font-medium hover:bg-[#3ea846] transition"
        >
          <ShoppingCart size={16} />
          Back to Grocery
        </Link>
      </div>

      <style>{`
        @media print {
          .no-print, .print-hide { display: none !important; }
          .print-area { border: none !important; box-shadow: none !important; }
          body { background: white !important; }
        }
      `}</style>
    </div>
  );
}
