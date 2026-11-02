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
  return `<div class="lb-result-date"><span>${metadata(b).dateLabel?esc(tr(metadata(b).dateLabel)):t(...labels[kind])}</span>${value?`<time datetime="${esc(value)}">${esc(value.slice(0,10))}</time>`:`<strong class="lb-date-unknown">${metadata(b).dateMissingLabel?esc(tr(metadata(b).dateMissingLabel)):t('来源未公布','Not published by source')}</strong>`}</div>`;
 }
 const rankedColumns=b=>b.columns.filter(c=>c.rankable!==false);
 let boardId=data.sources[0].boardIds[0],metricId='overall',query='',expanded=null,navGroup='all',navStatus='all',directionOpen=false;
 const board=()=>data.boards.find(b=>b.id===boardId);
 function readURL(){
  const p=new URLSearchParams(location.search);
  boardId=data.boards.find(b=>b.id===p.get('arenaBoard'))?.id||data.sources[0].boardIds[0];
  metricId=rankedColumns(board()).find(c=>c.id===p.get('arenaMetric'))?.id||'overall';
  query=(p.get('arenaQuery')||'').slice(0,200);
  navGroup=groups.some(([key])=>key===p.get('arenaGroup'))?p.get('arenaGroup'):'all';
  navStatus=Object.hasOwn(kinds,p.get('arenaStatus'))?p.get('arenaStatus'):'all';
  if(!data.boards.some(b=>b.id===p.get('arenaBoard'))&&navBoards().length)selectBoard(navBoards()[0].id);expanded=null;
 }
 function save(){const u=new URL(location.href);u.searchParams.set('arenaBoard',boardId);u.searchParams.set('arenaMetric',metricId);for(const [key,value,empty] of [['arenaQuery',query,''],['arenaGroup',navGroup,'all'],['arenaStatus',navStatus,'all']]){if(value===empty)u.searchParams.delete(key);else u.searchParams.set(key,value);}u.searchParams.delete('arenaCollection');history.replaceState({},'',u);}
 function selectBoard(id){if(id===boardId)return;boardId=id;metricId='overall';query='';expanded=null;}
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
 function sourceContext(b){
  const source=sourceFor(b.id),tracks=matchingBoards(source),maintainer=b.maintainer||({'balrog':'BALROG authors','orak':'KRAFTON AI · Orak authors'}[source.id]||source.title+' · '+t('项目 / 竞赛维护方','project / competition maintainers'));
  return `${source.boardIds.length>1?`<div class="lb-track-switch" role="group" aria-label="${t('赛道','Track')}">${tracks.map(x=>`<button data-leaderboard="${x.id}" aria-pressed="${x.id===b.id}">${esc(shortTitle(x))}</button>`).join('')}</div>`:''}
   <p class="lb-maintainer">${t('维护方','Maintainer')} · ${esc(maintainer)}${b.cadence?' · '+esc(tr(b.cadence)):''}</p>
   `;
 }
 function protocolSummary(b){return `${b.protocol.control?`<dl class="lb-protocol-summary"><div><dt>${t('参评方式','Entry type')}</dt><dd>${esc(tr(b.protocol.control))}</dd></div><div><dt>${t('评价方式','Scoring')}</dt><dd>${esc(tr(b.protocol.scoring))}</dd></div><div><dt>${t('预算与赛制','Budget & format')}</dt><dd>${esc(tr(b.protocol.budget))}</dd></div></dl>`:''}
   ${(b.gameLinks||[]).map(g=>`<p class="lb-game-link"><button data-game-metric="${g.metricId}">${esc(g.label)} ${t('分项成绩','scores')} →</button> <a href="?lang=${window.AtlasLanguage.current()}&view=explore&detail=${encodeURIComponent(g.benchmarkId)}">${t('环境档案','Environment archive')} ↗</a></p>`).join('')}`;
 }
 function externalResults(b){return `<section class="lb-external-results"><h3>${t('原站成绩','Results at source')}</h3><p>${t('查看维护方发布的最新排名、对局记录与完整配置。','View the maintainer’s latest rankings, match records and full configurations.')}</p><div class="lb-external-tracks">${(b.externalTracks.length?b.externalTracks:[{url:b.source.url,label:t('查看完整榜单','View full leaderboard')}]).map(x=>`<div>${link(x.url,tr(x.label))}${x.resultsUpdatedAt?`<span>${t('成绩更新','Results updated')} <time datetime="${x.resultsUpdatedAt}">${x.resultsUpdatedAt}</time></span>`:''}</div>`).join('')}</div></section>`;}
 function columnsCount(b){return 4+Number(b.entries.some(e=>e.submissionDate))+Number(b.entries.some(e=>'officialChecked'in e))+Number(!!b.summaryMetric);}
 function detail(b,e){return `<tr class="lb-result-detail"><td colspan="${columnsCount(b)}"><div><h4>${esc(e.agent)}</h4><dl class="lb-scores">${b.columns.map(c=>{const value=e.scores[c.id]?.display??'—';return `<div><dt>${esc(tr(c.label))}</dt><dd>${esc(value)}${c.unit&&!String(value).includes(c.unit)&&value!=='—'?' '+esc(c.unit):''}</dd></div>`;}).join('')}${(e.context||[]).map(x=>`<div><dt>${esc(tr(x.label))}</dt><dd>${esc(tr(x.value))}</dd></div>`).join('')}</dl><p>${link(e.resultUrl,t('来源成绩与记录','Source result & records'))} · ${link(b.protocol.links[0].url,t('评测协议','Evaluation protocol'))}${e.mediaUrl?' · '+link(e.mediaUrl,t('运行视频','Run video')):''}</p></div></td></tr>`;}
 function render(){
  if(!selectionVisible())return `${toolbar()}<section class="official-leaderboards" data-no-i18n>${navigation()}${selectionPrompt()}</section>`;
  const b=board(),c=b.columns.find(c=>c.id===metricId),rows=model.rank(b,metricId,query),dates=b.entries.some(e=>e.submissionDate),checked=b.entries.some(e=>'officialChecked'in e),summary=b.columns.find(c=>c.id===b.summaryMetric);
  const refs=rows.filter(e=>e.reference),competitors=rows.filter(e=>!e.reference),missing=b.entries.filter(e=>!Number.isFinite(e.scores[c.id]?.sortValue)).length;
  const row=e=>`<tr><td class="lb-rank">${e.reference?t('参考','Ref.'):e.rank}</td><th scope="row">${esc(e.agent)}${e.reference?`<small class="lb-reference">${esc(tr(e.referenceLabel))}</small>`:''}</th><td class="lb-score">${esc(e.scores[c.id].display)}</td>${summary?`<td class="lb-score">${esc(e.scores[summary.id]?.display??'—')}</td>`:''}${dates?`<td class="lb-date">${esc(e.submissionDate||'—')}</td>`:''}${checked?`<td>${e.officialChecked?'<span class="lb-checked">✓ Checked</span>':'—'}</td>`:''}<td><button data-score-detail="${e.id}" aria-expanded="${expanded===e.id}">${expanded===e.id?t('收起','Close'):t('展开','View')}</button></td></tr>${expanded===e.id?detail(b,e):''}`;
  return `${toolbar()}<section class="official-leaderboards" data-no-i18n>${navigation()}<div class="lb-main"><header class="lb-heading"><div class="lb-heading-top"><div><span class="lb-kind" data-kind="${metadata(b).kind}">${t(...kinds[metadata(b).kind])}</span><h2>${esc(tr(b.title))}</h2></div>${resultDate(b)}</div>${sourceContext(b)}<p class="lb-coverage">${t("覆盖范围","Coverage")} · ${esc(coverage(b))}</p>${b.researchUse?`<p class="lb-research-use">${esc(tr(b.researchUse))}</p>`:''}<p>${esc(tr(b.protocol.scope))}</p>${protocolSummary(b)}<div class="lb-links">${link(b.source.url,t('来源榜单','Source leaderboard'))}${link(b.protocol.links[0].url,t('评测协议','Evaluation protocol'))}${b.benchmarkId?`<a href="?lang=${window.AtlasLanguage.current()}&view=explore&detail=${encodeURIComponent(b.benchmarkId)}">${t('Benchmark 档案','Benchmark archive')} →</a>`:''}</div><p class="lb-collected">${t('本站采集','Collected by Atlas')} <time datetime="${esc(b.source.snapshotAt)}">${b.source.snapshotAt.slice(0,10)}</time></p></header>
${b.displayMode==='external'?externalResults(b):` <div class="lb-controls"><label>${t('排名指标','Rank by')}<select id="leaderboard-metric">${rankedColumns(b).map(x=>`<option value="${x.id}" ${x.id===metricId?'selected':''}>${esc(tr(x.label))} ${x.direction==='asc'?'↑':'↓'}</option>`).join('')}</select></label><label>${t('查找 Agent','Find an agent')}<input id="leaderboard-search" type="search" maxlength="200" value="${esc(query)}" placeholder="${t('模型或策略名称','Model or strategy name')}"></label><span>${competitors.length} ${t('项成绩','results')}${refs.length?` · ${refs.length} ${t('项参考','references')}`:''}</span></div>
 <p class="lb-caption">${t('本站成绩快照','Atlas score snapshot')}${b.snapshotLabel?' · '+esc(tr(b.snapshotLabel)):''} · ${esc(b.rankingNote&&c.id==='overall'?tr(b.rankingNote):`${tr(c.label)} · ${c.direction==='asc'?t('越低越好','Lower is better'):t('越高越好','Higher is better')} · ${t('按来源数值排序，并列同名次','Sorted by source values; ties share a rank')}`)}${missing?` <span class="lb-missing">${missing} ${t('项未报告此指标，可切换指标查看。','entries do not report this metric; select another metric to view them.')}</span>`:''}</p>
 <div class="lb-table-wrap"><table class="lb-table"><thead><tr><th scope="col">${t('名次','Rank')}</th><th scope="col">Agent / ${t('策略','Strategy')}</th><th scope="col">${esc(tr(c.label))}${c.unit?' ('+esc(c.unit)+')':''}</th>${summary?`<th scope="col">${esc(tr(summary.label))}</th>`:''}${dates?`<th scope="col">${esc(tr(b.dateLabel)||t('提交日期','Submitted'))}</th>`:''}${checked?`<th scope="col">${t('官方核验','Official check')}</th>`:''}<th scope="col">${t('详情','Details')}</th></tr></thead><tbody>${competitors.map(row).join('')}${refs.length?`<tr class="lb-reference-heading"><th colspan="${columnsCount(b)}">${t('参考成绩 · 不参与上述名次','Reference results · excluded from ranks above')}</th></tr>${refs.map(row).join('')}`:''}${rows.length?'':`<tr><td colspan="${columnsCount(b)}" class="lb-empty">${t('没有匹配的 Agent。','No matching agents.')} <button data-leaderboard-clear>${t('清空搜索','Clear search')}</button></td></tr>`}</tbody></table></div>
`}
 <details class="lb-protocol"><summary>${t('指标、协议与成绩来源','Metrics, protocol & provenance')}</summary><dl><div><dt>${t('榜单类型','Board type')}</dt><dd>${esc(tr(metadata(b).reason))} ${link(metadata(b).evidenceUrl,t('分类依据','Classification source'))}</dd></div>${[...(!b.protocol.control?[['scoring',t('评价方式','Scoring')]]:[]),['variation',t('统计信息','Statistics')],['verification',t('成绩来源','Result provenance')],['dates',t('日期含义','Dates')]].map(([key,label])=>`<div><dt>${label}</dt><dd>${esc(tr(b.protocol[key]))}</dd></div>`).join('')}</dl><div class="lb-links">${b.protocol.links.map(x=>link(x.url,tr(x.label))).join('')}${b.source.dataUrl&&!b.source.request&&b.source.dataUrl!==b.source.url?link(b.source.dataUrl,t('原始成绩数据','Source score data')):''}<a href="./official-leaderboards.json" download>${t('下载成绩快照','Download score snapshot')} ↓</a></div></details></div></section>`;
 }
 function bind(root,refresh){
  const redraw=()=>refresh();
  root.addEventListener('toggle',e=>{if(e.target.id==='leaderboard-direction'&&e.target.isConnected)directionOpen=e.target.open;},true);
  root.addEventListener('click',e=>{
   const b=e.target.closest('button');if(!b)return;let focus=null;
   if(b.dataset.leaderboard){selectBoard(b.dataset.leaderboard);focus=`[data-leaderboard="${boardId}"]`;}
   else if(b.dataset.boardType){navStatus=b.dataset.boardType;focus=`[data-board-type="${navStatus}"]`;}
   else if('clearGroup'in b.dataset){navGroup='all';focus='#leaderboard-direction summary';}
   else if(b.dataset.gameMetric){metricId=b.dataset.gameMetric;query='';expanded=null;}
   else if('resetFilters'in b.dataset){navGroup='all';navStatus='all';focus='[data-board-type="all"]';}
   else if(b.dataset.scoreDetail){expanded=expanded===b.dataset.scoreDetail?null:b.dataset.scoreDetail;focus=`[data-score-detail="${b.dataset.scoreDetail}"]`;}
   else if('leaderboardClear'in b.dataset){query='';focus='#leaderboard-search';}else return;
   save();redraw();if(focus)root.querySelector(focus)?.focus({preventScroll:true});
  });
  root.addEventListener('change',e=>{
   if(e.target.id==='leaderboard-group'){navGroup=e.target.value;directionOpen=true;save();redraw();root.querySelector('#leaderboard-group').focus({preventScroll:true});return;}
   if(e.target.id!=='leaderboard-metric')return;metricId=e.target.value;expanded=null;save();redraw();root.querySelector('#leaderboard-metric').focus({preventScroll:true});
  });
  root.addEventListener('input',e=>{if(e.target.id!=='leaderboard-search')return;query=e.target.value;expanded=null;const pos=e.target.selectionStart;save();redraw();const input=root.querySelector('#leaderboard-search');input.focus({preventScroll:true});try{input.setSelectionRange(pos,pos);}catch{}});
 }
 readURL();window.AtlasLeaderboards={readURL,render,bind};
})();
