# Camera Rental Platform - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xay dung MVP website cho thue camera voi Next.js full-stack, Socket.io chat, PostgreSQL, NextAuth.

**Architecture:** Monolith Next.js App Router voi custom server de attach Socket.io. Prisma ORM truy cap PostgreSQL. NextAuth.js xu ly auth (email/password). Zustand cho client state.

**Tech Stack:** Next.js 14+, TypeScript, Prisma, PostgreSQL, NextAuth.js, Socket.io, Zod, Zustand, bcryptjs, date-fns, sharp

## Global Constraints

- TypeScript strict mode
- Node.js >= 18
- PostgreSQL >= 15
- Moi file component < 300 dong, tach khi vuot
- Khong dung emoji trong UI, dung SVG
- Khong comment trong code
- Tieng Viet cho tat ca UI text
- UUID cho tat ca primary keys
- Decimal cho moi truong tien
- Zod validate moi API input

---

### Task 1: Project Scaffolding & Configuration

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.js`, `.env`, `.env.example`, `.gitignore`, `server.js`, `prisma/schema.prisma`, `src/lib/prisma.ts`

**Interfaces:**
- Produces: Prisma client singleton (`src/lib/prisma.ts` exports `prisma`), custom server entry point (`server.js`), configured Next.js project

- [ ] **Step 1: Initialize Next.js project**

```bash
npx -y create-next-app@latest ./ --typescript --tailwind=false --eslint --app --src-dir --import-alias="@/*" --use-npm
```

- [ ] **Step 2: Install dependencies**

```bash
npm install prisma @prisma/client next-auth@4 socket.io socket.io-client zod zustand bcryptjs date-fns sharp uuid
npm install -D @types/bcryptjs @types/uuid
```

- [ ] **Step 3: Create .env and .env.example**

`.env`:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/camera_rental"
NEXTAUTH_SECRET="dev-secret-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

`.env.example`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/camera_rental"
NEXTAUTH_SECRET=""
NEXTAUTH_URL="http://localhost:3000"
```

- [ ] **Step 4: Create custom server**

`server.js`:
```javascript
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    const parsedUrl = parse(req.url, true);
    await handle(req, res, parsedUrl);
  });

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
```

- [ ] **Step 5: Create Prisma client singleton**

`src/lib/prisma.ts`:
```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

- [ ] **Step 6: Update next.config.js for custom server**

`next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["localhost"],
  },
  experimental: {
    serverComponentsExternalPackages: ["sharp"],
  },
};

module.exports = nextConfig;
```

- [ ] **Step 7: Update package.json scripts**

Add to `scripts`:
```json
{
  "dev": "node server.js",
  "build": "next build",
  "start": "NODE_ENV=production node server.js",
  "db:push": "npx prisma db push",
  "db:seed": "npx prisma db seed",
  "db:studio": "npx prisma studio"
}
```

- [ ] **Step 8: Verify project starts**

```bash
npm run dev
```
Expected: Server starts on port 3000 without errors.

- [ ] **Step 9: Commit**

```bash
git init
git add .
git commit -m "feat: project scaffolding with Next.js, Prisma, custom server"
```

---

### Task 2: Database Schema & Seed Data

**Files:**
- Create: `prisma/schema.prisma`, `prisma/seed.ts`
- Modify: `package.json` (add prisma seed config)

**Interfaces:**
- Consumes: Prisma client from `src/lib/prisma.ts`
- Produces: All database models (User, Product, AvailableSlot, Booking, Conversation, Message, Transaction, PaymentSettings, AuditLog)

- [ ] **Step 1: Write Prisma schema**

`prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  ADMIN
  USER
}

enum ProductStatus {
  AVAILABLE
  RENTED
  MAINTENANCE
}

enum SlotStatus {
  OPEN
  BOOKED
  BLOCKED
}

enum DepositStatus {
  PENDING
  PAID
  REFUNDED
}

enum BookingStatus {
  PENDING
  CONFIRMED
  ACTIVE
  COMPLETED
  CANCELLED
}

enum MessageType {
  TEXT
  IMAGE
  PAYMENT_REQUEST
}

enum TransactionType {
  DEPOSIT
  PAYMENT
  REFUND
}

enum TransactionStatus {
  PENDING
  CONFIRMED
  REJECTED
}

model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String
  name         String
  phone        String?
  avatar       String?
  role         Role     @default(USER)
  balance      Decimal  @default(0) @db.Decimal(12, 2)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  bookings      Booking[]
  conversations Conversation[]
  messages      Message[]
  transactions  Transaction[]
  auditLogs     AuditLog[]
}

model Product {
  id              String        @id @default(uuid())
  name            String
  description     String
  images          String[]
  pricePerDay     Decimal       @db.Decimal(12, 2)
  pricePerHour    Decimal       @db.Decimal(12, 2)
  depositRequired Decimal       @db.Decimal(12, 2)
  category        String
  brand           String
  condition       String
  status          ProductStatus @default(AVAILABLE)
  specs           Json?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  slots    AvailableSlot[]
  bookings Booking[]
}

model AvailableSlot {
  id        String     @id @default(uuid())
  productId String
  startDate DateTime
  endDate   DateTime
  status    SlotStatus @default(OPEN)

  product  Product   @relation(fields: [productId], references: [id], onDelete: Cascade)
  bookings Booking[]

  @@index([productId, status])
  @@index([startDate, endDate])
}

model Booking {
  id            String        @id @default(uuid())
  userId        String
  productId     String
  slotId        String
  startDate     DateTime
  endDate       DateTime
  totalPrice    Decimal       @db.Decimal(12, 2)
  depositAmount Decimal       @db.Decimal(12, 2)
  depositStatus DepositStatus @default(PENDING)
  bookingStatus BookingStatus @default(PENDING)
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  user         User          @relation(fields: [userId], references: [id])
  product      Product       @relation(fields: [productId], references: [id])
  slot         AvailableSlot @relation(fields: [slotId], references: [id])
  transactions Transaction[]

  @@index([userId])
  @@index([bookingStatus])
}

model Conversation {
  id        String   @id @default(uuid())
  userId    String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user     User      @relation(fields: [userId], references: [id])
  messages Message[]
}

model Message {
  id             String      @id @default(uuid())
  conversationId String
  senderId       String
  content        String
  type           MessageType @default(TEXT)
  readAt         DateTime?
  createdAt      DateTime    @default(now())

  conversation Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  sender       User         @relation(fields: [senderId], references: [id])

  @@index([conversationId, createdAt])
}

model Transaction {
  id        String            @id @default(uuid())
  userId    String
  bookingId String?
  amount    Decimal           @db.Decimal(12, 2)
  type      TransactionType
  status    TransactionStatus @default(PENDING)
  adminNote String?
  createdAt DateTime          @default(now())

  user    User     @relation(fields: [userId], references: [id])
  booking Booking? @relation(fields: [bookingId], references: [id])

  @@index([userId])
  @@index([status])
}

model PaymentSettings {
  id            String  @id @default(uuid())
  bankName      String
  accountNumber String
  accountHolder String
  qrCodeUrl     String?
}

model AuditLog {
  id         String   @id @default(uuid())
  userId     String
  action     String
  targetType String
  targetId   String
  metadata   Json?
  createdAt  DateTime @default(now())

  user User @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([action])
  @@index([createdAt])
}
```

- [ ] **Step 2: Create seed script**

`prisma/seed.ts`:
```typescript
import { PrismaClient, Role } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await hash("admin123", 12);
  const userPassword = await hash("user123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@camrental.vn" },
    update: {},
    create: {
      email: "admin@camrental.vn",
      passwordHash: adminPassword,
      name: "Admin",
      role: Role.ADMIN,
      phone: "0901234567",
    },
  });

  const user = await prisma.user.upsert({
    where: { email: "user@test.vn" },
    update: {},
    create: {
      email: "user@test.vn",
      passwordHash: userPassword,
      name: "Nguyen Van A",
      role: Role.USER,
      phone: "0909876543",
    },
  });

  const product1 = await prisma.product.create({
    data: {
      name: "Sony A7 IV",
      description: "May anh full-frame 33MP, quay 4K 60fps, IBIS 5 truc",
      images: [],
      pricePerDay: 500000,
      pricePerHour: 100000,
      depositRequired: 5000000,
      category: "Camera",
      brand: "Sony",
      condition: "Moi",
      specs: {
        sensor: "Full-frame 33MP",
        video: "4K 60fps",
        iso: "100-51200",
      },
    },
  });

  const product2 = await prisma.product.create({
    data: {
      name: "Canon EOS R6 Mark II",
      description: "Full-frame 24.2MP, quay 4K 60fps, IBIS 8 stop",
      images: [],
      pricePerDay: 450000,
      pricePerHour: 90000,
      depositRequired: 4500000,
      category: "Camera",
      brand: "Canon",
      condition: "Tot",
      specs: {
        sensor: "Full-frame 24.2MP",
        video: "4K 60fps",
        iso: "100-102400",
      },
    },
  });

  await prisma.paymentSettings.create({
    data: {
      bankName: "Vietcombank",
      accountNumber: "1234567890",
      accountHolder: "NGUYEN VAN ADMIN",
    },
  });

  console.log("Seed completed:", { admin: admin.id, user: user.id, products: [product1.id, product2.id] });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

- [ ] **Step 3: Add seed config to package.json**

Add to `package.json`:
```json
{
  "prisma": {
    "seed": "npx tsx prisma/seed.ts"
  }
}
```

Install tsx:
```bash
npm install -D tsx
```

- [ ] **Step 4: Push schema and seed**

```bash
npx prisma db push
npx prisma db seed
```
Expected: Tables created, seed data inserted without errors.

- [ ] **Step 5: Verify with Prisma Studio**

```bash
npx prisma studio
```
Expected: All tables visible, admin user and 2 products present.

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: database schema with all models and seed data"
```

---

### Task 3: Authentication System

**Files:**
- Create: `src/lib/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`, `src/app/api/auth/register/route.ts`, `src/app/(auth)/login/page.tsx`, `src/app/(auth)/register/page.tsx`, `src/lib/validators.ts`, `src/types/index.ts`, `src/types/next-auth.d.ts`, `src/components/providers/session-provider.tsx`

**Interfaces:**
- Consumes: Prisma client from `src/lib/prisma.ts`
- Produces: `authOptions` config (`src/lib/auth.ts`), `getServerSession(authOptions)` pattern for API routes, `loginSchema` and `registerSchema` Zod validators, NextAuth session with `id` and `role` fields

- [ ] **Step 1: Create TypeScript types**

`src/types/index.ts`:
```typescript
export type { Role, ProductStatus, SlotStatus, DepositStatus, BookingStatus, MessageType, TransactionType, TransactionStatus } from "@prisma/client";
```

`src/types/next-auth.d.ts`:
```typescript
import { Role } from "@prisma/client";

declare module "next-auth" {
  interface User {
    id: string;
    role: Role;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: Role;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}
```

- [ ] **Step 2: Create Zod validators**

`src/lib/validators.ts`:
```typescript
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email khong hop le"),
  password: z.string().min(6, "Mat khau toi thieu 6 ky tu"),
});

export const registerSchema = z.object({
  email: z.string().email("Email khong hop le"),
  password: z.string().min(6, "Mat khau toi thieu 6 ky tu"),
  name: z.string().min(2, "Ten toi thieu 2 ky tu"),
  phone: z.string().optional(),
});

export const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  pricePerDay: z.number().positive(),
  pricePerHour: z.number().positive(),
  depositRequired: z.number().positive(),
  category: z.string().min(1),
  brand: z.string().min(1),
  condition: z.string().min(1),
  specs: z.record(z.string()).optional(),
});

export const slotSchema = z.object({
  productId: z.string().uuid(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

export const bookingSchema = z.object({
  productId: z.string().uuid(),
  slotId: z.string().uuid(),
});

export const messageSchema = z.object({
  content: z.string().min(1).max(2000),
  type: z.enum(["TEXT", "IMAGE", "PAYMENT_REQUEST"]).default("TEXT"),
});

export const paymentSettingsSchema = z.object({
  bankName: z.string().min(1),
  accountNumber: z.string().min(1),
  accountHolder: z.string().min(1),
  qrCodeUrl: z.string().url().optional().or(z.literal("")),
});

export const transactionActionSchema = z.object({
  status: z.enum(["CONFIRMED", "REJECTED"]),
  adminNote: z.string().optional(),
});
```

- [ ] **Step 3: Create NextAuth config**

`src/lib/auth.ts`:
```typescript
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;

        const isValid = await compare(credentials.password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
};
```

- [ ] **Step 4: Create NextAuth route handler**

`src/app/api/auth/[...nextauth]/route.ts`:
```typescript
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

- [ ] **Step 5: Create register API route**

`src/app/api/auth/register/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validators";

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

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        phone: data.phone,
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
```

- [ ] **Step 6: Create login page**

`src/app/(auth)/login/page.tsx`:
```tsx
"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Email hoac mat khau khong dung");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Dang nhap</h1>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Mat khau</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Dang xu ly..." : "Dang nhap"}
          </button>
        </form>
        <p className="auth-link">
          Chua co tai khoan? <Link href="/register">Dang ky</Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Create register page**

`src/app/(auth)/register/page.tsx`:
```tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "", name: "", phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Dang ky that bai");
      return;
    }

    router.push("/login?registered=true");
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Dang ky</h1>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Ho ten</label>
            <input id="name" type="text" value={form.name} onChange={(e) => updateField("name", e.target.value)} required minLength={2} />
          </div>
          <div className="form-group">
            <label htmlFor="reg-email">Email</label>
            <input id="reg-email" type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="phone">So dien thoai</label>
            <input id="phone" type="tel" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="reg-password">Mat khau</label>
            <input id="reg-password" type="password" value={form.password} onChange={(e) => updateField("password", e.target.value)} required minLength={6} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Dang xu ly..." : "Dang ky"}
          </button>
        </form>
        <p className="auth-link">
          Da co tai khoan? <Link href="/login">Dang nhap</Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 8: Create SessionProvider wrapper**

`src/components/providers/session-provider.tsx`:
```tsx
"use client";

import { SessionProvider as NextSessionProvider } from "next-auth/react";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <NextSessionProvider>{children}</NextSessionProvider>;
}
```

- [ ] **Step 9: Verify auth flow**

```bash
npm run dev
```
1. Go to `/register` - create account
2. Go to `/login` - login with created account
3. Check session exists via browser DevTools (cookies)

- [ ] **Step 10: Commit**

```bash
git add .
git commit -m "feat: auth system with NextAuth, login/register pages"
```

---

### Task 4: Middleware & Route Protection

**Files:**
- Create: `src/middleware.ts`, `src/lib/auth-utils.ts`

**Interfaces:**
- Consumes: NextAuth JWT token from session
- Produces: `requireAuth()` and `requireAdmin()` helpers for API routes, route-level protection via middleware

- [ ] **Step 1: Create Next.js middleware**

`src/middleware.ts`:
```typescript
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    if (pathname.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        const publicPaths = ["/", "/products", "/login", "/register"];
        const isPublic = publicPaths.some(
          (p) => pathname === p || pathname.startsWith("/products/") || pathname.startsWith("/api/auth")
        );

        if (isPublic) return true;
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|uploads).*)",
  ],
};
```

- [ ] **Step 2: Create auth utility helpers for API routes**

`src/lib/auth-utils.ts`:
```typescript
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
```

- [ ] **Step 3: Verify middleware**

1. Logout, go to `/dashboard` -> redirect to `/login`
2. Login as user, go to `/admin` -> redirect to `/dashboard`
3. Login as admin, go to `/admin` -> loads normally

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: middleware route protection and auth utilities"
```

---

### Task 5: UI Design System & Layouts

**Files:**
- Create: `src/app/globals.css`, `src/app/layout.tsx`, `src/components/layout/header.tsx`, `src/components/layout/sidebar.tsx`, `src/components/layout/footer.tsx`, `src/components/ui/button.tsx`, `src/components/ui/input.tsx`, `src/components/ui/modal.tsx`, `src/components/ui/badge.tsx`, `src/components/ui/card.tsx`, `src/app/(admin)/admin/layout.tsx`, `src/app/(user)/layout.tsx`

**Interfaces:**
- Consumes: NextAuth session for header user info
- Produces: Reusable UI components (`Button`, `Input`, `Modal`, `Badge`, `Card`), layout shells for public/user/admin

- [ ] **Step 1: Create global CSS design system**

`src/app/globals.css` - design tokens:
```css
:root {
  --bg-primary: #0a0a0f;
  --bg-secondary: #12121a;
  --bg-card: rgba(255, 255, 255, 0.03);
  --bg-glass: rgba(255, 255, 255, 0.05);
  --border-color: rgba(255, 255, 255, 0.08);
  --text-primary: #e8e8ed;
  --text-secondary: #8b8b9e;
  --accent: #6c5ce7;
  --accent-hover: #7c6ef7;
  --success: #00b894;
  --warning: #fdcb6e;
  --danger: #e17055;
  --font-sans: "Inter", system-ui, sans-serif;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --shadow-card: 0 4px 24px rgba(0, 0, 0, 0.3);
}
```

Full CSS includes: reset, typography, component classes (`.btn`, `.btn-primary`, `.btn-secondary`, `.btn-danger`, `.form-group`, `.form-input`, `.card`, `.badge`, `.badge-success`, `.badge-warning`, `.badge-danger`), layout classes (`.admin-layout`, `.admin-sidebar`, `.admin-content`, `.main-content`), auth page classes, animations (fadeIn, slideUp, pulse), responsive breakpoints.

- [ ] **Step 2: Create root layout**

`src/app/layout.tsx`:
```tsx
import { Inter } from "next/font/google";
import { SessionProvider } from "@/components/providers/session-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "vietnamese"] });

export const metadata = {
  title: "CamRental - Cho thue camera chuyen nghiep",
  description: "Nen tang cho thue camera va thiet bi quay phim hang dau Viet Nam",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Create Header component**

`src/components/layout/header.tsx`:
- Logo: SVG camera icon + "CamRental" text
- Nav: Trang chu, San pham
- Auth: Login/Register buttons OR user dropdown (avatar, name, logout)
- Admin link if role=ADMIN
- Hamburger menu on mobile

- [ ] **Step 4: Create Admin Sidebar**

`src/components/layout/sidebar.tsx`:
- SVG icons for each menu item
- Items: Dashboard, San pham, Lich thue, Don thue, Chat, Giao dich, Nhat ky, Cai dat
- Active state from current pathname
- Collapsible on mobile

- [ ] **Step 5: Create Footer**

`src/components/layout/footer.tsx`:
- Copyright, links: Gioi thieu, Lien he, Dieu khoan

- [ ] **Step 6: Create shared UI components**

`src/components/ui/button.tsx`:
```tsx
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`btn btn-${variant} btn-${size} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
```

`src/components/ui/badge.tsx`:
```tsx
interface BadgeProps {
  variant?: "default" | "success" | "warning" | "danger" | "info";
  children: React.ReactNode;
}

export function Badge({ variant = "default", children }: BadgeProps) {
  return <span className={`badge badge-${variant}`}>{children}</span>;
}
```

`src/components/ui/modal.tsx`:
```tsx
"use client";

import { useEffect, useRef } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" ref={overlayRef} onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
```

`src/components/ui/card.tsx`:
```tsx
interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className = "", onClick }: CardProps) {
  return (
    <div className={`card ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}
```

`src/components/ui/input.tsx`:
```tsx
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = "", ...props }, ref) => {
    return (
      <div className="form-group">
        {label && <label htmlFor={id} className="form-label">{label}</label>}
        <input ref={ref} id={id} className={`form-input ${error ? "form-input-error" : ""} ${className}`} {...props} />
        {error && <span className="form-error">{error}</span>}
      </div>
    );
  }
);
Input.displayName = "Input";
```

- [ ] **Step 7: Create Admin layout**

`src/app/(admin)/admin/layout.tsx`:
```tsx
import { Sidebar } from "@/components/layout/sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-content">{children}</main>
    </div>
  );
}
```

- [ ] **Step 8: Create User layout**

`src/app/(user)/layout.tsx`:
```tsx
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="main-content">{children}</main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 9: Verify layouts render**

```bash
npm run dev
```
Check `/`, `/login`, `/dashboard`, `/admin` render with correct layouts.

- [ ] **Step 10: Commit**

```bash
git add .
git commit -m "feat: design system, layouts, and shared UI components"
```

---

### Task 6: Product Management (Admin CRUD)

**Files:**
- Create: `src/app/api/products/route.ts`, `src/app/api/products/[id]/route.ts`, `src/app/api/upload/route.ts`, `src/app/(admin)/admin/products/page.tsx`, `src/app/(admin)/admin/products/new/page.tsx`, `src/app/(admin)/admin/products/[id]/page.tsx`, `src/components/product/product-form.tsx`

**Interfaces:**
- Consumes: `requireAdmin()` from `src/lib/auth-utils.ts`, `productSchema` from `src/lib/validators.ts`, Prisma client
- Produces: Product CRUD APIs (`GET /api/products`, `POST /api/products`, `GET /api/products/[id]`, `PUT /api/products/[id]`, `DELETE /api/products/[id]`), Image upload API (`POST /api/upload`)

- [ ] **Step 1: Create products list + create API**

`src/app/api/products/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";
import { productSchema } from "@/lib/validators";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  const where: Record<string, unknown> = {};
  if (category) where.category = category;
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { brand: { contains: search, mode: "insensitive" } },
    ];
  }

  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { bookings: true } } },
  });

  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const data = productSchema.parse(body);

  const product = await prisma.product.create({
    data: {
      ...data,
      images: body.images || [],
    },
  });

  return NextResponse.json(product, { status: 201 });
}
```

- [ ] **Step 2: Create single product API (GET/PUT/DELETE)**

`src/app/api/products/[id]/route.ts`:
- GET: product by id with slots count and bookings count
- PUT: requireAdmin, validate productSchema, update
- DELETE: requireAdmin, check no active bookings, delete (cascade slots)

- [ ] **Step 3: Create image upload API**

`src/app/api/upload/route.ts`:
- Accept multipart FormData
- Process with sharp (resize max 1200px, webp, quality 80)
- Save to `public/uploads/` with UUID filename
- Return `{ url: "/uploads/filename.webp" }`

- [ ] **Step 4: Create ProductForm component**

`src/components/product/product-form.tsx`:
- Reusable for create + edit (accepts optional `initialData`)
- Fields: name, description, category (dropdown), brand, condition (dropdown), pricePerDay, pricePerHour, depositRequired, specs (dynamic key-value), images (multi-upload with preview)
- Client Zod validation before submit
- Loading spinner on submit button

- [ ] **Step 5: Create admin products list page**

`src/app/(admin)/admin/products/page.tsx`:
- Table: thumbnail, name, category, price/day, status badge, booking count, actions (edit/delete)
- Filter: category dropdown, status dropdown
- Search input
- "Them san pham" button -> `/admin/products/new`
- Delete: confirm modal -> DELETE API

- [ ] **Step 6: Create admin new product page**

`src/app/(admin)/admin/products/new/page.tsx`:
- Renders ProductForm
- On submit: POST `/api/products` -> redirect `/admin/products`

- [ ] **Step 7: Create admin edit product page**

`src/app/(admin)/admin/products/[id]/page.tsx`:
- Fetch product, render ProductForm with initialData
- On submit: PUT `/api/products/[id]` -> redirect `/admin/products`

- [ ] **Step 8: Verify CRUD flow**

1. `/admin/products` -> see seeded products
2. "Them san pham" -> fill form -> submit -> new product in list
3. Edit product -> modify fields -> submit -> changes saved
4. Delete product -> confirm -> removed from list

- [ ] **Step 9: Commit**

```bash
git add .
git commit -m "feat: product CRUD with admin pages and image upload"
```

---

### Task 7: Product Catalog (Public)

**Files:**
- Create: `src/app/(public)/products/page.tsx`, `src/app/(public)/products/[id]/page.tsx`, `src/components/product/product-card.tsx`, `src/components/product/product-grid.tsx`, `src/components/product/product-filter.tsx`, `src/app/page.tsx`

**Interfaces:**
- Consumes: `GET /api/products`, `GET /api/products/[id]`
- Produces: Public product browsing pages, landing page

- [ ] **Step 1: Create ProductCard**

`src/components/product/product-card.tsx`:
- Image (first from array, or SVG camera placeholder)
- Name, brand badge, category badge
- Price: formatted VND per day
- Green dot if AVAILABLE
- Hover: scale(1.02) + shadow transition
- Link wrapping to `/products/[id]`

- [ ] **Step 2: Create ProductGrid**

`src/components/product/product-grid.tsx`:
- CSS grid: 1 col < 640px, 2 cols < 1024px, 3 cols >= 1024px
- Accepts `products` array, renders ProductCard per item
- Empty state: "Khong tim thay san pham nao"

- [ ] **Step 3: Create ProductFilter**

`src/components/product/product-filter.tsx`:
- Search input (debounced 300ms)
- Category dropdown: Tat ca, Camera, Lens, Tripod, Lighting, Audio
- Sort: Gia tang dan, Gia giam dan, Moi nhat
- Horizontal flex layout, wraps on mobile

- [ ] **Step 4: Create catalog page**

`src/app/(public)/products/page.tsx`:
- ProductFilter top
- ProductGrid below
- Fetch from `/api/products` with query params from filter state
- Loading skeleton animation while fetching

- [ ] **Step 5: Create product detail page**

`src/app/(public)/products/[id]/page.tsx`:
- Image gallery: main image + thumbnail row
- Info: name, brand, condition, full description
- Price table: per hour, per day, deposit (formatted VND)
- Specs table from JSON (key-value pairs)
- Calendar preview: read-only SlotCalendar showing available slots
- CTA: "Dat thue" button (if logged in -> opens booking modal, if not -> redirect login)

- [ ] **Step 6: Create landing page**

`src/app/page.tsx`:
- Hero: dark gradient bg, headline "Cho thue camera chuyen nghiep", subtitle, CTA "Xem san pham"
- Featured: latest 6 AVAILABLE products in ProductGrid
- How it works: 3 icon steps (SVG) with labels
- Footer

- [ ] **Step 7: Verify**

1. `/` -> landing with featured products
2. Click product card -> `/products/[id]` -> detail with specs + calendar
3. `/products` -> filter by category -> search -> sort
4. "Dat thue" redirects to login if not authenticated

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "feat: public product catalog, detail, and landing page"
```

---

### Task 8: Slot Management (Admin)

**Files:**
- Create: `src/app/api/slots/route.ts`, `src/app/api/slots/[id]/route.ts`, `src/app/(admin)/admin/slots/page.tsx`, `src/components/calendar/slot-calendar.tsx`, `src/components/calendar/slot-form-modal.tsx`

**Interfaces:**
- Consumes: `requireAdmin()`, `slotSchema`, Prisma, Product list
- Produces: Slot CRUD APIs, reusable SlotCalendar component (`mode: "admin" | "user"`)

- [ ] **Step 1: Create slots API (list + create)**

`src/app/api/slots/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";
import { slotSchema } from "@/lib/validators";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  const month = searchParams.get("month");
  const year = searchParams.get("year");

  const where: Record<string, unknown> = {};
  if (productId) where.productId = productId;
  if (month && year) {
    const start = new Date(parseInt(year), parseInt(month) - 1, 1);
    const end = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
    where.startDate = { gte: start };
    where.endDate = { lte: end };
  }

  const slots = await prisma.availableSlot.findMany({
    where,
    orderBy: { startDate: "asc" },
    include: { product: { select: { name: true } } },
  });

  return NextResponse.json(slots);
}

export async function POST(req: Request) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const data = slotSchema.parse(body);

  const overlap = await prisma.availableSlot.findFirst({
    where: {
      productId: data.productId,
      status: { not: "BLOCKED" },
      OR: [
        { startDate: { lte: new Date(data.endDate) }, endDate: { gte: new Date(data.startDate) } },
      ],
    },
  });

  if (overlap) {
    return NextResponse.json({ error: "Slot bi trung lich" }, { status: 409 });
  }

  const slot = await prisma.availableSlot.create({
    data: {
      productId: data.productId,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    },
  });

  return NextResponse.json(slot, { status: 201 });
}
```

- [ ] **Step 2: Create single slot API (PUT/DELETE)**

`src/app/api/slots/[id]/route.ts`:
- PUT: requireAdmin, update status or dates (check overlap)
- DELETE: requireAdmin, only if status !== BOOKED

- [ ] **Step 3: Create SlotCalendar component**

`src/components/calendar/slot-calendar.tsx`:
- Custom month calendar grid (no external lib for MVP)
- Props: `productId`, `mode: "admin" | "user"`, `onSlotSelect?: (slot) => void`
- Fetch slots for current month from API
- Color: green=OPEN, red=BOOKED, gray=BLOCKED
- Admin mode: click empty day -> create, click slot -> edit
- User mode: click OPEN slot -> triggers onSlotSelect callback
- Prev/next month navigation

- [ ] **Step 4: Create SlotFormModal**

`src/components/calendar/slot-form-modal.tsx`:
- Modal with date + time inputs for start/end
- Pre-fill when editing
- Status toggle for existing (OPEN/BLOCKED)
- Delete button for existing (confirm)
- Submit -> POST or PUT slot API

- [ ] **Step 5: Create admin slots page**

`src/app/(admin)/admin/slots/page.tsx`:
- Product selector dropdown
- SlotCalendar in admin mode
- Stats row: tong slot, da dat, con trong

- [ ] **Step 6: Verify**

1. `/admin/slots` -> select product -> see empty calendar
2. Click date -> create slot -> green on calendar
3. Click slot -> edit/block -> color changes
4. `/products/[id]` -> user sees read-only calendar

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: slot management with calendar view"
```

---

### Task 9: Booking System

**Files:**
- Create: `src/app/api/bookings/route.ts`, `src/app/api/bookings/[id]/route.ts`, `src/app/api/bookings/[id]/status/route.ts`, `src/app/(user)/bookings/page.tsx`, `src/app/(user)/bookings/[id]/page.tsx`, `src/app/(admin)/admin/bookings/page.tsx`, `src/app/(admin)/admin/bookings/[id]/page.tsx`

**Interfaces:**
- Consumes: `requireAuth()`, `requireAdmin()`, `bookingSchema`, Prisma, slot data
- Produces: Booking CRUD APIs, booking pages for user + admin

- [ ] **Step 1: Create bookings API (list + create)**

`src/app/api/bookings/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";
import { bookingSchema } from "@/lib/validators";

export async function GET(req: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (session.user.role !== "ADMIN") where.userId = session.user.id;
  if (status) where.bookingStatus = status;

  const bookings = await prisma.booking.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { name: true, images: true } },
      user: { select: { name: true, email: true } },
      slot: true,
    },
  });

  return NextResponse.json(bookings);
}

export async function POST(req: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const data = bookingSchema.parse(body);

  const slot = await prisma.availableSlot.findUnique({
    where: { id: data.slotId },
    include: { product: true },
  });

  if (!slot || slot.status !== "OPEN") {
    return NextResponse.json({ error: "Slot khong kha dung" }, { status: 400 });
  }

  if (slot.productId !== data.productId) {
    return NextResponse.json({ error: "Slot khong thuoc san pham nay" }, { status: 400 });
  }

  const days = Math.ceil(
    (slot.endDate.getTime() - slot.startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const totalPrice = Number(slot.product.pricePerDay) * Math.max(days, 1);

  const [booking] = await prisma.$transaction([
    prisma.booking.create({
      data: {
        userId: session.user.id,
        productId: data.productId,
        slotId: data.slotId,
        startDate: slot.startDate,
        endDate: slot.endDate,
        totalPrice,
        depositAmount: Number(slot.product.depositRequired),
      },
    }),
    prisma.availableSlot.update({
      where: { id: data.slotId },
      data: { status: "BOOKED" },
    }),
  ]);

  return NextResponse.json(booking, { status: 201 });
}
```

- [ ] **Step 2: Create booking detail + status APIs**

`src/app/api/bookings/[id]/route.ts`:
- GET: booking with product, user, slot, transactions (ownership check for users)

`src/app/api/bookings/[id]/status/route.ts`:
- PATCH: requireAdmin, update bookingStatus
- CANCELLED: revert slot to OPEN
- COMPLETED: handle deposit refund transaction if needed

- [ ] **Step 3: Create user bookings list**

`src/app/(user)/bookings/page.tsx`:
- Filter tabs: Tat ca, Cho xac nhan, Da xac nhan, Dang thue, Hoan thanh, Da huy
- Card per booking: product image, name, dates, total, status badge
- Click -> `/bookings/[id]`

- [ ] **Step 4: Create user booking detail**

`src/app/(user)/bookings/[id]/page.tsx`:
- Product summary (image, name)
- Dates, pricing breakdown
- Status timeline (visual progress: Dat -> Coc -> Xac nhan -> Thue -> Tra)
- If depositStatus=PENDING: PaymentInfo component (QR + bank from PaymentSettings)
- Transaction history table

- [ ] **Step 5: Create admin bookings list**

`src/app/(admin)/admin/bookings/page.tsx`:
- Table: customer, product, dates, total, deposit status, booking status, actions
- Filter by bookingStatus
- Quick action buttons per row

- [ ] **Step 6: Create admin booking detail**

`src/app/(admin)/admin/bookings/[id]/page.tsx`:
- Full info + user info
- Contextual action buttons (Confirm/Reject/Activate/Complete/Cancel)
- Transaction list
- Admin notes

- [ ] **Step 7: Verify booking flow**

1. User: product detail -> select OPEN slot -> "Dat thue" -> booking created PENDING
2. User: `/bookings` -> see pending booking -> click -> see payment info
3. Admin: `/admin/bookings` -> see pending -> Confirm -> status=CONFIRMED
4. Admin: mark ACTIVE -> COMPLETED -> slot freed if cancelled

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "feat: booking system with user and admin management"
```

---

### Task 10: Payment & Transaction System

**Files:**
- Create: `src/app/api/admin/payment-settings/route.ts`, `src/app/api/transactions/route.ts`, `src/app/api/transactions/[id]/route.ts`, `src/app/(admin)/admin/transactions/page.tsx`, `src/app/(admin)/admin/settings/page.tsx`, `src/components/payment/payment-info.tsx`

**Interfaces:**
- Consumes: `requireAdmin()`, `requireAuth()`, `paymentSettingsSchema`, `transactionActionSchema`, Prisma
- Produces: Payment settings API, Transaction APIs, PaymentInfo display component

- [ ] **Step 1: Create payment settings API**

`src/app/api/admin/payment-settings/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireAuth } from "@/lib/auth-utils";
import { paymentSettingsSchema } from "@/lib/validators";

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  const settings = await prisma.paymentSettings.findFirst();
  return NextResponse.json(settings);
}

export async function PUT(req: Request) {
  const { session, error } = await requireAdmin();
  if (error) return error;

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
}
```

- [ ] **Step 2: Create transactions API**

`src/app/api/transactions/route.ts`:
- GET: list (admin=all, user=own), include booking + user info

`src/app/api/transactions/[id]/route.ts`:
- PATCH: requireAdmin, confirm/reject with `transactionActionSchema`
- On CONFIRMED: update related booking.depositStatus=PAID
- On REJECTED: log reason

- [ ] **Step 3: Create PaymentInfo component**

`src/components/payment/payment-info.tsx`:
- Fetch PaymentSettings
- Display: bank name, account number (with copy button), account holder
- Amount to pay + booking reference
- QR code image if exists
- Glass card styling

- [ ] **Step 4: Create admin settings page**

`src/app/(admin)/admin/settings/page.tsx`:
- Form: bankName, accountNumber, accountHolder, qrCodeUrl
- Save -> PUT payment settings
- Preview section showing user-facing view

- [ ] **Step 5: Create admin transactions page**

`src/app/(admin)/admin/transactions/page.tsx`:
- Table: user, booking ref, amount, type badge, status badge, date, actions
- Filter by status (PENDING/CONFIRMED/REJECTED)
- Confirm button -> updates transaction + booking
- Reject button -> modal for admin note -> updates transaction

- [ ] **Step 6: Wire payment into booking detail**

Update `src/app/(user)/bookings/[id]/page.tsx`:
- Show PaymentInfo when depositStatus=PENDING
- Auto-create DEPOSIT transaction when booking is created (add to booking POST API)

- [ ] **Step 7: Verify**

1. Admin: `/admin/settings` -> configure bank info
2. User creates booking -> sees QR + bank info on booking detail
3. Admin: `/admin/transactions` -> confirm payment -> booking deposit=PAID
4. User refreshes booking detail -> sees updated status

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "feat: payment settings, transactions, and QR display"
```

---

### Task 11: Chat System (Socket.io)

**Files:**
- Modify: `server.js` (add Socket.io)
- Create: `src/lib/socket.ts`, `src/hooks/useSocket.ts`, `src/app/api/chat/conversations/route.ts`, `src/app/api/chat/messages/route.ts`, `src/app/(user)/chat/page.tsx`, `src/app/(admin)/admin/chat/page.tsx`, `src/components/chat/chat-window.tsx`, `src/components/chat/message-bubble.tsx`, `src/components/chat/conversation-list.tsx`

**Interfaces:**
- Consumes: `requireAuth()`, `messageSchema`, Prisma, JWT for Socket.io auth
- Produces: Socket.io server, chat UI components, conversation/message APIs

- [ ] **Step 1: Add Socket.io to custom server**

Update `server.js`:
```javascript
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");
const { verify } = require("jsonwebtoken");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    const parsedUrl = parse(req.url, true);
    await handle(req, res, parsedUrl);
  });

  const io = new Server(server, {
    path: "/api/socketio",
    addTrailingSlash: false,
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication required"));

    try {
      const decoded = verify(token, process.env.NEXTAUTH_SECRET);
      socket.data.userId = decoded.id;
      socket.data.role = decoded.role;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const { userId, role } = socket.data;

    socket.on("join_conversation", (conversationId) => {
      socket.join(`conv:${conversationId}`);
    });

    socket.on("send_message", async (data) => {
      io.to(`conv:${data.conversationId}`).emit("new_message", {
        ...data,
        senderId: userId,
        createdAt: new Date().toISOString(),
      });
    });

    socket.on("typing", (data) => {
      socket.to(`conv:${data.conversationId}`).emit("user_typing", {
        userId,
        conversationId: data.conversationId,
      });
    });

    if (role === "ADMIN") {
      socket.join("admin_room");
    }

    socket.on("disconnect", () => {});
  });

  global.io = io;

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
```

- [ ] **Step 2: Create Socket.io client + hook**

`src/lib/socket.ts`:
```typescript
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(token: string): Socket {
  if (!socket) {
    socket = io({
      path: "/api/socketio",
      auth: { token },
      autoConnect: false,
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
```

`src/hooks/useSocket.ts`:
```typescript
"use client";

import { useEffect, useRef, useState } from "react";
import { getSocket, disconnectSocket } from "@/lib/socket";
import type { Socket } from "socket.io-client";

export function useSocket(token: string | null) {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) return;

    const socket = getSocket(token);
    socketRef.current = socket;

    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    socket.connect();

    return () => {
      disconnectSocket();
      setIsConnected(false);
    };
  }, [token]);

  return { socket: socketRef.current, isConnected };
}
```

- [ ] **Step 3: Create conversation + message APIs**

`src/app/api/chat/conversations/route.ts`:
- GET: admin gets all with lastMessage + unreadCount. User gets/creates own.
- POST: create conversation for user (upsert)

`src/app/api/chat/messages/route.ts`:
- GET: `?conversationId=` paginated (limit+cursor), check participant or admin
- POST: create message, save DB, emit via `global.io` if available

- [ ] **Step 4: Create MessageBubble**

`src/components/chat/message-bubble.tsx`:
- Own messages: right-aligned, accent background
- Others: left-aligned, glass background
- Timestamp (format: "14:30" or "Hom qua 14:30")
- PAYMENT_REQUEST type: render as styled payment card with amount

- [ ] **Step 5: Create ChatWindow**

`src/components/chat/chat-window.tsx`:
- Scrollable message list (auto-scroll to bottom)
- Load older on scroll up (infinite scroll)
- Input bar: text input + send button (SVG arrow icon)
- Typing indicator ("dang nhap...")
- Socket listeners: `new_message`, `user_typing`
- Socket emits: `send_message`, `typing`

- [ ] **Step 6: Create ConversationList**

`src/components/chat/conversation-list.tsx`:
- Admin only
- List items: user avatar placeholder, name, last message preview (truncated), timestamp
- Unread count badge
- Active item highlighted
- onClick -> select conversation

- [ ] **Step 7: Create user chat page**

`src/app/(user)/chat/page.tsx`:
- Full viewport height minus header
- Auto-create conversation on mount if not exists
- Connect socket, join conversation room
- Render ChatWindow

- [ ] **Step 8: Create admin chat page**

`src/app/(admin)/admin/chat/page.tsx`:
- Split layout: ConversationList (left 300px) + ChatWindow (right flex)
- Select conversation -> load + display messages
- Socket joins all conversation rooms
- Admin can type PAYMENT_REQUEST messages

- [ ] **Step 9: Verify chat**

1. User `/chat` -> type message -> send
2. Admin `/admin/chat` -> see conversation with badge -> click -> see message
3. Admin replies -> user sees reply realtime
4. Typing indicator shows while other party types

- [ ] **Step 10: Commit**

```bash
git add .
git commit -m "feat: realtime chat with Socket.io"
```

---

### Task 12: Dashboards

**Files:**
- Create: `src/app/api/admin/stats/route.ts`, `src/app/(admin)/admin/page.tsx`, `src/app/(user)/dashboard/page.tsx`, `src/components/dashboard/stat-card.tsx`

**Interfaces:**
- Consumes: `requireAdmin()`, `requireAuth()`, Prisma aggregations
- Produces: Admin stats API, dashboard pages

- [ ] **Step 1: Create admin stats API**

`src/app/api/admin/stats/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalProducts, totalUsers, totalBookings, pendingBookings, activeBookings, monthlyRevenue, pendingTransactions, recentBookings] = await Promise.all([
    prisma.product.count(),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.booking.count(),
    prisma.booking.count({ where: { bookingStatus: "PENDING" } }),
    prisma.booking.count({ where: { bookingStatus: "ACTIVE" } }),
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { status: "CONFIRMED", createdAt: { gte: monthStart } },
    }),
    prisma.transaction.count({ where: { status: "PENDING" } }),
    prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true } },
        product: { select: { name: true } },
      },
    }),
  ]);

  return NextResponse.json({
    totalProducts,
    totalUsers,
    totalBookings,
    pendingBookings,
    activeBookings,
    monthlyRevenue: monthlyRevenue._sum.amount || 0,
    pendingTransactions,
    recentBookings,
  });
}
```

- [ ] **Step 2: Create StatCard**

`src/components/dashboard/stat-card.tsx`:
- Glass card with SVG icon (passed as prop)
- Large value text + small label
- Subtle gradient border hover
- Props: `icon: ReactNode`, `value: string | number`, `label: string`, `trend?: "up" | "down"`

- [ ] **Step 3: Create admin dashboard**

`src/app/(admin)/admin/page.tsx`:
- Grid of StatCards: San pham, Khach hang, Don thue, Doanh thu thang, Cho duyet, GD cho xac nhan
- Recent bookings table (5 latest: customer, product, date, status)
- Quick links to pending items

- [ ] **Step 4: Create user dashboard**

`src/app/(user)/dashboard/page.tsx`:
- Welcome: "Xin chao, {name}"
- StatCards: Don cua toi, Dang thue, So du
- Recent bookings list (own, 5 latest)
- Quick actions: Xem san pham, Tin nhan, Dat thue

- [ ] **Step 5: Verify**

1. Admin dashboard: stats show correct numbers from seed data
2. User dashboard: shows own bookings only

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: admin and user dashboards"
```

---

### Task 13: Audit Log, Rate Limiting & Polish

**Files:**
- Create: `src/lib/audit.ts`, `src/app/api/admin/audit/route.ts`, `src/app/(admin)/admin/audit/page.tsx`, `src/lib/rate-limit.ts`, `src/app/(user)/profile/page.tsx`
- Modify: transaction/booking/product APIs (add audit calls)

**Interfaces:**
- Consumes: `requireAdmin()`, `requireAuth()`, Prisma
- Produces: `logAudit()` helper, audit page, `rateLimit()` helper, profile page

- [ ] **Step 1: Create audit helper**

`src/lib/audit.ts`:
```typescript
import { prisma } from "./prisma";

export async function logAudit(params: {
  userId: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, unknown>;
}) {
  await prisma.auditLog.create({ data: params });
}
```

- [ ] **Step 2: Add audit to existing APIs**

Add `logAudit()` to:
- `src/app/api/transactions/[id]/route.ts` on confirm/reject
- `src/app/api/bookings/[id]/status/route.ts` on status change
- `src/app/api/products/route.ts` on create
- `src/app/api/products/[id]/route.ts` on update/delete

Pattern:
```typescript
await logAudit({
  userId: session.user.id,
  action: "CONFIRM_TRANSACTION",
  targetType: "Transaction",
  targetId: id,
  metadata: { amount, bookingId },
});
```

- [ ] **Step 3: Create audit API**

`src/app/api/admin/audit/route.ts`:
- GET: requireAdmin, list with user info, filter by action/date, paginated

- [ ] **Step 4: Create audit page**

`src/app/(admin)/admin/audit/page.tsx`:
- Table: timestamp, user, action, target, expandable metadata
- Filter: action type, date range

- [ ] **Step 5: Create rate limiter**

`src/lib/rate-limit.ts`:
```typescript
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}
```

- [ ] **Step 6: Apply rate limiting**

- Login: 5 attempts / 15 min per IP
- Register: 3 attempts / 1 hour per IP
- Add to auth API routes: check `rateLimit(ip, limit, window)`, return 429 if exceeded

- [ ] **Step 7: Create user profile page**

`src/app/(user)/profile/page.tsx`:
- Display: name, email, phone, avatar
- Edit form: name, phone, avatar upload
- Change password: current + new + confirm (PUT API)
- Balance display (read-only)

- [ ] **Step 8: Polish pass**

- All pages: `<title>` and `<meta description>` via Next.js metadata
- All forms: loading states, error messages
- All modals: close on Escape and overlay click
- Responsive: test 375px, 768px, 1024px, 1440px
- SVG icons: verify no emoji anywhere in UI
- Animations: fadeIn on page load, slideUp on cards

- [ ] **Step 9: Build verification**

```bash
npm run build
```
Expected: Build completes without TypeScript or compilation errors.

- [ ] **Step 10: Commit**

```bash
git add .
git commit -m "feat: audit logging, rate limiting, profile, and polish"
```

---

## Verification Plan

### Manual Verification

1. **Auth**: Register -> Login -> Session -> Logout -> Protected routes redirect
2. **Products**: Admin CRUD -> appears in public catalog
3. **Slots**: Admin creates on calendar -> user sees on product detail
4. **Booking**: User selects slot -> creates booking -> payment info shown -> admin confirms
5. **Chat**: User sends -> admin receives realtime -> admin replies -> user receives realtime
6. **Payment**: Admin configures bank -> user sees QR/STK -> admin confirms transaction
7. **Dashboard**: Admin stats accurate -> user sees own data
8. **Security**: User blocked from admin routes -> API 403 -> rate limiting works
9. **Responsive**: All pages usable at 375px width

### Build Verification

```bash
npm run build
```
Expected: No errors.
