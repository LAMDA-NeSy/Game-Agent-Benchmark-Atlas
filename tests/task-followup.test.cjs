const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const audit=JSON.parse(fs.readFileSync('data/curation/task-protocol-review.json')),followup=JSON.parse(fs.readFileSync('data/curation/task-review-followup.json'));
const ctx={window:{}};vm.runInNewContext(fs.readFileSync('dist/data.js','utf8'),ctx);
const d=JSON.parse(JSON.stringify(ctx.window.ATLAS_DATA)),rows=new Map(audit.records.map(r=>[r.id,r]));
const integration=JSON.parse(fs.readFileSync('data/curation/task-coverage-integration.json'));
const previous=new Map(integration.previousReviewStates.map(r=>[r.id,r]));
const latest=JSON.parse(fs.readFileSync('data/curation/task-coverage-followup.json')),prior=new Map(latest.previousRecordStates.map(r=>[r.id,r]));
const library=JSON.parse(fs.readFileSync('dist/benchmark-library.json'));
assert.equal(followup.records.length,119);assert.equal(new Set(followup.records.map(r=>r.id)).size,119);
assert.equal(followup.records.filter(r=>r.previousStatus==='unresolved').length,15);
assert.equal(followup.records.filter(r=>r.previousStatus==='partial').length,104);
assert.deepEqual(d.taskReviewFollowup,followup.summary);
assert.deepEqual(JSON.parse(fs.readFileSync('dist/task-review-followup.json')),followup);
for(const change of followup.records){
 const r=rows.get(change.id),before=previous.get(change.id);assert(r);assert(before);assert.equal(change.status,before.status);assert.equal(change.currentUnits,before.unitIds.length);
 const revision=integration.changes.find(x=>x.id===r.id);
 if(revision){assert.equal(revision.previousStatus,change.status);assert.equal(revision.status,prior.get(r.id).status);assert.deepEqual(revision.currentUnitIds,prior.get(r.id).unitIds);}else{assert.equal(change.status,prior.get(r.id).status);assert.equal(change.currentUnits,prior.get(r.id).unitIds.length);}
 assert.deepEqual(change.followup,r.followup);assert(r.followup.sources.length&&r.reviewedScope.zh&&r.reviewedScope.en);
 const entry=library.records.find(x=>x.id===r.id);assert(entry?.taskReview);assert.deepEqual(entry.taskReview.followup,r.followup);
 for(const id of change.addedTaskIds)assert(before.unitIds.includes(id));
 for(const id of change.removedTaskIds)assert(!before.unitIds.includes(id));
}
assert.equal(followup.summary.addedUnits,followup.records.reduce((s,r)=>s+r.addedTaskIds.length,0));
assert.equal(followup.summary.updatedUnits,followup.records.reduce((s,r)=>s+r.updatedTaskIds.length,0));
const arena=require('../dist/arena-data.js'),coverage=require('../dist/task-coverage-model.js').create(d,arena.dimensions);
assert.equal(prior.get('VLA-29').status,'partial');const echoRevision=integration.partialProtocolReview.find(r=>r.id==='VLA-29');assert.equal(prior.get('VLA-29').unitIds.length>0,echoRevision?.outcome==='integrated');
for(const id of ['AX26-2605.31529','S07']){assert.equal(rows.get(id).status,'not_applicable');assert(!coverage.units.some(u=>u.benchmark===id));}
assert.equal(rows.get('VLA-18').units.find(u=>u.id==='VLA-18-atari-return-steering').gameIds.length,35);
assert.equal(rows.get('GAB074').units[0].gameIds.length,8);
assert(!coverage.select({gameId:'atari-breakout'}).some(u=>u.benchmark==='GAB074'));
assert(coverage.select({gameId:'atari-pong'}).some(u=>u.benchmark==='GAB074'));
assert.deepEqual(require('../dist/model.js').create(d).gameRoute('Multi-genre','collection-top-03'),{gameCategory:'MOBA',game:'honor-of-kings'});
assert.equal(arena.tasks.length,24);assert(coverage.units.every(u=>u.executionVerified===false));
assert.equal(crypto.createHash('sha256').update(fs.readFileSync('data/catalog.json')).digest('hex'),library.sourceHash);
console.log('Task follow-up: all 119 outcomes, exact changes, bounded Atari subsets, identity redirects, library exports and protected corpus verified.');
