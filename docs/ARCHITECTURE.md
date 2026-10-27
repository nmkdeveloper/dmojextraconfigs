# System Architecture

This document provides a comprehensive overview of the architecture of **NMK Developer DMOJ-based Extra Configs** (Manifest V3).

---

## 🏛️ High-Level Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Browser Environment                           │
│                                                                        │
│  ┌───────────────────────┐             ┌────────────────────────────┐  │
│  │    Toolbar Popup      │             │     Background Worker      │  │
│  │   (Domain Manager)    │◄──Messages──┤     (Service Worker)       │  │
│  └───────────┬───────────┘             └─────────────┬──────────────┘  │
│              │                                       │                 │
│              │ chrome.storage.local                  │ scripting API   │
│              ▼                                       ▼                 │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                       DMOJ Web Page                              │  │
│  │                                                                  │  │
│  │  ┌────────────────────────┐         ┌─────────────────────────┐  │  │
│  │  │    Main World Shim     │         │    Content Script       │  │  │
│  │  │   (content/mj_shim.js) │         │  (content/content.js)   │  │  │
│  │  └────────────────────────┘         └────────────┬────────────┘  │  │
│  │                                                  │               │  │
│  │              ┌───────────────────────────────────┼────────────┐  │  │
│  │              ▼                                   ▼            │  │  │
│  │    ┌───────────────────┐               ┌───────────────────┐  │  │  │
│  │    │   SiteStore       │               │   PageTransition  │  │  │  │
│  │    │ (In-memory cache) │               │(ViewTransitions & │  │  │  │
│  │    └───────────────────┘               │    Prefetcher)    │  │  │  │
│  │                                        └───────────────────┘  │  │  │
│  │              ┌───────────────────────────────────┼────────────┘  │  │
│  │              ▼                                   ▼               │  │
│  │    ┌───────────────────┐               ┌───────────────────┐     │  │
│  │    │   Dock & Panels   │               │  Feature Modules  │     │  │
│  │    │  (Window Manager) │               │   (8 Modules)     │     │  │
│  │    └───────────────────┘               └───────────────────┘     │  │
│  │                                                                  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🔑 Key Architectural Components

### 1. Storage Subsystem (`content/storage.js`)
- **Per-Site Key Isolation**:
  Every key is keyed as `nmkdeveloperdmojbasedextraconfigs_${hostname}_${key}`.
  This guarantees that changes made on `csoj.edu.vn` never collide with `oj.vnoi.info` or custom domains.
- **In-Memory Cache (0ms reads)**:
  During initialization (`SiteStore.init()`), all domain keys are read into memory once. Subsequent `SiteStore.get(key)` calls are synchronous and return in 0ms without asynchronous storage overhead.
- **Asynchronous Persistence**:
  `SiteStore.set(key, val)` updates the local cache immediately and persists to `chrome.storage.local` asynchronously.
- **Unlimited Quota**:
  Configured with `unlimitedStorage` permission to safely store high-resolution background images and custom logos as base64 without throwing `QuotaExceededError`.

### 2. Page Transition Engine (`content/modules/page_transition.js`)
- **Cross-Document View Transitions**:
  Enabled with CSS `@view-transition { navigation: auto; }`.
  Assigns persistent view-transition names to `#navigation` and `#csoj-dock`, allowing the navbar and toolkit dock to remain stable across MPA page loads without white flashes.
- **Intelligent Link Prefetcher**:
  Monitors mouse hover (`pointerover`, 65ms debounce) and touch events on internal links. Prefetches target HTML ahead of user clicks to achieve instantaneous page loads.
- **Micro-Progress Indicator**:
  Injects a high-tech glowing progress bar (`#csoj-nav-progress`) across the top of the viewport upon link navigation.

### 3. MathJax Sandbox Subsystem (`libs/mathjax/`)
- To strictly comply with Manifest V3 Content Security Policy (no dynamic string evaluation or inline scripts), MathJax 4 is run inside a sandboxed iframe:
  - `libs/mathjax/mathjax-runner.html`
  - `libs/mathjax/runner-config.js`
  - `libs/mathjax/runner-main.js`
  - `libs/mathjax/tex-svg.js`
- Communication is facilitated via asynchronous `postMessage` protocol, safely converting raw LaTeX strings into pristine inline SVGs.

### 4. Background Service Worker (`background.js`)
- Automatically registers default supported domains (`csoj.edu.vn`, `oj.vnoi.info`, `dmoj.ca`) upon installation.
- Provides dynamic content script injection for user-added custom DMOJ instances via `chrome.scripting.registerContentScripts`.
- Mediates messaging between popup and content scripts.
