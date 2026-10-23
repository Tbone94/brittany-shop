// The necklaces. Names, prices, copy and details are placeholders for Brittany to replace.
// Colors come from the glass palette in styles.css. `backdrop` is the piece's accent, matched to its own glass:
// dots and badges use it at full strength. `splash` is the 2–3 glass colors layered behind its photos, and
// `splashShape` their shape: 'round' (wavy blob), 'daisy', 'burst' (pointy) or 'shard' (sharp, like broken glass).
// palette / cord / drop / focal / bead() only shape the drawn stand-ins and go away once real photos exist.
window.PRODUCTS = [
  {
    slug: 'tide-pool', splashShape: 'round', name: 'Tide Pool', price: 48, family: 'blues', sold: false,
    backdrop: '#1fb5c9', accentInk: '#1b1a22', splash: ['#1fb5c9', '#e4dd3b', '#1f3fa8'],
    desc: 'Seafoam and deep-teal glass with tiny silver spacers and a dotted focal bead.',
    details: { Length: '18 in', Glass: 'Teal, seafoam, mint', Spacers: 'Silver-tone', Clasp: 'Lobster' },
    palette: ['#2b8a86', '#7cc6bc', '#c4e9e1'], cord: '#b9bec4', drop: 0.82, rN: 0.6, span: 0.64, seed: 11,
    focal: { r: 0.15, color: '#1f6a73', kind: 'dots', dot: '#eafcf7' },
    bead(i) { return i % 2 ? { r: 0.038, kind: 'spacer', metal: 'silver' } : { r: 0.078, kind: 'glass', color: this.palette[(i / 2 | 0) % 3] }; },
  },
  {
    slug: 'marmalade', splashShape: 'burst', name: 'Marmalade', price: 42, family: 'warm', sold: false,
    backdrop: '#f2674a', accentInk: '#1b1a22', splash: ['#f2674a', '#e4dd3b', '#a8265e'],
    desc: 'Chunky amber and honey beads on a short, choker-length cord.',
    details: { Length: '15 in', Glass: 'Amber, honey, burnt orange', Cord: 'Waxed cotton', Clasp: 'Toggle' },
    palette: ['#d9822b', '#f0b54a', '#b5531e'], cord: '#8a5a3a', drop: 0.5, rN: 0.58, span: 0.6, seed: 23,
    focal: { r: 0.13, color: '#c4621f', kind: 'stripe', dot: '#ffe2a8' },
    bead(i) { return { r: i % 3 === 1 ? 0.085 : 0.1, kind: i % 4 === 0 ? 'dots' : 'glass', color: this.palette[i % 3], dot: '#fff1cc' }; },
  },
  {
    slug: 'lilac-hour', splashShape: 'daisy', name: 'Lilac Hour', price: 56, family: 'purples', sold: false,
    backdrop: '#8a4fbf', accentInk: '#ffffff', splash: ['#8a4fbf', '#1fb5c9', '#e4dd3b'],
    desc: 'Graduated violet and clear glass, biggest at the center and tapering to the clasp.',
    details: { Length: '19 in', Glass: 'Violet, lilac, clear', Cord: 'Silver-tone wire', Clasp: 'Lobster' },
    palette: ['#9b7fc7', '#c8b4e6', '#ece4f7'], cord: '#d9d3e0', drop: 1.0, rN: 0.62, span: 0.62, seed: 37,
    focal: { r: 0.16, color: '#7a5bb0', kind: 'dots', dot: '#f4eeff' },
    bead(i) { return { r: Math.max(0.05, 0.11 - i * 0.007), kind: i % 3 === 0 ? 'dots' : 'glass', color: this.palette[i % 3], dot: '#ffffff' }; },
  },
  {
    slug: 'moss-and-stone', splashShape: 'round', name: 'Moss & Stone', price: 64, family: 'greens', sold: false,
    backdrop: '#0f6b45', accentInk: '#ffffff', splash: ['#0f6b45', '#e4dd3b', '#f2674a'],
    desc: 'Little clusters of olive, forest and bone glass spaced along a leather cord.',
    details: { Length: '22 in', Glass: 'Olive, forest, bone', Cord: 'Leather', Clasp: 'Slide knot, adjustable' },
    palette: ['#6f7d3a', '#2f5a3b', '#e6dcc3'], cord: '#6b4a33', cordW: 3.5, drop: 1.05, rN: 0.64, span: 0.72, seed: 41,
    focal: { r: 0.14, color: '#3d6b45', kind: 'stripe', dot: '#e6dcc3' },
    bead(i) { const k = (i - 1) % 4; return k === 3 ? { gap: 0.2 } : { r: 0.075, kind: 'glass', color: this.palette[k] }; },
  },
  {
    slug: 'cherry-soda', splashShape: 'daisy', name: 'Cherry Soda', price: 38, family: 'pinks', sold: false,
    backdrop: '#c8321f', accentInk: '#ffffff', splash: ['#c8321f', '#f2674a', '#e4dd3b'],
    desc: 'Small red and pink glass beads around one big polka-dot cherry.',
    details: { Length: '17 in', Glass: 'Cherry red, bubblegum, blush', Cord: 'Silver-tone wire', Clasp: 'Lobster' },
    palette: ['#c7243a', '#f28aa0', '#f6d6dc'], cord: '#e8c9cf', drop: 0.88, rN: 0.6, span: 0.66, seed: 53,
    focal: { r: 0.17, color: '#b81d33', kind: 'dots', dot: '#fff4f4' },
    bead(i) { return { r: 0.05, kind: 'glass', color: this.palette[i % 3] }; },
  },
  {
    slug: 'midnight', splashShape: 'shard', name: 'Midnight', price: 72, family: 'blues', sold: true, soldOn: 'October',
    backdrop: '#1f3fa8', accentInk: '#ffffff', splash: ['#1f3fa8', '#1fb5c9', '#8a4fbf'],
    desc: 'Cobalt and navy glass with gold swirls and gold spacers.',
    details: { Length: '18 in', Glass: 'Cobalt, navy, cornflower', Spacers: 'Gold-tone', Clasp: 'Lobster' },
    palette: ['#1f3f9e', '#14275f', '#4d6fd1'], cord: '#c9a24a', drop: 0.95, rN: 0.62, span: 0.6, seed: 67,
    focal: { r: 0.15, color: '#1c3a95', kind: 'stripe', dot: '#e3c06a' },
    bead(i) { return i % 2 ? { r: 0.034, kind: 'spacer', metal: 'gold' } : { r: 0.082, kind: i % 4 === 0 ? 'stripe' : 'glass', color: this.palette[(i / 2 | 0) % 3], dot: '#e3c06a' }; },
  },
  {
    slug: 'sunday-morning', splashShape: 'burst', name: 'Sunday Morning', price: 52, family: 'pastels', sold: false,
    backdrop: '#e4dd3b', accentInk: '#1b1a22', splash: ['#e4dd3b', '#f2674a', '#8a4fbf'],
    desc: 'A happy jumble of pastel glass. No two beads match.',
    details: { Length: '18 in', Glass: 'Peach, mint, butter, lavender', Cord: 'Silver-tone wire', Clasp: 'Lobster' },
    palette: ['#f2b8a2', '#a9d6c9', '#f6e3a1', '#c9b8e8'], cord: '#efe3d2', drop: 0.78, rN: 0.6, span: 0.66, seed: 79,
    focal: { r: 0.14, color: '#f0a48a', kind: 'dots', dot: '#fffaf0' },
    bead(i, rand) { return { r: 0.065 + rand() * 0.03, kind: rand() < 0.4 ? 'dots' : 'glass', color: this.palette[Math.floor(rand() * 4)], dot: '#fffaf0' }; },
  },
];

// Filter chips, in display order. `color` is the bead shown on the chip.
window.FAMILIES = [
  { key: 'all', label: 'All', color: '#1b1a22' },
  { key: 'blues', label: 'Blues', color: '#1f3fa8' },
  { key: 'greens', label: 'Greens', color: '#0f6b45' },
  { key: 'warm', label: 'Warm', color: '#f2674a' },
  { key: 'pinks', label: 'Reds & pinks', color: '#c8321f' },
  { key: 'purples', label: 'Purples', color: '#8a4fbf' },
  { key: 'pastels', label: 'Pastels', color: '#f6c9b8' },
];
