# Premium but playful: guidance for the glass-bead shop

Method note: Apple's real CSS was read from apple.com/v/imac/w/built/styles/overview.built.css. Other brands' values come from their page source where it was readable. Write-ups are cited only for what they said.

## 1. What makes Apple feel premium (measured)

- **Neutrals do the work.** Apple's iMac CSS uses `#fff` and `#f5f5f7` for surfaces, `#1d1d1f` for ink, `#6e6e73` for secondary text, and one interactive blue (`#0071e3`). Nothing else is chrome.
- **Radii are big and consistent.** Tiles use 28px and 32px, controls 10-12px, pills 999px.
- **No shadows on tiles.** The iMac stylesheet has one soft shadow (`8px 8px 16px rgba(0,0,0,.08)`) and otherwise uses flat fills or focus rings. Depth comes from tile-on-page contrast.
- **Type scale.** Hero headline is 80px/1.05, weight 600, tracking -0.015em. It steps down to 64px (-0.009em) and 48px (-0.003em) as the screen shrinks. Body is 17px, with 21px and 24px intros. Tracking tightens as size grows, and weights are 400 or 600 only.
- **Color comes from the product.** The iMac page shows seven finishes in a row. The picker is a 12px round dot with a hairline highlight ring (`conic-gradient` of white at 8-48% alpha), not a big swatch. Colored pages tint the hero or section to the finish, and the single multicolor gradient (`#00d0ff`, `#09f`, `#c95eff`, `#ff2569`, `#ff8300`, `#ffb000`) is saved for one special feature.
- **Motion is short.** Transitions run 200-400ms with ease-out or a small overshoot. Dot-nav items scale from .5 to 1. The sheet contains a reduced-motion rule.
- **Bento restraint.** Tile grids vary in size but stay small. A bento primer suggests nine or fewer boxes.

## 2. How other premium-playful brands add color

- **Rhode** (page source): ink `#303030`, warm gray `#67645e`, off-white `#f1f0ed`, and a lone cobalt `#2332d5` used for small functional text only. A write-up says the lowercase wordmark recolors to match each product. Lesson: one saturated hue, tiny, with a warm neutral base.
- **Fishwife** (Dropmark teardown): each product owns one saturated hue, reused on the site as full-bleed section backgrounds. Photos show tins on plain grounds with generous negative space. A retro serif (Recoleta) is paired with a clean sans (Albert Sans), and motion is limited to small SVG wiggles and tile tilt. Lesson: color travels with the object.
- **Omsom** (page source): a single hot orange-red `#fd5225` type color on cream `#f7f3da`, with mint `#aceb9f` and pink `#f0c3f4` as support. Lesson: cream plus one loud color reads fun without clutter.
- **Teenage Engineering** (page source): `#f1f2f2` page, black type, a single red `#ed2024` mark. Lesson: gray plus a single red reads as design-led.
- **Linear** (page source): near-black `#08090a`, with pink `#f79ce0` and sky `#55cdff` as rare highlights.
- **Mejuri** (page source): warm creams (`#ece9e0`) and golds. The jewelry supplies the color.

Techniques to steal: one hue per section; tinted tiles with lots of padding; color in dots, underlines, badges and focus states; tint derived from the product.

## 3. Typography (Google Fonts, all verified loadable)

1. **Young Serif + Hanken Grotesk.** Soft, slightly retro serif for headlines (cookbook warmth, Fishwife-style) with a calm neutral sans for text and prices.
2. **Gloock + Albert Sans.** Higher-contrast, more jewelry-like display with a clean sans. Albert Sans is the sans Fishwife uses.
3. **Familjen Grotesk (display, 600, -0.02em) + Hanken Grotesk, Martian Mono for tiny labels.** Cheapest change: one sans family at Apple-like tight tracking, no serif.

Keep Shrikhand only as the logo/wordmark and at most one tiny flourish per page (for example one word in a hero, or a "new" badge). Never use it for headings, body or buttons. The retro font should signal "handmade" once, then step aside. Caprasimo is a calmer chunky alternative if Shrikhand feels loud.

## 4. Recommendation for this site

**Surfaces.** Page `#fff`; alternate sections `#f5f5f7`; ink `#1d1d1f`; secondary text `#6e6e73`; hairlines `#d2d2d7`. Footer `#f5f5f7` or ink with white type.

**Product tiles (replace paint splashes).** Each necklace sits on a flat, product-derived pastel tile: about 12% accent mixed into white. Cobalt `#e4e8f5`, turquoise `#e4f6f8`, coral `#fdede9`, orchid `#f1eaf7`, uranium `#fcfbe7`, berry `#f5e5ec`, emerald `#e2ede9`. Use 24-28px radius, 8-12% inner padding, a crisp cutout or softly lit photo centered, square or 4:5 ratio, no shadow and no blurred edges. On hover only, the photo scales 1.03 over 300ms ease-out. Where a tile carries no tint, use `#f5f5f7`.

**Where color goes (share of page pixels).** About 88-90% neutral, 7-9% pastel tiles and section tints, 2-3% full saturation (dots, underlines, badges, one button, one hero accent). One saturated hue per section, rotating down the page.

**Tiny refined splash.** One small (about 120-200px) round "bead" in the section's saturated hue, either a flat circle or a soft radial gradient with a white highlight, peeking from a tile corner. Use at most one per viewport and drop it on mobile. That is the whole remnant of the splash idea.

**Color dots.** 12px circles with a 1px inner ring (`box-shadow: inset 0 0 0 1px rgba(0,0,0,.12)`), 8px apart, mirroring Apple's finish picker. Show them on every tile and use them to switch bead colorways on product pages.

**Buttons.** Primary is a 999px pill, 12px/22px padding, fill `#1d1d1f` with white text, 17px, weight 500. Hover tints toward cobalt `#1f3fa8`. Secondary is a text link in cobalt with a chevron. Focus ring is 2px cobalt with a 2px offset.

**Badges.** Small caps in Martian Mono 11px, tracked +0.06em, on a 10% accent tint with accent-dark text. Examples: "New", "One of a kind". Pill shape, no border.

**Headlines.** 56-72px, 1.05 line height, tracking -0.02em, weight 600 (sans) or 400 (serif). Sentence case. Eyebrow in mono or 14px 600.

**Motion.** 200-400ms ease-out, fades and 4px rises only. No parallax, no autoplay marquees. Respect `prefers-reduced-motion`.

### Do / Don't
1. **Do** let the beads supply the color; keep the surrounding UI neutral.
2. **Do** use one saturated accent per section and at most two on screen at once.
3. **Do** give photos room: padding at least 8% of tile width.
4. **Do** put color in small details: dots, underlines, badges, focus rings.
5. **Don't** put gradients, blurred or feathered photo edges, or paint shapes behind photos.
6. **Don't** stack more than one display font; Shrikhand is logo-only.
7. **Don't** use pure-saturation text on tint for body copy; check 4.5:1 contrast (yellow `#e4dd3b` never as text on white).
8. **Don't** add shadows to tiles; use tint and radius for depth.

## Sources (all opened)
- https://www.apple.com/imac/ (page and linked stylesheet https://www.apple.com/v/imac/w/built/styles/overview.built.css)
- https://www.apple.com/iphone/
- https://www.freecodecamp.org/news/bento-grids-in-web-design/
- https://www.dropmark.com/blog/reverse-engineered-fishwife/
- https://madegooddesigns.com/rhode-brand-guidelines/
- https://www.rhodeskin.com/
- https://www.omsom.com/
- https://www.modernretail.co/startups/why-omsom-rebranded-its-packaging-for-its-retail-debut/
- https://teenage.engineering/
- https://linear.app/
- https://www.mejuri.com/us/en
- https://thedieline.com/daniel-miller-cracks-the-tin-open-on-illustrating-the-world-of-fishwife/ (paywalled, intro only)
- https://fonts.googleapis.com/css2?family=Young+Serif (and Hanken Grotesk, Gloock, Albert Sans, Familjen Grotesk, Caprasimo) for availability
- https://eatfishwife.com/, https://www.glossier.com/, https://www.notion.com/ (opened; text only, no design values usable, not relied on)
