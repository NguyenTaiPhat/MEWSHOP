"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { getAvatarUrl } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mobileDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileDrawerOpen]);

  const drawerContent = mobileDrawerOpen ? (
    <div className="mobile-drawer-overlay" onClick={() => setMobileDrawerOpen(false)}>
      <div className="mobile-drawer-content" onClick={(e) => e.stopPropagation()}>
        <div className="mobile-drawer-header">
          <span className="mobile-drawer-title">Danh mục menu</span>
          <button className="modal-close" onClick={() => setMobileDrawerOpen(false)}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="mobile-drawer-nav">
          <Link href="/" className={pathname === "/" ? "active" : ""} onClick={() => setMobileDrawerOpen(false)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span>Trang chủ</span>
          </Link>
          <Link href="/products" className={pathname.startsWith("/products") ? "active" : ""} onClick={() => setMobileDrawerOpen(false)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
            <span>Máy ảnh</span>
          </Link>
          <Link href="/policy" className={pathname === "/policy" ? "active" : ""} onClick={() => setMobileDrawerOpen(false)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            <span>Chính sách & Bảo mật</span>
          </Link>
          {session && (
            <>
              <Link href="/dashboard" className={pathname === "/dashboard" ? "active" : ""} onClick={() => setMobileDrawerOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="9"/>
                  <rect x="14" y="3" width="7" height="5"/>
                  <rect x="14" y="12" width="7" height="9"/>
                  <rect x="3" y="16" width="7" height="5"/>
                </svg>
                <span>Tổng quan cá nhân</span>
              </Link>
              <Link href="/bookings" className={pathname.startsWith("/bookings") ? "active" : ""} onClick={() => setMobileDrawerOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <span>Đơn thuê của tôi</span>
              </Link>
              <Link href="/chat" className={pathname === "/chat" ? "active" : ""} onClick={() => setMobileDrawerOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                </svg>
                <span>Hỗ trợ trực tuyến</span>
              </Link>
              <Link href="/profile" className={pathname === "/profile" ? "active" : ""} onClick={() => setMobileDrawerOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <span>Hồ sơ cá nhân</span>
              </Link>
            </>
          )}
          {session?.user.role === "ADMIN" && (
            <Link href="/admin" className={pathname.startsWith("/admin") ? "active" : ""} onClick={() => setMobileDrawerOpen(false)} style={{ color: "var(--accent)", fontWeight: 700 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span>Quản trị hệ thống</span>
            </Link>
          )}
        </div>

        {!session && (
          <div className="mobile-drawer-auth">
            <Link href="/login" className="btn btn-ghost" style={{ width: "100%", justifyContent: "center" }} onClick={() => setMobileDrawerOpen(false)}>
              Đăng nhập
            </Link>
            <Link href="/register" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => setMobileDrawerOpen(false)}>
              Đăng ký tài khoản
            </Link>
          </div>
        )}
      </div>
    </div>
  ) : null;

  return (
    <header className="header">
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button
          className="mobile-hamburger-btn"
          onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
          aria-label="Toggle Navigation Menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileDrawerOpen ? (
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
            )}
          </svg>
        </button>

        <Link href="/" className="header-logo" onClick={() => setMobileDrawerOpen(false)}>
          <img src="/logo.png" alt="Tiệm Của Mew Logo" style={{ height: "28px", width: "auto", objectFit: "contain" }} />
          Tiệm Của Mew
        </Link>
      </div>

      <nav className="header-nav desktop-nav">
        <Link href="/" className={pathname === "/" ? "active" : ""}>Trang chủ</Link>
        <Link href="/products" className={pathname.startsWith("/products") ? "active" : ""}>Máy ảnh</Link>
        {session && (
          <>
            <Link href="/dashboard" className={pathname === "/dashboard" ? "active" : ""}>Tổng quan</Link>
            <Link href="/bookings" className={pathname.startsWith("/bookings") ? "active" : ""}>Đơn thuê</Link>
            <Link href="/chat" className={pathname === "/chat" ? "active" : ""}>Tin nhắn</Link>
          </>
        )}
        {session?.user.role === "ADMIN" && (
          <Link href="/admin" className={pathname.startsWith("/admin") ? "active" : ""}>Quản trị</Link>
        )}
        <Link href="/policy" className={`nav-policy-highlight ${pathname === "/policy" ? "active" : ""}`}>Chính sách</Link>
      </nav>

      <div className="header-actions" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <ThemeToggle />
        {session ? (
          <div className="header-user" onClick={() => setUserDropdownOpen(!userDropdownOpen)}>
            <div className="header-avatar">
              <img
                src={getAvatarUrl(session.user.email || session.user.name)}
                alt={session.user.name || "User Avatar"}
                style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
              />
            </div>
            <span className="header-username">{session.user.name}</span>

            {userDropdownOpen && (
              <div style={{
                position: "absolute",
                top: "calc(var(--header-height) - 4px)",
                right: "0",
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-md)",
                padding: "8px",
                minWidth: "160px",
                boxShadow: "var(--shadow-lg)",
                zIndex: 200,
              }}>
                <Link href="/profile" style={{ display: "block", padding: "8px 12px", borderRadius: "var(--radius-sm)", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                  Hồ sơ cá nhân
                </Link>
                <button onClick={() => signOut({ callbackUrl: "/login" })} style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 12px", borderRadius: "var(--radius-sm)", fontSize: "0.875rem", color: "var(--danger)", background: "none", border: "none", cursor: "pointer" }}>
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <Link href="/login" className="btn btn-primary btn-sm">Đăng nhập</Link>
            <Link href="/register" className="btn btn-ghost btn-sm desktop-only-btn">Đăng ký</Link>
          </div>
        )}
      </div>

      {/* Render Mobile Drawer via Portal directly to body */}
      {mounted && drawerContent ? createPortal(drawerContent, document.body) : null}
    </header>
  );
}
