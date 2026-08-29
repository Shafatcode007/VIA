"use client";

import { useState, type MouseEvent } from "react";
import { getStoredToken } from "@/lib/auth/session";
import { groceryApi } from "@/lib/api/grocery";
import { useToast } from "@/components/ui/Toast";
import { formatTaka, toNumber } from "@/lib/money";

interface QuickAddToCartProps {
  productId: number;
  productName: string;
  unitPrice: number | string;
  maxStock: number;
}

export function QuickAddToCart({
  productId,
  productName,
  unitPrice,
  maxStock,
}: QuickAddToCartProps) {
  const { showToast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  const safeMax = Math.max(1, Math.floor(toNumber(maxStock)));
  const decrement = () =>
    setQuantity((current) => Math.max(1, current - 1));
  const increment = () =>
    setQuantity((current) => Math.min(safeMax, current + 1));

  const handleAdd = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!getStoredToken()) {
      window.location.href = "/login?next=/grocery";
      return;
    }
    setAdding(true);
    try {
      await groceryApi.addToCart(productId, quantity);
      showToast(`Added ${quantity} × ${productName} to cart`, "success");
      setQuantity(1);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to add to cart",
        "error"
      );
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="mt-3" onClick={(event) => event.stopPropagation()}>
      <div className="flex items-center gap-2">
        <div className="flex items-center rounded-lg border border-gray-200 bg-white">
          <button
            type="button"
            onClick={decrement}
            aria-label="Decrease quantity"
            className="px-2.5 py-1.5 text-gray-600 hover:text-[#4DBE55] transition-colors"
          >
            −
          </button>
          <span className="min-w-[2rem] text-center text-sm font-semibold text-gray-900">
            {quantity}
          </span>
          <button
            type="button"
            onClick={increment}
            aria-label="Increase quantity"
            className="px-2.5 py-1.5 text-gray-600 hover:text-[#4DBE55] transition-colors"
          >
            +
          </button>
        </div>
        <button
          type="button"
          disabled={adding || safeMax < 1}
          onClick={handleAdd}
          className="flex-1 rounded-lg bg-[#4DBE55] px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-[#3ea846] disabled:opacity-60"
        >
          {adding
            ? "Adding…"
            : `Add · ${formatTaka(toNumber(unitPrice) * quantity)}`}
        </button>
      </div>
    </div>
  );
}