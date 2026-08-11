import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "./auth";

export async function getSession() {
  return getServerSession(authOptions);
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    return { session: null, error: NextResponse.json({ error: "Chua dang nhap" }, { status: 401 }) };
  }
  return { session, error: null };
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session) {
    return { session: null, error: NextResponse.json({ error: "Chua dang nhap" }, { status: 401 }) };
  }
  if (session.user.role !== "ADMIN") {
    return { session: null, error: NextResponse.json({ error: "Khong co quyen" }, { status: 403 }) };
  }
  return { session, error: null };
}
