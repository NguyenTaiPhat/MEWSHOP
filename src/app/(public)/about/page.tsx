import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="info-container">
        <div className="info-header">
          <div className="info-badge">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M8 5v6M5 8h6" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            <span>Thương Hiệu Cho Thuê Camera Hàng Đầu</span>
          </div>
          <h1 className="info-title">Về Tiệm Của Mew</h1>
          <p className="info-subtitle">
            Hành trình đồng hành cùng các nhà làm phim, nhiếp ảnh gia và sáng tạo nội dung trên toàn quốc.
          </p>
        </div>

        <div className="legal-card">
          <div className="legal-section">
            <h2 className="legal-section-title">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4M12 8h.01"/>
              </svg>
              Sứ Mệnh Của Chúng Tôi
            </h2>
            <p>
              <strong>Tiệm Của Mew</strong> được thành lập với tầm nhìn đưa các dòng máy ảnh cinema, mirrorless và DSLR tiêu chuẩn đến gần hơn với mọi dự án sáng tạo nghệ thuật.
            </p>
            <p>
              Chúng tôi tin rằng rào cản chi phí thiết bị không bao giờ nên là lý do ngăn cản một ý tưởng tuyệt vời ra đời. Dịch vụ cho thuê minh bạch, chuyên nghiệp và tối ưu của Mew chính là giải pháp nâng tầm chất lượng cho thước phim của bạn.
            </p>
          </div>

          <div className="legal-section">
            <h2 className="legal-section-title">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              Giá Trị Cốt Lõi
            </h2>
            <ul>
              <li><strong>Máy Ảnh Đỉnh Cao:</strong> 100% máy ảnh từ Sony, Canon, RED, Fujifilm được kiểm định nghiêm ngặt trước khi giao dịch.</li>
              <li><strong>Đặt Lịch Trực Quan:</strong> Hệ thống khung giờ slot rõ ràng, tránh trùng lịch hoặc hủy đơn đột ngột.</li>
              <li><strong>Hỗ Trợ Kỹ Thuật 24/7:</strong> Đội ngũ kỹ thuật viên am hiểu hỗ trợ thiết lập thiết bị tận tình tại bối cảnh quay.</li>
              <li><strong>Thủ Tục Tiện Lợi:</strong> Đặt cọc linh hoạt, minh bạch giấy tờ và bàn giao cực kỳ nhanh chóng.</li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
