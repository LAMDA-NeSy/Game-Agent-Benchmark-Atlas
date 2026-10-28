const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ctx={window:{}};
vm.runInNewContext(fs.readFileSync('dist/data.js','utf8'),ctx);
const data=JSON.parse(JSON.stringify(ctx.window.ATLAS_DATA));
vm.runInNewContext(fs.readFileSync('dist/game-roles-data.js','utf8'),ctx);
const review=JSON.parse(JSON.stringify(ctx.window.ATLAS_GAME_ROLES));
const gameRoles=require('../dist/game-roles-model.js').create(data,review);
const model=require('../dist/model.js').create(data,{gameRoles});
const defaults={view:'games',game:'minecraft',gameCategory:'Sandbox',q:'',question:null,agents:[],caps:[],genres:[],interactions:[],kinds:[],gameCapability:null,gameAssociation:'primary',gameResource:'all',gameReview:'all'};
const visible=state=>model.games.get(state.game).links.filter(l=>model.gameScopeLink(l,state)&&model.matches(model.byId.get(l.benchmark),state,{gameId:state.game}));

// Reproduce the reported empty page without pretending the source is absent.
const filtered={...defaults,game:'witcher-3',gameCategory:'RPG',question:'sustained'};
assert.equal(model.games.get(filtered.game).links.length,1);
assert.equal(visible(filtered).length,0);
assert(model.hasGameFilters(filtered));
const cleared=model.clearGameFilters(filtered,{includeScope:true});
assert.equal(cleared.game,'witcher-3');
assert.equal(cleared.gameCategory,'RPG');
assert.equal(visible(cleared).length,1);
assert(!model.hasGameFilters(cleared));
assert.equal(filtered.question,'sustained','reset must not mutate the prior history state');

const allFilters={...defaults,question:'sustained',q:'Minecraft',agents:['RL'],caps:['memory'],genres:['Sandbox'],interactions:['cooperative'],kinds:['Research platform'],gameCapability:'planning',gameAssociation:'secondary'};
const selected=model.selectGame(allFilters,'witcher-3','RPG');
assert.equal(selected.gameCategory,'RPG');
assert.equal(visible(selected).length,1,'ordinary game switches start without inherited paper filters');
assert(!model.hasGameFilters(selected));
assert.equal(model.selectGame({...filtered},'witcher-3').question,'sustained','reselecting the current game preserves deliberate filters');
assert.equal(model.selectGame({...filtered,view:'themes'},'witcher-3').question,null,'entering a game from a research theme does not silently inherit that theme');

// Index-wide resource and verification selectors remain intentional across games,
// are counted as active filters, and can be cleared by the empty-state action.
for(const scope of [{gameResource:'evaluation'},{gameReview:'tasks'},{gameReview:'reviewed'}]){
 const s=model.selectGame({...allFilters,...scope},'witcher-3');
 for(const [key,value] of Object.entries(scope))assert.equal(s[key],value);
 assert(model.hasGameFilters(s));
 const reset=model.clearGameFilters(s,{includeScope:true});
 assert.equal(visible(reset).length,1);
 assert(!model.hasGameFilters(reset));
}
assert.equal(visible({...cleared,gameResource:'evaluation'}).length,1,'confirmed data and offline uses are evaluation resources even when the old paper-kind tag is pending');

// The total count must always correspond to real, renderable research links.
let links=0;
for(const g of data.gameIndex){
 const state={...defaults,game:g.id,gameCategory:g.categories[0]};
 assert.equal(new Set(g.links.map(l=>l.benchmark)).size,g.links.length,'unique source links: '+g.id);
 for(const l of g.links)assert(model.byId.has(l.benchmark),'linked record exists: '+g.id+'/'+l.benchmark);
 assert.equal(visible(state).length,g.links.length,'all links appear without filters: '+g.id);
 links+=g.links.length;
}
console.log(`Passed: filtered-empty recovery, game/theme navigation, scope reset, and all ${data.gameIndex.length} games / ${links} renderable source links.`);
