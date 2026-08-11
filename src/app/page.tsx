"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Camera3DViewer } from "@/components/3d/camera-viewer";
import { formatVND } from "@/lib/utils";
import { ProductCard } from "@/components/product/product-card";

interface Product {
  id: string;
  name: string;
  brand: string;
  images: string[];
  pricePerDay: string;
  status: string;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/products?status=AVAILABLE")
      .then((r) => r.json())
      .then((data) => setProducts(data.slice(0, 6)))
      .catch(() => { });
  }, []);

  return (
    <>
      <Header />

      {/* Dynamic Split Hero with Interactive 3D Camera */}
      <section className="hero-split-container">
        <div className="hero-split">
          <div className="hero-content">

            <h1 className="hero-title-split">
              TI<span className="char-diacritic-dot">Ê</span>M CỦA <span className="hero-title-brand-highlight">MEW</span>
            </h1>

            <p className="hero-subtitle-split">
              Dịch vụ cho thuê máy ảnh chuyên nghiệp với mức giá tối ưu. Đặt lịch linh hoạt, máy ảnh kiểm định kỹ lưỡng, hỗ trợ 24/7.
            </p>

            <div className="hero-actions-split">
              <Link href="/products" className="btn btn-primary btn-lg">
                Khám phá sản phẩm
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4.166 10h11.668M10 4.166L15.833 10 10 15.833" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link href="/register" className="btn btn-secondary btn-lg">
                Đăng ký thành viên
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                  <circle cx="8.5" cy="7" r="4"/>
                  <line x1="20" y1="8" x2="20" y2="14"/>
                  <line x1="17" y1="11" x2="23" y2="11"/>
                </svg>
              </Link>
            </div>

            <div className="hero-process-chips">
              <div className="process-chip">
                <div className="process-chip-num">01</div>
                <div>
                  <div className="process-chip-title">Chọn máy ưa thích</div>
                  <div className="process-chip-desc">Canon, Sony, Fujifilm minh bạch</div>
                </div>
              </div>
              <div className="process-chip">
                <div className="process-chip-num">02</div>
                <div>
                  <div className="process-chip-title">Đặt cọc VietQR 1s</div>
                  <div className="process-chip-desc">Tự động khớp tiền cọc ngay</div>
                </div>
              </div>
              <div className="process-chip">
                <div className="process-chip-num">03</div>
                <div>
                  <div className="process-chip-title">Nhận máy trải nghiệm</div>
                  <div className="process-chip-desc">Thiết bị sạch đẹp sẵn sàng chụp</div>
                </div>
              </div>
            </div>
          </div>

          <div className="hero-3d-wrapper">
            <div className="hero-3d-glow" />
            <div className="hero-3d-card">
              <Camera3DViewer />
            </div>
          </div>
        </div>
      </section>

      {/* 3 Steps Feature */}
      <section className="steps-container">
        <div className="section-header-center">
          <h2 className="section-title">Quy Trình Thuê Nhanh Chóng</h2>
          <p className="section-subtitle">Chỉ với 3 bước đơn giản để sở hữu thiết bị mơ ước cho dự án của bạn</p>
        </div>

        <div className="steps">
          <div className="step-card">
            <div className="step-icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="step-title">1. Chọn Thiết Bị</h3>
            <p className="step-desc">Duyệt danh mục phong phú, lọc theo thương hiệu và nhu cầu quay chụp</p>
          </div>

          <div className="step-card">
            <div className="step-icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M3 10h18" strokeLinecap="round" />
                <path d="M8 2v4M16 2v4" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="step-title">2. Chọn Khung Giờ</h3>
            <p className="step-desc">Xem slot khả dụng trực quan và đặt lịch thuê chỉ với vài thao tác</p>
          </div>

          <div className="step-card">
            <div className="step-icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="9" />
              </svg>
            </div>
            <h3 className="step-title">3. Nhận Máy & Sáng Tạo</h3>
            <p className="step-desc">Thanh toán đặt cọc tiện lợi, nhận thiết bị sẵn sàng tạo nên tác phẩm</p>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {products.length > 0 && (
        <section style={{ padding: "0 24px 80px", maxWidth: "1200px", margin: "0 auto" }}>
          <div className="section-header-center">
            <h2 className="section-title">Sản Phẩm Nổi Bật</h2>
            <p className="section-subtitle">Những dòng camera và thấu kính được yêu thích nhất tại Tiệm Của Mew</p>
          </div>

          <div className="product-grid">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <Footer />
    </>
  );
}
