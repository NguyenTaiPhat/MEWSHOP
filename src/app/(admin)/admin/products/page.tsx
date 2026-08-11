"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { formatVND, getStatusLabel, getStatusVariant } from "@/lib/utils";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "danger"; message: string } | null>(null);

  function loadProducts() {
    setLoading(true);
    fetch("/api/products")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadProducts();
  }, []);

  // Auto hide toast popup after 4 seconds
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  async function handleDelete() {
    if (!deleteId) return;
    setIsDeleting(true);
    setToast(null);

    try {
      const res = await fetch(`/api/products/${deleteId}`, { method: "DELETE" });
      const data = await res.json();

      if (res.ok && data.success) {
        setToast({
          type: "success",
          message: data.message || "Đã xóa vĩnh viễn sản phẩm khỏi hệ thống thành công!",
        });
        setDeleteId(null);
        loadProducts();
      } else {
        setToast({
          type: "danger",
          message: data.error || "Không thể xóa sản phẩm do lỗi không xác định.",
        });
        setDeleteId(null);
      }
    } catch {
      setToast({
        type: "danger",
        message: "Lỗi kết nối mạng khi thực hiện xóa sản phẩm. Vui lòng thử lại.",
      });
      setDeleteId(null);
    } finally {
      setIsDeleting(false);
    }
  }

  const safeProducts = Array.isArray(products) ? products : [];

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Quản lý sản phẩm</h1>
          <p className="admin-page-subtitle">Danh sách thiết bị máy ảnh & ống kính cho thuê trên hệ thống</p>
        </div>
        <Link href="/admin/products/new" className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Thêm máy ảnh mới
        </Link>
      </div>

      {/* Floating Popup Toast Notification góc trên bên phải */}
      {toast && (
        <div className={`admin-toast-popup ${toast.type === "success" ? "toast-success" : "toast-danger"}`}>
          <div className="toast-content">
            {toast.type === "success" ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: "2px" }}>
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" strokeLinecap="round"/>
                <polyline points="22 4 12 14.01 9 11.01" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: "2px" }}>
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            )}
            <span>{toast.message}</span>
          </div>
          <button className="toast-close-btn" onClick={() => setToast(null)} title="Đóng thông báo">
            ✕
          </button>
        </div>
      )}

      {loading ? (
        <div className="booking-card-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="admin-product-card skeleton" style={{ height: "300px" }} />
          ))}
        </div>
      ) : safeProducts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 16px", background: "var(--bg-card)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-color)", color: "var(--text-muted)" }}>
          Chưa có sản phẩm nào trên hệ thống
        </div>
      ) : (
        <div className="booking-card-grid">
          {safeProducts.map((p) => {
            let imgList: string[] = [];
            try {
              imgList = typeof p.images === "string" ? JSON.parse(p.images) : (Array.isArray(p.images) ? p.images : []);
            } catch {
              imgList = [];
            }
            const firstImg = imgList[0] || null;

            return (
              <div key={p.id} className="admin-product-card">
                <div className="product-card-banner">
                  {firstImg ? (
                    <img
                      src={firstImg}
                      alt=""
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          const placeholder = parent.querySelector(".product-card-placeholder-fallback");
                          if (placeholder) (placeholder as HTMLElement).style.display = "flex";
                        }
                      }}
                    />
                  ) : null}
                  <div
                    className="product-card-placeholder-fallback"
                    style={{ display: firstImg ? "none" : "flex" }}
                  >
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="2" y="4" width="20" height="16" rx="2"/>
                      <circle cx="12" cy="12" r="4"/>
                      <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
                    </svg>
                  </div>
                  <div className="product-brand-badge-overlay">{p.brand}</div>
                </div>

                <div className="product-card-info-body">
                  <h3 className="product-card-title-vip">{p.name}</h3>
                  <div style={{ width: "fit-content", marginTop: "4px" }}>
                    <Badge variant={getStatusVariant(p.status)}>
                      {getStatusLabel(p.status)}
                    </Badge>
                  </div>
                </div>

                <div className="product-card-price-grid">
                  <div className="price-item">
                    <span className="price-item-label">Theo Giờ</span>
                    <span className="price-item-val">{formatVND(p.pricePerHour ?? p.hourlyRate ?? 0)}</span>
                  </div>
                  <div className="price-item">
                    <span className="price-item-label">Theo Ngày</span>
                    <span className="price-item-val" style={{ color: "var(--accent)", fontWeight: 800 }}>{formatVND(p.pricePerDay ?? p.dailyRate ?? 0)}</span>
                  </div>
                  <div className="price-item">
                    <span className="price-item-label">Tiền Cọc</span>
                    <span className="price-item-val">{formatVND(p.depositRequired ?? p.depositAmount ?? 0)}</span>
                  </div>
                </div>

                <div className="product-card-actions">
                  <Link href={`/admin/products/${p.id}`} className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: "center", fontWeight: 700 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Chỉnh sửa
                  </Link>
                  <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(p.id)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Xác nhận xóa sản phẩm">
        <p>Bạn có chắc chắn muốn xóa sản phẩm này khỏi hệ thống?</p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "24px" }}>
          <button className="btn btn-secondary" onClick={() => setDeleteId(null)} disabled={isDeleting}>Hủy</button>
          <button className="btn btn-danger" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Đang xóa..." : "Xóa vĩnh viễn"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
