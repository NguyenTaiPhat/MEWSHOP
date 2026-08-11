"use client";

import { useState } from "react";
import { LightboxModal } from "./lightbox-modal";

export function SampleGallery({ sampleImages }: { sampleImages: string[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  if (!sampleImages || sampleImages.length === 0) return null;

  return (
    <div className="sample-gallery-section" style={{ marginTop: "32px" }}>
      <h3 style={{ marginBottom: "16px", fontFamily: "var(--font-brand)", fontSize: "1.25rem", color: "var(--text-primary)" }}>
        Bộ Ảnh Chụp Mẫu Thực Tế Từ Thiết Bị
      </h3>
      <div className="sample-grid">
        {sampleImages.map((url, idx) => (
          <div
            key={idx}
            className="sample-grid-item"
            onClick={() => {
              setActiveIdx(idx);
              setIsOpen(true);
            }}
          >
            <img src={url} alt={`Sample ${idx + 1}`} />
            <div className="sample-hover-overlay">
              <span>Phóng to xem nét</span>
            </div>
          </div>
        ))}
      </div>

      <LightboxModal
        isOpen={isOpen}
        images={sampleImages}
        currentIndex={activeIdx}
        onClose={() => setIsOpen(false)}
        onPrev={() => setActiveIdx((prev) => (prev > 0 ? prev - 1 : sampleImages.length - 1))}
        onNext={() => setActiveIdx((prev) => (prev < sampleImages.length - 1 ? prev + 1 : 0))}
      />
    </div>
  );
}
