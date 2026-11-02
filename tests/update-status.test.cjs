const test=require('node:test'),assert=require('node:assert/strict');
const model=require('../src/js/features/update-status.js');
const data=require('../data/curation/update-schedule.json');
test('published weekly schedules use a shared Monday 10:00 China time deadline',()=>{
 assert.ok(model.valid(data));
 assert.deepEqual(require('../dist/update-schedule.json'),data);
 for(const s of Object.values(data.streams)){
  const time=new Date(s.nextScheduledAt);
  assert.equal(time.getUTCDay(),1);assert.equal(time.getUTCHours(),2);assert.equal(time.getUTCMinutes(),0);
 }
});
test('countdown reaches pending at deadline and never rolls over without published completion',()=>{
 const s={nextScheduledAt:'2026-11-09T02:00:00Z'};
 assert.deepEqual(model.state(s,Date.parse('2026-11-02T02:00:00Z')),{pending:false,days:7,hours:0,minutes:0});
 assert.deepEqual(model.state(s,Date.parse('2026-11-09T01:59:59Z')),{pending:false,days:0,hours:0,minutes:1});
 for(const date of ['2026-11-09T02:00:00Z','2026-11-16T02:00:00Z']){
  assert.deepEqual(model.state(s,Date.parse(date)),{pending:true,days:0,hours:0,minutes:0});
 }
 assert.deepEqual(model.state(s,Date.parse('2026-11-09T09:30:00+08:00')),model.state(s,Date.parse('2026-11-09T01:30:00Z')));
});
test('streams complete independently and malformed refresh metadata is rejected',()=>{
 const next=structuredClone(data);
 next.streams.leaderboards={nextScheduledAt:'2026-11-09T02:00:00Z',lastCompletedAt:null};
 next.streams.benchmarks.lastCompletedAt='2026-11-09T03:00:00Z';
 next.streams.benchmarks.nextScheduledAt='2026-11-16T02:00:00Z';
 assert.ok(model.valid(next));
 const now=Date.parse('2026-11-09T04:00:00Z');
 assert.equal(model.state(next.streams.benchmarks,now).pending,false);
 assert.equal(model.state(next.streams.leaderboards,now).pending,true);
 next.streams.leaderboards.nextScheduledAt='invalid';assert.equal(model.valid(next),false);
 assert.equal(model.valid({}),false);
});
test('both languages express the same remaining time',()=>{
 const value={days:6,hours:12,minutes:5};
 assert.equal(model.duration(value,'zh'),'6天 12小时 5分');
 assert.equal(model.duration(value,'en'),'6d 12h 5m');
});
