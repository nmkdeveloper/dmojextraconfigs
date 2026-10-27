const assert = require('assert');

// Mock DOM and SiteStore
global.SiteStore = {
  data: {},
  get(k, def) { return this.data[k] !== undefined ? this.data[k] : def; },
  set(k, v) { this.data[k] = v; },
  del(k) { delete this.data[k]; }
};

global.LOG = { group() {}, groupEnd() {}, info() {}, ok() {}, warn() {}, err() {} };
global.location = { origin: 'https://csoj.edu.vn', hostname: 'csoj.edu.vn' };

// Mock DOM environment
const mockStyles = {};
const mockImg = {
  naturalWidth: 600,
  naturalHeight: 200,
  getAttribute(name) { return name === 'data-csoj-logo' ? '1' : null; },
  removeAttribute() {},
  style: {
    setProperty(prop, val) { mockStyles[prop] = val; },
    removeProperty(prop) { delete mockStyles[prop]; },
    getPropertyValue(prop) { return mockStyles[prop]; }
  },
  getBoundingClientRect() { return { width: 200, height: 66.67 }; },
  addEventListener() {}
};

global.document = {
  querySelector(sel) {
    if (sel.includes('data-csoj-logo') || sel.includes('logo')) return mockImg;
    return null;
  },
  querySelectorAll(sel) {
    if (sel.includes('data-csoj-logo')) return [mockImg];
    return [];
  },
  getElementById(id) {
    if (id === 'navigation') {
      return {
        querySelector() { return { getBoundingClientRect() { return { height: 52 }; } }; },
        clientHeight: 52,
        style: { setProperty() {}, removeProperty() {} }
      };
    }
    return null;
  }
};
global.getComputedStyle = () => ({ paddingTop: '0px', paddingBottom: '0px' });

const { LogoManager } = require('../content/modules/logo_manager.js');

function runTests() {
  console.log('Testing LogoManager original aspect ratio and gap elimination logic...');

  // 1. Test ratio calculation with default
  LogoManager._imgRatio = null;
  LogoManager._w = 40;
  LogoManager._h = 40;
  // Natural image 600x200 in DOM should be auto-detected!
  assert.strictEqual(LogoManager._ratio(), 3.0, '_ratio() should read from DOM naturalWidth/naturalHeight');

  // 2. Test badge display with lock enabled
  LogoManager.el = { badge: { textContent: '' }, hSlider: {}, hVal: {} };
  LogoManager._lock = true;
  LogoManager._imgRatio = 3.0;
  LogoManager._syncBadge();
  assert.strictEqual(LogoManager.el.badge.textContent, '3.00:1', 'Badge should display 3.00:1 for 3:1 ratio');

  LogoManager._imgRatio = 16 / 9;
  LogoManager._syncBadge();
  assert.strictEqual(LogoManager.el.badge.textContent, '16:9', 'Badge should recognize 16:9 ratio');

  LogoManager._lock = false;
  LogoManager._syncBadge();
  assert.strictEqual(LogoManager.el.badge.textContent, 'Free', 'Badge should display Free when unlocked');

  // 3. Test Manual mode with Lock: width=200, r=3.0 -> height must be auto to eliminate top/bottom gap
  LogoManager._lock = true;
  LogoManager._sizeMode = 'manual';
  LogoManager._imgRatio = 3.0;
  LogoManager._w = 200;
  LogoManager._h = 200; // was previously 200
  LogoManager._applyFit();

  assert.strictEqual(mockStyles['width'], '200px', 'Manual mode width should be 200px');
  assert.strictEqual(mockStyles['height'], 'auto', 'Manual locked mode height MUST be auto to eliminate top/bottom gap');
  assert.strictEqual(mockStyles['max-height'], 'none', 'max-height must be none in manual locked mode');
  assert.strictEqual(LogoManager._h, 67, 'LogoManager._h must be recalculated to Math.round(200/3)=67');

  // 4. Test Auto mode fit (navbar height 52 - 2*gap = 44)
  LogoManager._sizeMode = 'auto';
  LogoManager._gap = 4;
  LogoManager._applyFit();

  assert.strictEqual(mockStyles['height'], '44px', 'Auto mode height should be 44px');
  assert.strictEqual(mockStyles['width'], 'auto', 'Auto mode width MUST be auto to expand according to original ratio');
  assert.strictEqual(mockStyles['max-height'], '44px', 'Auto mode max-height should be 44px');

  // 5. Test _syncDimensions
  LogoManager._w = 300;
  LogoManager._imgRatio = 2.0;
  LogoManager._syncDimensions();
  assert.strictEqual(LogoManager._h, 150, '_syncDimensions must sync _h to Math.round(300 / 2.0) = 150');

  console.log('All LogoManager aspect ratio and gap elimination tests PASSED!');
}

runTests();
