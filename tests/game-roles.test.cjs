const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const ctx={window:{}};
for(const file of ['data.js','game-roles-data.js'])vm.runInNewContext(fs.readFileSync('dist/'+file,'utf8'),ctx);
const data=JSON.parse(JSON.stringify(ctx.window.ATLAS_DATA)),review=JSON.parse(JSON.stringify(ctx.window.ATLAS_GAME_ROLES));
const {create}=require('../dist/game-roles-model.js');
const uses=create(data,review),model=require('../dist/model.js').create(data,{gameRoles:uses});
const roles=(game,source)=>uses.classify(game,source).roles;
assert.deepEqual(roles('witcher-3','REC-2.4'),['data','offline']);
assert.equal(uses.summary('witcher-3').counts.online,0);
assert.equal(uses.summary('witcher-3').counts.data,1);
assert.equal(uses.summary('witcher-3').counts.offline,1);
assert.equal(uses.summary('witcher-3').total,1,'overlapping uses do not duplicate the paper total');
assert.deepEqual(roles('minecraft','REC-2.4'),['data','offline','online']);
assert.equal(uses.classify('minecraft','REC-2.4').executionVerified,false,'reported tasks are not verified runnable');
assert(uses.classify('minecraft','REC-2.4').claims.some(c=>c.protocolStatus==='partial'));
assert.deepEqual(roles('poker','GAP-B2'),['data','offline'],'static action prediction is not online play');
assert.deepEqual(roles('starcraft-ii','GAB068'),['data','online'],'offline RL training still has online environment evaluation');
assert.deepEqual(roles('game-rl-minecraft','GAB107'),['data','offline'],'synthetic QA is not commercial Minecraft control');
assert.deepEqual(roles('minecraft','GAB107'),[],'no transfer from a synthetic adaptation to the original game');
assert(roles('doom','W01').includes('related'),'world-model development is distinct from a player task');
assert(!roles('doom','W01').includes('online'));
assert.deepEqual(roles('minecraft','VLA-29'),['online'],'the paper confirms online use without establishing runnable code');
assert(uses.classify('minecraft','VLA-29').gaps.some(g=>g.missing.some(m=>m.field==='action_adapter')));
const g=data.gameIndex.find(g=>g.id==='witcher-3');
assert(model.gameScopeLink(g.links[0],{gameResource:'evaluation',gameReview:'all'}),'verified data/offline uses count as evaluation resources despite a legacy review tag');
const reset=model.clearGameFilters({game:'witcher-3',gameCategory:'RPG',gameUsage:'online'});
assert.equal(reset.gameUsage,'all');assert.equal(reset.game,'witcher-3');
assert(model.hasGameFilters({gameUsage:'offline'}));
assert.equal(model.selectGame({...reset,view:'games',gameUsage:'offline'},'minecraft').gameUsage,'all');

const unitIds=new Set(data.documentedTasks.map(u=>u.id));
for(const id of Object.keys(review.unitModes))assert(unitIds.has(id),'no orphan reviewed unit mode: '+id);
for(const claim of review.claims){
 assert(claim.evidence.length>0);
 for(const e of claim.evidence)assert(/^https:\/\//.test(e.url));
 for(const gameId of claim.gameIds)assert(data.gameIndex.find(g=>g.id===gameId)?.links.some(l=>l.benchmark===claim.benchmark),'claim is scoped to a real game-source relationship');
}
let links=0;const totals=Object.fromEntries(uses.roleIds.map(id=>[id,0]));
for(const game of data.gameIndex){
 const summary=uses.summary(game.id);assert.equal(summary.total,game.links.length);assert.equal(summary.executionVerified,0);
 for(const [role,count] of Object.entries(summary.counts)){assert(count<=summary.total);totals[role]+=count;}
 for(const link of game.links){const x=uses.classify(game.id,link.benchmark);assert(x.roles.length>0,'every link has an explicit use or unverified reason');assert(x.claims.every(c=>c.evidence.length>0));links++;}
}
// A newly added protocol is not silently promoted by having an action field.
const fresh=JSON.parse(JSON.stringify(data)),newId='unreviewed-new-source';
fresh.gameCatalogRecords.push({...fresh.gameCatalogRecords[0],id:newId,taskReview:null});
fresh.gameIndex.find(g=>g.id==='minecraft').links.push({benchmark:newId,source:'https://example.org/unreviewed-source'});
fresh.documentedTasks.push({...fresh.documentedTasks[0],id:'unreviewed-new-unit',benchmark:newId,gameIds:['minecraft']});
assert.deepEqual(create(fresh,review).classify('minecraft',newId).roles,['unverified']);
console.log(JSON.stringify({games:data.gameIndex.length,links,confirmedUses:totals,executionVerified:0}));
console.log('Passed: scoped uses, overlapping counts, static decisions, offline-training/online-evaluation distinction, unknown modes and no unverified runtime claims.');
