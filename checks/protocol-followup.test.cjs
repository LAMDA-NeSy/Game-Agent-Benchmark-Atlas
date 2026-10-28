const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const ctx={window:{}};vm.runInNewContext(fs.readFileSync('dist/data.js','utf8'),ctx);const d=JSON.parse(JSON.stringify(ctx.window.ATLAS_DATA));
const m=require('../dist/task-coverage-model.js').create(d),log=JSON.parse(fs.readFileSync('task-coverage-followup.json')),audit=JSON.parse(fs.readFileSync('task-protocol-review.json'));
const records=new Map([...d.records,...d.gameCatalogRecords].map(r=>[r.id,r])),rows=new Map(audit.records.map(r=>[r.id,r])),old=new Map(log.previousRecordStates.map(r=>[r.id,r]));
assert.equal(log.records.length,54);assert.equal(new Set(log.records.map(r=>r.id)).size,54);
assert.equal(log.records.filter(r=>r.previousState==='missing').length,51);assert.equal(log.records.filter(r=>r.previousState==='unmapped').length,3);
assert.deepEqual(new Set(log.summary.reviewedIds),new Set(log.records.map(r=>r.id)));
const overall=m.inventory({benchmarkIds:[...records.values()].filter(r=>r.incrementRound!=='v38').map(r=>r.id)}),entries=new Map(overall.entries.map(e=>[e.id,e]));
for(const r of log.records){
 const row=rows.get(r.id),rec=records.get(r.id),e=entries.get(r.id),f=row.protocolFollowup;
 assert(row&&rec&&f);assert.equal(f.outcome,r.outcome);assert.equal(f.previousState,r.previousState);
 assert(r.sources.length&&r.noteZh&&r.noteEn);for(const s of r.sources)assert(/^https?:\/\//.test(s.url)&&s.title&&s.excerpt);
 assert.deepEqual(r.previousUnitIds,old.get(r.id).unitIds);assert.deepEqual(r.currentUnitIds,row.units.map(u=>u.id));
 assert.deepEqual(r.addedUnitIds,[...row.units.map(u=>u.id).filter(id=>!r.previousUnitIds.includes(id))].sort());
 for(const id of r.previousUnitIds)assert(row.units.some(u=>u.id===id),'no deleted task '+id);
 assert.equal(r.previousStatus,old.get(r.id).status);assert.equal(r.status,row.status);
 assert.deepEqual(rec.taskReview.protocolFollowup,f);
 for(const gap of r.missing)assert(gap.field&&gap.detail.zh&&gap.detail.en);
 if(r.outcome==='integrated'){assert.equal(r.previousState,'missing');assert(row.units.length);assert(['mapped','unmapped'].includes(e.state));}
 else if(r.outcome==='mapped'){assert.equal(r.previousState,'unmapped');assert.equal(e.state,'mapped');}
 else if(r.outcome==='still_missing'){assert(r.missing.length);assert(['missing','unmapped'].includes(e.state));assert.deepEqual(e.missing,r.missing);}
 else {assert.equal(r.outcome,'out_of_scope');assert.equal(e.state,'excluded');assert.equal(row.status,'not_applicable');}
}
const count=o=>log.records.filter(r=>r.outcome===o).length;
assert.equal(log.summary.integrated,count('integrated'));assert.equal(log.summary.mapped,count('mapped'));assert.equal(log.summary.stillMissing,count('still_missing'));assert.equal(log.summary.outOfScope,count('out_of_scope'));
assert.equal(overall.withProtocol,200+count('integrated'));assert.equal(overall.missing,51-count('integrated')-count('out_of_scope'));
assert.equal(overall.excluded,73+count('out_of_scope'));assert.equal(overall.total,324);
assert(overall.entries.filter(e=>['missing','unmapped'].includes(e.state)).every(e=>e.missing.length));
assert.equal(log.summary.addedUnits,log.records.reduce((n,r)=>n+r.addedUnitIds.length,0));
assert.equal(d.documentedTasks.filter(u=>u.origin!=='collection-increment').length,326+log.summary.addedUnits);
assert.deepEqual(d.taskCoverageFollowup,log.summary);assert.deepEqual(JSON.parse(fs.readFileSync('dist/task-coverage-followup.json')),log);
// An added or changed unit must resolve to an actual source-game link and never leak to unrelated siblings.
for(const r of log.records)for(const id of [...r.addedUnitIds,...r.updatedUnitIds]){
 const u=d.documentedTasks.find(u=>u.id===id);assert(u);assert.equal(u.benchmark,r.id);assert.equal(u.executionVerified,false);
 for(const gid of u.gameIds){assert(d.gameIndex.find(g=>g.id===gid).links.some(l=>l.benchmark===r.id));assert(m.select({gameId:gid}).some(x=>x.id===id));}
 for(const c of u.capabilities){assert(d.taskDimensions.some(d=>d.id===c.id));assert(c.basis.zh&&c.basis.en);}
 if(u.derivedFromUnitId)assert(d.documentedTasks.some(p=>p.id===u.derivedFromUnitId&&p.benchmark===u.benchmark));
}
// Held-out transfer belongs to the test variant, not the game used for training.
const mini=m.select({gameId:'marshal-mini-hanabi',benchmarkIds:['TOP-16']}),simple=m.select({gameId:'marshal-simple-hanabi',benchmarkIds:['TOP-16']});
assert(mini.some(u=>u.capabilities.some(c=>c.id==='coordination')));
assert(!mini.some(u=>u.capabilities.some(c=>c.id==='generalization')));
assert(simple.some(u=>u.capabilities.some(c=>c.id==='generalization')));
assert.equal(m.select({gameId:'super-mario-bros',benchmarkIds:['AX26-2605.00347']}).length,0);
assert(m.select({gameId:'super-mario-land',benchmarkIds:['AX26-2605.00347']}).length);
const library=JSON.parse(fs.readFileSync('dist/benchmark-library.json'));
for(const r of log.records){const entry=library.records.find(x=>(x.profileId||x.id)===r.id);assert.deepEqual(entry.taskReview.protocolFollowup,rows.get(r.id).protocolFollowup);}
assert.equal(crypto.createHash('sha256').update(fs.readFileSync('data/catalog.json')).digest('hex'),library.sourceHash);
// Ensure the two earlier public review histories remain immutable.
for(const file of ['task-coverage-integration.json','task-review-followup.json'])assert.deepEqual(JSON.parse(fs.readFileSync('dist/'+file)),JSON.parse(fs.readFileSync(file)));
console.log('Protocol follow-up: all 54 outcomes, concrete missing fields, historical transitions, per-game task routing, capability evidence, exports and protected corpus verified.');
