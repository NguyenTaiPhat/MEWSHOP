import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const [
    totalProducts,
    totalUsers,
    totalBookings,
    pendingBookings,
    activeBookings,
    activeDeposits,
    actualRevenueSum,
    pendingTransactions,
    recentBookings
  ] = await Promise.all([
    prisma.product.count(),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.booking.count(),
    prisma.booking.count({ where: { bookingStatus: "PENDING" } }),
    prisma.booking.count({ where: { bookingStatus: "ACTIVE" } }),
    
    // Đếm & Tính tiền cọc đang giữ của các đơn CONFIRMED / ACTIVE (đã đặt cọc nhưng chưa trả máy)
    prisma.booking.aggregate({
      _count: { id: true },
      _sum: { depositAmount: true },
      where: {
        depositStatus: "PAID",
        bookingStatus: { in: ["CONFIRMED", "ACTIVE"] },
      },
    }),

    // Doanh thu tiền thuê thực tế của các đơn đã COMPLETED (Hoàn thành)
    prisma.booking.aggregate({
      _sum: { totalPrice: true },
      where: { bookingStatus: "COMPLETED" },
    }),

    prisma.transaction.count({ where: { status: "PENDING" } }),

    prisma.booking.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        product: { select: { name: true } },
      },
    }),
  ]);

  return NextResponse.json({
    totalProducts,
    totalUsers,
    totalBookings,
    pendingBookings,
    activeBookings,
    activeDepositsCount: activeDeposits._count.id || 0,
    activeDepositsAmount: Number(activeDeposits._sum.depositAmount) || 0,
    actualRevenue: Number(actualRevenueSum._sum.totalPrice) || 0,
    pendingTransactions,
    recentBookings,
  });
}
