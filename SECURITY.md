# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 7.0.x   | :white_check_mark: |
| < 7.0.0 | :x:                |

---

## Security & Privacy Design

**NMK Developer DMOJ-based Extra Configs** is built from the ground up with strict security and privacy principles:

1. **Zero External Data Collection:**
   - The extension does NOT collect, track, or transmit any user data, passwords, submissions, or analytics.
   - All settings and assets are stored strictly locally in your browser's `chrome.storage.local`.
2. **100% Offline Asset Execution:**
   - All JavaScript libraries (`marked`, `fflate`, `cytoscape`, `mathjax`) and media assets are bundled locally in the extension package.
   - No scripts are loaded over third-party CDNs.
3. **Strict Content Security Policy (CSP):**
   - Compliant with Chrome Extension Manifest V3.
   - No `eval()`, `unsafe-eval`, or dynamic inline code execution.
   - MathJax equation rendering is sandboxed inside an isolated iframe runner.
4. **Isolated Storage:**
   - Domain-specific settings are separated to prevent cross-site contamination between different online judge platforms.

---

## Reporting a Vulnerability

If you discover a security vulnerability in this project:

1. Please do **NOT** report it publicly on GitHub Issues.
2. Email the maintainer directly at: `nguyenminhkhoi.nmk.mail@gmail.com`
3. Include details of the vulnerability, steps to reproduce, and any relevant logs or code snippets.
4. You will receive an initial response within 48 hours, followed by a security fix and advisory.
