import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();

  const slot = await prisma.availableSlot.update({
    where: { id: params.id },
    data: {
      status: body.status,
      ...(body.startDate && { startDate: new Date(body.startDate) }),
      ...(body.endDate && { endDate: new Date(body.endDate) }),
    },
  });

  return NextResponse.json(slot);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const slot = await prisma.availableSlot.findUnique({
    where: { id: params.id },
  });

  if (!slot) {
    return NextResponse.json({ error: "Khong tim thay slot" }, { status: 404 });
  }

  if (slot.status === "BOOKED") {
    return NextResponse.json({ error: "Khong the xoa slot da dat" }, { status: 400 });
  }

  await prisma.availableSlot.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
