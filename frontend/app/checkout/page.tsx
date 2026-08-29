'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getCart, checkout, type Cart } from '@/lib/api/grocery'
import { useCartTotals } from '@/lib/cart/useCartTotals'
import { formatTaka } from '@/lib/utils/money'

export default function CheckoutPage() {
  const router = useRouter()
  const [cart, setCart] = useState<Cart | null>(null)
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const totals = useCartTotals(cart)

  useEffect(() => {
    getCart().then(data => {
      setCart(data)
      setLoading(false)
      if (data.items.length === 0) router.push('/cart')
    }).catch(() => setLoading(false))
  }, [])

  async function handleCheckout() {
    if (!address.trim()) { return }
    setProcessing(true)
    try {
      const result = await checkout(address)
      router.push(`/payment/success?order_id=${result.order_id}`)
    } catch {
      router.push('/payment/failed')
    }
    setProcessing(false)
  }

  if (loading || !cart) return <main className="min-h-screen bg-gray-50 flex items-center justify-center"><p>Loading...</p></main>

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 font-poppins mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="font-bold text-gray-900 mb-4">Delivery Address</h2>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your full delivery address in Dhaka..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-via-green focus:border-transparent outline-none h-24"
              />
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="font-bold text-gray-900 mb-4">Order Items</h2>
              <div className="space-y-3">
                {cart.items.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <span className="text-gray-700">{item.product_name} × {item.quantity}</span>
                    <span className="font-medium">{formatTaka(item.subtotal)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 h-fit">
            <h2 className="font-bold text-gray-900 mb-4">Payment Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatTaka(totals.itemsTotal)}</span>
              </div>
              {totals.deliveryFee > 0 && (
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>{formatTaka(totals.deliveryFee)}</span>
                </div>
              )}
              <hr />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-via-green">{formatTaka(totals.grandTotal)}</span>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              disabled={processing || !address.trim()}
              className="w-full mt-6 py-3 bg-via-green text-white rounded-lg font-semibold hover:bg-green-600 transition disabled:opacity-50"
            >
              {processing ? 'Processing...' : 'Place Order & Pay'}
            </button>
            <Link href="/cart" className="block text-center mt-3 text-sm text-via-green hover:underline">Back to Cart</Link>
          </div>
        </div>
      </div>
    </main>
  )
}
