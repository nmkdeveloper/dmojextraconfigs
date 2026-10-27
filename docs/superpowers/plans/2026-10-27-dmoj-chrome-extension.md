# NMK Developer DMOJ-based Extra Configs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Chuyển đổi toàn bộ bộ công cụ Tampermonkey CSOJ Toolkit sang Chrome Extension (Manifest V3) đa module, đạt hiệu năng tối đa (Peak Performance), đóng gói cục bộ 100% thư viện và lưu trữ cài đặt độc lập theo từng domain DMOJ.

**Architecture:** Sử dụng kiến trúc Chrome Extension MV3 với content scripts, service worker và extension action popup. Toàn bộ thư viện (Marked, Fflate, Cytoscape, MathJax) được đóng gói cục bộ; `chrome.storage.local` với quyền `unlimitedStorage` quản lý cài đặt độc lập theo cấu trúc namespace `nmkdeveloperdmojbasedextraconfigs_${hostname}_${key}`.

**Tech Stack:** JavaScript (ES6+), Chrome Extensions API (MV3), HTML5 Canvas, Web Audio API, SVG icons, Cytoscape.js, Marked.js, Fflate.js, MathJax 4.

**Spec:** [`docs/superpowers/specs/2026-10-27-dmoj-chrome-extension-design.md`](file:///d:/Temps/5/docs/superpowers/specs/2026-10-27-dmoj-chrome-extension-design.md)

## Global Constraints
- Phải tuân thủ tuyệt đối Manifest V3 (không dùng `eval`, không tải mã script từ remote CDN).
- Tiền tố lưu trữ bắt buộc: `nmkdeveloperdmojbasedextraconfigs_`.
- Lưu trữ phải độc lập theo từng domain DMOJ (`${hostname}`).
- Hỗ trợ mặc định `csoj.edu.vn`, `oj.vnoi.info`, `dmoj.ca` và cho phép thêm domain tuỳ ý qua popup.
- AC Easter Egg phải tương thích chuẩn xác với cấu trúc DMOJ thực tế từ `D:\Temps\6\index.html`.

## Review Focus
1. Tải ảnh nền lớn hoặc logo base64 không bị lỗi giới hạn quota nhờ `unlimitedStorage`.
2. Chuyển đổi giữa các trang DMOJ khác nhau (như CSOJ sang VNOJ) không làm ghi đè hoặc lộ cấu hình của nhau.
3. Chấm bài live và kiểm tra AC Easter Egg: chỉ kích hoạt khi toàn bộ test cases đạt AC hoặc điểm tuyệt đối, không kích hoạt giả khi đang chấm hoặc bị WA/TLE.
4. Trích xuất trang (Export ZIP) xử lý đúng tài nguyên tương đối và tuyệt đối trên trang DMOJ.
5. Render công thức Toán học bằng MathJax hoạt động trơn tru trong môi trường MV3 sandbox.

---

### Task 1: Extension Scaffolding & Manifest V3 Setup
**Files:**
- Create: `d:\Temps\5\manifest.json`
- Create: `d:\Temps\5\background.js`
- Create: `d:\Temps\5\assets\icons\icon16.png`, `icon48.png`, `icon128.png`

**Interfaces:**
- Consumes: Chrome Extension APIs (`chrome.runtime`, `chrome.scripting`, `chrome.storage`).
- Produces: Base extension package có thể load được trực tiếp vào Chrome (`chrome://extensions`).

- [ ] **Step 1: Tạo manifest.json theo chuẩn MV3**
  Định nghĩa `manifest_version: 3`, name `"NMK Developer DMOJ-based Extra Configs"`, permissions `["storage", "unlimitedStorage", "scripting"]`, host_permissions `["*://*.csoj.edu.vn/*", "*://*.oj.vnoi.info/*", "*://*.dmoj.ca/*", "<all_urls>"]`, background service worker, action popup và web_accessible_resources.

- [ ] **Step 2: Tạo icons cho extension**
  Tạo bộ icon đại diện (16x16, 48x48, 128x128) lưu tại `assets/icons/`.

- [ ] **Step 3: Viết background.js service worker**
  Khởi tạo danh sách domain mặc định khi cài đặt extension: `nmkdeveloperdmojbasedextraconfigs_global_domains = ["csoj.edu.vn", "oj.vnoi.info", "dmoj.ca"]`. Lắng nghe sự kiện đăng ký dynamic content script cho các domain tùy chỉnh.

- [ ] **Step 4: Kiểm tra tính hợp lệ của manifest**
  Chạy lệnh kiểm tra cú pháp JSON và tệp manifest bằng Node.js / script kiểm tra.

---

### Task 2: Đóng gói các thư viện cục bộ (Local Vendor Libraries)
**Files:**
- Create: `d:\Temps\5\libs\marked.min.js`
- Create: `d:\Temps\5\libs\fflate.min.js`
- Create: `d:\Temps\5\libs\cytoscape.min.js`
- Create: `d:\Temps\5\libs\mathjax\mathjax-runner.html`
- Create: `d:\Temps\5\libs\mathjax\tex-svg.js`

**Interfaces:**
- Consumes: Các thư viện JS mã nguồn mở.
- Produces: File thư viện offline sẵn sàng nạp trực tiếp qua content scripts và sandboxed iframe.

- [ ] **Step 1: Tải/đóng gói marked.min.js**
  Đưa phiên bản UMD của Marked.js vào `libs/marked.min.js`.

- [ ] **Step 2: Tải/đóng gói fflate.min.js**
  Đưa phiên bản UMD của Fflate.js vào `libs/fflate.min.js`.

- [ ] **Step 3: Tải/đóng gói cytoscape.min.js**
  Đưa phiên bản UMD của Cytoscape.js vào `libs/cytoscape.min.js`.

- [ ] **Step 4: Đóng gói MathJax runner cục bộ**
  Tạo `libs/mathjax/mathjax-runner.html` chứa kịch bản nạp MathJax 4 tex-svg và giao tiếp qua `postMessage` để render TeX sang SVG cực nhanh, an toàn tuyệt đối theo chuẩn CSP MV3.

- [ ] **Step 5: Kiểm tra xác minh các thư viện**
  Kiểm tra cú pháp và sự sẵn sàng của các file thư viện trong `libs/`.

---

### Task 3: Storage Engine độc lập theo trang (Per-Site Storage Adapter)
**Files:**
- Create: `d:\Temps\5\content\storage.js`
- Test: `d:\Temps\5\tests\test_storage.js`

**Interfaces:**
- Consumes: `chrome.storage.local`.
- Produces:
  - `SiteStore.get(key, defaultValue)`
  - `SiteStore.set(key, value)`
  - `SiteStore.del(key)`
  - `SiteStore.getGlobal(key, defaultValue)`
  - `SiteStore.setGlobal(key, value)`

- [ ] **Step 1: Viết test cho SiteStore**
  Tạo test giả lập `chrome.storage.local` để kiểm chứng việc lưu trữ tách biệt theo `location.hostname` và tiền tố `nmkdeveloperdmojbasedextraconfigs_`.

- [ ] **Step 2: Triển khai SiteStore trong content/storage.js**
  Hiện thực hóa adapter tự động gắn tiền tố `${PREFIX}${hostname}_${key}` cho các cài đặt theo trang và `${PREFIX}global_${key}` cho cài đặt toàn cục. Hỗ trợ cả cơ chế bộ nhớ đệm (in-memory cache) đồng bộ để đọc dữ liệu tức thì không gây giật lag UI.

- [ ] **Step 3: Chạy test xác minh**
  Chạy `node tests/test_storage.js` để đảm bảo lưu dữ liệu hostname A không lẫn sang hostname B.

---

### Task 4: UI Engine - Dock, PanelFactory & Styles
**Files:**
- Create: `d:\Temps\5\content\content.css`
- Create: `d:\Temps\5\content\dock.js`

**Interfaces:**
- Consumes: DOM, SVG definitions, `SiteStore`.
- Produces:
  - `Dock.build()`
  - `Dock.addButton(id, iconName, colorA, colorB, tooltip, onClick)`
  - `PanelFactory.create({ id, title, iconSvg, width, height, bodyHTML, toggleBtn, beforeClose })`
  - Dragging, Resizing, Cascade auto-positioning, Esc key handler.

- [ ] **Step 1: Viết content/content.css**
  Chuyển đổi toàn bộ các đoạn CSS từ `GM_addStyle` thành file CSS tập trung, tối ưu hóa CSS transitions, blur backdrop, animations và dark theme hiện đại.

- [ ] **Step 2: Triển khai dock.js và PanelFactory**
  Chuyển đổi `Dock` và `PanelFactory` sang module chuẩn, tích hợp lưu vị trí panel theo từng trang qua `SiteStore`.

- [ ] **Step 3: Kiểm tra hiển thị dock**
  Tạo script kiểm tra HTML thử nghiệm để xác nhận dock và panel mở/đóng, kéo thả mượt mà.

---

### Task 5: Triển khai các Module tính năng
#### 5.1: Logo & Navbar Manager
**Files:**
- Create: `d:\Temps\5\content\modules\logo_manager.js`
- Quản lý kích thước logo (W, H, auto-fit, lock ratio), navbar height/width, divider, gap, radius và lưu riêng biệt theo domain.

#### 5.2: Background Customizer
**Files:**
- Create: `d:\Temps\5\content\modules\background.js`
- Xử lý nén ảnh nền (canvas WebP/JPEG) lưu trực tiếp vào `SiteStore` không lo giới hạn dung lượng, điều chỉnh overlay opacity mượt mà.

#### 5.3: Quote Card
**Files:**
- Create: `d:\Temps\5\content\modules\quote.js`
- Thẻ ghi chú Markdown + LaTeX MathJax, draggable, có live preview.

#### 5.4: Graph Drawer
**Files:**
- Create: `d:\Temps\5\content\modules\graph.js`
- Trình vẽ đồ thị dùng Cytoscape cục bộ, hỗ trợ directed/undirected, force-directed (cose), circle, grid, random graph.

#### 5.5: Pomodoro Timer
**Files:**
- Create: `d:\Temps\5\content\modules\pomodoro.js`
- Bộ đếm thời gian tập trung với âm thanh Web Audio Oscillator beep và Chrome notification.

#### 5.6: Game 2048
**Files:**
- Create: `d:\Temps\5\content\modules\game2048.js`
- Trò chơi 2048 thư giãn với hỗ trợ phím mũi tên / WASD, lưu điểm số cao nhất (Best Score) và lịch sử hoàn tác (Undo).

#### 5.7: Export ZIP
**Files:**
- Create: `d:\Temps\5\content\modules\export_zip.js`
- Xuất toàn bộ trang web (HTML, CSS, JS, ảnh) thành file ZIP nén bằng Fflate cục bộ với thanh tiến trình real-time.

- [ ] **Step 1: Triển khai các modules từ 5.1 đến 5.7**
- [ ] **Step 2: Viết entrypoint `content/content.js` để nạp và khởi động các module tuần tự khi DOM sẵn sàng**

---

### Task 6: DMOJ AC Easter Egg Module
**Files:**
- Create: `d:\Temps\5\content\modules\ac_easter_egg.js`
- Test: `d:\Temps\5\tests\test_ac_detection.js`

**Interfaces:**
- Consumes: DOM của trang submission DMOJ (kiểm chứng từ `D:\Temps\6\index.html`).
- Produces: Tự động phát hiện khi toàn bộ test cases đạt AC và chèn video chúc mừng mượt mà.

- [ ] **Step 1: Viết test logic nhận diện AC dựa trên HTML mẫu D:\Temps\6\index.html**
  Tạo test chạy Node.js đọc `D:\Temps\6\index.html`, áp dụng các hàm selector `_isSubmissionPage()`, `_isOverallAC()`, `_areAllCasesAC()`. Đảm bảo trả về TRUE chính xác cho trang nộp bài AC.

- [ ] **Step 2: Hiện thực ac_easter_egg.js**
  - Hỗ trợ selector chuẩn DMOJ: `#test-cases`, `table.submissions-status-table`, `tr.case-row`, `.case-AC`, `sup.case-AC`.
  - Hỗ trợ cả các biến thể CSOJ custom (`#sub-result`, `.submission-result`).
  - Lắng nghe biến đổi DOM qua MutationObserver khi DMOJ đang chấm bài theo thời gian thực (WebSocket).
  - Tự động chèn video chúc mừng vào ngay trên bảng test cases; có nút tắt video và tuỳ chọn bật/tắt trong panel.

- [ ] **Step 3: Chạy test xác nhận**
  Chạy `node tests/test_ac_detection.js` đạt kết quả PASS 100%.

---

### Task 7: Extension Toolbar Popup & Domain Manager
**Files:**
- Create: `d:\Temps\5\popup\popup.html`
- Create: `d:\Temps\5\popup\popup.css`
- Create: `d:\Temps\5\popup\popup.js`

**Interfaces:**
- Consumes: `chrome.storage.local`, `chrome.tabs`, `chrome.scripting`.
- Produces: Giao diện quản lý danh sách domain DMOJ được kích hoạt, bật/tắt nhanh các module cho domain hiện tại, nút mở dock tức thì.

- [ ] **Step 1: Thiết kế giao diện popup.html và popup.css**
  Giao diện tối màu (Dark mode) sang trọng, hiển thị domain hiện tại, danh sách domain đã cấp phép, danh sách toggle các tính năng (Logo, Background, Quote, Graph, Pomodoro, 2048, Export, AC Easter Egg).

- [ ] **Step 2: Viết popup.js**
  - Đọc danh sách domain từ `nmkdeveloperdmojbasedextraconfigs_global_domains`.
  - Cho phép người dùng thêm domain mới (ví dụ: `codeforces.com` hoặc OJ trường khác).
  - Cho phép bật/tắt từng tính năng độc lập cho domain đang mở.

- [ ] **Step 3: Kiểm tra hoạt động của popup**
  Kiểm tra tính toàn vẹn và giao tiếp giữa popup và storage.

---

### Task 8: Tổng kiểm tra & Đóng gói hoàn thiện (Verification & Polish)
- [ ] **Step 1: Kiểm tra toàn bộ mã nguồn**
  Rà soát toàn bộ file đảm bảo không còn tàn dư của Tampermonkey (`GM_xmlhttpRequest`, `GM_addStyle`, `unsafeWindow`).
- [ ] **Step 2: Viết tài liệu hướng dẫn cài đặt và sử dụng (README.md)**
  Hướng dẫn người dùng tải và cài đặt extension dạng "Load unpacked" trên Chrome/Edge/Brave chỉ với 3 bước.
- [ ] **Step 3: Báo cáo kết quả và xác nhận hoàn tất**
