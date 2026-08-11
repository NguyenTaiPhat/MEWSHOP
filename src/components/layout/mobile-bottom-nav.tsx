"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Do not render bottom nav on admin routes
  if (pathname.startsWith("/admin")) {
    return null;
  }

  const links = [
    {
      href: "/",
      label: "Trang chủ",
      exact: true,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      ),
    },
    {
      href: "/products",
      label: "Sản phẩm",
      exact: false,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="4" />
          <path d="M8 7V5a1.5 1.5 0 0 1 1.5-1.5h5A1.5 1.5 0 0 1 16 5v2" />
          <circle cx="12" cy="14" r="3.5" />
        </svg>
      ),
    },
    {
      href: session ? "/chat" : "/login",
      label: "Tin nhắn",
      exact: false,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
        </svg>
      ),
    },
    {
      href: session ? "/profile" : "/login",
      label: "Cá nhân",
      exact: false,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      ),
    },
  ];

  return (
    <nav className="mobile-bottom-nav">
      {links.map((item) => {
        const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href) && item.href !== "/";
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`mobile-bottom-nav-item ${isActive ? "active" : ""}`}
          >
            <div className="mobile-bottom-nav-icon">{item.icon}</div>
            <span className="mobile-bottom-nav-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
