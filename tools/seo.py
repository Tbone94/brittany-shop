"""Search engine and link-preview setup, built from products.js. Run after changing necklaces, photos or index.html:

    python3 tools/seo.py

What it writes:
- index.html: title, description, canonical link, link-preview tags (Open Graph / Twitter), Google's structured
  data (the shop, and every necklace with its price and whether it's sold), and a plain list of the necklaces
  inside the grid for search engines that don't run JavaScript (shop.js swaps it for the real cards).
- n/<slug>/index.html: one page per necklace, so each one can show up in search on its own. It's the same page
  with that necklace's popup open, its own title, description, preview image and product data.
- og/*.jpg: 1200×630 preview images (the necklace on its color splash) for links shared in texts and social posts.
- sitemap.xml and robots.txt.

SITE is where the site lives. While it's a preview, INDEXABLE stays False: every page says "noindex", so search
engines don't list placeholder necklaces or the comparison copies. At launch, set SITE to the real domain and
INDEXABLE to True, run this again, then submit SITE + 'sitemap.xml' in Google Search Console.
"""
import html, json, math, pathlib, random, re, subprocess
from PIL import Image, ImageDraw

SITE = 'https://shopchaoticgoods.com/'
INDEXABLE = False
BRAND = 'Brittany'
TAGLINE = 'Glass bead necklaces, strung by hand'
DESCRIPTION = ('One-of-a-kind lampwork glass bead necklaces, designed and strung by hand by Brittany. '
               'Small batches, gift-boxed, shop by color or collection.')

ROOT = pathlib.Path(__file__).resolve().parent.parent
esc = lambda s: html.escape(str(s), quote=True)


def products():
    """The necklaces, colors and collections from products.js (functions dropped)."""
    js = ("global.window = {}; require(process.argv[1]);"
          "console.log(JSON.stringify({P: window.PRODUCTS, F: window.FAMILIES, C: window.COLLECTIONS, H: window.HERO}))")
    return json.loads(subprocess.check_output(['node', '-e', js, str(ROOT / 'products.js')]))


def photo(p):
    """The necklace's front photo (angle 4) if it has one, else any of its photos, as a site path."""
    for name in [f"{p['slug']}-4"] + [f"{p['slug']}-{k}" for k in range(1, 8)]:
        for ext in ('webp', 'png', 'jpg'):
            if (ROOT / 'photos' / f'{name}.{ext}').exists():
                return f'photos/{name}.{ext}'
    return None


def og_image(p, out):
    """A 1200×630 preview: the necklace's photo on a big layered splash in its glass colors."""
    W, H = 1200, 630
    img = Image.new('RGB', (W, H), '#ffffff')
    d = ImageDraw.Draw(img, 'RGBA')
    c1, c2, c3 = (p['splash'] + p['splash'][-1:] * 3)[:3]
    rnd = random.Random(p['slug'])
    def bloom(cx, cy, r, color, petals=5, turn=0.0):
        for k in range(petals):
            a = turn + k * math.tau / petals
            px, py, pr = cx + math.cos(a) * r * .52, cy + math.sin(a) * r * .52, r * .48
            d.ellipse([px - pr, py - pr, px + pr, py + pr], fill=color)
        d.ellipse([cx - r * .55, cy - r * .55, cx + r * .55, cy + r * .55], fill=color)
    turn = rnd.random() * math.tau
    bloom(W / 2 - 30, H * .58, 470, c3, turn=turn + .4)
    bloom(W / 2, H * .6, 400, c1, turn=turn)
    bloom(W / 2 + 20, H * .66, 220, c2, turn=turn + .7)
    for _ in range(9):
        a, r, s = rnd.random() * math.tau, 330 + rnd.random() * 60, 8 + rnd.random() * 14
        x, y = W / 2 + math.cos(a) * r * 1.5, H * .55 + math.sin(a) * r
        d.ellipse([x - s, y - s, x + s, y + s], fill=rnd.choice([c1, c2, c3]))
    # A wide shot fills the frame best; fall back to the front photo.
    wide = [q for q in sorted((ROOT / 'photos').glob(f"{p['slug']}-[1-7].webp")) if (lambda im: im.width > im.height * 1.2)(Image.open(q))]
    src = f'photos/{wide[0].name}' if wide else photo(p)
    if src:
        ph = Image.open(ROOT / src).convert('RGBA')
        scale = max(H * 1.05 / ph.height, (W * .62) / ph.width)
        ph = ph.resize((round(ph.width * scale), round(ph.height * scale)), Image.LANCZOS)
        img.paste(ph, ((W - ph.width) // 2, H - ph.height), ph)
    out.parent.mkdir(parents=True, exist_ok=True)
    img.save(out, 'JPEG', quality=84, optimize=True, progressive=True)


def product_ld(p, url, image):
    data = {
        '@type': 'Product', '@id': url + '#product', 'name': p['name'], 'description': p['desc'], 'url': url,
        'sku': p['slug'], 'brand': {'@type': 'Brand', 'name': BRAND}, 'category': 'Apparel & Accessories > Jewelry > Necklaces',
        'material': 'Glass', 'color': p['details'].get('Glass', ''),
        'offers': {
            '@type': 'Offer', 'url': url, 'price': f"{p['price']:.2f}", 'priceCurrency': 'USD',
            'availability': 'https://schema.org/SoldOut' if p.get('sold') else 'https://schema.org/InStock',
            'itemCondition': 'https://schema.org/NewCondition',
        },
    }
    if image:
        data['image'] = [SITE + image]
    return data


def head(title, desc, url, image, image_alt, ld, preload=None):
    tags = [
        f'<title>{esc(title)}</title>',
        f'<meta name="description" content="{esc(desc)}">',
        f'<link rel="canonical" href="{esc(url)}">',
        '<meta name="robots" content="index, follow, max-image-preview:large">' if INDEXABLE else
        '<meta name="robots" content="noindex">  <!-- preview: flip INDEXABLE in tools/seo.py at launch -->',
        '<meta property="og:type" content="website">',
        f'<meta property="og:site_name" content="{esc(BRAND)}">',
        f'<meta property="og:title" content="{esc(title)}">',
        f'<meta property="og:description" content="{esc(desc)}">',
        f'<meta property="og:url" content="{esc(url)}">',
        f'<meta property="og:image" content="{esc(SITE + image)}">',
        '<meta property="og:image:width" content="1200">',
        '<meta property="og:image:height" content="630">',
        f'<meta property="og:image:alt" content="{esc(image_alt)}">',
        '<meta name="twitter:card" content="summary_large_image">',
    ]
    if preload:
        tags.append(f'<link rel="preload" as="image" href="{esc(preload)}" type="image/webp">')
    tags.append('<script type="application/ld+json">' + json.dumps({'@context': 'https://schema.org', '@graph': ld}, separators=(',', ':')).replace('</', '<\\/') + '</script>')
    return '<!-- seo: written by tools/seo.py -->\n' + '\n'.join(tags) + '\n<!-- /seo -->'


def between(text, start, end, inner):
    a, b = text.index(start), text.index(end) + len(end)
    return text[:a] + inner + text[b:]


def main():
    data = products()
    P, F = data['P'], {f['key']: f for f in data['F']}
    store = {'@type': 'OnlineStore', '@id': SITE + '#store', 'name': BRAND, 'url': SITE, 'description': DESCRIPTION,
             'logo': SITE + 'icons/icon-512.png', 'image': SITE + 'og/home.jpg'}
    site = {'@type': 'WebSite', '@id': SITE + '#site', 'name': BRAND, 'url': SITE, 'publisher': {'@id': SITE + '#store'}}
    page_url = lambda p: f"{SITE}n/{p['slug']}/"

    # Preview images.
    hero = next((p for p in P if p['slug'] == (data.get('H') or [None] * 4)[3]), P[0])
    og_image(hero, ROOT / 'og' / 'home.jpg')
    for p in P:
        og_image(p, ROOT / 'og' / f"{p['slug']}.jpg")

    template = (ROOT / 'index.html').read_text()

    # The home page.
    items = [{'@type': 'ListItem', 'position': k + 1, 'item': product_ld(p, page_url(p), photo(p))} for k, p in enumerate(P)]
    home_ld = [store, site, {'@type': 'ItemList', 'name': 'Necklaces', 'itemListElement': items}]
    hero_photo = f"photos/{hero['slug']}-4.webp"
    home = between(template, '<!-- seo', '<!-- /seo -->', head(
        f'{BRAND} · Handmade Glass Bead Necklaces', DESCRIPTION, SITE, 'og/home.jpg',
        f"{hero['name']}, a handmade glass bead necklace by {BRAND}", home_ld,
        preload=hero_photo if (ROOT / hero_photo).exists() else None))
    listing = ''.join(
        f'<li><a href="n/{p["slug"]}/">{esc(p["name"])}</a>, {esc(p["desc"])} '
        f'{"Sold" if p.get("sold") else "$" + str(p["price"])}</li>' for p in P)
    home = between(home, '<!-- list -->', '<!-- /list -->', f'<!-- list -->{listing}<!-- /list -->')
    (ROOT / 'index.html').write_text(home)

    # One page per necklace: the same page, pointed back at the site root, with the necklace's popup open.
    for p in P:
        url, img = page_url(p), photo(p)
        fam = F.get(p['family'], {}).get('word', '').lower()
        title = f"{p['name']} · {'Handmade ' + fam.title() + ' ' if fam else 'Handmade '}Glass Bead Necklace · {BRAND}"
        desc = f"{p['desc']} {p['details'].get('Length', '')} long. " + \
               (f"Sold, but you can ask {BRAND} for one like it." if p.get('sold') else f"${p['price']}, one of a kind, strung by hand.")
        crumbs = {'@type': 'BreadcrumbList', 'itemListElement': [
            {'@type': 'ListItem', 'position': 1, 'name': BRAND, 'item': SITE},
            {'@type': 'ListItem', 'position': 2, 'name': p['name'], 'item': url}]}
        page = between(home, '<!-- seo', '<!-- /seo -->', head(
            title, desc.strip(), url, f"og/{p['slug']}.jpg", f"{p['name']}, a handmade glass bead necklace by {BRAND}",
            [store, product_ld(p, url, img), crumbs]))
        page = page.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n<base href="../../">', 1)
        page = page.replace('<body>', f'<body data-product="{esc(p["slug"])}">', 1)
        out = ROOT / 'n' / p['slug'] / 'index.html'
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(page)

    # Sitemap (with each page's photo, for image search) and robots.txt.
    def entry(loc, image=None):
        img = f'<image:image><image:loc>{esc(SITE + image)}</image:loc></image:image>' if image else ''
        return f'<url><loc>{esc(loc)}</loc>{img}</url>'
    urls = [entry(SITE, hero_photo)] + [entry(page_url(p), photo(p)) for p in P]
    (ROOT / 'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n'
        + '\n'.join(urls) + '\n</urlset>\n')
    (ROOT / 'robots.txt').write_text(f'User-agent: *\nAllow: /\n\nSitemap: {SITE}sitemap.xml\n')
    print(f'wrote index.html, {len(P)} necklace pages, {len(P) + 1} preview images, sitemap.xml, robots.txt'
          f' ({"indexable" if INDEXABLE else "noindex preview"})')


if __name__ == '__main__':
    main()
