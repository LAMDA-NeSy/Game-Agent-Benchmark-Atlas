'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const ctx={window:{}};
vm.runInNewContext(fs.readFileSync('dist/data.js','utf8'),ctx);
const data=JSON.parse(JSON.stringify(ctx.window.ATLAS_DATA));
const library=JSON.parse(fs.readFileSync('dist/benchmark-library.json'));
const before=JSON.stringify({data,library});
const discovery=require('../dist/discovery-model.js').create(data,library);
const model=require('../dist/model.js').create(data,{discovery});
Object.assign(ctx.window,{ATLAS_DATA:data,AtlasLibraryData:library,AtlasDiscoveryModel:require('../dist/discovery-model.js'),AtlasLanguage:{current:()=> 'zh'}});
vm.runInNewContext(fs.readFileSync('dist/library.js','utf8'),ctx);
const ids=rows=>Array.from(rows,r=>r.canonicalId||r.profileId||r.id).sort();
assert.equal(discovery.records.length,385);
for(const q of data.questions){
 assert.deepEqual(ids(model.themeRecords(q.id)),ids(ctx.window.AtlasLibrary.filtered({scope:'all',cap:q.cap})),'theme/full-directory membership '+q.id);
 for(const scope of ['resources','related','references','pending'])assert.deepEqual(ids(discovery.themeRecords(q.id,scope)),ids(ctx.window.AtlasLibrary.filtered({scope,cap:q.cap})));
}
const alem=discovery.records.find(r=>r.name==='Alem');
assert(alem&&discovery.themeRecords('sustained').some(r=>r.id===alem.id));
assert(ctx.window.AtlasLibrary.filtered({scope:'all',cap:'long-horizon',q:'Alem'}).some(r=>r.id===alem.id));
assert(discovery.unmapped.every(r=>!data.questions.some(q=>r.caps.includes(q.cap))));
assert.deepEqual(ids(ctx.window.AtlasLibrary.filtered({scope:'all',review:'theme-unmapped'})),ids(discovery.unmapped));
for(const r of discovery.records)for(const claims of Object.values(r.discoveryAssociations))for(const claim of claims){
 if(claim.kind==='task')assert(data.documentedTasks.some(u=>u.id===claim.taskId&&u.benchmark===r.canonicalId&&u.origin!=='arena-documented-candidate'));
}
assert.equal(JSON.stringify({data,library}),before,'discovery does not promote underlying source classifications');
// Editorial-only capability claims must not enter either discovery path.
const isolated={records:[{id:'x',caps:[]}],questions:[{id:'q',cap:'memory'}],documentedTasks:[{id:'proposal',benchmark:'x',origin:'arena-documented-candidate',capabilities:[{id:'memory'}]}]};
assert.equal(require('../dist/discovery-model.js').create(isolated,{records:[{id:'x',caps:[],kind:'benchmark'}]}).themeRecords('q').length,0);
const supplement=JSON.parse(fs.readFileSync('data/curation/task-protocol-p0.json'));
assert.equal(supplement.records.length,18);
const added=supplement.records.flatMap(r=>r.units);
assert.equal(added.length,45);assert.equal(new Set(added.map(u=>u.id)).size,45);
const protocols=require('../dist/task-protocol-model.js').create(data);
const saved=JSON.parse(fs.readFileSync('dist/task-protocols.json'));
assert.deepEqual(saved.protocols,protocols.protocols);
assert.equal(saved.count,464);
assert.equal(saved.protocols.filter(p=>p.protocolType==='editorial-proposal').length,24);
for(const row of supplement.records)for(const u of row.units){
 const p=protocols.get(u.id);assert(p&&p.benchmark===row.id);
 assert.equal(p.executionVerified,false);
 assert.equal(p.checkedAt,supplement.checkedAt);
 assert(p.fields.every(f=>f.value.zh&&f.value.en&&f.sources.length));
 assert(p.evidence.every(e=>/^https:\/\//.test(e.url)&&e.title&&e.excerpt));
 assert(p.gameIds.every(id=>data.gameIndex.find(g=>g.id===id).links.some(l=>l.benchmark===p.benchmark)));
 assert(p.reproduction.version.zh&&p.reproduction.version.en);
}
const mini=added.find(u=>u.id.includes('minigrid'));
assert(/0\.9/.test(mini.metrics.en),'step-discounted reward is not success rate');
const comrad=added.find(u=>u.id.includes('comrad'));
assert(/surviv/i.test(comrad.metrics.en)&&/shap/i.test(comrad.metrics.en),'survival objective is distinct from shaped training reward');
assert.equal(protocols.get('p0-ludii-amazons').protocolType,'official-example');
assert.equal(protocols.get('p0-ludii-amazons').capabilities.length,0);
assert(ctx.window.AtlasLibrary.filtered({scope:'all',q:'Ammo Carrier'}).some(r=>r.id==='SUP-comrad'),'specific tasks are searchable');
console.log('P0: all nine themes/full-library scopes agree; 18 resources / 45 sourced task protocols, original evidence and proposal boundaries verified.');
