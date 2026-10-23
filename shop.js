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
  // with a small .webp copy of each (made by tools/webp.py) that loads first.
  // left profile → right profile, on a transparent background. Until a photo exists, a drawn stand-in is used.
  // The hero shows necklace n at angle n, so it uses the same files.
  // Add ?review to the address to preview images waiting for approval in photos/review/
  // (approved ones in photos/ still show).
  const REVIEW = new URLSearchParams(location.search).has('review');
  // A photo is 'loading', then an Image, or 'missing' once every file has failed. While it loads, image()
  // returns null and paint() leaves the canvas as it is, so a drawn stand-in never flashes up before a real
  // photo; the stand-in is only used when there's no photo at all.
  const drawn = new Map(), photos = new Map(), painters = new Set(), waiting = new Map();
  function load(base) {
    if (photos.has(base)) return;
    photos.set(base, 'loading');
    const tries = [...(REVIEW ? [`photos/review/${base}.png`] : []), `photos/${base}.webp`, `photos/${base}.png`, `photos/${base}.jpg`];
    const img = new Image();
    const done = v => { photos.set(base, v); painters.forEach(fn => fn()); waiting.forEach((fn, c) => { if (fn()) waiting.delete(c); }); };
    img.onload = () => done(img);
    img.onerror = () => { tries.shift(); if (tries.length) img.src = tries[0]; else done('missing'); };
    img.src = tries[0];
  }
  function image(p, i) {
    const base = `${p.slug}-${i + 1}`;
    load(base);
    const got = photos.get(base);
    if (got === 'loading') return null;
    if (got !== 'missing') return got;
    const key = `${p.slug}:${i}`;
    if (!drawn.has(key)) {
      const c = document.createElement('canvas');
      c.width = c.height = 720;
      S.drawCloseup(c, p, i);
      drawn.set(key, c);
    }
    return drawn.get(key);
  }
  // For canvases that always show the same picture (thumbnails, the bag): paint now, or as soon as it loads.
  function paintOnce(canvas, p, i) {
    const go = () => { const src = image(p, i); if (src) paint(canvas, src); return !!src; };
    if (!go()) waiting.set(canvas, go);
  }
  // Load the photos the page shows on hover and as the hero turns, once the page is settled,
  // so they're ready before anyone reaches for them.
  // Phones can't hover, so they skip the hover photos, and fetch the hero's other photos only once someone touches it.
  const loadHero = () => (window.HERO || []).forEach((slug, k) => { const p = P.find(x => x.slug === slug); if (p) load(`${slug}-${heroAngle(p, k) + 1}`); });
  addEventListener('load', () => setTimeout(() => {
    P.forEach(p => { load(`${p.slug}-4`); if (!touchOnly && (!p.angles || p.angles.includes(5))) load(`${p.slug}-6`); });
    if (touchOnly) $('stage').addEventListener('pointerdown', loadHero, { once: true }); else loadHero();
  }, 400));
  // The glass-color splash behind a necklace's photos, and the single small accent shape used elsewhere.
  const splash = (p, seed) => window.Splash.svg(p.splash, seed, { shape: p.splashShape, rich: true });
  const shape = (color, kind, seed) => window.Splash.svg([color], seed, { shape: kind, minimal: true });

  // `zoom` crops in past a plain fill; `fy` is where the crop sits top to bottom (0 top, 0.5 middle).
  function paint(canvas, src, zoom = 1, fy = 0.5) {
    if (!src) return;  // still loading: keep what's there
    const ctx = canvas.getContext('2d'), w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const iw = src.naturalWidth || src.width, ih = src.naturalHeight || src.height, s = Math.max(w / iw, h / ih) * zoom;
    ctx.drawImage(src, (w - iw * s) / 2, (h - ih * s) * fy, iw * s, ih * s);
  }

  /* ---------- Logo dot: line the bead up with where the font draws the dot of its "i" ---------- */
  // Draw "i" and the dotless "ı" in the logo font; the pixels only "i" has are its dot.
  // Load both characters first: Google Fonts keeps "ı" in a separate file, and measuring against a
  // fallback font's "ı" would make the dot far too big.
  const LOGO_FONT = getComputedStyle(document.querySelector('.logo')).fontFamily.split(',')[0].replace(/["']/g, '').trim();
  document.fonts.load(`200px "${LOGO_FONT}"`, 'iı').then(() => {
    const size = 200, c = document.createElement('canvas'), ctx = c.getContext('2d', { willReadFrequently: true });
    c.width = c.height = 400;
    ctx.font = `${size}px "${LOGO_FONT}"`;
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

  // The big name shrinks into the header bar once the page scrolls.
  const topBar = $('top'), onScroll = () => topBar.classList.toggle('small', scrollY > 24);
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('load', onScroll);  // the browser may restore a scroll position after load
  onScroll();

  /* ---------- Bag state (kept in this browser only) ---------- */
  let bag = [];
  try { bag = JSON.parse(localStorage.getItem('bag') || '[]').filter(s => P.some(p => p.slug === s && !p.sold)); } catch { bag = []; }
  const save = () => { try { localStorage.setItem('bag', JSON.stringify(bag)); } catch { /* private mode: bag just won't persist */ } };
  const inBag = p => bag.includes(p.slug);

  /* ---------- Hero: one big centered photo that turns through the necklaces ---------- */
  // Moving across it flips through the necklaces like stop motion, each shown at its own angle,
  // from left profile (necklace 1) to right profile (necklace 7).
  const heroItems = (window.HERO || P.map(p => p.slug)).map(slug => P.find(p => p.slug === slug)).filter(Boolean).slice(0, N);
  // Necklaces with real photos (p.angles) show their front; drawn stand-ins turn, necklace n at angle n.
  const heroAngle = (p, k) => (p.angles ? (p.angles.includes(3) ? 3 : p.angles[0]) : k);
  const heroEl = $('hero'), stage = $('stage'), heroCanvas = $('heroCanvas');
  let cur = -1, intro = null, touched = false, press = null;

  // Wide (3:2) photos show at full width (p.heroZoom crops in, if a photo needs it); square ones fill, trimmed top and bottom.
  const paintHero = () => {
    if (cur < 0) return;
    const p = heroItems[cur], src = image(p, heroAngle(p, cur));
    if (!src) return;
    const wide = (src.naturalWidth || src.width) > (src.naturalHeight || src.height) * 1.2;
    paint(heroCanvas, src, wide ? p.heroZoom ?? 1 : 1, wide ? 0.3 : 0.5);
  };
  painters.add(paintHero);

  function setHero(i) {
    i = Math.max(0, Math.min(heroItems.length - 1, i));
    if (i === cur) return;
    cur = i;
    paintHero();
    const p = heroItems[i];
    accent(heroEl, p);
    // The layered glass-color splash, big and wrapping around the shoulders, stretched to a wide oval.
    $('heroSplash').innerHTML = window.Splash.svg(p.splash, i + 1, { shape: p.splashShape, rich: true })
      .replace('<svg ', '<svg preserveAspectRatio="none" ');
    stage.setAttribute('aria-label', `${p.name}, ${p.sold ? 'sold' : money(p.price)}. Press Enter for details, arrow keys to turn.`);
  }
  const stopIntro = () => { touched = true; clearInterval(intro); intro = null; };
  const heroFromX = e => { const r = stage.getBoundingClientRect(); setHero(Math.floor((e.clientX - r.left) / r.width * heroItems.length)); };

  stage.addEventListener('pointermove', e => { if (e.pointerType === 'mouse' || press) { stopIntro(); heroFromX(e); } });
  stage.addEventListener('pointerdown', e => { press = { x: e.clientX, y: e.clientY }; stopIntro(); });
  stage.addEventListener('pointerup', e => {
    // A click or tap (not a drag) opens the necklace you're looking at.
    if (press && Math.hypot(e.clientX - press.x, e.clientY - press.y) < 8) openQV(heroItems[cur], heroAngle(heroItems[cur], cur));
    press = null;
  });
  stage.addEventListener('pointercancel', () => { press = null; });
  stage.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { stopIntro(); setHero(cur + (e.key === 'ArrowRight' ? 1 : -1)); e.preventDefault(); }
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openQV(heroItems[cur], heroAngle(heroItems[cur], cur)); }
  });

  setHero(3);
  // No spin-through on load: it was a lot at once. The bead bouncing down the flowers (play.js) is the opening moment.

  /* ---------- Other small accent shapes on the page ---------- */
  const rootStyle = getComputedStyle(document.documentElement);
  document.querySelectorAll('.accent-shape[data-shape]').forEach(el => {
    el.innerHTML = shape(rootStyle.getPropertyValue(el.dataset.color).trim(), el.dataset.shape, Number(el.dataset.seed));
  });

  /* ---------- Shop grid + color filters ---------- */
  const grid = $('grid'), soldGrid = $('soldGrid'), filters = $('filters');
  grid.innerHTML = soldGrid.innerHTML = '';  // drop the plain list written in for search engines (tools/seo.py)
  $('shopCount').textContent = `${P.filter(p => !p.sold).length} available`;

  const cards = P.map(p => {
    const li = document.createElement('li');
    li.className = 'card' + (p.sold ? ' sold' : '');
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
    const turns = !p.angles || p.angles.includes(5);  // only when it has a real turned photo
    btn.addEventListener('mouseenter', () => { if (turns) { angle = 5; repaint(); } });
    btn.addEventListener('mouseleave', () => { angle = 3; repaint(); });
    btn.addEventListener('click', () => openQV(p, 3));
    (p.sold ? soldGrid : grid).appendChild(li);
    return li;
  });

  // The chips change with what you shop by: color, collection, bead type or metal.
  const COLLECTIONS = window.COLLECTIONS || [];
  const uniq = k => [...new Set(P.map(p => p[k]))].filter(Boolean);
  const metalDot = { Gold: '#d4a640', Silver: '#b9bec4', None: '#8a5a3a' };
  const OPTIONS = {
    family: FAMILIES.filter(f => f.key !== 'all').map(f => ({ key: f.key, label: f.label, color: f.color })),
    collection: COLLECTIONS.map(c => ({ key: c.key, label: c.name, color: c.color })),
    beadType: uniq('beadType').map(v => ({ key: v, label: v, color: '#1b1a22' })),
    metal: uniq('metal').map(v => ({ key: v, label: v === 'None' ? 'No metal' : v, color: metalDot[v] || '#1b1a22' })),
  };
  let by = 'family', pick = 'all';
  const filterBy = $('filterBy');
  function drawChips() {
    filterBy.querySelectorAll('[data-by]').forEach(t => t.setAttribute('aria-selected', String(t.dataset.by === by)));
    const opts = [{ key: 'all', label: 'All', color: '#1b1a22' }, ...OPTIONS[by]];
    filters.innerHTML = '';
    opts.forEach(o => {
      const count = o.key === 'all' ? P.length : P.filter(p => p[by] === o.key).length;
      if (!count) return;
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'chip'; b.dataset.pick = o.key;
      b.setAttribute('aria-pressed', String(o.key === pick));
      b.innerHTML = `<span class="dot-c" style="--c:${o.color}"></span>${o.label}<span class="n">${count}</span>`;
      filters.appendChild(b);
    });
  }
  // Show only the necklaces that match, e.g. setFilter('collection', 'chaotic-good'); setFilter(by) clears the pick.
  function setFilter(kind = by, key = 'all') {
    by = kind; pick = key;
    drawChips();
    let shown = 0, shownSold = 0;
    cards.forEach((li, k) => {
      const on = key === 'all' || P[k][by] === key;
      li.hidden = !on;
      if (on) li.classList.contains('sold') ? shownSold++ : shown++;
    });
    $('empty').hidden = shown > 0;
    $('found').hidden = shownSold === 0;
  }
  filters.addEventListener('click', e => { const c = e.target.closest('.chip'); if (c) setFilter(by, c.dataset.pick); });
  filterBy.addEventListener('click', e => { const t = e.target.closest('[data-by]'); if (t) setFilter(t.dataset.by); });
  $('empty').addEventListener('click', e => { if (e.target.closest('[data-family]')) setFilter(by); });
  setFilter('family');
  const shopAt = (kind, key) => { setFilter(kind, key); $('shop').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }); };

  /* ---------- Shop menu: by collection, bead type, color or metal ---------- */
  const menuBtn = $('shopMenuBtn'), menu = $('shopMenu');
  const setMenu = open => { menu.hidden = !open; menuBtn.setAttribute('aria-expanded', String(open)); };
  menuBtn.addEventListener('click', () => setMenu(menu.hidden));
  $('shopMenuWrap').addEventListener('mouseenter', () => { if (!touchOnly) setMenu(true); });
  $('shopMenuWrap').addEventListener('mouseleave', () => { if (!touchOnly) setMenu(false); });
  document.addEventListener('click', e => { if (!e.target.closest('#shopMenuWrap')) setMenu(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuBtn.focus(); } });
  menu.addEventListener('click', e => {
    const a = e.target.closest('a');
    if (!a) return;
    setMenu(false);
    if (a.dataset.by) { e.preventDefault(); shopAt(a.dataset.by === 'all' ? 'family' : a.dataset.by); }
  });

  // The front photo of a necklace as a plain <img>, for places that don't turn (and for search engines).
  const photoSrc = p => `photos/${p.slug}-4.webp`;

  /* ---------- Shop by collection: tall color panels with a shaped photo window ---------- */
  // Window outlines on a 200×200 board, from the drawing: a soft five-lobed blob, a spiky star, a puffy cloud.
  const ring = (n, r1, r2, wob = []) => Array.from({ length: n * 2 }, (_, k) => {
    const a = -Math.PI / 2 + k * Math.PI / n, r = (k % 2 ? r2 : r1) + (wob[k % wob.length] || 0);
    return [100 + Math.cos(a) * r, 104 + Math.sin(a) * r];
  });
  const WINDOWS = {
    blob: `<path d="${window.Splash.smooth(ring(5, 90, 74, [0, 4, -6, 2, 5, -3, -4, 3, 6, 0]))}"/>`,
    star: `<path d="M${ring(9, 96, 42, [0, 2, -14, 0, 6, -3, -8, 2, 4, 0, -10, 3, 8, -2, -4, 0, 2, 4]).map(p => p.map(v => v.toFixed(1)).join(' ')).join('L')}Z"/>`,
    cloud: [[100, 58, 46], [56, 86, 40], [146, 84, 42], [44, 134, 38], [100, 128, 52], [156, 136, 38], [90, 168, 30], [130, 166, 28]]
      .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join(''),
  };
  // Little drawn charms that fit each collection's name, on the same 200×200 board as the windows.
  const INK = '#1d1d1f', line = `stroke="${INK}" stroke-width="4" stroke-linejoin="round"`;
  const shine = d => `<path d="${d}" fill="none" stroke="#fff" stroke-opacity=".85" stroke-width="5" stroke-linecap="round"/>`;
  const jumpRing = (x, y) => `<circle cx="${x}" cy="${y}" r="8" fill="none" stroke="${INK}" stroke-width="8"/><circle cx="${x}" cy="${y}" r="8" fill="none" stroke="#e3b341" stroke-width="3.5"/>`;
  const mushroom = (cap, spots) => `
    ${jumpRing(100, 44)}
    <path d="M86 112C84 130 81 146 87 156L113 156C119 146 116 130 114 112Z" fill="#fff4e0" ${line}/>
    <path d="M48 114C46 72 76 52 100 52S154 72 152 114Q100 124 48 114Z" fill="${cap}" ${line}/>
    ${spots.map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.85}" fill="#fff"/>`).join('')}
    ${shine('M62 98q0-24 24-36')}`;
  const daisyBead = (x, y, r, petal, mid) => [0, 1, 2, 3, 4].map(k => {
    const a = k * Math.PI * 2 / 5 - Math.PI / 2;
    return `<circle cx="${(x + Math.cos(a) * r).toFixed(1)}" cy="${(y + Math.sin(a) * r).toFixed(1)}" r="${r * 0.72}" fill="${petal}" ${line}/>`;
  }).join('') + `<circle cx="${x}" cy="${y}" r="${r * 0.62}" fill="${mid}" ${line}/>`;
  const starPath = (cx, cy, R, r, n = 5) => 'M' + Array.from({ length: n * 2 }, (_, k) => {
    const a = -Math.PI / 2 + k * Math.PI / n, rr = k % 2 ? r : R;
    return `${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr).toFixed(1)}`;
  }).join('L') + 'Z';
  const sparkle = (x, y, s, c) => `<path d="M${x} ${y - s}Q${x + s * 0.15} ${y - s * 0.15} ${x + s} ${y}Q${x + s * 0.15} ${y + s * 0.15} ${x} ${y + s}Q${x - s * 0.15} ${y + s * 0.15} ${x - s} ${y}Q${x - s * 0.15} ${y - s * 0.15} ${x} ${y - s}Z" fill="${c}" ${line}/>`;
  const smiley = (x, y, r, c, wink) => `
    <circle cx="${x}" cy="${y}" r="${r}" fill="${c}" ${line}/>
    ${wink ? `<path d="M${x - r * 0.42} ${y - r * 0.18}q${r * 0.14} -${r * 0.16} ${r * 0.28} 0" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>`
      : `<ellipse cx="${x - r * 0.3}" cy="${y - r * 0.2}" rx="${r * 0.09}" ry="${r * 0.15}" fill="${INK}"/>`}
    <ellipse cx="${x + r * 0.3}" cy="${y - r * 0.2}" rx="${r * 0.09}" ry="${r * 0.15}" fill="${INK}"/>
    <path d="M${x - r * 0.45} ${y + r * 0.12}Q${x} ${y + r * 0.62} ${x + r * 0.45} ${y + r * 0.12}" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>
    ${shine(`M${x - r * 0.68} ${y - r * 0.05}q${r * 0.05} -${r * 0.45} ${r * 0.42} -${r * 0.6}`)}`;
  const CHARMS = {
    blob: `${mushroom('#e8262d', [[76, 84, 9], [104, 66, 7], [128, 88, 10], [96, 100, 5]])}
      <g transform="translate(150 146) rotate(14) scale(.42) translate(-100 -104)">${mushroom('#f28a2e', [[80, 86, 10], [118, 76, 9]])}</g>
      ${daisyBead(50, 150, 11, '#fff4e0', '#f2b23a')}`,
    star: `${jumpRing(100, 62)}
      <path d="${starPath(100, 112, 50, 23)}" fill="#f4c542" ${line}/>
      ${shine('M80 104l12-4')}
      ${sparkle(164, 93, 12, '#fff')}${sparkle(58, 54, 11, '#c9a6ff')}${sparkle(78, 164, 10, '#fff')}
      <circle cx="124" cy="166" r="6" fill="#c9a6ff" ${line}/>`,
    cloud: `${smiley(70, 94, 30, '#ffd23f')}${smiley(132, 90, 28, '#ff8fb1', true)}${smiley(102, 146, 30, '#7fd36b')}`,
  };
  $('panels').innerHTML = COLLECTIONS.map((c, k) => {
    const items = P.filter(p => p.collection === c.key);
    if (!items.length) return '';
    return `<li class="panel" style="--panel:${c.color}">
      <button type="button" data-collection="${c.key}" aria-label="Shop the ${c.name} collection, ${items.length} necklace${items.length === 1 ? '' : 's'}">
        <svg class="window" viewBox="-6 -6 212 212" aria-hidden="true">
          <defs><clipPath id="win${k}">${WINDOWS[c.shape]}</clipPath></defs>
          <g class="win-edge">${WINDOWS[c.shape]}</g>
          <g clip-path="url(#win${k})">
            <rect x="-6" y="-6" width="212" height="212" fill="${tintHex(c.color, 0.88)}"/>
            <g class="charm">${CHARMS[c.shape]}</g>
          </g>
        </svg>
        <span class="panel-label"><span class="panel-name">${c.name}</span><span class="panel-blurb">${c.blurb}</span></span>
      </button>
    </li>`;
  }).join('');
  $('panels').addEventListener('click', e => { const b = e.target.closest('[data-collection]'); if (b) shopAt('collection', b.dataset.collection); });

  /* ---------- Shop by color: full-width wavy bands with the color's name in big stacked letters ---------- */
  // stack.js drops the letters of each word into a little pile.
  const WAVES = ['M0 40C180 0 330 0 500 30S820 70 1000 24', 'M0 22C200 60 380 64 560 30S860 -4 1000 36'];
  const bandFams = FAMILIES.filter(f => f.word && P.some(p => p.family === f.key));
  $('bands').innerHTML = bandFams.map((f, k) => {
    const items = P.filter(p => p.family === f.key), p = items.find(x => !x.sold) || items[0];
    if (!p) return '';
    const top = WAVES[k % 2];
    return `<article class="band${k % 2 ? ' flip' : ''}" style="--band:${f.band};--ink:${f.ink}" data-family="${f.key}" aria-labelledby="band-${f.key}">
      <svg class="band-bg" viewBox="0 0 1000 440" preserveAspectRatio="none" aria-hidden="true">
        ${k ? `<rect width="1000" height="80" fill="${bandFams[k - 1].band}"/>` : ''}
        <path class="band-fill" d="${top}L1000 440L0 440Z"/>
        <path class="band-edge" d="${top}"/>
      </svg>
      <div class="band-inner">
        <button class="band-photo" type="button" data-family="${f.key}" style="--tile-bg:${tileBg(p)}" aria-label="Shop ${f.label.toLowerCase()}">
          <img src="${photoSrc(p)}" alt="${p.name}, a ${f.word.toLowerCase()} glass bead necklace" width="1024" height="1024" loading="lazy">
        </button>
        <div class="band-words">
          <h3 class="stack" id="band-${f.key}" data-word="${f.word.toUpperCase()}">${f.word}</h3>
          <p class="shades">${f.shades.join(' · ')}</p>
          <button class="band-go" type="button" data-family="${f.key}">Shop ${f.label.toLowerCase()} <span class="n">${items.length}</span></button>
        </div>
      </div>
    </article>`;
  }).join('');
  $('bands').addEventListener('click', e => { const b = e.target.closest('button[data-family]'); if (b) shopAt('family', b.dataset.family); });

  /* ---------- Quick view ---------- */
  const qv = $('qv'), qvCanvas = $('qvCanvas'), qvThumbs = $('qvThumbs'), viewer = $('qvViewer'), qvHint = $('qvHint');
  // qvA: the angles this necklace has real photos for (p.angles, 0-based; all seven if not given); qvJ: which of them shows.
  let qvP = null, qvI = 3, qvA = [3], qvJ = 0, qvPress = false;
  const paintQV = () => { if (qvP) paint(qvCanvas, image(qvP, qvI)); };
  painters.add(paintQV);

  function setQVAngle(j) {
    qvJ = Math.max(0, Math.min(qvA.length - 1, j));
    qvI = qvA[qvJ];
    paintQV();
    // The splash shifts a little with each angle, like a new stop-motion frame.
    $('qvSplash').innerHTML = splash(qvP, P.indexOf(qvP) * 10 + qvI + 100);
    [...qvThumbs.children].forEach((b, k) => b.setAttribute('aria-current', String(k === qvJ)));
    $('qvAngle').textContent = `${ANGLE_NAMES[qvI]} · ${qvJ + 1} of ${qvA.length}`;
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
    qvA = p.angles || [...Array(N).keys()];
    qvThumbs.style.setProperty('--n', qvA.length);
    qvA.forEach((a, j) => {
      const b = document.createElement('button');
      b.type = 'button'; b.setAttribute('aria-label', ANGLE_NAMES[a]);
      const c = document.createElement('canvas'); c.width = c.height = 160;
      b.appendChild(c); paintOnce(c, p, a);
      b.addEventListener('click', () => { qvHint.classList.add('gone'); setQVAngle(j); });
      qvThumbs.appendChild(b);
    });
    updateAdd();
    setQVAngle(Math.max(0, qvA.indexOf(angle)));
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


  const qvFromX = e => { const r = viewer.getBoundingClientRect(); setQVAngle(Math.floor((e.clientX - r.left) / r.width * qvA.length)); };
  viewer.addEventListener('pointermove', e => { if (e.pointerType === 'mouse' || qvPress) { qvHint.classList.add('gone'); qvFromX(e); } });
  viewer.addEventListener('pointerdown', () => { qvPress = true; });
  ['pointerup', 'pointercancel'].forEach(t => viewer.addEventListener(t, () => { qvPress = false; }));
  qv.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { setQVAngle(qvJ + (e.key === 'ArrowRight' ? 1 : -1)); e.preventDefault(); }
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
      paintOnce(li.querySelector('canvas'), p, 3);
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
  // A necklace's own page (n/<slug>/, made by tools/seo.py) opens with that necklace showing.
  const own = P.find(p => p.slug === document.body.dataset.product);
  if (own) openQV(own, 3, true);

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
        <span class="tile"><span class="splash">${splash(p, P.indexOf(p) + 40)}</span><canvas class="shot" width="320" height="320"></canvas></span>
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
