const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const data=require('../dist/official-leaderboards.json'),metadata={...require('../data/curation/official-leaderboard-metadata.json'),...require('../data/curation/maintained-leaderboards.json').boardMetadata};
const {rank}=require('../src/js/models/official-leaderboard-model.js');
function render(id,lang='zh',input=data){
 const ctx={window:{AtlasOfficialLeaderboardsData:input,AtlasLeaderboardModel:{rank},AtlasLanguage:{current:()=>lang}},location:{search:'?arenaBoard='+id},URLSearchParams};
 vm.runInNewContext(fs.readFileSync('src/js/features/official-leaderboards.js','utf8'),ctx);return ctx.window.AtlasLeaderboards.render();
}
function date(html){return html.match(/<div class="lb-result-date">([\s\S]*?)<\/div>/)[1];}
test('every track has a sourced classification independent of its score snapshot',()=>{
 assert.deepEqual(data.boardMetadata,metadata);assert.deepEqual(Object.keys(metadata).sort(),data.boards.map(b=>b.id).sort());
 const counts={};for(const m of Object.values(metadata)){counts[m.kind]=(counts[m.kind]||0)+1;assert.ok(['continuous','seasonal','historical','reference'].includes(m.kind));assert.match(m.evidenceUrl,/^https:\/\//);assert.ok(m.reason.zh&&m.reason.en);assert.equal(m.reviewedAt,'2026-11-02');}
 assert.deepEqual(counts,{continuous:14,reference:8,historical:8,seasonal:7});assert.equal(metadata['textarena-balanced'].kind,'historical');assert.match(metadata['textarena-balanced'].reason.en,/not to TextArena as a whole/);
});
test('prominent dates retain their meaning and never fall back to Atlas collection dates',()=>{
 assert.match(date(render('balrog-llm')),/最近提交/);assert.match(date(render('balrog-llm')),/2026-09-20/);assert.doesNotMatch(date(render('balrog-llm')),/2026-11-01/);
 assert.match(date(render('orak-performance')),/来源页面更新/);assert.match(date(render('orak-performance')),/2025-06-09/);
 assert.match(date(render('pokeagent-2025-gen1ou')),/成绩数据更新/);assert.match(date(render('pokeagent-2025-gen1ou')),/2025-11-11/);
 assert.match(date(render('pokeagent-2025-speedrun')),/最近成绩更新/);assert.match(date(render('pokeagent-2025-speedrun')),/2025-11-16/);
 for(const id of ['lmgame-model','videogamebench-full','gamebot','textarena-balanced','pgg-trueskill']){assert.match(date(render(id)),/来源未公布/);assert.doesNotMatch(date(render(id)),/<time/);}
 const modified=JSON.parse(JSON.stringify(data));modified.boards.forEach(b=>{b.source.snapshotAt='2099-12-31T00:00:00Z';});for(const b of modified.boards)assert.equal(date(render(b.id,'en',modified)),date(render(b.id,'en')));
});
test('bilingual labels and dates preserve the compact index and all result details',()=>{
 for(const lang of ['zh','en'])for(const b of data.boards){const html=render(b.id,lang);assert.equal((html.match(/data-source=/g)||[]).length,19);assert.match(html,lang==='zh'?/分类依据/:/Classification source/);assert.match(html,lang==='zh'?/本站采集/:/Collected by Atlas/);assert.ok(!html.includes('undefined'));assert.equal((html.match(/data-score-detail=/g)||[]).length,Math.min(50,rank(b).length));}
});
