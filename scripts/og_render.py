"""Render the 1200x630 Open Graph image for arinaholic.me.

Requires Pillow. By default the image is written to the repository root as
og-image.png; pass a different output path as the first argument to override.
Set OG_FONT to use a specific font file.
"""

import os
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "public" / "og-image.png"

W, H = 1200, 630
BG = (247, 244, 236)
INK = (20, 21, 31)
MUTED = (93, 93, 104)
BLUE = (58, 95, 196)
RED = (181, 18, 46)
SAGE = (190, 205, 178)


def find_font():
    override = os.environ.get("OG_FONT")
    if override:
        return Path(override)

    preferred = Path("/usr/share/fonts/TTF/Rubik%5Bwght%5D.ttf")
    if preferred.is_file():
        return preferred

    for pattern in ("*Rubik*wght*.ttf", "*Jost*.ttf", "*DejaVuSans.ttf"):
        for candidate in Path("/usr/share/fonts").rglob(pattern):
            if "Italic" not in candidate.name and "italic" not in candidate.name:
                return candidate

    raise SystemExit("no suitable font found; set OG_FONT to a .ttf file")


FONT_PATH = find_font()


def font(size, weight):
    f = ImageFont.truetype(str(FONT_PATH), size)
    if hasattr(f, "get_variation_axes") and f.get_variation_axes():
        try:
            f.set_variation_by_name(weight)
        except Exception:
            pass
    return f


img = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(img)

# echo the site's .shapes motif on the right
d.ellipse([W - 430, -160, W + 110, 390], fill=BLUE)
d.ellipse([W - 210, 432, W - 80, 562], fill=RED)
d.ellipse([W - 452, 460, W - 356, 556], fill=SAGE)


def tracked(x, y, text, fnt, fill, tracking=0):
    for ch in text:
        d.text((x, y), ch, font=fnt, fill=fill)
        x += d.textlength(ch, font=fnt) + tracking


def wrap(text, fnt, max_width):
    lines, cur = [], ""
    for word in text.split():
        trial = (cur + " " + word).strip()
        if d.textlength(trial, font=fnt) <= max_width:
            cur = trial
        else:
            lines.append(cur)
            cur = word
    if cur:
        lines.append(cur)
    return lines


d.rectangle([80, 211, 136, 215], fill=RED)

title = font(116, "Medium")
tracked(76, 231, "sagittarius", title, INK, -4.6)

sub = font(35, "Regular")
lines = wrap("drivers, terminals & small simulations.", sub, 700)
for i, line in enumerate(lines):
    d.text((80, 383 + i * 50), line, font=sub, fill=MUTED)

img.save(OUT, "PNG", optimize=True)
print("wrote", OUT, img.size, "using", FONT_PATH)
