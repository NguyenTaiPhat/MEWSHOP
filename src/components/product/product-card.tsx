"use client";

import { useState } from "react";
import Link from "next/link";
import { formatVND } from "@/lib/utils";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    brand: string;
    pricePerDay: string | number;
    images: string | string[];
  };
  onToggleCompare?: (product: any) => void;
  isCompared?: boolean;
}

export function ProductCard({ product, onToggleCompare, isCompared }: ProductCardProps) {
  const [imgFailed, setImgFailed] = useState(false);

  let imgUrl: string | null = null;
  try {
    const rawImages = typeof product.images === "string" ? JSON.parse(product.images) : product.images;
    imgUrl = Array.isArray(rawImages) && rawImages.length > 0 ? rawImages[0] : null;
  } catch {
    imgUrl = null;
  }

  const showPlaceholder = !imgUrl || imgFailed;

  return (
    <div className="product-card-wrapper" style={{ position: "relative" }}>
      <Link href={`/products/${product.id}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
        <div className="product-card">
          <div className="product-card-image">
            {!showPlaceholder ? (
              <img
                src={imgUrl!}
                alt={product.name}
                onError={() => setImgFailed(true)}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "var(--bg-tertiary)",
                  color: "var(--accent)",
                  borderRadius: "var(--radius-md)"
                }}
              >
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </div>
            )}
          </div>
          <div className="product-card-body">
            <div className="product-card-brand">{product.brand}</div>
            <div className="product-card-name">{product.name}</div>
            <div className="product-card-price">
              <span className="product-card-price-value">{formatVND(product.pricePerDay)}</span>
              <span className="product-card-price-unit">/ngày</span>
            </div>
          </div>
        </div>
      </Link>

      {onToggleCompare && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleCompare(product);
          }}
          className={`compare-btn-badge ${isCompared ? "active" : ""}`}
        >
          {isCompared ? "✓ Đã chọn" : "+ So sánh"}
        </button>
      )}
    </div>
  );
}
