# Changelog

All notable changes to **NMK Developer DMOJ-based Extra Configs** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [7.0.1] - 2026-10-27

### Added
- **Seamless Page Transitions (`PageTransition`)**:
  - GPU-accelerated Cross-Document View Transitions (`@view-transition { navigation: auto; }`) for Chromium 126+.
  - Persistent `#navigation` (main navbar) and `#csoj-dock` with zero blinking or page reload flashes.
  - Smooth vertical glide & morph for `#page-container` and main content.
  - Instant link prefetching on hover (`pointerover` / `touchstart`) for near-zero latency page loads.
  - High-tech glowing top progress indicator (`#csoj-nav-progress`) inspired by YouTube and GitHub.
  - BFCache (`pageshow`) support for instant back/forward navigation.
  - Full support for `prefers-reduced-motion`.
- **Pixel-Perfect Logo Aspect Ratio Engine**:
  - Automatic natural ratio detection directly from DOM image elements (`naturalWidth` / `naturalHeight`).
  - Completely eliminated empty letterboxing gaps on top and bottom by setting `height: auto` in locked manual mode and `width: auto` in navbar auto-fit mode.
  - Two-way synchronized Width & Height sliders preserving original aspect ratio.
  - Smart Divider auto-height matching rendered logo height without gap.
- **Test Suites**:
  - `test_storage.js`: Verified per-site storage key isolation and memory caching.
  - `test_ac_detection.js`: Verified AC Easter Egg parsing against real DMOJ HTML DOM.
  - `test_logo_ratio.js`: Verified ratio calculations and gap elimination styles.
  - `test_page_transition.js`: Verified link eligibility, prefetching, and transition state lifecycles.

### Changed
- **Migrated from Tampermonkey UserScript to Chrome Extension Manifest V3**:
  - Bundled 100% of vendor dependencies locally (`marked.min.js`, `fflate.min.js`, `cytoscape.min.js`, `mathjax 4 tex-svg`).
  - Zero external CDN network dependencies, 100% offline-ready.
  - Replaced `GM_setValue` / `localStorage` with `chrome.storage.local` backed by in-memory cache and `unlimitedStorage`.
  - Upgraded CSP compliance: isolated MathJax runner iframe and decoupled inline scripts into `runner-config.js` and `runner-main.js`.
  - Cleaned up legacy `EntryAnim` in favor of dedicated `PageTransition` module.

### Fixed
- Fixed CSP violation error (`sha256-6sOs3tQ9nsCB9fd5ikMQi+0C4uZzCvmPrMZX+EkCmLw=`) by separating `content/mj_shim.js` under `"world": "MAIN"`.
- Fixed square box constraint (`200 x 200`) on rectangular logos.

---

## [7.0.0] - Prior Tampermonkey Release
- Initial UI redesign with SVG icons.
- Floating Dock with Draggable Panels.
- Logo & Navbar customization.
- Custom Background with opacity slider.
- Quote Card with Markdown/LaTeX support.
- Graph visualizer using Cytoscape.
- Pomodoro timer with Web Audio synthesizer beeps.
- 2048 mini-game with undo functionality.
- Export page to ZIP using fflate.
- AC celebration Easter Egg.
