// NECESSITY: The properties listing page is the main browse page for tenants
// with the Family/Bachelor classification and category-based filtering.
// LOGIC: Server component that fetches properties with URL-based filters
// (occupancyCategory, bachelorType, city, price, bedrooms) and renders them
// in a responsive grid with sidebar filters and pagination.
// EDGE-CASE: Handles empty results gracefully with a "no properties" message.

import { getProperties } from "@/app/actions/properties";
import PropertyCard from "@/components/properties/PropertyCard";
import PropertyFilters from "@/components/properties/PropertyFilters";
import { PublicHeader } from "@/components/PublicHeader";
import Link from "next/link";

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{
    city?: string;
    occupancyCategory?: string;
    bachelorType?: string;
    minPrice?: string;
    maxPrice?: string;
    bedrooms?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;

  const filters = {
    city: params.city,
    occupancyCategory: params.occupancyCategory,
    bachelorType: params.bachelorType,
    minPrice: params.minPrice ? parseFloat(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? parseFloat(params.maxPrice) : undefined,
    bedrooms: params.bedrooms ? parseInt(params.bedrooms) : undefined,
    page: params.page ? parseInt(params.page) : 1,
    limit: 12,
  };

  const result = await getProperties(filters);

  // NECESSITY: Helper to build the active filter summary text for display.
  // LOGIC: Maps URL params to human-readable labels.
  const activeFilters: string[] = [];
  if (params.occupancyCategory === "FAMILY") activeFilters.push("Family");
  if (params.occupancyCategory === "BACHELOR") {
    const bt = params.bachelorType
      ? `Bachelor - ${params.bachelorType.replace("_", " ")}`
      : "Bachelor";
    activeFilters.push(bt);
  }
  if (params.city) activeFilters.push(params.city);

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1
            className="text-3xl font-bold text-gray-900"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Available Properties
          </h1>
          <p className="text-gray-500 mt-1">
            Find your perfect home in Dhaka
          </p>
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {activeFilters.map((f) => (
                <span
                  key={f}
                  className="bg-[#edf7ee] text-[#4DBE55] px-3 py-1 rounded-full text-sm font-medium"
                >
                  {f}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-64 flex-shrink-0">
            <PropertyFilters currentFilters={params} />
          </aside>

          {/* Property Grid */}
          <main className="flex-1">
            {!result.success || !result.properties ? (
              <div className="text-center py-12 text-gray-500">
                Error loading properties. Please try again.
              </div>
            ) : result.properties.length === 0 ? (
              <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-100">
                No properties found matching your criteria.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {result.properties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>

                {/* Pagination */}
                {result.pagination.totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    {Array.from(
                      { length: result.pagination.totalPages },
                      (_, i) => i + 1
                    ).map((page) => {
                      const sp = new URLSearchParams();
                      if (params.city) sp.set("city", params.city);
                      if (params.occupancyCategory)
                        sp.set("occupancyCategory", params.occupancyCategory);
                      if (params.bachelorType)
                        sp.set("bachelorType", params.bachelorType);
                      if (params.minPrice) sp.set("minPrice", params.minPrice);
                      if (params.maxPrice) sp.set("maxPrice", params.maxPrice);
                      if (params.bedrooms) sp.set("bedrooms", params.bedrooms);
                      sp.set("page", String(page));

                      return (
                        <Link
                          key={page}
                          href={`/properties?${sp.toString()}`}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            page === result.pagination.page
                              ? "bg-[#4DBE55] text-white"
                              : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                          }`}
                        >
                          {page}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </main>
</div>
      </div>
    </div>
  );
}
