# Auth UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Nâng cấp toàn bộ giao diện Đăng nhập (/login) và Đăng ký (/register) thành giao diện Split-Screen VIP Showcase sử dụng các hình ảnh public/login.jpg và public/register.jpg cùng hiệu ứng Kính mờ (Glassmorphism) và biểu tượng SVG.

**Architecture:** Split-screen layout với 50/50 hero visual và auth form card trên desktop, responsive trên tablet/mobile. Toàn bộ icon emoji và nút hiển thị mật khẩu bằng chữ thô sẽ được thay thế bằng biểu tượng vector SVG chuẩn.

**Tech Stack:** Next.js 14, React 18, NextAuth, Vanilla CSS (auth.css).

## Global Constraints

- Trả lời 100% bằng Tiếng Việt.
- Tuyệt đối không sử dụng Emoji trong mã nguồn hoặc UI.
- Tuyệt đối không chèn comment/ghi chú trong mã nguồn TSX hay CSS.

---

### Task 1: Nâng cấp CSS Stylesheet cho giao diện Auth Split-Screen

**Files:**
- Modify: `src/styles/auth.css`

**Interfaces:**
- Consumes: CSS Variables trong `src/styles/variables.css`
- Produces: Hệ thống class `.auth-split-wrapper`, `.auth-hero-panel`, `.auth-form-panel`, `.auth-card`, `.auth-input-icon`, `.auth-svg-icon`, `.auth-hero-content`

- [ ] **Step 1: Cập nhật `src/styles/auth.css`**

Tải và cập nhật `src/styles/auth.css` với đầy đủ các rule thiết kế Split-Screen, hiệu ứng Glassmorphism, phong cách nút bấm và responsive breakpoint.

- [ ] **Step 2: Xử lý và kiểm tra tính hợp lệ của CSS**

Đảm bảo file không chứa comment hay cú pháp lỗi.

- [ ] **Step 3: Commit Task 1**

```bash
git add src/styles/auth.css
git commit -m "style: overhaul auth stylesheet for split screen layout"
```

---

### Task 2: Cấu trúc lại trang Đăng Nhập (/login)

**Files:**
- Modify: `src/app/(auth)/login/page.tsx`

**Interfaces:**
- Consumes: `signIn` từ `next-auth/react`, `logoImg` từ `public/logo.png`, `login.jpg` từ `public/login.jpg`
- Produces: Cấu trúc Split-Screen trang Login với SVG Icons và xử lý Đăng nhập

- [ ] **Step 1: Cập nhật mã nguồn `src/app/(auth)/login/page.tsx`**

Cập nhật lại component `LoginForm` và `LoginPage` để rendering hình ảnh hero `login.jpg` cùng form đăng nhập VIP với các SVG icon tương ứng.

- [ ] **Step 2: Commit Task 2**

```bash
git add src/app/\(auth\)/login/page.tsx
git commit -m "feat: redesign login page with split-screen hero layout and SVG icons"
```

---

### Task 3: Cấu trúc lại trang Đăng Ký (/register)

**Files:**
- Modify: `src/app/(auth)/register/page.tsx`

**Interfaces:**
- Consumes: API POST `/api/auth/register`, `logoImg` từ `public/logo.png`, `register.jpg` từ `public/register.jpg`
- Produces: Cấu trúc Split-Screen trang Register với SVG Icons và xử lý Đăng ký

- [ ] **Step 1: Cập nhật mã nguồn `src/app/(auth)/register/page.tsx`**

Cập nhật lại component `RegisterPage` với 4 ô nhập (Họ tên, Email, Điện thoại, Mật khẩu), hình ảnh hero `register.jpg` và các SVG icon minh họa.

- [ ] **Step 2: Commit Task 3**

```bash
git add src/app/\(auth\)/register/page.tsx
git commit -m "feat: redesign register page with split-screen hero layout and SVG icons"
```

---

### Task 4: Kiểm tra và xác minh hoàn tất build

**Files:**
- Build verification

- [ ] **Step 1: Kiểm tra build ứng dụng Next.js**

Chạy kiểm tra build Next.js hoặc kiểm tra TypeScript để đảm bảo không xảy ra lỗi cú pháp hay thiếu import.
