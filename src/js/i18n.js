'use strict';
(() => {
  const pairs=window.ATLAS_TRANSLATIONS;
  Object.assign(pairs,{
    '按研究问题查找评测任务，比较协议与适用边界。':'Find tasks by research question and compare protocols and limitations.',
    '文档核验不等于独立复现。':'Documentation review is not independent reproduction.',
    '未归类':'Unclassified',
    '文献核验不代表独立复现；任务的版本、预算与限制在协议中列示。':'Documentation review is not independent reproduction; protocols specify versions, budgets and limitations.'
  });
  const reverse={...Object.fromEntries(Object.entries(pairs).map(([zh,en])=>[en,zh])),...window.ATLAS_EN_TO_ZH};
  const zhKeys=Object.keys(pairs).sort((a,b)=>b.length-a.length);
  const compositePattern=new RegExp(zhKeys.map(k=>k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'),'g');
  let language='zh';
  const valid=x=>x==='zh'||x==='en';
  try {const saved=localStorage.getItem('atlas-language');if(valid(saved))language=saved;} catch {}
  const urlLanguage=new URLSearchParams(location.search).get('lang');
  if(valid(urlLanguage))language=urlLanguage;
  const originals=new WeakMap();
  const ignore='script,style,noscript,pre,code,[data-no-i18n],.brand,.footer-brand,h1,.paper-title,.paper-authors,.detail-paper-title,.detail-authors,#detail-title,.title-button,.bibtex';
  const attrs=['aria-label','title','placeholder'];
  function translate(text){
    const trimmed=text.trim();if(!trimmed)return text;
    let out;
    if(language==='en'){
      out=pairs[trimmed]||trimmed;
      if(out===trimmed){
        out=out.replace(/^显示$/,'Showing').replace(/^\/ (\d+) 个研究条目$/,'/ $1 research entries')
          .replace(/^检查于 (\S+) · 未独立复现$/,'Checked $1 · Not independently reproduced')
          .replace(/^相同项 (\d+) 项已隐藏 · 可横向滚动$/,'$1 identical rows hidden · Scroll horizontally')
          .replace(/^查看 (\d+) 个相关条目 ↗$/,'View $1 related entries ↗')
          .replace(/^加入对比：(.+)$/,'Add to comparison: $1').replace(/^移出对比：(.+)$/,'Remove from comparison: $1')
          .replace(/^查看 (.+) 的分类依据$/,'Classification evidence: $1')
          .replace(/^查看(.+)的 (\d+) 个相关条目$/,'View $2 entries for $1')
          .replace(/^研究主题：/,'Research theme: ').replace(/^官方 README · /,'Official README · ')
          .replace(/^任务文档 · Description$/,'Task documentation · Description');
        // Composite labels consist of reviewed dictionary entries plus punctuation.
        out=out.replace(compositePattern,k=>pairs[k]);
      }
    } else {
      out=reverse[trimmed]||trimmed;
      if(out===trimmed)out=out.replace(/^(\d+) selected$/,'已选 $1 项').replace(/^(\d+) research entries$/,'$1 个研究条目')
        .replace(/^Exported (\d+) research entr(?:y|ies)\.$/,'已导出 $1 个研究条目。')
        .replace(/^SOURCE STATUS · /,'来源状态 · ').replace(/^COMPARATIVE OVERVIEW \/ (\d+) ENTRIES$/,'并列对照 / $1 个条目')
        .replace(/^Read (.+) paper$/,'阅读 $1 论文').replace(/^(.+) GitHub repository$/,'$1 GitHub 仓库')
        .replace(/^LAST REVIEWED · /,'最后核查 · ');
    }
    return text.replace(trimmed,out);
  }
  function localizeValue(node,key,value,set){
    let values=originals.get(node);if(!values){values={};originals.set(node,values);}
    let item=values[key];if(!item||value!==item.last)item=values[key]={source:value,last:value};
    const next=translate(item.source);item.last=next;if(value!==next)set(next);
  }
  let observer;
  function localize(){
    observer?.disconnect();
    document.documentElement.lang=language==='zh'?'zh-CN':'en';
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    let n;while((n=walker.nextNode())){
      if(!n.parentElement?.closest(ignore))localizeValue(n,'text',n.nodeValue,v=>{n.nodeValue=v;});
    }
    document.querySelectorAll('[aria-label],[title],[placeholder]').forEach(el=>{
      if(el.closest(ignore))return;
      for(const key of attrs)if(el.hasAttribute(key))localizeValue(el,key,el.getAttribute(key),v=>el.setAttribute(key,v));
    });
    document.querySelectorAll('[data-language]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.language===language)));
    observer?.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:attrs});
  }
  function setLanguage(next){
    if(!valid(next))return;
    const focused=document.activeElement;
    const dialogId=focused?.closest('dialog')?.id;
    language=next;
    try{localStorage.setItem('atlas-language',next);}catch{}
    const url=new URL(location.href);url.searchParams.set('lang',next);history.replaceState({},'',url.pathname+url.search+url.hash);
    document.dispatchEvent(new CustomEvent('atlas-language-before-change'));
    window.dispatchEvent(new CustomEvent('atlas-language-change'));
    localize();
    if(focused?.dataset.language && !focused.isConnected)document.querySelector((dialogId?'#'+dialogId:'header')+' [data-language="'+next+'"]')?.focus();
  }
  window.AtlasLanguage={terms:text=>[text,reverse[text]||text,pairs[text]||text],current:()=>language,localize,readURL:()=>{const next=new URLSearchParams(location.search).get('lang');if(valid(next))language=next;localize();},picker:()=>'<div class="language-picker dialog-language" role="group" aria-label="Language / 语言" data-no-i18n><button data-language="zh" lang="zh-CN" aria-pressed="'+(language==='zh')+'">中文</button><button data-language="en" lang="en" aria-pressed="'+(language==='en')+'">EN</button></div>'};
  document.addEventListener('click',e=>{const button=e.target.closest('[data-language]');if(button)setLanguage(button.dataset.language);});
  observer=new MutationObserver(localize);
  localize();
})();
