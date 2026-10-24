"""Line a product photo's model up with a reference photo, so swapping between necklaces on the first screen only
changes the necklace. Both photos must have a transparent background around the model.

It traces the body's outline (left and right edge on every row) in both photos, finds the scale and shift that lay
one outline over the other best, and redraws the photo with that scale and shift on a canvas the size of the
reference. Usage:
    python3 tools/align.py photo.png [out.png] [--ref photos/garden-party-4.png]
"""
import sys
import numpy as np
from PIL import Image

def edges(img):
    a = np.asarray(img.getchannel('A')) > 128
    has = a.any(1)
    left = np.where(has, a.argmax(1), np.nan).astype(float)
    right = np.where(has, a.shape[1] - 1 - a[:, ::-1].argmax(1), np.nan).astype(float)
    return left, right

def fit(src, ref):
    L, R = edges(src)
    Lr, Rr = edges(ref)
    H = ref.height
    ys = np.arange(H, dtype=float)
    best = (np.inf, 1, 0, 0)
    for s in np.arange(0.8, 1.25, 0.002):
        for ty in range(-160, 161, 2):
            y = (ys - ty) / s                       # source row for each output row
            ok = (y >= 0) & (y <= src.height - 1)
            yi = np.clip(np.round(y).astype(int), 0, src.height - 1)
            l, r = s * L[yi], s * R[yi]
            m = ok & ~np.isnan(l) & ~np.isnan(Lr)
            if m.sum() < H * 0.6:
                continue
            tx = np.mean(((Lr + Rr) - (l + r))[m]) / 2
            err = np.mean(((Lr - l - tx) ** 2 + (Rr - r - tx) ** 2)[m])
            if err < best[0]:
                best = (err, s, tx, ty)
    return best

def align(path, out, ref_path='photos/garden-party-4.png'):
    src, ref = Image.open(path).convert('RGBA'), Image.open(ref_path).convert('RGBA')
    err, s, tx, ty = fit(src, ref)
    scaled = src.resize((round(src.width * s), round(src.height * s)), Image.LANCZOS)
    canvas = Image.new('RGBA', ref.size, (0, 0, 0, 0))
    canvas.paste(scaled, (int(round(tx)), int(round(ty))), scaled)
    canvas.save(out)
    return err ** 0.5, s, tx, ty

if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    ref = sys.argv[sys.argv.index('--ref') + 1] if '--ref' in sys.argv else 'photos/garden-party-4.png'
    if '--ref' in sys.argv:
        args.remove(ref)
    out = args[1] if len(args) > 1 else args[0]
    rms, s, tx, ty = align(args[0], out, ref)
    print(f'{args[0]}: scale {s:.3f}, shift ({tx:.0f}, {ty:.0f}) px, outline off by {rms:.1f} px on average')
