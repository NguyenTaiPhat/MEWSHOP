# Anti-Spam & Rate Limiting Protection Design Specification

## Scope & Objective

Implement multi-layer anti-spam protection across the Next.js rental platform to prevent denial-of-service, request flooding, and database exhaustion. Protection applies at both the Next.js Middleware/API layer and the Client-side UI layer.

## Architecture & Rate Limit Rules

### 1. In-Memory Cache Rate Limiter (`src/lib/rate-limit.ts`)

Enhance `src/lib/rate-limit.ts` with sliding window memory cache, automatic garbage collection of expired entries, and client identifier resolution (combining Client IP and Authenticated User ID).

#### Rate Limit Buckets & Thresholds:
- **Authentication (`/api/auth/register`, `/api/auth/callback/credentials`)**: 5 requests / 60 seconds per IP.
- **Booking Creation (`/api/bookings`)**: 5 requests / 60 seconds per User ID / IP.
- **Chat Messaging (`/api/chat/messages`)**: 10 requests / 10 seconds per User ID / IP.
- **Public Query APIs (`/api/products`, `/api/slots`)**: 60 requests / 60 seconds per IP.

### 2. Next.js Middleware Rate Limiting (`src/middleware.ts`)

Integrate rate limiting checks into `src/middleware.ts` for all `/api/*` routes.
When limit is exceeded:
- Return HTTP status `429 Too Many Requests`.
- Return JSON body: `{ "error": "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau giây lát." }`.
- Set headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `Retry-After`.

### 3. Client-Side Anti-Spam Protection

- **Form Submission Cooldown**: Disable action buttons (e.g., "Đặt lịch ngay", "Đăng ký", "Gửi tin nhắn") for 2 seconds immediately upon click.
- **Optimistic Debouncing**: Prevent double-tap or rapid click spam in client components (`src/app/(user)/chat/page.tsx`, `src/app/(public)/products/[id]/page.tsx`, `src/app/(auth)/register/page.tsx`).

## Verification Strategy

- Automated compilation and build check via `npm run build`.
- API stress simulation verifying HTTP 429 status response when thresholds are exceeded.
