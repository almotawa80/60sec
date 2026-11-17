#!/usr/bin/env python3
"""Build road.html (the 'road to head office' trial version) from index.html."""
import re, sys
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
    """rpc('finish_game2',{p_id:PID,p_score:me,p_won:(R==='win'),p_human:!!PV,p_quit:(G.force==='lose'),p_match:(PV?PV.id:null),p_bonus:bonus},5000).then(function(c){ RD.mall=null; if(c && c.road) roadResult(c.road); if(c && typeof c.balance==='number'){""")
rep("""$('homeBtn').onclick = ()=>{ renderStats(); show('home'); homeRank(); };""",
    """$('homeBtn').onclick = ()=>{ renderStats(); if(RD.back==='map'){ RD.back=null; openRoad(); } else show('home'); homeRank(); roadLoad(); };""")
rep("function renderStats(){\n", "function renderStats(){\n  try{ roadCard(); }catch(e){}\n")

# ---------- road JS ----------
js = open(sys.argv[5], encoding='utf-8').read()
i = s.rindex('</script>')
s = s[:i] + '\n' + js + '\n' + s[i:]

open(dst, 'w', encoding='utf-8').write(s)
print('ok', len(s))
