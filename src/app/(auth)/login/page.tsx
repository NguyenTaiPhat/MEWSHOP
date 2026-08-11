"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import logoImg from "../../../../public/logo.png";

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
          <div className="auth-brand-sub">Đăng nhập tài khoản trải nghiệm dịch vụ cho thuê máy ảnh</div>
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
          {loading ? "Đang xác thực..." : "Đăng Nhập Hệ Thống"}
        </button>

        <div className="auth-footer-link">
          Chưa có tài khoản?
          <Link href="/register">Đăng ký tài khoản mới ngay</Link>
        </div>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="auth-container">
      <Suspense fallback={<div className="auth-card skeleton" style={{ height: "460px" }} />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
