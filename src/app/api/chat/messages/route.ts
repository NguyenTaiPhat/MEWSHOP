import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";
import { messageSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(req.url, "http://localhost");
  const conversationId = searchParams.get("conversationId");
  const cursor = searchParams.get("cursor");
  const limit = 50;

  // Heartbeat: Update caller's active timestamp
  await prisma.user.update({
    where: { id: session!.user.id },
    data: { updatedAt: new Date() },
  }).catch(() => {});

  if (!conversationId) {
    return NextResponse.json({ error: "conversationId required" }, { status: 400 });
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    return NextResponse.json({ error: "Khong tim thay cuoc hoi thoai" }, { status: 404 });
  }

  if (session!.user.role !== "ADMIN" && conversation.userId !== session!.user.id) {
    return NextResponse.json({ error: "Khong co quyen" }, { status: 403 });
  }

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "desc" },
    take: limit,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    include: {
      sender: { select: { id: true, name: true, role: true } },
    },
  });

  await prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: session!.user.id },
      readAt: null,
    },
    data: { readAt: new Date() },
  });

  return NextResponse.json(messages.reverse());
}

export async function POST(req: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await req.json();
    const data = messageSchema.parse(body);
    const { conversationId } = body;

    if (!conversationId) {
      return NextResponse.json({ error: "conversationId required" }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: session!.user.id,
        content: data.content,
        type: data.type,
      },
      include: {
        sender: { select: { id: true, name: true, role: true } },
      },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.name === "ZodError") {
      return NextResponse.json({ error: "Du lieu khong hop le" }, { status: 400 });
    }
    return NextResponse.json({ error: "Loi he thong" }, { status: 500 });
  }
}
