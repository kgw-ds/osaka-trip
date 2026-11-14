/* 집중소 EP.1 — clock timetable drawn like a real wall clock (1–12).
   Outer ring = 오후 (12:00–24:00), inner ring = 오전 (0:00–12:00).
   Tapping a slice or a legend row shows it in the centre and swings the hand. */
(function(){
  'use strict';
  var CAT = {
    air:   {c:'#9b4dff', ink:'#fff', name:'비행'},
    move:  {c:'#cfc7b5', ink:'#1b1b1f', name:'이동'},
    food:  {c:'#ff3d7f', ink:'#fff', name:'먹방'},
    shop:  {c:'#ffd23f', ink:'#1b1b1f', name:'쇼핑'},
    sight: {c:'#3ec1f3', ink:'#1b1b1f', name:'관광'},
    onsen: {c:'#22c38e', ink:'#1b1b1f', name:'온천'},
    drink: {c:'#ff8a3d', ink:'#1b1b1f', name:'술 · 밤'},
    free:  {c:'#ffffff', ink:'#1b1b1f', name:'자유 · 준비'}
  };
  var DAYS = {
    d1: {label:'DAY 1 · 12.19 토', range:'11:20 → 24:00',
      gaps:[{s:'00:00', e:'11:20', t:'🧳 출국 준비'}],
      items:[
        ['11:20','13:05','air','김포 → 간사이','피치항공 비행 ✈'],
        ['13:05','13:50','move','간사이공항 T2','입국 심사'],
        ['13:50','16:20','move','공항 → 호텔','셔틀 · 난카이선 · 지하철, 체크인'],
        ['16:50','17:50','food','센니치마에','오코노미야키 첫 식사'],
        ['18:10','18:40','shop','포켓몬센터 DX','20시 폐점 전에!'],
        ['18:40','19:30','shop','신사이바시스지','쇼핑 · 미도스지 일루미네이션'],
        ['19:30','20:00','sight','도톤보리','글리코상 · 에비스바시'],
        ['20:00','20:20','sight','호젠지 요코초','등불 골목과 사찰'],
        ['20:20','21:10','food','난바 간식','타코야키 · 551 부타만'],
        ['21:15','23:00','drink','토리키조쿠','야키토리 이자카야 🍻'],
        ['23:00','24:00','free','자유시간','호텔 복귀 또는 밤거리']
      ]},
    d2: {label:'DAY 2 · 12.20 일', range:'10:00 → 24:00', sun:'16:50',
      gaps:[{s:'00:00', e:'10:00', t:'😴 꿀잠'}],
      items:[
        ['10:00','10:30','free','호텔','기상 · 준비 후 출발'],
        ['10:50','11:20','shop','Hareruya 2','포켓몬카드 전문점'],
        ['11:25','11:55','shop','슈퍼 포테이토','레트로 게임 · 시세 파악'],
        ['12:00','12:20','shop','스루가야','중고 게임 · 피규어'],
        ['12:20','12:45','shop','GEO','NDSL · 3DS 가격 체크'],
        ['12:50','13:20','shop','게임탐정단','에비스초 · 남쪽 거리',1],
        ['13:35','14:30','food','신세카이','쿠시카츠 다루마 점심'],
        ['14:30','15:20','sight','츠텐카쿠 일대','거리 사진 · 스마트볼',1],
        ['15:20','16:00','move','텐노지','하루카스 이동 · 입장'],
        ['16:00','17:15','sight','하루카스 300','전망대 · 16:50 일몰 · 야경'],
        ['17:25','17:45','sight','텐시바','크리스마스 마켓 🎄',1],
        ['18:00','19:40','onsen','스파월드','온천 · 사우나 ♨️'],
        ['20:20','21:50','food','난바 야키니쿠','리키마루 · 20:30 예약'],
        ['22:00','24:00','drink','난바','이자카야 · 야식 · 자유시간']
      ]}
  };

  var NS = 'http://www.w3.org/2000/svg', C = 480;
  var PM = [296, 388], AM = [222, 286];
  function mins(t){ var p = t.split(':'); return (+p[0]) * 60 + (+p[1]); }
  // 12-hour dial angle; an end time on the hour of 12/24 closes the circle
  function ang(m, isEnd){ var x = m % 720; if (isEnd && x === 0 && m > 0) x = 720; return x / 720 * 360; }
  function pt(r, a){ var rad = (a - 90) * Math.PI / 180; return [C + r * Math.cos(rad), C + r * Math.sin(rad)]; }
  function el(tag, attrs, parent){
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function slice(a0, a1, r){
    if (a1 - a0 >= 359.99) a1 = a0 + 359.99;
    var big = (a1 - a0) > 180 ? 1 : 0;
    var p0 = pt(r[1], a0), p1 = pt(r[1], a1), p2 = pt(r[0], a1), p3 = pt(r[0], a0);
    return 'M' + p0 + 'A' + r[1] + ',' + r[1] + ' 0 ' + big + ' 1 ' + p1 +
           'L' + p2 + 'A' + r[0] + ',' + r[0] + ' 0 ' + big + ' 0 ' + p3 + 'Z';
  }
  // split a stop at noon so each part lands on the right ring
  function parts(s, e){
    var m0 = mins(s), m1 = mins(e), out = [];
    if (m0 < 720 && m1 > 720){ out.push([m0, 720]); out.push([720, m1]); }
    else out.push([m0, m1]);
    return out.map(function(p){
      return {ring: p[0] < 720 ? AM : PM, a0: ang(p[0]), a1: ang(p[1], true)};
    });
  }

  function build(wrap){
    var day = DAYS[wrap.getAttribute('data-clock')];
    if (!day) return;
    var svg = el('svg', {viewBox:'-20 -20 1000 1000', class:'clock-svg', role:'img', 'aria-label':day.label + ' 시간표'});

    el('path', {d:slice(0, 360, PM), class:'ring-pm'}, svg);
    el('path', {d:slice(0, 360, AM), class:'ring-am'}, svg);

    day.gaps.forEach(function(g){
      var a0 = ang(mins(g.s)), a1 = ang(mins(g.e), true);
      var p = pt((AM[0] + AM[1]) / 2, (a0 + a1) / 2);
      el('text', {x:p[0], y:p[1], class:'gap-label'}, svg).textContent = g.t;
    });

    var segs = [], badges = [];
    day.items.forEach(function(it, i){
      var group = el('g', {class:'seg'}, svg), best = null;
      parts(it[0], it[1]).forEach(function(p){
        el('path', {d:slice(p.a0, p.a1, p.ring), fill:CAT[it[2]].c}, group);
        if (!best || p.a1 - p.a0 > best.a1 - best.a0) best = p;
      });
      group._at = best;
      bind(group, i);
      segs.push(group);
    });

    // dial: hour ticks and 1–12
    el('circle', {cx:C, cy:C, r:AM[0], class:'face'}, svg);
    for (var h = 0; h < 60; h++){
      var a = h * 6, hour = h % 5 === 0;
      var p0 = pt(AM[0], a), p1 = pt(AM[0] - (hour ? 18 : 8), a);
      el('line', {x1:p0[0], y1:p0[1], x2:p1[0], y2:p1[1], class:'tick' + (hour ? ' major' : '')}, svg);
    }
    for (var n = 1; n <= 12; n++){
      var tp = pt(AM[0] - 42, n * 30);
      el('text', {x:tp[0], y:tp[1], class:'hr' + (n % 3 === 0 ? ' major' : '')}, svg).textContent = n;
    }

    // number badges: inside the slice when there is room, otherwise outside on a leader line
    var flip = 0;
    day.items.forEach(function(it, i){
      var at = segs[i]._at, mid = (at.a0 + at.a1) / 2, cat = CAT[it[2]];
      var g = el('g', {class:'badge'}, svg), r = (at.ring[0] + at.ring[1]) / 2;
      if (at.a1 - at.a0 < 9){
        r = flip++ % 2 ? 456 : 424;
        var q0 = pt(PM[1], mid), q1 = pt(r - 20, mid);
        el('line', {x1:q0[0], y1:q0[1], x2:q1[0], y2:q1[1], class:'leader'}, g);
      }
      var p = pt(r, mid);
      el('circle', {cx:p[0], cy:p[1], r:21, fill:cat.c}, g);
      el('text', {x:p[0], y:p[1] + 1, fill:cat.ink}, g).textContent = i + 1;
      bind(g, i);
      badges.push(g);
    });

    if (day.sun){
      var sp = pt(PM[1] + 34, ang(mins(day.sun)));
      el('text', {x:sp[0] + 30, y:sp[1] + 6, class:'sun'}, svg).textContent = '🌅';
    }

    // hand, then the centre read-out on top of it
    var hand = el('g', {class:'hand'}, svg);
    el('line', {x1:C, y1:C, x2:C, y2:C - AM[0] + 30}, hand);
    el('circle', {cx:C, cy:C, r:14, fill:'#1b1b1f'}, svg);
    var cDay = el('text', {x:C, y:C - 88, class:'c-day'}, svg);
    var cTime = el('text', {x:C, y:C - 40, class:'c-time'}, svg);
    var cPlace = el('text', {x:C, y:C + 66, class:'c-place'}, svg);
    var cWhat = el('text', {x:C, y:C + 104, class:'c-what'}, svg);

    // legend
    var list = document.createElement('ul');
    list.className = 'clock-legend';
    day.items.forEach(function(it, i){
      var cat = CAT[it[2]], li = document.createElement('li');
      if (it[5]) li.className = 'opt';
      li.innerHTML = '<span class="b" style="background:' + cat.c + ';color:' + cat.ink + '">' + (i + 1) + '</span>' +
        '<span class="tm">' + it[0] + '~' + it[1] + '</span>' +
        '<span class="pl">' + it[3] + ' <small>' + it[4] + '</small></span>';
      bind(li, i);
      list.appendChild(li);
    });
    var used = {};
    day.items.forEach(function(it){ used[it[2]] = 1; });
    var keys = document.createElement('div');
    keys.className = 'clock-keys';
    keys.innerHTML = Object.keys(used).map(function(k){
      return '<span><i style="background:' + CAT[k].c + '"></i>' + CAT[k].name + '</span>';
    }).join('') + '<span class="ring-key">안쪽 링 = 오전 · 바깥 링 = 오후</span>';

    function bind(node, i){
      node.addEventListener('mouseenter', function(){ pick(i); });
      node.addEventListener('click', function(e){ e.stopPropagation(); pick(i); });
    }
    var current = -1;
    function mark(i){
      segs.forEach(function(s, k){ s.classList.toggle('on', k === i); });
      badges.forEach(function(b, k){ b.classList.toggle('on', k === i); });
      Array.prototype.forEach.call(list.children, function(li, k){ li.classList.toggle('on', k === i); });
    }
    function point(t){ hand.style.transform = 'rotate(' + ang(mins(t)) + 'deg)'; }
    function pick(i){
      if (i === current) return;
      current = i;
      wrap.classList.add('picking');
      mark(i);
      var it = day.items[i];
      cDay.textContent = (mins(it[0]) < 720 ? '오전 · ' : '오후 · ') + CAT[it[2]].name;
      cTime.textContent = it[0] + ' ~ ' + it[1];
      cPlace.textContent = it[3];
      cWhat.textContent = it[4];
      point(it[0]);
    }
    function reset(){
      current = -1;
      wrap.classList.remove('picking');
      mark(-1);
      cDay.textContent = day.label;
      cTime.textContent = day.range;
      cPlace.textContent = day.items.length + '개 일정';
      cWhat.textContent = '조각을 눌러 보세요 👆';
      point(day.items[0][0]);
    }
    wrap.addEventListener('mouseleave', reset);
    svg.addEventListener('click', reset);

    var left = document.createElement('div');
    left.className = 'clock-left';
    left.appendChild(svg);
    var right = document.createElement('div');
    right.appendChild(list);
    right.appendChild(keys);
    wrap.classList.add('clock-layout');
    wrap.appendChild(left);
    wrap.appendChild(right);
    reset();
  }

  document.querySelectorAll('[data-clock]').forEach(build);
})();
