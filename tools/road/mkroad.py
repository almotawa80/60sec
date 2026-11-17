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

s = s.replace('٦٠ ثانية · أسئلة سريعة · نقاط وجوائز','🏁 الطريق إلى الرئيسي · من الخيران إلى الفرع الرئيسي')
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
  $('qNum')""", """  G.scored = pointsAvailable() && !RD.mall;
  if(G.scored){ stats.pointsDay = dkey(new Date()); save(stats); if(!DEMO) rpc('start_scored',{p_id:PID},4000); }
  if(!DEMO && !GUEST()) rpc('set_playing',{p_id:PID},3000);
  $('myLbl').textContent = G.scored ? 'أنت' : (RD.mall ? 'أنت (محطة)' : 'أنت (تدريب)');
  $('myScore').textContent=0; $('botScore').textContent=0; $('botLbl').textContent=bot.name;
  updateRace(); $('combo').classList.remove('on');
  $('qNum')""")
# match screen text for mall games
rep("""(pointsAvailable() ? '' : '\\nجولة تدريبية بدون نقاط');""",
    """(pointsAvailable() ? '' : '\\nجولة تدريبية بدون نقاط'); if(RD.mall) $('foundMsg').textContent = '⚡ محطة '+RD.mall.n+'\\nافز على الجهاز واحصل على درع 🛡️ و١٠٠ نقطة';""")
# road result after the server answers
rep("""rpc('finish_game2',{p_id:PID,p_score:me,p_won:(R==='win'),p_human:!!PV,p_quit:(G.force==='lose'),p_match:(PV?PV.id:null),p_bonus:bonus},5000).then(function(c){ if(c && typeof c.balance==='number'){""",
    """rpc('finish_game3',{p_id:PID,p_score:me,p_won:(R==='win'),p_human:!!PV,p_quit:(G.force==='lose'),p_match:(PV?PV.id:null),p_bonus:bonus,p_draw:(R==='draw')},5000).then(function(c){ RD.mall=null; if(c && c.road) roadResult(c.road); if(c && typeof c.balance==='number'){""")
rep("""$('homeBtn').onclick = ()=>{ renderStats(); show('home'); homeRank(); };""",
    """$('homeBtn').onclick = ()=>{ renderStats(); if(RD.back==='map'){ RD.back=null; openRoad(); } else show('home'); homeRank(); roadLoad(); };""")
rep("function renderStats(){\n", "function renderStats(){\n  try{ roadCard(); }catch(e){}\n  setTimeout(function(){ try{ pfTiles(); }catch(e){} },0);\n")

# swipe-back from the map to home
rep("['store','badgesPage','profilePage','lbPage'].forEach(function(id){", "['store','badgesPage','profilePage','lbPage','roadPage'].forEach(function(id){")
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
if(window._spGo){ const nm=(()=>{ const v=String(stats.playerName||'').replace(/\s+/g,' ').trim(); if(!v) return 'يا بطل'; const m=v.match(/^([^،,]+)[،,]/); if(m) return 'يا '+m[1].trim(); const w=v.split(' '); return 'يا '+(/^بو\S{2,}$/.test(w[0])?w[0]:w[0]); })();
  sp.insertAdjacentHTML('beforeend','<div class="spNm">'+nm.replace(/[<>&]/g,'')+'</div><div class="spTap">جاهز؟ اكسر الدقيقة ⚔️</div>');
  const W=sp.querySelector('.spW'); if(W) W.insertAdjacentHTML('beforeend','<svg class="spSw" viewBox="0 0 40 170" aria-hidden="true"><defs><linearGradient id="spBl" x1="0" x2="1"><stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="#e9eef5"/><stop offset=".51" stop-color="#b9c4d2"/><stop offset="1" stop-color="#dfe6ee"/></linearGradient><linearGradient id="spGd" x1="0" x2="1"><stop offset="0" stop-color="#ffe28a"/><stop offset="1" stop-color="#c8901e"/></linearGradient></defs><circle cx="20" cy="9" r="7" fill="url(#spGd)" stroke="#7a4a0c" stroke-width="1.5"/><rect x="15.5" y="15" width="9" height="26" rx="3" fill="#5b2a12" stroke="#2e1408" stroke-width="1.2"/><path d="M16 19 L24 23 M16 26 L24 30 M16 33 L24 37" stroke="#8a4a22" stroke-width="1.6"/><rect x="2" y="40" width="36" height="8" rx="4" fill="url(#spGd)" stroke="#7a4a0c" stroke-width="1.5"/><path d="M13 48 H27 L26 150 L20 168 L14 150 Z" fill="url(#spBl)" stroke="#8d99a8" stroke-width="1.2"/><path d="M20 50 V158" stroke="#9aa6b5" stroke-width="1"/><rect class="spGl" x="13" y="48" width="14" height="22" fill="#fff" opacity="0"/></svg>');
  const NUMS=[...sp.querySelectorAll('text')].filter(t=>t.textContent.trim()==='60'); let sec=60; const tk=setInterval(()=>{ if(!window._spGo){ clearInterval(tk); return; } sec=sec<=1?60:sec-1; NUMS.forEach(t=>t.textContent=String(sec)); sp.classList.remove('tick'); void sp.offsetWidth; sp.classList.add('tick'); },1000);
  sp.addEventListener('click',()=>{ const f=window._spGo; if(f){ window._spGo=null; clearInterval(tk); sp.classList.add('tapped','pull'); try{ unlockAudio(); }catch(e){} setTimeout(f,260); } else skip(); }); }
else sp.addEventListener('click',skip);""")
open(dst, 'w', encoding='utf-8').write(s)
print('ok', len(s))
