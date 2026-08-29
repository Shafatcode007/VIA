'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getCart, updateCartItem, removeFromCart, optimizeCart, type Cart, type OptimizationResult } from '@/lib/api/grocery'
import { useCartTotals } from '@/lib/cart/useCartTotals'
import { formatTaka, toNumber } from '@/lib/utils/money'

export default function CartPage() {
  const router = useRouter()
  const [cart, setCart] = useState<Cart | null>(null)
  const [optimization, setOptimization] = useState<OptimizationResult | null>(null)
  const [loading, setLoading] = useState(true)
  const totals = useCartTotals(cart)

  useEffect(() => { loadCart() }, [])

  async function loadCart() {
    setLoading(true)
    try {
      const data = await getCart()
      setCart(data)
      if (data.items.length > 0) {
        const opt = await optimizeCart()
        setOptimization(opt)
      }
    } catch { setCart(null) }
    setLoading(false)
  }

  async function handleUpdate(itemId: number, qty: number) {
    if (qty < 1) return
    try {
      const updated = await updateCartItem(itemId, qty)
      setCart(updated)
      if (updated.items.length > 0) {
        const opt = await optimizeCart()
        setOptimization(opt)
      }
    } catch { /* update failed */ }
  }

  async function handleRemove(itemId: number) {
    try {
      const updated = await removeFromCart(itemId)
      setCart(updated)
      if (updated.items.length > 0) {
        const opt = await optimizeCart()
        setOptimization(opt)
      } else {
        setOptimization(null)
      }
    } catch { /* remove failed */ }
  }

  if (loading) return <main className="min-h-screen bg-gray-50 flex items-center justify-center"><p>Loading cart...</p></main>
  if (!cart || cart.items.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <p className="text-xl text-via-slate mb-4">Your cart is empty</p>
        <Link href="/grocery" className="px-6 py-3 bg-via-green text-white rounded-lg hover:bg-green-600">Browse Grocery</Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 font-poppins mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map(item => (
              <div key={item.id} className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-4">
                <div className="w-16 h-16 bg-via-light-green rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-2xl">🛒</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm truncate">{item.product_name}</h3>
                  <p className="text-sm text-via-green font-medium">{formatTaka(item.product_price)}</p>
                </div>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button onClick={() => handleUpdate(item.id, item.quantity - 1)} className="px-2 py-1 hover:bg-gray-100">-</button>
                  <span className="px-3 py-1 font-medium text-sm">{item.quantity}</span>
                  <button onClick={() => handleUpdate(item.id, item.quantity + 1)} className="px-2 py-1 hover:bg-gray-100">+</button>
                </div>
                <p className="font-semibold text-gray-900 text-sm w-20 text-right">{formatTaka(item.subtotal)}</p>
                <button onClick={() => handleRemove(item.id)} className="text-red-400 hover:text-red-600 text-sm">✕</button>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="font-bold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Items ({totals.itemCount})</span>
                  <span>{formatTaka(totals.itemsTotal)}</span>
                </div>
                {totals.deliveryFee > 0 && (
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span>{formatTaka(totals.deliveryFee)}</span>
                  </div>
                )}
                <hr />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-via-green">{formatTaka(totals.grandTotal)}</span>
                </div>
              </div>
              <button onClick={() => router.push('/checkout')} className="w-full mt-4 py-3 bg-via-green text-white rounded-lg font-semibold hover:bg-green-600 transition">
                Proceed to Checkout
              </button>
            </div>

            {optimization && (
              <div className="bg-via-light-green rounded-lg border border-green-200 p-6">
                <h3 className="font-bold text-gray-900 mb-3">Cart Optimization</h3>
                <p className="text-sm text-via-slate mb-3">Recommended: <span className="font-semibold text-via-green">{optimization.recommended.replace('_', ' ')}</span></p>
                {optimization.savings > 0 && (
                  <p className="text-sm text-green-700 font-medium">Save {formatTaka(optimization.savings)} with this strategy</p>
                )}
                {Object.entries(optimization.strategies).map(([key, s]) => (
                  <div key={key} className="mt-3 p-3 bg-white rounded-lg text-xs">
                    <p className="font-semibold">{key.replace('_', ' ')}</p>
                    <p>Total: {formatTaka(s.total_with_delivery)} | Sellers: {s.sellers_used}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
