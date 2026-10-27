/**
 * NMK Developer DMOJ-based Extra Configs - DMOJ AC Easter Egg
 * Detects Accepted (Full AC) status on DMOJ platforms and displays a celebration video.
 * Tested against real DMOJ HTML structures (CSOJ, VNOJ, DMOJ.ca).
 */

const ACEasterEgg = {
  _inserted: false,
  _checkScheduled: false,
  _observer: null,

  // Selectors for DMOJ, VNOJ, CSOJ and custom forks
  SEL_CONTAINER: '#test-cases, .submissions-status-table, #sub-result, .sub-result, .submission-result, .submission-result-detail',
  SEL_CASE: '.case-row, .subresult-testcase-row, tr[data-case]',
  SEL_AC: '.case-AC',
  SEL_FAIL: '.case-WA, .case-TLE, .case-MLE, .case-RE, .case-CE, .case-IE, .case-OLE, .case-IR, .case-AB, .case-FA',
  ONLINE_VIDEO_SRC: 'https://raw.githubusercontent.com/furavietnam/furaoj-resources/main/mp4/eastereggs/ac.mp4',
  WRAP_ID: 'csoj-ac-easter-egg',

  init() {
    if (!this._maybeSubmissionPage()) {
      LOG.info('AC Easter Egg: Not a submission page, skipping observer.');
      return;
    }

    LOG.ok('AC Easter Egg: Submission page detected, observing judging status.');
    this._scheduleCheck();

    this._observer = new MutationObserver(() => this._scheduleCheck());
    this._observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style'],
    });
  },

  _maybeSubmissionPage() {
    if (typeof location !== 'undefined' && /\/submission\//i.test(location.pathname)) return true;
    if (typeof document !== 'undefined' && document.querySelector(this.SEL_CONTAINER)) return true;
    return false;
  },

  _scheduleCheck() {
    if (this._checkScheduled) return;
    this._checkScheduled = true;
    requestAnimationFrame(() => {
      this._checkScheduled = false;
      this._check();
    });
  },

  _check() {
    if (typeof SiteStore !== 'undefined' && SiteStore.get('easter_egg_enabled') === false) {
      this._remove();
      return;
    }

    const container = document.querySelector(this.SEL_CONTAINER);
    if (!container) return;

    if (!this._isOverallAC(container)) {
      this._remove();
      return;
    }

    const cases = document.querySelectorAll(this.SEL_CASE);
    if (cases.length > 0) {
      for (const c of cases) {
        if (!this._isCaseAC(c)) {
          this._remove();
          return;
        }
      }
    }

    if (!this._inserted) {
      this._insert(container);
    }
  },

  _isOverallAC(el) {
    const parentContainer = el.closest('#test-cases') || el.closest('#content-body') || el;
    const text = (parentContainer.textContent || '').toLowerCase();

    // Check for hard failures
    const failWords = /\b(wrong answer|wa|time limit|tle|memory limit|mle|runtime error|re|compile error|ce|output limit|ole|internal error|aborted|rejected)\b/;
    if (failWords.test(text)) return false;

    // Check if any fail element is present
    if (parentContainer.querySelector(this.SEL_FAIL)) return false;

    // Check for AC confirmation
    const hasAcClass = parentContainer.querySelector(this.SEL_AC);
    const hasAcSup = parentContainer.querySelector('sup.case-AC');
    const okWords = /\b(accepted|\bac\b|kết quả đúng)\b/.test(text);

    // Score fraction check: e.g. "20/20" or "(10.0/10" or "100/100"
    const scoreMatch = text.match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/);
    let fullScore = false;
    if (scoreMatch) {
      const got = parseFloat(scoreMatch[1]);
      const max = parseFloat(scoreMatch[2]);
      if (max > 0 && got >= max) fullScore = true;
    }

    return (Boolean(hasAcClass) || Boolean(hasAcSup) || okWords) && (fullScore || !text.includes('/'));
  },

  _isCaseAC(el) {
    if (el.querySelector(this.SEL_FAIL)) return false;
    if (el.querySelector(this.SEL_AC)) return true;

    const t = (el.textContent || '').toLowerCase();
    const ok = /\b(accepted|\bac\b|kết quả đúng)\b/.test(t);
    const fail = /\b(wa|wrong answer|tle|time limit|mle|memory limit|runtime error|compile error|ole|output limit|internal error)\b/.test(t);
    return ok && !fail;
  },

  _insert(target) {
    this._remove();

    const localVideoUrl = typeof chrome !== 'undefined' && chrome.runtime?.getURL
      ? chrome.runtime.getURL('assets/ac.mp4')
      : '';
    const videoSrc = localVideoUrl || this.ONLINE_VIDEO_SRC;

    const wrap = document.createElement('div');
    wrap.id = this.WRAP_ID;
    wrap.setAttribute('data-csoj-ui', '1');
    wrap.innerHTML = `
      <div style="position:relative;width:100%;">
        <button id="csoj-ac-close" title="Đóng video" style="position:absolute;top:10px;right:10px;z-index:20;background:rgba(0,0,0,0.6);border:1px solid rgba(255,255,255,0.2);color:#fff;border-radius:50%;width:30px;height:30px;cursor:pointer;display:flex;align-items:center;justify-content:center;">${svg('x', 14)}</button>
        <video controls autoplay muted loop playsinline crossorigin="anonymous">
          <source src="${videoSrc}" type="video/mp4">
          <source src="${this.ONLINE_VIDEO_SRC}" type="video/mp4">
          Trình duyệt của bạn không hỗ trợ thẻ video.
        </video>
      </div>
    `;

    const closeBtn = wrap.querySelector('#csoj-ac-close');
    closeBtn.addEventListener('click', () => this._remove());

    const insertTarget = target.id === 'test-cases' ? target : (document.getElementById('test-cases') || target);
    if (insertTarget.parentNode) {
      insertTarget.parentNode.insertBefore(wrap, insertTarget);
    } else {
      document.body.insertBefore(wrap, document.body.firstChild);
    }

    const v = wrap.querySelector('video');
    if (v) v.play().catch(() => {});

    this._inserted = true;
    LOG.ok('🎉 AC toàn bộ — đã hiển thị video Easter Egg chúc mừng!');
  },

  _remove() {
    if (!this._inserted) return;
    const el = document.getElementById(this.WRAP_ID);
    if (el) el.remove();
    this._inserted = false;
  },

  // Helpers for testing / programmatic check
  detectSubmissionPage(html, url = '') {
    if (/\/submission\//i.test(url)) return true;
    return html.includes('id="test-cases"') || html.includes('submissions-status-table') || html.includes('sub-result');
  },

  detectOverallAC(html) {
    const hasFail = /(case-WA|case-TLE|case-MLE|case-RE|case-CE|case-IE|wrong answer|time limit|runtime error)/i.test(html);
    if (hasFail) return false;

    const hasAc = /(case-AC|kết quả đúng|accepted)/i.test(html);
    const scoreMatch = html.match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/);
    let fullScore = false;
    if (scoreMatch) {
      const got = parseFloat(scoreMatch[1]);
      const max = parseFloat(scoreMatch[2]);
      if (max > 0 && got >= max) fullScore = true;
    }
    return hasAc && fullScore;
  }
};

if (typeof window !== 'undefined') {
  window.ACEasterEgg = ACEasterEgg;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ACEasterEgg };
}
