"""Finish a generated product photo: flatten it on plain grey (ignoring any messy partial transparency), cut the
model out with the Mac's subject detection (tools/cutout.swift), line her up with a reference pose photo
(tools/align.py), and remove stray freckle dots (tools/defreckle.py). Usage:
    python3 tools/finish_photo.py generated.png reference-pose.png out.png
"""
import os, subprocess, sys, tempfile
from PIL import Image

src, ref, out = sys.argv[1:4]
here = os.path.dirname(os.path.abspath(__file__))
tmp = tempfile.mkdtemp()
im = Image.open(src).convert('RGBA')
size = Image.open(ref).size
if im.size != size:
    im = im.resize(size, Image.LANCZOS)
grey = Image.new('RGBA', im.size, (236, 236, 236, 255)); grey.alpha_composite(im)
grey.convert('RGB').save(f'{tmp}/flat.png')
subprocess.run(['swift', f'{here}/cutout.swift', f'{tmp}/flat.png', f'{tmp}/cut.png'], check=True, capture_output=True)
r = subprocess.run(['python3', f'{here}/align.py', f'{tmp}/cut.png', f'{tmp}/aligned.png', '--ref', ref], check=True, capture_output=True, text=True)
subprocess.run(['python3', f'{here}/defreckle.py', f'{tmp}/aligned.png', out], check=True, capture_output=True)
print(os.path.basename(out), '-', r.stdout.strip().split(': ', 1)[1])
