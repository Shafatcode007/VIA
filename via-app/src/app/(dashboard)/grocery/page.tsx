"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingCart, Search } from "lucide-react";
import { groceryApi, type GroceryProduct } from "@/lib/api/grocery";
import { QuickAddToCart } from "@/components/grocery/QuickAddToCart";
import { ProductImage } from "@/components/grocery/ProductImage";
import { formatTaka } from "@/lib/money";

export default function GroceryPage() {
  const [products, setProducts] = useState<GroceryProduct[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);
    setError("");
    try {
      const data = await groceryApi.listProducts();
      setProducts(data.products || []);
    } catch {
      setError(
        "Could not connect to grocery backend. Make sure the FastAPI server is running on port 8000."
      );
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = query
    ? products.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase())
      )
    : products;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Grocery Shopping
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Compare prices across multiple sellers
          </p>
        </div>
        <Link
          href="/cart"
          className="flex items-center gap-2 px-4 py-2 bg-[#4DBE55] text-white rounded-xl text-sm font-medium hover:bg-[#3ea846] transition-colors shadow-sm"
        >
          <ShoppingCart size={16} />
          View Cart
        </Link>
      </div>

      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />
        <input
          type="text"
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full md:w-96 pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#4DBE55] focus:border-transparent outline-none"
        />
      </div>

      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">
          Loading products...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <ShoppingCart
            size={48}
            className="mx-auto mb-4 text-gray-300"
          />
          <p className="text-gray-500">
            {error ? "No products available" : "No products found"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((product) => (
            <Link
              key={product.id}
              href={`/grocery/${product.id}`}
              className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-all group"
            >
              <div className="h-32 mb-3 overflow-hidden rounded-xl bg-[#edf7ee]">
                <ProductImage
                  src={product.image_url}
                  alt={product.name}
                  className="h-full w-full"
                />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2 group-hover:text-[#4DBE55] transition-colors">
                {product.name}
              </h3>
              <p className="text-xs text-gray-500 mb-2">
                {product.seller_name || "Seller"}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-[#4DBE55]">
                  {formatTaka(product.price)}
                </span>
                <span className="text-xs text-gray-400">
                  / {product.unit}
                </span>
              </div>
              <p
                className={`text-xs mt-2 ${
                  product.stock_quantity > 0
                    ? "text-green-600"
                    : "text-red-500"
                }`}
              >
                {product.stock_quantity > 0
                  ? `In stock (${product.stock_quantity})`
                  : "Out of stock"}
              </p>
              {product.stock_quantity > 0 && (
                <QuickAddToCart
                  productId={product.id}
                  productName={product.name}
                  unitPrice={product.price}
                  maxStock={product.stock_quantity}
                />
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
