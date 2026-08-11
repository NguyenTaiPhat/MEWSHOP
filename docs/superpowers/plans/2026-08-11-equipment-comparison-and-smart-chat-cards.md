# Equipment Comparison, Smart Chat System & Modern Auth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build side-by-side equipment comparison modal with floating bar, sample photo gallery lightbox, Shopee-style product & QR payment chat cards with 1-touch quick replies, and redesign login/register pages using pure CSS & BT-DANTA font (Zero SVG).

**Architecture:** Next.js App Router client & server components with React state, custom CSS variables, pure CSS styling, and Prisma SQLite data handlers.

**Tech Stack:** Next.js 14, React 18, Prisma, TypeScript, Pure CSS & BT-DANTA font.

## Global Constraints

- **Language & Tone:** 100% Tiếng Việt có dấu, Jett persona sharp tone.
- **Zero Emoji:** Use pure CSS indicators/text labels instead.
- **Zero SVG for Auth:** Login/Register must use pure CSS styling and text indicators (`[ Hiện ]` / `[ Ẩn ]`).
- **Brand Font:** Use `BT-Danta` for brand headers and `Plus Jakarta Sans` for clean typography.

---

### Task 1: Equipment Comparison System (Floating Compare Bar & Side-by-Side Modal)

**Files:**
- Create: `src/components/product/compare-bar.tsx`
- Create: `src/components/product/compare-modal.tsx`
- Modify: `src/components/product/product-card.tsx`
- Modify: `src/styles/components.css`

**Interfaces:**
- Consumes: Product objects `{ id, name, brand, pricePerDay, depositRequired, category, condition, images, specs }`
- Produces: `CompareBar` floating component and `CompareModal` comparison table

- [ ] **Step 1: Create CompareBar floating component**

```tsx
// src/components/product/compare-bar.tsx
"use client";

import { formatVND } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  brand: string;
  pricePerDay: number | string;
  images: string | string[];
}

interface CompareBarProps {
  selectedProducts: Product[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onOpenCompare: () => void;
}

export function CompareBar({ selectedProducts, onRemove, onClear, onOpenCompare }: CompareBarProps) {
  if (selectedProducts.length === 0) return null;

  return (
    <div className="compare-floating-bar">
      <div className="compare-bar-info">
        <span className="compare-bar-badge">{selectedProducts.length}/3</span>
        <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>Máy ảnh đã chọn so sánh</span>
      </div>
      <div className="compare-bar-thumbs">
        {selectedProducts.map((p) => (
          <div key={p.id} className="compare-thumb-chip">
            <span>{p.name}</span>
            <button type="button" onClick={() => onRemove(p.id)} className="compare-chip-remove">
              ✕
            </button>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <button type="button" onClick={onClear} className="btn btn-ghost btn-sm" style={{ color: "var(--text-muted)" }}>
          Xóa hết
        </button>
        <button type="button" onClick={onOpenCompare} className="btn btn-primary btn-sm">
          So Sánh Ngay
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create CompareModal side-by-side table component**

```tsx
// src/components/product/compare-modal.tsx
"use client";

import Link from "next/link";
import { formatVND } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  condition: string;
  pricePerDay: number | string;
  depositRequired: number | string;
  images: string | string[];
  specs?: string | Record<string, any>;
}

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
}

export function CompareModal({ isOpen, onClose, products }: CompareModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content compare-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "900px", width: "95%" }}>
        <div className="modal-header">
          <div style={{ fontWeight: 800, fontSize: "1.25rem", fontFamily: "var(--font-brand)" }}>
            Bảng So Sánh Thiết Bị Song Song
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body" style={{ overflowX: "auto" }}>
          <table className="compare-table">
            <thead>
              <tr>
                <th style={{ width: "160px" }}>Thông số</th>
                {products.map((p) => (
                  <th key={p.id} style={{ minWidth: "220px", textAlign: "center" }}>
                    <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)" }}>{p.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--accent)", textTransform: "uppercase" }}>{p.brand}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="compare-label">Giá thuê / ngày</td>
                {products.map((p) => (
                  <td key={p.id} className="compare-val-highlight">{formatVND(p.pricePerDay)}</td>
                ))}
              </tr>
              <tr>
                <td className="compare-label">Tiền đặt cọc</td>
                {products.map((p) => (
                  <td key={p.id}>{formatVND(p.depositRequired)}</td>
                ))}
              </tr>
              <tr>
                <td className="compare-label">Danh mục</td>
                {products.map((p) => (
                  <td key={p.id}>{p.category}</td>
                ))}
              </tr>
              <tr>
                <td className="compare-label">Tình trạng máy</td>
                {products.map((p) => (
                  <td key={p.id}>{p.condition}</td>
                ))}
              </tr>
              <tr>
                <td className="compare-label">Hành động</td>
                {products.map((p) => (
                  <td key={p.id} style={{ textAlign: "center" }}>
                    <Link href={`/products/${p.id}`} className="btn btn-primary btn-sm" onClick={onClose}>
                      Bấm Thuê Ngay
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Update ProductCard with "+ So sánh" toggle button**

Modify `src/components/product/product-card.tsx` to accept optional `onToggleCompare` and `isCompared` props and render `+ So sánh` button.

- [ ] **Step 4: Add CSS styles for CompareBar and CompareModal**

Add rules for `.compare-floating-bar`, `.compare-table`, `.compare-thumb-chip` in `src/styles/components.css`.

- [ ] **Step 5: Verify TypeScript build**

Run: `npx tsc --noEmit`
Expected: PASS 0 errors.

---

### Task 2: Sample Photo Gallery & Fullscreen Lightbox

**Files:**
- Create: `src/components/product/sample-gallery.tsx`
- Create: `src/components/product/lightbox-modal.tsx`
- Modify: `src/app/(public)/products/[id]/page.tsx`
- Modify: `src/styles/products.css`

- [ ] **Step 1: Create LightboxModal component**

```tsx
// src/components/product/lightbox-modal.tsx
"use client";

import { useEffect } from "react";

interface LightboxModalProps {
  isOpen: boolean;
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export function LightboxModal({ isOpen, images, currentIndex, onClose, onPrev, onNext }: LightboxModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, onPrev, onNext]);

  if (!isOpen || images.length === 0) return null;

  return (
    <div className="lightbox-backdrop" onClick={onClose}>
      <div className="lightbox-container" onClick={(e) => e.stopPropagation()}>
        <button className="lightbox-close" onClick={onClose}>✕</button>
        {images.length > 1 && (
          <>
            <button className="lightbox-nav prev" onClick={onPrev}>‹</button>
            <button className="lightbox-nav next" onClick={onNext}>›</button>
          </>
        )}
        <img src={images[currentIndex]} alt={`Sample photo ${currentIndex + 1}`} className="lightbox-img" />
        <div className="lightbox-caption">
          Ảnh chụp mẫu thực tế ({currentIndex + 1} / {images.length})
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create SampleGallery component**

```tsx
// src/components/product/sample-gallery.tsx
"use client";

import { useState } from "react";
import { LightboxModal } from "./lightbox-modal";

export function SampleGallery({ sampleImages }: { sampleImages: string[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  if (!sampleImages || sampleImages.length === 0) return null;

  return (
    <div className="sample-gallery-section">
      <h3 style={{ marginBottom: "16px", fontFamily: "var(--font-brand)" }}>Ảnh Chụp Mẫu Thực TếTừ Thiết Bị</h3>
      <div className="sample-grid">
        {sampleImages.map((url, idx) => (
          <div
            key={idx}
            className="sample-grid-item"
            onClick={() => {
              setActiveIdx(idx);
              setIsOpen(true);
            }}
          >
            <img src={url} alt={`Sample ${idx + 1}`} />
            <div className="sample-hover-overlay">
              <span>Bấm phóng to</span>
            </div>
          </div>
        ))}
      </div>

      <LightboxModal
        isOpen={isOpen}
        images={sampleImages}
        currentIndex={activeIdx}
        onClose={() => setIsOpen(false)}
        onPrev={() => setActiveIdx((prev) => (prev > 0 ? prev - 1 : sampleImages.length - 1))}
        onNext={() => setActiveIdx((prev) => (prev < sampleImages.length - 1 ? prev + 1 : 0))}
      />
    </div>
  );
}
```

- [ ] **Step 3: Integrate SampleGallery into Product Details Page**

Modify `src/app/(public)/products/[id]/page.tsx` to render `<SampleGallery sampleImages={parsedSampleImages} />`.

- [ ] **Step 4: Add CSS styles for Lightbox & Sample Gallery**

Add rules for `.sample-grid`, `.sample-grid-item`, `.lightbox-backdrop` in `src/styles/products.css`.

- [ ] **Step 5: Verify TypeScript build**

Run: `npx tsc --noEmit`
Expected: PASS 0 errors.

---

### Task 3: Shopee-Style Smart Chat Cards & QR Payment Cards

**Files:**
- Create: `src/components/chat/chat-message-bubble.tsx`
- Modify: `src/app/(user)/chat/page.tsx`
- Modify: `src/components/chat/chat-popup.tsx`
- Modify: `src/styles/chat.css`

- [ ] **Step 1: Create ChatMessageBubble with Auto Product Link & QR Parser**

```tsx
// src/components/chat/chat-message-bubble.tsx
"use client";

import Link from "next/link";
import { formatTime, formatVND } from "@/lib/utils";

interface MessageBubbleProps {
  msg: {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
  };
  isOwn: boolean;
}

export function ChatMessageBubble({ msg, isOwn }: MessageBubbleProps) {
  const isProductLink = msg.content.includes("/products/");
  const isQRRequest = msg.content.includes("STK:") || msg.content.includes("VietQR") || msg.content.includes("CHUYEN_KHOAN");

  return (
    <div className={`chat-bubble ${isOwn ? "own" : "other"}`}>
      {isProductLink ? (
        <div className="chat-product-card-bubble">
          <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--accent)" }}>Thẻ Máy Ảnh Tư Vấn</div>
          <div style={{ fontSize: "0.8125rem", margin: "4px 0" }}>{msg.content}</div>
          <Link href={msg.content.trim()} className="btn btn-primary btn-sm" style={{ marginTop: "6px", width: "100%" }}>
            Xem Chi Tiết Máy
          </Link>
        </div>
      ) : isQRRequest ? (
        <div className="chat-qr-card-bubble">
          <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "#10b981" }}>Thẻ Thanh Toán QR Cọc</div>
          <div style={{ fontSize: "0.8125rem", whiteSpace: "pre-line", margin: "6px 0" }}>{msg.content}</div>
        </div>
      ) : (
        <div>{msg.content}</div>
      )}
      <div className="chat-bubble-time">{formatTime(msg.createdAt)}</div>
    </div>
  );
}
```

- [ ] **Step 2: Update Chat Page & Chat Popup to use ChatMessageBubble**

Modify `src/app/(user)/chat/page.tsx` and `src/components/chat/chat-popup.tsx` to render `<ChatMessageBubble msg={msg} isOwn={isOwn} />`.

- [ ] **Step 3: Add CSS styles for Chat Product & QR Bubbles**

Add rules for `.chat-product-card-bubble` and `.chat-qr-card-bubble` in `src/styles/chat.css`.

- [ ] **Step 4: Verify TypeScript build**

Run: `npx tsc --noEmit`
Expected: PASS 0 errors.

---

### Task 4: Quick Reply Presets (1-Touch Chips)

**Files:**
- Create: `src/components/chat/quick-reply-chips.tsx`
- Modify: `src/app/(user)/chat/page.tsx`
- Modify: `src/components/chat/chat-popup.tsx`
- Modify: `src/styles/chat.css`

- [ ] **Step 1: Create QuickReplyChips component**

```tsx
// src/components/chat/quick-reply-chips.tsx
"use client";

interface QuickReplyChipsProps {
  onSelect: (text: string) => void;
}

const PRESETS = [
  { label: "Gửi QR Cọc", text: "Thông tin thanh toán cọc máy:\nSTK: 1903668899\nNgân hàng: Techcombank\nChủ TK: TIEM CUA MEW\nCú pháp: COC_MAY" },
  { label: "Thủ tục cọc máy", text: "Thủ tục thuê máy gồm: Căn cước công dân gốc + Tiền đặt cọc trước khi nhận máy." },
  { label: "Địa chỉ tiệm", text: "Tiệm Của Mew mở cửa từ 8:00 - 21:00 hàng ngày tại trung tâm thành phố." },
  { label: "Giao nhận tận nơi", text: "Tiệm hỗ trợ giao máy ảnh & ống kính tận nơi trong nội thành." },
];

export function QuickReplyChips({ onSelect }: QuickReplyChipsProps) {
  return (
    <div className="quick-reply-bar">
      {PRESETS.map((p, idx) => (
        <button key={idx} type="button" className="quick-chip-btn" onClick={() => onSelect(p.text)}>
          {p.label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Render QuickReplyChips above chat-input-bar**

Modify `src/app/(user)/chat/page.tsx` and `src/components/chat/chat-popup.tsx` to render `<QuickReplyChips onSelect={(text) => setInput(text)} />`.

- [ ] **Step 3: Add CSS for QuickReplyChips**

Add rules for `.quick-reply-bar` and `.quick-chip-btn` in `src/styles/chat.css`.

- [ ] **Step 4: Verify TypeScript build**

Run: `npx tsc --noEmit`
Expected: PASS 0 errors.

---

### Task 5: Modern Luxury Auth Redesign (Pure CSS & BT-DANTA Font - Zero SVG)

**Files:**
- Modify: `src/app/(auth)/login/page.tsx`
- Modify: `src/app/(auth)/register/page.tsx`
- Modify: `src/styles/auth.css`

- [ ] **Step 1: Redesign Login Page with Pure Text Password Toggle & BT-DANTA Header**

Modify `src/app/(auth)/login/page.tsx`:
- Render logo `/logo.png` with text `TIỆM CỦA MEW` in `font-family: var(--font-brand)`.
- Input fields styled with Pure CSS (Zero SVG).
- Password toggle with Pure Text `[ Hiện ]` / `[ Ẩn ]` button.
- Tab switcher `[ Đăng Nhập ] | [ Đăng Ký ]`.

- [ ] **Step 2: Redesign Register Page with Pure Text Password Toggle & BT-DANTA Header**

Modify `src/app/(auth)/register/page.tsx` matching the same glassmorphism pure CSS design.

- [ ] **Step 3: Add Pure CSS Auth styles in auth.css**

Add rules for `.auth-card`, `.auth-tab-bar`, `.auth-input-group`, `.password-toggle-text` in `src/styles/auth.css`.

- [ ] **Step 4: Final TypeScript & Build Verification**

Run: `npx tsc --noEmit`
Expected: PASS 0 errors.
