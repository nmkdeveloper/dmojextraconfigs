/**
 * NMK Developer DMOJ-based Extra Configs - Pomodoro Timer
 * Focus & break cycle timer with SVG circular progress and synthesized chime sound.
 */

const Pomodoro = {
  el: {},
  _audioCtx: null,
  _tick: null,
  D: { focus: 25 * 60 * 1000, shortBreak: 5 * 60 * 1000, longBreak: 15 * 60 * 1000 },
  CB4L: 4,
  state: {
    mode: 'focus',
    remaining: 25 * 60 * 1000,
    endAt: null,
    running: false,
    cycle: 0,
    settings: { sound: true }
  },

  async init() {
    this._build();
    this._restore();
    this._render();
    if (this.state.running) {
      this.el.open();
      this._startTick();
    }
  },

  _formatTime(ms) {
    const t = Math.max(0, Math.ceil(ms / 1000));
    return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
  },

  _build() {
    this.el.toggle = Dock.addButton('pomo-toggle', 'timer', '#ef4444', '#dc2626', 'Pomodoro', () => {
      this._getAudio();
      this._reqNotif();
      this._toggle();
    });
    this.el.badge = this.el.toggle.querySelector('.csoj-badge');

    const ref = PanelFactory.create({
      id: 'pomo-panel', title: 'Pomodoro', iconSvg: svg('timer', 16),
      width: '260px', height: 'auto', toggleBtn: this.el.toggle,
      beforeClose: () => !this.state.running,
      bodyHTML: `
        <div class="pomo-inner">
          <div class="pomo-ring-wrap">
            <svg viewBox="0 0 120 120" style="width:100%;height:100%;display:block;">
              <circle cx="60" cy="60" r="54" fill="none" stroke="#2a2e35" stroke-width="6"/>
              <circle cx="60" cy="60" r="54" fill="none" stroke="#ef4444" stroke-width="6" stroke-linecap="round" class="pomo-progress" transform="rotate(-90 60 60)"/>
            </svg>
            <div class="pomo-text">
              <div class="pomo-time">25:00</div>
              <div class="pomo-mode">FOCUS</div>
            </div>
          </div>
          <div class="pomo-dots"></div>
          <div class="pomo-ctrls">
            <button class="csoj-btn csoj-btn-primary pomo-start">${svg('play', 12)} Start</button>
            <button class="csoj-btn pomo-reset">${svg('rotateCcw', 12)}</button>
            <button class="csoj-btn pomo-skip">${svg('skip', 12)}</button>
          </div>
          <label class="csoj-chk"><input type="checkbox" class="pomo-sound" checked> ${svg('volume', 12)} Sound</label>
        </div>
      `,
    });

    const b = ref.body;
    Object.assign(this.el, {
      ...ref,
      timeBig: b.querySelector('.pomo-time'),
      mode: b.querySelector('.pomo-mode'),
      progress: b.querySelector('.pomo-progress'),
      dots: b.querySelector('.pomo-dots'),
      startBtn: b.querySelector('.pomo-start'),
      resetBtn: b.querySelector('.pomo-reset'),
      skipBtn: b.querySelector('.pomo-skip'),
      soundInput: b.querySelector('.pomo-sound'),
    });

    this._bind();
  },

  _bind() {
    this.el.startBtn.addEventListener('click', () => {
      this._getAudio();
      this._reqNotif();
      this.state.running ? this._pause() : this._start();
    });
    this.el.resetBtn.addEventListener('click', () => this._reset());
    this.el.skipBtn.addEventListener('click', () => this._advance(false, true));
    this.el.soundInput.addEventListener('change', () => {
      this.state.settings.sound = this.el.soundInput.checked;
      this._save();
    });
  },

  _save() {
    SiteStore.set('pomo', this.state);
  },

  _restore() {
    const s = SiteStore.get('pomo');
    if (!s) return;
    Object.assign(this.state, {
      mode: s.mode || 'focus',
      cycle: s.cycle || 0,
      running: !!s.running,
      remaining: typeof s.remaining === 'number' ? s.remaining : this.D[s.mode || 'focus'],
      endAt: s.endAt || null,
      settings: { sound: s.settings?.sound !== false },
    });

    if (this.state.running && this.state.endAt) {
      const l = this.state.endAt - Date.now();
      if (l <= 0) this._advance(true, true);
      else this.state.remaining = l;
    }
  },

  _start() {
    if (this.state.running) return;
    this.state.running = true;
    this.state.endAt = Date.now() + this.state.remaining;
    this._save();
    this.el.open();
    this._startTick();
    this._render();
  },

  _pause() {
    if (!this.state.running) return;
    this.state.running = false;
    this.state.remaining = Math.max(0, this.state.endAt - Date.now());
    this.state.endAt = null;
    this._save();
    this._stopTick();
    this._render();
  },

  _reset() {
    this.state.running = false;
    this.state.endAt = null;
    this.state.mode = 'focus';
    this.state.cycle = 0;
    this.state.remaining = this.D.focus;
    this._save();
    this._stopTick();
    this._render();
  },

  _advance(silent = false, autoStart = false) {
    this.state.running = false;
    this.state.endAt = null;
    if (this.state.mode === 'focus') {
      this.state.cycle++;
      if (this.state.cycle >= this.CB4L) {
        this.state.mode = 'longBreak';
        this.state.cycle = 0;
      } else {
        this.state.mode = 'shortBreak';
      }
    } else {
      this.state.mode = 'focus';
    }
    this.state.remaining = this.D[this.state.mode];
    this._stopTick();
    if (!silent) {
      this._beep();
      this._notify();
    }
    if (autoStart) this._start();
    else {
      this._save();
      this._render();
    }
  },

  _startTick() {
    this._stopTick();
    this._tick = setInterval(() => {
      const l = this.state.endAt - Date.now();
      if (l <= 0) this._advance(false, true);
      else {
        this.state.remaining = l;
        this._render();
      }
    }, 200);
  },

  _stopTick() {
    if (this._tick) {
      clearInterval(this._tick);
      this._tick = null;
    }
  },

  _render() {
    const t = this._formatTime(this.state.remaining);
    this.el.timeBig.textContent = t;
    if (this.state.running) {
      this.el.badge.textContent = t;
      this.el.badge.classList.add('show');
    } else {
      this.el.badge.classList.remove('show');
    }

    const L = { focus: 'FOCUS', shortBreak: 'SHORT BREAK', longBreak: 'LONG BREAK' };
    this.el.mode.textContent = L[this.state.mode];
    const C = { focus: '#ef4444', shortBreak: '#10b981', longBreak: '#8b5cf6' };
    const c = C[this.state.mode];

    this.el.mode.style.color = c;
    this.el.progress.style.stroke = c;
    this.el.panel.style.setProperty('--accent', c);
    this.el.panel.style.setProperty('--accent-rgb', this.state.mode === 'focus' ? '239, 68, 68' : this.state.mode === 'shortBreak' ? '16, 185, 129' : '139, 92, 246');

    const dur = this.D[this.state.mode];
    const R = 2 * Math.PI * 54;
    const p = Math.max(0, Math.min(1, this.state.remaining / dur));
    this.el.progress.style.strokeDasharray = String(R);
    this.el.progress.style.strokeDashoffset = String(R * (1 - p));

    this.el.startBtn.innerHTML = this.state.running ? svg('pause', 12) + ' Pause' : svg('play', 12) + ' Start';
    this.el.dots.innerHTML = '';
    for (let i = 0; i < this.CB4L; i++) {
      const d = document.createElement('span');
      d.className = 'pomo-dot' + (i < this.state.cycle ? ' active' : '');
      this.el.dots.appendChild(d);
    }

    this.el.soundInput.checked = this.state.settings.sound;
    this.el.closeBtn.style.opacity = this.state.running ? '0.2' : '';
    this.el.closeBtn.style.pointerEvents = this.state.running ? 'none' : '';
  },

  _toggle() { this.el.isOpen() ? this.el.close() : this.el.open(); },

  _getAudio() {
    if (this._audioCtx) return;
    try {
      this._audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch {}
  },

  _beep() {
    if (!this.state.settings.sound) return;
    this._getAudio();
    if (!this._audioCtx) return;
    const ctx = this._audioCtx;
    if (ctx.state === 'suspended') ctx.resume();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = 880;
    g.gain.setValueAtTime(0.3, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.5);
  },

  _reqNotif() {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') Notification.requestPermission();
  },

  _notify() {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    try {
      new Notification('Pomodoro', {
        body: this.state.mode === 'focus' ? 'Hết giờ tập trung!' : 'Hết giờ nghỉ!',
        icon: typeof chrome !== 'undefined' && chrome.runtime?.getURL ? chrome.runtime.getURL('assets/icons/icon48.png') : undefined
      });
    } catch {}
  },
};

if (typeof window !== 'undefined') {
  window.Pomodoro = Pomodoro;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Pomodoro };
}
