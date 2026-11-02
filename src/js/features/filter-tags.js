'use strict';
(()=>{
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let opened=new Set();
 function save(){try{sessionStorage.setItem('atlas-shared-filter-tags',JSON.stringify([...opened]));}catch{}}
 // Preserve native select change contracts while presenting one-level radio choices.
 function choices(body){return body.replace(/<label>([\s\S]*?)<select ([^>]*\bid="([^"]+)"[^>]*)>([\s\S]*?)<\/select><\/label>/g,(_,label,attrs,id,options)=>{
  const entries=[...options.matchAll(/<option value="([^"]*)"([^>]*)>([\s\S]*?)<\/option>/g)];
  const current=entries.find(x=>/\bselected\b/.test(x[2]))||entries[0],disabled=/\bdisabled\b/.test(attrs);
  return `<fieldset class="filter-choice-group"><legend>${label.replace(/<[^>]*>/g,'')}</legend><select ${attrs} hidden aria-hidden="true" tabindex="-1">${options}</select>${entries.map((x,i)=>`<label class="filter-choice"><input type="radio" name="choice-${id}" id="choice-${id}-${i}" data-filter-choice="${id}" value="${x[1]}" ${x===current?'checked':''} ${disabled||/\bdisabled\b/.test(x[2])?'disabled':''}><span>${x[3]}</span></label>`).join('')}</fieldset>`;
 });}
 function tag(key,title,labels,body,count=labels.length){return `<details class="filter-category shared-filter-tag ${count?'has-selection':''}" data-shared-filter="${esc(key)}" ${opened.has(key)?'open':''} data-no-i18n><summary id="filter-tag-${esc(key)}"><span class="filter-category-name">${esc(title)}</span>${count?`<span class="filter-selected-count" aria-label="${esc(window.AtlasLanguage?.current()==='zh'?'已选 '+count+' 项':count+' selected')}">${count}</span>`:''}<span class="filter-category-arrow" aria-hidden="true"></span>${labels.length?`<span class="filter-selected-summary">${labels.map(esc).join(' · ')}</span>`:''}</summary><div class="filter-tag-body">${choices(body)}</div></details>`;}
 function panels(){return [...document.querySelectorAll('[data-shared-filter][open]')];}
 function close(panel,focus=false){panel.open=false;opened.delete(panel.dataset.sharedFilter);if(focus)panel.querySelector('summary').focus({preventScroll:true});save();}
 function place(){for(const panel of panels()){
  const summary=panel.querySelector('summary'),body=panel.querySelector('.filter-tag-body'),r=summary.getBoundingClientRect();
  if(!r.width)continue;
  const width=Math.min(310,innerWidth-24),below=innerHeight-r.bottom-16,above=r.top-96,up=below<220&&above>below;
  Object.assign(body.style,{position:'fixed',width:width+'px',left:Math.max(12,Math.min(r.left,innerWidth-width-12))+'px',maxHeight:Math.max(140,Math.min(360,up?above:below))+'px',top:up?'auto':(r.bottom+6)+'px',bottom:up?(innerHeight-r.top+6)+'px':'auto'});
 }}
 if(typeof document!=='undefined'){
  document.addEventListener('click',e=>{const summary=e.target.closest('[data-shared-filter]>summary');if(summary){e.preventDefault();const panel=summary.parentElement,wantsOpen=!panel.open;for(const p of panels())close(p);opened.clear();panel.open=wantsOpen;if(wantsOpen)opened.add(panel.dataset.sharedFilter);save();place();return;}if(!e.target.closest('[data-shared-filter]'))for(const p of panels())close(p);},true);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&panels().length){e.preventDefault();for(const p of panels())close(p,true);}});
  document.addEventListener('change',e=>{const id=e.target.dataset.filterChoice;if(!id)return;const value=e.target.value,control=document.getElementById(id);control.value=value;control.dispatchEvent(new Event('change',{bubbles:true}));const choice=[...document.querySelectorAll('[data-filter-choice]')].find(x=>x.dataset.filterChoice===id&&x.value===value);choice?.focus({preventScroll:true});place();},true);
  addEventListener('resize',place);document.addEventListener('scroll',place,true);
  new MutationObserver(()=>{if(panels().length)place();}).observe(document.documentElement,{childList:true,subtree:true});
 }
 window.AtlasFilterTags={tag};
})();
