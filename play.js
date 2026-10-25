// Small bits of play, kept contained so they never get in the way of shopping:
//   - a few groovy sprinkles around the page that wiggle when hovered and spin when clicked
//   - two short moments that play once when they come into view (tap to play again):
//       1. Hero: when the page opens, a glass bead bounces down two daisies like steps, hops along the
//          tagline and lands as the dot of its "!".
//       2. Story: on a drawing of Brittany's Garden Party necklace, its green flower bead drops into the middle, the
//          strand bounces, the drops swing, and the plain bead it replaces falls off and rolls a little way.
//          Tap that bead to put it back in.
//       3. Footer: a bead drops into the dot of the "i" in the big logo, and the word gives a little bounce.
//   - two that answer something you do: adding to the bag bounces a bead on the bag flower and into its middle,
//     and joining the email list pops a few beads up like confetti.
// Only transform and opacity are animated (Web Animations API), and nothing runs while scrolling.
(() => {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const css = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const P = window.PRODUCTS, S = window.StandIn;

  /* ---------- Sprinkles ---------- */
  const SHAPES = {
    daisy: c => `<svg viewBox="0 0 40 40">${[0, 72, 144, 216, 288].map(a => `<ellipse cx="20" cy="9.5" rx="6.2" ry="9" fill="${c}" transform="rotate(${a} 20 20)"/>`).join('')}<circle cx="20" cy="20" r="5.2" fill="#fff"/><circle cx="20" cy="20" r="5.2" fill="${c}" fill-opacity=".25"/></svg>`,
    sparkle: c => `<svg viewBox="0 0 40 40"><path d="M20 2C21.6 14 26 18.4 38 20 26 21.6 21.6 26 20 38 18.4 26 14 21.6 2 20 14 18.4 18.4 14 20 2Z" fill="${c}"/></svg>`,
    squiggle: c => `<svg viewBox="0 0 48 24"><path d="M3 15Q9 4 15 15T27 15T39 15T51 15" fill="none" stroke="${c}" stroke-width="4.5" stroke-linecap="round"/></svg>`,
    bead: c => `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="${c}"/><g fill="#fff">${[[20, 9], [30, 17], [27, 29], [13, 29], [10, 17]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6"/>`).join('')}</g><ellipse cx="14" cy="12" rx="5" ry="3" fill="#fff" fill-opacity=".55" transform="rotate(-35 14 12)"/></svg>`,
  };
  // Where each sprinkle sits: inside which element, its shape, color and position.
  const PLACES = [
    { in: '.hero', shape: 'sparkle', color: '--uranium', size: 30, style: 'top:7%;right:6%' },
    { in: '.shop .section-head', shape: 'squiggle', color: '--coral', size: 46, style: 'top:4px;left:calc(min(520px, 56%))', small: false },
    { in: '.found .section-head', shape: 'bead', color: '--turquoise', size: 24, style: 'top:2px;left:250px', small: false },
    { in: '.story', shape: 'daisy', color: '--coral', size: 30, style: 'bottom:14%;right:5%' },
    { in: '.signup', shape: 'sparkle', color: '--uranium', size: 26, style: 'top:30%;right:calc(50% - 320px)' },
    { in: 'footer', shape: 'daisy', color: '--uranium', size: 22, style: 'top:20px;right:calc(var(--gutter) + 4px)' },
  ];
  PLACES.forEach(p => {
    const host = document.querySelector(p.in);
    if (!host) return;
    const el = document.createElement('span');
    el.className = 'sprinkle' + (p.small === false ? ' hide-small' : '');
    el.setAttribute('aria-hidden', 'true');
    el.style.cssText = `${p.style};width:${p.size}px`;
    el.innerHTML = SHAPES[p.shape](css(p.color));
    host.appendChild(el);
  });
  document.addEventListener('click', e => {
    const s = e.target.closest('.sprinkle');
    if (!s || reduceMotion) return;
    s.animate([{ rotate: '0deg' }, { rotate: '360deg' }], { duration: 700, easing: 'cubic-bezier(.2,.7,.2,1)' });
  });

  /* ---------- Room around the things you can poke ---------- */
  // The pastel wallpaper (body background in styles.css) repeats one tile with these shapes on it, [x, y, radius] on
  // its 494px grid. Next to a sprinkle, a hero daisy or the hero splash's dots, a wallpaper copy is easy to mistake for
  // the real thing, so the copies near them are covered with a dot of plain page color, tucked behind everything.
  const WALL = [[87, 99, 34], [317, 84, 36], [422, 228, 16], [239, 285, 28], [56, 403, 33], [175, 205, 8], [372, 391, 9],
    [68, 258, 11], [441, 433, 22], [327, 198, 6], [285, 448, 12]];
  const gaps = document.createElement('div');
  gaps.className = 'wall-gaps';
  gaps.setAttribute('aria-hidden', 'true');
  document.body.appendChild(gaps);
  function clearWallpaper() {
    const tile = parseFloat(getComputedStyle(document.body).backgroundSize) || 494, s = tile / 494, room = 36;
    const keep = [...document.querySelectorAll('.sprinkle, .moment-flower, .accent-shape')]
      .concat([...document.querySelectorAll('#heroSplash circle, #heroSplash ellipse')].filter(e => e.getBoundingClientRect().width < 80))
      .map(e => e.getBoundingClientRect()).filter(r => r.width > 0)
      .map(r => ({ l: r.left + scrollX - room, r: r.right + scrollX + room, t: r.top + scrollY - room, b: r.bottom + scrollY + room }));
    const dots = [];
    keep.forEach(k => {
      for (let ty = Math.floor((k.t - tile) / tile); ty <= Math.floor((k.b + tile) / tile); ty++) {
        for (let tx = Math.floor((k.l - tile) / tile); tx <= Math.floor((k.r + tile) / tile); tx++) {
          WALL.forEach(([x, y, r]) => {
            const cx = tx * tile + x * s, cy = ty * tile + y * s, rr = r * s;
            const dx = Math.max(k.l - cx, 0, cx - k.r), dy = Math.max(k.t - cy, 0, cy - k.b);
            if (dx * dx + dy * dy < rr * rr) dots.push(`<i style="left:${(cx - rr - 2).toFixed(1)}px;top:${(cy - rr - 2).toFixed(1)}px;width:${(rr * 2 + 4).toFixed(1)}px"></i>`);
          });
        }
      }
    });
    gaps.innerHTML = [...new Set(dots)].join('');
  }
  let gapTimer = 0;
  const clearSoon = () => { clearTimeout(gapTimer); gapTimer = setTimeout(clearWallpaper, 120); };
  addEventListener('load', clearSoon);
  addEventListener('resize', clearSoon);
  document.fonts.ready.then(clearSoon);
  // The splash changes with each necklace as the hero turns.
  const splashEl = document.getElementById('heroSplash');
  if (splashEl) new MutationObserver(clearSoon).observe(splashEl, { childList: true });
  clearSoon();

  /* ---------- Wavy ribbons in the page background ---------- */
  // 70s-style bands of stacked wavy stripes that flow edge to edge behind the content. They use soft
  // pastel tints of the glass colors so they set the mood without competing with the photos.
  // Placement follows research/ribbon-layout.md: two shallow angles alternating down the page (never flat),
  // ends always run off the edges, about one ribbon per screen, nothing crossing text, and none near the
  // rainbow divider above the footer. On phones only the ribbons marked small: true show, steeper and thinner.
  const RIBBONS = [
    { in: '.shop', colors: ['--turquoise', '--uranium', '--coral'], top: '27%', angle: 8, height: 240, amp: 28, seed: 9 },
    { in: '.shop', colors: ['--orchid', '--coral', '--uranium'], top: '76%', angle: -8, height: 240, amp: 28, seed: 14 },
  ];
  function rand32(seed) {
    return () => {
      seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  const tint = (hex, amt) => {
    const n = parseInt(hex.slice(1), 16), c = [n >> 16, (n >> 8) & 255, n & 255];
    return `rgb(${c.map(v => Math.round(v + (255 - v) * amt)).join(',')})`;
  };
  // One wavy line drawn smoothly through points, then repeated a stripe-width lower for each color.
  function ribbonSVG(w, r) {
    const rand = rand32(r.seed), stripe = Math.max(16, Math.min(34, w * 0.026));
    const colors = w < 640 ? r.colors.slice(0, 3) : r.colors;
    const mid = r.height / 2 - (stripe * (colors.length - 1)) / 2, pts = [];
    for (let x = -240; x <= w + 240; x += 240) pts.push([x, mid + (rand() - 0.5) * 2 * r.amp]);
    let d = `M${pts[0][0]} ${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      d += `C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)} ${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)} ${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0]} ${p2[1].toFixed(1)}`;
    }
    const bands = colors.map((c, k) => `<path d="${d}" transform="translate(0 ${(k * stripe).toFixed(1)})" fill="none" stroke="${tint(css(c), 0.5)}" stroke-width="${(stripe + 0.6).toFixed(1)}"/>`).join('');
    return `<svg width="${w}" height="${r.height}" viewBox="0 0 ${w} ${r.height}" aria-hidden="true" focusable="false">${bands}</svg>`;
  }
  const ribbonEls = RIBBONS.map(r => {
    const host = document.querySelector(r.in);
    if (!host) return null;
    const el = document.createElement('div');
    el.className = 'ribbon' + (r.small ? '' : ' hide-small');
    el.setAttribute('aria-hidden', 'true');
    el.style.top = r.top;
    el.style.setProperty('--angle', `${r.angle}deg`);
    el.style.height = `${r.height}px`;
    el.style.marginTop = `${-r.height / 2}px`;
    host.prepend(el);
    return { el, r };
  }).filter(Boolean);
  let ribbonW = 0;
  function drawRibbons() {
    const w = document.documentElement.clientWidth;
    if (w === ribbonW) return;
    ribbonW = w;
    ribbonEls.forEach(({ el, r }) => { el.innerHTML = ribbonSVG(Math.round(w * 1.3), r); });
  }
  drawRibbons();
  window.addEventListener('resize', drawRibbons);

  /* ---------- The bead strand in the story section: Brittany's Garden Party, drawn ---------- */
  // Her real Garden Party necklace, bead for bead, drawn in the page's style (glass colors, a soft ink outline, a
  // glossy highlight): a green flower bead in the middle with the orange bell flower hanging under it, then outward on
  // both sides the way she strung it (peach, red with a leaf drop, green flower, leaf, aqua, lime, amber), repeating
  // up the sides off the edges. Gold wire links between the beads, and the drops swing when the cord bounces.
  const strandEl = document.getElementById('strand');
  const strand = { beads: [], slot: -1, look: null, raf: 0, swing: 0, zoom: 1 };
  // The cord hangs in a curve; `amp` is how deep it sags (it springs when a bead lands).
  const sag = (x, w, amp = 92) => 28 + amp * (1 - ((x - w / 2) / (w / 2)) ** 2);
  const slope = (x, w, amp = 92) => Math.atan(-2 * amp * (x - w / 2) / (w / 2) ** 2);
  let placeResting = null;

  const GLASS = { amber: '#e8930c', aqua: '#5fd0e6', lime: '#9bc23c', leaf: '#1f5a3a', peach: '#f0a17a', red: '#d8432c', green: '#7fb04a', flower: '#7fb04a', orange: '#f5821f' };
  // From the middle outward. `drop` hangs below that bead.
  const NEAR = [
    { kind: 'peach', r: 12 }, { kind: 'tube', r: 8, color: GLASS.red, drop: 'leaf' }, { kind: 'flower', r: 15 },
    { kind: 'facet', r: 9, color: GLASS.lime, drop: 'tube' }, { kind: 'peach', r: 13 }, { kind: 'leaf', r: 14 },
  ];
  const SIDE = [{ kind: 'rect', r: 13 }, { kind: 'facet', r: 10, color: GLASS.lime }, { kind: 'oval', r: 15 },
    { kind: 'facet', r: 9, color: GLASS.lime }, { kind: 'peach', r: 12 }, { kind: 'leaf', r: 13 }];

  function layoutStrand() {
    const w = strandEl.clientWidth, mid = w / 2, beads = [];
    // Bigger on wide screens so it still reads as a necklace, with room under it for the bell to hang.
    const z = strand.zoom = Math.min(1.55, Math.max(1, w / 820));
    strandEl.style.height = `${Math.round(Math.max(210, 140 + 70 * z))}px`;
    // The middle: a big green flower bead (the one that gets swapped) with the bell flower under it.
    beads.push({ x: mid, r: 19 * z, kind: 'flower', color: GLASS.green, drop: 'bell' });
    for (const dir of [-1, 1]) {
      let x = mid + dir * 19 * z, k = 0;
      while (dir < 0 ? x > -30 : x < w + 30) {
        const b = { ...(k < NEAR.length ? NEAR[k] : SIDE[(k - NEAR.length) % SIDE.length]) };
        b.r *= z;
        const half = b.kind === 'oval' || b.kind === 'rect' ? b.r * 1.3 : b.kind === 'leaf' ? b.r * 1.15 : b.kind === 'tube' ? b.r * 1.4 : b.r;
        x += dir * (7 * z + half);  // a gold link, then the bead
        b.x = x; b.dir = dir; b.half = half;
        beads.push(b);
        x += dir * half;
        k++;
      }
    }
    beads.sort((a, b) => a.x - b.x);
    strand.beads = beads;
    strand.slot = beads.findIndex(b => b.drop === 'bell');
  }

  /* drawing, all on a canvas context `c`, at x,y, turned to the cord's angle `a` */
  const ink = 'rgba(29,29,31,.72)', LINE = 1.6;
  const shade = (hex, amt) => { const n = parseInt(hex.slice(1), 16), f = v => Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt); return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`; };
  function glassFill(c, color, r) {
    const g = c.createRadialGradient(-r * .35, -r * .4, r * .05, 0, 0, r * 1.15);
    g.addColorStop(0, shade(color, .5)); g.addColorStop(.5, color); g.addColorStop(1, shade(color, -.35));
    return g;
  }
  function shine(c, r, sx = 1, sy = 1) {
    c.fillStyle = 'rgba(255,255,255,.85)';
    c.beginPath(); c.ellipse(-r * .38 * sx, -r * .42 * sy, r * .26 * sx, r * .13 * sy, -.55, 0, Math.PI * 2); c.fill();
  }
  const outline = c => { c.strokeStyle = ink; c.lineWidth = LINE; c.stroke(); };
  function leafPath(c, len, wid) {
    c.beginPath(); c.moveTo(-len, 0);
    c.quadraticCurveTo(-len * .2, -wid * 1.25, len, 0);
    c.quadraticCurveTo(-len * .2, wid * 1.25, -len, 0);
    c.closePath();
  }
  function veins(c, len, wid) {
    c.strokeStyle = '#c98a4a'; c.lineWidth = 1.1; c.beginPath(); c.moveTo(-len * .85, 0); c.lineTo(len * .8, 0);
    for (let t = -.5; t <= .5; t += .25) { c.moveTo(len * t, 0); c.lineTo(len * (t + .2), -wid * .55); c.moveTo(len * t, 0); c.lineTo(len * (t + .2), wid * .55); }
    c.stroke();
  }
  function drawGlass(c, b, x, y, a) {
    const r = b.r, color = b.color || GLASS[b.kind] || GLASS.amber;
    c.save(); c.translate(x, y); c.rotate(a);
    if (b.kind === 'spacer') {
      c.fillStyle = glassFill(c, '#d2a548', r); c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.fill();
    } else if (b.kind === 'oval' || b.kind === 'rect' || b.kind === 'tube') {
      const hw = b.half, hh = b.kind === 'oval' ? r : b.kind === 'rect' ? r * .82 : r * .78;
      const col = b.kind === 'oval' ? GLASS.amber : b.kind === 'rect' ? GLASS.aqua : color;
      c.fillStyle = glassFill(c, col, Math.max(hw, hh));
      c.beginPath();
      if (b.kind === 'oval') c.ellipse(0, 0, hw, hh, 0, 0, Math.PI * 2); else c.roundRect(-hw, -hh, hw * 2, hh * 2, b.kind === 'rect' ? 4 : hh * .6);
      c.fill();
      if (b.kind === 'rect') { c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 1.2; c.strokeRect(-hw * .62, -hh * .55, hw * 1.24, hh * 1.1); }
      if (b.kind === 'oval') { c.strokeStyle = 'rgba(120,60,0,.35)'; c.lineWidth = 1; c.beginPath(); c.moveTo(-hw * .1, -hh * .9); c.quadraticCurveTo(hw * .15, 0, -hw * .1, hh * .9); c.stroke(); }
      outline(c); shine(c, Math.min(hw, hh) * 1.1, hw / hh * .8, 1);
    } else if (b.kind === 'leaf') {
      leafPath(c, b.half, r * .62); c.fillStyle = glassFill(c, GLASS.leaf, r); c.fill();
      c.save(); c.clip(); veins(c, b.half, r * .62); c.restore();
      leafPath(c, b.half, r * .62); outline(c); shine(c, r * .7, 1.3, .8);
    } else {
      const col = b.kind === 'peach' ? GLASS.peach : color;
      c.fillStyle = glassFill(c, col, r); c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.fill();
      c.save(); c.clip();
      if (b.kind === 'peach') {  // speckled, like her peach glass
        c.fillStyle = 'rgba(150,70,40,.55)';
        for (let k = 0; k < 9; k++) { const t = k * 2.39, d = r * (.25 + (k % 3) * .22); c.beginPath(); c.arc(Math.cos(t) * d, Math.sin(t) * d, r * .07, 0, 7); c.fill(); }
      } else if (b.kind === 'facet') {  // faceted: a few lighter planes
        c.strokeStyle = 'rgba(255,255,255,.45)'; c.lineWidth = 1;
        c.beginPath(); for (let k = 0; k < 6; k++) { const t = k * Math.PI / 3; c.moveTo(Math.cos(t) * r * .45, Math.sin(t) * r * .45); c.lineTo(Math.cos(t) * r, Math.sin(t) * r); }
        c.moveTo(r * .45, 0); for (let k = 1; k <= 6; k++) { const t = k * Math.PI / 3; c.lineTo(Math.cos(t) * r * .45, Math.sin(t) * r * .45); }
        c.stroke();
      } else if (b.kind === 'flower') {  // her green lampwork beads: little white flowers with a red middle
        c.rotate(-a);
        for (const [fx, fy, fr] of [[0, 0, .5], [-.7, -.55, .32], [.72, -.5, .3], [.1, .78, .3]]) {
          c.fillStyle = '#fbfaf2';
          for (let k = 0; k < 5; k++) { const t = k * Math.PI * 2 / 5 - Math.PI / 2; c.beginPath(); c.arc(r * (fx + Math.cos(t) * fr * .55), r * (fy + Math.sin(t) * fr * .55), r * fr * .38, 0, 7); c.fill(); }
          c.fillStyle = fr > .4 ? '#c42a1e' : '#e9c13a'; c.beginPath(); c.arc(r * fx, r * fy, r * fr * .26, 0, 7); c.fill();
        }
      }
      c.restore();
      c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); outline(c); shine(c, r);
    }
    c.restore();
  }
  // Drops hang straight down from the cord (gravity, not the cord's angle), swinging by `sw` radians.
  function drawDrop(c, kind, x, y, sw) {
    c.save(); c.translate(x, y); c.rotate(sw); c.scale(strand.zoom, strand.zoom);
    c.strokeStyle = '#c9a24a'; c.lineWidth = 1.6;
    if (kind === 'bell') {
      c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 22); c.stroke();
      // a ring of tiny aqua seed beads, then the orange bell
      for (let k = 0; k < 7; k++) { const t = k * Math.PI * 2 / 7; c.fillStyle = '#7fd3c8'; c.beginPath(); c.arc(Math.cos(t) * 7, 24 + Math.sin(t) * 4, 2.6, 0, 7); c.fill(); c.strokeStyle = ink; c.lineWidth = .8; c.stroke(); }
      c.beginPath(); c.moveTo(-7, 27); c.bezierCurveTo(-13, 29, -13, 42, -16, 50);
      for (let k = 0; k < 4; k++) { const x0 = -16 + k * 8, x1 = x0 + 8; c.quadraticCurveTo((x0 + x1) / 2, 57 - (k % 3 ? 0 : 1), x1, 50); }
      c.bezierCurveTo(13, 42, 13, 29, 7, 27); c.closePath();
      const g = c.createRadialGradient(-5, 34, 2, 0, 40, 20); g.addColorStop(0, shade(GLASS.orange, .55)); g.addColorStop(.55, GLASS.orange); g.addColorStop(1, shade(GLASS.orange, -.3));
      c.fillStyle = g; c.fill(); outline(c);
      c.strokeStyle = 'rgba(255,240,215,.75)'; c.lineWidth = 1.1; c.beginPath(); c.moveTo(-4, 31); c.quadraticCurveTo(-7, 40, -8, 49); c.moveTo(4, 31); c.quadraticCurveTo(7, 40, 8, 49); c.stroke();
      c.fillStyle = 'rgba(255,255,255,.8)'; c.beginPath(); c.ellipse(-6, 36, 2.2, 5, .25, 0, 7); c.fill();
    } else if (kind === 'leaf') {
      c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 6); c.stroke();
      c.translate(0, 18); c.rotate(Math.PI / 2);
      leafPath(c, 12, 7); c.fillStyle = glassFill(c, GLASS.leaf, 10); c.fill();
      c.save(); c.clip(); veins(c, 12, 7); c.restore(); leafPath(c, 12, 7); outline(c);
    } else if (kind === 'tube') {
      c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 5); c.stroke();
      c.fillStyle = glassFill(c, GLASS.red, 8); c.beginPath(); c.roundRect(-5, 5, 10, 17, 4); c.fill(); outline(c); shine(c, 6, .8, 1.4);
    }
    c.restore();
  }

  function drawStrand(amp = 92) {
    const dpr = Math.min(2, window.devicePixelRatio || 1), w = strandEl.clientWidth, h = strandEl.clientHeight;
    if (!w) return;
    if (strandEl.width !== Math.round(w * dpr)) { strandEl.width = w * dpr; strandEl.height = h * dpr; }
    const ctx = strandEl.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    // Gold wire under everything.
    ctx.strokeStyle = '#c9a24a'; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.moveTo(-10, sag(-10, w, amp));
    for (let x = -4; x <= w + 10; x += 6) ctx.lineTo(x, sag(x, w, amp));
    ctx.stroke();
    const sw = strand.swing;
    strand.beads.forEach(b => { if (b.drop) drawDrop(ctx, b.drop, b.x, sag(b.x, w, amp) + (b.drop === 'bell' ? b.r * .62 : b.r * .6), sw * (b.drop === 'bell' ? 1 : 1.4) * (b.dir || 1)); });
    strand.beads.forEach((b, i) => {
      const bead = i === strand.slot && strand.look ? { ...b, ...strand.look, r: b.r } : b;
      // little gold loops at each end, like her wire-wrapped links
      const y = sag(b.x, w, amp), a = slope(b.x, w, amp);
      ctx.strokeStyle = '#c9a24a'; ctx.lineWidth = 1.4;
      for (const s of [-1, 1]) { const ex = b.x + Math.cos(a) * s * (b.half || b.r) + Math.cos(a) * s * 3, ey = y + Math.sin(a) * s * ((b.half || b.r) + 3); ctx.beginPath(); ctx.arc(ex, ey, 2.4, 0, 7); ctx.stroke(); }
      drawGlass(ctx, bead.kind === 'glass' || bead.kind === 'dots' || bead.kind === 'stripe' ? { ...bead, kind: 'plain' } : bead, b.x, y, a);
    });
  }
  // A damped spring: the cord dips and wobbles for about a second, and the drops swing a little longer.
  function bounceStrand() {
    const t0 = performance.now();
    cancelAnimationFrame(strand.raf);
    const anim = now => {
      const t = now - t0;
      strand.swing = 0.22 * Math.exp(-t / 520) * Math.sin(t / 150);
      drawStrand(92 * (1 + 0.12 * Math.exp(-t / 300) * Math.sin(t / 60)));
      strand.raf = t < 2000 ? requestAnimationFrame(anim) : 0;
      if (!strand.raf) { strand.swing = 0; drawStrand(); }
    };
    strand.raf = requestAnimationFrame(anim);
  }
  if (strandEl) {
    if (!reduceMotion) strand.look = { color: GLASS.amber, kind: 'plain' };  // until the flower bead drops in (Moment 2)
    layoutStrand(); drawStrand();
    let lastW = strandEl.clientWidth;
    new ResizeObserver(() => {
      if (strandEl.clientWidth === lastW) return;
      lastW = strandEl.clientWidth;
      layoutStrand(); drawStrand(); if (placeResting) placeResting();
    }).observe(strandEl);
  }

  // Used by shop.js. Without motion these resolve straight away and nothing moves.
  window.PlayFX = { toBag: () => Promise.resolve(), confetti: () => {} };

  if (reduceMotion) return;

  /* ---------- A glass bead element ---------- */
  // Nested so the sideways path (outer), up-and-down path (inner) and squash (ball) animate on their
  // own, which makes curved bounces look natural. The dots spin; the highlight stays put, like glass.
  function makeBead(size, look) {
    const el = document.createElement('span');
    el.className = 'gbead';
    el.setAttribute('aria-hidden', 'true');
    el.style.width = el.style.height = `${size}px`;
    el.innerHTML = `<span class="gbead-y"><span class="gbead-ball"><svg viewBox="0 0 40 40">
        <g class="gb-dots" fill="#fff">${[[20, 7], [32, 16], [28, 31], [12, 31], [8, 16], [20, 20]].map(([cx, cy], k) => `<circle cx="${cx}" cy="${cy}" r="${k === 5 ? 2.4 : 3}"/>`).join('')}</g>
        <g class="gb-stripes" fill="none" stroke="#fff8ee" stroke-width="3.2" stroke-linecap="round">${[11, 20, 29].map(y => `<path d="M2 ${y}Q11 ${y - 6} 20 ${y}T38 ${y}"/>`).join('')}</g>
        <g class="gb-flower">${[[20, 20, 7], [9, 10, 4.5], [31, 11, 4.2], [22, 34, 4.2]].map(([x, y, f]) => [0, 1, 2, 3, 4].map(k => `<circle cx="${(x + Math.cos(k * 1.2566 - 1.5708) * f * .55).toFixed(1)}" cy="${(y + Math.sin(k * 1.2566 - 1.5708) * f * .55).toFixed(1)}" r="${(f * .4).toFixed(1)}" fill="#fbfaf2"/>`).join('') + `<circle cx="${x}" cy="${y}" r="${(f * .27).toFixed(1)}" fill="${f > 6 ? '#c42a1e' : '#e9c13a'}"/>`).join('')}</g>
        <g class="gb-eight"><circle cx="20" cy="17.5" r="9" fill="#fff"/><text x="20" y="22.4" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="14" fill="#1d1d1f">8</text></g>
      </svg></span></span>`;
    setLook(el, look);
    return el;
  }
  function setLook(el, look) {
    el.look = look;
    el.querySelector('.gbead-ball').style.setProperty('--c', look.color);
    el.querySelector('.gb-dots').style.display = look.kind === 'dots' ? '' : 'none';
    el.querySelector('.gb-stripes').style.display = look.kind === 'stripe' ? '' : 'none';
    el.querySelector('.gb-flower').style.display = look.kind === 'flower' ? '' : 'none';
    el.querySelector('.gb-eight').style.display = look.kind === 'eight' ? '' : 'none';
  }
  const parts = el => ({ y: el.querySelector('.gbead-y'), ball: el.querySelector('.gbead-ball'), svg: el.querySelector('svg') });
  const IN = 'cubic-bezier(.5, 0, .9, .5)', OUT = 'cubic-bezier(.1, .5, .5, 1)';
  // Play one bounce path. xs / ys are [offset, value, easing] keyframes for the bead's center, in px.
  function fly(el, { xs, ys, squashAt = [], spin = 0, duration }) {
    const r = parseFloat(el.style.width) / 2, p = parts(el);
    const kf = (list, prop) => list.map(([offset, v, easing]) => ({ offset, transform: `${prop}(${v - r}px)`, easing: easing || 'linear' }));
    const opts = { duration, fill: 'forwards' };
    const anims = [el.animate(kf(xs, 'translateX'), opts), p.y.animate(kf(ys, 'translateY'), opts)];
    if (spin) anims.push(p.svg.animate([{ rotate: '0turn' }, { rotate: `${spin}turn` }], { duration, fill: 'forwards', easing: 'cubic-bezier(.3,.6,.4,1)' }));
    squashAt.forEach(at => p.ball.animate([
      { transform: 'scale(1, 1)' }, { transform: 'scale(1, 1)', offset: Math.max(0, at - 0.02) },
      { transform: 'scale(1.18, .82)', offset: at }, { transform: 'scale(.96, 1.04)', offset: Math.min(1, at + 0.06) },
      { transform: 'scale(1, 1)', offset: Math.min(1, at + 0.1) }, { transform: 'scale(1, 1)' },
    ], { duration }));
    // An interrupted animation shouldn't leave a moment stuck, so cancellations count as done.
    return Promise.all(anims.map(a => a.finished.catch(() => {})));
  }
  const once = (el, cb, threshold = 0.6) => {
    const io = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) { io.disconnect(); cb(); }
    }, { threshold });
    io.observe(el);
  };

  /* ---------- Moment 1: on the first screen, a bead bounces in and becomes the dot of the tagline's "!" ---------- */
  // Two daisies sit on the left of the photo like steps. The bead drops from the top, bounces off each one, hops onto
  // the tagline's letters (the n, then the d of "hand") and lands as the "!"'s dot, which gives the line a little bounce.
  // It plays once when the page opens; tap either flower to play it again.
  const hero = document.querySelector('.hero'), stageEl = document.querySelector('.stage');
  const tagline = document.querySelector('.tagline'), bang = tagline?.querySelector('.bang');
  if (hero && stageEl && bang) {
    const layer = document.createElement('div');
    layer.className = 'moment-hero';
    hero.appendChild(layer);
    const flowers = ['--coral', '--orchid'].map(color => {
      const f = document.createElement('button');
      f.type = 'button';
      f.className = 'moment-flower';
      f.setAttribute('aria-label', 'Bounce the bead down the flowers');
      f.innerHTML = SHAPES.daisy(css(color));
      layer.appendChild(f);
      return f;
    });
    const squish = f => f.animate([
      { transform: 'translateY(0) scale(1, 1)' },
      { transform: 'translateY(5px) scale(1.16, .76)', offset: 0.22 },
      { transform: 'translateY(-3px) scale(.94, 1.08)', offset: 0.55 },
      { transform: 'translateY(1px) scale(1.03, .97)', offset: 0.8 },
      { transform: 'translateY(0) scale(1, 1)' },
    ], { duration: 650, easing: 'ease-out' });

    // Where everything goes, measured from the page as it is now (in px, relative to the hero).
    function layout() {
      const box = hero.getBoundingClientRect(), rel = r => ({ l: r.left - box.left, r: r.right - box.left, t: r.top - box.top, b: r.bottom - box.top });
      const stage = rel(stageEl.getBoundingClientRect()), b = rel(bang.getBoundingClientRect());
      const fs = parseFloat(getComputedStyle(tagline).fontSize), d = fs * 0.22, R = d / 2;
      // The line with the word showing just before the "!" (it rotates, and could wrap on phones).
      const range = document.createRange();
      range.selectNodeContents(tagline.querySelector('.rot-word.on'));
      const line = rel([...range.getClientRects()].pop());
      const wide = stage.l > 120 || innerWidth > 760, FL = wide ? 52 : 38;
      // Desktop: out in the white space left of the splash, stepping down toward the tagline.
      const f1 = wide ? { x: Math.max(44, box.width * 0.07), y: stage.t + (stage.b - stage.t) * 0.42 } : { x: 34, y: stage.t + (stage.b - stage.t) * 0.42 };
      const f2 = wide ? { x: Math.max(96, box.width * 0.14), y: stage.t + (stage.b - stage.t) * 0.8 } : { x: 56, y: stage.b - FL * 0.6 };
      layer.style.height = `${box.height}px`;
      [f1, f2].forEach((f, k) => Object.assign(flowers[k].style, { width: `${FL}px`, left: `${f.x - FL / 2}px`, top: `${f.y}px` }));
      return {
        R, H: box.height, x1: f1.x, top1: f1.y + FL * 0.12, x2: f2.x, top2: f2.y + FL * 0.12,
        // Letter tops: the n's x-height, then the d's ascender, then the dot.
        xn: b.l - fs * 0.95, topN: line.t + fs * 0.42, xd: b.l - fs * 0.3, topD: line.t + fs * 0.16,
        cx: (b.l + b.r) / 2, cy: b.t + fs * 0.64 + R,
      };
    }
    layout();
    addEventListener('resize', () => { if (!playing) layout(); });

    let bead = null, playing = false;
    async function play() {
      if (playing) return;
      playing = true;
      await document.fonts.ready;
      await new Promise(r => requestAnimationFrame(r));
      tagline.dataset.busy = '1';  // hold the rotating words still while the bead hops along them
      const L = layout();
      bang.classList.add('waiting');
      if (bead) bead.remove();
      bead = makeBead(L.R * 2, { color: '#17171a', kind: 'eight' });
      layer.appendChild(bead);
      bead.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200 });

      // Segment lengths in ms: fall onto flower 1, hop to flower 2, the long hop onto the n, a hop to the d, into the dot.
      // The long hop takes longer the farther it has to go.
      const seg = [620, 520, Math.min(1100, Math.max(700, 500 + Math.abs(L.xn - L.x2) * 0.5)), 360, 400], D = seg.reduce((a, b) => a + b);
      const at = k => seg.slice(0, k).reduce((a, b) => a + b, 0) / D, mid = k => (at(k) + at(k + 1)) / 2;
      const [h1, h2, h3, h4] = [1, 2, 3, 4].map(at);
      setTimeout(() => squish(flowers[0]), D * h1);
      setTimeout(() => squish(flowers[1]), D * h2);
      await fly(bead, {
        duration: D, spin: 1.6, squashAt: [h1, h2, h3, h4],
        xs: [[0, L.x1], [h1, L.x1], [h2, L.x2], [h3, L.xn], [h4, L.xd], [1, L.cx]],
        ys: [[0, -30, IN], [h1, L.top1 - L.R, OUT], [mid(1), L.top1 - 80, IN], [h2, L.top2 - L.R, OUT],
             [mid(2), Math.min(L.top2, L.topN) - 130, IN], [h3, L.topN - L.R, OUT], [mid(3), L.topD - 44, IN],
             [h4, L.topD - L.R, OUT], [mid(4), L.topD - 40, IN], [1, L.cy]],
      });
      // Swap the flying bead for the drawn dot, and the line gives a little bounce.
      bang.classList.remove('waiting');
      bead.remove(); bead = null;
      tagline.animate([{ translate: '0 0' }, { translate: '0 5px' }, { translate: '0 -2px' }, { translate: '0 0' }], { duration: 420, easing: 'ease-out' });
      delete tagline.dataset.busy;
      tagline.dispatchEvent(new Event('landed'));
      playing = false;
    }
    flowers.forEach(f => f.addEventListener('click', play));
    // Play once when the page opens, if the first screen is in view; hide the dot until the bead arrives.
    if (hero.getBoundingClientRect().top < innerHeight * 0.5) {
      bang.classList.add('waiting');
      setTimeout(play, 700);
    }
  }

  /* ---------- The tagline's words take turns (Brittany's idea) ---------- */
  // "sparkle!", then "shiny!", "ooh!", "aah!", one every few seconds, typed: the old word backspaces away
  // letter by letter, then the new one types in, each letter bouncing up into place with a little tilt, and the
  // "!" rides along at the end. A long hold between words, and the clock starts over when the bead lands, so the
  // first word gets a full turn after it. It waits while the bead hops on the words and while the screen is away.
  const rot = tagline?.querySelector('.rot');
  if (rot) {
    const WORDS = ['sparkle', 'shiny', 'ooh', 'aah'];
    const HOLD = 5200, AFTER_LAND = 4800, DEL_MS = 45, PAUSE_MS = 260, TYPE_MS = 95;
    const word = rot.querySelector('.rot-word.on');
    const letter = ch => {
      const c = document.createElement('span');
      c.className = 'ch';
      c.textContent = ch;
      return c;
    };
    const fill = text => word.replaceChildren(...[...text].map(letter));
    fill(word.textContent);
    let k = 0, inView = true, timer = 0, typing = false;
    const later = ms => { clearTimeout(timer); timer = setTimeout(swap, ms); };
    const wait = ms => new Promise(r => setTimeout(r, ms));
    new IntersectionObserver(([e]) => { inView = e.isIntersecting; }).observe(tagline);
    tagline.addEventListener('landed', () => later(AFTER_LAND));
    async function swap() {
      if (tagline.dataset.busy || typing) return;  // the bead's landing starts the clock again
      if (document.hidden || !inView) return later(1000);
      typing = true;
      k = (k + 1) % WORDS.length;
      const next = WORDS[k];
      // If the bead starts hopping mid-word, finish the word at once so it lands on the right letters.
      const cut = () => tagline.dataset.busy && (fill(next), true);
      while (word.lastChild) {
        word.lastChild.remove();
        await wait(DEL_MS);
        if (cut()) break;
      }
      if (!tagline.dataset.busy) await wait(PAUSE_MS);
      for (const ch of next) {
        if (cut()) break;
        const c = word.appendChild(letter(ch));
        const tilt = (Math.random() * 2 - 1) * 9;
        c.animate([
          { transform: `translateY(.22em) scale(.3) rotate(${tilt}deg)`, opacity: 0 },
          { transform: `translateY(-.08em) scale(1.12) rotate(${-tilt / 2}deg)`, opacity: 1, offset: .55 },
          { transform: 'none', opacity: 1 },
        ], { duration: 320, easing: 'ease-out' });
        await wait(TYPE_MS + Math.random() * 40);  // a slightly uneven hand, like real typing
      }
      typing = false;
      later(HOLD);
    }
    later(HOLD);
  }

  /* ---------- Moment 2: a bead drops into the strand and knocks one loose ---------- */
  const story = document.querySelector('.story');
  if (strandEl && story && strand.slot >= 0) {
    let resting = null, side = 1, busy = false, restAt = 0;
    const slotPos = () => {
      const b = strand.beads[strand.slot], w = strandEl.clientWidth;
      return { x: strandEl.offsetLeft + b.x, y: strandEl.offsetTop + sag(b.x, w), r: b.r };
    };
    const floorY = r => strandEl.offsetTop + strandEl.clientHeight - r - 4;
    placeResting = () => {
      if (!resting) return;
      const s = slotPos(), r = parseFloat(resting.style.width) / 2;
      resting.getAnimations({ subtree: true }).forEach(a => a.cancel());
      resting.style.transform = `translateX(${s.x + restAt - r}px)`;
      resting.querySelector('.gbead-y').style.transform = `translateY(${floorY(r) - r}px)`;
    };

    // The bead that was in the slot falls off the strand, bounces and rolls a little way.
    async function knockLoose(look) {
      const s = slotPos(), el = makeBead(s.r * 2, look);
      el.classList.add('resting');
      el.removeAttribute('aria-hidden');
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.setAttribute('aria-label', 'Put this bead back on the necklace');
      story.appendChild(el);
      const fy = floorY(s.r), dist = Math.min(150, strandEl.clientWidth / 2 - 40) * side;
      restAt = dist;
      await fly(el, {
        duration: 1100, spin: dist / (Math.PI * s.r * 2), squashAt: [0.42, 0.68],
        xs: [[0, s.x], [0.1, s.x + side * 4], [0.42, s.x + dist * 0.35], [0.68, s.x + dist * 0.75], [1, s.x + dist, OUT]],
        ys: [[0, s.y, OUT], [0.1, s.y - 14, IN], [0.42, fy, OUT], [0.55, fy - 16, IN], [0.68, fy], [1, fy]],
      });
      resting = el;
      side = -side;
    }
    // Put a bead into the slot: the strand bounces and the bead that was there drops out.
    async function swapIn(el, fromX, fromY) {
      busy = true;
      const s = slotPos(), old = strand.look || strand.beads[strand.slot];
      const fromBelow = fromY > s.y;
      await fly(el, {
        duration: fromBelow ? 650 : 560, spin: 0.5,
        xs: [[0, fromX], [1, s.x, 'ease-in-out']],
        ys: fromBelow ? [[0, fromY, OUT], [0.5, s.y - 46, IN], [1, s.y]] : [[0, fromY, IN], [1, s.y]],
      });
      strand.look = el.look;
      el.remove();
      bounceStrand();
      await knockLoose({ color: old.color, kind: old.kind });
      busy = false;
    }

    // First time the strand comes into view: the middle has a plain amber bead in it, and her green flower bead
    // drops in from above to finish the necklace.
    once(strandEl, () => {
      const s = slotPos(), el = makeBead(s.r * 2, { color: GLASS.green, kind: 'flower' });
      story.appendChild(el);
      el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250 });
      swapIn(el, s.x, s.y - 240);
    }, 0.7);

    // Tap the loose bead (or press Enter on it) to hop it back in, knocking out the one there now.
    const putBack = e => {
      if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
      const el = e.target.closest('.gbead.resting');
      if (!el || el !== resting || busy) return;
      const s = slotPos(), r = parseFloat(el.style.width) / 2;
      const fromX = s.x + restAt, fromY = floorY(r);
      resting = null;
      el.classList.remove('resting');
      el.removeAttribute('role'); el.removeAttribute('tabindex'); el.setAttribute('aria-hidden', 'true');
      el.getAnimations({ subtree: true }).forEach(a => a.cancel());
      e.preventDefault();
      swapIn(el, fromX, fromY);
    };
    story.addEventListener('click', putBack);
    story.addEventListener('keydown', putBack);
  }

  /* ---------- Moment 3: the footer logo's 8-ball drops onto its I ---------- */
  // The 8-ball is a piece cut from the logo drawing itself (styles.css footer .logo .dot), so the one that falls is
  // exactly the one that stays: it drops from above, squashes on landing, and the logo gives a little bounce.
  const footLogo = document.querySelector('footer .logo'), footDot = footLogo?.querySelector('.dot');
  if (footLogo && footDot && !reduceMotion) {
    footDot.style.opacity = '0';
    once(footLogo, async () => {
      footDot.style.opacity = '1';
      footDot.style.transformOrigin = '50% 100%';
      const drop = footDot.animate([
        { translate: '0 -170px', opacity: 0, easing: 'cubic-bezier(.5, 0, .9, .5)' },
        { translate: '0 -120px', opacity: 1, offset: 0.15, easing: 'cubic-bezier(.5, 0, .9, .5)' },
        { translate: '0 0' },
      ], { duration: 560 });
      await drop.finished.catch(() => {});
      footDot.animate([{ scale: '1 1' }, { scale: '1.22 .78' }, { scale: '.94 1.08' }, { scale: '1 1' }], { duration: 380, easing: 'ease-out' });
      footLogo.animate([{ translate: '0 0' }, { translate: '0 4px' }, { translate: '0 -2px' }, { translate: '0 0' }], { duration: 420, easing: 'ease-out' });
    }, 0.8);
  }

  /* ---------- Add to bag: the bead hops onto the lava lamp and drops in ---------- */
  // A bead in the necklace's color arcs up and lands on the lamp's cap, which squishes; it bounces once and drops
  // into the lamp, and the wax turns the bead's color (shop.js keeps it that color until the next one or checkout).
  const lamp = document.querySelector('.bag-lamp');
  if (lamp && reduceMotion) lamp.pauseAnimations?.();
  const squishLamp = (x, y, duration) => lamp.animate(
    [{ scale: '1 1' }, { scale: `${x} ${y}` }, { scale: `${2 - x} ${2 - y}` }, { scale: '1 1' }], { duration, easing: 'ease-out' });
  window.PlayFX.toBag = async (from, color) => {
    if (!lamp) return;
    const target = lamp.getBoundingClientRect(), s = target.height / 100;
    const x0 = from.left + from.width / 2, y0 = from.top + from.height / 2;
    const cx = target.left + target.width / 2, land = target.top + 2 * s, inside = target.top + 45 * s;
    const el = makeBead(14, { color, kind: 'dots' });
    el.style.position = 'fixed';
    el.style.zIndex = '60';
    document.body.appendChild(el);
    // Arc up onto the cap (620ms), then one bounce and down into the glass (480ms).
    const D = 1100, h = 620 / D;
    setTimeout(() => squishLamp(1.1, .88, 420), D * h);
    await fly(el, {
      duration: D, spin: 1.2, squashAt: [h],
      xs: [[0, x0, 'cubic-bezier(.4, 0, .6, 1)'], [h, cx], [h + (1 - h) * .45, cx + 4], [1, cx]],
      // The lamp sits at the top of the screen, so the arc may peek just past the top edge to drop onto it from above.
      ys: [[0, y0, OUT], [h * .45, Math.max(-24, Math.min(y0, land) - 70), IN], [h, land, OUT],
           [h + (1 - h) * .45, land - Math.max(20, 22 * s), IN], [1, inside]],
    });
    el.animate([{ scale: 1 }, { scale: 0 }], { duration: 120, fill: 'forwards' }).finished.catch(() => {}).then(() => el.remove());
    lamp.closest('.bag-btn').style.setProperty('--wax', color);
    squishLamp(1.05, .95, 260);
  };

  /* ---------- Email signup: a few beads pop up like confetti ---------- */
  window.PlayFX.confetti = (from, host = document.querySelector('.signup')) => {
    if (!host) return;
    const h = host.getBoundingClientRect();
    const cx = from.left - h.left + from.width / 2, cy = from.top - h.top + from.height / 2;
    const colors = ['--cobalt', '--coral', '--turquoise', '--uranium', '--orchid', '--rubino'].map(css);
    colors.forEach((c, i) => {
      const size = 10 + Math.round(Math.random() * 7), el = makeBead(size, { color: c, kind: i % 2 ? 'dots' : 'glass' });
      host.appendChild(el);
      const dx = (i - 2.5) * 34 + (Math.random() - 0.5) * 20, peak = 70 + Math.random() * 60, dur = 900 + Math.random() * 300;
      fly(el, {
        duration: dur, spin: dx / 60,
        xs: [[0, cx], [1, cx + dx * 1.6, OUT]],
        ys: [[0, cy, OUT], [0.4, cy - peak, IN], [1, cy + 40]],
      }).then(() => el.remove());
      el.animate([{ opacity: 1 }, { opacity: 1, offset: 0.7 }, { opacity: 0 }], { duration: dur, fill: 'forwards' });
    });
  };
})();
