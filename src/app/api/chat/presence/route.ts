import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const currentUserId = session!.user.id;
  const isCurrentAdmin = session!.user.role === "ADMIN";

  // Heartbeat: update current user's updatedAt
  await prisma.user.update({
    where: { id: currentUserId },
    data: { updatedAt: new Date() },
  }).catch(() => {});

  if (!isCurrentAdmin) {
    // User checking Admin presence
    const adminUser = await prisma.user.findFirst({
      where: { role: "ADMIN" },
      orderBy: { updatedAt: "desc" },
      select: { id: true, name: true, updatedAt: true },
    });

    if (!adminUser) {
      return NextResponse.json({ isOnline: false, statusText: "Ngoại tuyến" });
    }

    const diffMinutes = Math.floor((Date.now() - new Date(adminUser.updatedAt).getTime()) / (1000 * 60));
    const isOnline = diffMinutes <= 15;

    return NextResponse.json({
      isOnline,
      diffMinutes,
      statusText: isOnline ? "Đang online" : diffMinutes < 120 ? `Hoạt động ${Math.max(1, diffMinutes)} phút trước` : "Ngoại tuyến",
    });
  } else {
    // Admin checking target User presence
    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get("userId");

    if (!targetUserId) {
      return NextResponse.json({ isOnline: false, statusText: "Ngoại tuyến" });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, name: true, updatedAt: true },
    });

    if (!targetUser) {
      return NextResponse.json({ isOnline: false, statusText: "Ngoại tuyến" });
    }

    const diffMinutes = Math.floor((Date.now() - new Date(targetUser.updatedAt).getTime()) / (1000 * 60));
    const isOnline = diffMinutes <= 15;

    return NextResponse.json({
      isOnline,
      diffMinutes,
      statusText: isOnline ? "Đang online" : diffMinutes < 120 ? `Hoạt động ${Math.max(1, diffMinutes)} phút trước` : "Ngoại tuyến",
    });
  }
}
