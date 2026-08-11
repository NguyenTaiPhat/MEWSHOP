"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { formatVND, formatDateTime, formatDate, getStatusLabel, getStatusVariant } from "@/lib/utils";

export default function AdminUsersActivityPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  function loadUsers() {
    setLoading(true);
    fetch("/api/admin/users")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const safeUsers = Array.isArray(users) ? users : [];

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Khách hàng & Hoạt động gần nhất</h1>
          <p className="admin-page-subtitle">Theo dõi thông tin tài khoản, lịch sử đơn thuê và giao dịch của từng khách hàng</p>
        </div>
      </div>

      {loading ? (
        <div className="booking-card-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="admin-booking-card skeleton" style={{ height: "220px" }} />
          ))}
        </div>
      ) : safeUsers.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 16px", background: "var(--bg-card)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-color)", color: "var(--text-muted)" }}>
          Chưa có khách hàng nào đăng ký trên hệ thống
        </div>
      ) : (
        <div className="booking-card-grid">
          {safeUsers.map((u) => {
            const lastBooking = u.bookings?.[0];
            const lastTx = u.transactions?.[0];

            return (
              <div key={u.id} className="admin-booking-card" style={{ gap: "16px" }}>
                {/* User Header */}
                <div className="booking-card-header">
                  <div className="booking-card-user">
                    <div className="booking-card-avatar" style={{ width: "42px", height: "42px", fontSize: "1.125rem" }}>
                      {(u.name || "K")[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="booking-user-name" style={{ fontSize: "1.05rem" }}>{u.name || "Khách hàng"}</div>
                      <div className="booking-code" style={{ fontSize: "0.8125rem" }}>{u.email}</div>
                    </div>
                  </div>
                  <Badge variant="accent">Thành viên</Badge>
                </div>

                {/* Info & Activity Stats */}
                <div className="booking-card-body">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "8px" }}>
                    <div style={{ background: "var(--bg-tertiary)", padding: "8px 12px", borderRadius: "var(--radius-md)" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Tổng đơn thuê</span>
                      <strong style={{ fontSize: "1.125rem", color: "var(--text-primary)" }}>{u.totalBookings || 0} đơn</strong>
                    </div>
                    <div style={{ background: "var(--bg-tertiary)", padding: "8px 12px", borderRadius: "var(--radius-md)" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Tổng chi tiêu</span>
                      <strong style={{ fontSize: "1.125rem", color: "var(--accent)" }}>{formatVND(u.totalSpent || 0)}</strong>
                    </div>
                  </div>

                  <div className="booking-meta-row" style={{ fontSize: "0.8125rem" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
                    </svg>
                    <span>SĐT: <strong>{u.phone || "Chưa cập nhật"}</strong></span>
                  </div>

                  {/* Hoạt Động Gần Nhất */}
                  <div style={{ marginTop: "6px", paddingTop: "8px", borderTop: "1px dashed var(--border-color)", fontSize: "0.8125rem" }}>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", display: "block", marginBottom: "4px" }}>Hoạt động gần nhất:</span>
                    {lastBooking ? (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>Thủ đơn {lastBooking.product?.name}</span>
                        <Badge variant={getStatusVariant(lastBooking.bookingStatus)}>{getStatusLabel(lastBooking.bookingStatus)}</Badge>
                      </div>
                    ) : lastTx ? (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span>Giao dịch {formatVND(lastTx.amount)}</span>
                        <Badge variant={getStatusVariant(lastTx.status)}>{getStatusLabel(lastTx.status)}</Badge>
                      </div>
                    ) : (
                      <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>Chưa phát sinh đơn thuê mới</span>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="booking-card-footer">
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ width: "100%", justifyContent: "center", fontWeight: 700 }}
                    onClick={() => setSelectedUser(u)}
                  >
                    Xem toàn bộ nhật ký hoạt động →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Nhật Ký Hoạt Động Chi Tiết Của Khách Hàng */}
      <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} title={`Nhật ký hoạt động: ${selectedUser?.name}`}>
        {selectedUser && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", gap: "16px", alignItems: "center", background: "var(--bg-tertiary)", padding: "16px", borderRadius: "var(--radius-lg)" }}>
              <div className="booking-card-avatar" style={{ width: "52px", height: "52px", fontSize: "1.35rem" }}>
                {(selectedUser.name || "K")[0].toUpperCase()}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.125rem" }}>{selectedUser.name}</h3>
                <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>{selectedUser.email}</div>
                <div style={{ fontSize: "0.8125rem", color: "var(--accent)", marginTop: "2px" }}>SĐT: {selectedUser.phone || "Chưa cập nhật"}</div>
              </div>
            </div>

            <div>
              <h4 style={{ marginBottom: "12px", fontFamily: "var(--font-brand)", color: "var(--accent)" }}>Lịch sử đơn thuê gần đây</h4>
              {selectedUser.bookings?.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {selectedUser.bookings.map((b: any) => (
                    <div key={b.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)" }}>
                      <div>
                        <strong style={{ display: "block" }}>{b.product?.name}</strong>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Tạo lúc: {formatDateTime(b.createdAt)}</span>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 700, color: "var(--accent)", fontSize: "0.9375rem" }}>{formatVND(b.totalPrice)}</div>
                        <Badge variant={getStatusVariant(b.bookingStatus)}>{getStatusLabel(b.bookingStatus)}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: "var(--text-muted)", fontStyle: "italic", fontSize: "0.875rem" }}>Khách hàng chưa có lịch sử đơn thuê</div>
              )}
            </div>

            <div>
              <h4 style={{ marginBottom: "12px", fontFamily: "var(--font-brand)", color: "var(--accent)" }}>Lịch sử giao dịch gần đây</h4>
              {selectedUser.transactions?.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {selectedUser.transactions.map((t: any) => (
                    <div key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)" }}>
                      <div>
                        <strong style={{ display: "block" }}>{getStatusLabel(t.type)}</strong>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{formatDateTime(t.createdAt)}</span>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 700, fontSize: "0.9375rem" }}>{formatVND(t.amount)}</div>
                        <Badge variant={getStatusVariant(t.status)}>{getStatusLabel(t.status)}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: "var(--text-muted)", fontStyle: "italic", fontSize: "0.875rem" }}>Khách hàng chưa có lịch sử giao dịch</div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
