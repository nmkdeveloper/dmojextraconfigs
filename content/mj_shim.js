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

  var c = window.MathJax;
  if (c && typeof c === 'object' && !c.typesetPromise) {
    try { c.typesetPromise = stub; } catch (e) {}
  }

  try {
    Object.defineProperty(window, 'MathJax', {
      configurable: true,
      get: function () { return c; },
      set: function (v) {
        c = v;
        if (v && typeof v === 'object' && !v.typesetPromise) {
          try { v.typesetPromise = stub; } catch (e) {}
        }
      }
    });
  } catch (e) {}

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
