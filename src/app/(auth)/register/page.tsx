"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import logoImg from "../../../../public/logo.png";

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
      <div className="auth-card">
        <div className="auth-header-logo">
          <Image
            src={logoImg}
            alt="Tiệm Của Mew Logo"
            width={80}
            height={80}
            style={{ width: "auto", height: "64px", objectFit: "contain" }}
            priority
          />
          <div>
            <h1 className="auth-brand-name">TIỆM CỦA MEW</h1>
            <div className="auth-brand-sub">Tạo tài khoản mới trải nghiệm dịch vụ thuê máy ảnh siêu tốc</div>
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
              <button
                type="button"
                className="auth-password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Ẩn" : "Hiện"}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? "Đang khởi tạo tài khoản..." : "Tạo Tài Khoản Mới"}
          </button>

          <div className="auth-footer-link">
            Đã có tài khoản?
            <Link href="/login">Đăng nhập ngay tại đây</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
