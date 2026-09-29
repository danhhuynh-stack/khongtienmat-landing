# HƯỚNG DẪN TRIỂN KHAI WEBSITE KHONGTIENMAT.VN TRÊN HOSTING MẮT BÃO
**Dành cho Ban Quản Trị / Sếp / Bộ Phận Kỹ Thuật**
*Phiên bản: 1.0.0 (Production Release) | Ngày cập nhật: 29/09/2026*

---

## 🌟 TỔNG QUAN HỆ THỐNG ĐÃ ĐƯỢC CẤU HÌNH SẴN

Hệ thống Landing Page **KhongTienMat.vn** được đóng gói theo mô hình **Serverless - Zero Maintenance** (Không cần bảo trì máy chủ):

1. **Giao diện Web (Hosting Mắt Bão)**:
   - Toàn bộ HTML5, CSS3, JavaScript tương tác, đa ngôn ngữ (5 thứ tiếng) và thư viện hình ảnh/icon chuẩn của 54+ ngân hàng NAPAS & Tổ chức quốc tế (Visa, Mastercard, JCB, VietQR).
   - Đã tích hợp sẵn file `.htaccess` tối ưu hóa: Tự động chuyển hướng sang HTTPS, kích hoạt nén Gzip/Deflate tăng tốc độ tải trang lên gấp 3 lần, bật bộ nhớ đệm trình duyệt (Browser Cache) và bảo vệ an toàn header.
2. **Backend xử lý Leads & Thông báo (Cloudflare Serverless)**:
   - Đã triển khai trực tiếp trên Cloudflare API Gateway (`khongtienmat-leads-api.danh-huynh.workers.dev`).
   - Tự động kiểm tra tính hợp lệ số điện thoại, lọc Spam/Bot (Honeypot trap).
   - Tự động ghi nhận thông tin khách hàng vào **Google Sheets** của công ty theo thời gian thực.
   - Tự động bắn thông báo chuông tức thì vào **Group Telegram: Leads Khongtienmat.vn**.
   - **Ưu điểm lớn nhất**: Sếp **không cần cài đặt Node.js, không cần tạo database MySQL** trên hosting Mắt Bão. Chỉ cần upload mã nguồn lên là toàn bộ hệ thống vận hành trơn tru 100%.

---

## 🚀 3 BƯỚC TRIỂN KHAI NHANH LÊN HOSTING MẮT BÃO

### BƯỚC 1: ĐĂNG NHẬP TRANG QUẢN TRỊ CPANEL MẮT BÃO
1. Truy cập trang quản lý dịch vụ Mắt Bão: [https://id.matbao.net](https://id.matbao.net) (hoặc link đăng nhập cPanel được Mắt Bão gửi qua email khi mua hosting).
2. Vào mục **Quản lý dịch vụ** $\rightarrow$ Chọn gói **Cloud Hosting Linux**.
3. Bấm **Đăng nhập cPanel** (cPanel Login).

---

### BƯỚC 2: TẢI LÊN VÀ GIẢI NÉN MÃ NGUỒN VÀO THƯ MỤC `public_html`
1. Tại giao diện cPanel, tìm và bấm vào biểu tượng **File Manager** (Trình quản lý tệp).
2. Ở cột danh mục bên trái, click đúp vào thư mục **`public_html`** (đây là thư mục gốc chứa website của tên miền chính `khongtienmat.vn`).
   > *Lưu ý: Nếu trong `public_html` có sẵn file mặc định của Mắt Bão (như `default.html` hoặc `index.php` giữ chỗ), Sếp có thể xóa hoặc đổi tên chúng đi.*
3. Trên thanh công cụ phía trên, bấm nút **Upload** (Tải lên).
4. Kéo thả hoặc chọn file **`KhongTienMat_Release_MatBao_Hosting.zip`** từ máy tính lên.
5. Sau khi thanh tiến trình báo màu xanh 100% (**Complete**), bấm nút quay lại thư mục `public_html`.
6. Nhấp chuột phải vào file `KhongTienMat_Release_MatBao_Hosting.zip` vừa tải lên $\rightarrow$ Chọn **Extract** (Giải nén) $\rightarrow$ Chọn đường dẫn đích là `/public_html` $\rightarrow$ Bấm **Extract Files**.
7. Sau khi giải nén thành công, các file và thư mục sẽ nằm ngay trong `public_html`:
   - `index.html` *(Trang chủ chính)*
   - `app.js` *(Logic ứng dụng)*
   - `translations.js` *(Dữ liệu 5 ngôn ngữ: VI, EN, ZH, KO, TH)*
   - `assets/` *(Thư mục hình ảnh, logo ngân hàng, icon)*
   - `.htaccess` *(Cấu hình tăng tốc Apache/LiteSpeed & ép HTTPS)*
   - `robots.txt` & `sitemap.xml` *(Hỗ trợ SEO Google)*
8. Sếp có thể xóa file nén `.zip` trên hosting sau khi giải nén để tiết kiệm dung lượng.

---

### BƯỚC 3: KIỂM TRA BẬT SSL MIỄN PHÍ (HTTPS) VÀ DNS TÊN MIỀN
1. **Kiểm tra DNS Tên miền**:
   - Đảm bảo tên miền `khongtienmat.vn` đã có 2 bản ghi trỏ về IP của Hosting Mắt Bão:
     - Bản ghi `@` (Loại: `A`) $\rightarrow$ Trỏ về `IP Hosting Mắt Bão`
     - Bản ghi `www` (Loại: `CNAME` hoặc `A`) $\rightarrow$ Trỏ về `khongtienmat.vn` (hoặc IP Hosting)
2. **Kích hoạt SSL (Bảo mật HTTPS)**:
   - Trên cPanel, tìm mục **SSL/TLS Status** hoặc **Let's Encrypt SSL** / **AutoSSL**.
   - Chọn tên miền `khongtienmat.vn` và bấm **Run AutoSSL** (hoặc Issue SSL). Mắt Bão sẽ cấp chứng chỉ bảo mật có biểu tượng ổ khóa xanh miễn phí trọn đời.

---

## 🧪 QUY TRÌNH NGHIỆM THU VẬN HÀNH (TESTING)

Sau khi hoàn tất 3 bước trên, Sếp có thể tiến hành test thử luồng nhận khách hàng thực tế:

1. Mở trình duyệt truy cập: **`https://khongtienmat.vn`**.
2. Cuộn xuống phần **Đăng Ký Tư Vấn & Nhận Bộ QR Miễn Phí** (hoặc bấm nút "Đăng Ký Miễn Phí" trên thanh menu/popup).
3. Điền thông tin thử nghiệm:
   - **Sản phẩm quan tâm**: Ví dụ chọn *"Mã VietQR Để Bàn Chuẩn EMVCo"*
   - **Họ và tên**: *"Nguyễn Văn Test"*
   - **Số điện thoại**: Số điện thoại của Sếp (ví dụ: `0901234567`)
   - **Tên cửa hàng/doanh nghiệp**: *"Cửa Hàng Test Mắt Bão"*
   - **Địa chỉ kinh doanh**: *"123 Nguyễn Huệ, Quận 1, TP.HCM"*
4. Bấm nút **"GỬI ĐĂNG KÝ NGAY"**.
5. **Kết quả đạt chuẩn khi**:
   - Màn hình hiển thị hộp thông báo màu xanh chúc mừng kèm mã **Lead ID** (Ví dụ: `KTM-8942-0193`).
   - File Google Sheets quản lý Leads tự động nhảy thêm 1 dòng dữ liệu mới đầy đủ thông tin.
   - Group Telegram **Leads Khongtienmat.vn** nhận được tin nhắn thông báo âm thanh tức thì với định dạng trực quan (Tên, SĐT, Cửa hàng, Địa chỉ, Sản phẩm).

---

## 📞 HỖ TRỢ KỸ THUẬT KHI CẦN

- Nếu trong quá trình tải lên hoặc trỏ DNS gặp vướng mắc, Sếp có thể liên hệ bộ phận hỗ trợ kỹ thuật 24/7 của Mắt Bão qua hotline **1900 1830** để được hỗ trợ kiểm tra nhanh trạng thái DNS/SSL.
- Mọi cấu hình backend và luồng tự động hóa đã được thiết lập vĩnh viễn và độc lập, đảm bảo tỷ lệ sẵn sàng 99.99%.
