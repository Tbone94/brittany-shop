// The big color words in "Shop by color" (Brittany's drawing): stacked, bouncy letters, like toy blocks piled up.
// It mixes two lettering styles: stacked type (letters resting on each other) and bounce lettering (letters off the
// baseline, balanced so as many go up as stay down). The pile is designed, not left to chance, so every word reads
// left to right: every other letter stands on the floor with a gap after it, and the letters in between wedge into
// the gaps on their neighbors' shoulders, tipped. A last letter with no gap leans off its neighbor's shoulder.
// Each letter drops in and squishes when it lands the first time its band scrolls into view; tapping the word drops
// it again. With reduced motion the pile is simply shown.
// Readability: reading order never changes, tilts stay small (floor 1–4°, wedged 6–11°, a leaning last letter
// 11–14°), every letter is the same size, and the motion is short, plays once and then holds still.
(() => {
  const els = [...document.querySelectorAll('.stack[data-word]')];
  if (!els.length) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function rng(seed) {
    return () => { seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }

  function setup(el) {
    const word = el.dataset.word;
    el.innerHTML = `<span class="sr">${el.textContent}</span>` + [...word].map(ch => `<span class="ch" aria-hidden="true">${ch}</span>`).join('');
    const spans = [...el.querySelectorAll('.ch')];
    let spots = [];

    // Where each letter ends up: x, y (its center) and a tilt in degrees.
    function plan() {
      const W = el.clientWidth, H = el.clientHeight, fs = parseFloat(getComputedStyle(el).fontSize);
      const rand = rng([...word].reduce((a, c) => a * 31 + c.charCodeAt(0), 7));
      spans.forEach(s => { s.style.width = s.style.height = ''; });
      const boxes = spans.map(s => ({ w: s.offsetWidth * 0.92, h: fs * 0.8 }));
      // Who stands on the floor and who's wedged between: alternating, but a narrow letter (I, L…) can't hold up
      // a wedge or show inside one, so it always stands, and the pattern picks up again after it.
      const median = [...boxes].map(b => b.w).sort((p, q) => p - q)[boxes.length >> 1];
      const narrow = i => boxes[i].w < median * 0.62;
      const role = [];
      let next = 'floor';
      boxes.forEach((b, i) => {
        if (i === 0 || narrow(i)) next = 'floor';
        role[i] = next;
        next = next === 'floor' ? 'wedge' : 'floor';
      });
      // A wedge with nothing after it leans off its neighbor's shoulder instead.
      const leanAt = role[boxes.length - 1] === 'wedge' ? boxes.length - 1 : -1;
      // A wedged letter needs a gap a bit narrower than itself, so it catches on both neighbors' shoulders.
      const gapFor = i => (role[i] === 'wedge' && i !== leanAt ? boxes[i].w * 0.74 : fs * 0.02);
      let width = 0;
      boxes.forEach((b, i) => { if (role[i] === 'floor') width += b.w + (boxes[i + 1] ? gapFor(i + 1) : 0); });
      if (leanAt > 0) width += boxes[leanAt].w * 0.6;
      const scale = Math.min(1, (W * 0.96) / width);
      if (scale < 0.98) { el.style.setProperty('--fit', (parseFloat(el.style.getPropertyValue('--fit')) || 1) * scale); return plan(); }
      let x = (W - width) / 2;
      const out = boxes.map(b => ({ w: b.w, h: b.h }));
      boxes.forEach((b, i) => {
        if (role[i] !== 'floor') return;
        // Floor letters: on the baseline, barely tipped, alternating.
        Object.assign(out[i], { x: x + b.w / 2, y: H - b.h / 2, a: (i % 2 ? 1 : -1) * (1 + rand() * 2.5) });
        x += b.w + (boxes[i + 1] ? gapFor(i + 1) : 0);
      });
      let side = -1;
      boxes.forEach((b, i) => {
        if (role[i] !== 'wedge') return;
        const l = out[i - 1];
        if (i === leanAt) {
          // Leaning off the last floor letter's right shoulder, its other corner down on the floor.
          Object.assign(out[i], { x: l.x + l.w / 2 + b.w * 0.36, y: H - b.h / 2 - b.h * 0.24, a: 11 + rand() * 3, lean: true });
        } else {
          // Wedged into the gap, about halfway down, a little off-center and tipped toward the lower side.
          Object.assign(out[i], { x: l.x + l.w / 2 + gapFor(i) / 2 + side * b.w * 0.04, y: H - b.h / 2 - b.h * 0.4, a: side * (6 + rand() * 5), perch: true });
          side = -side;
        }
      });
      return out;
    }

    const pose = (s, dy = 0, extra = '') => `translate(${s.x - s.w / 2}px, ${s.y - s.h / 2 + dy}px) rotate(${s.a}deg)${extra}`;
    function place() {
      spots = plan();
      spans.forEach((span, i) => {
        const s = spots[i];
        span.style.width = `${s.w}px`; span.style.height = `${s.h}px`;
        span.style.transform = pose(s);
        span.classList.toggle('up', !!(s.perch || s.lean));
      });
    }

    // Drop every letter in: floor letters first, then the perched ones, each squishing as it lands.
    function drop() {
      if (reduce) return;
      const H = el.clientHeight;
      spans.forEach((span, i) => {
        const s = spots[i], high = -(s.y + s.h + H * 0.2), floor = !(s.perch || s.lean);
        const delay = floor ? i * 70 : spans.length * 70 + 120 + (i - 1) * 110;
        const squash = ' scale(1.12, .84)', stretch = ' scale(.94, 1.08)';
        span.animate([
          { transform: pose({ ...s, a: s.a * 3 }, high, stretch), offset: 0, easing: 'cubic-bezier(.55, 0, .85, .35)' },
          { transform: pose(s, 0, squash), offset: 0.55, easing: 'cubic-bezier(.2, .7, .4, 1)' },
          { transform: pose({ ...s, a: s.a * 1.25 }, -s.h * 0.12, stretch), offset: 0.75, easing: 'cubic-bezier(.5, 0, .7, .4)' },
          { transform: pose(s, 0, ' scale(1.04, .96)'), offset: 0.9 },
          { transform: pose(s), offset: 1 },
        ], { duration: 820, delay, fill: 'backwards' });
        // A perched letter landing gives the letters under it a little squish.
        if (!floor) [i - 1, i + 1].forEach(k => {
          if (!spans[k]) return;
          spans[k].animate([
            { transform: pose(spots[k]) },
            { transform: pose(spots[k], spots[k].h * 0.03, ' scale(1.05, .93)'), offset: 0.35 },
            { transform: pose(spots[k]) },
          ], { duration: 380, delay: delay + 820 * 0.55 - 30, easing: 'ease-out' });
        });
      });
    }

    return { el, place, drop };
  }

  const stacks = els.map(setup);
  document.fonts.ready.then(() => {
    stacks.forEach(s => s.place());
    if (reduce || !('IntersectionObserver' in window)) return;
    // Hidden until the band scrolls into view, then dropped in.
    stacks.forEach(s => s.el.classList.add('waiting'));
    const seen = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      seen.unobserve(e.target);
      const s = stacks.find(x => x.el === e.target);
      s.el.classList.remove('waiting');
      s.drop();
    }), { threshold: 0.5 });
    stacks.forEach(s => { seen.observe(s.el); s.el.addEventListener('click', () => s.drop()); });
  });
  let lastW = innerWidth, timer = 0;
  addEventListener('resize', () => {
    if (innerWidth === lastW) return;
    lastW = innerWidth;
    clearTimeout(timer);
    timer = setTimeout(() => stacks.forEach(s => { s.el.style.removeProperty('--fit'); s.place(); }), 200);
  });
})();
