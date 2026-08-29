import { getStoredToken } from "@/lib/auth/session";
import { toErrorMessage } from "@/lib/utils/apiError";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export function hasStoredToken(): boolean {
  return getStoredToken() !== null;
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  const headers = new Headers(options.headers ?? {});
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE}/api/v1${path}`, { ...options, headers });

  if (response.status === 401) {
    throw new Error("Session expired. Please log in again.");
  }

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    throw new Error(toErrorMessage(body ?? `Request failed (${response.status})`));
  }

  return (await response.json()) as T;
}

async function publicRequest<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}/api/v1${path}`);
  if (!res.ok) {
    const body: unknown = await res.json().catch(() => null);
    throw new Error(toErrorMessage(body ?? `Request failed (${res.status})`));
  }
  return (await res.json()) as T;
}

async function authRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  return request<T>(path, options);
}

export interface GroceryProduct {
  id: number;
  name: string;
  description?: string;
  price: number;
  unit: string;
  stock_quantity: number;
  seller_id: number;
  seller_name?: string;
  seller?: { id: number; name: string; address?: string; phone?: string };
  image_url?: string;
  is_available: boolean;
  normalized_price_per_gram?: number;
}

export interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  product_name: string;
  product_price: number;
  subtotal: number;
}

export interface CartView {
  id: number;
  items: CartItem[];
  total_cents: number;
  item_count: number;
}

export interface OptimizationStrategy {
  strategy: string;
  total_items: number;
  total_cost: number;
  delivery_fees: number;
  total_with_delivery: number;
  sellers_used: number;
  estimated_savings: number;
  warnings: string[];
  item_assignments: Record<number, { seller_id: number; seller_name: string; line_total: number }>;
}

export interface OptimizationResult {
  recommended: string;
  strategies: Record<string, OptimizationStrategy>;
  savings: number;
}

export const groceryApi = {
  listProducts: (search?: string) =>
    publicRequest<{ products: GroceryProduct[]; count: number }>(
      `/grocery/products${search ? `?q=${encodeURIComponent(search)}` : ""}`
    ),

  getProduct: (id: number) =>
    publicRequest<GroceryProduct>(`/grocery/products/${id}`),

  addToCart: (productId: number, quantity: number) =>
    authRequest<CartView>("/grocery/cart/items", {
      method: "POST",
      body: JSON.stringify({ product_id: productId, quantity }),
    }),

  getCart: () => authRequest<CartView>("/grocery/cart"),

  updateCartItem: (itemId: number, quantity: number) =>
    authRequest<CartView>(`/grocery/cart/items/${itemId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    }),

  removeCartItem: (itemId: number) =>
    authRequest<CartView>(`/grocery/cart/items/${itemId}`, { method: "DELETE" }),

  optimizeCart: () => authRequest<OptimizationResult>("/grocery/cart/optimize"),
};
