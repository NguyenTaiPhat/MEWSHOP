"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getAvatarUrl, formatVND, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type TabType = "info" | "security" | "wallet" | "settings";

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const [activeTab, setActiveTab] = useState<TabType>("info");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);

  // Form states
  const [infoForm, setInfoForm] = useState({ name: "", phone: "", address: "", idCardNumber: "" });
  const [savingInfo, setSavingInfo] = useState(false);
  const [infoMsg, setInfoMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [pwdForm, setPwdForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [savingPwd, setSavingPwd] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [notifs, setNotifs] = useState({ emailReminders: true, statusAlerts: true, promoOffers: false });

  function fetchProfile() {
    setLoadingProfile(true);
    fetch("/api/user/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setProfileData(data);
          setInfoForm({
            name: data.name || "",
            phone: data.phone || "",
            address: data.address || "",
            idCardNumber: data.idCardNumber || "",
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoadingProfile(false));
  }

  useEffect(() => {
    fetchProfile();
  }, []);

  async function handleUpdateInfo(e: React.FormEvent) {
    e.preventDefault();
    setSavingInfo(true);
    setInfoMsg(null);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(infoForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể cập nhật thông tin");

      setInfoMsg({ type: "success", text: "Cập nhật thông tin cá nhân thành công" });
      fetchProfile();
      updateSession();
    } catch (err: any) {
      setInfoMsg({ type: "error", text: err.message || "Lỗi cập nhật thông tin" });
    } finally {
      setSavingInfo(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwdMsg(null);

    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setPwdMsg({ type: "error", text: "Mật khẩu mới không trùng khớp" });
      return;
    }

    setSavingPwd(true);

    try {
      const res = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: pwdForm.currentPassword,
          newPassword: pwdForm.newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể đổi mật khẩu");

      setPwdMsg({ type: "success", text: "Đổi mật khẩu thành công" });
      setPwdForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      setPwdMsg({ type: "error", text: err.message || "Lỗi khi đổi mật khẩu" });
    } finally {
      setSavingPwd(false);
    }
  }

  if (loadingProfile) {
    return (
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div className="skeleton" style={{ height: "180px", borderRadius: "var(--radius-lg)", marginBottom: "32px" }} />
        <div className="skeleton" style={{ height: "400px", borderRadius: "var(--radius-lg)" }} />
      </div>
    );
  }

  const userRoleLabel = profileData?.role === "ADMIN" ? "Quản Trị Viên" : "Hội Viên Chính Thức";
  const userRoleVariant = profileData?.role === "ADMIN" ? "danger" : "accent";

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "24px" }}>Hồ Sơ Cá Nhân</h1>

      {/* Hero Header Card */}
      <div className="profile-hero">
        <div className="profile-hero-top">
          <div className="profile-avatar-ring">
            <div className="profile-avatar-inner">
              <img
                src={getAvatarUrl(profileData?.email || profileData?.name)}
                alt={profileData?.name || "Avatar"}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          </div>

          <div className="profile-user-info">
            <div className="profile-user-header-row">
              <div className="profile-user-name">{profileData?.name}</div>
              <Badge variant={userRoleVariant}>{userRoleLabel}</Badge>
            </div>
            <div className="profile-user-email">{profileData?.email}</div>
            <div className="profile-user-submeta">
              <span>Số điện thoại: <strong>{profileData?.phone || "Chưa cập nhật"}</strong></span>
              <span className="meta-dot">•</span>
              <span>Thành viên từ: <strong>{profileData?.createdAt ? formatDate(profileData.createdAt) : "N/A"}</strong></span>
            </div>
          </div>
        </div>

        {/* Quick KPI Stats Bar */}
        <div className="profile-kpi-grid">
          <div className="profile-kpi-card">
            <div className="profile-kpi-label">Tổng đơn thuê</div>
            <div className="profile-kpi-value">{profileData?._count?.bookings || 0} đơn</div>
          </div>

          <div className="profile-kpi-card">
            <div className="profile-kpi-label">Số dư ví cọc</div>
            <div className="profile-kpi-value">{formatVND(profileData?.balance || 0)}</div>
          </div>

          <div className="profile-kpi-card">
            <div className="profile-kpi-label">Xác minh CCCD</div>
            <div className="profile-kpi-value" style={{ fontSize: "1rem", color: profileData?.phone ? "var(--success)" : "var(--warning)" }}>
              {profileData?.phone ? "Đã liên kết SĐT" : "Cần cập nhật SĐT"}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="tabs" style={{ marginBottom: "24px" }}>
        <button className={`tab ${activeTab === "info" ? "active" : ""}`} onClick={() => setActiveTab("info")}>
          Thông tin cá nhân
        </button>
        <button className={`tab ${activeTab === "security" ? "active" : ""}`} onClick={() => setActiveTab("security")}>
          Đổi mật khẩu & Bảo mật
        </button>
        <button className={`tab ${activeTab === "wallet" ? "active" : ""}`} onClick={() => setActiveTab("wallet")}>
          Ví cọc & Giao dịch
        </button>
        <button className={`tab ${activeTab === "settings" ? "active" : ""}`} onClick={() => setActiveTab("settings")}>
          Cài đặt thông báo
        </button>
      </div>

      {/* Tab 1: Thông tin cá nhân */}
      {activeTab === "info" && (
        <div className="card">
          <h3 style={{ marginBottom: "20px" }}>Cập nhật thông tin cá nhân</h3>

          {infoMsg && (
            <div style={{
              padding: "12px 16px",
              borderRadius: "var(--radius-md)",
              marginBottom: "20px",
              fontSize: "0.875rem",
              background: infoMsg.type === "success" ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
              color: infoMsg.type === "success" ? "var(--success)" : "var(--danger)",
              border: `1px solid ${infoMsg.type === "success" ? "var(--success)" : "var(--danger)"}`,
            }}>
              {infoMsg.text}
            </div>
          )}

          <form onSubmit={handleUpdateInfo}>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Họ và tên</label>
                <input
                  type="text"
                  className="form-input"
                  value={infoForm.name}
                  onChange={(e) => setInfoForm({ ...infoForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email liên hệ <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 400 }}>(Chỉ đọc)</span></label>
                <input
                  type="email"
                  className="form-input"
                  value={profileData?.email || ""}
                  disabled
                  style={{ opacity: 0.6, cursor: "not-allowed" }}
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Số điện thoại liên hệ</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="0901234567"
                  value={infoForm.phone}
                  onChange={(e) => setInfoForm({ ...infoForm, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Số CCCD / CMND</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Nhập 12 số CCCD"
                  value={infoForm.idCardNumber}
                  onChange={(e) => setInfoForm({ ...infoForm, idCardNumber: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: "24px" }}>
              <div className="form-label">Địa chỉ giao nhận máy ảnh mặc định</div>
              <input
                type="text"
                className="form-input"
                placeholder="Nhập địa chỉ nhà hoặc studio của bạn..."
                value={infoForm.address}
                onChange={(e) => setInfoForm({ ...infoForm, address: e.target.value })}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={savingInfo}>
              {savingInfo ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: Đổi mật khẩu & Bảo mật */}
      {activeTab === "security" && (
        <div className="card" style={{ maxWidth: "560px" }}>
          <h3 style={{ marginBottom: "20px" }}>Đổi mật khẩu tài khoản</h3>

          {pwdMsg && (
            <div style={{
              padding: "12px 16px",
              borderRadius: "var(--radius-md)",
              marginBottom: "20px",
              fontSize: "0.875rem",
              background: pwdMsg.type === "success" ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
              color: pwdMsg.type === "success" ? "var(--success)" : "var(--danger)",
              border: `1px solid ${pwdMsg.type === "success" ? "var(--success)" : "var(--danger)"}`,
            }}>
              {pwdMsg.text}
            </div>
          )}

          <form onSubmit={handleChangePassword}>
            <div className="form-group" style={{ marginBottom: "16px" }}>
              <label className="form-label">Mật khẩu hiện tại</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={pwdForm.currentPassword}
                onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: "16px" }}>
              <label className="form-label">Mật khẩu mới (Tối thiểu 6 ký tự)</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={pwdForm.newPassword}
                onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: "24px" }}>
              <label className="form-label">Xác nhận mật khẩu mới</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={pwdForm.confirmPassword}
                onChange={(e) => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={savingPwd}>
              {savingPwd ? "Đang xử lý..." : "Cập nhật mật khẩu"}
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Ví cọc & Giao dịch */}
      {activeTab === "wallet" && (
        <div>
          <div className="card" style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "4px" }}>Số dư khả dụng trong ví cọc</div>
                <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--accent)" }}>{formatVND(profileData?.balance || 0)}</div>
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <button className="btn btn-outline" onClick={() => alert("Tính năng nạp cọc trực tuyến qua VietQR đang mở")}>
                  Nạp tiền cọc
                </button>
                <button className="btn btn-primary" onClick={() => alert("Gửi yêu cầu hoàn cọc thành công đến Quản trị viên")}>
                  Yêu cầu rút cọc
                </button>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: "16px" }}>Lịch sử biến động gần đây</h3>
            {profileData?.transactions?.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {profileData.transactions.map((t: any) => (
                  <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "var(--bg-glass)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)" }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.9375rem" }}>{t.type === "DEPOSIT" ? "Nạp tiền cọc" : t.type === "REFUND" ? "Hoàn tiền cọc" : "Thanh toán đơn thuê"}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{formatDate(t.createdAt)}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 700, color: t.type === "DEPOSIT" || t.type === "REFUND" ? "var(--success)" : "var(--danger)" }}>
                        {t.type === "DEPOSIT" || t.type === "REFUND" ? "+" : "-"}{formatVND(t.amount)}
                      </div>
                      <Badge variant={t.status === "CONFIRMED" ? "success" : t.status === "PENDING" ? "warning" : "danger"}>
                        {t.status === "CONFIRMED" ? "Thành công" : t.status === "PENDING" ? "Chờ xử lý" : "Từ chối"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: "32px 0" }}>
                <p className="empty-state-title">Chưa có giao dịch phát sinh</p>
                <p className="empty-state-desc">Số dư và lịch sử giao dịch cọc máy ảnh sẽ hiển thị tại đây</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Cài đặt thông báo */}
      {activeTab === "settings" && (
        <div className="card" style={{ maxWidth: "600px" }}>
          <h3 style={{ marginBottom: "20px" }}>Cài đặt thông báo & Nhắc lịch</h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: "4px" }}>Nhắc lịch trả máy ảnh qua Email</div>
                <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>Tự động gửi email thông báo trước 3 tiếng khi hết hạn thuê</div>
              </div>
              <input
                type="checkbox"
                checked={notifs.emailReminders}
                onChange={(e) => setNotifs({ ...notifs, emailReminders: e.target.checked })}
                style={{ width: "20px", height: "20px", accentColor: "var(--accent)", cursor: "pointer" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: "4px" }}>Thông báo tiến độ duyệt đơn thuê</div>
                <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>Nhận cập nhật khi đơn thuê chuyển sang Đã xác nhận / Đang thuê</div>
              </div>
              <input
                type="checkbox"
                checked={notifs.statusAlerts}
                onChange={(e) => setNotifs({ ...notifs, statusAlerts: e.target.checked })}
                style={{ width: "20px", height: "20px", accentColor: "var(--accent)", cursor: "pointer" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: "4px" }}>Thông báo ưu đãi & Ưu đãi thành viên</div>
                <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>Nhận tin tức về các dòng máy ảnh mới nạp kho và mã giảm giá</div>
              </div>
              <input
                type="checkbox"
                checked={notifs.promoOffers}
                onChange={(e) => setNotifs({ ...notifs, promoOffers: e.target.checked })}
                style={{ width: "20px", height: "20px", accentColor: "var(--accent)", cursor: "pointer" }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
