// Stand-in photos, drawn in code until real ones exist: the same figure at seven turn angles,
// wearing whichever necklace from products.js it's given, on a transparent background
// (the page paints the color splash behind it).
(() => {
  const W = 800, H = 1000, R = 150, CX = 400, HY = 225, TAU = Math.PI * 2;
  const C = {
    skin: '#eec3a9', skinLt: '#f9dccb', skinDk: '#cf9a80',
    hair: '#3a2620', hairLt: '#6a4738',
    top: '#e4d8c6', topLt: '#fbf6ee', lip: '#c47c74',
  };

  // Seven angles: profile left → front → profile right.
  const ANGLES = [-90, -60, -30, 0, 30, 60, 90].map(d => d * Math.PI / 180);

  function rng(seed) {
    return () => {
      seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  const rgb = h => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
  const mix = (h, to, t) => { const a = rgb(h), b = to === 'w' ? [255, 255, 255] : [20, 10, 8]; return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t))})`; };

  // Smooth curve through points (Catmull-Rom as Béziers); the path must already be at pts[0].
  function smooth(ctx, pts) {
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      ctx.bezierCurveTo(p1.x + (p2.x - p0.x) / 6, p1.y + (p2.y - p0.y) / 6, p2.x - (p3.x - p1.x) / 6, p2.y - (p3.y - p1.y) / 6, p2.x, p2.y);
    }
  }
  const circle = (ctx, x, y, r) => { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); };

  // The body is a stack of elliptical cross-sections; turning it changes each one's projected width.
  // y = height below head centre, a = half-width, b = half-depth, c = forward offset (all × R).
  const LEVELS = [
    { y: 0.50, a: 0.40, b: 0.44, c: 0.06 },
    { y: 1.15, a: 0.46, b: 0.50, c: 0.10 },
    { y: 1.42, a: 1.05, b: 0.60, c: 0.10 },
    { y: 1.70, a: 1.80, b: 0.74, c: 0.06 },
    { y: 2.15, a: 2.02, b: 0.84, c: 0.10 },
    { y: 3.00, a: 1.96, b: 0.92, c: 0.18 },
    { y: 6.50, a: 1.90, b: 0.92, c: 0.18 },
  ];

  function torsoPath(ctx, th) {
    const s = Math.sin(th), c = Math.cos(th), L = [], Rt = [];
    for (const lv of LEVELS) {
      const mx = CX + lv.c * R * s, half = R * Math.hypot(lv.a * c, lv.b * s), y = HY + lv.y * R;
      L.push({ x: mx - half, y }); Rt.push({ x: mx + half, y });
    }
    ctx.beginPath();
    ctx.moveTo(L[0].x, L[0].y); smooth(ctx, L);
    ctx.lineTo(Rt.at(-1).x, Rt.at(-1).y); smooth(ctx, Rt.slice().reverse());
    ctx.closePath();
  }

  function drawBody(ctx, th) {
    const s = Math.sin(th), c = Math.cos(th);
    ctx.save();
    torsoPath(ctx, th);
    const g = ctx.createLinearGradient(CX - 2.2 * R, 0, CX + 2.2 * R, 0);
    g.addColorStop(0, C.skinLt); g.addColorStop(0.55, C.skin); g.addColorStop(1, C.skinDk);
    ctx.fillStyle = g; ctx.fill(); ctx.clip();

    // Shadow the head casts on the neck.
    const sx = CX + 0.15 * R * s, sy = HY + 1.0 * R;
    const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, 0.75 * R);
    sg.addColorStop(0, 'rgba(160,90,70,.4)'); sg.addColorStop(1, 'rgba(160,90,70,0)');
    ctx.fillStyle = sg; ctx.fillRect(0, 0, W, H);

    // Collarbones, fading out as she turns to profile.
    const ca = 0.3 * Math.max(0, c);
    if (ca > 0.03) {
      ctx.strokeStyle = `rgba(175,105,85,${ca})`; ctx.lineWidth = 3; ctx.lineCap = 'round';
      for (const side of [-1, 1]) {
        const x0 = CX + 0.6 * R * s + side * 0.16 * R * c, y0 = HY + 1.6 * R;
        ctx.beginPath(); ctx.moveTo(x0, y0);
        ctx.quadraticCurveTo(x0 + side * 0.6 * R * c, y0 - 0.1 * R, x0 + side * 1.25 * R * c, y0 - 0.04 * R);
        ctx.stroke();
      }
    }

    // Top: a wide neckline that dips slightly at the front of the chest.
    const fx = CX + 0.95 * R * s, yN = HY + 2.55 * R, wN = 0.55 * R * Math.abs(c) + 0.18 * R;
    ctx.beginPath(); ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 8) ctx.lineTo(x, yN + 0.16 * R * Math.exp(-(((x - fx) / wN) ** 2)));
    ctx.lineTo(W, H); ctx.closePath();
    const tg = ctx.createLinearGradient(CX - 2.2 * R, 0, CX + 2.2 * R, 0);
    tg.addColorStop(0, C.topLt); tg.addColorStop(1, C.top);
    ctx.fillStyle = tg; ctx.fill();
    ctx.restore();
  }

  function drawHead(ctx, th) {
    const s = Math.sin(th), c = Math.cos(th), hx = CX + 0.08 * R * s;

    // Bun at the back, then the hair mass behind the face. Hair stops at a rounded line around the ears.
    const hairClip = () => { ctx.beginPath(); ctx.arc(hx - 0.25 * R * s, HY - 0.55 * R, 1.17 * R, 0, TAU); ctx.clip(); };
    ctx.fillStyle = C.hair;
    circle(ctx, hx - 0.92 * R * s, HY - 0.42 * R, 0.36 * R);
    ctx.save();
    hairClip();
    circle(ctx, hx - 0.1 * R * s, HY - 0.03 * R, 1.03 * R);
    ctx.restore();

    const skinPath = () => {
      ctx.beginPath();
      ctx.arc(hx + 0.04 * R * s, HY, 0.96 * R, 0, TAU);
      ctx.moveTo(hx + 0.2 * R * s + 0.72 * R, HY + 0.28 * R);
      ctx.ellipse(hx + 0.2 * R * s, HY + 0.28 * R, 0.72 * R, 0.74 * R, 0, 0, TAU);
    };
    ctx.save();
    skinPath();
    const fg = ctx.createRadialGradient(hx - 0.3 * R, HY - 0.3 * R, 0.1 * R, hx, HY, 1.2 * R);
    fg.addColorStop(0, C.skinLt); fg.addColorStop(1, C.skin);
    ctx.fillStyle = fg; ctx.fill();
    ctx.clip();

    // Hair covers everything outside the face oval; the oval slides forward as she turns.
    hairClip();
    ctx.beginPath();
    ctx.rect(0, 0, W, H);
    ctx.ellipse(hx + 0.62 * R * s, HY + 0.24 * R, 0.82 * R, 0.84 * R, 0, 0, TAU);
    ctx.fillStyle = C.hair; ctx.fill('evenodd');
    const hl = ctx.createRadialGradient(hx - 0.4 * R, HY - 0.7 * R, 0, hx - 0.4 * R, HY - 0.7 * R, 0.6 * R);
    hl.addColorStop(0, 'rgba(140,100,80,.35)'); hl.addColorStop(1, 'rgba(140,100,80,0)');
    ctx.fillStyle = hl; ctx.fillRect(0, 0, W, H);
    ctx.restore();

    // Ears.
    for (const side of [-1, 1]) {
      const a = th + side * Math.PI / 2, z = Math.cos(a);
      if (z < -0.02) continue;
      const ex = hx + 0.93 * R * Math.sin(a) + 0.04 * R * s, ey = HY + 0.14 * R;
      ctx.fillStyle = C.skin;
      ctx.beginPath(); ctx.ellipse(ex, ey, R * (0.05 + 0.07 * z), 0.17 * R, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = C.skinDk; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(ex, ey, R * (0.025 + 0.035 * z), 0.09 * R, 0, -1.2, 1.6); ctx.stroke();
    }

    // Blush.
    for (const e of [-0.75, 0.75]) {
      const a = th + e, z = Math.cos(a);
      if (z <= 0) continue;
      const bx = hx + 0.8 * R * Math.sin(a), by = HY + 0.36 * R;
      const bg = ctx.createRadialGradient(bx, by, 0, bx, by, 0.2 * R);
      bg.addColorStop(0, `rgba(215,105,95,${0.25 * z})`); bg.addColorStop(1, 'rgba(215,105,95,0)');
      ctx.fillStyle = bg; ctx.fillRect(bx - R, by - R, 2 * R, 2 * R);
    }

    // Closed, relaxed eyes and brows.
    ctx.lineCap = 'round';
    for (const e of [-0.42, 0.42]) {
      const a = th + e, z = Math.cos(a);
      if (z < 0.12) continue;
      const x = hx + 0.86 * R * Math.sin(a) + 0.04 * R * s, w = 0.17 * R * z;
      ctx.strokeStyle = C.hair; ctx.lineWidth = 3.2;
      ctx.beginPath(); ctx.moveTo(x - w / 2, HY + 0.12 * R);
      ctx.quadraticCurveTo(x, HY + 0.19 * R, x + w / 2, HY + 0.12 * R); ctx.stroke();
      ctx.globalAlpha = 0.55; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(x - w * 0.6, HY - 0.04 * R);
      ctx.quadraticCurveTo(x, HY - 0.11 * R, x + w * 0.6, HY - 0.04 * R); ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Nose: a wedge that pokes past the silhouette in profile.
    ctx.fillStyle = C.skin;
    ctx.beginPath();
    ctx.moveTo(hx + 0.98 * R * s, HY + 0.04 * R);
    ctx.lineTo(hx + 1.13 * R * s, HY + 0.38 * R);
    ctx.lineTo(hx + 0.93 * R * s, HY + 0.46 * R);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = C.skinDk; ctx.lineWidth = 2.4; ctx.globalAlpha = 0.8;
    const nx = hx + 1.02 * R * s;
    ctx.beginPath(); ctx.moveTo(nx - 0.07 * R * c, HY + 0.4 * R);
    ctx.quadraticCurveTo(nx, HY + 0.47 * R, nx + 0.07 * R * c, HY + 0.4 * R); ctx.stroke();
    ctx.globalAlpha = 1;

    // Lips.
    const mx = hx + 0.74 * R * s, my = HY + 0.62 * R, mw = 0.2 * R * Math.abs(c) + 0.06 * R;
    ctx.fillStyle = C.lip;
    ctx.beginPath(); ctx.ellipse(mx, my, mw / 2, 0.05 * R, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(90,35,30,.6)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(mx - mw / 2, my); ctx.quadraticCurveTo(mx, my + 0.015 * R, mx + mw / 2, my); ctx.stroke();
  }

  // Necklace: a 3D loop around the neck that drops lowest at the front, beads strung along its arc length.
  function buildNecklace(nk) {
    const pt = u => {
      const f = Math.pow((1 + Math.cos(u)) / 2, 2.2), cu = Math.cos(u);
      return { x: nk.rN * R * Math.sin(u), y: HY + R * (1.26 + nk.drop * f), z: cu > 0 ? cu * R * (0.55 + 0.4 * f) : cu * R * 0.54 };
    };
    const STEPS = 600, us = [], ss = [];
    let acc = 0, prev = pt(0);
    for (let i = 0; i <= STEPS; i++) {
      const u = Math.PI * i / STEPS, p = pt(u);
      if (i) acc += Math.hypot(p.x - prev.x, p.y - prev.y, p.z - prev.z);
      us.push(u); ss.push(acc); prev = p;
    }
    const at = sv => {
      let i = ss.findIndex(v => v >= sv);
      if (i <= 0) return pt(0);
      const t = (sv - ss[i - 1]) / (ss[i] - ss[i - 1]);
      return pt(us[i - 1] + t * (us[i] - us[i - 1]));
    };

    const rand = rng(nk.seed), beads = [];
    const fr = nk.focal.r * R, fp = pt(0);
    beads.push({ ...fp, y: fp.y + fr * 0.55, ...nk.focal, r: fr, seed: rand() * 6 });
    let sv = fr * 0.8;
    const maxS = ss[STEPS] * nk.span;
    for (let i = 1; i < 200; i++) {
      const b = nk.bead(i, rand);
      if (b.gap) { sv += b.gap * R; continue; }
      const r = b.r * R;
      sv += r + 0.5;
      if (sv + r > maxS) break;
      const p = at(sv), seed = rand() * 6;
      beads.push({ ...p, ...b, r, seed });
      beads.push({ ...p, x: -p.x, ...b, r, seed: seed + 1 });
      sv += r + 0.5;
    }
    const cord = [];
    for (let k = 0; k <= 160; k++) cord.push(pt(-Math.PI + TAU * k / 160));
    return { beads, cord };
  }

  const project = (p, th) => {
    const s = Math.sin(th), c = Math.cos(th);
    return { X: CX + p.x * c + p.z * s, Y: p.y, Z: -p.x * s + p.z * c };
  };

  function drawCord(ctx, geo, th, nk, front) {
    ctx.strokeStyle = nk.cord; ctx.lineWidth = nk.cordW || 2.2; ctx.lineCap = 'round';
    for (let k = 0; k < geo.cord.length - 1; k++) {
      const a = project(geo.cord[k], th), b = project(geo.cord[k + 1], th);
      if ((a.Z + b.Z >= 0) !== front) continue;
      ctx.beginPath(); ctx.moveTo(a.X, a.Y); ctx.lineTo(b.X, b.Y); ctx.stroke();
    }
  }

  function drawBead(ctx, b, X, Y, Z) {
    const r = b.r * (1 + Z / (9 * R));
    if (b.kind === 'spacer') {
      const base = b.metal === 'gold' ? '#d2a548' : '#c7ccd2';
      const g = ctx.createRadialGradient(X - r * 0.35, Y - r * 0.4, r * 0.1, X, Y, r);
      g.addColorStop(0, '#fff'); g.addColorStop(0.35, base); g.addColorStop(1, mix(base, 'k', 0.45));
      ctx.fillStyle = g; circle(ctx, X, Y, r);
      return;
    }
    if (Z > 0) { ctx.fillStyle = 'rgba(130,70,55,.2)'; ctx.beginPath(); ctx.ellipse(X + r * 0.28, Y + r * 0.38, r * 0.95, r * 0.8, 0, 0, TAU); ctx.fill(); }

    const g = ctx.createRadialGradient(X - r * 0.35, Y - r * 0.4, r * 0.05, X, Y, r * 1.05);
    g.addColorStop(0, mix(b.color, 'w', 0.55)); g.addColorStop(0.45, b.color); g.addColorStop(1, mix(b.color, 'k', 0.45));
    ctx.fillStyle = g; circle(ctx, X, Y, r);

    ctx.save();
    ctx.beginPath(); ctx.arc(X, Y, r, 0, TAU); ctx.clip();
    if (b.kind === 'dots') {
      for (let k = 0; k < 6; k++) {
        const a = b.seed + k * TAU / 6, dx = Math.cos(a) * r * 0.58, dy = Math.sin(a) * r * 0.5;
        ctx.fillStyle = b.dot; circle(ctx, X + dx, Y + dy, r * 0.15);
      }
    }
    if (b.kind === 'stripe') {
      ctx.strokeStyle = b.dot; ctx.lineWidth = r * 0.16;
      for (const off of [-0.4, 0.05, 0.5]) {
        ctx.beginPath(); ctx.moveTo(X - r, Y + off * r);
        ctx.bezierCurveTo(X - r * 0.3, Y + off * r - r * 0.35, X + r * 0.3, Y + off * r + r * 0.35, X + r, Y + off * r);
        ctx.stroke();
      }
    }
    // Rim shading over the decoration, then light glowing through the glass.
    const sh = ctx.createRadialGradient(X - r * 0.2, Y - r * 0.2, r * 0.4, X, Y, r);
    sh.addColorStop(0, 'rgba(20,10,5,0)'); sh.addColorStop(1, 'rgba(20,10,5,.35)');
    ctx.fillStyle = sh; ctx.fillRect(X - r, Y - r, 2 * r, 2 * r);
    const tr = ctx.createRadialGradient(X + r * 0.3, Y + r * 0.35, 0, X + r * 0.3, Y + r * 0.35, r * 0.6);
    tr.addColorStop(0, 'rgba(255,255,255,.3)'); tr.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = tr; ctx.fillRect(X - r, Y - r, 2 * r, 2 * r);
    ctx.restore();

    ctx.fillStyle = 'rgba(255,255,255,.85)';
    ctx.beginPath(); ctx.ellipse(X - r * 0.36, Y - r * 0.42, r * 0.24, r * 0.13, -0.6, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(30,15,10,.25)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(X, Y, r, 0, TAU); ctx.stroke();
  }

  function drawBeads(ctx, geo, th, front) {
    geo.beads
      .map(b => ({ b, P: project(b, th) }))
      .filter(({ P }) => (P.Z >= 0) === front)
      .sort((p, q) => p.P.Z - q.P.Z)
      .forEach(({ b, P }) => drawBead(ctx, b, P.X, P.Y, P.Z));
  }

  // Film grain, shared by every frame but offset differently so the texture "boils" like stop motion.
  let grain = null;
  function getGrain() {
    if (grain) return grain;
    grain = document.createElement('canvas');
    grain.width = W + 200; grain.height = H + 200;
    const g = grain.getContext('2d'), img = g.createImageData(grain.width, grain.height), rand = rng(99);
    for (let i = 0; i < img.data.length; i += 4) { const v = rand() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
    g.putImageData(img, 0, 0);
    return grain;
  }

  function renderFrame(ctx, th, nk, idx, grainAlpha = 0.07) {
    const rand = rng(idx * 977 + 13);
    const jx = (rand() - 0.5) * 7, jy = (rand() - 0.5) * 5, jr = (rand() - 0.5) * 0.012, jl = (rand() - 0.5) * 0.07;

    ctx.save();
    ctx.translate(W / 2 + jx, H / 2 + jy); ctx.rotate(jr); ctx.translate(-W / 2, -H / 2);

    const geo = nk._geo || (nk._geo = buildNecklace(nk));
    drawCord(ctx, geo, th, nk, false); drawBeads(ctx, geo, th, false);
    drawBody(ctx, th);
    drawCord(ctx, geo, th, nk, true); drawBeads(ctx, geo, th, true);
    drawHead(ctx, th);
    ctx.restore();

    // Tiny lighting flicker and grain, different every frame, on the figure only.
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = jl > 0 ? `rgba(255,245,230,${jl})` : `rgba(40,20,10,${-jl})`;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = grainAlpha;
    ctx.drawImage(getGrain(), -rand() * 200, -rand() * 200);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  }

  // Chest shot: from just under the chin to the breastbone, following the turn.
  // Square canvases get the tight product crop; taller ones (the hero) reach a little lower.
  function drawCloseup(canvas, nk, i) {
    const th = ANGLES[i], tall = canvas.height > canvas.width;
    const h = (tall ? 1.95 : 1.7) * R, w = h * canvas.width / canvas.height;
    const cx = CX + 0.4 * R * Math.sin(th), top = HY + 1.06 * R;
    const ctx = canvas.getContext('2d'), k = canvas.width / w;
    ctx.setTransform(k, 0, 0, k, -(cx - w / 2) * k, -top * k);
    renderFrame(ctx, th, nk, i, 0.04);
  }

  window.StandIn = { ANGLES, drawCloseup, drawBead, rng };
})();
