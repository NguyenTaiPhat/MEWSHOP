"use client";

interface QuickReplyChipsProps {
  onSelect: (text: string) => void;
  userInfo?: {
    name?: string;
    phone?: string;
    email?: string;
  };
}

const PRESETS = [
  {
    label: "Gửi QR Cọc Máy",
    text: "Thông tin thanh toán cọc máy:\nSTK: 0769657008\nNgân hàng: MB BANK\nChủ TK: NGUYEN TAI PHAT\nCú pháp: COC_MAY",
  },
  {
    label: "Bảng Giá Thuê Máy",
    text: "Cho tôi xin bảng giá thuê máy ảnh và ống kính theo ngày tại Tiệm Của Mew.",
  },
  {
    label: "Thủ Tục Cần Thiết",
    text: "Cho tôi hỏi thủ tục và giấy tờ cần thiết để làm hợp đồng thuê máy ảnh.",
  },
  {
    label: "Cọc 2 Triệu",
    text: "Thông tin thanh toán cọc máy:\nSố tiền cọc: 2.000.000 đ\nSTK: 0769657008\nNgân hàng: MB BANK\nChủ TK: NGUYEN TAI PHAT\nCú pháp: COC_MAY",
  },
  {
    label: "Cọc 5 Triệu",
    text: "Thông tin thanh toán cọc máy:\nSố tiền cọc: 5.000.000 đ\nSTK: 0769657008\nNgân hàng: MB BANK\nChủ TK: NGUYEN TAI PHAT\nCú pháp: COC_MAY",
  },
  { label: "Địa chỉ tiệm", text: "Tiệm Của Mew mở cửa từ 8:00 - 21:00 hàng ngày tại trung tâm thành phố." },
  { label: "Giao máy tận nơi", text: "Tiệm hỗ trợ giao máy ảnh & ống kính tận nơi trong nội thành." },
];

export function QuickReplyChips({ onSelect, userInfo }: QuickReplyChipsProps) {
  const dynamicChips = [
    ...(userInfo
      ? [
          {
            label: "Gửi thông tin của tôi",
            text: `Thông tin giao nhận của tôi:\nHọ tên: ${userInfo.name || "Khách hàng"}\nSĐT: ${userInfo.phone || "Chưa cập nhật"}${userInfo.email ? `\nEmail: ${userInfo.email}` : ""}`,
          },
        ]
      : []),
    ...PRESETS,
  ];

  return (
    <div className="quick-reply-bar">
      {dynamicChips.map((p, idx) => (
        <button key={idx} type="button" className="quick-chip-btn" onClick={() => onSelect(p.text)}>
          {p.label}
        </button>
      ))}
    </div>
  );
}
