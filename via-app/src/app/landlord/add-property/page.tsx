"use client";

// NECESSITY: Landlord add-property form with the critical Family/Bachelor conditional UI.
// LOGIC: Uses useState for occupancyCategory to dynamically show/hide bachelorType
// fields. When occupancyCategory is "BACHELOR", the bachelorType selector appears.
// When switching to "FAMILY", bachelorType is automatically cleared to prevent
// invalid data from reaching the server action.
// EDGE-CASE: The onChange handler for occupancyCategory resets bachelorType to null,
// preventing the bug where a stale bachelorType persists after category switch.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProperty } from "@/app/actions/properties";
import { getStoredUser } from "@/lib/auth/session";
import { Loader2, Plus, X, Users, User } from "lucide-react";

// NECESSITY: Amenity options for the checkbox grid.
const AMENITY_OPTIONS = [
  "WiFi",
  "Parking",
  "AC",
  "Furnished",
  "Gym",
  "Swimming Pool",
  "Security",
  "Elevator",
  "Gas",
  "Water Supply",
  "Electricity Backup",
  "Clean Water",
];

export default function AddPropertyPage() {
  const router = useRouter();

  // ─── FORM STATE ───────────────────────────────────────────────────────────
  // NECESSITY: occupancyCategory drives the entire form's conditional logic.
  // LOGIC: Defaults to "FAMILY" so bachelorType fields are hidden on load.
  const [occupancyCategory, setOccupancyCategory] = useState<string>("FAMILY");
  const [bachelorType, setBachelorType] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Dhaka");
  const [bedrooms, setBedrooms] = useState("1");
  const [bathrooms, setBathrooms] = useState("1");
  const [totalUnits, setTotalUnits] = useState("1");
  const [area, setArea] = useState("");
  const [furnished, setFurnished] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([""]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── OCCUPANCY CATEGORY CHANGE HANDLER ────────────────────────────────────
  // NECESSITY: This is the critical handler that fixes the "dropdown doesn't
  // disappear" bug. When switching from BACHELOR to FAMILY, bachelorType MUST
  // be cleared, otherwise the server-side Zod validation will reject it.
  // LOGIC: Sets occupancyCategory and resets bachelorType in one atomic update.
  // EDGE-CASE: Without clearing bachelorType, a user could select "Bachelor - Seat",
  // switch to "Family", and the hidden field would still contain "SEAT", causing
  // a Zod error: "Family properties cannot have a bachelor type".
  const handleCategoryChange = (newCategory: string) => {
    setOccupancyCategory(newCategory);
    // CRITICAL: Clear bachelorType when switching away from BACHELOR
    if (newCategory !== "BACHELOR") {
      setBachelorType("");
    }
  };

  // ─── AMENITY TOGGLE ───────────────────────────────────────────────────────
  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  // ─── IMAGE URL MANAGEMENT ─────────────────────────────────────────────────
  const addImageUrl = () => setImageUrls((prev) => [...prev, ""]);
  const removeImageUrl = (index: number) =>
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  const updateImageUrl = (index: number, value: string) =>
    setImageUrls((prev) => prev.map((url, i) => (i === index ? value : url)));

  // ─── FORM SUBMISSION ──────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // CLIENT-SIDE VALIDATION: Bachelor must have sub-type before calling server.
    if (occupancyCategory === "BACHELOR" && !bachelorType) {
      setError("Please select a bachelor type (Full Room, Portion, or Seat)");
      return;
    }

    const validImages = imageUrls.filter((url) => url.trim() !== "");
    if (validImages.length === 0) {
      setError("Please add at least one image URL");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("location", location);
      formData.append("address", address);
      formData.append("city", city);
      formData.append("occupancyCategory", occupancyCategory);
      // LOGIC: Only append bachelorType if category is BACHELOR.
      if (occupancyCategory === "BACHELOR") {
        formData.append("bachelorType", bachelorType);
      }
      formData.append("bedrooms", bedrooms);
      formData.append("bathrooms", bathrooms);
      formData.append("totalUnits", totalUnits);
      if (area) formData.append("area", area);
      formData.append("furnished", String(furnished));
      formData.append("amenities", JSON.stringify(selectedAmenities));
      formData.append("images", JSON.stringify(validImages));

      const user = getStoredUser();
      if (!user) {
        setError("Please log in to create a property");
        setIsLoading(false);
        return;
      }

      const result = await createProperty(String(user.id), formData);

      if (result.success) {
        router.push(`/properties/${result.propertyId}`);
      } else {
        setError(result.error || "Failed to create property");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4DBE55] focus:border-transparent outline-none text-gray-900 placeholder:text-gray-400";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Page Header */}
        <div className="mb-8">
          <h1
            className="text-3xl font-bold text-gray-900"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Add New Property
          </h1>
          <p className="text-gray-500 mt-1">
            List your property on the VIA platform
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* OCCUPANCY CATEGORY SECTION (The Critical Dynamic Part)            */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* NECESSITY: This section implements the core Family/Bachelor logic.
              The user MUST select a category first, which determines whether
              the bachelorType sub-selector appears. */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2
              className="text-lg font-semibold text-gray-900 mb-4"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Property Category
            </h2>

            {/* Category Selection Buttons */}
            <div className="flex gap-4 mb-4">
              <button
                type="button"
                onClick={() => handleCategoryChange("FAMILY")}
                className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 ${
                  occupancyCategory === "FAMILY"
                    ? "border-[#4DBE55] bg-[#edf7ee] text-[#4DBE55]"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                <Users size={24} />
                <div className="text-left">
                  <p className="font-semibold">Family</p>
                  <p className="text-xs opacity-70">Full property for families</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleCategoryChange("BACHELOR")}
                className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 ${
                  occupancyCategory === "BACHELOR"
                    ? "border-amber-500 bg-amber-50 text-amber-600"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                <User size={24} />
                <div className="text-left">
                  <p className="font-semibold">Bachelor</p>
                  <p className="text-xs opacity-70">For individuals or groups</p>
                </div>
              </button>
            </div>

            {/* ─── BACHELOR SUB-TYPE (Conditionally Rendered) ─── */}
            {/* NECESSITY: This entire block is ONLY rendered when occupancyCategory
                is "BACHELOR". This is the dynamic UI logic the faculty requires. */}
            {/* EDGE-CASE: If this section were always visible, users could submit
                invalid combinations. The conditional render prevents this. */}
            {occupancyCategory === "BACHELOR" && (
              <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200 animate-in slide-in-from-top-2 duration-200">
                <label className="block text-sm font-medium text-amber-800 mb-3">
                  Bachelor Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "FULL_ROOM", label: "Full Room", desc: "Entire room for one person" },
                    { value: "PORTION", label: "Portion", desc: "Part of a shared space" },
                    { value: "SEAT", label: "Seat", desc: "Shared seat/bed space" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setBachelorType(option.value)}
                      className={`p-3 rounded-lg border-2 text-center transition-all duration-200 ${
                        bachelorType === option.value
                          ? "border-amber-500 bg-amber-100 text-amber-700"
                          : "border-gray-200 bg-white text-gray-600 hover:border-amber-300"
                      }`}
                    >
                      <p className="font-semibold text-sm">{option.label}</p>
                      <p className="text-xs opacity-70 mt-0.5">{option.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ─── BASIC INFO ─────────────────────────────────────────────────── */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2
              className="text-lg font-semibold text-gray-900 mb-4"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Basic Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Spacious 2BR apartment in Banani"
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  required
                  placeholder="Describe your property in detail..."
                  className={`${inputClass} resize-none`}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (BDT/month) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    min="1"
                    required
                    placeholder="e.g., 15000"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Area (sq ft)
                  </label>
                  <input
                    type="number"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    min="1"
                    placeholder="e.g., 1200"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ─── LOCATION ───────────────────────────────────────────────────── */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2
              className="text-lg font-semibold text-gray-900 mb-4"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Location
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Area / Neighborhood <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  placeholder="e.g., Banani, Gulshan, Dhanmondi"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  placeholder="House/Road/Block details"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* ─── PROPERTY DETAILS ───────────────────────────────────────────── */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2
              className="text-lg font-semibold text-gray-900 mb-4"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Property Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bedrooms
                </label>
                <input
                  type="number"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  min="0"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bathrooms
                </label>
                <input
                  type="number"
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  min="0"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Units
                </label>
                <input
                  type="number"
                  value={totalUnits}
                  onChange={(e) => setTotalUnits(e.target.value)}
                  min="1"
                  className={inputClass}
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="furnished"
                  checked={furnished}
                  onChange={(e) => setFurnished(e.target.checked)}
                  className="w-4 h-4 text-[#4DBE55] border-gray-300 rounded focus:ring-[#4DBE55]"
                />
                <label htmlFor="furnished" className="text-sm font-medium text-gray-700">
                  Furnished
                </label>
              </div>
            </div>
          </div>

          {/* ─── AMENITIES ──────────────────────────────────────────────────── */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2
              className="text-lg font-semibold text-gray-900 mb-4"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Amenities
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {AMENITY_OPTIONS.map((amenity) => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleAmenity(amenity)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedAmenities.includes(amenity)
                      ? "bg-[#4DBE55] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {amenity}
                </button>
              ))}
            </div>
          </div>

          {/* ─── IMAGES ─────────────────────────────────────────────────────── */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-lg font-semibold text-gray-900"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Images
              </h2>
              <button
                type="button"
                onClick={addImageUrl}
                className="flex items-center gap-1 text-sm text-[#4DBE55] font-medium hover:underline"
              >
                <Plus size={14} /> Add URL
              </button>
            </div>
            <div className="space-y-2">
              {imageUrls.map((url, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => updateImageUrl(index, e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className={`${inputClass} flex-1`}
                  />
                  {imageUrls.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImageUrl(index)}
                      className="px-3 py-2 text-red-400 hover:text-red-600 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ─── ERROR DISPLAY ──────────────────────────────────────────────── */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* ─── SUBMIT ─────────────────────────────────────────────────────── */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#4DBE55] text-white py-3 rounded-lg font-medium hover:bg-[#3ea846] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 size={16} className="animate-spin" />}
            {isLoading ? "Creating Property..." : "Create Property"}
          </button>
        </form>
      </div>
    </div>
  );
}
