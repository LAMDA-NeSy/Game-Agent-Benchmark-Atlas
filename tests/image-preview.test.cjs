const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function fixture(language = 'zh') {
  const listeners = {}, dialogListeners = {}, classes = new Set();
  const image = {cloneNode: () => ({removed: [], removeAttribute(name) {this.removed.push(name);}})};
  const caption = {cloneNode: () => ({source: 'paper.pdf#page=4', text: 'Figure 1'})};
  const content = {replaceChildren(...nodes) {this.nodes = nodes;}};
  const close = {addEventListener(_, callback) {this.click = callback;}, setAttribute(name, value) {this[name] = value;}};
  const dialog = {
    open: false, querySelector: s => s === 'button' ? close : content,
    addEventListener(name, callback) {dialogListeners[name] = callback;},
    setAttribute(name, value) {this[name] = value;},
    showModal() {this.open = true;}, close() {this.open = false; dialogListeners.close();},
    getBoundingClientRect: () => ({left: 20, right: 200, top: 20, bottom: 200})
  };
  let underlyingDialog = false;
  const document = {
    addEventListener(name, callback) {listeners[name] = callback;},
    getElementById: () => dialog,
    querySelector: () => dialog.open || underlyingDialog ? dialog : null,
    createElement: tag => ({tag,children: [],append(node) {this.children.push(node);},removeAttribute() {}}),
    body: {classList: {add: c => classes.add(c), remove: c => classes.delete(c)}}
  };
  const window = {AtlasLanguage: {current: () => language},scrollX: 12,scrollY: 640,
    location: {href: '?category=Sandbox&game=minecraft&gameUsage=online'},
    scrollTo(position) {this.scrollX=position.left;this.scrollY=position.top;},
    AtlasArchiveMediaPreviews: JSON.parse(fs.readFileSync('data/curation/archive-media-previews.json'))};
  vm.runInNewContext(fs.readFileSync('src/js/features/atlas-ui.js', 'utf8'), {document,window});
  listeners.DOMContentLoaded();
  const scrollParent={scrollHeight: 1000,clientHeight: 200,scrollWidth: 500,clientWidth: 300,scrollTop: 350,scrollLeft: 40};
  const link = {dataset: {},parentElement: scrollParent,
    closest: () => ({querySelector: selector => selector === 'img' ? image : caption}),
    focus(options) {this.focusOptions = options;}
  };
  function click({source = false, modified = false} = {}) {
    const event = {target: {closest: selector => {
      assert.match(selector, /data-image-preview/);
      assert.match(selector, /game-screenshot-open/);
      return source ? null : link;
    }}, button: 0, ctrlKey: modified, preventDefault() {this.prevented = true;}};
    listeners.click(event);
    return event;
  }
  return {click, dialog, dialogListeners, link, content, classes, close, window, scrollParent, ui: window.AtlasUI,
    underlying(value) {underlyingDialog = value;}};
}

test('directory images open in place, retain attribution, and return focus without scrolling', () => {
  const f = fixture();
  assert(f.click().prevented);
  assert(f.dialog.open);
  assert.equal(f.close.textContent, '关闭 ×');
  assert.equal(f.content.nodes[1].source, 'paper.pdf#page=4');
  assert(f.classes.has('modal-open'));
  f.close.click();
  assert(!f.dialog.open);
  assert(!f.classes.has('modal-open'));
  assert.equal(f.link.focusOptions.preventScroll, true);
});

test('closing a preview restores page and nested scroll positions without changing filter URLs', () => {
  const f=fixture();
  const url=f.window.location.href;
  f.click();
  f.window.scrollY=0;f.window.scrollX=0;
  f.scrollParent.scrollTop=0;f.scrollParent.scrollLeft=0;
  f.close.click();
  assert.equal(f.window.scrollY,640);assert.equal(f.window.scrollX,12);
  assert.equal(f.scrollParent.scrollTop,350);assert.equal(f.scrollParent.scrollLeft,40);
  assert.equal(f.window.location.href,url);
});

test('archive illustration links preview local copies and preserve original/source links and animation notes', () => {
  const f=fixture('en');
  f.link.dataset={previewSrc:'./archive-media-example.webp',previewCaption:'Official demonstration',
    previewNote:'Still frame from the animation',previewOriginal:'https://example.org/demo.gif',previewSource:'https://example.org/project'};
  assert(f.click().prevented);
  const [image,caption]=f.content.nodes;
  assert.equal(image.src,'./archive-media-example.webp');
  assert.equal(caption.textContent,'Official demonstration');
  assert.equal(caption.children[0].textContent,'Still frame from the animation');
  assert.deepEqual(caption.children.slice(1).map(a=>a.href),['https://example.org/demo.gif','https://example.org/project']);
  f.close.click();assert(!f.dialog.open);
});

test('every archived image has an intact local preview while videos remain external', () => {
  const path=require('node:path'),crypto=require('node:crypto');
  const previews=JSON.parse(fs.readFileSync('data/curation/archive-media-previews.json')).entries;
  const records=JSON.parse(fs.readFileSync('dist/research-archives.json')).records;
  const media=records.flatMap(a=>a.overview?.media||[]);
  const f=fixture();
  assert.equal(new Set(previews.map(e=>e.url)).size,previews.length);
  for(const m of media){
    const attributes=f.ui.mediaPreview(m);
    if(m.kind==='video'){assert.equal(attributes,'');continue;}
    assert.match(attributes,/data-image-preview/);
    const entry=previews.find(e=>e.url===m.url);
    assert(entry.width>0&&entry.height>0);
    assert.equal(path.basename(entry.image),entry.image);
    assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join('dist',entry.image))).digest('hex'),entry.sha256);
    if(entry.frameIndex!==null)assert(entry.note.zh&&entry.note.en);
  }
});

test('image source links and modified clicks retain their normal navigation', () => {
  for (const options of [{source: true}, {modified: true}]) {
    const f = fixture();
    assert(!f.click(options).prevented);
    assert(!f.dialog.open);
  }
});

test('image preview closes only on the backdrop and preserves an underlying archive dialog', () => {
  const f = fixture('en');
  f.underlying(true);
  f.click();
  assert.equal(f.close.textContent, 'Close ×');
  f.dialogListeners.click({target: f.dialog, clientX: 50, clientY: 50});
  assert(f.dialog.open);
  f.dialogListeners.click({target: f.dialog, clientX: 1, clientY: 1});
  assert(!f.dialog.open);
  assert(f.classes.has('modal-open'));
});
