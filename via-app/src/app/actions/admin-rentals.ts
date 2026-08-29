"use server";

import { prisma } from "@/lib/prisma";

export interface PropertyListItem {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  city: string;
  occupancyCategory: string;
  bachelorType: string | null;
  status: string;
  landlordId: string;
  landlord: { name: string | null; email: string | null } | null;
  createdAt: Date;
}

export async function adminListRentals(): Promise<{
  properties: PropertyListItem[];
  total: number;
}> {
  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        landlord: { select: { name: true, email: true } },
      },
    }),
    prisma.property.count(),
  ]);
  return { properties: properties as PropertyListItem[], total };
}

export async function adminVerifyRental(
  id: string,
  action: "VERIFIED" | "REJECTED"
): Promise<{ success: boolean; error?: string }> {
  try {
    const existing = await prisma.property.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Property not found" };

    await prisma.property.update({
      where: { id },
      data: { status: action === "VERIFIED" ? "AVAILABLE" : "INACTIVE" },
    });
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update rental" };
  }
}
