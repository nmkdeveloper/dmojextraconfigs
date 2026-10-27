/**
 * NMK Developer DMOJ-based Extra Configs - Dock & Panel Engine
 * Manages floating dock, tools bar, and draggable/resizable panels.
 */

const SVG = {
  sparkles: '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/>',
  palette: '<circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>',
  image: '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
  message: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  network: '<rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/>',
  timer: '<line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/>',
  gamepad: '<line x1="6" x2="10" y1="11" y2="11"/><line x1="8" x2="8" y1="9" y2="13"/><line x1="15" x2="15.01" y1="12" y2="12"/><line x1="18" x2="18.01" y1="10" y2="10"/><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"/>',
  archive: '<rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>',
  rotateCcw: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
  zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  grid: '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
  dice: '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M16 8h.01"/><path d="M8 8h.01"/><path d="M8 16h.01"/><path d="M16 16h.01"/><path d="M12 12h.01"/>',
  play: '<polygon points="6 3 20 12 6 21 6 3"/>',
  pause: '<rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/>',
  skip: '<polygon points="5 4 15 12 5 20 5 4"/><line x1="19" x2="19" y1="5" y2="19"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  undo: '<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>',
  volume: '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>',
  volumeOff: '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="22" x2="16" y1="9" y2="15"/><line x1="16" x2="22" y1="9" y2="15"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  unlock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>',
};

const svg = (name, size = 18, sw = 2) => {
  const p = SVG[name];
  if (!p) return '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;flex-shrink:0;">${p}</svg>`;
};

const LOG = (() => {
  const P = '[DMOJ Toolkit]';
  const S = {
    info: 'color:#818cf8;font-weight:600',
    ok: 'color:#34d399;font-weight:600',
    warn: 'color:#fbbf24;font-weight:600',
    err: 'color:#f87171;font-weight:600',
    debug: 'color:#9ca3af'
  };
  return {
    info: (...a) => console.log(`%c${P}`, S.info, ...a),
    ok: (...a) => console.log(`%c${P}`, S.ok, ...a),
    warn: (...a) => console.warn(`%c${P}`, S.warn, ...a),
    err: (...a) => console.error(`%c${P}`, S.err, ...a),
    debug: (...a) => console.debug(`%c${P}`, S.debug, ...a),
    group: (l) => console.group(`%c${P} ${l}`, S.info),
    groupEnd: () => console.groupEnd(),
  };
})();

const Dock = {
  root: null,
  tools: null,
  main: null,
  panels: null,
  _open: false,

  build() {
    if (typeof location !== 'undefined' && /\/raw(\/|$|\?|#)/i.test(location.pathname + location.search)) return;
    if (document.getElementById('csoj-dock')) return;

    this.root = document.createElement('div');
    this.root.id = 'csoj-dock';
    this.root.setAttribute('data-csoj-ui', '1');

    this.tools = document.createElement('div');
    this.tools.id = 'csoj-dock-tools';
    this.root.appendChild(this.tools);

    this.main = document.createElement('button');
    this.main.id = 'csoj-dock-main';
    this.main.title = 'DMOJ Toolkit';
    this.main.innerHTML = svg('sparkles', 24);
    this.main.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleTools();
    });
    this.root.appendChild(this.main);

    document.body.appendChild(this.root);

    this.panels = document.createElement('div');
    this.panels.id = 'csoj-dock-panels';
    this.panels.setAttribute('data-csoj-ui', '1');
    document.body.appendChild(this.panels);

    document.addEventListener('click', (e) => {
      if (this._open && !this.root.contains(e.target)) {
        this.closeTools();
      }
    });
  },

  addButton(id, iconName, colorA, colorB, tooltip, onClick) {
    const b = document.createElement('button');
    b.id = id;
    b.className = 'csoj-dock-btn';
    b.title = tooltip || '';
    b.style.background = `linear-gradient(135deg, ${colorA}, ${colorB})`;
    b.innerHTML = `${svg(iconName, 20)}<span class="csoj-badge"></span>`;
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeTools();
      onClick();
    });
    this.tools.appendChild(b);
    return b;
  },

  addPanel(p) {
    if (!p.hasAttribute('data-csoj-ui')) p.setAttribute('data-csoj-ui', '1');
    this.panels.appendChild(p);
  },

  setActive(b, on) {
    if (b) b.classList.toggle('active', !!on);
  },

  toggleTools() {
    this._open = !this._open;
    this.tools.classList.toggle('open', this._open);
    this.main.classList.toggle('open', this._open);
  },

  closeTools() {
    if (!this._open) return;
    this._open = false;
    this.tools.classList.remove('open');
    this.main.classList.remove('open');
  },
};

const PanelFactory = {
  _escBound: false,
  _panels: [],

  _bindEsc() {
    if (this._escBound) return;
    this._escBound = true;
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this._panels.slice().forEach((p) => {
          if (p.isOpen()) p.close();
        });
      }
    });
  },

  _overlap(a, b) {
    return !(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y);
  },

  _getRects() {
    const rects = [];
    document.querySelectorAll('.csoj-panel.open, #qcard-display.visible').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) rects.push({ x: r.left, y: r.top, w: r.width, h: r.height });
    });
    return rects;
  },

  _findSlot(w, h) {
    const P = { PADDING: 20, GAP: 14, DOCK_OFFSET: 84, CASCADE_STEP: 30 };
    const bx = window.innerWidth - w - P.PADDING;
    const by = window.innerHeight - h - P.DOCK_OFFSET;
    const rects = this._getRects();
    const free = (x, y) => {
      if (x < P.PADDING || y < P.PADDING) return false;
      const r = { x, y, w, h };
      return !rects.some((o) => this._overlap(r, o));
    };
    for (let i = 0; i < 20; i++) {
      const x = bx - i * P.CASCADE_STEP, y = by - i * P.CASCADE_STEP;
      if (free(x, y)) return { x, y };
    }
    for (let i = 1; i < 12; i++) {
      const x = bx - i * (w + P.GAP);
      if (free(x, by)) return { x, y: by };
    }
    for (let i = 1; i < 12; i++) {
      const y = by - i * (h + P.GAP);
      if (free(bx, y)) return { x: bx, y };
    }
    return { x: bx, y: by };
  },

  _save(panel, key) {
    if (typeof SiteStore !== 'undefined') {
      SiteStore.set(key, {
        x: parseFloat(panel.style.left) || panel.offsetLeft,
        y: parseFloat(panel.style.top) || panel.offsetTop,
        w: panel.offsetWidth,
        h: panel.offsetHeight,
      });
    }
  },

  _drag(panel, header, key) {
    let d = false, ox = 0, oy = 0;
    header.addEventListener('mousedown', (e) => {
      if (e.target.closest('.csoj-panel-close, .csoj-panel-resize')) return;
      if (e.button !== 0) return;
      d = true;
      panel.classList.add('dragging');
      const r = panel.getBoundingClientRect();
      ox = e.clientX - r.left;
      oy = e.clientY - r.top;
      e.preventDefault();
    });
    document.addEventListener('mousemove', (e) => {
      if (!d) return;
      panel.style.left = Math.max(0, Math.min(window.innerWidth - 100, e.clientX - ox)) + 'px';
      panel.style.top = Math.max(0, Math.min(window.innerHeight - 50, e.clientY - oy)) + 'px';
    });
    document.addEventListener('mouseup', () => {
      if (!d) return;
      d = false;
      panel.classList.remove('dragging');
      this._save(panel, key);
    });
  },

  _resize(panel, handle, key) {
    let r = false, sx = 0, sy = 0, sw = 0, sh = 0;
    handle.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      r = true;
      panel.classList.add('resizing');
      sx = e.clientX;
      sy = e.clientY;
      sw = panel.offsetWidth;
      sh = panel.offsetHeight;
      e.preventDefault();
      e.stopPropagation();
    });
    document.addEventListener('mousemove', (e) => {
      if (!r) return;
      const P = { MIN_WIDTH: 260, MIN_HEIGHT: 150, PADDING: 20 };
      const x = parseFloat(panel.style.left) || 0, y = parseFloat(panel.style.top) || 0;
      const mw = Math.max(P.MIN_WIDTH, window.innerWidth - x - P.PADDING);
      const mh = Math.max(P.MIN_HEIGHT, window.innerHeight - y - P.PADDING);
      panel.style.width = Math.max(P.MIN_WIDTH, Math.min(mw, sw + (e.clientX - sx))) + 'px';
      panel.style.height = Math.max(P.MIN_HEIGHT, Math.min(mh, sh + (e.clientY - sy))) + 'px';
    });
    document.addEventListener('mouseup', () => {
      if (!r) return;
      r = false;
      panel.classList.remove('resizing');
      this._save(panel, key);
    });
  },

  create({ id, title, iconSvg = '', width, height, bodyHTML, toggleBtn, beforeClose }) {
    this._bindEsc();
    const storageKey = `layout_${id}`;
    const panel = document.createElement('div');
    panel.id = id;
    panel.className = 'csoj-panel';
    panel.setAttribute('data-csoj-ui', '1');
    panel.innerHTML = `
      <div class="csoj-panel-header">
        <span class="csoj-panel-title">${iconSvg}${title}</span>
        <span class="csoj-panel-close" title="Close">${svg('x', 14)}</span>
      </div>
      <div class="csoj-panel-body">${bodyHTML}</div>
      <div class="csoj-panel-resize" title="Resize"></div>
    `;

    const body = panel.querySelector('.csoj-panel-body');
    const closeBtn = panel.querySelector('.csoj-panel-close');
    const header = panel.querySelector('.csoj-panel-header');
    const resizeHandle = panel.querySelector('.csoj-panel-resize');

    const layout = () => {
      if (panel.dataset.layout === '1') return;
      panel.dataset.layout = '1';
      const saved = typeof SiteStore !== 'undefined' ? SiteStore.get(storageKey) : null;
      const dw = width ? parseInt(width) : 340, dh = height ? parseInt(height) : 400;
      if (saved && typeof saved.x === 'number') {
        panel.style.left = Math.max(0, Math.min(saved.x, window.innerWidth - 100)) + 'px';
        panel.style.top = Math.max(0, Math.min(saved.y, window.innerHeight - 50)) + 'px';
        panel.style.width = (saved.w || dw) + 'px';
        panel.style.height = (saved.h || dh) + 'px';
      } else {
        panel.style.width = dw + 'px';
        panel.style.height = dh + 'px';
        const pos = this._findSlot(dw, dh);
        panel.style.left = pos.x + 'px';
        panel.style.top = pos.y + 'px';
      }
    };

    const open = () => {
      if (panel.classList.contains('open')) return;
      layout();
      panel.classList.add('open');
      Dock.setActive(toggleBtn, true);
    };

    const close = () => {
      if (beforeClose && !beforeClose()) return;
      panel.classList.remove('open');
      Dock.setActive(toggleBtn, false);
    };

    const isOpen = () => panel.classList.contains('open');

    closeBtn.addEventListener('click', close);
    this._drag(panel, header, storageKey);
    this._resize(panel, resizeHandle, storageKey);
    Dock.addPanel(panel);

    const ref = { panel, body, closeBtn, header, open, close, isOpen };
    this._panels.push(ref);
    return ref;
  },
};

if (typeof window !== 'undefined') {
  window.SVG = SVG;
  window.svg = svg;
  window.LOG = LOG;
  window.Dock = Dock;
  window.PanelFactory = PanelFactory;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SVG, svg, LOG, Dock, PanelFactory };
}
