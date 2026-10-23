// Color splashes behind the chest shots and around the page, in three shapes:
//   'round'  soft blobs, like drops of molten glass (a wavy, groovy edge in minimal mode)
//   'daisy'  a 70s flower with rounded petals
//   'bloom'  a chunky five-petal flower
//   'burst'  pointy starbursts
//   'shard'  sharp, angular pieces, like broken glass
// Layers overlap slightly see-through, like stacked glass.
// Splash.svg(colors, seed, { shape, minimal }) returns an <svg> string; the same seed always draws the same splash.
// `minimal` draws one crisp shape in a single color: the small accent the page uses now.
(() => {
  const TAU = Math.PI * 2;

  function rng(seed) {
    return () => {
      seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  const f = n => n.toFixed(1);
  const polygon = pts => 'M' + pts.map(p => `${f(p[0])} ${f(p[1])}`).join('L') + 'Z';

  // Closed smooth outline through points (Catmull-Rom as cubic Béziers).
  function smooth(pts) {
    const n = pts.length, at = i => pts[(i + n) % n];
    let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
    for (let i = 0; i < n; i++) {
      const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
      d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
    }
    return d + 'Z';
  }

  // A lumpy circle with a few arms flung outward.
  function blob(rand, cx, cy, r, arms) {
    const n = 18, pts = [], armAt = new Set();
    while (armAt.size < arms) armAt.add(Math.floor(rand() * n));
    const turn = rand() * TAU;
    for (let k = 0; k < n; k++) {
      const a = turn + (k + (rand() - 0.5) * 0.4) * TAU / n;
      const rr = r * (0.82 + rand() * 0.3) * (armAt.has(k) ? 1.35 + rand() * 0.25 : 1);
      pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
    }
    return smooth(pts);
  }

  // A starburst: uneven spikes with straight edges.
  function burst(rand, cx, cy, r) {
    const spikes = 11 + Math.floor(rand() * 7), pts = [], turn = rand() * TAU;
    for (let k = 0; k < spikes * 2; k++) {
      const a = turn + (k + (rand() - 0.5) * 0.5) * Math.PI / spikes;
      const rr = k % 2 ? r * (0.5 + rand() * 0.14) : r * (0.92 + rand() * 0.42);
      pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
    }
    return polygon(pts);
  }

  // A glass shard: a few sharp corners, long and uneven.
  function shard(rand, cx, cy, r) {
    const n = 4 + Math.floor(rand() * 3), pts = [], turn = rand() * TAU, stretch = 0.55 + rand() * 0.35;
    for (let k = 0; k < n; k++) {
      const a = turn + (k + (rand() - 0.5) * 0.6) * TAU / n;
      const rr = r * (0.6 + rand() * 0.55);
      const x = Math.cos(a) * rr, y = Math.sin(a) * rr * stretch;
      pts.push([cx + x * Math.cos(turn) - y * Math.sin(turn), cy + x * Math.sin(turn) + y * Math.cos(turn)]);
    }
    return polygon(pts);
  }

  // A scalloped, lava-lamp blob.
  function wavy(rand, cx, cy, r) {
    const n = 12, pts = [], turn = rand() * TAU;
    for (let k = 0; k < n; k++) {
      const a = turn + k * TAU / n, rr = r * (k % 2 ? 0.8 : 1) * (0.94 + rand() * 0.12);
      pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
    }
    return smooth(pts);
  }

  // A daisy: rounded petals around a center.
  function daisy(cx, cy, r, petals, turn) {
    let d = '';
    for (let k = 0; k < petals; k++) {
      const a = turn + k * TAU / petals, px = cx + Math.cos(a) * r * 0.56, py = cy + Math.sin(a) * r * 0.56;
      const rx = r * 0.44, ry = r * 0.25, ca = Math.cos(a), sa = Math.sin(a);
      // An ellipse as two arcs, rotated to point outward.
      d += `M${f(px - rx * ca)} ${f(py - rx * sa)}A${f(rx)} ${f(ry)} ${f(a * 180 / Math.PI)} 1 1 ${f(px + rx * ca)} ${f(py + rx * sa)}A${f(rx)} ${f(ry)} ${f(a * 180 / Math.PI)} 1 1 ${f(px - rx * ca)} ${f(py - rx * sa)}Z`;
    }
    return d;
  }

  // A bloom: five fat round petals.
  function bloom(cx, cy, r, turn) {
    let d = '';
    for (let k = 0; k < 5; k++) {
      const a = turn + k * TAU / 5, px = cx + Math.cos(a) * r * 0.52, py = cy + Math.sin(a) * r * 0.52, pr = r * 0.46;
      d += `M${f(px - pr)} ${f(py)}a${f(pr)} ${f(pr)} 0 1 0 ${f(pr * 2)} 0a${f(pr)} ${f(pr)} 0 1 0 ${f(-pr * 2)} 0Z`;
    }
    return d;
  }

  const layer = (d, color, alpha) => `<path d="${d}" fill="${color}"${alpha < 1 ? ` fill-opacity="${alpha}"` : ''}/>`;

  function svg(colors, seed, { shape = 'round', droplets = true, minimal = false } = {}) {
    const rand = rng(seed * 7919 + 17);
    if (minimal) {
      // One crisp shape with a lighter inner layer, like light caught inside a glass bead.
      const open = '<svg viewBox="-130 -130 260 260" aria-hidden="true" focusable="false">';
      if (shape === 'bloom') {
        return `${open}<path d="${bloom(0, 0, 108, rand() * TAU)}" fill="${colors[0]}"/><circle r="28" fill="#fff" fill-opacity=".85"/></svg>`;
      }
      if (shape === 'daisy') {
        const petals = 8 + Math.floor(rand() * 3), turn = rand() * TAU;
        return `${open}<path d="${daisy(0, 0, 112, petals, turn)}" fill="${colors[0]}"/><circle r="30" fill="#fff" fill-opacity=".85"/><circle r="30" fill="${colors[0]}" fill-opacity=".25"/></svg>`;
      }
      const main = shape === 'burst' ? burst(rand, 0, 0, 96) : shape === 'shard' ? shard(rand, 0, 0, 118) : wavy(rand, 0, 0, 100);
      const inner = shape === 'burst' ? burst(rand, -14, -14, 46) : shape === 'shard' ? shard(rand, -16, -12, 62) : wavy(rand, -18, -18, 38);
      return `${open}<path d="${main}" fill="${colors[0]}"/><path d="${inner}" fill="#fff" fill-opacity=".28"/></svg>`;
    }
    const [c1, c2 = c1, c3 = c2] = colors;
    const ox = (rand() - 0.5) * 34, oy = (rand() - 0.5) * 34;
    let out = '';

    if (shape === 'burst') {
      out += layer(burst(rand, 0, 0, 96), c1, 1);
      out += layer(burst(rand, ox * 0.6, oy * 0.6, 70), c2, 0.85);
      out += layer(blob(rand, -ox * 0.5, -oy * 0.5, 26, 0), c3, 0.85);
    } else if (shape === 'shard') {
      out += layer(shard(rand, 0, 0, 118), c1, 1);
      out += layer(shard(rand, ox, oy, 92), c2, 0.85);
      out += layer(shard(rand, -ox * 0.9, -oy * 0.7, 70), c3, 0.8);
      out += layer(shard(rand, oy * 1.6, -ox * 1.4, 40), c1, 0.75);
    } else if (shape === 'bloom') {
      const turn = rand() * TAU;
      out += layer(bloom(0, 0, 104, turn), c1, 1);
      out += layer(bloom(ox * 0.3, oy * 0.3, 60, turn + 0.6), c2, 0.85);
      out += `<circle r="24" fill="${c3}" fill-opacity=".9"/>`;
    } else if (shape === 'daisy') {
      const petals = 8 + Math.floor(rand() * 3), turn = rand() * TAU;
      out += layer(daisy(0, 0, 112, petals, turn), c1, 1);
      out += layer(daisy(ox * 0.4, oy * 0.4, 70, petals, turn + Math.PI / petals), c2, 0.85);
      out += `<circle r="26" fill="${c3}" fill-opacity=".9"/>`;
    } else {
      // Groovy lava-lamp blobs.
      out += layer(wavy(rand, 0, 0, 98), c1, 1);
      out += layer(wavy(rand, ox, oy, 64), c2, 0.85);
      out += layer(wavy(rand, -ox * 0.8, -oy * 0.6 + 6, 32), c3, 0.8);
    }

    if (droplets) {
      const drops = 7 + Math.floor(rand() * 6);
      for (let k = 0; k < drops; k++) {
        const a = rand() * TAU, d = 108 + rand() * 18, r = 2.2 + rand() * 6, c = [c1, c2, c3][k % 3];
        const x = Math.cos(a) * d, y = Math.sin(a) * d;
        if (shape === 'round' || shape === 'daisy' || shape === 'bloom') {
          out += rand() < 0.3
            ? `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(r * 2.4)}" ry="${f(r * 0.8)}" transform="rotate(${f(a * 180 / Math.PI)} ${f(x)} ${f(y)})" fill="${c}"/>`
            : `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${c}"/>`;
        } else {
          // Little splinters: thin triangles pointing away from the center.
          const tip = [x + Math.cos(a) * r * 2.2, y + Math.sin(a) * r * 2.2];
          const s1 = [x + Math.cos(a + 1.9) * r, y + Math.sin(a + 1.9) * r];
          const s2 = [x + Math.cos(a - 1.9) * r, y + Math.sin(a - 1.9) * r];
          out += `<path d="${polygon([tip, s1, s2])}" fill="${c}"/>`;
        }
      }
    }
    return `<svg viewBox="-130 -130 260 260" aria-hidden="true" focusable="false">${out}</svg>`;
  }

  window.Splash = { svg };
})();
