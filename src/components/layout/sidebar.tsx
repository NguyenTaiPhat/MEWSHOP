"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

const menuItems = [
  {
    href: "/admin",
    label: "Tổng quan",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="2" width="7" height="7" rx="1.5" strokeLinecap="round"/>
        <rect x="11" y="2" width="7" height="7" rx="1.5" strokeLinecap="round"/>
        <rect x="2" y="11" width="7" height="7" rx="1.5" strokeLinecap="round"/>
        <rect x="11" y="11" width="7" height="7" rx="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: "/admin/products",
    label: "Sản phẩm",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="4" width="16" height="12" rx="2" strokeLinecap="round"/>
        <circle cx="10" cy="10" r="3" strokeLinecap="round"/>
        <circle cx="10" cy="10" r="1" fill="currentColor"/>
      </svg>
    ),
  },
  {
    href: "/admin/slots",
    label: "Lịch thuê",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="3" width="16" height="15" rx="2" strokeLinecap="round"/>
        <path d="M2 7h16" strokeLinecap="round"/>
        <path d="M6 1v4M14 1v4" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: "/admin/bookings",
    label: "Đơn thuê",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 2h12a2 2 0 012 2v14l-3-2-3 2-3-2-3 2-3-2V4a2 2 0 012-2z" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7 7h6M7 11h4" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: "/admin/users",
    label: "Khách hàng",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="10" cy="7" r="4" strokeLinecap="round"/>
        <path d="M3 18c0-3.5 3.5-6 7-6s7 2.5 7 6" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: "/admin/chat",
    label: "Tin nhắn",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 4h14a2 2 0 012 2v7a2 2 0 01-2 2H7l-4 3V6a2 2 0 012-2z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    href: "/admin/transactions",
    label: "Giao dịch",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="10" cy="10" r="8" strokeLinecap="round"/>
        <path d="M10 6v8M7 9l3-3 3 3M7 11l3 3 3-3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    href: "/admin/audit",
    label: "Nhật ký",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 2h8l4 4v12a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2z" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 2v4h4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 10h8M6 14h5" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Top Header */}
      <div className="admin-mobile-header">
        <button
          type="button"
          className="admin-mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle Navigation Menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <Link href="/admin" className="admin-mobile-logo">
          Tiệm Của Mew Admin
        </Link>

        <ThemeToggle />
      </div>

      {/* Background Overlay on Mobile */}
      {mobileOpen && (
        <div className="admin-sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main Admin Sidebar */}
      <aside className={`admin-sidebar ${mobileOpen ? "open" : ""}`} style={{ display: "flex", flexDirection: "column" }}>
        <div className="sidebar-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingRight: "12px" }}>
          <Link href="/" style={{ color: "inherit", textDecoration: "none", whiteSpace: "nowrap" }} title="Về trang chủ">
            Tiệm Của Mew
          </Link>
          <ThemeToggle />
        </div>

        <nav className="sidebar-nav" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1 }}>
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${pathname === item.href ? "active" : ""}`}
                onClick={() => setMobileOpen(false)}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>

          <div style={{ paddingTop: "16px", marginTop: "16px", borderTop: "1px solid var(--border-color)" }}>
            <Link
              href="/"
              className="sidebar-link"
              style={{ color: "var(--accent)", fontWeight: 600 }}
              onClick={() => setMobileOpen(false)}
            >
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: "20px", height: "20px" }}>
                <path d="M3 9.5L10 3l7 6.5V17a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 18v-6h4v6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Về trang người dùng
            </Link>
          </div>
        </nav>
      </aside>
    </>
  );
}
