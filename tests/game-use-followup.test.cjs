const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const c={window:{}};for(const f of ['data.js','game-roles-data.js'])vm.runInNewContext(fs.readFileSync('dist/'+f,'utf8'),c);
const data=JSON.parse(JSON.stringify(c.window.ATLAS_DATA)),review=JSON.parse(JSON.stringify(c.window.ATLAS_GAME_ROLES)),audit=JSON.parse(fs.readFileSync('data/curation/game-use-followup.json','utf8'));
const model=require('../dist/game-roles-model.js').create(data,review);
assert.equal(audit.associationsReviewed,327);assert.equal(audit.sourcesReviewed,40);
assert.equal(new Set(audit.pairs.map(p=>p.gameId+':'+p.benchmark)).size,327);
assert.equal(new Set(audit.pairs.map(p=>p.benchmark)).size,40);
const increment=JSON.parse(fs.readFileSync('data/curation/corpus-increment.json'));
assert.equal(audit.corpusHash,increment.baseline.corpusHash,'frozen v37 review is bound to the original corpus snapshot');
assert.deepEqual(JSON.parse(fs.readFileSync('dist/game-use-review.json','utf8')),audit);
for(const p of audit.pairs){
 const x=model.classify(p.gameId,p.benchmark);
 assert.deepEqual(x.roles,p.roles);assert(!x.roles.includes('unverified'));
 assert.equal(x.executionVerified,false);assert(x.claims.length>0);
 assert.deepEqual([...new Set(x.gaps.flatMap(g=>g.missing.map(m=>m.field)))],p.missingFields);
}
for(const gap of review.gaps){
 assert(gap.missing.length>0);assert(gap.evidence.length>0);
 for(const missing of gap.missing){assert(missing.label.zh&&missing.label.en);assert(missing.detail.zh.length>20&&missing.detail.en.length>30);}
 for(const id of gap.gameIds)assert(data.gameIndex.find(g=>g.id===id)?.links.some(l=>l.benchmark===gap.benchmark),'gap belongs to a real game-source pair');
}
assert.deepEqual(model.classify('counter-strike-go','W02').roles,['data','related'],'CS:GO world-model video does not become player-agent combat evaluation');
assert.deepEqual(model.classify('minigrid','S01').roles,['offline','online'],'appendix success rates are distinguished from prediction examples');
assert(!data.documentedTasks.some(u=>u.benchmark==='S01'&&u.gameIds.includes('minigrid')),'documented use does not automatically add a capability unit');
assert(model.classify('sky-blocks','REC-3.5').gaps.length>0);
assert.equal(model.classify('hanabi','REC-3.5').gaps.length,0,'variant-rule gaps do not leak to other collection members');
for(const id of ['leduc-holdem','connect-four'])assert(!model.classify(id,'TOP-16').roles.includes('data'),'held-out games are not labelled training data');
for(const id of ['witness-medallion-mirage','witness-bastion-leagues']){
 const x=model.classify(id,'REC-2.2');assert(x.roles.includes('online'));assert(!x.roles.includes('data'));assert(x.gaps.some(g=>g.missing.some(m=>m.field==='split-membership')));
}
const totals=Object.fromEntries(model.roleIds.map(id=>[id,0]));let withGaps=0;
for(const g of data.gameIndex){const s=model.summary(g.id,{benchmarkIds:g.links.filter(l=>!increment.records.some(r=>r.id===l.benchmark)).map(l=>l.benchmark)});for(const id of model.roleIds)totals[id]+=s.counts[id];withGaps+=s.withGaps;}
assert.deepEqual(totals,audit.after);assert.equal(withGaps,14);assert.equal(audit.reviewedAssociationsWithGaps,13);assert.equal(totals.unverified,0);
console.log('Use follow-up: 327 scoped associations / 40 sources reviewed, 14 explicit protocol/scope gaps, preserved v37 corpus snapshot and uses, and no runtime promotion pass.');
