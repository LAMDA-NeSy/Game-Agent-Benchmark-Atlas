'use strict';
(() => {
  const entries = new Map((window.ATLAS_GAME_IMAGES?.entries || []).map(entry => [entry.gameId, entry]));
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const text = (value, lang) => value[lang] || value.en;
  const localAsset = value => /^game-[a-z0-9-]+\.webp$/.test(value) ? './' + value : '';
  const safeSource = value => /^https:\/\//.test(value) ? value : '';
  const get = id => entries.get(id);

  function figure(id, lang = 'zh') {
    const entry = get(id);
    if (!entry || !localAsset(entry.image)) return '';
    const caption = text(entry.caption, lang);
    const open = lang === 'zh' ? '查看大图' : 'View full image';
    const source = lang === 'zh' ? '图片来源' : 'Image source';
    return `<figure class="game-screenshot${entry.pixelArt ? ' pixel-art' : ''}" data-no-i18n>
      <a class="game-screenshot-open" href="${escape(localAsset(entry.image))}" target="_blank" rel="noopener noreferrer" aria-label="${escape(open + ' · ' + caption)}"><img data-game-image src="${escape(localAsset(entry.image))}" width="${entry.width}" height="${entry.height}" alt="${escape(text(entry.alt, lang))}" loading="lazy" decoding="async"><span>${open} ↗</span></a>
      <figcaption><span class="game-screenshot-caption">${escape(caption)}</span><a href="${escape(safeSource(entry.sourceUrl))}" target="_blank" rel="noopener noreferrer">${source} · ${escape(entry.sourceLabel)} ↗</a><small>${escape(entry.credit)}</small></figcaption>
    </figure>`;
  }

  // A failed asset must not leave a broken-image box or an empty layout column.
  if (typeof document !== 'undefined') document.addEventListener('error', event => {
    const image = event.target;
    if (!image.matches?.('img[data-game-image]')) return;
    image.closest('.game-overview')?.classList.remove('has-game-image');
    image.closest('.game-screenshot')?.remove();
  }, true);
  window.AtlasGameImages = { get, figure };
})();
