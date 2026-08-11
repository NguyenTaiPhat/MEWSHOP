"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatTime, formatVND } from "@/lib/utils";

interface MessageBubbleProps {
  msg: {
    id: string;
    content: string;
    senderId?: string;
    createdAt: string | Date;
  };
  isOwn: boolean;
}

function parseDepositAmount(text: string): number | null {
  const clean = text.replace(/,/g, "").replace(/\./g, "");
  const digitMatch = clean.match(/(?:cọc|tiền|giá|amount)?\s*:?\s*(\d{5,10})\b/i);
  if (digitMatch && digitMatch[1]) return parseInt(digitMatch[1], 10);

  const kMatch = text.match(/(\d+)\s*k\b/i);
  if (kMatch && kMatch[1]) return parseInt(kMatch[1], 10) * 1000;

  const trMatch = text.match(/(\d+)\s*tr\b/i);
  if (trMatch && trMatch[1]) return parseInt(trMatch[1], 10) * 1000000;

  return null;
}

function ProductChatCard({ content, targetUrl, isOwn, createdAt }: { content: string; targetUrl: string; isOwn: boolean; createdAt: string | Date }) {
  const [productData, setProductData] = useState<any>(null);
  const cleanText = content.replace(/https?:\/\/[^\s]+/gi, "").trim();

  const productIdMatch = targetUrl.match(/\/products\/([a-zA-Z0-9-]+)/);
  const productId = productIdMatch ? productIdMatch[1] : null;

  useEffect(() => {
    if (!productId) return;
    fetch(`/api/products/${productId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setProductData(data);
      })
      .catch(() => {});
  }, [productId]);

  let thumbUrl: string | null = null;
  if (productData?.images) {
    try {
      const rawImgs = typeof productData.images === "string" ? JSON.parse(productData.images) : productData.images;
      if (Array.isArray(rawImgs) && rawImgs.length > 0) thumbUrl = rawImgs[0];
    } catch {
      thumbUrl = null;
    }
  }

  return (
    <div className={`chat-card-container ${isOwn ? "own" : "other"}`}>
      <div className="chat-product-card-luxury">
        <div className="chat-qr-card-header">
          <span className="chat-qr-card-tag" style={{ color: "var(--accent)" }}>THẺ TƯ VẤN MÁY ÁNH</span>
          <span className="chat-qr-card-brand">TIỆM CỦA MEW</span>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center", margin: "12px 0" }}>
          {thumbUrl ? (
            <img
              src={thumbUrl}
              alt={productData?.name || "Máy ảnh"}
              style={{ width: "64px", height: "64px", borderRadius: "8px", objectFit: "cover", flexShrink: 0, border: "1px solid var(--border-color)" }}
            />
          ) : (
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "8px",
                background: "var(--bg-tertiary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent)",
                flexShrink: 0,
                border: "1px solid var(--border-color)"
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="4" />
                <path d="M8 7V5a1.5 1.5 0 0 1 1.5-1.5h5A1.5 1.5 0 0 1 16 5v2" />
                <circle cx="12" cy="14" r="3.5" />
              </svg>
            </div>
          )}

          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#ffffff", marginBottom: "4px", lineHeight: "1.4" }}>
              {productData?.name || cleanText || "Tôi muốn tư vấn máy ảnh này"}
            </div>
            {productData?.pricePerDay && (
              <div style={{ fontSize: "0.8125rem", color: "var(--accent)", fontWeight: 800 }}>
                {formatVND(productData.pricePerDay)} /ngày
              </div>
            )}
          </div>
        </div>

        <Link
          href={targetUrl}
          className="btn btn-primary btn-sm"
          style={{ width: "100%", textAlign: "center", display: "block", fontWeight: 700 }}
        >
          Xem Chi Tiết Máy
        </Link>

        <div className="chat-bubble-time" style={{ fontSize: "0.6875rem", opacity: 0.6, marginTop: "8px", textAlign: "right", color: "#94a3b8" }}>
          {formatTime(createdAt)}
        </div>
      </div>
    </div>
  );
}

export function ChatMessageBubble({ msg, isOwn }: MessageBubbleProps) {
  const isProductLink = msg.content.includes("/products/");
  const isQRRequest =
    msg.content.includes("STK:") ||
    msg.content.includes("VietQR") ||
    msg.content.includes("COC_MAY") ||
    msg.content.includes("MB BANK") ||
    msg.content.includes("0769657008");

  const depositAmount = isQRRequest ? parseDepositAmount(msg.content) : null;
  const amountParam = depositAmount ? `&amount=${depositAmount}` : "";

  const qrImageUrl = `https://img.vietqr.io/image/MB-0769657008-compact2.png?addInfo=COC_MAY${amountParam}&accountName=NGUYEN%20TAI%20PHAT`;

  if (isQRRequest) {
    return (
      <div className={`chat-card-container ${isOwn ? "own" : "other"}`}>
        <div className="chat-qr-card-luxury">
          <div className="chat-qr-card-header">
            <span className="chat-qr-card-tag">VIETQR THANH TOÁN CỌC</span>
            <span className="chat-qr-card-brand">TIỆM CỦA MEW</span>
          </div>

          <div className="chat-qr-image-wrapper">
            <img
              src={qrImageUrl}
              alt="Mã QR Chuyển Khoản MB Bank NGUYEN TAI PHAT"
              className="chat-qr-img"
            />
          </div>

          <div className="chat-qr-details-table">
            {depositAmount && (
              <div className="chat-qr-detail-row" style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)", paddingBottom: "6px", marginBottom: "4px" }}>
                <span className="chat-qr-label" style={{ fontWeight: 700, color: "#ffffff" }}>Số tiền cọc máy</span>
                <span className="chat-qr-val-copy" style={{ fontSize: "1.05rem", color: "var(--accent)" }}>
                  {formatVND(depositAmount)}
                </span>
              </div>
            )}
            <div className="chat-qr-detail-row">
              <span className="chat-qr-label">Ngân hàng</span>
              <span className="chat-qr-val-highlight">MB BANK</span>
            </div>
            <div className="chat-qr-detail-row">
              <span className="chat-qr-label">Số tài khoản</span>
              <span className="chat-qr-val-copy">0769657008</span>
            </div>
            <div className="chat-qr-detail-row">
              <span className="chat-qr-label">Chủ tài khoản</span>
              <span className="chat-qr-val">NGUYEN TAI PHAT</span>
            </div>
            <div className="chat-qr-detail-row">
              <span className="chat-qr-label">Cú pháp cọc</span>
              <span className="chat-qr-val-memo">COC_MAY</span>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary btn-sm chat-qr-copy-btn"
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText("0769657008");
                alert(`Đã sao chép STK MB Bank: 0769657008 (NGUYEN TAI PHAT)${depositAmount ? ` - Số tiền cọc: ${formatVND(depositAmount)}` : ""}`);
              }
            }}
          >
            Sao Chép STK MB Bank (0769657008)
          </button>

          <div className="chat-bubble-time" style={{ fontSize: "0.6875rem", opacity: 0.6, marginTop: "8px", textAlign: "right", color: "#94a3b8" }}>
            {formatTime(msg.createdAt)}
          </div>
        </div>
      </div>
    );
  }

  if (isProductLink) {
    const rawUrlMatch = msg.content.match(/https?:\/\/[^\s]+/i);
    const targetUrl = rawUrlMatch ? rawUrlMatch[0] : "/products";

    return <ProductChatCard content={msg.content} targetUrl={targetUrl} isOwn={isOwn} createdAt={msg.createdAt} />;
  }

  return (
    <div className={`chat-bubble ${isOwn ? "own" : "other"}`}>
      <div style={{ whiteSpace: "pre-line" }}>{msg.content}</div>
      <div className="chat-bubble-time" style={{ fontSize: "0.6875rem", opacity: 0.7, marginTop: "4px", textAlign: isOwn ? "right" : "left" }}>
        {formatTime(msg.createdAt)}
      </div>
    </div>
  );
}
