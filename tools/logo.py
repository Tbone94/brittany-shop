"""Draws the Chaotic Goods logo directions as real vector files, with the letters turned into outlines so they
look the same everywhere (no font needed to open them).

    pip install fonttools uharfbuzz
    python3 tools/logo.py

Writes brand/logo/<direction>.svg plus a one-color version, <direction>-mono.svg (stamps, foil, embroidery, the
inside of a box lid). Fonts are in brand/fonts (all SIL Open Font License, free for commercial use and logos).
brand/logos.html lays them all out side by side, with size tests.
"""
import math, pathlib
import uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.recordingPen import RecordingPen, DecomposingRecordingPen

ROOT = pathlib.Path(__file__).resolve().parent.parent
FONTS, OUT = ROOT / 'brand/fonts', ROOT / 'brand/logo'

# The site's glass-rod palette (styles.css) plus the gold of her wire.
INK, CREAM, GOLD = '#1d1d1f', '#fff8ee', '#c9a24a'
GLASS = dict(coral='#f2674a', tangerine='#f58220', uranium='#e4dd3b', turquoise='#1fb5c9', cobalt='#1f3fa8',
             orchid='#8a4fbf', leaf='#5aa83c', rubino='#a8265e', sangre='#c8321f', emerald='#0f6b45', amber='#e8930c')


def shade(hex_, k):
    """Mix a color toward ink (k > 0) or white (k < 0)."""
    c = [int(hex_[i:i + 2], 16) for i in (1, 3, 5)]
    t = (29, 29, 31) if k > 0 else (255, 255, 255)
    k = abs(k)
    return '#%02x%02x%02x' % tuple(round(a + (b - a) * k) for a, b in zip(c, t))


class Face:
    def __init__(self, file):
        self.tt = TTFont(FONTS / file)
        self.glyphs = self.tt.getGlyphSet()
        self.upm = self.tt['head'].unitsPerEm
        self.hb = hb.Font(hb.Face(hb.Blob.from_file_path(str(FONTS / file))))
        self.cap = self.tt['OS/2'].sCapHeight

    def shape(self, text):
        buf = hb.Buffer()
        buf.add_str(text)
        buf.guess_segment_properties()
        hb.shape(self.hb, buf, {'kern': True, 'liga': False})
        return [(self.tt.getGlyphName(i.codepoint), p.x_advance) for i, p in zip(buf.glyph_infos, buf.glyph_positions)]

    def path(self, name, size, x, y):
        """SVG path of one glyph, its baseline-left corner at (x, y)."""
        s = size / self.upm
        pen = SVGPathPen(self.glyphs)
        self.glyphs[name].draw(TransformPen(pen, (s, 0, 0, -s, x, y)))
        return pen.getCommands()

    def bounds(self, name, size, x, y):
        pen = BoundsPen(self.glyphs)
        self.glyphs[name].draw(pen)
        if not pen.bounds:
            return None
        s = size / self.upm
        x0, y0, x1, y1 = pen.bounds
        return (x + x0 * s, y - y1 * s, x + x1 * s, y - y0 * s)

    def run(self, text, size, x, y, track=0.0, align='left'):
        """Lay out a line. Returns one dict per glyph: name, char, x, y (baseline), adv, box (x0, y0, x1, y1)."""
        shaped = self.shape(text)
        s = size / self.upm
        width = sum(a * s for _, a in shaped) + track * size * (len(shaped) - 1)
        if align == 'center':
            x -= width / 2
        out = []
        for ch, (name, adv) in zip(text, shaped):
            out.append(dict(name=name, char=ch, x=x, y=y, adv=adv * s, size=size, box=self.bounds(name, size, x, y)))
            x += adv * s + track * size
        return out

    def top_x(self, name, size, x):
        """x of the highest part of a glyph (where a hanging letter's ring goes)."""
        pen = DecomposingRecordingPen(self.glyphs)
        self.glyphs[name].draw(pen)
        pts = [p for _, ps in pen.value for p in ps]
        ymax = max(p[1] for p in pts)
        near = [p[0] for p in pts if p[1] >= ymax - 0.07 * self.upm]
        return x + (min(near) + max(near)) / 2 * size / self.upm

    def dot(self, size, x, y):
        """Where this font draws the dot of the i (center x, center y, radius), for an i set at (x, y)."""
        pen = DecomposingRecordingPen(self.glyphs)
        self.glyphs[self.tt.getBestCmap()[ord('i')]].draw(pen)
        contours, cur = [], []
        for op, pts in pen.value:
            cur.append((op, pts))
            if op in ('closePath', 'endPath'):
                contours.append(cur)
                cur = []
        top = max(contours, key=lambda c: max(p[1] for _, pts in c for p in pts))
        xs = [p[0] for _, pts in top for p in pts]
        ys = [p[1] for _, pts in top for p in pts]
        s = size / self.upm
        return (x + (min(xs) + max(xs)) / 2 * s, y - (min(ys) + max(ys)) / 2 * s, (max(xs) - min(xs)) / 2 * s)


BAGEL, FREDOKA, FREDOKA6, FRAUNCES = Face('BagelFatOne-Regular.ttf'), Face('Fredoka-700.ttf'), Face('Fredoka-600.ttf'), Face('Fraunces-Soft.ttf')


class Art:
    """An SVG under construction that keeps track of how far its drawing reaches, to crop it tight."""

    def __init__(self, mono=False, rev=False):
        self.parts, self.box, self.mono, self.rev = [], [1e9, 1e9, -1e9, -1e9], mono, rev
        self.text = CREAM if rev else INK  # the wordmark's letters: ink on light grounds, cream on dark ones

    def c(self, color, mono=INK):
        return mono if self.mono else color

    def reach(self, *pts):
        for x, y in pts:
            self.box = [min(self.box[0], x), min(self.box[1], y), max(self.box[2], x), max(self.box[3], y)]

    def add(self, svg, *pts):
        self.parts.append(svg)
        self.reach(*pts)

    def glyph(self, face, g, fill, stroke=None, lw=0, rot=0, pivot=None, dx=0, dy=0, glass=0):
        if not g['box']:  # a space
            return
        d = face.path(g['name'], g['size'], g['x'] + dx, g['y'] + dy)
        x0, y0, x1, y1 = g['box']
        x0, y0, x1, y1 = x0 + dx, y0 + dy, x1 + dx, y1 + dy
        px, py = pivot or ((x0 + x1) / 2, (y0 + y1) / 2)
        t = f' transform="rotate({rot:.2f} {px:.2f} {py:.2f})"' if rot else ''
        st = f' stroke="{stroke}" stroke-width="{lw:.2f}" stroke-linejoin="round" paint-order="stroke"' if stroke else ''
        if glass and not self.mono:
            # glass shine: a pale rim along the upper-left edges (the letter clipped to itself, a lighter copy under
            # a copy nudged down-right)
            self.n = getattr(self, 'n', 0) + 1
            k = g['size'] * glass
            body = (f'<clipPath id="g{self.n}"><path d="{d}"/></clipPath>'
                    f'<g clip-path="url(#g{self.n})"><path d="{d}" fill="{shade(fill, -.5)}"/>'
                    f'<path d="{d}" fill="{fill}" transform="translate({k:.2f} {k:.2f})"/></g>')
            svg = (f'<g{t}>' + (f'<path d="{d}" fill="{stroke}" stroke="{stroke}" stroke-width="{lw:.2f}" '
                                f'stroke-linejoin="round"/>' if stroke else '') + body + '</g>')
        else:
            svg = f'<path d="{d}" fill="{fill}"{st}{t}/>'
        self.add(svg,
                 *[rotate((x, y), rot, px, py) for x in (x0 - lw, x1 + lw) for y in (y0 - lw, y1 + lw)])

    def bead(self, cx, cy, r, color, lw=None, glint=True):
        """A round glass bead: its color, a darker lower-right edge, a white glint, an ink outline."""
        lw = r * 0.16 if lw is None else lw
        if self.mono:
            self.add(f'<circle cx="{cx:.2f}" cy="{cy:.2f}" r="{r:.2f}" fill="{INK}"/>')
        else:
            o = r * 0.07
            self.add(f'<circle cx="{cx:.2f}" cy="{cy:.2f}" r="{r:.2f}" fill="{shade(color, .28)}"/>'
                     f'<circle cx="{cx - o:.2f}" cy="{cy - o:.2f}" r="{r * .9:.2f}" fill="{color}"/>'
                     f'<circle cx="{cx:.2f}" cy="{cy:.2f}" r="{r:.2f}" fill="none" stroke="{INK}" stroke-width="{lw:.2f}"/>')
        if glint:
            self.add(f'<ellipse cx="{cx - r * .38:.2f}" cy="{cy - r * .4:.2f}" rx="{r * .24:.2f}" ry="{r * .14:.2f}" '
                     f'fill="#fff" fill-opacity="{1 if self.mono else .85}" transform="rotate(-40 {cx - r * .38:.2f} {cy - r * .4:.2f})"/>')
        self.reach((cx - r - lw, cy - r - lw), (cx + r + lw, cy + r + lw))

    def save(self, name, pad=0.06):
        x0, y0, x1, y1 = self.box
        p = pad * max(x1 - x0, y1 - y0)
        x0, y0, w, h = x0 - p, y0 - p, x1 - x0 + 2 * p, y1 - y0 + 2 * p
        svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x0:.1f} {y0:.1f} {w:.1f} {h:.1f}" '
               f'width="{w:.0f}" height="{h:.0f}">\n' + '\n'.join(self.parts) + '\n</svg>\n')
        (OUT / f'{name}{"-mono" if self.mono else ""}{"-reverse" if self.rev else ""}.svg').write_text(svg)


def rotate(p, deg, cx, cy):
    a = math.radians(deg)
    x, y = p[0] - cx, p[1] - cy
    return (cx + x * math.cos(a) - y * math.sin(a), cy + x * math.sin(a) + y * math.cos(a))


def poly(pts):
    return 'M' + 'L'.join(f'{x:.2f} {y:.2f}' for x, y in pts) + 'Z'


# ---------------------------------------------------------------------------------------------------------------
# A. Glass O's: the site's wordmark, with every o turned into a glass ring and an 8-ball for the dot of the i.

def eightball(a, cx, cy, r, lw):
    """The dot of the i: a little 8-ball, like the site's logo and tagline (styles.css --eightball)."""
    if a.mono:
        a.add(f'<circle cx="{cx:.2f}" cy="{cy:.2f}" r="{r:.2f}" fill="{INK}"/>',
              (cx - r, cy - r), (cx + r, cy + r))
        return
    ring = f' stroke="{CREAM}" stroke-width="{lw * .6:.2f}"' if a.rev else ''  # separation from dark grounds
    a.add(f'<circle cx="{cx:.2f}" cy="{cy:.2f}" r="{r:.2f}" fill="#17171a"{ring}/>',
          (cx - r - lw, cy - r - lw), (cx + r + lw, cy + r + lw))
    wr = r * .45
    a.add(f'<circle cx="{cx:.2f}" cy="{cy - r * .125:.2f}" r="{wr:.2f}" fill="#fff"/>')
    cap = wr * 1.1  # the digit stands a bit over half the white circle
    g8 = BAGEL.run('8', cap * BAGEL.upm / BAGEL.cap, cx, cy - r * .125 + cap / 2, align='center')[0]
    a.glyph(BAGEL, g8, INK)
    a.add(f'<ellipse cx="{cx - r * .38:.2f}" cy="{cy - r * .4:.2f}" rx="{r * .24:.2f}" ry="{r * .14:.2f}" '
          f'fill="#fff" fill-opacity=".85" transform="rotate(-40 {cx - r * .38:.2f} {cy - r * .4:.2f})"/>')


def glass_os(mono, rev=False):
    a = Art(mono, rev)
    size = 200
    line = BAGEL.run('Chaotıc Goods', size, 0, 0, track=-0.005)
    colors = iter(['turquoise', 'tangerine', 'orchid'])
    lw = 9
    for g in line:
        if g['char'] == ' ':
            continue
        if g['char'] == 'o':
            col = GLASS[next(colors)]
            a.glyph(BAGEL, g, a.c(col), INK, lw * 2, glass=.03)
            x0, y0, x1, y1 = g['box']
            w, h = x1 - x0, y1 - y0
            # glint on the upper left of the ring
            gx, gy = x0 + w * .2, y0 + h * .24
            a.add(f'<ellipse cx="{gx:.1f}" cy="{gy:.1f}" rx="{w * .08:.1f}" ry="{h * .045:.1f}" fill="#fff" '
                  f'fill-opacity=".9" transform="rotate(-45 {gx:.1f} {gy:.1f})"/>')
        else:
            a.glyph(BAGEL, g, a.text)
        if g['char'] == 'ı':
            cx, cy, r = BAGEL.dot(size, g['x'], g['y'])
            eightball(a, cx, cy - r * .1, r * 1.12, lw)
    a.save('a-glass-os')


# B. On a string: Chaotic in glass colors, each letter hung from her gold wire on a jump ring, over a glossy Goods.

def daisy(a, cx, cy, r, petal, middle='uranium', lw=None):
    lw = r * .14 if lw is None else lw
    pet = ''.join(f'<ellipse cx="{cx:.1f}" cy="{cy - r * .55:.1f}" rx="{r * .36:.1f}" ry="{r * .5:.1f}" '
                  f'transform="rotate({k * 72 + 15} {cx:.1f} {cy:.1f})"/>' for k in range(5))
    a.add(f'<g fill="{a.c(GLASS[petal], "#fff")}" stroke="{INK}" stroke-width="{lw:.1f}">{pet}</g>',
          (cx - r * 1.1, cy - r * 1.1), (cx + r * 1.1, cy + r * 1.1))
    a.add(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r * .32:.1f}" fill="{a.c(GLASS[middle])}" stroke="{INK}" '
          f'stroke-width="{lw:.1f}"/>')


def on_a_string(mono, rev=False, shroom=False):
    a = Art(mono, rev)
    size = 210
    cols = ['coral', 'uranium', 'turquoise', 'orchid', 'leaf', 'cobalt', 'rubino']
    line = BAGEL.run('Chaotic', size, 0, 0, track=0.035)
    bounce = [6, -4, 8, -2, 4, -8, 2]
    tilt = [-5, 4, -3, 5, -4, 3, -5]
    x0, x1 = line[0]['box'][0] - 60, line[-1]['box'][2] + 60
    span, sag, gap = x1 - x0, 40, 30
    tops = [(BAGEL.top_x(g['name'], size, g['x']), g['box'][1] + bounce[k]) for k, g in enumerate(line)]
    top = min(ty - gap - 4 * sag * ((tx - x0) / span) * (1 - (tx - x0) / span) for tx, ty in tops)

    def wire_y(x):
        u = (x - x0) / span
        return top + 4 * sag * u * (1 - u)

    pts = [(x0 + span * k / 80, wire_y(x0 + span * k / 80)) for k in range(81)]
    a.add(f'<path d="M' + 'L'.join(f'{x:.1f} {y:.1f}' for x, y in pts) + f'" fill="none" stroke="{a.c(GOLD)}" '
          f'stroke-width="7" stroke-linecap="round"/>', *pts)
    for k, g in enumerate(line):
        tx, ty = tops[k]
        wy = wire_y(tx)
        # a gold link from the wire down to the letter, then the letter swinging a little from it
        a.add(f'<path d="M{tx:.1f} {wy:.1f}V{ty + 6:.1f}" stroke="{a.c(GOLD)}" stroke-width="6" stroke-linecap="round"/>')
        a.glyph(BAGEL, g, a.c(GLASS[cols[k]], INK), INK, 20, rot=tilt[k], pivot=(tx, ty), dy=bounce[k], glass=.035)
        a.add(f'<circle cx="{tx:.1f}" cy="{wy:.1f}" r="8" fill="{a.c(GOLD)}" stroke="{INK}" stroke-width="4"/>')
    for ex, petal in ((x0, 'orchid'), (x1, 'turquoise')):
        daisy(a, ex, wire_y(ex), 30, petal)
    goods = BAGEL.run('Goods', size * .96, (x0 + x1) / 2 - (46 if shroom else 0), 196, track=-0.005, align='center')
    for g in goods:
        a.glyph(BAGEL, g, a.text, glass=0 if rev else .016)
    if shroom:
        # a little glass mushroom leaning against the s, a bit below the baseline, in a tuft of grass
        sx1, sy1 = goods[-1]['box'][2], goods[-1]['y']
        mushroom(a, sx1 + 58, sy1 + 20, 1.05)
    a.save('b2-mushroom' if shroom else 'b-on-a-string')


def mushroom(a, bx, by, k=1.0, lean=16):
    """A glossy spotted glass mushroom (like her Mushroom Hunt charm) standing at (bx, by), leaning right,
    with a tuft of grass around its foot."""
    lw = 5
    def blade(x, w, h, bend):
        return (f'M{bx + (x - w / 2) * k:.1f} {by + 4:.1f}Q{bx + (x + bend * .3) * k:.1f} {by - h * .55 * k:.1f} '
                f'{bx + (x + bend) * k:.1f} {by - h * k:.1f}Q{bx + (x + bend * .2 + w * .5) * k:.1f} {by - h * .4 * k:.1f} '
                f'{bx + (x + w / 2) * k:.1f} {by + 4:.1f}Z')
    grass = lambda blades, col: a.add(
        f'<g fill="{a.c(col, INK)}" stroke="{INK}" stroke-width="{lw}" stroke-linejoin="round">'
        + ''.join(f'<path d="{blade(*b)}"/>' for b in blades) + '</g>',
        (bx - 50 * k, by - 50 * k), (bx + 50 * k, by + 8))
    grass([(-18, 24, 34, -12), (12, 24, 36, 9)], shade(GLASS['leaf'], .25))  # back blades
    # stem and cap, tilted from the foot
    stem = 'M-15 0C-18 -26 -14 -52 -10 -74L12 -74C15 -50 19 -24 16 0Q0 6 -15 0Z'
    cap = 'M-50 -68C-54 -108 -22 -126 2 -126C30 -126 56 -106 52 -68Q0 -52 -50 -68Z'
    t = f'translate({bx:.1f} {by:.1f}) rotate({lean}) scale({k})'
    spots = [(-24, -98, 10, 8), (12, -112, 8, 6), (30, -86, 9, 7), (-4, -80, 6, 5), (-38, -78, 5, 4)]
    a.n = getattr(a, 'n', 0) + 1
    body = (f'<path d="{stem}" fill="{a.c(CREAM, "#fff")}" stroke="{INK}" stroke-width="{lw / k:.1f}" stroke-linejoin="round"/>'
            f'<path d="M-8 -62Q-5 -32 -8 -10" fill="none" stroke="{a.c(shade(CREAM, .18), "#fff")}" stroke-width="{4 / k:.1f}" stroke-linecap="round"/>'
            f'<path d="{cap}" fill="{INK}" stroke="{INK}" stroke-width="{lw / k:.1f}" stroke-linejoin="round"/>'
            f'<clipPath id="m{a.n}"><path d="{cap}"/></clipPath><g clip-path="url(#m{a.n})">')
    if a.mono:
        body += f'<path d="{cap}" fill="{INK}"/>'
    else:
        red = GLASS['sangre']
        body += f'<path d="{cap}" fill="{shade(red, -.45)}"/><path d="{cap}" fill="{red}" transform="translate(5 6)"/>'
    body += ''.join(f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="{a.c(CREAM, "#fff")}"/>' for x, y, rx, ry in spots)
    body += f'</g><ellipse cx="-28" cy="-112" rx="9" ry="4.5" fill="#fff" fill-opacity=".85" transform="rotate(-35 -28 -112)"/>'
    a.add(f'<g transform="{t}">{body}</g>',
          *[rotate((bx + x * k, by + y * k), lean, bx, by) for x in (-60, 60) for y in (-132, 4)])
    grass([(-30, 24, 22, -10), (-4, 26, 30, -5), (24, 24, 24, 10)], GLASS['leaf'])


# C. Sticker badge: scalloped sun, words around the ring, the mascot bead in the middle.

def arc_text(a, face, text, size, cx, cy, radius, where, fill, track=0.04, stroke=None, lw=0):
    """Letters around a circle, reading left to right. where='top': baseline on `radius`, letters point out.
    where='bottom': cap tops on `radius - cap`, letters point in (baseline on `radius`)."""
    run = face.run(text, size, 0, 0, track=track)
    total = run[-1]['x'] + run[-1]['adv']
    r_mid = radius + (face.cap * size / face.upm) / 2 * (1 if where == 'top' else -1)
    span = total / r_mid
    for g in run:
        if g['char'] == ' ':
            continue
        mid = (g['x'] + g['adv'] / 2) / total - .5  # -0.5..0.5 across the word
        ang = math.degrees(mid * span) * (1 if where == 'top' else -1)
        gx = cx - g['adv'] / 2
        gy = cy - radius if where == 'top' else cy + radius
        d = face.path(g['name'], size, gx, gy)
        st = f' stroke="{stroke}" stroke-width="{lw}" stroke-linejoin="round" paint-order="stroke"' if stroke else ''
        a.add(f'<path d="{d}" fill="{fill}"{st} transform="rotate({ang:.2f} {cx} {cy})"/>')


def scallop(cx, cy, r, amp, n):
    return poly([(cx + (r + amp * math.cos(n * t)) * math.cos(t), cy + (r + amp * math.cos(n * t)) * math.sin(t))
                 for t in (2 * math.pi * k / 1440 for k in range(1440))])


def mascot(a, cx, cy, r, color='coral', lw=None, wire=True):
    """The Chaotic Good bead: a glass bead with a gold halo, two little devil horns and a sideways grin."""
    lw = r * .11 if lw is None else lw
    # gold wire through the bead's hole, poking out both sides
    for s in ((-1, 1) if wire else ()):
        a.add(f'<path d="M{cx + s * r * .8:.1f} {cy:.1f}H{cx + s * r * 1.32:.1f}" stroke="{a.c(GOLD)}" '
              f'stroke-width="{r * .1:.1f}" stroke-linecap="round"/>')
        a.add(f'<circle cx="{cx + s * r * 1.42:.1f}" cy="{cy:.1f}" r="{r * .1:.1f}" fill="none" stroke="{a.c(GOLD)}" '
              f'stroke-width="{r * .08:.1f}"/>', (cx + s * r * 1.56, cy))
    # horns, behind the bead: narrow, curving out and then up to a point
    for s in (-1, 1):
        bx, by, w = cx + s * r * .6, cy - r * .68, r * .17
        tip = (cx + s * r * .98, cy - r * 1.3)
        d = (f'M{bx - s * w:.1f} {by:.1f}C{bx - s * w * .2:.1f} {by - r * .4:.1f} {tip[0] + s * r * .02:.1f} {tip[1] + r * .3:.1f} '
             f'{tip[0]:.1f} {tip[1]:.1f}C{tip[0] + s * r * .26:.1f} {tip[1] + r * .26:.1f} {bx + s * w * 1.6:.1f} {by - r * .26:.1f} '
             f'{bx + s * w:.1f} {by + r * .06:.1f}Z')
        a.add(f'<path d="{d}" fill="{a.c(GLASS["sangre"])}" stroke="{INK}" stroke-width="{lw:.1f}" stroke-linejoin="round"/>',
              tip)
    a.bead(cx, cy, r, GLASS[color], lw=lw)
    # halo, tilted, floating above (ink under gold so it reads on any background)
    hx, hy = cx - r * .03, cy - r * 1.42
    for col, w in ((INK, r * .2), (a.c(GOLD, '#fff'), r * .09)):
        a.add(f'<ellipse cx="{hx:.1f}" cy="{hy:.1f}" rx="{r * .46:.1f}" ry="{r * .14:.1f}" fill="none" stroke="{col}" '
              f'stroke-width="{w:.1f}" transform="rotate(-9 {hx:.1f} {hy:.1f})"/>',
              (hx - r * .7, hy - r * .3), (hx + r * .7, hy + r * .3))
    # face: one eye winks, lopsided grin
    ink = INK if not a.mono else '#fff'
    a.add(f'<ellipse cx="{cx - r * .3:.1f}" cy="{cy - r * .02:.1f}" rx="{r * .085:.1f}" ry="{r * .12:.1f}" fill="{ink}"/>')
    a.add(f'<path d="M{cx + r * .17:.1f} {cy - r * .02:.1f}q{r * .12:.1f} {-r * .1:.1f} {r * .24:.1f} 0" fill="none" '
          f'stroke="{ink}" stroke-width="{r * .075:.1f}" stroke-linecap="round"/>')
    a.add(f'<path d="M{cx - r * .36:.1f} {cy + r * .26:.1f}Q{cx - r * .02:.1f} {cy + r * .56:.1f} {cx + r * .4:.1f} {cy + r * .18:.1f}" '
          f'fill="none" stroke="{ink}" stroke-width="{r * .085:.1f}" stroke-linecap="round"/>')
    # rosy cheek
    if not a.mono:
        a.add(f'<ellipse cx="{cx + r * .5:.1f}" cy="{cy + r * .22:.1f}" rx="{r * .12:.1f}" ry="{r * .07:.1f}" '
              f'fill="{GLASS["rubino"]}" fill-opacity=".45"/>')


def badge(mono):
    a = Art(mono)
    cx = cy = 0
    R = 300
    a.add(f'<path d="{scallop(cx, cy, R, 12, 18)}" fill="{a.c(GLASS["cobalt"])}" stroke="{INK}" stroke-width="12" '
          f'stroke-linejoin="round"/>', (-R - 20, -R - 20), (R + 20, R + 20))
    a.add(f'<circle cx="0" cy="0" r="{R * .62:.1f}" fill="{a.c(GLASS["uranium"], "#fff")}" stroke="{INK}" stroke-width="10"/>')
    arc_text(a, BAGEL, 'CHAOTIC', 88, cx, cy, R * .68, 'top', a.c(CREAM, '#fff'), track=.06)
    arc_text(a, BAGEL, 'GOODS', 88, cx, cy, R * .68 + 88 * BAGEL.cap / BAGEL.upm, 'bottom', a.c(CREAM, '#fff'), track=.1)
    for s in (-1, 1):
        a.bead(s * R * .8, 0, 17, GLASS['coral' if s < 0 else 'turquoise'], lw=5)
    mascot(a, 0, 26, 92)
    a.save('c-badge', pad=.03)


# D. Mascot lockup: the Chaotic Good bead next to the wordmark.

def mascot_lockup(mono, rev=False):
    a = Art(mono, rev)
    mascot(a, 0, 0, 120)
    for k, word in enumerate(('Chaotic', 'Goods')):
        for g in BAGEL.run(word, 170, 210, -14 + k * 150, track=-0.005):
            a.glyph(BAGEL, g, a.text)
    a.save('d-mascot')


# E. Monogram: a G with a C of glass beads curled around it, for the favicon, app icon and stamps.

def monogram(mono):
    a = Art(mono)
    R = 250
    n = 5.0
    pts = []
    for k in range(720):
        t = 2 * math.pi * k / 720
        c, s = math.cos(t), math.sin(t)
        pts.append((R * math.copysign(abs(c) ** (2 / n), c), R * math.copysign(abs(s) ** (2 / n), s)))
    a.add(f'<path d="{poly(pts)}" fill="{a.c(GLASS["cobalt"])}" stroke="{INK}" stroke-width="14"/>',
          (-R - 7, -R - 7), (R + 7, R + 7))
    g = BAGEL.run('G', 300, 0, 0)[0]
    x0, y0, x1, y1 = g['box']
    dx, dy = -(x0 + x1) / 2 + 12, -(y0 + y1) / 2 + 6
    a.glyph(BAGEL, g, a.c(CREAM, '#fff'), INK, 16, dx=dx, dy=dy)
    # the C: an open ring of beads on wire, opening to the right
    rr, start, end = 168, 40, 320
    cols = ['coral', 'uranium', 'leaf', 'turquoise', 'orchid', 'rubino', 'amber', 'coral']
    wire = [(rr * math.cos(math.radians(t)), rr * math.sin(math.radians(t))) for t in range(start, end + 1, 2)]
    a.add(f'<path d="M' + 'L'.join(f'{x:.1f} {y:.1f}' for x, y in wire) + f'" fill="none" stroke="{a.c(GOLD, "#fff")}" '
          f'stroke-width="7" stroke-linecap="round"/>')
    for k in range(8):
        t = math.radians(start + 14 + (end - start - 28) * k / 7)
        a.bead(rr * math.cos(t), rr * math.sin(t), 34, GLASS[cols[k]], lw=8)
    a.save('e-monogram', pad=.03)


# F. Soft serif: calmer and more grown-up, with a little strand of beads underneath.

def soft_serif(mono, rev=False):
    a = Art(mono, rev)
    size = 200
    line = FRAUNCES.run('Chaotic Goods', size, 0, 0, track=-0.01)
    for g in line:
        if g['char'] != ' ':
            a.glyph(FRAUNCES, g, a.text if rev else a.c(GLASS['cobalt']))
    x0, x1 = line[0]['box'][0], line[-1]['box'][2]
    y = 64
    a.add(f'<path d="M{x0 + 20:.1f} {y}Q{(x0 + x1) / 2:.1f} {y + 34} {x1 - 20:.1f} {y}" fill="none" '
          f'stroke="{a.c(GOLD)}" stroke-width="5" stroke-linecap="round"/>')
    cols = ['coral', 'uranium', 'turquoise', 'orchid', 'leaf', 'amber', 'rubino']
    for k in range(7):
        u = .25 + .5 * k / 6
        bx = (1 - u) ** 2 * (x0 + 20) + 2 * u * (1 - u) * (x0 + x1) / 2 + u ** 2 * (x1 - 20)
        by = y + 2 * u * (1 - u) * 34
        a.bead(bx, by, 15 if k != 3 else 22, GLASS[cols[k]], lw=4)
    for g in FREDOKA6.run('HANDMADE GLASS TRINKETS', 40, (x0 + x1) / 2, 150, track=.22, align='center'):
        a.glyph(FREDOKA6, g, a.text)
    a.save('f-soft-serif')


def mascot_icon(mono):
    """Just the bead, no wire, for the favicon, app icon and profile pictures."""
    a = Art(mono)
    mascot(a, 0, 0, 100, wire=False)
    a.save('d-mascot-icon', pad=.08)


if __name__ == '__main__':
    OUT.mkdir(parents=True, exist_ok=True)
    for draw in (glass_os, on_a_string, badge, mascot_lockup, mascot_icon, monogram, soft_serif):
        for mono in (False, True):
            draw(mono)
    for draw in (glass_os, on_a_string, mascot_lockup, soft_serif):
        draw(False, rev=True)
    for mono, rev in ((False, False), (True, False), (False, True)):
        on_a_string(mono, rev, shroom=True)
    print('wrote', len(list(OUT.glob('*.svg'))), 'files to', OUT.relative_to(ROOT))
