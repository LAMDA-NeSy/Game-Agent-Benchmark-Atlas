'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const ctx={window:{}};
for(const f of ['data.js','game-roles-data.js'])vm.runInNewContext(fs.readFileSync('dist/'+f,'utf8'),ctx);
const data=ctx.window.ATLAS_DATA,library=JSON.parse(fs.readFileSync('dist/benchmark-library.json'));
const before=JSON.stringify({data,library});
const roles=require('../dist/game-roles-model.js').create(data,ctx.window.ATLAS_GAME_ROLES);
const model=require('../dist/research-archive-model.js').create(data,library,roles);
const saved=JSON.parse(fs.readFileSync('dist/research-archives.json'));
assert.equal(model.entries.length,385);
assert.equal(new Set(model.entries.map(a=>a.id)).size,385);
assert.equal(saved.sourceHash,library.sourceHash);
assert.equal(JSON.stringify(saved.records),JSON.stringify(model.entries),'saved downloads and on-screen archives share one model');
assert.equal(JSON.stringify({data,library}),before,'archives must not mutate or promote source reviews');
assert.equal(model.get('GAB080').id,'balrog','existing citation links resolve to preserved profiles');
assert.equal(model.get('GAB083').tasks.length,4,'former citations expose reviewed game tasks');
assert.equal(model.get('GAB083').taskReview.status,'partial','uniform archives do not imply complete evidence');
assert.equal(model.get('balrog').profile.research.scope,data.records.find(r=>r.id==='balrog').research.scope);
assert.equal(model.get('balrog').profile.evidence.length,4);
assert.equal(model.entries.reduce((n,a)=>n+a.tasks.length,0),417);
assert(model.entries.every(a=>a.executionVerified===false),'archive conversion does not verify runtime execution');
for(const a of model.entries){
 const b=library.records.find(b=>b.id===a.sourceId);
 assert.equal(a.bibliography.title,b.title);assert.equal(a.bibliography.review,b.review);
 assert.equal(a.bibliography.repo,b.repo,'unknown repositories stay unknown');
 if(!b.repo)assert(a.missing.some(m=>m.field==='code'));
 for(const g of a.gameLinks)assert.deepEqual(g.roles,roles.classify(g.id,a.id).roles);
}
function privacy(x){if(!x||typeof x!=='object')return;for(const [k,v] of Object.entries(x)){assert(!['notes','original_card','rewritten_card','ideas','pdf_file','original_beginner_explanations'].includes(k.toLowerCase()),k);privacy(v);}}
privacy(saved);
let language='zh';
Object.assign(ctx.window,{
 AtlasLibraryData:library,
 AtlasGameRolesModel:require('../dist/game-roles-model.js'),
 AtlasResearchArchiveModel:require('../dist/research-archive-model.js'),
 AtlasTaskCoverageModel:require('../dist/task-coverage-model.js'),
 ArenaCatalog:require('../dist/arena-data.js'),
 AtlasLanguage:{current:()=>language,picker:()=>''}
});
for(const file of ['task-coverage.js','research-archives.js'])vm.runInNewContext(fs.readFileSync('dist/'+file,'utf8'),ctx);
for(language of ['zh','en'])for(const a of ctx.window.AtlasResearchArchives.entries)for(const tab of ['overview','evidence','protocol','sources']){
 const html=ctx.window.AtlasResearchArchives.render(a,{tab});
 assert(html.includes('data-research-archive="'+a.id+'"'));
 assert(!html.includes('[object Object]'),a.id+': '+tab);
 assert(!html.includes('href="undefined"'),a.id+': '+tab);
}
console.log('Research archives: 385 saved identities, original deep profiles, 417 scoped tasks, source status, aliases, uses and public-only fields preserved.');

assert.equal(model.get('SUP-generalist-game-players-survey'),undefined,'withdrawn survey must not remain in public archives');

for(language of ['zh','en'])for(const a of ctx.window.AtlasResearchArchives.entries){
 const overview=ctx.window.AtlasResearchArchives.render(a,{tab:'overview'});
 const evidence=ctx.window.AtlasResearchArchives.render(a,{tab:'evidence'});
 const protocol=ctx.window.AtlasResearchArchives.render(a,{tab:'protocol'});
 assert(!evidence.includes('data-task-unit='),'classification must not repeat full protocols');
 assert(!overview.includes('class="archive-missing"'),'missing details have one home');
 assert.equal(a.taskGroups.documented.length+a.taskGroups.arenaProposals.length,a.tasks.length);
 for(const u of a.tasks){assert.equal(protocol.split('data-task-unit="'+u.id+'"').length-1,1);}
 if(a.taskGroups.arenaProposals.length)assert(protocol.includes('archive-proposals'));
}
const crafter=model.get('balrog').tasks.find(u=>u.id==='existing-crafter-progress');
const split=ctx.window.AtlasTaskCoverage.metricParts(crafter);
assert(split.documented.en.includes('achievement'));
assert(!split.documented.en.includes('Proposed'));
assert(split.editorial.en.includes('Proposed Arena diagnostics'));
const card=ctx.window.AtlasTaskCoverage.unitDetail(crafter);
assert(card.includes('documented-metrics')&&card.includes('editorial-metrics'));
assert.equal(model.entries.reduce((n,a)=>n+a.taskGroups.arenaProposals.length,0),24);
console.log('Archives: proposal/source separation, explicit metric boundaries, single protocol rendering, and evidence-only classification verified.');

const separated=model.entries.flatMap(a=>a.tasks).filter(u=>ctx.window.AtlasTaskCoverage.metricParts(u));
assert.equal(separated.length,13);
for(const u of separated)for(const lang of ['zh','en']){
 const parts=ctx.window.AtlasTaskCoverage.metricParts(u);
 assert.equal((parts.documented[lang]+parts.editorial[lang]).replace(/\s/g,''),u.metrics[lang].replace(/\s/g,''),'metric separation preserves source wording');
}

const enriched=model.entries.filter(a=>a.overview);
assert.equal(enriched.length,4);
for(const a of enriched){
 assert(a.overview.sources.length&&a.overview.checkedAt);
 assert(a.overview.paragraphs.every(p=>p.zh&&p.en));
 for(const m of a.overview.media)assert(/^https:\/\//.test(m.url)&&/^https:\/\//.test(m.source)&&m.title.zh&&m.title.en);
}
for(language of ['zh','en']){
 const bench=model.get('AX26-2602.12517');
 const html=ctx.window.AtlasResearchArchives.render(bench,{tab:'overview'});
 assert(html.includes(language==='zh'?'MF-Garnets 随机实例':'random MF-Garnet instances'));
 assert.equal(bench.bibliography.repo,'https://github.com/lorenzomagnino/Bench-MFG');
 assert(!bench.missing.some(m=>m.field==='code'));
 const craft=ctx.window.AtlasResearchArchives.render(model.get('GAP-A4'),{tab:'overview'});
 assert(craft.includes('https://teamcraft-bench.github.io/videos/main_web.mp4'));
 assert(craft.includes('archive-media-links'));
 assert(!craft.includes('<iframe')&&!craft.includes('autoplay'));
}
console.log('Overviews: sourced bilingual descriptions, concrete task/metric previews and attributed official media links pass.');
