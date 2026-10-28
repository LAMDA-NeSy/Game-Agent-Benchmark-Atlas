'use strict';
(() => {
 const E=window.ArenaEngine;
 const config={mode:'compare',seed:42,budget:48,a:'bfs',b:'greedy'};
 let world,runs,timer=null,frame=0,root,visible=false,initialized=false;
 const t=(zh,en)=>window.AtlasLanguage.current()==='zh'?zh:en;
 const names={bfs:()=>t('规划基线 · BFS','Planning baseline · BFS'),greedy:()=>t('贪心基线','Greedy baseline'),random:()=>t('随机基线','Random baseline')};
 const labels={ready:()=>t('待运行','Ready'),running:()=>t('运行中','Running'),success:()=>t('已到达目标','Goal reached'),budget:()=>t('预算耗尽','Budget exhausted')};
 const maxStep=()=>Math.max(...runs.map(r=>r.steps));
 const complete=()=>runs.every(r=>['success','budget'].includes(r.status));
 function pause(){clearInterval(timer);timer=null;}
 function reset(){pause();world=E.makeWorld(config.seed);runs=[E.createRun(world,config.a,config.budget,config.seed+100),...(config.mode==='compare'?[E.createRun(world,config.b,config.budget,config.seed+200)]:[])];frame=0;}
 function advance(){for(const r of runs)E.step(world,r);frame=maxStep();if(complete())pause();render();}
 function policy(id,value){return `<label>${id==='a'?'Agent A':'Agent B'}<select id="arena-${id}" ${timer?'disabled':''}>${Object.keys(names).map(k=>`<option value="${k}" ${k===value?'selected':''}>${names[k]()}</option>`).join('')}</select></label>`;}
 function board(r,i){
  const h=r.history[Math.min(frame,r.steps)],trail=r.history.slice(0,h.step+1),pos=h.pos;
  return `<article class="arena-agent"><div class="arena-agent-heading"><div><span class="eyebrow">AGENT ${i?'B':'A'}</span><h3>${names[r.policy]()}</h3></div><span class="arena-status ${h.step===r.steps?r.status:''}">${frame<r.steps?t('回放','Replay'):labels[r.status]()}</span></div><div class="arena-board ${i?'agent-b':''}" role="img" aria-label="${t('网格轨迹；当前位置','Grid trajectory; current position')} (${pos.join(', ')})">${Array.from({length:world.size**2},(_,idx)=>{const x=idx%world.size,y=Math.floor(idx/world.size),key=x+','+y,isAgent=pos[0]===x&&pos[1]===y,isWall=world.walls.includes(key),goal=x===8&&y===8,start=x===0&&y===0,visited=trail.some(p=>p.pos[0]===x&&p.pos[1]===y);return `<span class="arena-cell ${isWall?'wall':''} ${visited?'visited':''} ${goal?'goal':''} ${isAgent?'player':''}" aria-hidden="true">${isAgent?(i?'B':'A'):goal?'G':start?'S':''}</span>`;}).join('')}</div><div class="arena-agent-meta"><span>${t('当前步','Current step')} <b>${h.step}</b> / ${config.budget}</span><span>${t('重复访问','Revisits')} <b>${trail.filter(p=>p.revisit).length}</b></span></div></article>`;
 }
 function render(){
  if(!root||!visible)return;
  const focus=root.contains(document.activeElement)?document.activeElement.id:null;
  root.innerHTML=`<div class="arena-taskbar"><div class="arena-environment"><strong>Grid Courier</strong><span>${t('演示环境 · 9 × 9 · 全图可见','Demo environment · 9 × 9 · Full observation')}</span></div><p>${t('浏览器基线策略；未连接真实模型。','Browser-local baseline policies. No live model connection.')}</p></div>
  <div class="arena-workspace"><aside class="arena-config" aria-label="${t('运行配置','Run configuration')}"><div class="arena-mode-field"><span>${t('运行模式','Mode')}</span><div class="arena-mode" role="group" aria-label="${t('运行模式','Run mode')}"><button id="arena-single" data-arena-mode="single" aria-pressed="${config.mode==='single'}">${t('单 Agent 试玩','Single agent')}</button><button id="arena-compare" data-arena-mode="compare" aria-pressed="${config.mode==='compare'}">${t('双 Agent 对比','Compare agents')}</button></div></div>${policy('a',config.a)}${config.mode==='compare'?policy('b',config.b):'<div class="arena-unused"></div>'}<label>${t('地图种子','Map seed')}<input id="arena-seed" type="number" min="1" max="9999" step="1" value="${config.seed}" ${timer?'disabled':''}></label><label>${t('每个 Agent 的步数预算','Step budget per agent')}<select id="arena-budget" ${timer?'disabled':''}>${[24,48,96].map(n=>`<option ${n===config.budget?'selected':''}>${n}</option>`).join('')}</select></label><div class="arena-config-help"><p class="arena-config-note">${t('两侧使用相同地图、起终点、完整观测和动作预算，分别独立运行。修改配置会重置本轮。','Both agents run independently with the same map, endpoints, full observation and action budget. Changing settings resets the run.')}</p><details class="arena-policy-notes"><summary>${t('策略与任务说明','Policies & task definition')}</summary><p>${t('规划基线使用 BFS 搜索最短路径；贪心基线每步选择曼哈顿距离最小的合法邻居，同距按东、南、西、北排序；随机基线以固定种子选择合法动作。','The planning baseline uses BFS for shortest paths. Greedy selects the legal neighbor with minimum Manhattan distance, breaking ties east, south, west, north. Random uses seeded legal-action sampling.')}</p><p>${t('S 为起点，G 为目标，深色方格为障碍。动作是上下左右移动一格；到达目标或预算用尽后终止。本环境不是 MiniGrid 或其他已收录 Benchmark 的实现。','S is the start, G is the goal, and dark cells are obstacles. Actions move one cell north, south, east or west; episodes end at the goal or budget limit. This environment is not an implementation of MiniGrid or another indexed benchmark.')}</p></details></div></aside>
  <div class="arena-main"><div class="arena-runbar"><div><button class="button dark" id="arena-run" ${complete()?'disabled':''}>${complete()?t('运行结束','Run complete'):timer?t('暂停','Pause'):maxStep()?t('继续运行','Resume'):t('开始运行','Start run')}</button><button class="button light" id="arena-step" ${timer||complete()?'disabled':''}>${t('单步执行','Step')}</button><button class="text-button" id="arena-reset">${t('重置本轮','Reset run')}</button></div><span class="arena-run-state" role="status">${timer?t('运行中','Running'):complete()?t('本轮已结束','Run complete'):maxStep()?t('已暂停','Paused'):t('准备就绪','Ready')}</span></div>
  <div class="arena-boards ${config.mode}">${runs.map(board).join('')}</div><div class="arena-legend"><span><i class="legend-path"></i>${t('已访问轨迹','Visited path')}</span><span><i class="legend-wall"></i>${t('障碍','Wall')}</span><span>G · ${t('目标','Goal')}</span><span>${t('坐标从 (0, 0) 开始','Coordinates begin at (0, 0)')}</span></div>
  <div class="arena-replay"><label for="arena-frame">${t('轨迹回放','Replay')} <b>${frame} / ${maxStep()}</b></label><input id="arena-frame" type="range" min="0" max="${Math.max(1,maxStep())}" value="${frame}" ${timer||!maxStep()?'disabled':''}><button id="arena-latest" class="text-button" ${timer||frame===maxStep()?'disabled':''}>${t('最新状态','Latest state')}</button></div>
  <section class="arena-results"><div class="arena-section-heading"><h3>${t('本轮观测','Run observations')}</h3><button id="arena-export" class="text-button" ${!maxStep()?'disabled':''}>${t('导出轨迹 JSON ↓','Export trace JSON ↓')}</button></div><div class="arena-table-wrap"><table><caption class="sr-only">${t('当前运行的累计指标，不随回放位置变化','Cumulative run metrics, independent of replay position')}</caption><thead><tr><th>${t('指标','Metric')}</th>${runs.map((r,i)=>`<th>Agent ${i?'B':'A'}</th>`).join('')}</tr></thead><tbody><tr><th>${t('完成状态','Outcome')}</th>${runs.map(r=>`<td>${labels[r.status]()}</td>`).join('')}</tr><tr><th>${t('动作步数','Steps')}</th>${runs.map(r=>`<td>${r.steps} / ${config.budget}</td>`).join('')}</tr><tr><th>${t('重复访问','Revisits')}</th>${runs.map(r=>`<td>${r.revisits}</td>`).join('')}</tr><tr><th>${t('最短路径','Shortest path')}</th>${runs.map(()=>`<td>${E.shortest(world,world.start).length}</td>`).join('')}</tr></tbody></table></div><p>${t('指标为本轮累计值，不随回放位置变化。重复访问包括再次进入已访问格子。本轮结果仅说明该策略在当前种子下的行为，不构成模型排名。','Metrics are cumulative for this run, independent of replay position. Revisits count re-entry into previously visited cells. One seeded episode describes these policies here; it is not a model ranking.')}</p></section>
  <details class="arena-log"><summary>${t('查看动作记录','Inspect action log')} · ${t('截至回放位置','through replay position')} ${frame}</summary><div>${runs.map((r,i)=>`<section><h4>Agent ${i?'B':'A'}</h4><ol>${r.history.slice(1,frame+1).map(h=>`<li><span>${String(h.step).padStart(2,'0')}</span> ${h.action} → (${h.pos.join(', ')}) ${h.revisit?'↺':''}</li>`).join('')||`<li>${t('尚无动作','No actions yet')}</li>`}</ol></section>`).join('')}</div></details></div></div>
  <details class="arena-next"><summary>${t('模型与游戏接入状态','Model & game integration status')}</summary><p>${t('后续接入模型与游戏运行器后，可沿用这里的配置、观测、动作与回放流程，记录模型版本、提示词、环境版本、token 与延迟，并进行多种子评测。Minecraft、Overcooked 与 StarCraft II 当前仍为文献和任务档案，尚不能在 Arena 中启动。','Future model and game runners can use this configuration, observation, action and replay flow, with model versions, prompts, environment versions, tokens, latency and multi-seed evaluation recorded. Minecraft, Overcooked and StarCraft II currently have research profiles only; they cannot be launched in Arena yet.')}</p><button class="text-button" data-view="games">${t('查看游戏与任务档案 →','Browse games and task profiles →')}</button></details>`;
  if(focus)root.querySelector('#'+focus)?.focus({preventScroll:true});
 }
 function init(){
  root=document.querySelector('#arena-content');reset();initialized=true;
  root.addEventListener('click',e=>{
   const b=e.target.closest('button');if(!b||b.disabled)return;
   if(b.dataset.arenaMode){config.mode=b.dataset.arenaMode;reset();}
   else if(b.id==='arena-run'){if(timer)pause();else {frame=maxStep();timer=setInterval(advance,260);}}
   else if(b.id==='arena-step'){advance();return;}
   else if(b.id==='arena-reset')reset();
   else if(b.id==='arena-latest')frame=maxStep();
   else if(b.id==='arena-export'){
    const result={schema:'atlas-arena-trace-v1',demo:true,modelServiceConnected:false,environment:world,config:{...config},observation:'full-map',actionSpace:['N','S','E','W'],runs:runs.map(({random,...r})=>r)};
    const a=document.createElement('a'),url=URL.createObjectURL(new Blob([JSON.stringify(result,null,2)],{type:'application/json'}));a.href=url;a.download=`arena-grid-courier-seed-${config.seed}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return;
   }else return;
   render();
  });
  root.addEventListener('change',e=>{
   const id=e.target.id;
   if(id==='arena-frame'){frame=Number(e.target.value);render();return;}
   if(id==='arena-seed'){const n=Number(e.target.value);config.seed=Number.isInteger(n)&&n>=1&&n<=9999?n:42;}
   else if(id==='arena-budget')config.budget=Number(e.target.value);
   else if(id==='arena-a'||id==='arena-b')config[id.slice(-1)]=e.target.value;
   else return;
   reset();render();
  });
 }
 window.AtlasArena={show(on){visible=on;if(!on){pause();return;}if(!initialized)init();render();}};
})();
