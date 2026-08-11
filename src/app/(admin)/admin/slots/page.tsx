"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { getStatusLabel, getStatusVariant, formatDateTime } from "@/lib/utils";

const TIME_OPTIONS = [
  "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
];

const DURATION_OPTIONS = [
  { value: 1, label: "1 Ngày (24h)" },
  { value: 2, label: "2 Ngày (48h)" },
  { value: 3, label: "3 Ngày (72h)" },
  { value: 4, label: "4 Ngày (96h)" },
  { value: 5, label: "5 Ngày" },
  { value: 7, label: "7 Ngày (1 Tuần)" },
];

export default function AdminSlotsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Form ngày bắt đầu + Giờ + Số ngày thuê
  const todayStr = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(todayStr);
  const [startTime, setStartTime] = useState("08:00");
  const [rentalDays, setRentalDays] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/products")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data);
          if (data.length > 0) setSelectedProduct(data[0].id);
        }
      })
      .catch(() => {});
  }, []);

  function loadSlots() {
    if (!selectedProduct) return;
    setLoading(true);
    fetch(`/api/slots?productId=${selectedProduct}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setSlots(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadSlots();
  }, [selectedProduct]);

  // Compute calculated start ISO and end ISO
  function getComputedDates() {
    if (!startDate || !startTime) return { startISO: null, endISO: null, previewText: "" };
    const [hh, mm] = startTime.split(":").map(Number);
    const startObj = new Date(startDate);
    startObj.setHours(hh, mm, 0, 0);

    const endObj = new Date(startObj.getTime() + rentalDays * 24 * 60 * 60 * 1000);

    return {
      startISO: startObj.toISOString(),
      endISO: endObj.toISOString(),
      previewText: `Từ ${startObj.toLocaleDateString("vi-VN")} ${startTime} đến ${endObj.toLocaleDateString("vi-VN")} ${startTime}`,
    };
  }

  async function handleCreateSlot(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const { startISO, endISO } = getComputedDates();
    if (!startISO || !endISO) {
      setError("Vui lòng chọn ngày và giờ bắt đầu hợp lệ.");
      return;
    }

    const res = await fetch("/api/slots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: selectedProduct,
        startDate: startISO,
        endDate: endISO,
      }),
    });

    if (res.ok) {
      setIsOpen(false);
      loadSlots();
    } else {
      const data = await res.json();
      setError(data.error || "Lỗi tạo slot");
    }
  }

  async function toggleStatus(slotId: string, currentStatus: string) {
    const newStatus = currentStatus === "OPEN" ? "BLOCKED" : "OPEN";
    await fetch(`/api/slots/${slotId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    loadSlots();
  }

  async function handleDelete(slotId: string) {
    await fetch(`/api/slots/${slotId}`, { method: "DELETE" });
    loadSlots();
  }

  const computed = getComputedDates();
  const safeSlots = Array.isArray(slots) ? slots : [];

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Quản lý lịch thuê</h1>
          <p className="admin-page-subtitle">Tạo và quản lý các khung giờ mở cho thuê thiết bị máy ảnh</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsOpen(true)} disabled={!selectedProduct} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Tạo khung giờ thuê mới
        </button>
      </div>

      <div className="form-group" style={{ maxWidth: "360px", marginBottom: "24px" }}>
        <label style={{ fontWeight: 700, fontSize: "0.875rem", marginBottom: "8px", display: "block" }}>Chọn thiết bị máy ảnh</label>
        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          className="form-input"
          style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", background: "var(--bg-secondary)", fontWeight: 700 }}
        >
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name} ({p.brand})</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="booking-card-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="admin-booking-card skeleton" style={{ height: "160px" }} />
          ))}
        </div>
      ) : safeSlots.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 16px", background: "var(--bg-card)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-color)", color: "var(--text-muted)" }}>
          Chưa có khung giờ thuê nào cho máy ảnh này
        </div>
      ) : (
        <div className="booking-card-grid">
          {safeSlots.map((s) => (
            <div key={s.id} className="admin-booking-card" style={{ gap: "14px" }}>
              <div className="booking-card-header">
                <div style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--text-primary)" }}>
                  Khung giờ thuê #{String(s.id).slice(0, 6).toUpperCase()}
                </div>
                <Badge variant={getStatusVariant(s.status)}>
                  {getStatusLabel(s.status)}
                </Badge>
              </div>

              <div className="booking-card-body" style={{ padding: "8px 0" }}>
                <div className="booking-meta-row" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <span>Bắt đầu: {formatDateTime(s.startDate)}</span>
                </div>
                <div className="booking-meta-row" style={{ color: "var(--accent)", fontWeight: 600, marginTop: "4px" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  <span>Trả máy: {formatDateTime(s.endDate)}</span>
                </div>
              </div>

              <div className="booking-card-footer">
                {s.status !== "BOOKED" && (
                  <div style={{ display: "flex", gap: "8px", width: "100%" }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1, justifyContent: "center", fontWeight: 700 }}
                      onClick={() => toggleStatus(s.id, s.status)}
                    >
                      {s.status === "OPEN" ? "Khóa slot" : "Mở slot"}
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      style={{ width: "40px", justifyContent: "center" }}
                      onClick={() => handleDelete(s.id)}
                      title="Xóa slot"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Tạo Khung Giờ Mới VIP theo chỉ đạo của PHÁT */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Tạo khung giờ cho thuê mới">
        <form onSubmit={handleCreateSlot} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {error && <div style={{ color: "var(--danger)", fontSize: "0.875rem" }}>{error}</div>}

          {/* Ô 1: Chọn ngày bắt đầu */}
          <div className="form-group">
            <label style={{ fontWeight: 700, fontSize: "0.875rem", marginBottom: "6px", display: "block" }}>Ngày bắt đầu</label>
            <input
              type="date"
              value={startDate}
              min={todayStr}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="form-input"
              style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", background: "var(--bg-secondary)" }}
            />
          </div>

          {/* Ô 2: Chọn giờ nhận máy */}
          <div className="form-group">
            <label style={{ fontWeight: 700, fontSize: "0.875rem", marginBottom: "6px", display: "block" }}>Giờ nhận máy</label>
            <select
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="form-input"
              style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", background: "var(--bg-secondary)" }}
            >
              {TIME_OPTIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Ô 3: Chọn số ngày thuê */}
          <div className="form-group">
            <label style={{ fontWeight: 700, fontSize: "0.875rem", marginBottom: "6px", display: "block" }}>Thời gian thuê (Số ngày)</label>
            <select
              value={rentalDays}
              onChange={(e) => setRentalDays(Number(e.target.value))}
              className="form-input"
              style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", background: "var(--bg-secondary)" }}
            >
              {DURATION_OPTIONS.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>

          {/* Khung Xem Trước Thời Gian Tự Động Tính */}
          <div style={{ background: "var(--accent-subtle)", border: "1px solid rgba(217, 119, 6, 0.3)", padding: "12px 16px", borderRadius: "var(--radius-md)", color: "var(--accent)", fontSize: "0.875rem", fontWeight: 700 }}>
            {computed.previewText}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsOpen(false)}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary" style={{ fontWeight: 700 }}>
              Xác nhận tạo slot
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
