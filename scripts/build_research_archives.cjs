'use strict';
// Resolve filesystem reads from the repository, even when invoked elsewhere.
process.chdir(require('node:path').resolve(__dirname, '..'));
const fs=require('node:fs'),vm=require('node:vm');
const ctx={window:{}};
for(const f of ['data.js','game-roles-data.js'])vm.runInNewContext(fs.readFileSync('dist/'+f,'utf8'),ctx);
const data=ctx.window.ATLAS_DATA,library=JSON.parse(fs.readFileSync('dist/benchmark-library.json'));
const roles=require('../dist/game-roles-model.js').create(data,ctx.window.ATLAS_GAME_ROLES);
const archives=require('../dist/research-archive-model.js').create(data,library,roles);
const output={schemaVersion:'research-archives-v2',sourceHash:library.sourceHash,count:archives.entries.length,records:archives.entries};
fs.writeFileSync('dist/research-archives.json',JSON.stringify(output,null,2)+'\n');
console.log(`Saved ${output.count} research archives with ${output.records.reduce((n,r)=>n+r.tasks.length,0)} documented task units.`);
