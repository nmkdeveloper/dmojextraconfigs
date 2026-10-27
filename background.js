/**
 * NMK Developer DMOJ-based Extra Configs - Background Service Worker
 * Manages extension lifecycle, default domains, and dynamic content scripts.
 */

const DEFAULT_DOMAINS = ["csoj.edu.vn", "oj.vnoi.info", "dmoj.ca"];
const KEY_DOMAINS = "nmkdeveloperdmojbasedextraconfigs_global_domains";
const KEY_EASTER_EGG = "nmkdeveloperdmojbasedextraconfigs_global_easter_egg";

// Initialize defaults on install
chrome.runtime.onInstalled.addListener(async (details) => {
  const data = await chrome.storage.local.get([KEY_DOMAINS, KEY_EASTER_EGG]);
  if (!data[KEY_DOMAINS]) {
    await chrome.storage.local.set({ [KEY_DOMAINS]: DEFAULT_DOMAINS });
  }
  if (data[KEY_EASTER_EGG] === undefined) {
    await chrome.storage.local.set({ [KEY_EASTER_EGG]: true });
  }
  syncDynamicContentScripts();
});

// Synchronize dynamic content scripts for user-added custom domains
async function syncDynamicContentScripts() {
  try {
    const data = await chrome.storage.local.get(KEY_DOMAINS);
    const domains = data[KEY_DOMAINS] || DEFAULT_DOMAINS;

    // Find domains not covered by static manifest matches
    const customDomains = domains.filter(d => !["csoj.edu.vn", "oj.vnoi.info", "dmoj.ca"].includes(d));

    // Unregister existing dynamic scripts first
    const existing = await chrome.scripting.getRegisteredContentScripts();
    const idsToUnregister = existing
      .filter(s => s.id === "dynamic-dmoj-scripts" || s.id === "dynamic-dmoj-shim")
      .map(s => s.id);
    if (idsToUnregister.length > 0) {
      await chrome.scripting.unregisterContentScripts({ ids: idsToUnregister });
    }

    if (customDomains.length > 0) {
      const matches = customDomains.flatMap(d => [`*://${d}/*`, `*://*.${d}/*`]);
      const excludeMatches = [
        "*://*/*/raw",
        "*://*/*/raw/*",
        "*://*/raw",
        "*://*/raw/*"
      ];
      await chrome.scripting.registerContentScripts([
        {
          id: "dynamic-dmoj-shim",
          matches: matches,
          excludeMatches: excludeMatches,
          js: ["content/mj_shim.js"],
          runAt: "document_start",
          world: "MAIN"
        },
        {
          id: "dynamic-dmoj-scripts",
          matches: matches,
          excludeMatches: excludeMatches,
          css: ["content/content.css"],
          js: [
            "libs/marked.min.js",
            "libs/fflate.min.js",
            "libs/cytoscape.min.js",
            "content/storage.js",
            "content/dock.js",
            "content/modules/page_transition.js",
            "content/modules/logo_manager.js",
            "content/modules/background.js",
            "content/modules/quote.js",
            "content/modules/graph.js",
            "content/modules/pomodoro.js",
            "content/modules/game2048.js",
            "content/modules/export_zip.js",
            "content/modules/ac_easter_egg.js",
            "content/content.js"
          ],
          runAt: "document_start"
        }
      ]);
    }
  } catch (err) {
    console.error("[NMK Background] Failed to sync dynamic scripts:", err);
  }
}

// Listen for domain list changes
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes[KEY_DOMAINS]) {
    syncDynamicContentScripts();
  }
});

// Message listener for popup/content
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "get_status") {
    sendResponse({ ok: true, version: chrome.runtime.getManifest().version });
  }
  return true;
});
