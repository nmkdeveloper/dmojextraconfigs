/**
 * Test AC Easter Egg detection logic against real DMOJ HTML sample (D:\Temps\6\index.html)
 */

const fs = require('fs');
const assert = require('assert');

const htmlContent = fs.readFileSync('D:/Temps/6/index.html', 'utf8');

// Load ACEasterEgg logic
const { ACEasterEgg } = require('../content/modules/ac_easter_egg.js');

function runTests() {
  console.log('Testing AC Easter Egg detection on real DMOJ sample...');

  // 1. Verify Submission Page detection
  const isSubPage = ACEasterEgg.detectSubmissionPage(htmlContent, 'https://csoj.edu.vn/submission/64292');
  assert.strictEqual(isSubPage, true, 'D:\\Temps\\6\\index.html must be identified as submission page');

  // 2. Verify Overall AC Status
  const isAC = ACEasterEgg.detectOverallAC(htmlContent);
  assert.strictEqual(isAC, true, 'D:\\Temps\\6\\index.html has 20/20 AC cases, must return true');

  // 3. Verify Non-AC detection on synthetic failure snippet
  const failedHtml = htmlContent.replace('class="case-AC"', 'class="case-WA"');
  const isFailAC = ACEasterEgg.detectOverallAC(failedHtml);
  assert.strictEqual(isFailAC, false, 'Modified HTML with WA must return false');

  console.log('AC Easter Egg detection tests PASSED.');
}

try {
  runTests();
} catch (e) {
  console.error('AC Detection test FAILED:', e);
  process.exit(1);
}
