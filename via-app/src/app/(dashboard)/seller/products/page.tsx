"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredToken, redirectToLogin } from "@/lib/auth/session";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Product {
  id: number;
  name: string;
  price: number;
  unit: string;
  stock_quantity: number;
  is_available: boolean;
}

interface Seller {
  id: number;
  name: string;
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  if (!token) {
    redirectToLogin();
    throw new Error("Not authenticated");
  }
  const headers = new Headers(options.headers ?? {});
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (res.status === 401) {
    redirectToLogin();
    throw new Error("Session expired");
  }
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json() as Promise<T>;
}

export default function SellerProductsPage() {
  const router = useRouter();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", unit: "kg", stock_quantity: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const sellerData = await apiFetch<{ sellers: Seller[] }>("/api/v1/grocery/sellers/me");
        const sellers = sellerData.sellers || [];
        if (sellers.length === 0) {
          setLoading(false);
          return;
        }
        const s = sellers[0];
        setSeller(s);
        const prodData = await apiFetch<{ products: Product[] }>(`/api/v1/grocery/sellers/${s.id}/products`);
        setProducts(prodData.products || []);
      } catch {
        setError("Could not load seller data. Make sure the backend is running.");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [router]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!seller) return;
    setSubmitting(true);
    try {
      const product = await apiFetch<Product>(`/api/v1/grocery/sellers/${seller.id}/products`, {
        method: "POST",
        body: JSON.stringify({
          name: newProduct.name,
          price: parseFloat(newProduct.price),
          unit: newProduct.unit,
          stock_quantity: parseInt(newProduct.stock_quantity, 10) || 0,
        }),
      });
      setProducts((prev) => [...prev, product]);
      setNewProduct({ name: "", price: "", unit: "kg", stock_quantity: "" });
      setShowAdd(false);
    } catch {
      // silently fail
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="max-w-5xl mx-auto px-4 py-12 text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900" style={{ fontFamily: "Poppins, sans-serif" }}>
            My Products
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage your grocery inventory</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 bg-[#4DBE55] text-white rounded-lg text-sm font-medium hover:bg-green-600 transition"
        >
          + Add Product
        </button>
      </div>

      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">{error}</div>
      )}

      {showAdd && (
        <form onSubmit={handleAdd} className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Add New Product</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              required
              placeholder="Product name"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4DBE55] outline-none"
            />
            <input
              type="number"
              required
              min="0.01"
              step="0.01"
              placeholder="Price (৳)"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4DBE55] outline-none"
            />
            <select
              value={newProduct.unit}
              onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4DBE55] outline-none"
            >
              <option value="kg">kg</option>
              <option value="g">g</option>
              <option value="piece">piece</option>
              <option value="dozen">dozen</option>
              <option value="litre">litre</option>
            </select>
            <input
              type="number"
              min="0"
              placeholder="Stock quantity"
              value={newProduct.stock_quantity}
              onChange={(e) => setNewProduct({ ...newProduct, stock_quantity: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4DBE55] outline-none"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-[#4DBE55] text-white rounded-lg text-sm font-medium hover:bg-green-600 disabled:opacity-50">
              {submitting ? "Adding..." : "Add Product"}
            </button>
          </div>
        </form>
      )}

      {products.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <p className="text-gray-500">No products yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{p.name}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-[#4DBE55]">৳{p.price.toFixed(0)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{p.unit}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{p.stock_quantity}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${p.is_available ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {p.is_available ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
