const assert=require('node:assert/strict');
const fs=require('node:fs');const vm=require('node:vm');
const data=require('../dist/arena-data.js');const model=require('../dist/arena-model.js').create(data);
const context={window:{}};vm.runInNewContext(fs.readFileSync(require.resolve('../dist/data.js'),'utf8'),context);
const atlas=context.window.ATLAS_DATA;
vm.runInNewContext(fs.readFileSync(require.resolve('../dist/arena-selection.js'),'utf8'),context);
const ledger=context.window.ArenaSelection;
assert.equal(ledger.records.length,31);
assert.equal(ledger.corpusRecords,385);
for(const row of ledger.records.filter(x=>['recommended','extension'].includes(x.decision)))assert(atlas.records.some(r=>r.legacyId===row.id));
function publicOnly(value){if(!value||typeof value!=='object')return;for(const [key,v] of Object.entries(value)){assert(!['notes','original_card','ideas','rewritten_card','original_beginner_explanations'].includes(key.toLowerCase()),'Private reading content must not be exported');publicOnly(v);}}
publicOnly(atlas);publicOnly(data);publicOnly(ledger);
assert.equal(new Set(data.tasks.map(t=>t.id)).size,data.tasks.length);
assert.equal(data.dimensions.length,9);
for(const t of data.tasks){
 assert(atlas.records.some(r=>r.id===t.benchmark),t.id+' benchmark exists');
 const game=atlas.gameIndex.find(g=>g.id===t.game);assert(game,t.id+' game exists');
 assert(game.links.some(l=>l.benchmark===t.benchmark),t.id+' specific game–benchmark relation exists');
 assert(data.dimensions.some(d=>d.id===t.primary));
 assert(!t.secondary.includes(t.primary));
 assert(t.secondary.every(id=>data.dimensions.some(d=>d.id===id)));
 for(const field of ['title','scope','why','interface','metric','controls','pending'])for(const lang of ['zh','en'])assert(t[field][lang].length>5,`${t.id} ${field} ${lang}`);
 assert(t.source.startsWith('https://'));assert(t.docs.startsWith('https://'));
 assert.equal(t.runnable,false);assert.equal(t.status,'candidate');
}
const full=model.coverage(model.defaults());
assert.equal(full.selected.length,20);assert.equal(full.benchmarks.length,18);assert.equal(full.covered,9);assert.equal(full.runnable,0);assert.deepEqual(full.gaps,[]);
const withoutMemory=model.defaults().filter(id=>id!=='memorygym-sequence');
assert.deepEqual(model.coverage(withoutMemory).gaps,['memory'],'secondary memory links must not erase a primary gap');
assert.equal(model.coverage([...model.defaults(),'minecraft-crafting','smac-team']).covered,9);
assert.equal(model.coverage(['bandit-learning','hanoi-order']).benchmarks.length,1,'deduplicate benchmark counts');
assert.equal(model.select(['minigrid-memory','invalid','minigrid-memory']).length,1);
assert.equal(model.coverage([]).gaps.length,9);
assert.throws(()=>model.manifest([]),/Select/);
const manifest=model.manifest(model.defaults(),{mode:'single',seeds:30});
assert.equal(manifest.ready,false);assert.equal(manifest.status,'planning-only');assert.deepEqual(manifest.results,[]);
assert.equal(manifest.mode,'single');assert.equal(manifest.proposedSeedsPerConfiguration,30);
for(const t of manifest.tasks){assert.equal(t.taskConfig,null);assert.equal(t.perTaskBudget,null);assert.equal(t.seedList,null);assert(t.sources.length);assert.equal(t.runnable,false);}
assert.equal(model.manifest(model.defaults(),{mode:'invalid',seeds:0}).proposedSeedsPerConfiguration,10);
assert.equal(model.manifest(withoutMemory).coverage.gaps[0],'memory');
console.log('Arena suite: 24 sourced bilingual task profiles, catalog links, primary-only coverage, selection counts and honest planning manifests pass.');

const groups=model.genreCoverage(model.defaults(),atlas);
const group=id=>groups.find(g=>g.genre===id);
assert.equal(groups.length,atlas.facets.categories.filter(c=>!['Unresolved','Related research'].includes(c)).length);
assert.equal(group('Unresolved'),undefined);assert.equal(group('Related research'),undefined);
assert.deepEqual(group('RTS').selected.map(t=>t.id),['sc2-match']);
assert.equal(group('Simulation').selected.length,3);
assert.equal(group('Action').selected.length,3);
assert.equal(group('Racing').candidates.length,0);
assert.equal(group('Racing').covered,0);
assert.equal(group('Racing').gaps.length,9);
assert.equal(group('Multi-genre').auxiliary,true);
assert.equal(group('Abstract task').auxiliary,true);
assert.equal(group('Simulation').axes.find(a=>a.id==='planning').primary.length,0,'secondary associations are not primary coverage');
assert.equal(model.genreCoverage([],atlas).every(g=>g.covered===0),true);
assert.equal(model.genreCoverage(data.tasks.map(t=>t.id),atlas).find(g=>g.genre==='RTS').selected.length,2);
assert.equal(model.coverage(model.defaults()).selected.length,20,'multi-genre membership must not duplicate global tasks');
console.log('Genre maps: catalog taxonomy, overlapping genres, empty groups, selection scope, deduplicated overall counts and primary-only coverage pass.');

// Category charts render without Arena initialization and preserve real task scope.
let lang='zh';
const viewContext={window:{ArenaCatalog:data,ATLAS_DATA:atlas,ArenaSuiteModel:require('../dist/arena-model.js'),AtlasLanguage:{current:()=>lang}},location:{search:''},URLSearchParams,localStorage:{getItem:()=>null}};
vm.runInNewContext(fs.readFileSync('dist/arena-suite.js','utf8'),viewContext);
const view=viewContext.window.AtlasArena;
for(const category of atlas.facets.categories.filter(c=>!['Unresolved','Related research'].includes(c))){
 const html=view.categoryMap(category);
 assert(html.includes('data-category-map="'+category+'"'));
 assert(html.includes('任务与能力覆盖'));
 assert(html.includes('<table'));
 const expected=model.genreCoverage(data.tasks.map(t=>t.id),atlas).find(g=>g.genre===category).selected;
 for(const task of data.tasks)assert.equal(html.includes('data-arena-task="'+task.id+'"'),expected.some(t=>t.id===task.id));
}
assert(view.categoryMap('Racing').includes('尚未选入 Arena 候选任务'));
lang='en';assert(view.categoryMap('RTS').includes('Tasks & capability coverage'));
view.openTask('smac-team');assert.equal(view.panel(),'protocol');view.openMap();assert.equal(view.panel(),'dimensions');
console.log('Game-index maps: all categories render, only category candidates appear, empty state, bilingual labels and Arena destinations pass.');

assert.equal(data.tasks.length,24);assert.equal(data.tasks.filter(t=>t.curationRound==='v17').length,9);
for(const genre of ['FPS','Fighting','Sports','TBS','RPG','Text adventure','Roguelike','Platformer'])assert(group(genre).covered>0,genre+' has a representative primary task');
assert.equal(group('FPS').axes.find(d=>d.id==='generalization').primary.length,0,'COMRAD scenario selection alone is not a held-out protocol');
assert.equal(data.tasks.find(t=>t.id==='vgc-unseen-team-crossplay').secondary.includes('coordination'),false,'VGC doubles do not imply independent-agent cooperation');
assert.equal(data.tasks.find(t=>t.id==='coinrun-original-500').core,false);
assert.equal(data.tasks.find(t=>t.id==='coinrun-heldout').game,'procgen-coinrun');
assert.equal(model.coverage(data.tasks.map(t=>t.id)).selected.length,24);
assert.equal(model.coverage(data.tasks.map(t=>t.id)).benchmarks.length,21);
for(const t of data.tasks.filter(t=>t.curationRound==='v17'))assert(t.evidence.length>0);
// Existing users with the old default set receive new recommendations; custom sets remain intact.
for(const [stored,expected] of [[data.previousDefaults,true],[['sc2-match'],false]]){
 const c={...viewContext,window:{...viewContext.window},localStorage:{getItem:k=>k==='atlas-arena-suite-v2'?JSON.stringify({ids:stored}):null}};
 vm.runInNewContext(fs.readFileSync('dist/arena-suite.js','utf8'),c);
 assert.equal(c.window.AtlasArena.categoryMap('FPS').includes('ViZDoom · Selected'),expected);
}
console.log('Expansion: 9 source-traceable tasks, 20 recommended, 24 total, new-genre coverage and preference migration pass.');
