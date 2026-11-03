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
    body: {classList: {add: c => classes.add(c), remove: c => classes.delete(c)}}
  };
  vm.runInNewContext(fs.readFileSync('src/js/features/atlas-ui.js', 'utf8'), {
    document, window: {AtlasLanguage: {current: () => language}}
  });
  listeners.DOMContentLoaded();
  const link = {
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
  return {click, dialog, dialogListeners, link, content, classes, close,
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
