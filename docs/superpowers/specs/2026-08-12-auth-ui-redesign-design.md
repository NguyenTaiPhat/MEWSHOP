# ĐẶC TẢ THIẾT KẾ NÂNG CẤP GIAO DIỆN AUTH (SPLIT-SCREEN VIP SHOWCASE)

## 1. MỤC TIÊU
Thay thế giao diện Đăng Nhập và Đăng Ký đơn điệu hiện tại bằng thiết kế Split-Screen VIP Showcase đẳng cấp. Tận dụng tối đa hai hình ảnh nhiếp ảnh `public/login.jpg` (Lăng Chủ tịch Hồ Chí Minh) và `public/register.jpg` (Chiều hoàng hôn Hồ Xuân Hương Đà Lạt) để tạo ấn tượng thị giác mạnh mẽ cho ứng dụng cho thuê máy ảnh "Tiệm Của Mew".

## 2. BỐ CỤC & TỔ CHỨC KHÔNG GIAN (SPLIT-SCREEN)
- **Kiến trúc Split-Screen (Desktop >= 1024px)**:
  - Màn hình được chia làm 2 cột: Cột Hero Visual (kích thước ~50-55%) và Cột Form điều hướng (~45-50%).
  - Cột Hero Visual hiển thị hình ảnh nhiếp ảnh full-height với tỉ lệ khung hình chuẩn, hiệu ứng phủ gradient vignette tối màu nhẹ để làm nổi bật thông điệp thương hiệu và logo "TIỆM CỦA MEW".
  - Cột Form chứa thẻ Auth Card thiết kế theo phong cách Glassmorphism (kính mờ), bo góc viền tinh tế, các trường nhập liệu có độ phản hồi cao.
- **Phản hồi Responsive (Tablet & Mobile < 1024px)**:
  - Cột Hero Visual tự động co gọn thành banner nghệ thuật phía trên hoặc tích hợp thành nền mờ mượt mà đằng sau form để giữ trải nghiệm người dùng tối ưu trên thiết bị di động.

## 3. THIẾT KẾ THÀNH PHẦN (COMPONENTS & SVG)
- **Hình ảnh Hero linh hoạt**:
  - Trang `/login`: Sử dụng `public/login.jpg`.
  - Trang `/register`: Sử dụng `public/register.jpg`.
- **Biểu tượng đồ họa SVG (Không dùng Emoji hoặc chữ thô)**:
  - SVG Logo Máy ảnh / Khẩu độ ống kính cho nhận diện thương hiệu.
  - SVG Icon cho từng input field: Thư điện tử (Email), Ổ khóa (Password), Người dùng (Name), Điện thoại (Phone).
  - SVG Icon Con mắt / Con mắt gạch chéo cho nút Toggle ẩn/hiện mật khẩu.
- **Thanh chuyển Tab (Segmented Tab Bar)**:
  - Thiết kế bo tròn chuẩn Apple iOS 18, chuyển đổi trạng thái mượt mà giữa `/login` và `/register`.

## 4. CÁC TỆP CẦN THAY ĐỔI
- `src/styles/auth.css`: Nâng cấp toàn bộ hệ thống style, biến số CSS, hiệu ứng chuyển cảnh và responsive layout.
- `src/app/(auth)/login/page.tsx`: Cấu trúc lại giao diện trang Đăng nhập theo chuẩn Split-Screen và nhúng biểu tượng SVG.
- `src/app/(auth)/register/page.tsx`: Cấu trúc lại giao diện trang Đăng ký tương ứng.

## 5. KẾ HOẠCH KIỂM THỬ & XÁC NHẬN
- Xử lý mượt mà chuyển hướng giữa `/login` và `/register`.
- Kiểm tra tính đúng đắn của việc đăng nhập/đăng ký thông qua NextAuth và API `/api/auth/register`.
- Kiểm tra hiển thị hình ảnh `login.jpg` và `register.jpg` trên mọi độ phân giải màn hình.
