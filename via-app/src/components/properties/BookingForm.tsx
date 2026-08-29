"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBooking } from "@/app/actions/bookings";
import { getStoredUser } from "@/lib/auth/session";
import { Loader2 } from "lucide-react";

export default function BookingForm({
  propertyId,
  propertyPrice,
}: {
  propertyId: string;
  propertyPrice: number;
}) {
  const router = useRouter();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const days =
    startDate && endDate
      ? Math.ceil(
          (new Date(endDate).getTime() - new Date(startDate).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;
  const totalPrice = days > 0 ? propertyPrice * days : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const user = getStoredUser();
    if (!user) {
      setError("Please log in to book this property");
      return;
    }

    if (!startDate || !endDate) {
      setError("Please select both start and end dates");
      return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
      setError("End date must be after start date");
      return;
    }

    setIsLoading(true);
    try {
      const result = await createBooking(String(user.id), propertyId, {
        startDate,
        endDate,
        message: message || undefined,
      });

      if (result.success) {
        setSuccess(true);
        setStartDate("");
        setEndDate("");
        setMessage("");
        router.refresh();
      } else {
        setError(result.error || "Failed to create booking");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">✓</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Booking Request Sent!
          </h3>
          <p className="text-gray-500 text-sm mb-4">
            The landlord will review your request shortly.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="text-[#4DBE55] text-sm font-medium hover:underline"
          >
            Book Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Book This Property
      </h3>

      <div className="bg-gray-50 p-3 rounded-lg mb-4">
        <span className="text-2xl font-bold text-[#4DBE55]">
          {new Intl.NumberFormat("en-BD", {
            style: "currency",
            currency: "BDT",
            maximumFractionDigits: 0,
          }).format(propertyPrice)}
        </span>
        <span className="text-gray-500 text-sm">/month</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Move-in Date
          </label>
          <input
            type="date"
            value={startDate}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4DBE55] focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Move-out Date
          </label>
          <input
            type="date"
            value={endDate}
            min={startDate || new Date().toISOString().split("T")[0]}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4DBE55] focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Message (optional)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="Tell the landlord about yourself..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4DBE55] focus:border-transparent outline-none resize-none"
          />
        </div>

        {days > 0 && (
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                {days} day{days !== 1 ? "s" : ""} ×{" "}
                {new Intl.NumberFormat("en-BD", {
                  style: "currency",
                  currency: "BDT",
                  maximumFractionDigits: 0,
                }).format(propertyPrice)}
              </span>
              <span className="font-semibold text-[#4DBE55]">
                {new Intl.NumberFormat("en-BD", {
                  style: "currency",
                  currency: "BDT",
                  maximumFractionDigits: 0,
                }).format(totalPrice)}
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#4DBE55] text-white py-3 rounded-lg font-medium hover:bg-[#3ea846] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading && <Loader2 size={16} className="animate-spin" />}
          {isLoading ? "Submitting..." : "Request Booking"}
        </button>
      </form>
    </div>
  );
}
