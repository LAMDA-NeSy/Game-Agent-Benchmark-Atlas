const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

test('benchmark-specific visuals preserve identity, figure provenance and generated-image disclosure', () => {
  const data = JSON.parse(fs.readFileSync('data/curation/benchmark-visuals.json'));
  const archives = JSON.parse(fs.readFileSync('dist/research-archives.json')).records;
  const ids = new Set(archives.map(a => a.id));
  assert.equal(new Set(data.entries.map(e => e.id)).size, data.entries.length);
  assert.equal(new Set(data.entries.map(e => e.image)).size, data.entries.length);
  for (const e of data.entries) {
    assert(ids.has(e.id), e.id);
    assert.equal(path.basename(e.image), e.image);
    assert(e.width > 0 && e.height > 0);
    assert(e.caption.zh && e.caption.en && e.alt.zh && e.alt.en);
    assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join('dist', e.image))).digest('hex'), e.sha256);
    if (e.kind === 'paper-figure') {
      assert.match(e.sourceUrl, /^https:\/\//);
      assert(Number.isInteger(e.locator.page) && e.locator.page > 0);
      assert(Number.isInteger(e.locator.figure) && e.locator.figure > 0);
      const [x0,y0,x1,y1] = e.locator.normalizedCrop;
      assert(0 <= x0 && x0 < x1 && x1 <= 1 && 0 <= y0 && y0 < y1 && y1 <= 1);
    } else {
      assert.equal(e.kind, 'ai-generated-concept');
      assert.match(e.caption.zh, /AI.*示意图/);
      assert.match(e.caption.en, /AI-generated/);
      assert(e.prompt && e.tool && e.evidence.every(s => s.url.startsWith('https://')));
    }
  }
});
