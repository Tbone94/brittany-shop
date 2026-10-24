# Brittany — handmade glass-bead jewelry

**Live previews, to compare:**
- v3 (branch `design/v3`, built from Brittany's drawings): https://shopchaoticgoods.com/ (push to `main` here; the `CNAME` file keeps the domain, so don't delete it)
- v2 (branch `design/centered-hero-colorful`): https://tbone94.github.io/brittany-shop-v2/ (`git push v2 design/centered-hero-colorful:main`)
- v1 is kept as the tag `v1-first-preview`.

GitHub Pages republishes about a minute after a push.

**SEO:** after changing necklaces, photos or `index.html`, run `python3 tools/webp.py` (small photo copies) and
`python3 tools/seo.py` (titles, link previews, Google product data, a page per necklace in `n/`, preview images in
`og/`, sitemap). The previews are marked noindex; at launch, set the real domain and `INDEXABLE = True` in
`tools/seo.py` and run it again.

Business plan (online doc): https://claude.ai/code/artifact/8783c375-5827-49ec-aa10-8c531d60a881
Research on how shops like this are laid out: [research/browse-and-buy.md](research/browse-and-buy.md)
Glass colors behind the brand palette: [research/glass-colors.md](research/glass-colors.md)
Prompts for generating stand-in photos: [image-prompts.md](image-prompts.md)

Goal: site live by mid-November, before Black Friday (Nov 27).

## The prototype

To view it, run this in this folder and open http://localhost:4321:

```bash
python3 -m http.server 4321
```

What's on the page, top to bottom:

- **Turning hero.** Under-chin chest shots that turn from left profile to right profile as you move across them (drag on a phone), flipping like stop motion. Each angle is a different necklace with its own color splash behind it, and the hang tag and button colors follow along. Click or tap to open that necklace.
- **Shop grid.** One card per necklace with color filters. Cards turn slightly on hover. Sold pieces move to a "Found a home" section with an "ask for one like it" form.
- **Popup (quick view).** All 7 angles of one necklace (move across it or tap the thumbnails), details, add to bag. Every necklace gets its own link (`#n/tide-pool`), and the browser's Back button closes the popup.
- **Bag** slides out from the right, with a free-shipping nudge.
- Story, shipping and gift notes, email signup, footer.

Files: `products.js` (the necklaces and their colors), `shop.js` (page behavior), `styles.css` (palette at the top),
`splash.js` (draws the splashes), `standin.js` (draws stand-in photos).

**Look.** A white page with color only in splashes and small accents. The accents are named after real glass rod
colors (Effetre Cobalt, Uranium Yellow, CiM Smurfy turquoise and others). Splashes come in three shapes, set
per necklace in `products.js` with `splashShape`: `round` (soft blobs), `burst` (pointy) and `shard` (sharp, like
broken glass). Their layers overlap with multiply blending, the way stacked transparent glass mixes.

## Before launch (all required)

Launch target: mid-November 2026, before Black Friday (Nov 27). None of these can be skipped:

- [ ] **Shop name.** "Brittany" is a placeholder, and nobody can find a shop by searching a first name. Chosen: Chaotic Goods; still to swap in across the site.
- [x] **Own domain:** shopchaoticgoods.com (bought at Porkbun, `CNAME` file in the repo; DNS points at GitHub Pages).
- [ ] **Real photos** of every necklace, then run `python3 tools/webp.py`.
- [ ] **Real names, prices, descriptions and details** for every necklace in `products.js`.
- [ ] **Real collection names.** "Mushroom Club" and "Starstruck" are made up; "Chaotic Good" is Brittany's.
- [ ] **Turn on search:** in `tools/seo.py` (`SITE` is already the new domain) set `INDEXABLE = True`, then run
      `python3 tools/seo.py`. Until this is done, every page tells Google not to list it.
- [ ] **Google Search Console:** add the domain and submit `sitemap.xml`.

## Placeholders to replace

- **Shop name.** "Brittany" for now.
- **Necklaces** in `products.js`: names, prices, descriptions, lengths, materials.
- **Policies:** 2–3 day shipping, free US shipping over $50, 14-day returns, gift box with a note. These need Brittany's real choices.
- **Story:** rewrite it in her own words (how she started, where the glass comes from) and add a photo of her working.
- **Not wired up yet:** checkout (Shopify or Stripe), the email signup, and the "ask for one like it" form. The real checkout must stop a piece from selling twice.

## Photos

Real photos replace the drawn stand-ins automatically as soon as files with these names exist in `photos/`:

`photos/<slug>-1.png` … `<slug>-7.png`: one necklace at all 7 angles, e.g. `tide-pool-4.png`. Slugs are in
`products.js`. The hero reuses these: necklace *n* at angle *n*. JPGs work too, but PNGs with a
**transparent background** are what let the color splash show behind the body. Any photo can be cut out with
iPhone "Lift subject from background", Canva or remove.bg.

To generate realistic stand-ins now, hand [image-prompts.md](image-prompts.md) to Codex.

All shots are **chest shots**: from just under the chin to the breastbone, never the full face.

| # | Angle |
| --- | --- |
| 1 | Full profile, facing left |
| 2 | Between profile and 3/4, facing left |
| 3 | 3/4 turn, facing left |
| 4 | Facing the camera |
| 5 | 3/4 turn, facing right |
| 6 | Between 3/4 and profile, facing right |
| 7 | Full profile, facing right |

When Brittany shoots the real ones, **only the angle changes** between shots of one necklace:

- Camera on a tripod (or a phone propped on books), never moved between shots. Same zoom.
- Brittany sits on a swivel stool and turns the stool. Tape marks on the floor for the 7 positions help.
- Same posture and height in every shot, shoulders relaxed, hair up off the neck.
- Soft window light from one side, no direct sun. Shoot a whole set in one session.
- The same plain top in every shot, solid color with a wide neckline. A plain wall behind her makes cutting out easy.
- Shoot square.

Small differences between frames are fine. They add to the stop-motion feel.
