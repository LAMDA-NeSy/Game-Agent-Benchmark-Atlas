const assert=require('node:assert/strict');
const fs=require('node:fs');const vm=require('node:vm');
const ctx={window:{}};vm.runInNewContext(fs.readFileSync('dist/data.js','utf8'),ctx);
const d=JSON.parse(JSON.stringify(ctx.window.ATLAS_DATA));const m=require('../dist/model.js').create(d);
const state=(x={})=>({q:'',question:null,agents:[],caps:[],genres:[],interactions:[],kinds:[],...x});
const ids=(s,gameId=null)=>d.records.filter(r=>m.matches(r,state(s),{gameId})).map(r=>r.id).sort();
const priorIds=(s,gameId=null)=>ids(s,gameId).filter(id=>!m.byId.get(id).incrementRound);
assert.deepEqual(ids({question:'recall'}),ids({caps:['memory']}));
assert(ids({question:'recall'}).includes('balrog'));
assert.deepEqual(ids({question:'dependencies'}),ids({caps:['planning']}));
assert(ids({question:'dependencies'}).includes('orak'));
assert(ids({question:'dependencies'}).includes('collab-overcooked'));
for(const q of d.questions)assert.deepEqual(ids({question:q.id}),ids({caps:[q.cap]}));
assert.deepEqual(priorIds({agents:['LLM'],question:'dependencies'},'minecraft'),['orak']);
assert.deepEqual(priorIds({agents:['LLM'],caps:['exploration']},'minecraft'),['smartplay']);
assert.deepEqual(priorIds({interactions:['cooperative']},'starcraft-ii'),['SUP-smac','smacv2']);
assert.deepEqual(priorIds({agents:['LLM'],interactions:['cooperative']},'starcraft-ii'),[]);
assert.deepEqual(priorIds({agents:['LLM','RL']},'starcraft-ii'),['GAB067','SUP-sc2le','SUP-smac','orak','smacv2']);
assert.deepEqual(priorIds({genres:['Simulation']}),['collab-overcooked','fle','orak','zsc-eval']);
assert.deepEqual(priorIds({genres:['RTS']}),['GAB067','SUP-elf','SUP-sc2le','SUP-smac','orak','smacv2']);
assert.deepEqual(priorIds({genres:['Action']}),['GAP-A3','SUP-ale','collab-overcooked','procgen','zsc-eval']);
assert.deepEqual(priorIds({genres:['Simulation'],interactions:['cooperative']}),['collab-overcooked','zsc-eval']);
assert.deepEqual(m.gameRoute('Cooking','overcooked'),{gameCategory:'Simulation',game:'overcooked'});
assert.deepEqual(m.gameRoute('Strategy','starcraft-ii'),{gameCategory:'RTS',game:'starcraft-ii'});
assert.deepEqual(m.gameRoute('Strategy','factorio'),{gameCategory:'Simulation',game:'factorio'});
assert.deepEqual(m.gameRoute('Strategy',null),{gameCategory:'RTS',game:'starcraft-ii'});
assert.deepEqual(m.gameRoute('Cooperative','overcooked'),{gameCategory:'Simulation',game:'overcooked'});
assert.deepEqual(m.normalizeGenres(['Cooking','RTS']),['Simulation','RTS']);
for(const old of ['Cooking','Strategy','Cooperative','Arcade'])assert(!d.facets.categories.includes(old));
assert(!d.facets.categories.includes('Cooperative'));
assert(!d.facets.categories.includes('Multi-game'));
assert.deepEqual(ids({kinds:['Research platform']}).filter(id=>!id.startsWith('SUP-')),['rlcard']);
assert(ids({kinds:['Research platform']}).includes('SUP-vizdoom'));
let profileCount=0;
for(const g of d.gameIndex){
 assert(g.categories.every(c=>d.facets.categories.includes(c)));
 for(const l of g.links){
  assert(l.caps.every(c=>m.byId.get(l.benchmark).caps.includes(c)||(d.documentedTasks||[]).some(u=>u.benchmark===l.benchmark&&u.gameIds.includes(g.id)&&u.capabilities.some(x=>x.id===c))));
  if(l.profile){profileCount++;assert.equal(l.profile.executionVerified,false);for(const key of ['environment','scope','observation','action','metrics','integration','controls','unknown']){assert(l.profile[key].text.length>5);assert(l.profile[key].source.startsWith('https://'));}}
 }
}
assert.equal(profileCount,6);
assert.equal(m.projection(m.byId.get('orak'),'overcooked'),null);
assert.equal(m.priority(m.byId.get('balrog'),'recall'),false);
assert.equal(m.priority(m.byId.get('minigrid'),'recall'),true);
for(const r of d.records)assert(!('notes' in r));
console.log('Passed: 9 theme/facet equivalences, scoped game selection, OR/AND facets, 6 sourced profiles, orthogonal categories and priority membership.');
const {resolveView}=require('../dist/model.js');
for(const [query,view] of [
 ['', 'themes'],['?lang=en','themes'],['?view=explore','explore'],['?view=themes','themes'],['?view=arena','arena'],
 ['?question=recall','themes'],['?view=explore&question=recall','themes'],['?q=Minecraft','explore'],
 ['?detail=orak','explore'],['?comparison=1&compare=smacv2,orak','explore'],
 ['?view=games&category=Cooperative&game=overcooked','games'],['?view=capabilities','capabilities'],
 ['?view=games&question=dependencies','games'],['?view=unknown','themes']
])assert.equal(resolveView(new URLSearchParams(query)),view,query);
console.log('Passed: navigation defaults, explicit pages and legacy theme/search/detail/comparison/game links.');

const library=JSON.parse(fs.readFileSync('dist/benchmark-library.json','utf8'));
assert.equal(d.records.filter(r=>r.incrementRound!=='v38').length,55);assert.equal(d.records.filter(r=>r.detailLevel==='profile').length,16);
assert.equal(d.questions.length,9);
for(const r of library.records.filter(r=>r.review==='verified')){
 assert(m.byId.has(r.id),'every source-reviewed entry is in discovery: '+r.id);
 assert(d.gameIndex.some(g=>g.links.some(l=>l.benchmark===r.id)),'every reviewed source has a real game relation');
 for(const cap of r.caps.filter(c=>d.taxonomy[c]))assert(m.themeRecords(d.questions.find(q=>q.cap===cap).id).some(x=>x.id===r.id));
}
assert(!d.records.some(r=>library.records.find(l=>l.id===r.id)?.review==='catalog'),'title-screened labels are not promoted to reviewed associations');
assert.deepEqual(m.projection(m.byId.get('SUP-pokeagent-challenge'),'pokemon-emerald').caps,['long-horizon','memory','planning']);
assert.deepEqual(m.projection(m.byId.get('GAP-A3'),'doom-ii').caps,['control']);
assert(!m.projection(m.byId.get('GAP-A3'),'doom-ii').caps.includes('long-horizon'),'suite tags must not leak into FPS subgames');
assert.equal(m.byId.get('SUP-spirebench').repoURL,null);
assert.notEqual(m.games.get('slay-the-spire').id,m.games.get('slay-the-spire-2').id);
assert(!m.games.get('freeciv-web').links.some(l=>l.benchmark==='GAP-A3'),'Freeciv and Civilization are separate games');
assert(ids({agents:['VLA']},'minecraft').includes('GAP-A4'));
assert(d.facets.categories.includes('FPS')&&d.facets.categories.includes('TBS'));
assert(m.games.get('procgen-coinrun').categories.includes('Platformer'));
console.log('Unified discovery: all 39 reviewed additions linked, 9 themes, VLA filters, original-game identities, scoped suite capabilities and 16 preserved deep profiles pass.');

for(const r of d.records){const l=library.records.find(x=>x.id===r.legacyId);assert.deepEqual([...l.genres].sort(),[...r.genres].sort(),'full index and discovery share reviewed genres: '+r.id);}
