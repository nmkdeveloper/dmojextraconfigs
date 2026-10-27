window.addEventListener('message', async (e) => {
  const data = e.data;
  if (!data || data.type !== 'MJ_RENDER') return;

  const target = document.getElementById('render-target');
  target.innerHTML = data.html;
  try {
    if (window.MathJax && window.MathJax.typesetPromise) {
      await window.MathJax.typesetPromise([target]);
    }
    window.parent.postMessage({
      type: 'MJ_RESULT',
      id: data.id,
      html: target.innerHTML
    }, '*');
  } catch (err) {
    window.parent.postMessage({
      type: 'MJ_RESULT',
      id: data.id,
      html: data.html,
      error: String(err)
    }, '*');
  } finally {
    target.innerHTML = '';
  }
});
