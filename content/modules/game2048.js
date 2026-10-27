/**
 * NMK Developer DMOJ-based Extra Configs - 2048 Game
 * Classic 2048 puzzle game with undo history and keyboard navigation.
 */

const Game2048 = {
  el: {},
  state: { board: [], score: 0, best: 0, size: 4 },
  _history: [],
  _colors: {
    2: '#eee4da', 4: '#ede0c8', 8: '#f2b179', 16: '#f59563',
    32: '#f67c5f', 64: '#f65e3b', 128: '#edcf72', 256: '#edcc61',
    512: '#edc850', 1024: '#edc53f', 2048: '#edc22e'
  },
  _keyHandler: null,

  async init() {
    this._load();
    this._build();
    this._render();
  },

  _newBoard() {
    const size = this.state.size;
    const b = Array.from({ length: size }, () => Array(size).fill(0));
    this._addRandom(b);
    this._addRandom(b);
    return b;
  },

  _addRandom(board) {
    const empty = [];
    for (let r = 0; r < board.length; r++) {
      for (let c = 0; c < board[r].length; c++) {
        if (board[r][c] === 0) empty.push([r, c]);
      }
    }
    if (!empty.length) return;
    const [r, c] = empty[Math.floor(Math.random() * empty.length)];
    board[r][c] = Math.random() < 0.9 ? 2 : 4;
  },

  _load() {
    try {
      const saved = SiteStore.get('2048');
      if (saved && saved.board) {
        this.state = { ...this.state, ...saved };
      } else {
        this.state.board = this._newBoard();
        this.state.score = 0;
      }
    } catch {
      this.state.board = this._newBoard();
    }
    this.state.best = parseInt(SiteStore.get('2048_best', '0'), 10) || 0;
  },

  _save() {
    SiteStore.set('2048', { board: this.state.board, score: this.state.score, size: this.state.size });
    if (this.state.score > this.state.best) {
      this.state.best = this.state.score;
      SiteStore.set('2048_best', String(this.state.best));
    }
  },

  _build() {
    this.el.toggle = Dock.addButton('game2048-toggle', 'gamepad', '#8b5cf6', '#7c3aed', '2048', () => this._toggle());
    const ref = PanelFactory.create({
      id: 'game2048-panel', title: '2048', iconSvg: svg('gamepad', 16),
      width: '340px', height: 'auto', toggleBtn: this.el.toggle,
      bodyHTML: `
        <div class="g-header">
          <div class="g-scores">
            <div class="g-box"><div class="g-lbl">Score</div><div class="g-val g-score">0</div></div>
            <div class="g-box"><div class="g-lbl">Best</div><div class="g-val g-best">0</div></div>
          </div>
          <button class="csoj-btn csoj-btn-primary g-new">${svg('plus', 12)} New</button>
        </div>
        <div class="g-grid"></div>
        <button class="csoj-btn g-undo">${svg('undo', 12)} Undo</button>
      `,
    });

    const b = ref.body;
    Object.assign(this.el, {
      ...ref,
      grid: b.querySelector('.g-grid'),
      score: b.querySelector('.g-score'),
      best: b.querySelector('.g-best'),
      newBtn: b.querySelector('.g-new'),
      undoBtn: b.querySelector('.g-undo'),
    });

    this._bind();
  },

  _bind() {
    this.el.newBtn.addEventListener('click', () => this._newGame());
    this.el.undoBtn.addEventListener('click', () => this._undo());

    this._keyHandler = (e) => {
      if (!this.el.isOpen()) return;
      const k = e.key;
      let dir = null;
      if (k === 'ArrowUp' || k === 'w' || k === 'W') dir = 'up';
      else if (k === 'ArrowDown' || k === 's' || k === 'S') dir = 'down';
      else if (k === 'ArrowLeft' || k === 'a' || k === 'A') dir = 'left';
      else if (k === 'ArrowRight' || k === 'd' || k === 'D') dir = 'right';
      if (dir) {
        e.preventDefault();
        e.stopPropagation();
        this._move(dir);
      }
    };
    document.addEventListener('keydown', this._keyHandler);
  },

  _newGame() {
    this.state.board = this._newBoard();
    this.state.score = 0;
    this._history = [];
    this._save();
    this._render();
  },

  _undo() {
    if (!this._history.length) return;
    const prev = this._history.pop();
    this.state.board = prev.board;
    this.state.score = prev.score;
    this._save();
    this._render();
  },

  _slideRow(row) {
    const arr = row.filter(v => v !== 0);
    const merged = [];
    let i = 0;
    while (i < arr.length) {
      if (i + 1 < arr.length && arr[i] === arr[i + 1]) {
        const v = arr[i] * 2;
        merged.push(v);
        this.state.score += v;
        i += 2;
      } else {
        merged.push(arr[i]);
        i += 1;
      }
    }
    while (merged.length < this.state.size) merged.push(0);
    return merged;
  },

  _transpose(b) { return b[0].map((_, c) => b.map(row => row[c])); },
  _reverseRow(row) { return [...row].reverse(); },

  _move(dir) {
    const orig = this.state.board.map(r => [...r]);
    let b = this.state.board.map(r => [...r]);

    if (dir === 'left') {
      b = b.map(row => this._slideRow(row));
    } else if (dir === 'right') {
      b = b.map(row => this._slideRow(this._reverseRow(row)).reverse());
    } else if (dir === 'up') {
      b = this._transpose(b);
      b = b.map(row => this._slideRow(row));
      b = this._transpose(b);
    } else if (dir === 'down') {
      b = this._transpose(b);
      b = b.map(row => this._slideRow(this._reverseRow(row)).reverse());
      b = this._transpose(b);
    }

    const moved = JSON.stringify(orig) !== JSON.stringify(b);
    if (!moved) return;

    this._history.push({
      board: orig,
      score: this.state.score - (b.flat().reduce((s, v) => s + v, 0) - orig.flat().reduce((s, v) => s + v, 0))
    });
    if (this._history.length > 20) this._history.shift();

    this.state.board = b;
    this._addRandom(this.state.board);
    this._save();
    this._render();

    if (this._isOver()) {
      setTimeout(() => alert('Game Over! Score: ' + this.state.score), 100);
    }
  },

  _isOver() {
    const b = this.state.board;
    for (let r = 0; r < b.length; r++) {
      for (let c = 0; c < b[r].length; c++) {
        if (b[r][c] === 0) return false;
        if (c < b[r].length - 1 && b[r][c] === b[r][c + 1]) return false;
        if (r < b.length - 1 && b[r][c] === b[r + 1][c]) return false;
      }
    }
    return true;
  },

  _render() {
    const b = this.state.board;
    const size = this.state.size;
    this.el.grid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    this.el.grid.innerHTML = '';
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const cell = document.createElement('div');
        const val = b[r][c];
        cell.className = 'g-cell' + (val === 0 ? ' empty' : '');
        cell.textContent = val || '';
        if (val) {
          cell.style.background = this._colors[val] || '#edc22e';
          cell.style.color = val <= 4 ? '#776e65' : '#f9f6f2';
          cell.style.fontSize = val >= 1000 ? 'clamp(10px, 2.5vw, 18px)' : '';
        }
        this.el.grid.appendChild(cell);
      }
    }
    this.el.score.textContent = this.state.score;
    this.el.best.textContent = this.state.best;
  },

  _toggle() { this.el.isOpen() ? this.el.close() : this.el.open(); },
};

if (typeof window !== 'undefined') {
  window.Game2048 = Game2048;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Game2048 };
}
