import Link from 'next/link'

/* NECESSITY: Housing/Rental listings page (released module) */
/* LOGIC: Static page for rental property browsing */
/* EDGE-CASE: None */

export default function RentalsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 font-poppins mb-4">Rental Listings</h1>
        <p className="text-via-slate mb-8">Find your perfect home in Dhaka</p>

        <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
          <p className="text-via-slate mb-4">Rental listings coming soon. Check back later.</p>
          <Link href="/dashboard" className="inline-block px-6 py-3 bg-[#4DBE55] text-white rounded-lg hover:bg-green-600 transition font-medium">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  )
}
