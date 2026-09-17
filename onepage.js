(() => {
 'use strict';
 const $=id=>document.getElementById(id);
 const nav=$('main-nav'), menu=document.querySelector('.menu-toggle');
 const setMenuLabel=open=>{menu.firstChild.textContent=open?'メニューを閉じる ':'メニューを開く ';};const closeMenu=()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false');setMenuLabel(false);};
 menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';nav.classList.toggle('open',open);menu.setAttribute('aria-expanded',String(open));setMenuLabel(open);});
 nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
 document.addEventListener('click',e=>{if(!e.target.closest('.header'))closeMenu();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){closeMenu();menu.focus();}});
 const revealHash=()=>{let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}const aliases={projects:'approach',equipment:'design',case:'example',harness:'architecture',keys:'architecture',connectors:'architecture',rules:'control',training:'enterprise',confidentiality:'enterprise',retention:'enterprise',people:'workload',risks:'enterprise'};if(aliases[id]){id=aliases[id];history.replaceState(null,'','#'+id);requestAnimationFrame(()=>$(id).scrollIntoView());}const el=$(id);if(!el)return;let node=el;while(node){if(node.tagName==='DETAILS')node.open=true;node=node.parentElement;}};
 window.addEventListener('hashchange',revealHash);revealHash();
 const views={station:{src:'assets/tester-monitor.png',title:'装置の全体',alt:'モニターを備えた研究用ベンチの全体構成の3Dモデル',caption:'チャンバー、プローブ、計測器、付属モニターを載せた研究用ベンチです。'},cad:{src:'assets/station-cad.png',title:'CAD表示',alt:'研究用ベンチをCADの陰影表示で示した立体図',caption:'同じベンチのCAD表示です。外形と部品の位置関係を示します。'},inside:{src:'assets/probe-exploded.png',title:'内部の構成',alt:'チャンバーの蓋と窓を離して示した、試料台とプローブの配置',caption:'チャンバーの蓋と窓を外した状態です。試料台、プローブ、冷却部を示します。'},assembly:{src:'details/cad/probe_chamber_drawing.svg',title:'組立図',alt:'チャンバー組立図。正面図・平面図・立体図と外形寸法',caption:'チャンバーの組立図です。正面図、平面図、立体図と外形寸法を示します。',drawing:true},plate:{src:'details/cad/mounting_plate_drawing.svg',title:'部品図',alt:'400×360×20ミリの取付板の部品図。穴位置、穴径、板厚を表示',caption:'取付板の部品図です。穴位置、穴径、板厚を示します。',drawing:true}};
 let selected=views.station;
 document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>{selected=views[button.dataset.view];$('design-image').src=selected.src;$('design-image').alt=selected.alt;$('design-caption').textContent=selected.caption;document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));}));
 const viewer=$('image-viewer');
 $('open-viewer').addEventListener('click',()=>{$('viewer-image').src=selected.src;$('viewer-image').alt=selected.alt;$('viewer-title').textContent=selected.title;$('viewer-note').textContent=selected.drawing?'図面は表示枠の中で上下・左右に動かして確認できます。':selected.caption;document.querySelector('.viewer-scroll').classList.toggle('drawing',!!selected.drawing);viewer.showModal();document.body.classList.add('modal-open');document.querySelector('.viewer-scroll').scrollTo(0,0);});
 $('close-viewer').addEventListener('click',()=>viewer.close());
 viewer.addEventListener('click',e=>{const b=viewer.getBoundingClientRect();if(e.target===viewer&&(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom))viewer.close();});
 viewer.addEventListener('close',()=>{document.body.classList.remove('modal-open');$('open-viewer').focus({preventScroll:true});});
 const data=window.RESEARCH_DATA;
 let current=data.runs.find(r=>r.run_id==='N006'),zoomed=false;
 const fmt=(v,n=3)=>v===null||v===undefined?'未測定':Number(v).toFixed(n).replace('-','−');
 data.runs.forEach(r=>{const op=document.createElement('option');op.value=r.run_id;op.textContent=`${r.run_id} · ${r.status}`;$('run').append(op);});
 function draw(){
  const r=current,ev=r.dip_events?.[0],xmin=zoomed?(ev?ev.start_s-.012:900.988):900,xmax=zoomed?(ev?ev.end_s+.012:901.014):902,ymin=Math.min(.88,r.voltage_min_V-.012),ymax=1.24;
  const W=Math.max(230,Math.round($('wave').getBoundingClientRect().width)),H=Math.max(190,Math.round($('wave').getBoundingClientRect().height)),ticks=W<420?3:4;
  $('wave').setAttribute('viewBox',`0 0 ${W} ${H}`);const L=39,R=W-11,T=23,B=H-39,x=t=>L+(t-xmin)/(xmax-xmin)*(R-L),y=v=>B-(v-ymin)/(ymax-ymin)*(B-T);
  let svg=`<rect x="${L}" y="${T}" width="${R-L}" height="${B-T}" fill="#f7fbfc"/>`;
  for(let i=0;i<5;i++){const v=ymin+(ymax-ymin)*i/4,yy=y(v);svg+=`<line x1="${L}" y1="${yy}" x2="${R}" y2="${yy}" stroke="#dbe6eb"/><text x="${L-7}" y="${yy+4}" text-anchor="end" fill="#657f8e" font-size="11">${v.toFixed(2)}</text>`;}
  for(let i=0;i<=ticks;i++){const v=xmin+(xmax-xmin)*i/ticks,xx=x(v);svg+=`<line x1="${xx}" y1="${T}" x2="${xx}" y2="${B}" stroke="#e6eef1"/><text x="${xx}" y="${B+22}" text-anchor="${i===ticks?'end':i===0?'start':'middle'}" fill="#657f8e" font-size="11">${v.toFixed(zoomed?3:1)}</text>`;}
  for(const e of r.events||[]){const t=+e.time_s;if(t>=xmin&&t<=xmax)svg+=`<line x1="${x(t)}" y1="${T}" x2="${x(t)}" y2="${B}" stroke="#b59b72" stroke-width="1.5" stroke-dasharray="5 5"/>`;}
  const points=(zoomed&&r.zoom_waveform?r.zoom_waveform:r.waveform).filter(p=>p[0]>=xmin&&p[0]<=xmax);
  if(points.length)svg+=`<polyline fill="none" stroke="#00888b" stroke-width="2" stroke-linejoin="round" vector-effect="non-scaling-stroke" points="${points.map(p=>`${x(p[0]).toFixed(2)},${y(p[1]).toFixed(2)}`).join(' ')}"/>`;
  svg+=`<text x="13" y="16" fill="#567484" font-size="11">V</text><text x="${W-11}" y="${H-4}" text-anchor="end" fill="#567484" font-size="11">時間（s）</text>`;
  $('wave').innerHTML=svg;$('wave').setAttribute('aria-label',`${r.run_id} 電圧波形 ${xmin.toFixed(3)}〜${xmax.toFixed(3)}秒。最小 ${r.voltage_min_V} V`);
  $('overview').classList.toggle('active',!zoomed);$('overview').setAttribute('aria-pressed',String(!zoomed));$('zoom').classList.toggle('active',zoomed);$('zoom').setAttribute('aria-pressed',String(zoomed));
 }
 function choose(id){
  current=data.runs.find(r=>r.run_id===id);const r=current;zoomed=false;$('run').value=id;$('status').textContent=r.status;$('status').className='status '+(r.status==='基準内'?'good':r.status==='確認中'?'hold':'');
  $('temperature').innerHTML=fmt(r.temperature_min_C,2)+'<small>°C</small>';$('voltage').innerHTML=fmt(r.voltage_min_V,4)+'<small>V</small>';$('duration').innerHTML=fmt(r.voltage_dip_max_ms,1)+'<small>ms</small>';$('pressure').innerHTML=fmt(r.pressure_max_error_MPa,4)+'<small>MPa</small>';
  $('finding').textContent=r.flag_labels.length?r.flag_labels.join(' / '):'温度、圧力、電圧が基準内です';
  $('finding-detail').textContent=r.run_id==='N006'?'電圧低下は901.000〜901.002秒に発生し、弁切替は900.8秒と901.2秒に記録されています。':r.quality_issues.length?r.quality_issues.join(' / '):r.good_points.join('。')+'。';
  $('next-check').textContent=r.run_id==='N006'?'弁の切替前後、接触状態、電源の挙動を対照試験で比較します。':r.status==='確認中'?'欠測区間と取得経路を確認します。':r.flags.includes('T1')?'試料とチャックの温度差、接触状態を確認します。':r.flags.includes('C1')?'弁指令と応答、供給圧力を照合します。':r.flags.includes('N1')?'基準負荷と駆動停止時の波形を比較します。':'同じ条件での再現性を確認し、次の試験条件を選びます。';
  $('data-summary').textContent=`${r.run_id} / ${r.sample_count_waveform.toLocaleString('ja-JP')}点の波形から表示しています（合成データ）`;
  const points=r.zoom_waveform?.length?r.zoom_waveform:r.waveform;let minIndex=0;points.forEach((p,i)=>{if(p[1]<points[minIndex][1])minIndex=i;});const start=Math.max(0,Math.min(points.length-12,minIndex-5));
  $('sample-rows').replaceChildren();points.slice(start,start+12).forEach(p=>{const tr=document.createElement('tr');p.forEach((v,i)=>{const td=document.createElement('td');td.textContent=Number(v).toFixed(i===0?4:8);tr.append(td);});$('sample-rows').append(tr);});
  $('sample-caption').textContent=`${r.run_id}：表示用波形の最小値付近の12点を表示しています。`;
  draw();
 }
 $('run').addEventListener('change',e=>choose(e.target.value));$('overview').addEventListener('click',()=>{zoomed=false;draw();});$('zoom').addEventListener('click',()=>{zoomed=true;draw();});choose(current.run_id);
 let raf;const redraw=()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(draw);};new ResizeObserver(redraw).observe($('wave'));document.fonts.ready.then(redraw);

 const rows=$('dash-rows'), message=$('dash-message');
 const lampNames={g:'基準内',y:'確認項目あり'};
 function renderOverview(filter){
  const runs=data.runs.filter(r=>filter==='all'||(filter==='good'?r.status==='基準内':r.status!=='基準内'));
  rows.replaceChildren();
  runs.forEach(r=>{
   const row=document.createElement('div');row.className='dash-row';
   const lamp=document.createElement('span'),light=document.createElement('i'),color=r.status==='基準内'?'g':'y';light.className='lamp '+color;light.setAttribute('role','img');light.setAttribute('aria-label',lampNames[color]);lamp.append(light);row.append(lamp);
   const name=document.createElement('span'),b=document.createElement('b'),small=document.createElement('small');b.textContent=r.run_id;small.textContent=r.status;name.append(b,small);row.append(name);
   for(const [label,value,unit] of [['最低温度',r.temperature_min_C,'°C'],['最小電圧',r.voltage_min_V,'V']]){const span=document.createElement('span');span.className='num';const caption=document.createElement('small');caption.textContent=label;span.append(caption,document.createTextNode(fmt(value,unit==='V'?4:2)+' '+unit));row.append(span);}
   const finding=document.createElement('span');finding.textContent=r.flag_labels.length?r.flag_labels.join(' / '):'温度・圧力・電圧が基準内';row.append(finding);
   const link=document.createElement('a');link.href='#monitor';link.className='verdict trial-link';link.dataset.trial=r.run_id;link.textContent='波形を見る';link.setAttribute('aria-label',r.run_id+'の波形を見る');link.addEventListener('click',()=>choose(r.run_id));row.append(link);rows.append(row);
  });
  message.textContent=runs.length+'件を表示 / 全'+data.runs.length+'試験。波形と確認項目を同じページで見られます。';
  document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===filter)));
 }
 document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>renderOverview(b.dataset.filter)));renderOverview('all');
})();
(() => {document.querySelectorAll('.rules-table').forEach(t=>{const h=[...t.querySelectorAll('thead th')].map(x=>x.textContent.trim());t.querySelectorAll('tbody tr').forEach(r=>[...r.children].forEach((c,i)=>{if(h[i])c.setAttribute('data-label',h[i]);}));});})();
