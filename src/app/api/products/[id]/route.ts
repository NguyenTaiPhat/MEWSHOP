import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";
import { productSchema } from "@/lib/validators";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      _count: { select: { slots: true, bookings: true } },
    },
  });

  if (!product) {
    return NextResponse.json({ error: "Không tìm thấy sản phẩm" }, { status: 404 });
  }

  return NextResponse.json(product);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const data = productSchema.parse(body);

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...data,
        sampleImages: typeof data.sampleImages === "string" ? data.sampleImages : JSON.stringify(data.sampleImages || []),
        specs: data.specs ? JSON.stringify(data.specs) : "{}",
        images: typeof body.images === "string" ? body.images : JSON.stringify(body.images || []),
      },
    });

    return NextResponse.json(product);
  } catch (err) {
    if (err instanceof Error && err.name === "ZodError") {
      return NextResponse.json({ error: "Dữ liệu nhập vào không hợp lệ" }, { status: 400 });
    }
    return NextResponse.json({ error: "Lỗi hệ thống khi cập nhật sản phẩm" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  try {
    const activeBookings = await prisma.booking.count({
      where: {
        productId: params.id,
        bookingStatus: { in: ["PENDING", "CONFIRMED", "ACTIVE"] },
      },
    });

    if (activeBookings > 0) {
      return NextResponse.json(
        { error: `Không thể xóa: Sản phẩm này đang có ${activeBookings} đơn thuê đang hoạt động hoặc chờ phê duyệt trên hệ thống!` },
        { status: 400 }
      );
    }

    // Xóa các khung giờ khả dụng (availableSlot) liên quan trước
    await prisma.availableSlot.deleteMany({ where: { productId: params.id } });
    await prisma.product.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true, message: "Đã xóa vĩnh viễn sản phẩm khỏi hệ thống thành công!" });
  } catch (err: any) {
    if (err?.code === "P2003" || String(err?.message || "").includes("foreign key")) {
      return NextResponse.json(
        { error: "Không thể xóa vĩnh viễn: Sản phẩm này đã lưu vết lịch sử đơn thuê trong quá khứ. Hãy đổi trạng thái sang 'BẢO TRÌ' thay vì xóa vĩnh viễn." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Lỗi hệ thống không thể xóa sản phẩm. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
