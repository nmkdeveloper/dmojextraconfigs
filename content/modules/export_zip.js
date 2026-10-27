/**
 * NMK Developer DMOJ-based Extra Configs - Export ZIP
 * Scrapes and compresses the current page (HTML, CSS, assets) into a downloadable ZIP archive.
 */

const ExportZIP = {
  el: {},
  MAX_FILES: 3000,
  MAX_BYTES: 500 * 1024 * 1024,
  CONCURRENCY: 5,

  async init() {
    this._build();
  },

  _build() {
    this.el.toggle = Dock.addButton('export-toggle', 'archive', '#10b981', '#059669', 'Export ZIP', () => this._toggle());
    const ref = PanelFactory.create({
      id: 'export-panel', title: 'Export ZIP', iconSvg: svg('archive', 16),
      width: '300px', height: 'auto', toggleBtn: this.el.toggle,
      bodyHTML: `
        <div class="exp-desc">Tải toàn bộ trang (HTML, CSS, JS, images) dưới dạng file ZIP.</div>
        <button class="csoj-btn csoj-btn-success exp-btn" style="padding:12px;">${svg('download', 14)} Download ZIP</button>
        <div class="exp-progress"><div class="exp-bar"></div></div>
        <div class="csoj-status exp-status"></div>
      `,
    });

    const b = ref.body;
    Object.assign(this.el, {
      ...ref,
      btn: b.querySelector('.exp-btn'),
      status: b.querySelector('.exp-status'),
      bar: b.querySelector('.exp-bar'),
    });

    this.el.btn.addEventListener('click', () => this._start());
  },

  _setStatus(m, c = '') {
    this.el.status.textContent = m;
    this.el.status.className = 'csoj-status exp-status' + (c ? ' ' + c : '');
  },

  _progress(p) {
    this.el.bar.style.width = (p * 100) + '%';
  },

  _toggle() { this.el.isOpen() ? this.el.close() : this.el.open(); },

  async _start() {
    if (this.el.btn.disabled) return;
    if (typeof fflate === 'undefined') {
      this._setStatus('Lỗi: Thư viện fflate chưa tải xong', 'err');
      return;
    }

    this.el.btn.disabled = true;
    this._setStatus('Đang thu thập...', '');
    this._progress(0);

    try {
      const base = location.origin;
      const files = {};
      let total = 0;
      const maxB = this.MAX_BYTES, maxF = this.MAX_FILES, conc = this.CONCURRENCY;

      const html = document.documentElement.outerHTML;
      files['index.html'] = new TextEncoder().encode(html);
      total += files['index.html'].length;

      const urls = new Set();
      const addUrl = (u) => {
        if (!u || u.startsWith('data:') || u.startsWith('javascript:') || u.startsWith('#')) return;
        try {
          const abs = new URL(u, location.href).href;
          if (abs.startsWith(base)) urls.add(abs);
        } catch {}
      };

      document.querySelectorAll('link[href], script[src], img[src], source[src], video[poster], audio[src], iframe[src]').forEach(el => {
        const u = el.getAttribute('href') || el.getAttribute('src') || el.getAttribute('poster');
        if (u) addUrl(u);
      });

      document.querySelectorAll('style').forEach(s => {
        const re = /url\(['"]?([^'")]+)['"]?\)/g;
        let m;
        while ((m = re.exec(s.textContent))) addUrl(m[1]);
      });

      const queue = [...urls];
      const fetched = new Set();
      let idx = 0, done = 0;

      const fetchOne = async (url) => {
        if (fetched.has(url)) return;
        fetched.add(url);
        try {
          const res = await fetch(url);
          if (!res.ok) return;
          const ct = res.headers.get('content-type') || '';
          const buf = await res.arrayBuffer();
          if (total + buf.byteLength > maxB) return;
          total += buf.byteLength;
          const path = url.replace(base + '/', '').split('?')[0] || 'index.html';
          files[path] = new Uint8Array(buf);
          if (ct.includes('text/css')) {
            const text = new TextDecoder().decode(buf);
            const re = /url\(['"]?([^'")]+)['"]?\)/g;
            let m;
            while ((m = re.exec(text))) {
              try {
                const abs = new URL(m[1], url).href;
                if (abs.startsWith(base) && !fetched.has(abs) && !queue.includes(abs)) queue.push(abs);
              } catch {}
            }
          }
        } catch (e) {
          LOG.warn('Export: fail', url, e);
        }
      };

      const workers = Array.from({ length: conc }, async () => {
        while (idx < queue.length) {
          if (total > maxB || Object.keys(files).length > maxF) break;
          const url = queue[idx++];
          await fetchOne(url);
          done++;
          this._progress(done / queue.length);
          this._setStatus(`Đang tải ${done}/${queue.length}...`, '');
        }
      });

      await Promise.all(workers);
      this._setStatus('Đang nén ZIP...', '');
      this._progress(1);

      const zipped = fflate.zipSync(files, { level: 6 });
      const blob = new Blob([zipped], { type: 'application/zip' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `dmoj-export-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.zip`;
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        URL.revokeObjectURL(a.href);
        a.remove();
      }, 1000);

      this._setStatus(`✓ Đã tải (${(total / 1024 / 1024).toFixed(1)} MB)`, 'ok');
      setTimeout(() => this._setStatus(''), 4000);
    } catch (e) {
      LOG.err('Export error:', e);
      this._setStatus('Lỗi: ' + e.message, 'err');
    } finally {
      this.el.btn.disabled = false;
      this._progress(0);
    }
  },
};

if (typeof window !== 'undefined') {
  window.ExportZIP = ExportZIP;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ExportZIP };
}
