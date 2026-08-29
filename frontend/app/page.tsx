import Link from 'next/link'

/* NECESSITY: Home page component */
/* LOGIC: Displays welcome message and navigation links */
/* EDGE-CASE: None */

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-via-green mb-4">
            Welcome to VIA
          </h1>
          <p className="text-xl text-via-slate mb-8">
            Your Multi-Service Platform for Dhaka
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <Link
              href="/rentals"
              className="block p-6 bg-via-light-green rounded-lg hover:shadow-lg transition"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                🏠 Rental Listings
              </h2>
              <p className="text-gray-600">
                Find your perfect home with verified listings
              </p>
            </Link>
            
            <Link
              href="/grocery"
              className="block p-6 bg-via-light-green rounded-lg hover:shadow-lg transition"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                🛒 Grocery Shopping
              </h2>
              <p className="text-gray-600">
                Compare prices across multiple sellers
              </p>
            </Link>
            
            <div className="block p-6 bg-gray-50 rounded-lg cursor-not-allowed opacity-60">
              <h2 className="text-xl font-semibold text-gray-400 mb-2">
                🚗 Transport
              </h2>
              <p className="text-gray-400">
                Coming Soon
              </p>
            </div>
          </div>
          
          <div className="mt-12">
            <Link
              href="/login"
              className="inline-block px-6 py-3 bg-via-green text-white rounded-lg hover:bg-green-600 transition mr-4"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="inline-block px-6 py-3 border-2 border-via-green text-via-green rounded-lg hover:bg-via-light-green transition"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
