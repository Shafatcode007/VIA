"use client";

// NECESSITY: PropertyFilters provides sidebar filtering for the property listing page
// with the core Family/Bachelor classification system.
// LOGIC: The primary filter is occupancyCategory (All/Family/Bachelor). When Bachelor
// is selected, a secondary bachelorType filter appears (Full Room/Portion/Seat).
// All filter changes update URL search params and reset pagination to page 1.
// EDGE-CASE: bachelorType filter is cleared when switching away from Bachelor category.

import { useRouter, useSearchParams } from "next/navigation";

interface Filters {
  city?: string;
  occupancyCategory?: string;
  bachelorType?: string;
  minPrice?: string;
  maxPrice?: string;
  bedrooms?: string;
}

export default function PropertyFilters({
  currentFilters,
}: {
  currentFilters: Filters;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // NECESSITY: Updates a URL search param and navigates to trigger server re-fetch.
  // LOGIC: Creates new URLSearchParams, sets/deletes the key, resets page to 1.
  // EDGE-CASE: When changing occupancyCategory from BACHELOR to FAMILY, bachelorType
  // must be cleared to avoid an invalid filter combination.
  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // EDGE-CASE: Clear bachelorType when switching away from BACHELOR category.
    if (key === "occupancyCategory" && value !== "BACHELOR") {
      params.delete("bachelorType");
    }
    params.delete("page");
    router.push(`/properties?${params.toString()}`);
  };

  // LOGIC: Helper to build category button classes based on active state.
  const categoryBtnClass = (value: string) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      (currentFilters.occupancyCategory || "") === value
        ? "bg-[#4DBE55] text-white shadow-sm"
        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
    }`;

  // LOGIC: Helper to build bachelor sub-type button classes.
  const bachelorBtnClass = (value: string) =>
    `px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
      currentFilters.bachelorType === value
        ? "bg-amber-500 text-white shadow-sm"
        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
    }`;

  return (
    <aside className="w-full max-w-xs shrink-0 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>

      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleFilterChange("occupancyCategory", "")}
            className={categoryBtnClass("")}
            aria-pressed={(!currentFilters.occupancyCategory || "") === ""}
          >
            All
          </button>
          <button
            onClick={() => handleFilterChange("occupancyCategory", "FAMILY")}
            className={categoryBtnClass("FAMILY")}
            aria-pressed={currentFilters.occupancyCategory === "FAMILY"}
          >
            Family
          </button>
          <button
            onClick={() => handleFilterChange("occupancyCategory", "BACHELOR")}
            className={categoryBtnClass("BACHELOR")}
            aria-pressed={currentFilters.occupancyCategory === "BACHELOR"}
          >
            Bachelor
          </button>
        </div>
      </div>

      {currentFilters.occupancyCategory === "BACHELOR" && (
        <div className="mb-5 animate-in slide-in-from-top-2 duration-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bachelor Type
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleFilterChange("bachelorType", "")}
              className={bachelorBtnClass("")}
              aria-pressed={!currentFilters.bachelorType || currentFilters.bachelorType === ""}
            >
              All
            </button>
            <button
              onClick={() => handleFilterChange("bachelorType", "FULL_ROOM")}
              className={bachelorBtnClass("FULL_ROOM")}
              aria-pressed={currentFilters.bachelorType === "FULL_ROOM"}
            >
              Full Room
            </button>
            <button
              onClick={() => handleFilterChange("bachelorType", "PORTION")}
              className={bachelorBtnClass("PORTION")}
              aria-pressed={currentFilters.bachelorType === "PORTION"}
            >
              Portion
            </button>
            <button
              onClick={() => handleFilterChange("bachelorType", "SEAT")}
              className={bachelorBtnClass("SEAT")}
              aria-pressed={currentFilters.bachelorType === "SEAT"}
            >
              Seat
            </button>
          </div>
        </div>
      )}

      <hr className="border-gray-100 my-4" />

      {/* City Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          City
        </label>
        <input
          type="text"
          placeholder="Search by city..."
          defaultValue={currentFilters.city || ""}
          onChange={(e) => handleFilterChange("city", e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4DBE55] focus:border-transparent outline-none"
        />
      </div>

      {/* Price Range Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Price Range (BDT)
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            defaultValue={currentFilters.minPrice || ""}
            onChange={(e) => handleFilterChange("minPrice", e.target.value)}
            className="w-1/2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4DBE55] focus:border-transparent outline-none"
          />
          <input
            type="number"
            placeholder="Max"
            defaultValue={currentFilters.maxPrice || ""}
            onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
            className="w-1/2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4DBE55] focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Bedrooms Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Min Bedrooms
        </label>
        <select
          defaultValue={currentFilters.bedrooms || ""}
          onChange={(e) => handleFilterChange("bedrooms", e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4DBE55] focus:border-transparent outline-none"
        >
          <option value="">Any</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
        </select>
      </div>
    </aside>
  );
}
