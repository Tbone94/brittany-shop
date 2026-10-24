"""Put an edited crop back into the full photo it was cut from.

Some poses get blocked by the image generator's safety filter when the whole chest is in frame, so only the neck
and collarbones (where the necklace sits) are sent for editing. This puts the edited crop back: it's cut out and
lined up with the original crop, then blended in with a soft edge wherever the crop cuts across the body, so
everything outside the crop stays exactly as it was. Usage:
    python3 tools/paste_crop.py full.png edited-crop.png LEFT TOP out.png
"""
import os, subprocess, sys, tempfile
from PIL import Image, ImageDraw, ImageFilter

full_path, crop_path, left, top, out = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), sys.argv[5]
here = os.path.dirname(os.path.abspath(__file__))
tmp = tempfile.mkdtemp()
full = Image.open(full_path).convert('RGBA')
crop = Image.open(crop_path).convert('RGBA')
w, h = crop.size
base_crop = full.crop((left, top, left + w, top + h))
base_crop.save(f'{tmp}/base.png')
# Cut out and line up the edit with the original crop (finish_photo also cleans freckles).
subprocess.run(['python3', f'{here}/finish_photo.py', crop_path, f'{tmp}/base.png', f'{tmp}/edit.png'], check=True)
edit = Image.open(f'{tmp}/edit.png').convert('RGBA')
# Blend mask: solid inside, fading out over 40px on every side the crop doesn't share with the full photo's edge.
fade = 40
mask = Image.new('L', (w, h), 0)
ImageDraw.Draw(mask).rectangle([0 if left == 0 else fade, 0 if top == 0 else fade,
                                w - 1 if left + w >= full.width else w - 1 - fade,
                                h - 1 if top + h >= full.height else h - 1 - fade], fill=255)
mask = mask.filter(ImageFilter.GaussianBlur(fade / 2))
full.paste(Image.composite(edit, base_crop, mask), (left, top))
full.save(out)
print('saved', out)
