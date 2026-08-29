'use client'

import { useState, useEffect } from 'react'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { getMe, type User } from '@/lib/api/auth'
import type { UserRole } from '@/lib/access/moduleAccess'

/* NECESSITY: Dashboard with role-aware quick actions */
/* LOGIC: Fetches user role, passes to QuickActions for module visibility */
/* EDGE-CASE: If not logged in, shows as guest (no personalized actions) */

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      try {
        const me = await getMe()
        setUser(me)
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [])

  const role = (user?.role as UserRole) || null

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 font-poppins mb-8">Dashboard</h1>

        {user && (
          <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Signed in as</p>
            <p className="text-lg font-semibold text-gray-900">{user.full_name || user.email}</p>
            <span className="mt-1 inline-block rounded-full bg-[#edf7ee] px-3 py-1 text-xs font-medium text-[#4DBE55]">
              {user.role}
            </span>
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <div className="h-6 w-48 animate-pulse rounded bg-gray-200 mb-6" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="h-32 animate-pulse rounded-xl bg-gray-100" />
              <div className="h-32 animate-pulse rounded-xl bg-gray-100" />
            </div>
          </div>
        ) : (
          <QuickActions role={role} />
        )}
      </div>
    </main>
  )
}
