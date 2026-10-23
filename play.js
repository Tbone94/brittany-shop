// Small bits of play, kept contained so they never get in the way of shopping:
//   - a few groovy sprinkles around the page that wiggle when hovered and spin when clicked
//   - two short moments that play once when they come into view (tap to play again):
//       1. Hero: when the page opens, a glass bead bounces down two daisies like steps, lands and rolls
//          into the "See this one" button.
//       2. Story: a bead drops into the middle of the bead strand, the strand bounces, and the bead
//          it replaces falls off and rolls a little way. Tap that bead to put it back in.
//       3. Footer: a bead drops into the dot of the "i" in the big logo, and the word gives a little bounce.
//   - two that answer something you do: adding to the bag sends a bead arcing into the Bag button,
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
    { in: '.story', shape: 'daisy', color: '--orchid', size: 30, style: 'bottom:14%;right:5%' },
    { in: '.signup', shape: 'sparkle', color: '--cobalt', size: 26, style: 'top:30%;right:calc(50% - 320px)' },
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

  /* ---------- Wavy ribbons in the page background ---------- */
  // 70s-style bands of stacked wavy stripes that flow edge to edge behind the content. They use soft
  // pastel tints of the glass colors so they set the mood without competing with the photos.
  // Placement follows research/ribbon-layout.md: two shallow angles alternating down the page (never flat),
  // ends always run off the edges, about one ribbon per screen, nothing crossing text, and none near the
  // rainbow divider above the footer. On phones only the ribbons marked small: true show, steeper and thinner.
  const RIBBONS = [
    { in: '.shop', colors: ['--turquoise', '--uranium', '--coral'], top: '27%', angle: 8, height: 240, amp: 28, seed: 9 },
    { in: '.shop', colors: ['--orchid', '--coral', '--uranium'], top: '76%', angle: -8, height: 240, amp: 28, seed: 14 },
    { in: '.perks', colors: ['--uranium', '--coral', '--rubino'], top: '50%', angle: 10, height: 220, amp: 30, seed: 21, small: true },
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

  /* ---------- The bead strand in the story section ---------- */
  const strandEl = document.getElementById('strand');
  const strand = { beads: [], slot: -1, look: null, raf: 0 };
  // The cord hangs in a curve; `amp` is how deep it sags (it springs when a bead lands).
  const sag = (x, w, amp = 92) => 28 + amp * (1 - ((x - w / 2) / (w / 2)) ** 2);
  let placeResting = null;

  function layoutStrand() {
    const w = strandEl.clientWidth;
    const rand = S.rng(5), colors = P.flatMap(p => [...p.palette, p.focal.color]);
    strand.beads = [];
    for (let x = -10; x < w + 24;) {
      const big = rand() < 0.55, r = big ? 11 + rand() * 11 : 5, roll = rand();
      x += r;
      strand.beads.push(big
        ? { x, r, kind: roll < 0.3 ? 'dots' : roll < 0.45 ? 'stripe' : 'glass', color: colors[Math.floor(rand() * colors.length)], dot: '#fff8ee', seed: rand() * 6 }
        : { x, r, kind: 'spacer', metal: roll < 0.5 ? 'gold' : 'silver' });
      x += r + 1;
    }
    // The big bead nearest the middle is the one that gets swapped.
    let best = -1;
    strand.beads.forEach((b, i) => { if (b.kind !== 'spacer' && b.r > 15 && (best < 0 || Math.abs(b.x - w / 2) < Math.abs(strand.beads[best].x - w / 2))) best = i; });
    strand.slot = best;
  }
  function drawStrand(amp = 92) {
    const dpr = Math.min(2, window.devicePixelRatio || 1), w = strandEl.clientWidth, h = strandEl.clientHeight;
    if (!w) return;
    if (strandEl.width !== Math.round(w * dpr)) { strandEl.width = w * dpr; strandEl.height = h * dpr; }
    const ctx = strandEl.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = '#a1a1a6'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-10, sag(-10, w, amp));
    for (let x = -4; x <= w + 10; x += 6) ctx.lineTo(x, sag(x, w, amp));
    ctx.stroke();
    strand.beads.forEach((b, i) => {
      const bead = i === strand.slot && strand.look ? { ...b, ...strand.look, r: b.r } : b;
      S.drawBead(ctx, bead, b.x, sag(b.x, w, amp), 0);
    });
  }
  // A damped spring: the cord dips and wobbles for about a second.
  function bounceStrand() {
    const t0 = performance.now();
    cancelAnimationFrame(strand.raf);
    const anim = now => {
      const t = now - t0;
      drawStrand(92 * (1 + 0.12 * Math.exp(-t / 300) * Math.sin(t / 60)));
      strand.raf = t < 1300 ? requestAnimationFrame(anim) : 0;
      if (!strand.raf) drawStrand();
    };
    strand.raf = requestAnimationFrame(anim);
  }
  if (strandEl) {
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
      </svg></span></span>`;
    setLook(el, look);
    return el;
  }
  function setLook(el, look) {
    el.look = look;
    el.querySelector('.gbead-ball').style.setProperty('--c', look.color);
    el.querySelector('.gb-dots').style.display = look.kind === 'dots' ? '' : 'none';
    el.querySelector('.gb-stripes').style.display = look.kind === 'stripe' ? '' : 'none';
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

  /* ---------- Moment 1: on the first screen, a bead bounces down two daisies like steps and rolls away ---------- */
  // The flowers sit in the empty space at the bottom left (on phones, beside the dots and the price). The bead
  // drops from the top, bounces off each flower, lands level with the "See this one" button and rolls into it,
  // giving it a little bump. It plays once when the page opens; tap either flower to play it again.
  const hero = document.querySelector('.hero'), stageEl = document.querySelector('.stage'), btnEl = document.getElementById('heroShop');
  if (hero && stageEl && btnEl) {
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
      const box = hero.getBoundingClientRect(), rel = el => { const r = el.getBoundingClientRect(); return { l: r.left - box.left, r: r.right - box.left, t: r.top - box.top, b: r.bottom - box.top }; };
      const card = rel(stageEl), pager = rel(document.querySelector('.pager')), actions = rel(document.querySelector('.hero-actions')), btn = rel(document.getElementById('heroShop'));
      const H = Math.min(box.height, innerHeight - (box.top + scrollY)), R = 11;
      const wideGap = card.l > 200;
      const FL = wideGap ? 52 : 38;
      let f1, f2;
      if (wideGap) {
        // Desktop: two steps down the bottom-left of the first screen, beside the card and then below it.
        f1 = { x: card.l * 0.2, y: card.t + (card.b - card.t) * 0.6 };
        f2 = { x: card.l * 0.42, y: Math.min(card.b + 70, H - FL - 70) };
      } else {
        // Phones: one step left of the dots, one left of the price.
        const meta = rel(document.querySelector('.now-meta'));
        f1 = { x: 30, y: pager.t - 12 };
        f2 = { x: 44, y: meta.t - 10 };
      }
      layer.style.height = `${H}px`;
      [f1, f2].forEach((f, k) => Object.assign(flowers[k].style, { width: `${FL}px`, left: `${f.x - FL / 2}px`, top: `${f.y}px` }));
      // The bead lands level with the "See this one" button and rolls into its left side.
      return { R, H, ground: btn.b - R - 2, top1: f1.y + FL * 0.12, top2: f2.y + FL * 0.12, x1: f1.x, x2: f2.x, stopX: btn.l - R + 1 };
    }
    layout();
    addEventListener('resize', () => { if (!playing) layout(); });

    let bead = null, playing = false;
    async function play() {
      if (playing) return;
      playing = true;
      // Measure once the fonts are in, so the button is where it will stay.
      await document.fonts.ready;
      await new Promise(r => requestAnimationFrame(r));
      const L = layout();
      if (bead) { await bead.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: 'forwards' }).finished.catch(() => {}); bead.remove(); }
      bead = makeBead(L.R * 2, { color: css('--cobalt'), kind: 'dots' });
      layer.appendChild(bead);
      bead.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200 });

      // Segment lengths in ms: fall, hop to flower 2, hop to the ground, a little bounce, then the roll.
      const gap = Math.max(30, L.stopX - L.x2), xLand = L.x2 + gap * 0.3, xHop = xLand + Math.min(44, gap * 0.2);
      const stopX = Math.max(L.stopX, xHop + 10), roll = stopX - xHop;
      const seg = [620, 520, 600, 300, Math.max(450, roll * 2.6)];
      const D = seg.reduce((a, b) => a + b), at = k => seg.slice(0, k).reduce((a, b) => a + b, 0) / D;
      const mid = k => (at(k) + at(k + 1)) / 2;
      const h1 = at(1), h2 = at(2), h3 = at(3), h4 = at(4);
      setTimeout(() => squish(flowers[0]), D * h1);
      setTimeout(() => squish(flowers[1]), D * h2);
      // The bead bumps the button when it rolls into it.
      setTimeout(() => btnEl.animate([
        { transform: 'translateX(0) rotate(0)' }, { transform: 'translateX(5px) rotate(1.5deg)', offset: 0.3 },
        { transform: 'translateX(-2px) rotate(-.6deg)', offset: 0.65 }, { transform: 'translateX(0) rotate(0)' },
      ], { duration: 450, easing: 'ease-out' }), D - 20);
      await fly(bead, {
        duration: D, spin: 1.2 + roll / (2 * Math.PI * L.R), squashAt: [h1, h2, h3, h4],
        xs: [[0, L.x1], [h1, L.x1], [h2, L.x2], [h3, xLand], [h4, xHop, 'cubic-bezier(.3,.5,.6,.95)'], [1, stopX]],
        ys: [[0, -30, IN], [h1, L.top1 - L.R, OUT], [mid(1), L.top1 - 80, IN], [h2, L.top2 - L.R, OUT], [mid(2), L.top2 - 70, IN],
             [h3, L.ground, OUT], [mid(3), L.ground - 20, IN], [h4, L.ground], [1, L.ground]],
      });
      playing = false;
    }
    flowers.forEach(f => f.addEventListener('click', play));
    layer.addEventListener('click', e => { if (e.target.closest('.gbead')) play(); });
    // Play once when the page opens, if the hero is on screen.
    setTimeout(() => { if (hero.getBoundingClientRect().top < innerHeight * 0.5) play(); }, 900);
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

    // First time the strand comes into view: a new bead drops in from above.
    once(strandEl, () => {
      const s = slotPos(), el = makeBead(s.r * 2, { color: css('--cobalt'), kind: 'dots' });
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

  /* ---------- Moment 3: a bead drops into the footer logo's i-dot ---------- */
  const footLogo = document.querySelector('footer .logo'), footDot = footLogo?.querySelector('.dot');
  if (footLogo && footDot) {
    const foot = document.querySelector('footer');
    footDot.style.opacity = '0';
    once(footLogo, async () => {
      const d = footDot.getBoundingClientRect(), f = foot.getBoundingClientRect();
      const cx = d.left - f.left + d.width / 2, cy = d.top - f.top + d.height / 2;
      const el = makeBead(d.width, { color: css('--coral'), kind: 'glass' });
      foot.appendChild(el);
      el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200 });
      await fly(el, { duration: 520, xs: [[0, cx], [1, cx]], ys: [[0, cy - 150, IN], [1, cy]] });
      el.remove();
      footDot.style.opacity = '1';
      footDot.animate([{ scale: '1 1' }, { scale: '1.3 .7' }, { scale: '.9 1.1' }, { scale: '1 1' }], { duration: 380, easing: 'ease-out' });
      footLogo.animate([{ translate: '0 0' }, { translate: '0 4px' }, { translate: '0 -2px' }, { translate: '0 0' }], { duration: 420, easing: 'ease-out' });
    }, 0.8);
  }

  /* ---------- Add to bag: a bead arcs into the Bag button ---------- */
  window.PlayFX.toBag = async (from, color) => {
    const target = document.getElementById('bagCount')?.getBoundingClientRect();
    if (!target) return;
    const el = makeBead(18, { color, kind: 'dots' });
    el.style.position = 'fixed';
    el.style.zIndex = '60';
    document.body.appendChild(el);
    const x0 = from.left + from.width / 2, y0 = from.top + from.height / 2;
    const x1 = target.left + target.width / 2, y1 = target.top + target.height / 2;
    await fly(el, {
      duration: 650, spin: 1,
      xs: [[0, x0], [1, x1, 'cubic-bezier(.4, 0, .6, 1)']],
      ys: [[0, y0, OUT], [0.4, Math.max(14, Math.min(y0, y1) - 70), IN], [1, y1]],
    });
    await el.animate([{ opacity: 1, scale: 1 }, { opacity: 0, scale: 0.4 }], { duration: 140, fill: 'forwards' }).finished.catch(() => {});
    el.remove();
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
