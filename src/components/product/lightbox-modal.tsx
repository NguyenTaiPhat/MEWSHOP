"use client";

import { useEffect } from "react";

interface LightboxModalProps {
  isOpen: boolean;
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export function LightboxModal({ isOpen, images, currentIndex, onClose, onPrev, onNext }: LightboxModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, onPrev, onNext]);

  if (!isOpen || !images || images.length === 0) return null;

  return (
    <div className="lightbox-backdrop" onClick={onClose}>
      <div className="lightbox-container" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="lightbox-close" onClick={onClose} aria-label="Đóng">
          ✕
        </button>
        {images.length > 1 && (
          <>
            <button type="button" className="lightbox-nav prev" onClick={onPrev} aria-label="Ảnh trước">
              ‹
            </button>
            <button type="button" className="lightbox-nav next" onClick={onNext} aria-label="Ảnh kế tiếp">
              ›
            </button>
          </>
        )}
        <img src={images[currentIndex]} alt={`Sample photo ${currentIndex + 1}`} className="lightbox-img" />
        <div className="lightbox-caption">
          Ảnh Chụp Mẫu Thực Tế ({currentIndex + 1} / {images.length})
        </div>
      </div>
    </div>
  );
}
