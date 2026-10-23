# Image prompts: stand-in chest shots

These prompts generate realistic stand-in photos for the site while it's being built. Each one shows a necklace
on a model, cropped from just under the chin to the breastbone, on a **transparent background**. The site paints
the color splashes behind each image itself, so the images must not have a backdrop.

There are 7 necklaces × 7 angles = 49 images, plus one reference image of the model. If that's too many for
now, do the **priority batch** first.

---

## Instructions for Codex

1. Read this whole file. Necklace details match `products.js`.
2. Use the OpenAI image model (gpt-image-1 or newer) with these settings for every image:
   - size `1024x1024`, quality `high`, output format `png`, background `transparent`
3. Generate the **model reference** first (prompt below) and save it as `photos/_model-ref.png`.
4. For each necklace, generate **angle 4 (front)** first. Pass `photos/_model-ref.png` as a reference image
   so it's the same woman.
5. Generate that necklace's other angles with **two reference images**: `_model-ref.png` and the necklace's
   angle-4 image, so the beads match exactly.
6. Build each prompt as: **Shared style** + **Angle block** + **Necklace block** + **Avoid**.
7. Save each result as `photos/<slug>-<angle>.png`, e.g. `photos/tide-pool-4.png`. The site picks them up
   automatically, with no code changes.
8. Check every image against the **Review checklist** at the bottom. Regenerate any that fail.

### Priority batch (19 images)

These are enough for the whole homepage to use real-looking images:

| Purpose | Files |
| --- | --- |
| Hero (necklace *n* shown at angle *n*) | `tide-pool-1`, `marmalade-2`, `lilac-hour-3`, `moss-and-stone-4`, `cherry-soda-5`, `midnight-6`, `sunday-morning-7` |
| Grid cards (front) | `tide-pool-4`, `marmalade-4`, `lilac-hour-4`, `cherry-soda-4`, `midnight-4`, `sunday-morning-4` |
| Grid hover (angle 6) | `tide-pool-6`, `marmalade-6`, `lilac-hour-6`, `moss-and-stone-6`, `cherry-soda-6`, `sunday-morning-6` |

The remaining angles only appear in each necklace's popup.

---

## Model reference prompt

> Editorial jewelry photograph, square crop, transparent background. The bare neck, collarbones and upper chest of
> a white woman in her late twenties, facing the camera squarely. Fair skin with a warm-neutral undertone,
> natural texture with fine visible pores and a few very faint freckles across the collarbones, no makeup in
> frame. Slim build with softly defined collarbones, relaxed shoulders. Her hair is fully pulled up and out of
> frame. She wears a plain ivory off-the-shoulder top in matte cotton knit, with a straight neckline crossing
> the lower 15% of the frame. Framing: from just below the chin (the chin and face are not in the picture) down
> to the top of the breastbone. Her neck is centered and her shoulders run past both side edges of the frame.
> No jewelry. Soft diffused window light from camera-left at about 45 degrees, gentle falloff toward the right
> shoulder, true-to-life color. 100mm macro lens at f/5.6, camera at chest height, level and straight-on.

---

## Shared style (start of every necklace prompt)

> Editorial product photograph of a handmade glass-bead necklace worn on a model, square crop, transparent
> background with the subject isolated: no backdrop, no floor, no cast shadow on any background.
> The model is the same woman as the reference image: a white woman in her late twenties, fair skin with a
> warm-neutral undertone, natural skin texture with fine pores and a few very faint freckles across the
> collarbones, slim build, softly defined collarbones, relaxed shoulders, hair fully pulled up and out of frame.
> She wears the same plain ivory off-the-shoulder cotton-knit top with a straight neckline across the bottom of
> the frame.
> Framing: a tight chest shot from just below the chin to the top of the breastbone. The chin, lips and face are
> NOT in the picture. The base of the neck sits at the same height in every image, and the body runs past the
> side and bottom edges of the frame. The entire front of the necklace is in frame.
> Lighting: soft, diffused window light from camera-left at about 45 degrees, with subtle fill on the right.
> Each glass bead has a crisp specular highlight on its upper left. Light passes through the transparent beads
> and casts faint, tinted colored shadows on the skin just below and to the right of each bead.
> The beads are handmade lampwork glass: slightly irregular rounds, not machine-perfect, glossy, with real
> refraction and depth, and visible bead holes where the strand enters. The necklace drapes naturally with
> gravity and rests on the skin, following the curve of the collarbones.
> Camera: 100mm macro lens at f/5.6, camera at chest height, level, not tilted. Tack-sharp focus on the beads,
> with a gentle natural falloff on the far side. Color-accurate, high resolution, photographic, not a 3D render.

## Angle blocks

The camera never moves. Only the model turns, as if she's rotating on a swivel stool. "Left" and "right" mean
the left and right edges of the image.

1. **Angle 1, full profile facing left.** Her body is turned 90 degrees so the front of her chest points straight at the left edge of the frame. We see the side of her neck and shoulder. Her throat is at the left; the back of her neck is at the right. The necklace hangs from the back of the neck, crosses the side of the neck diagonally, and its front and focal bead are near the left third of the frame. Only the near side of the strand is visible.
2. **Angle 2, turned 60 degrees toward the left.** Mostly side-on, facing left. The far shoulder is barely visible. The necklace's front curve and focal bead sit left of center, and the near side of the strand runs diagonally up toward the right side of the neck.
3. **Angle 3, three-quarter view facing left (30 degrees).** Both collarbones are visible; the far one is foreshortened. The necklace forms an asymmetrical U, with the focal bead slightly left of center.
4. **Angle 4, facing the camera squarely.** Symmetrical pose. The necklace forms an even V/U centered under the neck, focal bead dead center.
5. **Angle 5, three-quarter view facing right (30 degrees).** Mirror of angle 3. The focal bead is slightly right of center.
6. **Angle 6, turned 60 degrees toward the right.** Mirror of angle 2. The focal bead sits right of center.
7. **Angle 7, full profile facing right.** Mirror of angle 1. The front of her chest points straight at the right edge of the frame, and the focal bead is near the right third.

## Necklace blocks

Slugs match the file names. Bead sizes are approximate. Keep the same bead order in every angle.

**`tide-pool` (Tide Pool, 18 in).** A single strand of 10 mm round lampwork glass beads in a repeating pattern of deep teal, seafoam green and pale mint. Teal is transparent; seafoam and mint are semi-opaque. A tiny 3 mm silver-tone spacer bead sits between every glass bead. At the center is a 16 mm deep-teal focal bead covered in small raised opaque white dots. The strand is fine silver-tone beading wire. Beads cover the front half; plain wire runs around the back of the neck. It sits just below the collarbones.

**`marmalade` (Marmalade, 15 in choker).** A short choker sitting high at the base of the neck. Chunky 12–14 mm round glass beads alternate amber, honey gold and burnt orange; they're transparent and glow warm where light passes through. Every fourth bead has small cream dots. At the center is a 14 mm burnt-orange focal bead with cream wavy stripes. It's strung on brown waxed-cotton cord, with beads continuous across the front.

**`lilac-hour` (Lilac Hour, 19 in).** A graduated strand: beads are largest at the center (about 13 mm) and taper to about 6 mm toward the back. Violet, pale lilac and water-clear transparent glass repeat in order, and every third bead has fine white dots. At the center is an 18 mm deep-violet focal bead with white dots. Silver-tone wire. It hangs in a soft V a little below the collarbones.

**`moss-and-stone` (Moss & Stone, 22 in).** The longest piece, on a thin dark-brown leather cord. Small clusters of three 9 mm glass beads (olive green, forest green, and opaque bone ivory) sit about 2 cm apart, with bare cord between clusters. At the center is a 16 mm forest-green focal bead with ivory wavy stripes, hanging lowest of the set, near the bottom of the frame.

**`cherry-soda` (Cherry Soda, 17 in).** A dense strand of small 6 mm round glass beads alternating cherry red, bubblegum pink and pale blush, continuous all the way across the front. At the center is one big 20 mm glossy cherry-red focal bead with raised white polka dots. Silver-tone wire.

**`midnight` (Midnight, 18 in).** 10 mm round glass beads in cobalt, navy and cornflower blue, with a tiny gold-tone spacer between each. Every other glass bead has thin swirling gold stripes. At the center is a 16 mm cobalt focal bead with gold swirl stripes. Gold-tone wire.

**`sunday-morning` (Sunday Morning, 18 in).** A playful mixed strand of 8–12 mm round glass beads in random order and slightly varied sizes: peach, mint, butter yellow and lavender opaque pastels, some with small white dots. No two neighboring beads are the same color. At the center is a 14 mm peach focal bead with white dots. Silver-tone wire.

## Avoid (end of every prompt)

> Do not show: the face, chin, lips or eyes; hands; hair across the neck; earrings or any other jewelry; straps;
> tattoos; text, logos or watermarks; a background, floor or backdrop. No 3D-render or CGI look, no plastic-looking
> beads, no perfectly identical beads, no melted, merged or duplicated beads, no beads floating off the skin.

---

## Example: full prompt for `photos/tide-pool-4.png`

Reference image: `photos/_model-ref.png`

> [Shared style]
> Angle 4, facing the camera squarely. Symmetrical pose. The necklace forms an even V/U centered under the neck,
> focal bead dead center.
> Tide Pool, 18 in: a single strand of 10 mm round lampwork glass beads in a repeating pattern of deep teal,
> seafoam green and pale mint (teal transparent; seafoam and mint semi-opaque), with a tiny 3 mm silver-tone
> spacer bead between every glass bead. At the center is a 16 mm deep-teal focal bead covered in small raised
> opaque white dots. Fine silver-tone beading wire. Beads cover the front half; plain wire around the back of the
> neck. It sits just below the collarbones.
> [Avoid]

For `photos/tide-pool-6.png`, swap in the Angle 6 block and add `photos/tide-pool-4.png` as a second reference.

---

## Review checklist

- [ ] Transparent background. No white or gray box behind the body.
- [ ] No face: the frame starts below the chin.
- [ ] Same woman, skin tone, top and lighting as the reference.
- [ ] Neck base at the same height as the other angles.
- [ ] Correct bead colors, order, sizes and focal bead for that necklace, matching its angle-4 image.
- [ ] Rotation matches the angle; the focal bead is on the correct side.
- [ ] Beads look like real glass: highlights, depth, slight irregularity, tinted shadows on skin.
- [ ] Saved as `photos/<slug>-<angle>.png`.
