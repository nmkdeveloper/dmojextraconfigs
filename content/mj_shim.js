/**
 * NMK Developer DMOJ-based Extra Configs - MathJax Compatibility Shim
 * Injected in MAIN world to stub MathJax.typesetPromise safely without CSP violations.
 */

(function () {
  'use strict';
  if (window.__csojMJShim) return;
  window.__csojMJShim = true;

  var stub = function (els) {
    return new Promise(function (resolve) {
      var tries = 0;
      (function attempt() {
        var mj, fn;
        try {
          mj = window.MathJax;
          fn = mj && mj.typesetPromise;
        } catch (e) {}

        if (typeof fn === 'function' && fn !== stub) {
          try {
            Promise.resolve(fn.call(mj, els)).then(resolve, resolve);
          } catch (e) {
            resolve();
          }
        } else if (++tries > 300) {
          resolve();
        } else {
          setTimeout(attempt, 100);
        }
      })();
    });
  };

  var c = window.MathJax || {};
  if (typeof c === 'object' && !c.typesetPromise) {
    try { c.typesetPromise = stub; } catch (e) {}
  }

  try {
    Object.defineProperty(window, 'MathJax', {
      configurable: true,
      get: function () {
        if (!c || typeof c !== 'object') c = {};
        if (!c.typesetPromise) {
          try { c.typesetPromise = stub; } catch (e) {}
        }
        return c;
      },
      set: function (v) {
        c = v || {};
        if (typeof c === 'object' && !c.typesetPromise) {
          try { c.typesetPromise = stub; } catch (e) {}
        }
      }
    });
  } catch (e) {
    if (window.MathJax && !window.MathJax.typesetPromise) {
      try { window.MathJax.typesetPromise = stub; } catch (err) {}
    }
  }

  var iv = setInterval(function () {
    try {
      var m = window.MathJax;
      if (m && typeof m === 'object' && !m.typesetPromise) {
        m.typesetPromise = stub;
      }
    } catch (e) {}
  }, 100);
  setTimeout(function () { clearInterval(iv); }, 15000);
})();
