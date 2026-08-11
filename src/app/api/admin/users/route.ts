import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const users = await prisma.user.findMany({
      where: { role: "USER" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        bookings: {
          take: 3,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            bookingStatus: true,
            totalPrice: true,
            createdAt: true,
            product: { select: { name: true } },
          },
        },
        transactions: {
          take: 3,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            type: true,
            amount: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    const userActivityList = users.map((u) => {
      const totalBookings = u.bookings.length;
      const totalSpent = u.bookings
        .filter((b) => b.bookingStatus === "COMPLETED" || b.bookingStatus === "ACTIVE" || b.bookingStatus === "CONFIRMED")
        .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

      return {
        ...u,
        totalBookings,
        totalSpent,
        lastActivity: u.bookings[0] || u.transactions[0] || null,
      };
    });

    return NextResponse.json(userActivityList);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
