const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),zlib=require('node:zlib'),crypto=require('node:crypto'),vm=require('node:vm');
const data=require('../dist/official-leaderboards.json'),{rank}=require('../src/js/models/official-leaderboard-model.js');
const dir='data/sources/official-leaderboards/2026-11-02-integration/';
const raw=name=>JSON.parse(name.endsWith('.gz')?zlib.gunzipSync(fs.readFileSync(dir+name)):fs.readFileSync(dir+name,'utf8'));
const board=id=>data.boards.find(b=>b.id===id);
function render(search,lang='zh'){const ctx={window:{AtlasOfficialLeaderboardsData:data,AtlasLeaderboardModel:{rank},AtlasLanguage:{current:()=>lang}},location:{search},URLSearchParams};vm.runInNewContext(fs.readFileSync('src/js/features/filter-tags.js','utf8'),ctx);vm.runInNewContext(fs.readFileSync('src/js/features/official-leaderboards.js','utf8'),ctx);return ctx.window.AtlasLeaderboards.render();}
test('DuelLab CSV matches its release and preserves ranked versus provisional populations',()=>{
 const csv=zlib.gunzipSync(fs.readFileSync(dir+'duellab.csv.gz')),manifest=raw('duellab-release.json');assert.equal(crypto.createHash('sha256').update(csv).digest('hex'),manifest.artifact_sha256['benchmark/leaderboard.csv']);
 const bs=data.sources.find(s=>s.id==='duellab').boardIds.map(board);assert.deepEqual(bs.map(b=>b.entries.length),[97,262,94,88,71]);assert.equal(bs.flatMap(b=>b.entries).filter(e=>!e.reference).length,513);
 for(const b of bs){assert.equal(b.source.releaseId,manifest.public_release_id);assert.equal(b.source.pageUpdatedAt,manifest.generated_at);assert.equal(new Set(b.entries.map(e=>e.sourceIdentity)).size,b.entries.length);for(const e of b.entries){assert.equal(!!e.reference,!e.eligibilityFlag);if(e.referenceLabel?.en.includes('partial'))assert.ok(Number.isFinite(e.officialRank));}}
 assert.equal(board('duellab-variants').entries[0].scores.overall.value,95.231061);
});
test('ChessBench imports every setup with exact rating and correct time conversion',()=>{
 const b=board('chessbench-all'),r=raw('chessbench.json'),setups=r.models.flatMap(m=>m.setups);assert.equal(b.entries.length,32);assert.equal(data.sources.find(s=>s.id==='chessbench').boardIds[0],b.id);
 setups.forEach((s,i)=>{const e=b.entries[i];assert.equal(e.configuration,s.effort);assert.equal(e.scores.overall.value,s.rating);assert.ok(Math.abs(e.scores.time.value-s.avgMoveTime/1000)<1e-12);assert.equal(e.scores.cost.value,s.avgCost);assert.equal(e.scores.games.value,s.games);assert.equal(e.officialRank,s.rank);});
 assert.equal(rank(b,'overall','Gemini 4 Argon').length,2);assert.equal(rank(b,'overall','high').length,b.entries.filter(e=>e.configuration.includes('high')).length);
});
test('StarSkirmish uses chart payload values and SC2 keeps divisions separate',()=>{
 const r=raw('starskirmish.json'),b=board('starskirmish-v02');assert.equal(b.entries.length,r.SCORES.length);b.entries.forEach((e,i)=>{assert.equal(e.scores.overall.value,r.SCORES[i].score);assert.equal(e.scores.cost.value,r.COSTS[r.SCORES[i].k]);});
 const sc2=raw('sc2-recap.json'),bs=data.sources.find(s=>s.id==='sc2').boardIds.map(board);assert.equal(bs.length,6);assert.equal(bs.flatMap(b=>b.entries).length,sc2.data.length);for(const b of bs){assert.equal(b.entries.length,22);assert.equal(data.boardMetadata[b.id].dateKind,'unknown');for(const e of b.entries){const r=sc2.data.find(r=>'sc2-bot-'+r.bot_id===e.id);assert.equal(e.scores.overall.value,r.elo);assert.equal(e.officialRank,r.rank);}}
});
test('Kaggle imports complete models, exact source scores and native confidence intervals',()=>{
 const ids=['kaggle-game-arena','kaggle-chess','kaggle-go','kaggle-poker','kaggle-werewolf'];const files=['kaggle-unified.json','chess-text-scores.json','go-scores.json','poker-heads-up-scores.json','werewolf-scores.json'];
 assert.deepEqual(ids.map(id=>board(id).entries.length),[39,39,36,31,8]);
 ids.forEach((id,i)=>{const b=board(id),r=raw(files[i]);assert.equal(b.entries.length,r.modelVersionHeaders.length);b.entries.forEach((e,j)=>{const h=r.modelVersionHeaders[j];assert.equal(e.agent,h.modelVersion.displayName);assert.equal(e.officialRank,h.rank);const result=r.entries.find(x=>x.modelVersionId===h.modelVersion.id&&x.taskVersionId===r.taskVersionHeaders[0].taskVersion.id).runs[0].result;assert.equal(e.scores.overall.value,(result.numericResult.value??0)*(id==='kaggle-werewolf'?100:1));});});
 assert.match(board('kaggle-werewolf').protocol.scoring.en,/Polarix/);const wolf=board('kaggle-werewolf');assert.equal(wolf.entries[0].scores.overall.display,'0.08');assert.equal(wolf.entries[0].scores.overall.interval,'±0.07');assert.equal(wolf.columns[0].unit,'%');assert.equal(wolf.columns.find(c=>c.id==='metric-2689').unit,'¢');assert.equal(wolf.entries[0].scores['metric-2689'].display,'4.38');assert.equal(wolf.columns.find(c=>c.id==='metric-2689').label.en,'Cost / turn');assert.match(board('kaggle-poker').protocol.scoring.en,/BB\/100/);
});
test('ARC public standings are complete, team-linked and retain original ranks after search',()=>{
 const b=board('arc-agi3-2026'),r=raw('arc-public.json.gz');assert.equal(b.entries.length,5041);assert.equal(b.entries.filter(e=>e.reference).length,3);assert.match(b.protocol.scope.en,/not the final/);
 b.entries.forEach((e,i)=>{const sr=r.publicLeaderboard[i],team=r.teams.find(t=>t.teamId===sr.teamId);assert.equal(e.scores.overall.display,sr.displayScore);assert.equal(e.agent,team.teamName);assert.equal(e.submissionDate,team.lastSubmissionDate);assert.equal(e.officialRank,sr.rank??null);});
 const e=b.entries.find(e=>e.officialRank===1000);assert.equal(rank(b,'overall',e.agent).find(x=>x.id===e.id).rank,1000);
});
test('results precede folded protocols, pagination covers all rows and alternate metrics use sort labels',()=>{
 for(const lang of ['zh','en'])for(const b of data.boards){const h=render('?arenaBoard='+b.id,lang);assert.ok(h.indexOf('class="lb-table"')<h.indexOf('id="leaderboard-protocol"'));assert.doesNotMatch(h,/id="leaderboard-protocol" open/);assert.ok(!h.includes('undefined'));}
 const b=board('arc-agi3-2026'),ids=[];for(let page=1;page<=Math.ceil(b.entries.length/50);page++){const h=render('?arenaBoard='+b.id+'&arenaPage='+page);ids.push(...[...h.matchAll(/data-score-detail="([^"]+)"/g)].map(m=>m[1]));}
 assert.equal(ids.length,5041);assert.equal(new Set(ids).size,5041);assert.deepEqual(new Set(ids),new Set(b.entries.map(e=>e.id)));
 const h=render('?arenaBoard=chessbench-all&arenaMetric=cost');assert.match(h,/>排序<\/th>/);assert.doesNotMatch(h,/>原榜名次<\/th>/);
 const source=render('?arenaBoard=chessbench-all');assert.match(source,/>原榜名次<\/th>/);
 assert.doesNotMatch(render('?arenaBoard=duellab-gamebench2'),/<option value="playable"/);
});
