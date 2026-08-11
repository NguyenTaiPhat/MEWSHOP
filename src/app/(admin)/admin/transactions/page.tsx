"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { formatVND, formatDateTime, getStatusLabel, getStatusVariant } from "@/lib/utils";

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  function loadTransactions() {
    setLoading(true);
    fetch("/api/transactions")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setTransactions(Array.isArray(data) ? data : []))
      .catch(() => setTransactions([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadTransactions();
  }, []);

  async function handleAction(id: string, status: "CONFIRMED" | "REJECTED") {
    await fetch(`/api/transactions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadTransactions();
  }

  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Quản lý giao dịch</h1>
          <p className="admin-page-subtitle">Danh sách thẻ lịch sử nạp rút tiền & cọc của khách hàng</p>
        </div>
      </div>

      {loading ? (
        <div className="booking-card-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="admin-booking-card skeleton" style={{ height: "180px" }} />
          ))}
        </div>
      ) : safeTransactions.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 16px", background: "var(--bg-card)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-color)", color: "var(--text-muted)" }}>
          Chưa có giao dịch nào trên hệ thống
        </div>
      ) : (
        <div className="booking-card-grid">
          {safeTransactions.map((t) => {
            const shortId = String(t.id || "").slice(0, 8).toUpperCase();
            return (
              <div key={t.id} className="admin-booking-card">
                <div className="booking-card-header">
                  <div className="booking-card-user">
                    <div className="booking-card-avatar">
                      {(t.user?.name || "K")[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="booking-user-name">{t.user?.name || "Khách hàng"}</div>
                      <div className="booking-code">#{shortId}</div>
                    </div>
                  </div>
                  <Badge variant="default">{getStatusLabel(t.type)}</Badge>
                </div>

                <div className="booking-card-body">
                  <div className="booking-price-row" style={{ marginTop: 0 }}>
                    <div>
                      <span className="booking-price-label">Số tiền giao dịch</span>
                      <div className="booking-price-value" style={{ fontSize: "1.5rem" }}>
                        {formatVND(t.amount)}
                      </div>
                    </div>
                    <Badge variant={getStatusVariant(t.status)}>
                      {getStatusLabel(t.status)}
                    </Badge>
                  </div>
                  <div className="booking-meta-row" style={{ marginTop: "4px" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <span>{formatDateTime(t.createdAt)}</span>
                  </div>
                </div>

                <div className="booking-card-footer">
                  {t.status === "PENDING" ? (
                    <div style={{ display: "flex", gap: "8px", width: "100%" }}>
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ flex: 1, justifyContent: "center", fontWeight: 700 }}
                        onClick={() => handleAction(t.id, "CONFIRMED")}
                      >
                        Xác nhận
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        style={{ flex: 1, justifyContent: "center", fontWeight: 700 }}
                        onClick={() => handleAction(t.id, "REJECTED")}
                      >
                        Từ chối
                      </button>
                    </div>
                  ) : (
                    <div style={{ width: "100%", textAlign: "center", fontSize: "0.8125rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                      Giao dịch đã {getStatusLabel(t.status).toLowerCase()}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
