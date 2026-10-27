# Contributing to NMK Developer DMOJ-based Extra Configs

Thank you for your interest in improving **NMK Developer DMOJ-based Extra Configs**! We welcome bug reports, feature suggestions, and code contributions.

---

## 🛠️ Development Setup

1. **Clone the repository:**
   ```bash
   git clone git@github.com:nmkdeveloper/dmojextraconfigs.git
   cd dmojextraconfigs
   ```

2. **Load into your browser:**
   - Open **Chrome / Edge / Brave / Cốc Cốc**.
   - Navigate to `chrome://extensions/` (or `edge://extensions/`).
   - Enable **Developer mode** in the upper-right corner.
   - Click **Load unpacked** and select the repository root directory.

3. **Verify Installation:**
   - Visit any supported DMOJ site (e.g. `csoj.edu.vn`, `oj.vnoi.info`, or `dmoj.ca`).
   - The Floating Dock will appear in the lower-right corner.

---

## 🧪 Running Tests

All unit tests run on Node.js without requiring external npm packages:

```bash
npm test
```

Or run tests individually:
```bash
node tests/test_storage.js
node tests/test_ac_detection.js
node tests/test_logo_ratio.js
node tests/test_page_transition.js
```

---

## 📐 Guidelines & Architecture Principles

- **Manifest V3 & CSP Compliance:**
  - Never use `eval()`, `new Function()`, or inline `<script>` tags in extension pages or DOM injections.
  - Scripts running in the page's main world must be defined in separate files and declared in `manifest.json`.
- **Per-Site Storage Isolation:**
  - All settings must be retrieved and stored through `SiteStore.get(key)` and `SiteStore.set(key, val)`.
  - Keys are automatically prefixed with `nmkdeveloperdmojbasedextraconfigs_${hostname}_${key}`.
- **Vendor Dependencies:**
  - Do not reference external CDNs (`jsdelivr`, `cdnjs`, etc.).
  - All libraries must be bundled locally in `libs/` for offline reliability and zero-latency execution.
- **Code Style (Ponytail):**
  - Keep implementations lean, direct, and free of unnecessary abstractions.
  - Avoid heavy frameworks or runtime compilers.

---

## 🔀 Submitting a Pull Request

1. Fork the repository and create your branch from `main`:
   ```bash
   git checkout -b feature/my-new-feature
   ```
2. Commit your changes with clear, descriptive messages:
   ```bash
   git commit -m "feat: add feature XYZ"
   ```
3. Run the automated test suite to ensure all tests pass:
   ```bash
   npm test
   ```
4. Push to your fork and submit a Pull Request to `main`.
