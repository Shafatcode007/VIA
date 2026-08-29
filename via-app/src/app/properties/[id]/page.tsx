import PropertyDetailPageClient from "@/components/properties/PropertyDetailClient";

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PropertyDetailPageClient propertyId={id} />;
}
