"use client"

import { clearSession } from "@/lib/auth/session"
import { useRouter } from "next/navigation"

export default function SignOutButton() {
  const router = useRouter()

  const handleSignOut = () => {
    clearSession()
    router.push("/")
  }

  return (
    <button
      onClick={handleSignOut}
      className="w-full py-2.5 rounded-xl border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors"
    >
      Sign Out
    </button>
  )
}
