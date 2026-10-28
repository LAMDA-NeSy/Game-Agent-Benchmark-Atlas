const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const audit=JSON.parse(fs.readFileSync('data/curation/collection-expansion-review.json','utf8'));
const old=JSON.parse(fs.readFileSync('data/curation/game-attribution-review.json','utf8'));
assert.deepEqual(JSON.parse(fs.readFileSync('dist/collection-expansion-review.json','utf8')),audit);
assert.deepEqual(new Set(audit.reviewedIds),new Set(old.records.filter(r=>r.mappingLevel==='collection').map(r=>r.id)));
assert.equal(audit.records.length,26);
const ctx={window:{}};vm.runInNewContext(fs.readFileSync('dist/data.js','utf8'),ctx);
const d=JSON.parse(JSON.stringify(ctx.window.ATLAS_DATA)),games=new Map(d.gameIndex.map(g=>[g.id,g]));
const protocols=JSON.parse(fs.readFileSync('data/curation/task-protocol-review.json'));
const original=new Map(old.records.map(r=>[r.id,r]));let links=0;
for(const r of audit.records){
 assert(r.evidence.length&&r.noteZh&&r.noteEn,r.id);
 const parents=new Set(original.get(r.id).games.map(g=>g.id));
 for(const id of parents){
  const p=games.get(id);assert(p.links.some(l=>l.benchmark===r.id));
  const review=p.collectionReviews.find(x=>x.benchmark===r.id);assert(review,r.id);
  assert.deepEqual(new Set(review.children),new Set([...r.children.filter(c=>c.parentId===id).map(c=>c.id),...(protocols.records.find(x=>x.id===r.id)?.gameMembers||[]).filter(m=>m.parentId===id).map(m=>m.game.id)]));
 }
 assert.equal(new Set(r.children.map(c=>c.id)).size,r.children.length);
 for(const c of r.children){
  links++;assert(parents.has(c.parentId),r.id+' '+c.id);assert(!parents.has(c.id));
  const g=games.get(c.id),l=g.links.find(l=>l.benchmark===r.id);
  assert(l,c.id);assert.equal(l.relation,'verified-subgame');assert.equal(l.parentId,c.parentId);
  assert.deepEqual(l.attribution.evidence,c.evidence);assert.equal(l.attribution.noteZh,c.scopeZh);
  assert.deepEqual(l.caps,[...new Set((d.documentedTasks||[]).filter(u=>u.origin==='protocol-review'&&u.benchmark===l.benchmark&&u.gameIds.includes(g.id)).flatMap(u=>u.capabilities.map(c=>c.id)))].sort());assert.deepEqual(l.agents,[]);assert.deepEqual(l.interactions,[]);assert(!l.profile);
  assert(g.subgameParents.some(p=>p.parentId===c.parentId&&p.benchmark===r.id));
 }
}
assert.equal(links,d.collectionExpansionStats.links);
assert.equal(d.collectionExpansionStats.reviewed,26);
assert.equal(d.collectionExpansionStats.expanded,audit.records.filter(r=>r.children.length).length);
const arena=require('../dist/arena-data.js');assert.equal(arena.tasks.length,24);
console.log(`Collection review: all26 investigated, ${links} sourced child links, retained parents, bounded per-child evidence and no capability inheritance.`);
