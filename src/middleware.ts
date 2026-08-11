import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    if (pathname.startsWith("/api/")) {
      const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
      const identifier = token?.sub ? `user:${token.sub}` : `ip:${ip}`;

      let limit = 60;
      let windowMs = 60000;

      if (pathname.startsWith("/api/auth/register")) {
        limit = 5;
        windowMs = 60000;
      } else if (pathname.startsWith("/api/bookings")) {
        limit = 5;
        windowMs = 60000;
      } else if (pathname.startsWith("/api/chat/messages")) {
        limit = 10;
        windowMs = 10000;
      }

      const key = `${pathname}:${identifier}`;
      const result = checkRateLimit(key, limit, windowMs);

      if (!result.success) {
        return new NextResponse(
          JSON.stringify({ error: "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau giây lát." }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "X-RateLimit-Limit": String(result.limit),
              "X-RateLimit-Remaining": String(result.remaining),
              "Retry-After": String(Math.ceil((result.reset - Date.now()) / 1000)),
            },
          }
        );
      }
    }

    if (pathname.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    }

    return NextResponse.next();
  },
  {
    secret: process.env.NEXTAUTH_SECRET || "mew_anti_spam_secret_key_2026",
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Cho phép truy cập công khai toàn bộ file tĩnh (Fonts, Images, Icons)
        if (/\.(?:svg|png|jpg|jpeg|gif|webp|ico|ttf|otf|woff|woff2)$/i.test(pathname)) {
          return true;
        }

        const publicPaths = ["/", "/products", "/login", "/register", "/about", "/contact", "/terms", "/policy"];
        const isPublic = publicPaths.some(
          (p) =>
            pathname === p ||
            pathname.startsWith("/products/") ||
            pathname.startsWith("/api/auth") ||
            pathname.startsWith("/camera3d/") ||
            pathname.startsWith("/uploads/")
        );

        if (isPublic) return true;
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|uploads|camera3d|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|ttf|otf|woff|woff2)$).*)",
  ],
};
