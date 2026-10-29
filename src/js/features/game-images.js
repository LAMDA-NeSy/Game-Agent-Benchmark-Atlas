'use strict';
(() => {
  const entries = new Map((window.ATLAS_GAME_IMAGES?.entries || []).map(entry => [entry.gameId, entry]));
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const text = (value, lang) => value[lang] || value.en;
  const localAsset = value => /^game-[a-z0-9-]+\.webp$/.test(value) ? './' + value : '';
  const safeSource = value => /^https:\/\//.test(value) ? value : '';
  const get = id => entries.get(id);

  function figure(id, lang = 'zh', sampleIndex = 0) {
    const target = get(id);
    if (!target) return '';
    const samples = (target.representatives || []).filter(sample => get(sample.referenceGameId));
    const selected = Number.isInteger(sampleIndex) && sampleIndex >= 0 && sampleIndex < samples.length ? sampleIndex : 0;
    const sample = samples[selected];
    const entry = sample ? {...get(sample.referenceGameId), imageMatch: 'collection-example', imageNote: sample.imageNote} : target;
    if (sample && get(sample.referenceGameId).imageNote) {
      const originalNote = get(sample.referenceGameId).imageNote;
      entry.imageNote = Object.fromEntries(['zh', 'en'].map(language => {
        const note = text(sample.imageNote, language), inherited = text(originalNote, language);
        return [language, note.includes(inherited) ? note : note + ' ' + inherited];
      }));
    }
    if (!entry || !localAsset(entry.image)) return '';
    const caption = text(entry.caption, lang);
    const open = lang === 'zh' ? '查看原图' : 'View image';
    const source = lang === 'zh' ? '图片来源' : 'Image source';
    const reference = entry.imageMatch && entry.imageMatch !== 'exact';
    const note = reference && entry.imageNote ? `<span class="game-screenshot-note"><b>${lang === 'zh' ? '参考画面' : 'Reference image'}</b> · ${escape(text(entry.imageNote, lang))}</span>` : '';
    const license = entry.licenseLabel && safeSource(entry.licenseUrl) ? `<small><a href="${escape(entry.licenseUrl)}" target="_blank" rel="noopener noreferrer">${escape(entry.licenseLabel)}</a> · ${lang === 'zh' ? '已缩放并转为 WebP' : 'Resized and converted to WebP'}</small>` : '';
    const choices = samples.length > 1 ? `<div class="game-screenshot-choices" role="group" aria-label="${lang === 'zh' ? '代表场景' : 'Representative scenes'}"><span>${lang === 'zh' ? '代表场景' : 'Representative scenes'} · ${selected + 1}/${samples.length}</span><div>${samples.map((item, index) => `<button type="button" data-image-sample="${index}" aria-pressed="${index === selected}">${escape(text(item.label, lang))}</button>`).join('')}</div></div>` : '';
    return `<figure class="game-screenshot${entry.pixelArt ? ' pixel-art' : ''}${entry.smallPreview ? ' small-preview' : ''}" data-game-image-id="${escape(id)}" data-image-lang="${escape(lang)}" data-no-i18n>
      ${choices}
      <a class="game-screenshot-open" href="${escape(localAsset(entry.image))}" target="_blank" rel="noopener noreferrer" aria-label="${escape(open + ' · ' + caption)}"><img data-game-image src="${escape(localAsset(entry.image))}" width="${entry.width}" height="${entry.height}" alt="${escape(text(entry.alt, lang))}" loading="lazy" decoding="async"><span>${open} ↗</span></a>
      <figcaption><span class="game-screenshot-caption">${escape(caption)}</span>${note}<a href="${escape(safeSource(entry.sourceUrl))}" target="_blank" rel="noopener noreferrer">${source} · ${escape(entry.sourceLabel)} ↗</a><small>${escape(entry.credit)}</small>${license}</figcaption>
    </figure>`;
  }

  // Keep the selected scene, its attribution and its difference note together.
  if (typeof document !== 'undefined') document.addEventListener('click', event => {
    const button = event.target.closest?.('button[data-image-sample]');
    const current = button?.closest('figure[data-game-image-id]');
    if (!current) return;
    event.preventDefault();
    const parent = current.parentElement;
    current.outerHTML = figure(current.dataset.gameImageId, current.dataset.imageLang, Number(button.dataset.imageSample));
    parent?.querySelector('.game-screenshot-choices button[aria-pressed="true"]')?.focus({preventScroll: true});
  });

  // A failed asset must not leave a broken-image box or an empty layout column.
  if (typeof document !== 'undefined') document.addEventListener('error', event => {
    const image = event.target;
    if (!image.matches?.('img[data-game-image]')) return;
    image.closest('.game-overview')?.classList.remove('has-game-image');
    image.closest('.game-screenshot')?.remove();
  }, true);
  window.AtlasGameImages = { get, figure };
})();
