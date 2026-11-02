'use strict';
(()=>{
 const data=window.AtlasOfficialLeaderboardsData,model=window.AtlasLeaderboardModel;
 const t=(zh,en)=>window.AtlasLanguage.current()==='zh'?zh:en;
 const tr=x=>typeof x==='string'?x:x?.[window.AtlasLanguage.current()]||x?.en||'';
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const link=(url,label)=>`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>`;
 const groups=[['general','跨游戏能力','Cross-game ability'],['generalization','泛化','Generalization'],['exploration','长程执行与探索','Long-horizon & exploration'],['strategy','对战与策略','Competition & strategy'],['cooperation','协作与社会决策','Cooperation & social decisions']];
 const group=b=>b.group||(b.id==='orak-arena'?'strategy':'general');
 const shortTitles={
  'balrog-llm':['BALROG · LLM','BALROG · LLM'], 'balrog-vlm':['BALROG · VLM','BALROG · VLM'],
  'orak-performance':['Orak · 游戏成绩','Orak · Performance'], 'orak-arena':['Orak · 对战','Orak · Battles'],
  'lmgame-model':['LMGame · 模型','LMGame · Models'], 'videogamebench-full':['VideoGameBench · 实时','VideoGameBench · Full'],
  'gamebot':['GAMEBoT','GAMEBoT'], 'procgen-2020-generalization':['Procgen 2020 · 泛化','Procgen 2020 · Generalization'],
  'nethack-2021-overall':['NetHack 2021 · 决赛','NetHack 2021 · Final'], 'minerl-2021-research':['MineRL 2021 · Research','MineRL 2021 · Research'],
  'meltingpot-2023-generalization':['Melting Pot 2023 · 泛化','Melting Pot 2023 · General.'],
  'textarena-balanced':['TextArena · Balanced','TextArena · Balanced'], 'pgg-trueskill':['PGG · TrueSkill','PGG · TrueSkill'],
  'pokeagent-2025-gen1ou':['PokéAgent 2025 · Gen 1 OU','PokéAgent 2025 · Gen 1 OU'],
  'pokeagent-2025-gen9ou':['PokéAgent 2025 · Gen 9 OU','PokéAgent 2025 · Gen 9 OU'],
  'pokeagent-2025-speedrun':['PokéAgent 2025 · 速通','PokéAgent 2025 · Speedrun']
 };
 const shortTitle=b=>shortTitles[b.id]?t(...shortTitles[b.id]):tr(b.title);
 const coverage=b=>tr(b.coverageLabel)||`${b.columns.length-1} ${t('个环境','environments')}`;
 const sourceFor=id=>data.sources.find(s=>s.boardIds.includes(id));
 const matchingBoards=s=>s.boardIds.map(id=>data.boards.find(b=>b.id===id)).filter(b=>(navGroup==='all'||group(b)===navGroup)&&(navStatus==='all'||metadata(b).kind===navStatus));
 const navSources=()=>data.sources.filter(s=>matchingBoards(s).length);
 const navBoards=()=>navSources().flatMap(matchingBoards);
 const kinds={continuous:['持续更新','Maintained'],seasonal:['赛季榜','Seasonal'],reference:['研究参考成绩','Research reference'],historical:['历史榜单','Historical']};
 const metadata=b=>data.boardMetadata[b.id];
 function resultDate(b){
  const kind=metadata(b).dateKind;
  const labels={pageUpdated:['来源页面更新','Source page updated'],dataUpdated:['成绩数据更新','Results data updated'],recordUpdated:['最近成绩更新','Latest result update'],latestSubmission:['最近提交 · 收录成绩','Latest submission · collected results'],unknown:['成绩更新时间','Results updated']};
  const value=['pageUpdated','dataUpdated'].includes(kind)?b.source.pageUpdatedAt:['recordUpdated','latestSubmission'].includes(kind)?b.entries.map(e=>e.submissionDate).filter(Boolean).sort().at(-1):null;
  return `<div class="lb-result-date"><span>${metadata(b).dateLabel?esc(tr(metadata(b).dateLabel)):t(...labels[kind])}</span>${value?`<time datetime="${esc(value)}">${esc(value.slice(0,10))}${value.includes('T')&&value.endsWith('Z')?' <small>UTC</small>':''}</time>`:`<strong class="lb-date-unknown">${metadata(b).dateMissingLabel?esc(tr(metadata(b).dateMissingLabel)):t('来源未公布','Not published by source')}</strong>`}</div>`;
 }
 const rankedColumns=b=>b.columns.filter(c=>c.rankable!==false&&(!b.entries.length||b.entries.some(e=>Number.isFinite(e.scores[c.id]?.sortValue))));
 let boardId=data.sources[0].boardIds[0],metricId='overall',query='',expanded=null,navGroup='all',navStatus='all',directionOpen=false,pageNumber=1;
 const pageSize=50;
 const board=()=>data.boards.find(b=>b.id===boardId);
 function readURL(){
  const p=new URLSearchParams(location.search);
  boardId=data.boards.find(b=>b.id===p.get('arenaBoard'))?.id||data.sources[0].boardIds[0];
  metricId=rankedColumns(board()).find(c=>c.id===p.get('arenaMetric'))?.id||'overall';
  query=(p.get('arenaQuery')||'').slice(0,200);
  pageNumber=Math.max(1,parseInt(p.get('arenaPage'),10)||1);
  navGroup=groups.some(([key])=>key===p.get('arenaGroup'))?p.get('arenaGroup'):'all';
  navStatus=Object.hasOwn(kinds,p.get('arenaStatus'))?p.get('arenaStatus'):'all';
  if(!data.boards.some(b=>b.id===p.get('arenaBoard'))&&navBoards().length)selectBoard(navBoards()[0].id);expanded=null;
 }
 function save(){const u=new URL(location.href);u.searchParams.set('arenaBoard',boardId);u.searchParams.set('arenaMetric',metricId);for(const [key,value,empty] of [['arenaQuery',query,''],['arenaGroup',navGroup,'all'],['arenaStatus',navStatus,'all']]){if(value===empty)u.searchParams.delete(key);else u.searchParams.set(key,value);}if(pageNumber>1)u.searchParams.set('arenaPage',String(pageNumber));else u.searchParams.delete('arenaPage');u.searchParams.delete('arenaCollection');history.replaceState({},'',u);}
 function selectBoard(id){if(id===boardId)return;boardId=id;metricId='overall';query='';expanded=null;pageNumber=1;}
 const selectionVisible=()=>navBoards().some(b=>b.id===boardId);
 function toolbar(){
  const activeGroup=groups.find(([key])=>key===navGroup);
  return `<div class="lb-toolbar" data-no-i18n><div class="lb-filter-row"><div class="lb-type-filters" role="group" aria-label="${t('榜单类型','Board type')}">${[['all',['全部','All']],...Object.entries(kinds)].map(([key,label])=>`<button data-board-type="${key}" aria-pressed="${navStatus===key}">${key==='reference'?t('研究参考','Research reference'):t(...label)}</button>`).join('')}</div><span class="lb-source-count" role="status" aria-live="polite">${t('显示','Showing')} ${navSources().length} / ${data.sources.length} ${t('个来源','sources')}</span></div>
  <div class="lb-secondary-filters"><details class="lb-direction" id="leaderboard-direction" ${directionOpen?'open':''}><summary>${t('研究方向','Research direction')}</summary><label><span class="sr-only">${t('研究方向','Research direction')}</span><select id="leaderboard-group"><option value="all">${t('全部研究方向','All research directions')}</option>${groups.map(([key,zh,en])=>`<option value="${key}" ${navGroup===key?'selected':''}>${t(zh,en)}</option>`).join('')}</select></label></details>${activeGroup?`<button class="lb-filter-chip" data-clear-group aria-label="${t('清除研究方向','Clear research direction')}">${t(activeGroup[1],activeGroup[2])} ×</button>`:''}${navGroup!=='all'||navStatus!=='all'?`<button class="lb-filter-reset" data-reset-filters>${t('清除筛选','Clear filters')}</button>`:''}</div></div>`;
 }
 function navigation(){
  const src=sourceFor(boardId),visible=selectionVisible();
  return `<aside class="lb-nav"><h3>${t('榜单来源','Leaderboard sources')}</h3><nav class="lb-nav-list" aria-label="${t('选择榜单来源','Select leaderboard source')}">${navSources().map(x=>{const selected=visible&&x.id===src.id,target=selected?board():matchingBoards(x)[0];return `<button data-source="${x.id}" data-leaderboard="${target.id}" aria-pressed="${selected}" title="${esc(x.title)}"><span>${esc(x.title)}</span></button>`;}).join('')}${navSources().length?'':`<p class="lb-nav-empty">${t('没有匹配来源。','No matching sources.')}</p>`}</nav></aside>`;
 }
 function selectionPrompt(){
  const any=navSources().length>0;
  return `<div class="lb-selection-prompt" role="status"><h2>${any?t('请选择符合条件的榜单','Select a matching leaderboard'):t('没有符合条件的来源','No sources match these filters')}</h2><p>${any?t('当前所选的','Your selected leaderboard, '):''}${any?` <strong>${esc(tr(board().title))}</strong> `:''}${any?t('不在筛选结果中。请从左侧选择，或清除筛选返回。','is outside these filters. Select a source on the left, or clear the filters to return.'):t('请调整榜单类型或研究方向。','Adjust the board type or research direction.')}</p><button data-reset-filters>${t('清除筛选','Clear filters')}</button></div>`;
 }
 const extraColumns=(b,c)=>b.columns.filter(x=>x.id!==c.id&&(b.tableMetrics||[b.summaryMetric]).includes(x.id));
 const hasConfig=b=>b.entries.some(e=>e.configuration);
 const hasDates=b=>!b.hideRowDates&&b.entries.some(e=>e.submissionDate);
 const hasChecks=b=>b.entries.some(e=>'officialChecked'in e);
 const columnsCount=(b,c)=>4+Number(hasConfig(b))+Number(hasDates(b))+Number(hasChecks(b))+extraColumns(b,c).length;
 function sourceContext(b){
  const source=sourceFor(b.id),maintainer=b.maintainer||({'balrog':'BALROG authors','orak':'KRAFTON AI · Orak authors'}[source.id]||source.title+' · '+t('项目 / 竞赛维护方','project / competition maintainers'));
  return `<div class="lb-source-line"><span>${t('维护方','Maintainer')} · ${esc(maintainer)}</span>${link(b.source.url,t('原榜','Source'))}${b.source.mirrorSyncedAt?link('https://aiarenarecap.com/',t('成绩镜像 · AI Arena Recap','Scores · AI Arena Recap')):''}<button data-protocol-toggle aria-controls="leaderboard-protocol">${t('评测说明','Evaluation protocol')}</button>${b.benchmarkId?`<a href="?lang=${window.AtlasLanguage.current()}&view=explore&detail=${encodeURIComponent(b.benchmarkId)}">${t('档案','Archive')} ↗</a>`:''}${(b.gameLinks||[]).map(g=>`<a href="?lang=${window.AtlasLanguage.current()}&view=explore&detail=${encodeURIComponent(g.benchmarkId)}">${esc(g.label)} ${t('档案','archive')} ↗</a>`).join('')}</div>`;
 }
 function protocol(b){
  const fields=[['scope',t('评测范围','Scope')],['control',t('参评方式','Entry type')],['scoring',t('评价方式','Scoring')],['budget',t('预算与赛制','Budget & format')],['variation',t('统计信息','Statistics')],['verification',t('成绩来源','Result provenance')],['dates',t('日期含义','Dates')]];
  const urls=new Set([b.source.url]);const links=b.protocol.links.filter(x=>{if(urls.has(x.url))return false;urls.add(x.url);return true;});
  return `<details class="lb-protocol" id="leaderboard-protocol"><summary>${t('评测协议与数据来源','Evaluation protocol & data provenance')}</summary><dl>${fields.filter(([key])=>b.protocol[key]).map(([key,label])=>`<div><dt>${label}</dt><dd>${esc(tr(b.protocol[key]))}</dd></div>`).join('')}${b.snapshotLabel?`<div><dt>${t('收录范围','Snapshot scope')}</dt><dd>${esc(tr(b.snapshotLabel))}</dd></div>`:''}<div><dt>${t('榜单类型','Board type')}</dt><dd>${esc(tr(metadata(b).reason))} ${link(metadata(b).evidenceUrl,t('分类依据','Classification source'))}</dd></div>${b.source.releaseId?`<div><dt>${t('数据版本','Data release')}</dt><dd>${esc(b.source.releaseId)}</dd></div>`:''}${b.source.mirrorSyncedAt?`<div><dt>${t('镜像同步','Mirror synced')}</dt><dd>${esc(b.source.mirrorSyncedAt)}</dd></div>`:''}<div><dt>${t('本站采集','Collected by Atlas')}</dt><dd><time datetime="${esc(b.source.snapshotAt)}">${esc(b.source.snapshotAt)}</time></dd></div></dl><div class="lb-links">${links.map(x=>link(x.url,tr(x.label))).join('')}${b.source.dataUrl&&!b.source.request&&!urls.has(b.source.dataUrl)?link(b.source.dataUrl,t('原始成绩数据','Source score data')):''}<a href="./official-leaderboards.json" download>${t('下载全站成绩快照','Download all score snapshots')} ↓</a></div></details>`;
 }
 function externalResults(b){return `<section class="lb-external-results"><h3>${t('原站成绩','Results at source')}</h3><div class="lb-external-tracks">${(b.externalTracks.length?b.externalTracks:[{url:b.source.url,label:t('查看完整榜单','View full leaderboard')}]).map(x=>`<div>${link(x.url,tr(x.label))}${x.resultsUpdatedAt?`<span>${t('成绩更新','Results updated')} <time datetime="${x.resultsUpdatedAt}">${x.resultsUpdatedAt}</time></span>`:''}</div>`).join('')}</div></section>`;}
 function detail(b,e,c){return `<tr class="lb-result-detail"><td colspan="${columnsCount(b,c)}"><div><h4>${esc(e.agentLabel||e.agent)}${e.configuration?' · '+esc(tr(e.configuration)):''}</h4><dl class="lb-scores">${b.columns.map(x=>{const value=e.scores[x.id]?.display??'—';return `<div><dt>${esc(tr(x.label))}${x.unit?' ('+esc(x.unit)+')':''}</dt><dd>${esc(value)}${e.scores[x.id]?.interval?` <small>${esc(e.scores[x.id].interval)}</small>`:''}</dd></div>`;}).join('')}${(e.context||[]).map(x=>`<div><dt>${esc(tr(x.label))}</dt><dd>${esc(tr(x.value))}</dd></div>`).join('')}${e.submissionDate?`<div><dt>${esc(tr(b.dateLabel)||t('提交日期','Submitted'))}</dt><dd>${esc(e.submissionDate)}</dd></div>`:''}</dl><p>${link(e.resultUrl,t('来源成绩与记录','Source result & records'))}${e.mediaUrl?' · '+link(e.mediaUrl,t('运行视频','Run video')):''}</p></div></td></tr>`;}
 function pagination(total){
  if(total<=pageSize)return '';
  const pages=Math.ceil(total/pageSize);
  return `<nav class="lb-pagination" aria-label="${t('成绩分页','Result pages')}"><span>${t('第','Page')} ${pageNumber} / ${pages} ${t('页','')} · ${total} ${t('项成绩','results')}</span><button data-result-page="${pageNumber-1}" ${pageNumber===1?'disabled':''}>${t('上一页','Previous')}</button><button data-result-page="${pageNumber+1}" ${pageNumber===pages?'disabled':''}>${t('下一页','Next')}</button></nav>`;
 }
 function render(){
  if(!selectionVisible())return `${window.AtlasUpdates?.html("leaderboards")||''}${toolbar()}<section class="official-leaderboards" data-no-i18n>${navigation()}${selectionPrompt()}</section>`;
  const b=board(),c=b.columns.find(c=>c.id===metricId),rows=model.rank(b,metricId,query),dates=hasDates(b),checked=hasChecks(b),extra=extraColumns(b,c),config=hasConfig(b),tracks=matchingBoards(sourceFor(b.id));
  const refs=rows.filter(e=>e.reference),competitors=rows.filter(e=>!e.reference),missing=b.entries.filter(e=>!Number.isFinite(e.scores[c.id]?.sortValue)).length;
  pageNumber=Math.min(pageNumber,Math.max(1,Math.ceil(rows.length/pageSize)));
  const visible=rows.slice((pageNumber-1)*pageSize,pageNumber*pageSize),official=c.id==='overall'&&b.entries.some(e=>Number.isFinite(e.officialRank));
  const scoreCell=(e,x,primary=false)=>`<td class="${primary?'lb-score':'lb-secondary-score'}">${esc(e.scores[x.id]?.display??'—')}${primary&&e.scores[x.id]?.interval?`<small class="lb-interval">${esc(e.scores[x.id].interval)}</small>`:''}</td>`;
  const row=e=>`<tr><td class="lb-rank">${e.reference?(official&&Number.isFinite(e.officialRank)?e.officialRank:'—'):e.rank}</td><th scope="row">${esc(e.agentLabel||e.agent)}${e.entryNote?`<small class="lb-reference">${esc(tr(e.entryNote))}</small>`:''}${e.reference?`<small class="lb-reference">${esc(tr(e.referenceLabel))}</small>`:''}</th>${config?`<td class="lb-configuration">${esc(tr(e.configuration)||'—')}</td>`:''}${scoreCell(e,c,true)}${extra.map(x=>scoreCell(e,x)).join('')}${dates?`<td class="lb-date">${esc(e.submissionDate?.slice(0,10)||'—')}</td>`:''}${checked?`<td>${e.officialChecked?`<span class="lb-checked">✓ ${t('已核验','Checked')}</span>`:'—'}</td>`:''}<td><button data-score-detail="${e.id}" aria-expanded="${expanded===e.id}" aria-label="${esc(e.agent)} · ${t('成绩详情','Result details')}">${expanded===e.id?t('收起','Close'):t('展开','View')}</button></td></tr>${expanded===e.id?detail(b,e,c):''}`;
  let referenceHeading=false;
  const body=visible.map(e=>{let h='';if(e.reference&&!referenceHeading){referenceHeading=true;h=`<tr class="lb-reference-heading"><th colspan="${columnsCount(b,c)}">${t('未排名 / 参考成绩','Unranked / reference results')}</th></tr>`;}return h+row(e);}).join('');
  return `${window.AtlasUpdates?.html("leaderboards")||''}${toolbar()}<section class="official-leaderboards" data-no-i18n>${navigation()}<div class="lb-main"><header class="lb-heading"><div class="lb-heading-top"><div><h2>${esc(sourceFor(b.id).title)}</h2><span class="lb-kind" data-kind="${metadata(b).kind}">${t(...kinds[metadata(b).kind])}</span></div>${resultDate(b)}</div><p class="lb-research-use">${esc(tr(b.researchUse)||tr(b.protocol.scope))}</p>${sourceContext(b)}<p class="lb-conditions">${esc(tr(b.protocolKey)||coverage(b))}</p></header>
${b.displayMode==='external'?externalResults(b):`<div class="lb-controls">${tracks.length>1?`<label>${t('赛道 / 配置组','Track / setup group')}<select id="leaderboard-track">${tracks.map(x=>`<option value="${x.id}" ${x.id===b.id?'selected':''}>${esc(tr(x.trackLabel)||shortTitle(x))}</option>`).join('')}</select></label>`:''}<label>${t('排序指标','Sort by')}<select id="leaderboard-metric">${rankedColumns(b).map(x=>`<option value="${x.id}" ${x.id===metricId?'selected':''}>${esc(tr(x.label))} ${x.direction==='asc'?'↑':'↓'}</option>`).join('')}</select></label><label class="lb-search-label">${t('查找','Search')}<input id="leaderboard-search" type="search" maxlength="200" value="${esc(query)}" placeholder="${t('模型、策略或配置','Model, agent or setup')}"></label></div>
<div class="lb-table-meta"><span>${competitors.length} ${t('项排名成绩','ranked results')}${refs.length?` · ${refs.length} ${t('项未排名 / 参考','unranked / reference')}`:''}${missing?` · ${missing} ${t('项未报告此指标','without this metric')}`:''}</span><span>${official?t('原榜名次','Source ranks'):t('按当前指标排序','Sorted by selected metric')} · ${c.direction==='asc'?t('越低越好','Lower is better'):t('越高越好','Higher is better')}</span></div>
<div class="lb-table-wrap"><table class="lb-table"><thead><tr><th scope="col">${official?t('原榜名次','Source rank'):t('排序','Order')}</th><th scope="col">${esc(tr(b.agentLabel)||'Agent / '+t('模型','Model'))}</th>${config?`<th scope="col">${t('配置','Setup')}</th>`:''}<th scope="col" class="lb-numeric-heading">${esc(tr(c.label))}${c.unit?' ('+esc(c.unit)+')':''}</th>${extra.map(x=>`<th scope="col" class="lb-numeric-heading">${esc(tr(x.label))}${x.unit?' ('+esc(x.unit)+')':''}</th>`).join('')}${dates?`<th scope="col">${esc(tr(b.dateLabel)||t('提交日期','Submitted'))}</th>`:''}${checked?`<th scope="col">${t('核验','Check')}</th>`:''}<th scope="col"><span class="sr-only">${t('详情','Details')}</span></th></tr></thead><tbody>${body||`<tr><td colspan="${columnsCount(b,c)}" class="lb-empty">${t('没有匹配的成绩。','No matching results.')} <button data-leaderboard-clear>${t('清空搜索','Clear search')}</button></td></tr>`}</tbody></table></div>${pagination(rows.length)}`}
${protocol(b)}</div></section>`;
 }
 function bind(root,refresh){
  const redraw=()=>refresh();
  root.addEventListener('toggle',e=>{if(e.target.id==='leaderboard-direction'&&e.target.isConnected)directionOpen=e.target.open;},true);
  root.addEventListener('click',e=>{
   const b=e.target.closest('button');if(!b)return;let focus=null;
   if('protocolToggle'in b.dataset){const panel=root.querySelector('#leaderboard-protocol');panel.open=true;panel.scrollIntoView({block:'start',behavior:'smooth'});return;}
   else if(b.dataset.resultPage){pageNumber=Math.max(1,Number(b.dataset.resultPage));expanded=null;save();redraw();root.querySelector('.lb-controls')?.scrollIntoView({block:'start'});root.querySelector('.lb-pagination button:not(:disabled)')?.focus({preventScroll:true});return;}
   else if(b.dataset.leaderboard){selectBoard(b.dataset.leaderboard);focus=`[data-leaderboard="${boardId}"]`;}
   else if(b.dataset.boardType){navStatus=b.dataset.boardType;focus=`[data-board-type="${navStatus}"]`;}
   else if('clearGroup'in b.dataset){navGroup='all';focus='#leaderboard-direction summary';}
   else if(b.dataset.gameMetric){metricId=b.dataset.gameMetric;query='';expanded=null;}
   else if('resetFilters'in b.dataset){navGroup='all';navStatus='all';focus='[data-board-type="all"]';}
   else if(b.dataset.scoreDetail){expanded=expanded===b.dataset.scoreDetail?null:b.dataset.scoreDetail;focus=`[data-score-detail="${b.dataset.scoreDetail}"]`;}
   else if('leaderboardClear'in b.dataset){query='';pageNumber=1;focus='#leaderboard-search';}else return;
   save();redraw();if(focus)root.querySelector(focus)?.focus({preventScroll:true});
  });
  root.addEventListener('change',e=>{
   if(e.target.id==='leaderboard-track'){selectBoard(e.target.value);save();redraw();root.querySelector('#leaderboard-track')?.focus({preventScroll:true});return;}
   if(e.target.id==='leaderboard-group'){navGroup=e.target.value;directionOpen=true;save();redraw();root.querySelector('#leaderboard-group').focus({preventScroll:true});return;}
   if(e.target.id!=='leaderboard-metric')return;metricId=e.target.value;expanded=null;pageNumber=1;save();redraw();root.querySelector('#leaderboard-metric').focus({preventScroll:true});
  });
  root.addEventListener('input',e=>{if(e.target.id!=='leaderboard-search')return;query=e.target.value;expanded=null;pageNumber=1;const pos=e.target.selectionStart;save();redraw();const input=root.querySelector('#leaderboard-search');input.focus({preventScroll:true});try{input.setSelectionRange(pos,pos);}catch{}});
 }
 readURL();window.AtlasLeaderboards={readURL,render,bind};
})();
