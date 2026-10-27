/**
 * NMK Developer DMOJ-based Extra Configs - Graph Drawer
 * Interactive network graph visualizer powered by locally bundled Cytoscape.js.
 */

const Graph = {
  el: {},
  cy: null,
  _drawToken: 0,

  async init() {
    this._build();
  },

  _build() {
    this.el.toggle = Dock.addButton('gdrawer-toggle', 'network', '#10b981', '#059669', 'Graph drawer', () => this._toggle());
    const ref = PanelFactory.create({
      id: 'gdrawer-panel', title: 'Graph Drawer', iconSvg: svg('network', 16),
      width: '420px', height: '540px', toggleBtn: this.el.toggle,
      bodyHTML: `
        <textarea class="csoj-textarea gdrawer-input" placeholder="Mỗi dòng: u v [w]" rows="3"></textarea>
        <label class="csoj-chk"><input type="checkbox" class="gdrawer-directed"> Directed graph</label>
        <div class="gdrawer-buttons">
          <button class="csoj-btn gdrawer-arrange">${svg('zap', 12)} Arrange</button>
          <button class="csoj-btn gdrawer-relayout">${svg('refresh', 12)} Re-layout</button>
          <button class="csoj-btn gdrawer-grid">${svg('grid', 12)} Grid</button>
          <button class="csoj-btn gdrawer-random">${svg('dice', 12)} Random</button>
          <button class="csoj-btn csoj-btn-danger gdrawer-clear">${svg('trash', 12)} Clear</button>
        </div>
        <div class="gdrawer-cy"></div>
      `,
    });

    const b = ref.body;
    Object.assign(this.el, {
      ...ref,
      input: b.querySelector('.gdrawer-input'),
      directed: b.querySelector('.gdrawer-directed'),
      cyDiv: b.querySelector('.gdrawer-cy'),
      arrangeBtn: b.querySelector('.gdrawer-arrange'),
      relayoutBtn: b.querySelector('.gdrawer-relayout'),
      gridBtn: b.querySelector('.gdrawer-grid'),
      randomBtn: b.querySelector('.gdrawer-random'),
      clearBtn: b.querySelector('.gdrawer-clear'),
    });

    this._bind();
    this._restore();
  },

  _debounce(fn, ms) {
    let t;
    return (...a) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...a), ms);
    };
  },

  _bind() {
    this.el.input.addEventListener('input', this._debounce(() => {
      if (this.el.isOpen()) this._draw({ layout: 'auto' });
    }, 350));
    this.el.directed.addEventListener('change', () => {
      if (this.el.isOpen()) this._draw({ layout: 'auto' });
    });
    this.el.arrangeBtn.addEventListener('click', () => this._draw({ layout: 'circle', force: true }));
    this.el.relayoutBtn.addEventListener('click', () => this._draw({ layout: 'cose', force: true }));
    this.el.gridBtn.addEventListener('click', () => this._draw({ layout: 'grid', force: true }));
    this.el.randomBtn.addEventListener('click', () => this._random());
    this.el.clearBtn.addEventListener('click', () => {
      this.el.input.value = '';
      this._draw({ layout: 'auto' });
    });
  },

  _restore() {
    this.el.input.value = SiteStore.get('graph') || '';
    this.el.directed.checked = SiteStore.get('graph_directed') === '1';
  },

  async _toggle() {
    if (this.el.isOpen()) {
      this.el.close();
    } else {
      this.el.open();
      setTimeout(() => this._draw({ layout: 'cose', force: true }), 50);
    }
  },

  _parse(text) {
    const edges = [], nodes = new Set();
    text.split('\n').forEach(l => {
      l = l.trim();
      if (!l || l.startsWith('#')) return;
      const p = l.split(/\s+/).map(Number);
      if (p.some(isNaN)) return;
      const [u, v, w] = p;
      if (u === undefined || v === undefined) return;
      nodes.add(u);
      nodes.add(v);
      edges.push({ u, v, w: w || 1 });
    });
    return { edges, nodes: [...nodes] };
  },

  async _draw({ layout = 'auto', force = false } = {}) {
    if (typeof cytoscape === 'undefined') {
      LOG.warn('Cytoscape library not loaded');
      return;
    }

    const tok = ++this._drawToken;
    const text = this.el.input.value;
    const directed = this.el.directed.checked;

    SiteStore.set('graph', text);
    SiteStore.set('graph_directed', directed ? '1' : '0');

    const { edges, nodes } = this._parse(text);
    const oldPos = {};
    if (this.cy && !force && layout === 'auto') {
      this.cy.nodes().forEach(n => {
        const p = n.position();
        oldPos[n.id()] = { x: p.x, y: p.y };
      });
    }

    const els = [];
    nodes.forEach(id => {
      const n = { data: { id: String(id), label: String(id) } };
      if (oldPos[id]) n.position = { ...oldPos[id] };
      els.push(n);
    });
    edges.forEach((e, i) => {
      els.push({
        data: {
          id: `e${i}`,
          source: String(e.u),
          target: String(e.v),
          label: e.w !== 1 ? String(e.w) : ''
        }
      });
    });

    if (this.cy) {
      this.cy.destroy();
      this.cy = null;
    }

    if (!nodes.length) {
      this.el.cyDiv.classList.remove('has-graph');
      return;
    }

    if (tok !== this._drawToken) return;

    const hasOld = Object.keys(oldPos).length > 0;
    const base = { animate: false, padding: 20, fit: true };
    let lc;
    if (layout === 'circle') lc = { name: 'circle', ...base };
    else if (layout === 'grid') lc = { name: 'grid', ...base };
    else if (layout === 'cose') lc = { name: 'cose', ...base, nodeRepulsion: 8000, idealEdgeLength: 80, randomize: true };
    else if (hasOld) lc = { name: 'preset', fit: false };
    else lc = { name: 'cose', ...base, nodeRepulsion: 8000, idealEdgeLength: 80 };

    this.cy = cytoscape({
      container: this.el.cyDiv,
      elements: els,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#10b981',
            label: 'data(label)',
            color: '#fff',
            'font-size': '12px',
            'font-weight': '600',
            'text-valign': 'center',
            'text-halign': 'center',
            width: 30,
            height: 30,
            'border-width': 2,
            'border-color': '#059669'
          }
        },
        {
          selector: 'node:selected',
          style: { 'border-color': '#fbbf24', 'border-width': 3 }
        },
        {
          selector: 'edge',
          style: {
            width: 1.5,
            'line-color': '#6b7280',
            'target-arrow-color': '#6b7280',
            'target-arrow-shape': directed ? 'triangle' : 'none',
            'arrow-scale': 1.2,
            'curve-style': 'bezier',
            label: 'data(label)',
            'font-size': '10px',
            color: '#9ca3af',
            'text-background-color': '#1a1c20',
            'text-background-opacity': 1,
            'text-background-padding': 2
          }
        },
      ],
      layout: lc,
      userZoomingEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: false,
    });

    this.el.cyDiv.classList.add('has-graph');
    if (lc.name === 'preset') this._arrangeNew(oldPos);

    this.cy.on('dragfree', 'node', () => {
      const pos = {};
      this.cy.nodes().forEach(n => {
        pos[n.id()] = { ...n.position() };
      });
      SiteStore.set('graph_pos', pos);
    });
  },

  _arrangeNew(oldPos) {
    if (!this.cy) return;
    const nn = this.cy.nodes().filter(n => !oldPos[n.id()]);
    if (!nn.length) return;
    const on = this.cy.nodes().filter(n => oldPos[n.id()]);
    let cx = 0, cy = 0;
    if (on.length) {
      on.forEach(n => { const p = n.position(); cx += p.x; cy += p.y; });
      cx /= on.length; cy /= on.length;
    } else {
      const e = this.cy.extent();
      cx = (e.x1 + e.x2) / 2; cy = (e.y1 + e.y2) / 2;
    }
    const r = 120, step = (2 * Math.PI) / nn.length;
    nn.forEach((n, i) => n.position({ x: cx + r * Math.cos(i * step), y: cy + r * Math.sin(i * step) }));
    this.cy.fit(undefined, 30);
  },

  _random() {
    const n = Math.floor(Math.random() * 5) + 5;
    const m = Math.floor(Math.random() * 8) + 3;
    const set = new Set();
    for (let i = 0; i < m; i++) {
      const u = Math.floor(Math.random() * n) + 1;
      const v = Math.floor(Math.random() * n) + 1;
      if (u !== v) set.add(`${u} ${v}`);
    }
    this.el.input.value = [...set].join('\n');
    this._draw({ layout: 'cose', force: true });
  },
};

if (typeof window !== 'undefined') {
  window.Graph = Graph;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Graph };
}
