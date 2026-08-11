"use client";

import Link from "next/link";
import { formatVND } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  condition: string;
  pricePerDay: number | string;
  depositRequired: number | string;
  images: string | string[];
  specs?: string | Record<string, any>;
}

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
}

export function CompareModal({ isOpen, onClose, products }: CompareModalProps) {
  if (!isOpen || !products || products.length === 0) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content compare-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "920px", width: "95%" }}>
        <div className="modal-header">
          <div style={{ fontWeight: 800, fontSize: "1.25rem", fontFamily: "var(--font-brand)" }}>
            Bảng So Sánh Thiết Bị Song Song
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body" style={{ overflowX: "auto", padding: "16px 20px" }}>
          <table className="compare-table">
            <thead>
              <tr>
                <th style={{ width: "160px" }}>Thông số</th>
                {products.map((p) => (
                  <th key={p.id} style={{ minWidth: "220px", textAlign: "center" }}>
                    <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)" }}>{p.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--accent)", textTransform: "uppercase", fontWeight: 700 }}>{p.brand}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="compare-label">Giá thuê / ngày</td>
                {products.map((p) => (
                  <td key={p.id} className="compare-val-highlight">{formatVND(p.pricePerDay)}</td>
                ))}
              </tr>
              <tr>
                <td className="compare-label">Tiền đặt cọc</td>
                {products.map((p) => (
                  <td key={p.id}>{formatVND(p.depositRequired)}</td>
                ))}
              </tr>
              <tr>
                <td className="compare-label">Danh mục máy</td>
                {products.map((p) => (
                  <td key={p.id}>{p.category}</td>
                ))}
              </tr>
              <tr>
                <td className="compare-label">Tình trạng máy</td>
                {products.map((p) => (
                  <td key={p.id}>{p.condition}</td>
                ))}
              </tr>
              <tr>
                <td className="compare-label">Hành động</td>
                {products.map((p) => (
                  <td key={p.id} style={{ textAlign: "center" }}>
                    <Link href={`/products/${p.id}`} className="btn btn-primary btn-sm" onClick={onClose}>
                      Bấm Thuê Ngay
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
