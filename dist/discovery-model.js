'use strict';
// One archive universe for research themes and the full directory. Discovery
// associations never change scoped capability coverage or reproduction status.
(function(root){
 function create(data,library){
  const originals=new Map([...data.records,...(data.gameCatalogRecords||[])].map(r=>[r.id,r]));
  const questions=new Map(data.questions.map(q=>[q.id,q]));
  const themeCaps=new Set(data.questions.map(q=>q.cap));
  const records=library.records.map(r=>{
   const canonicalId=r.profileId||r.id,original=originals.get(canonicalId);
   const tasks=(data.documentedTasks||[]).filter(u=>u.benchmark===canonicalId&&u.origin!=='arena-documented-candidate');
   const associations={};
   const add=(cap,evidence)=>{(associations[cap]||=[]).push(evidence);};
   for(const cap of r.caps||[])add(cap,{kind:r.classification==='title-screen'?'screened':'record',source:r.paper});
   for(const cap of original?.caps||[])if(!associations[cap])add(cap,{kind:'record',source:original.paper});
   for(const u of tasks)for(const c of u.capabilities)add(c.id,{kind:'task',taskId:u.id,role:c.role,basis:c.basis,sources:u.evidence});
   return {...r,canonicalId,caps:Object.keys(associations),discoveryAssociations:associations};
  });
  const scopeOf=r=>['benchmark','environment','platform','competition','protocol','dataset'].includes(r.kind)?'resources':r.kind==='method'?'related':r.kind==='survey'?'references':'pending';
  const themeRecords=(id,scope='all')=>records.filter(r=>(scope==='all'||scopeOf(r)===scope)&&r.caps.includes(questions.get(id)?.cap));
  const unmapped=records.filter(r=>!r.caps.some(c=>themeCaps.has(c)));
  return {records,scopeOf,themeRecords,unmapped,questions};
 }
 if(typeof module!=='undefined')module.exports={create};else root.AtlasDiscoveryModel={create};
})(typeof window==='undefined'?{}:window);
