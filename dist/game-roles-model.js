'use strict';
(function(root){
 function create(data,review){
  const games=new Map(data.gameIndex.map(g=>[g.id,g]));
  const units=data.documentedTasks||[],records=new Map([...data.records,...(data.gameCatalogRecords||[])].map(r=>[r.id,r]));
  const linkGames=new WeakMap(),cache=new Map();
  for(const g of games.values())for(const l of g.links)linkGames.set(l,g.id);
  const roleIds=['data','offline','online','related','unverified'];
  function classify(gameId,benchmark){
   const key=gameId+':'+benchmark;if(cache.has(key))return cache.get(key);
   const game=games.get(gameId),link=game?.links.find(l=>l.benchmark===benchmark);
   if(!link)return {roles:[],claims:[],gaps:[],units:[],executionVerified:false};
   const gaps=(review.gaps||[]).filter(g=>g.benchmark===benchmark&&g.gameIds.includes(gameId));
   const scoped=units.filter(u=>u.benchmark===benchmark&&u.gameIds.some(id=>id===gameId||(link.taskCoverageIncludesMembers&&games.get(id)?.subgameParents?.some(p=>p.parentId===gameId&&p.benchmark===benchmark))));
   const claims=(review.claims||[]).filter(c=>c.benchmark===benchmark&&c.gameIds.includes(gameId)).map(c=>({...c,origin:'review'}));
   for(const mode of ['offline','online']){
    const selected=scoped.filter(u=>review.unitModes[u.id]===mode);if(!selected.length)continue;
    claims.push({roles:[mode],origin:'task-protocol',unitIds:selected.map(u=>u.id),basis:{zh:selected.map(u=>u.task.zh).join('；'),en:selected.map(u=>u.task.en).join('; ')},evidence:[...new Map(selected.flatMap(u=>u.evidence).map(e=>[e.url,e])).values()],memberScope:selected.some(u=>!u.gameIds.includes(gameId))});
   }
   if(!claims.length){
    const r=records.get(benchmark),eligibility=r?.taskReview?.eligibility;
    const related=eligibility?.decision==='out_of_scope'&&eligibility.reason!=='static_diagnostic';
    claims.push({roles:[related?'related':'unverified'],origin:'scope-review',basis:related?{zh:r.taskReview.noteZh,en:r.taskReview.noteEn}:gaps[0]?.note||{zh:scoped.length?'当前任务尚未核定为在线交互或离线评价，不能仅凭动作字段判定用途。':(link.attribution? '已确认游戏归属；本游戏的数据、固定样本评价或环境交互任务用途仍缺直接证据。':'当前仅有题录或合集关联，尚缺本游戏对应的数据或任务用途依据。'),en:scoped.length?'This task has not yet been reviewed as online interaction or offline evaluation; an action field alone does not establish its use.':(link.attribution?'Game attribution is confirmed, but direct evidence for data, fixed-sample evaluation or interactive tasks in this game remains missing.':'Only bibliographic or collection linkage is available; game-specific data or task-use evidence is still missing.')},evidence:related?(r.taskReview.evidence||[]):gaps[0]?.evidence||(link.attribution?.evidence||[{url:link.source,title:r.name}])});
   }
   const roles=roleIds.filter(id=>claims.some(c=>c.roles.includes(id)));
   // Runtime verification must belong to this game and online protocol, never a
   // sibling game, a repository link, an author result or a broad platform claim.
   const executionVerified=scoped.some(u=>u.gameIds.includes(gameId)&&review.unitModes[u.id]==='online'&&u.executionVerified===true);
   const result={roles,claims,gaps,units:scoped.map(u=>u.id),executionVerified};cache.set(key,result);return result;
  }
  function forLink(link){return classify(linkGames.get(link),link.benchmark);}
  function summary(gameId,{benchmarkIds=null}={}){
   const allowed=benchmarkIds?new Set(benchmarkIds):null;
   const entries=(games.get(gameId)?.links||[]).filter(l=>!allowed||allowed.has(l.benchmark)).map(l=>({benchmark:l.benchmark,...classify(gameId,l.benchmark)}));
   return {total:entries.length,counts:Object.fromEntries(roleIds.map(id=>[id,entries.filter(e=>e.roles.includes(id)).length])),withGaps:entries.filter(e=>e.gaps.length).length,executionVerified:entries.filter(e=>e.executionVerified).length,entries};
  }
  return {classify,forLink,summary,roleIds};
 }
 if(typeof module!=='undefined')module.exports={create};else root.AtlasGameRolesModel={create};
})(typeof window==='undefined'?{}:window);
