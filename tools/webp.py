"""Make a small WebP copy of every published photo (photos/<slug>-<n>.png), keeping the transparent background.

The site loads the .webp first and falls back to the .png, so the PNGs stay as the full-quality originals.
Run after adding or changing a photo:  python3 tools/webp.py
"""
import pathlib, re
from PIL import Image

photos = pathlib.Path(__file__).resolve().parent.parent / 'photos'
before = after = 0
for png in sorted(photos.glob('*.png')):
    if not re.fullmatch(r'[a-z0-9-]+-[1-7]\.png', png.name):
        continue
    webp = png.with_suffix('.webp')
    if webp.exists() and webp.stat().st_mtime >= png.stat().st_mtime:
        before += png.stat().st_size; after += webp.stat().st_size
        continue
    Image.open(png).save(webp, 'WEBP', quality=82, method=6)
    before += png.stat().st_size; after += webp.stat().st_size
    print(f'{png.name}: {png.stat().st_size // 1024} KB -> {webp.stat().st_size // 1024} KB')
print(f'total: {before / 1e6:.1f} MB of PNG -> {after / 1e6:.1f} MB of WebP')
