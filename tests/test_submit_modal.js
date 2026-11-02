const assert = require('assert');

// Mock browser environment
let mockLocation = {
  pathname: '/problem/b_chanle/',
  href: 'https://csoj.edu.vn/problem/b_chanle/',
  origin: 'https://csoj.edu.vn'
};
global.location = mockLocation;

const mockElements = new Map();
global.document = {
  body: {
    classList: {
      add(c) { this._classes.add(c); },
      remove(c) { this._classes.delete(c); },
      has(c) { return this._classes.has(c); },
      _classes: new Set()
    },
    appendChild(el) { mockElements.set(el.id, el); return el; }
  },
  documentElement: {
    classList: {
      add(c) { this._classes.add(c); },
      remove(c) { this._classes.delete(c); },
      has(c) { return this._classes.has(c); },
      _classes: new Set()
    }
  },
  title: 'Số chẵn lẻ - CSOJ: CS Online Judge',
  getElementById(id) {
    return mockElements.get(id) || null;
  },
  querySelector(sel) {
    if (sel.includes('h2')) return { textContent: 'Số chẵn lẻ' };
    return null;
  },
  createElement(tag) {
    const el = {
      tagName: tag.toUpperCase(),
      id: '',
      className: '',
      dataset: {},
      style: {},
      children: [],
      classList: {
        _set: new Set(),
        add(c) { this._set.add(c); el.className = Array.from(this._set).join(' '); },
        remove(c) { this._set.delete(c); el.className = Array.from(this._set).join(' '); },
        contains(c) { return this._set.has(c); }
      },
      setAttribute(k, v) { this[k] = v; },
      getAttribute(k) { return this[k]; },
      appendChild(child) {
        this.children.push(child);
        child.parentNode = this;
        return child;
      },
      insertBefore(newNode, refNode) {
        const idx = this.children.indexOf(refNode);
        if (idx >= 0) this.children.splice(idx, 0, newNode);
        else this.children.push(newNode);
        newNode.parentNode = this;
      },
      remove() {
        if (this.parentNode) {
          const idx = this.parentNode.children.indexOf(this);
          if (idx >= 0) this.parentNode.children.splice(idx, 1);
          this.parentNode = null;
        }
      },
      querySelector(sel) {
        if (sel === '#csoj-submit-modal') return mockElements.get('csoj-submit-modal') || this;
        if (sel === '#csoj-submit-modal-body') return mockElements.get('csoj-submit-modal-body') || this;
        if (sel === '#csoj-submit-title-text') return { textContent: '' };
        if (sel === '#csoj-submit-status') return { textContent: '', className: '' };
        if (sel === '#csoj-submit-anim-overlay') {
          return {
            classList: {
              _set: new Set(['hidden']),
              add(c) { this._set.add(c); },
              remove(c) { this._set.delete(c); }
            },
            querySelector() { return { textContent: '', innerHTML: '' }; }
          };
        }
        if (sel === '#csoj-submit-modal-close') return { addEventListener() {} };
        if (sel === '#id_language') {
          return {
            selectedIndex: 0,
            options: [{ getAttribute: (k) => k === 'data-fileonly' ? 'False' : null }]
          };
        }
        if (sel === 'textarea#id_source') return { value: '#include <iostream>' };
        if (sel.startsWith('.')) {
          const cls = sel.slice(1);
          const findChild = (node) => {
            if (node.classList && node.classList.contains && node.classList.contains(cls)) return node;
            if (node.className && node.className.includes(cls)) return node;
            for (const child of node.children || []) {
              const res = findChild(child);
              if (res) return res;
            }
            return null;
          };
          return findChild(this);
        }
        return null;
      },
      addEventListener() {}
    };
    return el;
  },
  createComment(text) {
    return { nodeType: 8, textContent: text, parentNode: null, remove() {
      if (this.parentNode) {
        const idx = this.parentNode.children.indexOf(this);
        if (idx >= 0) this.parentNode.children.splice(idx, 1);
      }
    }};
  },
  addEventListener() {}
};

global.window = {
  location: mockLocation,
  addEventListener() {}
};

global.svg = (name, size) => `<svg name="${name}" size="${size}"></svg>`;

// Load SubmitModal
const { SubmitModal } = require('../content/modules/submit_modal.js');

async function runTests() {
  console.log('Testing SubmitModal module...');

  // 1. Link matching tests
  assert.strictEqual(
    SubmitModal._isProblemSubmitLink({ getAttribute: () => '/problem/b_chanle/submit' }),
    true,
    'Should match /problem/b_chanle/submit'
  );
  assert.strictEqual(
    SubmitModal._isProblemSubmitLink({ getAttribute: () => '/contest/qg2026/problem/it_times/submit' }),
    true,
    'Should match contest problem submit link'
  );
  assert.strictEqual(
    SubmitModal._isProblemSubmitLink({ getAttribute: () => '/problem/b_chanle/resubmit/12345/submit' }),
    true,
    'Should match resubmit submit link'
  );
  assert.strictEqual(
    SubmitModal._isProblemSubmitLink({ getAttribute: () => '#submit' }),
    true,
    'Should match #submit hash link'
  );
  assert.strictEqual(
    SubmitModal._isProblemSubmitLink({ getAttribute: () => '/accounts/logout/' }),
    false,
    'Should reject logout'
  );
  assert.strictEqual(
    SubmitModal._isProblemSubmitLink({ getAttribute: () => '/problem/b_chanle/submissions/' }),
    false,
    'Should reject submissions list'
  );

  // 2. Problem title extraction
  const title = SubmitModal._getProblemTitle();
  assert.strictEqual(title, 'Số chẵn lẻ', 'Should extract problem title correctly');

  // 3. Build modal
  SubmitModal._buildModal();
  assert.strictEqual(SubmitModal._overlay !== null, true, 'Modal overlay must be built');
  assert.strictEqual(SubmitModal._modal !== null, true, 'Modal window must be built');

  // 4. Open with existing form in page
  const fakeAceWidget = {
    className: 'django-ace-widget',
    style: {
      setProperty(k, v) { this[k] = v; },
      removeProperty(k) { delete this[k]; }
    },
    parentNode: null,
    offsetHeight: 440,
    closest(sel) { return sel === '.django-ace-editor' ? this.parentNode : null; }
  };
  const fakeEditorContainer = {
    className: 'django-ace-editor',
    children: [fakeAceWidget],
    parentNode: null,
    insertBefore(newNode, refNode) {
      this.children.push(newNode);
      newNode.parentNode = this;
    },
    appendChild(newNode) {
      this.children.push(newNode);
      newNode.parentNode = this;
    }
  };
  fakeAceWidget.parentNode = fakeEditorContainer;

  const fakeSelect2 = {
    className: 'select2 select2-container',
    style: {
      setProperty(k, v) { this[k] = v; },
      removeProperty(k) { delete this[k]; }
    }
  };

  const fakeParent = {
    children: [],
    insertBefore(newNode, refNode) {
      const idx = this.children.indexOf(refNode);
      if (idx >= 0) this.children.splice(idx, 0, newNode);
      else this.children.push(newNode);
      newNode.parentNode = this;
    }
  };

  const fakeForm = {
    id: 'problem_submit',
    parentNode: fakeParent,
    dataset: {},
    children: [fakeEditorContainer, fakeSelect2],
    appendChild(newNode) {
      this.children.push(newNode);
      newNode.parentNode = this;
      return newNode;
    },
    insertBefore(newNode, refNode) {
      const idx = this.children.indexOf(refNode);
      if (idx >= 0) this.children.splice(idx, 0, newNode);
      else this.children.push(newNode);
      newNode.parentNode = this;
    },
    querySelector: (sel) => {
      if (sel === '.django-ace-widget') return fakeAceWidget;
      if (sel === '#id_language') return { selectedIndex: 0, options: [{ getAttribute: () => 'False' }] };
      if (sel === 'textarea#id_source') return { value: 'int main() {}' };
      if (sel.startsWith('.')) {
        const cls = sel.slice(1);
        const findChild = (node) => {
          if (node.classList && node.classList.contains && node.classList.contains(cls)) return node;
          if (node.className && node.className.includes(cls)) return node;
          for (const child of node.children || []) {
            const res = findChild(child);
            if (res) return res;
          }
          return null;
        };
        return findChild(fakeForm);
      }
      return null;
    },
    querySelectorAll: (sel) => {
      if (sel.includes('.select2')) return [fakeSelect2];
      return [];
    },
    addEventListener() {}
  };
  fakeEditorContainer.parentNode = fakeForm;
  fakeParent.children.push(fakeForm);
  mockElements.set('problem_submit', fakeForm);

  // Set csoj-page-exiting to test if open() clears it
  document.documentElement.classList.add('csoj-page-exiting');

  await SubmitModal.open('/problem/b_chanle/submit');
  assert.strictEqual(SubmitModal._isOpen, true, 'Modal should be marked open');
  assert.strictEqual(document.body.classList.has('csoj-modal-open'), true, 'Body should have csoj-modal-open');
  assert.strictEqual(document.documentElement.classList.has('csoj-page-exiting'), false, 'open() must clear csoj-page-exiting');
  assert.strictEqual(fakeAceWidget.style.height, '440px', 'Ace widget height should be set to 440px');
  assert.strictEqual(fakeSelect2.style.width, '100%', 'Select2 container width must be set to 100%');

  // Verify drag handle exists
  const handle = SubmitModal._overlay.querySelector('.csoj-editor-resize-handle') ||
                 fakeEditorContainer.children.find(c => c.className === 'csoj-editor-resize-handle');
  assert.strictEqual(!!handle, true, 'Resize handle should be created');

  // Test dragging handle downwards
  if (handle && handle.onpointerdown) {
    handle.onpointerdown({ preventDefault() {}, clientY: 100 });
    // Trigger move event added to window
    // (pointer down recorded startH = 440, startY = 100)
  }

  // Set csoj-page-exiting again to test close()
  document.documentElement.classList.add('csoj-page-exiting');

  // 5. Close modal restores placeholder and cleans up
  SubmitModal.close();
  assert.strictEqual(SubmitModal._isOpen, false, 'Modal should be closed');
  assert.strictEqual(document.body.classList.has('csoj-modal-open'), false, 'Body class should be removed');
  assert.strictEqual(document.documentElement.classList.has('csoj-page-exiting'), false, 'close() must clear csoj-page-exiting');
  assert.strictEqual(fakeAceWidget.style.height, undefined, 'Ace widget inline height should be removed on close');

  // 6. CSS verification for overflow-x: hidden, resize handles, and tab submit removal
  const fs = require('fs');
  const path = require('path');
  const css = fs.readFileSync(path.join(__dirname, '../content/content.css'), 'utf8');
  assert.strictEqual(css.includes('overflow-x: hidden !important'), true, 'content.css must include overflow-x: hidden for modal body');
  assert.strictEqual(css.includes('resize: vertical !important'), true, 'content.css must include resize: vertical for Ace widget');
  assert.strictEqual(css.includes('.csoj-editor-resize-handle'), true, 'content.css must include .csoj-editor-resize-handle');
  assert.strictEqual(css.includes('#submit.tab-content'), true, 'content.css must target #submit.tab-content');
  assert.strictEqual(/#submit\.tab-content\s*\{[^}]*display:\s*none\s*!important/i.test(css), true, '#submit.tab-content must be display: none !important');
  assert.strictEqual(/#comments\.tab-content\s*\{[^}]*display:\s*block\s*!important/i.test(css), true, '#comments.tab-content must be display: block !important');
  assert.strictEqual(css.includes('.problem-tabs'), true, 'content.css must target .problem-tabs');

  // 7. Test _activateCommentsByDefault()
  const fakeSubmitTab = {
    id: 'submit',
    classList: {
      _classes: new Set(['active']),
      remove(c) { this._classes.delete(c); },
      add(c) { this._classes.add(c); },
      contains(c) { return this._classes.has(c); }
    }
  };
  const fakeCommentsTab = {
    id: 'comments',
    classList: {
      _classes: new Set(),
      remove(c) { this._classes.delete(c); },
      add(c) { this._classes.add(c); },
      contains(c) { return this._classes.has(c); }
    }
  };
  mockElements.set('submit', fakeSubmitTab);
  mockElements.set('comments', fakeCommentsTab);

  SubmitModal._activateCommentsByDefault();
  assert.strictEqual(fakeSubmitTab.classList.contains('active'), false, '#submit tab must have active class removed');
  assert.strictEqual(fakeCommentsTab.classList.contains('active'), true, '#comments tab must have active class added');

  console.log('All SubmitModal unit tests PASSED successfully!');
}

runTests().catch(err => {
  console.error('Test FAILED:', err);
  process.exit(1);
});
