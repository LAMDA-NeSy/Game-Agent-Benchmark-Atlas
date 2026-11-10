const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const expansion=require('../data/curation/official-leaderboard-expansion.json'),raw=require('../'+expansion.sourceSnapshot).sources;
const {rank}=require('../src/js/models/official-leaderboard-model.js'),boards=expansion.boards;
const get=id=>boards.find(b=>b.id===id);
test('twelve additional official tracks retain native table values and capture provenance',()=>{
 assert.equal(boards.length,12);assert.equal(new Set(boards.map(b=>b.id)).size,12);assert.equal(boards.reduce((n,b)=>n+b.entries.length,0),268);
 for(const b of boards){const source=raw[b.evidenceKey];assert.equal(b.source.pageSha256,source.capture.sha256);assert.equal(b.source.snapshotAt,source.capture.capturedAt);assert.equal(b.source.dataUrl,source.capture.url);
  for(const key of ['scope','scoring','variation','verification','dates'])assert.ok(b.protocol[key].zh&&b.protocol[key].en);
  assert.ok(b.researchUse.zh&&b.researchUse.en&&b.statusLabel.zh&&b.statusLabel.en);
  assert.ok(b.protocol.links.every(l=>/^https:\/\//.test(l.url)&&l.label.zh&&l.label.en));
  assert.equal(new Set(b.entries.map(e=>e.id)).size,b.entries.length);
  if(source.table)for(const e of b.entries)for(const c of b.columns){const cell=source.table.rows[e.sourceRow].cells[c.sourceColumn];assert.equal(e.scores[c.id].display,cell.text);assert.equal(e.scores[c.id].sourceValue,cell.text);assert.equal(e.scores[c.id].value,/^-?\d+(\.\d+)?%?$/.test(cell.text)?parseFloat(cell.text):null);}
 }
 for(const id of ['procgen-2020-generalization','nethack-2021-overall','meltingpot-2023-generalization','minerl-2021-research'])assert.match(get(id).source.url,/challenge_round_id=/);
 assert.match(get('nethack-2021-overall').source.url,/extra_id=969/);assert.match(get('procgen-2020-generalization').source.url,/extra_id=469/);
 const missing=get('lmgame-model').entries.flatMap(e=>Object.values(e.scores)).filter(s=>s.display==='n/a');assert.ok(missing.length);assert.ok(missing.every(s=>s.value===null));
});
test('ratings preserve source precision, frozen formats and inactive status',()=>{
 const t=get('textarena-balanced');t.entries.forEach((e,i)=>{const r=raw['textarena-results'].data[i];assert.equal(e.scores.overall.value,r.trueskill);assert.equal(e.scores['win-rate'].value,r.win_rate*100);assert.equal(r.is_active,false);});
 for(const fmt of ['gen1ou','gen9ou']){const b=get('pokeagent-2025-'+fmt);assert.equal(b.source.format,fmt);assert.match(b.source.pageUpdatedAt,/^2025-11-11/);
  b.entries.forEach((e,i)=>{const r=raw['poke-battle-data'].data.formats[fmt][i];assert.equal(e.scores.overall.value,r.whr?.whr_elo??null);assert.equal(!!e.reference,!!(r.username.is_starter_kit||r.username.original.startsWith('PAC-LLM-')));});
  assert.ok(b.entries.some(e=>e.scores.overall.value===null));assert.ok(rank(b,'elo').length>rank(b).length);
 }
});
test('references do not displace competitors and speedruns use progress then runtime',()=>{
 for(const b of boards){const before=JSON.stringify(b),all=rank(b);assert.ok(all.filter(e=>e.reference).every(e=>e.rank===null));assert.equal(all.find(e=>!e.reference).rank,1);assert.equal(JSON.stringify(b),before);}
 const b=get('pokeagent-2025-speedrun'),rows=rank(b).filter(e=>!e.reference);
 assert.deepEqual(rows.slice(0,5).map(e=>e.agent),['Heatz','Hamburg PokeRunners','anthonys','Evelord','Deepest']);
 assert.equal(rank(b,'overall','Deepest')[0].rank,5);
 assert.ok(b.columns.find(c=>c.id==='runtime').rankable===false);assert.equal(b.columns[0].tieBreak,'runtime');
 b.entries.forEach((e,i)=>{const r=raw['poke-speed-data'].data[i];assert.equal(e.scores.overall.value,Object.values(r.phase_splits).reduce((n,p)=>n+p.completed,0)/26*100);});
 assert.match(b.protocol.scoring.en,/first gym/);assert.match(b.protocol.scoring.en,/combined splits/);
 const p=get('procgen-2020-generalization');assert.equal(rank(p).filter(e=>!e.reference).length,10);assert.equal(rank(p).at(-1).agent,'Baseline Impala');
});
test('bilingual leaderboard rendering handles new tracks, context, missing values and references',()=>{
 const full=require('../dist/official-leaderboards.json');assert.equal(full.boards.length,38);
 for(const lang of ['zh','en'])for(const b of boards){
  const ctx={window:{AtlasOfficialLeaderboardsData:full,AtlasLeaderboardModel:{rank},AtlasLanguage:{current:()=>lang}},location:{search:'?arenaBoard='+b.id},URLSearchParams};
  vm.runInNewContext(fs.readFileSync('src/js/features/filter-tags.js','utf8'),ctx);vm.runInNewContext(fs.readFileSync('src/js/features/official-leaderboards.js','utf8'),ctx);
  const html=ctx.window.AtlasLeaderboards.render();assert.ok(html.includes(full.sources.find(s=>s.boardIds.includes(b.id)).title));assert.ok(!html.includes('undefined'));assert.ok(!html.includes('Official check'));assert.ok(!html.includes('官方核验'));
  assert.equal((html.match(/data-source=/g)||[]).length,19);
  if(b.id==='pokeagent-2025-speedrun'){assert.ok(html.includes(lang==='zh'?'累计用时':'Cumulative runtime'));assert.ok(!html.includes('<option value="runtime"'));}
  if(!b.benchmarkId)assert.ok(!html.includes('detail=null'));
 }
});
