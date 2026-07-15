/* Il Cavallante — main.js */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* INTRO */
  var intro = document.getElementById('intro');
  if (intro) {
    if (reduce) intro.classList.add('is-done');
    else {
      var kill = function () { intro.classList.add('is-done'); };
      setTimeout(kill, 1800);
      intro.addEventListener('click', kill);
      window.addEventListener('scroll', kill, { once: true, passive: true });
    }
  }

  /* HEADER */
  var head = document.getElementById('head');
  var onScroll = function () { if (head) head.classList.toggle('is-scrolled', window.scrollY > 40); };
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  /* MENU */
  var burger = document.getElementById('burger'), nav = document.getElementById('nav'), lastFocus = null;
  function openMenu() { nav.classList.add('is-open'); burger.setAttribute('aria-expanded', 'true'); lastFocus = document.activeElement; var f = nav.querySelector('a'); if (f) f.focus(); document.addEventListener('keydown', esc); }
  function closeMenu() { nav.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); document.removeEventListener('keydown', esc); if (lastFocus) burger.focus(); }
  function esc(e) { if (e.key === 'Escape') closeMenu(); }
  if (burger && nav) {
    burger.addEventListener('click', function () { nav.classList.contains('is-open') ? closeMenu() : openMenu(); });
    nav.addEventListener('click', function (e) { if (e.target.tagName === 'A') closeMenu(); });
    window.addEventListener('resize', function () { if (window.innerWidth > 960 && nav.classList.contains('is-open')) closeMenu(); });
  }

  /* REVEAL */
  var reveals = document.querySelectorAll('.reveal');
  function showAll() { reveals.forEach(function (el) { el.classList.add('is-visible'); }); }
  if (reduce || !('IntersectionObserver' in window)) showAll();
  else {
    var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); } }); }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
    setTimeout(function () { if (!document.querySelector('.reveal.is-visible')) showAll(); }, 1500);
  }

  /* ORARI — Lun-Ven 18:00–00:30 (scavalca mezzanotte), Sab/Dom chiuso */
  (function () {
    var hoursEl = document.getElementById('hours'), statusEl = document.getElementById('status');
    if (!hoursEl) return;
    var day, hour, min;
    try {
      var f = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Rome', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false });
      var p = f.formatToParts(new Date());
      var map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      day = map[p.find(function (x) { return x.type === 'weekday'; }).value];
      hour = parseInt(p.find(function (x) { return x.type === 'hour'; }).value, 10);
      min = parseInt(p.find(function (x) { return x.type === 'minute'; }).value, 10);
    } catch (e) { var d = new Date(); day = d.getDay(); hour = d.getHours(); min = d.getMinutes(); }
    var mins = hour * 60 + min, OPEN = 18 * 60, TAIL = 30;
    var startDays = [1, 2, 3, 4, 5];          // sere di apertura
    var tailDays = [2, 3, 4, 5, 6];           // 00:00–00:30 = coda della sera prima
    var isOpen = (startDays.indexOf(day) >= 0 && mins >= OPEN) || (tailDays.indexOf(day) >= 0 && mins < TAIL);
    // evidenzia il giorno della sessione (se coda notturna, il giorno prima)
    var sessDay = (mins < TAIL && tailDays.indexOf(day) >= 0) ? (day + 6) % 7 : day;
    var todayLi = hoursEl.querySelector('li[data-day="' + sessDay + '"]');
    if (todayLi) todayLi.classList.add('is-today');
    function nextStart(from) { var d = from; for (var i = 0; i < 7; i++) { d = (d + 1) % 7; if (startDays.indexOf(d) >= 0) return d; } return 1; }
    var itDays = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
    var enDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    function render(lang) {
      var html;
      if (isOpen) {
        html = '<span class="open">● ' + (lang === 'it' ? 'Aperto ora' : 'Open now') + '</span> · ' + (lang === 'it' ? 'chiude alle 00:30' : 'closes at 00:30');
      } else if (startDays.indexOf(day) >= 0 && mins < OPEN) {
        html = '<span class="closed">● ' + (lang === 'it' ? 'Chiuso' : 'Closed') + '</span> · ' + (lang === 'it' ? 'apre oggi alle 18' : 'opens today at 6pm');
      } else {
        var nd = nextStart(day), name = (lang === 'it' ? itDays[nd] : enDays[nd]);
        html = '<span class="closed">● ' + (lang === 'it' ? 'Chiuso' : 'Closed') + '</span> · ' + (lang === 'it' ? 'apre ' + name + ' alle 18' : 'opens ' + name + ' at 6pm');
      }
      if (statusEl) statusEl.innerHTML = html;
    }
    window.__renderHours = render;
    render(document.documentElement.lang === 'en' ? 'en' : 'it');
  })();

  /* LIGHTBOX */
  (function () {
    var lb = document.getElementById('lightbox'), lbImg = document.getElementById('lbImg'), lbClose = document.getElementById('lbClose');
    if (!lb) return; var opener = null;
    function open(src, alt) { lbImg.src = src; lbImg.alt = alt || ''; lb.classList.add('is-open'); lb.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; lbClose.focus(); }
    function close() { lb.classList.remove('is-open'); lb.setAttribute('aria-hidden', 'true'); lbImg.src = ''; document.body.style.overflow = ''; if (opener) opener.focus(); }
    document.querySelectorAll('.shot').forEach(function (b) { b.addEventListener('click', function () { opener = b; var i = b.querySelector('img'); open(b.getAttribute('data-full'), i ? i.alt : ''); }); });
    lbClose.addEventListener('click', close);
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && lb.classList.contains('is-open')) close(); });
  })();

  /* i18n */
  var EN = {
    'intro.sub': 'the wine bar with no sign',
    'nav.story': 'The carter', 'nav.cellar': 'The cellar', 'nav.kitchen': 'To eat', 'nav.where': 'Find us',
    'cta.book': 'Book',
    'hero.eyebrow': 'Wine bar · Porta Romana, Milan · from 6pm', 'hero.t1': 'No sign.', 'hero.t2': 'Just wine.',
    'hero.lead': 'A cellar you find only if you look for it. Hundreds of labels, one glass at a time, late into the evening.',
    'hero.cta1': 'Discover the cellar', 'hero.cta2': 'Find us',
    'story.eyebrow': 'The name', 'story.t1': 'Who was', 'story.t2': 'the carter',
    'story.p1': 'The “cavallante” was the one who drove the cart: he carried the barrels from village to village, back when wine travelled slowly, on dirt roads. A trade of hard work and trust.',
    'story.p2': 'Hence the name. And hence the idea: no sign, no flashy window. Just a door, a wall of bottles and someone who knows how to advise you. Those who find us, come back.',
    'story.pull': '“A complete jewel in Milan — worth a detour just to make sure you get here.”',
    'cellar.eyebrow': 'The cellar', 'cellar.t1': 'A wall of', 'cellar.t2': 'labels',
    'cellar.lead': 'Hundreds of bottles, from the everyday glass to the rare find. Prices are hand-written, the old way. Just ask — there is always someone ready to advise you.',
    'cellar.i1': 'Wines by the glass', 'cellar.i2': 'Bottles to take away', 'cellar.i3': 'Champagne & sparkling', 'cellar.i4': "Sommelier's pick",
    'cellar.note': 'Natural selection, small producers, a few labels you won’t find elsewhere.',
    'kitchen.eyebrow': 'To eat', 'kitchen.t1': 'Not just', 'kitchen.t2': 'an aperitivo',
    'kitchen.lead': 'Boards of cured meats and cheese, focaccia with culatello, creamed cod and kitchen dishes that hold their own against any restaurant — made to go with the bottle.',
    'kitchen.d1': 'Board & glass', 'kitchen.d2': 'The cured meats', 'kitchen.d3': "The day's kitchen",
    'rev.eyebrow': 'What visitors say', 'rev.t1': 'Those who find it,', 'rev.t2': 'return', 'rev.lead': 'Real reviews from Google · 4.5 out of 324.',
    'rev.q1': 'An excellent wine selection and a setting for wine lovers, elegant and welcoming. Knowledgeable, kind staff. The focaccia with culatello and the creamed cod were great.',
    'rev.q2': 'Everything excellent, from the setting to the food and the wines. Rich menu, staff always ready to advise to taste. A special thanks to Francesco.',
    'rev.q3': 'A complete jewel in Milan. It is worth a detour. Even though Google brands it as a wine bar, the food is outstanding. It can compete with any restaurant.',
    'rev.q4': 'A quiet spot, superbly stocked, with friendly and knowledgeable staff.',
    'rev.q5': 'A more-than-worthy wine bar, to try and try again.',
    'where.eyebrow': 'Find us', 'where.t1': 'Look for the', 'where.t2': 'door',
    'where.hint': 'No sign: we are at Via Lodovico Muratori 3, steps from the Porta Romana arch. The right door is the one with the wall of bottles you can glimpse inside.',
    'day.mon': 'Monday', 'day.tue': 'Tuesday', 'day.wed': 'Wednesday', 'day.thu': 'Thursday', 'day.fri': 'Friday', 'day.sat': 'Saturday', 'day.sun': 'Sunday', 'closed': 'Closed',
    'faq.eyebrow': 'Questions', 'faq.t1': 'Before you', 'faq.t2': 'come',
    'faq.q1': "Where are you? I can't see the sign.", 'faq.a1': 'That’s exactly it: we are a wine bar with no sign, at Via Lodovico Muratori 3, in Porta Romana. Look for the door — the cellar is inside.',
    'faq.q2': 'Do I need to book?', 'faq.a2': 'For a table in the evening, best to call 02 5410 7325. For a glass at the counter, just drop by.',
    'faq.q3': 'Can I have dinner or just an aperitivo?', 'faq.a3': 'Both. Beyond boards and wines by the glass we serve kitchen dishes that go with the bottle, late into the night.',
    'faq.q4': 'When are you open?', 'faq.a4': 'Monday to Friday, 6pm to 00:30. Closed Saturday and Sunday.',
    'foot.tag': 'Wine bar with no sign · Porta Romana, Milan', 'foot.demo': 'Demo website by Bespoke Studio',
    'ab.call': 'Call', 'ab.where': 'Find us', 'ab.cellar': 'The cellar'
  };
  var nodes = document.querySelectorAll('[data-i18n]');
  nodes.forEach(function (el) { el.dataset.it = el.textContent; });
  function setLang(lang) {
    document.documentElement.lang = lang;
    nodes.forEach(function (el) { var k = el.getAttribute('data-i18n'); el.textContent = (lang === 'en' && EN[k] != null) ? EN[k] : el.dataset.it; });
    document.querySelectorAll('.lang__btn').forEach(function (b) { var on = b.getAttribute('data-lang') === lang; b.classList.toggle('is-active', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    if (window.__renderHours) window.__renderHours(lang);
    try { localStorage.setItem('cav-lang', lang); } catch (e) {}
  }
  document.querySelectorAll('.lang__btn').forEach(function (b) { b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); }); });
  var saved; try { saved = localStorage.getItem('cav-lang'); } catch (e) {}
  if (saved === 'en') setLang('en');

  var y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
})();
