"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const PropertySchema = z
  .object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    description: z.string().min(20, "Description must be at least 20 characters"),
    price: z.coerce.number().positive("Price must be positive"),
    location: z.string().min(3, "Location must be at least 3 characters"),
    address: z.string().min(5, "Address must be at least 5 characters"),
    city: z.string().default("Dhaka"),
    occupancyCategory: z.enum(["FAMILY", "BACHELOR"], {
      message: "Category must be FAMILY or BACHELOR",
    }),
    bachelorType: z
      .enum(["FULL_ROOM", "PORTION", "SEAT"])
      .nullable()
      .default(null),
    bedrooms: z.coerce.number().min(0),
    bathrooms: z.coerce.number().min(0),
    totalUnits: z.coerce.number().min(1).default(1),
    area: z.coerce.number().positive().nullable().default(null),
    furnished: z.coerce.boolean().default(false),
    amenities: z.string().default("[]"),
    images: z.string().default("[]"),
  })
  .superRefine((data, ctx) => {
    if (data.occupancyCategory === "FAMILY" && data.bachelorType !== null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Family properties cannot have a bachelor type",
        path: ["bachelorType"],
      });
    }
    if (data.occupancyCategory === "BACHELOR" && data.bachelorType === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Bachelor properties must specify type (Full Room / Portion / Seat)",
        path: ["bachelorType"],
      });
    }
  });

export async function createProperty(userId: string, formData: FormData) {
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (user?.role !== "LANDLORD") {
    return { success: false, error: "Only landlords can create properties" };
  }

  try {
    const raw = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      price: formData.get("price") as string,
      location: formData.get("location") as string,
      address: formData.get("address") as string,
      city: (formData.get("city") as string) || "Dhaka",
      occupancyCategory: formData.get("occupancyCategory") as string,
      bachelorType: (formData.get("bachelorType") as string) || null,
      bedrooms: formData.get("bedrooms") as string,
      bathrooms: formData.get("bathrooms") as string,
      totalUnits: (formData.get("totalUnits") as string) || "1",
      area: (formData.get("area") as string) || null,
      furnished: formData.get("furnished") as string,
      amenities: (formData.get("amenities") as string) || "[]",
      images: (formData.get("images") as string) || "[]",
    };

    const parsed = PropertySchema.safeParse(raw);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return { success: false, error: firstError.message };
    }

    const data = parsed.data;

    const property = await prisma.property.create({
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        location: data.location,
        address: data.address,
        city: data.city,
        occupancyCategory: data.occupancyCategory,
        bachelorType: data.occupancyCategory === "BACHELOR" ? data.bachelorType : null,
        totalUnits: data.totalUnits,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        area: data.area,
        furnished: data.furnished,
        amenities: data.amenities,
        images: data.images,
        landlordId: userId,
      },
    });

    revalidatePath("/properties");
    revalidatePath("/landlord/properties");

    return { success: true, propertyId: property.id };
  } catch (error) {
    console.error("[CREATE PROPERTY ERROR]:", error);
    return { success: false, error: "Failed to create property" };
  }
}

export async function getProperties(filters: {
  city?: string;
  occupancyCategory?: string;
  bachelorType?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  page?: number;
  limit?: number;
}) {
  try {
    const page = filters.page || 1;
    const limit = filters.limit || 12;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      status: "AVAILABLE",
    };

    if (filters.city) {
      where.city = { contains: filters.city };
    }

    if (filters.occupancyCategory) {
      where.occupancyCategory = filters.occupancyCategory;
    }

    if (filters.bachelorType && filters.occupancyCategory === "BACHELOR") {
      where.bachelorType = filters.bachelorType;
    }

    if (filters.minPrice || filters.maxPrice) {
      where.price = {};
      if (filters.minPrice) (where.price as Record<string, number>).gte = filters.minPrice;
      if (filters.maxPrice) (where.price as Record<string, number>).lte = filters.maxPrice;
    }
    if (filters.bedrooms) {
      where.bedrooms = { gte: filters.bedrooms };
    }

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        skip,
        take: limit,
        include: {
          landlord: {
            select: { name: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.property.count({ where }),
    ]);

    return {
      success: true,
      properties,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("[GET PROPERTIES ERROR]:", error);
    return { success: false, error: "Failed to fetch properties" };
  }
}

export async function getPropertyById(id: string) {
  try {
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        landlord: {
          select: { name: true, email: true },
        },
        bookings: {
          where: {
            status: { in: ["PENDING", "CONFIRMED"] },
          },
        },
      },
    });

    if (!property) {
      return { success: false, error: "Property not found" };
    }

    return { success: true, property };
  } catch (error) {
    console.error("[GET PROPERTY ERROR]:", error);
    return { success: false, error: "Failed to fetch property" };
  }
}

export async function updateProperty(userId: string, id: string, formData: FormData) {
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const existing = await prisma.property.findUnique({
      where: { id },
      select: { landlordId: true },
    });

    if (!existing || existing.landlordId !== userId) {
      return { success: false, error: "Not authorized to update this property" };
    }

    const data: Record<string, unknown> = {};

    if (formData.get("title")) data.title = formData.get("title");
    if (formData.get("description")) data.description = formData.get("description");
    if (formData.get("price")) data.price = parseFloat(formData.get("price") as string);
    if (formData.get("location")) data.location = formData.get("location");
    if (formData.get("address")) data.address = formData.get("address");
    if (formData.get("city")) data.city = formData.get("city");
    if (formData.get("occupancyCategory")) {
      data.occupancyCategory = formData.get("occupancyCategory");
      if (formData.get("occupancyCategory") === "FAMILY") {
        data.bachelorType = null;
      }
    }
    if (formData.get("bachelorType") !== null && formData.get("bachelorType") !== undefined) {
      data.bachelorType = formData.get("bachelorType");
    }
    if (formData.get("totalUnits") !== null) data.totalUnits = parseInt(formData.get("totalUnits") as string);
    if (formData.get("bedrooms") !== null) data.bedrooms = parseInt(formData.get("bedrooms") as string);
    if (formData.get("bathrooms") !== null) data.bathrooms = parseInt(formData.get("bathrooms") as string);
    if (formData.get("area")) data.area = parseFloat(formData.get("area") as string);
    if (formData.get("furnished") !== null) data.furnished = formData.get("furnished") === "true";
    if (formData.get("amenities")) data.amenities = formData.get("amenities");
    if (formData.get("images")) data.images = formData.get("images");
    if (formData.get("status")) data.status = formData.get("status");

    await prisma.property.update({ where: { id }, data });

    revalidatePath(`/properties/${id}`);
    revalidatePath("/properties");

    return { success: true };
  } catch (error) {
    console.error("[UPDATE PROPERTY ERROR]:", error);
    return { success: false, error: "Failed to update property" };
  }
}

export async function deleteProperty(userId: string, id: string) {
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        bookings: {
          where: { status: { in: ["PENDING", "CONFIRMED"] } },
        },
      },
    });

    if (!property) {
      return { success: false, error: "Property not found" };
    }

    if (property.landlordId !== userId) {
      return { success: false, error: "Not authorized" };
    }

    if (property.bookings.length > 0) {
      return { success: false, error: "Cannot delete property with active bookings" };
    }

    await prisma.property.delete({ where: { id } });
    revalidatePath("/properties");

    return { success: true };
  } catch (error) {
    console.error("[DELETE PROPERTY ERROR]:", error);
    return { success: false, error: "Failed to delete property" };
  }
}
