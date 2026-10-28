'use strict';
(function(root){
 function create(data,dimensions=data.taskDimensions){
  const units=data.documentedTasks||[],games=new Map(data.gameIndex.map(g=>[g.id,g]));
  const records=new Map([...data.records,...data.gameCatalogRecords].map(r=>[r.id,r]));
  function inScope(id,benchmark,{gameId,category}={}){
   const g=games.get(id);if(!g)return false;
   const scopedGames=[g,...(g.subgameParents||[]).filter(p=>p.benchmark===benchmark).map(p=>games.get(p.parentId)).filter(Boolean)];
   return scopedGames.some(x=>(!gameId||x.id===gameId)&&(!category||x.categories.includes(category)));
  }
  function select(scope={}){
   const allowed=scope.benchmarkIds?new Set(scope.benchmarkIds):null;
   return units.filter(u=>(!allowed||allowed.has(u.benchmark))&&u.gameIds.some(id=>inScope(id,u.benchmark,scope)));
  }
  function inventory(scope={}){
   const allowed=scope.benchmarkIds?new Set(scope.benchmarkIds):null,ids=new Set();
   if(!scope.gameId&&!scope.category)for(const id of records.keys())ids.add(id);
   else for(const g of games.values())for(const l of g.links)if(inScope(g.id,l.benchmark,scope))ids.add(l.benchmark);
   const scoped=select(scope),validCaps=new Set(dimensions.map(d=>d.id));
   const entries=[...ids].filter(id=>!allowed||allowed.has(id)).map(id=>{
    const r=records.get(id),su=scoped.filter(u=>u.benchmark===id),mapped=su.some(u=>u.capabilities.some(c=>validCaps.has(c.id)));
    const eligibility=r.taskReview?.eligibility;
    const reason=su.length?(mapped?null:'capability_unmapped'):units.some(u=>u.benchmark===id)?'scope_not_reviewed':eligibility?.reason||'protocol_missing';
    const state=su.length?(mapped?'mapped':'unmapped'):eligibility?.decision==='out_of_scope'?'excluded':'missing';
    let missing=r.taskReview?.protocolFollowup?.missing||[];
    if(reason==='scope_not_reviewed')missing=[{field:'scoped_protocol',detail:{zh:'该来源在其他游戏或任务上已有协议；当前游戏/大类仍缺直接对应的任务、动作与指标记录，不能继承其他成员的能力。',en:'Protocols exist for other games or tasks in this source. This scope still lacks directly linked task/action/metric evidence and cannot inherit sibling capabilities.'}}];
    else if(reason==='capability_unmapped'&&!missing.length)missing=[{field:'capability_basis',detail:{zh:'当前范围已有任务协议，但尚缺将具体任务机制对应到现有能力维度的充分证据；共同交互接口或总体得分不足以代替该依据。',en:'Tasks are documented in this scope, but evidence linking their mechanisms to the current capability axes is insufficient. A shared interface or aggregate score does not establish that mapping.'}}];
    return {id,state,reason,missing,unitIds:su.map(u=>u.id),note:r.taskReview?{zh:r.taskReview.noteZh,en:r.taskReview.noteEn}:null};
   });
   const count=state=>entries.filter(e=>e.state===state).length;
   const reasons=[...new Set(entries.map(e=>e.reason).filter(Boolean))].map(reason=>({reason,entries:entries.filter(e=>e.reason===reason)}));
   return {total:entries.length,withProtocol:count('mapped')+count('unmapped'),mapped:count('mapped'),unmapped:count('unmapped'),missing:count('missing'),excluded:count('excluded'),entries,reasons};
  }
  function summarize(scope={}){
   const selected=select(scope),axes=dimensions.map(d=>{
    const primary=new Set(),secondary=new Set();
    for(const u of selected)for(const c of u.capabilities)if(c.id===d.id)(c.role==='primary'?primary:secondary).add(u.benchmark);
    for(const id of primary)secondary.delete(id);
    return {...d,primary:[...primary],secondary:[...secondary]};
   });
   return {units:selected,benchmarks:[...new Set(selected.map(u=>u.benchmark))],axes,covered:axes.filter(a=>a.primary.length).length,inventory:inventory(scope)};
  }
  return {select,summarize,inventory,units};
 }
 if(typeof module!=='undefined')module.exports={create};else root.AtlasTaskCoverageModel={create};
})(typeof window==='undefined'?{}:window);
