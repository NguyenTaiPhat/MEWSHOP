import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: {
      product: true,
      user: { select: { id: true, name: true, email: true, phone: true } },
      slot: true,
      transactions: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!booking) {
    return NextResponse.json({ error: "Khong tim thay don" }, { status: 404 });
  }

  if (session!.user.role !== "ADMIN" && booking.userId !== session!.user.id) {
    return NextResponse.json({ error: "Khong co quyen" }, { status: 403 });
  }

  return NextResponse.json(booking);
}
