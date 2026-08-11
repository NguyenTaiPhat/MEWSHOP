import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

export const registerSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
  name: z.string().min(2, "Tên tối thiểu 2 ký tự"),
  phone: z.string().optional(),
});

export const productSchema = z.object({
  name: z.string().min(1, "Tên sản phẩm không được trống"),
  description: z.string().min(1, "Mô tả không được trống"),
  pricePerDay: z.number().positive("Giá thuê theo ngày phải lớn hơn 0"),
  pricePerHour: z.number().positive("Giá thuê theo giờ phải lớn hơn 0"),
  depositRequired: z.number().positive("Tiền cọc phải lớn hơn 0"),
  category: z.string().min(1, "Vui lòng chọn danh mục"),
  brand: z.string().min(1, "Vui lòng nhập thương hiệu"),
  condition: z.string().min(1, "Vui lòng chọn tình trạng"),
  videoUrl: z.string().optional().nullable(),
  sampleImages: z.array(z.string()).optional(),
  specs: z.record(z.string(), z.unknown()).optional(),
});

export const slotSchema = z.object({
  productId: z.string().uuid(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

export const bookingSchema = z.object({
  productId: z.string().uuid(),
  slotId: z.string().uuid(),
});

export const messageSchema = z.object({
  content: z.string().min(1, "Nội dung tin nhắn không được trống").max(2000),
  type: z.enum(["TEXT", "IMAGE", "PAYMENT_REQUEST"]).default("TEXT"),
});

export const paymentSettingsSchema = z.object({
  bankName: z.string().min(1, "Tên ngân hàng không được trống"),
  accountNumber: z.string().min(1, "Số tài khoản không được trống"),
  accountHolder: z.string().min(1, "Tên chủ tài khoản không được trống"),
  qrCodeUrl: z.string().url("URL QR code không hợp lệ").optional().or(z.literal("")),
});

export const transactionActionSchema = z.object({
  status: z.enum(["CONFIRMED", "REJECTED"]),
  adminNote: z.string().optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Họ tên tối thiểu 2 ký tự"),
  phone: z.string().optional(),
  address: z.string().optional(),
  idCardNumber: z.string().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
  newPassword: z.string().min(6, "Mật khẩu mới tối thiểu 6 ký tự"),
});

