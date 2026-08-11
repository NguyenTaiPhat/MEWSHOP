import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";
import { sendDiscordNotification } from "@/lib/discord";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const { status } = await req.json();

  const validStatuses = ["CONFIRMED", "ACTIVE", "COMPLETED", "CANCELLED"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Trạng thái đơn hàng không hợp lệ" }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: {
      product: { select: { name: true, depositRequired: true } },
      user: { select: { name: true, email: true } },
    },
  });

  if (!booking) {
    return NextResponse.json({ error: "Không tìm thấy đơn thuê" }, { status: 404 });
  }

  const updateData: Record<string, unknown> = { bookingStatus: status };

  if (status === "CANCELLED") {
    await prisma.availableSlot.update({
      where: { id: booking.slotId },
      data: { status: "OPEN" },
    });
  }

  if (status === "COMPLETED" && booking.depositStatus === "PAID") {
    await prisma.transaction.create({
      data: {
        userId: booking.userId,
        bookingId: booking.id,
        amount: Number(booking.depositAmount),
        type: "REFUND",
        status: "CONFIRMED",
      },
    });
    updateData.depositStatus = "REFUNDED";
  }

  const updated = await prisma.booking.update({
    where: { id: params.id },
    data: updateData,
  });

  // Tự động ghi Lịch sử đơn hàng vào AuditLog & Bắn Discord Webhook
  try {
    const shortId = params.id.slice(0, 8).toUpperCase();
    let actionText = `Duyệt đơn thuê #${shortId}`;
    if (status === "CANCELLED") actionText = `Hủy đơn thuê #${shortId}`;
    if (status === "COMPLETED") actionText = `Hoàn thành đơn thuê #${shortId}`;
    if (status === "ACTIVE") actionText = `Bắt đầu cho thuê đơn #${shortId}`;

    await prisma.auditLog.create({
      data: {
        userId: session!.user.id,
        action: actionText,
        targetType: "BOOKING",
        targetId: params.id,
        metadata: `Admin ${session!.user.name || "Hệ thống"} đã cập nhật trạng thái đơn thuê #${shortId} từ ${booking.bookingStatus} sang ${status}`,
      },
    });

    // Bắn Discord Webhook Realtime
    const formatDateStr = (d: Date) =>
      `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;

    const notifyType = status as "CONFIRMED" | "CANCELLED" | "COMPLETED";
    sendDiscordNotification({
      type: notifyType,
      bookingId: booking.id,
      userName: booking.user?.name || "Khách hàng",
      userEmail: booking.user?.email || "",
      productName: booking.product?.name || "Thiết bị máy ảnh",
      startDate: formatDateStr(booking.startDate),
      endDate: formatDateStr(booking.endDate),
      totalPrice: Number(booking.totalPrice),
      depositAmount: Number(booking.depositAmount),
    }).catch(() => {});
  } catch {}

  return NextResponse.json(updated);
}
