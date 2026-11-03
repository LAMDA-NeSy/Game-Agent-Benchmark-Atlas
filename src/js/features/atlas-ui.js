'use strict';
(()=>{
 const paths={
  search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',
  paper:'<path d="M14 3H5v18h14V8zM14 3v6h5M8 13h8M8 17h6"/>',
  code:'<path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-14-2 16"/>',
  compare:'<rect x="3" y="4" width="7" height="16" rx="1.5"/><rect x="14" y="4" width="7" height="16" rx="1.5"/>',
  arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
  expand:'<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
  close:'<path d="m6 6 12 12M6 18 18 6"/>',
  filter:'<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="2" fill="currentColor"/><circle cx="15" cy="17" r="2" fill="currentColor"/>'
 };
 const icon=name=>paths[name]?`<svg class="atlas-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`:'';
 const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const localText=value=>typeof value==='string'?value:value?.[window.AtlasLanguage.current()]||value?.en||'';
 function mediaPreview(media){
  if(media.kind!=='image')return '';
  const preview=window.AtlasArchiveMediaPreviews?.entries.find(entry=>entry.url===media.url);
  if(!preview)return '';
  return `data-image-preview data-preview-src="./${escape(preview.image)}" data-preview-caption="${escape(localText(media.title))}" data-preview-note="${escape(localText(preview.note))}" data-preview-source="${escape(media.source)}" data-preview-original="${escape(media.url)}"`;
 }
 window.AtlasUI={icon,mediaPreview};
 // Image links retain the original-file fallback and modifier-click behavior.
 let returnState=null;
 function rememberPosition(trigger){
  const scrolls=[];
  for(let element=trigger.parentElement;element;element=element.parentElement){
   if(element.scrollHeight>element.clientHeight||element.scrollWidth>element.clientWidth)scrolls.push({element,top:element.scrollTop,left:element.scrollLeft});
  }
  return {trigger,scrolls,top:window.scrollY||0,left:window.scrollX||0};
 }
 document.addEventListener('click',event=>{
  const link=event.target.closest?.('.game-screenshot-open, [data-image-preview]');
  if(!link||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||event.button!==0)return;
  const dialog=document.getElementById('image-dialog'),figure=link.closest('figure');
  if(!dialog)return;
  let image,caption;
  const en=window.AtlasLanguage.current()==='en';
  if(link.dataset.previewSrc){
   image=document.createElement('img');image.src=link.dataset.previewSrc;image.alt=link.dataset.previewCaption;
   caption=document.createElement('figcaption');caption.textContent=link.dataset.previewCaption;
   if(link.dataset.previewNote){const note=document.createElement('small');note.textContent=link.dataset.previewNote;caption.append(note);}
   const sources=[[link.dataset.previewOriginal,en?'Original image':'原始图示'],[link.dataset.previewSource,en?'Official source':'官方来源']];
   for(const [url,label] of sources.filter(([url],index,items)=>url&&items.findIndex(([other])=>other===url)===index)){
    const source=document.createElement('a');source.href=url;source.target='_blank';source.rel='noopener noreferrer';source.textContent=label+' ↗';caption.append(source);
   }
  }else{
   if(!figure?.querySelector('img')||!figure.querySelector('figcaption'))return;
   image=figure.querySelector('img').cloneNode();caption=figure.querySelector('figcaption').cloneNode(true);
  }
  event.preventDefault();returnState=rememberPosition(link);
  image.removeAttribute('loading');image.removeAttribute('data-game-image');image.removeAttribute('data-library-image');
  const content=dialog.querySelector('.image-lightbox-content');content.replaceChildren(image,caption);
  const close=dialog.querySelector('button');close.textContent=en?'Close ×':'关闭 ×';close.setAttribute('aria-label',en?'Close image':'关闭图片');
  dialog.setAttribute('aria-label',en?'Image preview':'图片预览');
  document.body.classList.add('modal-open');if(!dialog.open)dialog.showModal();
 });
 document.addEventListener('DOMContentLoaded',()=>{
  const dialog=document.getElementById('image-dialog');if(!dialog)return;
  dialog.querySelector('button').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  dialog.addEventListener('close',()=>{
   if(!document.querySelector('dialog[open]'))document.body.classList.remove('modal-open');
   const saved=returnState;returnState=null;if(!saved)return;
   saved.trigger.focus({preventScroll:true});
   for(const {element,top,left} of saved.scrolls){element.scrollTop=top;element.scrollLeft=left;}
   window.scrollTo?.({top:saved.top,left:saved.left,behavior:'instant'});
  });
 });
})();
