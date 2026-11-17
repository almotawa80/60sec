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

function openRoad(){ const dv=RD.drive; RD.drive=null; renderMap(true); show('roadPage'); setTimeout(()=>{ renderMap(true); if(dv) m2Drive(dv.from,dv.to); else m2Intro(); },30); }
function m2Intro(){ let seen=false; try{ seen=!!localStorage.getItem('rd_mapIntro'); }catch(e){}
  if(seen) return; try{ localStorage.setItem('rd_mapIntro','1'); }catch(e){}
  const box=$('r2'); if(!box) return; const st=rdSt(), pos=Math.min(st.pos,HQ);
  const yEnd=Math.max(0,m2y(pos)-box.clientHeight*0.55); box.scrollTop=0; let stop=false;
  const cancel=()=>{ stop=true; }; box.addEventListener('touchstart',cancel,{once:true,passive:true}); box.addEventListener('wheel',cancel,{once:true,passive:true});
  const t0=performance.now()+1200, dur=Math.min(7000,2500+yEnd*0.6);
  const step=n=>{ if(stop) return; const k=Math.max(0,Math.min(1,(n-t0)/dur)), e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2; box.scrollTop=yEnd*e; if(k<1) requestAnimationFrame(step); };
  requestAnimationFrame(step); }
function m3Drive(from,to){
  const car=document.querySelector('#r3Plane .m3n.car'); if(!car) return;
  const put=t=>{ car.style.left=m3x(t-0.45).toFixed(1)+'px'; car.style.top=m3y(t-0.45).toFixed(1)+'px'; m3Cam(t,false); };
  put(from); const c=car.querySelector('.m3car'); if(c) c.classList.add('driving');
  const t0=performance.now()+500, dur=1800;
  const step=n=>{ const k=Math.max(0,Math.min(1,(n-t0)/dur)), e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2; put(from+(to-from)*e);
    if(k<1) requestAnimationFrame(step); else if(c) setTimeout(()=>c.classList.remove('driving'),300); };
  requestAnimationFrame(step);
}
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
   +'<path d="'+d+'" fill="none" stroke="#ffc23d" stroke-width="6" stroke-dasharray="40 34"/></svg>';
  const bb=(x,y,inner,cls,attr)=>'<div class="m3n'+(cls?' '+cls:'')+'" data-d="'+((M3.BASE-y)/S).toFixed(2)+'" style="left:'+x.toFixed(0)+'px;top:'+y.toFixed(0)+'px"'+(attr||'')+'><div class="m3b">'+inner+'</div></div>';
  GOV.forEach((g,gi)=>{ const y=m3y(g.a)+S*0.5, x=(m3x(g.a)+m3x(g.a-1))/2, c=GCOL[gi];
    h+=bb(x,y,'<div class="m3gate" style="--c:'+c[0]+';--c2:'+c[1]+'"><span>محافظة '+g.n+'</span></div>','gate'); });
  ROUTE.forEach((nm,i)=>{
    const x=m3x(i), y=m3y(i), done=i<pos, cur=(i===pos && !arrived), hq=i===HQ, cls=done?'done':cur?'cur':'lock', c=GCOL[govOf(i)], side=(i%2?1:-1), s=(st.stars||[])[i]||0;
    h+=bb(x,y,'<div class="m3pad">'+(done?'✓':cur?((rdLoggedIn()&&!pointsAvailable())?'⏳':'▶'):hq?'🏁':'🔒')+'</div>',cls+' pad','data-i="'+i+'"');
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
/* الخريطة 2D: مراحل مثل ألعاب الجوال، والسيف على النقطة الحالية */
const M2={PT:190, STEP:132, TOP:470, BOT:330, W:390, built:false};
const M2SWORD='<svg viewBox="-1 -1 34 34" width="40" height="40" aria-hidden="true"><g transform="rotate(40 16 16) translate(0 .5)"><path d="M16 -1 L18.3 3 V19.6 H13.7 V3 Z" fill="#eef3f8" stroke="#5b6b80" stroke-width=".8"/><path d="M16 2 V18.6" stroke="#9aa8b8" stroke-width=".8"/><rect x="9.4" y="19.2" width="13.2" height="3" rx="1.5" fill="#f2b63a" stroke="#8a5a12" stroke-width=".6"/><rect x="14.8" y="21.8" width="2.4" height="5.6" rx=".7" fill="#7a3f18"/><circle cx="16" cy="29.2" r="2.1" fill="#f2b63a" stroke="#8a5a12" stroke-width=".6"/></g></svg>';
const M2ART={"h":9.8114,"s":[[0.4553,9.599],[0.6555,9.3563],[0.5422,9.1112],[0.4487,8.8963],[0.5728,8.6591],[0.6105,8.4563],[0.5574,8.25],[0.4314,8.0422],[0.5187,7.7021],[0.5272,7.434],[0.6411,7.1432],[0.3713,6.9494],[0.6383,6.6945],[0.3838,6.4545],[0.469,6.2406],[0.3755,6.0311],[0.4971,5.7154],[0.4769,5.3841],[0.3465,5.0977],[0.5875,4.937],[0.4051,4.6989],[0.6128,4.4679],[0.4266,4.2861],[0.449,4.0199],[0.6331,3.7866],[0.522,3.5309],[0.4676,3.2922],[0.5157,3.0599],[0.453,2.8716],[0.5494,2.6526],[0.441,2.447],[0.5042,2.1121],[0.5256,1.8356],[0.6238,1.5463],[0.3849,1.3811],[0.6225,1.1414],[0.3849,0.9133],[0.6039,0.7322],[0.4133,0.5287],[0.4363,0.3194]],"p":[[0.5042,9.8089],[0.4912,9.7796],[0.4811,9.7486],[0.4737,9.7172],[0.469,9.6849],[0.4665,9.6521],[0.4668,9.6201],[0.4586,9.6105],[0.4553,9.599],[0.474,9.5783],[0.4824,9.5473],[0.4945,9.5169],[0.5224,9.5051],[0.5221,9.4981],[0.5168,9.4811],[0.5382,9.4559],[0.5631,9.4338],[0.5893,9.4132],[0.6158,9.3929],[0.6484,9.3867],[0.6361,9.3759],[0.6587,9.3518],[0.6744,9.3234],[0.6806,9.2919],[0.6773,9.2593],[0.6644,9.2299],[0.6434,9.2043],[0.6122,9.1967],[0.6172,9.1861],[0.6033,9.1754],[0.5902,9.168],[0.6133,9.159],[0.5857,9.1427],[0.5595,9.1248],[0.5314,9.1082],[0.4984,9.1027],[0.4942,9.0956],[0.4735,9.0877],[0.4459,9.0703],[0.4166,9.0552],[0.3892,9.0383],[0.3722,9.011],[0.3701,8.9781],[0.3869,8.9548],[0.3892,8.9444],[0.4066,8.9234],[0.4344,8.9048],[0.4633,8.888],[0.4928,8.8722],[0.5225,8.8567],[0.5521,8.8412],[0.5813,8.8248],[0.6087,8.806],[0.6312,8.782],[0.6383,8.7508],[0.6277,8.7208],[0.6094,8.6968],[0.5765,8.6913],[0.5713,8.6817],[0.5698,8.6636],[0.5568,8.6436],[0.529,8.6253],[0.4982,8.6131],[0.4686,8.5991],[0.4708,8.5694],[0.5039,8.5639],[0.493,8.5472],[0.4661,8.5363],[0.4947,8.5253],[0.5206,8.5115],[0.5479,8.4925],[0.5766,8.4753],[0.6058,8.4591],[0.6266,8.4358],[0.6033,8.4219],[0.5703,8.4164],[0.5677,8.4066],[0.5964,8.3895],[0.6219,8.3684],[0.6386,8.3406],[0.6354,8.3084],[0.6152,8.2829],[0.6166,8.2736],[0.5836,8.268],[0.5632,8.2614],[0.5573,8.25],[0.5271,8.2358],[0.4966,8.2218],[0.4662,8.2079],[0.4361,8.1935],[0.4183,8.18],[0.4143,8.173],[0.4028,8.1668],[0.389,8.1563],[0.3655,8.1381],[0.3667,8.1064],[0.3841,8.0795],[0.4089,8.0577],[0.437,8.0412],[0.4417,8.0319],[0.4669,8.0101],[0.4891,7.9857],[0.508,7.9586],[0.5218,7.9295],[0.5327,7.8991],[0.5406,7.8678],[0.5457,7.8354],[0.5482,7.8025],[0.5478,7.7691],[0.5448,7.7364],[0.5394,7.7043],[0.5074,7.7019],[0.4813,7.6917],[0.474,7.6601],[0.469,7.628],[0.4665,7.5951],[0.4681,7.5619],[0.4515,7.5561],[0.4664,7.5479],[0.4691,7.535],[0.4772,7.5049],[0.4874,7.4745],[0.5052,7.4498],[0.5205,7.4415],[0.5145,7.4276],[0.5328,7.403],[0.5569,7.3801],[0.5831,7.3594],[0.6094,7.339],[0.6404,7.3289],[0.6311,7.3219],[0.6541,7.299],[0.671,7.2716],[0.6805,7.2409],[0.6785,7.2081],[0.668,7.1776],[0.6485,7.151],[0.6191,7.1389],[0.5943,7.1295],[0.5876,7.1218],[0.5912,7.1085],[0.5626,7.0912],[0.5343,7.0735],[0.506,7.0557],[0.4826,7.0382],[0.4759,7.029],[0.4477,7.0129],[0.4189,6.9967],[0.3909,6.9812],[0.373,6.9543],[0.3697,6.9219],[0.3848,6.8972],[0.3918,6.8857],[0.4048,6.8664],[0.4323,6.8474],[0.4612,6.8306],[0.4906,6.8146],[0.5203,6.7992],[0.55,6.7839],[0.5792,6.7675],[0.607,6.749],[0.6297,6.7253],[0.6383,6.6943],[0.6284,6.6634],[0.6114,6.6376],[0.5784,6.6321],[0.5695,6.6227],[0.5452,6.6088],[0.515,6.5943],[0.485,6.5795],[0.4548,6.565],[0.4247,6.5506],[0.3959,6.5336],[0.3731,6.5099],[0.3713,6.4781],[0.3877,6.4504],[0.4169,6.4388],[0.4033,6.4298],[0.4061,6.4194],[0.4015,6.4045],[0.4261,6.3837],[0.4551,6.3686],[0.4774,6.35],[0.4629,6.3287],[0.4299,6.3233],[0.4502,6.3134],[0.4656,6.291],[0.4656,6.2575],[0.4584,6.2377],[0.4556,6.208],[0.4245,6.2005],[0.3947,6.1854],[0.3644,6.1713],[0.337,6.1526],[0.3426,6.1277],[0.3628,6.1221],[0.3744,6.1131],[0.4076,6.1085],[0.3862,6.0972],[0.3648,6.0766],[0.3676,6.0449],[0.3868,6.0189],[0.4065,5.9926],[0.4354,5.98],[0.4232,5.9684],[0.4386,5.9494],[0.4631,5.9348],[0.4895,5.9191],[0.5017,5.8898],[0.5067,5.8579],[0.5059,5.8247],[0.5025,5.792],[0.5,5.7591],[0.4979,5.726],[0.4975,5.6928],[0.4987,5.6596],[0.5161,5.6408],[0.5247,5.6096],[0.5298,5.5775],[0.5331,5.5449],[0.5327,5.5116],[0.5378,5.4861],[0.5393,5.4781],[0.5251,5.4549],[0.5159,5.4238],[0.5028,5.3938],[0.4728,5.3861],[0.4734,5.3768],[0.4794,5.3587],[0.4574,5.334],[0.4321,5.3124],[0.4056,5.2922],[0.3786,5.2734],[0.3744,5.2675],[0.3501,5.245],[0.3315,5.2183],[0.3202,5.1886],[0.3206,5.156],[0.3291,5.1248],[0.3468,5.0975],[0.374,5.0815],[0.4009,5.0745],[0.392,5.0698],[0.4066,5.0651],[0.416,5.0566],[0.4286,5.0511],[0.4245,5.0401],[0.453,5.0227],[0.4814,5.0051],[0.5096,4.9874],[0.5356,4.9669],[0.5625,4.9472],[0.5933,4.9359],[0.6172,4.9132],[0.6299,4.8837],[0.6282,4.8515],[0.6085,4.8323],[0.5922,4.8229],[0.5977,4.8098],[0.5706,4.7903],[0.5416,4.7737],[0.5123,4.7576],[0.4827,4.742],[0.4531,4.7265],[0.4237,4.7105],[0.3958,4.6921],[0.372,4.6692],[0.3617,4.6393],[0.3699,4.6079],[0.3868,4.5811],[0.4188,4.5747],[0.4335,4.5653],[0.4504,4.5524],[0.4804,4.5375],[0.5106,4.5232],[0.5407,4.5087],[0.5707,4.4941],[0.5999,4.4777],[0.6243,4.4556],[0.6191,4.4411],[0.6285,4.4179],[0.6112,4.3904],[0.5807,4.38],[0.5612,4.3737],[0.5759,4.3681],[0.5503,4.3624],[0.5551,4.3521],[0.5254,4.3366],[0.4957,4.3214],[0.4659,4.3063],[0.4361,4.2912],[0.4071,4.2744],[0.381,4.254],[0.3626,4.2273],[0.363,4.1951],[0.3815,4.1683],[0.4148,4.1674],[0.4483,4.1671],[0.4818,4.1668],[0.4769,4.1383],[0.4704,4.1066],[0.467,4.0739],[0.4669,4.0406],[0.4489,4.0243],[0.4651,4.0127],[0.4704,4.0001],[0.4778,3.969],[0.4875,3.9387],[0.505,3.9151],[0.5211,3.9068],[0.5153,3.8929],[0.5322,3.8689],[0.5563,3.8459],[0.5824,3.8252],[0.6089,3.8049],[0.6398,3.7949],[0.6327,3.7865],[0.6542,3.7636],[0.6713,3.7361],[0.6805,3.7053],[0.6785,3.6723],[0.6678,3.6424],[0.6483,3.616],[0.6187,3.6041],[0.5945,3.5947],[0.5812,3.5818],[0.5681,3.5736],[0.5735,3.5631],[0.5451,3.5454],[0.5169,3.5276],[0.4885,3.5101],[0.4897,3.4974],[0.4583,3.4878],[0.4319,3.4676],[0.4016,3.4558],[0.379,3.432],[0.3696,3.4015],[0.374,3.3693],[0.4015,3.3572],[0.3941,3.3409],[0.42,3.3204],[0.4486,3.3029],[0.4778,3.2867],[0.5073,3.2709],[0.5371,3.2557],[0.5665,3.2398],[0.5952,3.2226],[0.6209,3.2018],[0.637,3.1739],[0.6354,3.1416],[0.6165,3.1153],[0.5931,3.1006],[0.5609,3.0936],[0.5603,3.0817],[0.5304,3.0667],[0.5002,3.0523],[0.4701,3.0376],[0.4399,3.0232],[0.4102,3.0079],[0.3836,2.9879],[0.3881,2.9719],[0.3697,2.954],[0.3806,2.9237],[0.407,2.906],[0.4401,2.9007],[0.4211,2.8941],[0.4532,2.8874],[0.4436,2.8766],[0.4733,2.8612],[0.5031,2.8459],[0.533,2.8309],[0.5627,2.8157],[0.5918,2.7992],[0.618,2.7791],[0.637,2.7527],[0.6375,2.7204],[0.6194,2.6934],[0.6132,2.6804],[0.5802,2.6749],[0.5663,2.6674],[0.5539,2.6548],[0.5236,2.6407],[0.4932,2.6267],[0.4628,2.6128],[0.4326,2.5984],[0.4221,2.5859],[0.4105,2.5788],[0.406,2.573],[0.3861,2.5618],[0.3646,2.5414],[0.3677,2.5094],[0.3872,2.4828],[0.4126,2.4614],[0.4415,2.4469],[0.4464,2.4341],[0.4716,2.4123],[0.4934,2.3876],[0.5087,2.3589],[0.5122,2.3266],[0.5071,2.2943],[0.4992,2.2628],[0.4929,2.2315],[0.4908,2.1986],[0.4954,2.1662],[0.5053,2.1358],[0.4828,2.1213],[0.5103,2.1111],[0.4962,2.1084],[0.4785,2.0878],[0.4719,2.0562],[0.4677,2.0238],[0.4665,1.9906],[0.4692,1.9577],[0.4617,1.9479],[0.4728,1.9335],[0.4795,1.9018],[0.4914,1.8714],[0.5151,1.8539],[0.5146,1.8472],[0.5139,1.8341],[0.5331,1.8093],[0.5571,1.7862],[0.5833,1.7657],[0.6096,1.7453],[0.6342,1.7354],[0.6402,1.7198],[0.6617,1.695],[0.6763,1.6665],[0.6806,1.6347],[0.676,1.6026],[0.6612,1.5736],[0.6397,1.549],[0.6102,1.543],[0.5943,1.5373],[0.6015,1.5318],[0.5855,1.5249],[0.5848,1.5186],[0.5872,1.5127],[0.5588,1.4952],[0.5304,1.4775],[0.5022,1.4598],[0.4752,1.4407],[0.4489,1.4203],[0.4204,1.4035],[0.3917,1.3888],[0.3734,1.3619],[0.3697,1.33],[0.3778,1.2998],[0.4109,1.2947],[0.3924,1.2844],[0.4177,1.263],[0.4463,1.2456],[0.4755,1.2294],[0.5049,1.2135],[0.5347,1.1981],[0.5642,1.1824],[0.593,1.1654],[0.6192,1.1449],[0.6362,1.1177],[0.6358,1.0855],[0.6179,1.0582],[0.595,1.0422],[0.5623,1.0363],[0.562,1.0238],[0.532,1.009],[0.5019,0.9945],[0.4719,0.9797],[0.4417,0.9653],[0.4119,0.9501],[0.3849,0.9308],[0.3856,0.9132],[0.3697,0.8964],[0.38,0.8661],[0.4056,0.8475],[0.4387,0.8421],[0.4194,0.8357],[0.4435,0.8301],[0.4329,0.824],[0.4622,0.8081],[0.4919,0.7928],[0.5218,0.7779],[0.5516,0.7628],[0.581,0.7468],[0.6087,0.7283],[0.6315,0.7044],[0.6396,0.6735],[0.6278,0.6436],[0.6293,0.6279],[0.6007,0.6196],[0.5777,0.6141],[0.5694,0.6082],[0.551,0.5949],[0.5207,0.5807],[0.4904,0.5667],[0.46,0.5528],[0.4299,0.5381],[0.425,0.5267],[0.4084,0.52],[0.4079,0.5141],[0.3841,0.5034],[0.364,0.4808],[0.3686,0.4487],[0.3886,0.4228],[0.4139,0.4013],[0.434,0.3873],[0.4442,0.3773],[0.4499,0.3611],[0.4225,0.3495],[0.4364,0.3353],[0.4363,0.3194]]};
const m2P=i=>{ const k=Math.max(0,Math.min(HQ,i)), a=Math.floor(k), b=Math.min(HQ,a+1), f=k-a, A=M2ART.s[a], B=M2ART.s[b]; return [(A[0]+(B[0]-A[0])*f)*M2.W,(A[1]+(B[1]-A[1])*f)*M2.W+M2.PT]; };
const m2x=i=>m2P(i)[0];
const m2y=i=>m2P(i)[1];
const m2Near=i=>{ const S=M2ART.s[i]; let best=0,bd=1e9; M2ART.p.forEach((q,j)=>{ const d=(q[0]-S[0])**2+(q[1]-S[1])**2; if(d<bd){bd=d;best=j;} }); return best; };
const OL='#3b2614';
function m2Tree(x,y,s,k){ const c=[['#6cc24a','#4e9d33','#8fd86a'],['#5bb843','#3f8f2c','#86d35f'],['#78c850','#579f37','#a2e07a']][k%3];
  return '<g transform="translate('+x.toFixed(0)+' '+y.toFixed(0)+') scale('+s+')"><ellipse cx="0" cy="30" rx="24" ry="7" fill="#2f6b1f" opacity=".25"/>'
   +'<path d="M-4 30 L-3 8 L3 8 L4 30 Z" fill="#6b3d1f" stroke="'+OL+'" stroke-width="2"/>'
   +'<path d="M-22 6 Q-30 -8 -18 -16 Q-20 -32 -2 -32 Q8 -42 20 -30 Q34 -26 28 -10 Q34 6 18 10 Q6 18 -8 12 Q-22 16 -22 6 Z" fill="'+c[0]+'" stroke="'+OL+'" stroke-width="2.4"/>'
   +'<path d="M-14 -2 Q-18 -12 -8 -16 Q-6 -26 6 -24" fill="none" stroke="'+c[2]+'" stroke-width="4" stroke-linecap="round" opacity=".9"/>'
   +'<path d="M-10 10 Q6 14 22 4" fill="none" stroke="'+c[1]+'" stroke-width="5" stroke-linecap="round" opacity=".8"/></g>'; }
function m2Pine(x,y,s){ const t=(yy,w,h)=>'<path d="M0 '+(yy-h)+' Q'+(w*0.5)+' '+(yy-h*0.4)+' '+w+' '+yy+' Q0 '+(yy+5)+' '+(-w)+' '+yy+' Q'+(-w*0.5)+' '+(yy-h*0.4)+' 0 '+(yy-h)+' Z" fill="#46a64a" stroke="'+OL+'" stroke-width="2.2"/><path d="M0 '+(yy-h)+' Q'+(w*0.5)+' '+(yy-h*0.4)+' '+w+' '+yy+' Q'+(w*0.4)+' '+(yy+3)+' 0 '+(yy+3)+' Z" fill="#2f8a3b"/>';
  return '<g transform="translate('+x.toFixed(0)+' '+y.toFixed(0)+') scale('+s+')"><ellipse cx="0" cy="30" rx="18" ry="5" fill="#2f6b1f" opacity=".25"/><rect x="-4" y="16" width="8" height="14" rx="1.5" fill="#5a2e14" stroke="'+OL+'" stroke-width="2"/>'
   +t(18,22,22)+t(2,18,22)+t(-14,13,22)+'</g>'; }
function m2Palm(x,y,s){ return '<g transform="translate('+x.toFixed(0)+' '+y.toFixed(0)+') scale('+s+')"><ellipse cx="2" cy="28" rx="16" ry="5" fill="#2f6b1f" opacity=".25"/>'
   +'<path d="M-3 28 Q-1 6 4 -10 L9 -10 Q5 8 4 28 Z" fill="#a8743f" stroke="'+OL+'" stroke-width="2"/>'
   +'<path d="M0 20 h5 M1 12 h5 M2 4 h5 M3 -4 h5" stroke="'+OL+'" stroke-width="1.2" opacity=".6"/>'
   +'<g fill="#49b043" stroke="'+OL+'" stroke-width="2" stroke-linejoin="round"><path d="M6 -11 Q-14 -22 -28 -6 Q-12 -12 6 -11Z"/><path d="M6 -11 Q26 -24 36 -6 Q20 -14 6 -11Z"/><path d="M6 -11 Q-6 -34 -20 -32 Q-4 -24 6 -11Z"/><path d="M6 -11 Q16 -36 30 -30 Q14 -24 6 -11Z"/></g>'
   +'<circle cx="4" cy="-9" r="3" fill="#7a4a24" stroke="'+OL+'" stroke-width="1.2"/></g>'; }
function m2Rock(x,y,s){ return '<g transform="translate('+x.toFixed(0)+' '+y.toFixed(0)+') scale('+s+')"><ellipse cx="0" cy="10" rx="18" ry="4" fill="#2f6b1f" opacity=".2"/><path d="M-16 9 L-12 -6 L1 -14 L14 -5 L17 9 Z" fill="#f1efe8" stroke="'+OL+'" stroke-width="2" stroke-linejoin="round"/><path d="M1 -14 L14 -5 L17 9 L5 9 Z" fill="#d3cfc4"/><path d="M-16 9 L-12 -6 L1 -14 L14 -5 L17 9 Z" fill="none" stroke="'+OL+'" stroke-width="2" stroke-linejoin="round"/></g>'; }
function m2Flower(x,y){ return '<g transform="translate('+x.toFixed(0)+' '+y.toFixed(0)+')"><g fill="#fff" stroke="#c98f8f" stroke-width=".8"><circle cx="0" cy="-4" r="3.2"/><circle cx="4" cy="0" r="3.2"/><circle cx="0" cy="4" r="3.2"/><circle cx="-4" cy="0" r="3.2"/></g><circle r="2" fill="#f5a623"/></g>'; }
function m2Tuft(x,y){ return '<path transform="translate('+x.toFixed(0)+' '+y.toFixed(0)+')" d="M-6 0 Q-5 -7 -3 -9 Q-2 -4 0 0 Q1 -9 3 -11 Q3 -4 5 0" fill="#7cc348" stroke="#4f8f2c" stroke-width="1.2"/>'; }
function m2Cone(x,y,s,k){ const c=[['#7cc142','#5a9e2c'],['#5fb04a','#3f8a34'],['#8fcf4a','#6aa933']][k%3];
  return '<g transform="translate('+x.toFixed(0)+' '+y.toFixed(0)+') scale('+s+')"><ellipse cx="0" cy="30" rx="18" ry="5" fill="#2f6b1f" opacity=".25"/>'
   +'<rect x="-4" y="14" width="8" height="16" rx="1.5" fill="#5a2e14" stroke="'+OL+'" stroke-width="2"/>'
   +'<path d="M0 -44 C12 -44 22 -8 22 8 Q22 20 0 20 Q-22 20 -22 8 C-22 -8 -12 -44 0 -44 Z" fill="'+c[0]+'"/>'
   +'<path d="M0 -44 C12 -44 22 -8 22 8 Q22 20 0 20 Z" fill="'+c[1]+'"/>'
   +'<path d="M-10 -20 Q-12 -6 -14 6" stroke="#fff" stroke-opacity=".35" stroke-width="3" fill="none" stroke-linecap="round"/>'
   +'<path d="M0 -44 C12 -44 22 -8 22 8 Q22 20 0 20 Q-22 20 -22 8 C-22 -8 -12 -44 0 -44 Z" fill="none" stroke="'+OL+'" stroke-width="2.4"/></g>'; }
function m2Shroom(x,y,s){ return '<g transform="translate('+x.toFixed(0)+' '+y.toFixed(0)+') scale('+s+')"><ellipse cx="0" cy="8" rx="10" ry="3" fill="#2f6b1f" opacity=".25"/><path d="M-4 8 L-3 0 L3 0 L4 8 Z" fill="#f5ead2" stroke="'+OL+'" stroke-width="1.6"/><path d="M-11 1 Q-11 -11 0 -11 Q11 -11 11 1 Z" fill="#e2322f" stroke="'+OL+'" stroke-width="1.8"/><circle cx="-4" cy="-5" r="2" fill="#fff"/><circle cx="4" cy="-3" r="1.6" fill="#fff"/><circle cx="1" cy="-8" r="1.3" fill="#fff"/></g>'; }
function m2Tower(){ const pth=document.querySelector('svg.bklogo path'), d=pth?pth.getAttribute('d'):'';
  const O='#3b2614'; let g='<svg class="r2tw" viewBox="0 0 130 280" aria-hidden="true"><defs>'
   +'<linearGradient id="twG" x1="0" x2="1"><stop offset="0" stop-color="#bcd6f7"/><stop offset=".45" stop-color="#5b8fd6"/><stop offset="1" stop-color="#2c4f96"/></linearGradient>'
   +'<linearGradient id="twA" x1="0" x2="1"><stop offset="0" stop-color="#ffe9a6"/><stop offset=".5" stop-color="#e2b54e"/><stop offset="1" stop-color="#a87a22"/></linearGradient>'
   +'<pattern id="twF" width="7" height="10" patternUnits="userSpaceOnUse"><rect width="7" height="10" fill="url(#twA)"/><rect x="5" width="2" height="10" fill="#9c6f1c" opacity=".55"/></pattern>'
   +'<clipPath id="twC"><path d="M34 214 L38 40 Q38 34 44 32 L92 14 L96 214 Z"/></clipPath>'
   +'<radialGradient id="twL" cx=".5" cy=".55" r=".5"><stop offset="0" stop-color="#fff6c8" stop-opacity=".9"/><stop offset="1" stop-color="#fff6c8" stop-opacity="0"/></radialGradient></defs>'
   +'<ellipse cx="65" cy="150" rx="70" ry="140" fill="url(#twL)"/>'
   +'<ellipse cx="66" cy="268" rx="62" ry="10" fill="#000" opacity=".22"/>'
   +'<path d="M34 214 L38 40 Q38 34 44 32 L92 14 L96 214 Z" fill="url(#twG)"/>'
   +'<g clip-path="url(#twC)">';
  for(let y=24;y<214;y+=11) g+='<rect x="30" y="'+y+'" width="70" height="1.6" fill="#e9f3ff" opacity=".55"/>';
  for(let x=46;x<96;x+=10) g+='<rect x="'+x+'" y="10" width="1.2" height="210" fill="#21407e" opacity=".35"/>';
  g+='<path d="M44 40 L52 37 L50 210 L42 210 Z" fill="#fff" opacity=".22"/></g>'
   +'<path d="M34 214 L38 40 Q38 34 44 32 L46 31 L42 214 Z" fill="url(#twA)"/>'
   +'<path d="M89 214 L89 16 L92 14 L96 214 Z" fill="url(#twA)"/>'
   +'<path d="M34 214 L38 40 Q38 34 44 32 L92 14 L96 214 Z" fill="none" stroke="'+O+'" stroke-width="3" stroke-linejoin="round"/>'
   +'<g transform="translate(62 30) scale(.0095)"><path d="'+d+'" fill="#e0262f" fill-rule="evenodd" stroke="#fff" stroke-width="160"/></g>'
   +'<path d="M8 214 H122 V266 H8 Z" fill="url(#twF)" stroke="'+O+'" stroke-width="3" stroke-linejoin="round"/>'
   +'<path d="M8 214 H122 V222 H8 Z" fill="#fff1bf" stroke="'+O+'" stroke-width="2"/>'
   +'<path d="M52 266 V240 Q65 230 78 240 V266 Z" fill="#a9c8f0" stroke="'+O+'" stroke-width="2.4"/>'
   +'<g transform="translate(16 232) scale(.0085)"><path d="'+d+'" fill="#e0262f" fill-rule="evenodd"/></g>'
   +'</svg>'; return g; }
function m2Build(){
  const st=rdSt(), pos=Math.min(st.pos,HQ+1), arrived=!!st.arrived;
  const box=$('r2'), inner=$('r2In'); if(!box||!inner) return;
  M2.W=Math.min(480,box.clientWidth||390);
  const H=Math.round(M2ART.h*M2.W)+M2.PT; inner.style.height=H+'px';
  let tp='<svg class="r2top" width="'+M2.W+'" height="'+(M2.PT+40)+'">'; let rr=5; const rn=()=>{ rr=(rr*9301+49297)%233280; return rr/233280; };
  for(let k=0;k<9;k++){ const x=16+rn()*(M2.W-32), y=30+rn()*(M2.PT-30); tp+=(k%3===0?m2Pine(x,y,1):k%3===1?m2Cone(x,y,1,k):m2Tree(x,y,1.1,k)); }
  tp+='</svg>';
  let h=tp+'<div class="r2art" style="top:'+M2.PT+'px">'+[0,1,2,3,4,5,6,7].map(k=>'<img src="img/road/map'+k+'.jpg" alt="" decoding="async"'+'>').join('')+'</div>';
  GOV.forEach((gv,gi)=>{ if(gv.a===0) return; const y=(m2y(gv.a)+m2y(gv.a-1))/2, x=(m2x(gv.a)+m2x(gv.a-1))/2, c=GCOL[gi];
    h+='<div class="r2gov" style="left:'+x.toFixed(0)+'px;top:'+y.toFixed(0)+'px;--c:'+c[0]+';--c2:'+c[1]+'"><span>محافظة '+gv.n+'</span></div>'; });
  h+='<div class="r2gov first" style="left:'+m2x(0).toFixed(0)+'px;top:'+(m2y(0)+70).toFixed(0)+'px;--c:'+GCOL[0][0]+';--c2:'+GCOL[0][1]+'"><span>محافظة '+GOV[0].n+'</span></div>';
  ROUTE.forEach((nm,i)=>{ const x=m2x(i), y=m2y(i), done=i<pos, cur=(i===pos&&!arrived), hq=i===HQ, s=(st.stars||[])[i]||0, c=GCOL[govOf(i)];
    const cls=done?'done':cur?'cur':'lock';
    h+='<button type="button" class="r2n '+cls+(hq?' hq':'')+'" data-i="'+i+'" style="left:'+x.toFixed(0)+'px;top:'+y.toFixed(0)+'px;--c:'+c[0]+';--c2:'+c[1]+'">'
      +(done&&!hq?'<span class="st">'+[1,2,3].map(n=>'<i class="'+(n<=s?'on':'')+'"></i>').join('')+'</span>':'')
      +(hq?'<span class="twr">'+m2Tower()+'</span>':'')+(hq?'':'<span class="pd"><img class="dm" src="img/road/'+(cls==='lock'?'dome_lock':'dome')+'.png" alt="">'+(cur?'':bkLogo('lg',0))+'</span>')
      +'<span class="nm">'+(hq?'🏁 ':'')+nm+'</span></button>';
    if(isGovEnd(i)&&!hq){ const cx=x+(x<M2.W/2?54:-54); h+='<div class="r2chest" style="left:'+cx.toFixed(0)+'px;top:'+(y-4).toFixed(0)+'px">'+(done?'📭':'🎁')+'</div>'; }
  });
  MALLS.forEach((m,k)=>{ const won=(st.malls||[]).indexOf(k)>=0, open=!won && pos>m.at, i=m.at;
    const xm=m2x(i+0.5), mx=Math.max(56,Math.min(M2.W-56,xm+(xm<M2.W/2?118:-118)));
    h+='<button type="button" class="r2mall '+(won?'won':open?'open':'off')+'" data-k="'+k+'" style="left:'+mx.toFixed(0)+'px;top:'+m2y(i+0.5).toFixed(0)+'px"><span class="b">'+(won?'✓':'🛍️')+'</span><span class="l">'+m.n+(open?' ⚡':'')+'</span></button>'; });
  if(!arrived) h+='<div class="r2sw" id="r2Sw" style="left:'+m2x(pos).toFixed(0)+'px;top:'+m2y(pos).toFixed(0)+'px"><div class="sw">'+M2SWORD+'</div></div>';
  inner.innerHTML=h;
  inner.querySelectorAll('.r2mall').forEach(b=>b.onclick=e=>{ e.stopPropagation(); mallTap(+b.dataset.k); });
  inner.querySelectorAll('.r2n').forEach(n=>n.onclick=()=>{ const i=+n.dataset.i, s=(rdSt().stars||[])[i]||0;
    if(i<pos) toast('فرع '+ROUTE[i]+' ✓ '+(s?'⭐'.repeat(s):'')); else if(i===pos && !arrived) $('rpGo').click(); else toast('🔒 فرع '+ROUTE[i]+': باقي '+(i-pos)+' '+((i-pos)===1?'تحدي':'تحديات')); });
  M2.built=true;
}
function m2Scroll(i,smooth){ const box=$('r2'); if(!box) return; const y=m2y(Math.max(0,Math.min(HQ,i)))-box.clientHeight*0.55; box.scrollTo({top:Math.max(0,y),behavior:smooth?'smooth':'auto'}); }
function m2Drive(from,to){ const sw=$('r2Sw'), box=$('r2'); if(!sw||!box) return;
  const a=m2Near(from), b=m2Near(Math.min(HQ,to)), P=M2ART.p;
  const put=t=>{ const f=a+(b-a)*t, j=Math.floor(f), r=f-j, A=P[j], B=P[Math.min(P.length-1,j+1)]; const x=(A[0]+(B[0]-A[0])*r)*M2.W, y=(A[1]+(B[1]-A[1])*r)*M2.W;
    sw.style.left=x.toFixed(1)+'px'; sw.style.top=(y+M2.PT).toFixed(1)+'px'; sw.style.setProperty('--hop',(-Math.sin(Math.PI*((t*3)%1))*26).toFixed(1)+'px'); box.scrollTop=Math.max(0,y-box.clientHeight*0.55); };
  put(0); sw.classList.add('go');
  const t0=performance.now()+500, dur=1500;
  const step=n=>{ const k=Math.max(0,Math.min(1,(n-t0)/dur)), e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2; put(e);
    if(k<1) requestAnimationFrame(step); else { sw.classList.remove('go'); sw.style.setProperty('--hop','0px'); sw.classList.add('land');
      const nb=document.querySelector('.r2n[data-i="'+from+'"]'); if(nb){ nb.classList.add('pop'); }
      setTimeout(()=>sw.classList.remove('land'),600); } };
  requestAnimationFrame(step);
}

function renderMap(scroll){
  const st=rdSt(), pos=Math.min(st.pos,HQ+1), arrived=!!st.arrived;
  const keep=$('r2')?$('r2').scrollTop:0; m2Build();
  if(scroll || !M2.built) m2Scroll(Math.min(pos,HQ),false); else $('r2').scrollTop=keep;
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
  $('rpStars').textContent='⭐ '+starSum(st);
  // ahead
  const ah=st.ahead||[];
  $('rpAhead').textContent = !rdLoggedIn() ? '' : ah.length ? '👀 '+ah.map(a=>a.n).slice(0,2).join(' و')+(st.ahead_n>2?' و'+(st.ahead_n-2)+' غيرهم':'')+' قدامك في الطريق'
    : (st.ahead_n ? '👀 '+st.ahead_n+' زميل قدامك في الطريق' : (pos>0 && !arrived ? '👑 أنت في المقدمة!' : ''));
  // CTA
  const go=$('rpGo'), sub=$('rpSub'); go.classList.remove('gray'); go.disabled=false;
  if(!rdLoggedIn()){ go.innerHTML='سجّل دخولك وابدأ الرحلة<small>من الخيران إلى الفرع الرئيسي</small>'; sub.textContent=''; }
  else if(arrived){ go.classList.add('gray'); go.disabled=true; go.innerHTML='🏁 وصلت الرئيسي<small>رحلتك خلصت هالموسم</small>'; sub.textContent='الموسم الجاي يبدأ الكل من جديد'; }
  else if(pointsAvailable()){ go.innerHTML='العب: فرع '+ROUTE[pos]+'<small>العب تحدي اليوم وتقدّم للفرع اللي بعده ⚔️</small>'; sub.textContent=(st.streak? '🔥 العب اليوم عشان ما تنكسر سلسلة '+st.streak+' أيام' : 'التحدي اليومي مرة وحدة باليوم'); }
  else { go.classList.add('gray'); go.disabled=true; const need=3-((st.practice||0)%3); go.innerHTML='✓ خلصت تحدي اليوم · تعال بكرة'; sub.textContent=''; }
  go.classList.toggle('slim', go.disabled);
  if(rdLoggedIn() && !arrived && go.disabled && String(stats.empNo)==='302' && !DEMO){
    const t=document.createElement('button'); t.type='button'; t.className='rp-test'; t.textContent='⏭️ تجربة: انتقل لليوم التالي';
    t.onclick=async()=>{ t.disabled=true; const r=await rpc('test_next_day',{p_id:PID},6000);
      if(r && r.ok){ stats.pointsDay=''; save(stats); toast('صار يوم جديد، العب التحدي ⚔️'); await roadLoad(); renderMap(); } else { t.disabled=false; toast('ما زبط، حاول مرة ثانية'); } };
    sub.appendChild(t);
  }
}
$('rpGo').onclick=()=>{ if($('rpGo').disabled) return; if(rdLoggedIn() && !pointsAvailable()){ renderMap(); return; } RD.back='map'; RD.mall=null; try{ playSword(1); }catch(e){} startMatch(); };

function mallTap(k){
  const st=rdSt(), m=MALLS[k];
  if((st.malls||[]).indexOf(k)>=0){ toast('خلّصت محطة '+m.n+' ✓'); return; }
  if(!rdLoggedIn()){ toast('سجّل دخولك أول'); return; }
  if(st.pos<=m.at){ toast('🔒 تنفتح لك بعد ما تعدّي فرع '+ROUTE[m.at]); return; }
  const keys=st.keys||0;
  showModal('⚡ محطة '+m.n,
    '<div style="line-height:1.9">تحدي سرعة ضد الجهاز.<br>الدخول يكلّف <b>🔑 مفتاح واحد</b> (عندك '+keys+').<br>الفوز = <b>🛡️ درع</b> يحمي سلسلتك + <b>100 نقطة</b>.'+(keys?'':'<br><span style="color:var(--accent)">ما عندك مفاتيح. كل 3 تدريبات = مفتاح.</span>')+'</div>',
    keys ? [{t:'ادخل المحطة',full:true,f:()=>{ closeModal(); try{ playSword(1); }catch(e){} startMall(k); }},{t:'لاحقاً',ghost:true,full:true,f:closeModal}]
         : [{t:'تدرّب من السيف واجمع مفاتيح',full:true,f:()=>{ closeModal(); RD.back=null; show('home'); }},{t:'إغلاق',ghost:true,full:true,f:closeModal}]);
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
  const from=r.from, to=r.to, s=(typeof r.stars==='number'?r.stars:1), res=r.result||(s===3?'win':s===2?'draw':s===1?'lose':'quit'); if(!r.arrived) RD.drive={from:from,to:to};
  const RT={win:['فزت في فرع ','3 نجوم = '+(s*10)+' نقطة. أداء كامل!'],draw:['تعادلت في فرع ','نجمتين = 20 نقطة. الفوز يعطيك 3 نجوم'],lose:['خسرت في فرع ','نجمة = 10 نقاط. الفوز يعطيك 3 نجوم'],quit:['انسحبت من فرع ','ما في نجوم للانسحاب. كمّل التحدي المرة الجاية']}[res]||['فرع ',''];
  let nextEnd=GOV.find(g=>g.b>=to); nextEnd=nextEnd?nextEnd.b:HQ;
  let h='<div class="k">'+RT[0]+ROUTE[from]+'</div><h2>'+(r.arrived?'وصلت الرئيسي! 🏁':'تقدّمت فرع ⚔️')+'</h2>'
    +'<div class="s3">'+[1,2,3].map((n,j)=>'<span class="'+(j===1?'mid ':'')+(n<=s?'':'off')+'" style="animation-delay:'+(.25+j*.22)+'s">⭐</span>').join('')+'</div>'
    +'<div class="hint">'+RT[1]+'</div>';
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
  setTimeout(()=>{ rfxShow(h); if(s>=2) try{ FXV.confetti(); }catch(e){} }, 1100);
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
  c.innerHTML='<svg class="kwsky" viewBox="0 0 400 150" preserveAspectRatio="xMidYMax meet" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="kS" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#8fe0f0"/><stop offset=".45" stop-color="#2b8fb5"/><stop offset="1" stop-color="#0f4a6e"/></radialGradient><pattern id="kD" width="2.6" height="2.6" patternUnits="userSpaceOnUse"><circle cx="1.3" cy="1.3" r=".75" fill="#d8f6ff" opacity=".45"/></pattern><linearGradient id="sh" x1="0" x2="1"><stop offset="0" stop-color="#f4f6f8"/><stop offset=".6" stop-color="#c9d0d8"/><stop offset="1" stop-color="#9aa4b0"/></linearGradient><linearGradient id="gl" x1="0" x2="1"><stop offset="0" stop-color="#9fd3f0"/><stop offset=".35" stop-color="#3f86c4"/><stop offset=".7" stop-color="#1f4f8f"/><stop offset="1" stop-color="#5b9fd6"/></linearGradient><linearGradient id="gl2" x1="0" x2="1"><stop offset="0" stop-color="#2a6f86"/><stop offset=".5" stop-color="#5fb3c8"/><stop offset="1" stop-color="#1b4f63"/></linearGradient><pattern id="vl" width="3" height="4" patternUnits="userSpaceOnUse"><rect x="0" width=".5" height="4" fill="#fff" opacity=".35"/><rect y="0" width="3" height=".4" fill="#fff" opacity=".18"/></pattern><linearGradient id="lb" x1="0" x2="1"><stop offset="0" stop-color="#e7d3cc"/><stop offset=".55" stop-color="#c7a69c"/><stop offset="1" stop-color="#9c7d74"/></linearGradient><pattern id="jc" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#b98b5e"/><path d="M0 3 L3 0 L6 3 L3 6 Z" fill="none" stroke="#f1dfc3" stroke-width=".7"/><circle cx="3" cy="3" r=".9" fill="#7b4f2c"/></pattern><linearGradient id="jcs" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".25"/><stop offset="1" stop-color="#000" stop-opacity=".15"/></linearGradient><linearGradient id="bl" x1="0" x2="1"><stop offset="0" stop-color="#dfe6ee"/><stop offset=".5" stop-color="#b9c6d4"/><stop offset="1" stop-color="#8b9bb0"/></linearGradient></defs><!-- filler --><g fill="#b9d0ea"><rect x="0" y="96" width="14" height="54"/><rect x="14" y="108" width="12" height="42"/><rect x="84" y="88" width="12" height="62"/><rect x="94" y="104" width="10" height="46"/><rect x="152" y="98" width="10" height="52"/><rect x="236" y="96" width="9" height="54"/><rect x="298" y="84" width="12" height="66"/><rect x="308" y="100" width="12" height="50"/><rect x="372" y="78" width="12" height="72"/><rect x="384" y="94" width="16" height="56"/></g><g fill="#9cbde3"><rect x="4" y="112" width="12" height="38"/><rect x="88" y="116" width="10" height="34"/><rect x="314" y="112" width="12" height="38"/><rect x="376" y="106" width="10" height="44"/></g><g fill="url(#vl)"><rect x="0" y="96" width="14" height="54"/><rect x="84" y="88" width="12" height="62"/><rect x="298" y="84" width="12" height="66"/><rect x="372" y="78" width="12" height="72"/></g><!-- أبراج الكويت --><path d="M38 150 L39.6 66 L41.4 66 L43 150 Z" fill="url(#sh)"/><path d="M75 150 L77.6 88 L80.4 88 L83 150 Z" fill="url(#sh)"/><path d="M54 150 L57.4 82 L60.6 82 L64 150 Z" fill="url(#sh)"/><rect x="58.6" y="2" width=".8" height="34" fill="#c9d0d8"/><path d="M57.4 84 Q49 76 46 66 L72 66 Q69 76 60.6 84 Z" fill="url(#kS)"/><path d="M57.4 84 Q49 76 46 66 L72 66 Q69 76 60.6 84 Z" fill="url(#kD)"/><circle cx="59" cy="62" r="13.5" fill="url(#kS)"/><circle cx="59" cy="62" r="13.5" fill="url(#kD)"/><path d="M43 64 Q59 70 75 64 L74 61 Q59 66 44 61 Z" fill="#e9f4f8"/><path d="M58 49 L58 42 L60 42 L60 49 Z" fill="url(#sh)"/><circle cx="59" cy="36" r="7" fill="url(#kS)"/><circle cx="59" cy="36" r="7" fill="url(#kD)"/><path d="M77.8 90 Q72 85 70.4 80 L87.6 80 Q86 85 80.2 90 Z" fill="url(#kS)"/><circle cx="79" cy="78" r="9" fill="url(#kS)"/><circle cx="79" cy="78" r="9" fill="url(#kD)"/><rect x="78.6" y="56" width=".8" height="14" fill="#c9d0d8"/><!-- الحمراء --><path d="M104 150 L104 40 Q108 14 122 4 Q118 30 120 150 Z" fill="url(#gl2)"/><path d="M120 150 Q118 30 122 4 Q132 30 132 150 Z" fill="#1f5f7a"/><path d="M104 150 L104 40 Q108 14 122 4 Q118 30 120 150 Z" fill="url(#vl)"/><path d="M107 150 L107 46 Q109 34 113 26" stroke="#c6f0ff" stroke-width="1.4" fill="none" opacity=".6"/><!-- برج زجاجي --><path d="M134 150 L134 30 Q142 22 152 30 L152 150 Z" fill="url(#gl)"/><path d="M134 150 L134 30 Q142 22 152 30 L152 150 Z" fill="url(#vl)"/><path d="M137 150 V34" stroke="#d9f1ff" stroke-width="1.2" opacity=".55"/><!-- مركز جابر الثقافي --><path d="M244 150 L250 116 L276 104 L292 120 L290 150 Z" fill="url(#jc)"/><path d="M244 150 L250 116 L276 104 L292 120 L290 150 Z" fill="url(#jcs)"/><path d="M286 150 L294 124 L318 118 L328 134 L326 150 Z" fill="url(#jc)"/><path d="M286 150 L294 124 L318 118 L328 134 L326 150 Z" fill="url(#jcs)"/><path d="M250 116 L276 104 L272 150 M294 124 L318 118 L314 150" stroke="#f6e7cf" stroke-width=".8" fill="none" opacity=".8"/><!-- برج التحرير --><path d="M336 150 L339 30 L343 30 L346 150 Z" fill="url(#lb)"/><path d="M332 34 Q341 20 350 34 L348 40 L334 40 Z" fill="url(#lb)"/><rect x="333" y="40" width="16" height="5" rx="1.5" fill="#8a6c64"/><rect x="334" y="41.5" width="14" height="2" fill="#f7e9b0" opacity=".8"/><path d="M332 50 Q341 46 350 50 L349 54 L333 54 Z" fill="#b8968c"/><rect x="340.5" y="0" width="1" height="22" fill="#9c7d74"/><!-- البرج الرصاصة --><path d="M354 150 L354 40 Q362 16 370 40 L370 150 Z" fill="url(#bl)"/><path d="M362 150 L362 22 Q367 28 370 40 L370 150 Z" fill="#7d8ea6" opacity=".55"/><path d="M354 150 L354 40 Q362 16 370 40 L370 150 Z" fill="url(#vl)"/><!-- خضرة --><g fill="#5fae4c"><ellipse cx="30" cy="148" rx="10" ry="5"/><ellipse cx="92" cy="148" rx="9" ry="5"/><ellipse cx="158" cy="148" rx="8" ry="4"/><ellipse cx="240" cy="148" rx="8" ry="4"/><ellipse cx="332" cy="148" rx="9" ry="5"/><ellipse cx="380" cy="148" rx="10" ry="5"/></g><g fill="#7cc95f"><ellipse cx="27" cy="147" rx="5" ry="3"/><ellipse cx="90" cy="147" rx="4" ry="3"/><ellipse cx="378" cy="147" rx="5" ry="3"/></g><g stroke="#5b6b80" stroke-width=".6" fill="none"><path d="M196 14 q2 -2 4 0 q2 -2 4 0"/><path d="M212 22 q1.5 -1.5 3 0 q1.5 -1.5 3 0"/><path d="M290 70 q1.5 -1.5 3 0 q1.5 -1.5 3 0"/></g></svg>'; })();
try{ const q=$('quitBtn'); if(q) q.textContent='🏳️ استسلم'; }catch(e){}
