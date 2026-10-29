const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const ctx={window:{}};
for(const file of ['data.js','game-images-data.js','game-images.js']) vm.runInNewContext(fs.readFileSync('dist/'+file,'utf8'),ctx);
const images=ctx.window.ATLAS_GAME_IMAGES.entries,ui=ctx.window.AtlasGameImages;

test('Screenshots retain exact identities, immutable provenance and verified local assets',()=>{
  const gameIds=new Set(ctx.window.ATLAS_DATA.gameIndex.map(g=>g.id));
  assert.equal(new Set(images.map(x=>x.gameId)).size,images.length);
  assert.equal(images.length,30);
  for(const e of images){
    assert(gameIds.has(e.gameId),e.gameId);
    assert.match(e.commit,/^[a-f0-9]{40}$/);
    assert(e.sourceUrl.includes('/blob/'+e.commit+'/'));
    assert(e.originalPath && e.originalSha256 && e.credit && e.verifiedAt);
    assert(e.width>0 && e.height>0);
    for(const lang of ['zh','en']) assert(e.caption[lang]&&e.alt[lang]);
    for(const kind of ['image','thumbnail']){
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
  assert.equal(ui.thumbnail('procgen-games'),'');
  assert.equal(ui.thumbnail('minecraft-clone-gameworld'),'');
  assert.match(ui.figure('overcooked','zh'),/Overcooked-AI 研究环境/);
  assert.match(ui.figure('overcooked','en'),/Overcooked-AI research environment/);
  assert.match(ui.figure('minecraft','zh'),/图片来源/);
  assert.match(ui.figure('minecraft','en'),/Image source/);
  assert.match(ui.figure('minecraft'),/rel="noopener noreferrer"/);
  assert.match(ui.thumbnail('minecraft'),/loading="lazy"/);
  assert.match(ui.thumbnail('minecraft'),/alt=""/);
  assert(!ui.figure('nethack').includes('src="https:'));
  assert.match(ui.figure('crafter','zh'),/生成地形示例/);
});

test('Game images integrate into both list and detail without changing research data',()=>{
  const app=fs.readFileSync('src/js/app.js','utf8');
  assert.match(app,/AtlasGameImages.thumbnail\(game.id/);
  assert.match(app,/AtlasGameImages.figure\(g.id/);
  const html=fs.readFileSync('dist/index.html','utf8');
  assert(html.indexOf('game-images-data.js')<html.indexOf('game-images.js'));
  assert(html.indexOf('game-images.js')<html.indexOf('app.js'));
  assert.equal(ctx.window.ATLAS_DATA.records.length+ctx.window.ATLAS_DATA.gameCatalogRecords.length,385);
});
