const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),data=require('../data/curation/official-leaderboards.json');
const raw=JSON.parse(fs.readFileSync(path.join(root,data.sourceSnapshot),'utf8'));
const {rank}=require('../src/js/models/official-leaderboard-model.js');
test('every imported result preserves source table cells, order, dates and flags',()=>{
 assert.deepEqual(data.boards.map(b=>[b.id,b.entries.length]),[['balrog-llm',39],['balrog-vlm',10],['orak-performance',20],['orak-arena',7]]);
 for(const b of data.boards){
  const evidence=raw.tables.find(x=>x.table.id===b.source.tableId);assert.equal(evidence.source.pageSha256,b.source.pageSha256);
  assert.equal(new Set(b.columns.map(c=>c.id)).size,b.columns.length);
  for(const e of b.entries){const row=evidence.table.rows[e.sourceRow];assert.equal(e.sourceAgent,row.cells[0].text);assert.equal(e.officialChecked,/[✔✓]/u.test(e.sourceAgent));
   assert.match(e.resultUrl,/^https:\/\/(balrogai\.com|krafton-ai\.github\.io)\//);
   for(const c of b.columns){const cell=row.cells[c.sourceColumn];assert.equal(e.scores[c.id].display,cell.text);assert.equal(e.scores[c.id].sourceSortValue,Number(cell.attrs['data-order']??parseFloat(cell.text)));assert.equal(e.scores[c.id].sortValue,parseFloat(cell.text));}
   if(e.submissionDate)assert.equal(e.submissionDate,row.cells.at(-1).text);
  }
  assert.ok(b.protocol.links.every(x=>x.url.startsWith('https://')&&x.label.zh&&x.label.en));
 }
 assert.deepEqual(require('../dist/official-leaderboards.json'),data);
});
test('native ranking respects direction, exact precision, ties, missing scores and search scope',()=>{
 const board={columns:[{id:'overall',direction:'asc'},{id:'game',direction:'desc'}],entries:[
  {id:'a',agent:'Alpha',sourceRow:1,scores:{overall:{sortValue:2},game:{sortValue:10}}},
  {id:'b',agent:'Beta',sourceRow:2,scores:{overall:{sortValue:1},game:{sortValue:10}}},
  {id:'c',agent:'Gamma',sourceRow:3,scores:{overall:{sortValue:2},game:{sortValue:2}}},
  {id:'d',agent:'Missing',sourceRow:4,scores:{}}]};
 const before=JSON.stringify(board);
 assert.deepEqual(rank(board).map(e=>[e.id,e.rank]),[['b',1],['a',2],['c',2]]);
 assert.deepEqual(rank(board,'game').map(e=>[e.id,e.rank]),[['a',1],['b',1],['c',3]]);
 assert.deepEqual(rank(board,'game','gamma').map(e=>e.rank),[3]);
 assert.equal(JSON.stringify(board),before);
 for(const b of data.boards)for(const c of b.columns){const rows=rank(b,c.id);for(let i=1;i<rows.length;i++)assert.ok((rows[i].scores[c.id].sortValue-rows[i-1].scores[c.id].sortValue)*(c.direction==='asc'?1:-1)>=0);}
});

test('Orak Elo ordering uses the displayed score, not inconsistent hidden metadata',()=>{const b=data.boards.find(b=>b.id==='orak-arena');assert.ok(rank(b,'starcraft-ii')[0].agent.startsWith('Claude'));const e=b.entries.find(e=>e.agent.startsWith('Qwen'));assert.equal(e.scores['starcraft-ii'].value,1445.2);assert.equal(e.scores['starcraft-ii'].sourceSortValue,1680.1);});
