'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { listProducts, type Product } from '@/lib/api/grocery'
import { QuickAddToCart } from '@/components/grocery/QuickAddToCart'

const CATEGORIES = ['All', 'grains', 'vegetables', 'meat', 'dairy', 'essentials', 'beverages', 'snacks']

export default function GroceryListPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProducts()
  }, [query])

  async function loadProducts() {
    setLoading(true)
    try {
      const data = await listProducts(query || undefined)
      setProducts(data.products)
    } catch {
      setProducts([])
    }
    setLoading(false)
  }

  const filtered = category === 'All'
    ? products
    : products.filter(p => {
        const canonicalName = p.name.toLowerCase()
        return canonicalName.includes(category.toLowerCase())
      })

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-poppins">Grocery Shopping</h1>
            <p className="text-via-slate mt-1">Compare prices across 5 sellers in Dhaka</p>
          </div>
          <Link href="/cart" className="px-4 py-2 bg-via-green text-white rounded-lg hover:bg-green-600 transition font-medium">
            View Cart
          </Link>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full md:w-96 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-via-green focus:border-transparent outline-none"
          />
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                category === cat
                  ? 'bg-via-green text-white'
                  : 'bg-white text-gray-600 border border-gray-300 hover:border-via-green'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-via-slate">Loading products...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-via-slate">No products found</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(product => (
              <Link
                key={product.id}
                href={`/grocery/${product.id}`}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition block"
              >
                <div className="h-32 bg-via-light-green rounded-lg mb-3 flex items-center justify-center">
                  <span className="text-4xl">🛒</span>
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">{product.name}</h3>
                <p className="text-xs text-via-slate mb-2">{product.seller_name || 'Seller'}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-via-green">৳{product.price.toFixed(0)}</span>
                  <span className="text-xs text-via-slate">/ {product.unit}</span>
                </div>
                {product.normalized_price_per_gram !== undefined && product.normalized_price_per_gram > 0 && (
                  <p className="text-xs text-via-slate mt-1">
                    Normalized: ৳{(product.normalized_price_per_gram * 100).toFixed(1)}/100g
                  </p>
                )}
                <p className={`text-xs mt-2 ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {product.stock_quantity > 0 ? `In stock (${product.stock_quantity})` : 'Out of stock'}
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
    </main>
  )
}
