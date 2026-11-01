'use strict';
(() => {
  const pairs=window.ATLAS_TRANSLATIONS;
  Object.assign(pairs,{
  "● 官方定位或任务文档　○ 编辑归类　— 未归类。标记表示分类依据的类型，不表示能力强弱。": "● Official scope or task documentation  ○ Editorial classification  — Unclassified. Symbols indicate evidence type, not capability strength.",
  "主会": " main conference",
  "预印本": " preprint",
  "技术报告": " technical report",
  "正式论文": " full paper",
  "作者官网列出": "listed on the author website",
  "arXiv全文": "arXiv full text",
  "作者声明录用；正文核读 arXiv v2": "acceptance reported by authors; reviewed text: arXiv v2",
  "官方收录；作者全文版本": "officially listed; author full-text version",
  "公开作者稿": "public author manuscript",
  "作者声明": "as reported by authors",
  "CVF正式页码": "official CVF pagination",
  "依据作者发表备注": "per the authors’ publication note",
  "首页声明；具体 workshop 名未在全文列出": "stated on the first page; workshop name absent from the full text",
  "短版": "short version",
  "本条核读arXiv扩展报告": "this record reviews the extended arXiv report",
  "首页标PMLR306；核读arXiv版": "first page lists PMLR 306; arXiv version reviewed",
  "竞赛周期": " competition cycle ",
  "作者宣布poster录用": "poster acceptance reported by authors",
  "独立会议论文，非TOG": "standalone conference paper, not TOG",
  "作者记录": "author record",
  "待正式出版": "publication pending",
  "录用状态见正文": "see full text for acceptance status",
  "状态见正文": "see full text for status",
  "正式状态见正文": "see full text for publication status",
  "正式主会状态未核验": "main-conference publication unverified",
  "正式发表未核验": "publication unverified",
  "正式会议未核验": "conference publication unverified",
  "另有相关Neurocomputing2026文章": "a related Neurocomputing 2026 article also exists",
  "正式会刊未独立核实": "venue not independently verified",
  "正式会刊未核实": "venue unverified",
  "未核实正式发表": "publication unverified",
  "既有旧手册条目": "existing handbook record",
  "修订预印本": " revised preprint",
  "投稿中": " under submission",
  "主会发表未独立核实": "main-conference publication not independently verified",
  "作者列": "authors list ",
  "未核验正式发表": "publication unverified"
});
  Object.assign(pairs,{
  "资源目录": "Resource directory",
  "所有条目采用统一的研究档案结构，分别记录文献信息、已核验任务和证据缺项。收录条目或提供代码链接不代表已完成安装或复现。": "All entries use one research archive structure. Each archive distinguishes bibliographic metadata, reviewed tasks and missing evidence. Inclusion and code availability do not imply installation or reproduction.",
  "官方仓库 · 任务与评价": "Official repository · tasks and evaluation",
  "官方实现": "Official implementation",
  "官方代码": "Official code",
  "官方代码与数据": "Official code and data",
  "官方论文 · 任务与协作指标": "Official paper · task and collaboration measures",
  "官方实现 · 环境修改": "Official implementation · environment modifications",
  "官方项目 · 设计与训练／测试关卡": "Official project · design and train/test levels",
  "官方封装文档": "Official wrapper documentation",
  "评价文档": "Evaluation documentation",
  "Jelly Bean World 官方仓库": "Official Jelly Bean World repository",
  "MiniGrid 官方 README": "Official MiniGrid README",
  "PUZZLES 官方实现": "Official PUZZLES implementation",
  "官方 README · 游戏与接口": "Official README · games and interface",
  "官方 README · 适用范围与版本说明": "Official README · scope and version warning",
  "官方 README · 分数与成就": "Official README · score and achievements",
  "Project Malmo · 官方仓库": "Project Malmo · official repository",
  "官方 README · introduction": "Official README · introduction",
  "官方 README · readme": "Official README · readme",
  "官方 README · using-smartplay": "Official README · using-smartplay",
  "请先选择条目，再对比资源或任务": "Select an entry to compare resources or tasks",
  "最多可对比 4 个条目，请先移除一个。": "Select up to 4 entries. Remove one to add another.",
  "引用已复制。投稿前请核对出版信息。": "Citation copied. Verify publisher fields before submission.",
  "引用已复制。": "Citation copied.",
  "暂时无法复制，请在“来源与引用”中选择引用文本。": "Copy unavailable here. Select the citation in Sources.",
  "来源依据": "Source evidence"
});
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
  window.AtlasLanguage={text:translate,terms:text=>[text,reverse[text]||text,pairs[text]||text],current:()=>language,localize,readURL:()=>{const next=new URLSearchParams(location.search).get('lang');if(valid(next))language=next;localize();},picker:()=>'<div class="language-picker dialog-language" role="group" aria-label="Language / 语言" data-no-i18n><button data-language="zh" lang="zh-CN" aria-pressed="'+(language==='zh')+'">中文</button><button data-language="en" lang="en" aria-pressed="'+(language==='en')+'">EN</button></div>'};
  document.addEventListener('click',e=>{const button=e.target.closest('[data-language]');if(button)setLanguage(button.dataset.language);});
  observer=new MutationObserver(localize);
  localize();
})();
