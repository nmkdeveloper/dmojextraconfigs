/**
 * NMK Developer DMOJ-based Extra Configs - Background Customizer
 * Allows setting custom background images with adjustable overlay opacity.
 */

const Background = {
  el: {},
  state: { dataUrl: null, opacity: 0.4 },
  _orig: null,

  async init() {
    this._restore();
    this._build();
  },

  _restore() {
    const s = SiteStore.get('bg');
    if (s) this.state = { ...this.state, ...s };
    if (this.state.dataUrl && document.body) this.apply();
  },

  _build() {
    this.el.toggle = Dock.addButton('bg-toggle', 'image', '#ec4899', '#db2777', 'Background', () => this._toggle());
    const ref = PanelFactory.create({
      id: 'bg-panel', title: 'Background', iconSvg: svg('image', 16),
      width: '300px', height: 'auto', toggleBtn: this.el.toggle,
      bodyHTML: `
        <div class="bg-preview empty"></div>
        <label class="csoj-btn csoj-btn-accent" style="cursor:pointer;text-align:center;">${svg('upload', 14)} Choose image<input type="file" accept="image/*" class="bg-file" style="display:none;"></label>
        <div class="bg-row"><label>Overlay</label><input type="range" class="csoj-range bg-opacity" min="0" max="80" step="5"><span class="bg-opacity-val">40%</span></div>
        <button class="csoj-btn csoj-btn-danger bg-clear">${svg('trash', 12)} Clear</button>
        <div class="csoj-status bg-status"></div>
      `,
    });

    const b = ref.body;
    Object.assign(this.el, {
      ...ref,
      preview: b.querySelector('.bg-preview'),
      fileInput: b.querySelector('.bg-file'),
      opacityInput: b.querySelector('.bg-opacity'),
      opacityVal: b.querySelector('.bg-opacity-val'),
      clearBtn: b.querySelector('.bg-clear'),
      status: b.querySelector('.bg-status'),
    });

    this._bind();
    this._uiSync();
  },

  _bind() {
    this.el.fileInput.addEventListener('change', async e => {
      const f = e.target.files?.[0]; e.target.value = '';
      if (f) await this._upload(f);
    });
    this.el.opacityInput.addEventListener('input', () => {
      const v = parseInt(this.el.opacityInput.value, 10);
      this.el.opacityVal.textContent = v + '%';
      this.state.opacity = v / 100;
      if (this.state.dataUrl) this.apply();
      this._save();
    });
    this.el.clearBtn.addEventListener('click', () => this._clear());
  },

  _uiSync() {
    this._updatePreview();
    const p = Math.round(this.state.opacity * 100);
    this.el.opacityInput.value = p;
    this.el.opacityVal.textContent = p + '%';
  },

  _toggle() { this.el.isOpen() ? this.el.close() : this.el.open(); },

  async _upload(file) {
    this._setStatus('Đang xử lý...', '');
    try {
      const u = await this._compress(file, 1920, 0.85);
      if (!u) return this._setStatus('Không đọc được ảnh', 'err');
      this.state.dataUrl = u;
      this.apply();
      this._updatePreview();
      await this._save();
      this._setStatus('Đã áp dụng ảnh nền', 'ok');
      setTimeout(() => this._setStatus(''), 2500);
    } catch (e) {
      this._setStatus('Lỗi: ' + e.message, 'err');
    }
  },

  _compress(file, dim, q) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        try {
          let { width, height } = img;
          if (width > dim || height > dim) {
            const s = Math.min(dim / width, dim / height);
            width = Math.round(width * s);
            height = Math.round(height * s);
          }
          const c = document.createElement('canvas');
          c.width = width; c.height = height;
          const ctx = c.getContext('2d');
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
          let u = c.toDataURL('image/webp', q);
          if (!u.startsWith('data:image/webp')) u = c.toDataURL('image/jpeg', q);
          URL.revokeObjectURL(img.src);
          resolve(u);
        } catch { resolve(null); }
      };
      img.onerror = () => resolve(null);
      img.src = URL.createObjectURL(file);
    });
  },

  apply() {
    const b = document.body;
    if (!b) return;
    if (!this._orig) {
      this._orig = {
        backgroundImage: b.style.backgroundImage || '',
        backgroundSize: b.style.backgroundSize || '',
        backgroundPosition: b.style.backgroundPosition || '',
        backgroundAttachment: b.style.backgroundAttachment || '',
        backgroundRepeat: b.style.backgroundRepeat || ''
      };
    }
    if (!this.state.dataUrl) return this._clearInline();
    const ov = this.state.opacity > 0 ? `linear-gradient(rgba(0,0,0,${this.state.opacity}),rgba(0,0,0,${this.state.opacity})),` : '';
    b.style.backgroundImage = `${ov}url("${this.state.dataUrl}")`;
    b.style.backgroundSize = 'cover';
    b.style.backgroundPosition = 'center center';
    b.style.backgroundAttachment = 'fixed';
    b.style.backgroundRepeat = 'no-repeat';
  },

  _clearInline() {
    if (document.body && this._orig) Object.assign(document.body.style, this._orig);
  },

  _updatePreview() {
    if (this.state.dataUrl) {
      this.el.preview.style.backgroundImage = `url("${this.state.dataUrl}")`;
      this.el.preview.classList.remove('empty');
    } else {
      this.el.preview.style.backgroundImage = '';
      this.el.preview.classList.add('empty');
    }
  },

  async _clear() {
    this.state.dataUrl = null;
    this._clearInline();
    await this._save();
    this._updatePreview();
    this._setStatus('Đã xoá nền', 'ok');
    setTimeout(() => this._setStatus(''), 2000);
  },

  async _save() {
    return SiteStore.set('bg', { dataUrl: this.state.dataUrl, opacity: this.state.opacity });
  },

  _setStatus(m, c = '') {
    this.el.status.textContent = m;
    this.el.status.className = 'csoj-status bg-status' + (c ? ' ' + c : '');
  },
};

if (typeof window !== 'undefined') {
  window.Background = Background;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Background };
}
