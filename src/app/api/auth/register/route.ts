import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validators";
import { getAvatarUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    const exists = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (exists) {
      return NextResponse.json(
        { error: "Email da duoc su dung" },
        { status: 409 }
      );
    }

    const passwordHash = await hash(data.password, 12);
    const avatarUrl = getAvatarUrl(data.email);


    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        phone: data.phone,
        avatar: avatarUrl,
      },
    });

    return NextResponse.json(
      { id: user.id, email: user.email, name: user.name },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Du lieu khong hop le" }, { status: 400 });
    }
    return NextResponse.json({ error: "Loi he thong" }, { status: 500 });
  }
}
