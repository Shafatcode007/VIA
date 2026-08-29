'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getProduct, listProducts, addToCart, type Product } from '@/lib/api/grocery'

export default function GroceryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const productId = Number(params.id)
  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    loadProduct()
  }, [productId])

  async function loadProduct() {
    setLoading(true)
    try {
      const data = await getProduct(productId)
      setProduct(data)
      const all = await listProducts()
      setRelated(all.products.filter(p => p.id !== productId && p.seller_id !== data.seller_id).slice(0, 4))
    } catch {
      setProduct(null)
    }
    setLoading(false)
  }

  async function handleAddToCart() {
    setAdding(true)
    try {
      await addToCart(productId, quantity)
      router.push('/cart')
    } catch {
      alert('Failed to add to cart')
    }
    setAdding(false)
  }

  if (loading) return <main className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-via-slate">Loading...</p></main>
  if (!product) return <main className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-via-slate">Product not found</p></main>

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/grocery" className="text-via-green hover:underline mb-4 inline-block">&larr; Back to Grocery</Link>

        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-64 bg-via-light-green rounded-lg flex items-center justify-center">
              <span className="text-6xl">🛒</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 font-poppins mb-2">{product.name}</h1>
              <p className="text-via-slate mb-4">{product.description || 'Fresh product from verified seller'}</p>

              <div className="bg-via-light-green rounded-lg p-4 mb-4">
                <p className="text-sm text-via-slate">Seller</p>
                <p className="font-semibold text-gray-900">{product.seller_name || `Seller #${product.seller_id}`}</p>
              </div>

              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-bold text-via-green">৳{product.price.toFixed(0)}</span>
                <span className="text-via-slate">/ {product.unit}</span>
              </div>

              <p className={`text-sm mb-4 ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {product.stock_quantity > 0 ? `${product.stock_quantity} units in stock` : 'Out of stock'}
              </p>

              <div className="flex items-center gap-4 mb-6">
                <label className="text-sm font-medium text-gray-700">Quantity:</label>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-1 hover:bg-gray-100">-</button>
                  <span className="px-4 py-1 font-medium">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-1 hover:bg-gray-100">+</button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={adding || product.stock_quantity === 0}
                className="w-full py-3 bg-via-green text-white rounded-lg font-semibold hover:bg-green-600 transition disabled:opacity-50"
              >
                {adding ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 font-poppins mb-4">Other Sellers Also Have</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map(p => (
                <Link key={p.id} href={`/grocery/${p.id}`} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">{p.name}</h3>
                  <p className="text-xs text-via-slate mb-2">{p.seller_name}</p>
                  <p className="text-lg font-bold text-via-green">৳{p.price.toFixed(0)} / {p.unit}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
