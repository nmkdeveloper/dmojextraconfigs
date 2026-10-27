/**
 * NMK Developer DMOJ-based Extra Configs - Logo & Navbar Manager
 * Manages custom logo upload, original aspect ratio preservation, navbar and divider dimensions.
 */

const LogoConfig = {
  LOGO_RE: /\/logo[\w.-]*\.svg(?:\?|$)/i,
  DEFAULT_URL: 'https://cdn.myimgs.org/images/68220/123545768790873241.png',
  SIZE: 500,
  SIZE_MIN: 16, SIZE_MAX: 300, GAP_MAX: 40, RADIUS_MAX: 50,
  NAV_H_MIN: 28, NAV_H_MAX: 120, NAV_W_MIN: 40, NAV_W_MAX: 100,
  DIV_H_MIN: 0, DIV_H_MAX: 100, DIV_W_MIN: 0, DIV_W_MAX: 10, DIV_M_MAX: 40,
  NAV_GAP_MAX: 40,
  SIZE_DEFAULT: 40, GAP_DEFAULT: 4, RADIUS_DEFAULT: 0, FIT_DEFAULT: 'contain',
  NAV_H_DEFAULT: 52, NAV_W_DEFAULT: 100,
  DIV_H_DEFAULT: 60, DIV_W_DEFAULT: 1, DIV_ML_DEFAULT: 6, DIV_MR_DEFAULT: 6, DIV_OP_DEFAULT: 40,
  NAV_GAP_DEFAULT: 0, NAV_ALIGN_DEFAULT: 'center',
};

const LogoManager = {
  el: {},
  _customUrl: null, _defaultUrl: null, _originalUrl: null, _originalFavicons: [],
  _useOriginal: false, _activeUrl: null,
  _imgRatio: null, // Natural/Original aspect ratio (width / height)
  _sizeMode: 'auto', _w: 40, _h: 40, _gap: 4, _radius: 0, _fitMode: 'contain', _lock: true,
  _navH: 52, _navW: 100, _navHAuto: true, _navWAuto: true, _navScheduled: false,
  _divH: 60, _divHAuto: true, _divW: 1, _divWAuto: true,
  _divML: 6, _divMR: 6, _divOp: 40, _divShow: true,
  _navGap: 0, _navAlign: 'center',

  _isLogoSrc(s) { return LogoConfig.LOGO_RE.test(s || ''); },
  _clamp(v, lo, hi, d) { const n = parseInt(v, 10); return isNaN(n) ? d : Math.max(lo, Math.min(hi, n)); },

  _ratio() {
    if (this._imgRatio && this._imgRatio > 0) return this._imgRatio;
    const domImg = typeof document !== 'undefined' ? document.querySelector('img[data-csoj-logo="1"], img[src*="/logo"]') : null;
    if (domImg && domImg.naturalWidth && domImg.naturalHeight && domImg.naturalHeight > 0) {
      const r = domImg.naturalWidth / domImg.naturalHeight;
      if (r > 0) {
        this._imgRatio = r;
        SiteStore.set('logo_img_ratio', r);
        return r;
      }
    }
    return 1;
  },

  _checkNaturalRatio(img) {
    if (!img) return null;
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    if (nw && nh && nh > 0) {
      const r = nw / nh;
      if (r > 0 && (!this._imgRatio || Math.abs(this._imgRatio - r) > 0.005)) {
        this._imgRatio = r;
        SiteStore.set('logo_img_ratio', r);
        this._syncBadge();
        this._syncDimensions();
      }
      return r;
    }
    return null;
  },

  _syncDimensions() {
    const r = this._ratio();
    if (!r || r <= 0) return;
    if (this._lock) {
      this._h = this._clamp(Math.round(this._w / r), LogoConfig.SIZE_MIN, LogoConfig.SIZE_MAX, this._h);
      if (this.el.hSlider) {
        this.el.hSlider.value = this._h;
        this.el.hVal.textContent = (this._sizeMode === 'auto' ? 'auto' : this._h + 'px');
      }
      SiteStore.set('logo_h', String(this._h));
    }
  },

  _bindLogoEvents(img) {
    if (!img || img._csojBound) return;
    img._csojBound = true;
    const onRatioReady = () => {
      const r = this._checkNaturalRatio(img);
      if (r) {
        this._applyFit();
      }
    };
    if (img.complete && img.naturalWidth) {
      this._checkNaturalRatio(img);
    } else {
      img.addEventListener('load', onRatioReady, { once: true });
    }
  },

  async init() {
    LOG.group('LogoManager');

    this._customUrl = SiteStore.get('logo_custom') || null;
    this._defaultUrl = SiteStore.get('logo_default_cache') || null;
    this._useOriginal = SiteStore.get('logo_use_original') === '1';

    const savedRatio = parseFloat(SiteStore.get('logo_img_ratio'));
    this._imgRatio = !isNaN(savedRatio) && savedRatio > 0 ? savedRatio : null;

    this._sizeMode = SiteStore.get('logo_size_mode') || 'auto';
    this._lock = SiteStore.get('logo_lock', '1') !== '0';
    this._h = this._clamp(SiteStore.get('logo_h', String(LogoConfig.SIZE_DEFAULT)), LogoConfig.SIZE_MIN, LogoConfig.SIZE_MAX, LogoConfig.SIZE_DEFAULT);
    
    // Width defaults to height * ratio if ratio exists
    const defaultW = this._imgRatio ? Math.round(this._h * this._imgRatio) : LogoConfig.SIZE_DEFAULT;
    this._w = this._clamp(SiteStore.get('logo_w', String(defaultW)), LogoConfig.SIZE_MIN, LogoConfig.SIZE_MAX * 2, defaultW);

    // If lock is enabled and ratio exists, ensure dimensions match ratio immediately
    if (this._lock && this._imgRatio && this._imgRatio > 0) {
      this._h = this._clamp(Math.round(this._w / this._imgRatio), LogoConfig.SIZE_MIN, LogoConfig.SIZE_MAX, this._h);
    }

    this._gap = this._clamp(SiteStore.get('logo_gap', String(LogoConfig.GAP_DEFAULT)), 0, LogoConfig.GAP_MAX, LogoConfig.GAP_DEFAULT);
    this._radius = this._clamp(SiteStore.get('logo_radius', String(LogoConfig.RADIUS_DEFAULT)), 0, LogoConfig.RADIUS_MAX, LogoConfig.RADIUS_DEFAULT);
    this._fitMode = SiteStore.get('logo_fit', LogoConfig.FIT_DEFAULT) || 'contain';
    if (!['contain', 'cover', 'fill'].includes(this._fitMode)) this._fitMode = 'contain';
    this._navH = this._clamp(SiteStore.get('logo_nav_h', String(LogoConfig.NAV_H_DEFAULT)), LogoConfig.NAV_H_MIN, LogoConfig.NAV_H_MAX, LogoConfig.NAV_H_DEFAULT);
    this._navW = this._clamp(SiteStore.get('logo_nav_w', String(LogoConfig.NAV_W_DEFAULT)), LogoConfig.NAV_W_MIN, LogoConfig.NAV_W_MAX, LogoConfig.NAV_W_DEFAULT);
    this._navHAuto = SiteStore.get('logo_nav_h_auto', '1') !== '0';
    this._navWAuto = SiteStore.get('logo_nav_w_auto', '1') !== '0';
    this._divH = this._clamp(SiteStore.get('logo_div_h', String(LogoConfig.DIV_H_DEFAULT)), LogoConfig.DIV_H_MIN, LogoConfig.DIV_H_MAX, LogoConfig.DIV_H_DEFAULT);
    this._divHAuto = SiteStore.get('logo_div_h_auto', '1') !== '0';
    this._divW = this._clamp(SiteStore.get('logo_div_w', String(LogoConfig.DIV_W_DEFAULT)), LogoConfig.DIV_W_MIN, LogoConfig.DIV_W_MAX, LogoConfig.DIV_W_DEFAULT);
    this._divWAuto = SiteStore.get('logo_div_w_auto', '1') !== '0';
    this._divML = this._clamp(SiteStore.get('logo_div_ml', String(LogoConfig.DIV_ML_DEFAULT)), 0, LogoConfig.DIV_M_MAX, LogoConfig.DIV_ML_DEFAULT);
    this._divMR = this._clamp(SiteStore.get('logo_div_mr', String(LogoConfig.DIV_MR_DEFAULT)), 0, LogoConfig.DIV_M_MAX, LogoConfig.DIV_MR_DEFAULT);
    this._divOp = this._clamp(SiteStore.get('logo_div_op', String(LogoConfig.DIV_OP_DEFAULT)), 0, 100, LogoConfig.DIV_OP_DEFAULT);
    this._divShow = SiteStore.get('logo_div_show', '1') !== '0';
    this._navGap = this._clamp(SiteStore.get('logo_nav_gap', String(LogoConfig.NAV_GAP_DEFAULT)), 0, LogoConfig.NAV_GAP_MAX, LogoConfig.NAV_GAP_DEFAULT);
    this._navAlign = SiteStore.get('logo_nav_align', LogoConfig.NAV_ALIGN_DEFAULT) || 'center';
    if (!['center', 'flex-start', 'flex-end', 'stretch'].includes(this._navAlign)) this._navAlign = 'center';

    if (this._customUrl) this._activeUrl = this._customUrl;
    else if (this._useOriginal) this._activeUrl = null;
    else if (this._defaultUrl) this._activeUrl = this._defaultUrl;

    this.buildPanel();
    await this._boot();
    LOG.groupEnd();
  },

  async _boot() {
    this._captureOriginal();
    if (!this._customUrl && !this._useOriginal && !this._defaultUrl) {
      this._defaultUrl = await this._fetchDefault();
      if (this._defaultUrl) this._activeUrl = this._defaultUrl;
    }
    const targetUrl = this._activeUrl || this._originalUrl;
    if (targetUrl) this._detectImageRatio(targetUrl);

    this._applyAll();
    this._updatePreview();
    this._observe();
  },

  _captureOriginal() {
    if (this._originalUrl) return;
    const img = document.querySelector('img[src*="/logo"]');
    if (img) {
      const s = img.getAttribute('src');
      if (s && this._isLogoSrc(s)) {
        this._originalUrl = s;
        if (img.naturalWidth && img.naturalHeight) {
          this._imgRatio = img.naturalWidth / img.naturalHeight;
        }
      }
    }
    this._originalFavicons = Array.from(document.querySelectorAll('link[rel*="icon"]')).map(l => ({ el: l, href: l.getAttribute('href') }));
    if (!this._originalUrl) {
      const link = this._originalFavicons.find(f => f.href && this._isLogoSrc(f.href));
      if (link) this._originalUrl = link.href;
    }
    if (!this._originalUrl) this._originalUrl = new URL('/static/icons/logo.svg', location.origin).href;
  },

  _detectImageRatio(url) {
    if (!url) return;
    const img = new Image();
    img.onload = () => {
      const sw = img.naturalWidth || img.width;
      const sh = img.naturalHeight || img.height;
      if (sw && sh) {
        const r = sw / sh;
        this._imgRatio = r;
        SiteStore.set('logo_img_ratio', r);
        this._syncBadge();
        this._syncDimensions();
        this._applyFit();
      }
    };
    img.src = url;
  },

  async _fetchDefault() {
    try {
      const res = await fetch(LogoConfig.DEFAULT_URL);
      if (!res.ok) return null;
      const blob = await res.blob();
      const bmp = await createImageBitmap(blob);
      const origRatio = bmp.width && bmp.height ? bmp.width / bmp.height : 1;
      this._imgRatio = origRatio;
      await SiteStore.set('logo_img_ratio', origRatio);
      const u = await this._resize(bmp, LogoConfig.SIZE, origRatio);
      if (u) await SiteStore.set('logo_default_cache', u);
      return u;
    } catch {
      return null;
    }
  },

  _resize(src, maxSize, ratio) {
    return new Promise(resolve => {
      try {
        const sw = src.width || src.naturalWidth || 0, sh = src.height || src.naturalHeight || 0;
        if (!sw || !sh) return resolve(null);
        const r = ratio || (sw / sh);
        let w, h;
        if (r >= 1) {
          w = Math.min(maxSize, sw);
          h = Math.round(w / r);
        } else {
          h = Math.min(maxSize, sh);
          w = Math.round(h * r);
        }
        const c = document.createElement('canvas');
        c.width = Math.max(1, w);
        c.height = Math.max(1, h);
        const ctx = c.getContext('2d');
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(src, 0, 0, w, h);
        let u = c.toDataURL('image/webp', 0.95);
        if (!u.startsWith('data:image/webp')) u = c.toDataURL('image/png');
        resolve(u);
      } catch { resolve(null); }
    });
  },

  _compress(file) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = async () => {
        const sw = img.naturalWidth || img.width;
        const sh = img.naturalHeight || img.height;
        const origRatio = sw && sh ? sw / sh : 1;
        this._imgRatio = origRatio;
        await SiteStore.set('logo_img_ratio', origRatio);

        const u = await this._resize(img, LogoConfig.SIZE, origRatio);
        URL.revokeObjectURL(img.src);
        resolve({ url: u, ratio: origRatio });
      };
      img.onerror = () => resolve(null);
      img.src = URL.createObjectURL(file);
    });
  },

  _applyAll() {
    if (this._activeUrl) {
      document.documentElement.classList.add('csoj-logo-has-override');
      this._scan(document);
    } else {
      document.documentElement.classList.remove('csoj-logo-has-override');
    }
    this._applyFavicons();
    this._applyNav();
    this._applyNavList();
    this._applyFit();
    this._applyDivider();
  },

  _scan(root) {
    if (!this._activeUrl) return;
    root.querySelectorAll('img').forEach(img => {
      const s = img.getAttribute('src') || '';
      if (this._isLogoSrc(s) || img.getAttribute('data-csoj-logo') === '1') {
        img.setAttribute('data-csoj-logo', '1');
        img.removeAttribute('srcset');
        img.removeAttribute('onerror');
        if (img.getAttribute('src') !== this._activeUrl) img.setAttribute('src', this._activeUrl);
        this._bindLogoEvents(img);
      }
    });
  },

  _applyFavicons() {
    if (this._activeUrl) {
      document.querySelectorAll('link[rel*="icon"]').forEach(l => {
        if (!l.hasAttribute('data-csoj-orig')) { const o = l.getAttribute('href'); if (o) l.setAttribute('data-csoj-orig', o); }
        if (l.getAttribute('href') !== this._activeUrl) l.setAttribute('href', this._activeUrl);
      });
      document.querySelectorAll('meta[name="msapplication-TileImage"],meta[property="og:image"]').forEach(m => {
        if (!m.hasAttribute('data-csoj-orig')) { const o = m.getAttribute('content'); if (o) m.setAttribute('data-csoj-orig', o); }
        if (m.getAttribute('content') !== this._activeUrl) m.setAttribute('content', this._activeUrl);
      });
      if (!document.querySelector('link[data-csoj-favicon]')) {
        const l = document.createElement('link');
        l.rel = 'icon'; l.type = 'image/png';
        l.setAttribute('data-csoj-favicon', '1'); l.href = this._activeUrl;
        (document.head || document.documentElement).appendChild(l);
      }
    } else {
      document.querySelectorAll('link[rel*="icon"]').forEach(l => {
        const o = l.getAttribute('data-csoj-orig');
        if (o) { l.setAttribute('href', o); l.removeAttribute('data-csoj-orig'); }
      });
      document.querySelectorAll('meta[name="msapplication-TileImage"],meta[property="og:image"]').forEach(m => {
        const o = m.getAttribute('data-csoj-orig');
        if (o) { m.setAttribute('content', o); m.removeAttribute('data-csoj-orig'); }
      });
      const cf = document.querySelector('link[data-csoj-favicon]');
      if (cf) cf.remove();
    }
  },

  _applyNav() {
    const nav = document.getElementById('navigation');
    if (!nav) return;
    if (this._navHAuto) {
      nav.style.removeProperty('height');
      nav.style.removeProperty('min-height');
    } else {
      nav.style.setProperty('height', this._navH + 'px', 'important');
      nav.style.setProperty('min-height', this._navH + 'px', 'important');
    }
    if (this._navWAuto) {
      nav.style.removeProperty('max-width');
      nav.style.removeProperty('margin-left');
      nav.style.removeProperty('margin-right');
    } else {
      nav.style.setProperty('max-width', this._navW + '%', 'important');
      nav.style.setProperty('margin-left', 'auto', 'important');
      nav.style.setProperty('margin-right', 'auto', 'important');
    }
    if (!this._navScheduled) {
      this._navScheduled = true;
      requestAnimationFrame(() => { this._navScheduled = false; this._applyFit(); this._applyDivider(); });
    }
  },

  _applyNavList() {
    const navList = document.getElementById('nav-list');
    if (!navList) return;
    navList.style.setProperty('gap', this._navGap + 'px', 'important');
    navList.style.setProperty('align-items', this._navAlign, 'important');
  },

  _applyDivider() {
    const div = document.querySelector('.nav-divider');
    if (!div) return;
    if (!this._divShow) {
      div.style.setProperty('display', 'none', 'important');
      return;
    }
    div.style.removeProperty('display');
    div.style.setProperty('align-self', 'center', 'important');
    div.style.setProperty('vertical-align', 'middle', 'important');
    div.style.setProperty('margin-left', this._divML + 'px', 'important');
    div.style.setProperty('margin-right', this._divMR + 'px', 'important');
    div.style.setProperty('opacity', String(this._divOp / 100), 'important');
    if (this._divHAuto) {
      let logoH = 0;
      const logoImg = document.querySelector('img[data-csoj-logo="1"]');
      if (logoImg) {
        const rect = logoImg.getBoundingClientRect();
        logoH = Math.round(rect.height) || parseInt(logoImg.style.height, 10);
      }
      if (!logoH) logoH = this._lastTargetH || this._h;
      div.style.setProperty('height', logoH + 'px', 'important');
    } else {
      div.style.setProperty('height', this._divH + '%', 'important');
    }
    if (this._divWAuto) {
      div.style.removeProperty('width');
    } else {
      div.style.setProperty('width', this._divW + 'px', 'important');
    }
  },

  _applyFit() {
    const r = this._ratio();
    const isAuto = this._sizeMode === 'auto';
    let targetW, targetH;

    if (isAuto) {
      const nav = document.getElementById('navigation');
      let baseH = LogoConfig.NAV_H_DEFAULT;
      if (nav) {
        const sample = nav.querySelector('.home-menu-item>a,#nav-list a.nav-home,#nav-list li>a');
        baseH = sample ? Math.round(sample.getBoundingClientRect().height) : 0;
        if (!baseH) {
          const cs = getComputedStyle(nav);
          baseH = Math.round(nav.clientHeight - parseFloat(cs.paddingTop || 0) - parseFloat(cs.paddingBottom || 0));
        }
        if (!baseH) baseH = LogoConfig.NAV_H_DEFAULT;
      }
      targetH = Math.max(LogoConfig.SIZE_MIN, baseH - 2 * this._gap);
      targetW = Math.max(LogoConfig.SIZE_MIN, Math.round(targetH * r));
    } else {
      targetW = this._w;
      targetH = this._lock ? Math.max(LogoConfig.SIZE_MIN, Math.round(targetW / r)) : this._h;
      this._h = targetH;
    }
    this._lastTargetH = targetH;

    document.querySelectorAll('img[data-csoj-logo="1"]').forEach(img => {
      this._bindLogoEvents(img);
      img.removeAttribute('width');
      img.removeAttribute('height');
      const s = img.style;

      if (isAuto) {
        // Fits navbar height, width wraps original ratio with zero letterbox gap
        s.setProperty('height', targetH + 'px', 'important');
        s.setProperty('width', 'auto', 'important');
        s.setProperty('max-height', targetH + 'px', 'important');
        s.setProperty('max-width', 'none', 'important');
      } else if (this._lock) {
        // Locks original ratio: exact width, height wraps tightly with zero gap
        s.setProperty('width', targetW + 'px', 'important');
        s.setProperty('height', 'auto', 'important');
        s.setProperty('max-width', 'none', 'important');
        s.setProperty('max-height', 'none', 'important');
      } else {
        // Unlocked custom width and height
        s.setProperty('width', targetW + 'px', 'important');
        s.setProperty('height', targetH + 'px', 'important');
        s.setProperty('max-width', 'none', 'important');
        s.setProperty('max-height', 'none', 'important');
      }

      s.setProperty('margin', this._gap + 'px', 'important');
      s.setProperty('border-radius', this._radius + '%', 'important');
      s.setProperty('object-fit', this._fitMode, 'important');
      s.setProperty('aspect-ratio', r ? `${r}` : 'auto', 'important');
      s.setProperty('padding', '0', 'important');
      s.setProperty('display', 'block', 'important');
    });

    if (this._divHAuto) this._applyDivider();
  },

  _observe() {
    new MutationObserver(muts => {
      let needFit = false, needFav = false, needDiv = false;
      for (const m of muts) {
        m.addedNodes.forEach(n => {
          if (n.nodeType !== 1) return;
          this._scan(n);
          if (n.id === 'navigation' || n.querySelector?.('#navigation')) needFit = true;
          if (n.matches?.('.nav-divider') || n.querySelector?.('.nav-divider')) needDiv = true;
          if (n.id === 'nav-list' || n.querySelector?.('#nav-list')) needDiv = true;
          if (n.matches?.('link[rel*="icon"]') || n.querySelector?.('link[rel*="icon"]')) needFav = true;
        });
        if (m.type === 'attributes') {
          const t = m.target;
          if (t.tagName === 'IMG') {
            const s = t.getAttribute('src') || '';
            if (this._activeUrl && s !== this._activeUrl && (this._isLogoSrc(s) || t.getAttribute('data-csoj-logo') === '1')) {
              this._scan(t.parentNode || document); needFit = true;
            }
          } else if (t.matches?.('link[rel*="icon"],meta[name="msapplication-TileImage"],meta[property="og:image"]')) {
            needFav = true;
          }
        }
      }
      if (needFit) this._applyNav();
      if (needDiv) { this._applyNavList(); this._applyDivider(); }
      if (needFav) this._applyFavicons();
    }).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['src', 'href', 'content'] });
  },

  buildPanel() {
    this.el.toggle = Dock.addButton('logo-toggle', 'palette', '#f59e0b', '#d97706', 'Logo & Navbar', () => this._toggle());
    const ref = PanelFactory.create({
      id: 'logo-panel', title: 'Logo & Navbar', iconSvg: svg('palette', 16),
      width: '330px', height: 'auto', toggleBtn: this.el.toggle,
      bodyHTML: `
        <div class="logo-preview"></div>
        <label class="csoj-btn csoj-btn-accent" style="cursor:pointer;text-align:center;">${svg('upload', 14)} Upload logo<input type="file" accept="image/*" class="logo-file" style="display:none;"></label>

        <div class="logo-section">Logo Size</div>
        <label class="logo-chk"><input type="checkbox" class="logo-auto-cb"> Auto fit theo navbar</label>
        <label class="logo-chk"><input type="checkbox" class="logo-lock-cb"> ${svg('lock', 12)} Lock tỉ lệ ảnh gốc<span class="logo-badge">Auto</span></label>
        <div class="logo-row"><label>Width</label><input type="range" class="csoj-range logo-w" min="${LogoConfig.SIZE_MIN}" max="${LogoConfig.SIZE_MAX * 2}" step="2"><span class="logo-w-val">auto</span></div>
        <div class="logo-row"><label>Height</label><input type="range" class="csoj-range logo-h" min="${LogoConfig.SIZE_MIN}" max="${LogoConfig.SIZE_MAX}" step="2"><span class="logo-h-val">auto</span></div>
        <div class="logo-row"><label>Gap</label><input type="range" class="csoj-range logo-gap" min="0" max="${LogoConfig.GAP_MAX}" step="1"><span class="logo-gap-val"></span></div>
        <div class="logo-row"><label>Radius</label><input type="range" class="csoj-range logo-radius" min="0" max="${LogoConfig.RADIUS_MAX}" step="1"><span class="logo-radius-val"></span></div>
        <div class="logo-row"><label>Fit</label><select class="logo-fit"><option value="contain">contain</option><option value="cover">cover</option><option value="fill">fill</option></select></div>

        <div class="logo-section">Navbar</div>
        <div class="logo-row"><label>Height</label><input type="range" class="csoj-range logo-navh" min="${LogoConfig.NAV_H_MIN}" max="${LogoConfig.NAV_H_MAX}" step="1"><span class="logo-navh-val"></span></div>
        <label class="logo-chk"><input type="checkbox" class="logo-navh-auto"> Auto height</label>
        <div class="logo-row"><label>Width</label><input type="range" class="csoj-range logo-navw" min="${LogoConfig.NAV_W_MIN}" max="${LogoConfig.NAV_W_MAX}" step="1"><span class="logo-navw-val"></span></div>
        <label class="logo-chk"><input type="checkbox" class="logo-navw-auto"> Full width (100%)</label>

        <div class="logo-section" style="color:#a78bfa;">Divider</div>
        <label class="logo-chk"><input type="checkbox" class="logo-divshow"> Show divider</label>
        <div class="logo-div-group">
          <div class="logo-row"><label>Height</label><input type="range" class="csoj-range logo-divh" min="${LogoConfig.DIV_H_MIN}" max="${LogoConfig.DIV_H_MAX}" step="1"><span class="logo-divh-val"></span></div>
          <label class="logo-chk"><input type="checkbox" class="logo-divh-auto"> Auto (match logo)</label>
          <div class="logo-row"><label>Thick</label><input type="range" class="csoj-range logo-divw" min="${LogoConfig.DIV_W_MIN}" max="${LogoConfig.DIV_W_MAX}" step="1"><span class="logo-divw-val"></span></div>
          <label class="logo-chk"><input type="checkbox" class="logo-divw-auto"> Auto width</label>
          <div class="logo-row"><label>Margin L</label><input type="range" class="csoj-range logo-divml" min="0" max="${LogoConfig.DIV_M_MAX}" step="1"><span class="logo-divml-val"></span></div>
          <div class="logo-row"><label>Margin R</label><input type="range" class="csoj-range logo-divmr" min="0" max="${LogoConfig.DIV_M_MAX}" step="1"><span class="logo-divmr-val"></span></div>
          <div class="logo-row"><label>Opacity</label><input type="range" class="csoj-range logo-divop" min="0" max="100" step="5"><span class="logo-divop-val"></span></div>
        </div>

        <div class="logo-section" style="color:#a78bfa;">Nav Items</div>
        <div class="logo-row"><label>Gap</label><input type="range" class="csoj-range logo-navgap" min="0" max="${LogoConfig.NAV_GAP_MAX}" step="1"><span class="logo-navgap-val"></span></div>
        <div class="logo-row"><label>Align</label><select class="logo-navalign"><option value="center">center</option><option value="flex-start">flex-start</option><option value="flex-end">flex-end</option><option value="stretch">stretch</option></select></div>

        <div style="display:flex;gap:6px;margin-top:4px;">
          <button class="csoj-btn csoj-btn-danger logo-reset">${svg('rotateCcw', 12)} Reset logo</button>
          <button class="csoj-btn logo-navreset">${svg('rotateCcw', 12)} Reset navbar</button>
        </div>
        <button class="csoj-btn logo-divreset" style="background:rgba(139,92,246,.15);border-color:rgba(139,92,246,.3);color:#c4b5fd;">${svg('rotateCcw', 12)} Reset divider &amp; nav items</button>
        <div class="csoj-status logo-status"></div>
      `,
    });

    const b = ref.body;
    Object.assign(this.el, {
      ...ref,
      preview: b.querySelector('.logo-preview'),
      fileInput: b.querySelector('.logo-file'),
      resetBtn: b.querySelector('.logo-reset'),
      navResetBtn: b.querySelector('.logo-navreset'),
      divResetBtn: b.querySelector('.logo-divreset'),
      status: b.querySelector('.logo-status'),
      autoCb: b.querySelector('.logo-auto-cb'),
      lockCb: b.querySelector('.logo-lock-cb'),
      badge: b.querySelector('.logo-badge'),
      wSlider: b.querySelector('.logo-w'), hSlider: b.querySelector('.logo-h'),
      gapSlider: b.querySelector('.logo-gap'), radiusSlider: b.querySelector('.logo-radius'),
      fitSelect: b.querySelector('.logo-fit'),
      navHSlider: b.querySelector('.logo-navh'), navHVal: b.querySelector('.logo-navh-val'),
      navHAutoCb: b.querySelector('.logo-navh-auto'),
      navWSlider: b.querySelector('.logo-navw'), navWVal: b.querySelector('.logo-navw-val'),
      navWAutoCb: b.querySelector('.logo-navw-auto'),
      divShowCb: b.querySelector('.logo-divshow'),
      divHSlider: b.querySelector('.logo-divh'), divHVal: b.querySelector('.logo-divh-val'),
      divHAutoCb: b.querySelector('.logo-divh-auto'),
      divWSlider: b.querySelector('.logo-divw'), divWVal: b.querySelector('.logo-divw-val'),
      divWAutoCb: b.querySelector('.logo-divw-auto'),
      divMLSlider: b.querySelector('.logo-divml'), divMLVal: b.querySelector('.logo-divml-val'),
      divMRSlider: b.querySelector('.logo-divmr'), divMRVal: b.querySelector('.logo-divmr-val'),
      divOpSlider: b.querySelector('.logo-divop'), divOpVal: b.querySelector('.logo-divop-val'),
      navGapSlider: b.querySelector('.logo-navgap'), navGapVal: b.querySelector('.logo-navgap-val'),
      navAlignSelect: b.querySelector('.logo-navalign'),
      wVal: b.querySelector('.logo-w-val'), hVal: b.querySelector('.logo-h-val'),
      gapVal: b.querySelector('.logo-gap-val'), radiusVal: b.querySelector('.logo-radius-val'),
    });

    this._bind();
    this._updatePreview();
    this._restoreUI();
  },

  _enableSize(en) { this.el.wSlider.disabled = !en; this.el.hSlider.disabled = !en; },

  _syncBadge() {
    if (!this.el.badge) return;
    if (!this._lock) {
      this.el.badge.textContent = 'Free';
      return;
    }
    const r = this._ratio();
    if (!r || isNaN(r)) {
      this.el.badge.textContent = 'Auto';
      return;
    }
    if (Math.abs(r - 1) < 0.02) {
      this.el.badge.textContent = '1:1';
    } else if (Math.abs(r - (16 / 9)) < 0.05) {
      this.el.badge.textContent = '16:9';
    } else if (Math.abs(r - (4 / 3)) < 0.05) {
      this.el.badge.textContent = '4:3';
    } else if (Math.abs(r - (3 / 2)) < 0.05) {
      this.el.badge.textContent = '3:2';
    } else if (r >= 1) {
      this.el.badge.textContent = `${r.toFixed(2)}:1`;
    } else {
      this.el.badge.textContent = `1:${(1 / r).toFixed(2)}`;
    }
  },

  _bind() {
    this.el.fileInput.addEventListener('change', async e => {
      const f = e.target.files?.[0]; e.target.value = '';
      if (f) await this._upload(f);
    });
    this.el.resetBtn.addEventListener('click', () => this._resetLogo());
    this.el.navResetBtn.addEventListener('click', () => this._resetNav());
    this.el.divResetBtn.addEventListener('click', () => this._resetDivider());

    this.el.autoCb.addEventListener('change', () => {
      this._sizeMode = this.el.autoCb.checked ? 'auto' : 'manual';
      this._enableSize(!this.el.autoCb.checked);
      this.el.wVal.textContent = this.el.autoCb.checked ? 'auto' : this._w + 'px';
      this.el.hVal.textContent = this.el.autoCb.checked ? 'auto' : this._h + 'px';
      SiteStore.set('logo_size_mode', this._sizeMode);
      this._applyFit();
    });

    this.el.lockCb.addEventListener('change', () => {
      this._lock = this.el.lockCb.checked;
      SiteStore.set('logo_lock', this._lock ? '1' : '0');
      if (this._lock) {
        const r = this._ratio();
        if (r > 0) {
          this._h = this._clamp(Math.round(this._w / r), LogoConfig.SIZE_MIN, LogoConfig.SIZE_MAX, this._h);
          this.el.hSlider.value = this._h;
          this.el.hVal.textContent = (this._sizeMode === 'auto' ? 'auto' : this._h + 'px');
          SiteStore.set('logo_h', String(this._h));
          this._applyFit();
        }
      }
      this._syncBadge();
    });

    this.el.wSlider.addEventListener('input', () => {
      const v = parseInt(this.el.wSlider.value, 10);
      const r = this._ratio();
      this._w = v;
      if (this._lock && r > 0) {
        this._h = this._clamp(Math.round(v / r), LogoConfig.SIZE_MIN, LogoConfig.SIZE_MAX, this._h);
        this.el.hSlider.value = this._h;
        this.el.hVal.textContent = this._h + 'px';
        SiteStore.set('logo_h', String(this._h));
      }
      this._sizeMode = 'manual';
      this.el.autoCb.checked = false;
      this._enableSize(true);
      this.el.wVal.textContent = v + 'px';
      SiteStore.set('logo_w', String(this._w));
      SiteStore.set('logo_size_mode', 'manual');
      this._applyFit();
    });

    this.el.hSlider.addEventListener('input', () => {
      const v = parseInt(this.el.hSlider.value, 10);
      const r = this._ratio();
      this._h = v;
      if (this._lock && r > 0) {
        this._w = this._clamp(Math.round(v * r), LogoConfig.SIZE_MIN, LogoConfig.SIZE_MAX * 2, this._w);
        this.el.wSlider.value = this._w;
        this.el.wVal.textContent = this._w + 'px';
        SiteStore.set('logo_w', String(this._w));
      }
      this._sizeMode = 'manual';
      this.el.autoCb.checked = false;
      this._enableSize(true);
      this.el.hVal.textContent = v + 'px';
      SiteStore.set('logo_h', String(this._h));
      SiteStore.set('logo_size_mode', 'manual');
      this._applyFit();
    });

    this.el.gapSlider.addEventListener('input', () => {
      const v = parseInt(this.el.gapSlider.value, 10);
      this._gap = v; this.el.gapVal.textContent = v + 'px';
      SiteStore.set('logo_gap', String(v));
      this._applyFit();
    });

    this.el.radiusSlider.addEventListener('input', () => {
      const v = parseInt(this.el.radiusSlider.value, 10);
      this._radius = v; this.el.radiusVal.textContent = v + '%';
      SiteStore.set('logo_radius', String(v));
      this._applyFit();
    });

    this.el.fitSelect.addEventListener('change', () => {
      this._fitMode = this.el.fitSelect.value;
      SiteStore.set('logo_fit', this._fitMode);
      this._applyFit();
    });

    this.el.navHSlider.addEventListener('input', () => {
      const v = parseInt(this.el.navHSlider.value, 10);
      this._navH = v; this._navHAuto = false;
      this.el.navHAutoCb.checked = false;
      this.el.navHSlider.disabled = false;
      this.el.navHVal.textContent = v + 'px';
      SiteStore.set('logo_nav_h', String(v));
      SiteStore.set('logo_nav_h_auto', '0');
      this._applyNav();
    });

    this.el.navHAutoCb.addEventListener('change', () => {
      this._navHAuto = this.el.navHAutoCb.checked;
      this.el.navHSlider.disabled = this._navHAuto;
      this.el.navHVal.textContent = this._navHAuto ? 'auto' : this._navH + 'px';
      SiteStore.set('logo_nav_h_auto', this._navHAuto ? '1' : '0');
      this._applyNav();
    });

    this.el.navWSlider.addEventListener('input', () => {
      const v = parseInt(this.el.navWSlider.value, 10);
      this._navW = v; this._navWAuto = false;
      this.el.navWAutoCb.checked = false;
      this.el.navWSlider.disabled = false;
      this.el.navWVal.textContent = v + '%';
      SiteStore.set('logo_nav_w', String(v));
      SiteStore.set('logo_nav_w_auto', '0');
      this._applyNav();
    });

    this.el.navWAutoCb.addEventListener('change', () => {
      this._navWAuto = this.el.navWAutoCb.checked;
      this.el.navWSlider.disabled = this._navWAuto;
      this.el.navWVal.textContent = this._navWAuto ? '100%' : this._navW + '%';
      SiteStore.set('logo_nav_w_auto', this._navWAuto ? '1' : '0');
      this._applyNav();
    });

    this.el.divShowCb.addEventListener('change', () => {
      this._divShow = this.el.divShowCb.checked;
      SiteStore.set('logo_div_show', this._divShow ? '1' : '0');
      this._applyDivider();
    });

    this.el.divHSlider.addEventListener('input', () => {
      const v = parseInt(this.el.divHSlider.value, 10);
      this._divH = v; this._divHAuto = false;
      this.el.divHAutoCb.checked = false;
      this.el.divHSlider.disabled = false;
      this.el.divHVal.textContent = v + '%';
      SiteStore.set('logo_div_h', String(v));
      SiteStore.set('logo_div_h_auto', '0');
      this._applyDivider();
    });

    this.el.divHAutoCb.addEventListener('change', () => {
      this._divHAuto = this.el.divHAutoCb.checked;
      this.el.divHSlider.disabled = this._divHAuto;
      this.el.divHVal.textContent = this._divHAuto ? 'auto' : this._divH + '%';
      SiteStore.set('logo_div_h_auto', this._divHAuto ? '1' : '0');
      this._applyDivider();
    });

    this.el.divWSlider.addEventListener('input', () => {
      const v = parseInt(this.el.divWSlider.value, 10);
      this._divW = v; this._divWAuto = false;
      this.el.divWAutoCb.checked = false;
      this.el.divWSlider.disabled = false;
      this.el.divWVal.textContent = v + 'px';
      SiteStore.set('logo_div_w', String(v));
      SiteStore.set('logo_div_w_auto', '0');
      this._applyDivider();
    });

    this.el.divWAutoCb.addEventListener('change', () => {
      this._divWAuto = this.el.divWAutoCb.checked;
      this.el.divWSlider.disabled = this._divWAuto;
      this.el.divWVal.textContent = this._divWAuto ? 'auto' : this._divW + 'px';
      SiteStore.set('logo_div_w_auto', this._divWAuto ? '1' : '0');
      this._applyDivider();
    });

    this.el.divMLSlider.addEventListener('input', () => {
      const v = parseInt(this.el.divMLSlider.value, 10);
      this._divML = v; this.el.divMLVal.textContent = v + 'px';
      SiteStore.set('logo_div_ml', String(v));
      this._applyDivider();
    });

    this.el.divMRSlider.addEventListener('input', () => {
      const v = parseInt(this.el.divMRSlider.value, 10);
      this._divMR = v; this.el.divMRVal.textContent = v + 'px';
      SiteStore.set('logo_div_mr', String(v));
      this._applyDivider();
    });

    this.el.divOpSlider.addEventListener('input', () => {
      const v = parseInt(this.el.divOpSlider.value, 10);
      this._divOp = v; this.el.divOpVal.textContent = v + '%';
      SiteStore.set('logo_div_op', String(v));
      this._applyDivider();
    });

    this.el.navGapSlider.addEventListener('input', () => {
      const v = parseInt(this.el.navGapSlider.value, 10);
      this._navGap = v; this.el.navGapVal.textContent = v + 'px';
      SiteStore.set('logo_nav_gap', String(v));
      this._applyNavList();
      this._applyDivider();
    });

    this.el.navAlignSelect.addEventListener('change', () => {
      this._navAlign = this.el.navAlignSelect.value;
      SiteStore.set('logo_nav_align', this._navAlign);
      this._applyNavList();
      this._applyDivider();
    });
  },

  _restoreUI() {
    const auto = this._sizeMode === 'auto';
    this.el.autoCb.checked = auto;
    this._enableSize(!auto);
    this.el.wSlider.value = this._w; this.el.hSlider.value = this._h;
    this.el.wVal.textContent = auto ? 'auto' : this._w + 'px';
    this.el.hVal.textContent = auto ? 'auto' : this._h + 'px';
    this.el.lockCb.checked = this._lock; this._syncBadge();
    this.el.gapSlider.value = this._gap; this.el.gapVal.textContent = this._gap + 'px';
    this.el.radiusSlider.value = this._radius; this.el.radiusVal.textContent = this._radius + '%';
    this.el.fitSelect.value = this._fitMode;

    this.el.navHSlider.value = this._navH;
    this.el.navHSlider.disabled = this._navHAuto;
    this.el.navHAutoCb.checked = this._navHAuto;
    this.el.navHVal.textContent = this._navHAuto ? 'auto' : this._navH + 'px';
    this.el.navWSlider.value = this._navW;
    this.el.navWSlider.disabled = this._navWAuto;
    this.el.navWAutoCb.checked = this._navWAuto;
    this.el.navWVal.textContent = this._navWAuto ? '100%' : this._navW + '%';

    this.el.divShowCb.checked = this._divShow;
    this.el.divHSlider.value = this._divH;
    this.el.divHSlider.disabled = this._divHAuto;
    this.el.divHAutoCb.checked = this._divHAuto;
    this.el.divHVal.textContent = this._divHAuto ? 'auto' : this._divH + '%';
    this.el.divWSlider.value = this._divW;
    this.el.divWSlider.disabled = this._divWAuto;
    this.el.divWAutoCb.checked = this._divWAuto;
    this.el.divWVal.textContent = this._divWAuto ? 'auto' : this._divW + 'px';
    this.el.divMLSlider.value = this._divML;
    this.el.divMLVal.textContent = this._divML + 'px';
    this.el.divMRSlider.value = this._divMR;
    this.el.divMRVal.textContent = this._divMR + 'px';
    this.el.divOpSlider.value = this._divOp;
    this.el.divOpVal.textContent = this._divOp + '%';
    this.el.navGapSlider.value = this._navGap;
    this.el.navGapVal.textContent = this._navGap + 'px';
    this.el.navAlignSelect.value = this._navAlign;
  },

  async _upload(file) {
    this._setStatus('Đang xử lý...', '');
    try {
      const result = await this._compress(file);
      if (!result || !result.url) return this._setStatus('Không đọc được ảnh', 'err');
      const { url, ratio } = result;
      this._customUrl = url;
      this._useOriginal = false;
      this._activeUrl = url;
      await SiteStore.set('logo_custom', url);
      await SiteStore.del('logo_use_original');

      this._imgRatio = ratio;
      await SiteStore.set('logo_img_ratio', ratio);
      this._h = this._clamp(Math.round(this._w / ratio), LogoConfig.SIZE_MIN, LogoConfig.SIZE_MAX, LogoConfig.SIZE_DEFAULT);
      this._w = Math.round(this._h * ratio);
      this.el.wSlider.value = this._w;
      this.el.hSlider.value = this._h;
      if (this._sizeMode === 'manual') {
        this.el.wVal.textContent = this._w + 'px';
        this.el.hVal.textContent = this._h + 'px';
      }
      await SiteStore.set('logo_w', String(this._w));
      await SiteStore.set('logo_h', String(this._h));

      this._syncBadge();
      this._applyAll();
      this._updatePreview();
      this._setStatus('Đã áp dụng logo mới', 'ok');
      setTimeout(() => this._setStatus(''), 2500);
    } catch (e) {
      this._setStatus('Lỗi: ' + e.message, 'err');
    }
  },

  async _resetLogo() {
    this._customUrl = null;
    this._defaultUrl = null;
    await SiteStore.del('logo_custom');
    await SiteStore.del('logo_default_cache');
    await SiteStore.del('logo_img_ratio');
    this._useOriginal = true;
    await SiteStore.set('logo_use_original', '1');
    this._activeUrl = null;
    this._imgRatio = null;

    if (!this._originalUrl) this._captureOriginal();
    if (this._originalUrl) this._detectImageRatio(this._originalUrl);

    this._restoreOriginal();
    this._updatePreview();
    this._syncBadge();
    this._setStatus('Đã reset logo', 'ok');
    setTimeout(() => this._setStatus(''), 2500);
  },

  async _resetNav() {
    this._navHAuto = true; this._navWAuto = true;
    this._navH = LogoConfig.NAV_H_DEFAULT; this._navW = LogoConfig.NAV_W_DEFAULT;
    await SiteStore.del('logo_nav_h');
    await SiteStore.del('logo_nav_w');
    await SiteStore.del('logo_nav_h_auto');
    await SiteStore.del('logo_nav_w_auto');
    this._applyNav(); this._restoreUI();
    this._setStatus('Đã reset navbar', 'ok');
    setTimeout(() => this._setStatus(''), 2500);
  },

  async _resetDivider() {
    this._divH = LogoConfig.DIV_H_DEFAULT; this._divHAuto = true;
    this._divW = LogoConfig.DIV_W_DEFAULT; this._divWAuto = true;
    this._divML = LogoConfig.DIV_ML_DEFAULT; this._divMR = LogoConfig.DIV_MR_DEFAULT;
    this._divOp = LogoConfig.DIV_OP_DEFAULT; this._divShow = true;
    this._navGap = LogoConfig.NAV_GAP_DEFAULT; this._navAlign = LogoConfig.NAV_ALIGN_DEFAULT;

    const keys = ['logo_div_h', 'logo_div_h_auto', 'logo_div_w', 'logo_div_w_auto', 'logo_div_ml', 'logo_div_mr', 'logo_div_op', 'logo_div_show', 'logo_nav_gap', 'logo_nav_align'];
    for (const k of keys) await SiteStore.del(k);

    const div = document.querySelector('.nav-divider');
    if (div) ['height', 'width', 'margin-left', 'margin-right', 'opacity', 'display', 'align-self', 'vertical-align'].forEach(p => div.style.removeProperty(p));
    const navList = document.getElementById('nav-list');
    if (navList) { navList.style.removeProperty('gap'); navList.style.removeProperty('align-items'); }
    this._applyDivider(); this._applyNavList(); this._restoreUI();
    this._setStatus('Đã reset divider & nav items', 'ok');
    setTimeout(() => this._setStatus(''), 2500);
  },

  _restoreOriginal() {
    if (!this._originalUrl) return;
    document.documentElement.classList.remove('csoj-logo-has-override');
    document.querySelectorAll('img').forEach(img => {
      if (img.getAttribute('data-csoj-logo') === '1' || this._isLogoSrc(img.getAttribute('src'))) {
        if (img.getAttribute('src') !== this._originalUrl) img.setAttribute('src', this._originalUrl);
        img.removeAttribute('data-csoj-logo');
        ['width', 'height', 'aspect-ratio', 'object-fit', 'padding', 'margin', 'border-radius', 'display', 'max-width', 'max-height'].forEach(p => img.style.removeProperty(p));
      }
    });
    this._applyFavicons();
  },

  _updatePreview() {
    const url = this._activeUrl || this._originalUrl;
    if (url) {
      this.el.preview.style.backgroundImage = `url("${url}")`;
      this.el.preview.classList.add('has-image');
    } else {
      this.el.preview.style.backgroundImage = '';
      this.el.preview.classList.remove('has-image');
    }
  },

  _toggle() { this.el.isOpen() ? this.el.close() : this.el.open(); },
  _setStatus(m, c = '') {
    this.el.status.textContent = m;
    this.el.status.className = 'csoj-status logo-status' + (c ? ' ' + c : '');
  },
};

if (typeof window !== 'undefined') {
  window.LogoManager = LogoManager;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LogoManager };
}
