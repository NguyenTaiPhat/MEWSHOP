# Camera Rental Platform - Design Spec

## Tổng quan

Website cho thuê camera/thiết bị quay phim. Hệ thống có 2 role: Admin (quản lý) và User (khách thuê). Admin đăng sản phẩm, tạo slot khả dụng, xác nhận thanh toán, chat với khách. User xem sản phẩm, đặt thuê theo slot, cọc tiền qua chuyển khoản, chat với admin.

## Tech Stack

| Thành phần | Công nghệ |
|---|---|
| Framework | Next.js 14+ (App Router) + Custom Server |
| Language | TypeScript |
| ORM | Prisma |
| Database | PostgreSQL |
| Auth | NextAuth.js (email/password, bcryptjs) |
| Realtime | Socket.io (attach vào custom server) |
| Validation | Zod |
| State | Zustand |
| Date | date-fns |
| Image | sharp |
| Calendar | react-big-calendar hoặc custom |

**Approach:** Monolith Next.js + Socket.io. Một codebase duy nhất, custom server để attach Socket.io lên cùng HTTP server với Next.js.

---

## Data Model

### User
| Field | Type | Note |
|---|---|---|
| id | UUID | PK |
| email | String | Unique |
| passwordHash | String | bcrypt |
| name | String | |
| phone | String? | |
| avatar | String? | URL |
| role | Enum: ADMIN, USER | Default USER |
| balance | Decimal | Default 0, số dư |
| createdAt | DateTime | |
| updatedAt | DateTime | |

### Product
| Field | Type | Note |
|---|---|---|
| id | UUID | PK |
| name | String | |
| description | String | |
| images | String[] | URLs |
| pricePerDay | Decimal | |
| pricePerHour | Decimal | |
| depositRequired | Decimal | Tiền cọc yêu cầu |
| category | String | VD: Camera, Lens, Tripod |
| brand | String | |
| condition | String | VD: Mới, Tốt, Khá |
| status | Enum: AVAILABLE, RENTED, MAINTENANCE | |
| specs | Json | Thông số kỹ thuật |
| createdAt | DateTime | |
| updatedAt | DateTime | |

### AvailableSlot
| Field | Type | Note |
|---|---|---|
| id | UUID | PK |
| productId | UUID | FK → Product |
| startDate | DateTime | |
| endDate | DateTime | |
| status | Enum: OPEN, BOOKED, BLOCKED | Default OPEN |

### Booking
| Field | Type | Note |
|---|---|---|
| id | UUID | PK |
| userId | UUID | FK → User |
| productId | UUID | FK → Product |
| slotId | UUID | FK → AvailableSlot |
| startDate | DateTime | |
| endDate | DateTime | |
| totalPrice | Decimal | |
| depositAmount | Decimal | |
| depositStatus | Enum: PENDING, PAID, REFUNDED | |
| bookingStatus | Enum: PENDING, CONFIRMED, ACTIVE, COMPLETED, CANCELLED | |
| createdAt | DateTime | |
| updatedAt | DateTime | |

### Conversation
| Field | Type | Note |
|---|---|---|
| id | UUID | PK |
| userId | UUID | FK → User, mỗi user 1 conversation |
| createdAt | DateTime | |
| updatedAt | DateTime | |

### Message
| Field | Type | Note |
|---|---|---|
| id | UUID | PK |
| conversationId | UUID | FK → Conversation |
| senderId | UUID | FK → User |
| content | String | |
| type | Enum: TEXT, IMAGE, PAYMENT_REQUEST | |
| readAt | DateTime? | null = chưa đọc |
| createdAt | DateTime | |

### Transaction
| Field | Type | Note |
|---|---|---|
| id | UUID | PK |
| userId | UUID | FK → User |
| bookingId | UUID? | FK → Booking, nullable |
| amount | Decimal | |
| type | Enum: DEPOSIT, PAYMENT, REFUND | |
| status | Enum: PENDING, CONFIRMED, REJECTED | |
| adminNote | String? | |
| createdAt | DateTime | |

### PaymentSettings
| Field | Type | Note |
|---|---|---|
| id | UUID | PK |
| bankName | String | |
| accountNumber | String | |
| accountHolder | String | |
| qrCodeUrl | String? | |

### AuditLog
| Field | Type | Note |
|---|---|---|
| id | UUID | PK |
| userId | UUID | FK → User |
| action | String | VD: CONFIRM_PAYMENT |
| targetType | String | VD: Booking |
| targetId | String | |
| metadata | Json? | |
| createdAt | DateTime | |

---

## Bảo mật

### Auth Layer (NextAuth.js)
- Password hash: bcrypt
- Session: JWT (stateless)
- CSRF protection tự động
- HttpOnly cookie, Secure flag production

### Authorization (Middleware)
- Next.js middleware.ts: route-level guard theo role
- API routes: getServerSession() + role check
- User chỉ truy cập data của chính mình

### Data Validation
- Zod validate mọi input client
- Prisma parameterized queries chống SQL injection

### Rate Limiting
- Giới hạn login attempts chống brute force
- Giới hạn API calls per IP/user

### WebSocket Security
- Socket.io handshake: gửi JWT token
- Server verify token trước khi cho connect
- User chỉ join room conversation của mình

### Audit
- AuditLog ghi lại mọi hành động quan trọng liên quan tài chính và quản lý

---

## Page Structure

### Public
| Route | Mô tả |
|---|---|
| `/` | Landing page, sản phẩm nổi bật |
| `/products` | Catalog với filter/search |
| `/products/[id]` | Chi tiết + calendar xem slot |
| `/login` | Đăng nhập |
| `/register` | Đăng ký |

### User (authenticated)
| Route | Mô tả |
|---|---|
| `/dashboard` | Tổng quan: booking gần nhất, số dư |
| `/bookings` | Danh sách đơn thuê |
| `/bookings/[id]` | Chi tiết đơn + thanh toán |
| `/chat` | Chat với admin |
| `/profile` | Thông tin cá nhân |

### Admin
| Route | Mô tả |
|---|---|
| `/admin` | Dashboard thống kê |
| `/admin/products` | CRUD sản phẩm |
| `/admin/products/new` | Tạo sản phẩm |
| `/admin/products/[id]` | Sửa sản phẩm |
| `/admin/slots` | Quản lý slot (calendar) |
| `/admin/bookings` | Tất cả đơn thuê |
| `/admin/bookings/[id]` | Chi tiết + xác nhận/từ chối |
| `/admin/chat` | Tất cả conversations |
| `/admin/transactions` | Giao dịch + xác nhận thanh toán |
| `/admin/audit` | Nhật ký hệ thống |
| `/admin/settings` | Cài đặt bank/QR |

---

## User Flows

### Flow 1: Thuê máy
1. User xem catalog → chọn sản phẩm → xem calendar (slot xanh=còn, đỏ=hết)
2. Chọn slot → tạo booking (PENDING) → hệ thống hiện QR/STK để cọc
3. User chuyển khoản ngoài app
4. Admin vào transactions → xác nhận cọc → booking CONFIRMED
5. Đến ngày → admin đánh dấu ACTIVE
6. Trả máy → admin đánh dấu COMPLETED, xử lý hoàn cọc nếu cần

### Flow 2: Chat
1. User vào /chat → Socket.io connect (JWT) → load tin nhắn cũ
2. Gõ tin → gửi qua Socket → lưu DB + broadcast cho admin
3. Admin thấy danh sách conversations (badge unread) → chọn conversation → chat realtime

### Flow 3: Thanh toán cọc
1. Admin cấu hình bank info + QR trong settings
2. User tạo booking → hệ thống tạo Transaction (PENDING) → hiện QR + STK + số tiền + mã đơn
3. User chuyển khoản bên ngoài
4. Admin xác nhận → Transaction CONFIRMED → depositStatus=PAID

### Flow 4: Admin quản lý slot
1. Admin vào /admin/slots → chọn sản phẩm
2. Calendar hiện slot theo màu trạng thái
3. Click ngày → tạo slot mới (giờ bắt đầu/kết thúc)
4. Click slot có sẵn → sửa/xóa/block

---

## Cấu trúc dự án

```
webcam/
├── server.js                    Custom server (Next.js + Socket.io)
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/                     App Router pages
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── (auth)/login, register
│   │   ├── (public)/products
│   │   ├── (user)/dashboard, bookings, chat, profile
│   │   ├── (admin)/admin/*
│   │   └── api/                 API routes
│   ├── components/
│   │   ├── ui/                  Button, Input, Modal, Badge...
│   │   ├── layout/              Header, Sidebar, Footer
│   │   ├── calendar/            Calendar component dùng chung
│   │   ├── chat/                ChatWindow, MessageBubble, ConversationList
│   │   └── product/             ProductCard, ProductGrid, ProductFilter
│   ├── lib/
│   │   ├── prisma.ts            Prisma client singleton
│   │   ├── auth.ts              NextAuth config
│   │   ├── socket.ts            Socket.io client helper
│   │   ├── validators.ts        Zod schemas
│   │   └── utils.ts             Helpers
│   ├── hooks/
│   │   ├── useSocket.ts
│   │   └── useAuth.ts
│   ├── middleware.ts            Auth + role guard
│   └── types/index.ts
├── public/uploads/              Ảnh sản phẩm (MVP)
└── .env
```

### Custom Server
- server.js tạo HTTP server, attach Next.js handler + Socket.io
- Socket.io middleware verify JWT từ handshake
- Events: connection, send_message, typing, disconnect

### Middleware Chain
- middleware.ts check path pattern → redirect theo role
- API routes tự check session + role
- 401/403 nếu không hợp lệ

---

## Ghi chú MVP

- Upload ảnh lưu `public/uploads/`, sau chuyển S3/Cloudinary
- Calendar component dùng chung, props khác cho user (readonly) vs admin (editable)
- Conversation 1-1: mỗi user có đúng 1 cuộc hội thoại với admin
- Zustand cho client state (chat, UI), không cần Redux
