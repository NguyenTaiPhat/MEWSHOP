"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import logoImg from "../../../../public/logo.png";
import registerBg from "../../../../public/register.jpg";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "", name: "", phone: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Đăng ký không thành công. Vui lòng thử lại.");
      return;
    }

    router.push("/login?registered=true");
  }

  return (
    <div className="auth-container">
      <div className="auth-ambient-bg">
        <Image
          src={registerBg}
          alt="Ambient Background"
          fill
          priority
          sizes="110vw"
          className="auth-ambient-img"
        />
        <div className="auth-ambient-overlay" />
      </div>
      <div className="auth-split-wrapper">
        <div className="auth-hero-panel">
          <Image
            src={registerBg}
            alt="Hoàng hôn Hồ Xuân Hương Đà Lạt"
            fill
            priority
            sizes="(max-width: 1023px) 100vw, 55vw"
            className="auth-hero-bg"
          />
          <div className="auth-hero-overlay" />
          <div className="auth-hero-content">
            <div className="auth-hero-badge">
              <svg viewBox="0 0 24 24">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              <span>TIỆM CỦA MEW • ĐÀ LẠT</span>
            </div>
            <h2 className="auth-hero-title">HOÀNG HÔN HỒ XUÂN HƯƠNG</h2>
            <p className="auth-hero-sub">
              Lưu giữ chiều hoàng hôn mộng mơ rực rỡ tại phố núi Đà Lạt qua từng ống kính chuyên nghiệp sắc nét.
            </p>
          </div>
          <div className="auth-hero-quote">
            "Khởi tạo hành trình chinh phục nghệ thuật thị giác cùng Tiệm Của Mew."
          </div>
        </div>

        <div className="auth-form-panel">
          <div className="auth-header-logo">
            <Image
              src={logoImg}
              alt="Tiệm Của Mew Logo"
              width={64}
              height={64}
              style={{ width: "auto", height: "56px", objectFit: "contain" }}
              priority
            />
            <div>
              <h1 className="auth-brand-name">TIỆM CỦA MEW</h1>
              <div className="auth-brand-sub">Tạo tài khoản mới trải nghiệm dịch vụ siêu tốc</div>
            </div>
          </div>

          <div className="auth-tab-bar">
            <Link href="/login" className="auth-tab-item">
              Đăng Nhập
            </Link>
            <Link href="/register" className="auth-tab-item active">
              Đăng Ký
            </Link>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-input-group">
              <label htmlFor="name" className="auth-input-label">Họ và tên</label>
              <div className="auth-input-wrapper">
                <input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  required
                  minLength={2}
                  placeholder="Trần Kim Phát"
                  className="auth-input-field"
                />
                <div className="auth-input-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="auth-input-group">
              <label htmlFor="reg-email" className="auth-input-label">Địa chỉ Email</label>
              <div className="auth-input-wrapper">
                <input
                  id="reg-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  required
                  placeholder="nhap@email.com"
                  className="auth-input-field"
                />
                <div className="auth-input-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="auth-input-group">
              <label htmlFor="phone" className="auth-input-label">Số điện thoại liên hệ</label>
              <div className="auth-input-wrapper">
                <input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="0901234567"
                  className="auth-input-field"
                />
                <div className="auth-input-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="auth-input-group">
              <label htmlFor="reg-password" className="auth-input-label">Mật khẩu bảo mật</label>
              <div className="auth-input-wrapper">
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  required
                  minLength={6}
                  placeholder="Tối thiểu 6 ký tự"
                  className="auth-input-field"
                />
                <div className="auth-input-icon">
                  <svg viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <button
                  type="button"
                  className="auth-password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              <span>{loading ? "Đang khởi tạo tài khoản..." : "Tạo Tài Khoản Mới"}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>

            <div className="auth-footer-link">
              Đã có tài khoản?
              <Link href="/login">Đăng nhập ngay tại đây</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
