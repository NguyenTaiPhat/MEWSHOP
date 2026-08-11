import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";
import { bookingSchema } from "@/lib/validators";
import { sendDiscordNotification } from "@/lib/discord";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (session!.user.role !== "ADMIN") where.userId = session!.user.id;
  if (status) where.bookingStatus = status;

  const bookings = await prisma.booking.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { name: true, images: true } },
      user: { select: { name: true, email: true } },
      slot: true,
    },
  });

  return NextResponse.json(bookings);
}

export async function POST(req: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await req.json();
    const data = bookingSchema.parse(body);

    const slot = await prisma.availableSlot.findUnique({
      where: { id: data.slotId },
      include: { product: true },
    });

    if (!slot || slot.status !== "OPEN") {
      return NextResponse.json({ error: "Slot khong kha dung" }, { status: 400 });
    }

    if (slot.productId !== data.productId) {
      return NextResponse.json({ error: "Slot khong thuoc san pham nay" }, { status: 400 });
    }

    const days = Math.ceil(
      (slot.endDate.getTime() - slot.startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const totalPrice = Number(slot.product.pricePerDay) * Math.max(days, 1);

    const [booking] = await prisma.$transaction([
      prisma.booking.create({
        data: {
          userId: session!.user.id,
          productId: data.productId,
          slotId: data.slotId,
          startDate: slot.startDate,
          endDate: slot.endDate,
          totalPrice,
          depositAmount: Number(slot.product.depositRequired),
        },
      }),
      prisma.availableSlot.update({
        where: { id: data.slotId },
        data: { status: "BOOKED" },
      }),
    ]);

    await prisma.transaction.create({
      data: {
        userId: session!.user.id,
        bookingId: booking.id,
        amount: Number(slot.product.depositRequired),
        type: "DEPOSIT",
      },
    });

    // Gửi thông báo ngầm qua Discord Webhook
    try {
      const formatDateStr = (d: Date) =>
        `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;

      sendDiscordNotification({
        type: "NEW_BOOKING",
        bookingId: booking.id,
        userName: session!.user.name || "Khách hàng",
        userEmail: session!.user.email || "",
        productName: slot.product.name,
        startDate: formatDateStr(slot.startDate),
        endDate: formatDateStr(slot.endDate),
        totalPrice,
        depositAmount: Number(slot.product.depositRequired),
      }).catch(() => {});
    } catch {}

    return NextResponse.json(booking, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.name === "ZodError") {
      return NextResponse.json({ error: "Du lieu khong hop le" }, { status: 400 });
    }
    return NextResponse.json({ error: "Loi he thong" }, { status: 500 });
  }
}
