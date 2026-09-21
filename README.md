# khongtienmat.vn — Landing Page Hệ Sinh Thái Thanh Toán Không Tiền Mặt & Xuyên Biên Giới

Landing Page chính thức cho domain **`khongtienmat.vn`**, phát triển phục vụ chương trình hợp tác quốc gia giữa **NAPAS** và **NEXUS DIGITAL** cùng mạng lưới vận hành **FIELDMAN**.

---

## 🌟 Tính Năng Nổi Bật

1. **Hỗ trợ Đa Ngôn Ngữ (5 Ngôn Ngữ Tức Thì - Zero Reload)**:
   * 🇻🇳 **Tiếng Việt (VI)**: Chủ cửa hàng, hộ kinh doanh, chuỗi bán lẻ.
   * 🇬🇧 **English (EN)**: Khách du lịch quốc tế & đối tác nước ngoài.
   * 🇨🇳 **中文 (ZH)**: Du khách Trung Quốc, Đài Loan, Hồng Kông (Alipay+, WeChat Pay, UnionPay).
   * 🇰🇷 **한국어 (KO)**: Du khách Hàn Quốc (GLN, Hana Bank).
   * 🇹🇭 **ไทย (TH)**: Du khách Thái Lan (PromptPay / ITMX).

2. **Mô Phỏng Thanh Toán Trực Quan (Interactive Payment Simulator)**:
   * Chuyển đổi giữa chế độ **VietQR Pay (Nội địa)** và **VietQR Global (Quốc tế)**.
   * Hiệu ứng âm thanh thông báo *"Ting Ting"* tự động bằng Web Audio API không phụ thuộc file âm thanh ngoài.
   * Toast thông báo biến động số dư thời gian thực (`+ 150.000 VNĐ`).

3. **Cơ Chế Chuyển Mạch Xuyên Biên Giới (Cross-Border Showcase)**:
   * Bộ lọc tương tác 6 quốc gia: Thái Lan, Hàn Quốc, Trung Quốc, Singapore, Campuchia, Lào.
   * Hiển thị tỷ giá quy đổi tức thì: Du khách thanh toán ngoại tệ từ ví bản địa -> Điểm bán nhận 100% bằng tiền VNĐ.

4. **Trọn Bộ Ấn Phẩm POSM Tài Trợ Miễn Phí**:
   * Giới thiệu trực quan Bảng mica A5, Bộ sticker decal chống nước, Thẻ nhận diện điểm bán Napas và áo thun đồng phục.

5. **Bảng So Sánh Hiệu Quả Kinh Tế**:
   * So sánh chi tiết VietQR vs Máy POS quẹt thẻ truyền thống (Tiết kiệm hàng chục triệu đồng/năm).

6. **Form Đăng Ký Điểm Bán Tối Ưu Chuyển Đổi (High Conversion Lead Gen)**:
   * Validation mượt mà, phân loại Hộ kinh doanh / Doanh nghiệp / Chuỗi cửa hàng.
   * Tự động lưu dữ liệu vào `localStorage` và sẵn sàng kết nối Webhook / Google Sheets / Lark Base / Telegram Bot.

---

## 🚀 Cấu Trúc Mã Nguồn

```
khongtienmat-landing/
├── index.html         # Giao diện chính Semantic HTML5 & Tailwind CSS
├── translations.js    # Từ điển 5 ngôn ngữ (VI, EN, ZH, KO, TH)
├── app.js             # Bộ điều khiển i18n, mô phỏng thanh toán, form lead
└── README.md          # Tài liệu hướng dẫn và triển khai
```

---

## 💻 Hướng Dẫn Chạy & Kiểm Thử

### Cách 1: Mở trực tiếp
Mở file `index.html` bằng bất kỳ trình duyệt nào (Chrome, Edge, Safari, Firefox).

### Cách 2: Khởi chạy Local Server
```bash
npx serve .
# hoặc
python -m http.server 3000
```
Truy cập: `http://localhost:3000`

---

## 🌐 Triển Khai Lên Tên Miền `khongtienmat.vn`

Dự án là Single Page Web tĩnh tối ưu cao, có thể đưa lên bất kỳ nền tảng nào:
- **Cloudflare Pages / Vercel / Netlify**: Kéo thả thư mục hoặc kết nối GitHub repo. Trỏ DNS domain `khongtienmat.vn` (CNAME hoặc A record) là chạy ngay lập tức với HTTPS miễn phí.
- **Hosting cPanel / Nginx / Apache**: Upload toàn bộ file vào thư mục `public_html`.

---

## 🏛️ Đơn Vị Bảo Trợ & Phát Triển
* **CÔNG TY CỔ PHẦN THANH TOÁN QUỐC GIA VIỆT NAM (NAPAS)**
* **CÔNG TY CỔ PHẦN NEXUS DIGITAL**
* Hotline vận hành: 1900 xxxx (24/7)
* Email: operation@nexusdigital.vn
