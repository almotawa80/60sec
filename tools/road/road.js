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

function renderMap(scroll){
  const st=rdSt(), map=$('rpMap'), W=Math.min(map.clientWidth||390,420), pos=Math.min(st.pos,HQ+1), arrived=!!st.arrived;
  const Y=[], X=[], B=[]; let y=70;
  for(let g=GOV.length-1; g>=0; g--){ for(let i=GOV[g].b;i>=GOV[g].a;i--){ Y[i]=y; X[i]=W/2+Math.sin(i*1.05+.4)*W*.27; y+=114; } B.push({g:g,y:y-40}); y+=34; }
  const H=y+170; map.style.height=H+'px';
  const pts=[[X[0],Y[0]+130]].concat(ROUTE.map((_,i)=>[X[i],Y[i]]));
  const cut=Math.min(pos,HQ)+2;
  let h='<svg class="road" width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'"><defs><linearGradient id="rdG" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#e0262f"/><stop offset="1" stop-color="#ffc23d"/></linearGradient></defs>'
    +'<path d="'+crPath(pts)+'" fill="none" stroke="#24252a" stroke-width="24" stroke-linecap="round"/>'
    +'<path d="'+crPath(pts)+'" fill="none" stroke="#3b3c42" stroke-width="3" stroke-dasharray="2 12" stroke-linecap="round"/>'
    +(pos>0?'<path d="'+crPath(pts.slice(0,cut))+'" fill="none" stroke="url(#rdG)" stroke-width="8" stroke-linecap="round"/>':'')+'</svg>';
  const cg=govOf(Math.min(pos,HQ));
  B.forEach(b=>{ h+='<div class="rgov'+(b.g===cg?' on':'')+'" style="top:'+b.y+'px">محافظة '+GOV[b.g].n+'</div>'; });
  ROUTE.forEach((nm,i)=>{
    const done=i<pos, cur=(i===pos && !arrived), hq=i===HQ;
    let cls='rn '+(done?'done':cur?'cur':'lock')+(hq?' hq':''), inner;
    if(cur){ inner='<div class="av" id="rpAv"></div>'; }
    else if(hq){ inner='🏦'; }
    else inner=String(i+1);
    const s=(st.stars||[])[i]||0;
    h+='<div class="'+cls+'" style="left:'+X[i].toFixed(1)+'px;top:'+Y[i]+'px">'
      +(cur?'<div class="go">أنت هنا</div>':'')
      +(done && s && !hq?'<div class="st">'+'⭐'.repeat(s)+'</div>':'')
      +'<div class="dot">'+inner+'</div><div class="lbl">'+(hq?'الفرع الرئيسي 🏁':nm)+'</div>'
      +(isGovEnd(i) && !hq?'<div class="cb'+(done?'':' shut')+'">'+(done?'📭':'🎁')+'</div>':'')
      +'</div>';
  });
  MALLS.forEach((m,k)=>{
    const won=(st.malls||[]).indexOf(k)>=0, open=!won && pos>m.at;
    const mx = X[m.at] > W/2 ? W*.15 : W*.85, my=Y[m.at]-52;
    h+='<button type="button" class="rmall '+(won?'won':open?'open':'off')+'" data-k="'+k+'" style="left:'+mx.toFixed(1)+'px;top:'+my+'px"><div class="b">'+(won?'✓':'🛍️')+'</div><div class="lbl">'+m.n+(open?' ⚡':'')+'</div></button>';
  });
  map.innerHTML=h;
  const av=$('rpAv'); if(av) setAv(av, stats.avatar, avInit());
  map.querySelectorAll('.rmall').forEach(b=>b.onclick=()=>mallTap(+b.dataset.k));
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
  if(scroll){ const sc=$('roadPage'); const ty=Y[Math.min(pos,HQ)]; requestAnimationFrame(()=>{ const top=map.getBoundingClientRect().top+window.scrollY; window.scrollTo(0, Math.max(0, top+ty-window.innerHeight*.5)); }); }
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
