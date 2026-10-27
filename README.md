# NMK Developer DMOJ-based Extra Configs

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Manifest V3](https://img.shields.io/badge/Chrome%20Extension-Manifest%20V3-blue.svg)](manifest.json)
[![Platform](https://img.shields.io/badge/Platform-DMOJ%20%7C%20CSOJ%20%7C%20VNOJ-emerald.svg)](https://csoj.edu.vn/)
[![Tests](https://img.shields.io/badge/Tests-Passing-brightgreen.svg)](tests/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

**NMK Developer DMOJ-based Extra Configs** là Chrome Extension (Manifest V3) hiệu năng cao, tối ưu hóa giao diện và trải nghiệm người dùng trên các hệ thống chấm trực tuyến nền DMOJ (CSOJ, VNOJ, DMOJ.ca và các máy chủ trường học tùy chỉnh).

---

## 📑 Mục lục
- [🚀 Điểm cải tiến vượt bậc so với Tampermonkey](#-điểm-cải-tiến-vượt-bậc-so-với-tampermonkey)
- [✨ Tính năng nổi bật](#-tính-năng-nổi-bật)
- [📦 Hướng dẫn cài đặt](#-hướng-dẫn-cài-đặt)
- [🛠️ Danh sách các công cụ trong Floating Dock](#️-danh-sách-các-công-cụ-trong-floating-dock)
- [🧪 Chạy kiểm thử tự động (Unit Tests)](#-chạy-kiểm-thử-tự-động-unit-tests)
- [📂 Cấu trúc dự án](#-cấu-trúc-dự-án)
- [📚 Tài liệu chi tiết](#-tài-liệu-chi-tiết)
- [📄 Giấy phép (License)](#-giấy-phép-license)

---

## 🚀 Điểm cải tiến vượt bậc so với Tampermonkey

1. **Hiệu năng tức thì & Chạy Offline 100% (0ms network delay):**
   - Đóng gói toàn bộ thư viện vendor (`marked.min.js`, `fflate.min.js`, `cytoscape.min.js`, `mathjax 4 tex-svg`) và video chúc mừng AC cục bộ.
   - Hoàn toàn không phụ thuộc CDN bên ngoài, không bị chặn bởi mạng trường học hay tường lửa.
2. **Tuân thủ tuyệt đối Content Security Policy (CSP Manifest V3):**
   - Không sử dụng `eval()`, `new Function()` hay chèn inline `<script>` gây lỗi CSP.
   - Bộ giải toán MathJax 4 được cô lập an toàn trong iframe sandbox runner.
3. **Lưu trữ độc lập theo từng trang (Per-Site Storage Isolation):**
   - Mỗi domain DMOJ có một namespace riêng biệt (`nmkdeveloperdmojbasedextraconfigs_${hostname}_*`). Cài đặt trên CSOJ không bao giờ bị lẫn lộn sang VNOJ hay DMOJ.ca.
   - Bộ nhớ đệm in-memory giúp đọc cấu hình tức thời (0ms), kết hợp `unlimitedStorage` lưu ảnh nền độ phân giải cao mà không lo quá hạn mức 5MB.
4. **Hệ thống chuyển trang liền mạch (Seamless Page Transition):**
   - Ứng dụng **Cross-Document View Transitions API** (`@view-transition { navigation: auto; }`) của Chrome 126+.
   - Thanh Menu (`#navigation`) và Floating Dock được giữ cố định, không giật lag hay reload lại giữa các trang.
   - Tích hợp **Instant Link Prefetcher** ngầm khi rê chuột qua link và thanh tiến trình phát sáng siêu mỏng phong cách YouTube/GitHub.
5. **Khóa đúng tỉ lệ ảnh gốc của Logo (Zero Gap/Letterbox):**
   - Tự động nhận diện `naturalWidth` / `naturalHeight` của ảnh logo.
   - Loại bỏ hoàn toàn khoảng trống đen (letterbox) phía trên và dưới thẻ ảnh khi đổi kích thước.
   - Đồng bộ 2 chiều linh hoạt giữa thanh trượt Width và Height.

---

## ✨ Tính năng nổi bật

| Công cụ | Biểu tượng | Mô tả |
| ------- | :--------: | ----- |
| **Logo & Navbar** | 🎨 | Đổi logo tuỳ biến, tự căn theo navbar hoặc khóa tỉ lệ ảnh gốc, chỉnh đường vạch phân cách. |
| **Background** | 🖼️ | Tải ảnh nền wallpaper tuỳ ý kèm thanh kéo lớp phủ đen (overlay opacity) bảo vệ mắt. |
| **Quote Card** | 💬 | Thẻ ghi chú/danh ngôn nổi trên màn hình, hỗ trợ định dạng Markdown và công thức toán LaTeX. |
| **Graph Drawer** | 🕸️ | Vẽ đồ thị tương tác từ danh sách cạnh `u v [w]` với bố cục Cose, Circle, Grid và sinh đồ thị mẫu. |
| **Pomodoro** | ⏱️ | Đồng hồ quản lý thời gian tập trung với âm thanh Synthesizer Web Audio API độc lập. |
| **2048 Game** | 🎮 | Mini-game 2048 giải trí giữa các giờ giải thuật toán, hỗ trợ phím mũi tên/WASD và nút Undo. |
| **Export ZIP** | 📦 | Nén toàn bộ trang đề bài (HTML, CSS, JS, ảnh) thành file `.zip` để học tập offline. |
| **AC Easter Egg**| 🎉 | Tự động phát video chúc mừng khi nộp bài đạt điểm tối đa (Full AC). |

---

## 📦 Hướng dẫn cài đặt

Cài đặt nhanh vào **Google Chrome**, **Microsoft Edge**, **Brave**, **Cốc Cốc** hoặc bất kỳ trình duyệt nền Chromium nào:

1. Tải mã nguồn về máy hoặc clone qua Git:
   ```bash
   git clone git@github.com:nmkdeveloper/dmojextraconfigs.git
   ```
2. Mở trình duyệt và truy cập trang quản lý tiện ích:
   - **Chrome / Brave / Cốc Cốc:** `chrome://extensions/`
   - **Edge:** `edge://extensions/`
3. Bật công tắc **"Chế độ dành cho nhà phát triển" (Developer mode)** ở góc trên bên phải.
4. Bấm vào nút **"Tải tiện ích đã giải nén" (Load unpacked)** và chọn thư mục mã nguồn.
5. Truy cập `https://csoj.edu.vn/`, `https://oj.vnoi.info/` hoặc `https://dmoj.ca/` để trải nghiệm!

---

## 🧪 Chạy kiểm thử tự động (Unit Tests)

Dự án tích hợp sẵn bộ kiểm thử chạy trực tiếp với Node.js:

```bash
npm test
```

Bộ kiểm thử bao gồm:
- `tests/test_storage.js`: Kiểm thử cô lập key lưu trữ theo từng domain và bộ nhớ đệm memory cache.
- `tests/test_ac_detection.js`: Kiểm thử logic nhận diện AC trên cấu trúc DOM DMOJ thực tế.
- `tests/test_logo_ratio.js`: Kiểm thử tính toán tỉ lệ ảnh gốc và loại bỏ khoảng hở trên/dưới logo.
- `tests/test_page_transition.js`: Kiểm thử cơ chế prefetch liên kết và vòng đời chuyển trang mượt mà.

---

## 📂 Cấu trúc dự án

```
dmojextraconfigs/
├── manifest.json                  # Cấu hình Manifest V3
├── background.js                  # Service Worker quản lý dynamic scripts và domain
├── package.json                   # Metadata và scripts npm test
├── LICENSE                        # Giấy phép mã nguồn mở MIT
├── README.md                      # Hướng dẫn chính của dự án
├── CHANGELOG.md                   # Nhật ký thay đổi qua các phiên bản
├── CONTRIBUTING.md                # Quy định đóng góp mã nguồn
├── SECURITY.md                    # Chính sách bảo mật và báo cáo lỗi
├── popup/                         # Giao diện Popup trên thanh công cụ trình duyệt
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── content/                       # Mã nguồn chạy trực tiếp trên trang OJ
│   ├── storage.js                 # Adapter lưu trữ độc lập theo domain (SiteStore)
│   ├── dock.js                    # Floating Dock và Window Manager
│   ├── content.css                # Toàn bộ CSS Dark theme hiện đại và View Transitions
│   ├── content.js                 # Entrypoint khởi động các module
│   ├── mj_shim.js                 # Script shim MAIN world cho MathJax
│   └── modules/                   # Các module tính năng chuyên biệt
│       ├── page_transition.js     # Chuyển trang liền mạch, progress bar, prefetch
│       ├── logo_manager.js        # Tuỳ biến logo và navbar
│       ├── background.js          # Quản lý hình nền và lớp phủ
│       ├── quote.js               # Thẻ ghi chú Markdown & LaTeX
│       ├── graph.js               # Vẽ đồ thị thuật toán Cytoscape
│       ├── pomodoro.js            # Đồng hồ Pomodoro
│       ├── game2048.js            # Trò chơi 2048
│       ├── export_zip.js          # Trích xuất trang thành file zip
│       └── ac_easter_egg.js       # Bộ nhận diện AC và video chúc mừng
├── libs/                          # Thư viện cục bộ (Offline 100%)
│   ├── marked.min.js              # Markdown parser
│   ├── fflate.min.js              # High-speed streaming ZIP
│   ├── cytoscape.min.js           # Graph visualization
│   └── mathjax/                   # MathJax 4 tex-svg và sandbox runner
├── assets/
│   ├── icons/                     # Bộ icon extension kích thước 16, 48, 128
│   └── ac.mp4                     # Video chúc mừng Full AC cục bộ
├── docs/                          # Tài liệu kỹ thuật chi tiết
│   ├── ARCHITECTURE.md            # Kiến trúc hệ thống
│   ├── MODULES.md                 # Hướng dẫn chi tiết từng module
│   └── CONFIGURATION.md           # Bảng tra cứu toàn bộ storage keys
└── tests/                         # Bộ unit test tự động
    ├── test_storage.js
    ├── test_ac_detection.js
    ├── test_logo_ratio.js
    └── test_page_transition.js
```

---

## 📚 Tài liệu chi tiết

- [🏗️ Kiến trúc hệ thống (ARCHITECTURE.md)](docs/ARCHITECTURE.md)
- [🧩 Hướng dẫn chi tiết các Module (MODULES.md)](docs/MODULES.md)
- [⚙️ Bảng tra cứu Storage Keys (CONFIGURATION.md)](docs/CONFIGURATION.md)
- [📝 Nhật ký thay đổi (CHANGELOG.md)](CHANGELOG.md)
- [🤝 Hướng dẫn đóng góp (CONTRIBUTING.md)](CONTRIBUTING.md)
- [🛡️ Chính sách bảo mật (SECURITY.md)](SECURITY.md)

---

## 📄 Giấy phép (License)

Dự án được phân phối dưới giấy phép **MIT License**. Xem chi tiết tại [LICENSE](LICENSE).

Được phát triển bởi **nmkdeveloper** ([Nguyen Minh Khoi](https://github.com/nmkdeveloper)).
