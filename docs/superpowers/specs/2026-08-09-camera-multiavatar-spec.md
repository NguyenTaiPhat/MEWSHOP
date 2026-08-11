# Design Spec: Camera-Only Scope & Multiavatar Integration

**Date:** 2026-08-09  
**Author:** Jett  
**Scope:** Re-orient product categories exclusively for Camera Rentals and integrate Multiavatar dynamic SVG avatars across user & admin interfaces.

---

## 1. Objectives

1. **Camera-Only Business Focus:** Restructure categories, search filters, and copy across landing, catalog, and admin pages to focus 100% on camera rentals (Cinema, Mirrorless, DSLR, Compact/Vlog).
2. **Dynamic Avatar System:** Integrate `https://api.multiavatar.com/` dynamic SVG avatar generator for all user accounts, displaying custom avatars across Header, Profile, Chat, and Admin Backoffice.

---

## 2. Technical Specifications

### 2.1 Multiavatar Helper Utility (`src/lib/utils.ts`)

Add a global helper function:
```typescript
export function getAvatarUrl(identifier?: string | null): string {
  const seed = identifier && identifier.trim() ? identifier.trim() : "mew-camera-user";
  return `https://api.multiavatar.com/${encodeURIComponent(seed)}.svg`;
}
```

### 2.2 Camera Category Standardization

Updated Categories List across `/products`, `/admin/products/new`, `/admin/products/[id]`:
```typescript
export const CAMERA_CATEGORIES = [
  "Tất cả Máy Ảnh",
  "Cinema Camera",
  "Mirrorless",
  "DSLR",
  "Compact & Vlog"
];
```

### 2.3 UI & Component Updates

1. **Header Component (`src/components/layout/header.tsx`):**
   - Replace initial text rendering `session.user.name?.charAt(0)` with `<img src={getAvatarUrl(session.user.email || session.user.name)} alt={session.user.name} className="header-avatar-img" />`.
   - Update `.header-avatar` CSS to support clean rounded image overflow.

2. **User Profile Page (`src/app/(user)/profile/page.tsx`):**
   - Display full size Multiavatar SVG avatar badge (`80x80px`).

3. **Chat Components (`src/app/(user)/chat/page.tsx`, `src/app/(admin)/admin/chat/page.tsx`):**
   - Render sender's Multiavatar beside chat message bubbles and conversation list items.

4. **Registration & Auth (`src/app/api/auth/register/route.ts`):**
   - Auto-fill `avatar` URL using `getAvatarUrl(email)` when new user registers.

5. **Catalog & Admin Pages (`src/app/(public)/products/page.tsx`, `/admin/products/...`):**
   - Restructure search filter options to `CAMERA_CATEGORIES`.

---

## 3. Verification Plan

1. Verify Next.js build compilation (`npm run build`).
2. Test user registration and confirm Multiavatar URL generation.
3. Test avatar rendering on Header, Profile, and Chat pages.
4. Verify Camera-only category filter on `/products`.
