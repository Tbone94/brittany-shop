"""Makes the favicon and app icons from the Giving Garden Gnome photo, cut into the collection panel's wavy
five-lobed window shape with its thick ink outline (the same shape shop.js draws: ring(5, 90, 74, wobble), smoothed).

    python3 tools/make_icons.py

Writes icons/favicon-32.png, favicon-64.png, icon-192.png, icon-512.png (transparent around the shape),
icon-maskable-512.png (on white, with room for Android's crop) and apple-touch-icon.png (on white, since
iPhones fill transparency with black). White, not the panel's red: the app's launch screen is white too.
"""
import math, pathlib
from PIL import Image, ImageDraw

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / 'photos/scenes/garden-gnome.webp'
INK, WHITE = (29, 29, 31, 255), (255, 255, 255, 255)
SS = 4  # draw big, then shrink, for smooth edges

def window_points():
    """The blob window on its 200x200 board, as a dense outline (Catmull-Rom curves, like Splash.smooth)."""
    wob = [0, 4, -6, 2, 5, -3, -4, 3, 6, 0]
    pts = []
    for k in range(10):
        a = -math.pi / 2 + k * math.pi / 5
        r = (74 if k % 2 else 90) + wob[k]
        pts.append((100 + math.cos(a) * r, 104 + math.sin(a) * r))
    out, n = [], len(pts)
    for i in range(n):
        p0, p1, p2, p3 = pts[i - 1], pts[i], pts[(i + 1) % n], pts[(i + 2) % n]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        for s in range(24):
            t = s / 24
            out.append(tuple((1 - t) ** 3 * a + 3 * (1 - t) ** 2 * t * b + 3 * (1 - t) * t ** 2 * c + t ** 3 * d
                             for a, b, c, d in zip(p1, c1, c2, p2)))
    return out

def icon(size, fill_frac, bg=None, stroke=9.0):
    """The shape `fill_frac` of the icon wide, centered, with an ink outline `stroke` board-units thick."""
    S = size * SS
    canvas = Image.new('RGBA', (S, S), bg or (0, 0, 0, 0))
    pts = window_points()
    xs, ys = [p[0] for p in pts], [p[1] for p in pts]
    w, h = max(xs) - min(xs), max(ys) - min(ys)
    k = S * fill_frac / (max(w, h) + stroke)
    ox, oy = S / 2 - (min(xs) + w / 2) * k, S / 2 - (min(ys) + h / 2) * k
    poly = [(ox + x * k, oy + y * k) for x, y in pts]
    # The photo, zoomed a little toward the mushroom so it still reads small, fills the shape.
    photo = Image.open(SRC).convert('RGBA')
    pw = photo.width
    photo = photo.crop((int(pw * .12), int(pw * .1), int(pw * .88), int(pw * .86)))
    side = int(max(w, h) * k)
    photo = photo.resize((side, side), Image.LANCZOS)
    mask = Image.new('L', (S, S), 0)
    ImageDraw.Draw(mask).polygon(poly, fill=255)
    layer = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    layer.paste(photo, (int(S / 2 - side / 2), int(S / 2 - side / 2)))
    canvas.paste(layer, (0, 0), mask)
    ImageDraw.Draw(canvas).line(poly + [poly[0]], fill=INK, width=max(2, int(stroke * k)), joint='curve')
    return canvas.resize((size, size), Image.LANCZOS)

out = ROOT / 'icons'
icon(32, .98, stroke=16).save(out / 'favicon-32.png')
icon(64, .98, stroke=13).save(out / 'favicon-64.png')
icon(192, .96).save(out / 'icon-192.png')
icon(512, .96).save(out / 'icon-512.png')
icon(512, .70, bg=WHITE).save(out / 'icon-maskable-512.png')
icon(180, .84, bg=WHITE).save(out / 'apple-touch-icon.png')
print('wrote icons/')
