#!/usr/bin/env python3
"""Build road.html (the 'road to head office' trial version) from index.html."""
import re, sys, os
src, dst = sys.argv[1], sys.argv[2]
s = open(src, encoding='utf-8').read()

def rep(old, new, count=1):
    global s
    n = s.count(old)
    assert n >= 1, ('missing', old[:80])
    if count == 1:
        assert n == 1, ('not unique', old[:80], n)
    s = s.replace(old, new)

# ---------- isolation: own server functions (r_*) and own local storage ----------
rep("fetch(SB_URL+'/rest/v1/rpc/'+fn,", "fetch(SB_URL+'/rest/v1/rpc/r_'+fn,")
s = s.replace('localStorage.', 'LS.')
ls_shim = """<script>
/* نسخة الطريق: تخزين محلي منفصل عن اللعبة الأصلية (نفس النطاق) */
var LS=(function(){ var P='rd_'; try{ var L=window.localStorage; return {getItem:function(k){return L.getItem(P+k);},setItem:function(k,v){return L.setItem(P+k,v);},removeItem:function(k){return L.removeItem(P+k);}}; }catch(e){ var m={}; return {getItem:function(k){return k in m?m[k]:null;},setItem:function(k,v){m[k]=String(v);},removeItem:function(k){delete m[k];}}; } })();
</script>
"""
i = s.index('<script')
s = s[:i] + ls_shim + s[i:]

# own app-version so the home-screen icon reloads when road.html changes
import time
s = re.sub(r'<meta name="app-version" content="[^"]*">', '<meta name="app-version" content="road-'+time.strftime('%Y%m%d%H%M%S')+'">', s, count=1)
# ---------- titles ----------
s = re.sub(r'<title>[^<]*</title>', '<title>تحدّي الدقيقة · الطريق إلى الرئيسي</title>', s, count=1)
s = s.replace('content="https://almotawa80.github.io/60sec/"', 'content="https://almotawa80.github.io/60sec/road.html"')

s = s.replace('٦٠ ثانية · أسئلة سريعة · نقاط وجوائز','🏁 من الخيران إلى الفرع الرئيسي')
# ---------- CSS ----------
css = open(sys.argv[3], encoding='utf-8').read()
rep('</head>', '<style>\n' + css + '\n</style>\n</head>')

# ---------- home: road card replaces the three stats ----------
m = re.search(r'<div class="stats">.*?</div>\s*</div>', s, re.S)
stats_html = m.group(0)
card = '''<div style="display:none">''' + stats_html + '''</div>
      <button class="rcard" id="rCard" type="button" aria-label="افتح خريطة الطريق">
        <div class="rc-top"><span class="rc-ch" id="rcCh">الطريق إلى الرئيسي</span><span class="rc-chips"><i>🔥<b id="rcSt">0</b></i><i>🛡️<b id="rcSh">0</b></i><i>🔑<b id="rcK">1</b></i></span></div>
        <div class="rc-mid"><div class="rc-cur"><small id="rcCurL">أنت في</small><b id="rcCur">الخيران</b></div><div class="rc-path" id="rcPath"></div></div>
        <div class="rc-bar"><i id="rcBar"></i></div>
        <div class="rc-bot"><span id="rcLeft">باقي 39 فرع للرئيسي</span><span class="rc-open">افتح الخريطة <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg></span></div>
      </button>'''
s = s[:m.start()] + card + s[m.end():]

# ---------- map screen + reward overlay ----------
page = open(sys.argv[4], encoding='utf-8').read()
rep('<!-- البحث عن خصم -->', page + '\n  <!-- البحث عن خصم -->')

# ---------- game hooks ----------
# mall games are always practice (no daily points)
rep("""  G.scored = pointsAvailable();
  if(G.scored){ stats.pointsDay = dkey(new Date()); save(stats); if(!DEMO) rpc('start_scored',{p_id:PID},4000); }
  if(!DEMO && !GUEST()) rpc('set_playing',{p_id:PID},3000);
  $('myLbl').textContent = G.scored ? 'أنت' : 'أنت (تدريب)';
  $('myScore').textContent=0; $('botScore').textContent=0; $('botLbl').textContent=bot.name;
  updateRace(); $('combo').classList.remove('on');
  $('qNum')""", """  G.scored = pointsAvailable() && !RD.mall && RD.replay==null;
  if(G.scored){ stats.pointsDay = dkey(new Date()); save(stats); if(!DEMO) rpc('start_scored',{p_id:PID},4000); }
  if(!DEMO && !GUEST()) rpc('set_playing',{p_id:PID},3000);
  $('myLbl').textContent = G.scored ? 'أنت' : (RD.mall ? 'أنت (محطة)' : (RD.replay!=null ? 'أنت (إعادة)' : 'أنت (تدريب)'));
  $('myScore').textContent=0; $('botScore').textContent=0; $('botLbl').textContent=bot.name;
  updateRace(); $('combo').classList.remove('on');
  $('qNum')""")
# match screen text for mall games
rep("""(pointsAvailable() ? '' : '\\nجولة تدريبية بدون نقاط');""",
    """(pointsAvailable() ? '' : '\\nجولة تدريبية بدون نقاط'); if(RD.mall) $('foundMsg').textContent = '⚡ محطة '+RD.mall.n+'\\nافز على الجهاز واحصل على درع 🛡️ و١٠٠ نقطة'; if(RD.replay!=null) $('foundMsg').textContent = '🔁 إعادة فرع '+ROUTE[RD.replay]+'\\nحسّن نجومك (بدون نقاط)';""")
# road result after the server answers
rep("""rpc('finish_game2',{p_id:PID,p_score:me,p_won:(R==='win'),p_human:!!PV,p_quit:(G.force==='lose'),p_match:(PV?PV.id:null),p_bonus:bonus},5000).then(function(c){ if(c && typeof c.balance==='number'){""",
    """rpc('finish_game3',{p_id:PID,p_score:me,p_won:(R==='win'),p_human:!!PV,p_quit:(G.force==='lose'),p_match:(PV?PV.id:null),p_bonus:bonus,p_draw:(R==='draw')},5000).then(function(c){ RD.mall=null; if(RD.replay!=null){ replayDone(R, G.force==='lose'); } else if(c && c.road) roadResult(c.road); if(c && typeof c.balance==='number'){""")
rep("""$('homeBtn').onclick = ()=>{ renderStats(); show('home'); homeRank(); };""",
    """$('homeBtn').onclick = ()=>{ renderStats(); if(RD.back==='map'){ RD.back=null; openRoad(); } else show('home'); homeRank(); roadLoad(); };""")
rep("function renderStats(){\n", "function renderStats(){\n  try{ roadCard(); }catch(e){}\n  setTimeout(function(){ try{ pfTiles(); }catch(e){} },0);\n")

# swipe-back from the map to home
rep("{store:'backBtn',badgesPage:'backBtn2',profilePage:'backBtn3',lbPage:'backBtn4'}[id]", "{store:'backBtn',badgesPage:'backBtn2',profilePage:'backBtn3',lbPage:'backBtn4',roadPage:'rpBack'}[id]")
# ---------- road JS ----------
js = open(sys.argv[5], encoding='utf-8').read()
i = s.rindex('</script>')
s = s[:i] + '\n' + js + '\n' + s[i:]


# ---------- timer: the big clock is the question clock (10 s per question, resets each question) ----------
rep("g.deadline = Math.min((startAt||performance.now()) + QMS, g.t0 + NQ*QMS);", "g.deadline = (startAt||performance.now()) + QMS;")
rep("""const TOT=NQ*QMS, tl = g.t0 ? Math.max(0, TOT-(now-g.t0)) : TOT;
  if(g.t0){ $('timer').textContent=toAr(Math.ceil(tl/1000));
    $('clock').classList.toggle('low', tl<=10000); $('clock').classList.toggle('mid', tl<=30000);
    $('ringFg').style.strokeDashoffset=RING*(1-tl/TOT); }""",
"""const TOT=NQ*QMS, tl = 1e9; const qr = g.phase==='q' ? Math.max(0, g.deadline-now) : (g.lastQr!=null ? g.lastQr : QMS); if(g.phase==='q') g.lastQr=qr;
  if(g.t0){ $('timer').textContent=toAr(Math.ceil(qr/1000));
    $('clock').classList.toggle('low', qr<=3000); $('clock').classList.toggle('mid', qr<=5000);
    $('ringFg').style.strokeDashoffset=RING*(1-qr/QMS); }""")
rep("if(g.phase==='q' && g.t0) g.deadline=Math.min(g.deadline, g.t0+TOT);", "")

rep("$('qNum').textContent='السؤال ١ من ٦'; $('timer').textContent='٦٠';", "$('qNum').textContent='السؤال ١ من ٦'; $('timer').textContent='١٠';")
rep('<div class="num" id="timer">60</div>', '<div class="num" id="timer">10</div>')
# swipe-back only right-to-left (finger moves left)
rep("var t=e.touches[0], dx=t.clientX-sx, dy=t.clientY-sy;", "var t=e.touches[0], dx=Math.min(0,t.clientX-sx), dy=t.clientY-sy;")
rep("var t=e.changedTouches[0], rdx=t.clientX-sx,", "var t=e.changedTouches[0], rdx=Math.min(0,t.clientX-sx),")
# splash: wait for a tap on the clock, then the sword cuts it (the tap lets iOS play the sound)
rep("else timers.push(setTimeout(()=>{ playSword(); swing(C2,C7,", "else window._spGo=(()=>{ playSword(); swing(C2,C7,")
rep("""},380)); }); },650));
sp.addEventListener('click',skip);""", """},380)); }); });
if(window._spGo){ const nm=(()=>{ const v=String(stats.playerName||'').replace(/\s+/g,' ').trim(); if(!v) return ''; const m=v.match(/^([^،,]+)[،,]/); if(m) return m[1].trim(); return v.split(' ')[0]; })();
  sp.insertAdjacentHTML('beforeend','<div class="spNm">'+nm.replace(/[<>&]/g,'')+'</div><div class="spTap">جاهز؟ اكسر الدقيقة ⚔️</div>');
  const W=sp.querySelector('.spW'); if(W) W.insertAdjacentHTML('beforeend','<svg class="spFg" viewBox="0 0 24 24" aria-hidden="true"><path fill="#fff" d="M9 11.24V7.5C9 6.12 10.12 5 11.5 5S14 6.120 14 7.5v3.74c1.21-.81 2-2.18 2-3.74C16 5.01 13.99 3 11.5 3S7 5.01 7 7.5c0 1.56.79 2.930 2 3.74zm9.84 4.63l-4.54-2.26c-.17-.07-.35-.11-.54-.11H13v-6c0-.83-.67-1.5-1.5-1.5S10 6.67 10 7.5v10.74l-3.43-.72c-.08-.01-.15-.03-.24-.03-.31 0-.59.13-.79.33l-.79.8 4.94 4.94c.27.27.65.44 1.06.44h6.79c.75 0 1.33-.55 1.44-1.28l.75-5.27c.01-.07.02-.14.02-.2 0-.62-.38-1.16-.91-1.38z"/></svg><svg class="spSw" viewBox="0 0 40 172" aria-hidden="true"><defs><linearGradient id="spGd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0a0"/><stop offset=".5" stop-color="#e8b923"/><stop offset="1" stop-color="#9c6d08"/></linearGradient><linearGradient id="spGdx" x1="0" x2="1"><stop offset="0" stop-color="#a87a0c"/><stop offset=".45" stop-color="#ffe680"/><stop offset="1" stop-color="#b9860f"/></linearGradient><linearGradient id="spLe" x1="0" x2="1"><stop offset="0" stop-color="#5a2e10"/><stop offset=".5" stop-color="#a5602a"/><stop offset="1" stop-color="#4a240b"/></linearGradient><linearGradient id="spSh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient><clipPath id="spCl"><path d="M10 52 H30 V152 L22 169 L10 146 Z"/></clipPath></defs><rect x="14" y="1" width="12" height="4" rx="2" fill="url(#spGdx)" stroke="#7a5206" stroke-width=".8"/><rect x="12.5" y="5" width="15" height="5" rx="2.5" fill="url(#spGdx)" stroke="#7a5206" stroke-width=".8"/><rect x="15" y="10" width="10" height="4" rx="1.5" fill="url(#spGdx)" stroke="#7a5206" stroke-width=".8"/><rect x="16" y="14" width="8" height="26" rx="2" fill="url(#spLe)" stroke="#2e1406" stroke-width=".9"/><path d="M16 17 L24 20 M16 21 L24 24 M16 25 L24 28 M16 29 L24 32 M16 33 L24 36 M16 37 L24 40" stroke="#2e1406" stroke-width="1.1" opacity=".75"/><path d="M20 40 L33 41 L37 37.5 L39 42 L37 47 L33 44.5 L20 46 L7 44.5 L3 47 L1 42 L3 37.5 L7 41 Z" fill="url(#spGdx)" stroke="#7a5206" stroke-width="1" stroke-linejoin="round"/><path d="M5 42 H35" stroke="#fff7c2" stroke-width=".7" opacity=".7"/><path d="M10 52 H30 V152 L22 169 L10 146 Z" fill="#c9d3df"/><path d="M20 52 H30 V152 L22 169 L20 160 Z" fill="#eef3f8"/><path d="M10 52 H20 V160 L22 169 L10 146 Z" fill="#a9b6c6"/><path d="M18 60 H22 V138 L20 144 L18 138 Z" fill="#8796aa"/><path d="M21 60 V138" stroke="#ffffff" stroke-width=".9" opacity=".9"/><path d="M10 52 H30 V152 L22 169 L10 146 Z" fill="none" stroke="#6b7a8e" stroke-width="1.1" stroke-linejoin="round"/><path d="M15.5 46 Q20 44 24.5 46 Q24 56 20 66 Q16 56 15.5 46 Z" fill="url(#spGd)" stroke="#7a5206" stroke-width=".9"/><path d="M18.5 49 Q20 55 20 60" stroke="#fff4b8" stroke-width=".8" fill="none"/><g clip-path="url(#spCl)"><g><polygon points="0,10 40,-6 40,14 0,30" fill="url(#spSh)"/><animateTransform attributeName="transform" type="translate" values="0 10;0 10;0 178;0 178" keyTimes="0;.45;.75;1" dur="2.4s" repeatCount="indefinite"/></g></g><g transform="translate(22 168)"><g opacity="0"><path d="M0 -10 L1.8 -1.8 L10 0 L1.8 1.8 L0 10 L-1.8 1.8 L-10 0 L-1.8 -1.8 Z" fill="#fff"/><circle r="2.6" fill="#fff"/><animate attributeName="opacity" values="0;0;1;0;0" keyTimes="0;.7;.8;.92;1" dur="2.4s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="scale" values=".2;.2;1.3;.4;.2" keyTimes="0;.7;.8;.92;1" dur="2.4s" repeatCount="indefinite"/></g></g></svg>');
  const NUMS=[...sp.querySelectorAll('text')].filter(t=>t.textContent.trim()==='60'); let sec=60; const tk=setInterval(()=>{ if(!window._spGo){ clearInterval(tk); return; } sec=sec<=1?60:sec-1; NUMS.forEach(t=>t.textContent=String(sec)); sp.classList.remove('tick'); void sp.offsetWidth; sp.classList.add('tick'); },1000);
  sp.addEventListener('click',()=>{ const f=window._spGo; if(f){ window._spGo=null; clearInterval(tk); sp.classList.add('tapped','pull'); try{ unlockAudio(); }catch(e){} setTimeout(f,800); } else skip(); }); }
else sp.addEventListener('click',skip);""")

# ساعة السبلاش الفخمة (ذهبي + وجه كريمي)
_i = s.find('<div class="spT p0"><svg viewBox="0 0 200 200"'); _j = s.find('</svg>', _i) + 6
_clk = ('<div class="spT p0"><svg viewBox="0 0 200 200" width="190" height="190" aria-hidden="true"><defs>'
 '<linearGradient id="ckG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff2a8"/><stop offset=".45" stop-color="#e8b923"/><stop offset="1" stop-color="#8f6206"/></linearGradient>'
 '<radialGradient id="ckF" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#ffffff"/><stop offset=".7" stop-color="#fff6e3"/><stop offset="1" stop-color="#f3dcae"/></radialGradient>'
 '<linearGradient id="ckR" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff5a65"/><stop offset="1" stop-color="#a50f1c"/></linearGradient></defs>'
 '<rect x="82" y="6" width="36" height="15" rx="6" fill="url(#ckR)" stroke="#fff" stroke-width="2.5"/>'
 '<rect x="92" y="20" width="16" height="14" rx="3" fill="url(#ckG)" stroke="#7a5206" stroke-width="1.5"/>'
 '<g transform="rotate(45 166 42)"><rect x="158" y="30" width="16" height="13" rx="4" fill="url(#ckG)" stroke="#7a5206" stroke-width="1.5"/></g>'
 '<circle cx="100" cy="110" r="84" fill="url(#ckG)" stroke="#7a5206" stroke-width="2"/>'
 '<circle cx="100" cy="110" r="76" fill="#fff" />'
 '<circle cx="100" cy="110" r="72" fill="url(#ckR)"/>'
 '<circle cx="100" cy="110" r="64" fill="url(#ckF)"/>'
 '<g stroke="#c8102e" stroke-linecap="round"><path d="M100 50v9M100 161v9M40 110h9M151 110h9" stroke-width="4.5"/>'
 '<path d="M130 58.04l-3 5.2M151.96 80l-5.2 3M151.96 140l-5.2-3M130 161.96l-3-5.2M70 161.96l3-5.2M48.04 140l5.2-3M48.04 80l5.2 3M70 58.04l3 5.2" stroke-width="2.5" opacity=".7"/></g>'
 '<text x="100" y="128" text-anchor="middle" font-family="Noto Kufi Arabic,system-ui,sans-serif" font-weight="900" font-size="60" fill="#b20d1c" stroke="#fff" stroke-width="2" paint-order="stroke">60</text>'
 '<text x="100" y="152" text-anchor="middle" font-family="Noto Kufi Arabic,system-ui,sans-serif" font-weight="800" font-size="14" fill="#8a6a45">ثانية</text></svg>')
if _i > 0: s = s[:_i] + _clk + s[_j:]
# أيقونة الطريق (ساعة الشعار) — خاصة بصفحة الطريق
import re as _re
s = _re.sub(r'<link rel="icon" type="image/svg\+xml" href="[^"]*">', '<link rel="icon" type="image/svg+xml" href="img/road/favicon.svg?v=2">', s, count=1)
s = s.replace('<link rel="icon" type="image/png" sizes="32x32" href="favicon-32.png">', '<link rel="icon" type="image/png" sizes="32x32" href="img/road/fav-32.png?v=2">')
s = s.replace('<link rel="apple-touch-icon" href="apple-touch-icon.png">', '<link rel="apple-touch-icon" href="img/road/apple-touch-icon.png?v=2">')
s = s.replace('content="https://almotawa80.github.io/60sec/icon-512.png"', 'content="https://almotawa80.github.io/60sec/img/road/icon-512.png"')
open(dst, 'w', encoding='utf-8').write(s)
print('ok', len(s))
