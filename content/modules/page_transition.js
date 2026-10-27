/**
 * NMK Developer DMOJ-based Extra Configs - Seamless Page Transition & Prefetcher
 * Implements GPU-accelerated View Transitions, instant link prefetching,
 * sleek micro-progress indicator, and smooth exit/entry animations.
 */

const PageTransition = {
  _enabled: true,
  _prefetched: new Set(),
  _progressBar: null,
  _progressTimer: null,
  _hoverTimer: null,
  _exitTimeout: null,
  _revealed: false,

  _isReducedMotion() {
    return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  _isEligibleLink(anchor, e) {
    if (!anchor || !anchor.getAttribute) return false;
    const href = anchor.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) return false;

    // Check modifier keys or non-primary clicks (middle click, right click)
    if (e && (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || (e.button !== undefined && e.button !== 0))) return false;

    // Check target attribute
    if (anchor.target && anchor.target !== '_self') return false;

    // Check download or rel
    if (anchor.hasAttribute('download') || (anchor.rel && anchor.rel.includes('external'))) return false;

    // Parse URL
    let targetUrl;
    try {
      targetUrl = new URL(href, location.origin);
    } catch {
      return false;
    }

    // Must be same origin
    if (targetUrl.origin !== location.origin) return false;

    // Same pathname and search: if only hash differs, skip
    if (targetUrl.pathname === location.pathname && targetUrl.search === location.search) return false;

    // Exclude logout, raw code views, or download extensions
    const path = targetUrl.pathname.toLowerCase();
    if (/\/logout(\/|$)/i.test(path) || /\/raw(\/|$)/i.test(path)) return false;
    if (/\.(zip|tar|gz|7z|pdf|png|jpe?g|gif|webp|svg|exe|msi)$/i.test(path)) return false;

    return true;
  },

  prefetch(url) {
    if (!url || this._prefetched.has(url)) return;
    this._prefetched.add(url);

    // Limit cache size
    if (this._prefetched.size > 50) {
      const first = this._prefetched.values().next().value;
      this._prefetched.delete(first);
    }

    try {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      link.as = 'document';
      document.head.appendChild(link);
    } catch {
      // Fallback: low priority fetch
      fetch(url, { priority: 'low', credentials: 'include' }).catch(() => {});
    }
  },

  _createProgressBar() {
    if (this._progressBar || typeof document === 'undefined') return;
    const bar = document.createElement('div');
    bar.id = 'csoj-nav-progress';
    (document.body || document.documentElement).appendChild(bar);
    this._progressBar = bar;
  },

  _startProgress() {
    if (this._isReducedMotion()) return;
    this._createProgressBar();
    if (!this._progressBar) return;

    clearTimeout(this._progressTimer);
    const bar = this._progressBar;
    bar.style.transition = 'none';
    bar.style.width = '0%';
    bar.classList.add('active');

    // Smooth ramp up to ~75%
    requestAnimationFrame(() => {
      bar.style.transition = 'width 350ms cubic-bezier(0.1, 0.9, 0.2, 1), opacity 150ms ease';
      bar.style.width = '75%';
    });
  },

  _finishProgress() {
    if (!this._progressBar) return;
    const bar = this._progressBar;
    bar.style.transition = 'width 150ms ease-out, opacity 180ms ease';
    bar.style.width = '100%';

    clearTimeout(this._progressTimer);
    this._progressTimer = setTimeout(() => {
      bar.classList.remove('active');
      setTimeout(() => {
        bar.style.width = '0%';
      }, 200);
    }, 180);
  },

  initEarly() {
    if (typeof location !== 'undefined' && /\/raw(\/|$|\?|#)/i.test(location.pathname + location.search)) return;
    if (this._isReducedMotion() || typeof document === 'undefined') return;
    // Prepare initial state at document_start to eliminate white flash
    document.documentElement.classList.add('csoj-page-transitioning');
  },

  reveal() {
    if (this._revealed) return;
    this._revealed = true;

    if (this._isReducedMotion()) {
      document.documentElement.classList.remove('csoj-page-transitioning', 'csoj-page-ready', 'csoj-page-exiting');
      document.documentElement.classList.add('csoj-transition-settled');
      return;
    }

    this._finishProgress();

    requestAnimationFrame(() => {
      document.documentElement.classList.remove('csoj-page-transitioning');
      document.documentElement.classList.add('csoj-page-ready');

      setTimeout(() => {
        document.documentElement.classList.remove('csoj-page-ready');
        document.documentElement.classList.add('csoj-transition-settled');
      }, 280);
    });
  },

  init() {
    if (typeof location !== 'undefined' && /\/raw(\/|$|\?|#)/i.test(location.pathname + location.search)) return;
    if (typeof document === 'undefined') return;
    if (this._isReducedMotion()) return;

    this._createProgressBar();

    // Trigger reveal as soon as DOM is ready — DO NOT wait for slow window.load!
    if (document.readyState === 'interactive' || document.readyState === 'complete') {
      this.reveal();
    } else {
      document.addEventListener('DOMContentLoaded', () => this.reveal(), { once: true });
      setTimeout(() => this.reveal(), 500);
    }

    // Prefetch on hover (with 65ms hover debounce)
    document.addEventListener('pointerover', (e) => {
      const a = e.target?.closest?.('a');
      if (a && this._isEligibleLink(a)) {
        clearTimeout(this._hoverTimer);
        this._hoverTimer = setTimeout(() => {
          this.prefetch(a.href);
        }, 65);
      }
    }, { passive: true });

    // Prefetch on touch
    document.addEventListener('touchstart', (e) => {
      const a = e.target?.closest?.('a');
      if (a && this._isEligibleLink(a)) {
        this.prefetch(a.href);
      }
    }, { passive: true });

    // Handle link clicks with smooth exit animation and progress indicator
    document.addEventListener('click', (e) => {
      const a = e.target?.closest?.('a');
      if (!a || !this._isEligibleLink(a, e)) return;

      this._startProgress();
      document.documentElement.classList.remove('csoj-transition-settled', 'csoj-page-ready');
      document.documentElement.classList.add('csoj-page-exiting');

      // Safety fallback: if navigation is cancelled or slow, recover after 3.5s
      clearTimeout(this._exitTimeout);
      this._exitTimeout = setTimeout(() => {
        document.documentElement.classList.remove('csoj-page-exiting');
        this._finishProgress();
      }, 3500);
    }, { capture: true, passive: true });

    // Handle back/forward cache navigation
    window.addEventListener('pageshow', (e) => {
      if (e.persisted) {
        document.documentElement.classList.remove('csoj-page-exiting', 'csoj-page-transitioning');
        this._revealed = false;
        this.reveal();
      }
    });
  }
};

// Auto-run early preparation if running in browser
if (typeof document !== 'undefined') {
  PageTransition.initEarly();
}

if (typeof window !== 'undefined') {
  window.PageTransition = PageTransition;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PageTransition };
}
