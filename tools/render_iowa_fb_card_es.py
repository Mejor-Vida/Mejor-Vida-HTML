#!/usr/bin/env python3
"""
Render Iowa senior-safeguard Facebook card in Spanish (PNG).
Output: img/facebook/ and FB/assets/ (same filename as post-package image_url).

Requires: pip install Pillow
"""
from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 1200
BG = (240, 235, 227)
NAVY = (26, 54, 93)  # #1a365d
GOLD = (230, 184, 0)
DOT = (255, 204, 0)
MUTED = (101, 116, 139)


def _fonts() -> tuple[ImageFont.FreeTypeFont, ImageFont.FreeTypeFont, ImageFont.FreeTypeFont, ImageFont.FreeTypeFont]:
    candidates = [
        "/System/Library/Fonts/Supplemental/Times New Roman Bold.ttf",
        "/System/Library/Fonts/Supplemental/Times Bold.ttf",
        "/Library/Fonts/Times New Roman Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf",
    ]
    body_candidates = [
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/Library/Fonts/Arial.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    headline_path = next((p for p in candidates if Path(p).is_file()), None)
    body_path = next((p for p in body_candidates if Path(p).is_file()), None)
    if headline_path and body_path:
        return (
            ImageFont.truetype(headline_path, 64),
            ImageFont.truetype(body_path, 26),
            ImageFont.truetype(body_path, 22),
            ImageFont.truetype(body_path, 18),
        )
    # Fallback bitmap (no Spanish accents perfect)
    d = ImageFont.load_default()
    return (d, d, d, d)


def wrap_text(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.ImageFont, max_width: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current: list[str] = []
    for w in words:
        test = " ".join(current + [w])
        bbox = draw.textbbox((0, 0), test, font=font)
        if bbox[2] - bbox[0] <= max_width:
            current.append(w)
        else:
            if current:
                lines.append(" ".join(current))
            current = [w]
    if current:
        lines.append(" ".join(current))
    return lines


def draw_pause_arrow(
    draw: ImageDraw.ImageDraw,
    cx: int,
    cy: int,
    total_w: int,
) -> None:
    h_bar = 22
    y0 = cy - h_bar // 2
    x0 = cx - total_w // 2
    x1 = cx + total_w // 2 - 50
    draw.rounded_rectangle([x0, y0, x1, y0 + h_bar], radius=6, fill=NAVY)
    # Arrowhead
    aw = 36
    tip_x = x1 + aw
    mid_y = cy
    draw.polygon([(x1, y0), (tip_x, mid_y), (x1, y0 + h_bar)], fill=NAVY)
    # Pause bars (gold)
    bw, bh, gap = 16, 72, 12
    px = cx - (bw * 2 + gap) // 2
    draw.rounded_rectangle([px, cy - bh // 2, px + bw, cy + bh // 2], radius=2, fill=GOLD)
    draw.rounded_rectangle([px + bw + gap, cy - bh // 2, px + 2 * bw + gap, cy + bh // 2], radius=2, fill=GOLD)
    # Faint circle behind pause
    r = 95
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=(255, 255, 255), width=2)


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    out_paths = [
        root / "img" / "facebook" / "iowa-senior-safeguard-fb-2026-04.png",
        root / "FB" / "assets" / "iowa-senior-safeguard-fb-2026-04.png",
    ]

    font_h, font_body, font_small, font_src = _fonts()
    im = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(im)
    pad = 56

    # Top left: dot + IOWA
    draw.ellipse([pad, pad, pad + 14, pad + 14], fill=DOT)
    draw.text((pad + 22, pad - 2), "IOWA · ABR 2026", font=font_small, fill=NAVY)

    # Top right
    tr = "NUEVA PROTECCIÓN\nPARA MAYORES"
    bbox = draw.multiline_textbbox((0, 0), tr, font=font_small, align="right")
    tw = bbox[2] - bbox[0]
    draw.multiline_text((W - pad - tw, pad - 2), tr, font=font_small, fill=NAVY, align="left")

    # Headline
    headline = "Una pausa breve."
    draw.text((pad, pad + 72), headline, font=font_h, fill=NAVY)

    # Body
    body = (
        "Iowa permite que las aseguradoras de vida retengan temporalmente un pago sospechoso, "
        "el tiempo necesario para asegurarse de que llegue a las manos correctas."
    )
    y = pad + 160
    max_w = W - 2 * pad
    for line in wrap_text(draw, body, font_body, max_w):
        draw.text((pad, y), line, font=font_body, fill=NAVY)
        bbox = draw.textbbox((0, 0), line, font=font_body)
        y += (bbox[3] - bbox[1]) + 10

    # Arrow + pause (center band)
    draw_pause_arrow(draw, W // 2, 520, 720)

    # Logo + source (source above logo, centered)
    logo_path = root / "img" / "logo-spanish2-email.png"
    lh = 100
    ly = H - pad - lh - 12
    if logo_path.is_file():
        logo = Image.open(logo_path).convert("RGBA")
        ratio = lh / logo.height
        lw = int(logo.width * ratio)
        logo = logo.resize((lw, lh), Image.Resampling.LANCZOS)
        lx = (W - lw) // 2
        im.paste(logo, (lx, ly), logo)
    else:
        ly = H - pad - 24

    src = "Fuente: Insurance Business Magazine · 16/04/26"
    sb = draw.textbbox((0, 0), src, font=font_src)
    sw = sb[2] - sb[0]
    draw.text(((W - sw) // 2, ly - 32), src, font=font_src, fill=MUTED)

    for p in out_paths:
        p.parent.mkdir(parents=True, exist_ok=True)
        im.save(p, "PNG", optimize=True)
        print(f"Saved {p}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
