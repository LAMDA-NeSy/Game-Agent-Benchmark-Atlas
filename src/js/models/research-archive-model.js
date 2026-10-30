'use strict';
(function(root){
 function create(data,library,roles){
  const records=new Map([...data.records,...(data.gameCatalogRecords||[])].map(r=>[r.id,r]));
  const entries=library.records.map(b=>{
   const id=b.profileId||b.id,r=records.get(id);
   if(!r)throw new Error('Missing archive source: '+id);
   const tasks=(data.documentedTasks||[]).filter(u=>u.benchmark===id);
   const gameLinks=data.gameIndex.filter(g=>g.links.some(l=>l.benchmark===id)).map(g=>{
    const link=g.links.find(l=>l.benchmark===id),use=roles.classify(g.id,id);
    return {id:g.id,name:g.name,nameZh:g.nameZh||null,kind:g.kind,categories:g.categories,roles:use.roles,claims:use.claims,gaps:use.gaps,source:link.source,attribution:link.attribution||null,profile:link.profile||null};
   });
   const review=b.taskReview||r.taskReview||null;
   const overview=(library.archiveOverviews||[]).find(o=>[id,b.id].includes(o.id))||null;
   const sources=[{url:b.paper,title:b.title},...(b.repo?[{url:b.repo,title:b.kind==='survey'?'Author literature collection':'Official code'}]:[]),...(b.evidence||[]),...(r.sourceEvidence||[]),...(r.evidence||[]).map(e=>({url:e.source,title:e.locator})),...(review?.evidence||[]),...(review?.protocolFollowup?.sources||[]),...(b.gameAttribution?.evidence||[]),...tasks.flatMap(u=>u.evidence||[]),...gameLinks.flatMap(g=>g.claims.flatMap(c=>c.evidence||[]))].map(e=>typeof e==='string'?{url:e,title:e}:e).filter(e=>/^https?:\/\//.test(e.url||''));
   sources.push(...(b.agentReview?.evidence||[]),...(overview?.sources||[]),...(overview?.media||[]).map(m=>({url:m.url,title:m.title.en})));
   const missing=[...(b.agentReview?.missing||[]),...(review?.protocolFollowup?.missing||[]).map(x=>({field:x.field||x.code||'protocol',detail:x.detail}))];
   if(!b.repo)missing.push({field:'code',detail:{zh:'官方代码仓库地址尚未核定。',en:'The official code repository URL is not confirmed.'}});
   if(!tasks.length&&r.detailLevel!=='profile'&&review?.status!=='not_applicable'&&!review?.protocolFollowup?.missing?.length)missing.push({field:'task_protocol',detail:{zh:'尚无已核验任务单元；需补任务目标、观测与动作接口、原始指标及实验配置的直接依据。',en:'No verified task unit is available. Direct evidence is needed for goals, observation/action interfaces, original metrics and experimental configuration.'}});
   const profile={};
   for(const k of ['detailLevel','summary','zh','observation','action','protocol','limit','why','note','research','evidence','sourceChecked','sourceScope','sourceRationale','access'])if(r[k]!==undefined)profile[k]=r[k];
   const bibliography={};
   for(const k of ['id','name','title','authors','year','venue','paper','repo','kind','domain','genres','caps','agents','agentReview','games','review','classification','scope','metrics','limits','verificationDetail','gameAttribution'])if(b[k]!==undefined)bibliography[k]=b[k];
   return {id,sourceId:b.id,overview,bibliography,profile,tasks,taskGroups:{documented:tasks.filter(u=>u.origin!=='arena-documented-candidate').map(u=>u.id),arenaProposals:tasks.filter(u=>u.origin==='arena-documented-candidate').map(u=>u.id)},gameLinks,taskReview:review,missing,sources:[...new Map(sources.map(e=>[e.url,e])).values()],executionVerified:tasks.some(u=>u.executionVerified===true)};
  });
  const byId=new Map(entries.flatMap(e=>[[e.id,e],[e.sourceId,e]]));
  return {entries,get:id=>byId.get(id),canonical:id=>byId.get(id)?.id||null};
 }
 if(typeof module!=='undefined')module.exports={create};else root.AtlasResearchArchiveModel={create};
})(typeof window==='undefined'?{}:window);
