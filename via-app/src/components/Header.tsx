"use client";

import { clearSession, getStoredUser, type SessionUser } from "@/lib/auth/session";
import { useState, useRef, useEffect } from "react";
import { LogOut, User, ChevronDown, ShoppingCart, Package } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ModuleNavLinks } from "./ModuleNavLinks";

export function Header() {
  const router = useRouter();
  const [session, setSession] = useState<SessionUser | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = getStoredUser();
    setSession(stored);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = () => {
    clearSession();
    setSession(null);
    setIsDropdownOpen(false);
    router.push("/");
  };

  const headerUser = session
    ? {
        name: session.full_name || session.email || "User",
        email: session.email || "",
        image: null,
        role: session.role || "RESIDENT",
      }
    : {
        name: "User",
        email: "",
        image: null,
        role: "RESIDENT",
      };

  const rawRole = session?.role ?? null;

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <a href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#4DBE55] rounded-lg flex items-center justify-center text-white font-bold text-xl italic tracking-tighter">
            V
          </div>
          <span className="font-bold text-xl tracking-tight text-gray-900" style={{ fontFamily: "Poppins, sans-serif" }}>
            VIA
          </span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          <a href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-[#4DBE55] transition-colors">
            Dashboard
          </a>
          <ModuleNavLinks rawRole={rawRole} />
          {rawRole === "LANDLORD" && (
            <Link href="/landlord/add-property" className="text-sm font-medium text-[#4DBE55] hover:text-[#3ea846] transition-colors">
              + List Property
            </Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/cart"
            className="relative p-2 text-gray-600 hover:text-[#4DBE55] hover:bg-gray-50 rounded-lg transition-colors"
          >
            <ShoppingCart size={20} />
          </Link>

          {session ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#edf7ee] text-[#4DBE55] flex items-center justify-center">
                  <User size={16} />
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
                  {headerUser.name}
                </span>
                <ChevronDown size={14} className="text-gray-400" />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-4 border-b border-gray-100">
                    <p className="font-medium text-sm text-gray-900 truncate">{headerUser.name}</p>
                    <p className="text-xs text-gray-500 truncate">{headerUser.email}</p>
                    <div className="mt-2">
                      <span className="inline-flex items-center gap-1.5 bg-[#edf7ee] text-[#4DBE55] px-3 py-1 rounded-full text-xs font-semibold border border-green-100">
                        <User size={10} strokeWidth={2.5} />
                        {headerUser.role}
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/orders"
                    onClick={() => setIsDropdownOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Package size={16} />
                    My Orders
                  </Link>

                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Log In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
