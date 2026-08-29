'use client'

import { useState, type MouseEvent } from 'react'
import { getStoredToken, addToCart } from '@/lib/api/grocery'
import { useToast } from '@/components/Toast'
import { formatTaka, toNumber } from '@/lib/utils/money'

interface QuickAddToCartProps {
  productId: number
  productName: string
  unitPrice: number | string
  maxStock: number
}

/**
 * Inline quantity stepper + Add button rendered on every product tile.
 *
 * NECESSITY: Users can add items to cart directly from the listing without
 * opening the product detail page, reducing friction.
 * LOGIC: All clicks are contained with stopPropagation so the surrounding
 * tile Link still navigates to the product detail page.
 * EDGE-CASE: Stepper bounds are clamped to [1, stock_quantity].
 */
export function QuickAddToCart({ productId, productName, unitPrice, maxStock }: QuickAddToCartProps) {
  const { showToast } = useToast()
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)

  const safeMax = Math.max(1, Math.floor(toNumber(maxStock)))
  const decrement = () => setQuantity((current) => Math.max(1, current - 1))
  const increment = () => setQuantity((current) => Math.min(safeMax, current + 1))

  const handleAdd = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    if (!getStoredToken()) {
      window.location.href = '/login?next=/grocery'
      return
    }
    setAdding(true)
    try {
      await addToCart(productId, quantity)
      showToast(`Added ${quantity} × ${productName} to cart`, 'success')
      setQuantity(1)
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to add to cart', 'error')
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="mt-3 flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
      <div className="flex items-center rounded-lg border border-gray-200 bg-white">
        <button type="button" onClick={decrement} aria-label="Decrease quantity" className="px-2 py-1 text-gray-600 hover:text-via-green">
          −
        </button>
        <span className="min-w-[2rem] text-center text-sm font-semibold text-gray-900">{quantity}</span>
        <button type="button" onClick={increment} aria-label="Increase quantity" className="px-2 py-1 text-gray-600 hover:text-via-green">
          +
        </button>
      </div>
      <button
        type="button"
        disabled={adding}
        onClick={handleAdd}
        className="flex-1 rounded-lg bg-via-green px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-600 disabled:opacity-60"
      >
        {adding ? 'Adding…' : `Add · ${formatTaka(toNumber(unitPrice) * quantity)}`}
      </button>
    </div>
  )
}
