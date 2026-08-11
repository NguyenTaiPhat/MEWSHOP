# Modular Vanilla CSS Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement missing Vanilla CSS definitions across global components, product catalog/detail, bookings, and real-time chat interfaces.

**Architecture:** Extend existing Modular Vanilla CSS architecture by updating `components.css`, `products.css`, creating `booking.css` and `chat.css`, and registering them in `src/app/globals.css`.

**Tech Stack:** Next.js (App Router), Vanilla CSS, CSS Variables.

## Global Constraints

- Must use 100% Vanilla CSS with existing CSS Variables (`--accent: #eab308`, `--bg-primary: #08080a`, etc.).
- Absolute zero emojis in UI or CSS.
- Preserve all existing React JSX class names without breaking existing page logic.
- Clean, production-ready code with no comments in CSS files.

---

### Task 1: Global Utilities & Common UI Components (`src/styles/components.css`)

**Files:**
- Modify: `src/styles/components.css`

**Interfaces:**
- Consumes: Design tokens in `src/styles/variables.css` (`--bg-tertiary`, `--accent`, `--border-color`, `--radius-md`).
- Produces: Global class styles for `.main-content`, `.skeleton`, `.empty-state`, `.tabs`, `.tab`, `.card-clickable`.

- [ ] **Step 1: Update `src/styles/components.css` with global utility classes**

Add the following CSS rules to `src/styles/components.css`:

```css
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px 80px;
  min-height: calc(100vh - var(--header-height) - 160px);
}

.skeleton {
  background: linear-gradient(90deg, var(--bg-tertiary) 25%, var(--bg-glass-hover) 50%, var(--bg-tertiary) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite linear;
  border-radius: var(--radius-md);
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  text-align: center;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  backdrop-filter: blur(12px);
}

.empty-state svg {
  color: var(--accent);
  margin-bottom: 16px;
  opacity: 0.8;
}

.empty-state-title {
  font-family: var(--font-heading);
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.empty-state-desc {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-bottom: 24px;
  max-width: 400px;
}

.tabs {
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 12px;
  margin-bottom: 24px;
  overflow-x: auto;
}

.tab {
  padding: 8px 16px;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.tab:hover {
  color: var(--text-primary);
  background: var(--bg-glass);
}

.tab.active {
  color: var(--accent);
  background: var(--accent-subtle);
  border-color: var(--border-color);
  font-weight: 700;
}

.card-clickable {
  cursor: pointer;
  transition: transform var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.card-clickable:hover {
  transform: translateY(-2px);
  border-color: var(--border-hover);
  box-shadow: var(--shadow-md);
}
```

- [ ] **Step 2: Verify CSS formatting**

Check that `components.css` contains no comments or syntax errors.

- [ ] **Step 3: Commit Task 1**

```bash
git add src/styles/components.css
git commit -m "style: add global utilities, skeleton, empty state, and tab component styles"
```

---

### Task 2: Product Catalog & Product Detail Page (`src/styles/products.css`)

**Files:**
- Modify: `src/styles/products.css`

**Interfaces:**
- Consumes: Variables from `variables.css`.
- Produces: CSS layout rules for `/products` and `/products/[id]`.

- [ ] **Step 1: Update `src/styles/products.css` with catalog and detail page layout**

Add the following CSS rules to `src/styles/products.css`:

```css
.product-filter {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.search-input {
  position: relative;
  flex: 1;
  min-width: 260px;
}

.search-input svg {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}

.product-detail {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin-bottom: 48px;
}

.product-gallery {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.product-gallery-main {
  aspect-ratio: 4/3;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.product-gallery-main img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-slow);
}

.product-gallery-main:hover img {
  transform: scale(1.03);
}

.product-gallery-thumbs {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.product-gallery-thumb {
  width: 72px;
  height: 72px;
  border-radius: var(--radius-md);
  border: 2px solid var(--border-color);
  overflow: hidden;
  cursor: pointer;
  opacity: 0.6;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.product-gallery-thumb:hover,
.product-gallery-thumb.active {
  opacity: 1;
  border-color: var(--accent);
  box-shadow: 0 0 12px var(--accent-glow);
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.product-info-brand {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: inline-block;
  margin-right: 12px;
}

.product-info-name {
  font-family: var(--font-heading);
  font-size: 2.25rem;
  font-weight: 800;
  line-height: 1.2;
  color: var(--text-primary);
}

.product-info-desc {
  font-size: 0.95rem;
  color: var(--text-secondary);
  line-height: 1.7;
}

.product-price-table {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 16px;
  backdrop-filter: blur(12px);
}

.product-price-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 8px;
}

.product-price-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.03em;
  margin-bottom: 4px;
}

.product-price-value {
  font-family: var(--font-heading);
  font-size: 1.125rem;
  font-weight: 800;
  color: var(--accent);
}

.product-specs {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 20px;
}

.product-spec-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.product-spec-key {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
}

.product-spec-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.page-section {
  margin-top: 48px;
}

.page-section-title {
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 20px;
  color: var(--text-primary);
}

@media (max-width: 900px) {
  .product-detail {
    grid-template-columns: 1fr;
  }
  .product-info-name {
    font-size: 1.75rem;
  }
}
```

- [ ] **Step 2: Verify CSS validity**

Confirm no syntax error exists in `src/styles/products.css`.

- [ ] **Step 3: Commit Task 2**

```bash
git add src/styles/products.css
git commit -m "style: add product catalog search filter and detail page CSS"
```

---

### Task 3: Booking Status Timeline & Payment QR Card (`src/styles/booking.css` & `src/app/globals.css`)

**Files:**
- Create: `src/styles/booking.css`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: Variables from `variables.css`.
- Produces: CSS rules for `/bookings/[id]` timeline and bank transfer info card.

- [ ] **Step 1: Create `src/styles/booking.css`**

Create `src/styles/booking.css` with the following content:

```css
.status-timeline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  margin-bottom: 40px;
  padding: 24px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  backdrop-filter: blur(12px);
}

.status-timeline::before {
  content: "";
  position: absolute;
  top: 38px;
  left: 48px;
  right: 48px;
  height: 2px;
  background: var(--border-color);
  z-index: 1;
}

.status-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  position: relative;
  z-index: 2;
}

.status-dot {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--bg-secondary);
  border: 2px solid var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  transition: all var(--transition-base);
}

.status-step.completed .status-dot {
  background: var(--accent);
  border-color: var(--accent);
  color: #000;
}

.status-step.active .status-dot {
  background: var(--bg-primary);
  border-color: var(--accent);
  color: var(--accent);
  box-shadow: 0 0 16px var(--accent-glow);
}

.status-step-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.status-step.completed .status-step-label,
.status-step.active .status-step-label {
  color: var(--text-primary);
}

.payment-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-left: 4px solid var(--accent);
  border-radius: var(--radius-lg);
  padding: 24px;
  backdrop-filter: blur(12px);
}

.payment-card-title {
  font-family: var(--font-heading);
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--accent);
  margin-bottom: 16px;
}

.payment-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid var(--border-color);
  font-size: 0.875rem;
}

.payment-info-row:last-of-type {
  border-bottom: none;
}

.payment-info-label {
  color: var(--text-secondary);
}

.payment-info-value {
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.copy-btn {
  padding: 2px 8px;
  font-size: 0.75rem;
  background: var(--accent-subtle);
  color: var(--accent);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xs);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.copy-btn:hover {
  background: var(--accent);
  color: #000;
}

.payment-amount {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--accent);
  text-align: right;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
}

@media (max-width: 640px) {
  .status-timeline {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  .status-timeline::before {
    display: none;
  }
  .status-step {
    flex-direction: row;
  }
}
```

- [ ] **Step 2: Import `booking.css` into `src/app/globals.css`**

Add `@import "../styles/booking.css";` to `src/app/globals.css`.

- [ ] **Step 3: Commit Task 3**

```bash
git add src/styles/booking.css src/app/globals.css
git commit -m "style: create booking timeline and payment card CSS module"
```

---

### Task 4: Real-time Chat Component (`src/styles/chat.css` & `src/app/globals.css`)

**Files:**
- Create: `src/styles/chat.css`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: Variables from `variables.css`.
- Produces: CSS rules for `/chat` and `/admin/chat`.

- [ ] **Step 1: Create `src/styles/chat.css`**

Create `src/styles/chat.css` with the following content:

```css
.chat-messages {
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  scrollbar-width: thin;
  scrollbar-color: var(--border-color) transparent;
}

.chat-empty {
  margin: auto;
  color: var(--text-muted);
  font-size: 0.875rem;
  text-align: center;
}

.chat-bubble {
  max-width: 70%;
  padding: 12px 18px;
  border-radius: var(--radius-lg);
  font-size: 0.9375rem;
  line-height: 1.5;
  position: relative;
  word-break: break-word;
}

.chat-bubble.own {
  margin-left: auto;
  background: linear-gradient(135deg, #eab308, #ca8a04);
  color: #000;
  font-weight: 500;
  border-bottom-right-radius: 2px;
  box-shadow: var(--shadow-sm);
}

.chat-bubble.other {
  margin-right: auto;
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  border-bottom-left-radius: 2px;
  backdrop-filter: blur(12px);
}

.chat-bubble-time {
  font-size: 0.6875rem;
  margin-top: 4px;
  opacity: 0.75;
  text-align: right;
}

.chat-bubble.own .chat-bubble-time {
  color: rgba(0, 0, 0, 0.7);
}

.chat-bubble.other .chat-bubble-time {
  color: var(--text-muted);
}

.chat-input-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  background: var(--bg-tertiary);
  border-top: 1px solid var(--border-color);
}

.chat-input-bar input {
  flex: 1;
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-full);
  padding: 10px 20px;
  color: var(--text-primary);
  font-size: 0.9375rem;
  outline: none;
  transition: all var(--transition-fast);
}

.chat-input-bar input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-subtle);
  background: var(--bg-secondary);
}

.chat-send-btn {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: var(--accent);
  color: #000;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.chat-send-btn:hover {
  background: var(--accent-hover);
  transform: scale(1.05);
  box-shadow: var(--shadow-glow);
}
```

- [ ] **Step 2: Import `chat.css` into `src/app/globals.css`**

Add `@import "../styles/chat.css";` to `src/app/globals.css`.

- [ ] **Step 3: Commit Task 4**

```bash
git add src/styles/chat.css src/app/globals.css
git commit -m "style: create chat interface CSS module for user and admin chat"
```

---

### Task 5: End-to-End Build & Verification

**Files:**
- Verify: Full CSS compilation and dev server check

- [ ] **Step 1: Execute Next.js build command**

Run: `npm run build`  
Expected: Build succeeds with 0 CSS errors.

- [ ] **Step 2: Commit final verification**

```bash
git add .
git commit -m "chore: complete modular Vanilla CSS integration across all pages"
```
