import { NextResponse } from "next/server";
import crypto from "crypto";

const SECRET_KEY = process.env.NEXTAUTH_SECRET || "mew_anti_spam_secret_key_2026";
const usedTokens = new Set<string>();

// Xóa bớt token cũ khỏi memory sau mỗi 5 phút
setInterval(() => {
  usedTokens.clear();
}, 5 * 60 * 1000);

export function generateAntiSpamToken(): string {
  const timestamp = Date.now();
  const nonce = crypto.randomBytes(8).toString("hex");
  const signature = crypto
    .createHmac("sha256", SECRET_KEY)
    .update(`${timestamp}_${nonce}`)
    .digest("hex");
  return `${timestamp}.${nonce}.${signature}`;
}

export function verifyAntiSpamToken(token: string | null): { valid: boolean; error?: string } {
  if (!token) {
    return { valid: false, error: "Thiếu Anti-Spam Token. Yêu cầu bị từ chối." };
  }

  if (usedTokens.has(token)) {
    return { valid: false, error: "Token chống spam đã được sử dụng (Replay Attack)." };
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return { valid: false, error: "Anti-Spam Token không hợp lệ." };
  }

  const [timestampStr, nonce, signature] = parts;
  const timestamp = Number(timestampStr);

  if (isNaN(timestamp) || Date.now() - timestamp > 60 * 1000) {
    return { valid: false, error: "Anti-Spam Token đã hết hạn (chỉ có hiệu lực 60 giây)." };
  }

  const expectedSignature = crypto
    .createHmac("sha256", SECRET_KEY)
    .update(`${timestamp}_${nonce}`)
    .digest("hex");

  if (signature !== expectedSignature) {
    return { valid: false, error: "Chữ ký Anti-Spam Token không hợp lệ." };
  }

  // Đánh dấu token đã được sử dụng
  usedTokens.add(token);

  return { valid: true };
}

export function validateAntiSpamHeader(req: Request) {
  const token = req.headers.get("x-anti-spam-token");
  const result = verifyAntiSpamToken(token);
  if (!result.valid) {
    return NextResponse.json(
      { error: result.error || "Phát hiện spam. Thao tác bị chặn." },
      { status: 429 }
    );
  }
  return null;
}
