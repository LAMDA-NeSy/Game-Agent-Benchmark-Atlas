const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const ctx={window:{}};
for(const file of ['data.js','game-images-data.js','game-images.js']) vm.runInNewContext(fs.readFileSync('dist/'+file,'utf8'),ctx);
const images=ctx.window.ATLAS_GAME_IMAGES.entries,ui=ctx.window.AtlasGameImages;

test('Screenshots retain exact identities, source evidence and verified local assets',()=>{
  const gameIds=new Set(ctx.window.ATLAS_DATA.gameIndex.map(g=>g.id));
  assert.equal(new Set(images.map(x=>x.gameId)).size,images.length);
  assert(images.length>=30);
  for(const id of ['minecraft','overcooked','starcraft-ii','nethack','babyai'])assert(images.some(e=>e.gameId===id));
  for(const e of images){
    assert(gameIds.has(e.gameId),e.gameId);
    assert.match(e.sourceUrl,/^https:\/\//);
    if(e.sourceType==='repository'){
      assert.match(e.commit,/^[a-f0-9]{40}$/);
      assert(e.sourceUrl.includes('/blob/'+e.commit+'/'));
      assert(e.originalPath && e.originalBlob);
    }else{
      assert(['official-store','official-site'].includes(e.sourceType));
      assert.match(e.originalUrl,/^https:\/\//);
      assert(e.identityEvidence,`Missing image-to-game identity evidence: ${e.gameId}`);
    }
    assert.match(e.originalSha256,/^[a-f0-9]{64}$/);
    assert(e.credit && e.verifiedAt);
    assert(e.width>0 && e.height>0);
    for(const lang of ['zh','en']) assert(e.caption[lang]&&e.alt[lang]);
    assert.equal(e.thumbnail,undefined);
    for(const kind of ['image']){
      assert.match(e[kind],/^game-[a-z0-9-]+\.webp$/);
      const data=fs.readFileSync('dist/'+e[kind]);
      assert.equal(data.subarray(8,12).toString(),'WEBP');
      assert.equal(crypto.createHash('sha256').update(data).digest('hex'),e.sha256[kind]);
    }
    if(e.licenseFile)assert(fs.existsSync('dist/'+e.licenseFile));
  }
});

test('Images are bilingual, attributed, lazy-loaded and never inherited by unrelated games',()=>{
  assert.equal(ui.figure('unknown'),'');
  assert.equal(ui.figure('procgen-games'),'');
  assert.notEqual(ui.get('gameworld-minecraft-clone').originalSha256,ui.get('minecraft').originalSha256);
  assert.match(ui.figure('overcooked','zh'),/Overcooked-AI 研究环境/);
  assert.match(ui.figure('overcooked','en'),/Overcooked-AI research environment/);
  assert.match(ui.figure('minecraft','zh'),/图片来源/);
  assert.match(ui.figure('minecraft','en'),/Image source/);
  assert.match(ui.figure('minecraft'),/rel="noopener noreferrer"/);
  assert.match(ui.figure('minecraft'),/loading="lazy"/);
  assert.match(ui.figure('minecraft'),/alt="第一人称/);
  assert(!ui.figure('nethack').includes('src="https:'));
  assert.match(ui.figure('crafter','zh'),/生成地形示例/);
});

test('Each game has one detail image, with no repeated list thumbnail or data changes',()=>{
  const app=fs.readFileSync('src/js/app.js','utf8');
  assert(!app.includes('AtlasGameImages.thumbnail'));
  assert.equal(ui.thumbnail,undefined);
  assert.equal((ui.figure('minecraft').match(/<img /g)||[]).length,1);
  assert.equal(fs.readdirSync('dist').filter(p=>/^game-.*-thumb\.webp$/.test(p)).length,0);
  assert.match(app,/AtlasGameImages.figure\(g.id/);
  const html=fs.readFileSync('dist/index.html','utf8');
  assert(html.indexOf('game-images-data.js')<html.indexOf('game-images.js'));
  assert(html.indexOf('game-images.js')<html.indexOf('app.js'));
  assert.equal(ctx.window.ATLAS_DATA.records.length+ctx.window.ATLAS_DATA.gameCatalogRecords.length,385);
});

test('Expanded images retain version boundaries and record omitted candidates honestly',()=>{
  const audit=JSON.parse(fs.readFileSync('data/curation/game-image-review.json'));
  assert.equal(images.length,audit.previousTotal+audit.added);
  assert.equal(audit.totalWithImage,images.length);
  assert.equal(audit.added,Object.values(audit.batchCounts).reduce((a,b)=>a+b,0));
  assert.equal(audit.totalIndexEntries,ctx.window.ATLAS_DATA.gameIndex.length);
  assert.equal(audit.notYetIllustrated,audit.totalIndexEntries-images.length);
  for(const e of audit.reviewedNotSelected)assert(!ui.get(e.gameId),e.gameId);
  assert.equal(images.filter(e=>e.gameId.startsWith('atari-')).length,65);
  assert.match(ui.figure('atari-pong','en'),/Atari 2600/);
  assert.match(ui.figure('atari-pong'),/pixel-art/);
  assert.match(ui.figure('neural-mmo'),/1\.2/);
  assert.match(ui.figure('baba-is-ai'),/Baba Is AI/);
  assert.match(ui.figure('baba-is-you'),/Baba Is You/);
  assert.notEqual(ui.get('baba-is-ai').originalSha256,ui.get('baba-is-you').originalSha256);
  assert.notEqual(ui.get('craftium').originalSha256,ui.get('craftium-chop-tree').originalSha256);
});


test('New official environment images preserve exact variants and real rollout provenance',()=>{
  for(const id of ['tatham-bridges','game-rl-minecraft','gameworld-minecraft-clone','miniarcade-coinrun','omnigamearena-solocraft']) {
    assert(ui.get(id),id);
    assert.equal((ui.figure(id).match(/<img /g)||[]).length,1);
  }
  assert.notEqual(ui.get('miniarcade-coinrun').originalSha256,ui.get('procgen-coinrun').originalSha256);
  const gt=images.filter(e=>e.gameId.startsWith('actionparty-'));
  assert.equal(gt.length,46);
  for(const e of gt){
    assert.match(e.originalUrl,/\/gt_examples\/.*_gt\.mp4$/);
    assert.match(e.caption.en,/ground-truth/);
    assert.match(e.frameSha256,/^[a-f0-9]{64}$/);
    assert.equal(e.processing.frameTimeSeconds,1);
    assert.deepEqual(Array.from(e.processing.crop),[0,0,512,540]);
  }
  assert.equal(images.filter(e=>e.gameId.startsWith('tatham-')).length,40);
  assert.match(ui.figure('tatham-bridges'),/small-preview/);
  assert.match(fs.readFileSync('src/css/game-images.css','utf8'),/small-preview img\{object-fit:scale-down\}/);
  for(const e of images){
    assert(!JSON.stringify(e).includes('/Users/'),e.gameId);
    if(e.processing?.frameTimeSeconds!=null)assert.match(e.frameSha256,/^[a-f0-9]{64}$/);
  }
});
