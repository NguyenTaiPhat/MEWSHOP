import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";
import { productSchema } from "@/lib/validators";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};
    if (category) where.category = category;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { brand: { contains: search } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { bookings: true } } },
    });

    return NextResponse.json(products);
  } catch (err) {
    console.error("GET /api/products error:", err);
    return NextResponse.json([], { status: 200 });
  }
}


export async function POST(req: Request) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const data = productSchema.parse(body);

    const product = await prisma.product.create({
      data: {
        ...data,
        sampleImages: typeof data.sampleImages === "string" ? data.sampleImages : JSON.stringify(data.sampleImages || []),
        specs: data.specs ? JSON.stringify(data.specs) : "{}",
        images: typeof body.images === "string" ? body.images : JSON.stringify(body.images || []),
      },
    });


    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.name === "ZodError") {
      return NextResponse.json({ error: "Du lieu khong hop le" }, { status: 400 });
    }
    return NextResponse.json({ error: "Loi he thong" }, { status: 500 });
  }
}
