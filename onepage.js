(() => {
 'use strict';
 const $=id=>document.getElementById(id);
 const nav=$('main-nav'), menu=document.querySelector('.menu-toggle');
 const closeMenu=()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false');};
 menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';nav.classList.toggle('open',open);menu.setAttribute('aria-expanded',String(open));});
 nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
 document.addEventListener('click',e=>{if(!e.target.closest('.header'))closeMenu();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){closeMenu();menu.focus();}});
 const revealHash=()=>{let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}const aliases={projects:'approach',equipment:'design',case:'example',harness:'architecture'};if(aliases[id]){id=aliases[id];history.replaceState(null,'','#'+id);requestAnimationFrame(()=>$(id).scrollIntoView());}const el=$(id);if(!el)return;let node=el;while(node){if(node.tagName==='DETAILS')node.open=true;node=node.parentElement;}};
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
