'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  getMySellers,
  createSeller,
  getSellerProducts,
  createSellerProduct,
  updateProduct,
  type Seller,
  type Product,
} from '@/lib/api/grocery'
import { getMe, type User } from '@/lib/api/auth'

/* NECESSITY: SELLER-only page for managing grocery products */
/* LOGIC: Fetches user role, loads seller profile + products, provides add/edit forms */
/* EDGE-CASE: Non-SELLER users redirected to /dashboard */

const UNITS = ['kg', 'g', 'piece', 'dozen', 'litre', 'ml', 'poya', 'miniket', 'seer', 'mound']

export default function SellerProductsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [seller, setSeller] = useState<Seller | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    unit: 'kg',
    stock_quantity: '',
    description: '',
    is_available: true,
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function init() {
      try {
        const me = await getMe()
        setUser(me)
        if (me.role !== 'SELLER') {
          router.push('/dashboard')
          return
        }
        const { sellers } = await getMySellers()
        if (sellers.length === 0) {
          setLoading(false)
          return
        }
        const s = sellers[0]
        setSeller(s)
        const { products: prods } = await getSellerProducts(s.id)
        setProducts(prods)
      } catch {
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [router])

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault()
    if (!seller) return
    setSubmitting(true)
    setError('')
    try {
      const product = await createSellerProduct(seller.id, {
        canonical_item_id: null,
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        unit: newProduct.unit,
        stock_quantity: parseInt(newProduct.stock_quantity, 10) || 0,
        description: newProduct.description || null,
        image_url: null,
        is_available: newProduct.is_available,
      })
      setProducts((prev) => [...prev, product])
      setNewProduct({ name: '', price: '', unit: 'kg', stock_quantity: '', description: '', is_available: true })
      setShowAddForm(false)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add product'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleToggleAvailability(product: Product) {
    try {
      const updated = await updateProduct(product.id, { is_available: !product.is_available })
      setProducts((prev) => prev.map((p) => (p.id === product.id ? updated : p)))
    } catch {
      // silently fail — product state remains unchanged
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-12 text-center text-via-slate">Loading...</div>
      </main>
    )
  }

  if (user && user.role !== 'SELLER') {
    return null
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-poppins">My Products</h1>
            <p className="text-via-slate mt-1">Manage your grocery inventory</p>
          </div>
          <div className="flex gap-3">
            <Link href="/grocery" className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:border-[#4DBE55] transition">
              View Storefront
            </Link>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-[#4DBE55] text-white rounded-lg text-sm font-medium hover:bg-green-600 transition"
            >
              + Add Product
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {showAddForm && (
          <div className="mb-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Product</h2>
            <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4DBE55] focus:border-transparent outline-none"
                  placeholder="e.g. Basmati Rice Premium"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (৳) *</label>
                <input
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4DBE55] focus:border-transparent outline-none"
                  placeholder="e.g. 120"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <select
                  value={newProduct.unit}
                  onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4DBE55] focus:border-transparent outline-none"
                >
                  {UNITS.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={newProduct.stock_quantity}
                  onChange={(e) => setNewProduct({ ...newProduct, stock_quantity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4DBE55] focus:border-transparent outline-none"
                  placeholder="e.g. 50"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4DBE55] focus:border-transparent outline-none"
                  placeholder="Optional description"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newProduct.is_available}
                    onChange={(e) => setNewProduct({ ...newProduct, is_available: e.target.checked })}
                    className="w-4 h-4 text-[#4DBE55] border-gray-300 rounded focus:ring-[#4DBE55]"
                  />
                  <span className="text-sm font-medium text-gray-700">Available for sale</span>
                </label>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#4DBE55] text-white rounded-lg text-sm font-medium hover:bg-green-600 transition disabled:opacity-50"
                >
                  {submitting ? 'Adding...' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        )}

        {products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
            <p className="text-via-slate mb-4">No products yet. Add your first product to get started.</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-3 bg-[#4DBE55] text-white rounded-lg font-medium hover:bg-green-600 transition"
            >
              + Add Product
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{product.name}</div>
                      {product.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-[#4DBE55]">৳{product.price.toFixed(0)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{product.unit}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{product.stock_quantity}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${product.is_available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {product.is_available ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleToggleAvailability(product)}
                        className={`text-sm font-medium transition ${product.is_available ? 'text-red-600 hover:text-red-800' : 'text-[#4DBE55] hover:text-green-700'}`}
                      >
                        {product.is_available ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}
