export type Role = "ADMIN" | "USER";
export type ProductStatus = "AVAILABLE" | "RENTED" | "MAINTENANCE";
export type SlotStatus = "OPEN" | "BOOKED" | "BLOCKED";
export type DepositStatus = "PENDING" | "PAID" | "REFUNDED";
export type BookingStatus = "PENDING" | "CONFIRMED" | "ACTIVE" | "COMPLETED" | "CANCELLED";
export type MessageType = "TEXT" | "IMAGE" | "PAYMENT_REQUEST";
export type TransactionType = "DEPOSIT" | "PAYMENT" | "REFUND";
export type TransactionStatus = "PENDING" | "CONFIRMED" | "REJECTED";
