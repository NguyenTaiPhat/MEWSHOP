import React from "react";

export function ProductCardSkeleton() {
  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: "12px", height: "100%" }}>
      <div className="skeleton" style={{ width: "100%", aspectRatio: "4/3", borderRadius: "var(--radius-md)" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="skeleton" style={{ width: "70px", height: "20px", borderRadius: "var(--radius-full)" }} />
        <div className="skeleton" style={{ width: "50px", height: "18px" }} />
      </div>
      <div className="skeleton" style={{ width: "85%", height: "22px", marginTop: "4px" }} />
      <div className="skeleton" style={{ width: "55%", height: "16px" }} />
      <div style={{ marginTop: "auto", paddingTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="skeleton" style={{ width: "90px", height: "24px" }} />
        <div className="skeleton" style={{ width: "80px", height: "36px", borderRadius: "var(--radius-md)" }} />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "24px", width: "100%" }}>
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="card" style={{ width: "100%", overflow: "hidden", padding: "16px" }}>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "16px", paddingBottom: "12px", borderBottom: "1px solid var(--border-color)" }}>
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: "18px", width: "75%" }} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "16px", padding: "14px 0", borderBottom: "1px solid var(--border-color)" }}>
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="skeleton" style={{ height: "16px", width: c === 0 ? "85%" : "60%" }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="profile-hero">
      <div className="profile-hero-top">
        <div className="skeleton" style={{ width: "96px", height: "96px", borderRadius: "50%", flexShrink: 0 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
          <div className="skeleton" style={{ width: "200px", height: "28px" }} />
          <div className="skeleton" style={{ width: "240px", height: "18px" }} />
          <div className="skeleton" style={{ width: "160px", height: "16px" }} />
        </div>
      </div>
      <div className="profile-kpi-grid">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="profile-kpi-card" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div className="skeleton" style={{ width: "80px", height: "14px" }} />
            <div className="skeleton" style={{ width: "110px", height: "24px" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
