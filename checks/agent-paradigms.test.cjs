'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const audit=JSON.parse(fs.readFileSync('agent-paradigm-review.json'));
const library=JSON.parse(fs.readFileSync('dist/benchmark-library.json'));
const ctx={window:{}};vm.runInNewContext(fs.readFileSync('dist/data.js','utf8'),ctx);
const data=ctx.window.ATLAS_DATA,labels=['LLM','VLM','VLA','IL','RL'];
assert.equal(audit.records.length,385);assert.equal(new Set(audit.records.map(r=>r.id)).size,385);
// Preserve the review's original source identity; the portable library hashes its public-only snapshot.
assert.equal(audit.sourceHash,JSON.parse(fs.readFileSync('corpus-increment.json')).upstreamSourceHash);
assert.equal(fs.readFileSync('dist/agent-paradigm-review.json','utf8'),fs.readFileSync('agent-paradigm-review.json','utf8'));
const originals=new Map([...data.records,...data.gameCatalogRecords].map(r=>[r.legacyId||r.id,r]));
for(const r of audit.records){
 assert(['confirmed','pending','not_applicable'].includes(r.status),r.id);
 assert(r.noteZh&&r.noteEn&&r.evidence.length&&r.checkedAt,r.id);
 assert.deepEqual(r.agents,labels.filter(a=>r.agents.includes(a)));
 assert.deepEqual([...new Set(r.claims.map(c=>c.agent))].sort(),[...r.agents].sort());
 for(const c of r.claims){assert(c.role&&c.basis.zh&&c.basis.en&&c.sources.length,r.id);assert(c.sources.every(u=>/^https?:\/\//.test(u)));}
 for(const e of r.evidence)assert(e.url&&e.title&&e.locator&&e.summary,r.id);
 if(r.status==='confirmed')assert(r.agents.length);else assert.equal(r.agents.length,0);
 if(r.status==='pending')assert(r.missing.length&&r.missing.every(m=>m.detail.zh&&m.detail.en));
 const b=library.records.find(b=>b.id===r.id);assert.deepEqual(b.agentReview,r);assert.deepEqual(b.agents,r.agents);
 assert.equal(JSON.stringify(originals.get(r.id).agentReview),JSON.stringify(r));
}
const priority=audit.records.filter(r=>r.reviewBatch==='priority50');assert.equal(priority.length,50);assert.equal(priority.filter(r=>r.status==='confirmed').length,49);assert.equal(priority.filter(r=>r.status==='not_applicable').length,1);
for(const a of labels)assert.equal(library.agentParadigms.labels[a],library.records.filter(r=>r.agents.includes(a)).length);
assert.equal(data.documentedTasks.length,417);
assert.equal(data.gameIndex.length,1289);
assert.equal(data.gameIndex.reduce((n,g)=>n+g.links.length,0),1992);
assert(!data.documentedTasks.some(t=>t.executionVerified),'field review must not imply execution');
assert.equal(library.records.filter(r=>r.classification==='title-screen').length,269,'paradigm review does not promote capability keywords');
const pending=audit.records.find(r=>r.id==='OMIT320');assert.equal(pending.status,'pending');assert.equal(pending.agents.length,0);
for(const id of ['OMIT328','OMIT329'])assert(!audit.records.find(r=>r.id===id).agents.includes('VLM'),'judge-only VLM does not classify the generator');
Object.assign(ctx.window,{AtlasLibraryData:library,AtlasLanguage:{current:()=> 'zh'}});
vm.runInNewContext(fs.readFileSync('dist/library.js','utf8'),ctx);
assert.equal(ctx.window.AtlasLibrary.filtered({agent:'pending'}).length,1);
assert.equal(ctx.window.AtlasLibrary.filtered({agent:'not_applicable'}).length,50);
assert.equal(ctx.window.AtlasLibrary.filtered({agent:'VLA'}).length,18);
assert.equal(ctx.window.AtlasLibrary.filtered({agent:'IL'}).length,68);
console.log('Paradigm review: all 385 sources, direct claims, status filters, aliases and exports agree; tasks/game associations remain scoped.');
