"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin,
  MapPinCheck,
  Bike,
  Car,
  Zap,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ArrowRight,
  ChevronDown,
  Search,
} from "lucide-react";
import { TransportMapPicker, type MapPoint } from "@/components/transport/TransportMapPicker";
import { LocationSearchInput } from "@/components/transport/LocationSearchInput";
import { transportApi, type FareEstimateOut, type BookingOut, hasStoredToken } from "@/lib/api/transport";
import { formatTaka } from "@/lib/money";
import { useToast } from "@/components/ui/Toast";

const DHAKA_CENTER: MapPoint = { lat: 23.7925, lon: 90.4078 };

type VehicleType = "bike" | "ev" | "car" | "car_xl";

const VEHICLES: Record<VehicleType, { label: string; icon: React.ReactNode; color: string; bg: string; hint: string }> = {
  bike:   { label: "Bike",   icon: <Bike size={24} />,        color: "#4DBE55", bg: "#edf7ee", hint: "Fast & cheap" },
  ev:     { label: "EV",     icon: <Zap size={24} />,         color: "#8B5CF6", bg: "#f3e8ff", hint: "Eco-friendly" },
  car:    { label: "Car",    icon: <Car size={24} />,         color: "#3B82F6", bg: "#eff6ff", hint: "Comfort ride" },
  car_xl: { label: "Car XL", icon: <Car size={24} className="scale-125" />, color: "#F59E0B", bg: "#fffbeb", hint: "Group travel" },
};

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string; icon: React.ReactNode }> = {
  REQUESTED:  { bg: "#fffbeb", text: "#F59E0B", dot: "#F59E0B", icon: <Clock size={14} /> },
  ACCEPTED:   { bg: "#edf7ee", text: "#4DBE55", dot: "#4DBE55", icon: <CheckCircle size={14} /> },
  IN_PROGRESS:{ bg: "#eff6ff", text: "#3B82F6", dot: "#3B82F6", icon: <Loader2 size={14} className="animate-spin" /> },
  COMPLETED:  { bg: "#f3f4f6", text: "#6B7280", dot: "#6B7280", icon: <CheckCircle size={14} /> },
  CANCELLED:  { bg: "#fef2f2", text: "#EF4444", dot: "#EF4444", icon: <XCircle size={14} /> },
};

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  REQUESTED:  ["ACCEPTED", "CANCELLED"],
  ACCEPTED:   ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS:["COMPLETED"],
  COMPLETED:  [],
  CANCELLED:  [],
};

export default function TransportPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [pickup, setPickup] = useState<MapPoint | null>(null);
  const [drop, setDrop] = useState<MapPoint | null>(null);
  const [pickupLabel, setPickupLabel] = useState<string>("");
  const [dropLabel, setDropLabel] = useState<string>("");
  const [focusPoint, setFocusPoint] = useState<MapPoint | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>("car");
  const [fareEstimate, setFareEstimate] = useState<FareEstimateOut | null>(null);
  const [fareLoading, setFareLoading] = useState(false);
  const [bookings, setBookings] = useState<BookingOut[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingAction, setBookingAction] = useState<{ id: number; loading: boolean } | null>(null);
  const [paymentModal, setPaymentModal] = useState<{ isOpen: boolean; bookingId: number; amount: number } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"bkash" | "nagad" | "card" | "cash">("bkash");
  const [paymentLoading, setPaymentLoading] = useState(false);

  const fetchFare = useCallback(async () => {
    if (!pickup || !drop) return;
    setFareLoading(true);
    try {
      const fare = await transportApi.estimate({
        vehicle_type: selectedVehicle,
        pickup_lat: pickup.lat,
        pickup_lon: pickup.lon,
        drop_lat: drop.lat,
        drop_lon: drop.lon,
      });
      setFareEstimate(fare);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to estimate fare", "error");
      setFareEstimate(null);
    } finally {
      setFareLoading(false);
    }
  }, [pickup, drop, selectedVehicle, showToast]);

  useEffect(() => {
    fetchFare();
  }, [fetchFare]);

  const fetchBookings = useCallback(async () => {
    if (!hasStoredToken()) return;
    setBookingsLoading(true);
    try {
      const data = await transportApi.listBookings();
      setBookings(data);
    } catch {
      // ignore
    } finally {
      setBookingsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handlePickupSelect = (loc: { lat: number; lon: number; name: string }) => {
    setPickup({ lat: loc.lat, lon: loc.lon });
    setPickupLabel(loc.name);
    setFocusPoint({ lat: loc.lat, lon: loc.lon });
  };

  const handleDropSelect = (loc: { lat: number; lon: number; name: string }) => {
    setDrop({ lat: loc.lat, lon: loc.lon });
    setDropLabel(loc.name);
    setFocusPoint({ lat: loc.lat, lon: loc.lon });
  };

  const handlePickupClear = () => {
    setPickup(null);
    setPickupLabel("");
    setFocusPoint(null);
  };

  const handleDropClear = () => {
    setDrop(null);
    setDropLabel("");
    setFocusPoint(null);
  };

  const handleBook = async () => {
    if (!pickup || !drop || !fareEstimate || !hasStoredToken()) {
      router.push(`/login?next=${encodeURIComponent("/transport")}`);
      return;
    }
    try {
      const booking = await transportApi.book({
        vehicle_type: selectedVehicle,
        pickup_lat: pickup.lat,
        pickup_lon: pickup.lon,
        pickup_label: pickupLabel || "Pickup",
        drop_lat: drop.lat,
        drop_lon: drop.lon,
        drop_label: dropLabel || "Drop",
      });
      showToast(`Ride booked! ${booking.driver_name ? `Driver: ${booking.driver_name}` : "Waiting for driver..."}`, "success");
      setPickup(null);
      setDrop(null);
      setPickupLabel("");
      setDropLabel("");
      setFocusPoint(null);
      setFareEstimate(null);
      fetchBookings();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Booking failed", "error");
    }
  };

  const handleStatusChange = async (bookingId: number, newStatus: string) => {
    setBookingAction({ id: bookingId, loading: true });
    try {
      await transportApi.updateStatus(bookingId, newStatus);
      showToast(`Status updated to ${newStatus}`, "success");
      fetchBookings();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to update status", "error");
    } finally {
      setBookingAction(null);
    }
  };

  const handlePayment = async () => {
    if (!paymentModal) return;
    setPaymentLoading(true);
    try {
      await transportApi.pay(paymentModal.bookingId, { payment_method: paymentMethod });
      showToast(`Payment successful via ${paymentMethod}`, "success");
      setPaymentModal(null);
      fetchBookings();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Payment failed", "error");
    } finally {
      setPaymentLoading(false);
    }
  };

  const nextStatuses = (status: string) => ALLOWED_TRANSITIONS[status] || [];

  const vehicleOptions: VehicleType[] = ["bike", "ev", "car", "car_xl"];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-10 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "Poppins, sans-serif" }}>
            Book a Ride
          </h1>
          <p className="text-sm text-gray-500 mt-1">Search location, choose vehicle, get instant fare</p>
        </div>
        {hasStoredToken() && (
          <Link
            href="/transport"
            className="text-sm text-[#4DBE55] hover:underline hidden md:inline-flex items-center gap-1"
          >
            Refresh Rides <ArrowRight size={14} />
          </Link>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Location Search + Map + Vehicle Selector + Fare */}
        <div className="space-y-4">
          {/* Location Search Bars */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
            <LocationSearchInput
              label="Pickup location"
              value={pickup ? { ...pickup, name: pickupLabel, area: "" } : null}
              onSelect={handlePickupSelect}
              onClear={handlePickupClear}
              accentColor="#4DBE55"
              placeholder="Search pickup (e.g., Gulshan, Banani...)"
            />
            <LocationSearchInput
              label="Destination"
              value={drop ? { ...drop, name: dropLabel, area: "" } : null}
              onSelect={handleDropSelect}
              onClear={handleDropClear}
              accentColor="#E23A55"
              placeholder="Search destination (e.g., Dhanmondi, Mirpur...)"
            />
          </div>

          {/* Map */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <TransportMapPicker
              pickup={pickup}
              drop={drop}
              selecting="pickup"
              onSelect={() => {}}
              focus={focusPoint}
            />
          </div>

          {/* Vehicle Selector */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-900 mb-3" style={{ fontFamily: "Poppins, sans-serif" }}>
              Choose Vehicle
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {vehicleOptions.map((v) => {
                const { label, icon, color, bg, hint } = VEHICLES[v];
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setSelectedVehicle(v)}
                    className={`relative p-4 rounded-xl border-2 transition-all text-center ${
                      selectedVehicle === v
                        ? `border-2 bg-white shadow-md`
                        : "border-gray-100 hover:border-gray-300"
                    }`}
                    style={{
                      borderColor: selectedVehicle === v ? color : "transparent",
                      background: selectedVehicle === v ? bg : "transparent",
                    }}
                  >
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2" style={{ background: selectedVehicle === v ? color : bg }}>
                      {icon}
                    </div>
                    <span className="font-medium text-sm" style={{ color: selectedVehicle === v ? color : "#374151" }}>
                      {label}
                    </span>
                    <span className="block text-xs mt-1" style={{ color: selectedVehicle === v ? color : "#9CA3AF" }}>
                      {hint}
                    </span>
                    {selectedVehicle === v && (
                      <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs" style={{ background: color }}>
                        ✓
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fare Estimate Card */}
          <div className={`bg-white rounded-2xl border border-gray-100 p-4 ${fareLoading ? "opacity-75" : ""}`}>
            <h3 className="font-semibold text-gray-900 mb-3" style={{ fontFamily: "Poppins, sans-serif" }}>
              Fare Estimate
            </h3>
            {fareLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 size={24} className="animate-spin text-[#4DBE55]" />
              </div>
            ) : fareEstimate ? (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Distance</span>
                  <span className="font-medium">{fareEstimate.distance_km.toFixed(1)} km</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Base Fare</span>
                  <span className="font-medium">{formatTaka(fareEstimate.base_fare)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Distance Cost</span>
                  <span className="font-medium">{formatTaka(fareEstimate.distance_cost)}</span>
                </div>
                <div className="border-t border-gray-100 pt-2 flex justify-between text-lg font-bold" style={{ fontFamily: "Poppins, sans-serif" }}>
                  <span>Total</span>
                  <span style={{ color: "#4DBE55" }}>{formatTaka(fareEstimate.total_fare)}</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Set pickup & drop to see fare</p>
            )}
          </div>

          {/* Book Button */}
          <button
            type="button"
            onClick={handleBook}
            disabled={!fareEstimate || !hasStoredToken()}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${
              hasStoredToken()
                ? fareEstimate
                  ? "bg-[#4DBE55] text-white hover:bg-[#3ea846]"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-[#4DBE55] text-white hover:bg-[#3ea846]"
            }`}
          >
            {hasStoredToken() ? (fareEstimate ? "Book Ride" : "Set locations first") : "Log In to Book"}
          </button>
          {!hasStoredToken() && (
            <p className="text-center text-xs text-gray-500 mt-2">
              Redirects to login with return to /transport
            </p>
          )}
        </div>

        {/* Right: My Rides */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900" style={{ fontFamily: "Poppins, sans-serif" }}>
              My Rides
            </h3>
            {hasStoredToken() && !bookingsLoading && (
              <button
                type="button"
                onClick={fetchBookings}
                className="text-sm text-[#4DBE55] hover:underline flex items-center gap-1"
              >
                Refresh <ChevronDown size={14} />
              </button>
            )}
          </div>

          {bookingsLoading ? (
            <div className="p-8 text-center">
              <Loader2 size={24} className="animate-spin text-[#4DBE55] mx-auto" />
            </div>
          ) : !hasStoredToken() ? (
            <div className="p-8 text-center text-gray-500">
              <p>Log in to see your rides</p>
              <Link href="/login?next=/transport" className="text-[#4DBE55] hover:underline mt-2 inline-block">
                Log In
              </Link>
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No rides yet</p>
              <p className="text-sm mt-1">Book your first ride above!</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {bookings.map((b) => {
                const style = STATUS_STYLES[b.status] || STATUS_STYLES.REQUESTED;
                const actions = nextStatuses(b.status);
                const isActionLoading = bookingAction?.id === b.id && bookingAction.loading;
                return (
                  <li key={b.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-gray-400">#{b.id}</span>
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium"
                            style={{ background: style.bg, color: style.text }}
                          >
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: style.dot, display: "inline-block" }} />
                            {b.status.replace("_", " ")}
                          </span>
                        </div>
                        <p className="font-medium text-gray-900 truncate">{b.vehicle_type.toUpperCase()}</p>
                        <p className="text-sm text-gray-500">
                          {formatTaka(b.estimated_fare)} • {b.distance_km.toFixed(1)} km
                        </p>
                        {b.pickup_label && b.drop_label && (
                          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                            <MapPin size={10} />
                            {b.pickup_label} → {b.drop_label}
                          </p>
                        )}
                        {b.driver_name && (
                          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                            <Car size={12} />
                            {b.driver_name} • {b.vehicle_number}
                          </p>
                        )}
                        {/* Payment status badge */}
                        {b.status === "COMPLETED" && (
                          <div className="mt-2 flex items-center gap-2">
                            {b.payment_status === "PAID" ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                <CheckCircle size={12} />
                                PAID {b.transaction_ref && `(${b.transaction_ref})`}
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setPaymentModal({ isOpen: true, bookingId: b.id, amount: b.estimated_fare })}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-[#4DBE55] text-white hover:bg-[#3ea846] transition-colors"
                              >
                                <Search size={12} />
                                Pay ৳{formatTaka(b.estimated_fare)}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      {actions.length > 0 && (
                        <div className="flex flex-col gap-1 ml-2">
                          {actions.map((action) => (
                            <button
                              key={action}
                              type="button"
                              onClick={() => handleStatusChange(b.id, action)}
                              disabled={isActionLoading}
                              className="px-3 py-1.5 text-xs font-medium rounded-lg text-white transition-colors whitespace-nowrap"
                              style={{ background: style.dot }}
                            >
                              {isActionLoading ? <Loader2 size={12} className="animate-spin" /> : action.replace("_", " ")}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {paymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900" style={{ fontFamily: "Poppins, sans-serif" }}>
              Pay for Ride #{paymentModal.bookingId}
            </h3>
            <p className="text-gray-600">Amount: <span className="font-bold text-[#4DBE55]">{formatTaka(paymentModal.amount)}</span></p>
            <div className="space-y-2">
              {(["bkash", "nagad", "card", "cash"] as const).map((m) => (
                <label key={m} className="flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors"
                  style={{ borderColor: paymentMethod === m ? "#4DBE55" : "#E5E7EB", background: paymentMethod === m ? "#F0FDF4" : "white" }}>
                <input type="radio" name="method" value={m} checked={paymentMethod === m} onChange={() => setPaymentMethod(m)} className="sr-only" />
                <span className="font-medium text-gray-900 capitalize">{m}</span>
              </label>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setPaymentModal(null)} disabled={paymentLoading} className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button onClick={handlePayment} disabled={paymentLoading} className="flex-1 py-2.5 rounded-xl bg-[#4DBE55] text-white font-medium hover:bg-[#3ea846] transition-colors disabled:opacity-50">
              {paymentLoading ? <Loader2 size={18} className="animate-spin mx-auto" /> : `Pay ৳${formatTaka(paymentModal.amount)}`}
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}