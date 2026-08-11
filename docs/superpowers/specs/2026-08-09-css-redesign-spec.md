# Design Spec: Modular Vanilla CSS Completion for Camera Rental System

**Date:** 2026-08-09  
**Author:** Jett  
**Scope:** Full CSS styling for all missing components and pages in Camera Rental Web Application

---

## 1. Overview & Objectives

The application currently has complete React JSX components and pages with pre-assigned CSS classes, but lacks corresponding CSS rules in the modular stylesheet system. This design spec establishes the complete styling solution using Vanilla CSS, preserving existing JSX class names and integrating seamlessly with the dark mode gold-accent design system.

---

## 2. Modular Architecture & Directory Structure

All styles will reside in `src/styles/` and be imported into `src/app/globals.css`:

```
src/styles/
├── variables.css      (Existing: Core design tokens, dark mode palette, gold accent)
├── components.css     (Update: Global UI components, main-content, skeleton, empty-state, tabs, card-clickable)
├── home.css           (Existing: Landing page hero & showcase styles)
├── products.css       (Update: Catalog search/filter, product detail 2-column grid, gallery, price grid, specs)
├── booking.css        (NEW: Booking status timeline, step indicators, payment QR card)
├── chat.css           (NEW: Real-time chat layout, message bubbles, active state indicators, input bar)
├── auth.css           (Existing: Login & register glassmorphism forms)
└── admin.css          (Existing: Backoffice dashboard sidebar & table styles)
```

### Manifest Updates in `src/app/globals.css`:
```css
@import "../styles/variables.css";
@import "../styles/components.css";
@import "../styles/home.css";
@import "../styles/admin.css";
@import "../styles/auth.css";
@import "../styles/products.css";
@import "../styles/booking.css";
@import "../styles/chat.css";
@import "../styles/info.css";
```

---

## 3. Comprehensive CSS Component Specifications

### 3.1 Global Utilities & Common Components (`components.css`)

1. **`.main-content`**
   - Max width: `1200px`, centered (`margin: 0 auto`).
   - Padding: `32px 24px 80px`.

2. **`.skeleton` (Loading Shimmer)**
   - Background: `linear-gradient(90deg, var(--bg-tertiary) 25%, var(--bg-glass-hover) 50%, var(--bg-tertiary) 75%)`.
   - Animation: `shimmer 1.5s infinite linear`, background size `200% 100%`.
   - Border radius: `var(--radius-md)`.

3. **`.empty-state`**
   - Centered flex box (`flex-direction: column`, `align-items: center`, `justify-content: center`).
   - Padding: `64px 24px`.
   - SVG icon styling with subtle gold glow.
   - `.empty-state-title`: `font-size: 1.25rem`, `font-weight: 700`, `margin-top: 16px`.
   - `.empty-state-desc`: `color: var(--text-muted)`, `font-size: 0.875rem`, `margin-bottom: 24px`.

4. **`.tabs` & `.tab`**
   - `.tabs`: Flex row with gap `8px`, border-bottom `1px solid var(--border-color)`, padding-bottom `12px`, overflow-x auto.
   - `.tab`: Pill button, padding `8px 16px`, `border-radius: var(--radius-full)`, `color: var(--text-secondary)`, `background: transparent`.
   - `.tab.active`: `background: var(--accent-subtle)`, `color: var(--accent)`, `border: 1px solid var(--border-color)`, `font-weight: 700`.

5. **`.card-clickable`**
   - Cursor pointer, transition transform & box-shadow.
   - Hover: `border-color: var(--border-hover)`, `transform: translateY(-2px)`.

---

### 3.2 Product Catalog & Detail Page (`products.css`)

1. **`.product-filter` & `.search-input`**
   - Flex container with gap `16px`, wrapping on mobile.
   - `.search-input`: Relative wrapper for absolute magnifying glass SVG icon.
   - Input padding left `40px`.

2. **`.product-detail` & `.product-gallery`**
   - Grid layout: 2 columns on desktop (`grid-template-columns: 1fr 1fr`), gap `40px`.
   - `.product-gallery-main`: Aspect ratio `4/3`, background `var(--bg-tertiary)`, border radius `var(--radius-xl)`, border `1px solid var(--border-color)`.
   - `.product-gallery-thumbs`: Flex row with gap `12px`, thumbnail images `80x80px` with active highlight border (`var(--accent)`).

3. **`.product-info` & Detail Elements**
   - `.product-info-brand`: Text transform uppercase, gold color, letter spacing `0.05em`.
   - `.product-info-name`: Font size `2.25rem`, font weight `800`.
   - `.product-info-desc`: Color `var(--text-secondary)`, line height `1.7`.
   - `.product-price-table`: Grid of 3 cards (Hourly, Daily, Deposit) with label and gold formatted currency.
   - `.product-specs`: 2-column key-value list with glass background and subtle borders.

---

### 3.3 Booking Status Timeline & Payment Card (`booking.css`)

1. **`.status-timeline` & `.status-step`**
   - Flex layout across 5 steps (`Dat thue`, `Dat coc`, `Xac nhan`, `Dang thue`, `Hoan thanh`).
   - Connecting track line behind dots.
   - `.status-dot`: `28x28px` circle, default border muted.
   - `.status-step.completed`: Gold fill (`var(--accent)`), dark checkmark icon.
   - `.status-step.active`: Gold outline with glowing aura (`box-shadow: 0 0 12px var(--accent-glow)`).
   - `.status-step-label`: Font size `0.75rem`, font weight `600`.

2. **`.payment-card`**
   - Premium card with dark glass background and gold left-border indicator.
   - `.payment-info-row`: Flex justify-between, border-bottom divider.
   - `.copy-btn`: Compact button with icon for quick account number copying.
   - `.payment-amount`: Font size `1.5rem`, font weight `800`, color `var(--accent)`.

---

### 3.4 Real-time Chat Interface (`chat.css`)

1. **Container & Layout**
   - Height: `calc(100vh - var(--header-height) - 64px)`.
   - Display: Flex column, background `var(--bg-secondary)`, border `1px solid var(--border-color)`, rounded `var(--radius-lg)`.

2. **`.chat-messages` & `.chat-bubble`**
   - Flex-1 overflow scrollable area with custom scrollbar.
   - `.chat-bubble`: Max width `70%`, padding `12px 16px`, border-radius `var(--radius-md)`.
   - `.chat-bubble.own`: Self messages, right aligned (`margin-left: auto`), background `var(--accent)`, color `#000`, font-weight `600`.
   - `.chat-bubble.other`: Received messages, left aligned (`margin-right: auto`), background `var(--bg-glass)`, border `1px solid var(--border-color)`, color `var(--text-primary)`.
   - `.chat-bubble-time`: Small timestamp (`0.6875rem`), muted text.

3. **`.chat-input-bar` & `.chat-send-btn`**
   - Flex input bar at bottom with glass background and top border.
   - Circular send button with hover scale and gold accent glow.

---

## 4. Verification Plan

1. Verify layout across all user & admin routes:
   - `/products`
   - `/products/[id]`
   - `/bookings`
   - `/bookings/[id]`
   - `/chat`
   - `/admin/chat`
   - `/admin/slots`
   - `/admin/settings`
2. Validate responsiveness on desktop, tablet, and mobile views.
3. Confirm zero broken CSS selectors and clean rendering.
