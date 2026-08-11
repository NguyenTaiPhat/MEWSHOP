# User Profile Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the User Profile page (`/profile`) into a modern, multi-tabbed dashboard with native SVG avatars, user profile details, password/security updates, deposit wallet overview, and notification settings.

**Architecture:** Next.js App Router client page with tabbed state management, communicating with Prisma SQLite user API endpoints (`/api/user/profile` and `/api/user/password`). Styled with modular Vanilla CSS tokens.

**Tech Stack:** Next.js 14, React 18, Prisma (SQLite), Vanilla CSS, TypeScript.

## Global Constraints

- **Language & UI Copy:** 100% Vietnamese. No emojis anywhere. Use native inline SVGs for all icons.
- **Styling:** Vanilla CSS design system. Dark Mode palette (`--bg-primary: #09090b`, `--bg-secondary: #16161c`, `--accent: #eab308`).
- **Avatar System:** Native inline SVG Data URI (zero external network requests).

---

### Task 1: Create User Profile API Route for Profile Updates & Summary
**Files:**
- Create: `src/app/api/user/profile/route.ts`
- Modify: `src/lib/validators.ts`

**Interfaces:**
- Consumes: NextAuth `getServerSession`
- Produces: `GET /api/user/profile` (returns user info + balance + booking count), `PUT /api/user/profile` (updates user name, phone, address, idCardNumber)

- [ ] **Step 1: Add profile update validator schema in `src/lib/validators.ts`**
- [ ] **Step 2: Create `GET` and `PUT` handlers in `src/app/api/user/profile/route.ts`**
- [ ] **Step 3: Test API route compilation and build**

---

### Task 2: Create Password Update API Route
**Files:**
- Create: `src/app/api/user/password/route.ts`

**Interfaces:**
- Consumes: `PUT /api/user/password` `{ currentPassword, newPassword }`
- Produces: JSON success response or 400 invalid current password error

- [ ] **Step 1: Create `PUT` handler verifying current password hash using `bcrypt.compare` and updating to new `bcrypt.hash`**
- [ ] **Step 2: Verify error handling for incorrect current password**

---

### Task 3: Redesign Profile Page UI Components & Multi-Tab Layout
**Files:**
- Modify: `src/app/(user)/profile/page.tsx`
- Modify: `src/styles/components.css`

**Interfaces:**
- Consumes: `/api/user/profile`, `/api/user/password`, `getAvatarUrl` from `@/lib/utils`
- Produces: Multi-tab Profile UI with Hero Header, Personal Info Tab, Password Tab, Deposit Wallet Tab, Preferences Tab

- [ ] **Step 1: Add tabbed styles and profile card styles in `src/styles/components.css`**
- [ ] **Step 2: Implement Hero Header with Native SVG Avatar and KPI Summary Bar in `src/app/(user)/profile/page.tsx`**
- [ ] **Step 3: Implement Personal Info Form Tab with saving indicator**
- [ ] **Step 4: Implement Password & Security Tab with verification validation**
- [ ] **Step 5: Implement Deposit Wallet Tab displaying current balance and recent transaction history**
- [ ] **Step 6: Implement Preferences Tab**

---

### Task 4: E2E Build & Functional Verification
**Files:**
- Test: Full build check via `npm run build`

- [ ] **Step 1: Run `npm run build` and verify 35/35 pages compile cleanly**
- [ ] **Step 2: Commit all changes to git**
