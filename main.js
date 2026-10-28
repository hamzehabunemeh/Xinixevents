(function () {
  'use strict';
  document.documentElement.classList.add('js');

  var CFG = window.XINIX || {};
  var EVENTS = window.XINIX_EVENTS || [];
  var NS = 'http://www.w3.org/2000/svg';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- Contact links ---------- */
  var links = {
    whatsapp: CFG.whatsapp ? 'https://wa.me/' + String(CFG.whatsapp).replace(/\D/g, '') : '',
    instagram: CFG.instagram ? 'https://instagram.com/' + String(CFG.instagram).replace(/^@/, '') : '',
    email: CFG.email ? 'mailto:' + CFG.email : ''
  };
  var labels = {
    whatsapp: CFG.whatsapp ? '+' + String(CFG.whatsapp).replace(/\D/g, '') : '',
    instagram: CFG.instagram ? '@' + String(CFG.instagram).replace(/^@/, '') : '',
    email: CFG.email || ''
  };
  $$('[data-social]').forEach(function (a) {
    var k = a.getAttribute('data-social');
    if (links[k]) {
      a.href = links[k];
      if (k === 'email') { a.removeAttribute('target'); }
    } else {
      a.classList.add('pending');
      a.setAttribute('aria-disabled', 'true');
      a.removeAttribute('target');
      a.addEventListener('click', function (e) { e.preventDefault(); });
    }
  });
  $$('[data-label]').forEach(function (el) {
    var k = el.getAttribute('data-label');
    if (labels[k]) el.textContent = labels[k];
  });
  var extra = $('#extra');
  if (extra) {
    if (CFG.phone) extra.insertAdjacentHTML('beforeend', '<li><svg class="ico" aria-hidden="true"><use href="#i-phone"/></svg><a href="tel:' + CFG.phone.replace(/[^\d+]/g, '') + '">' + esc(CFG.phone) + '</a></li>');
    if (CFG.location) extra.insertAdjacentHTML('beforeend', '<li><svg class="ico" aria-hidden="true"><use href="#i-pin"/></svg><span>' + esc(CFG.location) + '</span></li>');
  }
  var allT = $('#all-tickets');
  if (allT && CFG.ticketsUrl) { allT.href = CFG.ticketsUrl; allT.hidden = false; }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------- Events ---------- */
  (function renderEvents() {
    var grid = $('#events-grid'), empty = $('#events-empty');
    if (!grid) return;
    var months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    var list = EVENTS.slice().sort(function (a, b) { return String(a.date).localeCompare(String(b.date)); });
    if (!list.length) { grid.hidden = true; return; }
    empty.hidden = true;
    grid.innerHTML = list.map(function (ev) {
      var d = ev.date ? new Date(ev.date + 'T12:00:00') : null;
      var valid = d && !isNaN(d);
      var priv = ev.type === 'private';
      var media = ev.image
        ? 'style="background-image:url(\'' + esc(ev.image) + '\')"'
        : '';
      var ph = ev.image ? '' : '<img class="event__ph" src="assets/logo-n.png" alt="">';
      var meta = [ev.venue, ev.city].filter(Boolean).join(' · ');
      var when = [valid ? d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '', ev.time].filter(Boolean).join(' · ');
      var btn = ev.soldOut
        ? '<span class="btn is-off">Sold out</span>'
        : (ev.ticketUrl
          ? '<a class="btn btn--solid" href="' + esc(ev.ticketUrl) + '" target="_blank" rel="noopener">Get tickets <svg class="ico" aria-hidden="true"><use href="#i-arrow"/></svg></a>'
          : '<a class="btn" href="#invite">Request invite</a>');
      return '<article class="event reveal">' +
        '<div class="event__media" ' + media + '>' + ph +
        (valid ? '<div class="event__date"><b>' + d.getDate() + '</b>' + months[d.getMonth()] + '</div>' : '') +
        '</div><div class="event__body">' +
        '<span class="tag' + (priv ? ' tag--private' : '') + '">' + (priv ? 'Private' : 'Public') + '</span>' +
        '<h3>' + esc(ev.title) + '</h3>' +
        (when ? '<p class="event__meta">' + esc(when) + '</p>' : '') +
        (meta ? '<p class="event__meta">' + esc(meta) + '</p>' : '') +
        '<div class="event__foot"><span class="price">' + esc(ev.price || '') + '</span>' + btn + '</div>' +
        '</div></article>';
    }).join('');
  })();

  /* ---------- Gallery ---------- */
  (function () {
    var g = CFG.gallery || [];
    if (!g.length) return;
    $('#gallery').hidden = false;
    $('#gallery-grid').innerHTML = g.map(function (src) {
      return '<img src="' + esc(src) + '" alt="XINIX Events moment" loading="lazy">';
    }).join('');
  })();

  /* ---------- Hero stage (beams + crowd) ---------- */
  var stageEl = $('#stage'), svg = $('#stage-svg');
  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function el(name, attrs, parent) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function buildBeams() {
    var defs = $('defs', svg), g = $('#beams');
    // source x,y -> target x,y, far half-width, color
    var B = [
      [430, -40, 960, 470, 64, '#19e6f2'],
      [1560, -10, 1290, 400, 40, '#19e6f2'],
      [1680, 470, 1330, 600, 70, '#d12bf2'],
      [-60, 520, 640, 640, 80, '#d12bf2'],
      [1000, -30, 1010, 420, 22, '#8b5cff']
    ];
    B.forEach(function (b, i) {
      var sx = b[0], sy = b[1], tx = b[2], ty = b[3], w = b[4], col = b[5];
      var dx = tx - sx, dy = ty - sy, len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len;
      var id = 'bg' + i;
      var lg = el('linearGradient', { id: id, gradientUnits: 'userSpaceOnUse', x1: sx, y1: sy, x2: tx, y2: ty }, defs);
      el('stop', { offset: 0, 'stop-color': col, 'stop-opacity': .95 }, lg);
      el('stop', { offset: .55, 'stop-color': col, 'stop-opacity': .38 }, lg);
      el('stop', { offset: 1, 'stop-color': col, 'stop-opacity': 0 }, lg);
      var grp = el('g', { 'class': 'beam', style: 'transform-origin:' + sx + 'px ' + sy + 'px' }, g);
      var pts = [
        (sx + nx * 2) + ',' + (sy + ny * 2), (sx - nx * 2) + ',' + (sy - ny * 2),
        (tx - nx * w) + ',' + (ty - ny * w), (tx + nx * w) + ',' + (ty + ny * w)
      ].join(' ');
      el('polygon', { points: pts, fill: 'url(#' + id + ')', filter: 'url(#beamBlur)' }, grp);
    });
  }
  function buildCrowd() {
    var g = $('#crowd'), r = rng(20261028);
    var rows = [
      { y: 668, s: .62, fill: '#1a1236', step: 22, rim: false, arms: .55 },
      { y: 730, s: .8, fill: '#0e0922', step: 28, rim: false, arms: .5 },
      { y: 805, s: 1.02, fill: '#04030a', step: 38, rim: false, arms: .4 },
      { y: 890, s: 1.35, fill: '#010103', step: 54, rim: false, arms: .3 }
    ];
    rows.forEach(function (row) {
      var grp = el('g', {}, g);
      el('rect', { x: -10, y: row.y + 36 * row.s, width: 1620, height: 1100, fill: row.fill }, grp);
      for (var x = -30; x < 1650; x += row.step * (.75 + r() * .5)) {
        var cy = row.y + (r() - .5) * 26 * row.s, hr = 17 * row.s * (.9 + r() * .2);
        var rim = x < 800 ? '#19e6f2' : (x < 1250 ? '#8b5cff' : '#e02bf5');
        if (r() < row.arms) {
          var up = (80 + r() * 90) * row.s, dx = (r() - .5) * 70 * row.s, side = r() < .5 ? -1 : 1;
          var sxp = x + side * 16 * row.s, syp = cy + 34 * row.s;
          var ag = el('g', { 'class': 'arm', style: 'animation-duration:' + (1.6 + r() * 1.6).toFixed(2) + 's;animation-delay:-' + (r() * 3).toFixed(2) + 's' }, grp);
          el('path', { d: 'M' + sxp + ' ' + syp + ' L' + (sxp + dx) + ' ' + (syp - up), stroke: row.fill, 'stroke-width': 10 * row.s, 'stroke-linecap': 'round', fill: 'none' }, ag);
          el('circle', { cx: sxp + dx, cy: syp - up - 4 * row.s, r: 7 * row.s, fill: row.fill }, ag);
        }
        el('ellipse', { cx: x, cy: cy + 44 * row.s, rx: 36 * row.s, ry: 44 * row.s, fill: row.fill }, grp);
        var head = el('circle', { cx: x, cy: cy, r: hr, fill: row.fill }, grp);
        if (row.rim) { head.setAttribute('stroke', rim); head.setAttribute('stroke-opacity', '.2'); head.setAttribute('stroke-width', '1.4'); }
      }
    });
  }
  function fitStage() {
    if (!stageEl) return;
    var b = stageEl.getBoundingClientRect();
    if (!b.width || !b.height) return;
    var a = b.width / b.height;
    if (a >= 1.55) { svg.setAttribute('viewBox', '0 0 1600 1000'); return; }
    var vw = Math.min(1600, 1000 * a), x = 1030 - vw / 2;
    x = Math.max(0, Math.min(1600 - vw, x));
    svg.setAttribute('viewBox', x.toFixed(1) + ' 0 ' + vw.toFixed(1) + ' 1000');
  }
  if (svg) { buildBeams(); buildCrowd(); fitStage(); window.addEventListener('resize', fitStage); }

  /* ---------- Header / nav ---------- */
  var header = $('.site-header'), burger = $('.burger'), nav = $('#nav');
  function onScroll() { header.classList.toggle('scrolled', window.scrollY > 30); }
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
  function setMenu(open) {
    nav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  burger.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  // active section highlight
  if ('IntersectionObserver' in window) {
    var navMap = {};
    $$('[data-nav]').forEach(function (a) { navMap[a.getAttribute('data-nav')] = a; });
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          $$('[data-nav]').forEach(function (a) { a.classList.remove('active'); });
          var a = navMap[en.target.id]; if (a) a.classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['events', 'experience', 'about', 'contact'].forEach(function (id) { var s = document.getElementById(id); if (s) so.observe(s); });

    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); ro.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    $$('.reveal').forEach(function (n) { ro.observe(n); });
  } else {
    $$('.reveal').forEach(function (n) { n.classList.add('in'); });
  }

  /* ---------- Private invite form (Netlify Forms, AJAX) ---------- */
  var form = $('#invite-form'), msg = $('#form-msg');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = $('button[type=submit]', form);
      msg.className = 'form__msg'; msg.textContent = 'Sending…'; btn.disabled = true;
      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form)).toString()
      }).then(function (r) {
        if (!r.ok) throw new Error('bad status');
        form.reset();
        msg.className = 'form__msg ok';
        msg.textContent = 'Thank you — your request has been received. We\'ll be in touch soon.';
      }).catch(function () {
        msg.className = 'form__msg err';
        msg.textContent = 'Something went wrong. Please try again, or contact us on WhatsApp or email.';
      }).then(function () { btn.disabled = false; });
    });
  }

  var y = $('#year'); if (y) y.textContent = new Date().getFullYear();
})();
