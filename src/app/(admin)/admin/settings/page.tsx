"use client";

import { useEffect, useState } from "react";

const VIETNAM_BANKS = [
  { id: "vcb", name: "Vietcombank (NH Ngoại Thương)" },
  { id: "mbb", name: "MBBank (NH Quân Đội)" },
  { id: "tcb", name: "Techcombank (NH Kỹ Thương)" },
  { id: "icb", name: "VietinBank (NH Công Thương)" },
  { id: "bidv", name: "BIDV (NH Đầu Tư & Phát Triển)" },
  { id: "acb", name: "ACB (NH Á Châu)" },
  { id: "vpb", name: "VPBank (NH Thịnh Vượng)" },
  { id: "tpb", name: "TPBank (NH Tiên Phong)" },
  { id: "vab", name: "VietA Bank (NH Việt Á)" },
  { id: "vba", name: "Agribank (NH Nông Nghiệp)" },
  { id: "stb", name: "Sacombank" },
  { id: "hdb", name: "HDBank" },
  { id: "ocb", name: "OCB" },
];

export default function AdminSettingsPage() {
  const [form, setForm] = useState({
    bankName: "Vietcombank",
    bankCode: "vcb",
    accountNumber: "090123456789",
    accountHolder: "TIEM CUA MEW CAMERA RENTAL",
    qrCodeUrl: "",
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/payment-settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setForm({
            bankName: data.bankName || "Vietcombank",
            bankCode: data.bankCode || "vcb",
            accountNumber: data.accountNumber || "",
            accountHolder: data.accountHolder || "",
            qrCodeUrl: data.qrCodeUrl || "",
          });
        }
      })
      .catch(() => {});
  }, []);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          setForm((prev) => ({ ...prev, qrCodeUrl: data.url }));
        }
      }
    } catch {}
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/payment-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setMessage("Đã lưu cấu hình thanh toán & mã VietQR thành công!");
      }
    } catch {}
    setLoading(false);
  }

  // Generate Live VietQR image URL
  const selectedBank = VIETNAM_BANKS.find((b) => b.name.toLowerCase().includes(form.bankName.toLowerCase())) || VIETNAM_BANKS[0];
  const liveVietQRUrl = form.accountNumber
    ? `https://img.vietqr.io/image/${selectedBank.id}-${form.accountNumber}-compact2.png?accountName=${encodeURIComponent(form.accountHolder)}`
    : null;

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Cài đặt thanh toán & VietQR</h1>
          <p className="admin-page-subtitle">Cấu hình thông tin chuyển khoản & Mã VietQR tự động khi khách đặt thuê máy ảnh</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "24px" }}>
        {/* Form Cấu Hình Thanh Toán */}
        <form onSubmit={handleSubmit} className="admin-booking-card" style={{ gap: "20px" }}>
          {message && (
            <div style={{ padding: "12px", background: "var(--success-subtle)", color: "var(--success)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "var(--radius-md)", fontSize: "0.875rem", fontWeight: 600 }}>
              {message}
            </div>
          )}

          <div className="form-group">
            <label style={{ fontWeight: 700, fontSize: "0.875rem", marginBottom: "8px", display: "block" }}>Ngân hàng thụ hưởng</label>
            <select
              value={form.bankName}
              onChange={(e) => {
                const bName = e.target.value;
                const found = VIETNAM_BANKS.find((b) => b.name === bName);
                setForm({ ...form, bankName: bName, bankCode: found?.id || "vcb" });
              }}
              className="form-input"
              style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", background: "var(--bg-secondary)" }}
            >
              {VIETNAM_BANKS.map((b) => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label style={{ fontWeight: 700, fontSize: "0.875rem", marginBottom: "8px", display: "block" }}>Số tài khoản ngân hàng</label>
            <input
              type="text"
              value={form.accountNumber}
              onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
              required
              placeholder="Nhập số tài khoản ngân hàng"
              className="form-input"
              style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", background: "var(--bg-secondary)" }}
            />
          </div>

          <div className="form-group">
            <label style={{ fontWeight: 700, fontSize: "0.875rem", marginBottom: "8px", display: "block" }}>Tên chủ tài khoản (Viết hoa không dấu)</label>
            <input
              type="text"
              value={form.accountHolder}
              onChange={(e) => setForm({ ...form, accountHolder: e.target.value.toUpperCase() })}
              required
              placeholder="TIEM CUA MEW CAMERA RENTAL"
              className="form-input"
              style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", background: "var(--bg-secondary)" }}
            />
          </div>

          <div className="form-group">
            <label style={{ fontWeight: 700, fontSize: "0.875rem", marginBottom: "8px", display: "block" }}>Upload tệp ảnh QR Shop Tùy Chọn (MoMo / ZaloPay / VietQR)</label>
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                type="text"
                value={form.qrCodeUrl}
                onChange={(e) => setForm({ ...form, qrCodeUrl: e.target.value })}
                placeholder="Dán URL ảnh hoặc bấm Upload ->"
                className="form-input"
                style={{ flex: 1, padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", background: "var(--bg-secondary)" }}
              />
              <label className="btn btn-secondary btn-sm" style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {uploading ? "Đang tải..." : "Upload Ảnh"}
                <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: "none" }} />
              </label>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%", padding: "12px", marginTop: "8px", fontWeight: 700, justifyContent: "center" }}>
            {loading ? "Đang lưu..." : "Lưu cài đặt VietQR"}
          </button>
        </form>

        {/* Cột Xem Trước Mã VietQR Động Live Preview */}
        <div className="admin-booking-card" style={{ alignItems: "center", textAlign: "center", justifyContent: "flex-start", gap: "20px" }}>
          <h3 style={{ fontFamily: "var(--font-brand)", fontSize: "1.25rem", margin: 0 }}>Xem Trước Mã VietQR Động</h3>
          <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", margin: 0 }}>
            Mã VietQR này sẽ tự động gắn số tiền cọc và nội dung đơn thuê khi Khách Hàng thanh toán bên User.
          </p>

          <div style={{ width: "240px", height: "280px", background: "#ffffff", padding: "16px", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-color)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}>
            {form.qrCodeUrl ? (
              <img src={form.qrCodeUrl} alt="Mã QR Shop" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            ) : liveVietQRUrl ? (
              <img src={liveVietQRUrl} alt="Mã VietQR Chuyển Khoản" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            ) : (
              <div style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Nhập số tài khoản để tạo VietQR</div>
            )}
          </div>

          <div style={{ fontSize: "0.875rem", lineHeight: 1.6, color: "var(--text-primary)" }}>
            <div><strong>Ngân hàng:</strong> {form.bankName}</div>
            <div><strong>Số tài khoản:</strong> <span style={{ color: "var(--accent)", fontWeight: 800 }}>{form.accountNumber || "---"}</span></div>
            <div><strong>Chủ tài khoản:</strong> {form.accountHolder || "---"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
