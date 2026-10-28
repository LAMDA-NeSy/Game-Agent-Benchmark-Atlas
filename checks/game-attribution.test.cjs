const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const baseline=JSON.parse(fs.readFileSync('game-attribution-review.json','utf8'));
const audit=JSON.parse(fs.readFileSync('dist/game-attribution-review.json','utf8'));
assert.deepEqual(audit.reviewedIds,baseline.reviewedIds);
for(const original of baseline.records){
 const current=audit.records.find(r=>r.id===original.id);assert(current);
 assert.equal(current.status,original.status);
 for(const g of original.games)assert(current.games.some(x=>x.id===g.id));
}
const ctx={window:{}};vm.runInNewContext(fs.readFileSync('dist/data.js','utf8'),ctx);
const d=JSON.parse(JSON.stringify(ctx.window.ATLAS_DATA)),library=JSON.parse(fs.readFileSync('dist/benchmark-library.json','utf8'));
const all=[...d.records,...d.gameCatalogRecords],ids=new Set(audit.reviewedIds);
const taskAudit=JSON.parse(fs.readFileSync('task-protocol-review.json')).records;
assert.equal(ids.size,104);assert.equal(audit.records.length,104);
assert.deepEqual(new Set(audit.records.map(r=>r.id)),ids);
let confirmed=0,nonGame=0,pending=0;
for(const a of audit.records){
 const record=all.find(r=>r.id===a.id),lib=library.records.find(r=>r.id===a.id);
 assert(record&&lib,a.id);assert.equal(lib.review,'catalog');assert.equal(record.detailLevel,'catalog');
 assert.deepEqual(record.gameAttribution,lib.gameAttribution);
 assert(a.checkedAt&&a.noteZh&&a.noteEn&&a.evidence.length,a.id);
 const games=d.gameIndex.filter(g=>g.links.some(l=>l.benchmark===a.id));
 const followup=taskAudit.find(r=>r.id===record.legacyId||r.id===a.id);
 const expectedGames=new Set(a.games.map(g=>g.id));
 for(const m of followup?.gameMembers||[])expectedGames.add(m.game.id);
 for(const c of followup?.gameCorrections||[]){expectedGames.delete(c.removeGameId);expectedGames.add(c.game.id);}
 assert(games.length,a.id);
 if(a.status==='confirmed'){
  confirmed++;assert(a.games.length,a.id);
  assert.deepEqual(new Set(games.map(g=>g.id)),expectedGames,a.id);
  assert(games.every(g=>!['unresolved','non-game'].includes(g.kind)),a.id);
  assert.deepEqual(new Set(record.games),new Set(games.map(g=>g.name)));
 }else if(a.status==='no_specific_game'){
  nonGame++;assert.equal(a.games.length,0);assert(games.every(g=>g.kind==='non-game'));
 }else{
  pending++;assert(['unresolved','source_mismatch'].includes(a.status));assert.equal(a.games.length,0);assert(games.every(g=>g.kind==='unresolved'));
 }
 for(const g of games){
  const l=g.links.find(l=>l.benchmark===a.id);
  assert.equal(l.attribution.status,a.status);
  assert.deepEqual(l.caps,[...new Set((d.documentedTasks||[]).filter(u=>u.origin==='protocol-review'&&u.benchmark===l.benchmark&&u.gameIds.includes(g.id)).flatMap(u=>u.capabilities.map(c=>c.id)))].sort());assert.deepEqual(l.agents,[]);assert.deepEqual(l.interactions,[]);assert(!l.profile);
  if(a.status==='confirmed')assert(['attribution','task-reviewed'].includes(l.verification));
 }
}
assert.equal(confirmed,d.gameIndexStats.attributionReview.confirmed||0);
assert.equal(nonGame,new Set(d.gameIndex.filter(g=>g.kind==='non-game').flatMap(g=>g.links.filter(l=>!all.find(r=>r.id===l.benchmark)?.incrementRound).map(l=>l.benchmark))).size);assert.equal(pending,new Set(d.gameIndex.filter(g=>g.kind==='unresolved').flatMap(g=>g.links.filter(l=>!all.find(r=>r.id===l.benchmark)?.incrementRound).map(l=>l.benchmark))).size);
assert.equal(d.gameIndexStats.mapped+d.gameIndexStats.nonGame+d.gameIndexStats.pending,385);
const model=require('../dist/model.js').create(d);
for(const a of audit.records)for(const q of d.questions)assert(!model.themeRecords(q.id).some(r=>r.id===a.id));
const arena=require('../dist/arena-data.js');assert.equal(arena.tasks.length,24);
console.log(`Attribution audit: all 104 reviewed; ${confirmed} attributed, ${nonGame} without a specific game, ${pending} pending. Capabilities require separately verified protocols.`);
