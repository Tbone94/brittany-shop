"""Remove the small orange freckle dots AI photos sometimes scatter over the model's skin, without touching beads.

A pixel counts as a freckle dot when it's darker than the skin around it, skin-toned (not a vivid bead color), and
its surroundings are plain skin. Those pixels are replaced with the surrounding skin. Usage:
    python3 tools/defreckle.py in.png [out.png]   (writes over in.png when no out is given)
"""
import sys
import numpy as np
from PIL import Image, ImageFilter

def hsv(a):
    return np.asarray(Image.fromarray(a).convert('HSV')).astype(np.float32) / 255

def clean(path, out):
    im = Image.open(path).convert('RGBA')
    rgb = im.convert('RGB')
    med = rgb.filter(ImageFilter.MedianFilter(11))
    a, m = np.asarray(rgb).astype(np.float32), np.asarray(med).astype(np.float32)
    h, hm = hsv(np.asarray(rgb)), hsv(np.asarray(med))
    lum, lum_m = a.mean(2), m.mean(2)
    hue, sat, val = h[..., 0], h[..., 1], h[..., 2]
    skinhue = lambda x: (x < 0.11) | (x > 0.96)
    # The necklace and the top, padded generously: anything vivid, grey/metal, white, dark or not skin-colored.
    jewel = (sat > 0.62) | (sat < 0.16) | (val < 0.4) | ~skinhue(hue)
    protect = np.asarray(Image.fromarray((jewel * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(13))) > 0
    # Freckle dots: small, a bit darker than the skin around them, orange-brown, on plain skin.
    dot = (lum_m - lum > 8) & (hue > 0.015) & (hue < 0.11) & (sat > 0.25) & (sat < 0.62) & skinhue(hm[..., 0]) & (hm[..., 1] < 0.5)
    dot &= ~protect & (np.asarray(im)[..., 3] > 250)
    # Only small spots: anything still there after shrinking 3px each way is too big to be a freckle.
    dimg = Image.fromarray((dot * 255).astype(np.uint8))
    big = np.asarray(dimg.filter(ImageFilter.MinFilter(7)).filter(ImageFilter.MaxFilter(11))) > 0
    dot &= ~big
    mask = Image.fromarray((dot * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(1))
    fixed = Image.composite(med, rgb, mask).convert('RGBA')
    fixed.putalpha(im.getchannel('A'))
    fixed.save(out)
    return int(dot.sum())

if __name__ == '__main__':
    src = sys.argv[1]
    print(src, 'freckle pixels:', clean(src, sys.argv[2] if len(sys.argv) > 2 else src))
