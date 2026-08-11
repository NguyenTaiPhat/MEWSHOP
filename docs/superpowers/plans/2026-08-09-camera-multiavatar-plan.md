# Camera-Only Scope & Multiavatar Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-orient the rental application exclusively for Camera rentals and integrate dynamic Multiavatar SVGs across all user & admin UI components.

**Architecture:** Add `getAvatarUrl` helper in `src/lib/utils.ts`, update `Header`, `Profile`, `Chat`, `Admin` layout/components to display SVG avatars, update registration API, and refine camera category lists across product pages.

**Tech Stack:** Next.js (App Router), Prisma, NextAuth, Multiavatar API, Vanilla CSS.

## Global Constraints

- Multiavatar URL pattern: `https://api.multiavatar.com/{seed}.svg`
- Camera categories: `["Tất cả Máy Ảnh", "Cinema Camera", "Mirrorless", "DSLR", "Compact & Vlog"]`
- Clean, buildable code with zero emojis.

---

### Task 1: Multiavatar Helper Utility & Header Avatar Integration

**Files:**
- Modify: `src/lib/utils.ts`
- Modify: `src/components/layout/header.tsx`
- Modify: `src/styles/components.css`

**Interfaces:**
- Consumes: User session data from NextAuth.
- Produces: `getAvatarUrl(identifier?: string | null): string` helper function.

- [ ] **Step 1: Update `src/lib/utils.ts` with `getAvatarUrl`**

Add the following export to `src/lib/utils.ts`:

```typescript
export function getAvatarUrl(identifier?: string | null): string {
  const seed = identifier && identifier.trim() ? identifier.trim() : "tiemcuamew-camera-user";
  return `https://api.multiavatar.com/${encodeURIComponent(seed)}.svg`;
}
```

- [ ] **Step 2: Update `src/components/layout/header.tsx` to render Multiavatar image**

Replace initial letter display in `Header` component with:

```tsx
<div className="header-avatar">
  <img
    src={session.user.avatar || getAvatarUrl(session.user.email || session.user.name)}
    alt={session.user.name || "Avatar"}
    style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
  />
</div>
```

- [ ] **Step 3: Update `.header-avatar` styles in `src/styles/components.css`**

Ensure `.header-avatar` supports images cleanly:

```css
.header-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--accent-subtle);
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}
```

- [ ] **Step 4: Commit Task 1**

```bash
git add src/lib/utils.ts src/components/layout/header.tsx src/styles/components.css
git commit -m "feat: add getAvatarUrl utility and integrate Multiavatar in Header"
```

---

### Task 2: User Profile, Registration API & User Chat Avatars

**Files:**
- Modify: `src/app/(user)/profile/page.tsx`
- Modify: `src/app/api/auth/register/route.ts`
- Modify: `src/app/(user)/chat/page.tsx`

**Interfaces:**
- Consumes: `getAvatarUrl` from `@/lib/utils`.
- Produces: Multiavatar rendering in profile card, chat bubbles, and auto-avatar assignment on signup.

- [ ] **Step 1: Update `src/app/(user)/profile/page.tsx`**

Replace initial avatar in profile card with Multiavatar `<img>`:

```tsx
<div className="header-avatar" style={{ width: "80px", height: "80px", margin: "0 auto 16px" }}>
  <img
    src={getAvatarUrl(session?.user?.email || session?.user?.name)}
    alt={session?.user?.name || "Avatar"}
    style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
  />
</div>
```

- [ ] **Step 2: Update `src/app/api/auth/register/route.ts`**

Set default `avatar: getAvatarUrl(email)` when creating a new user in database.

- [ ] **Step 3: Update `src/app/(user)/chat/page.tsx`**

Display Multiavatar in chat messages.

- [ ] **Step 4: Commit Task 2**

```bash
git add src/app/\(user\)/profile/page.tsx src/app/api/auth/register/route.ts src/app/\(user\)/chat/page.tsx
git commit -m "feat: integrate Multiavatar in profile page, registration route, and user chat"
```

---

### Task 3: Admin Chat & Admin Navigation Avatars

**Files:**
- Modify: `src/app/(admin)/admin/chat/page.tsx`
- Modify: `src/app/(admin)/admin/layout.tsx`

**Interfaces:**
- Consumes: `getAvatarUrl` from `@/lib/utils`.
- Produces: Multiavatar SVGs in Admin conversation lists and sidebar user badge.

- [ ] **Step 1: Update `src/app/(admin)/admin/chat/page.tsx`**

Render `<img src={getAvatarUrl(conv.user?.email || conv.user?.name)} />` in active conversation list items and chat headers.

- [ ] **Step 2: Update `src/app/(admin)/admin/layout.tsx`**

Render Admin Multiavatar badge in admin sidebar footer.

- [ ] **Step 3: Commit Task 3**

```bash
git add src/app/\(admin\)/admin/chat/page.tsx src/app/\(admin\)/admin/layout.tsx
git commit -m "feat: integrate Multiavatar in admin backoffice chat and layout"
```

---

### Task 4: Camera-Only Categories & Catalog Page Restructuring

**Files:**
- Modify: `src/app/(public)/products/page.tsx`
- Modify: `src/app/(admin)/admin/products/new/page.tsx`
- Modify: `src/app/(admin)/admin/products/[id]/page.tsx`

**Interfaces:**
- Consumes: `CAMERA_CATEGORIES` list.
- Produces: Camera-only category filter and camera-only product form dropdowns.

- [ ] **Step 1: Update `src/app/(public)/products/page.tsx`**

Set categories to: `["Tất cả Máy Ảnh", "Cinema Camera", "Mirrorless", "DSLR", "Compact & Vlog"]`.

- [ ] **Step 2: Update Admin product creation and edit forms**

Update category options in `/admin/products/new` and `/admin/products/[id]`.

- [ ] **Step 3: Commit Task 4**

```bash
git add src/app/\(public\)/products/page.tsx src/app/\(admin\)/admin/products/new/page.tsx src/app/\(admin\)/admin/products/\[id\]/page.tsx
git commit -m "feat: update product category filters and forms to camera-only focus"
```

---

### Task 5: End-to-End Build & Verification

**Files:**
- Verify: Next.js production build

- [ ] **Step 1: Run Next.js build**

Run: `npm run build`  
Expected: `✓ Compiled successfully` with 0 type errors.

- [ ] **Step 2: Commit final changes**

```bash
git add .
git commit -m "chore: complete camera-only scope and multiavatar integration"
```
