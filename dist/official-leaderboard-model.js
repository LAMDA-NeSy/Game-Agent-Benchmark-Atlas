'use strict';
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.AtlasLeaderboardModel=api;})(typeof window==='undefined'?globalThis:window,()=>{
  // Rank within one source table and one native metric before applying search.
  function rank(board,metricId='overall',query=''){
    const metric=board.columns.find(c=>c.id===metricId)||board.columns[0];
    const rows=board.entries.filter(e=>Number.isFinite(e.scores[metric.id]?.sortValue))
      .map(e=>({...e,metric:metric.id})).sort((a,b)=>
        (a.scores[metric.id].sortValue-b.scores[metric.id].sortValue)*(metric.direction==='asc'?1:-1)||a.sourceRow-b.sourceRow);
    let previous,position=0;
    rows.forEach((row,i)=>{const value=row.scores[metric.id].sortValue;if(value!==previous)position=i+1;row.rank=position;previous=value;});
    const q=query.trim().toLowerCase();return rows.filter(e=>e.agent.toLowerCase().includes(q));
  }
  return {rank};
});
