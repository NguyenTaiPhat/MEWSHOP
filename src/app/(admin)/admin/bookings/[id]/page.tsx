"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { formatVND, formatDate, formatDateTime, getStatusLabel, getStatusVariant } from "@/lib/utils";

export default function AdminBookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  function loadBooking() {
    setLoading(true);
    fetch(`/api/bookings/${params.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && data.id) {
          setBooking(data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  function loadHistory() {
    fetch("/api/admin/audit")
      .then((r) => (r.ok ? r.json() : []))
      .then((logs) => {
        if (Array.isArray(logs)) {
          const shortId = String(params.id).slice(0, 8).toUpperCase();
          const filtered = logs.filter(
            (l) => l.targetId === params.id || l.action?.includes(shortId) || l.metadata?.includes(shortId)
          );
          setHistory(filtered);
        }
      })
      .catch(() => {});
  }

  useEffect(() => {
    if (params.id) {
      loadBooking();
      loadHistory();
    }
  }, [params.id]);

  async function updateStatus(newStatus: string) {
    try {
      const res = await fetch(`/api/bookings/${params.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updatedData = await res.json();
        if (updatedData && updatedData.id) {
          setBooking(updatedData);
        } else {
          loadBooking();
        }
        loadHistory();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("booking-updated"));
        }
      } else {
        loadBooking();
      }
    } catch {
      loadBooking();
    }
  }

  if (loading) {
    return <div className="skeleton" style={{ height: "300px" }} />;
  }

  if (!booking || !booking.id) {
    return (
      <div style={{ padding: "32px", textAlign: "center" }}>
        <h2>Không tìm thấy đơn thuê</h2>
        <button className="btn btn-secondary" onClick={() => router.back()} style={{ marginTop: "16px" }}>
          Quay lại
        </button>
      </div>
    );
  }

  const bookingIdShort = String(booking.id).slice(0, 8).toUpperCase();

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Chi tiết đơn thuê #{bookingIdShort}</h1>
          <p className="admin-page-subtitle">Nhật ký lịch sử biến động và thông tin quản trị đơn thuê</p>
        </div>
        <button className="btn btn-secondary" onClick={() => router.back()}>
          Quay lại danh sách
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div className="admin-booking-card" style={{ gap: "16px" }}>
            <h3 style={{ fontFamily: "var(--font-brand)", margin: 0, fontSize: "1.15rem" }}>Thông tin khách hàng</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.9375rem" }}>
              <div><strong>Khách hàng:</strong> {booking.user?.name || "Khách hàng"}</div>
              <div><strong>Email:</strong> {booking.user?.email || "Chưa cập nhật"}</div>
              <div><strong>SĐT:</strong> {booking.user?.phone || "Chưa cập nhật"}</div>
            </div>
          </div>

          <div className="admin-booking-card" style={{ gap: "16px" }}>
            <h3 style={{ fontFamily: "var(--font-brand)", margin: 0, fontSize: "1.15rem" }}>Thông tin đơn thuê</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.9375rem" }}>
              <div><strong>Sản phẩm:</strong> {booking.product?.name || "Thiết bị"}</div>
              <div><strong>Thời gian thuê:</strong> {formatDate(booking.startDate)} - {formatDate(booking.endDate)}</div>
              <div><strong>Tổng tiền thuê:</strong> {formatVND(booking.totalPrice)}</div>
              <div><strong>Tiền cọc:</strong> {formatVND(booking.depositAmount)}</div>
            </div>
            <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
              <Badge variant={getStatusVariant(booking.bookingStatus)}>
                {getStatusLabel(booking.bookingStatus)}
              </Badge>
              <Badge variant={getStatusVariant(booking.depositStatus)}>
                Cọc: {getStatusLabel(booking.depositStatus)}
              </Badge>
            </div>
          </div>

          {/* Lịch Sử Đơn Hàng Admin Audit Trail */}
          <div className="admin-booking-card" style={{ gap: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontFamily: "var(--font-brand)", margin: 0, fontSize: "1.15rem" }}>Lịch sử biến động đơn hàng</h3>
              <Badge variant="accent">{history.length} Nhật ký</Badge>
            </div>

            {history.length === 0 ? (
              <div style={{ color: "var(--text-muted)", fontSize: "0.875rem", fontStyle: "italic", padding: "12px 0" }}>
                Chưa có nhật ký biến động riêng cho đơn hàng này. (Đơn được khởi tạo ngày {formatDateTime(booking.createdAt)})
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {history.map((h) => (
                  <div
                    key={h.id}
                    style={{
                      background: "var(--bg-tertiary)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "var(--radius-md)",
                      padding: "12px 14px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong style={{ fontSize: "0.875rem", color: "var(--accent)", fontFamily: "var(--font-brand)" }}>
                        {h.action}
                      </strong>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {formatDateTime(h.createdAt)}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                      {h.details}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="admin-booking-card" style={{ height: "fit-content", gap: "16px" }}>
          <h3 style={{ fontFamily: "var(--font-brand)", margin: 0, fontSize: "1.15rem" }}>Thao tác quản trị</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {booking.bookingStatus === "PENDING" && (
              <button className="btn btn-primary" style={{ fontWeight: 700, justifyContent: "center" }} onClick={() => updateStatus("CONFIRMED")}>
                Duyệt đơn thuê
              </button>
            )}
            {booking.bookingStatus === "CONFIRMED" && (
              <button className="btn btn-primary" style={{ fontWeight: 700, justifyContent: "center" }} onClick={() => updateStatus("ACTIVE")}>
                Bàn giao máy (Đang thuê)
              </button>
            )}
            {booking.bookingStatus === "ACTIVE" && (
              <button className="btn btn-primary" style={{ fontWeight: 700, justifyContent: "center" }} onClick={() => updateStatus("COMPLETED")}>
                Hoàn thành & Hoàn cọc
              </button>
            )}
            {booking.bookingStatus !== "COMPLETED" && booking.bookingStatus !== "CANCELLED" && (
              <button className="btn btn-danger" style={{ fontWeight: 700, justifyContent: "center" }} onClick={() => updateStatus("CANCELLED")}>
                Hủy đơn thuê
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
