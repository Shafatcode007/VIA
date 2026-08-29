"use client";

// NECESSITY: PropertyCard displays a single property listing in the browse grid
// with the occupancy category badge (Family/Bachelor + sub-type).
// LOGIC: Shows key property details with a colored badge indicating the category.
// Bachelor properties show an amber badge; Family properties show a green badge.
// EDGE-CASE: Handles missing images gracefully with a placeholder.

import Link from "next/link";
import { MapPin, BedDouble, Bath, Maximize } from "lucide-react";

interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  area?: number | null;
  images: string;
  occupancyCategory: string;
  bachelorType?: string | null;
}

// NECESSITY: Maps bachelorType enum values to human-readable labels.
// LOGIC: Converts FULL_ROOM → "Full Room", PORTION → "Portion", SEAT → "Seat".
const bachelorTypeLabels: Record<string, string> = {
  FULL_ROOM: "Full Room",
  PORTION: "Portion",
  SEAT: "Seat",
};

export default function PropertyCard({ property }: { property: Property }) {
  // NECESSITY: Parse the JSON string array of images stored in SQLite.
  // LOGIC: Images are stored as a JSON string; we parse them to get the array.
  let imageArray: string[] = [];
  try {
    imageArray = JSON.parse(property.images);
  } catch {
    imageArray = [];
  }

  // NECESSITY: Format price as BDT currency for display.
  // LOGIC: Uses Intl.NumberFormat for consistent currency formatting.
  const formattedPrice = new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(property.price);

  // NECESSITY: Generate the badge text and color based on occupancy category.
  // LOGIC: Family shows green badge. Bachelor shows amber badge with sub-type label.
  const isBachelor = property.occupancyCategory === "BACHELOR";
  const badgeText = isBachelor
    ? `Bachelor - ${bachelorTypeLabels[property.bachelorType || ""] || property.bachelorType}`
    : "Family";
  const badgeClass = isBachelor
    ? "bg-amber-500 text-white"
    : "bg-[#4DBE55] text-white";

  return (
    <Link
      href={`/properties/${property.id}`}
      className="block bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-100"
    >
      {/* Property Image */}
      <div className="relative h-48 w-full bg-gray-100">
        {imageArray.length > 0 ? (
          <img
            src={imageArray[0]}
            alt={property.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}

        {/* Category Badge */}
        {/* NECESSITY: Prominent visual indicator of the property's occupancy category.
            LOGIC: Positioned top-left for immediate visibility. Color-coded for quick
            scanning — green for Family, amber for Bachelor. */}
        <div
          className={`absolute top-3 left-3 ${badgeClass} px-2.5 py-1 rounded-lg text-xs font-semibold`}
        >
          {badgeText}
        </div>
      </div>

      {/* Property Details */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
          {property.title}
        </h3>

        <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
          <MapPin size={14} />
          <span>
            {property.location}, {property.city}
          </span>
        </div>

        {/* Features */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <BedDouble size={14} />
            <span>{property.bedrooms} Beds</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath size={14} />
            <span>{property.bathrooms} Baths</span>
          </div>
          {property.area && (
            <div className="flex items-center gap-1">
              <Maximize size={14} />
              <span>{property.area} sqft</span>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="pt-3 border-t border-gray-100">
          <span className="text-xl font-bold text-[#4DBE55]">
            {formattedPrice}
          </span>
          <span className="text-sm text-gray-500">/month</span>
        </div>
      </div>
    </Link>
  );
}
