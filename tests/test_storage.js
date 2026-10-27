// Test suite for SiteStore (Per-Site Storage Isolation)
const assert = require('assert');

// Mock chrome.storage.local for Node.js test environment
const mockStorageData = {};
global.chrome = {
  storage: {
    local: {
      get: async (keys) => {
        if (!keys) return { ...mockStorageData };
        if (typeof keys === 'string') return { [keys]: mockStorageData[keys] };
        if (Array.isArray(keys)) {
          const res = {};
          keys.forEach(k => { if (k in mockStorageData) res[k] = mockStorageData[k]; });
          return res;
        }
        const res = {};
        for (const [k, def] of Object.entries(keys)) {
          res[k] = k in mockStorageData ? mockStorageData[k] : def;
        }
        return res;
      },
      set: async (obj) => {
        Object.assign(mockStorageData, obj);
      },
      remove: async (keys) => {
        const arr = Array.isArray(keys) ? keys : [keys];
        arr.forEach(k => delete mockStorageData[k]);
      }
    }
  }
};

// Mock location.hostname
global.location = { hostname: 'csoj.edu.vn' };

// Load SiteStore
const { SiteStore } = require('../content/storage.js');

async function runTests() {
  console.log('Running SiteStore unit tests...');

  // Step 1: Initialize on csoj.edu.vn
  global.location.hostname = 'csoj.edu.vn';
  await SiteStore.init();

  // Test setting and getting
  await SiteStore.set('quote', 'Hello CSOJ');
  await SiteStore.set('logo_w', 50);
  assert.strictEqual(SiteStore.get('quote'), 'Hello CSOJ');
  assert.strictEqual(SiteStore.get('logo_w'), 50);

  // Check underlying storage key
  const storedCsoj = await chrome.storage.local.get('nmkdeveloperdmojbasedextraconfigs_csoj.edu.vn_quote');
  assert.strictEqual(storedCsoj['nmkdeveloperdmojbasedextraconfigs_csoj.edu.vn_quote'], 'Hello CSOJ');

  // Step 2: Switch to oj.vnoi.info - ensure isolation
  global.location.hostname = 'oj.vnoi.info';
  await SiteStore.init();

  // On VNOJ, quote should be undefined or default, NOT 'Hello CSOJ'
  assert.strictEqual(SiteStore.get('quote', 'Default VNOJ'), 'Default VNOJ');
  await SiteStore.set('quote', 'Hello VNOJ');
  assert.strictEqual(SiteStore.get('quote'), 'Hello VNOJ');

  // Verify CSOJ data was untouched
  const checkCsoj = await chrome.storage.local.get('nmkdeveloperdmojbasedextraconfigs_csoj.edu.vn_quote');
  assert.strictEqual(checkCsoj['nmkdeveloperdmojbasedextraconfigs_csoj.edu.vn_quote'], 'Hello CSOJ');

  // Step 3: Test deletion
  await SiteStore.del('quote');
  assert.strictEqual(SiteStore.get('quote', 'gone'), 'gone');
  const checkVnoi = await chrome.storage.local.get('nmkdeveloperdmojbasedextraconfigs_oj.vnoi.info_quote');
  assert.strictEqual(checkVnoi['nmkdeveloperdmojbasedextraconfigs_oj.vnoi.info_quote'], undefined);

  // Step 4: Test Global settings
  await SiteStore.setGlobal('domains', ['csoj.edu.vn', 'oj.vnoi.info']);
  const globalVal = await SiteStore.getGlobal('domains');
  assert.deepStrictEqual(globalVal, ['csoj.edu.vn', 'oj.vnoi.info']);

  console.log('All SiteStore unit tests PASSED successfully.');
}

runTests().catch(err => {
  console.error('Test FAILED:', err);
  process.exit(1);
});
