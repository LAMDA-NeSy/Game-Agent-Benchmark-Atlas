const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const ctx={window:{}};vm.runInNewContext(fs.readFileSync('dist/data.js','utf8'),ctx);
const d=JSON.parse(JSON.stringify(ctx.window.ATLAS_DATA));
const library=JSON.parse(fs.readFileSync('dist/benchmark-library.json','utf8'));
const model=require('../dist/model.js').create(d),all=[...d.records,...d.gameCatalogRecords];
const ids=new Set(all.map(r=>r.id)),linked=new Set(d.gameIndex.flatMap(g=>g.links.map(l=>l.benchmark)));
assert.equal(ids.size,385);assert.deepEqual(linked,ids);
assert.equal(d.gameCatalogRecords.filter(r=>r.incrementRound!=='v38').length,269);assert.equal(d.records.filter(r=>r.incrementRound!=='v38').length,55);
for(const row of library.records){const r=all.find(r=>r.legacyId===row.id);assert(r,row.id);assert.deepEqual(row.genres,r.genres,row.id+' full-index genre consistency');}
for(const g of d.gameIndex){assert(g.categories.every(c=>d.facets.categories.includes(c)));assert.equal(new Set(g.links.map(l=>l.benchmark)).size,g.links.length);for(const l of g.links){assert(model.byId.has(l.benchmark));if(l.verification==='catalog'){assert.deepEqual(l.caps,[...new Set((d.documentedTasks||[]).filter(u=>u.origin==='protocol-review'&&u.benchmark===l.benchmark&&u.gameIds.includes(g.id)).flatMap(u=>u.capabilities.map(c=>c.id)))].sort());assert.deepEqual(l.agents,[]);assert(!l.profile);}}}
for(const r of d.gameCatalogRecords)for(const q of d.questions)assert(!model.themeRecords(q.id).some(x=>x.id===r.id),'historical metadata must not create verified theme membership');
const has=(g,r)=>model.games.get(g)?.links.some(l=>l.benchmark===r);
assert(has('minecraft','AX26-2605.30931'));assert(has('minecraft','GAB043'));assert(has('honor-of-kings','GAB038'));
assert(has('mini-hok','GAB103'));assert(!has('honor-of-kings','GAB103'));
assert(has('avalon-board','GAP-A8'));assert(has('avalon-worlds','GAB027'));assert(!has('avalon-board','GAB027'));
assert(has('civilization-v','AX26-2604.07733'));assert(has('civilization-vi','REC-2.5'));
assert.equal(d.gameIndex.filter(g=>g.kind!=='collection'&&g.links.some(l=>l.benchmark==='orak')).length,12);
assert.equal(d.gameIndex.filter(g=>g.id.startsWith('procgen-')&&g.id!=='procgen-games').length,16);
assert.equal(d.gameIndex.filter(g=>g.id!=='rlcard-games'&&g.links.some(l=>l.benchmark==='rlcard')).length,9);
assert.equal(model.games.get('her-story').links.find(l=>l.benchmark==='orak').caps.length,0);
const pending=new Set(d.gameIndex.filter(g=>g.kind==='unresolved').flatMap(g=>g.links.map(l=>l.benchmark)));
assert.equal(pending.size,d.gameIndexStats.pending);
function privacy(x){if(!x||typeof x!=='object')return;for(const [k,v]of Object.entries(x)){assert(!['notes','original_card','rewritten_card','ideas','original_beginner_explanations','pdf_file'].includes(k));privacy(v);}}privacy(d);
console.log('Full game index: 385 reachable records, explicit provenance, 12 Orak / 16 Procgen / 9 RLCard games, preserved identities, full-library consistency and evidence-bounded ability coverage pass.');
