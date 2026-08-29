import type { Metadata } from 'next'
import '@/styles/globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { Providers } from '@/components/Providers'

/* NECESSITY: Root layout component */
/* LOGIC: Wraps all pages with Navbar (role-aware module links), ToastProvider, and styling */
/* EDGE-CASE: None */

export const metadata: Metadata = {
  title: 'VIA - Multi-Service Platform',
  description: 'Location-focused multi-service MVP for Dhaka residents',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  )
}
