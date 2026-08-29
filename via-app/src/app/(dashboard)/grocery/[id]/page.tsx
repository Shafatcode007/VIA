"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Store,
  Truck,
  ShieldCheck,
} from "lucide-react";
import {
  groceryApi,
  hasStoredToken,
  type GroceryProduct,
} from "@/lib/api/grocery";
import { useToast } from "@/components/ui/Toast";
import { ProductImage } from "@/components/grocery/ProductImage";
import { formatTaka } from "@/lib/money";

export default function GroceryDetailPage() {
  const params = useParams();
  const { showToast } = useToast();
  const [product, setProduct] = useState<GroceryProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        const data = await groceryApi.getProduct(Number(params.id));
        setProduct(data);
      } catch {
        setError("Product not found");
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [params.id]);

  async function handleAddToCart() {
    if (!product) return;
    setAdding(true);
    try {
      await groceryApi.addToCart(product.id, quantity);
      showToast(
        `Added ${quantity} ${product.name} to cart`,
        "success"
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to add to cart";
      if (msg === "Not authenticated") {
        showToast("Please log in to add items to your cart", "error");
      } else {
        showToast(msg, "error");
      }
    } finally {
      setAdding(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center text-gray-500">
        Loading...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500 mb-4">{error || "Product not found"}</p>
        <Link
          href="/grocery"
          className="text-[#4DBE55] hover:underline"
        >
          Back to Grocery
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-10 space-y-6">
      <Link
        href="/grocery"
        className="inline-flex items-center gap-1.5 text-sm text-[#4DBE55] hover:text-[#3ea846] font-medium"
      >
        <ArrowLeft size={16} />
        Back to Grocery
      </Link>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-64 overflow-hidden rounded-2xl bg-[#edf7ee]">
            <ProductImage
              src={product.image_url}
              alt={product.name}
              className="h-full w-full"
            />
          </div>

          <div className="space-y-4">
            <div>
              <h1
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                {product.name}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <Store size={14} className="text-gray-400" />
                <span className="text-sm text-gray-500">
                  {product.seller?.name ||
                    product.seller_name ||
                    "Market"}
                </span>
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[#4DBE55]">
                {formatTaka(product.price)}
              </span>
              <span className="text-sm text-gray-400">
                / {product.unit}
              </span>
            </div>

            {product.description && (
              <p className="text-sm text-gray-600">
                {product.description}
              </p>
            )}

            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  product.stock_quantity > 0
                    ? "bg-[#edf7ee] text-[#4DBE55]"
                    : "bg-red-50 text-red-500"
                }`}
              >
                {product.stock_quantity > 0
                  ? `In stock (${product.stock_quantity})`
                  : "Out of stock"}
              </span>
            </div>

            {product.seller?.address && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Truck size={14} className="text-gray-400" />
                {product.seller.address}
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <ShieldCheck size={14} className="text-gray-400" />
              Buyer protection available
            </div>

            <div className="flex items-center gap-4 pt-4">
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() =>
                    setQuantity(Math.max(1, quantity - 1))
                  }
                  className="px-3.5 py-2.5 text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  -
                </button>
                <span className="px-4 py-2.5 text-sm font-medium min-w-[2rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3.5 py-2.5 text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  +
                </button>
              </div>
              {hasStoredToken() ? (
                <button
                  onClick={handleAddToCart}
                  disabled={adding || product.stock_quantity === 0}
                  className="flex-1 py-3 bg-[#4DBE55] text-white rounded-xl font-semibold hover:bg-[#3ea846] transition disabled:opacity-50 text-sm"
                >
                  {adding ? "Adding..." : "Add to Cart"}
                </button>
              ) : (
                <Link
                  href={`/login?next=${encodeURIComponent(`/grocery/${product.id}`)}`}
                  className="flex-1 py-3 bg-[#4DBE55] text-white rounded-xl font-semibold hover:bg-[#3ea846] transition text-sm text-center"
                >
                  Log In to Add
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
