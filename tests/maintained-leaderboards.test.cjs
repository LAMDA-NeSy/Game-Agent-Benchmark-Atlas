const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const data=require('../dist/official-leaderboards.json'),curated=require('../data/curation/maintained-leaderboards.json');
const {rank}=require('../src/js/models/official-leaderboard-model.js');
const render=(search='',lang='zh')=>{const ctx={window:{AtlasOfficialLeaderboardsData:data,AtlasLeaderboardModel:{rank},AtlasLanguage:{current:()=>lang}},location:{search},URLSearchParams};vm.runInNewContext(fs.readFileSync('src/js/features/official-leaderboards.js','utf8'),ctx);return ctx.window.AtlasLeaderboards.render();};
test('eight selected sources own tracks exactly once and retain all historical records',()=>{
 assert.equal(data.sources.filter(s=>s.featured).length,8);assert.equal(data.sources.length,19);
 const ids=data.sources.flatMap(s=>s.boardIds);assert.equal(new Set(ids).size,37);assert.deepEqual([...ids].sort(),data.boards.map(b=>b.id).sort());
 assert.deepEqual(data.boards.slice(16),curated.boards);
 assert.equal(data.boards.slice(0,16).reduce((n,b)=>n+b.entries.length,0),344);
 assert.equal(data.boardMetadata['balrog-llm'].kind,'continuous');assert.equal(data.boardMetadata['balrog-vlm'].kind,'reference');
 assert.equal(data.boardMetadata['sc2-ai-arena'].kind,'seasonal');assert.equal(data.boardMetadata['arc-agi3-2026'].kind,'seasonal');
});
test('TALES keeps every native framework score and its ScienceWorld protocol identity',()=>{
 const b=curated.boards.find(b=>b.id==='tales'),raw=require('../'+b.source.evidenceFile);assert.equal(b.entries.length,40);
 b.entries.forEach((e,i)=>{for(const [k,j] of [['overall',6],['textworld',1],['textworld-express',2],['alfworld',3],['scienceworld',4],['jericho',5]])assert.equal(e.scores[k].display,raw.tables[1][i+1][j]);});
 assert.deepEqual(b.gameLinks,[{gameId:'scienceworld',benchmarkId:'GAB032',metricId:'scienceworld',label:'ScienceWorld'}]);
 assert.equal(rank(b,'scienceworld')[0].scores.scienceworld.value,93.1);
 const h=render('?arenaBoard=tales&arenaMetric=scienceworld');assert.match(h,/value="scienceworld" selected/);assert.match(h,/detail=GAB032/);assert.match(h,/来源未公布/);assert.equal((h.match(/data-score-detail=/g)||[]).length,40);
});
test('ChessBench records configurations and preserves cost, time and rating units',()=>{
 const b=curated.boards.find(b=>b.id==='chessbench-best'),raw=require('../'+b.source.evidenceFile);assert.equal(b.entries.length,18);
 b.entries.forEach((e,i)=>{assert.equal(e.agent,raw.rows[i].model+' · '+raw.rows[i].thinking);for(const [k,rk] of [['overall','rating'],['cost','cost'],['time','time'],['illegal','illegal']])assert.equal(e.scores[k].display,raw.rows[i][rk]);});
 assert.match(b.protocol.scoring.en,/Glicko-2/);assert.equal(b.source.pageUpdatedAt,'2026-10-26');
});
test('source index, status filters and external-only boards never imply zero results',()=>{
 for(const lang of ['zh','en']){
  const def=render('',lang);assert.equal((def.match(/data-source=/g)||[]).length,19);assert.match(def,/Kaggle Game Arena/);
  const hist=render('?arenaBoard=procgen-2020-generalization',lang);assert.equal((hist.match(/data-source=/g)||[]).length,19);
  const filtered=render('?arenaBoard=sc2-ai-arena&arenaStatus=seasonal',lang);assert.equal((filtered.match(/data-source=/g)||[]).length,2);
  for(const b of curated.boards){const h=render('?arenaBoard='+b.id,lang);assert.ok(!h.includes('undefined'));assert.ok(h.includes(b.maintainer));
   if(b.displayMode==='external'){assert.match(h,/lb-external-results/);assert.doesNotMatch(h,/class="lb-table"|id="leaderboard-search"|没有匹配的 Agent/);}
  }
 }
 const kaggle=render('?arenaBoard=kaggle-game-arena');const date=kaggle.match(/<div class="lb-result-date">([\s\S]*?)<\/div>/)[1];assert.match(date,/2026-10-19/);assert.match(kaggle,/value="kaggle-go"/);
 const sc2=render('?arenaBoard=sc2-ai-arena');assert.doesNotMatch(sc2.match(/<div class="lb-result-date">([\s\S]*?)<\/div>/)[1],/<time/);
});

test('shared filters select a matching source and preserve empty combinations',()=>{
 const seasonal=render('?arenaStatus=seasonal');assert.equal((seasonal.match(/data-source=/g)||[]).length,2);assert.match(seasonal,/<h2>SC2 AI Arena<\/h2>/);
 const empty=render('?arenaBoard=sc2-ai-arena&arenaStatus=seasonal&arenaGroup=cooperation');assert.doesNotMatch(empty,/class="lb-heading"/);assert.match(empty,/data-reset-filters/);
});

test('filtering retains an explicit selection and asks the user when it is excluded',()=>{
 const h=render('?arenaBoard=chessbench-best&arenaStatus=reference&arenaMetric=cost&arenaQuery=Muse');
 assert.match(h,/lb-selection-prompt/);assert.match(h,/ChessBench/);assert.doesNotMatch(h,/class="lb-heading"|class="lb-table"/);
 assert.match(h,/显示 7 \/ 19 个来源/);assert.doesNotMatch(h,/leaderboard-collection|lb-nav-kind|id="leaderboard-status"/);
 const mixed=render('?arenaBoard=balrog-llm&arenaStatus=reference');assert.match(mixed,/data-source="balrog" data-leaderboard="balrog-vlm" aria-pressed="false"/);assert.match(mixed,/lb-selection-prompt/);
 const retained=render('?arenaBoard=chessbench-best&arenaStatus=continuous&arenaMetric=cost&arenaQuery=Muse');assert.match(retained,/value="cost" selected/);assert.match(retained,/value="Muse"/);assert.match(retained,/class="lb-heading"/);
 const legacy=render('?arenaCollection=featured');assert.equal((legacy.match(/data-source=/g)||[]).length,19);assert.match(legacy,/id="leaderboard-direction" >/);
});
