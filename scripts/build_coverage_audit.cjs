// Resolve filesystem reads from the repository, even when invoked elsewhere.
process.chdir(require('node:path').resolve(__dirname, '..'));
// Export the same scope accounting used by the browser, never a second counting policy.
const fs=require('node:fs'),vm=require('node:vm');
const ctx={window:{}};vm.runInNewContext(fs.readFileSync('dist/data.js','utf8'),ctx);
const d=JSON.parse(JSON.stringify(ctx.window.ATLAS_DATA)),m=require('../dist/task-coverage-model.js').create(d);
const audit={version:'coverage-accounting-v24',checkedAt:'2026-10-19',policyVersion:d.taskCoveragePolicy.version,overall:m.inventory(),categories:d.facets.categories.map(category=>({category,...m.inventory({category})})),games:d.gameIndex.map(g=>({gameId:g.id,...m.inventory({gameId:g.id})}))};
fs.writeFileSync('dist/coverage-accounting.json',JSON.stringify(audit,null,2)+'\n');
console.log('Coverage accounting:',JSON.stringify(Object.fromEntries(Object.entries(audit.overall).filter(([k])=>!['entries','reasons'].includes(k)))));
