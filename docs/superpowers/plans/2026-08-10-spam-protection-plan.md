# Anti-Spam & Rate Limiting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement sliding-window memory cache rate limiting across API endpoints and client-side submission cooldowns to prevent request flooding and spam.

**Architecture:** Extend `src/lib/rate-limit.ts` with in-memory TTL caching and key resolution. Integrate rate limits in `src/middleware.ts` returning HTTP 429 status on limit breach. Add button cooldown debouncing on critical forms.

**Tech Stack:** Next.js (App Router), TypeScript, Vanilla CSS.

## Global Constraints

- Absolute zero emojis in UI, code, or logs.
- Zero code comments.
- 100% Vietnamese for all user-facing error messages.
- Clean, buildable code verifying with `npm run build`.

---

### Task 1: Enhance In-Memory Rate Limiter Utility

**Files:**
- Modify: `src/lib/rate-limit.ts`

**Interfaces:**
- Consumes: Request key, maximum request limit, window duration in milliseconds.
- Produces: `checkRateLimit(key: string, limit: number, windowMs: number): { success: boolean; limit: number; remaining: number; reset: number }`

- [ ] **Step 1: Update `src/lib/rate-limit.ts` with sliding window calculation & auto-cleanup**

```typescript
type RateLimitEntry = {
  count: number;
  resetTime: number;
};

const rateLimitMap = new Map<string, RateLimitEntry>();

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 30000);

export function checkRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetTime) {
    const resetTime = now + windowMs;
    rateLimitMap.set(key, { count: 1, resetTime });
    return { success: true, limit, remaining: limit - 1, reset: resetTime };
  }

  if (entry.count >= limit) {
    return { success: false, limit, remaining: 0, reset: entry.resetTime };
  }

  entry.count++;
  return { success: true, limit, remaining: limit - entry.count, reset: entry.resetTime };
}
```

- [ ] **Step 2: Commit Task 1**

```bash
git add src/lib/rate-limit.ts
git commit -m "feat: enhance rate limiter utility with TTL sliding window"
```

---

### Task 2: Integrate Rate Limiting in Next.js Middleware

**Files:**
- Modify: `src/middleware.ts`

**Interfaces:**
- Consumes: Next.js `NextRequest`, `checkRateLimit` from `@/lib/rate-limit`
- Produces: Rate-limited middleware responses with HTTP status `429 Too Many Requests`

- [ ] **Step 1: Update `src/middleware.ts` to inspect incoming API requests**

```typescript
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
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
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
    "/((?!_next/static|_next/image|favicon.ico|uploads|camera3d).*)",
  ],
};
```

- [ ] **Step 2: Commit Task 2**

```bash
git add src/middleware.ts
git commit -m "feat: integrate rate limiting headers and HTTP 429 response in middleware"
```

---

### Task 3: Client-Side Form Debouncing & Button Cooldown

**Files:**
- Modify: `src/app/(user)/chat/page.tsx`
- Modify: `src/app/(public)/products/[id]/page.tsx`

**Interfaces:**
- Consumes: React component state
- Produces: Temporary button disabling during submission to prevent double clicks

- [ ] **Step 1: Add submission cooldown to chat input in `src/app/(user)/chat/page.tsx`**

Ensure message send button is disabled while sending or for 1 second after click.

- [ ] **Step 2: Add submission cooldown to booking button in `src/app/(public)/products/[id]/page.tsx`**

Ensure booking submission button is disabled while processing to avoid duplicate slot booking requests.

- [ ] **Step 3: Commit Task 3**

```bash
git add src/app/\(user\)/chat/page.tsx src/app/\(public\)/products/\[id\]/page.tsx
git commit -m "feat: add client-side submission cooldown and anti-spam debouncing"
```

---

### Task 4: End-to-End Build & Verification

**Files:**
- Verify: Full Next.js production build check

- [ ] **Step 1: Execute `npm run build`**

Run: `npm run build`
Expected: Successful compilation with zero errors.

- [ ] **Step 2: Commit final verification**

```bash
git add .
git commit -m "chore: complete anti-spam and rate limiting implementation"
```
