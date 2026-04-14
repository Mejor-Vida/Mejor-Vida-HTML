#!/usr/bin/env python3
"""
Remove opaque white matte from mvi-chat-avatar PNGs (edge-connected flood fill).

idle.png is typically already transparent; blink/happy/thinking/attention from some
pipelines ship as white rectangles. Swapping those layers over transparent idle
causes a visible white flash in the browser.

Usage (from repo root):
  python3 tools/mvi_chat_avatar_dematte.py
  python3 tools/mvi_chat_avatar_dematte.py --thresh 18 img/mvi-chat-avatar/blink.png
"""

from __future__ import annotations

import argparse
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image


def flood_matte_rgba(
    arr: np.ndarray, bg_thresh: float = 16.0, min_alpha: int = 40
) -> np.ndarray:
    h, w = arr.shape[:2]
    corners = np.stack(
        [arr[0, 0, :3], arr[0, -1, :3], arr[-1, 0, :3], arr[-1, -1, :3]],
        axis=0,
    ).astype(np.float32)
    bg = corners.mean(axis=0)

    def is_bg(y: int, x: int) -> bool:
        if not (0 <= y < h and 0 <= x < w):
            return False
        if arr[y, x, 3] < min_alpha:
            return True
        p = arr[y, x, :3].astype(np.float32)
        return float(np.max(np.abs(p - bg))) <= bg_thresh

    visited = np.zeros((h, w), dtype=bool)
    q: deque[tuple[int, int]] = deque()

    def try_seed(y: int, x: int) -> None:
        if 0 <= y < h and 0 <= x < w and is_bg(y, x) and not visited[y, x]:
            visited[y, x] = True
            q.append((y, x))

    for x in range(w):
        try_seed(0, x)
        try_seed(h - 1, x)
    for y in range(h):
        try_seed(y, 0)
        try_seed(y, w - 1)

    while q:
        y, x = q.popleft()
        for dy, dx in ((0, 1), (0, -1), (1, 0), (-1, 0)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx] and is_bg(ny, nx):
                visited[ny, nx] = True
                q.append((ny, nx))

    out = arr.copy()
    knock = visited & (out[:, :, 3] >= min_alpha)
    out[:, :, 3] = np.where(knock, 0, out[:, :, 3])
    return out


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument(
        "paths",
        nargs="*",
        type=Path,
        help="PNG files (default: blink/happy/thinking/attention in img/mvi-chat-avatar)",
    )
    ap.add_argument(
        "--thresh",
        type=float,
        default=16.0,
        help="Max RGB distance from corner mean to treat as background (default16)",
    )
    args = ap.parse_args()

    repo = Path(__file__).resolve().parents[1]
    default_dir = repo / "img" / "mvi-chat-avatar"
    paths = args.paths
    if not paths:
        paths = [
            default_dir / f"{n}.png"
            for n in ("blink", "happy", "thinking", "attention")
        ]

    for p in paths:
        if not p.is_file():
            raise SystemExit(f"missing: {p}")
        arr = np.array(Image.open(p).convert("RGBA"))
        fixed = flood_matte_rgba(arr, bg_thresh=args.thresh, min_alpha=40)
        Image.fromarray(fixed, "RGBA").save(p, optimize=True)
        print("wrote", p.relative_to(repo) if p.is_relative_to(repo) else p)


if __name__ == "__main__":
    main()
