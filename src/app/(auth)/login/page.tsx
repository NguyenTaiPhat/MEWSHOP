"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import logoImg from "../../../../public/logo.png";
import loginBg from "../../../../public/login.jpg";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="auth-split-wrapper">
      <div className="auth-hero-panel">
        <Image
          src={loginBg}
          alt="Lăng Chủ tịch Hồ Chí Minh"
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
            <span>TIỆM CỦA MEW • HÀ NỘI</span>
          </div>
          <h2 className="auth-hero-title">LĂNG CHỦ TỊCH HỒ CHÍ MINH</h2>
          <p className="auth-hero-sub">
            Ghi lại những khoảnh khắc lịch sử và thanh bình tại thủ đô Hà Nội cùng các dòng máy ảnh cao cấp chuyên nghiệp.
          </p>
        </div>
        <div className="auth-hero-quote">
          "Trải nghiệm dịch vụ cho thuê máy ảnh và thiết bị nhiếp ảnh hàng đầu."
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
            <div className="auth-brand-sub">Đăng nhập tài khoản trải nghiệm dịch vụ</div>
          </div>
        </div>

        <div className="auth-tab-bar">
          <Link href="/login" className="auth-tab-item active">
            Đăng Nhập
          </Link>
          <Link href="/register" className="auth-tab-item">
            Đăng Ký
          </Link>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-input-group">
            <label htmlFor="email" className="auth-input-label">Địa chỉ Email</label>
            <div className="auth-input-wrapper">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
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
            <label htmlFor="password" className="auth-input-label">Mật khẩu</label>
            <div className="auth-input-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="current-password"
                placeholder="••••••••"
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
            <span>{loading ? "Đang xác thực..." : "Đăng Nhập Hệ Thống"}</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>

          <div className="auth-footer-link">
            Chưa có tài khoản?
            <Link href="/register">Đăng ký tài khoản mới ngay</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="auth-container">
      <div className="auth-ambient-bg">
        <Image
          src={loginBg}
          alt="Ambient Background"
          fill
          priority
          sizes="110vw"
          className="auth-ambient-img"
        />
        <div className="auth-ambient-overlay" />
      </div>
      <Suspense fallback={<div className="auth-split-wrapper" style={{ height: "640px" }} />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
