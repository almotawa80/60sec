/* ===================== الطريق إلى الرئيسي ===================== */
const ROUTE=['الخيران','صباح الأحمد','المنقف','الفحيحيل','الأحمدي','الظهر','الرقة','العقيلة',
  'الجهراء','القصر','سعد العبدالله','جابر الأحمد',
  'صباح السالم','العدان','أبو فطيرة','مبارك العبدالله',
  'العارضية','الرقعي','الأندلس','اشبيلية','خيطان','عبدالله مبارك','الرابية',
  'بيان','حطين','الصديق','السالمية','الرميثية','الشهداء',
  'السرة','قرطبة','اليرموك','العديلية','كيفان','الخالدية','الدعية','مجمع الوزارات','وزارة الدفاع','الخدمات المصرفية للأعمال',
  'الفرع الرئيسي'];
const HQ=ROUTE.length-1;
const GOV=[{n:'الأحمدي',a:0,b:7},{n:'الجهراء',a:8,b:11},{n:'مبارك الكبير',a:12,b:15},{n:'الفروانية',a:16,b:22},{n:'حولي',a:23,b:28},{n:'العاصمة',a:29,b:HQ}];
const MALLS=[{n:'ذا ويرهاوس',at:3},{n:'البيرق مول',at:7},{n:'أفنتورا مول',at:11},{n:'الأفنيوز',at:18},{n:'360 مول',at:25}];
const RD={st:null, mall:null, back:null};
const RD0={pos:0,stars:[],streak:0,shields:0,keys:1,practice:0,malls:[],today:false,ahead:[],ahead_n:0,arrived:null,rank:null};
const rdSt=()=>RD.st||RD0;
const govOf=p=>{ for(let g=0;g<GOV.length;g++) if(p<=GOV[g].b) return g; return GOV.length-1; };
const isGovEnd=i=>GOV.some(g=>g.b===i);
const starSum=st=>(st.stars||[]).reduce((a,b)=>a+(b||0),0);
const rdLoggedIn=()=>DEMO || (!GUEST() && !needReg());

async function roadLoad(){
  if(DEMO){ if(!RD.st) RD.st={pos:4,stars:[3,2,3,1],streak:4,shields:1,keys:2,practice:1,malls:[],today:false,ahead:[{n:'سارة',pos:5},{n:'محمد',pos:6}],ahead_n:12,arrived:null,rank:null}; }
  else if(rdLoggedIn()){ const r=await rpc('road_state',{p_id:PID},5000); if(r && typeof r.pos==='number') RD.st=r; }
  try{ roadCard(); }catch(e){}
  if($('roadPage').classList.contains('active')) renderMap(false);
}

function roadCard(){
  const st=rdSt(), g=govOf(Math.min(st.pos,HQ)), done=!!st.arrived;
  $('rcCh').textContent = done ? 'وصلت الفرع الرئيسي 🏁' : 'الفصل '+(g+1)+' من 6 · '+GOV[g].n;
  $('rcSt').textContent=st.streak||0; $('rcSh').textContent=st.shields||0; $('rcK').textContent=st.keys||0;
  if(!rdLoggedIn()){ $('rcCurL').textContent='الطريق إلى الرئيسي'; $('rcCur').textContent='ابدأ من الخيران'; }
  else { $('rcCurL').textContent = done ? 'ترتيبك بين الواصلين' : 'أنت في'; $('rcCur').textContent = done ? '#'+(st.rank||1) : 'فرع '+ROUTE[st.pos]; }
  let h='';
  for(let k=0;k<5;k++){ const i=st.pos+k; if(i>HQ) break;
    if(k) h+='<span class="l"></span>';
    h+= (k===0 ? '<span class="d cur"></span>' : (isGovEnd(i) ? '<span class="d chest">'+(i===HQ?'🏁':'🎁')+'</span>' : '<span class="d"></span>'));
  }
  $('rcPath').innerHTML=h;
  $('rcBar').style.width=Math.round(Math.min(st.pos,HQ+1)/(HQ+1)*100)+'%';
  const left=HQ-Math.min(st.pos,HQ);
  $('rcLeft').textContent = done ? 'أنهيت الرحلة · ⭐ '+starSum(st) : (left ? 'باقي '+left+' فرع للرئيسي' : 'الفرع الرئيسي قدامك!');
}

function openRoad(){ renderMap(true); show('roadPage'); setTimeout(()=>renderMap(true),30); }
$('rCard').onclick=()=>{ openRoad(); roadLoad(); };
$('rpBack').onclick=()=>{ RD.back=null; show('home'); };

function crPath(pts){ let d='M'+pts[0][0]+' '+pts[0][1];
  for(let i=0;i<pts.length-1;i++){ const p0=pts[i-1]||pts[i],p1=pts[i],p2=pts[i+1],p3=pts[i+2]||p2;
    d+=' C'+(p1[0]+(p2[0]-p0[0])/6).toFixed(1)+' '+(p1[1]+(p2[1]-p0[1])/6).toFixed(1)+','+(p2[0]-(p3[0]-p1[0])/6).toFixed(1)+' '+(p2[1]-(p3[1]-p1[1])/6).toFixed(1)+','+p2[0].toFixed(1)+' '+p2[1].toFixed(1); }
  return d; }

/* الخريطة 3D: الطريق قدامك وهو رايح للأفق */
function bkLogo(cls,txt){ const pth=document.querySelector('svg.bklogo path'), d=pth?pth.getAttribute('d'):'';
  return '<span class="'+cls+'"><svg viewBox="0 0 2525 699"><path fill="#e0262f" fill-rule="evenodd" d="'+d+'"/></svg>'+(txt?'<i class="tx"><b>بنك بوبيان</b><em>Boubyan Bank</em></i>':'')+'</span>'; }
const M3={STEP:280, TILT:72, PW:900, cam:0, built:false, H:0, BASE:0};
const GCOL=[['#ff8a3d','#d9480f'],['#22b8cf','#0b7285'],['#40c057','#2b8a3e'],['#b15ce8','#7b2fa8'],['#3d9bff','#1864ab'],['#ff5c6c','#c4141d']];
const m3x=i=>M3.PW/2+Math.sin(i*0.9+0.6)*110;
const m3y=i=>M3.BASE-i*M3.STEP;
function m3Build(){
  const st=rdSt(), pos=Math.min(st.pos,HQ+1), arrived=!!st.arrived, S=M3.STEP;
  M3.H=(HQ+30)*S+700; M3.BASE=M3.H-560;
  const pl=$('r3Plane'); pl.style.height=M3.H+'px';
  const pts=[[m3x(-2),m3y(-2)]]; for(let i=-1;i<=HQ;i++) pts.push([m3x(i),m3y(i)]); for(let i=HQ+1;i<=HQ+28;i++){ const k=Math.max(0,1-(i-HQ)/3); pts.push([M3.PW/2+(m3x(i)-M3.PW/2)*k, m3y(i)]); }
  const d=crPath(pts);
  const cut=[[m3x(-2),m3y(-2)]]; for(let i=-1;i<=Math.min(pos,HQ);i++) cut.push([m3x(i),m3y(i)]);
  let h='<svg width="'+M3.PW+'" height="'+M3.H+'" viewBox="0 0 '+M3.PW+' '+M3.H+'">'
   +'<path d="'+d+'" fill="none" stroke="rgba(122,90,58,.35)" stroke-width="152" stroke-linecap="round"/>'
   +'<path d="'+d+'" fill="none" stroke="#f5f5f5" stroke-width="122" stroke-linecap="round"/>'
   +'<path d="'+d+'" fill="none" stroke="#34353a" stroke-width="110" stroke-linecap="round"/>'
   +(pos>0?'<path d="'+crPath(cut)+'" fill="none" stroke="rgba(224,38,47,.28)" stroke-width="110" stroke-linecap="round"/>':'')
   +'<path d="'+d+'" fill="none" stroke="#ffc23d" stroke-width="6" stroke-dasharray="40 34" class="run"/></svg>';
  const bb=(x,y,inner,cls,attr)=>'<div class="m3n'+(cls?' '+cls:'')+'" data-d="'+((M3.BASE-y)/S).toFixed(2)+'" style="left:'+x.toFixed(0)+'px;top:'+y.toFixed(0)+'px"'+(attr||'')+'><div class="m3b">'+inner+'</div></div>';
  GOV.forEach((g,gi)=>{ const y=m3y(g.a)+S*0.5, x=(m3x(g.a)+m3x(g.a-1))/2, c=GCOL[gi];
    h+=bb(x,y,'<div class="m3gate" style="--c:'+c[0]+';--c2:'+c[1]+'"><span>محافظة '+g.n+'</span></div>','gate'); });
  ROUTE.forEach((nm,i)=>{
    const x=m3x(i), y=m3y(i), done=i<pos, cur=(i===pos && !arrived), hq=i===HQ, cls=done?'done':cur?'cur':'lock', c=GCOL[govOf(i)], side=(i%2?1:-1), s=(st.stars||[])[i]||0;
    h+=bb(x,y,'<div class="m3pad">'+(done?'✓':cur?'▶':hq?'🏁':'🔒')+'</div>',cls+' pad','data-i="'+i+'"');
    if(hq){ h+=bb(x+side*210,y-40,'<div class="m3hq"><div class="nm">🏁 الفرع الرئيسي</div></div>',cls); return; }
    h+=bb(x+side*200,y-30,'<div class="m3bld" style="--c:'+c[0]+';--c2:'+c[1]+'">'+(done&&s?'<div class="st">'+'⭐'.repeat(s)+'</div>':'')+'<div class="bk"><i class="gl3"></i>'+bkLogo('lo2',1)+'<div class="ar"><i class="gl"></i></div><i class="gl2"></i></div><span class="lg">'+nm+'</span></div>',cls);
    h+=bb(x-side*175,y-150,'<div class="m3palm">🌴</div>','');
    if(isGovEnd(i)) h+=bb(x-side*150,y+40,'<div class="m3chest">'+(done?'📭':'🎁')+'</div>',cls);
  });
  MALLS.forEach((m,k)=>{ const won=(st.malls||[]).indexOf(k)>=0, open=!won && pos>m.at, i=m.at, side=(i%2?1:-1);
    h+=bb(m3x(i)-side*230,m3y(i)-S*0.45,'<button type="button" class="m3mall '+(won?'won':open?'open':'off')+'" data-k="'+k+'"><span class="b">'+(won?'✓':'🛍️')+'</span><span class="l">'+m.n+(open?' ⚡':'')+'</span></button>','');
  });
  if(!arrived) h+=bb(m3x(pos-0.45),m3y(pos-0.45),'<div class="m3car"><i class="sh"></i><i class="ex"></i><i class="wl"></i><i class="wr"></i><i class="cb"></i><i class="bo"></i><i class="tl"></i><i class="tr"></i><i class="pl">بوبيان</i></div>','car');
  pl.innerHTML=h;
  pl.querySelectorAll('.m3mall').forEach(b=>b.onclick=e=>{ e.stopPropagation(); mallTap(+b.dataset.k); });
  pl.querySelectorAll('.m3n.pad').forEach(n=>n.onclick=()=>{ const i=+n.dataset.i, s=(rdSt().stars||[])[i]||0;
    if(i<pos) toast('فرع '+ROUTE[i]+' ✓ '+(s?'⭐'.repeat(s):'')); else if(i===pos && !arrived) $('rpGo').click(); else toast('🔒 فرع '+ROUTE[i]+': باقي '+(i-pos)+' '+((i-pos)===1?'فوز':'فوزات')); });
  M3.built=true;
}
function m3Cam(c,anim){
  M3.cam=Math.max(-0.6,Math.min(HQ,c));
  const pl=$('r3Plane'); pl.style.transition=anim?'transform .6s cubic-bezier(.2,.8,.2,1)':'none';
  pl.style.transform='rotateX('+M3.TILT+'deg) translateY('+(M3.cam*M3.STEP).toFixed(1)+'px)';
  const hf=document.querySelector('#r3Sky .hqfar'); if(hf && !hf.dataset.lg){ hf.dataset.lg=1; const t=hf.querySelector('.t'); if(t) t.innerHTML=bkLogo('lo2',0); const pp=hf.querySelector('.p'); if(pp) pp.innerHTML=bkLogo('lo3',1); } if(hf) hf.style.transform='translateX(-50%) scale('+(1+Math.max(0,M3.cam-(HQ-9))*0.06).toFixed(3)+')';
  pl.querySelectorAll('.m3n').forEach(n=>{ const k=+n.dataset.d-M3.cam; const vis=k>-1.8 && k<7.2;
    n.style.display=vis?'':'none'; if(vis) n.style.opacity=k>5.6?String(Math.max(0,(7.2-k)/1.6).toFixed(2)):''; });
}
(function(){ const sc=$('r3'); if(!sc) return; let y0=0,c0=0,on=false,lastY=0,lastT=0,v=0;
  sc.addEventListener('touchstart',e=>{ const t=e.touches[0]; y0=lastY=t.clientY; lastT=performance.now(); c0=M3.cam; on=true; v=0; },{passive:true});
  sc.addEventListener('touchmove',e=>{ if(!on) return; const t=e.touches[0], dy=t.clientY-y0; if(Math.abs(dy)<6) return; if(e.cancelable) e.preventDefault();
    const n=performance.now(); v=(t.clientY-lastY)/Math.max(1,n-lastT); lastY=t.clientY; lastT=n; m3Cam(c0+dy/150,false); },{passive:false});
  sc.addEventListener('touchend',()=>{ if(!on) return; on=false; if(Math.abs(v)>0.4) m3Cam(M3.cam+v*2.2,true); },{passive:true});
  sc.addEventListener('wheel',e=>{ e.preventDefault(); m3Cam(M3.cam-e.deltaY/300,false); },{passive:false});
})();
function renderMap(scroll){
  const st=rdSt(), pos=Math.min(st.pos,HQ+1), arrived=!!st.arrived;
  m3Build();
  if(scroll || !M3.built) m3Cam(Math.min(pos,HQ),false); else m3Cam(M3.cam,false);
  const av=null;
  const cg=govOf(Math.min(pos,HQ));
  // HUD
  const g=cg, G0=GOV[g], inG=Math.max(0,Math.min(pos,G0.b+1)-G0.a), nG=G0.b-G0.a+1;
  $('rpSt').textContent=st.streak||0; $('rpSh').textContent=st.shields||0; $('rpK').textContent=st.keys||0;
  $('rpT').textContent=arrived?'أنهيت الرحلة':'الفصل '+(g+1)+' من 6';
  $('rpN').textContent=arrived?'وصلت الفرع الرئيسي 🏁':'محافظة '+G0.n;
  $('rpC').innerHTML=(arrived?nG:inG)+'<span style="font-size:13px;color:#9da1a8">/'+nG+'</span>';
  $('rpBar').style.width=Math.round((arrived?1:inG/nG)*100)+'%';
  const left=HQ-Math.min(pos,HQ);
  $('rpLeft').textContent= arrived ? '🏁 ترتيبك #'+(st.rank||1)+' بين الواصلين' : '🏁 باقي '+left+' فرع للرئيسي';
  $('rpStars').textContent='⭐ '+starSum(st)+' / '+(HQ+1)*3;
  // ahead
  const ah=st.ahead||[];
  $('rpAhead').textContent = !rdLoggedIn() ? '' : ah.length ? '👀 '+ah.map(a=>a.n).slice(0,2).join(' و')+(st.ahead_n>2?' و'+(st.ahead_n-2)+' غيرهم':'')+' قدامك في الطريق'
    : (st.ahead_n ? '👀 '+st.ahead_n+' زميل قدامك في الطريق' : (pos>0 && !arrived ? '👑 أنت في المقدمة!' : ''));
  // CTA
  const go=$('rpGo'), sub=$('rpSub'); go.classList.remove('gray');
  if(!rdLoggedIn()){ go.innerHTML='سجّل دخولك وابدأ الرحلة<small>من الخيران إلى الفرع الرئيسي</small>'; sub.textContent=''; }
  else if(arrived){ go.classList.add('gray'); go.innerHTML='تدريب<small>رحلتك خلصت، والتدريب يجمع لك مفاتيح 🔑</small>'; sub.textContent='الموسم الجاي يبدأ الكل من جديد'; }
  else if(pointsAvailable()){ go.innerHTML='العب: فرع '+ROUTE[pos]+'<small>فز في تحدي اليوم وتقدّم فرع للأمام 🚗</small>'; sub.textContent=(st.streak? '🔥 العب اليوم عشان ما تنكسر سلسلة '+st.streak+' أيام' : 'التحدي اليومي مرة وحدة باليوم'); }
  else { go.classList.add('gray'); const need=3-((st.practice||0)%3); go.innerHTML='تدريب 🔑<small>باقي '+need+' '+(need===1?'تدريب':'تدريبات')+' وتاخذ مفتاح مول</small>'; sub.textContent='لعبت تحدي اليوم ✓ ارجع بكرة عشان تتقدم فرع'; }
}
$('rpGo').onclick=()=>{ RD.back='map'; RD.mall=null; startMatch(); };

function mallTap(k){
  const st=rdSt(), m=MALLS[k];
  if((st.malls||[]).indexOf(k)>=0){ toast('خلّصت محطة '+m.n+' ✓'); return; }
  if(!rdLoggedIn()){ toast('سجّل دخولك أول'); return; }
  if(st.pos<=m.at){ toast('🔒 تنفتح لك بعد ما تعدّي فرع '+ROUTE[m.at]); return; }
  const keys=st.keys||0;
  showModal('⚡ محطة '+m.n,
    '<div style="line-height:1.9">تحدي سرعة ضد الجهاز.<br>الدخول يكلّف <b>🔑 مفتاح واحد</b> (عندك '+keys+').<br>الفوز = <b>🛡️ درع</b> يحمي سلسلتك + <b>100 نقطة</b>.'+(keys?'':'<br><span style="color:var(--accent)">ما عندك مفاتيح. كل 3 تدريبات = مفتاح.</span>')+'</div>',
    keys ? [{t:'ادخل المحطة',full:true,f:()=>{ closeModal(); startMall(k); }},{t:'لاحقاً',ghost:true,full:true,f:closeModal}]
         : [{t:'تدرّب واجمع مفاتيح',full:true,f:()=>{ closeModal(); RD.back='map'; RD.mall=null; startMatch(); }},{t:'إغلاق',ghost:true,full:true,f:closeModal}]);
}
async function startMall(k){
  if(DEMO){ toast('المحطات تشتغل بعد تسجيل الدخول'); return; }
  const r=await rpc('mall_start',{p_id:PID,p_mall:k},6000);
  if(!r || !r.ok){ toast(r && r.error==='nokey' ? 'ما عندك مفاتيح 🔑' : r && r.error==='locked' ? 'المحطة لسه مقفلة' : 'تعذّر الدخول، حاول مرة ثانية'); roadLoad(); return; }
  if(RD.st) RD.st.keys=r.keys;
  RD.mall=MALLS[k]; RD.back='map';
  audio(); const tok=++matchTok; PV=null; window._viaInv=false;
  bot={name:'', skill:Math.min(.9, botSkill()+.05)};
  showFound(MALLS[k].n, false, tok);
}

function rfxClose(){ $('rfx').classList.remove('on'); }
function roadResult(r){
  const st=rdSt();
  if(r.key) setTimeout(()=>toast('🔑 حصلت مفتاح مول جديد!'),900);
  if(r.shield_used) setTimeout(()=>toast('🛡️ الدرع حمى سلسلة أيامك'),900);
  if(r.mall){ const m=MALLS[r.mall.idx]||{n:'المحطة'};
    if(!r.mall.won){ setTimeout(()=>toast('ما فزت في محطة '+m.n+'. جرّب مرة ثانية بمفتاح'),900); roadLoad(); return; }
    rfxShow('<div class="k">⚡ محطة '+m.n+'</div><h2>اجتزت المحطة!</h2>'
      +'<div class="chest"><div class="ic">🛡️</div><div><b>درع + 100 نقطة</b><small>الدرع يحمي سلسلة أيامك لو فاتك يوم</small></div></div>');
    roadLoad(); return; }
  if(!r.advanced){ roadLoad(); return; }
  const from=r.from, to=r.to, s=r.stars||1;
  let nextEnd=GOV.find(g=>g.b>=to); nextEnd=nextEnd?nextEnd.b:HQ;
  let h='<div class="k">فزت في فرع '+ROUTE[from]+'!</div><h2>'+(r.arrived?'وصلت الرئيسي! 🏁':'تقدّمت فرع! 🚗')+'</h2>'
    +'<div class="s3">'+[1,2,3].map((n,j)=>'<span class="'+(j===1?'mid ':'')+(n<=s?'':'off')+'" style="animation-delay:'+(.25+j*.22)+'s">⭐</span>').join('')+'</div>'
    +'<div class="hint">'+(s<3?'جاوب أسرع واجمع نقاط أكثر عشان تاخذ 3 نجوم':'أداء كامل! 3 نجوم')+'</div>';
  if(!r.arrived){
    h+='<div class="mv"><div class="mini"><i class="a"></i>'+ROUTE[from]+'</div><div class="arr"></div><div class="mini"><i class="b"></i>'+ROUTE[to]+'</div>'
      +(nextEnd>to?'<div class="arr dim"></div><div class="mini" style="color:#ffc23d"><i class="c">'+(nextEnd===HQ?'🏁':'🎁')+'</i>'+(nextEnd===HQ?'الرئيسي':'الصندوق')+'</div>':'')+'</div>';
  }
  const stars=starSum(st)+((st.stars||[])[from]?0:s);
  h+='<div class="grid"><div><b>🔥 '+(r.streak||st.streak||1)+'</b>أيام متتالية</div><div><b>'+(HQ-Math.min(to,HQ))+'</b>فرع للرئيسي</div><div><b>⭐ '+stars+'</b>نجومك</div></div>';
  if(r.chest){ const c=r.chest, kinds={jackpot:['🎰','الجائزة الكبرى! +'+fmt(c.pts)+' نقطة','نادرة جداً، مبروك!'],shield:['🛡️','درع + '+c.pts+' نقطة','الدرع يحمي سلسلتك لو فاتك يوم'],big:['💰','+'+c.pts+' نقطة','صندوق محافظة '+GOV[govOf(from)].n],small:['🪙','+'+c.pts+' نقطة','صندوق محافظة '+GOV[govOf(from)].n]}, kk=kinds[c.kind]||kinds.small;
    h+='<div class="chest"><div class="ic">'+kk[0]+'</div><div><small>🎁 فتحت صندوق المحافظة</small><b>'+kk[1]+'</b><small>'+kk[2]+'</small></div></div>'; }
  if(r.arrived) h+='<div class="chest"><div class="ic">🏆</div><div><b>ترتيبك #'+(r.rank||1)+' بين الواصلين</b><small>خلّصت رحلتك من الخيران إلى الفرع الرئيسي</small></div></div>';
  const opened=MALLS.find(m=>m.at===from), soon=MALLS.find(m=>m.at>=to && m.at-to<=2 && (st.malls||[]).indexOf(MALLS.indexOf(m))<0);
  if(opened) h+='<div class="note">🛍️ <span>انفتحت لك محطة <b style="color:#d6b8ff">'+opened.n+'</b>! ادخلها بمفتاح وخذ درع 🛡️</span></div>';
  else if(soon) h+='<div class="note">🛍️ <span><b style="color:#d6b8ff">'+soon.n+'</b> تنفتح لك بعد '+(soon.at-to+1)+' '+(soon.at-to+1===1?'فرع':'فروع')+'</span></div>';
  if(RD.st){ RD.st.pos=to; RD.st.stars=(RD.st.stars||[]).slice(); RD.st.stars[from]=s; if(r.streak) RD.st.streak=r.streak; }
  setTimeout(()=>{ rfxShow(h); try{ FXV.confetti(); }catch(e){} }, 1100);
  roadLoad();
}
function rfxShow(h){
  $('rfxIn').innerHTML=h+'<button class="gold" id="rfxGo" type="button">كمّل الطريق</button><button class="ghost" id="rfxX" type="button">رجوع للنتيجة</button>';
  $('rfx').classList.add('on'); try{ SND.badge(); }catch(e){}
  $('rfxGo').onclick=()=>{ rfxClose(); RD.back=null; openRoad(); };
  $('rfxX').onclick=rfxClose;
}
/* شارة "نسخة الطريق" في العنوان */
try{ const t=document.querySelector('#home .ttl h1'); if(t) t.insertAdjacentHTML('beforeend','<span class="rtag">الطريق</span>'); }catch(e){}
setTimeout(roadLoad, 700);
document.addEventListener('visibilitychange',()=>{ if(!document.hidden) roadLoad(); });
/* ملفي: أيقونتا الشارات والنقاط تحت الصورة */
(function(){
  const card=document.querySelector('#profilePage .pfcard'); if(!card) return;
  card.insertAdjacentHTML('afterend','<div class="pftiles">'
   +'<button type="button" class="pftile b" id="pfTB"><span class="ic"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="6"/><path d="M15.5 12.9L17 22l-5-3-5 3 1.5-9.1"/></svg></span><b>شاراتي</b><small id="pfTBn">0 من 25</small></button>'
   +'<button type="button" class="pftile p" id="pfTP"><span class="ic"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M5 12v9h14v-9M12 8S10 3 7.5 4.5 9 8 12 8zM12 8s2-5 4.5-3.5S15 8 12 8z"/></svg></span><b>استبدل نقاطك</b><small id="pfTPn">0 نقطة</small></button></div>');
  $('pfTB').onclick=()=>$('badgesBtn').click();
  $('pfTP').onclick=()=>$('pfStore').click();
})();
function pfTiles(){ try{ $('pfTBn').textContent=$('bcHead').textContent+' من '+$('bcTotal').textContent; $('pfTPn').textContent=fmt(stats.balance)+' نقطة'; }catch(e){} }
(function(){ const c=$('r3City'); if(!c) return; let h='', r=7; const rnd=()=>{ r=(r*9301+49297)%233280; return r/233280; };
  for(let i=0;i<36;i++){ h+='<i style="width:'+(6+rnd()*12).toFixed(0)+'px;height:'+(10+rnd()*40).toFixed(0)+'px"></i>'; } c.innerHTML=h; })();
