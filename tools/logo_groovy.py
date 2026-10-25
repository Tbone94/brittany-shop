"""The 70s groovy logo (brand/logo/s5-groovy-arch.svg) in more text layouts, each drawn so its shadow and letter colors
can be swapped with CSS variables, for the playground in brand/logos-groovy.html.

    python3 tools/logo_groovy.py

Writes brand/logo/groovy/<layout>.svg (coral shadow, cream letters) and brand/logo/groovy/sprite.svg, one <symbol> per
layout. In the sprite and the files, the shadow is three bands, --b1 (nearest the letters) to --b3 (deepest), so one
color or a 70s stripe both work; the letters are --letter. Those var() colors are for screens: once a combination is
picked, export flat colors for print (no var()).
"""
import math, re, pathlib
from logo import BAGEL, GLASS, INK, CREAM, Art, rotate, eightball, OUT
from logo_stack import place, silhouette, letters_on, tilt, width, LW

DIR = OUT / 'groovy'
LAST = {}  # where the last drawing's viewBox and 8-ball ended up
BANDS = {'--b1': GLASS['coral'], '--b2': GLASS['coral'], '--b3': GLASS['coral']}


def arc(word, size, R, y, x=0, up=True):
    """Set a word along a circle of radius R: an arch (up, ends drop) or a smile (ends rise)."""
    flat = place(word, 0, 0, size=size)
    mid = (flat[0]['box'][0] + flat[-1]['box'][2]) / 2
    s = 1 if up else -1
    rot, dx, dy = [], [], []
    for g in flat:
        bx = (g['box'][0] + g['box'][2]) / 2 - mid
        t = bx / R
        rot.append(s * math.degrees(t))
        dx.append(R * math.sin(t) - bx)
        dy.append(s * R * (1 - math.cos(t)))
    out = place(word, x - mid, y, size=size, rot=rot, dx=dx, dy=dy)
    for g in out:  # turn on the baseline, so the letters fan out along the curve
        g['pivot'] = ((g['box'][0] + g['box'][2]) / 2 + g['dx'], g['y'] + g['dy'])
    return out


def wave(word, size, y, x=0, amp=18, length=520, phase=0):
    """Set a word on a sine-wave baseline, each letter leaning with the slope."""
    flat = place(word, 0, 0, size=size)
    mid = (flat[0]['box'][0] + flat[-1]['box'][2]) / 2
    rot, dy = [], []
    for g in flat:
        bx = (g['box'][0] + g['box'][2]) / 2 - mid
        u = 2 * math.pi * bx / length + phase
        dy.append(amp * math.sin(u))
        rot.append(math.degrees(math.atan(amp * 2 * math.pi / length * math.cos(u))))
    out = place(word, x - mid, y, size=size, rot=rot, dy=dy)
    for g in out:
        g['pivot'] = ((g['box'][0] + g['box'][2]) / 2, g['y'] + g['dy'])
    return out


def straight(word, size, y, x=0, rot=None, dy=None):
    flat = place(word, 0, 0, size=size)
    mid = (flat[0]['box'][0] + flat[-1]['box'][2]) / 2
    return place(word, x - mid, y, size=size, rot=rot, dy=dy)


def plate(a, letters, sid, width_, dx, dy, var=None, color=INK):
    """One copy of the letters' silhouette, nudged by (dx, dy): ink, or a shadow band colored by a CSS variable."""
    paint = f'style="fill:var({var},{BANDS[var]});stroke:var({var},{BANDS[var]})"' if var else f'fill="{color}" stroke="{color}"'
    a.parts.append(f'<use href="#{sid}" {paint} stroke-width="{width_:.1f}" stroke-linejoin="round" '
                   f'transform="translate({dx:.1f} {dy:.1f})"/>')
    for g in letters:
        if g['box']:
            x0, y0, x1, y1 = g['box']
            p = width_ / 2
            px, py = g['pivot']
            a.reach(*[rotate((x + g['dx'] + dx, y + g['dy'] + dy), g['rot'], px + dx, py + dy)
                      for x in (x0 - p, x1 + p) for y in (y0 - p - (40 if g['char'] == 'ı' else 0), y1 + p)])


def ball_on_i(letters, r):
    """Where the 8-ball sits for a capital I (which has no dot): wedged on its top, tipped with it."""
    for g in letters:
        if g['char'] == 'I':
            x0, y0, x1, y1 = g['box']
            c = ((x0 + x1) / 2 + g['dx'], y0 + g['dy'] - r * .7)
            return rotate(c, g['rot'], *g['pivot']) + (r,)


def groovy(name, letters, turn=0, depth=26, ball=None, front=(), draw_ball=True, out=None):
    """Cream letters on a chunky 3D drop down and to the right: an ink rim, then three color bands.
    `ball` is an extra 8-ball (cx, cy, r); `front` lists letters drawn last, in front of their neighbors.
    draw_ball=False leaves the ball's spot empty (the site drops its own 8-ball in there, play.js); LAST then says
    where it goes. `out` writes the file somewhere else."""
    a = Art()
    sid = f'{name}-sil'
    silhouette(a, letters, sid)
    if ball and draw_ball:
        bx, by, br = ball
        a.parts[0] = a.parts[0].replace('</g></defs>', f'<circle cx="{bx:.2f}" cy="{by:.2f}" r="{br:.2f}"/></g></defs>')
        a.reach((bx - br - 30, by - br - 30), (bx + br + 30, by + br + 30))
    step = 2
    for k in range(depth, -1, -step):
        plate(a, letters, sid, LW * 2 + 14, k, k)
    for k in range(depth - step, -1, -step):
        band = '--b3' if k > depth * 2 / 3 else '--b2' if k > depth / 3 else '--b1'
        plate(a, letters, sid, LW * 2 - 2, k, k, var=band)
    oc = iter(['turquoise', 'tangerine', 'orchid'])
    for g in letters:  # glass colors in reading order, whatever order they're drawn in
        if g['char'] in 'oO':
            g['glass'] = next(oc)
    back = [g for k, g in enumerate(letters) if k not in front]
    letters_on(a, back + [letters[k] for k in front], CREAM)
    if ball and draw_ball:
        eightball(a, *ball, LW)
    if ball:
        a.reach((ball[0] - ball[2] - 30, ball[1] - ball[2] - 30), (ball[0] + ball[2] + 30, ball[1] + ball[2] + 30))
    x0, y0, x1, y1 = a.box
    if turn:
        tilt(a, turn)
    LAST['ball'] = ball and rotate(ball[:2], turn, (x0 + x1) / 2, (y0 + y1) / 2) + (ball[2],)
    x0, y0, x1, y1 = a.box
    p = .05 * max(x1 - x0, y1 - y0)
    vb = f'{x0 - p:.1f} {y0 - p:.1f} {x1 - x0 + 2 * p:.1f} {y1 - y0 + 2 * p:.1f}'
    body = '\n'.join(a.parts)
    body = body.replace(f'fill="{CREAM}"', f'style="fill:var(--letter,{CREAM})"')
    body = re.sub(r'id="g(\d+)"', rf'id="{name}-g\1"', body)
    body = re.sub(r'url\(#g(\d+)\)', rf'url(#{name}-g\1)', body)
    w, h = x1 - x0 + 2 * p, y1 - y0 + 2 * p
    LAST['vb'] = (x0 - p, y0 - p, w, h)
    (out or DIR / f'{name}.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" width="{w:.0f}" '
                                     f'height="{h:.0f}">\n{body}\n</svg>\n')
    return f'<symbol id="{name}" viewBox="{vb}">\n{body}\n</symbol>'


LAYOUTS = {
    # Chaotic arched over a big straight Goods: the original s5.
    'arch': lambda: arc('Chaotıc', 190, 560, 0) + straight('Goods', 240, 224),
    # Both words curved like a rainbow, Goods on a wider circle underneath.
    'rainbow': lambda: arc('Chaotıc', 190, 520, 0) + arc('Goods', 230, 820, 222),
    # Chaotic arched up and Goods smiling down, so the two close into a round badge.
    'badge': lambda: arc('Chaotıc', 190, 500, 0) + arc('Goods', 230, 720, 250, up=False),
    # Chaotic riding a wave, Goods straight and nudged right.
    'wave': lambda: wave('Chaotıc', 200, 0, amp=20, length=560, phase=-.6) + straight('Goods', 236, 216, x=60),
    # Two straight lines, Goods tucked in to the right, the whole thing tipped up.
    'tipped': lambda: straight('Chaotıc', 200, 0, x=-50) + straight('Goods', 236, 212, x=70),
    # Every letter hops a little off the line.
    'bounce': lambda: straight('Chaotıc', 200, 0, rot=[-7, 5, -4, 6, -6, 4, -8], dy=[4, -10, 2, -8, 6, -12, 2])
                      + straight('Goods', 236, 214, x=10, rot=[6, -6, 7, -5, 8], dy=[-6, 6, -4, 8, -8]),
}
TURN = {'tipped': -8, 'bounce': -4, 'wave': -3, 'pile': -3}

# Piles, like the color names in "Shop by color": capitals squeezed together, every other one wedged up on its
# neighbors, but still in reading order.
PILE_TOP = dict(rot=[-8, 9, -5, 6, -11, 5, 10], dy=[0, -30, 4, -6, -36, 6, -22])
PILE_BOT = dict(rot=[7, -8, 5, -9, 8], dy=[0, -22, 6, -28, 2])
UP_TOP, UP_BOT = (1, 4, 6), (1, 3)


def pile(word, size, y, x=0, rot=None, dy=None):
    flat = place(word, 0, 0, size=size, track=-.06)
    mid = (flat[0]['box'][0] + flat[-1]['box'][2]) / 2
    out = place(word, x - mid, y, size=size, track=-.06, rot=rot, dy=dy)
    for g in out:
        if g['char'] == 'O':
            # Bagel's capital O has a big round hole; draw it as the lowercase o (a little slot, like the glass o's in
            # every other layout) blown up to capital height, centered where the O was
            x0, y0, x1, y1 = g['box']
            ob = BAGEL.bounds('o', size, 0, 0)
            k = (y1 - y0) / (ob[3] - ob[1])
            ob = BAGEL.bounds('o', size * k, 0, 0)
            g['name'], g['size'] = 'o', size * k
            g['x'] = (x0 + x1) / 2 - (ob[0] + ob[2]) / 2
            g['box'] = BAGEL.bounds('o', size * k, g['x'], g['y'])
    return out


def pile_two():
    top = pile('CHAOTIC', 190, 0, **PILE_TOP)
    bot = pile('GOODS', 220, 196, x=10, **PILE_BOT)
    letters = top + bot
    return letters, ball_on_i(letters, 36), list(UP_TOP) + [7 + k for k in UP_BOT]


def pile_line():
    top = pile('CHAOTIC', 190, 0, x=-430, **PILE_TOP)
    bot = pile('GOODS', 190, 0, x=330, rot=PILE_BOT['rot'], dy=[d * .8 for d in PILE_BOT['dy']])
    letters = top + bot
    return letters, ball_on_i(letters, 32), list(UP_TOP) + [7 + k for k in UP_BOT]


PILES = {'pile': pile_two, 'pile-line': pile_line}

# The pick (2026-10-24): the pile, black shadow, cream letters. Flat colors (no var()), so print shops and design
# apps read them too.
FINAL = OUT / 'final'
SITE_DIR = OUT.parent.parent / 'icons'


def flatten(path, shadow=INK, letter=CREAM):
    svg = path.read_text()
    svg = re.sub(r'style="fill:var\(--b\d,#[0-9a-f]+\);stroke:var\(--b\d,#[0-9a-f]+\)"',
                 f'fill="{shadow}" stroke="{shadow}"', svg)
    svg = re.sub(r'style="fill:var\(--letter,#[0-9a-f]+\)"', f'fill="{letter}"', svg)
    path.write_text(svg)


def final():
    FINAL.mkdir(exist_ok=True)
    for name, make in PILES.items():
        letters, ball, front = make()
        for dest in (FINAL / f'chaotic-goods-{name}.svg', SITE_DIR / f'logo-{name}.svg'):
            groovy(name, letters, TURN.get(name, 0), depth=16, ball=ball, front=front, out=dest)
            flatten(dest)
    # the footer's copy, with the 8-ball left out for play.js to drop in
    letters, ball, front = pile_two()
    dest = SITE_DIR / 'logo-pile-noball.svg'
    groovy('pile', letters, TURN['pile'], depth=16, ball=ball, front=front, draw_ball=False, out=dest)
    flatten(dest)
    vx, vy, vw, vh = LAST['vb']
    bx, by, br = LAST['ball']
    print(f'footer 8-ball: left {(bx - br - vx) / vw * 100:.2f}%  top {(by - br - vy) / vh * 100:.2f}%  '
          f'width {2 * br / vw * 100:.2f}%  (logo aspect {vw / vh:.4f})')


if __name__ == '__main__':
    DIR.mkdir(parents=True, exist_ok=True)
    symbols = [groovy(name, make(), TURN.get(name, 0)) for name, make in LAYOUTS.items()]
    for name, make in PILES.items():
        letters, ball, front = make()
        symbols.append(groovy(name, letters, TURN.get(name, 0), depth=16, ball=ball, front=front))
    (DIR / 'sprite.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" style="display:none">\n'
                                    + '\n'.join(symbols) + '\n</svg>\n')
    print('wrote', ', '.join(sorted(p.name for p in DIR.glob('*.svg'))))
    final()
