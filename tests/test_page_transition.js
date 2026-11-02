const assert = require('assert');

// Mock DOM & window
const classListSet = new Set();
global.location = {
  origin: 'https://csoj.edu.vn',
  hostname: 'csoj.edu.vn',
  pathname: '/problems/',
  search: ''
};

global.document = {
  readyState: 'complete',
  documentElement: {
    classList: {
      add(c) { classListSet.add(c); },
      remove(c) { classListSet.delete(c); },
      contains(c) { return classListSet.has(c); }
    }
  },
  body: {},
  head: {
    appendChild(el) { mockHeadAppended.push(el); }
  },
  createElement(tag) {
    return {
      tagName: tag.toUpperCase(),
      id: '',
      rel: '',
      href: '',
      as: '',
      style: {},
      classList: {
        add() {},
        remove() {}
      }
    };
  },
  addEventListener() {}
};

global.window = {
  matchMedia: () => ({ matches: false }),
  addEventListener() {}
};

global.requestAnimationFrame = (cb) => cb();

let mockHeadAppended = [];

const { PageTransition } = require('../content/modules/page_transition.js');

function runTests() {
  console.log('Testing PageTransition module...');

  // 1. Link eligibility tests
  const internalLink = {
    getAttribute(name) { return name === 'href' ? '/submissions/' : null; },
    hasAttribute() { return false; },
    target: '_self'
  };
  assert.strictEqual(PageTransition._isEligibleLink(internalLink), true, 'Internal same-origin link should be eligible');

  const externalLink = {
    getAttribute(name) { return name === 'href' ? 'https://google.com/' : null; },
    hasAttribute() { return false; }
  };
  assert.strictEqual(PageTransition._isEligibleLink(externalLink), false, 'External link should not be eligible');

  const logoutLink = {
    getAttribute(name) { return name === 'href' ? '/accounts/logout/' : null; },
    hasAttribute() { return false; }
  };
  assert.strictEqual(PageTransition._isEligibleLink(logoutLink), false, 'Logout link should never be prefetch eligible');

  const downloadLink = {
    getAttribute(name) { return name === 'href' ? '/files/test.zip' : null; },
    hasAttribute(name) { return name === 'download'; }
  };
  assert.strictEqual(PageTransition._isEligibleLink(downloadLink), false, 'Download link should not be eligible');

  const hashLink = {
    getAttribute(name) { return name === 'href' ? '#content' : null; },
    hasAttribute() { return false; }
  };
  assert.strictEqual(PageTransition._isEligibleLink(hashLink), false, 'Hash link should not be eligible');

  const rawLink = {
    getAttribute(name) { return name === 'href' ? '/src/12345/raw' : null; },
    hasAttribute() { return false; }
  };
  assert.strictEqual(PageTransition._isEligibleLink(rawLink), false, 'Raw link should not be intercepted');

  const submitLink = {
    getAttribute(name) { return name === 'href' ? '/problem/vienthong/submit' : null; },
    hasAttribute() { return false; }
  };
  assert.strictEqual(PageTransition._isEligibleLink(submitLink), false, 'Submit link should not be intercepted by PageTransition');

  const contestSubmitLink = {
    getAttribute(name) { return name === 'href' ? '/contest/vnoi2026/problem/vienthong/submit/' : null; },
    hasAttribute() { return false; }
  };
  assert.strictEqual(PageTransition._isEligibleLink(contestSubmitLink), false, 'Contest submit link should not be intercepted');

  const noTransitionLink = {
    getAttribute(name) { return name === 'href' ? '/submissions/' : null; },
    hasAttribute(name) { return name === 'data-csoj-no-transition'; }
  };
  assert.strictEqual(PageTransition._isEligibleLink(noTransitionLink), false, 'Link with data-csoj-no-transition should not be eligible');

  const ctrlClick = { ctrlKey: true };
  assert.strictEqual(PageTransition._isEligibleLink(internalLink, ctrlClick), false, 'Ctrl+click should not trigger transition');

  // 2. Prefetching tests
  mockHeadAppended = [];
  PageTransition._prefetched.clear();
  PageTransition.prefetch('https://csoj.edu.vn/submissions/');
  assert.strictEqual(PageTransition._prefetched.has('https://csoj.edu.vn/submissions/'), true);
  assert.strictEqual(mockHeadAppended.length, 1);
  assert.strictEqual(mockHeadAppended[0].rel, 'prefetch');

  // Deduplication
  PageTransition.prefetch('https://csoj.edu.vn/submissions/');
  assert.strictEqual(mockHeadAppended.length, 1, 'Duplicate prefetch should be skipped');

  // 3. Early initialization & Reveal lifecycle
  classListSet.clear();
  PageTransition.initEarly();
  assert.strictEqual(classListSet.has('csoj-page-transitioning'), true, 'Early init must add csoj-page-transitioning');

  PageTransition._revealed = false;
  PageTransition.reveal();
  assert.strictEqual(classListSet.has('csoj-page-transitioning'), false, 'Reveal must remove csoj-page-transitioning');
  assert.strictEqual(classListSet.has('csoj-page-ready'), true, 'Reveal must add csoj-page-ready');

  // 4. cancelExit tests
  classListSet.clear();
  classListSet.add('csoj-page-exiting');
  PageTransition.cancelExit();
  assert.strictEqual(classListSet.has('csoj-page-exiting'), false, 'cancelExit must remove csoj-page-exiting');
  assert.strictEqual(classListSet.has('csoj-transition-settled'), true, 'cancelExit must add csoj-transition-settled');

  // 5. Raw page exclusion tests
  classListSet.clear();
  global.location = { origin: 'https://csoj.edu.vn', pathname: '/src/54321/raw', search: '' };
  PageTransition.initEarly();
  assert.strictEqual(classListSet.size, 0, 'initEarly on raw page must NOT add any classes');
  global.location = { origin: 'https://csoj.edu.vn', pathname: '/problems/', search: '' };

  // 6. Page container rounded styling verification
  const fs = require('fs');
  const path = require('path');
  const css = fs.readFileSync(path.join(__dirname, '../content/content.css'), 'utf8');
  assert.strictEqual(css.includes('#page-container'), true, 'content.css must include #page-container');
  assert.strictEqual(/#page-container\s*\{[^}]*border-radius:\s*16px/i.test(css), true, '#page-container must have border-radius: 16px');
  assert.strictEqual(/#page-container\s*>\s*footer/i.test(css), true, 'footer inside #page-container must have matching border-radius');

  console.log('All PageTransition tests PASSED!');
}

runTests();
