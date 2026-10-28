const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const audit=JSON.parse(fs.readFileSync('data/curation/corpus-increment.json'));
const lib=JSON.parse(fs.readFileSync('dist/benchmark-library.json'));
const ctx={window:{}};for(const f of ['data.js','game-roles-data.js'])vm.runInNewContext(fs.readFileSync('dist/'+f,'utf8'),ctx);
const data=JSON.parse(JSON.stringify(ctx.window.ATLAS_DATA));
const review=JSON.parse(JSON.stringify(ctx.window.ATLAS_GAME_ROLES));
const rows=new Map([...data.records,...data.gameCatalogRecords].map(r=>[r.id,r]));
const uses=require('../dist/game-roles-model.js').create(data,review);
const coverage=require('../dist/task-coverage-model.js').create(data);
const themes=require('../dist/model.js').create(data);
assert.equal(audit.records.length,61);assert.equal(new Set(audit.records.map(r=>r.id)).size,61);
assert.equal(lib.sourceRecords,363);assert.equal(lib.records.length,385);assert.equal(rows.size,385);
assert.equal(lib.sourceHash,audit.sourceHash);
assert.equal(crypto.createHash('sha256').update(fs.readFileSync('data/catalog.json')).digest('hex'),audit.sourceHash);
for(const id of audit.baseline.ids)assert(lib.records.some(r=>r.id===id),'preserve source '+id);
for(const [gid,rid] of audit.baseline.gameLinks)assert(data.gameIndex.find(g=>g.id===gid)?.links.some(l=>l.benchmark===rid),'preserve game link '+gid+':'+rid);
for(const id of audit.baseline.taskIds)assert(data.documentedTasks.some(u=>u.id===id),'preserve task '+id);
for(const r of audit.records){
 const row=rows.get(r.id),library=lib.records.find(x=>x.id===r.id);
 assert(row&&library&&r.evidence.length&&row.taskReview);assert.equal(row.incrementRound,'v38');
 assert.deepEqual(library.taskReview,row.taskReview);
 for(const field of ['scope','metrics','limits'])assert(r[field].zh&&r[field].en);
 for(const e of r.evidence)assert(/^https:\/\//.test(e.url)&&e.title&&e.excerpt);
 for(const g of r.games){
  const actual=uses.classify(g.id,r.id);assert.deepEqual(actual.roles,[...g.roles].sort((a,b)=>uses.roleIds.indexOf(a)-uses.roleIds.indexOf(b)));
  assert.equal(actual.executionVerified,false);assert(!actual.roles.includes('unverified'));
 }
 for(const u of r.units){
  const actual=data.documentedTasks.find(x=>x.id===u.id);assert(actual&&actual.executionVerified===false);
  for(const gid of actual.gameIds)assert(r.games.some(g=>g.id===gid));
  for(const c of actual.capabilities)assert(c.basis.zh&&c.basis.en);
 }
 if(r.domain!=='gameplay')for(const q of data.questions)assert(!themes.themeRecords(q.id).some(x=>x.id===r.id),'adjacent work must not become player capability '+r.id);
}
assert(data.gameIndex.some(g=>g.id==='besiege'&&g.links.some(l=>l.benchmark==='BUILD303')&&g.links.some(l=>l.benchmark==='OMIT323')));
assert.equal(data.gameIndex.find(g=>g.id==='besiege').nameZh,'围攻');
assert(!uses.classify('minecraft','OMIT341').roles.includes('online'),'multi-view generated video is not a player task');
assert(!uses.classify('counter-strike-2','OMIT337').roles.includes('online'),'account identification is not FPS agent play');
assert(uses.classify('chess','OMIT349').roles.includes('online'));
assert(coverage.select({gameId:'minecraft',benchmarkIds:['OMIT333']}).some(u=>u.capabilities.some(c=>c.id==='memory')));
assert(!coverage.units.some(u=>u.benchmark==='OMIT356'),'character animation is not a game player benchmark');
for(const rid of ['OMIT306','OMIT307','OMIT309']){
 const members=audit.records.find(r=>r.id===rid).gameParents[0].children;
 assert.equal(members.length,26);
 assert(coverage.select({gameId:'atari-2600',benchmarkIds:[rid]}).length,'documented members roll up to their collection');
 assert(!coverage.select({gameId:'chess',benchmarkIds:[rid]}).length,'collection tasks never leak to unrelated games');
}
assert.equal(data.documentedTasks.length,417);
const total=coverage.inventory();assert.equal(total.total,385);assert.equal(total.total,total.withProtocol+total.excluded+total.missing);
assert.equal(require('../dist/arena-data.js').tasks.length,24);assert(coverage.units.every(u=>u.executionVerified===false));
function publicOnly(x){if(!x||typeof x!=='object')return;for(const [k,v]of Object.entries(x)){assert(!['notes','original_card','rewritten_card','ideas','pdf_file','original_beginner_explanations'].includes(k.toLowerCase()),'private field '+k);publicOnly(v);}}
publicOnly(data);publicOnly(lib);publicOnly(audit);
assert.deepEqual(JSON.parse(fs.readFileSync('dist/corpus-increment.json')),audit);
console.log('Collection increment: all 61 sources, 385 catalog identities, unchanged prior links/tasks, scoped uses, theme exclusions, coverage and private-field protection pass.');
