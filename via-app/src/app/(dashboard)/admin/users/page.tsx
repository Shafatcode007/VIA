"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  ArrowLeft,
  Shield,
  ShieldOff,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { adminApi, type AdminUser } from "@/lib/api/admin";
import { hasStoredToken } from "@/lib/api/grocery";
import { useToast } from "@/components/ui/Toast";

export default function AdminUsersPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<number | null>(null);

  useEffect(() => {
    if (!hasStoredToken()) {
      setLoading(false);
      return;
    }
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    try {
      const data = await adminApi.listUsers();
      setUsers(data.users);
    } catch {
      showToast("Could not load users", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle(user: AdminUser) {
    setToggling(user.id);
    try {
      const result = await adminApi.toggleUserActive(user.id);
      setUsers((prev) =>
        prev.map((u) => (u.id === result.id ? { ...u, is_active: result.is_active } : u))
      );
      showToast(
        `${user.email} ${result.is_active ? "activated" : "deactivated"}`,
        "success"
      );
    } catch {
      showToast("Failed to toggle user status", "error");
    } finally {
      setToggling(null);
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center text-gray-500">
        Loading users...
      </div>
    );
  }

  if (!hasStoredToken()) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12">
          <Users size={56} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 mb-4">Please log in as admin</p>
          <Link
            href="/login?next=/admin/users"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#4DBE55] text-white rounded-xl text-sm font-medium hover:bg-[#3ea846] transition-colors"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  const ROLE_COLORS: Record<string, string> = {
    ADMIN: "bg-purple-100 text-purple-700",
    SELLER: "bg-blue-100 text-blue-700",
    DRIVER: "bg-orange-100 text-orange-700",
    LANDLORD: "bg-yellow-100 text-yellow-700",
    RESIDENT: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-10 space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-[#4DBE55] hover:text-[#3ea846] font-medium"
      >
        <ArrowLeft size={16} />
        Dashboard
      </Link>

      <h1
        className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight"
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        Manage Users
      </h1>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500">
                <th className="px-5 py-3 font-medium">User</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Joined</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-5 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{user.full_name || "—"}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        ROLE_COLORS[user.role] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {user.role === "ADMIN" && <Shield size={12} />}
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {user.is_active ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                        <CheckCircle size={14} /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-red-500 font-medium">
                        <XCircle size={14} /> Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => handleToggle(user)}
                      disabled={toggling === user.id}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        user.is_active
                          ? "bg-red-50 text-red-600 hover:bg-red-100"
                          : "bg-green-50 text-green-600 hover:bg-green-100"
                      } disabled:opacity-50`}
                    >
                      {toggling === user.id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : user.is_active ? (
                        <ShieldOff size={12} />
                      ) : (
                        <Shield size={12} />
                      )}
                      {user.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
