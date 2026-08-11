"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { formatVND, formatDate, formatDateTime, getStatusLabel, getStatusVariant } from "@/lib/utils";

const timelineSteps = [
  { key: "PENDING", label: "ĐẶT THUÊ" },
  { key: "CONFIRMED", label: "DUYỆT ĐƠN" },
  { key: "PAID", label: "CHUYỂN CỌC" },
  { key: "ACTIVE", label: "ĐANG THUÊ" },
  { key: "COMPLETED", label: "HOÀN THÀNH" },
];

function getTimelineIndex(bookingStatus: string, depositStatus: string): number {
  if (bookingStatus === "COMPLETED") return 4;
  if (bookingStatus === "ACTIVE") return 3;
  if (depositStatus === "PAID") return 2;
  if (bookingStatus === "CONFIRMED") return 1;
  return 0;
}

export default function BookingDetailPage() {
  const params = useParams();
  const [booking, setBooking] = useState<any>(null);
  const [paymentSettings, setPaymentSettings] = useState<any>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  function loadBooking(silent = false) {
    if (!params.id) return;
    fetch(`/api/bookings/${params.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && data.id) setBooking(data);
      })
      .catch(() => {});
  }

  useEffect(() => {
    loadBooking();

    // Fetch VietQR payment settings
    fetch("/api/admin/payment-settings")
      .then((r) => (r.ok ? r.json() : null))
      .then(setPaymentSettings)
      .catch(() => {});

    // Listen to instant booking-updated CustomEvent & Cross-Tab Storage Event
    const handleBookingUpdate = () => loadBooking(true);
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "mew_booking_updated") {
        loadBooking(true);
      }
    };

    window.addEventListener("booking-updated", handleBookingUpdate);
    window.addEventListener("storage", handleStorageChange);

    // Smart Polling every 5s (Chỉ poll khi đơn chưa kết thúc COMPLETED / CANCELLED và tab đang active)
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && !document.hidden) {
        if (booking && (booking.bookingStatus === "COMPLETED" || booking.bookingStatus === "CANCELLED")) {
          return; // Đã xong hoặc đã hủy -> Dừng polling hoàn toàn
        }
        loadBooking(true);
      }
    }, 5000);

    return () => {
      window.removeEventListener("booking-updated", handleBookingUpdate);
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [params.id, booking?.bookingStatus]);

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text);
    setCopiedText(`Đã sao chép ${label}!`);
    setTimeout(() => setCopiedText(null), 2500);
  }

  if (!booking) {
    return <div className="skeleton" style={{ height: "400px" }} />;
  }

  const currentStep = getTimelineIndex(booking.bookingStatus, booking.depositStatus);
  const bookingIdShort = String(booking.id || "").slice(0, 8).toUpperCase();
  const productName = booking.product?.name || "Máy ảnh cao cấp";
  const cleanProductName = productName.replace(/[^a-zA-Z0-9 ]/g, "").trim().slice(0, 15);
  const transferMemo = `Mew ${cleanProductName} #${bookingIdShort}`;
  const depositAmountNumber = Number(booking.depositAmount) || 0;

  // Compute VietQR image URL
  const bankId = paymentSettings?.bankId || "mbb";
  const accNo = paymentSettings?.accountNumber || "090123456789";
  const accHolder = paymentSettings?.accountHolder || "TIEM CUA MEW CAMERA RENTAL";
  const qrCustomUrl = paymentSettings?.qrImageUrl;

  const vietQrUrl = qrCustomUrl
    ? qrCustomUrl
    : `https://img.vietqr.io/image/${bankId}-${accNo}-compact2.png?amount=${depositAmountNumber}&addInfo=${encodeURIComponent(transferMemo)}&accountName=${encodeURIComponent(accHolder)}`;

  // Chỉ hiển thị Khung VietQR cọc ở BƯỚC 3 khi Admin đã duyệt đơn (CONFIRMED) VÀ Khách chưa cọc xong (PAID)
  const isDepositStepActive = booking.bookingStatus === "CONFIRMED" && booking.depositStatus !== "PAID";

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "24px 16px" }}>
      <h1 style={{ marginBottom: "4px", fontFamily: "var(--font-brand)", fontSize: "1.85rem" }}>Chi tiết đơn thuê</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "28px", fontSize: "0.875rem" }}>
        Mã đơn: <strong style={{ color: "var(--accent)" }}>#{bookingIdShort}</strong>
      </p>

      {/* Segmented Card Badges Progress Stepper Realtime VIP */}
      <div className="segmented-stepper-grid" style={{ marginBottom: "32px" }}>
        {timelineSteps.map((step, idx) => {
          const isFullCompleted = booking.bookingStatus === "COMPLETED";
          const isCompleted = isFullCompleted || idx < currentStep;
          const isActive = !isFullCompleted && idx === currentStep;

          let statusText = "Chưa đến";
          if (booking.bookingStatus === "CANCELLED") {
            statusText = "Đã hủy";
          } else if (isCompleted) {
            statusText = "Đã xong";
          } else if (isActive) {
            statusText = "Đang xử lý";
          }

          return (
            <div
              key={step.key}
              className={`segmented-step-card ${isCompleted ? "completed" : ""} ${isActive ? "active" : ""}`}
            >
              <div className="segmented-step-head">
                <span className="segmented-step-num">BƯỚC 0{idx + 1}</span>
                {isCompleted ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : isActive ? (
                  <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", background: "#fff" }} />
                ) : null}
              </div>
              <h4 className="segmented-step-title">{step.label}</h4>
              <span className="segmented-step-status">
                {statusText}
              </span>
            </div>
          );
        })}
      </div>

      {/* KHUNG MÃ VIETQR ĐỘNG HIỂN THỊ Ở BƯỚC 3 THEO Ý PHÁT */}
      {isDepositStepActive && (
        <div style={{ background: "var(--bg-card)", border: "2px solid var(--accent)", borderRadius: "var(--radius-xl)", padding: "24px", marginBottom: "32px", boxShadow: "0 12px 36px var(--accent-subtle)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <div>
              <h3 style={{ margin: 0, fontFamily: "var(--font-brand)", fontSize: "1.3rem", color: "var(--accent)" }}>
                Bước 3: Thanh Toán Đặt Cọc VietQR
              </h3>
              <p style={{ margin: "4px 0 0 0", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                Đơn thuê đã được Admin duyệt! Quét mã QR bên dưới để cọc tiền giữ máy.
              </p>
            </div>
            <Badge variant="warning">Đang chờ cọc</Badge>
          </div>

          {copiedText && (
            <div style={{ background: "var(--success-subtle)", color: "var(--success)", padding: "8px 12px", borderRadius: "var(--radius-md)", fontSize: "0.875rem", fontWeight: 700, textAlign: "center", marginBottom: "16px" }}>
              {copiedText}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: "20px", alignItems: "center", background: "var(--bg-secondary)", padding: "20px", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-color)" }}>
            <div style={{ width: "160px", height: "160px", borderRadius: "var(--radius-md)", overflow: "hidden", border: "2px solid var(--accent-subtle)", background: "#fff", padding: "6px" }}>
              <img src={vietQrUrl} alt="Mã VietQR Đặt Cọc" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--text-secondary)", fontSize: "0.9375rem" }}>Số tiền cần cọc:</span>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <strong style={{ color: "var(--accent)", fontSize: "1.35rem", fontFamily: "var(--font-brand)" }}>
                    {formatVND(depositAmountNumber)}
                  </strong>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => copyToClipboard(String(depositAmountNumber), "Số tiền cọc")}
                  >
                    Sao chép
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--text-secondary)", fontSize: "0.9375rem" }}>Nội dung ck:</span>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <strong style={{ color: "var(--text-primary)", fontFamily: "var(--font-brand)", fontSize: "1.05rem" }}>
                    {transferMemo}
                  </strong>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => copyToClipboard(transferMemo, "Nội dung ghi chú")}
                  >
                    Sao chép
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", color: "var(--text-muted)", paddingTop: "8px", borderTop: "1px dashed var(--border-color)" }}>
                <span>Ngân hàng:</span>
                <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{paymentSettings?.bankName || "MBBank"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", color: "var(--text-muted)" }}>
                <span>Số tài khoản:</span>
                <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{accNo}</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: "16px", textAlign: "center", fontSize: "0.8125rem", color: "var(--text-secondary)", fontStyle: "italic" }}>
            *Sau khi chuyển khoản cọc thành công, hệ thống tự động xác nhận đơn trong ít phút.
          </div>
        </div>
      )}

      {/* Banner thông báo Bước 1 nếu đơn PENDING */}
      {booking.bookingStatus === "PENDING" && (
        <div style={{ background: "var(--accent-subtle)", border: "1px solid var(--accent)", borderRadius: "var(--radius-lg)", padding: "16px 20px", marginBottom: "32px", display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--accent)", color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, flexShrink: 0 }}>
            1
          </div>
          <div>
            <h4 style={{ margin: 0, fontFamily: "var(--font-brand)", fontSize: "1rem", color: "var(--text-primary)" }}>
              Bước 1: Đang chờ Admin xác nhận đơn thuê
            </h4>
            <p style={{ margin: "2px 0 0 0", fontSize: "0.84375rem", color: "var(--text-secondary)" }}>
              Yêu cầu thuê máy của bạn đã được gửi. Ngay khi Admin xác nhận đơn, Mã VietQR chuyển cọc sẽ tự động hiển thị tại Bước 2 bên trên.
            </p>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
        {/* Thông tin sản phẩm Null-Safe */}
        <div className="card" style={{ gap: "12px" }}>
          <h3 style={{ fontFamily: "var(--font-brand)", fontSize: "1.15rem", margin: 0 }}>Thông tin sản phẩm</h3>
          <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "var(--radius-md)", overflow: "hidden", background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", flexShrink: 0 }}>
              {(() => {
                if (!booking.product?.images) {
                  return (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)" }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                        <circle cx="12" cy="13" r="4"/>
                      </svg>
                    </div>
                  );
                }
                try {
                  const imgs = typeof booking.product.images === "string" ? JSON.parse(booking.product.images) : booking.product.images;
                  const firstImg = Array.isArray(imgs) ? imgs[0] : imgs;
                  return firstImg ? <img src={firstImg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null;
                } catch {
                  return null;
                }
              })()}
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: "1.05rem", fontFamily: "var(--font-brand)" }}>
                {booking.product?.name || "Thiết bị máy ảnh cao cấp"}
              </h4>
              <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                {booking.product?.brand ? `${booking.product.brand} - ` : ""}Thiết Bị Thuê
              </span>
            </div>
          </div>
        </div>

        {/* Thời gian thuê & Trạng thái Realtime */}
        <div className="card" style={{ gap: "12px" }}>
          <h3 style={{ fontFamily: "var(--font-brand)", fontSize: "1.15rem", margin: 0 }}>Thời gian thuê</h3>
          <div style={{ fontWeight: 600, fontSize: "1rem", color: "var(--text-primary)" }}>
            {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
          </div>
          <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
            <Badge variant={getStatusVariant(booking.bookingStatus)}>
              {getStatusLabel(booking.bookingStatus)}
            </Badge>
            <Badge variant={booking.depositStatus === "PAID" ? "success" : "warning"}>
              {booking.depositStatus === "PAID" ? "Đã đặt cọc" : "Chưa cọc"}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
