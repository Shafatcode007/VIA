"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createBooking(
  userId: string,
  propertyId: string,
  data: { startDate: string; endDate: string; message?: string }
) {
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property || property.status !== "AVAILABLE") {
      return { success: false, error: "Property not available" };
    }

    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (endDate <= startDate) {
      return { success: false, error: "End date must be after start date" };
    }

    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        propertyId,
        status: { in: ["PENDING", "CONFIRMED"] },
        OR: [
          {
            startDate: { lte: endDate },
            endDate: { gte: startDate },
          },
        ],
      },
    });

    if (conflictingBooking) {
      return { success: false, error: "Selected dates are not available" };
    }

    const days = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const totalPrice = property.price * days;

    const booking = await prisma.booking.create({
      data: {
        propertyId,
        tenantId: userId,
        startDate,
        endDate,
        totalPrice,
        message: data.message,
        status: "PENDING",
      },
    });

    revalidatePath(`/properties/${propertyId}`);
    revalidatePath("/dashboard/bookings");

    return { success: true, bookingId: booking.id };
  } catch (error) {
    console.error("[CREATE BOOKING ERROR]:", error);
    return { success: false, error: "Failed to create booking" };
  }
}

export async function getBookingsByProperty(propertyId: string) {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        propertyId,
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      select: {
        startDate: true,
        endDate: true,
        status: true,
      },
      orderBy: { startDate: "asc" },
    });

    return { success: true, bookings };
  } catch (error) {
    console.error("[GET BOOKINGS ERROR]:", error);
    return { success: false, error: "Failed to fetch bookings" };
  }
}

export async function updateBookingStatus(
  userId: string,
  bookingId: string,
  status: "CONFIRMED" | "REJECTED" | "CANCELLED" | "COMPLETED"
) {
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { property: { select: { landlordId: true } } },
    });

    if (!booking) {
      return { success: false, error: "Booking not found" };
    }

    if (booking.property.landlordId !== userId) {
      return { success: false, error: "Not authorized" };
    }

    await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    });

    revalidatePath("/dashboard/bookings");
    revalidatePath(`/properties/${booking.propertyId}`);

    return { success: true };
  } catch (error) {
    console.error("[UPDATE BOOKING ERROR]:", error);
    return { success: false, error: "Failed to update booking" };
  }
}
