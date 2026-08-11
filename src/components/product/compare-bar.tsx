"use client";

import { formatVND } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  brand: string;
  pricePerDay: number | string;
  images: string | string[];
}

interface CompareBarProps {
  selectedProducts: Product[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onOpenCompare: () => void;
}

export function CompareBar({ selectedProducts, onRemove, onClear, onOpenCompare }: CompareBarProps) {
  if (!selectedProducts || selectedProducts.length === 0) return null;

  return (
    <div className="compare-floating-bar">
      <div className="compare-bar-info">
        <span className="compare-bar-badge">{selectedProducts.length}/3</span>
        <span className="compare-bar-text">Máy ảnh đang chọn so sánh</span>
      </div>

      <div className="compare-bar-thumbs">
        {selectedProducts.map((p) => (
          <div key={p.id} className="compare-thumb-chip">
            <span className="compare-chip-name">{p.name}</span>
            <button type="button" onClick={() => onRemove(p.id)} className="compare-chip-remove" aria-label="Xóa khỏi so sánh">
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="compare-bar-actions">
        <button type="button" onClick={onClear} className="btn btn-ghost btn-sm" style={{ color: "var(--text-muted)" }}>
          Xóa hết
        </button>
        <button type="button" onClick={onOpenCompare} className="btn btn-primary btn-sm">
          So Sánh Ngay
        </button>
      </div>
    </div>
  );
}
