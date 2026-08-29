"use client";

import { useCallback, useEffect, useState } from "react";

import { DriverProfileForm } from "@/components/driver/DriverProfileForm";
import { useNotifications } from "@/hooks/useNotifications";
import { BookingOut, DriverOut, transportApi } from "@/lib/api/transport";
import { getStoredToken } from "@/lib/auth/session";
import { useToast } from "@/components/ui/Toast";
import { formatTaka, toNumber } from "@/lib/money";
import { toErrorMessage } from "@/lib/utils/apiError";

const STATUS_TONE: Record<string, string> = {
  REQUESTED: "bg-amber-50 text-amber-600",
  ACCEPTED: "bg-[#edf7ee] text-[#4DBE55]",
  IN_PROGRESS: "bg-blue-50 text-blue-600",
  COMPLETED: "bg-gray-100 text-gray-600",
  CANCELLED: "bg-red-50 text-red-600",
};

/**
 * Driver Panel: fetch-then-branch.
 * 404 on profile -> creation form. Existing profile -> dashboard with
 * Incoming Requests (Accept), Active Rides (Start/Complete), Earnings.
 */
export default function DriverPage() {
  const { showToast } = useToast();
  const [profile, setProfile] = useState<DriverOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<BookingOut[]>([]);
  const [rides, setRides] = useState<BookingOut[]>([]);
  const [busyId, setBusyId] = useState<number | null>(null);

  useNotifications(Boolean(getStoredToken()));

  const loadProfile = useCallback(async () => {
    try {
      setProfile(await transportApi.getProfile());
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (!/not found/i.test(message)) showToast(toErrorMessage(error), "error");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const loadWork = useCallback(async () => {
    try {
      const [pending, mine] = await Promise.all([transportApi.listRequests(), transportApi.listDriverBookings()]);
      setRequests(pending);
      setRides(mine);
    } catch {
      // silent polling failures by design
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (!profile) return;
    loadWork();
    const timer = setInterval(loadWork, 5000);
    return () => clearInterval(timer);
  }, [profile, loadWork]);

  const accept = async (id: number) => {
    setBusyId(id);
    try {
      await transportApi.accept(id);
      showToast("Trip accepted — head to pickup", "success");
      await loadWork();
    } catch (error) {
      showToast(toErrorMessage(error), "error");
    } finally {
      setBusyId(null);
    }
  };

  const advance = async (ride: BookingOut, next: string) => {
    setBusyId(ride.id);
    try {
      await transportApi.updateStatus(ride.id, next);
      showToast(next === "IN_PROGRESS" ? "Trip started" : "Trip completed — rider notified to pay", "success");
      await loadWork();
    } catch (error) {
      showToast(toErrorMessage(error), "error");
    } finally {
      setBusyId(null);
    }
  };

  const toggleAvailability = async () => {
    try {
      const updated = await transportApi.toggleAvailability({ is_available: !profile?.is_available });
      setProfile(updated);
      showToast(updated.is_available ? "You are Available for requests" : "You are Offline", "success");
    } catch (error) {
      showToast(toErrorMessage(error), "error");
    }
  };

  if (loading) {
    return <main className="p-10 text-center text-gray-500">Loading driver panel…</main>;
  }

  if (!profile) {
    return (
      <main className="mx-auto max-w-xl p-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Create Driver Profile</h1>
          <p className="mt-1 mb-6 text-sm text-gray-500">Fill in your details to start accepting rides</p>
          <DriverProfileForm onCreated={loadProfile} />
        </div>
      </main>
    );
  }

  const earnings = rides.filter((ride) => ride.payment_status === "PAID").reduce((sum, ride) => sum + toNumber(ride.estimated_fare), 0);
  const active = rides.filter((ride) => ride.status === "ACCEPTED" || ride.status === "IN_PROGRESS");

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Driver Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            {profile.name} · {profile.vehicle_type.toUpperCase()} · {profile.vehicle_number}
          </p>
        </div>
        <button
          type="button"
          onClick={toggleAvailability}
          className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
            profile.is_available ? "bg-[#edf7ee] text-[#4DBE55]" : "bg-red-50 text-red-600"
          }`}
        >
          {profile.is_available ? "Available — tap to go Offline" : "Offline — tap to go Available"}
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">Incoming Requests</h2>
          {requests.length === 0 ? (
            <p className="mt-3 text-sm text-gray-500">No open requests for {profile.vehicle_type.toUpperCase()} right now. New requests appear automatically.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {requests.map((request) => (
                <div key={request.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 p-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      #{request.id} · {request.vehicle_type.toUpperCase()} · {request.distance_km} km · {formatTaka(request.estimated_fare)}
                    </p>
                    <p className="text-xs text-gray-500">Pickup → Drop: {request.pickup_label ?? "map point"} → {request.drop_label ?? "map point"}</p>
                  </div>
                  <button
                    type="button"
                    disabled={busyId === request.id}
                    onClick={() => accept(request.id)}
                    className="rounded-lg bg-[#4DBE55] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3da447] disabled:opacity-60"
                  >
                    {busyId === request.id ? "Accepting…" : "Accept Trip"}
                  </button>
                </div>
              ))}
            </div>
          )}

          <h2 className="mt-8 text-lg font-bold text-gray-900">My Active Rides</h2>
          {active.length === 0 ? (
            <p className="mt-3 text-sm text-gray-500">No active rides. Accept a request to get started.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {active.map((ride) => (
                <div key={ride.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 p-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">#{ride.id} · {formatTaka(ride.estimated_fare)} · {ride.distance_km} km</p>
                    <span className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-semibold ${STATUS_TONE[ride.status] ?? "bg-gray-100 text-gray-600"}`}>{ride.status}</span>
                  </div>
                  {ride.status === "ACCEPTED" && (
                    <button type="button" disabled={busyId === ride.id} onClick={() => advance(ride, "IN_PROGRESS")} className="rounded-lg bg-[#4DBE55] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3da447] disabled:opacity-60">
                      Start Trip
                    </button>
                  )}
                  {ride.status === "IN_PROGRESS" && (
                    <button type="button" disabled={busyId === ride.id} onClick={() => advance(ride, "COMPLETED")} className="rounded-lg bg-[#4DBE55] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3da447] disabled:opacity-60">
                      Complete Trip
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">Earnings</h2>
            <p className="mt-2 text-3xl font-bold text-[#4DBE55]">{formatTaka(earnings)}</p>
            <p className="mt-1 text-xs text-gray-500">{rides.filter((ride) => ride.payment_status === "PAID").length} paid ride(s) · {rides.length} total</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">Ride History</h2>
            {rides.length === 0 ? (
              <p className="mt-3 text-sm text-gray-500">Completed rides will appear here.</p>
            ) : (
              <div className="mt-3 space-y-2">
                {rides.slice(0, 6).map((ride) => (
                  <div key={ride.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">#{ride.id}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_TONE[ride.status] ?? "bg-gray-100 text-gray-600"}`}>{ride.status}</span>
                    <span className="font-semibold text-gray-900">{formatTaka(ride.estimated_fare)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}