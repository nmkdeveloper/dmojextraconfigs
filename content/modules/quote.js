/**
 * NMK Developer DMOJ-based Extra Configs - Quote Card
 * Draggable, markdown & LaTeX enabled quote card with offline MathJax rendering.
 */

const MathJaxBridge = {
  _iframe: null,
  _ready: null,
  _resolvers: {},
  _reqId: 0,

  init() {
    if (this._iframe) return;
    try {
      const runnerUrl = typeof chrome !== 'undefined' && chrome.runtime?.getURL
        ? chrome.runtime.getURL('libs/mathjax/mathjax-runner.html')
        : '';

      const f = document.createElement('iframe');
      f.id = 'nmk-mj-runner';
      f.style.cssText = 'position:fixed;left:-99999px;top:0;width:1px;height:1px;border:0;pointer-events:none;';
      f.setAttribute('aria-hidden', 'true');
      f.setAttribute('tabindex', '-1');

      if (runnerUrl) {
        f.src = runnerUrl;
      }

      window.addEventListener('message', (e) => {
        const data = e.data;
        if (!data) return;
        if (data.type === 'MJ_READY' && this._resolveReady) {
          this._resolveReady();
        } else if (data.type === 'MJ_RESULT' && this._resolvers[data.id]) {
          this._resolvers[data.id](data.html);
          delete this._resolvers[data.id];
        }
      });

      this._ready = new Promise((resolve) => {
        this._resolveReady = resolve;
        setTimeout(resolve, 4000); // safety fallback timeout
      });

      (document.body || document.documentElement).appendChild(f);
      this._iframe = f;
    } catch (e) {
      console.warn('[MathJaxBridge] Could not init iframe:', e);
    }
  },

  async render(html) {
    if (!this._iframe) this.init();
    if (!html || (!html.includes('$') && !html.includes('\\(') && !html.includes('\\['))) {
      return html;
    }

    try {
      await this._ready;
      if (!this._iframe || !this._iframe.contentWindow) return html;

      const id = ++this._reqId;
      return new Promise((resolve) => {
        this._resolvers[id] = resolve;
        this._iframe.contentWindow.postMessage({ type: 'MJ_RENDER', id, html }, '*');
        setTimeout(() => {
          if (this._resolvers[id]) {
            resolve(html);
            delete this._resolvers[id];
          }
        }, 3000);
      });
    } catch {
      return html;
    }
  }
};

const Quote = {
  el: {},
  _token: 0,

  async init() {
    this._build();
    await this._renderDisplay();
  },

  _build() {
    this.el.toggle = Dock.addButton('qcard-toggle', 'message', '#3b82f6', '#2563eb', 'Quote card', () => {
      MathJaxBridge.init();
      this._toggleEditor();
    });

    this.el.display = document.createElement('div');
    this.el.display.id = 'qcard-display';
    this.el.display.setAttribute('data-csoj-ui', '1');
    this.el.display.addEventListener('click', () => {
      MathJaxBridge.init();
      this._openEditor();
    });
    Dock.panels.appendChild(this.el.display);

    const ref = PanelFactory.create({
      id: 'qcard-editor', title: 'Quote Card', iconSvg: svg('message', 16),
      width: '380px', height: 'auto', toggleBtn: this.el.toggle,
      bodyHTML: `
        <textarea class="csoj-textarea qcard-textarea" placeholder="Markdown & LaTeX equations ($x$, $$x^2$$)..." rows="4"></textarea>
        <div class="qcard-label">Preview</div>
        <div class="qcard-preview"></div>
        <div style="display:flex;gap:6px;">
          <button class="csoj-btn csoj-btn-primary qcard-save" style="flex:1;">${svg('check', 12)} Save</button>
          <button class="csoj-btn csoj-btn-danger qcard-delete">${svg('trash', 12)} Delete</button>
        </div>
      `,
    });

    const b = ref.body;
    Object.assign(this.el, {
      ...ref,
      textarea: b.querySelector('.qcard-textarea'),
      preview: b.querySelector('.qcard-preview'),
      saveBtn: b.querySelector('.qcard-save'),
      deleteBtn: b.querySelector('.qcard-delete'),
    });

    this._bind();
    this.el.textarea.value = SiteStore.get('quote') || '';
  },

  _debounce(fn, ms) {
    let t;
    return (...a) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...a), ms);
    };
  },

  _bind() {
    this.el.textarea.addEventListener('input', this._debounce(() => this._updatePreview(), 250));
    this.el.saveBtn.addEventListener('click', async () => {
      await SiteStore.set('quote', this.el.textarea.value.trim());
      this.el.close();
      this._renderDisplay();
    });
    this.el.deleteBtn.addEventListener('click', async () => {
      await SiteStore.set('quote', '');
      this.el.textarea.value = '';
      this.el.preview.innerHTML = '';
      this.el.close();
      this.el.display.classList.remove('visible');
    });
  },

  _escapeHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  },

  _md(text) {
    if (!text) return '';
    const st = [];
    const prot = s => { st.push(s); return `\u0000M${st.length - 1}\u0000`; };
    const src = text
      .replace(/\$\$([\s\S]+?)\$\$/g, (_, i) => prot(`$$${i}$$`))
      .replace(/\\\[([\s\S]+?)\\\]/g, (_, i) => prot(`\\[${i}\\]`))
      .replace(/(?<![\\$])\$(?!\$)([^$\n]+?)\$(?!\$)/g, (_, i) => prot(`$${i}$`))
      .replace(/\\\(([\s\S]+?)\\\)/g, (_, i) => prot(`\\(${i}\\)`));

    let h;
    try {
      if (typeof marked !== 'undefined' && marked.parse) {
        h = marked.parse(src, { breaks: true, gfm: true });
      } else {
        h = this._escapeHtml(src);
      }
    } catch {
      h = this._escapeHtml(src);
    }
    return h.replace(/\u0000M(\d+)\u0000/g, (_, i) => st[+i]);
  },

  async _enhance(el, html, tok) {
    try {
      const r = await MathJaxBridge.render(html);
      if (tok === this._token && el.isConnected) {
        el.innerHTML = r;
      }
    } catch {}
  },

  async _renderDisplay() {
    const q = SiteStore.get('quote') || '';
    if (!q.trim()) {
      this.el.display.classList.remove('visible');
      return;
    }
    const tok = ++this._token;
    const h = this._md(q);
    this.el.display.innerHTML = h;
    this.el.display.classList.add('visible');
    await this._enhance(this.el.display, h, tok);
  },

  async _updatePreview() {
    const tok = ++this._token;
    const h = this._md(this.el.textarea.value);
    this.el.preview.innerHTML = h;
    await this._enhance(this.el.preview, h, tok);
  },

  _toggleEditor() { this.el.isOpen() ? this._closeEditor() : this._openEditor(); },
  _openEditor() {
    this.el.display.classList.remove('visible');
    this.el.open();
    this.el.textarea.value = SiteStore.get('quote') || '';
    this._updatePreview();
    setTimeout(() => this.el.textarea.focus(), 50);
  },
  _closeEditor() {
    this.el.close();
    this._renderDisplay();
  },
};

if (typeof window !== 'undefined') {
  window.Quote = Quote;
  window.MathJaxBridge = MathJaxBridge;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Quote, MathJaxBridge };
}
