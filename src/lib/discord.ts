const DISCORD_WEBHOOK_URL =
  process.env.DISCORD_WEBHOOK_URL ||
  "https://discord.com/api/webhooks/1536758945845084260/7diMxA3Fc9HMW2y5rqnPIq1dg2qkicrnwGSWhMadhad5j2v9kXHpD5CQKbAI1GGgO0IF";

interface NotifyBookingOptions {
  type: "NEW_BOOKING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  bookingId: string;
  userName: string;
  userEmail?: string;
  productName: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  depositAmount: number;
}

export async function sendDiscordNotification(opts: NotifyBookingOptions) {
  try {
    const shortId = opts.bookingId.slice(0, 8).toUpperCase();
    const siteUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const adminLink = `${siteUrl}/admin/bookings/${opts.bookingId}`;

    let title = `📸 [ĐƠN THUÊ MỚI] Đơn Thuê #${shortId}`;
    let color = 0xf59e0b; // Amber Gold
    let badgeText = "🟡 ĐANG CHỜ ADMIN XÁC NHẬN";
    let statusDesc = "⚡ Khách hàng vừa khởi tạo đơn thuê máy ảnh mới trên hệ thống.";
    let bannerThumb = "https://cdn-icons-png.flaticon.com/512/2950/2950036.png";

    if (opts.type === "CONFIRMED") {
      title = `✅ [ĐÃ DUYỆT ĐƠN] Đơn Thuê #${shortId}`;
      color = 0x10b981; // Emerald Green
      badgeText = "🟢 ĐÃ PHÊ DUYỆT - CHỜ KHÁCH CỌC";
      statusDesc = "✨ Admin đã phê duyệt đơn thuê. Khách hàng có thể chuyển cọc VietQR ngay.";
      bannerThumb = "https://cdn-icons-png.flaticon.com/512/190/190411.png";
    } else if (opts.type === "CANCELLED") {
      title = `❌ [ĐÃ HỦY ĐƠN] Đơn Thuê #${shortId}`;
      color = 0xef4444; // Rose Red
      badgeText = "🔴 ĐÃ HỦY ĐƠN THUÊ";
      statusDesc = "⚠️ Đơn thuê đã bị hủy trên hệ thống. Khung giờ thuê đã được mở lại cho khách khác.";
      bannerThumb = "https://cdn-icons-png.flaticon.com/512/190/190406.png";
    } else if (opts.type === "COMPLETED") {
      title = `🎉 [HOÀN THÀNH & HOÀN CỌC] Đơn Thuê #${shortId}`;
      color = 0x3b82f6; // Sapphire Blue
      badgeText = "🔵 ĐÃ HOÀN THÀNH TẤT CẢ";
      statusDesc = "🏆 Khách hàng đã trả máy sạch đẹp. Hệ thống đã hoàn trả lại tiền cọc thành công.";
      bannerThumb = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
    }

    const formattedDeposit = `${new Intl.NumberFormat("vi-VN").format(opts.depositAmount)} đ`;
    const formattedTotal = `${new Intl.NumberFormat("vi-VN").format(opts.totalPrice)} đ`;

    const payload = {
      username: "TRỢ LÝ MEW",
      embeds: [
        {
          title,
          url: adminLink,
          description: `\n### ${badgeText}\n${statusDesc}\n\n─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─\n`,
          color,
          thumbnail: {
            url: bannerThumb,
          },
          fields: [
            {
              name: "📦 Mã Đơn Thuê",
              value: `\`#${shortId}\``,
              inline: true,
            },
            {
              name: "👤 Khách Hàng",
              value: `**${opts.userName}**\n\`${opts.userEmail || "Khách hàng"}\``,
              inline: true,
            },
            {
              name: "🎥 Thiết Bị Máy Ảnh",
              value: `**${opts.productName}**`,
              inline: false,
            },
            {
              name: "📅 Thời Gian Cho Thuê",
              value: `\`${opts.startDate}\` ➔ \`${opts.endDate}\``,
              inline: false,
            },
            {
              name: "💳 Tiền Cọc Giữ Máy",
              value: `**${formattedDeposit}**`,
              inline: true,
            },
            {
              name: "💵 Tổng Tiền Thuê",
              value: `**${formattedTotal}**`,
              inline: true,
            },
            {
              name: "⚡ Thao Tác Nhanh Admin",
              value: `[👉 Bấm vào đây để mở trang xử lý đơn #${shortId}](${adminLink})`,
              inline: false,
            },
          ],
          footer: {
            text: "TRỢ LÝ MEW • Thông báo đơn thuê tự động 0.01s",
          },
          timestamp: new Date().toISOString(),
        },
      ],
    };

    await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("Lỗi gửi Discord Webhook:", err);
  }
}
