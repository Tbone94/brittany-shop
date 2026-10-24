// The necklaces. Prices are Brittany's ($75, Ember $65; she caps at $75). Names, copy and details are placeholders for her to replace.
// `collection`, `beadType` and `metal` drive the Shop menu's "by collection / bead type / metal" (placeholders too).
// `angles` lists which of the 7 angles have real photos (0-based: 3 = front, 5 = turned right); only those show.
// Garden Party and the nine after it are Brittany's real necklaces (photos/source/); names are placeholders.
// Colors come from the glass palette in styles.css. `backdrop` is the piece's accent, matched to its own glass:
// dots and badges use it at full strength. `splash` is the 2–3 glass colors layered behind its photos, and
// `splashShape` their shape: 'round' (wavy blob), 'daisy' or 'bloom' (flowers). 'burst' and 'shard' are pointy options.
// palette / cord / drop / focal / bead() only shape the drawn stand-ins and go away once real photos exist.
window.PRODUCTS = [
  {
    // Brittany's first real necklace (photo in photos/source/, prompt in photos/source/garden-party-prompt.md).
    // Name and length are placeholders.
    // heroZoom: how far the hero crops into a wide photo (default 1.2). Her shoulders sit wider in this shot.
    slug: 'garden-party', angles: [3, 5], collection: 'garden-gnome', beadType: 'Flowers', metal: 'Gold', splashShape: 'bloom', heroZoom: 1, name: 'Garden Party', price: 75, family: 'greens', sold: false,
    backdrop: '#3f8f3a', accentInk: '#ffffff', splash: ['#5aa83c', '#f2b23a', '#f27a5e'],
    desc: 'Leaf, flower and honey glass on gold wire-wrapped links, with a little orange bell flower at the center.',
    details: { Length: '18 in', Glass: 'Leaf green, amber, aqua, coral', Links: 'Gold-tone wire-wrapped', Clasp: 'Lobster' },
    palette: ['#6aa83a', '#e0a12a', '#5cc8d8', '#f27a5e'], cord: '#c9a24a', drop: 0.86, rN: 0.6, span: 0.66, seed: 91,
    focal: { r: 0.14, color: '#f0883e', kind: 'glass', dot: '#fff4e0' },
    bead(i) { return i % 2 ? { r: 0.034, kind: 'spacer', metal: 'gold' } : { r: 0.07 + (i % 3) * 0.008, kind: i % 6 === 0 ? 'dots' : 'glass', color: this.palette[(i / 2 | 0) % 4], dot: '#ffffff' }; },
  },
  {
    slug: 'mushroom-hunt', angles: [0, 3, 5], collection: 'garden-gnome', beadType: 'Charms', metal: 'Gold', splashShape: 'round', name: 'Mushroom Hunt', price: 75, family: 'blues', sold: false,
    backdrop: '#2f6fd1', accentInk: '#ffffff', splash: ['#4c8fe6', '#f2a03a', '#5aa83c'],
    desc: 'Little amber mushrooms and blue glass, with a big glossy spotted mushroom hanging at the center.',
    details: { Length: '18 in', Glass: 'Cobalt, sky blue, amber, leaf green', Links: 'Gold-tone wire-wrapped', Clasp: 'Lobster' },
    palette: ['#4c8fe6', '#f2a03a', '#5aa83c'], cord: '#c9a24a', drop: 0.86, rN: 0.6, span: 0.66, seed: 24,
    focal: { r: 0.14, color: '#2f6fd1', kind: 'glass', dot: '#ffffff' },
    bead(i) { return { r: 0.06, kind: 'glass', color: this.palette[i % this.palette.length] }; },
  },
  {
    slug: 'jewel-box', angles: [1, 3], collection: 'chaotic-good', beadType: 'Lampwork', metal: 'Gold', splashShape: 'daisy', name: 'Jewel Box', price: 75, family: 'purples', sold: false,
    backdrop: '#7a3fb0', accentInk: '#ffffff', splash: ['#8a4fbf', '#f2a03a', '#1f8fa8'],
    desc: 'Purple, amber and teal glass with three dotted white lampwork beads swinging along the front.',
    details: { Length: '18 in', Glass: 'Purple, amber, teal, lime', Links: 'Gold-tone wire-wrapped', Clasp: 'Lobster' },
    palette: ['#8a4fbf', '#f2a03a', '#1f8fa8'], cord: '#c9a24a', drop: 0.86, rN: 0.6, span: 0.66, seed: 36,
    focal: { r: 0.14, color: '#7a3fb0', kind: 'glass', dot: '#ffffff' },
    bead(i) { return { r: 0.06, kind: 'glass', color: this.palette[i % this.palette.length] }; },
  },
  {
    slug: 'honeysuckle', angles: [2, 3], collection: 'garden-gnome', beadType: 'Flowers', metal: 'Gold', splashShape: 'bloom', name: 'Honeysuckle', price: 75, family: 'warm', sold: false,
    backdrop: '#e8692e', accentInk: '#1b1a22', splash: ['#f2803a', '#7ccf4a', '#f2b23a'],
    desc: 'A garden of green glass leaves and peach and orange bell flowers on gold links.',
    details: { Length: '18 in', Glass: 'Leaf green, peach, orange, amber', Links: 'Gold-tone wire-wrapped', Clasp: 'Lobster' },
    palette: ['#f2803a', '#7ccf4a', '#f2b23a'], cord: '#c9a24a', drop: 0.86, rN: 0.6, span: 0.66, seed: 30,
    focal: { r: 0.14, color: '#e8692e', kind: 'glass', dot: '#ffffff' },
    bead(i) { return { r: 0.06, kind: 'glass', color: this.palette[i % this.palette.length] }; },
  },
  {
    slug: 'lavender-wings', angles: [3, 4], collection: 'photosynthesis', beadType: 'Flowers', metal: 'Gold', splashShape: 'daisy', name: 'Lavender Wings', price: 75, family: 'purples', sold: false,
    backdrop: '#8a4fbf', accentInk: '#ffffff', splash: ['#9b6fd6', '#f2803a', '#1fb5c9'],
    desc: 'Shimmering purple glass roses and orange butterflies with pearls and blue crystals.',
    details: { Length: '18 in', Glass: 'Lilac, violet, orange, teal', Links: 'Gold-tone wire-wrapped', Clasp: 'Lobster' },
    palette: ['#9b6fd6', '#f2803a', '#1fb5c9'], cord: '#c9a24a', drop: 0.86, rN: 0.6, span: 0.66, seed: 88,
    focal: { r: 0.14, color: '#8a4fbf', kind: 'glass', dot: '#ffffff' },
    bead(i) { return { r: 0.06, kind: 'glass', color: this.palette[i % this.palette.length] }; },
  },
  {
    slug: 'fruit-salad', angles: [3, 5], collection: 'chaotic-good', beadType: 'Charms', metal: 'Gold', splashShape: 'bloom', name: 'Fruit Salad', price: 75, family: 'greens', sold: false,
    backdrop: '#4f9a3a', accentInk: '#ffffff', splash: ['#5aa83c', '#f28a2e', '#6b2f7a'],
    desc: 'Glass fruit all the way around: an orange, a lemon, an apple, a plum and a blackberry at the center.',
    details: { Length: '18 in', Glass: 'Apple green, orange, lemon, plum', Links: 'Gold-tone wire-wrapped', Clasp: 'Lobster' },
    palette: ['#5aa83c', '#f28a2e', '#6b2f7a'], cord: '#c9a24a', drop: 0.86, rN: 0.6, span: 0.66, seed: 49,
    focal: { r: 0.14, color: '#4f9a3a', kind: 'glass', dot: '#ffffff' },
    bead(i) { return { r: 0.06, kind: 'glass', color: this.palette[i % this.palette.length] }; },
  },
  {
    slug: 'ember', angles: [3, 6], collection: 'photosynthesis', beadType: 'Seed beads', metal: 'Gold', splashShape: 'round', name: 'Ember', price: 65, family: 'warm', sold: false,
    backdrop: '#e8452e', accentInk: '#ffffff', splash: ['#f2674a', '#e4dd3b', '#c8321f'],
    desc: 'Tiny gold rings wrapped in seed beads, glowing from yellow through orange to red.',
    details: { Length: '16 in', Glass: 'Yellow, orange, red', Links: 'Gold-tone wire-wrapped', Clasp: 'Lobster' },
    palette: ['#f2674a', '#e4dd3b', '#c8321f'], cord: '#c9a24a', drop: 0.86, rN: 0.6, span: 0.66, seed: 38,
    focal: { r: 0.14, color: '#e8452e', kind: 'glass', dot: '#ffffff' },
    bead(i) { return { r: 0.06, kind: 'glass', color: this.palette[i % this.palette.length] }; },
  },
  {
    slug: 'butterfly-garden', angles: [3, 5], collection: 'garden-gnome', beadType: 'Charms', metal: 'Silver', splashShape: 'round', name: 'Butterfly Garden', price: 75, family: 'greens', sold: false,
    backdrop: '#3f8f3a', accentInk: '#ffffff', splash: ['#5aa83c', '#f2a03a', '#1fb5c9'],
    desc: 'Orange glass butterflies and green bell flowers among teal leaves, on silver links.',
    details: { Length: '18 in', Glass: 'Leaf green, orange, peach, teal', Links: 'Silver-tone wire-wrapped', Clasp: 'Lobster' },
    palette: ['#5aa83c', '#f2a03a', '#1fb5c9'], cord: '#b9bec4', drop: 0.86, rN: 0.6, span: 0.66, seed: 14,
    focal: { r: 0.14, color: '#3f8f3a', kind: 'glass', dot: '#ffffff' },
    bead(i) { return { r: 0.06, kind: 'glass', color: this.palette[i % this.palette.length] }; },
  },
  {
    slug: 'petal-soft', angles: [3, 5], collection: 'chaotic-good', beadType: 'Lampwork', metal: 'Silver', splashShape: 'bloom', name: 'Petal Soft', price: 75, family: 'pinks', sold: false,
    backdrop: '#e86f93', accentInk: '#1b1a22', splash: ['#f5a7b8', '#9fd4a3', '#f6dfa0'],
    desc: 'Rose quartz, mint butterflies and white lampwork beads painted with tiny pink roses.',
    details: { Length: '18 in', Glass: 'Rose pink, mint, peach', Links: 'Silver-tone wire-wrapped', Clasp: 'Lobster' },
    palette: ['#f5a7b8', '#9fd4a3', '#f6dfa0'], cord: '#b9bec4', drop: 0.86, rN: 0.6, span: 0.66, seed: 53,
    focal: { r: 0.14, color: '#e86f93', kind: 'glass', dot: '#ffffff' },
    bead(i) { return { r: 0.06, kind: 'glass', color: this.palette[i % this.palette.length] }; },
  },
  {
    slug: 'morning-dew', angles: [3, 5], collection: 'photosynthesis', beadType: 'Crystal', metal: 'Silver', splashShape: 'daisy', name: 'Morning Dew', price: 75, family: 'pastels', sold: true, soldOn: 'October',
    backdrop: '#6fae86', accentInk: '#1b1a22', splash: ['#9fd4a3', '#f5a7b8', '#9fd0ee'],
    desc: 'Clear crystal flowers and butterflies with sage glass and soft pink, like dew on the garden.',
    details: { Length: '18 in', Glass: 'Sage, clear crystal, blush', Links: 'Silver-tone wire-wrapped', Clasp: 'Lobster' },
    palette: ['#9fd4a3', '#f5a7b8', '#9fd0ee'], cord: '#b9bec4', drop: 0.86, rN: 0.6, span: 0.66, seed: 60,
    focal: { r: 0.14, color: '#6fae86', kind: 'glass', dot: '#ffffff' },
    bead(i) { return { r: 0.06, kind: 'glass', color: this.palette[i % this.palette.length] }; },
  },
];

// The first screen turns through these, in order: necklace n is shown at angle n, left profile to right profile.
window.HERO = ['mushroom-hunt', 'jewel-box', 'honeysuckle', 'garden-party', 'lavender-wings', 'fruit-salad', 'ember'];

// Color filter chips, in display order. `color` is the bead shown on the chip.
// The "Shop by color" bands use `word` (the big stacked letters), `band` (the band's color), `ink` (letter outlines)
// and `shades` (the small line under the word).
window.FAMILIES = [
  { key: 'all', label: 'All', color: '#1b1a22' },
  { key: 'greens', label: 'Greens', color: '#0f6b45', word: 'Green', band: '#7ccf4a', ink: '#14532d', shades: ['Olive', 'Sage', 'Lime', 'Forest'] },
  { key: 'purples', label: 'Purples', color: '#8a4fbf', word: 'Purple', band: '#b48ae6', ink: '#3f1d6b', shades: ['Lilac', 'Violet', 'Plum', 'Orchid'] },
  { key: 'blues', label: 'Blues', color: '#1f3fa8', word: 'Blue', band: '#4cc3e6', ink: '#13306e', shades: ['Cobalt', 'Navy', 'Teal', 'Sky'] },
  { key: 'warm', label: 'Warm', color: '#f2674a', word: 'Warm', band: '#f7a23b', ink: '#7a2e0e', shades: ['Amber', 'Honey', 'Rust', 'Tangerine'] },
  { key: 'pinks', label: 'Reds & pinks', color: '#c8321f', word: 'Pink', band: '#f58aa8', ink: '#7a1230', shades: ['Cherry', 'Bubblegum', 'Blush', 'Ruby'] },
  { key: 'pastels', label: 'Pastels', color: '#f6c9b8', word: 'Pastel', band: '#f6dfa0', ink: '#6b4a1a', shades: ['Peach', 'Mint', 'Butter', 'Lavender'] },
];

// "Shop by collection": one tall panel each, with the photo in a window of its own shape ('blob', 'star', 'cloud').
// Names are placeholders for Brittany's own (Chaotic Good is hers).
// The three panels wear the logo's three o colors, in the order they appear in the wordmark:
// turquoise, tangerine, orchid.
window.COLLECTIONS = [
  { key: 'garden-gnome', name: 'Giving Garden Gnome', color: '#1fb5c9', shape: 'blob' },
  { key: 'photosynthesis', name: 'Photosynthesis Coded', color: '#f58220', shape: 'sun' },
  { key: 'chaotic-good', name: 'Chaotic Good', color: '#8a4fbf', shape: 'cloud' },
];
