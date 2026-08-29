'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import apiClient from '@/lib/api/client'
import { getMe, type User } from '@/lib/api/auth'

/* NECESSITY: ADMIN-only page for viewing ledger entries */
/* LOGIC: Fetches user role, loads all ledger entries from backend */
/* EDGE-CASE: Non-ADMIN users redirected to /dashboard */

interface LedgerEntry {
  id: number
  order_id: number
  seller_id: number
  amount_cents: number
  type: string
  created_at: string | null
}

export default function AdminLedgerPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [entries, setEntries] = useState<LedgerEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function init() {
      try {
        const me = await getMe()
        setUser(me)
        if (me.role !== 'ADMIN') {
          router.push('/dashboard')
          return
        }
        const { data } = await apiClient.get('/api/v1/grocery/ledger/me')
        setEntries(data.entries || [])
      } catch {
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [router])

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-12 text-center text-via-slate">Loading...</div>
      </main>
    )
  }

  if (user && user.role !== 'ADMIN') return null

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-poppins">Ledger</h1>
            <p className="text-via-slate mt-1">Financial transactions across all sellers</p>
          </div>
          <Link href="/admin/orders" className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:border-[#4DBE55] transition">
            View Orders
          </Link>
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
            <p className="text-via-slate">No ledger entries found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono text-gray-900">#{entry.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">#{entry.order_id}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">#{entry.seller_id}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-[#4DBE55]">৳{(entry.amount_cents / 100).toFixed(0)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{entry.type}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {entry.created_at ? new Date(entry.created_at).toLocaleDateString() : '—'}
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
