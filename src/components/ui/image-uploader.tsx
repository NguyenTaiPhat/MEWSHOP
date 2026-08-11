"use client";

import { useState } from "react";

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [error, setError] = useState("");

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError("");

    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          if (data.url) newUrls.push(data.url);
        } else {
          setError("Lỗi tải lên hình ảnh từ thiết bị");
        }
      }

      if (newUrls.length > 0) {
        onChange([...images, ...newUrls]);
      }
    } catch {
      setError("Không thể tải ảnh lên hệ thống");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function handleAddUrl() {
    if (!urlInput.trim()) return;
    onChange([...images, urlInput.trim()]);
    setUrlInput("");
  }

  function handleRemoveImage(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  return (
    <div style={{ marginBottom: "24px" }}>
      <label className="form-label" style={{ marginBottom: "8px", display: "block", fontWeight: 700 }}>
        Hình ảnh sản phẩm
      </label>

      {error && <div className="auth-error" style={{ marginBottom: "12px" }}>{error}</div>}

      <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap", alignItems: "center" }}>
        <label className="btn btn-secondary btn-sm" style={{ cursor: uploading ? "not-allowed" : "pointer", margin: 0 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: "6px" }}>
            <path d="M14 10v3a1 1 0 01-1 1H3a1 1 0 01-1-1v-3M8 2v9M5 5l3-3 3 3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {uploading ? "Đang tải ảnh..." : "Tải ảnh từ máy"}
          <input type="file" accept="image/*" multiple onChange={handleFileUpload} disabled={uploading} style={{ display: "none" }} />
        </label>

        <div style={{ display: "flex", gap: "8px", flex: 1, minWidth: "260px" }}>
          <input
            type="text"
            placeholder="Dán URL file ảnh (.jpg, .png...) rồi bấm Enter"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddUrl();
              }
            }}
            className="form-input"
            style={{ padding: "6px 12px", fontSize: "0.875rem" }}
          />
          <button type="button" onClick={handleAddUrl} className="btn btn-ghost btn-sm">
            + Thêm URL
          </button>
        </div>
      </div>

      {images.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "12px" }}>
          {images.map((url, idx) => (
            <div key={idx} style={{ position: "relative", aspectRatio: "4/3", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--border-color)", background: "var(--bg-tertiary)" }}>
              <img src={url} alt={`Preview ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              {idx === 0 && (
                <span style={{ position: "absolute", bottom: "4px", left: "4px", background: "rgba(0,0,0,0.75)", color: "var(--accent)", fontSize: "0.65rem", padding: "2px 6px", borderRadius: "4px", fontWeight: 700 }}>
                  Ảnh chính
                </span>
              )}
              <button
                type="button"
                onClick={() => handleRemoveImage(idx)}
                style={{
                  position: "absolute",
                  top: "4px",
                  right: "4px",
                  background: "rgba(0,0,0,0.75)",
                  color: "#ef4444",
                  border: "none",
                  borderRadius: "50%",
                  width: "22px",
                  height: "22px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer"
                }}
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 4L4 12M4 4l8 8" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
