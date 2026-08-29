/**
 * Payment & order API client.
 * Thin layer over existing backend endpoints:
 * checkout -> pay -> order detail (invoice) -> order history.
 * All calls are auth-aware via the shared request() helper.
 */
import { request, hasStoredToken } from "./grocery";

export { hasStoredToken };

export type PaymentMethod = "bkash" | "nagad" | "card";

export interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  unit: string;
  quantity: number;
  unit_price_cents: number;
  total_cents: number;
}

export interface SubOrderView {
  id: number;
  seller_id: number;
  seller_name: string;
  status: string;
  subtotal_cents: number;
  items: OrderItem[];
}

export interface PaymentInfo {
  payment_id: number;
  amount_cents: number;
  method: string;
  status: string;
  transaction_id: string | null;
  created_at: string | null;
}

export interface CheckoutView {
  id: number;
  status: string;
  total_cents: number;
  delivery_address: string | null;
  sub_orders: SubOrderView[];
  payment: PaymentInfo | null;
  created_at: string | null;
}

export interface PayResult {
  payment_id: number;
  order_id: number;
  amount_cents: number;
  method: string;
  status: string;
  transaction_id: string | null;
  created_at: string | null;
}

export interface InvoiceView extends CheckoutView {
  invoice_number: string;
}

export interface OrderSummary {
  id: number;
  status: string;
  total_cents: number;
  payment_status: string;
  sub_orders: SubOrderView[];
  created_at: string | null;
}

export const paymentsApi = {
  checkout: (deliveryAddress: string) =>
    request<CheckoutView>("/grocery/orders/checkout", {
      method: "POST",
      body: JSON.stringify({ delivery_address: deliveryAddress }),
    }),

  pay: (orderId: number, method: PaymentMethod) =>
    request<PayResult>(`/grocery/orders/${orderId}/pay`, {
      method: "POST",
      body: JSON.stringify({ method }),
    }),

  getInvoice: (orderId: number) =>
    request<InvoiceView>(`/grocery/orders/invoice/${orderId}`),

  getOrder: (orderId: number) =>
    request<CheckoutView>(`/grocery/orders/${orderId}`),

  listOrders: () =>
    request<{ orders: OrderSummary[] }>("/grocery/orders"),
};
