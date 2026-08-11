"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { formatVND } from "@/lib/utils";
import { ProductCard } from "@/components/product/product-card";

interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  images: string[] | string;
  pricePerDay: string;
  status: string;
}

const categories = ["Tất cả Máy Ảnh", "Sony", "Canon", "Fujifilm", "RED", "Nikon"];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category && category !== "Tất cả Máy Ảnh") params.set("category", category);
    if (debounced) params.set("search", debounced);

    fetch(`/api/products?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category, debounced]);

  // Client-side instant filter fallback for maximum responsiveness
  const filteredProducts = products.filter((p) => {
    const matchSearch =
      !search.trim() ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      !category ||
      category === "Tất cả Máy Ảnh" ||
      p.category?.toLowerCase() === category.toLowerCase() ||
      p.brand?.toLowerCase() === category.toLowerCase();

    return matchSearch && matchCategory;
  });

  return (
    <>
      <Header />
      <main className="main-content">
        <h1 style={{ marginBottom: "24px" }}>Danh Mục Máy Ảnh Cho Thuê</h1>

        <div className="product-filter">
          <div className="search-input">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="8" cy="8" r="5.5"/>
              <path d="M15 15l-3.5-3.5" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm dòng máy ảnh..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "40px" }}
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="form-input"
            style={{ minWidth: "180px" }}
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="product-grid">
            {[1, 2, 3].map((i) => (
              <div key={i} className="product-card">
                <div className="skeleton" style={{ aspectRatio: "4/3" }} />
                <div style={{ padding: "20px" }}>
                  <div className="skeleton" style={{ height: "14px", width: "60px", marginBottom: "8px" }} />
                  <div className="skeleton" style={{ height: "20px", width: "180px", marginBottom: "12px" }} />
                  <div className="skeleton" style={{ height: "18px", width: "120px" }} />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="28" cy="28" r="18"/>
              <path d="M42 42l12 12" strokeLinecap="round" strokeWidth="3"/>
            </svg>
            <p className="empty-state-title">Không tìm thấy máy ảnh</p>
            <p className="empty-state-desc">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        ) : (
          <div className="product-grid">
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

      </main>
      <Footer />
    </>
  );
}
