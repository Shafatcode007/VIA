"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPropertyById } from "@/app/actions/properties";
import { getStoredUser, type SessionUser } from "@/lib/auth/session";
import { notFound } from "next/navigation";
import BookingForm from "@/components/properties/BookingForm";
import {
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  Users,
  User,
} from "lucide-react";

const bachelorTypeLabels: Record<string, string> = {
  FULL_ROOM: "Full Room",
  PORTION: "Portion",
  SEAT: "Seat",
};

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  address: string;
  city: string;
  occupancyCategory: string;
  bachelorType: string | null;
  bedrooms: number;
  bathrooms: number;
  totalUnits: number;
  area: number | null;
  furnished: boolean;
  amenities: string;
  images: string;
  status: string;
  landlordId: string;
  landlord: { name: string | null; email: string | null };
  bookings: unknown[];
}

export default function PropertyDetailPageClient({
  propertyId,
}: {
  propertyId: string;
}) {
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  useEffect(() => {
    const stored = getStoredUser();
    setUser(stored);

    getPropertyById(propertyId).then((result) => {
      if (!result.success || !result.property) {
        setNotFoundState(true);
      } else {
        setProperty(result.property as Property);
      }
      setLoading(false);
    });
  }, [propertyId]);

  if (notFoundState) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Property Not Found</h1>
          <p className="text-gray-500">The property you are looking for does not exist.</p>
        </div>
      </div>
    );
  }

  if (loading || !property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-[#4DBE55] border-t-transparent rounded-full" />
      </div>
    );
  }

  let imageArray: string[] = [];
  let amenitiesArray: string[] = [];
  try {
    imageArray = JSON.parse(property.images);
  } catch {
    imageArray = [];
  }
  try {
    amenitiesArray = JSON.parse(property.amenities);
  } catch {
    amenitiesArray = [];
  }

  const formattedPrice = new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(property.price);

  const isBachelor = property.occupancyCategory === "BACHELOR";
  const categoryLabel = isBachelor ? "Bachelor" : "Family";
  const bachelorLabel = isBachelor
    ? bachelorTypeLabels[property.bachelorType || ""] || property.bachelorType
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {imageArray.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {imageArray.map((image, index) => (
              <div
                key={index}
                className="relative h-64 md:h-96 rounded-xl overflow-hidden bg-gray-100"
              >
                <img
                  src={image}
                  alt={`${property.title} - Image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h1
              className="text-3xl font-bold text-gray-900 mb-2"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              {property.title}
            </h1>

            <div className="flex flex-wrap items-center gap-2 text-gray-500 mb-4">
              <MapPin size={16} />
              <span>
                {property.location}, {property.city}
              </span>
              <span className="mx-1">·</span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                  isBachelor
                    ? "bg-amber-100 text-amber-700"
                    : "bg-[#edf7ee] text-[#4DBE55]"
                }`}
              >
                {isBachelor ? <User size={12} /> : <Users size={12} />}
                {categoryLabel}
                {bachelorLabel && ` - ${bachelorLabel}`}
              </span>
            </div>

            <div className="text-3xl font-bold text-[#4DBE55] mb-6">
              {formattedPrice}
              <span className="text-base text-gray-500 font-normal">
                /month
              </span>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
              <h2
                className="text-xl font-semibold text-gray-900 mb-4"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Property Details
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <BedDouble size={18} className="text-[#4DBE55]" />
                  <div>
                    <p className="text-xs text-gray-500">Bedrooms</p>
                    <p className="font-semibold text-gray-900">
                      {property.bedrooms}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Bath size={18} className="text-[#4DBE55]" />
                  <div>
                    <p className="text-xs text-gray-500">Bathrooms</p>
                    <p className="font-semibold text-gray-900">
                      {property.bathrooms}
                    </p>
                  </div>
                </div>
                {property.area && (
                  <div className="flex items-center gap-2">
                    <Maximize size={18} className="text-[#4DBE55]" />
                    <div>
                      <p className="text-xs text-gray-500">Area</p>
                      <p className="font-semibold text-gray-900">
                        {property.area} sqft
                      </p>
                    </div>
                  </div>
                )}
                {property.totalUnits > 1 && (
                  <div className="flex items-center gap-2">
                    <Users size={18} className="text-[#4DBE55]" />
                    <div>
                      <p className="text-xs text-gray-500">Total Units</p>
                      <p className="font-semibold text-gray-900">
                        {property.totalUnits}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
              <h2
                className="text-xl font-semibold text-gray-900 mb-4"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Description
              </h2>
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                {property.description}
              </p>
            </div>

            {amenitiesArray.length > 0 && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
                <h2
                  className="text-xl font-semibold text-gray-900 mb-4"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Amenities
                </h2>
                <div className="flex flex-wrap gap-2">
                  {amenitiesArray.map((amenity, index) => (
                    <span
                      key={index}
                      className="bg-[#edf7ee] text-[#4DBE55] px-3 py-1.5 rounded-lg text-sm font-medium"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2
                className="text-xl font-semibold text-gray-900 mb-4"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Landlord
              </h2>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#4DBE55] rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {property.landlord.name?.[0] ||
                    (property.landlord.email?.[0]?.toUpperCase() || "L")}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {property.landlord.name || "Landlord"}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {property.landlord.email}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-24">
              {user ? (
                <BookingForm
                  propertyId={property.id}
                  propertyPrice={property.price}
                />
              ) : (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <p className="text-gray-600 mb-4 text-center">
                    Login to book this property
                  </p>
                  <a
                    href="/login"
                    className="block w-full bg-[#4DBE55] text-white text-center py-3 rounded-lg font-medium hover:bg-[#3ea846] transition-colors"
                  >
                    Login to Book
                  </a>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
