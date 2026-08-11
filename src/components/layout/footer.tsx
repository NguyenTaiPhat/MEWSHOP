import Link from "next/link";

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-links">
        <Link href="/about">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="10" cy="10" r="8"/>
            <path d="M10 9v5M10 6h.01" strokeLinecap="round" strokeWidth="2"/>
          </svg>
          <span>Giới thiệu</span>
        </Link>
        <Link href="/contact">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 4h14a2 2 0 012 2v8a2 2 0 01-2 2H3a2 2 0 01-2-2V6a2 2 0 012-2z" strokeLinecap="round"/>
            <path d="M3 6l7 5 7-5" strokeLinecap="round"/>
          </svg>
          <span>Liên hệ</span>
        </Link>
        <Link href="/terms">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 2h8l4 4v12a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2z" strokeLinecap="round"/>
            <path d="M12 2v4h4M7 9h6M7 13h4" strokeLinecap="round"/>
          </svg>
          <span>Điều khoản</span>
        </Link>
      </div>
      <p>© 2026 Tiệm Của Mew - Cho thuê camera & thiết bị điện ảnh cao cấp</p>
    </footer>
  );
}
