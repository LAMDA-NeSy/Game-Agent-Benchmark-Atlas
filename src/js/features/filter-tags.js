'use strict';
(()=>{
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let opened=new Set();try{const saved=JSON.parse(sessionStorage.getItem('atlas-shared-filter-tags')||'[]');if(Array.isArray(saved))opened=new Set(saved);}catch{}
 function tag(key,title,labels,body,count=labels.length){return `<details class="filter-category shared-filter-tag ${count?'has-selection':''}" data-shared-filter="${esc(key)}" ${opened.has(key)?'open':''} data-no-i18n><summary id="filter-tag-${esc(key)}"><span class="filter-category-name">${esc(title)}</span>${count?`<span class="filter-selected-count">${count}</span>`:''}<span class="filter-category-arrow" aria-hidden="true"></span>${labels.length?`<span class="filter-selected-summary">${labels.map(esc).join(' · ')}</span>`:''}</summary><div class="filter-tag-body">${body}</div></details>`;}
 if(typeof document!=='undefined')document.addEventListener('click',e=>{const summary=e.target.closest('[data-shared-filter]>summary');if(!summary)return;e.preventDefault();const panel=summary.parentElement;panel.open=!panel.open;if(panel.open)opened.add(panel.dataset.sharedFilter);else opened.delete(panel.dataset.sharedFilter);try{sessionStorage.setItem('atlas-shared-filter-tags',JSON.stringify([...opened]));}catch{}},true);
 window.AtlasFilterTags={tag};
})();
