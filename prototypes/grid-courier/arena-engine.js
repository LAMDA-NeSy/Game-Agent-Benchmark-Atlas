'use strict';
// Browser-local reference task. No external model calls or benchmark scores.
(function(root){
 const SIZE=9, VERSION='grid-courier-v1';
 const MOVES=[[1,0,'E'],[0,1,'S'],[-1,0,'W'],[0,-1,'N']];
 function rng(seed){let n=seed>>>0;return()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};}
 const key=([x,y])=>x+','+y;
 function makeWorld(seed){
  const random=rng(seed),walls=[];
  for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++)if(x!==0&&y!==SIZE-1&&!(x===SIZE-1&&y===SIZE-1)&&random()<.28)walls.push(key([x,y]));
  return {version:VERSION,seed,size:SIZE,start:[0,0],goal:[8,8],walls};
 }
 function neighbors(world,pos){return MOVES.map(([dx,dy,action])=>({pos:[pos[0]+dx,pos[1]+dy],action})).filter(m=>m.pos.every(v=>v>=0&&v<world.size)&&!world.walls.includes(key(m.pos)));}
 function shortest(world,start){
  const queue=[{pos:start,path:[]}],seen=new Set([key(start)]);
  for(let i=0;i<queue.length;i++){
   const cur=queue[i];if(key(cur.pos)===key(world.goal))return cur.path;
   for(const n of neighbors(world,cur.pos))if(!seen.has(key(n.pos))){seen.add(key(n.pos));queue.push({pos:n.pos,path:[...cur.path,n]});}
  }
  return null;
 }
 function createRun(world,policy,budget,seed){return {policy,budget,pos:[...world.start],steps:0,revisits:0,status:'ready',history:[{step:0,pos:[...world.start],action:null,revisit:false}],random:rng(seed)};}
 function step(world,run){
  if(['success','budget'].includes(run.status))return;
  let choices=neighbors(world,run.pos),choice;
  if(run.policy==='bfs')choice=shortest(world,run.pos)?.[0];
  else if(run.policy==='greedy')choice=choices.sort((a,b)=>distance(a.pos,world.goal)-distance(b.pos,world.goal))[0];
  else choice=choices[Math.floor(run.random()*choices.length)];
  const pos=choice?.pos||run.pos,revisit=run.history.some(h=>key(h.pos)===key(pos));
  run.pos=[...pos];run.steps++;run.revisits+=Number(revisit);
  run.status=key(pos)===key(world.goal)?'success':run.steps>=run.budget?'budget':'running';
  run.history.push({step:run.steps,pos:[...pos],action:choice?.action||'WAIT',revisit});
 }
 const distance=(a,b)=>Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1]);
 const api={VERSION,makeWorld,neighbors,shortest,createRun,step};
 if(typeof module!=='undefined')module.exports=api;else root.ArenaEngine=api;
})(typeof window==='undefined'?{}:window);
