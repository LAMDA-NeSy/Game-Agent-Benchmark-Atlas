const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const ctx={window:{}};vm.createContext(ctx);vm.runInContext(fs.readFileSync('dist/data.js','utf8'),ctx);
const data=ctx.window.ATLAS_DATA,copy=JSON.parse(fs.readFileSync('dist/game-introductions.js','utf8').replace(/^window\.ATLAS_GAME_INTRODUCTIONS = /,'').replace(/;\s*$/,'')),review=JSON.parse(fs.readFileSync('dist/game-introduction-review.json'));
const games=new Map(data.gameIndex.map(g=>[g.id,g])),entries=new Map(copy.entries.flatMap(e=>e.ids.map(id=>[id,e])));
assert.equal(review.records.length,games.size);assert.equal(new Set(review.records.map(r=>r.id)).size,games.size);
assert.equal(entries.size,copy.stats.described);assert.equal(copy.nameRules,undefined);
for(const [id,e] of entries){assert(games.has(id));assert(e.zh.length>10&&e.en.length>10);assert.match(e.source,/^https:\/\//);assert(e.checkedAt&&e.basis);assert(e.zh.length<210,id);assert(e.en.length<450,id);}
for(const r of review.records){assert.equal(r.status==='described',entries.has(r.id));if(r.status!=='described')assert(r.reason.zh&&r.reason.en);}
assert.match(entries.get('ace-attorney').zh,/调查.*证词.*矛盾/);assert(!entries.get('ace-attorney').zh.startsWith('一款'));
assert.match(entries.get('tatham-bridges').zh,/桥数.*连通/);assert.match(entries.get('atari-alien').zh,/异形卵/);
assert.match(entries.get('gameasg-mini-tanks').zh,/射角(?:度)?和力度/);assert.match(entries.get('machiavelli-battlemage').source,/1663950/);
assert.match(entries.get('flashadventure-saucy-devil-gordon').zh,/Gordon.*宝藏/);assert.match(entries.get('flashadventure-saucy-devil-gordon').detailUrl,/kongregate/);
assert.match(games.get('slay-the-spire').nameSource,/646570/);assert.match(games.get('slay-the-spire-2').nameSource,/2868840/);
assert.equal(games.get('construction-simulator').nameZh,'建筑模拟器');assert.equal(games.get('farlight84').nameZh,'远光84');
const app=fs.readFileSync('dist/app.js','utf8'),block=app.slice(app.indexOf('  const introductionEntries='),app.indexOf('  function gameResearchContextHTML'));
assert(!/nameRules|introductionRules|overviewOnly|AtlasTaskCoverage\.model|new RegExp/.test(block));assert.match(block,/详细介绍/);assert.match(block,/noopener noreferrer/);
assert.equal(data.records.length+data.gameCatalogRecords.length,385);
console.log(`Gameplay descriptions: ${entries.size} exact IDs; ${games.size} review outcomes; bounded bilingual copy, identity checks and no generated category fallback.`);

const followup=JSON.parse(fs.readFileSync('data/curation/game-introduction-followup.json'));
assert.equal(followup.records.length,26);assert.equal(followup.records.filter(r=>r.outcome==='described').length,24);
assert.deepEqual(followup.records.filter(r=>r.outcome!=='described').map(r=>r.id).sort(),['sky-blocks','solitaire-unspecified']);
for(const r of followup.records.filter(r=>r.outcome==='described')){assert(entries.has(r.id));assert.match(r.detailUrl,/^https:\/\//);}
for(const e of entries.values())if(e.detailUrl)assert(!/arxiv\.org|proceedings\.|aclanthology\.|ojs\.aaai\.org|openreview\.net|\.pdf(?:$|[?#])/i.test(e.detailUrl));
assert.match(entries.get('pokemon-legends-za').zh,/同时移动/);assert(!entries.get('pokemon-legends-za').zh.includes('回合制'));
assert.match(entries.get('pentari').zh,/休假/);assert(!entries.get('pentari').zh.includes('三颗宝珠'));
assert.match(review.records.find(r=>r.id==='dragon-if').associationCaveat.en,/ROM hash/);
assert.equal(followup.officialNamesAdded.length,5);
for(const n of followup.officialNamesAdded)assert.equal(games.get(n.id).nameZh,n.nameZh);
console.log('v34: all 26 outcomes, 24 specific introductions, 5 sourced official names, non-paper detail links and explicit version caveats verified.');
