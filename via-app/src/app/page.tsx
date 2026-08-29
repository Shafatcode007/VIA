import type { Metadata } from 'next';
import Link from 'next/link';

import { PublicHeader } from '@/components/PublicHeader';

export const metadata: Metadata = {
  title: "VIA – Dhaka's Super App",
  description:
    'Home renting, price-compared grocery and on-demand transport for Dhaka. Browse freely — log in only when you rent, buy or ride.',
};

const FEATURES = [
  {
    key: 'housing',
    title: 'Home Renting',
    description: 'Browse rooms, portions and family flats across Dhaka. Filter by budget, block and preference, then claim your listing.',
    href: '/properties',
    cta: 'Explore Homes',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5 9.5V21h14V9.5" />
        <path d="M9 21v-6h6v6" />
      </svg>
    ),
  },
  {
    key: 'grocery',
    title: 'Grocery',
    description: 'Compare seller prices for daily essentials, normalize poya/miniket units and let the engine build the cheapest cart.',
    href: '/grocery',
    cta: 'Shop Grocery',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="9" cy="20" r="1.5" />
        <circle cx="17" cy="20" r="1.5" />
        <path d="M3 4h2l2.6 12.9a1 1 0 0 0 1 .8h8.7a1 1 0 0 0 1-.8L20 8H6" />
      </svg>
    ),
  },
  {
    key: 'transport',
    title: 'Transport',
    description: 'Pick pickup and drop on a live map, compare Bike, EV, Car and Car-XL fares and track your ride to payment.',
    href: '/transport',
    cta: 'Book a Ride',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M5 16 6.5 11a2 2 0 0 1 1.9-1.5h7.2A2 2 0 0 1 17.5 11L19 16" />
        <rect x="4" y="16" width="16" height="4" rx="1" />
        <circle cx="7.5" cy="18" r="0.5" />
        <circle cx="16.5" cy="18" r="0.5" />
      </svg>
    ),
  },
] as const;

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f7faf7]">
      <PublicHeader />

      <main>
        <section className="mx-auto max-w-6xl px-6 pb-12 pt-16 text-center">
          <span className="rounded-full bg-[#edf7ee] px-4 py-1.5 text-sm font-semibold text-[#4DBE55]">
            Dhaka&apos;s Super App
          </span>
          <h1 className="mt-6 text-4xl font-bold text-gray-900 sm:text-5xl">
            One city. Three services. <span className="text-[#4DBE55]">Zero hassle.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600">
            Browse homes, compare grocery prices across sellers and book rides on a live map.
            No account needed to look around — log in only when you rent, buy or ride.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              href="/properties"
              className="rounded-xl bg-[#4DBE55] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#3da447]"
            >
              Start Exploring
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-800 transition-colors hover:border-[#4DBE55]/50"
            >
              Log In / Register
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-16">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {FEATURES.map((feature) => (
              <Link
                key={feature.key}
                href={feature.href}
                className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-[#4DBE55] hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#edf7ee] text-[#4DBE55]">
                  {feature.icon}
                </div>
                <h2 className="mt-4 text-lg font-bold text-gray-900">{feature.title}</h2>
                <p className="mt-2 text-sm text-gray-600">{feature.description}</p>
                <span className="mt-4 inline-block text-sm font-semibold text-[#4DBE55] group-hover:underline">
                  {feature.cta} →
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="border-t border-gray-100 bg-white">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 py-10 md:grid-cols-3">
            <div>
              <p className="text-sm font-bold text-gray-900">Browse freely</p>
              <p className="mt-1 text-sm text-gray-600">Homes, grocery prices and fare estimates are open to everyone — no account needed.</p>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Log in to transact</p>
              <p className="mt-1 text-sm text-gray-600">Rent or list a home, buy grocery, book a ride or drive — one account, five roles.</p>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">One dashboard</p>
              <p className="mt-1 text-sm text-gray-600">Orders, rides, invoices and earnings live together after login.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-400">
        VIA — CSE327 Software Engineering Project · Dhaka, Bangladesh
      </footer>
    </div>
  );
}
