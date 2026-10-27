# NMK Developer DMOJ-based Extra Configs (Chrome Extension MV3) v7.0.1

Extension tối ưu hóa giao diện và bung hết toàn bộ hiệu năng cho các nền tảng chấm trực tuyến nền DMOJ (CSOJ, VNOJ, DMOJ.ca và các OJ tương thích).

---

## 🚀 Điểm cải tiến vượt bậc so với bản Tampermonkey

1. **Hiệu năng tức thì (0ms network delay):**
   - Đóng gói 100% thư viện (`marked.min.js`, `fflate.min.js`, `cytoscape.min.js`, `mathjax 4`) và video AC cục bộ trong thư mục extension.
   - Không còn tải tài nguyên từ CDN chậm chạp, hoạt động hoàn toàn offline và tuân thủ chặt chẽ Content Security Policy (CSP) Manifest V3.
2. **Lưu trữ độc lập theo từng trang (Per-Site Storage Isolation):**
   - Mỗi domain DMOJ có một namespace riêng biệt dưới prefix `nmkdeveloperdmojbasedextraconfigs_${hostname}_*`.
   - Cài đặt logo, navbar, ảnh nền, quote hoặc game trên CSOJ sẽ **không bao giờ bị ghi đè hoặc lẫn lộn** sang VNOJ hay DMOJ.ca.
   - Quyền `unlimitedStorage` cho phép lưu ảnh nền độ phân giải cao và logo mà không bao giờ bị lỗi quá hạn mức (5MB Quota Exceeded) của `localStorage`.
3. **AC Easter Egg hoàn thiện & chuẩn xác:**
   - Đã được phân tích và kiểm nghiệm thực tế dựa trên cấu trúc DOM của DMOJ (`D:\Temps\6\index.html`).
   - Nhận diện đúng `#test-cases`, `.submissions-status-table`, `.case-row`, `.case-AC`, điểm số tối đa (ví dụ: `20/20` hay `100/100`).
   - Chèn video chúc mừng mượt mà, hỗ trợ cả video cục bộ và nguồn online dự phòng, có nút đóng nhanh `(X)`.
4. **Extension Toolbar Popup tiện lợi:**
   - Quản lý danh sách tên miền DMOJ (hỗ trợ thêm bất kỳ OJ trường học/cá nhân nào).
   - Nút bật/tắt nhanh Floating Dock.
   - Nút đặt lại cài đặt riêng cho từng trang.

---

## 📦 Hướng dẫn cài đặt vào Chrome / Edge / Brave / Cốc Cốc

Chỉ với 3 bước đơn giản:

1. Mở trình duyệt và truy cập trang quản lý tiện ích:
   - **Google Chrome / Brave / Cốc Cốc:** `chrome://extensions/`
   - **Microsoft Edge:** `edge://extensions/`
2. Bật công tắc **"Chế độ dành cho nhà phát triển" (Developer mode)** ở góc trên bên phải màn hình.
3. Nhấp vào nút **"Tải tiện ích đã giải nén" (Load unpacked)** và chọn thư mục:
   ```
   D:\Temps\5
   ```
4. Extension **"NMK Developer DMOJ-based Extra Configs"** sẽ xuất hiện trên thanh công cụ và tự động kích hoạt khi bạn truy cập `csoj.edu.vn`, `oj.vnoi.info`, hoặc `dmoj.ca`!

---

## 🛠️ Danh sách các công cụ trong Floating Dock

- **🎨 Logo & Navbar:** Tuỳ biến logo trang web (tải ảnh, khoá tỉ lệ W/H, auto-fit navbar), tuỳ chỉnh chiều cao/rộng navbar và đường vạch chia divider.
- **🖼️ Background:** Đặt ảnh nền cá nhân tuỳ ý kèm thanh điều chỉnh lớp phủ đen (overlay opacity) giúp đọc bài tập rõ ràng.
- **💬 Quote Card:** Thẻ ghi chú/danh ngôn nổi trên màn hình, hỗ trợ định dạng Markdown và công thức toán học LaTeX (`$x^2$`, `\frac{a}{b}`).
- **🕸️ Graph Drawer:** Trình vẽ và trực quan hoá đồ thị nhanh (nhập danh sách cạnh `u v [w]`), hỗ trợ directed/undirected, force-directed cose, circle, grid, và sinh đồ thị ngẫu nhiên.
- **⏱️ Pomodoro:** Đồng hồ quản lý thời gian tập trung với âm thanh chuông Synthesizer Web Audio API và thông báo khi hết giờ.
- **🎮 2048:** Trò chơi 2048 kinh điển giải trí giữa các giờ luyện thuật toán (hỗ trợ phím mũi tên / WASD, nút Undo và lưu điểm kỷ lục).
- **📦 Export ZIP:** Tải toàn bộ mã nguồn trang bài tập (HTML, CSS, JS, hình ảnh) đóng gói thành file `.zip` hoàn chỉnh để lưu trữ ngoại tuyến.
- **🎉 AC Easter Egg:** Tự động chúc mừng bằng video khi bạn nộp bài đạt điểm tối đa (Full AC).

---

## 📂 Cấu trúc mã nguồn

```
d:\Temps\5\
├── manifest.json                  # Cấu hình Manifest V3
├── background.js                  # Service Worker quản lý dynamic content scripts
├── popup/                         # Giao diện Popup trên thanh công cụ
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── content/                       # Mã nguồn chạy trực tiếp trên trang OJ
│   ├── storage.js                 # Adapter lưu trữ độc lập theo domain (SiteStore)
│   ├── dock.js                    # Floating Dock và Panel Window Manager
│   ├── content.css                # Toàn bộ CSS giao diện Dark theme hiện đại
│   ├── content.js                 # Entrypoint khởi động các module
│   └── modules/                   # 8 module tính năng độc lập
│       ├── logo_manager.js
│       ├── background.js
│       ├── quote.js
│       ├── graph.js
│       ├── pomodoro.js
│       ├── game2048.js
│       ├── export_zip.js
│       └── ac_easter_egg.js
├── libs/                          # Thư viện cục bộ (Offline 100%)
│   ├── marked.min.js
│   ├── fflate.min.js
│   ├── cytoscape.min.js
│   └── mathjax/                   # MathJax 4 tex-svg và sandbox runner
├── assets/
│   ├── icons/                     # Bộ icon extension (16, 48, 128)
│   └── ac.mp4                     # Video AC fallback cục bộ
└── tests/                         # Bộ kiểm thử tự động
    ├── test_storage.js            # Kiểm thử cô lập lưu trữ giữa các trang
    └── test_ac_detection.js       # Kiểm thử logic nhận diện AC với mẫu thực tế D:\Temps\6\index.html
```
