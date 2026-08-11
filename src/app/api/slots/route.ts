import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";
import { slotSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url, "http://localhost");
  const productId = searchParams.get("productId");
  const month = searchParams.get("month");
  const year = searchParams.get("year");

  const where: Record<string, unknown> = {};
  if (productId) where.productId = productId;
  if (month && year) {
    const start = new Date(parseInt(year), parseInt(month) - 1, 1);
    const end = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
    where.startDate = { gte: start };
    where.endDate = { lte: end };
  }

  const slots = await prisma.availableSlot.findMany({
    where,
    orderBy: { startDate: "asc" },
    include: { product: { select: { name: true } } },
  });

  return NextResponse.json(slots);
}

export async function POST(req: Request) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const data = slotSchema.parse(body);

    const overlap = await prisma.availableSlot.findFirst({
      where: {
        productId: data.productId,
        status: { not: "BLOCKED" },
        OR: [
          { startDate: { lte: new Date(data.endDate) }, endDate: { gte: new Date(data.startDate) } },
        ],
      },
    });

    if (overlap) {
      return NextResponse.json({ error: "Slot bi trung lich" }, { status: 409 });
    }

    const slot = await prisma.availableSlot.create({
      data: {
        productId: data.productId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      },
    });

    return NextResponse.json(slot, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.name === "ZodError") {
      return NextResponse.json({ error: "Du lieu khong hop le" }, { status: 400 });
    }
    return NextResponse.json({ error: "Loi he thong" }, { status: 500 });
  }
}
