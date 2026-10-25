"""Stacked and tilted takes on the Glass O's logo (direction A): the same Bagel Fat One letters, glass o's and 8-ball
i-dot, set on two lines and knocked off their straight baseline, for the site footer, stickers and marketing.

    python3 tools/logo_stack.py

Writes brand/logo/s<n>-<name>.svg. Builds on tools/logo.py (same fonts, colors and drawing helpers).
brand/logos-stacked.html lays them out on the footer, a sticker and a post.
"""
import math, sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from logo import BAGEL, GLASS, INK, CREAM, GOLD, Art, eightball, rotate, OUT

SIZE, LW = 200, 9
O_COLORS = ['turquoise', 'tangerine', 'orchid']


def place(word, x, y, size=SIZE, track=-0.005, rot=None, dx=None, dy=None):
    """Lay out a word and give each letter its own tilt (degrees) and nudge."""
    out = []
    for k, g in enumerate(BAGEL.run(word, size, x, y, track=track)):
        g = dict(g)
        g['rot'] = rot[k] if rot else 0
        g['dx'] = dx[k] if dx else 0
        g['dy'] = dy[k] if dy else 0
        x0, y0, x1, y1 = g['box']
        g['pivot'] = ((x0 + x1) / 2 + g['dx'], g['y'] + g['dy'] - size * .3)  # middle of the x-height
        out.append(g)
    return out


def rot_attr(g):
    return f' transform="rotate({g["rot"]:.2f} {g["pivot"][0]:.2f} {g["pivot"][1]:.2f})"' if g['rot'] else ''


def dot_of(g):
    """The 8-ball over the dotless i: center and radius, before the letter's tilt."""
    cx, cy, r = BAGEL.dot(g['size'], g['x'] + g['dx'], g['y'] + g['dy'])
    return cx, cy - r * .1, r * 1.12


def silhouette(a, letters, sid):
    """Every letter (and the 8-ball) as one shape with no paint of its own, for sticker edges, shadows and
    extrusions: <use> it with a fill and a fat stroke."""
    body = []
    for g in letters:
        if not g['box']:
            continue
        d = BAGEL.path(g['name'], g['size'], g['x'] + g['dx'], g['y'] + g['dy'])
        dot = ''
        if g['char'] == 'ı':
            cx, cy, r = dot_of(g)
            dot = f'<circle cx="{cx:.2f}" cy="{cy:.2f}" r="{r:.2f}"/>'
        body.append(f'<g{rot_attr(g)}><path d="{d}"/>{dot}</g>')
    a.parts.insert(0, f'<defs><g id="{sid}">' + ''.join(body) + '</g></defs>')


def plate(a, letters, sid, color, width, dx=0, dy=0):
    a.parts.append(f'<use href="#{sid}" fill="{color}" stroke="{color}" stroke-width="{width:.1f}" '
                   f'stroke-linejoin="round"' + (f' transform="translate({dx:.1f} {dy:.1f})"' if dx or dy else '') + '/>')
    for g in letters:
        if g['box']:
            x0, y0, x1, y1 = g['box']
            p = width / 2
            px, py = g['pivot']
            a.reach(*[rotate((x + g['dx'] + dx, y + g['dy'] + dy), g['rot'], px + dx, py + dy)
                      for x in (x0 - p, x1 + p) for y in (y0 - p - (40 if g['char'] == 'ı' else 0), y1 + p)])


def letters_on(a, letters, fill, colors=None, outline=True):
    """The letters themselves: ink (or `fill`), glass o's with a glint, the 8-ball dot. `colors` makes every letter
    glass, one color each."""
    oc = iter(O_COLORS)
    for k, g in enumerate(letters):
        if not g['box']:
            continue
        x0, y0, x1, y1 = g['box']
        kw = dict(rot=g['rot'], pivot=g['pivot'], dx=g['dx'], dy=g['dy'])
        if g['char'] in 'oO':
            a.glyph(BAGEL, g, a.c(GLASS[g.get('glass') or next(oc)]), INK, LW * 2, glass=.03, **kw)
            w, h = x1 - x0, y1 - y0
            gx, gy = x0 + g['dx'] + w * .2, y0 + g['dy'] + h * .24
            a.add(f'<g{rot_attr(g)}><ellipse cx="{gx:.1f}" cy="{gy:.1f}" rx="{w * .08:.1f}" ry="{h * .045:.1f}" '
                  f'fill="#fff" fill-opacity=".9" transform="rotate(-45 {gx:.1f} {gy:.1f})"/></g>')
        elif colors:
            a.glyph(BAGEL, g, a.c(GLASS[colors[k]]), INK, LW * 2, glass=.035, **kw)
        else:
            a.glyph(BAGEL, g, fill, INK if outline else None, LW * 2 if outline else 0, **kw)
        if g['char'] == 'ı':
            tmp = Art(a.mono, a.rev)
            cx, cy, r = dot_of(g)
            eightball(tmp, cx, cy, r, LW)
            a.add(f'<g{rot_attr(g)}>' + ''.join(tmp.parts) + '</g>', *[rotate(p, g['rot'], *g['pivot']) for p in
                                                                       ((cx - r - LW, cy - r - LW), (cx + r + LW, cy + r + LW))])


def tilt(a, deg):
    """Turn the whole lockup."""
    x0, y0, x1, y1 = a.box
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    defs = [p for p in a.parts if p.startswith('<defs>')]
    rest = [p for p in a.parts if not p.startswith('<defs>')]
    a.parts = defs + [f'<g transform="rotate({deg} {cx:.1f} {cy:.1f})">'] + rest + ['</g>']
    pts = [rotate((x, y), deg, cx, cy) for x in (x0, x1) for y in (y0, y1)]
    a.box = [min(p[0] for p in pts), min(p[1] for p in pts), max(p[0] for p in pts), max(p[1] for p in pts)]


def width(letters):
    return letters[-1]['box'][2] - letters[0]['box'][0]


# 1. Tilt stack: the calm one. Two lines, Goods tucked in under the right, the whole thing tipped up, one quirk.
def tilt_stack():
    a = Art()
    top = place('Chaotıc', 0, 0)
    bot = place('Goods', 0, 0)
    shift = width(top) - width(bot) + 70
    bot = place('Goods', shift, 168)
    letters_on(a, top + bot, INK, outline=False)
    # her gold wire swinging out from under the C and along beneath Goods, a bead at the end
    y = 202
    x0, x_end = top[0]['box'][0] + 30, bot[-1]['box'][2] + 10
    wire = f'M{x0} 34C{x0 - 20} 150 {shift - 90} {y + 4} {shift + 40} {y}S{x_end - 90} {y - 2} {x_end} {y - 22}'
    a.add(f'<path d="{wire}" fill="none" stroke="{GOLD}" stroke-width="9" stroke-linecap="round"/>',
          (x0 - 30, 30), (x_end + 20, y + 20))
    a.bead(x_end + 14, y - 34, 22, GLASS['coral'], lw=6)
    tilt(a, -8)
    a.save('s1-tilt-stack')


# 2. Bounce sticker: every letter hops off the line, cut out like a sticker with a cream edge and a coral shadow.
def bounce_sticker():
    a = Art()
    top = place('Chaotıc', 0, 0)
    wt = width(top)
    bot = place('Goods', 0, 0)
    off = (wt - width(bot)) / 2 + 30
    top = place('Chaotıc', 0, 0, rot=[-7, 5, -4, 6, -6, 4, -8], dy=[4, -10, 2, -8, 6, -12, 2])
    bot = place('Goods', off, 172, rot=[6, -6, 7, -5, 8], dy=[-6, 6, -4, 8, -8])
    allx = top + bot
    silhouette(a, allx, 's2')
    plate(a, allx, 's2', GLASS['coral'], 108, 14, 18)
    plate(a, allx, 's2', INK, 108)
    plate(a, allx, 's2', CREAM, 84)
    letters_on(a, allx, INK, outline=False)
    tilt(a, -6)
    a.save('s2-bounce-sticker', pad=.03)


# 3. Tumble: Chaotic starts neat and comes apart letter by letter, the c falling off the end and spilling beads;
# Goods sits solid underneath.
def tumble():
    a = Art()
    top = place('Chaotıc', 0, 0, rot=[0, 0, -3, 5, -8, 8, 30], dx=[0, 0, 0, 4, 12, 22, 52],
                dy=[0, -2, 2, -6, 4, -12, 30])
    bot = place('Goods', 26, 176)
    letters_on(a, top + bot, INK, outline=False)
    c = top[-1]
    cx, cy = c['box'][2] + c['dx'], c['y'] + c['dy']
    for bx, by, r, col in ((cx + 40, cy + 30, 20, 'orchid'), (cx + 92, cy + 54, 14, 'leaf'),
                           (cx + 128, cy + 84, 10, 'turquoise')):
        a.bead(bx, by, r, GLASS[col], lw=5)
    a.save('s3-tumble')


# 4. Bead pile: every letter its own glass color, squeezed so they overlap like beads poured in a dish, Chaotic
# piled on top of Goods.
def bead_pile():
    a = Art()
    top = place('Chaotıc', 0, 0, track=-0.07, rot=[-6, 5, -3, 7, -5, 4, -7], dy=[2, -6, 4, -4, 6, -8, 2])
    bot = place('Goods', 0, 0, track=-0.07)
    off = (width(top) - width(bot)) / 2 + 20
    bot = place('Goods', off, 150, track=-0.07, rot=[5, -7, 6, -4, 7], dy=[-4, 4, -2, 6, -6])
    allx = bot + top
    silhouette(a, allx, 's4')
    plate(a, allx, 's4', INK, 46, 8, 12)
    letters_on(a, bot, INK, colors=['cobalt', '', '', 'coral', 'leaf'])
    letters_on(a, top, INK, colors=['coral', 'uranium', 'leaf', '', 'cobalt', 'rubino', 'amber'])
    a.save('s4-bead-pile')


# 5. Groovy arch: Chaotic bends up in a 70s arch over a big Goods, cream letters on a chunky coral extrusion.
def groovy_arch():
    a = Art()
    R, size = 560, 190
    flat = place('Chaotıc', 0, 0, size=size)
    mid = (flat[0]['box'][0] + flat[-1]['box'][2]) / 2
    rot, dx, dy = [], [], []
    for g in flat:
        bx = (g['box'][0] + g['box'][2]) / 2 - mid
        t = bx / R
        rot.append(math.degrees(t))
        dx.append(R * math.sin(t) - bx)
        dy.append(R * (1 - math.cos(t)))
    top = place('Chaotıc', -mid, 0, size=size, rot=rot, dx=dx, dy=dy)
    for g in top:  # turn on the baseline, so the letters fan out along the arch
        g['pivot'] = ((g['box'][0] + g['box'][2]) / 2 + g['dx'], g['y'] + g['dy'])
    bot = place('Goods', 0, 0, size=240)
    bot = place('Goods', -width(bot) / 2, 224, size=240)
    allx = top + bot
    silhouette(a, allx, 's5')
    D = 26
    for k in range(D, -1, -2):
        plate(a, allx, 's5', INK, LW * 2 + 14, k, k)
    for k in range(D - 2, -1, -2):
        plate(a, allx, 's5', GLASS['coral'], LW * 2 - 2, k, k)
    letters_on(a, allx, CREAM)
    a.save('s5-groovy-arch')


if __name__ == '__main__':
    OUT.mkdir(parents=True, exist_ok=True)
    for draw in (tilt_stack, bounce_sticker, tumble, bead_pile, groovy_arch):
        draw()
    print('wrote', ', '.join(sorted(p.name for p in OUT.glob('s[0-9]-*.svg'))))
