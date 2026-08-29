'use client'

import Link from 'next/link'

export default function PaymentFailedPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">✕</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 font-poppins mb-2">Payment Failed</h1>
        <p className="text-via-slate mb-6">Something went wrong. Please try again.</p>
        <Link href="/cart" className="inline-block px-6 py-3 bg-via-green text-white rounded-lg hover:bg-green-600 transition font-medium">
          Back to Cart
        </Link>
      </div>
    </main>
  )
}
