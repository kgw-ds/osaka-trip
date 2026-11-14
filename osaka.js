/* 집중소 일본편 EP.1 — deck extras: snow, lunch roulette, checklist, photo credits */
(function(){
  'use strict';

  // ---- page numbers ----
  var all = document.querySelectorAll('.deck > .slide');
  all.forEach(function(sl, i){
    var pg = sl.querySelector('.topbar .pg');
    if (pg) pg.textContent = String(i + 1).padStart(2, '0') + ' / ' + all.length;
  });

  // ---- snow ----
  document.querySelectorAll('.snow').forEach(function(box){
    for (var i = 0; i < 26; i++){
      var s = document.createElement('i');
      s.textContent = i % 3 ? '❄' : '•';
      s.style.left = (Math.random() * 100) + '%';
      s.style.fontSize = (14 + Math.random() * 26) + 'px';
      s.style.animationDuration = (9 + Math.random() * 10) + 's';
      s.style.animationDelay = (-Math.random() * 18) + 's';
      box.appendChild(s);
    }
  });

  // ---- lunch roulette ----
  var MENU = [['🥩','고기 우동'],['🍛','카레 우동'],['🦊','유부 우동'],['🍝','소바'],['🍤','튀김 우동']];
  var disc = document.getElementById('disc');
  var btn = document.getElementById('spinBtn');
  var out = document.getElementById('spinResult');
  if (disc && btn){
    MENU.forEach(function(m, i){
      var e = document.createElement('span');
      var a = i * 72 + 36;
      e.textContent = m[0];
      e.style.transform = 'rotate(' + (a - 90) + 'deg) translate(64px) rotate(' + (90 - a) + 'deg) translate(-50%,-50%)';
      disc.appendChild(e);
    });
    var turn = 0;
    btn.addEventListener('click', function(ev){
      ev.stopPropagation();
      var pick = Math.floor(Math.random() * MENU.length);
      // pointer sits at the top: rotate so the picked slice's centre lands at 0deg
      var target = 360 - (pick * 72 + 36);
      turn += 1440 + ((target - (turn % 360)) + 360) % 360;
      disc.style.transform = 'rotate(' + turn + 'deg)';
      out.textContent = '두구두구두구…';
      btn.disabled = true;
      setTimeout(function(){
        out.textContent = MENU[pick][0] + ' ' + MENU[pick][1] + ' 당첨!';
        btn.disabled = false;
      }, 3300);
    });
  }

  // ---- checklist (remembered per viewer) ----
  var KEY = 'osaka-ep1-check';
  var state = {};
  try { state = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch(e){}
  var items = Array.prototype.slice.call(document.querySelectorAll('.check li'));
  function meter(){
    var on = items.filter(function(li){ return li.classList.contains('on'); }).length;
    var pct = items.length ? Math.round(on / items.length * 100) : 0;
    var m = document.getElementById('meter'), t = document.getElementById('meterTxt');
    if (m) m.style.width = pct + '%';
    if (t) t.textContent = pct === 100 ? '출발! 🎉' : pct + '%';
  }
  items.forEach(function(li, i){
    if (state[i]) li.classList.add('on');
    li.addEventListener('click', function(ev){
      ev.stopPropagation();
      li.classList.toggle('on');
      state[i] = li.classList.contains('on');
      try { localStorage.setItem(KEY, JSON.stringify(state)); } catch(e){}
      meter();
    });
  });
  meter();

  // ---- tap-to-zoom photos ----
  var lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML = '<span class="lb-x">×</span><img alt=""><div class="lb-cap"></div>';
  document.body.appendChild(lb);
  function closeLb(){ lb.classList.remove('open'); }
  lb.addEventListener('click', closeLb);
  document.addEventListener('keydown', function(e){
    if (!lb.classList.contains('open')) return;
    e.stopPropagation(); e.preventDefault();
    if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') closeLb();
  }, true);
  document.querySelectorAll('.slide img').forEach(function(img){
    img.addEventListener('click', function(ev){
      ev.stopPropagation();
      var fig = img.closest('figure');
      var cap = (fig && fig.querySelector('figcaption')) ? fig.querySelector('figcaption').textContent : img.alt;
      lb.querySelector('img').src = img.src;
      lb.querySelector('.lb-cap').textContent = cap || '';
      lb.classList.add('open');
    });
  });

  // ---- mobile: reflow slides into a vertical feed ----
  var deck = document.querySelector('.deck');
  function layout(){
    var w = window.innerWidth, h = window.innerHeight;
    var mobile = w <= 900 || h <= 500;
    document.body.classList.toggle('mobile', mobile);
    if (deck) deck.style.zoom = mobile ? String(w / 600) : '';
  }
  layout();
  window.addEventListener('resize', layout);
  window.addEventListener('load', layout);
  window.addEventListener('orientationchange', layout);

  // ---- photo credits ----
  var box = document.getElementById('credits');
  if (box && window.PHOTO_CREDITS){
    box.innerHTML = '<b style="color:#b9b3dd">PHOTOS</b> · Wikimedia Commons — ' + window.PHOTO_CREDITS.map(function(c){
      var who = c.a ? c.a.replace(/</g,'&lt;') : 'unknown';
      return '<a href="' + c.u + '" target="_blank" rel="noopener">' + c.n + '</a>: ' + who + ' (' + c.l + ')';
    }).join(' · ');
  }
})();
