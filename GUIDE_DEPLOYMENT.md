# Hướng Dẫn Tích Hợp Luồng Đăng Ký Tư Vấn (Google Sheets & Chatbot Zalo)
**khongtienmat.vn** — Bảo mật tuyệt đối, không lộ API Key/Secret trên Frontend.

---

## 1. Tổng Quan Kiến Trúc Bảo Mật

```
[ Frontend: GitHub Pages ] 
         │ (POST JSON không chứa bất kỳ secret nào)
         ▼
[ Backend: Cloudflare Worker ] (Quản lý biến môi trường bí mật)
    ├── 1. Kiểm tra CORS Origin, chống spam IP, bẫy Honeypot
    ├── 2. Xác thực và chuẩn hóa SĐT, họ tên, địa chỉ
    ├── 3. Sinh Lead ID đối soát: KTM-YYYYMMDD-XXXX
    ├── 4. Ghi trực tiếp vào Google Sheets (Sheet 'Leads') ────► [ Google Sheets ]
    │      └─ Nếu ghi lỗi: DỪNG NGAY, không gửi Zalo
    ├── 5. Bắn Webhook sang Chatbot Zalo trực chiến ──────────► [ Chatbot Zalo ]
    └── 6. Trả kết quả thành công/thất bại thân thiện về website
```

---

## 2. Bước 1: Chuẩn Bị Google Sheets

1. **Tạo bảng tính mới** trên Google Drive với tên gợi ý: `KhongTienMat_Leads_2026`.
2. Đổi tên tab đầu tiên thành đúng chữ: **`Leads`**.
3. Tại dòng 1 của tab `Leads`, nhập đúng thứ tự 12 tiêu đề cột:
   - **Cột A**: `Lead ID`
   - **Cột B**: `Thời gian`
   - **Cột C**: `Sản phẩm quan tâm`
   - **Cột D**: `Họ và tên`
   - **Cột E**: `Số điện thoại`
   - **Cột F**: `Tên đơn vị kinh doanh`
   - **Cột G**: `Địa chỉ kinh doanh`
   - **Cột H**: `Ngôn ngữ`
   - **Cột I**: `Nguồn`
   - **Cột J**: `URL`
   - **Cột K**: `Trạng thái gửi Zalo`
   - **Cột L**: `Ghi chú lỗi`
4. **Lấy `GOOGLE_SHEET_ID`**:
   - Từ đường link: `https://docs.google.com/spreadsheets/d/`**`1AbCdEfGhIjKlMnOpQrStUvWxYz`**`/edit`
   - Chuỗi ký tự ở giữa chính là Sheet ID.

---

## 3. Bước 2: Tạo Google Service Account (Tối Thiểu Quyền Hạn)

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/).
2. Chọn dự án Google Cloud hiện có hoặc tạo mới.
3. Bật **Google Sheets API** trong menu *APIs & Services > Library*.
4. Vào *IAM & Admin > Service Accounts* $\rightarrow$ Chọn **Create Service Account**:
   - Đặt tên: `ktm-leads-collector`.
   - Nhấn *Create and Continue* (không cần gán quyền cấp dự án).
5. Nhấp vào Service Account vừa tạo $\rightarrow$ Tab **Keys** $\rightarrow$ **Add Key** $\rightarrow$ **Create new key** $\rightarrow$ Chọn định dạng **JSON**.
6. Tải file JSON về máy tính và lưu trữ an toàn (tuyệt đối không đưa file này lên Git).
7. Mở Google Sheet ở Bước 1 $\rightarrow$ Nhấn **Chia sẻ (Share)** $\rightarrow$ Dán email của Service Account (dạng `ktm-leads-collector@<project>.iam.gserviceaccount.com`) với quyền **Người chỉnh sửa (Editor)**.

---

## 4. Bước 3: Cấu Hình Kênh Nhận Thông Báo (Telegram Bot & Zalo)

Hệ thống hỗ trợ 2 kênh nhận thông báo tự động ngay khi khách điền form thành công:

### Kênh A: Telegram Bot (Khuyên dùng - Miễn phí 100%, nhận "ting ting" về điện thoại tức thì)
> **Ưu điểm vượt trội**: Không yêu cầu giấy phép doanh nghiệp hay Zalo OA, cài đặt 30 giây, hỗ trợ bấm trực tiếp vào số điện thoại để gọi khách ngay từ màn hình tin nhắn Telegram.

1. **Lấy `TELEGRAM_BOT_TOKEN`**:
   - Mở ứng dụng Telegram trên điện thoại hoặc máy tính, gõ tìm **`@BotFather`** (bot chính chủ Telegram có tích xanh).
   - Gõ lệnh `/newbot` và làm theo hướng dẫn:
     - Nhập tên hiển thị: ví dụ `KTM Leads Alert`
     - Nhập username của bot: ví dụ `ktm_leads_alert_bot` (phải kết thúc bằng chữ `bot`).
   - BotFather sẽ cấp cho bạn một chuỗi Token dạng: `1234567890:ABCdefGhIJKlmNoPQRsTUVwxyZ`.
   - **Quan trọng**: Bấm vào đường link bot mà BotFather gửi (dạng `t.me/ktm_leads_alert_bot`), sau đó bấm nút **Start** để cho phép bot gửi tin nhắn cho bạn.

2. **Lấy `TELEGRAM_CHAT_ID`**:
   - Trên Telegram, tìm bot **`@userinfobot`**.
   - Bấm `/start` $\rightarrow$ Bot sẽ trả về thông tin cá nhân của bạn, trong đó có dòng:
     `Id: 123456789`
   - Dãy số `123456789` chính là `TELEGRAM_CHAT_ID`.
   *(Nếu muốn thông báo vào nhóm chat gồm nhiều nhân viên kinh doanh: Thêm bot vừa tạo vào nhóm chat, cấp quyền admin và lấy Chat ID của nhóm).*

---

### Kênh B: Zalo Chatbot Webhook (Dành cho Zalo OA Doanh nghiệp)
*(Dành cho các doanh nghiệp sử dụng Zalo Official Account kết nối nền tảng chatbot như FPT.AI, Hana Chatbot, Haravan, Botbanhang)*

- **Chuẩn bị 2 thông tin**:
  - `ZALO_CHATBOT_WEBHOOK_URL`: Đường link webhook nhận lead của chatbot.
  - `ZALO_CHATBOT_API_TOKEN`: Mã bí mật Bearer Token (nếu nền tảng có yêu cầu).

---

## 5. Bước 4: Triển Khai Cloudflare Worker

1. Mở terminal tại thư mục dự án:
   ```bash
   cd backend
   ```
2. Đăng nhập Cloudflare (nếu chưa):
   ```bash
   npx wrangler login
   ```
3. Nạp các biến bảo mật (Secrets) vào Cloudflare Worker (không bao giờ lộ ra ngoài Git/Frontend):
   ```bash
   # 1. Google Sheets Integration
   npx wrangler secret put GOOGLE_SHEET_ID
   npx wrangler secret put GOOGLE_SERVICE_ACCOUNT_EMAIL
   npx wrangler secret put GOOGLE_PRIVATE_KEY

   # 2. Telegram Bot Integration (Nhận tin nhắn ting-ting về điện thoại)
   npx wrangler secret put TELEGRAM_BOT_TOKEN
   npx wrangler secret put TELEGRAM_CHAT_ID

   # 3. Zalo Chatbot Webhook (Nếu sử dụng Zalo OA)
   npx wrangler secret put ZALO_CHATBOT_WEBHOOK_URL
   npx wrangler secret put ZALO_CHATBOT_API_TOKEN
   ```
4. Triển khai lên mạng lưới Cloudflare toàn cầu:
   ```bash
   npx wrangler deploy
   ```
5. Cloudflare sẽ cấp một URL dạng:
   `https://khongtienmat-leads-api.<your-subdomain>.workers.dev`

---

## 6. Bước 5: Kết Nối Frontend Với Cloudflare Worker

Trên landing page [khongtienmat.vn](https://danhhuynh-stack.github.io/khongtienmat-landing/):
- Nếu dùng tên miền tùy chỉnh và cùng domain (ví dụ `khongtienmat.vn/api/leads`), hệ thống tự động nhận diện không cần chỉnh sửa gì.
- Nếu gọi chéo sang Cloudflare Worker URL, chỉ cần đặt biến cấu hình trong trang (trước khi gọi `app.js`):
  ```html
  <script>
    window.KTM_API_ENDPOINT = "https://khongtienmat-leads-api.<your-subdomain>.workers.dev";
  </script>
  ```
- Worker đã được thiết lập sẵn **CORS Whitelist** chỉ cho phép:
  - `https://danhhuynh-stack.github.io`
  - `https://khongtienmat.vn`
  - `https://www.khongtienmat.vn`
  - `http://localhost:3000` (môi trường test)

---

## 7. Quy Trình Kiểm Tra & Nghiệm Thu (Checklist)

| Mục kiểm tra | Cách thực hiện | Kết quả mong đợi |
| :--- | :--- | :--- |
| **Gửi form hợp lệ** | Điền đầy đủ 4 trường, SĐT `0912345678` | Nút hiện "Đang gửi...", sau đó hiện thông báo xanh: *“Đăng ký thành công. Đội ngũ tư vấn sẽ liên hệ với bạn sớm.”* |
| **Đối soát Google Sheets** | Mở tab `Leads` trên Google Sheet | Thêm 1 dòng mới đúng 12 cột, có mã `KTM-...` |
| **Thông báo Zalo** | Kiểm tra nhóm chat trực chiến Zalo | Nhận được thông báo có đầy đủ thông tin lead |
| **Bẫy Honeypot** | Bot tự điền vào trường ẩn `website_hp` | Nhận phản hồi giả 200, nhưng **không** ghi Google Sheets và **không** bắn Zalo rác |
| **Bảo toàn dữ liệu** | Giả lập mất mạng hoặc lỗi server | Hiện thông báo đỏ, **giữ nguyên** thông tin đã gõ để khách không phải nhập lại |
| **An toàn mã nguồn** | Quét git history và repository | 100% không có file `.env`, service account key hay webhook bí mật |
