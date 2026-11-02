'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const c={window:{}};for(const file of ['data.js','game-roles-data.js','evaluation-design.js'])vm.runInNewContext(fs.readFileSync('dist/'+file,'utf8'),c);
const d=JSON.parse(JSON.stringify(c.window.ATLAS_DATA)),catalog=require('../dist/arena-data.js'),design=c.window.AtlasEvaluationDesign;
const before=JSON.stringify({d,catalog,design}),model=require('../dist/evaluation-model.js').create(d,catalog,design);
assert.equal(model.candidates.length,24);assert.equal(model.all.length,440);
assert.equal(new Set(model.candidates.map(x=>x.protocolId)).size,24);
for(const x of model.candidates){assert.equal(x.protocol,d.documentedTasks.find(p=>p.id===x.protocolId));assert.equal(x.metric,x.protocol.metrics);assert.equal(x.controls,x.protocol.controls);assert.equal(x.scope,x.protocol.task);assert.equal(x.runnable,false);assert.notEqual(x.protocol.origin,'arena-documented-candidate');assert(x.protocol.gameIds.includes(x.game));}
assert(model.get('comrad-ammo-carrier').metric.en.includes('survival steps'));
assert(model.get('bandit-learning').metric.en.includes('counts selections'));
assert.equal(model.get('vgc-unseen-team-crossplay').primary,'strategy','cross-play alone does not establish held-out-team generalization');
assert.equal(model.select(['crafter-progress','p0-balrog-crafter','protocol:p0-balrog-crafter','unknown']).length,1,'aliases cannot duplicate a protocol');
assert.equal(model.pair('crafter-progress','p0-balrog-crafter').type,'duplicate');
assert.equal(model.pair('coinrun-heldout','coinrun-original-500').type,'alternative');
assert.equal(model.pair('minigrid-memory','memorygym-sequence').type,'complementary');
assert.equal(model.pair('overcooked-team','overcooked-zsc').type,'complementary');
assert.equal(model.pair('sc2-match','smac-team').type,'complementary');
assert.equal(model.pair('crafter-progress','factorio-production').type,'complementary');
assert.equal(model.pair('bandit-learning','hanoi-order').type,'unreviewed','matching source is not a duplicate or controlled contrast');
assert.equal(model.analysis(['coinrun-heldout','coinrun-original-500']).mechanisms.length,1,'alternative implementations count the shared mechanism once');
assert.equal(model.delta(['coinrun-heldout'],'coinrun-original-500').newMechanism,false);
assert.equal(model.delta(['minigrid-memory'],'memorygym-sequence').newMechanism,true);
assert.equal(model.delta(['minigrid-memory'],'minigrid-memory').uniquePrimary,true);
assert.equal(model.delta(['minigrid-memory','memorygym-sequence'],'minigrid-memory').uniquePrimary,false);
for(const r of design.relations){assert(r.basis==='editorial-source-analysis');assert(r.tasks.length===2);for(const key of ['summary','shared','difference','recommendation'])assert(r[key].zh&&r[key].en);assert.deepEqual(Array.from(r.protocolIds),Array.from(r.tasks,id=>model.get(id).protocolId));assert(model.relations(r.tasks)[0].sources.length);}
assert.equal(model.templates.length,4);
for(const t of model.templates){assert(t.tasks.length>=3&&t.tasks.length<=5);assert.equal(model.select(t.tasks).length,t.tasks.length);assert(t.tasks.every(id=>t.roles[id]?.zh&&t.roles[id]?.en));}
assert.throws(()=>model.manifest([]));
const config={'minigrid-memory':{budget:'100 environment steps',version:'test-revision',seeds:'1,2,3'}};
const plan=model.manifest(['minigrid-memory','memorygym-sequence'],config,'memory');
assert.equal(plan.ready,false);assert.deepEqual(plan.results,[]);assert.deepEqual(plan.tasks[0].configuration,config['minigrid-memory']);assert.equal(plan.tasks[0].sourceProtocol,model.get('minigrid-memory').protocol);assert.equal(plan.tasks[1].configuration.version,undefined);
assert(plan.tasks.every(t=>t.executionVerified===false));assert.equal(plan.analysis.relations.length,1);
for(const lang of ['zh','en']){const md=model.markdown(plan,lang);assert(md.includes('100 environment steps'));assert(md.includes('test-revision'));assert(md.includes('https://'));assert(md.includes(model.relationTypes.complementary[lang]));}
assert.equal(JSON.stringify({d,catalog,design}),before,'design and configuration cannot mutate original task evidence');
const library=JSON.parse(fs.readFileSync('dist/benchmark-library.json'));
const roles=require('../dist/game-roles-model.js').create(d,c.window.ATLAS_GAME_ROLES),archives=require('../dist/research-archive-model.js').create(d,library,roles);
let lang='zh';const ui={window:{AtlasEvaluation:model,AtlasResearchArchives:archives,AtlasLanguage:{current:()=>lang,picker:()=>''}},document:{addEventListener(){}},location:{search:'?compareMode=tasks'},URLSearchParams};
vm.runInNewContext(fs.readFileSync('dist/benchmark-comparison.js','utf8'),ui);
for(lang of ['zh','en']){const html=ui.window.AtlasComparison.render(['minigrid','memory-gym']);assert(html.includes('data-comparison-task='));assert(html.includes('data-arena-add-protocol='));assert(!html.includes('[object Object]'));assert(!html.includes('existing-minigrid-memory'));assert(html.includes(model.relationTypes.complementary[lang]));}
ui.location.search='?compareMode=tasks';const limited=ui.window.AtlasComparison.render(['orak','balrog'],{gameId:'minecraft'});assert(!limited.includes('option value="p0-balrog-crafter"'),'game context cannot borrow an unrelated sibling task');
ui.location.search='?compareMode=tasks&compareExtras='+encodeURIComponent(JSON.stringify(['balrog']))+'&compareTasks='+encodeURIComponent(JSON.stringify({'balrog:0':'p0-balrog-crafter','balrog:1':'p0-balrog-nethack'}));
const two=ui.window.AtlasComparison.render(['balrog']);assert(two.includes('value="p0-balrog-crafter" selected'));assert(two.includes('value="p0-balrog-nethack" selected'));
console.log('P1: 24 canonical bindings, 440 documented tasks, five sourced relationships, four templates, native metrics, deduplication, configuration export and bilingual task comparison pass.');

ui.location.search=ui.location.search.replace('compareMode=tasks','compareMode=resources');
const resources=ui.window.AtlasComparison.render(['balrog']);assert.equal((resources.match(/<strong>BALROG<\/strong>/g)||[]).length,1,'resource mode deduplicates extra task columns');

// Presentation deduplication must retain protocol content and reviewed relationships.
const archiveBefore=JSON.stringify(archives.entries);
ui.location.search='?compareMode=tasks';
for(lang of ['zh','en']){
 const html=ui.window.AtlasComparison.render(['minedojo','GAB026']);
 assert(!html.includes(lang==='zh'?'按任务目标确定研究问题':'Define the question from the task objective'),'generic fallback is not presented as a research question');
 assert(!html.includes('class="comparison-conclusions"'),'unreviewed pairs do not present a conclusion');
 assert(html.includes(lang==='zh'?'适用范围 / 主要干扰因素':'Scope / Principal confounds'),'identical rows retain both field labels');
 for(const id of ['minedojo','GAB026']){
  const task=archives.get(id).tasks.find(p=>p.origin!=='arena-documented-candidate');
  for(const field of ['task','metrics','limits'])assert(html.includes(task[field][lang]),`${id}: preserve ${field}`);
 }
 const reviewed=ui.window.AtlasComparison.render(['minigrid','memory-gym']);
 assert(reviewed.includes('class="comparison-conclusions"'));
 assert(reviewed.includes(model.relationTypes.complementary[lang]));
}
assert.equal(JSON.stringify(archives.entries),archiveBefore,'display changes do not modify protocol data');
