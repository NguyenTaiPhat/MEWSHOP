import Link from "next/link";

export default function NotFound() {
  return (
    <div className="main-content" style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="empty-state">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M16 16s-1.5-2-4-2-4 2-4 2M9 9h.01M15 9h.01" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h1 className="empty-state-title">404 - Trang Không Tồn Tại</h1>
        <p className="empty-state-desc">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển sang địa chỉ mới.
        </p>
        <Link href="/" className="btn btn-primary">
          Trở Về Trang Chủ
        </Link>
      </div>
    </div>
  );
}
