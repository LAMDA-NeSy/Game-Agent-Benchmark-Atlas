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
 window.AtlasUI={icon};
 // Image links retain the original-file fallback and modifier-click behavior.
 let returnFocus=null;
 document.addEventListener('click',event=>{
  const link=event.target.closest?.('.game-screenshot-open');
  if(!link||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||event.button!==0)return;
  const dialog=document.getElementById('image-dialog'),figure=link.closest('figure');
  if(!dialog||!figure)return;
  event.preventDefault();returnFocus=link;
  const image=figure.querySelector('img').cloneNode();image.removeAttribute('loading');image.removeAttribute('data-game-image');
  const caption=figure.querySelector('figcaption').cloneNode(true);
  const content=dialog.querySelector('.image-lightbox-content');content.replaceChildren(image,caption);
  const en=window.AtlasLanguage.current()==='en';
  dialog.querySelector('button').setAttribute('aria-label',en?'Close image':'关闭图片');
  document.body.classList.add('modal-open');dialog.showModal();
 });
 document.addEventListener('DOMContentLoaded',()=>{
  const dialog=document.getElementById('image-dialog');if(!dialog)return;
  dialog.querySelector('button').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  dialog.addEventListener('close',()=>{returnFocus?.focus({preventScroll:true});returnFocus=null;});
 });
})();
