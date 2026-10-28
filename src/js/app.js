'use strict';
(() => {
  const records = window.ATLAS_DATA.records;
  const gameRoles=window.AtlasGameRolesModel.create(window.ATLAS_DATA,window.ATLAS_GAME_ROLES);
  const model=window.AtlasModel.create(window.ATLAS_DATA,{gameRoles});
  const facets=window.ATLAS_DATA.facets;
  const interactionLabels={single:'单智能体',cooperative:'合作',competitive:'竞争',configurable:'取决于配置'};
  const gameRecords=[...records,...(window.ATLAS_DATA.gameCatalogRecords||[])];
  const byId = new Map(gameRecords.map(r => [r.id, r]));
  const bilingual=(zh,en)=>window.AtlasLanguage.current()==='zh'?zh:en;
  const genreTitle=c=>({MOBA:['多人在线战术竞技（MOBA）','MOBA'],Board:['棋类与桌游','Board / tabletop'],'Tower defense':['塔防','Tower defense'],'Shoot-em-up':['清版射击（STG）','Shoot ’em up'],Unresolved:['游戏归属待确认','Game identity pending'],'Related research':['开发与相关研究','Development & related research']}[c]?.[window.AtlasLanguage.current()==='zh'?0:1]||c);
  const codeLink=(r,label='Code ↗',cls='')=>{const url=r.repoURL||(r.repo?'https://github.com/'+r.repo:null);return url?`<a class="${cls}" href="${escape(url)}" target="_blank" rel="noopener noreferrer">${label}</a>`:`<span class="source-unavailable">${window.AtlasLanguage.current()==='zh'?'代码待核验':'Code unverified'}</span>`;};
  const sourceBadge=r=>r.detailLevel==='source'?'来源关联条目':'深度任务档案';
  const questions = window.ATLAS_DATA.questions;
  const questionById = new Map(questions.map(q => [q.id,q]));
  const taxonomy = window.ATLAS_DATA.taxonomy;
  const gameIndex=window.ATLAS_DATA.gameIndex;
  const gameById=new Map(gameIndex.map(g=>[g.id,g]));
  const englishOrder=new Intl.Collator('en',{sensitivity:'base',numeric:true});
  const englishNameOrder=(a,b)=>englishOrder.compare(a.name,b.name)||englishOrder.compare(a.id,b.id);
  const auxiliaryCategories=[...(facets.auxiliaryCategories||[])].sort(englishOrder.compare);
  const gameCategories=[...facets.categories.filter(c=>!auxiliaryCategories.includes(c)).sort(englishOrder.compare),...auxiliaryCategories];
  const gameKind={game:'具体游戏',environment:'研究环境',family:'环境家族',collection:'游戏集合',task:'决策任务',unresolved:'游戏归属待确认','non-game':'非具体游戏研究'};
  const relationName={native:'原生环境 / 基准',suite:'套件子游戏',adapted:'基于已有任务接入'};
  const currentGame=()=>gameById.get(state.game);
  const gameDisplayName=g=>window.AtlasLanguage.current()==='zh'&&g.nameZh?g.nameZh:g.name;
  const gameNameHTML=(g,secondary=true)=>`<span class="game-name" data-no-i18n><span>${escape(g.kind==='unresolved'?bilingual('具体游戏待确认','Game identity pending'):gameDisplayName(g))}</span>${secondary&&window.AtlasLanguage.current()==='zh'&&g.nameZh?`<small class="game-original-name" lang="en">${escape(g.name)}</small>`:''}</span>`;
  const gameTitleText=g=>window.AtlasLanguage.current()==='zh'&&g.nameZh?`${g.nameZh} (${g.name})`:g.name;
  function gameIndexItemHTML(game,selectedId){
    const links=game.links.filter(gameScopeLink);
    const online=gameRoles.summary(game.id,{benchmarkIds:links.map(l=>l.benchmark)}).counts.online;
    return `<button class="game-index-item" data-game-open="${escape(game.id)}" aria-pressed="${selectedId===game.id}">${gameNameHTML(game)}${game.kind!=='game'?`<em class="game-index-kind">${gameKind[game.kind]}</em>`:''}<span class="game-index-counts" data-no-i18n><span><b>${links.length}</b> ${bilingual('条研究','research')}</span><span><b>${online}</b> ${bilingual('在线来源（文档）','online sources (docs)')}</span></span></button>`;
  }
  const namedGame=label=>gameIndex.find(g=>g.name===label);
  const gameSearchTerms=r=>gameIndex.filter(g=>g.links.some(x=>x.benchmark===r.id)).flatMap(g=>[g.name,g.nameZh||'',...(g.aliases||[])]);
  const gameLink=r=>currentGame()?.links.find(x=>x.benchmark===r.id);
  let differencesOnly=false,gameFiltersOpen=false,gameSearchLimit=30;
  const openProfiles=new Set();
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const escape = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const paths = {
    'arrow-right':'M4 12h16m-6-6 6 6-6 6','arrow-down':'M12 4v16m-6-6 6 6 6-6','arrow-up-right':'M6 18 18 6M6 6h12v12',
    search:'m21 21-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
    compare:'M4 3v18M20 3v18M8 7h8m-3-3 3 3-3 3M16 17H8m3-3-3 3 3 3',
    sliders:'M4 4v7m0 5v4M12 4v2m0 5v9M20 4v10m0 5v1M1 11h6M9 6h6m2 8h6',
    route:'M5 5h7a4 4 0 0 1 0 8H9a4 4 0 0 0 0 8h9M5 2v6m13 10v5',
    users:'M9 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6M15 4a3 3 0 0 1 0 6M3 21v-3a6 6 0 0 1 12 0v3m1-8a5 5 0 0 1 5 5v3',
    branch:'M12 3v6M5 21v-8h14v8M12 13v8M9 3h6M2 21h6m1 0h6m1 0h6',
    layers:'m12 3 10 5-10 5L2 8l10-5Zm-10 9 10 5 10-5M2 16l10 5 10-5',
    grid:'M3 3h7v7H3V3Zm11 0h7v7h-7V3ZM3 14h7v7H3v-7Zm11 0h7v7h-7v-7Z',
    list:'M8 6h13M8 12h13M8 18h13M3 6h1M3 12h1M3 18h1',
    book:'M3 3h7l2 2 2-2h7v17h-7l-2 1-2-1H3V3Zm9 2v16',
    download:'M12 3v12m-5-5 5 5 5-5M4 15v6h16v-6',
    info:'M12 10v7m0-11v1M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
    paper:'M14 2H4v20h16V8l-6-6Zm0 0v6h6M8 12h8m-8 4h8',
    code:'m8 5-6 7 6 7m8-14 6 7-6 7M14 2l-4 20',
    plus:'M12 5v14M5 12h14',check:'m5 12 4 4L20 5',
    compass:'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0m-6-4-3 7-7 3 3-7 7-3Z',
    brain:'M12 3v18M12 5C6-2 2 5 5 8c-7 2-2 9 1 8-1 7 6 6 6 2m0-13c6-7 10 0 7 3 7 2 2 9-1 8 1 7-6 6-6 2',
    strategy:'M4 20h16M7 20v-4h10v4M10 16V8h4v8M9 3h6v5H9V3Z',
    message:'M3 3h18v14H9l-6 4V3Zm4 5h10M7 12h7',
    control:'M7 8h10a5 5 0 0 1 5 5v4a3 3 0 0 1-5 2l-2-2H9l-2 2a3 3 0 0 1-5-2v-4a5 5 0 0 1 5-5ZM7 10v5M4.5 12.5h5M16 11h1m1 3h1',
    copy:'M8 8h13v13H8V8ZM16 8V3H3v13h5'
  };
  const icon = (name, cls='') => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name] || paths.grid}" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const decorate = () => $$('[data-icon]').forEach(el => { el.innerHTML = icon(el.dataset.icon); });
  const capabilities = [
    {id:'long-horizon',label:'Long-horizon',zh:'长时程',icon:'route',description:'Maintain goals and make progress through extended sequences of interaction.'},
    {id:'planning',label:'Planning',zh:'规划',icon:'branch',description:'Decompose goals, handle dependencies and revise plans after feedback.'},
    {id:'coordination',label:'Coordination',zh:'多智能体协作',icon:'users',description:'Divide work, synchronize actions and achieve shared outcomes.'},
    {id:'strategy',label:'Strategy',zh:'策略',icon:'strategy',description:'Make resource trade-offs and respond to opponents over time.'},
    {id:'memory',label:'Memory',zh:'记忆',icon:'brain',description:'Use past observations when the current view is incomplete.'},
    {id:'exploration',label:'Exploration',zh:'探索',icon:'compass',description:'Discover useful states, rules and opportunities through interaction.'},
    {id:'generalization',label:'Generalization',zh:'泛化',icon:'layers',description:'Transfer behavior to unseen levels, tasks or configurations.'},
    {id:'social',label:'Social reasoning',zh:'社会推理',icon:'message',description:'Interpret intentions and communicate under limited information.'},
    {id:'control',label:'Grounding & control',zh:'感知与控制',icon:'control',description:'Translate observations and decisions into effective game actions.'}
  ];
  const capById = new Map(capabilities.map(c => [c.id,c]));
  const genres = facets.categories;
  const genreInfo = {
    'Multi-game':['mosaic','A shared view across diverse environments.'],
    'Sandbox':['sandbox','Explore, gather resources and pursue open-ended goals.'],
    'Strategy':['strategy','Tactical combat and strategic decisions.'],
    'Cooperative':['kitchen','Shared goals, different roles and joint decisions.'],
    'Cards':['cards','Hidden information and structured game rules.'],
    'Arcade':['arcade','Visual feedback and precise action.'],
    'Roguelike':['dungeon','Exploration, survival and persistent uncertainty.'],
    'Puzzle':['grid','Rules, navigation and goal-directed reasoning.'],
    'Sports':['football','Spatial control, teammates and opponents.'],
    'Text adventure':['terminal','Worlds described through language.']
  };
  let state={view:'themes',question:null,q:'',agents:[],caps:[],genres:[],interactions:[],kinds:[],sort:'curated',layout:'grid',detail:null,game:'minecraft',gameCategory:'Sandbox'};
  let selected=[];
  try { selected=JSON.parse(localStorage.getItem('atlas-compare')||'[]').filter(id=>byId.has(id)).slice(0,4); } catch {}
  let detailTab='overview';
  let toastTimer;
  const capLabel=id=>capById.get(id)?.label||id;
  const capName=id=>taxonomy[id]?.[0]||capLabel(id);
  const currentQuestion=()=>questionById.get(state.question);
  const sourceLink=e=>`<a class="evidence-link" href="${escape(e.source)}" target="_blank" rel="noopener noreferrer">${escape(e.locator)} ↗</a>`;
  function evidenceHTML(r,filterCap=null){if(r.detailLevel==='source')return `<article class="classification-evidence"><div class="evidence-heading"><h3>${filterCap?escape(capName(filterCap)):'分类依据'}</h3><span class="basis-label editorial">编辑归类</span></div><p>${escape(r.sourceRationale)}</p><p class="evidence-scope"><strong>适用范围</strong> ${escape(r.limit)}</p><div class="source-list">${r.sourceEvidence.map((url,i)=>`<a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${i+1} · ${escape(url)} ↗</a>`).join('')}</div><small class="source-date">检查于 ${r.sourceChecked} · 未独立复现</small></article>`;return r.evidence.filter(e=>!filterCap||e.cap===filterCap).map(e=>`<article class="classification-evidence"><div class="evidence-heading"><h3>${escape(capName(e.cap))} <small data-no-i18n>${escape(capLabel(e.cap))}</small></h3><span class="basis-label ${e.basis==='编辑归类'?'editorial':''}">${escape(e.basis)}</span></div><p>${escape(e.mechanism)}</p><p class="evidence-scope"><strong>适用范围</strong> ${escape(e.scope)}</p>${sourceLink(e)}<small class="source-date">检查于 ${e.checked} · 未独立复现</small></article>`).join('');}
  function renderQuestions(){
    $('#question-grid').innerHTML=`<p class="discovery-scope" data-no-i18n>${bilingual(`主题索引 · ${records.length} 篇精选文献`,`Theme index · ${records.length} selected papers`)}</p><table class="theme-table"><caption class="sr-only">研究主题、评估关注点、协议要素与相关条目</caption><thead><tr><th scope="col">研究主题</th><th scope="col">评估关注点</th><th scope="col">关键协议要素</th><th scope="col">条目</th></tr></thead><tbody>${questions.map(q=>`<tr class="${state.question===q.id?'active':''}"><th scope="row"><button data-question="${q.id}" aria-pressed="${state.question===q.id}"><span>${escape(q.label)}</span></button></th><td>${escape(q.description)}</td><td class="theme-checks">${q.checks.map(x=>`<span>${escape(x)}</span>`).join(' · ')}</td><td><button class="theme-count" data-question="${q.id}" aria-label="查看${escape(q.label)}的 ${model.themeRecords(q.id).length} 个相关条目">${model.themeRecords(q.id).length} <span aria-hidden="true">→</span></button></td></tr>`).join('')}</tbody></table>`;
  }
  function renderResearchContext(){
    const q=currentQuestion();
    $('#research-context').innerHTML=q?`<section class="research-context"><div class="context-title"><h3>${escape(q.label)} </h3><button class="text-button" id="clear-question">移除主题筛选 ×</button></div><p><span>${escape(q.description)}</span> <span>关键协议要素</span>: ${q.checks.map(x=>`<span>${escape(x)}</span>`).join(" · ")}</p><p>${escape(q.decision)}</p><div class="context-bottom"><button class="text-button" data-question-basis="${q.cap}">分类定义与边界</button></div></section>`:'';
  }
  function chooseQuestion(id){state.question=id;state.view='themes';state.q='';state.caps=[];state.detail=null;closeAll();writeURL(true);render();$('#collection').scrollIntoView({behavior:'auto'});}
  function readURL(){
    window.AtlasArena.readURL();
    const p=new URLSearchParams(location.search);
    const valid=(key,values)=>(p.get(key)||'').split(',').filter(x=>values.includes(x));
    state={...state,catalog:'archives',view:window.AtlasModel.resolveView(p),q:p.get('q')||'',agents:valid('agent',['LLM','VLM','VLA','IL','RL']),caps:valid('capability',capabilities.map(c=>c.id)),genres:model.normalizeGenres((p.get('genre')||'').split(',')),interactions:valid('interaction',facets.interactions),kinds:valid('kind',window.ATLAS_DATA.gameFacets.kinds),sort:['newest','name'].includes(p.get('sort'))?p.get('sort'):'curated',detail:window.AtlasResearchArchives.canonical(p.get('detail'))};
    state.gameResource=p.get('gameResource')==='evaluation'?'evaluation':'all';
    state.gameReview=['reviewed','tasks'].includes(p.get('gameReview'))?p.get('gameReview'):'all';
    state.gameSearch=p.get('gameSearch')||'';
    state.gameUsage=['data','offline','online','related','unverified'].includes(p.get('gameUsage'))?p.get('gameUsage'):'all';
    state.gameCapability=window.ATLAS_DATA.taskDimensions.some(d=>d.id===p.get('gameCapability'))?p.get('gameCapability'):null;
    state.gameAssociation=p.get('gameAssociation')==='secondary'?'secondary':'primary';
    state.question=questionById.has(p.get('question'))?p.get('question'):null;
    if((p.get('genre')||'').split(',').includes('Cooperative'))state.interactions=[...new Set([...state.interactions,'cooperative'])];
    if(p.has('compare'))selected=[...new Set((p.get('compare')||'').split(',').map(id=>window.AtlasResearchArchives.canonical(id)).filter(Boolean))].slice(0,4);
    state.compareOpen=p.get('comparison')==='1';
    Object.assign(state,model.gameRoute(p.get('category'),p.get('game')));
  }
  function writeURL(push=false){
    const p=new URLSearchParams();
    p.set("lang",window.AtlasLanguage.current());
    p.set('view',state.view);
    if(state.view==='explore'){const previous=new URLSearchParams(location.search);p.set('catalog','archives');for(const [key,value] of previous)if(key.startsWith('library'))p.set(key,value);if(!previous.has('question')&&(!previous.has('view')||previous.get('view')==='explore'))for(const [oldKey,newKey] of Object.entries({q:'libraryQ',agent:'libraryAgent',capability:'libraryCap',genre:'libraryGenre',interaction:'libraryInteraction',kind:'libraryKind',sort:'librarySort'}))if(previous.has(oldKey)&&!p.has(newKey))p.set(newKey,previous.get(oldKey));}
    if(state.view==='arena')p.set('arenaPanel',window.AtlasArena.panel());
    if(state.view==='games'){p.set('category',state.gameCategory);p.set('game',state.game);if(state.gameResource==='evaluation')p.set('gameResource','evaluation');if(['reviewed','tasks'].includes(state.gameReview))p.set('gameReview',state.gameReview);if(state.gameSearch)p.set('gameSearch',state.gameSearch);if(state.gameUsage&&state.gameUsage!=='all')p.set('gameUsage',state.gameUsage);if(state.gameCapability){p.set('gameCapability',state.gameCapability);if(state.gameAssociation==='secondary')p.set('gameAssociation','secondary');}}
    if(state.view!=='explore'&&state.q)p.set('q',state.q);
    if(state.view!=='explore'&&state.question)p.set('question',state.question);
    if(state.view!=='explore'&&state.agents.length)p.set('agent',state.agents.join(','));
    if(state.view!=='explore'&&state.caps.length)p.set('capability',state.caps.join(','));
    if(state.view!=='explore'&&state.genres.length)p.set('genre',state.genres.join(','));
    if(state.view!=='explore'&&state.interactions.length)p.set('interaction',state.interactions.join(','));
    if(state.view!=='explore'&&state.kinds.length)p.set('kind',state.kinds.join(','));
    if(state.compareOpen){p.set('comparison','1');p.set('compare',selected.join(','));}
    if(state.view!=='explore'&&state.sort!=='curated')p.set('sort',state.sort);
    if(state.detail)p.set('detail',state.detail);
    history[push?'pushState':'replaceState']({},'',location.pathname+(p.size?'?'+p.toString():''));
  }
  const norm=s=>s.normalize('NFKC').toLowerCase();
  function searchText(r){return [r.name,r.title,...r.authors,...r.games,...gameSearchTerms(r),...r.genres.flatMap(g=>window.AtlasLanguage.terms(g)),...r.agents,r.summary,r.zh,...r.caps.flatMap(c=>[capLabel(c),capName(c)])].join(' ');}
  function matches(r,ignore=null,gameId=null){if(gameId&&!gameScopeLink(gameById.get(gameId)?.links.find(l=>l.benchmark===r.id)))return false;return model.matches(r,state,{ignore,gameId,searchText:searchText(r)});}
  function gameScopeLink(l){return model.gameScopeLink(l,state);}
  function filteredGameLinks(ignoreCapability=false,ignoreUsage=false){const axis=!ignoreCapability&&state.gameCapability?window.AtlasTaskCoverage.model.summarize({gameId:state.game}).axes.find(a=>a.id===state.gameCapability):null;const allowed=axis?new Set(axis[state.gameAssociation||'primary']):null;return currentGame().links.filter(l=>(!allowed||allowed.has(l.benchmark))&&(ignoreUsage||!state.gameUsage||state.gameUsage==='all'||gameRoles.classify(state.game,l.benchmark).roles.includes(state.gameUsage))&&gameScopeLink(l)&&matches(byId.get(l.benchmark),null,state.game)).sort((a,b)=>englishNameOrder(byId.get(a.benchmark),byId.get(b.benchmark)));}
  function relevance(r){return currentQuestion()?.candidates[r.id]||'该条目具有对应能力标签；任务适用性见分类依据。';}
  function getResults(){
    const rows=records.filter(r=>matches(r));
    if(state.sort==='newest')rows.sort((a,b)=>b.year-a.year||a.name.localeCompare(b.name));
    if(state.sort==='name')rows.sort((a,b)=>a.name.localeCompare(b.name));
    if(state.sort==='curated'&&currentQuestion()){const ids=Object.keys(currentQuestion().candidates);const rank=r=>ids.includes(r.id)?ids.indexOf(r.id):ids.length;rows.sort((a,b)=>rank(a)-rank(b));}
    return rows;
  }
  function filterMarkup(gameId=null){
    const selectedAxis=gameId&&state.gameCapability?window.AtlasTaskCoverage.model.summarize({gameId}).axes.find(a=>a.id===state.gameCapability):null;
    const allowed=selectedAxis?new Set(selectedAxis[state.gameAssociation||'primary']):null;
    const groups=[{key:'agents',name:'智能体范式 · 文档记录',items:['LLM','VLM','VLA','IL','RL'].map(id=>({id,label:id}))},{key:'caps',name:'研究能力 · 主题覆盖',items:capabilities.map(c=>({id:c.id,label:capName(c.id)}))},{key:'genres',name:'游戏类型',items:genres.map(id=>({id,label:id}))},{key:'interactions',name:'交互关系',items:facets.interactions.map(id=>({id,label:interactionLabels[id]}))},{key:'kinds',name:'条目性质',items:(gameId?window.ATLAS_DATA.gameFacets.kinds:facets.kinds).map(id=>({id,label:id}))}];
    return groups.filter(g=>!gameId||!['caps','genres'].includes(g.key)).map(g=>`<fieldset class="filter-group"><legend>${g.name}</legend>${g.items.map(x=>`<label class="filter-option"><input type="checkbox" data-filter="${g.key}" value="${escape(x.id)}" ${state[g.key].includes(x.id)?'checked':''}><span>${escape(x.label)}</span><span class="count">${(gameId?gameRecords:records).filter(r=>(!allowed||allowed.has(r.id))&&matches(r,g.key,gameId)&&model.projection(r,gameId)?.[g.key].includes(x.id)).length}</span></label>`).join('')}</fieldset>`).join('');
  }
  function buildFilters(){$('#filter-groups').innerHTML=filterMarkup();document.querySelector('[data-preset=all] span').textContent=records.length;}
  function accessHTML(r){if(r.detailLevel==='source')return '<p class="access-status">来源已核对；任务协议需另行固定</p>';return `<p class="access-status"><span>${r.access.mode==='native'?'原生研究接口':'官方评测适配'}</span> · <span>文档已核对；未安装或运行</span></p>`;}
  const agentBadges=r=>r.agents.map(a=>`<span class="agent-badge ${a.toLowerCase()}">${a}</span>`).join('');
  const capTags=r=>r.caps.map(c=>`<button class="tag" data-evidence="${r.id}" data-cap="${c}" title="查看 ${escape(capName(c))} 的分类依据">${escape(capName(c))} ↗</button>`).join('');
  function directoryRow(r){
    const isSelected=selected.includes(r.id);
    return `<tr data-record="${r.id}"><td class="select-cell"><button class="compare-toggle ${isSelected?'selected':''}" data-compare="${r.id}" aria-pressed="${isSelected}" aria-label="${isSelected?'移出':'加入'}对比：${escape(r.name)}">${icon(isSelected?'check':'plus')}</button></td><th scope="row" class="bibliography-cell"><button class="title-button" data-detail="${r.id}">${escape(r.name)}</button><p class="paper-title">${escape(r.title)}</p><p class="paper-authors">${escape(r.authors[0])}${r.authors.length>1?' et al.':''} <span>· ${escape(r.venue)}</span></p><span class="entry-kind"><span>${escape(r.kind)}</span> · <span>${sourceBadge(r)}</span></span></th><td class="task-cell"><p>${escape(r.research.scope)}</p>${currentQuestion()?`<p class="relevance-note"><span>${model.priority(r,state.question)?'重点候选':'其他相关条目'}</span>${escape(relevance(r))}</p>`:''}</td><td class="capability-cell"><div class="card-tags">${capTags(r)}</div><button class="evidence-button" data-evidence="${r.id}">分类依据</button></td><td><div class="agent-badges">${agentBadges(r)}</div><details class="access-note"><summary>接入说明</summary>${accessHTML(r)}</details></td><td class="resource-cell"><a href="${escape(r.paper)}" target="_blank" rel="noopener noreferrer" aria-label="Read ${escape(r.name)} paper">Paper ↗</a>${codeLink(r)}</td></tr>`;
  }
  function renderResults(){
    const rows=getResults();
    renderResearchContext();
    $('#results-count').innerHTML=`显示 <strong>${rows.length}</strong> / ${records.length} 个研究条目`;
    $('#results').innerHTML=rows.length?`<table class="directory-table"><caption class="sr-only">Benchmark 文献、任务范围、能力分类、智能体与来源</caption><thead><tr><th scope="col" class="select-cell"><span class="sr-only">对比</span></th><th scope="col">Benchmark / 文献</th><th scope="col">任务与评估范围</th><th scope="col">能力分类</th><th scope="col">Agent</th><th scope="col">资源</th></tr></thead><tbody>${rows.map(directoryRow).join('')}</tbody></table>`:`<div class="empty-state">${icon('search')}<h3>当前条件下没有候选</h3><p>可以放宽智能体或游戏条件，或清除当前研究问题重新探索。</p><button class="button dark" data-reset>清除全部条件 ${icon('arrow-right')}</button></div>`;
    $('#results').className='directory-wrap';
    const chips=state.question?[`<button class="active-filter" id="clear-question">研究主题：${escape(currentQuestion().label)} ×</button>`]:[];
    for(const key of ['agents','caps','genres','interactions','kinds'])for(const id of state[key])chips.push(`<button class="active-filter" data-remove-filter="${key}" data-value="${escape(id)}">${escape(key==='caps'?capLabel(id):key==='interactions'?interactionLabels[id]:id)}<span aria-hidden="true">×</span><span class="sr-only">Remove filter</span></button>`);
    $('#active-filters').innerHTML=chips.join('');
    buildFilters();
    $$('.preset-tabs button').forEach(b=>b.classList.toggle('active',b.dataset.preset===(state.agents.length===1&&state.agents[0]==='RL'?'rl':state.agents.length===2&&state.agents.includes('LLM')&&state.agents.includes('VLM')?'foundation':!state.agents.length?'all':null)));
  }
  function openGame(id,category=null){
    const g=gameById.get(id);if(!g)return;
    closeAll();state=model.selectGame(state,id,category);gameSearchLimit=30;gameFiltersOpen=false;
    writeURL(true);render();$('#collection').scrollIntoView({behavior:'auto'});
  }
  const profileFields=[['environment','环境 / 适配层'],['scope','任务与设置'],['observation','观测接口'],['action','动作接口'],['metrics','官方评估指标'],['integration','接入方式'],['controls','必须对齐的条件'],['unknown','待核验信息']];
  function profileHTML(l){
    const p=l.profile,r=byId.get(l.benchmark);if(!p)return '';
    return `<details class="task-profile" id="profile-${r.id}" ${openProfiles.has(state.game+':'+r.id)?'open':''}><summary><span data-no-i18n>${escape(r.name)}</span><span>${escape(p.fit)}</span><span class="profile-more">详情与来源 ＋</span></summary><div class="profile-body"><div class="profile-route"><span>${escape(p.environment.text)}</span></div><p class="profile-fit"><b>推荐研究用途</b> <span>${escape(p.fit)}</span></p><dl class="profile-fields">${profileFields.map(([key,label])=>`<div><dt>${label}</dt><dd><p>${escape(p[key].text)}</p><a href="${escape(p[key].source)}" target="_blank" rel="noopener noreferrer"><span>文档来源</span> · <span data-no-i18n>${escape(p[key].locator)}</span> ↗</a></dd></div>`).join('')}</dl><p class="profile-status"><span>文档已核对；未安装或运行</span> · <span>未固定版本；核查于 2026-10-18</span></p></div></details>`;
  }
  const attributionLabel=status=>bilingual(...({confirmed:['游戏归属已核验','Game attribution checked'],no_specific_game:['无特定游戏归属','No specific game'],unresolved:['核查后仍待确认','Still unresolved after review'],source_mismatch:['来源与题录不一致','Source identity mismatch']}[status]));
  function attributionHTML(a){return `<details class="game-attribution" data-attribution-status="${escape(a.status)}"><summary>${bilingual("游戏归属依据","Game attribution")}</summary><p>${escape(bilingual(a.noteZh,a.noteEn))}</p><details><summary>${bilingual('核验依据','Attribution evidence')} · ${escape(a.checkedAt)}</summary>${a.evidence.map(e=>`<p><a href="${escape(e.url)}" target="_blank" rel="noopener noreferrer">${escape(e.title)} ↗</a></p>`).join('')}<small>${bilingual('此处列示游戏归属依据；任务协议的核验范围与结果另列。','Game attribution evidence is listed here; task review scope and outcomes are reported separately.')}</small></details></details>`;}
  function collectionHierarchyHTML(g){
    const parents=g.subgameParents||[], reviews=g.collectionReviews||[];
    if(!parents.length&&!reviews.length)return '';
    const status=r=>bilingual(...({complete:['已核对完整清单','Complete list checked'],partial:['部分展开','Partially expanded'],none:['暂无可展开名单','No verifiable child list']}[r.completeness]));
    return `<section class="collection-hierarchy" data-no-i18n>${parents.length?`<p class="subgame-parent-links">${bilingual('所属合集与关联研究','Parent collections & linked research')}: ${parents.map(p=>`<button class="text-button" data-game-open="${escape(p.parentId)}">${escape(gameDisplayName(gameById.get(p.parentId)))} · ${escape(byId.get(p.benchmark).name)} ↗</button>`).join(' · ')}</p>`:''}${reviews.map(r=>`<details class="collection-expansion" ><summary><strong>${escape(byId.get(r.benchmark).name)}</strong> · ${r.children.length} ${bilingual('个已确认游戏 / 环境 / 任务','confirmed games / environments / tasks')} · ${status(r)}</summary><p>${escape(bilingual(r.noteZh,r.noteEn))}</p>${r.children.length?`<div class="subgame-list">${r.children.map(id=>`<button data-game-open="${escape(id)}">${escape(gameDisplayName(gameById.get(id)))}${gameById.get(id).kind==='task'?` <small>${bilingual('实验任务','Experimental task')}</small>`:''} <span>↗</span></button>`).join('')}</div>`:''}<p class="subgame-sources">${bilingual('清单依据','List evidence')}: ${r.evidence.map(e=>`<a href="${escape(e.url)}" target="_blank" rel="noopener noreferrer">${escape(e.title)} ↗</a>`).join(' · ')}</p></details>`).join('')}</section>`;
  }
  function bibliographicGameRow(r,l){
    const reviewedUse=gameRoles.classify(state.game,l.benchmark).claims.some(c=>c.origin==='review');
    const kind={Benchmark:['Benchmark','Benchmark'],'Environment family':['评测环境','Environment'],'Research platform':['研究平台','Platform'],Dataset:['数据集','Dataset'],Competition:['竞赛','Competition'],'Evaluation protocol':['评测协议','Protocol'],'Agent method':['相关方法','Method'],Survey:['综述','Survey'],'Research record':['性质待核验','Type unverified']}[r.kind]||[r.kind,r.kind];
    return `<tr data-game-record="${escape(r.id)}" class="bibliographic-game-row" data-no-i18n><th scope="row"><button class="title-button" data-detail="${escape(r.id)}">${escape(r.name)}</button><p class="paper-authors">${escape(r.authors[0])}${r.authors.length>1?' et al.':''}<br>${escape(r.venue)}</p><span class="game-relation">${r.kind==="Research record"&&!gameRoles.classify(state.game,l.benchmark).roles.includes("unverified")?"":bilingual(...kind)+" · "}${l.taskUnitIds?.length?bilingual('任务来源关联已核验','Task-source association checked'):l.attribution?(l.attribution.mappingLevel==='collection'?bilingual('合集归属已核验','Collection attribution checked'):attributionLabel(l.attribution.status)):reviewedUse?bilingual('游戏关联与用途已核验','Game link and use reviewed'):bilingual('历史题录关联','Bibliographic association')}</span></th><td>${gameUsageHTML(l)}${gameRoles.classify(state.game,l.benchmark).units.length?window.AtlasTaskCoverage.focusHTML(l):""}</td><td class="game-scope"><p>${escape(r.title)}</p>${gameUsageEvidenceHTML(l)}${gameRoles.classify(state.game,l.benchmark).units.length?window.AtlasTaskCoverage.reviewHTML(l.taskReview,{gameId:state.game,benchmark:r.id}):""}${l.attribution?attributionHTML(l.attribution):`<p>${l.taskUnitIds?.length?bilingual('游戏关联见上述任务来源；任务协议与历史题录分类分别记录。','Game association follows the task sources above; protocols and historical bibliographic tags are recorded separately.'):reviewedUse?bilingual('游戏关联及用途已按上述来源核验；完整协议与运行状态另列。','Game association and use were reviewed against the sources above; complete protocols and runtime status are recorded separately.'):bilingual('关联依据：历史题录中的名称或游戏字段；未逐篇重新核验。','Basis: names or game fields in the existing bibliography; not individually rechecked.')}</p>`}</td><td class="game-actions"><button class="text-button" data-detail="${escape(r.id)}">${bilingual('查看研究档案','Open research archive')} →</button>${r.paper?`<a href="${escape(r.paper)}" target="_blank" rel="noopener noreferrer">${bilingual('论文','Paper')} ↗</a>`:''}</td></tr>`;
  }
  const usageLabel=id=>bilingual(...({all:['全部关联','All linked research'],data:['数据来源','Data source'],offline:['离线评测','Offline evaluation'],online:['在线任务（文档）','Online tasks (documented)'],related:['其他研究','Other research'],unverified:['用途待核验','Use unverified']}[id]));
  function gameUsageHTML(l){
    const use=gameRoles.classify(state.game,l.benchmark);
    return `<div class="game-usage-tags" data-no-i18n>${use.roles.map(id=>`<span data-use="${id}">${usageLabel(id)}</span>`).join('')}</div>${use.roles.includes('online')?`<p class="game-run-status" data-no-i18n>${use.executionVerified?bilingual('本游戏任务已运行验证','Execution verified for this game'):bilingual('运行未验证','Execution unverified')}</p>`:''}${use.gaps.length?`<p class="game-use-gap-status" data-no-i18n>${bilingual('协议 / 范围待补','Protocol / scope details missing')}</p>`:''}`;
  }
  function gameUsageEvidenceHTML(l){
    const use=gameRoles.classify(state.game,l.benchmark);
    return `<details class="game-usage-evidence" data-no-i18n><summary>${bilingual('用途依据与范围','Use evidence & scope')}${use.gaps.length?` · ${bilingual('有待补信息','Evidence gaps')}`:''}</summary>${use.claims.map(c=>`<section><strong>${c.roles.map(usageLabel).join(' · ')}</strong><p>${escape(bilingual(c.basis.zh,c.basis.en))}</p>${c.memberScope?`<p>${bilingual('此合集包含下列已核验成员任务；不代表其他成员也有相同任务。','This collection includes documented member tasks; other members do not inherit these tasks.')}</p>`:''}<div>${c.evidence.map(e=>`<a href="${escape(e.url)}" target="_blank" rel="noopener noreferrer">${escape(e.title||bilingual('来源','Source'))} ↗</a>`).join(' · ')}</div></section>`).join('')}${use.gaps.map(g=>`<section class="game-use-missing"><strong>${bilingual('仍缺哪些证据','Evidence still needed')}</strong><p>${escape(bilingual(g.note.zh,g.note.en))}</p><dl>${g.missing.map(m=>`<div><dt>${escape(bilingual(m.label?.zh||'协议 / 范围',m.label?.en||'Protocol / scope'))}</dt><dd>${escape(bilingual(m.detail.zh,m.detail.en))}</dd></div>`).join('')}</dl><small>${bilingual('本轮已检查','Sources checked in this pass')} · ${escape(g.checkedAt||window.ATLAS_GAME_ROLES.checkedAt)}</small><div>${g.evidence.map(e=>`<a href="${escape(e.url)}" target="_blank" rel="noopener noreferrer">${escape(e.title||bilingual('来源','Source'))} ↗</a>`).join(' · ')}</div></section>`).join('')}</details>`;
  }
  function gameEmptyHTML(g){
    const known=gameRoles.summary(g.id),noOnline=state.gameUsage==='online'&&!known.counts.online,noPending=state.gameUsage==='unverified'&&!known.counts.unverified;
    const message=noPending?bilingual('当前没有用途待核验条目；已确认用途与协议完整性分别记录。','There are no use-unverified entries for this game; confirmed use and protocol completeness are recorded separately.'):noOnline?bilingual('当前已核验资料中，暂未确认本游戏的在线交互评测任务。','No online interactive evaluation task for this game has been confirmed in the reviewed material.'):g.links.length?bilingual(`该游戏已关联 ${g.links.length} 条研究，当前筛选无匹配。`,`This game has ${g.links.length} linked research ${g.links.length===1?'record':'records'}, but none match the current filters.`):bilingual('该游戏暂无关联研究记录。','No research records are linked to this game yet.');
    return `<div class="game-empty" data-no-i18n role="status"><p>${message}</p>${noOnline?`<p class="game-usage-empty-detail">${bilingual(`已确认：数据来源 ${known.counts.data} 项研究 · 离线评测 ${known.counts.offline} 项研究。`,`Confirmed: ${known.counts.data} data sources · ${known.counts.offline} offline evaluation sources.`)}</p>`:''}${noPending&&known.withGaps?`<p class="game-usage-empty-detail">${bilingual(`仍有 ${known.withGaps} 项研究的协议或范围待补，请查看对应条目的“用途依据与范围”。`,`${known.withGaps} research sources still have protocol or scope gaps; see each entry’s Use evidence & scope.`)}</p>`:''}${g.links.length?`<button class="text-button" data-clear-game-filters>${bilingual(`查看本游戏全部 ${g.links.length} 条研究`,`View all linked research (${g.links.length})`)} →</button>`:''}</div>`;
  }
  function gameUsageSummaryHTML(g,summary){
    return `<section class="game-usage-summary" aria-label="${bilingual('本游戏的研究用途','Research uses of this game')}" data-no-i18n><div class="game-usage-heading"><h3>${bilingual('研究用途','Research use')}</h3><span>${bilingual('在线任务来源 · 已运行验证','Online sources with execution verified')}: <b>${summary.executionVerified}</b>${summary.withGaps?` · ${bilingual("本轮待补证据", "Evidence gaps in this review")}: ${summary.withGaps}`:""}</span></div><div class="game-usage-filters" role="group" aria-label="${bilingual('按研究用途筛选','Filter by research use')}">${['all',...gameRoles.roleIds].map(id=>`<button data-game-usage="${id}" aria-pressed="${(state.gameUsage||'all')===id}"><span>${usageLabel(id)}</span><b>${id==='all'?summary.total:summary.counts[id]}</b></button>`).join('')}</div><p class="game-usage-note">${bilingual('当前范围内按研究来源计数（非任务个数），同一来源可跨用途。在线任务指与环境交互，不代表已验证可运行。','Counts are research sources, not individual tasks, within the current filters; uses can overlap. Online means environment interaction, not verified runnability.')}</p><details class="game-usage-method"><summary>${bilingual('分类口径','Classification rules')}</summary><dl><div><dt>${usageLabel('data')}</dt><dd>${bilingual('游戏提供录像、示范、轨迹或题库素材；不等于存在可执行评测。','The game supplies video, demonstrations, trajectories or question data; this alone does not establish executable evaluation.')}</dd></div><div><dt>${usageLabel('offline')}</dt><dd>${bilingual('在固定题目、录像、状态或动作标签上评分，不通过模型动作推进游戏。','Scoring on fixed questions, videos, states or action labels without advancing a game through model actions.')}</dd></div><div><dt>${usageLabel('online')}</dt><dd>${bilingual('来源描述了动作推进环境状态的任务及评价。离线训练后在环境中测胜率或回报，也属于在线评价；协议不完整与运行状态另列。','The source describes tasks and evaluation where actions advance environment state. Environment win/return evaluation after offline training is also online; protocol completeness and execution status are separate.')}</dd></div><div><dt>${usageLabel('related')} / ${usageLabel('unverified')}</dt><dd>${bilingual('已明确为生成、开发、分析等用途的列为其他研究；仅有题录或游戏清单、尚无本游戏用途依据的列为待核验。合集仅计入已核验成员，不能把一个子游戏的任务复制给其他成员。','Generation, development and analysis belong to other research. Bibliographic or roster links without game-specific use evidence remain unverified. A collection can include documented members, but sibling games never inherit their tasks.')}</dd></div></dl><p class="game-use-review-download"><a href="./game-use-review.json" download>${bilingual("下载本轮用途核验记录", "Download this use-review audit")} ↗</a></p></details></section>`;
  }
  const introductionEntries=new Map((window.ATLAS_GAME_INTRODUCTIONS?.entries||[]).flatMap(e=>e.ids.map(id=>[id,e])));
  function gameDetailURL(url){
    if(!/^https:\/\//.test(url||''))return null;
    return /arxiv\.org|proceedings\.|aclanthology\.|ojs\.aaai\.org|openreview\.net|\.pdf(?:$|[?#])/i.test(url)?null:url;
  }
  function gameIntroduction(g){
    const entry=introductionEntries.get(g.id);
    return entry?{text:bilingual(entry.zh,entry.en),source:gameDetailURL(entry.detailUrl===undefined?entry.source:entry.detailUrl)}:null;
  }
  function gameIntroductionHTML(g){
    const intro=gameIntroduction(g);
    if(!intro){
      const source=g.links.map(l=>gameDetailURL(l.source)).find(Boolean);
      return source?`<div class="game-introduction game-introduction-source" data-no-i18n><a href="${escape(source)}" target="_blank" rel="noopener noreferrer">${bilingual('原始资料','Original source')} ↗</a></div>`:'';
    }
    return `<div class="game-introduction" data-no-i18n><p>${escape(intro.text)}</p>${intro.source?`<a href="${escape(intro.source)}" target="_blank" rel="noopener noreferrer">${bilingual('详细介绍','Learn more')} ↗</a>`:''}</div>`;
  }
  function gameResearchContextHTML(g){
    const generic=/依据来源建立|此入口依据|归属已根据|来源明确列入|仅关联本轮|明确区分研究任务|附录G的30游戏/;
    const note=g.note&&!generic.test(g.note)?g.note:'';
    const identityNote=introductionEntries.get(g.id)?.associationCaveat;
    if(!note&&!g.comparisonNote&&!identityNote)return '';
    return `<details class="game-research-context"><summary>${bilingual('研究使用说明','Research context')}</summary>${identityNote?`<p>${escape(bilingual(identityNote.zh,identityNote.en))}</p>`:''}${note?`<p>${escape(note)}</p>`:''}${g.comparisonNote?`<p>${escape(g.comparisonNote)}</p>`:''}</details>`;
  }
  function renderGames(){
    const g=currentGame(), links=filteredGameLinks();
    const usageSummary=gameRoles.summary(g.id,{benchmarkIds:filteredGameLinks(false,true).map(l=>l.benchmark)});
    const selectedAxis=window.ATLAS_DATA.taskDimensions.find(d=>d.id===state.gameCapability);
    const advancedLabels=[state.gameUsage&&state.gameUsage!=='all'?usageLabel(state.gameUsage):'',state.q,state.question?bilingual(currentQuestion().label,currentQuestion().subtitle):'',...state.agents,...[...state.interactions.map(x=>interactionLabels[x]),...state.kinds,...state.caps.map(capName),...state.genres].map(x=>window.AtlasLanguage.terms(x)[window.AtlasLanguage.current()==='zh'?1:2]),state.gameResource==='evaluation'?bilingual('用途已确认的数据与评测','Confirmed data and evaluation uses'):'',state.gameReview==='reviewed'?bilingual('仅归属已核验','Confirmed game links only'):state.gameReview==='tasks'?bilingual('仅任务协议已核验','Documented task protocols only'):''].filter(Boolean);
    const stats=window.ATLAS_DATA.gameIndexStats;
    const siblings=gameIndex.filter(x=>x.categories.includes(state.gameCategory)).sort(englishNameOrder);
    const searchWords=norm(state.gameSearch||'').trim().split(/\s+/).filter(Boolean);
    const searchResults=searchWords.length?gameIndex.filter(x=>{
      const scoped=x.links.filter(gameScopeLink);if(!scoped.length)return false;
      const text=norm([x.name,x.nameZh||'',...(x.aliases||[]),...scoped.flatMap(l=>{const r=byId.get(l.benchmark);return [r.name,r.title];})].join(' '));
      return searchWords.every(word=>text.includes(word));
    }).sort(englishNameOrder):[];
    const count=category=>new Set(gameIndex.filter(x=>x.categories.includes(category)).flatMap(x=>x.links.filter(gameScopeLink).map(l=>l.benchmark))).size;
    const active=model.hasGameFilters(state);
    $('#topic-content').innerHTML=`<section class="game-index-search-area" data-no-i18n><label class="game-index-search"><span>${bilingual('查找游戏、环境或 Benchmark','Find a game, environment or benchmark')}</span><input id="game-index-search" type="search" value="${escape(state.gameSearch||'')}" placeholder="${bilingual('搜索全部游戏索引，支持中英文名称','Search the entire game index by Chinese or English name')}" aria-controls="game-global-results"></label>${searchWords.length?`<section class="game-global-results" id="game-global-results" aria-label="${bilingual('跨类别搜索结果','Cross-category search results')}"><div class="game-global-results-heading"><p role="status">${bilingual('找到','Found')} <b>${searchResults.length}</b> ${bilingual('条索引记录 · 全部游戏大类',`${searchResults.length===1?'index record':'index records'} · All game categories`)}</p><button class="text-button" id="clear-game-index-search">${bilingual('清除搜索','Clear search')} ×</button></div>${searchResults.length?`<div class="game-global-result-list">${searchResults.slice(0,gameSearchLimit).map(x=>`<button data-game-open="${escape(x.id)}">${gameNameHTML(x)}<small>${x.categories.map(c=>escape(window.AtlasLanguage.terms(genreTitle(c))[window.AtlasLanguage.current()==='zh'?1:2])).join(' · ')} · ${x.links.filter(gameScopeLink).length} ${bilingual('条研究','research entries')}</small></button>`).join('')}</div>${searchResults.length>gameSearchLimit?`<button class="text-button game-global-more" id="more-game-search-results">${bilingual('显示更多','Show more')} (${gameSearchLimit} / ${searchResults.length})</button>`:''}`:`<p class="game-global-empty">${bilingual('未找到匹配项，请尝试其他游戏名称或 Benchmark。','No matching records. Try another game name or benchmark.')}</p>`}</section>`:''}</section><section class="game-index-summary" data-no-i18n><div><label>${bilingual('资源范围','Resources')}<select id="game-resource" aria-label="${bilingual('资源范围','Resources')}"><option value="all" ${state.gameResource!=='evaluation'?'selected':''}>${bilingual('全部研究记录','All research records')}</option><option value="evaluation" ${state.gameResource==='evaluation'?'selected':''}>${bilingual('用途已确认的数据与评测资源','Data & evaluation with confirmed use')}</option></select></label><label>${bilingual('关联状态','Link status')}<select id="game-review" aria-label="${bilingual('关联状态','Link status')}"><option value="all" ${state.gameReview==='all'?'selected':''}>${bilingual('全部关联','All links')}</option><option value="reviewed" ${state.gameReview==='reviewed'?'selected':''}>${bilingual('仅归属已核验','Confirmed game links only')}</option><option value="tasks" ${state.gameReview==='tasks'?'selected':''}>${bilingual('仅任务协议已核验','Documented task protocols only')}</option></select></label><span class="game-sort-note">${bilingual('英文名称 A–Z','English name A–Z')}</span></div></section><div class="game-index-layout"><aside class="game-category-nav" aria-label="游戏类别导航"><h3>游戏类别</h3>${gameCategories.map(c=>`${c===auxiliaryCategories[0]?'<h3 class="genre-group-heading">合集与实验任务</h3>':''}<button data-game-category="${c}" aria-pressed="${state.gameCategory===c}"><span>${escape(genreTitle(c))}</span><span class="game-category-count">${count(c)}</span></button>`).join('')}</aside>
      <div class="game-index-main"><div class="game-category-heading"><h3>${escape(genreTitle(state.gameCategory))}</h3><p><b>${siblings.length}</b> <span>游戏与环境</span> · <b>${count(state.gameCategory)}</b> <span>已关联研究条目</span></p></div>
      <p class="game-full-index" data-no-i18n><a href="?lang=${window.AtlasLanguage.current()}&view=explore&catalog=archives&libraryKind=all&libraryGenre=${encodeURIComponent(state.gameCategory)}">${window.AtlasLanguage.current()==='zh'?'查看该类型的研究档案':'Browse research archives for this genre'} (${window.AtlasLibraryData.records.filter(r=>r.genres.includes(state.gameCategory)).length}) ↗</a></p>
      ${['Unresolved','Related research'].includes(state.gameCategory)?'':`<details class="genre-coverage-disclosure"><summary data-no-i18n>${bilingual('本游戏大类的任务与能力覆盖','Tasks and capability coverage for this genre')}</summary>${window.AtlasTaskCoverage.category(state.gameCategory,gameIndex.filter(x=>x.categories.includes(state.gameCategory)).flatMap(x=>x.links.filter(gameScopeLink).map(l=>l.benchmark)))}</details>`}
      <div class="game-selector" role="group" aria-label="该类别下的游戏">${siblings.map(x=>gameIndexItemHTML(x,g.id)).join('')||`<p data-no-i18n>${bilingual('当前类别没有匹配游戏；可清空搜索或切换类别。','No matching games in this category. Clear the search or choose another category.')}</p>`}</div>
      <section class="game-dossier" aria-labelledby="game-title"><div class="game-dossier-heading"><div>${g.kind!=='game'?`<div class="eyebrow">${gameKind[g.kind]}</div>`:''}<h2 id="game-title" data-no-i18n>${escape(g.kind==='unresolved'?bilingual('具体游戏待确认','Game identity pending'):gameDisplayName(g))}</h2>${g.nameZh&&window.AtlasLanguage.current()==='zh'?`<p class="game-name-original" data-no-i18n lang="en">${escape(g.name)}</p>`:''}${g.nameSource?`<a class="game-name-source" href="${escape(g.nameSource)}" target="_blank" rel="noopener noreferrer">${g.nameType==='official'?'官方中文名 ↗':'名称说明 ↗'}</a>`:''}</div><span class="game-total" data-no-i18n><b>${g.links.length}</b> <span>${bilingual("条关联研究", g.links.length===1?"linked research record":"linked research records")}</span></span></div>
      ${gameIntroductionHTML(g)}${g.hierarchy?`<ol class="game-hierarchy">${g.hierarchy.map(step=>`<li><span>${escape(step.label)}</span><a data-no-i18n href="${escape(step.source)}" target="_blank" rel="noopener noreferrer">${escape(step.name)} ↗</a></li>`).join('')}</ol>`:''}${collectionHierarchyHTML(g)}${g.genreTags?`<div class="genre-context"><span>玩法与题材</span> · ${g.genreTags.map(x=>`<span>${escape(x)}</span>`).join(' / ')}<p>${escape(g.genreBasis)} <a href="${escape(g.genreSource)}" target="_blank" rel="noopener noreferrer">类型归类依据 ↗</a></p></div>`:''}${gameResearchContextHTML(g)}
      ${gameUsageSummaryHTML(g,usageSummary)}
      <div class="game-results-toolbar" id="game-results-toolbar"><div class="game-result-state" role="status" data-no-i18n><span>${active?bilingual('筛选结果','Filtered results'):bilingual('显示','Showing')} <b>${links.length}</b> / ${g.links.length} ${bilingual('条研究',g.links.length===1?'research record':'research records')}</span>${selectedAxis?`<span class="game-selected-axis">${escape(selectedAxis.label[window.AtlasLanguage.current()]||selectedAxis.label.en)} · ${state.gameAssociation==='secondary'?bilingual('次要关联','Secondary association'):bilingual('主要关联','Primary association')}</span>`:''}${advancedLabels.length?`<span class="game-selected-conditions">${escape(advancedLabels.join(' · '))}</span>`:''}${active?`<button class="text-button" id="clear-game-filters">${bilingual('清除筛选','Clear filters')} ×</button>`:''}</div><details class="game-more-filters" id="game-more-filters" ${gameFiltersOpen?'open':''}><summary data-no-i18n>${bilingual('更多筛选','More filters')}${advancedLabels.length?` · ${advancedLabels.length}`:''}</summary><div class="game-more-body"><label class="game-paper-search" data-no-i18n>${bilingual('搜索当前游戏的论文','Search papers for this game')}<input id="game-paper-search" type="search" value="${escape(state.q)}" placeholder="${bilingual('名称、作者、论文关键词','Name, author or paper keywords')}"></label><div class="game-capability-controls" data-no-i18n><label>${bilingual('能力维度','Capability dimension')}<select id="game-capability-filter"><option value="">${bilingual('全部维度','All dimensions')}</option>${window.ATLAS_DATA.taskDimensions.map(d=>`<option value="${escape(d.id)}" ${state.gameCapability===d.id?'selected':''}>${escape(d.label[window.AtlasLanguage.current()]||d.label.en)}</option>`).join('')}</select></label><label>${bilingual('关联类型','Association')}<select id="game-association-filter" ${state.gameCapability?'':'disabled'}><option value="primary" ${state.gameAssociation!=='secondary'?'selected':''}>${bilingual('主要关联','Primary association')}</option><option value="secondary" ${state.gameAssociation==='secondary'?'selected':''}>${bilingual('次要关联','Secondary association')}</option></select></label></div><div class="game-more-groups" data-i18n-filter-content>${filterMarkup(g.id)}</div></div></details></div>
      <div class="game-table-heading"><h3>研究侧重与任务边界</h3>${links.filter(l=>byId.get(l.benchmark).detailLevel!=='catalog').length>1?'<button class="text-button" id="compare-game">从当前已核验条目对比 →</button>':''}</div>
      ${links.length?`<div class="game-table-wrap"><table class="game-benchmark-table"><caption class="sr-only">此游戏下的 Benchmark</caption><thead><tr><th scope="col">Benchmark / 文献</th><th scope="col" data-no-i18n>${bilingual("用途与研究侧重", "Use & research focus")}</th><th scope="col">任务与设置</th><th scope="col">资源</th></tr></thead><tbody>${links.map(l=>{const r=byId.get(l.benchmark);if(r.detailLevel==='catalog')return bibliographicGameRow(r,l);return `<tr data-game-record="${r.id}"><th scope="row"><button class="title-button" data-detail="${r.id}">${escape(r.name)}</button><p class="paper-authors">${escape(r.authors[0])}${r.authors.length>1?' et al.':''}<br>${escape(r.venue)}</p><span class="game-relation"><span>${escape(r.kind)}</span> · <span>${l.profile?'深度任务档案':'来源关联条目'}</span></span></th><td class="game-focus">${gameUsageHTML(l)}<p>${escape(l.focus)}</p><p class="game-interaction">${l.interactions.map(x=>`<span>${interactionLabels[x]}</span>`).join(' · ')}</p><div class="agent-badges">${l.agents.map(a=>`<span class="agent-badge">${a}</span>`).join('')}</div><span class="editorial-caption">编辑归类</span></td><td class="game-scope"><p>${escape(l.scope)}</p>${gameUsageEvidenceHTML(l)}<a class="evidence-link" href="${escape(l.profile?.scope.source||l.source)}" target="_blank" rel="noopener noreferrer">游戏关联来源 ↗</a></td><td class="game-actions">${l.profile?`<button class="text-button" data-profile="${r.id}">显示任务档案</button>`:''}<button class="text-button" data-detail="${r.id}">查看完整条目</button><button class="game-compare-toggle" data-compare="${r.id}" aria-pressed="${selected.includes(r.id)}">${selected.includes(r.id)?'已加入对比':'加入对比'}</button></td></tr>`;}).join('')}</tbody></table></div>`:gameEmptyHTML(g)}
      ${links.some(l=>l.profile)?`<section class="game-profiles"><h3>任务与接入档案</h3>${links.map(profileHTML).join('')}</section>`:''}
      </section></div></div>`;
    const directory=$('.game-selector'),activeDirectoryItem=directory.querySelector('[aria-pressed="true"]');
    if(activeDirectoryItem&&(activeDirectoryItem.offsetTop<directory.scrollTop||activeDirectoryItem.offsetTop+activeDirectoryItem.offsetHeight>directory.scrollTop+directory.clientHeight)){
      directory.scrollTop=activeDirectoryItem.offsetTop-(directory.clientHeight-activeDirectoryItem.offsetHeight)/2;
    }
  }
  function renderTopics(){
    if(state.view==='games'){renderGames();return;}
    const isCap=state.view==='capabilities';
    let html=`<p class="topic-intro">${isCap?'按常见游戏玩法分类；允许多类型。题材、交互方式与研究能力分别标注。合集与实验任务单列，不视为游戏类型。':'游戏类型帮助定位交互场景。能力仍需根据具体任务、观测和行动约束判断。'}</p>`;
    if(isCap){
      const ap=window.AtlasLibraryData.agentParadigms;
      html+=`<section class="detail-section" data-no-i18n><h3>${bilingual('智能体范式的核验口径','Agent paradigm review policy')}</h3><p>${bilingual('仅统计原始来源明确的模型或策略角色；LLM / VLM / VLA 与 IL / RL 可重叠。范式核验与能力证据、任务协议和可运行性分别记录。','Only explicitly documented model or policy roles count. LLM / VLM / VLA and IL / RL may overlap. Paradigm evidence is separate from capabilities, task protocols and runtime availability.')}</p><details><summary>${bilingual('定义、状态与核验明细','Definitions, statuses and review records')}</summary><dl class="profile-fields">${Object.entries(ap.policy.labels).map(([id,desc])=>`<div><dt>${id}</dt><dd>${escape(desc[window.AtlasLanguage.current()]||desc.en)}</dd></div>`).join('')}${Object.entries(ap.policy.states).map(([id,desc])=>`<div><dt>${bilingual(...({confirmed:['已核验','Confirmed'],pending:['待核验','Pending review'],not_applicable:['不适用','Not applicable']}[id]))} · ${ap.status[id]||0}</dt><dd>${escape(desc[window.AtlasLanguage.current()]||desc.en)}</dd></div>`).join('')}</dl><a href="./agent-paradigm-review.json" download>${bilingual('下载范式核验明细','Download paradigm review records')} ↓</a></details></section>`;
      html+=`<section data-no-i18n><p>${bilingual('下方研究主题用于文献发现；任务覆盖图使用逐任务证据和统一纳入标准，另列规则与空间两个补充维度。','Research themes below support discovery. Task coverage uses task-level evidence and one inclusion policy, with supplemental rule and spatial axes.')}</p>${window.AtlasTaskCoverage.policyHTML()}${window.AtlasTaskCoverage.archiveHTML()}</section>`;
      html+=`<div class="taxonomy-axes"><div><b>研究能力</b><span>要理解什么行为</span></div><div><b>游戏类型 / 交互关系</b><span>玩法与合作、竞争分别标注</span></div><div><b>智能体范式</b><span>文档记录了哪些接口</span></div><div><b>评估协议</b><span>任务、预算、伙伴与指标</span></div></div><div class="evidence-legend"><span class="basis-label">官方定位 / 任务文档</span><span>原文明确的研究目标或任务机制</span><span class="basis-label editorial">编辑归类</span><span>依据机制整理的研究视角，需进一步核对</span></div><div class="taxonomy-grid">${capabilities.map(c=>`<article class="taxonomy-card" id="rule-${c.id}"><div class="eyebrow">${c.label}</div><h3>${capName(c.id)}</h3><p><strong>归类规则</strong>${escape(taxonomy[c.id][1])}</p><p><strong>判断边界</strong>${escape(taxonomy[c.id][2])}</p><button class="text-button" data-topic="${c.id}">查看 ${records.filter(r=>r.caps.includes(c.id)).length} 个相关条目 ↗</button></article>`).join('')}</div><div class="matrix-wrap"><table class="matrix"><thead><tr><th>分类证据 · 点击查看</th>${capabilities.map(c=>`<th>${capName(c.id)}</th>`).join('')}</tr></thead><tbody>${records.map(r=>`<tr><td><button data-detail="${r.id}">${escape(r.name)}</button></td>${capabilities.map(c=>{const ev=r.evidence.find(e=>e.cap===c.id);return `<td>${ev?`<button class="matrix-evidence ${ev.basis==='编辑归类'?'editorial':''}" data-evidence="${r.id}" data-cap="${c.id}" aria-label="${escape(r.name)} · ${capName(c.id)} · ${ev.basis}">${ev.basis==='编辑归类'?'○':'●'}</button>`:'<span class="matrix-empty" aria-label="未归类">—</span>'}</td>`;}).join('')}</tr>`).join('')}</tbody></table></div><p class="matrix-caption">● 官方定位或任务文档　○ 编辑归类　— 未归类。标记表示分类依据的类型，不表示能力强弱。</p>`;
    }else{
      html+=`<div class="topic-grid">${genres.map(g=>`<button class="topic-card game-card" data-genre="${escape(g)}"><div class="game-content"><h3>${escape(g)}</h3><p>${genreInfo[g]?.[1]||''}</p><span class="topic-footer"><span>${records.filter(r=>r.genres.includes(g)).length} research entries</span><span>EXPLORE ↗</span></span></div></button>`).join('')}</div>`;
    }
    $('#topic-content').innerHTML=html;
  }
  const showsResults=()=>state.view==='explore'||(state.view==='themes'&&!!currentQuestion());
  function scrollPage(){(state.view==='themes'?$('#questions'):$('#collection')).scrollIntoView({behavior:'auto',block:'start'});}
  function render(){
    $('#search').value=state.q;$('#sort').value=state.sort;
    const themes=state.view==='themes',results=showsResults();
    document.body.dataset.view=state.view;$('#questions').hidden=!themes;
    $('#collection').hidden=themes&&!currentQuestion();
    const archiveView=state.view==='explore';
    window.AtlasLibrary.show(archiveView,{selected});
    $('#explorer').hidden=!results||archiveView;$('#topic-content').hidden=!['games','capabilities'].includes(state.view);
    $('#method-overview').hidden=state.view!=='capabilities';
    $('#arena-content').hidden=state.view!=='arena';
    window.AtlasArena.show(state.view==='arena');
    $('#section-title').textContent={themes:'主题相关条目',explore:'全部条目',capabilities:'分类方法',games:'游戏索引',arena:'Game Arena'}[state.view];
    $('#section-eyebrow').textContent={themes:'THEME RESULTS',explore:'BENCHMARK INDEX',capabilities:'TAXONOMY & EVIDENCE',games:'GAME CATEGORIES',arena:'EVALUATION SUITE'}[state.view];
    $('#section-description').textContent={themes:'重点候选 · 关联依据 · 实验条件',explore:bilingual('研究档案 · 任务与评估 · 分类依据与来源','Research archives · Tasks & evaluation · Evidence & sources'),capabilities:'收录规则 · 分类定义 · 证据来源与核验',games:'按具体游戏定位评估任务，再查看其研究侧重与分类依据。',arena:window.AtlasLanguage.current()==='zh'?'代表性任务 · 能力覆盖 · 统一记录协议':'Representative tasks · Capability coverage · Shared reporting protocols'}[state.view];
    $('.skip-link').setAttribute('href',themes?'#questions':'#collection');
    renderQuestions();
    $$('.nav-link,.nav-secondary').forEach(b=>{const active=b.dataset.view===state.view;b.classList.toggle('active',active);if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
    const titles=window.AtlasLanguage.current()==='en'?{themes:'Research themes',games:'Game index',explore:'All entries',capabilities:'Methods',arena:'Game Arena'}:{themes:'研究主题',games:'游戏索引',explore:'全部条目',capabilities:'分类方法',arena:'Game Arena'};
    document.title=titles[state.view]+' · Game Agent Benchmark Atlas';
    if(results&&!archiveView)renderResults();else if(['games','capabilities'].includes(state.view))renderTopics();
    updateDock();decorate();
  }
  function setView(view){
    if(view==='games'&&state.view!=='games'){state=model.clearGameFilters(state);gameFiltersOpen=false;}
    state.detail=null;state.compareOpen=false;closeAll();state.view=view;
    if(view==='explore'){state.catalog='archives';state.question=null;state.q='';state.agents=[];state.caps=[];state.genres=[];state.interactions=[];state.kinds=[];state.sort='curated';}
    writeURL(true);render();scrollPage();
  }
  function reset(){state.question=null;state.q='';state.agents=[];state.caps=[];state.genres=[];state.interactions=[];state.kinds=[];state.sort='curated';state.view='explore';writeURL();render();}
  function selectTopic(id){const q=questions.find(q=>q.cap===id);if(!q)return;state.agents=[];state.genres=[];state.interactions=[];state.kinds=[];chooseQuestion(q.id);}
  function toggleCompare(id){
    if(selected.includes(id))selected=selected.filter(x=>x!==id);else {if(selected.length>=4){toast('Select up to 4 entries. Remove one to add another.');return;}selected.push(id);}
    try{localStorage.setItem('atlas-compare',JSON.stringify(selected));}catch{}
    updateDock();if(state.view==='explore')window.AtlasLibrary.show(true,{selected});else if(showsResults())renderResults();else if(state.view==='games')renderGames();
    if($('#compare-dialog').open){writeURL();renderCompare();}
    if($('#detail-dialog').open)renderDetail();
  }
  function updateDock(){
    $('#compare-count').textContent=selected.length;$('#compare-dock').hidden=!selected.length||state.view==='arena';
    $('#dock-count').textContent=`${selected.length} selected`;
    $('#dock-names').textContent=selected.map(id=>byId.get(id).name).join(' · ');
    $('#open-compare').disabled=selected.length<2;
    $('#open-compare').title=selected.length<2?'Select at least 2 entries to compare':'';
  }
  function toast(message){clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').classList.add('visible');toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),3000);}
  function showDialog(id){const d=$('#'+id);if(!d.open)d.showModal();document.body.classList.add('modal-open');}
  function closeAll(){ $$('dialog[open]').forEach(d=>d.close()); }
  function bibtex(r){const key=r.authors[0].split(' ').at(-1).replace(/[^a-zA-Z]/g,'').toLowerCase()+r.year+r.id.replace(/-/g,'');return `@misc{${key},\n  title = {${r.title}},\n  author = {${r.authors.join(' and ')}},\n  year = {${r.year}},\n  howpublished = {${r.venue}},\n  url = {${r.paper}}\n}`;}
  async function copyCitation(){const r=byId.get(state.detail);if(!r)return;const value=window.AtlasResearchArchives.citation(window.AtlasResearchArchives.get(state.detail));try{await navigator.clipboard.writeText(value);toast('Citation copied. Verify publisher fields before submission.');}catch{const area=document.createElement('textarea');area.value=value;area.style.position='fixed';area.style.opacity='0';$('#detail-dialog').append(area);area.select();const ok=document.execCommand('copy');area.remove();toast(ok?'Citation copied.':'Copy unavailable here. Select the citation in Sources.');}}
  function openDetail(id,push=true){id=window.AtlasResearchArchives.canonical(id);if(!id)return;state.detail=id;detailTab='overview';if(push)writeURL(true);renderDetail();showDialog('detail-dialog');}
  function renderDetail(){
    const archive=window.AtlasResearchArchives.get(state.detail);if(!archive)return;
    const scroll=$('#detail-dialog').scrollTop;
    $('#detail-content').innerHTML=window.AtlasResearchArchives.render(archive,{tab:detailTab,selected:selected.includes(archive.id)});
    $('#detail-dialog').scrollTop=scroll;
  }
  function renderCompare(){
    if(selected.length<2){$('#compare-content').innerHTML=`<button class="modal-close" data-close="compare-dialog" aria-label="Close comparison">×</button>${window.AtlasLanguage.picker()}<h2 id="compare-title">Benchmark 对照表</h2><p class="dialog-intro">从目录中选择 2–4 个条目，比较任务范围、智能体接口、评估条件及证据。</p>`;return;}
    const unknownValue=bilingual('尚无已核验的条目级信息，见任务档案。','No reviewed entry-level value; consult the task archive.');
    const rs=selected.map(id=>{const r=byId.get(id),a=window.AtlasResearchArchives.get(id),values=key=>[...new Set(a.tasks.map(u=>u[key]?.[window.AtlasLanguage.current()]||u[key]?.en).filter(Boolean))].join('；')||unknownValue;return {...r,research:r.research||{fit:bilingual(a.bibliography.scope?.zh||unknownValue,a.bibliography.scope?.en||unknownValue),scope:values('task'),metrics:values('metrics'),controls:values('controls'),setup:values('limits')},observation:r.observation||values('observation'),action:r.action||values('action')};}),g=state.view==='games'?currentGame():null,q=g?null:currentQuestion();
    const unknown='仅有条目级说明；本游戏字段尚未核验。';
    const gameValue=(r,key)=>gameLink(r)?.profile?.[key]?.text||(key==='scope'?gameLink(r)?.scope:null)||unknown;
    const rows=g?[
      ['任务与设置',r=>gameValue(r,'scope'),'scope'],['环境 / 适配层',r=>gameValue(r,'environment'),'environment'],
      ['观测接口',r=>gameValue(r,'observation'),'observation'],['动作接口',r=>gameValue(r,'action'),'action'],
      ['官方评估指标',r=>gameValue(r,'metrics'),'metrics'],['接入方式',r=>gameValue(r,'integration'),'integration'],
      ['必须对齐的条件',r=>gameValue(r,'controls'),'controls'],['待核验信息',r=>gameValue(r,'unknown'),'unknown']
    ]:[
      ['研究关联',r=>q?relevance(r):r.research.fit],['任务范围',r=>r.research.scope],['条目性质',r=>r.kind],
      ['已记录的 Agent 使用',r=>r.agents.join(' / ')],['观测',r=>r.observation],['动作',r=>r.action],
      ['评估信息 / 编辑建议',r=>r.research.metrics],['需控制的实验条件',r=>r.research.controls],['接入与资源限制',r=>r.research.setup]
    ];
    const visibleRows=rows.filter(([,fn])=>!differencesOnly||new Set(rs.map(fn)).size>1);
    $('#compare-content').innerHTML=`<button class="modal-close" data-close="compare-dialog" aria-label="Close comparison">×</button>${window.AtlasLanguage.picker()}<div class="eyebrow">COMPARATIVE OVERVIEW / ${rs.length} ENTRIES</div><h2 id="compare-title">Benchmark 对照表</h2><p class="dialog-intro">${g?`<span data-no-i18n>${escape(gameTitleText(g))}</span> · <span>本游戏的任务档案</span>`:q?`研究主题：${escape(q.label)}`:'先比较研究适用性，再确定任务与评估协议。'}</p><div class="comparison-callout">${g?escape(g.comparisonNote||'同游戏比较仍需控制任务、观测、动作、预算及评价指标。'):q?escape(q.decision):'以下列出范围、接口与协议差异。选择同类任务后，再比较模型结果。'}<p>${g?'任务档案采用本游戏字段；没有核验的字段不使用整套 Benchmark 的信息代填。':'建议指标与控制条件属于编辑的研究设计提示。'}</p></div><div class="compare-toolbar"><label><input type="checkbox" id="differences-only" ${differencesOnly?'checked':''}> 仅显示不同项</label><button class="text-button" id="share-compare">复制对比链接</button></div><input class="compare-share-url" id="compare-link" aria-label="对比链接" readonly hidden value="${escape(location.href)}"><div class="compare-table-wrap"><table class="compare-table"><thead><tr><th>比较维度</th>${rs.map(r=>`<th><span data-no-i18n>${escape(r.name)}</span><span class="compare-venue">${escape(r.venue)}</span><button data-compare="${r.id}">移出对比 ×</button></th>`).join('')}</tr></thead><tbody>${visibleRows.map(([label,fn,key])=>`<tr><th scope="row">${label}</th>${rs.map(r=>`<td><p>${escape(fn(r))}</p>${g&&gameLink(r)?.profile?.[key]?`<a class="compare-field-source" href="${escape(gameLink(r).profile[key].source)}" target="_blank" rel="noopener noreferrer">文档来源 ↗</a>`:''}</td>`).join('')}</tr>`).join('')}<tr><th scope="row">核验状态</th>${rs.map(r=>`<td>${window.AtlasTaskCoverage.status(window.AtlasResearchArchives.get(r.id).taskReview?.status)}<br>${bilingual('运行状态未验证','Runtime not verified')}</td>`).join('')}</tr><tr><th scope="row">论文与实现</th>${rs.map(r=>`<td><a href="${escape(r.paper)}" target="_blank" rel="noopener noreferrer">论文 ↗</a><br>${codeLink(r,'GitHub ↗')}</td>`).join('')}</tr></tbody></table></div><details class="compare-extra"><summary>分类依据</summary>${rs.map(r=>`<h3 data-no-i18n>${escape(r.name)}</h3>${window.AtlasResearchArchives.evidence(window.AtlasResearchArchives.get(r.id))}`).join('')}</details>`;
  }
  function openCompare(){state.compareOpen=true;writeURL();renderCompare();showDialog('compare-dialog');}
  function exportSelection(){
    const rs=getResults();const payload={edition:'Research preview',language:window.AtlasLanguage.current(),version:window.ATLAS_DATA.version,scope:'Editorial entry-level discovery; not independently reproduced',question:currentQuestion()||null,filters:{agents:state.agents,caps:state.caps,genres:state.genres,interactions:state.interactions,kinds:state.kinds,search:state.q},facets,taxonomy,gameIndex:gameIndex.filter(g=>g.links.some(l=>rs.some(r=>r.id===l.benchmark))),records:rs};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='game-benchmark-atlas-selection.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast(`Exported ${rs.length} research ${rs.length===1?'entry':'entries'}.`);
  }
  document.addEventListener('click',e=>{
    const more=$('#game-more-filters');if(more?.open&&!more.contains(e.target)){more.open=false;gameFiltersOpen=false;}
    const el=e.target.closest('button, a');if(!el)return;
    if(el.dataset.gameCapability){const same=state.gameCapability===el.dataset.gameCapability&&state.gameAssociation===el.dataset.association;state.gameCapability=same?null:el.dataset.gameCapability;state.gameAssociation=el.dataset.association;state.question=null;state.caps=[];writeURL(true);render();document.querySelector(`[data-game-capability="${el.dataset.gameCapability}"][data-association="${el.dataset.association}"]`)?.focus({preventScroll:true});return;}
    if(el.dataset.gameUsage){state.gameUsage=el.dataset.gameUsage;gameFiltersOpen=false;writeURL(true);renderGames();$('#game-results-toolbar').scrollIntoView({behavior:'auto',block:'center'});return;}
    if(el.id==='clear-game-filters'||el.hasAttribute('data-clear-game-filters')){state=model.clearGameFilters(state,{includeScope:true});gameFiltersOpen=false;writeURL();render();$('#game-results-toolbar').scrollIntoView({behavior:'auto',block:'center'});return;}
    if(el.id==='share-compare'){$('#compare-link').hidden=false;$('#compare-link').select();navigator.clipboard.writeText(location.href).then(()=>toast('对比链接已复制')).catch(()=>toast(location.href));return;}
    if(el.id==='clear-game-index-search'){state.gameSearch='';gameSearchLimit=30;writeURL();renderGames();$('#game-index-search').focus();return;}
    if(el.id==='more-game-search-results'){gameSearchLimit+=30;renderGames();$('#more-game-search-results')?.focus({preventScroll:true});return;}
    if(el.dataset.profile){$('#profile-'+el.dataset.profile).open=true;$('#profile-'+el.dataset.profile).scrollIntoView({behavior:'auto'});return;}
    if(el.dataset.arenaTask){window.AtlasArena.openTask(el.dataset.arenaTask);setView('arena');return;}
    if(el.dataset.arenaOverview){window.AtlasArena.openMap();setView('arena');return;}
    if(el.dataset.gameCategory){const g=gameIndex.find(x=>x.categories.includes(el.dataset.gameCategory));state.gameSearch='';openGame(g.id,el.dataset.gameCategory);return;}
    if(el.dataset.gameOpen){openGame(el.dataset.gameOpen);return;}
    if(el.id==='compare-game'){selected=filteredGameLinks().filter(l=>byId.get(l.benchmark).detailLevel!=='catalog').map(x=>x.benchmark).slice(0,4);try{localStorage.setItem('atlas-compare',JSON.stringify(selected));}catch{}updateDock();renderGames();openCompare();return;}
    if(el.dataset.question){chooseQuestion(el.dataset.question);return;}
    if(el.dataset.questionBasis){setView('capabilities');document.getElementById('rule-'+el.dataset.questionBasis)?.scrollIntoView({behavior:'auto',block:'center'});return;}
    if(el.dataset.evidence){openDetail(el.dataset.evidence);detailTab='evidence';renderDetail();const entries=[...$('#detail-content').querySelectorAll('.classification-evidence')];const index=byId.get(el.dataset.evidence).evidence.findIndex(x=>x.cap===el.dataset.cap);if(index>=0)entries[index]?.scrollIntoView({block:'center'});return;}
    if(el.dataset.view){setView(el.dataset.view);return;}
    if(el.dataset.topic){selectTopic(el.dataset.topic);return;}
    if(el.dataset.genre){const g=gameIndex.find(g=>g.categories.includes(el.dataset.genre));if(g)openGame(g.id,el.dataset.genre);return;}
    if(el.dataset.saveArchive){const a=window.AtlasResearchArchives.get(el.dataset.saveArchive);if(!a)return;const blob=new Blob([JSON.stringify(a,null,2)+'\n'],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=a.sourceId+'-research-archive.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return;}
    if(el.dataset.detail){openDetail(el.dataset.detail);if(el.dataset.archiveTab){detailTab=el.dataset.archiveTab;renderDetail();}return;}
    if(el.dataset.compare){toggleCompare(el.dataset.compare);return;}
    if(el.dataset.close){$('#'+el.dataset.close).close();return;}
    if(el.dataset.detailTab){detailTab=el.dataset.detailTab;renderDetail();return;}
    if(el.hasAttribute('data-reset')){reset();$('#collection').scrollIntoView({behavior:'auto'});return;}
    if(el.dataset.removeFilter){const key=el.dataset.removeFilter;state[key]=state[key].filter(x=>x!==el.dataset.value);writeURL();render();return;}
    if(el.dataset.preset){state.agents=el.dataset.preset==='foundation'?['LLM','VLM']:el.dataset.preset==='rl'?['RL']:[];writeURL();render();return;}
    const id=el.id;
    if(['about-button','taxonomy-button','methodology-inline','reading-guide','footer-about'].includes(id)){setView('capabilities');return;}
    if(id==='explore-cta'||id==='change-question'){$('#questions').scrollIntoView({behavior:'auto'});}
    if(id==='clear-question'){state.question=null;writeURL();render();scrollPage();}
    if(id==='reset-filters'){state.q='';state.agents=[];state.caps=[];state.genres=[];state.interactions=[];state.kinds=[];state.sort='curated';writeURL();render();}
    if(id==='header-compare'||id==='open-compare')openCompare();
    if(id==='clear-compare'){selected=[];try{localStorage.removeItem('atlas-compare');}catch{}updateDock();if(state.view==='explore')window.AtlasLibrary.show(true,{selected});else if(showsResults())renderResults();else if(state.view==='games')renderGames();}
    if(id==='filter-mobile'){const open=$('#filters').classList.toggle('mobile-open');el.setAttribute('aria-expanded',open);}
    if(id==='export-button')exportSelection();
    if(id==='copy-citation')copyCitation();
  });
  document.addEventListener('toggle',e=>{if(e.target.id==='game-more-filters')gameFiltersOpen=e.target.open;if(e.target.classList?.contains('task-profile')){const key=state.game+':'+e.target.id.replace('profile-','');if(e.target.open)openProfiles.add(key);else openProfiles.delete(key);}},true);
  document.addEventListener('change',e=>{
    if(e.target.id==='game-capability-filter'||e.target.id==='game-association-filter'){const id=e.target.id;if(id==='game-capability-filter'){state.gameCapability=e.target.value||null;state.question=null;state.caps=[];}else state.gameAssociation=e.target.value;gameFiltersOpen=true;writeURL();renderGames();$('#'+id)?.focus({preventScroll:true});return;}
    if(e.target.id==='game-resource'||e.target.id==='game-review'){state[e.target.id==='game-resource'?'gameResource':'gameReview']=e.target.value;writeURL();renderGames();return;}
    if(e.target.id==='differences-only'){differencesOnly=e.target.checked;renderCompare();}
    if(e.target.dataset.filter){const key=e.target.dataset.filter;const value=e.target.value;state[key]=e.target.checked?[...state[key],value]:state[key].filter(v=>v!==value);writeURL();if(state.view==='games')renderGames();else renderResults();}
    if(e.target.id==='sort'){state.sort=e.target.value;writeURL();if(state.view==='games')renderGames();else renderResults();}
  });
  document.addEventListener('input',e=>{if(e.target.id==='game-paper-search'){const pos=e.target.selectionStart;state.q=e.target.value;gameFiltersOpen=true;writeURL();renderGames();const field=$('#game-paper-search');field.focus();try{field.setSelectionRange(pos,pos);}catch{}return;}if(e.target.id==='game-index-search'){const pos=e.target.selectionStart;state.gameSearch=e.target.value;gameSearchLimit=30;writeURL();renderGames();const field=$('#game-index-search');field.focus();try{field.setSelectionRange(pos,pos);}catch{}}});
  $('#search').addEventListener('input',e=>{state.q=e.target.value;writeURL();if(state.view==='games')renderGames();else renderResults();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#game-more-filters')?.open){$('#game-more-filters').open=false;gameFiltersOpen=false;$('#game-more-filters>summary').focus();return;}if(e.target.dataset.detailTab&&['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const tabs=['overview','evidence','protocol','sources'];let i=tabs.indexOf(detailTab);i=e.key==='Home'?0:e.key==='End'?3:(i+(e.key==='ArrowRight'?1:3))%4;detailTab=tabs[i];renderDetail();document.querySelector('[data-detail-tab="'+detailTab+'"]').focus();return;}if(e.key==='/'&&!e.metaKey&&!e.ctrlKey&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)&&!$('dialog[open]')){e.preventDefault();if(!showsResults())setView('explore');$(state.view==='explore'?'#library-search':'#search').focus();}});
  $$('dialog').forEach(d=>{
    d.addEventListener('click',e=>{if(e.target===d){const b=d.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)d.close();}});
    d.addEventListener('close',()=>{if(!document.querySelector('dialog[open]'))document.body.classList.remove('modal-open');if(d.id==='compare-dialog'&&state.compareOpen){state.compareOpen=false;writeURL();}if(d.id==='detail-dialog'&&state.detail){state.detail=null;writeURL();}});
  });
  addEventListener('atlas-language-change',()=>{render();if($('#detail-dialog').open)renderDetail();if($('#compare-dialog').open){writeURL();renderCompare();}});
  addEventListener('popstate',()=>{window.AtlasLanguage.readURL();readURL();render();if(state.compareOpen)openCompare();else if($('#compare-dialog').open)$('#compare-dialog').close();if(state.detail)openDetail(state.detail,false);else if($('#detail-dialog').open)$('#detail-dialog').close();});
  readURL();writeURL();render();
  if(state.detail)openDetail(state.detail,false);
  if(state.compareOpen)openCompare();
})();
