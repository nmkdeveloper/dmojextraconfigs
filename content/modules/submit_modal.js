/**
 * NMK Developer DMOJ-based Extra Configs - Submit Modal & Submission Transition
 * Intercepts problem submit links, opens a modal editor popup,
 * and plays a smooth, high-tech submission transition to the submission result page.
 */

const SubmitModal = {
  _modal: null,
  _overlay: null,
  _body: null,
  _titleEl: null,
  _statusEl: null,
  _animOverlay: null,
  _placeholder: null,
  _currentForm: null,
  _submitUrl: null,
  _isOpen: false,
  _isSubmitting: false,
  _aceResizeObserver: null,

  init() {
    this._bindLinkInterception();
    this._bindStandaloneForm();
  },

  _isProblemSubmitLink(a) {
    if (!a || !a.getAttribute) return false;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('javascript:')) return false;

    // Check if it's a submit link for a problem
    // Matches /problem/<id>/submit, /contest/<cid>/problem/<pid>/submit, etc.
    return /\/problem\/[^\/]+\/(?:resubmit\/\d+\/)?submit(?:\/|\?|#|$)/i.test(href) ||
           (href.endsWith('/submit') || href.endsWith('/submit/'));
  },

  _bindLinkInterception() {
    document.addEventListener('click', (e) => {
      // Allow user to use modifier keys for normal browser behavior (open in new tab)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || (e.button !== undefined && e.button !== 0)) {
        return;
      }

      const a = e.target?.closest?.('a');
      if (!a) return;

      // If already on the submit page, do not intercept link
      if (/\/submit(\/|\?|#|$)/i.test(location.pathname)) return;

      if (this._isProblemSubmitLink(a)) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof PageTransition !== 'undefined' && PageTransition.cancelExit) {
          PageTransition.cancelExit();
        } else if (typeof window !== 'undefined' && window.PageTransition && window.PageTransition.cancelExit) {
          window.PageTransition.cancelExit();
        } else if (typeof document !== 'undefined') {
          document.documentElement.classList.remove('csoj-page-exiting', 'csoj-page-transitioning');
          document.documentElement.classList.add('csoj-transition-settled');
        }
        this.open(a.href);
      }
    }, { capture: true });
  },

  _bindStandaloneForm() {
    // If the user is directly on the /submit page, attach submission effect to the standalone form
    const form = document.getElementById('problem_submit');
    if (form && !form.dataset.csojBound) {
      form.dataset.csojBound = '1';
      form.addEventListener('submit', (e) => {
        if (this._isSubmitting) {
          e.preventDefault();
          return;
        }
        e.preventDefault();
        this.submit(form, form.action || location.href);
      });
    }
  },

  _buildModal() {
    if (this._overlay) return;

    const overlay = document.createElement('div');
    overlay.id = 'csoj-submit-modal-overlay';
    overlay.setAttribute('data-csoj-ui', '1');
    overlay.innerHTML = `
      <div id="csoj-submit-modal" role="dialog" aria-modal="true">
        <div id="csoj-submit-modal-header">
          <div id="csoj-submit-modal-title">
            <span class="csoj-submit-icon">${svg('zap', 18)}</span>
            <span id="csoj-submit-title-text">Nộp bài giải</span>
          </div>
          <button id="csoj-submit-modal-close" title="Đóng (Esc)">${svg('x', 18)}</button>
        </div>
        <div id="csoj-submit-modal-body"></div>
        <div id="csoj-submit-status"></div>
        <div id="csoj-submit-anim-overlay" class="hidden">
          <div class="csoj-anim-content">
            <div class="csoj-anim-ring-wrap">
              <div class="csoj-anim-ring"></div>
              <div class="csoj-anim-icon">${svg('zap', 32)}</div>
            </div>
            <div class="csoj-anim-title">Đang nộp bài...</div>
            <div class="csoj-anim-desc">Hệ thống đang tiếp nhận và khởi tạo máy chấm</div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    this._overlay = overlay;
    this._modal = overlay.querySelector('#csoj-submit-modal');
    this._body = overlay.querySelector('#csoj-submit-modal-body');
    this._titleEl = overlay.querySelector('#csoj-submit-title-text');
    this._statusEl = overlay.querySelector('#csoj-submit-status');
    this._animOverlay = overlay.querySelector('#csoj-submit-anim-overlay');

    // Close handlers
    const closeBtn = overlay.querySelector('#csoj-submit-modal-close');
    closeBtn.addEventListener('click', () => this.close());

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay && !this._isSubmitting) {
        this.close();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this._isOpen && !this._isSubmitting) {
        this.close();
      }
    });
  },

  _getProblemTitle() {
    // Try h2 link on problem page
    const h2 = document.querySelector('h2 a[href*="/problem/"], h2');
    if (h2) {
      const text = h2.textContent.replace(/^(Bài nộp|Nộp bài|Problem)\s*/i, '').trim();
      if (text) return text;
    }
    // Try document title
    const t = document.title.split('-')[0].trim();
    return t || 'Bài tập';
  },

  async open(submitUrl) {
    this._buildModal();
    this._submitUrl = submitUrl || location.href;
    this._isOpen = true;
    this._isSubmitting = false;

    // Ensure background page never stays in dimmed/exiting state
    if (typeof PageTransition !== 'undefined' && PageTransition.cancelExit) {
      PageTransition.cancelExit();
    } else if (typeof window !== 'undefined' && window.PageTransition && window.PageTransition.cancelExit) {
      window.PageTransition.cancelExit();
    } else if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('csoj-page-exiting', 'csoj-page-transitioning');
      document.documentElement.classList.add('csoj-transition-settled');
    }

    // Reset status & animation
    this._statusEl.textContent = '';
    this._statusEl.className = '';
    this._hideAnimation();

    // Set header title
    const probTitle = this._getProblemTitle();
    this._titleEl.textContent = `Nộp bài: ${probTitle}`;

    // Find existing form in page
    let form = document.getElementById('problem_submit');
    if (form) {
      this._currentForm = form;
      // Record placeholder to put it back later
      if (!this._placeholder) {
        this._placeholder = document.createComment('csoj-form-placeholder');
        form.parentNode.insertBefore(this._placeholder, form);
      }
      this._body.appendChild(form);

      // Force select2 to 100% width so it never breaks modal boundary
      if (typeof form.querySelectorAll === 'function') {
        form.querySelectorAll('.select2, .select2-container').forEach(el => {
          if (el && el.style) {
            if (typeof el.style.setProperty === 'function') {
              el.style.setProperty('width', '100%', 'important');
              el.style.setProperty('max-width', '100%', 'important');
            } else {
              el.style.width = '100%';
              el.style.maxWidth = '100%';
            }
          }
        });
      }

      // Configure Ace editor widget and attach vertical resize drag handle
      const aceWidget = form.querySelector('.django-ace-widget');
      if (aceWidget) {
        if (aceWidget.style) {
          if (typeof aceWidget.style.setProperty === 'function') {
            aceWidget.style.setProperty('height', '440px', 'important');
          } else {
            aceWidget.style.height = '440px';
          }
        }

        // Add visible draggable resize handle
        let resizeHandle = this._body.querySelector('.csoj-editor-resize-handle');
        if (!resizeHandle && typeof document.createElement === 'function') {
          resizeHandle = document.createElement('div');
          resizeHandle.className = 'csoj-editor-resize-handle';
          resizeHandle.title = 'Kéo để thay đổi chiều cao khung code';
          resizeHandle.innerHTML = '<div class="csoj-resize-grip"></div>';

          const editorContainer = (typeof aceWidget.closest === 'function' ? aceWidget.closest('.django-ace-editor') : null) || aceWidget;
          if (editorContainer.parentNode) {
            if (editorContainer.nextSibling) {
              editorContainer.parentNode.insertBefore(resizeHandle, editorContainer.nextSibling);
            } else if (typeof editorContainer.parentNode.appendChild === 'function') {
              editorContainer.parentNode.appendChild(resizeHandle);
            }
          }

          // Drag logic for vertical resize
          let isDragging = false;
          let startY = 0;
          let startH = 0;

          const onPointerMove = (moveEvt) => {
            if (!isDragging) return;
            const dy = moveEvt.clientY - startY;
            const minH = 260;
            const maxH = Math.max(minH, (window.innerHeight || 800) * 0.72);
            const targetH = Math.max(minH, Math.min(maxH, startH + dy));
            if (aceWidget.style) {
              if (typeof aceWidget.style.setProperty === 'function') {
                aceWidget.style.setProperty('height', `${targetH}px`, 'important');
              } else {
                aceWidget.style.height = `${targetH}px`;
              }
            }
            if (window.ace_source && typeof window.ace_source.resize === 'function') {
              window.ace_source.resize(true);
            }
          };

          const onPointerUp = () => {
            if (!isDragging) return;
            isDragging = false;
            resizeHandle.classList.remove('active');
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
            if (window.ace_source && typeof window.ace_source.resize === 'function') {
              window.ace_source.resize(true);
            }
          };

          resizeHandle.onpointerdown = (downEvt) => {
            downEvt.preventDefault();
            isDragging = true;
            startY = downEvt.clientY;
            startH = aceWidget.offsetHeight || 440;
            resizeHandle.classList.add('active');
            window.addEventListener('pointermove', onPointerMove);
            window.addEventListener('pointerup', onPointerUp);
          };
        }

        // Attach ResizeObserver to keep Ace editor synced on any container resize
        if (typeof ResizeObserver !== 'undefined') {
          if (this._aceResizeObserver) {
            this._aceResizeObserver.disconnect();
          }
          this._aceResizeObserver = new ResizeObserver(() => {
            if (window.ace_source && typeof window.ace_source.resize === 'function') {
              window.ace_source.resize(true);
            }
          });
          this._aceResizeObserver.observe(aceWidget);
        }
      }

      // Re-trigger and configure ace editor so all lines are visible and scrollable
      const syncAce = () => {
        if (window.ace_source) {
          const editor = window.ace_source;
          try {
            if (typeof editor.setAutoScrollEditorIntoView === 'function') {
              editor.setAutoScrollEditorIntoView(false);
            }
            if (typeof editor.setOption === 'function') {
              editor.setOption('scrollPastEnd', 0.5);
              editor.setOption('maxLines', null);
              editor.setOption('minLines', null);
            }
            if (editor.renderer && typeof editor.renderer.setScrollMargin === 'function') {
              editor.renderer.setScrollMargin(8, 8, 8, 8);
            }
            if (typeof editor.resize === 'function') {
              editor.resize(true);
            }
            if (editor.renderer && typeof editor.renderer.updateFull === 'function') {
              editor.renderer.updateFull(true);
            }
          } catch {}
        }
      };

      syncAce();
      setTimeout(syncAce, 60);
      setTimeout(syncAce, 160);
      setTimeout(() => {
        syncAce();
        try { window.ace_source?.focus(); } catch {}
      }, 320);
    } else {
      // Form not in current page DOM — fetch from submitUrl
      this._body.innerHTML = `
        <div class="csoj-modal-loading">
          <div class="csoj-spin-loader"></div>
          <div>Đang tải biểu mẫu nộp bài...</div>
        </div>
      `;
      try {
        const resp = await fetch(this._submitUrl, { credentials: 'include' });
        const html = await resp.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const fetchedForm = doc.getElementById('problem_submit');
        if (fetchedForm) {
          this._body.innerHTML = '';
          this._body.appendChild(fetchedForm);
          this._currentForm = fetchedForm;
        } else {
          this._body.innerHTML = `
            <div class="csoj-modal-error">
              <p>Không tìm thấy biểu mẫu nộp bài.</p>
              <a href="${this._submitUrl}" class="csoj-btn csoj-btn-accent">Đi đến trang nộp bài đầy đủ</a>
            </div>
          `;
          this._overlay.classList.add('open');
          document.body.classList.add('csoj-modal-open');
          return;
        }
      } catch (err) {
        this._body.innerHTML = `
          <div class="csoj-modal-error">
            <p>Lỗi tải biểu mẫu: ${err.message}</p>
            <a href="${this._submitUrl}" class="csoj-btn csoj-btn-accent">Đi đến trang nộp bài đầy đủ</a>
          </div>
        `;
        this._overlay.classList.add('open');
        document.body.classList.add('csoj-modal-open');
        return;
      }
    }

    // Attach submit listener
    if (this._currentForm && !this._currentForm.dataset.csojModalBound) {
      this._currentForm.dataset.csojModalBound = '1';
      this._currentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submit(this._currentForm, this._submitUrl);
      });
    }

    // Show modal
    this._overlay.classList.add('open');
    document.body.classList.add('csoj-modal-open');
  },

  close() {
    if (!this._isOpen || this._isSubmitting) return;
    this._isOpen = false;

    this._overlay.classList.remove('open');
    document.body.classList.remove('csoj-modal-open');

    // Clean up ResizeObserver
    if (this._aceResizeObserver) {
      this._aceResizeObserver.disconnect();
      this._aceResizeObserver = null;
    }

    // Clean up drag handle
    const handle = this._overlay?.querySelector?.('.csoj-editor-resize-handle') ||
                   this._currentForm?.querySelector?.('.csoj-editor-resize-handle');
    if (handle && typeof handle.remove === 'function') {
      handle.remove();
    }

    // Restore form to its original place in the page DOM
    if (this._currentForm && this._placeholder && this._placeholder.parentNode) {
      const aceWidget = this._currentForm.querySelector('.django-ace-widget');
      if (aceWidget && aceWidget.style) {
        if (typeof aceWidget.style.removeProperty === 'function') {
          aceWidget.style.removeProperty('height');
        } else {
          aceWidget.style.height = '';
        }
      }
      this._placeholder.parentNode.insertBefore(this._currentForm, this._placeholder);
      this._placeholder.remove();
      this._placeholder = null;

      if (window.ace_source && typeof window.ace_source.resize === 'function') {
        try {
          window.ace_source.resize(true);
          if (window.ace_source.renderer && typeof window.ace_source.renderer.updateFull === 'function') {
            window.ace_source.renderer.updateFull(true);
          }
        } catch {}
      }
    }

    // Ensure background page is fully restored and interactive
    if (typeof PageTransition !== 'undefined' && PageTransition.cancelExit) {
      PageTransition.cancelExit();
    } else if (typeof window !== 'undefined' && window.PageTransition && window.PageTransition.cancelExit) {
      window.PageTransition.cancelExit();
    } else if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('csoj-page-exiting', 'csoj-page-transitioning');
      document.documentElement.classList.add('csoj-transition-settled');
    }

    this._currentForm = null;
    this._body.innerHTML = '';
  },

  _showAnimation(state, title, desc, iconSvg) {
    if (!this._animOverlay) return;
    this._animOverlay.classList.remove('hidden', 'success', 'error');
    if (state) this._animOverlay.classList.add(state);

    const titleEl = this._animOverlay.querySelector('.csoj-anim-title');
    const descEl = this._animOverlay.querySelector('.csoj-anim-desc');
    const iconEl = this._animOverlay.querySelector('.csoj-anim-icon');

    if (titleEl) titleEl.textContent = title;
    if (descEl) descEl.textContent = desc;
    if (iconEl && iconSvg) iconEl.innerHTML = iconSvg;
  },

  _hideAnimation() {
    if (!this._animOverlay) return;
    this._animOverlay.classList.add('hidden');
    this._animOverlay.classList.remove('success', 'error');
  },

  async submit(form, submitUrl) {
    if (this._isSubmitting) return;

    // 1. Validation
    let code = '';
    if (window.ace_source && typeof window.ace_source.getSession === 'function') {
      code = window.ace_source.getSession().getValue();
      const txt = form.querySelector('textarea#id_source');
      if (txt) txt.value = code;
    } else {
      const txt = form.querySelector('textarea#id_source');
      if (txt) code = txt.value;
    }

    const langSelect = form.querySelector('#id_language');
    const opt = langSelect ? langSelect.options[langSelect.selectedIndex] : null;
    const isFileOnly = opt ? opt.getAttribute('data-fileonly') === 'True' : false;
    const fileUpload = form.querySelector('#file_upload');
    const hasFile = fileUpload && fileUpload.files && fileUpload.files.length > 0;

    if (isFileOnly && !hasFile) {
      this._showStatus('Vui lòng chọn file để nộp cho ngôn ngữ này!', 'err');
      return;
    }

    if (!isFileOnly && !code.trim() && !hasFile) {
      this._showStatus('Vui lòng nhập mã nguồn hoặc chọn file để nộp bài!', 'err');
      return;
    }

    this._isSubmitting = true;

    // 2. Start submission animation & progress bar
    this._showAnimation('', 'Đang nộp bài...', 'Hệ thống đang tiếp nhận và khởi tạo máy chấm', svg('zap', 32));
    if (typeof PageTransition !== 'undefined' && PageTransition._startProgress) {
      PageTransition._startProgress();
    }

    try {
      const formData = new FormData(form);
      if (!formData.get('source') && code) {
        formData.set('source', code);
      }

      const targetUrl = form.action || submitUrl || location.href;
      const resp = await fetch(targetUrl, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      // 3. Check for submission URL redirect
      const finalUrl = resp.url || '';
      const isSubmissionPage = /\/submission\/\d+/i.test(finalUrl);

      if (isSubmissionPage) {
        // Success animation!
        this._showAnimation(
          'success',
          'Nộp bài thành công!',
          'Đang mở trang theo dõi kết quả chấm...',
          svg('check', 36)
        );

        if (typeof PageTransition !== 'undefined' && PageTransition._finishProgress) {
          PageTransition._finishProgress();
        }

        // Smooth transition effect to open submission page
        if (this._modal) {
          this._modal.classList.add('csoj-modal-submitting-out');
        }

        setTimeout(() => {
          if (typeof document !== 'undefined') {
            document.documentElement.classList.add('csoj-page-exiting');
          }
          window.location.href = finalUrl;
        }, 380);
      } else {
        // Form returned HTML without redirect (validation error or problem)
        const html = await resp.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');

        let errorText = '';
        const errorEl = doc.querySelector('.form-errors, .errorlist, .alert-danger, #form-errors');
        if (errorEl) {
          errorText = errorEl.textContent.trim().replace(/\s+/g, ' ');
        }

        this._hideAnimation();
        this._isSubmitting = false;
        this._showStatus(errorText || 'Không thể nộp bài. Vui lòng kiểm tra lại mã nguồn!', 'err');
      }
    } catch (err) {
      this._hideAnimation();
      this._isSubmitting = false;
      this._showStatus(`Lỗi kết nối: ${err.message}. Vui lòng thử lại!`, 'err');
    }
  },

  _showStatus(msg, type = '') {
    if (!this._statusEl) return;
    this._statusEl.textContent = msg;
    this._statusEl.className = 'csoj-status ' + (type === 'err' ? 'csoj-status-err' : 'csoj-status-ok');
    setTimeout(() => {
      if (this._statusEl) {
        this._statusEl.textContent = '';
        this._statusEl.className = '';
      }
    }, 4000);
  }
};

if (typeof window !== 'undefined') {
  window.SubmitModal = SubmitModal;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SubmitModal };
}
