"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { SampleGallery } from "@/components/product/sample-gallery";
import { formatVND, formatDate, getStatusLabel, getStatusVariant, parseSpecs } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  condition: string;
  description: string;
  images: string[];
  sampleImages?: string | string[];
  pricePerDay: string;
  pricePerHour: string;
  depositRequired: string;
  status: string;
  specs: Record<string, string> | null;
}

interface Slot {
  id: string;
  startDate: string;
  endDate: string;
  status: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [product, setProduct] = useState<Product | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [bookingSlotId, setBookingSlotId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/products/${params.id}`)
      .then((r) => r.json())
      .then(setProduct)
      .catch(() => {});

    fetch(`/api/slots?productId=${params.id}`)
      .then((r) => r.json())
      .then(setSlots)
      .catch(() => {});
  }, [params.id]);

  async function handleBook(slotId: string) {
    if (!session) {
      router.push(`/login?callbackUrl=/products/${params.id}`);
      return;
    }

    if (bookingSlotId) return;

    setBookingSlotId(slotId);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: params.id, slotId }),
      });

      if (res.ok) {
        const data = await res.json();
        // Chuyển thẳng sang trang Chi tiết đơn thuê để thực hiện Bước 1 & Bước 2 VietQR
        router.push(`/bookings/${data.id}`);
      }
    } finally {
      setTimeout(() => setBookingSlotId(null), 1500);
    }
  }

  if (!product) {
    return (
      <>
        <Header />
        <main className="main-content">
          <div className="skeleton" style={{ height: "400px", marginBottom: "24px" }} />
        </main>
      </>
    );
  }

  const rawImages = typeof product.images === "string" ? JSON.parse(product.images) : product.images;
  const imageList: string[] = Array.isArray(rawImages) ? rawImages : [];
  const specsObj: Record<string, string> = parseSpecs(product.specs);

  return (
    <>
      <Header />
      <main className="main-content">
        <div className="product-detail">
          <div className="product-gallery">
            <div className="product-gallery-main">
              {imageList[selectedImage] ? (
                <img
                  src={imageList[selectedImage]}
                  alt={product.name}
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                    const fallbackNode = (e.target as HTMLElement).nextElementSibling;
                    if (fallbackNode) (fallbackNode as HTMLElement).style.display = "flex";
                  }}
                />
              ) : null}
              <div
                style={{
                  display: imageList[selectedImage] ? "none" : "flex",
                  width: "100%",
                  height: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--accent)"
                }}
              >
                <svg width="100" height="100" viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="10" y="25" width="100" height="70" rx="8"/>
                  <circle cx="60" cy="60" r="20"/>
                  <circle cx="60" cy="60" r="8" fill="currentColor"/>
                  <rect x="76" y="15" width="22" height="14" rx="3"/>
                </svg>
              </div>
            </div>
            {imageList.length > 1 && (
              <div className="product-gallery-thumbs">
                {imageList.map((img, i) => (
                  <div
                    key={i}
                    className={`product-gallery-thumb ${i === selectedImage ? "active" : ""}`}
                    onClick={() => setSelectedImage(i)}
                  >
                    <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="product-info">
            <div>
              <span className="product-info-brand">{product.brand}</span>
              <Badge variant={getStatusVariant(product.status)}>{getStatusLabel(product.status)}</Badge>
            </div>
            <h1 className="product-info-name">{product.name}</h1>
            <p className="product-info-desc">{product.description}</p>

            <div className="product-price-table">
              <div className="product-price-item">
                <div className="product-price-label">Theo giờ</div>
                <div className="product-price-value">{formatVND(product.pricePerHour)}</div>
              </div>
              <div className="product-price-item">
                <div className="product-price-label">Theo ngày</div>
                <div className="product-price-value">{formatVND(product.pricePerDay)}</div>
              </div>
              <div className="product-price-item">
                <div className="product-price-label">Tiền cọc</div>
                <div className="product-price-value">{formatVND(product.depositRequired)}</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (!session) {
                  router.push(`/login?callbackUrl=/products/${params.id}`);
                  return;
                }
                if (!product) return;
                const prodUrl = `${window.location.origin}/products/${product.id}`;
                const content = `Tôi muốn tư vấn máy ảnh ${product.name} này:\n${prodUrl}`;
                window.dispatchEvent(
                  new CustomEvent("open-chat-popup", {
                    detail: { initialMessage: content },
                  })
                );
              }}
              className="btn btn-secondary"
              style={{ width: "100%", marginTop: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontWeight: 700 }}
            >
              Nhắn Tin Tư Vấn Máy Này
            </button>

            {Object.keys(specsObj).length > 0 && (
              <div>
                <h3 style={{ marginBottom: "12px" }}>Thông số kỹ thuật</h3>
                <div className="product-specs">
                  {Object.entries(specsObj).map(([key, value]) => (
                    <div key={key} className="product-spec-item">
                      <span className="product-spec-key">{key}</span>
                      <span className="product-spec-value">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {(() => {
          let parsedSampleImages: string[] = [];
          if (product.sampleImages) {
            try {
              parsedSampleImages = typeof product.sampleImages === "string" ? JSON.parse(product.sampleImages) : product.sampleImages;
            } catch {
              parsedSampleImages = [];
            }
          }
          return <SampleGallery sampleImages={parsedSampleImages} />;
        })()}

        {slots.filter((s) => s.status === "OPEN").length > 0 && (
          <div className="page-section">
            <h2 className="page-section-title">Lịch thuê khả dụng</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
              {slots
                .filter((s) => s.status === "OPEN")
                .map((slot) => (
                  <div key={slot.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: "4px" }}>
                        {formatDate(slot.startDate)} - {formatDate(slot.endDate)}
                      </div>
                      <Badge variant="success">Còn trống</Badge>
                    </div>
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ fontWeight: 700 }}
                      onClick={() => handleBook(slot.id)}
                      disabled={!!bookingSlotId}
                    >
                      {bookingSlotId === slot.id ? "Đang tạo đơn..." : "Đặt thuê ngay"}
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
