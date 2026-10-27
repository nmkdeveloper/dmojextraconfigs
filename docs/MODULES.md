# Feature Modules Reference

This document details all modules included in **NMK Developer DMOJ-based Extra Configs**.

---

## 🎨 1. Logo & Navbar Manager (`content/modules/logo_manager.js`)
- **Features**:
  - Upload custom logo images with canvas WebP compression (max 500px).
  - Preserves natural aspect ratio (`naturalWidth` / `naturalHeight`) without letterboxing or empty gaps.
  - **Auto Fit Mode**: Automatically conforms logo height to the navbar height while letting width expand to the image's original ratio.
  - **Manual Mode with Ratio Lock**: Allows slider adjustment of Width or Height with two-way mathematical synchronization (`w = Math.round(h * r)`).
  - Divider customizer (height, width, margin, opacity, auto-match logo height).
  - Dynamic favicon and mobile home-screen icon synchronization.

---

## 🖼️ 2. Background Manager (`content/modules/background.js`)
- **Features**:
  - Upload custom wallpaper images with client-side canvas compression.
  - Dark overlay slider (0% to 100%) to ensure problem descriptions and code snippets remain legible.
  - Persistent storage in `SiteStore`.
  - Instant live preview without page refresh.

---

## 💬 3. Quote Card (`content/modules/quote.js`)
- **Features**:
  - Draggable, persistent quote card for algorithms, motivational notes, or complex formulas.
  - Markdown formatting support via bundled `marked.min.js`.
  - Mathematical formulas rendering (KaTeX / MathJax syntax: `$inline$` and `$$display$$`).
  - Font size adjustment and edit modal.

---

## 🕸️ 4. Graph Drawer (`content/modules/graph.js`)
- **Features**:
  - Interactive graph visualizer powered by bundled `cytoscape.min.js`.
  - Edge input format: simple list of edges `u v [w]`.
  - Directed and undirected edge support.
  - Layout algorithms: **Cose (force-directed)**, **Circle**, **Grid**.
  - Random graph generator for quick algorithmic testcases.
  - Node drag-and-drop, zoom, pan, and fit to viewport.

---

## ⏱️ 5. Pomodoro Timer (`content/modules/pomodoro.js`)
- **Features**:
  - Focus session manager (configurable work, break, long break intervals).
  - Web Audio API synthesizer chime sounds (zero external audio file dependency).
  - Browser notifications on session completion.
  - Minimize to compact floating pill.

---

## 🎮 6. 2048 Game (`content/modules/game2048.js`)
- **Features**:
  - Built-in 2048 algorithmic puzzle game for breaks between coding contests.
  - Supports Arrow keys, WASD, and touch swipes.
  - Undo move functionality.
  - High score persistence across sessions per site.

---

## 📦 7. Export ZIP (`content/modules/export_zip.js`)
- **Features**:
  - Full-page archiver: scrapes problem statement, stylesheets, assets, and images.
  - Zips contents on-the-fly using bundled `fflate.min.js` (streaming zip compression).
  - Downloads clean `.zip` archive for offline studying and contest preparation.

---

## 🎉 8. AC Easter Egg (`content/modules/ac_easter_egg.js`)
- **Features**:
  - Real-time DOM observer on submission status pages.
  - Detects full Accepted (AC) submissions:
    - Scans `#test-cases`, `.submissions-status-table`, `.case-row`, `.case-AC`.
    - Validates points score: e.g. `20/20`, `100/100`, `10/10`.
  - Celebratory full-screen video overlay (`assets/ac.mp4`) with smooth fade-in and instant close button.

---

## ⚡ 9. Page Transition & Prefetcher (`content/modules/page_transition.js`)
- **Features**:
  - Chrome View Transitions API cross-document coordination.
  - Top edge glowing progress bar (`#csoj-nav-progress`).
  - Link hover prefetching with 65ms debounce.
  - Instant content entry without waiting for slow asset loads.
