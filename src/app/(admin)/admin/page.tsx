"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatVND, formatDate, getStatusLabel, getStatusVariant } from "@/lib/utils";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);

  function loadStats(silent = false) {
    if (!silent && !stats) setStats(null);
    fetch("/api/admin/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setStats(data);
      })
      .catch(() => {});
  }

  useEffect(() => {
    loadStats();

    // Instant Event Listener when booking status is updated
    const handleBookingUpdate = () => loadStats(true);
    window.addEventListener("booking-updated", handleBookingUpdate);

    // Smart Polling 5s (only poll if document is visible to prevent HTTP 429)
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && !document.hidden) {
        loadStats(true);
      }
    }, 5000);

    return () => {
      window.removeEventListener("booking-updated", handleBookingUpdate);
      clearInterval(interval);
    };
  }, []);

  if (!stats) {
    return (
      <div>
        <div className="admin-page-header">
          <div>
            <h1 className="admin-page-title">Tổng quan hệ thống</h1>
            <p className="admin-page-subtitle">Trung tâm điều hành & chỉ số kinh doanh Tiệm Của Mew</p>
          </div>
        </div>
        <div className="stat-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="stat-card skeleton" style={{ height: "110px" }} />
          ))}
        </div>
      </div>
    );
  }

  const safeRecentBookings = Array.isArray(stats.recentBookings) ? stats.recentBookings : [];

  return (
    <div>
      {/* Executive Welcome Banner Topbar */}
      <div className="admin-welcome-banner">
        <div>
          <h1 className="admin-welcome-title">Trung tâm điều hành Tiệm Của Mew</h1>
          <p className="admin-welcome-sub">Hệ thống cho thuê máy ảnh đang vận hành ổn định. Cập nhật mới nhất hôm nay.</p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <Link href="/admin/products/new" className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Thêm sản phẩm mới
          </Link>
        </div>
      </div>

      {/* 4 Key Performance Indicators (KPI Stat Cards) */}
      <div className="stat-grid">
        <Link href="/admin/bookings?status=CONFIRMED" className="stat-card" style={{ textDecoration: "none", cursor: "pointer" }}>
          <div className="stat-icon stat-icon-warning">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-value">{formatVND(stats.activeDepositsAmount || 0)}</div>
            <div className="stat-label">Tiền cọc đang giữ ({stats.activeDepositsCount || 0} đơn)</div>
          </div>
        </Link>

        <div className="stat-card">
          <div className="stat-icon stat-icon-success">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-value">{formatVND(stats.actualRevenue || 0)}</div>
            <div className="stat-label">Doanh thu tiền thuê thực tế</div>
          </div>
        </div>

        <Link href="/admin/bookings?status=PENDING" className="stat-card" style={{ textDecoration: "none", cursor: "pointer" }}>
          <div className="stat-icon stat-icon-accent">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.pendingBookings || 0}</div>
            <div className="stat-label">Đơn thuê chờ phê duyệt</div>
          </div>
        </Link>

        <Link href="/admin/users" className="stat-card" style={{ textDecoration: "none", cursor: "pointer" }}>
          <div className="stat-icon stat-icon-accent">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="4"/>
              <path d="M4 20c0-4 4-7 8-7s8 3 8 7"/>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.totalUsers || 0}</div>
            <div className="stat-label">Khách hàng hệ thống</div>
          </div>
        </Link>
      </div>

      {/* Main Command Center Layout 2 Columns */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
        {/* Left Column: Recent Bookings in Card Grid Format */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <h3 style={{ fontFamily: "var(--font-brand)", fontSize: "1.25rem", margin: 0 }}>Đơn thuê mới cập nhật (Card Grid)</h3>
            <Link href="/admin/bookings" className="btn btn-ghost btn-sm" style={{ color: "var(--accent)", fontWeight: 700 }}>
              Xem tất cả đơn thuê →
            </Link>
          </div>

          {safeRecentBookings.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 16px", background: "var(--bg-card)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-color)", color: "var(--text-muted)" }}>
              Chưa có đơn thuê mới nào
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
              {safeRecentBookings.map((b: any) => {
                const shortId = String(b.id || "").slice(0, 8).toUpperCase();
                return (
                  <div key={b.id} className="admin-booking-card" style={{ padding: "16px" }}>
                    <div className="booking-card-header">
                      <div className="booking-card-user">
                        <div className="booking-card-avatar" style={{ width: "32px", height: "32px", fontSize: "0.8125rem" }}>
                          {(b.user?.name || "K")[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="booking-user-name" style={{ fontSize: "0.875rem" }}>{b.user?.name || "Khách hàng"}</div>
                          <div className="booking-code">#{shortId}</div>
                        </div>
                      </div>
                      <Badge variant={getStatusVariant(b.bookingStatus)}>
                        {getStatusLabel(b.bookingStatus)}
                      </Badge>
                    </div>

                    <div className="booking-card-body" style={{ padding: "10px 0" }}>
                      <div className="booking-product-name" style={{ fontSize: "1rem" }}>{b.product?.name || "Thiết bị máy ảnh"}</div>
                      <div className="booking-meta-row">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                          <line x1="16" y1="2" x2="16" y2="6"/>
                          <line x1="8" y1="2" x2="8" y2="6"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        <span>{formatDate(b.startDate)} - {formatDate(b.endDate)}</span>
                      </div>
                    </div>

                    <div className="booking-card-footer">
                      <Link href={`/admin/bookings/${b.id}`} className="btn btn-secondary btn-sm" style={{ width: "100%", justifyContent: "center", fontWeight: 700 }}>
                        Chi tiết đơn →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Device Status Ratio & Quick Operations Hub */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Quick Operations Hub Card */}
          <div className="admin-booking-card" style={{ gap: "14px" }}>
            <h3 style={{ fontFamily: "var(--font-brand)", fontSize: "1.125rem", margin: 0 }}>Phím tắt điều hành</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <Link href="/admin/bookings?status=PENDING" className="btn btn-secondary btn-sm" style={{ justifyContent: "flex-start", gap: "10px", color: "var(--warning)", fontWeight: 700 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2" strokeLinecap="round"/>
                </svg>
                Đơn thuê chờ duyệt ({stats.pendingBookings || 0})
              </Link>
              <Link href="/admin/transactions" className="btn btn-secondary btn-sm" style={{ justifyContent: "flex-start", gap: "10px" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 8v4M12 16h.01"/>
                </svg>
                Giao dịch nạp/rút chờ duyệt ({stats.pendingTransactions || 0})
              </Link>
              <Link href="/admin/slots" className="btn btn-secondary btn-sm" style={{ justifyContent: "flex-start", gap: "10px" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                </svg>
                Quản lý khung giờ & Lịch thuê
              </Link>
              <Link href="/admin/settings" className="btn btn-secondary btn-sm" style={{ justifyContent: "flex-start", gap: "10px" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
                </svg>
                Cài đặt VietQR & Ngân hàng
              </Link>
            </div>
          </div>

          {/* Device Status Ratio Card */}
          <div className="admin-booking-card" style={{ gap: "12px" }}>
            <h3 style={{ fontFamily: "var(--font-brand)", fontSize: "1.125rem", margin: 0 }}>Trạng thái kho máy ảnh</h3>
            <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Tổng thiết bị:</span>
                <strong style={{ color: "var(--text-primary)" }}>{stats.totalProducts || 0} máy</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Sẵn sàng cho thuê:</span>
                <strong style={{ color: "var(--success)" }}>100% hoạt động tốt</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
