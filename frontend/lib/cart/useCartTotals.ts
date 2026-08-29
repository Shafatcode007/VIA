'use client'

import { useMemo } from 'react'
import { type Cart } from '@/lib/api/grocery'
import { sum, toNumber } from '@/lib/utils/money'

export interface CartTotals {
  itemCount: number
  itemsTotal: number
  deliveryFee: number
  grandTotal: number
}

const DELIVERY_FEE_BDT = 60

/**
 * Single source of truth for cart arithmetic.
 *
 * NECESSITY: Every monetary field is coerced with toNumber() BEFORE any math
 * so cart, checkout, and invoice can never disagree due to string serialization.
 * LOGIC: Computes item count, items total, delivery fee, and grand total from cart data.
 * EDGE-CASE: Returns zeroed totals when cart is null.
 */
export function useCartTotals(cart: Cart | null): CartTotals {
  return useMemo(() => {
    if (!cart) return { itemCount: 0, itemsTotal: 0, deliveryFee: 0, grandTotal: 0 }
    const lines = cart.items ?? []
    const itemsTotal = sum(lines.map((line) => toNumber(line.subtotal)))
    const deliveryFee = lines.length > 0 ? DELIVERY_FEE_BDT : 0
    return {
      itemCount: lines.length,
      itemsTotal,
      deliveryFee,
      grandTotal: itemsTotal + deliveryFee,
    }
  }, [cart])
}
