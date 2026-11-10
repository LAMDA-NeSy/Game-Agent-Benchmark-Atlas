const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const data=require('../dist/official-leaderboards.json'),overrides=require('../data/sources/official-leaderboards/current-overrides.json');
const read=name=>JSON.parse(fs.readFileSync(overrides[name].path,'utf8'));
const tracks=[['game-arena','kaggle-game-arena','kaggle-unified.json'],['chess-text','kaggle-chess','chess-text-scores.json'],['go','kaggle-go','go-scores.json'],['poker-heads-up','kaggle-poker','poker-heads-up-scores.json'],['werewolf','kaggle-werewolf','werewolf-scores.json']];
test('Kaggle imports all numeric cells and intervals consistently with official public downloads',()=>{
 let checked=0;
 for(const [slug,id,file] of tracks){
  const b=data.boards.find(b=>b.id===id),native=read(file),download=read(slug+'-download.json');
  assert.equal(b.entries.length,download.rows.length);assert.equal(b.source.dataUrl,overrides[slug+'-download.json'].url);
  const dates=[];
  for(const h of native.modelVersionHeaders){
   const row=download.rows.find(r=>r.modelVersionSlug===h.modelVersion.slug),entry=b.entries.find(e=>e.id===id+'-'+h.modelVersion.id);assert.ok(row);assert.equal(entry.officialRank??null,h.rank??null);
   for(const col of b.columns){
    const cell=row.taskResults.find(t=>col.sourceDisplayName===t.benchmarkTaskName);assert.ok(cell,slug+': '+col.sourceTaskName);
    const source=cell.result.numericResult,s=entry.scores[col.id];assert.equal(s.value,(source.value??0)*col.displayScale);const digits=col.displayDigits;
    if(source.hasUnevenConfidenceInterval){const ci=source.unevenConfidenceInterval;assert.equal(s.interval,`−${((ci.minus??0)*col.displayScale).toFixed(digits)} / +${((ci.plus??0)*col.displayScale).toFixed(digits)}`);}
    if(source.hasConfidenceInterval)assert.equal(s.interval,`±${(source.confidenceInterval*col.displayScale).toFixed(digits)}`);
    checked++;
   }
  }
  for(const e of native.entries){const run=e.runs[0],result=run.result||run.results[0];const model=native.modelVersionHeaders.find(h=>h.modelVersion.id===e.modelVersionId).modelVersion;const header=native.taskVersionHeaders.find(h=>h.taskVersion.id===e.taskVersionId);const name=header.taskVersionMapping?.columnName||header.taskVersion.name;const exported=download.rows.find(r=>r.modelVersionSlug===model.slug).taskResults.find(t=>t.benchmarkTaskName===name);const date=result.evaluationDate||exported.result.evaluationDate;if(date)dates.push(date);}
  assert.equal(b.source.pageUpdatedAt,dates.sort().at(-1));assert.notEqual(b.source.pageUpdatedAt,b.source.snapshotAt);
 }
 assert.equal(checked,477);
});
test('TextArena fresh confirmation does not turn inactive historical results into an active board',()=>{
 const b=data.boards.find(b=>b.id==='textarena-balanced'),source=read('textarena-results');
 assert.equal(source.data.length,21);assert.ok(source.data.every(r=>r.is_standard&&!r.is_active));assert.equal(data.boardMetadata[b.id].kind,'historical');assert.equal(b.source.pageUpdatedAt,null);assert.equal(b.source.snapshotAt,source.capture.capturedAt);
 b.entries.forEach((e,i)=>{assert.equal(e.sourceRecordId,source.data[i].model_id);assert.equal(e.scores.overall.value,source.data[i].trueskill);assert.equal(e.scores.games.value,source.data[i].games_played);});
});
