"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatVND, getStatusLabel, getStatusVariant } from "@/lib/utils";

export default function UserDashboard() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/bookings")
      .then((r) => r.json())
      .then((data) => setBookings(Array.isArray(data) ? data.slice(0, 5) : []))
      .catch(() => {});
  }, []);

  return (
    <div>
      <h1 style={{ marginBottom: "8px" }}>
        Xin chào, {session?.user?.name || "Hội viên"}
      </h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "32px" }}>
        Quản lý các đơn thuê máy ảnh và theo dõi thông tin thiết bị của bạn
      </p>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon-accent">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 2h12a2 2 0 012 2v14l-3-2-3 2-3-2-3 2-3-2V4a2 2 0 012-2z"/>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-value">{bookings.length}</div>
            <div className="stat-label">Đơn của tôi</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-success">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <circle cx="12" cy="12" r="4"/>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-value">{bookings.filter((b) => b.bookingStatus === "ACTIVE").length}</div>
            <div className="stat-label">Đang thuê</div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "12px", marginBottom: "32px" }}>
        <Link href="/products" className="btn btn-primary">Khám phá máy ảnh</Link>
        <Link href="/chat" className="btn btn-secondary">Tin nhắn hỗ trợ</Link>
        <Link href="/bookings" className="btn btn-secondary">Danh sách đơn thuê</Link>
      </div>

      {bookings.length > 0 && (
        <div>
          <h3 style={{ marginBottom: "16px" }}>Đơn thuê gần đây</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Ngày tạo đơn</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} style={{ cursor: "pointer" }} onClick={() => window.location.href = `/bookings/${b.id}`}>
                    <td style={{ fontWeight: 600 }}>{b.product?.name}</td>
                    <td>{new Date(b.startDate).toLocaleDateString("vi-VN")}</td>
                    <td>{formatVND(b.totalPrice)}</td>
                    <td><Badge variant={getStatusVariant(b.bookingStatus)}>{getStatusLabel(b.bookingStatus)}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
