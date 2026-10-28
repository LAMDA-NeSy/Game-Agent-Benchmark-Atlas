const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const ctx={window:{}};vm.runInNewContext(fs.readFileSync('dist/data.js','utf8'),ctx);
const d=JSON.parse(JSON.stringify(ctx.window.ATLAS_DATA)),m=require('../dist/task-coverage-model.js').create(d);
const log=JSON.parse(fs.readFileSync('data/curation/task-coverage-integration.json')),audit=JSON.parse(fs.readFileSync('data/curation/task-protocol-review.json'));
const latest=JSON.parse(fs.readFileSync('data/curation/task-coverage-followup.json')),prior=new Map(latest.previousRecordStates.map(r=>[r.id,r]));
const rows=new Map(audit.records.map(r=>[r.id,r])),records=new Map([...d.records,...d.gameCatalogRecords].map(r=>[r.id,r])),games=new Map(d.gameIndex.map(g=>[g.id,g]));
assert.equal(log.summary.omittedIds.length,33);assert.equal(new Set(log.summary.omittedIds).size,33);
for(const id of log.summary.omittedIds){const r=rows.get(id);assert(r.units.length);assert(r.evidence.length);assert(m.select({benchmarkIds:[id]}).length);assert.equal(records.get(id).taskReview.eligibility.decision,'eligible');}
assert.equal(d.taskDimensions.length,11);assert.equal(require('../dist/arena-data.js').dimensions.length,9);assert.equal(require('../dist/arena-data.js').tasks.length,24);
assert.equal(log.routingAudit.length,35);assert.equal(new Set(log.routingAudit.map(r=>r.unitId)).size,35);
for(const r of log.routingAudit){assert(r.noteZh&&r.noteEn&&r.evidence?.length);if(r.outcome==='routed'){const u=m.units.find(u=>u.id===r.unitId);assert(u,'routed unit retained '+r.unitId);assert(u.gameIds.some(id=>games.get(id).kind!=='collection'),'concrete game required '+r.unitId);}}
for(const q of log.partialProtocolReview){const r=rows.get(q.id);assert(q.noteZh&&q.noteEn&&q.evidence.length);assert.equal(prior.get(q.id).unitIds.length>0,q.outcome==='integrated');}
for(const r of rows.values()){assert(r.eligibility);if(r.units.length)assert.equal(r.eligibility.decision,'eligible');if(r.eligibility.decision==='out_of_scope'){assert(!r.units.length);assert(d.taskCoveragePolicy.reasons[r.eligibility.reason]);}}
for(const c of log.policyCorrections){const r=rows.get(c.id);assert.equal(prior.get(c.id).status,'partial');assert.equal(prior.get(c.id).eligibilityDecision,'needs_protocol');assert.equal(c.previous.status,'not_applicable');}
// Every displayed genre and game is reconciled; no silent drop, duplicate source, or invented runnable task.
for(const scope of [{},...d.facets.categories.map(category=>({category})),...d.gameIndex.map(g=>({gameId:g.id}))]){
 const c=m.summarize(scope),i=c.inventory;
 assert.equal(i.total,i.withProtocol+i.missing+i.excluded);assert.equal(i.withProtocol,i.mapped+i.unmapped);assert.equal(i.reasons.reduce((n,g)=>n+g.entries.length,0),i.total-i.mapped);
 assert.equal(new Set(i.entries.map(r=>r.id)).size,i.total);assert.equal(c.benchmarks.length,i.withProtocol);
 for(const a of c.axes){assert.equal(new Set(a.primary).size,a.primary.length);assert(a.primary.every(id=>!a.secondary.includes(id)));}
 for(const e of i.entries)if(e.state!=='mapped')assert(e.reason&&d.taskCoveragePolicy.reasons[e.reason]);
}
const overall=m.inventory({benchmarkIds:[...records.values()].filter(r=>r.incrementRound!=='v38').map(r=>r.id)});assert.equal(m.inventory().total,385);assert.equal(overall.total,324);assert.equal(overall.withProtocol,195+log.summary.incompleteProtocolsIntegrated+latest.summary.integrated);
for(const r of records.values())assert(r.taskReview||m.units.some(u=>u.benchmark===r.id),'No omitted pipeline record '+r.id);
assert(m.units.every(u=>u.executionVerified===false));
// Filtering must apply to the same game, never combine one sibling's category with another's identity.
assert.equal(m.select({gameId:'tatham-solo',category:'RTS'}).length,0);
assert(m.select({gameId:'tatham-solo'}).some(u=>u.capabilities.some(c=>c.id==='rule-reasoning')));
assert(!m.select({gameId:'tatham-solo'}).some(u=>u.capabilities.some(c=>c.id==='generalization')));
assert.deepEqual(JSON.parse(fs.readFileSync('dist/task-coverage-integration.json')),log);
assert.deepEqual(JSON.parse(fs.readFileSync('dist/task-coverage-policy.json')),d.taskCoveragePolicy);
const accounting=JSON.parse(fs.readFileSync('dist/coverage-accounting.json'));assert.deepEqual(accounting.overall,m.inventory());
for(const c of accounting.categories)assert.deepEqual(c,{category:c.category,...m.inventory({category:c.category})});
for(const g of accounting.games)assert.deepEqual(g,{gameId:g.gameId,...m.inventory({gameId:g.gameId})});
const lib=JSON.parse(fs.readFileSync('dist/benchmark-library.json'));
for(const r of lib.records){const id=r.profileId||r.id;if(records.get(id).taskReview)assert.deepEqual(r.taskReview,records.get(id).taskReview);}
console.log('Coverage v23: 33 omissions, 35 collection decisions, every genre/game denominator, explicit exclusions, filters, exports and unchanged Arena readiness verified.');
