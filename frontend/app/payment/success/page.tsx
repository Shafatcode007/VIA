'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order_id')

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">✓</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 font-poppins mb-2">Order Placed!</h1>
        <p className="text-via-slate mb-4">Your order has been successfully placed.</p>
        {orderId && <p className="text-sm text-via-slate mb-6">Order ID: <span className="font-mono font-medium text-gray-900">#{orderId}</span></p>}
        <Link href="/grocery" className="inline-block px-6 py-3 bg-via-green text-white rounded-lg hover:bg-green-600 transition font-medium">
          Continue Shopping
        </Link>
      </div>
    </main>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-gray-50 flex items-center justify-center"><p>Loading...</p></main>}>
      <SuccessContent />
    </Suspense>
  )
}
