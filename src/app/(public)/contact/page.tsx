"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <>
      <Header />
      <main className="info-container">
        <div className="info-header">
          <div className="info-badge">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2.5 4h11a1 1 0 011 1v7a1 1 0 01-1 1h-11a1 1 0 01-1-1V5a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M2.5 5l5.5 4 5.5-4" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            <span>Hỗ Trợ Khách Hàng 24/7</span>
          </div>
          <h1 className="info-title">Liên Hệ Với Chúng Tôi</h1>
          <p className="info-subtitle">
            Hãy gửi tin nhắn hoặc ghé thăm Showroom của Tiệm Của Mew để trực tiếp trải nghiệm thiết bị điện ảnh cao cấp.
          </p>
        </div>

        <div className="contact-grid">
          {/* Left Column: Contact Information */}
          <div className="contact-card">
            <h2 className="contact-card-title">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              Thông Tin Showroom
            </h2>

            <div className="contact-info-item">
              <div className="contact-info-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              <div className="contact-info-text">
                <label>Địa chỉ Showroom</label>
                <p>123 Đường Điện Biên Phủ, Phường 15, Quận Bình Thạnh, TP. Hồ Chí Minh</p>
              </div>
            </div>

            <div className="contact-info-item">
              <div className="contact-info-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
                </svg>
              </div>
              <div className="contact-info-text">
                <label>Hotline / Zalo Tư Vấn</label>
                <p><a href="tel:0901234567">0901 234 567</a> - <a href="tel:0988777999">0988 777 999</a></p>
              </div>
            </div>

            <div className="contact-info-item">
              <div className="contact-info-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <div className="contact-info-text">
                <label>Email Hỗ Trợ Dịch Vụ</label>
                <p><a href="mailto:hotro@tiemcuamew.vn">hotro@tiemcuamew.vn</a></p>
              </div>
            </div>

            <div className="contact-info-item">
              <div className="contact-info-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div className="contact-info-text">
                <label>Giờ Mở Cửa Showroom</label>
                <p>08:00 – 21:00 (Tất cả các ngày trong tuần)</p>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Message Form */}
          <div className="contact-card">
            <h2 className="contact-card-title">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
              </svg>
              Gửi Lời Nhắn Cho Mew
            </h2>

            {submitted ? (
              <div
                style={{
                  padding: "24px",
                  background: "var(--success-subtle)",
                  border: "1px solid var(--success)",
                  borderRadius: "var(--radius-lg)",
                  textAlign: "center",
                  color: "var(--success)",
                }}
              >
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ margin: "0 auto 12px" }}>
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" strokeLinecap="round"/>
                  <polyline points="22 4 12 14.01 9 11.01" strokeLinecap="round"/>
                </svg>
                <h3 style={{ fontSize: "1.25rem", marginBottom: "8px", fontWeight: 700 }}>Đã Gửi Thành Công!</h3>
                <p style={{ fontSize: "0.875rem", color: "var(--text-primary)" }}>
                  Cảm ơn bạn đã liên hệ. Đội ngũ Tiệm Của Mew sẽ phản hồi bạn qua Email/SĐT trong vòng 15 phút.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label className="form-label">Họ và tên *</label>
                  <input type="text" required placeholder="Nguyễn Văn A" className="form-input" />
                </div>

                <div className="form-group">
                  <label className="form-label">Email hoặc Số điện thoại *</label>
                  <input type="text" required placeholder="0901234567 hoặc email@gmail.com" className="form-input" />
                </div>

                <div className="form-group">
                  <label className="form-label">Nội dung tư vấn / Yêu cầu báo giá *</label>
                  <textarea required rows={4} placeholder="Hãy nhập thiết bị bạn cần thuê hoặc câu hỏi..." className="form-input" />
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary btn-lg" style={{ marginTop: "12px" }}>
                  {loading ? "Đang gửi tin nhắn..." : "Gửi Lời Nhắn Ngay"}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
