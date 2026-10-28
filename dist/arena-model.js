'use strict';
(function(root){
 function create(data){
  const byId=new Map(data.tasks.map(t=>[t.id,t]));
  const defaults=()=>data.tasks.filter(t=>t.core).map(t=>t.id);
  const select=ids=>[...new Set(Array.isArray(ids)?ids:[])].filter(id=>byId.has(id)).map(id=>byId.get(id));
  function coverage(ids){
   const selected=select(ids);
   const axes=data.dimensions.map(d=>({...d,primary:selected.filter(t=>t.primary===d.id).map(t=>t.id),secondary:selected.filter(t=>t.secondary.includes(d.id)).map(t=>t.id)}));
   return {selected,axes,covered:axes.filter(a=>a.primary.length).length,gaps:axes.filter(a=>!a.primary.length).map(a=>a.id),benchmarks:[...new Set(selected.map(t=>t.benchmark))],runnable:selected.filter(t=>t.runnable).length};
  }
  function genreCoverage(ids,atlas){
   const games=new Map(atlas.gameIndex.map(g=>[g.id,g]));
   const selected=select(ids);
   return atlas.facets.categories.filter(g=>!['Unresolved','Related research'].includes(g)).map(genre=>{
    const candidates=data.tasks.filter(t=>games.get(t.game)?.categories.includes(genre));
    const taskIds=new Set(candidates.map(t=>t.id));
    return {genre,auxiliary:(atlas.facets.auxiliaryCategories||[]).includes(genre),candidates,
     ...coverage(selected.filter(t=>taskIds.has(t.id)).map(t=>t.id))};
   });
  }
  function manifest(ids,config={}){
   const c=coverage(ids);if(!c.selected.length)throw new Error('Select at least one task');
   return {schema:'atlas-arena-plan-v1',catalogVersion:data.version,createdAt:new Date().toISOString(),status:'planning-only',ready:false,
    mode:config.mode==='single'?'single':'compare',proposedSeedsPerConfiguration:[3,10,30].includes(config.seeds)?config.seeds:10,
    coverage:{basis:'editorial task associations, not validated isolated ability measurements',primary:c.axes.filter(a=>a.primary.length).map(a=>a.id),gaps:c.gaps},
    tasks:c.selected.map(t=>({id:t.id,benchmark:t.benchmark,game:t.game,title:t.title,primary:t.primary,secondary:t.secondary,proposedInterfaceTrack:t.track,scope:t.scope,metrics:t.metric,controls:t.controls,sources:[...new Set([t.source,t.docs,...(t.evidence||[]).map(e=>e.url)])],status:t.status,runnable:t.runnable,environmentVersion:null,adapterVersion:null,taskConfig:null,seedList:null,perTaskBudget:null,pending:t.pending})),
    protocol:{comparison:'within the same task, interface, budget and training/adaptation regime',aggregation:'none; report task-level raw metrics and uncertainty separately',modelVersions:null,prompts:null,historyPolicy:null,trainingAdaptationBudget:null,partnerOpponentProtocol:null},
    results:[],missingPrerequisites:['Pinned task/environment/adapter configurations','Per-task budgets and explicit seed lists','Models, prompts, observation and action interfaces','Training/adaptation and partner/opponent controls','Validated runners, metrics and trace recording']};
  }
  return {defaults,select,coverage,genreCoverage,manifest};
 }
 if(typeof module!=='undefined'&&module.exports)module.exports={create};else root.ArenaSuiteModel={create};
})(typeof window!=='undefined'?window:globalThis);
