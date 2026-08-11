import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireAuth } from "@/lib/auth-utils";
import { paymentSettingsSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  const settings = await prisma.paymentSettings.findFirst();
  return NextResponse.json(settings);
}

export async function PUT(req: Request) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const data = paymentSettingsSchema.parse(body);

    const existing = await prisma.paymentSettings.findFirst();

    let settings;
    if (existing) {
      settings = await prisma.paymentSettings.update({
        where: { id: existing.id },
        data,
      });
    } else {
      settings = await prisma.paymentSettings.create({ data });
    }

    return NextResponse.json(settings);
  } catch (err) {
    if (err instanceof Error && err.name === "ZodError") {
      return NextResponse.json({ error: "Du lieu khong hop le" }, { status: 400 });
    }
    return NextResponse.json({ error: "Loi he thong" }, { status: 500 });
  }
}
