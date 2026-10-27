/**
 * NMK Developer DMOJ-based Extra Configs - Content Script Entrypoint
 * Coordinates SiteStore initialization, dock construction, and module lifecycles.
 */

(function () {
  'use strict';

  // Skip raw code view pages
  if (/\/raw(\/|$)/i.test(location.pathname)) {
    LOG.warn('Raw code page — skipping toolkit injection.');
    return;
  }

  const waitForBody = () => new Promise((resolve) => {
    if (document.body) return resolve();
    const obs = new MutationObserver(() => {
      if (document.body) {
        obs.disconnect();
        resolve();
      }
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
  });

  // Main bootstrap sequence
  (async () => {
    try {
      LOG.info('Initializing SiteStore for:', location.hostname);
      await SiteStore.init();

      await waitForBody();
      LOG.info('Document body ready — building UI and initializing modules...');

      Dock.build();
      PageTransition.init();

      // Initialize all feature modules
      await LogoManager.init();
      await Background.init();
      await Quote.init();
      await Graph.init();
      await Pomodoro.init();
      await Game2048.init();
      await ExportZIP.init();
      ACEasterEgg.init();

      LOG.ok('All NMK Developer DMOJ modules initialized successfully.');
    } catch (err) {
      LOG.err('Failed to initialize toolkit:', err);
    }
  })();

  // Listen for messages from toolbar popup
  if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
      if (msg.action === 'toggle_dock') {
        Dock.toggleTools();
        sendResponse({ ok: true });
      } else if (msg.action === 'reload_settings') {
        location.reload();
      }
      return true;
    });
  }
})();
