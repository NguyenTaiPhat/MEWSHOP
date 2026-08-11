"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUploader } from "@/components/ui/image-uploader";

const categories = ["Máy Ảnh"];
const conditions = ["Mới 100%", "Như mới (99%)", "Tốt (95%)", "Khá"];

export default function NewProductPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", description: "", category: "Máy Ảnh", brand: "", condition: "Như mới (99%)",
    pricePerDay: "", pricePerHour: "", depositRequired: "",
  });
  const [images, setImages] = useState<string[]>([]);
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([{ key: "", value: "" }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (images.length === 0) {
      setError("Vui lòng tải lên ít nhất 1 hình ảnh sản phẩm");
      return;
    }

    setLoading(true);

    const specsObj: Record<string, string> = {};
    specs.forEach((s) => { if (s.key && s.value) specsObj[s.key] = s.value; });

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        images: JSON.stringify(images),
        pricePerDay: parseFloat(form.pricePerDay),
        pricePerHour: parseFloat(form.pricePerHour),
        depositRequired: parseFloat(form.depositRequired),
        specs: specsObj,
      }),
    });

    setLoading(false);
    if (res.ok) {
      router.push("/admin/products");
    } else {
      const data = await res.json();
      setError(data.error || "Lỗi tạo sản phẩm");
    }
  }

  return (
    <div>
      <h1 className="admin-page-title" style={{ marginBottom: "32px" }}>Thêm sản phẩm mới</h1>

      <form onSubmit={handleSubmit} style={{ maxWidth: "600px" }}>
        {error && <div className="auth-error">{error}</div>}

        <div className="form-group">
          <label>Tên sản phẩm</label>
          <input type="text" value={form.name} onChange={(e) => updateField("name", e.target.value)} required placeholder="Ví dụ: Sony FX6 Cinema Line Camera" className="form-input" />
        </div>

        <ImageUploader images={images} onChange={setImages} />

        <div className="form-group">
          <label>Mô tả chi tiết</label>
          <textarea value={form.description} onChange={(e) => updateField("description", e.target.value)} required placeholder="Nhập mô tả tình trạng, đặc điểm thiết bị..." className="form-input" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div className="form-group">
            <label>Thương hiệu</label>
            <input type="text" value={form.brand} onChange={(e) => updateField("brand", e.target.value)} required placeholder="Sony, Canon, RED..." className="form-input" />
          </div>
          <div className="form-group">
            <label>Danh mục</label>
            <select value={form.category} onChange={(e) => updateField("category", e.target.value)} className="form-input">
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Tình trạng máy</label>
          <select value={form.condition} onChange={(e) => updateField("condition", e.target.value)} className="form-input">
            {conditions.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
          <div className="form-group">
            <label>Giá/ngày (VNĐ)</label>
            <input type="number" value={form.pricePerDay} onChange={(e) => updateField("pricePerDay", e.target.value)} required placeholder="500000" className="form-input" />
          </div>
          <div className="form-group">
            <label>Giá/giờ (VNĐ)</label>
            <input type="number" value={form.pricePerHour} onChange={(e) => updateField("pricePerHour", e.target.value)} required placeholder="100000" className="form-input" />
          </div>
          <div className="form-group">
            <label>Tiền cọc (VNĐ)</label>
            <input type="number" value={form.depositRequired} onChange={(e) => updateField("depositRequired", e.target.value)} required placeholder="5000000" className="form-input" />
          </div>
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label className="form-label" style={{ marginBottom: "8px", display: "block" }}>Thông số kỹ thuật</label>
          {specs.map((s, i) => (
            <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
              <input placeholder="Tên thông số (VD: Cảm biến)" value={s.key} onChange={(e) => { const n = [...specs]; n[i].key = e.target.value; setSpecs(n); }} className="form-input" />
              <input placeholder="Giá trị (VD: Full-frame 33MP)" value={s.value} onChange={(e) => { const n = [...specs]; n[i].value = e.target.value; setSpecs(n); }} className="form-input" />
              {specs.length > 1 && (
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSpecs(specs.filter((_, j) => j !== i))}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 4L4 12M4 4l8 8" strokeLinecap="round"/></svg>
                </button>
              )}
            </div>
          ))}
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSpecs([...specs, { key: "", value: "" }])}>
            + Thêm thông số
          </button>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Đang tạo..." : "Tạo sản phẩm"}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => router.back()}>Hủy</button>
        </div>
      </form>
    </div>
  );
}
