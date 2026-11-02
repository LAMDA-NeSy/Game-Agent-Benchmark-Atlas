'use strict';
((root)=>{
 const streams=['benchmarks','leaderboards'];
 const validTime=x=>typeof x==='string'&&Number.isFinite(Date.parse(x));
 function valid(data){
  return data?.version===1&&validTime(data.revisionAt)&&data.timeZone==='Asia/Shanghai'&&
   data.schedule?.weekday===1&&data.schedule.hour===10&&data.schedule.minute===0&&
   streams.every(key=>{
    const s=data.streams?.[key];
    return s&&validTime(s.nextScheduledAt)&&(s.lastCompletedAt===null||
     (validTime(s.lastCompletedAt)&&Date.parse(s.nextScheduledAt)>Date.parse(s.lastCompletedAt)));
   });
 }
 function state(stream,now=Date.now()){
  const remaining=Date.parse(stream.nextScheduledAt)-now;
  const minutes=Math.max(0,Math.ceil(remaining/60000));
  return {pending:remaining<=0,days:Math.floor(minutes/1440),hours:Math.floor(minutes%1440/60),minutes:minutes%60};
 }
 function duration(value,lang){
  return lang==='en'?`${value.days}d ${value.hours}h ${value.minutes}m`:`${value.days}天 ${value.hours}小时 ${value.minutes}分`;
 }
 const api={valid,state,duration};
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(!root.document)return;
 let data=root.AtlasUpdateSchedule,fetching=false;
 const lang=()=>root.AtlasLanguage.current();
 const text=(zh,en)=>lang()==='en'?en:zh;
 const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const date=value=>new Intl.DateTimeFormat(lang()==='en'?'en-GB':'zh-CN',{
  timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'
 }).format(new Date(value));
 function content(key){
  const s=data.streams[key],v=state(s);
  return `<span class="update-label">${key==='benchmarks'?text('Benchmark 同步','Benchmark sync'):text('排行榜同步','Leaderboard sync')}</span>`+
   `<strong class="update-countdown" ${v.pending?'data-pending':''} title="${esc(date(s.nextScheduledAt))} UTC+8">${v.pending?text('更新待完成','Update pending'):text('距下次同步 ','Next sync in ')+duration(v,lang())}</strong>`+
   `<span class="update-cadence">${text('每周一 10:00 · 北京时间','Mondays 10:00 · UTC+8')}</span>`+
   (s.lastCompletedAt?`<span class="update-completed">${text('最近完成','Last completed')} <time datetime="${esc(s.lastCompletedAt)}">${esc(date(s.lastCompletedAt))}</time></span>`:'');
 }
 function html(key){
  return valid(data)&&streams.includes(key)?`<div class="atlas-update-status" data-update-stream="${key}" data-no-i18n title="${text('本站数据同步计划','Atlas data synchronization schedule')}">${content(key)}</div>`:'';
 }
 function mount(){
  const view=document.body.dataset.view;
  for(const [id,visible] of [['theme-update-status',view==='themes'],['collection-update-status',['explore','games'].includes(view)]]){
   const el=document.getElementById(id);if(!el)continue;
   el.hidden=!visible;el.innerHTML=visible?html('benchmarks'):'';
  }
 }
 function tick(){
  if(!valid(data))return;
  document.querySelectorAll('[data-update-stream]').forEach(el=>{
   if(streams.includes(el.dataset.updateStream))el.innerHTML=content(el.dataset.updateStream);
  });
 }
 async function refresh(){
  // Bundled data remains usable offline. Only accept newer published metadata.
  if(fetching||document.hidden||!/^https?:$/.test(location.protocol))return;
  fetching=true;
  try{
   const response=await fetch('./update-schedule.json',{cache:'no-store',signal:AbortSignal.timeout(10000)});
   if(!response.ok)return;
   const next=await response.json();
   if(valid(next)&&(!valid(data)||Date.parse(next.revisionAt)>Date.parse(data.revisionAt))){data=next;mount();tick();}
  }catch{/* Keep the last published schedule when offline or a request fails. */}
  finally{fetching=false;}
 }
 root.AtlasUpdates={html,mount};
 setInterval(tick,30000);
 setInterval(refresh,300000);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden){tick();refresh();}});
 root.addEventListener('atlas-language-change',tick);
 refresh();
})(typeof window==='object'?window:globalThis);
