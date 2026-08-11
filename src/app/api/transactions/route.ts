import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";

export async function GET(req: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (session!.user.role !== "ADMIN") where.userId = session!.user.id;
  if (status) where.status = status;

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      booking: { select: { id: true, product: { select: { name: true } } } },
    },
  });

  return NextResponse.json(transactions);
}
