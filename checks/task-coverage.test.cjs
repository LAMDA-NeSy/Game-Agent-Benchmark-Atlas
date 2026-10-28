const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const c={window:{}};vm.runInNewContext(fs.readFileSync('dist/data.js','utf8'),c);
const d=JSON.parse(JSON.stringify(c.window.ATLAS_DATA)),audit=JSON.parse(fs.readFileSync('task-protocol-review.json'));
const source=require('../dist/arena-data.js'),m=require('../dist/task-coverage-model.js').create(d,source.dimensions),games=new Map(d.gameIndex.map(g=>[g.id,g]));
assert.equal(audit.records.length,302);assert.equal(new Set(audit.records.map(r=>r.id)).size,302);
const integration=JSON.parse(fs.readFileSync('task-coverage-integration.json'));assert.deepEqual(new Set(audit.records.map(r=>r.id)),new Set([...d.gameCatalogRecords.filter(r=>r.incrementRound!=='v38').map(r=>r.legacyId),...integration.summary.omittedIds]));
assert.equal(source.tasks.length,24);assert.equal(m.units.filter(u=>u.origin==='arena-documented-candidate').length,24);
for(const r of audit.records){assert(r.evidence.length&&r.noteZh&&r.noteEn&&r.checkedAt);if(['not_applicable','unresolved'].includes(r.status))assert.equal(r.units.length,0);}
for(const u of m.units){assert.equal(u.executionVerified,false);assert(u.evidence.length);for(const k of ['label','task','observation','action','metrics','controls','limits'])assert(u[k].zh&&u[k].en);for(const id of u.gameIds)assert(games.get(id).links.some(l=>l.benchmark===u.benchmark));}
// Collection aggregation is one-way: all 40 members roll up, no member inherits siblings.
const puzzle=m.summarize({gameId:'simon-tatham-puzzles'});
assert.equal(puzzle.units.length,43);assert.equal(puzzle.benchmarks.length,1);
assert(puzzle.axes.every(a=>a.primary.length<=1&&a.secondary.length<=1));
const generalized=m.units.filter(u=>u.benchmark==='GAB073'&&u.capabilities.some(c=>c.id==='generalization')).flatMap(u=>u.gameIds);
assert.deepEqual(new Set(generalized),new Set(['tatham-netslide','tatham-same-game','tatham-untangle']));
assert(!m.select({gameId:'tatham-solo'}).some(u=>u.capabilities.some(c=>c.id==='generalization')));
const p=require('../dist/model.js').create(d).projection(d.gameCatalogRecords.find(r=>r.id==='GAB073'),'simon-tatham-puzzles');assert(p.caps.includes('generalization'));
for(const category of d.facets.categories){const summary=m.summarize({category});for(const u of summary.units)assert(u.gameIds.some(id=>games.get(id).categories.includes(category)||games.get(id).subgameParents?.some(p=>p.benchmark===u.benchmark&&games.get(p.parentId).categories.includes(category))));}
assert(m.summarize().axes.every(a=>new Set(a.primary).size===a.primary.length&&a.primary.every(id=>!a.secondary.includes(id))));
assert(games.get('age-of-llm').links.some(l=>l.benchmark==='AX26-2606.24391'));assert(!games.get('diplomacy').links.some(l=>l.benchmark==='AX26-2606.24391'));
const names=JSON.parse(fs.readFileSync('game-name-localization.json'));
for(const n of names.names){const g=games.get(n.id);assert.equal(g.nameZh,n.nameZh);assert(g.aliases.includes(g.name)&&g.aliases.includes(g.nameZh));assert(n.source.startsWith('https://'));}
assert.equal(games.get('factorio').name,'Factorio');assert.equal(games.get('factorio').nameZh,'异星工厂');
assert.deepEqual(JSON.parse(fs.readFileSync('dist/task-protocol-review.json')),audit);
console.log('Task coverage: all 302 review outcomes, scoped protocols, one-way collection aggregation, deduplicated axes, unchanged Arena selection and localized identities pass.');
assert(m.select({gameId:'chess'}).some(u=>u.benchmark==='GAB082'));
assert(m.select({category:'RTS'}).some(u=>u.gameIds.includes('smax')));
assert(!m.select({gameId:'starcraft-ii'}).some(u=>u.benchmark==='GAB061'));
assert(m.select({category:'Platformer'}).some(u=>u.gameIds.includes('carl-mario')));
assert(games.get('mortal-kombat-ii').links.some(l=>l.benchmark==='GAP-A12'));assert(!games.has('collection-gap-a12'));
