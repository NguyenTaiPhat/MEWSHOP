# Design Spec: User Profile Page Redesign

## 1. Overview & Goals
Redesign the User Profile page (`/profile`) for **Tiệm Của Mew Camera Rental** into a premium, multi-functional dashboard.

Goals:
1. **Native SVG Avatar System**: Eliminate all external network dependencies for avatar fetching. Avatars render instantly via native inline SVG Data URIs matching the Gold/Dark theme (`#eab308`).
2. **Comprehensive Profile Management**: Allow users to manage personal details, default delivery address, identity verification (CCCD/CMND required for camera rental deposits), and account security.
3. **Rental Balance & Activity Center**: Provide visibility into rental deposit balances, transaction logs, and quick actions for deposit top-up or refund requests.
4. **Modern UI/UX**: Multi-tab navigation (`Thông tin cá nhân`, `Đổi mật khẩu & Bảo mật`, `Ví cọc & Giao dịch`, `Cài đặt thông báo`), smooth transitions, responsive layout, and dark-mode aesthetic with zero emojis.

---

## 2. Component Architecture

### A. Profile Header & Hero Card
- **Large Native Avatar Ring**: 100px diameter circle with gold gradient border (`#eab308`).
- **User Metadata Block**:
  - Full Name (`session.user.name`)
  - Email (`session.user.email`)
  - Role Badge (`Hội viên VIP` or `Quản trị viên`)
- **Quick KPI Summary Bar**:
  - `Tổng đơn thuê`: Number of bookings created by user
  - `Số dư ví cọc`: `formatVND(user.balance)`
  - `Trạng thái CCCD`: `Đã xác thực` / `Chưa xác thực`

### B. Tabbed Navigation (`.tabs`)
1. **Tab 1: Thông tin cá nhân (Profile Details)**
   - Input fields: `Họ và tên`, `Email` (disabled), `Số điện thoại`, `Địa chỉ giao nhận máy ảnh`.
   - Identification fields: `Số CCCD/CMND` (required for high-value camera rental contracts).
   - `Lưu thay đổi` button with loading state.
2. **Tab 2: Đổi mật khẩu (Security & Password)**
   - Input fields: `Mật khẩu hiện tại`, `Mật khẩu mới`, `Xác nhận mật khẩu mới`.
   - `Cập nhật mật khẩu` button.
3. **Tab 3: Ví cọc & Giao dịch (Deposit Wallet)**
   - Balance Card displaying current deposit balance in VND.
   - Action buttons: `Yêu cầu rút cọc`, `Nạp cọc trực tuyến`.
   - Transaction History table displaying date, transaction type (`DEPOSIT`, `PAYMENT`, `REFUND`), amount, and status (`PENDING`, `CONFIRMED`, `REJECTED`).
4. **Tab 4: Cài đặt thông báo (Preferences)**
   - Checkboxes for `Nhận email nhắc lịch trả máy ảnh`, `Nhận thông báo khi đơn được duyệt`.

---

## 3. Data Models & API Requirements

### User Model Extensions
- Update `/api/user/profile` PUT handler to update `name`, `phone`, `address`, `idCardNumber`.
- Update `/api/user/password` PUT handler to handle password verification & hash update using `bcryptjs`.
- Fetch `/api/user/profile` GET handler to retrieve current balance and transaction summary.

---

## 4. Design Guidelines & Aesthetics
- **Theme**: Slate Dark Mode (`#09090b` background, `#16161c` cards, `#eab308` primary accent).
- **Typography**: Inter / Outfit sans-serif hierarchy.
- **Icons**: 100% native SVG vector icons (no font icon packages, zero emojis).
