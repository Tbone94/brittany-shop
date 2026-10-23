// Page behavior: the turning hero, the shop grid, the quick-view popup and the bag.
(() => {
  const P = window.PRODUCTS, FAMILIES = window.FAMILIES, S = window.StandIn;
  const N = S.ANGLES.length;
  const ANGLE_NAMES = ['Left profile', 'Left side', 'Left three-quarter', 'Front', 'Right three-quarter', 'Right side', 'Right profile'];
  const $ = id => document.getElementById(id);
  const money = n => `$${n}`;
  const no = p => `No. ${String(P.indexOf(p) + 1).padStart(2, '0')}`;
  const dots = colors => colors.map(c => `<span class="dot-c" style="--c:${c}"></span>`).join('');
  const touchOnly = matchMedia('(hover: none)').matches;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // A necklace's colors on an element: its accent, and a light two-tone background for its photo tiles
  // (a tint of the splash's second color, so no white shows behind the chest shots).
  const tintHex = (hex, amt) => { const n = parseInt(hex.slice(1), 16); return `rgb(${[n >> 16, (n >> 8) & 255, n & 255].map(v => Math.round(v + (255 - v) * amt))})`; };
  const tileBg = p => tintHex(p.splash[1] || p.splash[0], 0.5);
  const accent = (el, p) => { el.style.setProperty('--accent', p.backdrop); el.style.setProperty('--accent-ink', p.accentInk); el.style.setProperty('--tile-bg', tileBg(p)); };

  // Chest shots: photos/<slug>-1.png … <slug>-7.png (or .jpg), one necklace at seven angles,
  // left profile → right profile, on a transparent background. Until a photo exists, a drawn stand-in is used.
  // The hero shows necklace n at angle n, so it uses the same files.
  // Add ?review to the address to preview images waiting for approval in photos/review/
  // (approved ones in photos/ still show).
  const REVIEW = new URLSearchParams(location.search).has('review');
  const drawn = new Map(), photos = new Map(), painters = new Set();
  function image(p, i) {
    const base = `${p.slug}-${i + 1}`;
    if (!photos.has(base)) {
      photos.set(base, null);
      const tries = [...(REVIEW ? [`photos/review/${base}.png`] : []), `photos/${base}.png`, `photos/${base}.jpg`];
      const img = new Image();
      img.onload = () => { photos.set(base, img); painters.forEach(fn => fn()); };
      img.onerror = () => { tries.shift(); if (tries.length) img.src = tries[0]; };
      img.src = tries[0];
    }
    if (photos.get(base)) return photos.get(base);
    const key = `${p.slug}:${i}`;
    if (!drawn.has(key)) {
      const c = document.createElement('canvas');
      c.width = c.height = 720;
      S.drawCloseup(c, p, i);
      drawn.set(key, c);
    }
    return drawn.get(key);
  }
  // The glass-color splash behind a necklace's photos, and the single small accent shape used elsewhere.
  const splash = (p, seed) => window.Splash.svg(p.splash, seed, { shape: p.splashShape, rich: true });
  const shape = (color, kind, seed) => window.Splash.svg([color], seed, { shape: kind, minimal: true });

  // `zoom` crops in past a plain fill; `fy` is where the crop sits top to bottom (0 top, 0.5 middle).
  function paint(canvas, src, zoom = 1, fy = 0.5) {
    const ctx = canvas.getContext('2d'), w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const iw = src.naturalWidth || src.width, ih = src.naturalHeight || src.height, s = Math.max(w / iw, h / ih) * zoom;
    ctx.drawImage(src, (w - iw * s) / 2, (h - ih * s) * fy, iw * s, ih * s);
  }

  /* ---------- Logo dot: line the bead up with where the font draws the dot of its "i" ---------- */
  // Draw "i" and the dotless "ı" in the logo font; the pixels only "i" has are its dot.
  // Load both characters first: Google Fonts keeps "ı" in a separate file, and measuring against a
  // fallback font's "ı" would make the dot far too big.
  document.fonts.load('200px Shrikhand', 'iı').then(() => {
    const size = 200, c = document.createElement('canvas'), ctx = c.getContext('2d', { willReadFrequently: true });
    c.width = c.height = 400;
    ctx.font = `${size}px Shrikhand`;
    const m = ctx.measureText('i'), A = m.fontBoundingBoxAscent, D = m.fontBoundingBoxDescent;
    const draw = ch => { ctx.clearRect(0, 0, 400, 400); ctx.fillText(ch, 100, 300); return ctx.getImageData(0, 0, 400, 400).data; };
    const withDot = draw('i'), noDot = draw('ı');
    let x0 = 400, y0 = 400, x1 = -1, y1 = -1;
    for (let y = 0; y < 400; y++) for (let x = 0; x < 400; x++) {
      const k = (y * 400 + x) * 4 + 3;
      if (withDot[k] > 128 && noDot[k] < 40) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    }
    if (x1 < 0) return;
    // A real dot is small and near the top; anything else means the font wasn't ready, so keep the defaults.
    if ((x1 - x0) > size * 0.35 || (y1 - y0) > size * 0.35) return;
    // The .i box starts at the glyph origin; with line-height 1 its top is the baseline minus ascent minus half the leading.
    const boxTop = 300 - A - (size - (A + D)) / 2;
    if (!Number.isFinite(boxTop)) return;
    const d = Math.max(x1 - x0, y1 - y0) * 1.08, cx = (x0 + x1) / 2 - 100, cy = (y0 + y1) / 2 - boxTop;
    const root = document.documentElement.style;
    root.setProperty('--dot-size', `${(d / size).toFixed(4)}em`);
    root.setProperty('--dot-left', `${((cx - d / 2) / size).toFixed(4)}em`);
    root.setProperty('--dot-top', `${((cy - d / 2) / size).toFixed(4)}em`);
  });

  /* ---------- Bag state (kept in this browser only) ---------- */
  let bag = [];
  try { bag = JSON.parse(localStorage.getItem('bag') || '[]').filter(s => P.some(p => p.slug === s && !p.sold)); } catch { bag = []; }
  const save = () => { try { localStorage.setItem('bag', JSON.stringify(bag)); } catch { /* private mode: bag just won't persist */ } };
  const inBag = p => bag.includes(p.slug);

  /* ---------- Hero: one big centered photo that turns through the necklaces ---------- */
  // Moving across it flips through the necklaces like stop motion, each shown at its own angle,
  // from left profile (necklace 1) to right profile (necklace 7).
  const heroItems = (window.HERO || P.map(p => p.slug)).map(slug => P.find(p => p.slug === slug)).filter(Boolean).slice(0, N);
  const heroEl = $('hero'), stage = $('stage'), heroCanvas = $('heroCanvas'), pager = $('pager');
  heroItems.forEach((p, k) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', p.name);
    b.addEventListener('click', () => { stopIntro(); setHero(k); });
    pager.appendChild(b);
  });
  let cur = -1, intro = null, touched = false, press = null;

  // The photo card is wide (3:2). Wide photos are zoomed in a little so the shoulders just reach the card's sides,
  // keeping the top of the neck; older square ones fill it, trimmed top and bottom.
  const paintHero = () => {
    if (cur < 0) return;
    const src = image(heroItems[cur], cur), wide = (src.naturalWidth || src.width) > (src.naturalHeight || src.height) * 1.2;
    paint(heroCanvas, src, wide ? 1.2 : 1, wide ? 0.3 : 0.5);
  };
  painters.add(paintHero);

  function setHero(i) {
    i = Math.max(0, Math.min(heroItems.length - 1, i));
    if (i === cur) return;
    cur = i;
    paintHero();
    const p = heroItems[i];
    accent(heroEl, p);
    // The splash inside the photo card and its copy behind, which spills past the card's edges.
    $('heroSplash').innerHTML = $('heroPop').innerHTML = window.Splash.svg(p.splash, i + 1, { shape: p.splashShape, rich: true })
      .replace('<svg ', '<svg preserveAspectRatio="none" ');
    $('tagName').textContent = p.name;
    $('tagDesc').textContent = p.desc;
    $('tagPrice').textContent = p.sold ? 'Sold' : money(p.price);
    $('tagLength').textContent = p.details.Length;
    $('tagDots').innerHTML = dots(p.palette);
    [...pager.children].forEach((t, k) => { t.classList.toggle('on', k === i); t.setAttribute('aria-current', String(k === i)); });
    stage.setAttribute('aria-label', `${p.name}, ${p.sold ? 'sold' : money(p.price)}. Press Enter for details, arrow keys to turn.`);
  }
  const stopIntro = () => { touched = true; clearInterval(intro); intro = null; };
  const heroFromX = e => { const r = stage.getBoundingClientRect(); setHero(Math.floor((e.clientX - r.left) / r.width * heroItems.length)); };

  stage.addEventListener('pointermove', e => { if (e.pointerType === 'mouse' || press) { stopIntro(); heroFromX(e); } });
  stage.addEventListener('pointerdown', e => { press = { x: e.clientX, y: e.clientY }; stopIntro(); });
  stage.addEventListener('pointerup', e => {
    // A click or tap (not a drag) opens the necklace you're looking at.
    if (press && Math.hypot(e.clientX - press.x, e.clientY - press.y) < 8) openQV(heroItems[cur], cur);
    press = null;
  });
  stage.addEventListener('pointercancel', () => { press = null; });
  stage.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { stopIntro(); setHero(cur + (e.key === 'ArrowRight' ? 1 : -1)); e.preventDefault(); }
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openQV(heroItems[cur], cur); }
  });
  $('heroShop').addEventListener('click', () => openQV(heroItems[cur], cur));

  setHero(3);
  if (!reduceMotion) {
    // One quick turn on load so people see it moves, then it's theirs.
    const seq = [2, 1, 0, 1, 2, 3, 4, 5, 6, 5, 4, 3];
    let k = 0;
    setTimeout(() => {
      if (touched) return;
      intro = setInterval(() => { setHero(seq[k++]); if (k === seq.length) { clearInterval(intro); intro = null; } }, 130);
    }, 700);
  }

  /* ---------- Other small accent shapes on the page ---------- */
  const rootStyle = getComputedStyle(document.documentElement);
  document.querySelectorAll('.accent-shape[data-shape]').forEach(el => {
    el.innerHTML = shape(rootStyle.getPropertyValue(el.dataset.color).trim(), el.dataset.shape, Number(el.dataset.seed));
  });

  /* ---------- Shop grid + color filters ---------- */
  const grid = $('grid'), soldGrid = $('soldGrid'), filters = $('filters');
  $('shopCount').textContent = `${P.filter(p => !p.sold).length} available`;

  const cards = P.map(p => {
    const li = document.createElement('li');
    li.className = 'card' + (p.sold ? ' sold' : '');
    li.dataset.family = p.family;
    accent(li, p);
    li.innerHTML = `
      <button class="card-btn" type="button" aria-label="${p.name}, ${p.sold ? 'sold' : money(p.price)}">
        <div class="tile">
          <div class="splash">${splash(p, P.indexOf(p) + 40)}</div>
          <span class="badge">${p.sold ? `Sold · ${p.soldOn}` : '1 of 1'}</span>
          <canvas class="shot" width="720" height="720" aria-hidden="true"></canvas>
        </div>
        <div class="card-meta"><span class="card-name">${p.name}</span><span class="card-price">${p.sold ? 'Sold' : money(p.price)}</span></div>
        <div class="card-sub"><span>${p.details.Length} · ${p.details.Glass.split(',')[0]}</span><span class="dots">${dots(p.palette)}</span></div>
      </button>`;
    const btn = li.querySelector('button'), canvas = li.querySelector('canvas');
    let angle = 3;
    const repaint = () => paint(canvas, image(p, angle));
    painters.add(repaint);
    repaint();
    // Hovering turns the piece a little, so people see it isn't flat.
    btn.addEventListener('mouseenter', () => { angle = 5; repaint(); });
    btn.addEventListener('mouseleave', () => { angle = 3; repaint(); });
    btn.addEventListener('click', () => openQV(p, 3));
    (p.sold ? soldGrid : grid).appendChild(li);
    return li;
  });

  FAMILIES.forEach(f => {
    const count = f.key === 'all' ? P.length : P.filter(p => p.family === f.key).length;
    if (!count) return;
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'chip'; b.dataset.family = f.key;
    b.innerHTML = `<span class="dot-c" style="--c:${f.color}"></span>${f.label}<span class="n">${count}</span>`;
    filters.appendChild(b);
  });
  function setFamily(key) {
    filters.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', String(c.dataset.family === key)));
    let shown = 0, shownSold = 0;
    cards.forEach(li => {
      const on = key === 'all' || li.dataset.family === key;
      li.hidden = !on;
      if (on) li.classList.contains('sold') ? shownSold++ : shown++;
    });
    $('empty').hidden = shown > 0;
    $('found').hidden = shownSold === 0;
  }
  filters.addEventListener('click', e => { const c = e.target.closest('.chip'); if (c) setFamily(c.dataset.family); });
  $('empty').addEventListener('click', e => { if (e.target.closest('[data-family]')) setFamily('all'); });
  setFamily('all');

  /* ---------- Quick view ---------- */
  const qv = $('qv'), qvCanvas = $('qvCanvas'), qvThumbs = $('qvThumbs'), viewer = $('qvViewer'), qvHint = $('qvHint');
  let qvP = null, qvI = 3, qvPress = false;
  const paintQV = () => { if (qvP) paint(qvCanvas, image(qvP, qvI)); };
  painters.add(paintQV);

  function setQVAngle(i) {
    qvI = Math.max(0, Math.min(N - 1, i));
    paintQV();
    // The splash shifts a little with each angle, like a new stop-motion frame.
    $('qvSplash').innerHTML = splash(qvP, P.indexOf(qvP) * 10 + qvI + 100);
    [...qvThumbs.children].forEach((b, k) => b.setAttribute('aria-current', String(k === qvI)));
    $('qvAngle').textContent = `${ANGLE_NAMES[qvI]} · ${qvI + 1} of ${N}`;
  }

  function updateAdd() {
    const p = qvP, btn = $('qvAdd');
    // Sold pieces swap the buy button for "Ask for one like it".
    $('qvAddWrap').hidden = p.sold;
    $('qvAsk').hidden = !p.sold;
    btn.textContent = inBag(p) ? 'In your bag · view bag' : `Add to bag · ${money(p.price)}`;
    $('qvNotes').innerHTML = (p.sold
      ? []
      : ['Ships in 2–3 days, gift-boxed', 'Free returns within 14 days']
    ).map(t => `<li>${t}</li>`).join('');
  }

  // Each necklace gets its own link (#n/<slug>), and the browser's Back button closes the popup.
  let pushed = false;
  function openQV(p, angle = 3, fromLink = false) {
    stopIntro();
    qvP = p;
    accent(qv, p);
    if (!fromLink && location.hash !== `#n/${p.slug}`) { history.pushState(null, '', `#n/${p.slug}`); pushed = true; }
    $('qvKicker').textContent = p.sold ? `${no(p)} · Sold in ${p.soldOn}` : `${no(p)} · One of a kind`;
    $('qvName').textContent = p.name;
    $('qvPrice').textContent = p.sold ? 'Sold' : money(p.price);
    $('qvDesc').textContent = p.desc;
    $('qvColors').innerHTML = dots(p.palette);
    $('qvDetails').innerHTML = Object.entries(p.details).map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('');
    qvThumbs.innerHTML = '';
    for (let k = 0; k < N; k++) {
      const b = document.createElement('button');
      b.type = 'button'; b.setAttribute('aria-label', ANGLE_NAMES[k]);
      const c = document.createElement('canvas'); c.width = c.height = 160;
      b.appendChild(c); paint(c, image(p, k));
      b.addEventListener('click', () => { qvHint.classList.add('gone'); setQVAngle(k); });
      qvThumbs.appendChild(b);
    }
    updateAdd();
    setQVAngle(angle);
    qvHint.textContent = touchOnly ? 'Drag to turn' : 'Hover to turn';
    qvHint.classList.remove('gone');
    if (!qv.open) qv.showModal();
    qv.scrollTop = 0;
  }

  qv.addEventListener('close', () => {
    if (!location.hash.startsWith('#n/')) return;
    if (pushed) history.back(); else history.replaceState(null, '', location.pathname + location.search);
    pushed = false;
  });
  function fromHash() {
    const m = location.hash.match(/^#n\/(.+)$/), p = m && P.find(x => x.slug === m[1]);
    if (p) openQV(p, 3, true); else if (qv.open) { pushed = false; qv.close(); }
  }
  window.addEventListener('popstate', fromHash);


  const qvFromX = e => { const r = viewer.getBoundingClientRect(); setQVAngle(Math.floor((e.clientX - r.left) / r.width * N)); };
  viewer.addEventListener('pointermove', e => { if (e.pointerType === 'mouse' || qvPress) { qvHint.classList.add('gone'); qvFromX(e); } });
  viewer.addEventListener('pointerdown', () => { qvPress = true; });
  ['pointerup', 'pointercancel'].forEach(t => viewer.addEventListener(t, () => { qvPress = false; }));
  qv.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { setQVAngle(qvI + (e.key === 'ArrowRight' ? 1 : -1)); e.preventDefault(); }
  });

  $('qvAdd').addEventListener('click', async () => {
    const p = qvP, from = $('qvAdd').getBoundingClientRect();
    qv.close();
    if (!inBag(p)) {
      bag.push(p.slug); save();
      // A little bead in the necklace's color arcs into the Bag button, then the count bumps.
      await window.PlayFX?.toBag(from, p.backdrop);
      renderBag(); bumpBag();
    }
    openBag();
  });

  /* ---------- Bag drawer ---------- */
  const bagDlg = $('bag'), bagBtn = $('bagBtn');
  function renderBag() {
    $('bagCount').textContent = bag.length;
    bagBtn.setAttribute('aria-label', `Bag, ${bag.length} item${bag.length === 1 ? '' : 's'}`);
    const items = bag.map(s => P.find(p => p.slug === s)), list = $('bagItems');
    list.innerHTML = items.length ? '' : '<li class="bag-empty"><p>Nothing here yet.</p><button class="btn" type="button" data-browse>Browse the batch</button></li>';
    items.forEach(p => {
      const li = document.createElement('li');
      li.className = 'bag-item';
      accent(li, p);
      li.innerHTML = `<canvas width="168" height="168" aria-hidden="true"></canvas>
        <div><div class="name">${p.name}</div><button class="link-btn" type="button">Remove</button></div>
        <span>${money(p.price)}</span>`;
      paint(li.querySelector('canvas'), image(p, 3));
      li.querySelector('.link-btn').addEventListener('click', () => { bag = bag.filter(s => s !== p.slug); save(); renderBag(); });
      list.appendChild(li);
    });
    const total = items.reduce((sum, p) => sum + p.price, 0);
    $('bagSubtotal').textContent = money(total);
    $('bagFoot').hidden = !items.length;
    $('bagNote').textContent = total >= 50 ? 'Free US shipping' : `${money(50 - total)} away from free shipping`;
  }
  function openBag() { if (qv.open) qv.close(); if (!bagDlg.open) bagDlg.showModal(); }
  function bumpBag() { bagBtn.classList.remove('bump'); void bagBtn.offsetWidth; bagBtn.classList.add('bump'); }

  bagBtn.addEventListener('click', openBag);
  $('bagItems').addEventListener('click', e => {
    if (e.target.closest('[data-browse]')) { bagDlg.close(); $('shop').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }); }
  });
  $('checkout').addEventListener('click', () => {
    $('bagNote').textContent = 'Prototype: checkout connects to Shopify or Stripe on the real site.';
  });
  renderBag();
  fromHash();

  // Close buttons, and clicking the dimmed area outside a popup.
  document.querySelectorAll('dialog').forEach(d => {
    d.addEventListener('click', e => { if (e.target === d || e.target.closest('[data-close]')) d.close(); });
  });

  /* ---------- Ask for one like it ---------- */
  const ask = $('ask'), askForm = $('askForm'), askLink = $('askLink');
  const daisy = c => `<svg viewBox="0 0 40 40">${[0, 72, 144, 216, 288].map(a => `<ellipse cx="20" cy="9.5" rx="6.2" ry="9" fill="${c}" transform="rotate(${a} 20 20)"/>`).join('')}<circle cx="20" cy="20" r="5.2" fill="#fff"/></svg>`;

  // The link's letters wave one at a time, each lighting up in a glass color, so it reads as clickable.
  const WAVE = ['--cobalt', '--coral', '--turquoise', '--orchid', '--emerald', '--sangre', '--rubino'];
  askLink.innerHTML = `<span class="ask-daisy" aria-hidden="true">${daisy('var(--coral)')}</span>` +
    [...askLink.textContent].map((ch, i) => `<span class="ch" aria-hidden="true" style="--i:${i};--lc:var(${WAVE[i % WAVE.length]})">${ch === ' ' ? '&nbsp;' : ch}</span>`).join('');
  function wave() {
    if (reduceMotion) return;
    askLink.classList.remove('waving'); void askLink.offsetWidth; askLink.classList.add('waving');
  }
  askLink.addEventListener('animationend', e => { if (e.target === askLink.lastElementChild) askLink.classList.remove('waving'); });
  askLink.addEventListener('mouseenter', wave);
  askLink.addEventListener('focus', wave);
  // While it's on screen, a wave every few seconds; nothing when it's off screen.
  let waveTimer = 0;
  new IntersectionObserver(([e]) => {
    clearInterval(waveTimer);
    if (e.isIntersecting) { setTimeout(wave, 400); waveTimer = setInterval(wave, 7000); }
  }, { threshold: 1 }).observe(askLink);

  // Sold pieces to pick from.
  const soldPick = $('soldPick'), sold = P.filter(p => p.sold);
  soldPick.innerHTML = sold.length ? sold.map(p => `
      <label class="sold-card" style="--accent:${p.backdrop};--tile-bg:${tileBg(p)}">
        <input type="radio" name="soldPiece" value="${p.slug}">
        <span class="tile"><canvas class="shot" width="320" height="320"></canvas></span>
        <span class="sc-name">${p.name}</span>
        <span class="sc-sub">Sold in ${p.soldOn}</span>
      </label>`).join('') : '<p class="ask-empty">Nothing has sold yet. Try "Something new".</p>';
  soldPick.querySelectorAll('canvas').forEach((c, i) => { const fn = () => paint(c, image(sold[i], 3)); painters.add(fn); fn(); });

  // Commission choices.
  const GLASS = [['Cobalt', '#1f3fa8'], ['Turquoise', '#1fb5c9'], ['Emerald', '#0f6b45'], ['Uranium', '#e4dd3b'], ['Coral', '#f2674a'], ['Red', '#c8321f'], ['Berry', '#a8265e'], ['Orchid', '#8a4fbf'], ['Clear', '#dfe8ec']];
  const FOCAL = [['dots', 'Dots'], ['stripe', 'Swirls'], ['glass', 'Plain glass']];
  const LENGTH = [['15', 'Choker · 15 in'], ['18', 'Classic · 18 in'], ['22', 'Long · 22 in']];
  $('colorPick').innerHTML = GLASS.map(([n, c]) => `<label class="swatch"><input type="checkbox" name="glass" value="${n}" data-color="${c}"><span class="sw-dot" style="--c:${c}"></span><span class="sw-name">${n}</span></label>`).join('');
  const chips = (list, name, pick) => list.map(([v, label]) => `<label class="pick"><input type="radio" name="${name}" value="${v}"${v === pick ? ' checked' : ''}><span>${label}</span></label>`).join('');
  $('focalPick').innerHTML = chips(FOCAL, 'focal', 'dots');
  $('lengthPick').innerHTML = chips(LENGTH, 'length', '18');

  // Up to three colors: once three are picked, the rest wait.
  $('colorPick').addEventListener('change', () => {
    const boxes = [...askForm.querySelectorAll('[name=glass]')], n = boxes.filter(b => b.checked).length;
    boxes.forEach(b => { b.disabled = !b.checked && n >= 3; });
  });

  // A little drawn necklace that updates as you choose, with a springy wobble on each change.
  const preview = $('askPreview');
  let previewRaf = 0;
  function drawPreview(wobble = 0) {
    const dpr = Math.min(2, window.devicePixelRatio || 1), w = preview.clientWidth, h = 130;
    if (!w) return;
    preview.width = w * dpr; preview.height = h * dpr;
    const ctx = preview.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const picked = [...askForm.querySelectorAll('[name=glass]:checked')].map(b => b.dataset.color);
    const colors = picked.length ? picked : ['#c9c9cf', '#e2e2e7'];
    const focal = askForm.querySelector('[name=focal]:checked')?.value || 'dots';
    const len = Number(askForm.querySelector('[name=length]:checked')?.value || 18);
    const depth = { 15: 42, 18: 66, 22: 92 }[len] * (1 + wobble);
    const left = 24, right = w - 24, mid = w / 2;
    const y = x => 14 + depth * (1 - ((x - mid) / ((right - left) / 2)) ** 2);
    ctx.strokeStyle = '#a1a1a6'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(left, y(left));
    for (let x = left; x <= right; x += 6) ctx.lineTo(x, y(x));
    ctx.stroke();
    const step = 26, n = Math.floor((right - left - 60) / 2 / step);
    for (let k = n; k >= 1; k--) for (const sgn of [-1, 1]) {
      const x = mid + sgn * (22 + k * step - 10);
      S.drawBead(ctx, { r: 5, kind: 'spacer', metal: 'silver' }, x + sgn * 13, y(x + sgn * 13), 0);
      S.drawBead(ctx, { r: 9, kind: 'glass', color: colors[(k - 1) % colors.length], seed: k }, x, y(x), 0);
    }
    S.drawBead(ctx, { r: 17, kind: focal, color: colors[0], dot: '#fff8ee', seed: 2 }, mid, y(mid) + 6, 0);
  }
  function wobblePreview() {
    drawPreview();
    if (reduceMotion) return;
    cancelAnimationFrame(previewRaf);
    const t0 = performance.now();
    const anim = now => {
      const t = now - t0;
      drawPreview(0.14 * Math.exp(-t / 220) * Math.sin(t / 55));
      previewRaf = t < 900 ? requestAnimationFrame(anim) : 0;
    };
    previewRaf = requestAnimationFrame(anim);
  }
  $('panelNew').addEventListener('change', wobblePreview);

  function setMode(mode) {
    ask.querySelectorAll('.seg [role=tab]').forEach(t => t.setAttribute('aria-selected', String(t.dataset.mode === mode)));
    $('panelLike').hidden = mode !== 'like';
    $('panelNew').hidden = mode !== 'new';
    // A sold piece is required only when asking about one.
    askForm.querySelectorAll('[name=soldPiece]').forEach(r => { r.required = mode === 'like'; });
    if (mode === 'new') drawPreview();
  }
  ask.querySelector('.seg').addEventListener('click', e => { const t = e.target.closest('[data-mode]'); if (t) setMode(t.dataset.mode); });

  function openAsk(mode = sold.length ? 'like' : 'new', slug) {
    askForm.reset();
    askForm.querySelectorAll('[name=glass]').forEach(b => { b.disabled = false; });
    askForm.hidden = false; $('askDone').hidden = true;
    setMode(mode);
    if (slug) { const r = askForm.querySelector(`[name=soldPiece][value="${slug}"]`); if (r) r.checked = true; }
    if (!ask.open) ask.showModal();
    ask.scrollTop = 0;
  }
  askLink.addEventListener('click', () => openAsk('like'));
  $('qvAsk').addEventListener('click', () => { const p = qvP; qv.close(); openAsk('like', p.slug); });

  // Not wired to email yet: shows the thank-you with a little bead confetti.
  askForm.addEventListener('submit', e => {
    e.preventDefault();
    askForm.hidden = true;
    $('askDone').hidden = false;
    // Measure after the popup has resized around the thank-you.
    window.PlayFX?.confetti($('askDone').querySelector('h2').getBoundingClientRect(), ask);
  });

  /* ---------- Email signup (not wired to a list yet) ---------- */
  $('signup').addEventListener('submit', e => {
    e.preventDefault();
    const from = e.target.querySelector('.btn').getBoundingClientRect();
    e.target.hidden = true;
    $('thanks').hidden = false;
    window.PlayFX?.confetti(from);
  });
})();
