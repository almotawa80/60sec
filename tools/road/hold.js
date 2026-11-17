/* زر السيف: اضغط وثبّت إصبعك لين يتشحن، واترك عشان تنطلق (الآيفون يحسبها ضغطة فيشتغل الصوت أكيد) */
(function(){
  var btn=$('goBtn'), knob=$('goKnob'), lbl=$('goLbl'); if(!btn||!knob) return;
  var HOLD=650, t0=0, raf=0, holding=false, ready=false, done=false, lbl0='', tip=0;
  btn.insertAdjacentHTML('afterbegin','<div class="schg" id="goChg"></div>'); var chg=$('goChg');
  function paint(){ if(!holding) return; var p=Math.min(1,(performance.now()-t0)/HOLD);
    chg.style.transform='scaleX('+p+')'; knob.style.transform='scale('+(1+p*.16).toFixed(3)+')';
    if(p>=1 && !ready){ ready=true; btn.classList.add('ready'); lbl.textContent='اترك وانطلق ⚔️'; try{ navigator.vibrate&&navigator.vibrate(15); }catch(e){} }
    raf=requestAnimationFrame(paint); }
  function reset(){ holding=false; ready=false; cancelAnimationFrame(raf); btn.classList.remove('ready','charging'); chg.style.transform='scaleX(0)'; knob.classList.add('back'); knob.style.transform=''; knob.style.animation=''; if(lbl0) lbl.textContent=lbl0; }
  function fire(){ if(done) return; done=true; holding=false; cancelAnimationFrame(raf); btn.classList.remove('ready','charging'); chg.style.transform='scaleX(0)';
    var max=btn.clientWidth-72; knob.classList.add('back'); knob.style.transform='translate3d('+(-max)+'px,0,0)'; lbl.style.opacity=.05; if(lbl0) lbl.textContent=lbl0;
    try{ playSword(); }catch(e){}
    setTimeout(function(){ startMatch(); setTimeout(function(){ done=false; lbl.style.opacity=1; knob.style.transform=''; knob.style.animation=''; },600); },160); }
  btn.addEventListener('pointerdown',function(e){ if(done) return; e.preventDefault(); try{ btn.setPointerCapture(e.pointerId); }catch(_){}
    clearTimeout(tip); if(lbl.textContent!=='ثبّت إصبعك شوي ⏳' && lbl.textContent!=='اترك وانطلق ⚔️') lbl0=lbl.textContent; if(lbl0) lbl.textContent=lbl0; holding=true; ready=false; t0=performance.now();
    knob.classList.remove('back'); knob.classList.remove('hint'); knob.style.animation='none'; btn.classList.add('charging');
    try{ if(stats.sound){ audio(); loadSword(); } }catch(_){} raf=requestAnimationFrame(paint); });
  btn.addEventListener('pointerup',function(){ if(!holding) return; if(ready){ fire(); return; }
    reset(); lbl.textContent='ثبّت إصبعك شوي ⏳'; tip=setTimeout(function(){ if(!holding && lbl0) lbl.textContent=lbl0; },1300); });
  btn.addEventListener('pointercancel',reset);
  btn.addEventListener('contextmenu',function(e){ e.preventDefault(); });
  btn.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); fire(); } });
})();
