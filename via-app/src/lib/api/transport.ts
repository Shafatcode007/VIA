/**
 * Transport API client.
 * Thin layer over backend transport endpoints:
 * fare-estimate -> book -> listBookings -> updateStatus -> pay.
 * Auth-aware via shared request() helper.
 */
import { request, hasStoredToken } from "./grocery";

export { hasStoredToken };

export interface MapPoint {
  lat: number;
  lon: number;
}

export interface FareEstimateRequest {
  vehicle_type: string;
  pickup_lat: number;
  pickup_lon: number;
  drop_lat: number;
  drop_lon: number;
}

export interface FareEstimateOut {
  vehicle_type: string;
  base_fare: number;
  distance_km: number;
  distance_cost: number;
  total_fare: number;
}

export interface BookingCreate extends FareEstimateRequest {
  pickup_label?: string;
  drop_label?: string;
}

export interface BookingOut {
  id: number;
  vehicle_type: string;
  pickup_label: string | null;
  drop_label: string | null;
  distance_km: number;
  estimated_fare: number;
  status: string;
  payment_status: string;
  payment_method: string | null;
  transaction_ref: string | null;
  paid_at: string | null;
  driver_name: string | null;
  vehicle_number: string | null;
  created_at: string;
}

export interface PayRequest {
  payment_method: "bkash" | "nagad" | "card" | "cash";
}

export interface DriverProfileCreate {
  name: string;
  vehicle_type: string;
  vehicle_number: string;
}

export interface DriverProfileOut {
  id: number;
  name: string;
  phone: string | null;
  vehicle_type: string;
  vehicle_number: string;
  is_available: boolean;
  rating: number;
  created_at: string;
}

export type DriverOut = DriverProfileOut;

export interface AvailabilityUpdate {
  is_available: boolean;
}

export const transportApi = {
  estimate: (payload: FareEstimateRequest) =>
    request<FareEstimateOut>("/transport/fare-estimate", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  book: (payload: BookingCreate) =>
    request<BookingOut>("/transport/bookings", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  listBookings: () =>
    request<BookingOut[]>("/transport/bookings"),

  updateStatus: (bookingId: number, status: string) =>
    request<BookingOut>(`/transport/bookings/${bookingId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  pay: (bookingId: number, payload: PayRequest) =>
    request<BookingOut>(`/transport/bookings/${bookingId}/pay`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  createDriverProfile: (payload: DriverProfileCreate) =>
    request<DriverProfileOut>("/transport/driver/profile", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getProfile: () =>
    request<DriverProfileOut>("/transport/driver/profile"),

  listDriverBookings: () =>
    request<BookingOut[]>("/transport/driver/bookings"),

  listRequests: () =>
    request<BookingOut[]>("/transport/driver/requests"),

  accept: (bookingId: number) =>
    request<BookingOut>(`/transport/driver/bookings/${bookingId}/accept`, {
      method: "POST",
    }),

  toggleAvailability: (payload: AvailabilityUpdate) =>
    request<DriverProfileOut>("/transport/driver/availability", {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
};