import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function PolicyPage() {
  return (
    <>
      <Header />
      <main className="info-container">
        <div className="info-header">
          <div className="info-badge">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1.5L2 4v4.5c0 3.8 2.6 7 6 7.5 3.4-.5 6-3.7 6-7.5V4l-6-2.5z" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            <span>Bảo Vệ Quyền Lợi Khách Hàng</span>
          </div>
          <h1 className="info-title">Chính Sách Bảo Mật & Đổi Trả</h1>
          <p className="info-subtitle">Cam kết bảo vệ dữ liệu cá nhân và quy trình đổi trả thiết bị minh bạch.</p>
        </div>

        <div className="legal-card">
          <div className="legal-section">
            <h2 className="legal-section-title">1. Bảo Mật Thông Tin Cá Nhân</h2>
            <p>Tiệm Của Mew cam kết bảo mật tuyệt đối các thông tin cá nhân, lịch sử đặt đơn và giấy tờ tùy thân của khách hàng theo tiêu chuẩn an toàn cao nhất.</p>
            <p>Thông tin của quý khách tuyệt đối không bị chia sẻ cho bên thứ ba ngoại trừ mục đích xác minh đơn thuê hoặc theo yêu cầu cơ quan pháp luật.</p>
          </div>

          <div className="legal-section">
            <h2 className="legal-section-title">2. Chính Sách Đổi Trả Thiết Bị Lỗi</h2>
            <p>Nếu thiết bị gặp sự cố kỹ thuật từ nhà sản xuất trong vòng 2 giờ đầu tiên nhận máy, Tiệm Của Mew sẽ lập tức đổi thiết bị tương đương hoặc hoàn tiền 100% chi phí thuê đơn đó.</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
