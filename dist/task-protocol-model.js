'use strict';
(function(root){
 const fields=[['task','任务目标','Task objective'],['observation','观测接口','Observation'],['action','动作接口','Actions'],['metrics','评价方式','Evaluation'],['controls','实验配置与预算','Configuration & budget'],['limits','适用范围','Scope']];
 function create(data){
  const records=new Map([...data.records,...data.gameCatalogRecords].map(r=>[r.id,r]));
  const protocols=(data.documentedTasks||[]).map(u=>{
   const source=records.get(u.benchmark),details=u.protocolDetails||{};
   return {...u,resourceName:source.name,protocolType:u.origin==='arena-documented-candidate'?'editorial-proposal':u.id==='p0-ludii-amazons'?'official-example':'documented',
    checkedAt:details.checkedAt||source.taskReview?.checkedAt||null,
    fields:fields.map(([key,zh,en])=>({key,label:{zh,en},value:u[key],sources:u.evidence})),
    reproduction:{version:details.version||null,budget:details.budget||null,termination:details.termination||null},
    executionVerified:u.executionVerified===true};
  });
  const byId=new Map(protocols.map(p=>[p.id,p]));
  return {protocols,get:id=>byId.get(id),forArchive:id=>protocols.filter(p=>p.benchmark===id)};
 }
 if(typeof module!=='undefined')module.exports={create,fields};else root.AtlasTaskProtocolModel={create,fields};
})(typeof window==='undefined'?{}:window);
