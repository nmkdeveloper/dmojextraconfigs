window.MathJax = {
  loader: { load: ['[tex]/color', '[tex]/textmacros', '[tex]/unicode'] },
  tex: {
    packages: { '[+]': ['color', 'textmacros', 'unicode'] },
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    displayMath: [['$$', '$$'], ['\\[', '\\]']]
  },
  svg: { fontCache: 'none' },
  options: { enableMenu: false },
  startup: {
    typeset: false,
    ready: () => {
      MathJax.startup.defaultReady();
      MathJax.startup.promise.then(() => {
        window.__mjReady = true;
        window.parent.postMessage({ type: 'MJ_READY' }, '*');
      });
    }
  }
};
