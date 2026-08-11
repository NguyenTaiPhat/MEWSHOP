# Design Specification: Equipment Comparison, Smart Chat System & Modern Auth Redesign

**Date:** 2026-08-11  
**Project:** Tiệm Của Mew - Cho thuê camera & thiết bị quay phim cao cấp  
**Author:** Jett & PHÁT  

---

## 1. Overview & Objectives

Nâng cấp trải nghiệm thuê máy ảnh, hỗ trợ nhắn tin và giao diện xác thực thành viên lên tiêu chuẩn cao cấp bằng 3 cụm tính năng đột phá:
1. **So Sánh Thiết Bị & Bộ Lưu Trữ Ảnh Mẫu (Equipment Compare & Sample Gallery)**: Cho phép khách thuê đặt 2-3 máy ảnh song song để đối chiếu thông số (cảm biến, độ phân giải, giá thuê, tiền cọc) và xem bộ ảnh chụp mẫu thực tế phóng to sắc nét.
2. **Hệ Thống Thẻ Chat Thông Minh Kiểu Shopee & Mẫu Tin Nhắn Nhanh (Smart Shopee-Style Chat Cards & Quick Responses)**: Khi gửi link/mã sản phẩm hoặc thông tin QR thanh toán trong khung nhắn tin, hệ thống tự động nhận diện và chuyển hóa thành Thẻ Sản Phẩm (Product Card) / Thẻ Thanh Toán QR (QR Payment Card) sang trọng. Tích hợp dải nút phản hồi nhanh (Quick Reply Chips) giúp Admin tư vấn và gửi thông tin chỉ với 1 chạm.
3. **Tái Thiết Kế Giao Diện Đăng Nhập & Đăng Ký (Modern Luxury Auth Redesign)**: Nâng cấp trang `/login` và `/register` thành giao diện Kính Mờ Glassmorphism cao cấp, tích hợp phông chữ `BT-DANTA`, nút Ẩn/Hiện Mật Khẩu dạng Pure CSS/Text Indicator và Tab chuyển đổi Đăng Nhập / Đăng Ký siêu tốc 0ms (TUYỆT ĐỐI KHÔNG DÙNG SVG).

---

## 2. Detailed Feature Architecture

### Feature A: Equipment Comparison & Sample Photo Gallery

#### A1. Smart Comparison System (Side-by-Side Equipment Compare)
- **Nút "+ So sánh"**: Tích hợp trên từng `ProductCard` (Catalog `/products` & Trang chủ) và trang chi tiết `/products/[id]`.
- **Thanh So Sánh Nổi (Floating Compare Bar)**:
  - Khi chọn 1 đến 3 máy ảnh, một thanh Kính mờ trượt nhẹ lơ lửng ở ranh giới phía dưới màn hình (ngay trên Bottom Nav).
  - Hiển thị thumbnail + tên các máy ảnh đã chọn, nút "Xóa tất cả" và nút bấm chính **"Bảng So Sánh"**.
- **Cửa Sổ So Sánh Song Song (Side-by-Side Modal)**:
  - Hiển thị bảng đối chiếu 2-3 cột đĩnh đạc:
    - Giá thuê/ngày & Giá thuê/giờ.
    - Tiền đặt cọc bắt buộc.
    - Loại cảm biến (Full-frame / APS-C / Medium Format).
    - Độ phân giải & Khả năng quay video (4K/8K).
    - Trọng lượng & Tình trạng máy.
    - Nút bấm **"Đặt Thuê Ngay"** trực tiếp cho từng cột sản phẩm.

#### A2. Sample Photo Gallery Lightbox
- **Khối Ảnh Mẫu Thực Tế (Sample Photo Grid)**:
  - Bố trí tại trang chi tiết sản phẩm `/products/[id]` dưới dạng lưới 4 cột Kính mờ sắc nét.
- **Fullscreen Lightbox Modal**:
  - Click vào ảnh bất kỳ để mở Modal phóng to toàn màn hình với nền tối mượt mượt.
  - Tích hợp nút chuyển ảnh `Next / Prev` và nút đóng `✕` hoặc phím `ESC`.

---

### Feature B: Shopee-Style Smart Chat Cards & Quick Replies

#### B1. Auto Product Card Parser (Thẻ Sản Phẩm Kiểu Shopee Trong Chat)
- **Cơ chế nhận diện**: Khi tin nhắn chứa URL sản phẩm (`/products/[id]`) hoặc mã sản phẩm (`#CAM-...`):
  - Khung chat không chỉ hiển thị text thô, mà tự động chuyển hóa thành **Thẻ Sản Phẩm Kính Mờ (Product Chat Card Bubble)**:
    - Ảnh đại diện sản phẩm sắc nét.
    - Tên máy ảnh & thương hiệu.
    - Giá thuê/ngày (`150.000 đ/ngày`) & Tiền cọc.
    - Trạng thái `Sẵn sàng` (Xanh huỳnh quang).
    - Nút bấm **"Xem Chi Tiết"** / **"Đặt Thuê Ngay"** tương tác trực tiếp.

#### B2. Auto QR Payment & Invoice Card (Thẻ Thanh Toán QR Tự Động)
- **Cơ chế nhận diện**: Khi Admin hoặc Khách hàng gửi cú pháp cọc/thanh toán hoặc mã đơn (`#BOOKING-...`):
  - Tự động hiển thị **Thẻ QR Thanh Toán (QR Payment Card Bubble)**:
    - Mã VietQR ngân hàng sắc nét.
    - Tên Ngân hàng, Số tài khoản, Tên chủ tài khoản.
    - Số tiền cọc/thanh toán.
    - Cú pháp nội dung chuyển khoản (`MEMO`).
    - Nút **"Sao chép STK"** / **"Đã chuyển khoản"**.

#### B3. Quick Response Presets (Nút Nạp Mẫu Tin Nhắn Nhanh 1 Chạm)
- **Dải Nút Phản Hồi Nhanh (Quick Reply Chips)**: Bố trí dải chip nút bấm trượt ngang ngay trên ô nhập tin nhắn `chat-input-bar`:
  - `[ Gửi link máy ảnh đang xem ]`: Tự động đính kèm thẻ sản phẩm hiện tại.
  - `[ Gửi QR Thanh Toán Cọc ]`: Tự động nạp Thẻ QR ngân hàng kèm cú pháp.
  - `[ Thủ tục & Giấy tờ thuê ]`: "Dạ chào bạn, thủ tục thuê máy gồm CCCD và tiền cọc..."
  - `[ Địa chỉ & Giờ mở cửa ]`: "Tiệm Của Mew mở cửa từ 8:00 - 21:00 hàng ngày..."
  - `[ Chính sách giao máy ]`: "Tiệm hỗ trợ giao máy tận nơi trong nội thành..."

---

### Feature C: Modern Luxury Auth Redesign (TUYỆT ĐỐI KHÔNG DÙNG SVG)

#### C1. Modern Glassmorphism Layout
- **Giao diện Kính Mờ Cao Cấp**: Thẻ Auth Card nạp hiệu ứng `backdrop-filter: blur(28px); border-radius: var(--radius-xl); box-shadow: var(--shadow-xl)`.
- **Thương hiệu & Logo**: Hiển thị ảnh `/logo.png` kết hợp phông chữ `BT-DANTA` của thương hiệu **TIỆM CỦA MEW** ở ranh giới trên cùng.

#### C2. Pure CSS Input Styling & Text Password Toggle
- **Pure CSS Input Styling**: Các ô nhập liệu (Email, Mật khẩu, Họ tên, Số điện thoại) thiết kế phẳng phiu, viền mượt mượt bằng Pure CSS (KHÔNG DÙNG SVG).
- **Nút Ẩn / Hiện Mật Khẩu (Pure Text Indicator)**: Tích hợp nút nhãn Pure Text `[ Hiện ]` / `[ Ẩn ]` màu cam hổ phách chuyển đổi mật khẩu mượt mượt.

#### C3. Tab Chuyển Đổi Siêu Tốc (Quick Tab Switcher)
- Tích hợp thanh Tab Switcher `[ Đăng Nhập ] | [ Đăng Ký ]` ngay tại chỗ giúp người dùng chuyển đổi qua lại 0ms mà không bị gián đoạn hay tải lại trang.

---

## 3. Data Schema Updates (Prisma SQLite)

```prisma
model Product {
  id              String   @id @default(uuid())
  name            String
  description     String
  images          String   @default("[]")
  videoUrl        String?
  sampleImages    String?  @default("[]") // JSON Array of sample photo URLs
  pricePerDay     Float
  pricePerHour    Float
  depositRequired Float
  category        String
  brand           String
  condition       String
  status          String   @default("AVAILABLE")
  specs           String?  @default("{}")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  slots    AvailableSlot[]
  bookings Booking[]
}

model Message {
  id             String   @id @default(uuid())
  conversationId String
  senderId       String
  content        String
  type           String   @default("TEXT") // TEXT, PRODUCT_CARD, QR_PAYMENT, IMAGE
  metadata       String?  @default("{}")   // JSON storing product/payment details
  readAt         DateTime?
  createdAt      DateTime @default(now())

  conversation Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  sender       User         @relation(fields: [senderId], references: [id], onDelete: Cascade)
}
```

---

## 4. Verification Plan

- [ ] **Test So Sánh Thiết Bị**: Bấm "+ So sánh" 2-3 máy ảnh -> Kiểm tra Floating Compare Bar -> Mở Side-by-Side Compare Modal.
- [ ] **Test Sample Gallery Lightbox**: Mở `/products/[id]` -> Click ảnh mẫu -> Fullscreen Lightbox Modal hoạt động mượt mượt.
- [ ] **Test Shopee Product Card trong Chat**: Gửi link sản phẩm `/products/...` -> Thẻ Product Card Kính mờ hiển thị đúng thông tin.
- [ ] **Test Thẻ QR Thanh Toán & Quick Replies**: Bấm chip `[ Gửi QR Thanh Toán Cọc ]` -> Thẻ VietQR nạp mượt mượt.
- [ ] **Test Auth Redesign (NO SVG)**: Truy cập `/login` & `/register` -> Thử chuyển tab siêu tốc, bấm nút `[ Hiện ]` / `[ Ẩn ]` mật khẩu, kiểm tra giao diện Kính Mờ BT-DANTA thuần Pure CSS (Zero SVG).
