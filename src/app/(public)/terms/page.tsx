import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="info-container">
        <div className="info-header">
          <div className="info-badge">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="3" y="2" width="10" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M6 5h4M6 8h4M6 11h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span>Quy Định & Pháp Lý</span>
          </div>
          <h1 className="info-title">Điều Khoản Dịch Vụ</h1>
          <p className="info-subtitle">Các quy định và thỏa thuận sử dụng dịch vụ cho thuê thiết bị tại Tiệm Của Mew.</p>
        </div>

        <div className="legal-card">
          <div className="legal-section">
            <h2 className="legal-section-title">1. Quy Định Thuê & Đặt Cọc</h2>
            <p>Khi tiến hành thuê thiết bị tại Tiệm Của Mew, khách hàng cần chuẩn bị giấy tờ tùy thân hợp lệ (CCCD/Hộ chiếu) và khoản tiền đặt cọc tùy thuộc vào giá trị sản phẩm.</p>
            <p>Tiền đặt cọc sẽ được hoàn trả 100% ngay sau khi thiết bị được hoàn trả đầy đủ và kiểm tra nguyên vẹn.</p>
          </div>

          <div className="legal-section">
            <h2 className="legal-section-title">2. Trách Nhiệm Bảo Quản Thiết Bị</h2>
            <p>Khách hàng có trách nhiệm bảo quản cẩn thận các máy ảnh trong suốt thời gian thuê.</p>
            <p>Mọi tổn hại về vật lý, rớt nước, hỏng hóc cơ học do bảo quản sai quy cách sẽ được xử lý đền bù theo chi phí sửa chữa hoặc thay thế từ Hãng.</p>
          </div>

          <div className="legal-section">
            <h2 className="legal-section-title">3. Thời Gian Trả Máy & Gia Hạn</h2>
            <p>Vui lòng trả máy đúng khung giờ slot đã đăng ký. Trong trường hợp cần gia hạn thêm thời gian thuê, quý khách phải liên hệ trước ít nhất 3 tiếng để nhân viên hỗ trợ kiểm tra slot khả dụng tiếp theo.</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
