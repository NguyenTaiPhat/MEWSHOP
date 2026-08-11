import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";

export async function GET(req: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  if (session!.user.role === "ADMIN") {
    const conversations = await prisma.conversation.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: { content: true, createdAt: true, senderId: true },
        },
      },
    });

    const result = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            senderId: { not: session!.user.id },
            readAt: null,
          },
        });
        return { ...conv, unreadCount };
      })
    );

    return NextResponse.json(result);
  }

  let conversation = await prisma.conversation.findUnique({
    where: { userId: session!.user.id },
    include: {
      user: { select: { id: true, name: true } },
    },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { userId: session!.user.id },
      include: {
        user: { select: { id: true, name: true } },
      },
    });
  }

  return NextResponse.json(conversation);
}
