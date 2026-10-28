const assert=require('node:assert/strict');
const E=require('../prototypes/grid-courier/arena-engine.js');
function finish(world,policy,budget,seed){const run=E.createRun(world,policy,budget,seed);for(let i=0;i<budget+5;i++)E.step(world,run);return run;}
for(const seed of [1,42,73,508,9999]){
 const world=E.makeWorld(seed);assert.deepEqual(world,E.makeWorld(seed));
 const shortest=E.shortest(world,world.start);assert(shortest.length>0);
 const bfs=finish(world,'bfs',48,seed);assert.equal(bfs.status,'success');assert.equal(bfs.steps,shortest.length);assert.equal(bfs.revisits,0);
 for(const policy of ['bfs','greedy','random']){
  const r=finish(world,policy,24,seed),again=finish(world,policy,24,seed);
  assert.deepEqual(r.history,again.history);assert(r.steps<=24);assert.equal(r.history.length,r.steps+1);
  for(let i=1;i<r.history.length;i++)assert(E.neighbors(world,r.history[i-1].pos).some(n=>n.pos.join()===r.history[i].pos.join()));
  assert.equal(r.revisits,r.history.filter(h=>h.revisit).length);
  assert.equal(r.status,r.pos.join()===world.goal.join()?'success':'budget');
 }
}
const world=E.makeWorld(42);const r=finish(world,'bfs',3,42);assert.equal(r.status,'budget');assert.equal(r.steps,3);
console.log('Passed: deterministic maps and policies, reachable goals, shortest-path completion, legal moves, terminal budgets and revisit accounting across five seeds.');
