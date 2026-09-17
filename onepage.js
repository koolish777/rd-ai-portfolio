(() => {
 'use strict';
 const $=id=>document.getElementById(id);
 const nav=$('main-nav'), menu=document.querySelector('.menu-toggle');
 const closeMenu=()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false');};
 menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';nav.classList.toggle('open',open);menu.setAttribute('aria-expanded',String(open));});
 nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
 document.addEventListener('click',e=>{if(!e.target.closest('.header'))closeMenu();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){closeMenu();menu.focus();}});
 const revealHash=()=>{let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}const aliases={projects:'approach',equipment:'design',case:'example',harness:'architecture',workflow:'architecture',insights:'architecture',handoff:'connectors',control:'example','model-notes':'architecture'};if(aliases[id]){id=aliases[id];history.replaceState(null,'','#'+id);requestAnimationFrame(()=>$(id).scrollIntoView());}const el=$(id);if(!el)return;let node=el;while(node){if(node.tagName==='DETAILS')node.open=true;node=node.parentElement;}};
 window.addEventListener('hashchange',revealHash);revealHash();
 const views={station:{src:'assets/tester-monitor.png',title:'装置の全体',alt:'モニターを備えた研究用ベンチの全体構成の3Dモデル',caption:'チャンバー、プローブ、計測器、付属モニターを載せた研究用ベンチです。'},cad:{src:'assets/station-cad.png',title:'CAD表示',alt:'研究用ベンチをCADの陰影表示で示した立体図',caption:'同じベンチのCAD表示です。外形と部品の位置関係を示します。'},inside:{src:'assets/probe-exploded.png',title:'内部の構成',alt:'チャンバーの蓋と窓を離して示した、試料台とプローブの配置',caption:'チャンバーの蓋と窓を外した状態です。試料台、プローブ、冷却部を示します。'},assembly:{src:'details/cad/probe_chamber_drawing.svg',title:'組立図',alt:'チャンバー組立図。正面図・平面図・立体図と外形寸法',caption:'チャンバーの組立図です。正面図、平面図、立体図と外形寸法を示します。',drawing:true},plate:{src:'details/cad/mounting_plate_drawing.svg',title:'部品図',alt:'400×360×20ミリの取付板の部品図。穴位置、穴径、板厚を表示',caption:'取付板の部品図です。穴位置、穴径、板厚を示します。',drawing:true}};
 let selected=views.station;
 document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>{selected=views[button.dataset.view];$('design-image').src=selected.src;$('design-image').alt=selected.alt;$('design-caption').textContent=selected.caption;document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));}));
 const viewer=$('image-viewer');
 $('open-viewer').addEventListener('click',()=>{$('viewer-image').src=selected.src;$('viewer-image').alt=selected.alt;$('viewer-title').textContent=selected.title;$('viewer-note').textContent=selected.drawing?'図面は表示枠の中で上下・左右に動かして確認できます。':selected.caption;document.querySelector('.viewer-scroll').classList.toggle('drawing',!!selected.drawing);viewer.showModal();document.body.classList.add('modal-open');document.querySelector('.viewer-scroll').scrollTo(0,0);});
 const er=$('open-er');if(er)er.addEventListener('click',()=>{$('viewer-image').src='assets/data-structure.svg';$('viewer-image').alt='データ構造の図。9種類のデータと関係名';$('viewer-title').textContent='データ構造';$('viewer-note').textContent='図は表示枠の中で上下・左右に動かして確認できます。';document.querySelector('.viewer-scroll').classList.add('drawing');viewer.showModal();document.body.classList.add('modal-open');document.querySelector('.viewer-scroll').scrollTo(0,0);});
 $('close-viewer').addEventListener('click',()=>viewer.close());
 viewer.addEventListener('click',e=>{const b=viewer.getBoundingClientRect();if(e.target===viewer&&(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom))viewer.close();});
 viewer.addEventListener('close',()=>{document.body.classList.remove('modal-open');($('viewer-title').textContent==='データ構造'?$('open-er'):$('open-viewer')).focus({preventScroll:true});});
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
  document.dispatchEvent(new CustomEvent('research:run-selected',{detail:{runId:id}}));
 }
 $('run').addEventListener('change',e=>choose(e.target.value));$('overview').addEventListener('click',()=>{zoomed=false;draw();});$('zoom').addEventListener('click',()=>{zoomed=true;draw();});choose(current.run_id);
 let raf;const redraw=()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(draw);};new ResizeObserver(redraw).observe($('wave'));document.fonts.ready.then(redraw);
})();

(() => {
 'use strict';
 const rows=document.getElementById('dash-rows'),msg=document.getElementById('dash-message'),hist=document.getElementById('dash-history');if(!rows)return;
 // row: [lamp, name, state, count(label,value), second(label,value), now, verdict class, verdict]
 const S={
  normal:{msg:'3装置とも設定値の範囲内です。担当者の操作は不要です。',hist:['09:02 試験担当者が実行権限を発行（案件 J-0917）','09:20 装置B 照合処理が「電圧の最小値」を不合格と判定（最小値に平均値を代入）','09:31 装置B 再計算処理が原波形の全点から最小値を再計算','09:35 装置B 再照合に合格'],rows:[
   ['g','装置A / 温度評価','解析 → 照合',['再計算','1 / 3'],['累計不合格','0 / 5'],'試料温度とチャック温度の差を確認しています。','go','続行'],
   ['g','装置B / 通電試験','再照合',['再計算','2 / 3'],['累計不合格','1 / 5'],'再計算後の照合に合格しました。','go','続行'],
   ['g','装置C / 圧力応答','解析',['再計算','1 / 3'],['累計不合格','0 / 5'],'応答曲線と弁指令を整理しています。','go','続行'],
   ['g','実行管理','進行中',['API呼び出し','4 / 10'],['—',''],'3装置の結果を集約しています。','go','続行'],
   ['g','実行権限','使用中',['使用回数','1回 / 上限1回'],['発行時刻','09:02'],'案件 J-0917 の保存先だけを開いています。','go','有効']]},
  repair:{msg:'装置Bを点検しています。自動点検処理が原記録の列名と単位を確認し、結果に応じて再実行します。',hist:['09:02 試験担当者が実行権限を発行','09:20 装置B「試料温度」が不合格（1回目）','09:31 装置B 再計算後も「試料温度」が不合格（2回目）','09:32 自動点検処理を開始（列名、単位、版）'],rows:[
   ['g','装置A / 温度評価','再照合',['再計算','2 / 3'],['累計不合格','0 / 5'],'再照合に合格しました。','go','続行'],
   ['y','装置B / 通電試験','点検中',['再計算','2 / 3'],['累計不合格','2 / 5'],'「試料温度」が2回連続で不合格です。','fix','点検'],
   ['g','装置C / 圧力応答','照合',['再計算','1 / 3'],['累計不合格','0 / 5'],'弁指令と圧力の応答を照合しています。','go','続行'],
   ['y','実行管理','待機',['API呼び出し','6 / 10'],['—',''],'装置Bの点検結果を待っています。','fix','待機'],
   ['g','実行権限','使用中',['使用回数','1回 / 上限1回'],['発行時刻','09:02'],'有効です。自動点検処理は実行権限を使いません。','go','有効']]},
  reset:{msg:'装置Bの解析を停止しました。試験担当者が試験条件を確認し、新しい実行権限で再開します。',hist:['09:02 試験担当者が実行権限を発行','09:20 装置B 不合格（1回目）','09:31 装置B 再計算後も同じ集計値で不合格（2回目）','09:44 装置B 再計算後も同じ集計値で不合格（3回目、上限）','09:48 実行権限を失効。実行管理が原因候補を報告'],rows:[
   ['g','装置A / 温度評価','完了',['再計算','2 / 3'],['累計不合格','0 / 5'],'合格です。','go','完了'],
   ['r','装置B / 通電試験','停止',['再計算','3 / 3'],['累計不合格','3 / 5'],'3回とも同じ集計値で不合格です。','stop','停止（条件の見直し）'],
   ['g','装置C / 圧力応答','完了',['再計算','1 / 3'],['累計不合格','0 / 5'],'合格です。','go','完了'],
   ['r','実行管理','停止',['API呼び出し','8 / 10'],['—',''],'原因候補：原記録の時刻ずれ、計算式の版。','stop','報告済み'],
   ['r','実行権限','失効',['使用回数','1回 / 上限1回'],['失効時刻','09:48'],'この実行権限は使えません。','stop','失効']]},
  rebuild:{msg:'装置Cの照合を停止しました。チェックリストの版（案件 v7、照合処理 v6）をそろえ、試験担当者の承認後に再開します。',hist:['09:02 試験担当者が実行権限を発行','09:15 装置C 照合処理がチェックリスト v6 を読み込み','09:16 版の不一致を検出（案件は v7）','09:17 自動点検処理では直らないため停止。設定の組み直しを依頼'],rows:[
   ['g','装置A / 温度評価','解析',['再計算','1 / 3'],['累計不合格','0 / 5'],'集計しています。','go','続行'],
   ['g','装置B / 通電試験','解析',['再計算','1 / 3'],['累計不合格','0 / 5'],'波形から低下区間を抽出しています。','go','続行'],
   ['r','装置C / 圧力応答','停止',['再計算','1 / 3'],['累計不合格','1 / 5'],'チェックリスト v6 ≠ 案件 v7。','stop','停止（設定の組み直し）'],
   ['r','実行管理','停止',['API呼び出し','3 / 10'],['—',''],'設定の組み直しを試験担当者に依頼しています。','stop','承認待ち'],
   ['y','実行権限','保留',['使用回数','1回 / 上限1回'],['発行時刻','09:02'],'有効です。組み直しが終わるまで使いません。','fix','保留']]}
 };
 const lampName={g:'緑',y:'黄',r:'赤'};
 const cell=(l,v)=>v?`<span class="num"><small>${l}</small>${v}</span>`:`<span class="num"><small>&nbsp;</small>—</span>`;
 function render(key){
  rows.replaceChildren();
  S[key].rows.forEach(r=>{const d=document.createElement('div');d.className='dash-row';
   d.innerHTML=`<span><i class="lamp ${r[0]}" role="img" aria-label="${lampName[r[0]]}"></i></span><span><b>${r[1]}</b><small>${r[2]}</small></span>${cell(r[3][0],r[3][1])}${cell(r[4][0],r[4][1])}<span>${r[5]}</span><span class="verdict ${r[6]}">${r[7]}</span>`;
   rows.append(d);});
  msg.textContent=S[key].msg;
  if(hist){hist.replaceChildren();S[key].hist.forEach(h=>{const li=document.createElement('li');li.textContent=h;hist.append(li);});}
  document.querySelectorAll('[data-scenario]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.scenario===key)));
 }
 document.querySelectorAll('[data-scenario]').forEach(b=>b.addEventListener('click',()=>render(b.dataset.scenario)));
 render('normal');
})();

(() => {document.querySelectorAll('.rules-table').forEach(t=>{const h=[...t.querySelectorAll('thead th')].map(x=>x.textContent.trim());t.querySelectorAll('tbody tr').forEach(r=>[...r.children].forEach((c,i)=>{if(h[i])c.setAttribute('data-label',h[i]);}));});})();

(() => {
 'use strict';
 const $=id=>document.getElementById(id), data=window.RESEARCH_DATA;
 if(!$('research-loop')||!data)return;
 const states=new Map(), reference=data.runs.find(r=>r.run_id==='N001');
 const scenarios={
  N005:{metric:'電圧変動RMS',unit:'mV',key:'voltage_ac_rms_mV',kind:'noise',plans:[
   {title:'駆動条件の比較',purpose:'駆動回路から重なるノイズを調べます。',change:'試験対象を同じ負荷に保ち、補助駆動回路の動作／停止だけを切り替えます。',steps:[['切替条件と記録項目を準備',.2],['動作／停止で波形を取得',.2],['同じ区間のRMSを比較',.1]],target:3,after:10.9,next:'駆動停止だけでは期待値に届いていません。次は案2の配線経路を比較し、駆動条件を固定して差を確認します。',question:'信号線を動力線から離すと、RMSが下がるか。'},
   {title:'配線経路の比較',purpose:'信号線と動力線の位置関係を調べます。',change:'電源と試験条件を保ち、信号線の経路だけを変更します。',steps:[['3Dで配線経路と固定位置を検討',.5],['信号線の経路を変更',.5],['変更前後の波形を取得',.25],['RMSと取付状態を確認',.25]],target:4,after:3.4,mechanical:true,next:'期待値に達した結果を引き継ぎます。変更した配線経路を固定し、同じ条件で3回試験して再現性を確認します。',question:'同じ配線経路で3回ともRMSが4.0 mV以下になるか。'},
   {title:'基準電源との比較',purpose:'使用電源による電圧変動を調べます。',change:'配線と負荷を保ち、使用電源だけを基準電源へ切り替えます。',steps:[['基準電源の条件を準備',.4],['使用電源／基準電源で波形を取得',.4],['同じ区間のRMSを比較',.2]],target:5,after:11.8,next:'電源の変更後も変動が残っています。次は案2の配線経路を比較し、基準電源を使った条件を引き継ぎます。',question:'基準電源を保ったまま配線経路を変えると、変動が減るか。'}
  ]},
  N006:{metric:'電圧の最小値',unit:'V',key:'voltage_min_V',kind:'dip',plans:[
   {title:'駆動条件の比較',purpose:'駆動動作と短い電圧低下の関係を調べます。',change:'負荷と配線を保ち、補助駆動回路の動作／停止だけを切り替えます。',steps:[['切替条件と時刻記録を準備',.2],['動作／停止で波形を取得',.2],['電圧低下と動作時刻を比較',.1]],target:1.1,after:.910,duration:2,next:'駆動停止後も2 msの電圧低下が残っています。次は案2のプローブ固定を比較し、接触と低下区間の関係を確認します。',question:'プローブの固定方法を変えると、電圧低下が消えるか。'},
   {title:'プローブ固定の比較',purpose:'接触部の動きと電圧低下の関係を調べます。',change:'接触位置と電源を保ち、プローブの固定方法だけを変更します。',steps:[['3Dでプローブの固定部を検討',.5],['固定方法を変更',.5],['変更前後の波形を取得',.25],['最小電圧と接触状態を確認',.25]],target:1.1,after:1.198,duration:0,mechanical:true,next:'この結果例では電圧低下が解消しています。固定部の図面と試験条件を引き継ぎ、同じ条件で3回試験して再現性を確認します。',question:'変更した固定方法で3回とも1.100 V以上を保てるか。'},
   {title:'基準電源との比較',purpose:'電源の応答と電圧低下の関係を調べます。',change:'負荷とプローブの固定方法を保ち、使用電源だけを基準電源へ切り替えます。',steps:[['基準電源と取得条件を準備',.4],['使用電源／基準電源で波形を取得',.4],['最小電圧と低下時間を比較',.2]],target:1.1,after:1.05,duration:2,next:'最小電圧は上がっていますが、期待値には届いていません。次は案2の固定方法を比較し、電源と接触の影響を分けて調べます。',question:'基準電源を保ったまま固定方法を変えると、低下が解消するか。'}
  ]}
 };
 let activeRun;
 const num=(v,places)=>Number(v).toFixed(places);
 const value=(v,s)=>`${num(v,s.kind==='noise'?2:3)} ${s.unit}`;
 const target=(p,s)=>`${num(p.target,s.kind==='noise'?1:3)} ${s.unit}${s.kind==='noise'?'以下':'以上'}`;
 const hours=p=>p.steps.reduce((sum,step)=>sum+step[1],0);
 const field=(label,content)=>{const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=content;row.append(dt,dd);return row;};
 const pass=(p,s)=>s.kind==='noise'?p.after<=p.target:p.after>=p.target;
 function render(){
  const r=activeRun,s=scenarios[r.run_id],state=states.get(r.run_id);
  document.querySelectorAll('[data-review-run]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.reviewRun===r.run_id)));
  $('review-options').hidden=!s;
  if(!s){
   $('hook-state').textContent=r.quality_issues.length?'取得確認':r.status==='基準内'?'基準内':'確認項目';
   $('hook-title').textContent=`${r.run_id} / ${r.flag_labels.join('・')||'今回の取得条件で基準内'}`;
   $('hook-detail').textContent=r.quality_issues.length?r.quality_issues.join('。')+'。取得経路を確認し、再取得後に比較します。':r.status==='基準内'?'同じ条件での再現性を確認し、次の試験条件を選びます。':'上の確認項目に沿って、温度・圧力の条件を確認します。';
   $('hook-evidence').textContent='電圧低下と連続ノイズの比較検討は、上の2つの操作例から選べます。';return;
  }
  $('hook-state').textContent=state.handoff?'次の試験票':state.result?'結果返却':state.selected!==null?'担当者が選択済み':'確認待ち';
  $('hook-title').textContent=`専用Hook → 試験担当者の確認欄 / ${r.run_id}`;
  $('hook-detail').textContent=s.kind==='noise'?`N001のRMS ${value(reference[s.key],s)}に対し、N005は${value(r[s.key],s)}です。設定値${data.criteria.voltage_ac_rms_limit_mV.toFixed(1)} mVを超える変動を検出し、3案の比較を依頼します。`:`N001の最小電圧${value(reference[s.key],s)}に対し、N006は${value(r[s.key],s)}です。901.000〜901.002秒に2 msの電圧低下を検出し、3案の比較を依頼します。`;
  $('hook-evidence').textContent=`根拠：${r.run_id}とN001の合成波形、10 kHz、各20,000点。${s.kind==='dip'?'弁切替は900.8秒と901.2秒です。':'900〜902秒の同じ区間からRMSを比較します。'}`;
  $('proposal-rows').replaceChildren();
  s.plans.forEach((p,i)=>{
   const tr=document.createElement('tr');tr.classList.toggle('selected',state.selected===i);
   const th=document.createElement('th');th.scope='row';th.textContent=`${i+1}. ${p.title}`;const small=document.createElement('small');small.textContent=p.purpose;th.append(small);tr.append(th);
   const contents=[p.steps.map(step=>step[0]).join(' → '),target(p,s),`${hours(p).toFixed(2)} H`];
   contents.forEach((content,j)=>{const td=document.createElement('td');td.dataset.label=['必要工程','期待値（仮説）','工数 H・試算'][j];const span=document.createElement('span');span.textContent=content;if(j===2)span.className='proposal-hours';td.append(span);tr.append(td);});
   const td=document.createElement('td');td.dataset.label='担当者の選択';const button=document.createElement('button');button.textContent=state.selected===i?'選択済み':`案${i+1}を選ぶ`;button.dataset.proposal=String(i+1);button.setAttribute('aria-pressed',String(state.selected===i));button.addEventListener('click',()=>{
    if(state.selected!==i){state.selected=i;state.result=false;state.handoff=false;state.log.push(`担当者：案${i+1}「${p.title}」を選択。期待値${target(p,s)}、予定工数${hours(p).toFixed(2)} H。`);}
    render();document.querySelector(`[data-proposal="${i+1}"]`).focus({preventScroll:true});$('review-plan').scrollIntoView({behavior:'smooth',block:'nearest'});
   });td.append(button);tr.append(td);$('proposal-rows').append(tr);
  });
  $('review-plan').hidden=state.selected===null;
  $('review-result').hidden=!state.result;$('next-trial').hidden=!state.handoff;
  if(state.selected!==null){
   const p=s.plans[state.selected];
   $('plan-title').textContent=`選択した試験：案${state.selected+1} / ${p.title}`;
   $('plan-condition').textContent=p.change;$('plan-steps').replaceChildren();
   p.steps.forEach(([text,h])=>{const li=document.createElement('li');li.textContent=`${text}（${h.toFixed(2)} H）`;$('plan-steps').append(li);});
   $('plan-hours').textContent=`担当者の予定工数：${hours(p).toFixed(2)} H。AIとプログラムが波形の集計、原記録との照合、変更前後の比較表を用意します。`;
   $('plan-mechanical').hidden=!p.mechanical;
   if(state.result){
    $('result-before').textContent=value(r[s.key],s);$('result-target').textContent=target(p,s);$('result-after').textContent=value(p.after,s);
    const delta=p.after-r[s.key];
    $('result-assessment').textContent=`${s.metric}の差：${delta>=0?'+':'−'}${value(Math.abs(delta),s)}。${pass(p,s)?'期待値に到達':'期待値との差が残っています'}${s.kind==='dip'?`。電圧低下：${r.voltage_dip_max_ms.toFixed(1)} → ${p.duration.toFixed(1)} ms`:''}。`;
    $('result-next').textContent=p.next;
   }
   if(state.handoff){
    $('next-trial-title').textContent=`${r.run_id} / 案${state.selected+1}の結果から次の比較へ`;
    $('next-trial-fields').replaceChildren(
     field('引き継ぐ条件',p.change),
     field('結果と判断理由',`${s.metric} ${value(r[s.key],s)} → ${value(p.after,s)}（合成データの結果例）。期待値は${target(p,s)}。${pass(p,s)?'再現性を確認する段階へ進みます。':'残る差を別の条件で調べます。'}`),
     field('次に確かめること',p.question),
     field('必要な記録',`元試験${r.run_id}・比較元N001・選択した案・変更箇所・波形の取得条件・結果・残る課題${p.mechanical?'・固定部や配線の図面の版':''}。`),
     field('返却先','実行管理が次の作業票を用意し、担当者が条件を選び、解析・照合へ渡します。')
    );
   }
  }
  $('review-log').replaceChildren();state.log.forEach(message=>{const li=document.createElement('li');li.textContent=message;$('review-log').append(li);});
 }
 // The review Hook delivers the detected comparison to the on-page assignee inbox.
 document.addEventListener('research:review-needed',event=>{
  const r=event.detail.run;
  if(!states.has(r.run_id))states.set(r.run_id,{selected:null,result:false,handoff:false,log:[`解析・照合：${r.run_id}とN001の比較結果を作成。`,'専用Hook：異常と根拠を担当者の確認欄へ通知。','実行管理：必要工程・期待値・工数を付けた3案を提示。']});
  render();
 });
 function onRun(id){
  activeRun=data.runs.find(r=>r.run_id===id);
  if(!activeRun)return;
  const r=activeRun;
  if(scenarios[id]&&(r.voltage_min_V<data.criteria.voltage_minimum_V||r.voltage_ac_rms_mV>data.criteria.voltage_ac_rms_limit_mV))document.dispatchEvent(new CustomEvent('research:review-needed',{detail:{run:r,referenceId:reference.run_id}}));
  else render();
 }
 document.addEventListener('research:run-selected',e=>onRun(e.detail.runId));
 document.querySelectorAll('[data-review-run]').forEach(b=>b.addEventListener('click',()=>{$('run').value=b.dataset.reviewRun;$('run').dispatchEvent(new Event('change',{bubbles:true}));}));
 $('show-trial-result').addEventListener('click',()=>{
  const state=states.get(activeRun.run_id),s=scenarios[activeRun.run_id];if(!state||state.selected===null)return;
  if(!state.result){const p=s.plans[state.selected];state.result=true;state.log.push(`担当者：案${state.selected+1}の再試験結果例を返却。${s.metric} ${value(p.after,s)}（合成データ）。`);state.log.push('解析・照合：前回との差と期待値を比較し、次に確かめる条件を提示。');}
  render();$('review-result').scrollIntoView({behavior:'smooth',block:'nearest'});
 });
 $('create-next-trial').addEventListener('click',()=>{
  const state=states.get(activeRun.run_id);if(!state?.result)return;
  if(!state.handoff){state.handoff=true;state.log.push('実行管理：選択した案、結果、判断理由、残る課題を次の試験票へ引き継ぎ。');}
  render();$('next-trial').focus({preventScroll:true});$('next-trial').scrollIntoView({behavior:'smooth',block:'nearest'});
 });
 onRun($('run').value);
})();
