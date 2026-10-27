# NMK Developer DMOJ-based Extra Configs - Design Document

## 1. Intent & Overview
Chuyển đổi toàn bộ bộ công cụ Tampermonkey script thành một **Chrome Extension (Manifest V3)** hoàn chỉnh, đạt hiệu năng tối đa (Peak Performance), hoạt động 100% offline không phụ thuộc CDN, hỗ trợ đa nền tảng chấm DMOJ (CSOJ, VNOJ, DMOJ.ca và bất kỳ tên miền DMOJ nào do người dùng chỉ định).

Đặc biệt:
- **Lưu trữ độc lập theo từng trang (Per-Site Storage Isolation):** Cấu hình của mỗi domain (logo, kích thước navbar, ảnh nền, quote, tiến độ pomodoro/game) được lưu hoàn toàn tách biệt trong `chrome.storage.local`.
- **Đóng gói toàn bộ thư viện cục bộ (Local Bundling):** `marked`, `fflate`, `cytoscape`, `mathjax` đều được đóng gói sẵn trong extension, loại bỏ hoàn toàn độ trễ mạng và tuân thủ chặt chẽ Content Security Policy của Chrome MV3.
- **AC Easter Egg chuẩn xác:** Dựa trên cấu trúc thực tế kiểm nghiệm từ `D:\Temps\6`, phát hiện trạng thái Accepted qua `#test-cases`, `.submissions-status-table`, `.case-row`, `.case-AC` và điểm số tối đa để tự động chèn video chúc mừng mượt mà.

---

## 2. Goals & Non-Goals
### Goals:
- Chuyển đổi sạch sẽ từ Tampermonkey sang Chrome Extension MV3, cài đặt trực tiếp dạng Unpacked Extension trên Chrome/Edge/Brave.
- Không phụ thuộc mạng Internet cho các thư viện render (Marked, Cytoscape, MathJax, Fflate).
- Hỗ trợ lưu trữ không giới hạn dung lượng qua `unlimitedStorage` để lưu ảnh nền chất lượng cao và logo custom mà không sợ tràn 5MB quota của `localStorage`.
- Mỗi domain DMOJ có một namespace cài đặt riêng biệt dạng `nmkdeveloperdmojbasedextraconfigs_${hostname}_${key}`.
- Extension Popup trên thanh công cụ để quản lý danh sách domain và bật/tắt tính năng nhanh chóng.
- Giữ nguyên toàn bộ giao diện Floating Dock bóng bẩy, draggable, resizable cùng các module: Logo & Navbar, Background, Quote Card, Graph Drawer, Pomodoro, 2048, Export ZIP, AC Easter Egg.

### Non-Goals:
- Không gửi bất kỳ dữ liệu cá nhân nào ra server ngoại vi.
- Không can thiệp vào logic chấm bài hoặc mã nguồn nộp bài của hệ thống OJ.

---

## 3. Storage Architecture (Per-Site Isolation)
Sử dụng `chrome.storage.local` với cấu trúc khóa:
- **Global Config:**
  - `nmkdeveloperdmojbasedextraconfigs_global_domains`: Danh sách domain DMOJ đang được kích hoạt (Mặc định: `["csoj.edu.vn", "oj.vnoi.info", "dmoj.ca"]`).
  - `nmkdeveloperdmojbasedextraconfigs_global_easter_egg`: Bật/tắt Easter Egg toàn cục hoặc link video custom.
- **Per-Site Config (`${hostname}` = ví dụ `csoj.edu.vn`, `oj.vnoi.info`):**
  - `nmkdeveloperdmojbasedextraconfigs_${hostname}_logo`: Object chứa customUrl, sizeMode, width, height, gap, radius, fitMode, lock, navH, navW, divider settings, etc.
  - `nmkdeveloperdmojbasedextraconfigs_${hostname}_bg`: Object `{ dataUrl, opacity }`.
  - `nmkdeveloperdmojbasedextraconfigs_${hostname}_quote`: Text markdown/latex của quote card.
  - `nmkdeveloperdmojbasedextraconfigs_${hostname}_graph`: Nội dung đồ thị, directed flag, vị trí node.
  - `nmkdeveloperdmojbasedextraconfigs_${hostname}_pomo`: Trạng thái đồng hồ Pomodoro của trang đó.
  - `nmkdeveloperdmojbasedextraconfigs_${hostname}_2048`: Trạng thái bảng game và điểm số.
  - `nmkdeveloperdmojbasedextraconfigs_${hostname}_layout`: Tọa độ vị trí và kích thước các panel trên trang.

---

## 4. Component & File Structure
```
d:\Temps\5\
├── manifest.json                  # Manifest V3 (content scripts, permissions, action, web_accessible_resources)
├── background.js                  # Service worker quản lý dynamic content scripts & extension life-cycle
├── popup/
│   ├── popup.html                 # Giao diện quản lý domain & toggle tính năng
│   ├── popup.css
│   └── popup.js
├── content/
│   ├── content.js                 # Entrypoint content script nạp dock và khởi động modules
│   ├── content.css                # CSS cho Floating Dock, Panels, Buttons và Animations
│   ├── storage.js                 # Per-site Storage wrapper trên chrome.storage.local
│   ├── dock.js                    # Quản lý Floating Dock và PanelFactory
│   └── modules/
│       ├── logo_manager.js        # Tuỳ biến logo, navbar, divider
│       ├── background.js          # Tuỳ biến hình nền và lớp phủ
│       ├── quote.js               # Thẻ danh ngôn Markdown + MathJax
│       ├── graph.js               # Vẽ đồ thị bằng Cytoscape
│       ├── pomodoro.js            # Đồng hồ Pomodoro âm thanh Synth
│       ├── game2048.js            # Game 2048
│       ├── export_zip.js          # Xuất toàn bộ trang thành ZIP bằng fflate
│       └── ac_easter_egg.js       # Tự động nhận diện Full AC trên DMOJ và phát video
├── libs/
│   ├── marked.min.js              # Markdown parser
│   ├── fflate.min.js              # Nén ZIP tốc độ cao
│   ├── cytoscape.min.js           # Thư viện đồ thị
│   └── mathjax/                   # MathJax cục bộ và mathjax-runner.html (iframe sandbox an toàn)
├── assets/
│   ├── icons/                     # Icon extension (16, 48, 128)
│   └── ac.mp4                     # Video AC fallback cục bộ
└── docs/superpowers/
    ├── specs/2026-10-27-dmoj-chrome-extension-design.md
    └── plans/2026-10-27-dmoj-chrome-extension.md
```

---

## 5. Approaches Considered & Trade-offs
1. **Approach 1 (Selected): Modular Manifest V3 with Bundled Libs and Per-Site Isolation**
   - *Pros:* 0ms network latency, hoàn toàn tuân thủ MV3 CSP, dễ phát triển và bảo trì từng module riêng biệt, lưu trữ không giới hạn dung lượng qua `unlimitedStorage`, các trang DMOJ không bị xung đột cài đặt.
   - *Cons:* Cần tổ chức nhiều tệp tin logic.
2. **Approach 2 (Rejected): Monolithic bundle with Shared Storage**
   - *Pros:* Ít file.
   - *Cons:* Xung đột giao diện giữa các trang DMOJ (ví dụ logo CSOJ bị áp sang VNOJ), khó debug khi có lỗi, hiệu năng kém hơn khi cập nhật.

---

## 6. Verification & Testing Strategy
- Kiểm tra cài đặt trực tiếp dạng Unpacked Extension trên Chrome `chrome://extensions`.
- Kiểm tra độc lập lưu trữ trên 2 domain khác nhau (ví dụ: cấu hình logo trên CSOJ không ảnh hưởng đến VNOJ).
- Kiểm tra AC Easter Egg với dữ liệu HTML thực tế của DMOJ từ `D:\Temps\6\index.html`.
- Kiểm tra chức năng Export ZIP, Graph Drawer, Quote Card với công thức toán LaTeX, và Pomodoro với âm thanh Web Audio API.
