'use strict';
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.AtlasLeaderboardModel=api;})(typeof window==='undefined'?globalThis:window,()=>{
  // Rank within one source table and one native metric before applying search.
  function rank(board,metricId='overall',query=''){
    const metric=board.columns.find(c=>c.id===metricId&&c.rankable!==false)||board.columns[0];
    const compare=(a,b)=>{
      const score=(a.scores[metric.id].sortValue-b.scores[metric.id].sortValue)*(metric.direction==='asc'?1:-1);
      if(score||!metric.tieBreak)return score;
      const tie=board.columns.find(c=>c.id===metric.tieBreak),av=a.scores[tie.id]?.sortValue,bv=b.scores[tie.id]?.sortValue;
      if(!Number.isFinite(av)||!Number.isFinite(bv))return Number.isFinite(av)?-1:Number.isFinite(bv)?1:0;
      return (av-bv)*(tie.direction==='asc'?1:-1);
    };
    const rows=board.entries.filter(e=>Number.isFinite(e.scores[metric.id]?.sortValue))
      .map(e=>({...e,metric:metric.id})).sort((a,b)=>Number(!!a.reference)-Number(!!b.reference)||compare(a,b)||a.sourceRow-b.sourceRow);
    let previous,position=0,index=0;
    rows.forEach(row=>{if(row.reference){row.rank=null;return;}index++;if(!previous||compare(row,previous)!==0)position=index;row.rank=metric.id==='overall'&&Number.isFinite(row.officialRank)?row.officialRank:position;previous=row;});
    const q=query.trim().toLowerCase();return rows.filter(e=>[e.agent,e.configuration?.zh,e.configuration?.en,typeof e.configuration==='string'?e.configuration:''].filter(Boolean).join(' ').toLowerCase().includes(q));
  }
  return {rank};
});
