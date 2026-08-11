"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

export default function UserBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = activeTab ? `?status=${activeTab}` : "";
    fetch(`/api/bookings${params}`)
      .then((r) => r.json())
      .then((data) => setBookings(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeTab]);

  return (
    <div>
      <h1 style={{ marginBottom: "24px" }}>Đơn thuê của tôi</h1>

      <div className="tabs">
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

      {loading ? (
        <div style={{ display: "grid", gap: "12px" }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="card skeleton" style={{ height: "80px" }} />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-title">Chưa có đơn thuê nào</p>
          <p className="empty-state-desc">Hãy đặt thuê thiết bị camera đầu tiên của bạn</p>
          <Link href="/products" className="btn btn-primary">Khám phá máy ảnh</Link>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "12px" }}>
          {bookings.map((b) => (
            <Link key={b.id} href={`/bookings/${b.id}`} style={{ textDecoration: "none", color: "inherit" }}>
              <div className="card card-clickable" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ width: "60px", height: "60px", borderRadius: "var(--radius-md)", background: "var(--bg-tertiary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--text-muted)" }}>
                    <rect x="4" y="8" width="20" height="14" rx="2"/>
                    <circle cx="14" cy="15" r="4"/>
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: "4px" }}>{b.product?.name}</div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                    {formatDate(b.startDate)} - {formatDate(b.endDate)}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 700, marginBottom: "4px" }}>{formatVND(b.totalPrice)}</div>
                  <Badge variant={getStatusVariant(b.bookingStatus)}>{getStatusLabel(b.bookingStatus)}</Badge>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
