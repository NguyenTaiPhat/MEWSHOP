"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { formatVND, formatDate, getStatusLabel, getStatusVariant } from "@/lib/utils";

const statusTabs = [
  { key: "", label: "Tất cả" },
  { key: "PENDING", label: "Chờ duyệt" },
  { key: "CONFIRMED", label: "Đã xác nhận" },
  { key: "ACTIVE", label: "Đang thuê" },
  { key: "COMPLETED", label: "Hoàn thành" },
  { key: "CANCELLED", label: "Đã hủy" },
];

function BookingsContent() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") || "";

  const [bookings, setBookings] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState(initialStatus);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "danger"; message: string } | null>(null);

  // Sync activeTab when URL query param changes
  useEffect(() => {
    const statusParam = searchParams.get("status") || "";
    setActiveTab(statusParam);
  }, [searchParams]);

  function loadBookings(silent = false) {
    if (!silent) setLoading(true);
    const query = activeTab ? `?status=${activeTab}` : "";
    fetch(`/api/bookings${query}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setBookings(Array.isArray(data) ? data : []);
      })
      .catch(() => setBookings([]))
      .finally(() => {
        if (!silent) setLoading(false);
      });
  }

  useEffect(() => {
    loadBookings();
    // Realtime Sync 6s (chỉ poll khi tab active)
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && !document.hidden) {
        loadBookings(true);
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [activeTab]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  async function handleAction(bookingId: string, status: "CONFIRMED" | "CANCELLED") {
    setActionLoading(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();

      if (res.ok) {
        setToast({
          type: "success",
          message: status === "CONFIRMED"
            ? "Đã duyệt đơn thuê thành công!"
            : "Đã hủy đơn thuê thành công!",
        });
        loadBookings();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("booking-updated", { detail: { bookingId, status } }));
          try {
            localStorage.setItem("mew_booking_updated", `${bookingId}_${status}_${Date.now()}`);
          } catch {}
        }
      } else {
        setToast({
          type: "danger",
          message: data.error || "Thao tác thất bại. Vui lòng thử lại.",
        });
      }
    } catch {
      setToast({
        type: "danger",
        message: "Lỗi kết nối mạng. Vui lòng thử lại.",
      });
    } finally {
      setActionLoading(null);
    }
  }

  const safeBookings = Array.isArray(bookings) ? bookings : [];

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Quản lý đơn thuê</h1>
          <p className="admin-page-subtitle">Danh sách thẻ thông tin đơn thuê máy ảnh trên hệ thống</p>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: "24px" }}>
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            className={`tab ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Floating Popup Toast */}
      {toast && (
        <div className={`admin-toast-popup ${toast.type === "success" ? "toast-success" : "toast-danger"}`}>
          <div className="toast-content">
            {toast.type === "success" ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: "2px" }}>
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" strokeLinecap="round"/>
                <polyline points="22 4 12 14.01 9 11.01" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: "2px" }}>
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            )}
            <span>{toast.message}</span>
          </div>
          <button className="toast-close-btn" onClick={() => setToast(null)}>X</button>
        </div>
      )}

      {loading ? (
        <div className="booking-card-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="admin-booking-card skeleton" style={{ height: "200px" }} />
          ))}
        </div>
      ) : safeBookings.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 16px", background: "var(--bg-card)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-color)", color: "var(--text-muted)" }}>
          Không tìm thấy đơn thuê nào
        </div>
      ) : (
        <div className="booking-card-grid">
          {safeBookings.map((b) => {
            const shortId = String(b.id || "").slice(0, 8).toUpperCase();
            const isPending = b.bookingStatus === "PENDING";
            const isThisLoading = actionLoading === b.id;

            return (
              <div key={b.id} className="admin-booking-card">
                <div className="booking-card-header">
                  <div className="booking-card-user">
                    <div className="booking-card-avatar">
                      {(b.user?.name || "K")[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="booking-user-name">{b.user?.name || "Khách hàng"}</div>
                      <div className="booking-code">#{shortId}</div>
                    </div>
                  </div>
                  <Badge variant={getStatusVariant(b.bookingStatus)}>
                    {getStatusLabel(b.bookingStatus)}
                  </Badge>
                </div>

                <div className="booking-card-body">
                  <div className="booking-product-name">{b.product?.name || "Thiết bị máy ảnh"}</div>
                  <div className="booking-meta-row">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <span>{formatDate(b.startDate)} - {formatDate(b.endDate)}</span>
                  </div>

                  <div className="booking-price-row">
                    <div>
                      <span className="booking-price-label">Tổng tiền</span>
                      <div className="booking-price-value">{formatVND(b.totalPrice)}</div>
                    </div>
                    <Badge variant={getStatusVariant(b.depositStatus)}>
                      Cọc: {getStatusLabel(b.depositStatus)}
                    </Badge>
                  </div>
                </div>

                <div className="booking-card-footer" style={{ flexDirection: "column", gap: "8px" }}>
                  {isPending && (
                    <div style={{ display: "flex", gap: "8px", width: "100%" }}>
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ flex: 1, justifyContent: "center", fontWeight: 700 }}
                        disabled={isThisLoading}
                        onClick={() => handleAction(b.id, "CONFIRMED")}
                      >
                        {isThisLoading ? "..." : "Duyệt đơn"}
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        style={{ flex: 1, justifyContent: "center", fontWeight: 700 }}
                        disabled={isThisLoading}
                        onClick={() => handleAction(b.id, "CANCELLED")}
                      >
                        {isThisLoading ? "..." : "Hủy đơn"}
                      </button>
                    </div>
                  )}
                  <Link href={`/admin/bookings/${b.id}`} className="btn btn-secondary btn-sm" style={{ width: "100%", justifyContent: "center", fontWeight: 700 }}>
                    Xem chi tiết đơn →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AdminBookingsPage() {
  return (
    <Suspense fallback={<div className="skeleton" style={{ height: "300px" }} />}>
      <BookingsContent />
    </Suspense>
  );
}
