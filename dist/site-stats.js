'use strict';
(() => {
  const config = window.AtlasSiteStatsConfig || {};
  const validCount = n => Number.isSafeInteger(n) && n >= 0;
  let visits = null;
  const en = () => window.AtlasLanguage?.current() === 'en';
  const format = n => n.toLocaleString(en() ? 'en-US' : 'zh-CN');

  function render() {
    const link = document.getElementById('site-github');
    if (link) {
      const label = en() ? 'Open the GitHub repository' : '打开 GitHub 仓库';
      link.title = label;
      link.setAttribute('aria-label', label);
    }
    const label = document.getElementById('site-visit-label');
    const total = document.getElementById('site-visit-count');
    if (label && total) {
      label.textContent = en() ? 'Total visits' : '累计访问';
      total.parentElement.hidden = visits === null;
      total.textContent = visits === null ? '' : format(visits);
      total.parentElement.title = en()
        ? 'Page loads since counting began; filters and navigation are not counted.'
        : '从启用统计起累计；站内切换与筛选不重复计数。';
    }
  }

  // One request per document load. Language, route and filter changes only render.
  async function recordVisit() {
    if (!config.visitsEndpoint || location.protocol !== 'https:' ||
        location.origin !== 'https://lamda-nesy.github.io' || navigator.onLine === false) return;
    try {
      const url = new URL(config.visitsEndpoint);
      if (url.protocol !== 'https:') return;
      const response = await fetch(url, {
        method: 'POST', credentials: 'omit', referrerPolicy: 'no-referrer',
        signal: AbortSignal.timeout(6000)
      });
      if (!response.ok) return;
      const data = await response.json();
      if (validCount(data.total)) { visits = data.total; render(); }
    } catch { /* Counting must never interrupt the research catalogue. */ }
  }
  window.addEventListener('atlas-language-change', render);
  render();
  recordVisit();
})();
