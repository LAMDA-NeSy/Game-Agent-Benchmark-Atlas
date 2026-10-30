const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');
const d=JSON.parse(fs.readFileSync('dist/benchmark-library.json','utf8'));
const increment=JSON.parse(fs.readFileSync('data/curation/corpus-increment.json'));
assert.equal(d.sourceRecords,363);assert.equal(d.counts.total,385);assert.equal(d.counts.added,22);assert.equal(d.counts.review.verified,39+increment.records.filter(r=>r.verified!==false).length);
const kinds=['method','benchmark','review','dataset','environment','platform','competition','protocol','survey'];
function privacy(x){if(!x||typeof x!=='object')return;for(const[k,v]of Object.entries(x)){assert(!['notes','original_card','rewritten_card','ideas','original_beginner_explanations','pdf_file'].includes(k));privacy(v);}}
privacy(d);assert.equal(new Set(d.records.map(r=>r.id)).size,d.records.length);
for(const r of d.records){assert(kinds.includes(r.kind),r.id+': '+r.kind);assert(r.title&&r.name);assert(Array.isArray(r.genres));assert(Array.isArray(r.caps));for(const a of r.agents)assert(['LLM','VLM','VLA','RL','IL'].includes(a));if(r.added){assert(r.evidence.length);assert.equal(r.runtimeVerified,false);assert.equal(r.review,'verified');assert(r.scope.zh&&r.scope.en);assert(r.limits.zh&&r.limits.en);}}
assert.equal(d.records.find(r=>r.id==='SUP-spirebench').repo,null);assert(d.records.some(r=>r.id==='GAB040')&&d.records.some(r=>r.id==='SUP-smac'));
assert.equal(d.records.find(r=>r.id==='GAB075').genres[0],'TBS');assert.equal(d.records.find(r=>r.id==='GAB095').repo,'https://github.com/TTomilin/HASARD');
let language='en';const c={window:{AtlasLibraryData:d,AtlasLanguage:{current:()=>language}},URLSearchParams};
vm.runInNewContext(fs.readFileSync('dist/library.js','utf8'),c);const defaults=c.window.AtlasLibrary.filtered();assert(defaults.every(r=>!['method','survey','review'].includes(r.kind)));const results=c.window.AtlasLibrary.filtered({scope:'all'});assert.equal(results.length,385);assert.equal(results.filter(r=>!['method','survey','review'].includes(r.kind)).length,212+increment.records.filter(r=>!['method','survey','review'].includes(r.kind)).length);assert(results.some(r=>r.id==='SUP-spirebench'));assert(results.some(r=>r.kind==='method'));
console.log('Library: 385 identities, preserved discovery additions and prior source reviews plus scoped collection increment, provenance, unknown-code handling and private-field exclusion pass.');
const browse=(overrides={},ignore=null)=>c.window.AtlasLibrary.filtered({scope:'all',...overrides},ignore);
const ids=rows=>Array.from(rows,r=>r.id).sort();
assert.deepEqual(ids(browse({agent:'LLM,RL'})),ids(d.records.filter(r=>r.agents.includes('LLM')||r.agents.includes('RL'))),'sidebar choices within a facet use OR');
assert.deepEqual(ids(browse({agent:'LLM,RL',cap:'planning,memory'})),ids(d.records.filter(r=>(r.agents.includes('LLM')||r.agents.includes('RL'))&&(r.caps.includes('planning')||r.caps.includes('memory')))),'different sidebar facets combine with AND');
assert.deepEqual(ids(browse({agent:'LLM',genre:'RTS'},'agent')),ids(d.records.filter(r=>r.genres.includes('RTS'))),'facet counts ignore their own selections and retain other conditions');
assert.equal(browse({q:'BALROG'})[0].profileId,'balrog');
assert.equal(browse({agent:'LLM',cap:'planning',q:'no-such-research-record'}).length,0);
console.log('Sidebar filters: complete archive scope, OR within facets, AND across facets, conditional counts and search pass.');

for(const scope of ['resources','related','references','pending']){
 const actual=c.window.AtlasLibrary.filtered({scope});
 assert.deepEqual(ids(actual),ids(d.records.filter(r=>c.window.AtlasLibrary.scopeOf(r)===scope)));
}
assert.equal(c.window.AtlasLibrary.filtered({scope:'references'}).length,3);
assert(!c.window.AtlasLibrary.filtered({scope:'resources'}).some(r=>r.kind==='survey'));
console.log('Directory scopes: default resources, independent related/reference/pending views, complete all-archive access.');

assert.equal(browse({review:'overview-pilot'}).length,10,'pilot descriptions are directly discoverable');

assert.equal(browse({review:'overview-structured'}).length,30);
assert.equal(browse({review:'overview-expansion'}).length,20);
