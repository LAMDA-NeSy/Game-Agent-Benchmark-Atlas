'use strict';
// One predicate for topic membership, facets and scoped game relationships.
(function(root){
 function resolveView(params){
  const explicit=params.get('view');
  if(['themes','games','capabilities','arena'].includes(explicit))return explicit;
  if(explicit==='explore')return params.get('question')?'themes':'explore';
  if(params.get('question'))return 'themes';
  if(['q','agent','capability','genre','interaction','kind','detail','compare','comparison','sort'].some(k=>params.has(k)))return 'explore';
  return 'themes';
 }
 function create(data,{gameRoles=null}={}){
  const byId=new Map([...data.records,...(data.gameCatalogRecords||[])].map(r=>[r.id,r]));
  const games=new Map(data.gameIndex.map(g=>[g.id,g]));
  const questions=new Map(data.questions.map(q=>[q.id,q]));
  const norm=s=>String(s).normalize('NFKC').toLowerCase();
  const legacyGenres={Cooking:['Simulation'],Strategy:['RTS','Simulation','Abstract task'],Arcade:['Multi-genre']};
  function normalizeGenres(values){return [...new Set(values.flatMap(v=>legacyGenres[v]||[v]))].filter(v=>data.facets.categories.includes(v));}
  function gameRoute(category,gameId){
   const redirected=data.gameRedirects?.[gameId];
   const requested=games.get(redirected||gameId);
   const legacy={Cooking:'Simulation',Strategy:'RTS',Cooperative:'Simulation',Arcade:'Multi-genre'};
   const resolved=redirected?requested.categories[0]:data.facets.categories.includes(category)?category:(requested?.categories[0]||legacy[category]||'Sandbox');
   return {gameCategory:resolved,game:requested?.categories.includes(resolved)?requested.id:data.gameIndex.find(g=>g.categories.includes(resolved)).id};
  }
  function clearGameFilters(state,{includeScope=false}={}){
   return {...state,q:'',question:null,agents:[],caps:[],genres:[],interactions:[],kinds:[],gameCapability:null,gameAssociation:'primary',gameUsage:'all',...(includeScope?{gameResource:'all',gameReview:'all'}:{})};
  }
  function selectGame(state,gameId,category=null){
   const g=games.get(gameId);if(!g)return state;
   const next=state.view!=='games'||state.game!==gameId?clearGameFilters(state):{...state};
   return {...next,view:'games',detail:null,game:gameId,gameSearch:'',gameCategory:category&&g.categories.includes(category)?category:g.categories.includes(state.gameCategory)?state.gameCategory:g.categories[0]};
  }
  function hasGameFilters(state){
   return !!(state.q||state.question||state.gameCapability||(state.gameUsage&&state.gameUsage!=='all')||state.gameResource==='evaluation'||['reviewed','tasks'].includes(state.gameReview)||['agents','caps','genres','interactions','kinds'].some(k=>state[k]?.length));
  }
  function gameScopeLink(link,state){
   if(!link)return false;const r=byId.get(link.benchmark);if(!r)return false;
   return (state.gameReview!=='reviewed'||['reviewed','attribution','task-reviewed'].includes(link.verification)||!!link.taskUnitIds?.length)&&(state.gameReview!=='tasks'||!!link.taskUnitIds?.length)&&(state.gameResource!=='evaluation'||(gameRoles?gameRoles.forLink(link).roles.some(id=>['data','offline','online'].includes(id)):!['method','survey','review'].includes(r.resourceKind)));
  }
  function projection(r,gameId){
   if(!gameId)return r;
   const g=games.get(gameId), l=g?.links.find(l=>l.benchmark===r.id);
   return l?{...r,agents:l.agents,caps:l.taskCoverageIncludesMembers?[...new Set([...l.caps,...(data.documentedTasks||[]).filter(u=>(l.taskUnitIds||[]).includes(u.id)).flatMap(u=>u.capabilities.map(c=>c.id))])]:l.caps,genres:g.categories,interactions:l.interactions}:null;
  }
  function matches(r,state,{gameId=null,ignore=null,searchText=''}={}){
   const p=projection(r,gameId);if(!p)return false;
   const q=questions.get(state.question);
   if(q&&!p.caps.includes(q.cap))return false;
   if(state.q&&!norm(state.q).split(/\s+/).every(t=>norm(searchText).includes(t)))return false;
   return ['agents','caps','genres','interactions','kinds'].every(k=>ignore===k||!state[k]?.length||state[k].some(v=>p[k].includes(v)));
  }
  function priority(r,question){return Object.hasOwn(questions.get(question)?.candidates||{},r.id);}
  function themeRecords(question){const q=questions.get(question);return q?data.records.filter(r=>r.caps.includes(q.cap)):[];}
  return {byId,games,questions,projection,matches,priority,themeRecords,normalizeGenres,gameRoute,clearGameFilters,selectGame,hasGameFilters,gameScopeLink};
 }
 if(typeof module!=='undefined')module.exports={create,resolveView};else root.AtlasModel={create,resolveView};
})(typeof window==='undefined'?{}:window);
