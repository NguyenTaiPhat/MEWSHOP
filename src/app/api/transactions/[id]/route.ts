import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";
import { transactionActionSchema } from "@/lib/validators";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const data = transactionActionSchema.parse(body);

    const transaction = await prisma.transaction.findUnique({
      where: { id: params.id },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Khong tim thay giao dich" }, { status: 404 });
    }

    const updated = await prisma.transaction.update({
      where: { id: params.id },
      data: {
        status: data.status,
        adminNote: data.adminNote,
      },
    });

    if (data.status === "CONFIRMED" && transaction.bookingId) {
      await prisma.booking.update({
        where: { id: transaction.bookingId },
        data: { depositStatus: "PAID" },
      });
    }

    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof Error && err.name === "ZodError") {
      return NextResponse.json({ error: "Du lieu khong hop le" }, { status: 400 });
    }
    return NextResponse.json({ error: "Loi he thong" }, { status: 500 });
  }
}
